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
    let title = "Connect Multiple";
    this.deviceClass = deviceClass;
    let count = 0;
    Device.getTypeList().forEach(function(dvcClass) {
        count += dvcClass.getManager().getDeviceCount();
    });
    RowDialog.call(this, false, title, count, CMD.tabRowHeight, CMD.extraBottomSpace, CMD.tabRowHeight - 1);
    this.addCenteredButton("Done", this.closeDialog.bind(this));
    this.addHintText(Language.getStr("Tap") + " + " + Language.getStr("to connect"));
}
ConnectMultipleDialog.prototype = Object.create(RowDialog.prototype);
ConnectMultipleDialog.prototype.constructor = ConnectMultipleDialog;

ConnectMultipleDialog.setConstants = function() {
    let CMD = ConnectMultipleDialog;
    CMD.currentDialog = null;
    CMD.deviceLimit = 3;
    CMD.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
    CMD.tabRowHeight = 0;
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
ConnectMultipleDialog.prototype.createMultipleDialogRow = function(y, width, contentGroup) {
    let CMD = ConnectMultipleDialog;
    let statusX = 0;
    let index = 0;
    let numberX = statusX + DeviceStatusLight.radius * 2;
    let mainBnX = numberX + CMD.numberWidth;
    let mainBnWidth = width - (RowDialog.smallBnWidth + RowDialog.bnMargin) * 2 - mainBnX;
    let infoBnX = mainBnX + RowDialog.bnMargin + mainBnWidth;
    let removeBnX = infoBnX + RowDialog.bnMargin + RowDialog.smallBnWidth;
    Device.getTypeList().forEach(function(dvcClass) {
        let curDeviceCnt = dvcClass.getManager().getDeviceCount();
        for (let i = 0; i < curDeviceCnt; i++) {
             let robot = dvcClass.getManager().getDevice(i);
             CMD.currentDialog.createStatusLight(robot, statusX, y, contentGroup);
             CMD.currentDialog.createNumberText(index, numberX, y, contentGroup);
             CMD.currentDialog.createMainBn(robot, index, mainBnWidth, mainBnX, y, contentGroup);
             CMD.currentDialog.createInfoBn(robot, index, infoBnX, y, contentGroup);
             CMD.currentDialog.createRemoveBn(robot, index, removeBnX, y, contentGroup);
             y += RowDialog.bnHeight + RowDialog.bnMargin;
             index = index + 1;
        }
    });



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
        (new RobotConnectionList(connectionX, upperY, lowerY, index)).show();
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
        DeviceManager.getDeviceClass(robot).getManager().removeDevice(robot.name);
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

    RowDialog.prototype.show.call(this);
    let count = 0
    Device.getTypeList().forEach(function(dvcClass) {
            count += dvcClass.getManager().getDeviceCount();
        });
    if (count < ConnectMultipleDialog.deviceLimit) {
        this.createConnectBn();
    } else {
        this.addHintText(Language.getStr("Device limit reached"));
        this.createHintText(0,280);
    }
    DeviceHummingbirdBit.getManager().startDiscover(function() {
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
    let curDeviceCnt = 0;
    button.setCallbackFunction(function() {
        // Shows a list of devices to connect
        (new RobotConnectionList(connectionX, upperY, lowerY, null)).show();
    }.bind(this), true);
    Device.getTypeList().forEach(function(dvcClass) {
            curDeviceCnt += dvcClass.getManager().getDeviceCount();
    });

    if (curDeviceCnt >= DeviceManager.maxDevices) {
        button.disable();
    }
    return button;
};

/**
 * Reloads the dialog with the provided device type's tab open, or the last selected type if none is provided
 * @param [deviceClass] - subclass of Device
 */
ConnectMultipleDialog.prototype.reloadDialog = function(deviceClass) {
    if (this.deviceClass == null) {
        this.deviceClass = deviceClass;
    }
    if (deviceClass !== this.deviceClass) {
        // Stop discovery before switching tabs
        this.deviceClass.getManager().stopDiscover();
    }
    let thisScroll = this.getScroll();
    this.hide();
    let dialog = new ConnectMultipleDialog(deviceClass);
    ConnectMultipleDialog.currentDialog = dialog;
    if (ConnectMultipleDialog.currentDialog.deviceClass === null) {
        ConnectMultipleDialog.currentDialog.deviceClass = deviceClass;
    }
    dialog.show();

    dialog.setScroll(thisScroll);

};

/**
 * Closes the dialog and stops discovery
 * @inheritDoc
 */
ConnectMultipleDialog.prototype.closeDialog = function() {
    let CMD = ConnectMultipleDialog;
    RowDialog.prototype.closeDialog.call(this);
    CMD.currentDialog = null;
    DeviceHummingbirdBit.getManager().stopDiscover();
};

/**
 * Reloads the currently open dialog
 */
ConnectMultipleDialog.reloadDialog = function(deviceClass) {
    let curDialog = ConnectMultipleDialog.currentDialog;
    curDialog.reloadDialog(deviceClass);
};

/**
 * Creates and shows a ConnectMultipleDialog with the default tab open
 */
ConnectMultipleDialog.showDialog = function() {
    let CMD = ConnectMultipleDialog;
    if (CMD.currentDialog === null) {
        CMD.currentDialog = new ConnectMultipleDialog(null);
        CMD.currentDialog.show();
    } else {
        CMD.currentDialog.show();
    }
};