/**
 * The CallBackManager is a static classes that allows the backend to initiate JS actions.  All string parameters
 * sent through callbacks must be percent encoded for safely, as the backend run these methods using string
 * concatenation.  They all return a boolean indicating if the callback ran without error.  A result of true means
 * everything worked, while false indicates the request was bad, unimplemented, or encountered an error.
 */
function CallbackManager(){

}

CallbackManager.sounds = {};
/**
 * Called when recording stops unexpectedly
 * @return {boolean}
 */
CallbackManager.sounds.recordingEnded = function(){
	RecordingManager.interruptRecording();
	return true;
};
/**
 * Called when permission to record is granted by the user
 * @return {boolean}
 */
CallbackManager.sounds.permissionGranted = function(){
	RecordingManager.permissionGranted();
	return true;
};
/**
 * Called to notify the frontend that the list of recordings has changed
 * @returns {boolean}
 */
CallbackManager.sounds.recordingsChanged = function(){
	Sound.loadSounds(true);
	RecordingDialog.recordingsChanged();
	return true;
};

CallbackManager.data = {};
/**
 * Tells the frontend to open a file with the specified name and data
 * @param {string} fileName - The percent encoded name of the file
 * @param {string} data - The percent encoded content of the file
 * @return {boolean}
 */
CallbackManager.data.open = function(fileName, data) {
	fileName = HtmlServer.decodeHtml(fileName);
	data = HtmlServer.decodeHtml(data);
	SaveManager.backendOpen(fileName, data);
	return true;
};
/**
 * Sets the name of the currently open file (when there is a rename request, for example)
 * @param {string} fileName - The percent encoded new name of the file
 * @return {boolean}
 */
CallbackManager.data.setName = function(fileName){
	fileName = HtmlServer.decodeHtml(fileName);
	SaveManager.backendSetName(fileName);
	return true;
};
/**
 * Closes the current file and opens the blank file
 * @return {boolean}
 */
CallbackManager.data.close = function(){
	SaveManager.backendClose();
	return true;
};
/**
 * Tells the frontend to lock the UI and show Loading... until the file loads (or 1 sec passes)
 * @return {boolean}
 */
CallbackManager.data.markLoading = function(){
	SaveManager.backendMarkLoading();
	return true;
};
/**
 * Tells the frontend to reload the OpenDialog if it is open because the local files have changed
 * @return {boolean}
 */
CallbackManager.data.filesChanged = function(){
	OpenDialog.filesChanged();
	return true;
};

CallbackManager.cloud = {};
/**
 * Tells the frontend to reload the OpenCloudDialog if it is open because the cloud files have changed
 * @param {string} newFiles - A percent encoded JSON object containing the new list of files
 * @return {boolean}
 */
CallbackManager.cloud.filesChanged = function(newFiles){
	newFiles = HtmlServer.decodeHtml(newFiles);
	OpenCloudDialog.filesChanged(newFiles);
	return true;
};
/**
 * Tells the frontend that a cloud file have finished downloading
 * @param filename - The percent encoded file that has finished downloading
 * @return {boolean}
 */
CallbackManager.cloud.downloadComplete = function(filename) {
	filename = HtmlServer.decodeHtml(filename);
	OpenDialog.filesChanged();
	return true;
};
/**
 * Tells the frontend that the user has just signed in, so the OpenDialog needs to be reloaded if open
 * @return {boolean}
 */
CallbackManager.cloud.signIn = function(){
	OpenDialog.filesChanged();
	OpenCloudDialog.filesChanged();
	return true;
};

CallbackManager.dialog = {};
/**
 * Tells the frontend that the user has just closed a prompt dialog
 * @param {boolean} cancelled - Whether the dialog was cancelled or closed without being answered
 * @param {string} [response] - The percent encoded string containing the user's response (or null/undefined if N/A)
 * @return {boolean}
 */
CallbackManager.dialog.promptResponded = function(cancelled, response){
	if(response != null) {
		response = HtmlServer.decodeHtml(response);
	}
	DialogManager.promptDialogResponded(cancelled, response);
	return true;
};
/**
 * Tells the frontend that the user has just closed a choice dialog or alert dialog
 * @param {boolean} cancelled - Whether the dialog was closed without being answered
 * @param {boolean} firstSelected - Whether the first option was selected
 * @return {boolean}
 */
CallbackManager.dialog.choiceResponded = function(cancelled, firstSelected){
	DialogManager.choiceDialogResponded(cancelled, firstSelected);
	return true;
};

CallbackManager.robot = {};
/**
 * Tells the frontend whether the specified robot is in good communication with the backend over bluetooth
 * @param {string} robotId - The percent encoded id of the robot
 * @param {boolean} isConnected - Whether the backend is able to communicate with the robot
 * @return {boolean}
 */
CallbackManager.robot.updateStatus = function(robotId, isConnected){
	robotId = HtmlServer.decodeHtml(robotId);
	DeviceManager.updateConnectionStatus(robotId, isConnected);
	return true;
};
/**
 * Tells the frontend that a robot has just been disconnected because it has incompatible firmware
 * @param {string} robotId - The percent encoded id of the robot
 * @param {string} oldFirmware - The percent encoded version of firmware that was on the robot
 * @param {string} minFirmware - The percent encoded minimum version of firmware the backend requires
 */
CallbackManager.robot.disconnectIncompatible = function(robotId, oldFirmware, minFirmware) {
	robotId = HtmlServer.decodeHtml(robotId);
	oldFirmware = HtmlServer.decodeHtml(oldFirmware);
	minFirmware = HtmlServer.decodeHtml(minFirmware);
	DeviceManager.disconnectIncompatible(robotId, oldFirmware, minFirmware);
};

CallbackManager.robot.connectionFailure = function(robotId) {
    robotId = HtmlServer.decodeHtml(robotId);
    let msg = "Connection to \"" + robotId + "\" failed, please try again later.";
    DialogManager.showChoiceDialog("Connection Failure", msg, "", "Dismiss", true, function (result) {
    		return;
    	}.bind(this));
}
/**
 * Tells the frontend that the status of a robot's firmware
 * @param {string} robotId - The percent encoded id of the robot
 * @param {string} status - The percent encoded string "upToDate", "old", or "incompatible"
 * @return {boolean}
 */
CallbackManager.robot.updateFirmwareStatus = function(robotId, status) {
	robotId = HtmlServer.decodeHtml(robotId);
	status = HtmlServer.decodeHtml(status);
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
/**
 * Tells the frontend that a device has just been discovered
 * @param {string} robotTypeId - The percent encoded type of robot being scanned for
 * @param {string} robotList - A percent encoded JSON array of discovered devices
 * @return {boolean}
 */
CallbackManager.robot.discovered = function(robotList){
	robotList = HtmlServer.decodeHtml(robotList);
	DeviceManager.backendDiscovered(robotList);
	return true;
};
/**
 * Tells the frontend that the discover timed out so the frontend has a chance to start the discover again.
 * @param {string} robotTypeId - The percent encoded type of robot being scanned for
 * @return {boolean}
 */
CallbackManager.robot.discoverTimeOut = function() {
	DeviceManager.possiblyRescan();
	return true;
};
/**
 * Tells the frontend that the backend has stopped scanning for devices. The frontend might start the scan again.
 * @param {string} robotTypeId - The percent encoded type of robot being scanned for
 * @return {boolean}
 */
CallbackManager.robot.stopDiscover = function() {
	DeviceManager.possiblyRescan();
	return true;
};

CallbackManager.tablet = {};
/**
 * Tells the frontend which sensors the backend supports
 * @param {string} sensorList - A non percent encoded, return separated list of supported sensors
 * @return {boolean}
 */
CallbackManager.tablet.availableSensors = function(sensorList){
	TabletSensors.updateAvailable(sensorList);
	return true;
};
/**
 * Tells the frontend that the backend supports a specific sensor
 * @param {string} sensor - A non percent encoded string representing the supported sensor
 * @return {boolean} - Whether the sensor string was valid
 */
CallbackManager.tablet.addSensor = function(sensor){
	return TabletSensors.addSensor(sensor);
};
/**
 * Tells the frontend that the backend does not support a specific sensor
 * @param {string} sensor - A non percent encoded string representing the unsupported sensor
 * @return {boolean} - Whether the sensor string was valid
 */
CallbackManager.tablet.removeSensor = function(sensor){
	return TabletSensors.removeSensor(sensor);
};

/**
 * Tells the frontend that the language of the system
 * @param {string} sensor - A non percent encoded string representing the unsupported sensor
 * @return {boolean} - Whether the sensor string was valid
 */

CallbackManager.tablet.getLanguage = function(lang){
    Language.setLanguage(lang);
};


/**
 * Tells the frontend to tell the backend something.  Exists because certain functions in that backend can't access
 * each other easily.  This wasn't my idea and I will take no responsibility for this function's existence.
 * @param {string} request - The percent encoded string representing request the backend wants the frontend to make
 */
CallbackManager.echo = function(request){
	// decode the request
	request = HtmlServer.decodeHtml(request);
	/* Send it back.  Hopefully it has all its parameters percent encoded already.  That means the backend needs
	 * to percent encode each parameter individually, and then percent encode the entire string again to pass it
	 * to this function. */
	HtmlServer.sendRequestWithCallback(request);
};

/**
 * Receives the backend's response to a native call
 * @param {string} id - The non percent encoded id of the request
 * @param {string} status - The non percent encoded status code
 * @param {string} body - The percent encoded response from the backend
 */
CallbackManager.httpResponse = function(id, status, body) {
	if (body != null) {
		body = HtmlServer.decodeHtml(body);
	}
	HtmlServer.responseFromIosCall(id, status, body);
};