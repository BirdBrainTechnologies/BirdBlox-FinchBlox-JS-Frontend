function FlutterManager() {
	let mgr = FlutterManager;
	mgr.connectedDevices = {};
}

FlutterManager.ShowDiscoverDialog = function() {
	DiscoverDialog.show(FlutterManager);
}

/**
 * Static function to discover flutter devices
 *
 * @class      DiscoverDevices
 * @param      {function}  successFn  Callback function called on successful
 *                                    discovery of devices
 * @param      {function}  errorFn    Callback function called on an error in
 *                                    device discovery
 */
FlutterManager.DiscoverDevices = function(successFn, errorFn) {
	HtmlServer.sendRequestWithCallback("flutter/discover", successFn, errorFn);
}

/**
 * Connects a device and adds it to a list of connected devices.
 *
 * @class      ConnectDevice 
 * @param      {string}  deviceName  The device name
 */
FlutterManager.ConnectDevice = function(deviceName) {
	FlutterManager.connectedDevices[deviceName] = new Flutter(deviceName);
	FlutterManager.connectedDevices[deviceName].connect();
}

FlutterManager.DisconnectDevice = function(deviceName) {
	FlutterManager.connectedDevices[deviceName].disconnect();
	delete FlutterManager.connectedDevices[deviceName];
}

/**
 * Gets a device by name.
 *
 * @class      GetDeviceByName
 * @param      {string}  deviceName  The device name
 * @return     {Flutter}  The device by name.
 */
FlutterManager.GetDeviceByName = function(deviceName) {
	return FlutterManager.connectedDevices[deviceName];
}