/**
 * Represents a Device that has ports for its inputs and outputs.
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceWithPorts(name, id, RSSI) {
	Device.call(this, name, id, RSSI);
}
DeviceWithPorts.prototype = Object.create(Device.prototype);
DeviceWithPorts.prototype.constructor = Device;

/**
 * Issues a request to read the sensor at the specified port.  Stored the result in the status object, so the
 * executing Block can access it
 * @param {object} status - An object provided by the caller to store the result in
 * @param {string} sensorType - Added as a parameter to the request so the backend knows how to read the sensor
 * @param {number} port - Added to the request to indicate the port.
 */
DeviceWithPorts.prototype.readSensor = function(status, sensorType, port) {
	const request = new HttpRequestBuilder("robot/in");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam("sensor", sensorType);
	HtmlServer.sendRequest(request.toString(), status, true);
};

/**
 * Issues a request to assign the value of an output at the specified port.  Uses a status object to store the result.
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {string} outputType - Added to the request so the backend knows how to assign the value
 * @param {number} port
 * @param {number} value - The value to assign
 * @param {string} valueKey - The key to use when adding the value as a parameter to the request
 */
DeviceWithPorts.prototype.setOutput = function(status, outputType, port, value, valueKey) {
	const request = new HttpRequestBuilder("robot/out/" + outputType);
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam(valueKey, value);
	HtmlServer.sendRequest(request.toString(), status, true);
};

/**
 * Issues a request to set the TriLed at a certain port.
 * @param {object} status
 * @param {number} port
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 */
DeviceWithPorts.prototype.setTriLed = function(status, port, red, green, blue) {
	const request = new HttpRequestBuilder("robot/out/triled");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam("red", red);
	request.addParam("green", green);
	request.addParam("blue", blue);
	HtmlServer.sendRequest(request.toString(), status, true);
};

/**
 * Issues a request to set the buzzer.  Uses a status object to store the result.
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {number} note - The note number to play (0-127)
 * @param {number} beats - The duration of the note
 */
DeviceWithPorts.prototype.setBuzzer = function(status, note, duration) {
	const request = new HttpRequestBuilder("robot/out/buzzer");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("note", note);
	request.addParam("duration", duration);
	HtmlServer.sendRequest(request.toString(), status, true);
};

/**
 * Issues a request to set the led array.  Uses a status object to store the result.
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {String} ledStatusString - the on/off status to set for each led in the array represented as a string of 0's and 1's
 */
DeviceWithPorts.prototype.setLedArray = function(status, ledStatusString) {
	const request = new HttpRequestBuilder("robot/out/ledArray");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("ledArrayStatus", ledStatusString);
	HtmlServer.sendRequest(request.toString(), status, true);
};
