/**
 * Created by Tom on 6/14/2017.
 */
function DeviceManager(deviceClass){
	this.deviceClass = deviceClass;
	this.connectedDevices = [];
	this.connectionStatus = DeviceManager.statuses.noDevices;
	// 0 - At least 1 disconnected
	// 1 - Every device is OK
	// 2 - Nothing connected
	this.selectableDevices = 0;
}
DeviceManager.setStatics = function(){
	const DM = DeviceManager;
	const statuses = DeviceManager.statuses = {};
	statuses.disconnected = 0;
	statuses.connected = 1;
	statuses.noDevices = 2;
	DM.totalStatus = statuses.noDevices;
	DM.statusListener = null;
};
DeviceManager.setStatics();
DeviceManager.prototype.getDeviceCount = function() {
	return this.connectedDevices.length;
};
DeviceManager.prototype.getDevice = function(index){
	if(index >= this.getDeviceCount()) return null;
	return this.connectedDevices[index];
};
DeviceManager.prototype.setDevice = function(index, newDevice){
	DebugOptions.assert(index < this.getDeviceCount());
	this.connectedDevices[index].disconnect();
	newDevice.connect();
	this.connectedDevices[index] = newDevice;
	this.devicesChanged();
};
DeviceManager.prototype.removeDevice = function(index){
	this.connectedDevices[index].disconnect();
	this.connectedDevices.splice(index, 1);
	this.devicesChanged();
};
DeviceManager.prototype.appendDevice = function(newDevice){
	newDevice.connect();
	this.connectedDevices.push(newDevice);
	this.devicesChanged();
};
DeviceManager.prototype.setOneDevice = function(newDevice){
	for(let i = 0; i<this.connectedDevices.length; i++){
		this.connectedDevices[i].disconnect();
	}
	newDevice.connect();
	this.connectedDevices = [newDevice];
	this.devicesChanged();
};
DeviceManager.prototype.removeAllDevices = function(){
	this.connectedDevices.forEach(function(device){
		device.disconnect();
	});
	this.connectedDevices = [];
	this.devicesChanged();
};
DeviceManager.prototype.updateTotalStatus = function(){
	if(this.getDeviceCount() == 0){
		this.connectionStatus = 2;
		return;
	}
	var request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/totalStatus");
	var me = this;
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		me.connectionStatus = parseInt(result);
		if (isNaN(me.connectionStatus)) {
			me.connectionStatus = 0;
		}
	});
};
DeviceManager.prototype.getTotalStatus = function(){
	return this.connectionStatus;
};
DeviceManager.prototype.deviceIsConnected = function(index){
	if(index >= this.getDeviceCount()) {
		return false;
	}
	else {
		return this.connectedDevices[index].getStatus() === DeviceManager.statuses.connected;
	}
};
DeviceManager.prototype.updateSelectableDevices = function(){
	var oldCount=this.selectableDevices;
	var inUse=CodeManager.countDevicesInUse(this.deviceClass);
	var newCount=Math.max(this.getDeviceCount(), inUse);
	this.selectableDevices=newCount;
	if(newCount<=1&&oldCount>1){
		CodeManager.hideDeviceDropDowns(this.deviceClass);
	}
	else if(newCount>1&&oldCount<=1){
		CodeManager.showDeviceDropDowns(this.deviceClass);
	}

	const suggestedCollapse = newCount === 0;
	BlockPalette.setSuggestedCollapse(this.deviceClass.getDeviceTypeId(), suggestedCollapse);
};
DeviceManager.prototype.getSelectableDeviceCount=function(){
	return this.selectableDevices;
};
DeviceManager.prototype.devicesChanged = function(){
	ConnectMultipleDialog.reloadDialog();
	this.updateSelectableDevices();
	DeviceManager.updateStatus();
};
DeviceManager.prototype.lookupRobotIndexById = function(id){
	for(let i = 0; i < this.connectedDevices.length; i++){
		if(this.connectedDevices[i].id === id){
			return i;
		}
	}
	return -1;
};
DeviceManager.prototype.discover = function(callbackFn, callbackErr, includeConnected, excludeId){
	if(includeConnected == null){
		includeConnected = false;
	}
	if(excludeId == null){
		excludeId = null;
	}
	let request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/discover");
	HtmlServer.sendRequestWithCallback(request.toString(), function(response){
		if(callbackFn == null) return;
		let robotList = Device.fromJsonArrayString(this.deviceClass, response);
		let disconnectedRobotsList = [];
		robotList.forEach(function(robot){
			let connectedRobotIndex = this.lookupRobotIndexById(robot.id);
			if(connectedRobotIndex === -1 && (excludeId == null || excludeId !== robot.id))
				disconnectedRobotsList.push(robot);
		}.bind(this));
		let newList = disconnectedRobotsList;
		if(includeConnected){
			newList = this.connectedDevices.concat(robotList);
		}
		callbackFn(newList);
	}.bind(this), callbackErr);
};
DeviceManager.prototype.stopDiscover = function(callbackFn, callbackErr){
	let request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/stopDiscover");
	HtmlServer.sendRequestWithCallback(request.toString(), callbackFn, callbackErr);
};
DeviceManager.prototype.getVirtualRobotList = function(){
	let prefix = "Virtual " + this.deviceClass.getDeviceTypeName(true) + " ";
	const robot1 = new this.deviceClass(prefix + "1", "virtualDevice1");
	const robot2 = new this.deviceClass(prefix + "2", "virtualDevice2");
	return [robot1, robot2];
};
DeviceManager.prototype.updateConnectionStatus = function(deviceId, status){
	const index = this.lookupRobotIndexById(deviceId);
	let robot = null;
	if(index >= 0) {
		robot = this.connectedDevices[index];
	}
	if(robot != null){
		const statuses = DeviceManager.statuses;
		robot.setStatus(status? statuses.connected : statuses.disconnected);
	}
};
DeviceManager.prototype.getStatus = function(){
	const statuses = DeviceManager.statuses;
	let disconnected = false;
	let hasDevice = this.connectedDevices.length > 0;
	this.connectedDevices.forEach(function(device){
		disconnected = disconnected || device.getStatus() === DeviceManager.statuses.disconnected;
	});
	if(!hasDevice){
		this.connectionStatus = statuses.noDevices;
	} else if(disconnected) {
		this.connectionStatus = statuses.disconnected;
	} else {
		this.connectionStatus = statuses.connected;
	}
	return this.connectionStatus;
};
DeviceManager.updateSelectableDevices = function(){
	DeviceManager.forEach(function(manager){
		manager.updateSelectableDevices();
	});
};
DeviceManager.updateConnectionStatus = function(deviceId, status){
	DeviceManager.forEach(function(manager){
		manager.updateConnectionStatus(deviceId, status);
	});
	CodeManager.updateConnectionStatus();
};
DeviceManager.updateStatus = function(){
	const DM = DeviceManager;
	let totalStatus = DM.getStatus();
	if(DM.statusListener != null) DM.statusListener.updateStatus(totalStatus);
	return totalStatus;
};
DeviceManager.getStatus = function(){
	let DM = DeviceManager;
	let minStatus = DM.statuses.noDevices;
	DM.forEach(function(manager){
		minStatus = DM.minStatus(manager.getStatus(), minStatus);
	});
	DM.totalStatus = minStatus;
	return minStatus;
};
DeviceManager.minStatus = function(status1, status2) {
	return Math.min(status1, status2);
};
DeviceManager.forEach = function(callbackFn){
	Device.getTypeList().forEach(function(deviceType){
		callbackFn(deviceType.getManager());
	});
};
DeviceManager.setStatusListener = function(object){
	DeviceManager.statusListener = object;
};