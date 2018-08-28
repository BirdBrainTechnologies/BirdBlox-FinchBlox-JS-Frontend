/**
 * Top bar menu used to view battery statuses for all connected devices
 * @param {Button} button
 * @constructor
 */
function BatteryMenu(button) {
    this.offsetX = button.x + BatteryMenu.iconX + TitleBar.buttonMargin;
	Menu.call(this, button, BatteryMenu.width);
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
               var words = robot.name.split(" ");
               var newName = "";
               var color = Colors.lightGray;
               for (var k = 0; k < words.length; k++) {
                   newName += words[k][0];
               };
               this.addOption(newName, null);
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
        return "#0f0";
    } else if (status === "1") {
        return "#ff0";
    } else if (status === "0") {
        return "#f00";
    } else {
        return Colors.lightGray;
    }
}
