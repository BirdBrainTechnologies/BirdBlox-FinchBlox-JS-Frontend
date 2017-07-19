/**
 * Created by Tom on 6/14/2017.
 */
function Device(name, id){
	this.name = name;
	this.id = id;
	this.connected = false;
	this.firmwareStatus = Device.firmwareStatuses.upToDate;
	this.statusListener = null;
	this.firmwareStatusListener = null;
}
Device.setStatics = function(){
	const states = Device.firmwareStatuses = {};
	states.upToDate = "upToDate";
	states.old = "old";
	states.incompatible = "incompatible";
};
Device.setStatics();
Device.setDeviceTypeName = function(deviceClass, typeId, typeName, shortTypeName){
	deviceClass.getDeviceTypeName = function(shorten, maxChars){
		if(shorten || typeName.length > maxChars){
			return shortTypeName;
		} else {
			return typeName;
		}
	};
	deviceClass.getDeviceTypeId = function(){
		return typeId;
	};
	deviceClass.getNotConnectedMessage = function(errorCode, errorResult){
		if(errorResult == null || true) {
			return typeName + " not connected";
		} else {
			return errorResult;
		}
	};
	const manager = new DeviceManager(deviceClass);
	deviceClass.getManager = function(){
		return manager;
	};
	deviceClass.getConnectionInstructions = function(){
		return "Scanning for devices...";
	};
};
Device.prototype.getDeviceTypeName = function(shorten, maxChars){
	return this.constructor.getDeviceTypeName(shorten, maxChars);
};
Device.prototype.getDeviceTypeId = function(){
	return this.constructor.getDeviceTypeId();
};
Device.prototype.disconnect = function(){
	const request = new HttpRequestBuilder(this.getDeviceTypeId() + "/disconnect");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};
Device.prototype.connect = function(){
	const request = new HttpRequestBuilder(this.getDeviceTypeId() + "/connect");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};
Device.prototype.setConnected = function(isConnected){
	this.connected = isConnected;
	if(this.statusListener != null) this.statusListener(this.getStatus());
	DeviceManager.updateStatus();
};
Device.prototype.setFirmwareStatus = function(status) {
	this.firmwareStatus = status;
	if(this.statusListener != null) this.statusListener(this.getStatus());
	if(this.firmwareStatusListener != null) this.firmwareStatusListener(this.getFirmwareStatus());
	DeviceManager.updateStatus();
};
Device.prototype.getStatus = function(){
	const statuses = DeviceManager.statuses;
	const firmwareStatuses = Device.firmwareStatuses;
	if(!this.connected) {
		return statuses.disconnected;
	} else {
		if(this.firmwareStatus === firmwareStatuses.incompatible) {
			return statuses.incompatibleFirmware;
		} else if(this.firmwareStatus === firmwareStatuses.old) {
			return statuses.oldFirmware;
		} else {
			return statuses.connected;
		}
	}
};
Device.prototype.getFirmwareStatus = function(){
	return this.firmwareStatus;
};
Device.prototype.setStatusListener = function(callbackFn){
	this.statusListener = callbackFn;
};
Device.prototype.setFirmwareStatusListener = function(callbackFn){
	this.firmwareStatusListener = callbackFn;
};
Device.prototype.showFirmwareInfo = function(){
	const request = new HttpRequestBuilder("robot/firmware");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};
Device.fromJson = function(deviceClass, json){
	return new deviceClass(json.name, json.id);
};
Device.fromJsonArray = function(deviceClass, json){
	let res = [];
	for(let i = 0; i < json.length; i++){
		res.push(Device.fromJson(deviceClass, json[i]));
	}
	return res;
};
Device.fromJsonArrayString = function(deviceClass, deviceList){
	let json = [];
	try{
		json = JSON.parse(deviceList);
	} catch(e) {
		json = [];
	}
	let list = Device.fromJsonArray(deviceClass, json);
	if(DiscoverDialog.allowVirtualDevices){
		let rand = Math.random() * 20 + 20;
		for(let i = 0; i < rand; i++) {
			let name = "Virtual " + deviceClass.getDeviceTypeName(true);
			list.push(new deviceClass(name + i, "virtualDevice" + i));
		}
	}
	return list;
};
Device.getTypeList = function(){
	return [DeviceHummingbird, DeviceFlutter];
};
Device.stopAll = function(){
	const request = new HttpRequestBuilder("devices/stop");
	HtmlServer.sendRequestWithCallback(request.toString());
};