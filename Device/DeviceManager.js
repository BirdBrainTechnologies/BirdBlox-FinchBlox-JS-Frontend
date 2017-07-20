/**
 * Each Device subclass has a DeviceManager to manage connections with robots of that type.  The DeviceManager stores
 * all the connected devices in an array, which can be accessed through the getDevice function, which is how
 * robot Blocks get an instance of Device to send their request.  The DeviceManger is also used by the
 * ConnectMultipleDialog and the CallbackManger to lookup information.  THe DeviceManager notifies CodeManger when
 * the connected devices change, so Blocks on the canvas can update their appearance.
 *
 * @param deviceClass - subclass of Device
 * @constructor
 */
function DeviceManager(deviceClass) {
	this.deviceClass = deviceClass;
	this.connectedDevices = [];
	/** @type {DeviceManager.statuses} */
	this.connectionStatus = DeviceManager.statuses.noDevices;

	/* The number of devices listed in each DeviceDropSlot to select from.  Determined when updateSelectableDevices
	 * is called. */
	this.selectableDevices = 0;
}

DeviceManager.setStatics = function() {
	const DM = DeviceManager;

	/** @enum {number} */
	const statuses = DeviceManager.statuses = {
		// Ordered such that the total status is just Math.min of the individual statuses
		disconnected: 0,
		incompatibleFirmware: 1,
		oldFirmware: 2,
		connected: 3,
		noDevices: 4
	};

	/* Stores the overall status of Devices controlled by this DeviceManager combined */
	DM.totalStatus = statuses.noDevices;

	/* Stores a function that is called every time the totalStatus changes */
	DM.statusListener = null;
};
DeviceManager.setStatics();

/**
 * Retrieves the number of devices in this.connectedDevices
 * @return {number}
 */
DeviceManager.prototype.getDeviceCount = function() {
	return this.connectedDevices.length;
};

/**
 * Gets a device from this.connectedDevices or returns null if the index is out of bounds
 * @param {number} index
 * @return {Device|null}
 */
DeviceManager.prototype.getDevice = function(index) {
	if (index >= this.getDeviceCount()) return null;
	return this.connectedDevices[index];
};

/**
 * Called to replace a device as the current index with a different device. Issues a Bluetooth connection request
 * to the new device and a disconnection request to the old device.
 * TODO: make switching places of two connected devices easier
 * @param {number} index - Index of device to replace. Must be in bounds.
 * @param {Device} newDevice
 */
DeviceManager.prototype.setDevice = function(index, newDevice) {
	DebugOptions.assert(index < this.getDeviceCount());
	this.connectedDevices[index].disconnect();
	newDevice.connect();
	this.connectedDevices[index] = newDevice;
	this.devicesChanged();
};

/**
 * Issues a disconnect request to the device at the index and removes it from the list
 * @param {number} index
 */
DeviceManager.prototype.removeDevice = function(index) {
	DebugOptions.assert(index < this.getDeviceCount());
	this.connectedDevices[index].disconnect();
	this.connectedDevices.splice(index, 1);
	this.devicesChanged();
};

/**
 * Issues a connect request to the Device and add it to the end of the list
 * @param {Device} newDevice
 */
DeviceManager.prototype.appendDevice = function(newDevice) {
	newDevice.connect();
	this.connectedDevices.push(newDevice);
	this.devicesChanged();
};

/**
 * Disconnects all devices and connects to the newDevice, making it the only Device on the list
 * @param {Device} newDevice
 */
DeviceManager.prototype.setOneDevice = function(newDevice) {
	for (let i = 0; i < this.connectedDevices.length; i++) {
		this.connectedDevices[i].disconnect();
	}
	newDevice.connect();
	this.connectedDevices = [newDevice];
	this.devicesChanged();
};

/**
 * Disconnects from all the devices, making the list empty
 */
DeviceManager.prototype.removeAllDevices = function() {
	this.connectedDevices.forEach(function(device) {
		device.disconnect();
	});
	this.connectedDevices = [];
	this.devicesChanged();
};

/**
 * Determines whether the device at the specified exists and is in good communication with the backend
 * @param {number} index
 * @return {boolean} - true iff the index is valid and the device has usable firmware and is connected
 */
DeviceManager.prototype.deviceIsConnected = function(index) {
	if (index >= this.getDeviceCount()) {
		return false;
	} else {
		const deviceStatus = this.connectedDevices[index].getStatus();
		const statuses = DeviceManager.statuses;
		return deviceStatus === statuses.connected || deviceStatus === statuses.oldFirmware;
	}
};

/**
 * Counts the number of devices that should be able to be selected from a DeviceDropSlot and updates the UI to reflect
 * this.  Also collapses/expands parts of the Palette accordingly.  The number of selectable devices is the Math.max
 * of the number of devices currently in use (the maximum selected robot on any existing DeviceDropSlot) and
 * the number of devices currently connected.  This ensures the user can access all the devices currently connected
 * as well as modify existing programs that may use more devices than the currently connected number.
 */
DeviceManager.prototype.updateSelectableDevices = function() {
	const oldCount = this.selectableDevices;
	const inUse = CodeManager.countDevicesInUse(this.deviceClass);
	const numConnected = this.getDeviceCount();
	const newCount = Math.max(numConnected, inUse);
	this.selectableDevices = newCount;

	if (newCount <= 1 && oldCount > 1) {
		CodeManager.hideDeviceDropDowns(this.deviceClass);
	} else if (newCount > 1 && oldCount <= 1) {
		CodeManager.showDeviceDropDowns(this.deviceClass);
	}

	// Sections of the palette are expanded if the count > 0
	const suggestedCollapse = newCount === 0;
	BlockPalette.setSuggestedCollapse(this.deviceClass.getDeviceTypeId(), suggestedCollapse);
};

/**
 * Retrieves the number of devices that should be listed in each DeviceDropSlot
 * @return {number}
 */
DeviceManager.prototype.getSelectableDeviceCount = function() {
	return this.selectableDevices;
};

/**
 * Called from other DeviceManager functions to alert the UI that the connected devices have changed
 */
DeviceManager.prototype.devicesChanged = function() {
	ConnectMultipleDialog.reloadDialog();
	this.updateSelectableDevices();
	DeviceManager.updateStatus();
};

/**
 * Attempts to find the index of the robot with the specified id. Returns -1 if the robot is not found
 * @param {string} id
 * @return {number}
 */
DeviceManager.prototype.lookupRobotIndexById = function(id) {
	for (let i = 0; i < this.connectedDevices.length; i++) {
		if (this.connectedDevices[i].id === id) {
			return i;
		}
	}
	return -1;
};

/**
 * Issues a request to determine which robots (of this type) are currently available to connect to
 * @param {function} [callbackFn] - type Array<Device> -> (),  called with the list of Devices
 * @param {function} [callbackErr] - called if an error occurs sending the request
 * @param {boolean} [includeConnected=false] - Indicates whether devices that are currently connected should also be included
 * @param {string|null} [excludeId=null] - An id of a Device to exclude from the list. Ignored if null
 */
DeviceManager.prototype.discover = function(callbackFn, callbackErr, includeConnected, excludeId) {
	if (includeConnected == null) {
		includeConnected = false;
	}
	if (excludeId == null) {
		excludeId = null;
	}
	/* If virtual devices are enabled for debugging and there's an error with the request, we pretend there wasn't
	 * an error and return a list of virtual devices */
	if (DebugOptions.shouldAllowVirtualDevices() && callbackFn != null) {
		callbackErr = function() {
			callbackFn(this.createVirtualDeviceList())
		}.bind(this);
	}
	let request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/discover");
	HtmlServer.sendRequestWithCallback(request.toString(), function(response) {
		if (callbackFn == null) return;

		// Get the devices from the request
		let robotList = Device.fromJsonArrayString(this.deviceClass, response);
		// Accumulate devices that are not currently connected
		let disconnectedRobotsList = [];
		robotList.forEach(function(robot) {
			// Try to find the device
			let connectedRobotIndex = this.lookupRobotIndexById(robot.id);
			// Only include the device if we didn't find it and it isn't the excludeId robot
			if (connectedRobotIndex === -1 && (excludeId == null || excludeId !== robot.id)) {
				// Include the device in the list
				disconnectedRobotsList.push(robot);
			}
		}.bind(this));

		// If we're including connected devices, add them at the top
		let newList = disconnectedRobotsList;
		if (includeConnected) {
			newList = this.connectedDevices.concat(robotList);
		}
		if (DebugOptions.shouldAllowVirtualDevices()) {
			newList = newList.concat(this.createVirtualDeviceList());
		}

		// Run the callback with the results
		callbackFn(newList);
	}.bind(this), callbackErr);
};

/**
 * Issues a request to tell the backend to stop scanning for devices. Called when a discover dialog is closed
 * TODO: change backend to this doesn't need to be called when switching between Flutter/Hummingbird tabs
 * @param {function} callbackFn
 * @param {function} callbackErr
 */
DeviceManager.prototype.stopDiscover = function(callbackFn, callbackErr) {
	let request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/stopDiscover");
	HtmlServer.sendRequestWithCallback(request.toString(), callbackFn, callbackErr);
};

/**
 * Returns a list of 20 - 40 virtual robots.  Virtual robots are used for debugging.
 * @return {Array<Device>}
 */
DeviceManager.prototype.createVirtualDeviceList = function() {
	let list = [];
	let rand = Math.random() * 20 + 20;
	for (let i = 0; i < rand; i++) {
		list.push(DebugOptions.createVirtualDevice(this.deviceClass, i + ""));
	}
	return list;
};

/**
 * Looks for the specified device and sets whether it is connected (if found)
 * @param {string} deviceId
 * @param {boolean} isConnected - Whether the robot is currently in good communication with the backend
 */
DeviceManager.prototype.updateConnectionStatus = function(deviceId, isConnected) {
	const index = this.lookupRobotIndexById(deviceId);
	let robot = null;
	if (index >= 0) {
		robot = this.connectedDevices[index];
	}
	if (robot != null) {
		robot.setConnected(isConnected);
	}
};

/**
 * Looks for the specified device and sets its firmware status (if found)
 * @param {string} deviceId
 * @param {Device.firmwareStatuses} status
 */
DeviceManager.prototype.updateFirmwareStatus = function(deviceId, status) {
	const index = this.lookupRobotIndexById(deviceId);
	let robot = null;
	if (index >= 0) {
		robot = this.connectedDevices[index];
	}
	if (robot != null) {
		robot.setFirmwareStatus(status);
	}
};

/**
 * Computes, stores, and returns this DeviceManager's connectionStatus
 * @return {DeviceManager.statuses}
 */
DeviceManager.prototype.getStatus = function() {
	const statuses = DeviceManager.statuses;
	let status = statuses.noDevices;
	this.connectedDevices.forEach(function(device) {
		status = Math.min(status, device.getStatus());
	});
	this.connectionStatus = status;
	return this.connectionStatus;
};

/**
 * Allows for easy iteration of DeviceManagers by calling callbackFn on every Device subclass's manager
 * @param {function} callbackFn - type DeviceManager -> (), to be called on every DeviceManager
 */
DeviceManager.forEach = function(callbackFn) {
	Device.getTypeList().forEach(function(deviceType) {
		callbackFn(deviceType.getManager());
	});
};

/**
 * Tells all managers to update their selectable devices
 */
DeviceManager.updateSelectableDevices = function() {
	DeviceManager.forEach(function(manager) {
		manager.updateSelectableDevices();
	});
};

/**
 * Finds the robot with the given deviceId and sets its connected status, then updates the UI to reflect any changes
 * @param {string} deviceId
 * @param {boolean} isConnected - Whether the robot is in good communication with the backend
 */
DeviceManager.updateConnectionStatus = function(deviceId, isConnected) {
	DeviceManager.forEach(function(manager) {
		manager.updateConnectionStatus(deviceId, isConnected);
	});
	CodeManager.updateConnectionStatus();
};

/**
 * Finds the robot with the given deviceId and sets its firmware status, then updates the UI to reflect any changes
 * @param {string} deviceId
 * @param {Device.firmwareStatuses} status
 */
DeviceManager.updateFirmwareStatus = function(deviceId, status) {
	DeviceManager.forEach(function(manager) {
		manager.updateFirmwareStatus(deviceId, status);
	});
	CodeManager.updateConnectionStatus();
};

/**
 * Computes the total status of all DeviceManagers and updates the statusListener
 */
DeviceManager.updateStatus = function() {
	const DM = DeviceManager;
	let totalStatus = DM.getStatus();
	if (DM.statusListener != null) DM.statusListener(totalStatus);
	return totalStatus;
};

/**
 * Computes the total status of all DeviceManagers and returns the result
 * @return {DeviceManager.statuses}
 */
DeviceManager.getStatus = function() {
	let DM = DeviceManager;
	let minStatus = DM.statuses.noDevices;
	DM.forEach(function(manager) {
		minStatus = DM.minStatus(manager.getStatus(), minStatus);
	});
	DM.totalStatus = minStatus;
	return minStatus;
};

/**
 * Given two statuses, combines them into one status
 * @param {DeviceManager.statuses} status1
 * @param {DeviceManager.statuses} status2
 * @return {DeviceManager.statuses}
 */
DeviceManager.minStatus = function(status1, status2) {
	/* The values in DeviceManager.statuses have been ordered such that they can be combined with Math.min */
	return Math.min(status1, status2);
};

/**
 * Assigns the statusListener that listens for changes in total status.  Used for the total status light
 * @param {function} callbackFn - Called with the new status whenever the status changes
 */
DeviceManager.setStatusListener = function(callbackFn) {
	DeviceManager.statusListener = callbackFn;
};