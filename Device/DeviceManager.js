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

	/* Whether a scan is currently running */
	this.scanning = false;

	/** @type {function|null} - A function to call when new devices are discovered */
	this.deviceDiscoverCallback = null;
	/** @type {function|null} - A function to call to determine if a new scan should be run when the scan stops
	 * Often checks if a dialog for that device type is currently open */
	this.renewDiscoverFn = null;
	/** @type {string|null} - A cache of the scan results, updated through callbacks from the backend */
	this.discoverCache = null;
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
    DM.batteryCheckInterval = 1000;
	/* Stores a function that is called every time the totalStatus changes */
	DM.statusListener = null;
	DM.batteryChecker = self.setInterval(function() {
    		DeviceManager.checkBattery();
    }, DM.batteryCheckInterval);
	/* The maximum number of devices that can be connected at one time */
	DM.maxDevices = 4;
};
DeviceManager.setStatics();


DeviceManager.checkBattery = function() {
    var worstBatteryStatus = "3";
    var curBatteryStatus = "";
    var color = Colors.lightGray;
    DeviceManager.forEach(function(manager) {
        for (var i = 0; i < manager.connectedDevices.length; i++) {
            let robot = manager.connectedDevices[i];
            curBatteryStatus = robot.getBatteryStatus();
            if (parseInt(curBatteryStatus,10) < parseInt(worstBatteryStatus,10)) {
                worstBatteryStatus = curBatteryStatus;
            }
        }
    });
    if (worstBatteryStatus === "2") {
        color = "#0f0";
    } else if (worstBatteryStatus === "1") {
        color = "#ff0";
    } else if (worstBatteryStatus === "0"){
        color = "#f00";
    }
    TitleBar.batteryBn.icon.setColor(color);
}
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
	this.devicesChanged(this.getDeviceClass(newDevice), true);
};

DeviceManager.prototype.getDeviceClass = function(robot) {
   if (robot.device === "micro:bit") {
       return DeviceMicroBit;
   } else if (robot.device === "Bit") {
       return DeviceHummingbirdBit;
   } else if (robot.device === "Duo") {
       return DeviceHummingbird;
   }
};

DeviceManager.getDeviceClass = function(robot) {
    if (robot.device === "micro:bit") {
        return DeviceMicroBit;
    } else if (robot.device === "Bit") {
        return DeviceHummingbirdBit;
    } else if (robot.device === "Duo") {
        return DeviceHummingbird;
    }
}

/**
 * Issues a disconnect request to the device at the index and removes it from the list
 * @param {number} index
 */
DeviceManager.prototype.removeDevice = function(robotName) {
    let removedIndex = -1;
	for (let index = 0; index < this.getDeviceCount(); index++) {
	    if (this.connectedDevices[index].name === robotName) {
	        this.connectedDevices[index].disconnect();
	        removedIndex = index;
	        break;
	    }
	}
	if (removedIndex !== -1) {
        this.connectedDevices.splice(removedIndex, 1);
        this.devicesChanged(null, true);
    }
};

/**
 * Issues a connect request to the Device and add it to the end of the list
 * @param {Device} newDevice
 */
DeviceManager.prototype.appendDevice = function(newDevice) {
	newDevice.connect();
	this.connectedDevices.push(newDevice);
	this.devicesChanged(this.getDeviceClass(newDevice), true);
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
	this.devicesChanged(null, false);
};

/**
 * Swaps the the devices at the specified indices of the connectedDevices list. Requires that both devices are already
 * connected.
 * @param {number} index1
 * @param {number} index2
 */
DeviceManager.prototype.swapDevices = function(index1, index2) {
	const device1 = this.connectedDevices[index1];
	const device2 = this.connectedDevices[index2];
	this.connectedDevices[index1] = device2;
	this.connectedDevices[index2] = device1;
	this.devicesChanged(null, false);
};

/**
 * If newDevice is not already connected, connects to it and replaces the device at the specified index
 * If the newDevice is already connected, swaps the positions of it and the device at the specified index
 * @param index
 * @param newDevice
 */
DeviceManager.prototype.setOrSwapDevice = function(index, newDevice) {
	const newIndex = this.lookupRobotIndexById(newDevice.id);
	if (newIndex > -1) {
		this.swapDevices(index, newIndex);
	} else {
		this.setDevice(index, newDevice);
	}
};

/**
 * Disconnects from all the devices, making the list empty
 */
DeviceManager.prototype.removeAllDevices = function() {
	this.connectedDevices.forEach(function(device) {
		device.disconnect();
	});
	this.connectedDevices = [];
	this.devicesChanged(null, false);
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
DeviceManager.prototype.devicesChanged = function(deviceClass, multiple) {
    if (multiple) {
        if (deviceClass != null) {
            ConnectMultipleDialog.reloadDialog(deviceClass);
        } else {
            ConnectMultipleDialog.reloadDialog();
        }
    }
	this.updateSelectableDevices();
	DeviceManager.updateStatus();
	CodeManager.updateConnectionStatus();
};

/**
 * Start scanning if not scanning already
 * @param {function} [renewDiscoverFn] - type () -> boolean, called to determine if a scan should be restarted.
 */
DeviceManager.prototype.startDiscover = function(renewDiscoverFn) {
	this.renewDiscoverFn = renewDiscoverFn;
	if(!this.scanning) {
		this.scanning = true;
		this.discoverCache = null;

		let request = new HttpRequestBuilder("robot/startDiscover");
		HtmlServer.sendRequestWithCallback(request.toString());
	}
};

/**
 * Adds a function to the DeviceManager which is called with a list of devices whenever devices are discovered
 * @param {function} callbackFn - type: string -> (), function provided by UI part
 */
DeviceManager.prototype.registerDiscoverCallback = function(callbackFn) {
	this.deviceDiscoverCallback = callbackFn;
};

/**
 * Retrieves the list of devices that was discovered during the current scan, or null if no scan results are available
 * used for the ConnectMultipleDialog when the used opens a RobotConnectionList
 * @return {null|string} - A JSON Array as a string or null
 */
DeviceManager.prototype.getDiscoverCache = function() {
	return this.discoverCache;
};

/**
 * Checks if a connection dialog is open by calling the renewDiscoverFn and starts a new scan if it is.
 * Clears all data from the previous scan
 * @param {string} robotTypeId - id of the affected DeviceManager
 */
DeviceManager.prototype.possiblyRescan = function() {
    if (this.renewDiscoverFn != null && this.renewDiscoverFn()) {
        this.scanning = false;
        this.discoverCache = null;
        this.startDiscover(this.renewDiscoverFn);
    } else {
        this.markStoppedDiscover();
    }
};

/**
 * Retrieves an array of Devices
 * @param robotListString
 * @param includeConnected
 * @param excludeIndex
 * @return {Array}
 */
DeviceManager.prototype.fromJsonArrayString = function(robotListString, includeConnected, excludeIndex) {
	// Get the devices from the request
	let robotList = Device.fromJsonArrayString(robotListString);
	// Accumulate devices that are not currently connected
	let disconnectedRobotsList = [];
	robotList.forEach(function(robot) {
		// Try to find the device
		let connectedRobotIndex = this.lookupRobotIndexById(robot.id);
		// Only include the device if we didn't find it and it isn't the excludeId robot
		if (connectedRobotIndex === -1) {
			// Include the device in the list
			disconnectedRobotsList.push(robot);
		}
	}.bind(this));

	// If we're including connected devices, add them at the top
	let newList = disconnectedRobotsList;
	if (includeConnected) {
		newList = this.connectedDevices.concat(robotList);
		if (excludeIndex != null) {
			newList.splice(excludeIndex, 1);
		}
	}
	if (DebugOptions.shouldAllowVirtualDevices()) {
		newList = newList.concat(this.createVirtualDeviceList());
	}
	return newList;
};

DeviceManager.prototype.backendDiscovered = function(robotList) {
    this.discoverCache = robotList;
    if (this.deviceDiscoverCallback != null) this.deviceDiscoverCallback(robotList);
};

/**
 * Issues a request to tell the backend to stop scanning for devices. Called when a discover dialog is closed
 * TODO: change backend to this doesn't need to be called when switching between Flutter/Hummingbird tabs
 * @param {function} [callbackFn]
 * @param {function} [callbackErr]
 */
DeviceManager.prototype.stopDiscover = function(callbackFn, callbackErr) {
	let request = new HttpRequestBuilder("robot/stopDiscover");
	HtmlServer.sendRequestWithCallback(request.toString(), callbackFn, callbackErr);
	this.markStoppedDiscover();
};

/**
 * Clears the cache and other fields to reflect that a scan is no longer running
 */
DeviceManager.prototype.markStoppedDiscover = function() {
	this.deviceDiscoverCallback = null;
	this.discoverCache = null;
	this.renewDiscoverFn = null;
	this.scanning = false;
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
 * Looks for the specified device and sets whether it is connected (if found).
 * If the device has lost connection, a scan is started to find it.
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
		const wasConnected = robot.getConnected();
		robot.setConnected(isConnected);
		if (wasConnected && !isConnected && !this.scanning) {
			this.startDiscover();
		}
	}
};


DeviceManager.prototype.updateRobotBatteryStatus = function(deviceId, batteryStatus) {
    const index = this.lookupRobotIndexById(deviceId);
    let robot = null;
    if (index >= 0) {
        robot = this.connectedDevices[index];
    }
    if (robot != null) {
        robot.setBatteryStatus(batteryStatus);
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

DeviceManager.prototype.disconnectIncompatible = function(robotId, oldFirmware, minFirmware) {
	const index = this.lookupRobotIndexById(robotId);
	if (index >= 0) {
		const robot = this.connectedDevices[index];
		this.connectedDevices.splice(index, 1);
		this.devicesChanged(null, false);
		robot.notifyIncompatible(oldFirmware, minFirmware);
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

DeviceManager.updateRobotBatteryStatus = function(robotId, batteryStatus) {
    DeviceManager.forEach(function(manager) {
		manager.updateRobotBatteryStatus(robotId, batteryStatus);
	});
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

/**
 * Notifies all DeviceManagers that robots have been discovered
 * @param {string} robotTypeId - The ID of the type of robot being scanned for
 * @param {string} robotList - A JSON Array as a string representing the discovered devices
 */
DeviceManager.backendDiscovered = function(robotList) {
	DeviceManager.forEach(function(manager) {
		manager.backendDiscovered(robotList);
	});
};

/**
 * Notifies all DeviceManagers that the specified device is incompatible and should be removed.
 * @param {string} robotId - The id of the robot to disconnect
 * @param {string} oldFirmware - The firmware on the robot
 * @param {string} minFirmware - The minimum firmware required to be compatible
 */
DeviceManager.disconnectIncompatible = function(robotId, oldFirmware, minFirmware) {
	DeviceManager.forEach(function(manager) {
		manager.disconnectIncompatible(robotId, oldFirmware, minFirmware);
	});
};

/**
 * Notifies all DeviceManagers that a scan has just ended, so they can possibly start a new scan
 * @param {string} robotTypeId - The ID of the type of robot that was being scanned for
 */
DeviceManager.possiblyRescan = function() {
	DeviceManager.forEach(function(manager) {
		manager.possiblyRescan();
	});
};