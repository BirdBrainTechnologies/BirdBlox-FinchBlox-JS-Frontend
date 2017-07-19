"use strict";

function DeviceMenu(button){
	Menu.call(this,button,DeviceMenu.width);
	this.addAlternateFn(function(){
		ConnectMultipleDialog.showDialog();
	});
}
DeviceMenu.prototype = Object.create(Menu.prototype);
DeviceMenu.prototype.constructor = ViewMenu;
DeviceMenu.setGraphics=function(){
	DeviceMenu.width=150;
	DeviceMenu.maxDeviceNameChars = 8;
};
DeviceMenu.prototype.loadOptions=function(){
	let connectedClass = null;
	Device.getTypeList().forEach(function(deviceClass){
		if(deviceClass.getManager().getDeviceCount() > 0){
			connectedClass = deviceClass;
		}
	});
	if(connectedClass != null){
		this.addDeviceOption(connectedClass);
		this.addOption("Disconnect " + connectedClass.getDeviceTypeName(false, DeviceMenu.maxDeviceNameChars), function(){
			connectedClass.getManager().removeAllDevices();
		});
	} else {
		Device.getTypeList().forEach(function(deviceClass){
			this.addOption("Connect " + deviceClass.getDeviceTypeName(false, DeviceMenu.maxDeviceNameChars), function(){
				(new DiscoverDialog(deviceClass)).show();
			});
		}, this);
	}
	this.addOption("Connect Multiple", ConnectMultipleDialog.showDialog);
};
DeviceMenu.prototype.addDeviceOption = function(connectedClass){
	const device = connectedClass.getManager().getDevice(0);
	const status = device.getFirmwareStatus();
	const statuses = Device.firmwareStatuses;
	let icon = null;
	let color = null;
	if(status === statuses.old) {
		icon = VectorPaths.warning;
		color = DeviceStatusLight.yellowColor;
	} else if(status === statuses.incompatible) {
		icon = VectorPaths.warning;
		color = DeviceStatusLight.redColor;
	}
	this.addOption("",device.showFirmwareInfo.bind(device),false, this.createAddIconToBnFn(icon, device.name, color));
};
DeviceMenu.prototype.previewOpen=function(){
	let connectionCount = 0;
	Device.getTypeList().forEach(function(deviceClass){
		connectionCount += deviceClass.getManager().getDeviceCount();
	});
	return (connectionCount<=1);
};
DeviceMenu.prototype.createAddIconToBnFn = function(iconId, text, color) {
	if(iconId == null){
		return function(bn) {
			bn.addText(text);
		}
	}
	return function(bn) {
		bn.addSideTextAndIcon(iconId, null, text, null, null, null, null, null, color, true, false);
	}
};