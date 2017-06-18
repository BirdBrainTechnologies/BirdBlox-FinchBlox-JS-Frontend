/**
 * Created by Tom on 6/17/2017.
 */
function RecordingManager(){
	var RM = RecordingManager;
	RM.recordingStates = {};
	RM.recordingStates.stopped = 0;
	RM.recordingStates.recording = 1;
	RM.recordingStates.paused = 2;
	RM.state = RM.recordingStates.stopped;
	RM.updateTimer = null;
	RM.updateInterval = 200;
	RM.startTime = null;
	RM.pausedTime = 0;
}
RecordingManager.userRenameFile = function(oldFilename, nextAction){
	SaveManager.userRenameFile(true, oldFilename, nextAction);
};
RecordingManager.userDeleteFile=function(filename, nextAction){
	SaveManager.userDeleteFile(true, filename, nextAction);
};
RecordingManager.startRecording=function(){
	var RM = RecordingManager;
	var request = new HttpRequestBuilder("sound/recording/start");
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		if(result == "Started"){
			RM.setState(RM.recordingStates.recording);
			RecordingDialog.startedRecording();
		} else if(result == "Permission denied"){
			let message = "Please grant recording permissions to the BirdBlox app in settings";
			HtmlServer.showAlertDialog("Permission denied", message,"Dismiss");
		} else if(result == "Requesting permission") {

		}
	});
};
RecordingManager.stopRecording=function(){
	var RM = RecordingManager;
	var request = new HttpRequestBuilder("sound/recording/stop");
	var stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), stopRec, stopRec);
};
RecordingManager.pauseRecording=function(){
	var RM = RecordingManager;
	var request = new HttpRequestBuilder("sound/recording/pause");
	var stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	var pauseRec = function(){
		RM.setState(RM.recordingStates.paused);
		RecordingDialog.pausedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), pauseRec, stopRec);
};
RecordingManager.discardRecording = function(){
	var RM = RecordingManager;
	var stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	var message = "Are you sure you would like to delete the current recording?";
	HtmlServer.showChoiceDialog("Delete", message, "Continue recording", "Delete", true, function(result){
		if(result == "2") {
			var request = new HttpRequestBuilder("sound/recording/discard");
			HtmlServer.sendRequestWithCallback(request.toString(), stopRec, stopRec);
		}
	}, stopRec);
};
RecordingManager.resumeRecording = function(){
	var RM = RecordingManager;
	var request = new HttpRequestBuilder("sound/recording/unpause");
	var stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	var resumeRec = function(){
		RM.setState(RM.recordingStates.recording);
		RecordingDialog.startedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), resumeRec, stopRec);
};
RecordingManager.listRecordings = function(callbackFn){
	var request = new HttpRequestBuilder("sound/names");
	request.addParam("recording", "true");
	HtmlServer.sendRequestWithCallback(request.toString(), callbackFn);
};
RecordingManager.setState = function(state){
	var RM = RecordingManager;
	var prevState = RM.state;
	RM.state = state;
	var states = RM.recordingStates;



	if(state == states.recording){
		if(RM.updateTimer == null){
			if(prevState == states.stopped) RM.pausedTime = 0;
			RM.startTime = new Date().getTime();
			RM.updateTimer = self.setInterval(RM.updateCounter, RM.updateInterval);
		}
	}
	else if(state == states.paused) {
		if (RM.updateTimer != null) {
			RM.updateTimer = window.clearInterval(RM.updateTimer);
			RM.updateTimer = null;
			RM.pausedTime = RM.getElapsedTime();
		}
	}
	else {
		if (RM.updateTimer != null) {
			RM.updateTimer = window.clearInterval(RM.updateTimer);
			RM.updateTimer = null;
		}
	}
};
RecordingManager.updateCounter = function(){
	var RM = RecordingManager;
	RecordingDialog.updateCounter(RM.getElapsedTime());
};
RecordingManager.getElapsedTime = function(){
	var RM = RecordingManager;
	return new Date().getTime() - RM.startTime + RM.pausedTime;
};