/**
 * Created by Tom on 6/17/2017.
 */
function CallbackManager(){

}
CallbackManager.sounds = {};
CallbackManager.sounds.recordingEnded = function(){
	return true;
};
CallbackManager.sounds.permissionGranted = function(){
	RecordingManager.permissionGranted();
	return true;
};
CallbackManager.data = {};
CallbackManager.data.import = function(fileName){
	SaveManager.import(fileName);
	return true;
};
CallbackManager.dialog.promptClosed = function(cancelled, response){
	return false;
};
CallbackManager.dialog.choiceClosed = function(cancelled, firstSelected){
	return false;
};
CallbackManager.dialog.alertClosed = function(){
	return false;
};
CallbackManager.robot = {};
CallbackManager.robot.updateStatus = function(robotId, isConnected){
	return false;
};