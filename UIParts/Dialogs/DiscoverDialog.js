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
	this.addHintText(deviceClass.getConnectionInstructions());
	this.updatePending = false;
	this.updateTimer = new Timer(1000, this.checkPendingUpdate.bind(this));
}
DiscoverDialog.prototype = Object.create(RowDialog.prototype);
DiscoverDialog.prototype.constructor = DiscoverDialog;
DiscoverDialog.prototype.show = function(){
	const DD = DiscoverDialog;
	RowDialog.prototype.show.call(this);
	this.discoverDevices();
};
DiscoverDialog.prototype.discoverDevices = function() {
	let me = this;
	this.deviceClass.getManager().startDiscover(function() {
		return this.visible;
	}.bind(this));
	this.deviceClass.getManager().registerDiscoverCallback(this.updateDeviceList.bind(this));
};
DiscoverDialog.prototype.checkPendingUpdate = function(){
	if(this.updatePending){
		this.updateDeviceList(this.deviceClass.getManager().getDiscoverCache());
	}
};
DiscoverDialog.prototype.updateDeviceList = function(deviceList){
	if(!this.visible) {
		this.updatePending = true;
		this.updateTimer.start();
		return;
	}
	else if(TouchReceiver.touchDown || this.isScrolling()){
		return;
	}
	this.updatePending = false;
	this.updateTimer.stop();
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
	this.deviceClass.getManager().stopDiscover();
};