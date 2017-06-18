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
	return true;
};
CallbackManager.data = {};
CallbackManager.data.import = function(fileName){
	SaveManager.import(fileName);
	return true;
};
CallbackManager.dialog.prompt = function(cancelled, response){

};
CallbackManager.dialog.choice = function(cancelled, firstSelected){

};
CallbackManager.dialog.alert = function(){

};
CallbackManager.dialog.updateStatus = function(robotId, isConnected){

};