/**
 * Created by Tom on 6/17/2017.
 */
function CallbackManager(){

}
CallbackManager.sounds = {};
CallbackManager.sounds.recordingEnded = function(){
	RecordingManager.interruptRecording();
	return true;
};
CallbackManager.sounds.permissionGranted = function(){
	RecordingManager.permissionGranted();
	return true;
};
CallbackManager.data = {};
CallbackManager.data.open = function(fileName, data, named) {
	fileName = HtmlServer.decodeHtml(fileName);
	data = HtmlServer.decodeHtml(data);
	SaveManager.backendOpen(fileName, data, named);
	return true;
};
CallbackManager.data.setName = function(fileName, named){
	fileName = HtmlServer.decodeHtml(fileName);
	SaveManager.backendSetName(fileName, named);
	return true;
};
CallbackManager.data.close = function(){
	SaveManager.backendClose();
	return true;
};
CallbackManager.data.markLoading = function(){
	SaveManager.backendMarkLoading();
	return true;
};
CallbackManager.data.filesChanged = function(){
	OpenDialog.filesChanged();
	return true;
};

CallbackManager.cloud = {};
CallbackManager.cloud.filesChanged = function(newFiles){
	newFiles = HtmlServer.decodeHtml(newFiles);
	OpenCloudDialog.filesChanged(newFiles);
	return true;
};
CallbackManager.cloud.downloadComplete = function(filename) {
	filename = HtmlServer.decodeHtml(filename);
	OpenDialog.filesChanged();
	return true;
};
CallbackManager.cloud.signIn = function(){
	OpenDialog.filesChanged();
	OpenCloudDialog.filesChanged();
	return true;
};

CallbackManager.dialog = {};
CallbackManager.dialog.promptResponded = function(cancelled, response){
	response = HtmlServer.decodeHtml(response);
	DialogManager.promptDialogResponded(cancelled, response);
	return true;
};
CallbackManager.dialog.choiceResponded = function(cancelled, firstSelected){
	DialogManager.choiceDialogResponded(cancelled, firstSelected);
	return true;
};
CallbackManager.robot = {};
CallbackManager.robot.updateStatus = function(robotId, isConnected){
	robotId = HtmlServer.decodeHtml(robotId);
	DeviceManager.updateConnectionStatus(robotId, isConnected);
	return true;
};
CallbackManager.robot.updateFirmwareStatus = function(robotId, status) {
	robotId = HtmlServer.decodeHtml(robotId);
	const statuses = Device.firmwareStatuses;
	let firmwareStatus;
	if(status === "upToDate") {
		firmwareStatus = statuses.upToDate;
	} else if(status === "old") {
		firmwareStatus = statuses.old;
	} else if(status === "incompatible") {
		firmwareStatus = statuses.incompatible;
	} else {
		return false;
	}
	DeviceManager.updateFirmwareStatus(robotId, firmwareStatus);
	return true;
};
CallbackManager.robot.discovered = function(robotTypeId, robotList){
	robotTypeId = HtmlServer.decodeHtml(robotTypeId);
	robotList = HtmlServer.decodeHtml(robotList);
	DeviceManager.backendDiscovered(robotTypeId, robotList);
	return true;
};
CallbackManager.robot.discoverTimeOut = function(robotTypeId) {
	robotTypeId = HtmlServer.decodeHtml(robotTypeId);
	DeviceManager.possiblyRescan(robotTypeId);
	return true;
};
CallbackManager.robot.stopDiscover = function(robotTypeId) {
	robotTypeId = HtmlServer.decodeHtml(robotTypeId);
	DeviceManager.possiblyRescan(robotTypeId);
	return true;
};

CallbackManager.tablet = {};
CallbackManager.tablet.availableSensors = function(sensorList){
	TabletSensors.updateAvailable(sensorList);
};
CallbackManager.tablet.addSensor = function(sensor){
	return TabletSensors.addSensor(sensor);
};
CallbackManager.tablet.removeSensor = function(sensor){
	return TabletSensors.removeSensor(sensor);
};
CallbackManager.echo = function(request){
	HtmlServer.sendRequestWithCallback(request);
};