/**
 * A tabbed dialog for connecting multiple devices.  Each type of device has a tab in which devices can be reordered,
 * added, and removed.  A status light for each device indicates if it is connected and an info button shows
 * whether the firmware is up to date
 * @param deviceClass - A subclass of Device, the tab that should be open to start
 * @constructor
 */
function ConnectMultipleDialog(deviceClass) {
	let CMD = ConnectMultipleDialog;
	// Store the open tab so it can be reopened by default next time
	CMD.lastClass = deviceClass;
	let title = "Connect Multiple";
	this.deviceClass = deviceClass;
	let count = deviceClass.getManager().getDeviceCount();
	RowDialog.call(this, false, title, count, CMD.tabRowHeight, CMD.extraBottomSpace, CMD.tabRowHeight - 1);
	this.addCenteredButton("Done", this.closeDialog.bind(this));
	this.addHintText("Tap \"+\" to connect");
}
ConnectMultipleDialog.prototype = Object.create(RowDialog.prototype);
ConnectMultipleDialog.prototype.constructor = ConnectMultipleDialog;

ConnectMultipleDialog.setConstants = function() {
	let CMD = ConnectMultipleDialog;
	CMD.currentDialog = null;

	CMD.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
	CMD.tabRowHeight = RowDialog.titleBarH;
	CMD.numberWidth = 35;
	CMD.plusFont = Font.uiFont(26);

	CMD.numberFont = Font.uiFont(16);
	CMD.numberColor = Colors.white;
};

/**
 * Creates the status light, main button, info button, and remove button
 * @inheritDoc
 * @param {number} index
 * @param {number} y
 * @param {number} width
 * @param {Element} contentGroup
 */
ConnectMultipleDialog.prototype.createRow = function(index, y, width, contentGroup) {
	let CMD = ConnectMultipleDialog;
	let statusX = 0;
	let numberX = statusX + DeviceStatusLight.radius * 2;
	let mainBnX = numberX + CMD.numberWidth;
	let mainBnWidth = width - (RowDialog.smallBnWidth + RowDialog.bnMargin) * 2 - mainBnX;
	let infoBnX = mainBnX + RowDialog.bnMargin + mainBnWidth;
	let removeBnX = infoBnX + RowDialog.bnMargin + RowDialog.smallBnWidth;

	let robot = this.deviceClass.getManager().getDevice(index);
	this.createStatusLight(robot, statusX, y, contentGroup);
	this.createNumberText(index, numberX, y, contentGroup);
	this.createMainBn(robot, index, mainBnWidth, mainBnX, y, contentGroup);
	this.createInfoBn(robot, index, infoBnX, y, contentGroup);
	this.createRemoveBn(robot, index, removeBnX, y, contentGroup);
};

/**
 * Creates a light to indicate the status of the provided robot
 * @param {Device} robot
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 * @return {DeviceStatusLight}
 */
ConnectMultipleDialog.prototype.createStatusLight = function(robot, x, y, contentGroup) {
	return new DeviceStatusLight(x, y + RowDialog.bnHeight / 2, contentGroup, robot);
};

/**
 * Creates a number for the row.  Since the blocks control a Device with a certain number, is is important for the
 * user to know when device is, say, Hummingbird 3
 * @param {number} index
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
ConnectMultipleDialog.prototype.createNumberText = function(index, x, y, contentGroup) {
	let CMD = ConnectMultipleDialog;
	let textE = GuiElements.draw.text(0, 0, (index + 1) + "", CMD.numberFont, CMD.numberColor);
	let textW = GuiElements.measure.textWidth(textE);
	let textX = x + (CMD.numberWidth - textW) / 2;
	let textY = y + (RowDialog.bnHeight + CMD.numberFont.charHeight) / 2;
	GuiElements.move.text(textE, textX, textY);
	contentGroup.appendChild(textE);
	return textE;
};

/**
 * Creates a button which shows which robot is connected in that position of the list. Tapping the button allows the
 * robot to be replaced with a different robot
 *
 * @param {Device} robot - The robot currently in this location
 * @param {number} index
 * @param {number} bnWidth
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 * @return {Button}
 */
ConnectMultipleDialog.prototype.createMainBn = function(robot, index, bnWidth, x, y, contentGroup) {
	let connectionX = this.x + this.width / 2;
	return RowDialog.createMainBnWithText(robot.name, bnWidth, x, y, contentGroup, function() {
		let upperY = this.contentRelToAbsY(y);
		let lowerY = this.contentRelToAbsY(y + RowDialog.bnHeight);
		// When tapped, a list of robots to connect from appears
		(new RobotConnectionList(connectionX, upperY, lowerY, index, this.deviceClass)).show();
	}.bind(this));
};

/**
 * Creates the button for removing a robot from the list
 * @param {Device} robot
 * @param {number} index
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 * @return {Button}
 */
ConnectMultipleDialog.prototype.createRemoveBn = function(robot, index, x, y, contentGroup) {
	let button = RowDialog.createSmallBn(x, y, contentGroup);
	button.addText("X");
	button.setCallbackFunction(function() {
		this.deviceClass.getManager().removeDevice(index);
	}.bind(this), true);
	return button;
};

/**
 * Creates a button which shows info about the device's firmware
 * @param {Device} robot
 * @param {number} index
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 * @return {Button}
 */
ConnectMultipleDialog.prototype.createInfoBn = function(robot, index, x, y, contentGroup) {
	let button = RowDialog.createSmallBn(x, y, contentGroup, robot.showFirmwareInfo.bind(robot));

	// The appearance of the button changes depending on the firmwareStatus
	const statuses = Device.firmwareStatuses;
	function updateStatus(firmwareStatus) {
		if (firmwareStatus === statuses.old) {
			button.addColorIcon(VectorPaths.warning, RowDialog.iconH, DeviceStatusLight.yellowColor);
		} else if (firmwareStatus === statuses.incompatible) {
			button.addColorIcon(VectorPaths.warning, RowDialog.iconH, DeviceStatusLight.redColor);
		} else {
			button.addIcon(VectorPaths.info, RowDialog.iconH);
		}
	}
	updateStatus(robot.getFirmwareStatus());
	robot.setFirmwareStatusListener(updateStatus);

	return button;
};

/**
 * Creates the dialog and starts a scan for the current device type
 * @inheritDoc
 */
ConnectMultipleDialog.prototype.show = function() {
	let CMD = ConnectMultipleDialog;
	RowDialog.prototype.show.call(this);
	CMD.currentDialog = this;
	this.createConnectBn();
	this.createTabRow();
	this.deviceClass.getManager().startDiscover(function() {
		return this.visible;
	}.bind(this));
};

/**
 * Creates a "+" button for connecting to another robot
 * @return {Button}
 */
ConnectMultipleDialog.prototype.createConnectBn = function() {
	let CMD = ConnectMultipleDialog;
	let bnWidth = this.getContentWidth() - RowDialog.smallBnWidth - DeviceStatusLight.radius * 2 - CMD.numberWidth;
	let x = (this.width - bnWidth) / 2;
	// Gets the location to add the button
	let y = this.getExtraBottomY();
	let button = new Button(x, y, bnWidth, RowDialog.bnHeight, this.group);
	button.addText("+", CMD.plusFont);
	let upperY = y + this.y;
	let lowerY = upperY + RowDialog.bnHeight;
	let connectionX = this.x + this.width / 2;
	button.setCallbackFunction(function() {
		// Shows a list of devices to connect
		(new RobotConnectionList(connectionX, upperY, lowerY, null, this.deviceClass)).show();
	}.bind(this), true);
	const manager = this.deviceClass.getManager();
	if (manager.getDeviceCount() >= DeviceManager.maxDevices) {
		button.disable();
	}
	return button;
};

/**
 * Creates a row of tabs for each device type, which when selected, reload the dialog for that tab
 * @return {TabRow}
 */
ConnectMultipleDialog.prototype.createTabRow = function() {
	let CMD = ConnectMultipleDialog;
	let selectedIndex = Device.getTypeList().indexOf(this.deviceClass);
	let y = this.getExtraTopY();
	let tabRow = new TabRow(0, y, this.width, CMD.tabRowHeight, this.group, selectedIndex);
	Device.getTypeList().forEach(function(deviceClass) {
		tabRow.addTab(deviceClass.getDeviceTypeName(false), deviceClass);
	});
	// When a tab is selected, reloadDialog will be called with the class of the device type
	tabRow.setCallbackFunction(this.reloadDialog.bind(this));
	tabRow.show();
	return tabRow;
};

/**
 * Reloads the dialog with the provided device type's tab open, or the last selected type if none is provided
 * @param [deviceClass] - subclass of Device
 */
ConnectMultipleDialog.prototype.reloadDialog = function(deviceClass) {
	if (deviceClass == null) {
		deviceClass = this.deviceClass;
	}
	if (deviceClass !== this.deviceClass) {
		// Stop discovery before switching tabs
		this.deviceClass.getManager().stopDiscover();
	}
	let thisScroll = this.getScroll();
	let me = this;
	me.hide();
	let dialog = new ConnectMultipleDialog(deviceClass);
	dialog.show();
	if (deviceClass === this.deviceClass) {
		dialog.setScroll(thisScroll);
	}
};

/**
 * Closes the dialog and stops discovery
 * @inheritDoc
 */
ConnectMultipleDialog.prototype.closeDialog = function() {
	let CMD = ConnectMultipleDialog;
	RowDialog.prototype.closeDialog.call(this);
	CMD.currentDialog = null;
	this.deviceClass.getManager().stopDiscover();
};

/**
 * Reloads the currently open dialog
 */
ConnectMultipleDialog.reloadDialog = function() {
	let CMD = ConnectMultipleDialog;
	if (CMD.currentDialog != null) {
		CMD.currentDialog.reloadDialog();
	}
};

/**
 * Creates and shows a ConnectMultipleDialog with the default tab open
 */
ConnectMultipleDialog.showDialog = function() {
	let CMD = ConnectMultipleDialog;
	if (CMD.lastClass == null) {
		CMD.lastClass = Device.getTypeList()[0];
	}
	(new ConnectMultipleDialog(CMD.lastClass)).show();
};