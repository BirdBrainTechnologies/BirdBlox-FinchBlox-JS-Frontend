"use strict";

function FlutterManager() {
	let mgr = FlutterManager;
	mgr.connectedDevices = {};
	mgr.connectionStatus = 2;
	// 0 - At least 1 disconnected
	// 1 - Every device is OK
	// 2 - Nothing connected
	mgr.UpdateConnectionStatus();
}

FlutterManager.ShowDiscoverDialog = function() {
	DiscoverDialog.show(FlutterManager);
}

/**
 * @param shorten {bool}
 * @returns {string}
 */
FlutterManager.GetDeviceName = function(shorten) {
	if (shorten) {
		return "F";
	} else {
		return "Flutter";
	}
};

FlutterManager.getConnectionInstructions = function(){
	return "Press the \"find me\" button on your flutter";
};

FlutterManager.GetConnectionStatus = function() {
	return FlutterManager.connectionStatus;
};

FlutterManager.UpdateConnectionStatus = function() {
	HtmlServer.sendRequestWithCallback("flutter/totalStatus", function(result) {
		FlutterManager.connectionStatus = parseInt(result);
		if (isNaN(FlutterManager.connectionStatus)) {
			FlutterManager.connectionStatus = 0;
		}
	},function(){
		FlutterManager.connectionStatus = 0;
	});
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
	FlutterManager.connectedDevices[deviceName].connect(function() {
		BlockPalette.getCategory("robots").refreshGroup();
		FlutterManager.UpdateConnectionStatus();		
	});
}

/**
 * Disconnects a device and removes it from a list of connected devices
 *
 * @param      {String}  deviceName  Name of the device to disconnect
 */
FlutterManager.DisconnectDevice = function(deviceName) {
	FlutterManager.connectedDevices[deviceName].disconnect(function() {
		delete FlutterManager.connectedDevices[deviceName];
		BlockPalette.getCategory("robots").refreshGroup();
		FlutterManager.UpdateConnectionStatus();		
	});
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