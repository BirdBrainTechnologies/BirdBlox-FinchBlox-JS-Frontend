/**
 * Manages communication with a Finch
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceFinch(name, id, RSSI, device) {
	DeviceWithPorts.call(this, name, id, RSSI, device);
}
DeviceFinch.prototype = Object.create(DeviceWithPorts.prototype);
Device.setDeviceTypeName(DeviceFinch, "finch", "Finch", "Finch");
DeviceFinch.prototype.constructor = DeviceFinch;

DeviceFinch.ticksPerCM = 51;
DeviceFinch.cmPerDegree = 0.087; //How many cm must the wheels move to turn the finch 1 degree?

/**
 * Issues a request to set the beak led.
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 */
DeviceFinch.prototype.setBeak = function(status, red, green, blue) {
	const request = new HttpRequestBuilder("robot/out/beak");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("red", red);
	request.addParam("green", green);
	request.addParam("blue", blue);
	HtmlServer.sendRequest(request.toString(), status, true);
};

/**
 * Issues a request to set the tail led(s).
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {number} port - Specifies which led to set. specify 5 to set all.
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 */
DeviceFinch.prototype.setTail = function(status, port, red, green, blue) {
	const request = new HttpRequestBuilder("robot/out/tail");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam("red", red);
	request.addParam("green", green);
	request.addParam("blue", blue);
	HtmlServer.sendRequest(request.toString(), status, true);
};

/**
 * Issues a request to set the motors.
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {number} speedL - speed of the left motor (%)
 * @param {number} distL - distance for left motor to travel (set to 0 for continuous motion)
 * @param {number} speedR - speed of the right motor (%)
 * @param {number} distR - distance for rigth motor to travel (set to 0 for continuous motion)
 */
DeviceFinch.prototype.setMotors = function(status, speedL, distL, speedR, distR) {

	// Convert from distance in cm to encoder ticks.
	const ticksPerCM = DeviceFinch.ticksPerCM;//100;

	//Make sure speeds do not exceed 100%
	if (speedL > 100) { speedL = 100; }
	if (speedL < -100) { speedL = -100; }
	if (speedR > 100) { speedR = 100; }
	if (speedR < -100) { speedR = -100; }

	const request = new HttpRequestBuilder("robot/out/motors");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("speedL", Math.round(speedL * 127/100));
	request.addParam("ticksL", Math.round(distL * ticksPerCM));
	request.addParam("speedR", Math.round(speedR * 127/100));
	request.addParam("ticksR", Math.round(distR * ticksPerCM));
	//Since these requests may wait for a response from the finch, the second
	// true here keeps the request from timing out
	HtmlServer.sendRequest(request.toString(), status, true, true);
};

/**
 * Issues a request to reset the finch encoders.
 * @param {object} status - An object provided by the caller to track the progress of the request
 */
DeviceFinch.prototype.resetEncoders = function(status) {
	const request = new HttpRequestBuilder("robot/out/resetEncoders");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	HtmlServer.sendRequest(request.toString(), status, true);
};

/**
 * Issues a request to read a finch sensor.
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {string} sensor - What type of sensor (Light, distance, etc.)
 * @param {string} position - Which sensor to read (right or left)
 */
DeviceFinch.prototype.readSensor = function(status, sensor, position) {
	const request = new HttpRequestBuilder("robot/in");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("sensor", sensor);
	if (position != null) {
		request.addParam("position", position);
	}
	HtmlServer.sendRequest(request.toString(), status, true);
}
