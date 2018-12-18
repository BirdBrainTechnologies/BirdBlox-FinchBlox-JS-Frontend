/**
 * Top bar menu used to view battery statuses for all connected devices
 * @param {Button} button
 * @constructor
 */
function BatteryMenu(button) {
    this.offsetX = button.x + BatteryMenu.iconX + TitleBar.buttonMargin;
	Menu.call(this, button, BatteryMenu.width);
  this.addAlternateFn(function() {});
}
BatteryMenu.prototype = Object.create(Menu.prototype);
BatteryMenu.prototype.constructor = BatteryMenu;

BatteryMenu.prototype.loadOptions = function() {
    let deviceTypeList = Device.getTypeList();
    let deviceTypeLen = deviceTypeList.length;
    for (var i = 0; i < deviceTypeLen; i++) {
           let manager = deviceTypeList[i].getManager();
           var curBatteryStatus = "3";
           for (var j = 0; j < manager.getDeviceCount(); j++) {
               let robot = manager.connectedDevices[j];
               this.addOption(robot.shortName, null);
           }
    }
};
BatteryMenu.setGraphics = function() {
	BatteryMenu.width = 150;
	BatteryMenu.iconX = BatteryMenu.width - 5;
//	BatteryMenu.maxDeviceNameChars = 8;
};

BatteryMenu.getColorForBatteryStatus = function(status) {
    if (status === "2") {
        return Colors.green;
    } else if (status === "1") {
        return Colors.yellow;
    } else if (status === "0") {
        return Colors.red;
    } else {
        return Colors.lightGray;
    }
}

/**
 * Determines whether multiple devices are connected, in which case the menu should be opened.
 * @inheritDoc
 * @return {boolean}
 */
BatteryMenu.prototype.previewOpen = function() {
	let connectionCount = 0;
	Device.getTypeList().forEach(function(deviceClass) {
		connectionCount += deviceClass.getManager().getDeviceCount();
	});
	return (connectionCount > 1);
};
