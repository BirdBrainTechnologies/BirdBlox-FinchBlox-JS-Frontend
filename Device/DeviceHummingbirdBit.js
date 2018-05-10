/**
 * Manages communication with a Hummingbird
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceHummingbirdBit(name, id) {
	DeviceWithPorts.call(this, name, id);
}
DeviceHummingbirdBit.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHummingbirdBit.prototype.constructor = DeviceHummingbirdBit;
Device.setDeviceTypeName(DeviceHummingbirdBit, "hummingbirdbit", "HummingbirdBit", "HM");
