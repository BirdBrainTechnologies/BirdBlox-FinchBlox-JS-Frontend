/**
 * Created by Tom on 6/18/2017.
 */
function Sound(id, isRecording, name){
	this.id = id;
	if(name == null){
		name = Sound.nameFromId(id, isRecording);
	}
	this.name = name;
	this.isRecording = isRecording;
}
Sound.setConstants = function(){
	Sound.soundList = [];
	Sound.recordingList = [];
	Sound.playingSoundStatuses = [];
	Sound.type = {};
	Sound.type.effect = "effect";
	Sound.type.ui = "ui";
	Sound.type.recording = "recording";
	Sound.loadSounds(true);
	Sound.loadSounds(false);
	Sound.click = "click2";
};
Sound.playAndStopPrev = function(id, isRecording, sentCallback, errorCallback, donePlayingCallback){
	Sound.stopAllSounds(null, function(){
		Sound.playWithCallback(id, isRecording, sentCallback, errorCallback, donePlayingCallback);
	});
};
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
		let request = new HttpRequestBuilder("sound/play");
		request.addParam("filename", id);
		request.addParam("type", Sound.boolToType(isRecording));
		HtmlServer.sendRequestWithCallback(request.toString(), function(){
			setTimeout(donePlayingFn, duration);
			if(sentCallback != null) sentCallback();
		}, errorFn);
	}, errorFn);
};
Sound.play = function(id, isRecording, status){
	if(status == null){
		Sound.playWithCallback(id, isRecording);
	}
	else{
		status.donePlaying = false;
		status.requestSent = false;
		const endPlaying = function(){
			status.donePlaying = true;
			status.requestSent = true;
		};
		Sound.playWithCallback(id, isRecording, function(){
			status.requestSent = true;
		}, endPlaying, endPlaying);
	}
};
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
Sound.loadSounds = function(isRecording, callbackFn){
	let request = new HttpRequestBuilder("sound/names");
	request.addParam("type", Sound.boolToType(isRecording));
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		let list = result.split(".wav").join("").split("\n"); //TODO: remove .wav removal
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
Sound.nameFromId = function(id, isRecording){
	if(isRecording) return id;
	let name = id;
	if(name.substring(name.length - 4) === ".wav") {
		name = name.substring(0, name.length - 4);
	}
	name = name.split("_").join(" ");
	name = name.replace(/\b\w/g, l => l.toUpperCase());
	return name;
};
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
Sound.getSoundList = function(isRecording){
	if(isRecording) {
		return Sound.recordingList;
	}
	return Sound.soundList;
};
Sound.boolToType = function(isRecording){
	if(isRecording){
		return Sound.type.recording;
	} else {
		return Sound.type.effect;
	}
};