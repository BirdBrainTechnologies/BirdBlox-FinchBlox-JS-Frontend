/**
 * Manages communication with a Flutter
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceFlutter(name, id, RSSI) {
	DeviceWithPorts.call(this, name, id, RSSI);
}
DeviceFlutter.prototype = Object.create(DeviceWithPorts.prototype);
Device.setDeviceTypeName(DeviceFlutter, "flutter", "Flutter", "F");
DeviceFlutter.prototype.constructor = DeviceFlutter;

/**
 * Sends a request to set the value of the Buzzer
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {number} volume - How loud the buzzer is
 * @param {number} frequency - The frequency of the sound the buzzer produces
 */
DeviceFlutter.prototype.setBuzzer = function(status, volume, frequency) {
	const request = new HttpRequestBuilder("robot/out/buzzer");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("volume", volume);
	request.addParam("frequency", frequency);
	HtmlServer.sendRequest(request.toString(), status, true);
};

/**
 * @inheritDoc
 * @return {string}
 */
DeviceFlutter.getConnectionInstructions = function() {
	return "Press the \"find me\" button on your Flutter";
};