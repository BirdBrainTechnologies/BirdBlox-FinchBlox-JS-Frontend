/**
 * Manages communication with a Hummingbird Bit
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceHummingbirdBit(name, id) {
	DeviceWithPorts.call(this, name, id);
}
DeviceHummingbirdBit.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHummingbirdBit.prototype.constructor = DeviceHummingbirdBit;
Device.setDeviceTypeName(DeviceHummingbirdBit, "hummingbirdbit", "HummingbirdBit", "BB");
