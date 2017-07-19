/* Recordings and sound effects are cached by static properties in the Sound class.  An instance of the sound class
 * represents a single sound or recording.  Sound playback is handled by static functions.  Note that sound recording
 * is handled by the RecordingManager, not in the Sound class
 */

/* The frontend should never deal with file extensions.  All information about sounds/recordings should have the
 * file extension removed before the frontend sees it
 */

/**
 * Information about a sound
 * @param {string} id - Used in communication between the frontend/backend
 * @param {boolean} isRecording - Whether the sound is a recording
 * @constructor
 */
function Sound(id, isRecording){
	// Ids are used in save files while names are shown in the UI.
	// If we decide to change display names for built-in sounds, we will keep ids the same.
	this.id = id;
	this.name = Sound.nameFromId(id, isRecording);
	this.isRecording = isRecording;
}

Sound.setConstants = function(){
	// Cached lists
	Sound.soundList = [];
	Sound.recordingList = [];

	// List of data about currently playing sounds
	Sound.playingSoundStatuses = [];

	// Enum for types of sounds
	Sound.type = {};
	Sound.type.effect = "effect"; // Sounds built in to app
	Sound.type.ui = "ui"; // Sounds used in UI, not sound blocks (snap sound, for example)
	Sound.type.recording = "recording"; // Sounds local to project, recorded by user

	// Load into cache
	Sound.loadSounds(true);
	Sound.loadSounds(false);

	// Sound when Blocks are snapped together
	Sound.click = "click2";
};

/**
 * Stops all playing sounds and plays the specified sound
 * @param {string} id - The sound to play
 * @param {boolean} isRecording - Whether the sound is a recording
 * @param {function} sentCallback - Called when command to play sound is received by backend successfully
 * @param {function} errorCallback - Called if backend encounters an error (such as sound not found)
 * @param {function} donePlayingCallback - Called when sound stops playing, is interrupted, etc.
 */
Sound.playAndStopPrev = function(id, isRecording, sentCallback, errorCallback, donePlayingCallback){
	Sound.stopAllSounds(null, function(){
		Sound.playWithCallback(id, isRecording, sentCallback, errorCallback, donePlayingCallback);
	});
};

/**
 * Plays the specified sound
 * @param {string} id - The sound to play
 * @param {boolean} isRecording - Whether the sound is a recording
 * @param {function} sentCallback - Called when command to play sound is received by backend successfully
 * @param {function} errorCallback - Called if backend encounters an error (such as sound not found)
 * @param {function} donePlayingCallback - Called when sound stops playing, is interrupted, etc.
 */
Sound.playWithCallback = function(id, isRecording, sentCallback, errorCallback, donePlayingCallback){
	let status = {};
	status.donePlayingCallback = donePlayingCallback;
	Sound.playingSoundStatuses.push(status);
	const removeEntry = function(){
		let index = Sound.playingSoundStatuses.indexOf(status);
		if(index > -1) {
			Sound.playingSoundStatuses.splice(index, 1);
			return true;
		}
		return false;
	};
	const errorFn = function(){
		removeEntry();
		if(errorCallback != null) errorCallback();
	};
	const donePlayingFn = function(){
		if(removeEntry()) {
			if (donePlayingCallback != null) donePlayingCallback();
		}
	};
	Sound.getDuration(id, isRecording, function(duration){
		//id = id.split(".wav").join(""); //TODO: remove .wav replacement
		let request = new HttpRequestBuilder("sound/play");
		request.addParam("filename", id);
		request.addParam("type", Sound.boolToType(isRecording));
		HtmlServer.sendRequestWithCallback(request.toString(), function(){
			setTimeout(donePlayingFn, duration);
			if(sentCallback != null) sentCallback();
		}, errorFn);
	}, errorFn);
};

/**
 * Plays the specified sound and tracks progress with a status object
 * @param {string} id
 * @param {boolean} isRecording
 * @param {object} status
 */
Sound.play = function(id, isRecording, status){
	if(status == null){
		Sound.playWithCallback(id, isRecording);
	}
	else{
		status.donePlaying = false;
		status.requestSent = false;
		status.error = false;
		Sound.playWithCallback(id, isRecording, function(){
			status.requestSent = true;
		}, function(){
			status.donePlaying = false;
			status.requestSent = false;
			status.error = true;
		}, function(){
			status.donePlaying = true;
			status.requestSent = true;
		});
	}
};

/**
 * Looks up the duration of the sound
 * @param {number} id
 * @param {boolean} isRecording
 * @param {function} callbackFn - called with the duration as a number
 * @param {function} callbackError
 */
Sound.getDuration = function(id, isRecording, callbackFn, callbackError){
	let request = new HttpRequestBuilder("sound/duration");
	request.addParam("filename", id);
	request.addParam("type", Sound.boolToType(isRecording));
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		let res = Number(result);
		if(!isNaN(res)){
			if(callbackFn != null) callbackFn(res);
		} else{
			if(callbackError != null) callbackError();
		}
	}, callbackError);
};

/**
 * Tells the Sound class that the file has changed.  Prompts cache of recordings to be reloaded
 */
Sound.changeFile = function(){
	Sound.recordingList = [];
	Sound.loadSounds(true);
};

/**
 * @param {boolean} isRecording
 * @param {function} [callbackFn] - Called with a list of Sounds when that are loaded
 */
Sound.loadSounds = function(isRecording, callbackFn){
	let request = new HttpRequestBuilder("sound/names");
	request.addParam("type", Sound.boolToType(isRecording));
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		let list = result.split("\n");
		if(result === "") list = [];
		let resultList = list.map(function(id){
			return new Sound(id, isRecording);
		});
		if(isRecording){
			Sound.recordingList = resultList;
		} else {
			Sound.soundList = resultList;
		}
		if(callbackFn != null) callbackFn(resultList);
	});
};

/**
 * Determine's a Sound's name from its id.  idRecording implies id == name.
 * @param {string} id
 * @param {boolean} isRecording
 * @return {string}
 */
Sound.nameFromId = function(id, isRecording){
	if(isRecording) return id;
	let name = id;
	/*if(name.substring(name.length - 4) === ".wav") { //TODO: remove this line
		name = name.substring(0, name.length - 4);
	}*/
	name = name.split("_").join(" ");
	name = name.replace(/\b\w/g, l => l.toUpperCase());
	return name;
};

/**
 * Stops all running sounds and calls the donePlaying callbacks of the sounds
 * @param {object} status - A status object for the request
 * @param {function} callbackFn - Called when the request completes (even if there is an error)
 */
Sound.stopAllSounds=function(status, callbackFn){
	if(status == null) status = {};
	let request = new HttpRequestBuilder("sound/stopAll");
	let callback = function() {
		status.finished = true;
		Sound.playingSoundStatuses.forEach(function (playStatus) {
			if(playStatus.donePlayingCallback != null) playStatus.donePlayingCallback();
		});
		Sound.playingSoundStatuses = [];
		if(callbackFn != null) callbackFn();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), callback, callback);
};

/**
 * Reads from the cached list of sounds
 * @param {boolean} isRecording
 * @return {Array}
 */
Sound.getSoundList = function(isRecording){
	if(isRecording) {
		return Sound.recordingList;
	}
	return Sound.soundList;
};

/**
 * Retrieves the string to put as the type parameter for the request
 * @param {boolean} isRecording
 * @return {string}
 */
Sound.boolToType = function(isRecording){
	if(isRecording){
		return Sound.type.recording;
	} else {
		return Sound.type.effect;
	}
};

/**
 * Returns the name of the sound effect with the provided id, or null if no such sound exists.
 * @param {string} id (of sound effect, not recording)
 * @return {string|null}
 */
Sound.lookupById = function(id){
	let result = null;
	Sound.soundList.forEach(function(sound){
		if(sound.id === id) {
			result = sound;
		}
	});
	return result;
};

/**
 * Plays the snap sound effect if it is enabled
 */
Sound.playSnap = function(){
	if(SettingsManager.enableSnapNoise.getValue() === "true") {
		let snapSoundRequest = new HttpRequestBuilder("sound/play");
		snapSoundRequest.addParam("type", Sound.type.ui);
		snapSoundRequest.addParam("filename", Sound.click);
		HtmlServer.sendRequestWithCallback(snapSoundRequest.toString());
	}
};