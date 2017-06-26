/**
 * Created by Tom on 6/14/2017.
 */
function Device(name, id){
	this.name = name;
	this.id = id;
	this.status = DeviceManager.statuses.disconnected;
	this.statusListener = null;
}
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
	deviceClass.getNotConnectedMessage = function(){
		return typeName + " not connected";
	};
	var manager = new DeviceManager(deviceClass);
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
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/disconnect");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};
Device.prototype.connect = function(){
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/connect");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};
Device.prototype.setStatus = function(status){
	this.status = status;
	if(this.statusListener != null) this.statusListener.updateStatus(this.status);
	DeviceManager.updateStatus();
};
Device.prototype.getStatus = function(){
	return this.status;
};
Device.prototype.setStatusListener = function(object){
	this.statusListener = object;
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
	var request = new HttpRequestBuilder("devices/stop");
	HtmlServer.sendRequestWithCallback(request.toString());
};