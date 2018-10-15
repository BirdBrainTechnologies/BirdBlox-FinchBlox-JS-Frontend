/**
 * A static class that manages making recordings
 */
function RecordingManager() {
	let RM = RecordingManager;

	/** @enum {number} */
	RM.recordingStates = {
		stopped: 0,
		recording: 1,
		paused: 2
	};
	RM.state = RM.recordingStates.stopped;
	RM.updateTimer = null;
	RM.updateInterval = 200;
	RM.startTime = null;
	RM.pausedTime = 0;
	RM.awaitingPermission = false;
}

/**
 * Provides UI/Dialogs to rename a recording
 * @param {string} oldFilename - The name of the recording to rename
 * @param {function} nextAction - The function to run if the recording is renamed
 */
RecordingManager.userRenameFile = function(oldFilename, nextAction) {
	SaveManager.userRenameFile(true, oldFilename, nextAction);
};

/**
 * Provides UI/dialogs to delete a recording
 * @param {string} filename - The name of the recording to delete
 * @param {function} nextAction - The function to run if the recording if deleted
 */
RecordingManager.userDeleteFile = function(filename, nextAction) {
	SaveManager.userDeleteFile(true, filename, nextAction);
};

/**
 * Tries to start recording
 */
RecordingManager.startRecording = function() {
	let RM = RecordingManager;
	let request = new HttpRequestBuilder("sound/recording/start");
	HtmlServer.sendRequestWithCallback(request.toString(), function(result) {
		if (result === "Started") {
			// Successfully started recording. Change state
			RM.setState(RM.recordingStates.recording);
			RecordingDialog.startedRecording();
		} else if (result === "Permission denied") {
			let message = "Grant_permission";
			DialogManager.showAlertDialog(Language.getStr("Permission_denied"), message, Language.getStr("Dismiss"));
		} else if (result === "Requesting permission") {
			RM.awaitingPermission = true;
		}
	});
};

/**
 * Tell the backend to stop recording
 */
RecordingManager.stopRecording = function() {
	let RM = RecordingManager;
	let request = new HttpRequestBuilder("sound/recording/stop");
	let stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), stopRec, stopRec);
};

/**
 * Called from backend when there is an unexpected interruption.
 */
RecordingManager.interruptRecording = function() {
	let RM = RecordingManager;
	RM.setState(RM.recordingStates.stopped);
	RecordingDialog.stoppedRecording();
};

/**
 * Tells the backend to pause recording
 */
RecordingManager.pauseRecording = function() {
	let RM = RecordingManager;
	let request = new HttpRequestBuilder("sound/recording/pause");
	let stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	let pauseRec = function() {
		RM.setState(RM.recordingStates.paused);
		RecordingDialog.pausedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), pauseRec, stopRec);
};

/**
 * Prompts the user to discard the current recording
 */
RecordingManager.discardRecording = function() {
	let RM = RecordingManager;
	let stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	let message = Language.getStr("Delete_question");
	DialogManager.showChoiceDialog(Language.getStr("Delete"), message, Language.getStr("Cancel"), Language.getStr("Delete"), true, function(result) {
		if (result === "2") {
			let request = new HttpRequestBuilder("sound/recording/discard");
			HtmlServer.sendRequestWithCallback(request.toString(), stopRec, stopRec);
		}
	}, stopRec);
};

/**
 * Tells the backend to resume recording
 */
RecordingManager.resumeRecording = function() {
	let RM = RecordingManager;
	let request = new HttpRequestBuilder("sound/recording/unpause");
	let stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	let resumeRec = function() {
		RM.setState(RM.recordingStates.recording);
		RecordingDialog.startedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), resumeRec, stopRec);
};

/**
 * Requests a list of recordings from the backend
 * @param {function} callbackFn - type (Array<Sound>) -> (), called with the list of recordings
 */
RecordingManager.listRecordings = function(callbackFn) {
	Sound.loadSounds(true, callbackFn);
};

/**
 * Changes the state of the RecordingManager and notifies any open Recording Dialogs to update their UI
 * @param state
 */
RecordingManager.setState = function(state) {
	let RM = RecordingManager;
	let prevState = RM.state;
	RM.state = state;
	let states = RM.recordingStates;
	if (state === states.recording) {
		if (RM.updateTimer == null) {
			if (prevState === states.stopped) RM.pausedTime = 0;
			RM.startTime = new Date().getTime();
			RM.updateTimer = self.setInterval(RM.updateCounter, RM.updateInterval);
		}
	} else if (state === states.paused) {
		if (RM.updateTimer != null) {
			RM.updateTimer = window.clearInterval(RM.updateTimer);
			RM.updateTimer = null;
			RM.pausedTime = RM.getElapsedTime();
		}
	} else {
		if (RM.updateTimer != null) {
			RM.updateTimer = window.clearInterval(RM.updateTimer);
			RM.updateTimer = null;
		}
	}
};

/**
 * Updates the elapsed time counters on any open dialogs
 */
RecordingManager.updateCounter = function() {
	let RM = RecordingManager;
	RecordingDialog.updateCounter(RM.getElapsedTime());
};

/**
 * Computes the elapsed time
 * @return {number} - Recording time in milliseconds
 */
RecordingManager.getElapsedTime = function() {
	let RM = RecordingManager;
	return new Date().getTime() - RM.startTime + RM.pausedTime;
};

/**
 * Starts recording if permission is granted and the app was waiting for permission
 */
RecordingManager.permissionGranted = function() {
	let RM = RecordingManager;
	if (RM.awaitingPermission) {
		RM.awaitingPermission = false;
		if (RecordingDialog.currentDialog != null) {
			RM.startRecording();
		}
	}
};
