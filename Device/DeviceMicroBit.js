/**
 * Manages communication with a Hummingbird
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceMicroBit(name, id, RSSI, device) {
	DeviceWithPorts.call(this, name, id, RSSI, device);
}
DeviceMicroBit.prototype = Object.create(DeviceWithPorts.prototype);
DeviceMicroBit.prototype.constructor = DeviceMicroBit;
Device.setDeviceTypeName(DeviceMicroBit, "microbit", "micro:bit", "MB");
