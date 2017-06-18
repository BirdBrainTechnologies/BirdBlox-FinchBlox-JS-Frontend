/**
 * Created by Tom on 6/14/2017.
 */

"use strict";

function DiscoverDialog(deviceClass){
	let title = "Connect " + deviceClass.getDeviceTypeName(false);
	RowDialog.call(this, false, title, 0, 0, 0);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.deviceClass = deviceClass;
	this.discoveredDevices = [];
	this.timerSet = false;
	this.addHintText(deviceClass.getConnectionInstructions());
}
DiscoverDialog.prototype = Object.create(RowDialog.prototype);
DiscoverDialog.prototype.constructor = DiscoverDialog;
DiscoverDialog.setConstants = function(){
	DiscoverDialog.updateInterval = 500;
	DiscoverDialog.allowVirtualDevices = false;
};
DiscoverDialog.prototype.show = function(){
	var DD = DiscoverDialog;
	RowDialog.prototype.show.call(this);
	if(!this.timerSet) {
		this.timerSet = true;
		this.updateTimer = self.setInterval(this.discoverDevices.bind(this), DD.updateInterval);
	}
};
DiscoverDialog.prototype.discoverDevices = function() {
	var request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/discover");
	var me = this;
	HtmlServer.sendRequestWithCallback(request.toString(), this.updateDeviceList.bind(this), function(){
		if(DiscoverDialog.allowVirtualDevices) {
			let prefix = "Virtual " + me.deviceClass.getDeviceTypeName(true) + " ";
			let obj1 = {};
			let obj2 = {};
			obj1.name = prefix + "1";
			obj2.name = prefix + "2";
			obj1.id = "virtualDevice1";
			obj2.id = "virtualDevice2";
			let arr = [obj1, obj2];
			me.updateDeviceList(JSON.stringify(arr));
		}
	});
};
DiscoverDialog.prototype.updateDeviceList = function(deviceList){
	if(TouchReceiver.touchDown || !this.visible || this.isScrolling()){
		return;
	}
	var json = "[]";
	try{
		json = JSON.parse(deviceList);
	} catch(e) {

	}
	this.discoveredDevices = Device.fromJsonArray(this.deviceClass, json);
	if(DiscoverDialog.allowVirtualDevices){
		let rand = Math.random() * 20 + 20;
		for(let i = 0; i < rand; i++) {
			let name = "Virtual " + this.deviceClass.getDeviceTypeName(true);
			this.discoveredDevices.push(new this.deviceClass(name + i, "virtualDevice"));
		}
	}
	this.reloadRows(this.discoveredDevices.length);
};
DiscoverDialog.prototype.createRow = function(index, y, width, contentGroup){
	var button = new Button(0, y, width, RowDialog.bnHeight, contentGroup);
	button.addText(this.discoveredDevices[index].name);
	var me = this;
	button.setCallbackFunction(function(){
		me.selectDevice(me.discoveredDevices[index]);
	}, true);
	button.makeScrollable();
};
DiscoverDialog.prototype.selectDevice = function(device){
	this.deviceClass.getManager().setOneDevice(device);
	this.closeDialog();
};
DiscoverDialog.prototype.closeDialog = function(){
	RowDialog.prototype.closeDialog.call(this);
	if(this.timerSet) {
		this.timerSet = false;
		this.updateTimer = window.clearInterval(this.updateTimer);
	}
};