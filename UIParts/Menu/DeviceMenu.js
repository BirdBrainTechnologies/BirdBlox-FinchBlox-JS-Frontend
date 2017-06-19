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
		var currentDevice = connectedClass.getManager().getDevice(0);
		this.addOption(currentDevice.name,function(){},false);
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
DeviceMenu.prototype.previewOpen=function(){
	let connectionCount = 0;
	Device.getTypeList().forEach(function(deviceClass){
		connectionCount += deviceClass.getManager().getDeviceCount();
	});
	return (connectionCount<=1);
};