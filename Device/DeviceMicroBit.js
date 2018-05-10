/**
 * Manages communication with a Hummingbird
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceMicroBit(name, id) {
	DeviceWithPorts.call(this, name, id);
}
DeviceMicroBit.prototype = Object.create(DeviceWithPorts.prototype);
DeviceMicroBit.prototype.constructor = DeviceMicroBit;
Device.setDeviceTypeName(DeviceMicroBit, "microbit", "MicroBit", "MB");
