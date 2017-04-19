"use strict";

function HummingbirdMenu(button){
	Menu.call(this,button,true,HummingbirdMenu.width);
	this.addAlternateFn(HummingbirdManager.showConnectMultipleDialog);
	//this.currentHB="";
}
HummingbirdMenu.prototype = Object.create(Menu.prototype);
HummingbirdMenu.prototype.constructor = ViewMenu;
HummingbirdMenu.setGraphics=function(){
	HummingbirdMenu.width=150;
};
HummingbirdMenu.prototype.loadOptions=function(){
	let connectedHBs = HummingbirdManager.getConnectedHBs();
	if(connectedHBs.length > 0){
		var currentHB = connectedHBs[0];
		this.addOption(currentHB.name,function(){},false);
		this.addOption("Rename HB", function(){
			currentHB.promptRename();
		});
		this.addOption("Disconnect HB", function(){
			currentHB.disconnect();
		});
	} else if (FlutterManager.GetDeviceCount() > 0) {
		let firstDevice = FlutterManager.GetConnectedDevices()[0];
		// TODO: Show all connected devices
		this.addOption(firstDevice.getName());
		this.addOption("Disconnect Flutter", function() {
			FlutterManager.DisconnectDevice(firstDevice.getName());
		});
	} else {
		this.addOption("Connect HB", HummingbirdManager.showConnectOneDialog);
		this.addOption("Connect Flutter", FlutterManager.ShowDiscoverDialog);
	}
};
HummingbirdMenu.prototype.previewOpen=function(){
	return (HummingbirdManager.getConnectedHBs().length<=1);
};