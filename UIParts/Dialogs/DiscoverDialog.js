"use strict";

/**
 * A dialog for discovering and connecting to a certain type of robot
 * @param deviceClass - subclass of Device, type of robot to scan for
 * @constructor
 */
function DiscoverDialog(deviceClass) {
	let DD = DiscoverDialog;
	let title = Language.getStr("Connect_Device");
	RowDialog.call(this, false, title, 0, 0, 0);
	this.addCenteredButton(Language.getStr("Cancel"), this.closeDialog.bind(this));
	this.deviceClass = deviceClass;
	this.addHintText(deviceClass.getConnectionInstructions());

	/** @type {Array<Device>} - The discovered devices to use as the content of the dialog */
	this.discoveredDevices = [];

	/* If an update happens at an inconvenient time (like while scrolling), the dialog is not reloaded; rather
	 * updatePending is set to true, the timer is started, and the reload occurs at a better time */
	this.updatePending = false;
	this.updateTimer = new Timer(1000, this.checkPendingUpdate.bind(this));
}
DiscoverDialog.prototype = Object.create(RowDialog.prototype);
DiscoverDialog.prototype.constructor = DiscoverDialog;

/**
 * Shows the dialog and starts the scan for devices
 * @inheritDoc
 */
DiscoverDialog.prototype.show = function() {
	const DD = DiscoverDialog;
	RowDialog.prototype.show.call(this);
	this.discoverDevices();
};

/**
 * Starts the scan for devices and registers the dialog to receive updates when devices are detected
 */
DiscoverDialog.prototype.discoverDevices = function() {
	let me = this;
	// Start the discover, and if the DeviceManger wants to know if it should ever restart a scan...
	this.deviceClass.getManager().startDiscover(function() {
		// Tell the device manager that it should scan again if the dialog is still open
		return this.visible;
	}.bind(this));
	// When a device is detected, update the dialog
	this.deviceClass.getManager().registerDiscoverCallback(this.updateDeviceList.bind(this));
};

/**
 * Checks if there is a pending update and updates the dialog if there is
 */
DiscoverDialog.prototype.checkPendingUpdate = function() {
	if (this.updatePending) {
		this.updateDeviceList(this.deviceClass.getManager().getDiscoverCache());
	}
};

/**
 * Reloads the dialog with the information from the new device list, or sets a pending update if the user is scrolling
 * or is touching the screen
 * @param {string} deviceList - A string representing a JSON array of devices
 */
 
var updateDeviceListCounter = 0;

DiscoverDialog.prototype.updateDeviceList = function(deviceList) {
	updateDeviceListCounter += 1;
	if (!this.visible) {
		return;
	} else if (TouchReceiver.touchDown || this.isScrolling()) {
		this.updatePending = true;
		this.updateTimer.start();
		return;
	}
	this.updatePending = false;
	this.updateTimer.stop();
	// Read the JSON
	this.discoveredDevices = this.deviceClass.getManager().fromJsonArrayString(deviceList);

	// Sort the devices by signal strength

	this.discoveredDevicesRSSISorted = this.discoveredDevices.sort(function(a,b) {
		return parseFloat(b.RSSI) - parseFloat(a.RSSI);
	});
	
	//if ((updateDeviceListCounter % 40) == 0){
	this.reloadRows(this.discoveredDevicesRSSISorted.length);
	//};
	
//	this.reloadRows(this.discoveredDevices.length);
};

/**
 * Creates the connection button for each discovered device
 * @inheritDoc
 * @param {number} index
 * @param {number} y
 * @param {number} width
 * @param {Element} contentGroup
 */
DiscoverDialog.prototype.createRow = function(index, y, width, contentGroup) {
	// TODO: use RowDialog.createMainBnWithText instead
	const button = new Button(0, y, width, RowDialog.bnHeight, contentGroup);
    var deviceName = this.discoveredDevices[index].name;
    var words = deviceName.split(" ");
    var newName = "";
    for (var i = 0; i < words.length; i++) {
        newName += words[i][0];
    };

	button.addText(newName + " - " + this.discoveredDevices[index].name + " (" + this.discoveredDevices[index].device + ")");
	const me = this;
	button.setCallbackFunction(function() {
		me.selectDevice(me.discoveredDevices[index]);
	}, true);
	button.makeScrollable();
};

/**
 * Connects to a device and closes the dialog
 * @param device
 */
DiscoverDialog.prototype.selectDevice = function(device) {
    this.deviceClass = DeviceManager.getDeviceClass(device);
	this.deviceClass.getManager().setOneDevice(device);
	this.closeDialog();
};

/**
 * Stops the update timer and discover
 */
DiscoverDialog.prototype.closeDialog = function() {
	RowDialog.prototype.closeDialog.call(this);
	this.updateTimer.stop();
	this.deviceClass.getManager().stopDiscover();
};