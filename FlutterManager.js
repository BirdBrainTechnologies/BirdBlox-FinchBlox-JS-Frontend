function FlutterManager() {
	let mgr = FlutterManager;
	mgr.connectedDevices = {};
}

FlutterManager.ShowDiscoverDialog = function() {
	DiscoverDialog.show(FlutterManager);
}


FlutterManager.GetDeviceName = function(shorten) {
	if (shorten) {
		return "F";
	} else {
		return "Flutter";
	}
}

FlutterManager.GetDeviceCount = function() {
	return Object.keys(FlutterManager.connectedDevices).length;
}

// TODO: Choose either GetDeviceByIndex or GetDeviceByName
FlutterManager.GetDeviceByIndex = function(index) {
	// This is a hack because a FIFO list of devices is not kept
	let devices = Object.keys(FlutterManager.connectedDevices).map(function(key) {
		return FlutterManager.connectedDevices[key];
	})
	return devices[index];
}

FlutterManager.GetConnectedDevices = function() {
	let devices = Object.keys(FlutterManager.connectedDevices).map(function(key) {
		return FlutterManager.connectedDevices[key];
	})
	return devices;
}

/**
 * Static function to discover flutter devices
 *
 * @param      {function}  successFn  Callback function called on successful
 *                                    discovery of devices
 * @param      {function}  errorFn    Callback function called on an error in
 *                                    device discovery
 */
FlutterManager.DiscoverDevices = function(successFn, errorFn) {
	HtmlServer.sendRequestWithCallback("flutter/discover", successFn, errorFn);
}

/**
 * Connects a device and adds it to a list of connected devices
 *
 * @param      {string}  deviceName  Name of the device to connect
 */
FlutterManager.ConnectDevice = function(deviceName) {
	FlutterManager.connectedDevices[deviceName] = new Flutter(deviceName);
	FlutterManager.connectedDevices[deviceName].connect();
	BlockPalette.getCategory("robots").refreshGroup();
}

/**
 * Disconnects a device and removes it from a list of connected devices
 *
 * @param      {String}  deviceName  Name of the device to disconnect
 */
FlutterManager.DisconnectDevice = function(deviceName) {
	FlutterManager.connectedDevices[deviceName].disconnect();
	delete FlutterManager.connectedDevices[deviceName];
	BlockPalette.getCategory("robots").refreshGroup();
}

/**
 * Gets a device by name
 *
 * @param      {string}  deviceName  The device name
 * @return     {Flutter}  The device by name.
 */
FlutterManager.GetDeviceByName = function(deviceName) {
	return FlutterManager.connectedDevices[deviceName];
}