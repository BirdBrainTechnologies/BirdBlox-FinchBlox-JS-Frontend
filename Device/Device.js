/**
 * Device is an abstract class.  Each subclass (DeviceHummingbird, DeviceFlutter) represents a specific type of
 * robot.  Instances of the Device class have functions to to issue Bluetooth commands for connecting, disconnecting,
 * and reading/writing inputs/outputs.  The name field is what is shown to the user while the id field is used when
 * communicating with the backend.  Frequently, functions/constructors accept subclasses rather than instances of the
 * device class when they need information about a specific type of robot.  Each device subclass has its own
 * DeviceManager instance which manages connections to that type of robot
 *
 * @param {string} name - The display name of the device
 * @param {string} id - The string used to refer to the device when communicating with the backend
 * @constructor
 */
function Device(name, id) {
	this.name = name;
	this.id = id;

	/* Fields keep track of whether the device currently has a good connection with the backend and has up to date
	 * firmware.  In this context, a device might have "connected = false" but still be on the list of devices
	 * the user is trying to connect to, but with a red status light. */
	this.connected = false;
	/** @type {Device.firmwareStatuses} */
	this.firmwareStatus = Device.firmwareStatuses.upToDate;

	/* Field hold functions that are called each time the device's status or firmwareStatus changes.  DeviceStatusLights
	 * configure these fields so they can update when the status changes */
	this.statusListener = null;
	this.firmwareStatusListener = null;
}

Device.setStatics = function() {
	/** @enum {string} */
	Device.firmwareStatuses = {
		upToDate: "upToDate",
		old: "old",
		incompatible: "incompatible"
	};
};
Device.setStatics();

/**
 * Each concrete subclass of the Device class must call this function on itself to add a set of static methods to
 * that class (since in JS they aren't inherited).  This function also creates a DeviceManager for the subclass,
 * which can be accessed through the getManager() function
 * @param deviceClass - Concrete subclass of Device
 * @param {string} typeId - The lowercase string used internally to refer to the type. Ex: "hummingbird"
 * @param {string} typeName - The capitalized string the user sees. Ex: "Hummingbird"
 * @param {string} shortTypeName - The abbreviated name for the type. Ex: "HB". USed where the typeName doesn't fit.
 */
Device.setDeviceTypeName = function(deviceClass, typeId, typeName, shortTypeName) {

	/**
	 * Retrieves the typeName from the deviceClass
	 * @param {boolean} shorten - Whether the shortTypeName should be returned
	 * @param {number} [maxChars] - The maximum number of characters before the short name is used, even if !shorten
	 * @return {string} - The name or short name of the deviceClass.
	 */
	deviceClass.getDeviceTypeName = function(shorten, maxChars) {
		if (shorten || (maxChars != null && typeName.length > maxChars)) {
			return shortTypeName;
		} else {
			return typeName;
		}
	};

	/**
	 * Returns the id of the deviceClass
	 * @return {string}
	 */
	deviceClass.getDeviceTypeId = function() {
		return typeId;
	};

	/**
	 * Returns a string to show the user when a block is run that tries to control a robot that is not connected
	 * @param {number} [errorCode] - The status code from the request to communicate with the robot
	 * @param {string} [errorResult] - The message returned from the backend
	 * @return {string}
	 */
	deviceClass.getNotConnectedMessage = function(errorCode, errorResult) {
		if (errorResult == null || true) {
			return typeName + " not connected";
		} else {
			return errorResult;
		}
	};

	const manager = new DeviceManager(deviceClass);
	/** @return {DeviceManager} */
	deviceClass.getManager = function() {
		return manager;
	};

	/**
	 * Gets the string to show at the top of the connection dialog when no devices have been found
	 * @return {string}
	 */
	deviceClass.getConnectionInstructions = function() {
		return "Scanning for devices...";
	};
};

/**
 * Calls getDeviceTypeName on the class of this instance
 * @param {boolean} shorten
 * @param {number} maxChars
 * @return {string}
 */
Device.prototype.getDeviceTypeName = function(shorten, maxChars) {
	return this.constructor.getDeviceTypeName(shorten, maxChars);
};

/**
 * Calls getDeviceTypeId on the class of this instance
 * @return {string}
 */
Device.prototype.getDeviceTypeId = function() {
	return this.constructor.getDeviceTypeId();
};

/**
 * Issues a request to disconnect from this robot, causing the backend to instantly remove the robot from the
 * list of robots it is trying to connect to.
 */
Device.prototype.disconnect = function() {
	const request = new HttpRequestBuilder(this.getDeviceTypeId() + "/disconnect");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};

/**
 * Issues a request to connect to this robot, causing the backend to instantly add the robot to the
 * list of robots it is trying to connect to.
 */
Device.prototype.connect = function() {
	const request = new HttpRequestBuilder(this.getDeviceTypeId() + "/connect");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};

/**
 * Marks the robot as being in good/poor communication with the backend.  This function is called by the backend
 * through the CallbackManager whenever the communication status with a device changes.  Note it is independent of
 * whether the device is on the list of devices the backend is trying to connect to, as determined by the
 * connect and disconnect functions above.
 * @param {boolean} isConnected - Whether the robot is currently in good communication with the backend
 */
Device.prototype.setConnected = function(isConnected) {
	this.connected = isConnected;
	if (this.statusListener != null) this.statusListener(this.getStatus());
	DeviceManager.updateStatus();
};

/**
 * Marks the status of the robot's firmware.  Called by the backend through the CallbackManager.
 * Updates status lights and UI
 * @param {Device.firmwareStatuses} status
 */
Device.prototype.setFirmwareStatus = function(status) {
	this.firmwareStatus = status;
	if (this.statusListener != null) this.statusListener(this.getStatus());
	if (this.firmwareStatusListener != null) this.firmwareStatusListener(this.getFirmwareStatus());

	// Update the status of the total status light and DeviceManagers
	DeviceManager.updateStatus();
};

/**
 * Combines information from this.firmwareStatus and this.connected to determine the overall "status" of this robot,
 * used by the DeviceManager when computing its status
 * @return {DeviceManager.statuses}
 */
Device.prototype.getStatus = function() {
	const statuses = DeviceManager.statuses;
	const firmwareStatuses = Device.firmwareStatuses;
	if (!this.connected) {
		return statuses.disconnected;
	} else {
		if (this.firmwareStatus === firmwareStatuses.incompatible) {
			return statuses.incompatibleFirmware;
		} else if (this.firmwareStatus === firmwareStatuses.old) {
			return statuses.oldFirmware;
		} else {
			return statuses.connected;
		}
	}
};

/**
 * Retrieves the firmware status of the robot
 * @return {Device.firmwareStatuses}
 */
Device.prototype.getFirmwareStatus = function() {
	return this.firmwareStatus;
};

/**
 * @param {function} callbackFn
 */
Device.prototype.setStatusListener = function(callbackFn) {
	this.statusListener = callbackFn;
};

/**
 * @param {function} callbackFn
 */
Device.prototype.setFirmwareStatusListener = function(callbackFn) {
	this.firmwareStatusListener = callbackFn;
};

/**
 * Sends a request to show a dialog with information about the specified robot's firmware.
 * The dialog is an alert dialog if the firmware is up to date.  Otherwise it is a two choice dialog
 * with choices "Close" and "Update Firmware".
 */
Device.prototype.showFirmwareInfo = function() {
	const request = new HttpRequestBuilder("robot/firmware");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};

/**
 * Constructs a Device instance from a JSON object with fields for name and id
 * @param deviceClass - Subclass of device, the type of device to construct
 * @param {object} json
 * @return {Device}
 */
Device.fromJson = function(deviceClass, json) {
	return new deviceClass(json.name, json.id);
};

/**
 * Constructs an array of Devices from an array of JSON objects, each with fields for name and id
 * @param deviceClass - Subclass of device, the type of devices to construct
 * @param {Array} json - Array of JSON objects
 * @return {Array}
 */
Device.fromJsonArray = function(deviceClass, json) {
	let res = [];
	for (let i = 0; i < json.length; i++) {
		res.push(Device.fromJson(deviceClass, json[i]));
	}
	return res;
};

/**
 * Constructs an array of Devices from a string representing a JSON array
 * @param deviceClass - Subclass of device, the type of devices to construct
 * @param {string} deviceList - String representation of json array
 * @return {Array}
 */
Device.fromJsonArrayString = function(deviceClass, deviceList) {
	let json = [];
	try {
		json = JSON.parse(deviceList);
	} catch (e) {
		json = [];
	}
	return Device.fromJsonArray(deviceClass, json);
};

/**
 * Returns an array of concrete subclasses of Device, each representing a type of robot.
 * @return {Array}
 */
Device.getTypeList = function() {
	return [DeviceHummingbird, DeviceFlutter];
};

/**
 * Sends a request to the backend to turn off all motors, servos, LEDs, etc. on all robots
 */
Device.stopAll = function() {
	const request = new HttpRequestBuilder("devices/stop");
	HtmlServer.sendRequestWithCallback(request.toString());
};