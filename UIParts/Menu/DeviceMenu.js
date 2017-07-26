/**
 * A menu which displays information about the connected device and provides options to connect to/disconnect from
 * devices
 * @param {button} button
 * @constructor
 */
function DeviceMenu(button) {
	Menu.call(this, button, DeviceMenu.width);
	this.addAlternateFn(function() {
		// If more than one device is connected, the connect multiple dialog is used instead
		ConnectMultipleDialog.showDialog();
	});
}
DeviceMenu.prototype = Object.create(Menu.prototype);
DeviceMenu.prototype.constructor = ViewMenu;

DeviceMenu.setGraphics = function() {
	DeviceMenu.width = 150;
	DeviceMenu.maxDeviceNameChars = 8;
};

/**
 * @inheritDoc
 */
DeviceMenu.prototype.loadOptions = function() {
	let connectedClass = null;
	Device.getTypeList().forEach(function(deviceClass) {
		/* The menu only shows up if no more than 1 device is connected. So if a DeviceManager has at least one device
		 * is it the connectedClass */
		if (deviceClass.getManager().getDeviceCount() > 0) {
			connectedClass = deviceClass;
		}
	});
	if (connectedClass != null) {
		// If there is a device connected, we add an option to display firmware info about the device
		this.addDeviceOption(connectedClass);
		// And we add an option to disconnect from it.
		this.addOption("Disconnect " + connectedClass.getDeviceTypeName(false, DeviceMenu.maxDeviceNameChars), function() {
			connectedClass.getManager().removeAllDevices();
		});
	} else {
		// If no devices are connected, we add an option to connect to each type of device
		Device.getTypeList().forEach(function(deviceClass) {
			this.addOption("Connect " + deviceClass.getDeviceTypeName(false, DeviceMenu.maxDeviceNameChars), function() {
				(new DiscoverDialog(deviceClass)).show();
			});
		}, this);
	}
	// Regardless, we provide an option to connect to every type of device
	this.addOption("Connect Multiple", ConnectMultipleDialog.showDialog);
};

/**
 * Adds an option for getting firmware info about the currently connected device.  The option includes a yellow/red
 * warning icon if firmware is out of date
 * @param connectedClass - Subclass of Device
 */
DeviceMenu.prototype.addDeviceOption = function(connectedClass) {
	const device = connectedClass.getManager().getDevice(0);
	const status = device.getFirmwareStatus();
	const statuses = Device.firmwareStatuses;
	let icon = null;
	let color = null;
	if (status === statuses.old) {
		// If the firmware is old but usable, a yellow icon is used
		icon = VectorPaths.warning;
		color = DeviceStatusLight.yellowColor;
	} else if (status === statuses.incompatible) {
		// If the firmware is not usable, a red icon is used
		icon = VectorPaths.warning;
		color = DeviceStatusLight.redColor;
	}
	this.addOption("", device.showFirmwareInfo.bind(device), false, this.createAddIconToBnFn(icon, device.name, color));
};

/**
 * Determines whether multiple devices are connected, in which case the connect multiple dialog should be opened
 * @inheritDoc
 * @return {boolean}
 */
DeviceMenu.prototype.previewOpen = function() {
	let connectionCount = 0;
	Device.getTypeList().forEach(function(deviceClass) {
		connectionCount += deviceClass.getManager().getDeviceCount();
	});
	return (connectionCount <= 1);
};

/**
 * Creates a function to format a button based on the provided options
 * @param {string} [pathId] - Object from VectorPaths to use as an icon on the side of the button
 * @param {string} text - Test to place on the button
 * @param {string} [color] - The color of the icon in hex (not needed if no icon will be added)
 * @return {function} - type (Button) -> (), a function to format the provided button with the specified icon and text
 */
DeviceMenu.prototype.createAddIconToBnFn = function(pathId, text, color) {
	if (pathId == null) {
		return function(bn) {
			bn.addText(text);
		}
	}
	return function(bn) {
		bn.addSideTextAndIcon(pathId, null, text, null, null, null, null, null, color, true, false);
	}
};