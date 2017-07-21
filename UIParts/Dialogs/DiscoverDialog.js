/**
 * Created by Tom on 6/14/2017.
 */

"use strict";

function DiscoverDialog(deviceClass){
	let DD = DiscoverDialog;
	let title = "Connect " + deviceClass.getDeviceTypeName(false);
	RowDialog.call(this, false, title, 0, 0, 0);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.deviceClass = deviceClass;
	this.discoveredDevices = [];
	this.updateTimer = new Timer(DD.updateInterval, this.discoverDevices.bind(this));
	this.addHintText(deviceClass.getConnectionInstructions());
}
DiscoverDialog.prototype = Object.create(RowDialog.prototype);
DiscoverDialog.prototype.constructor = DiscoverDialog;
DiscoverDialog.setConstants = function(){
	DiscoverDialog.updateInterval = 500;
};
DiscoverDialog.prototype.show = function(){
	var DD = DiscoverDialog;
	RowDialog.prototype.show.call(this);
	if(!this.updateTimer.isRunning()) {
		this.updateTimer.start();
		this.discoverDevices();
	}
};
DiscoverDialog.prototype.discoverDevices = function() {
	let me = this;
	this.deviceClass.getManager().startDiscover(function() {
		return this.visible;
	}.bind(this));
	this.deviceClass.getManager().registerDiscoverCallback(this.updateDeviceList.bind(this));
};
DiscoverDialog.prototype.updateDeviceList = function(deviceList){
	if(TouchReceiver.touchDown || !this.visible || this.isScrolling()){
		return;
	}
	this.discoveredDevices = this.deviceClass.getManager().fromJsonArrayString(deviceList);
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
	this.updateTimer.stop();
	this.deviceClass.getManager().stopDiscover();
};