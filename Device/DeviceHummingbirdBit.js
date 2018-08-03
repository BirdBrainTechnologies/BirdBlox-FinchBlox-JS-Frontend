/**
 * Manages communication with a Hummingbird Bit
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceHummingbirdBit(name, id, RSSI, device) {
	DeviceWithPorts.call(this, name, id, RSSI, device);
}
DeviceHummingbirdBit.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHummingbirdBit.prototype.constructor = DeviceHummingbirdBit;
Device.setDeviceTypeName(DeviceHummingbirdBit, "hummingbirdbit", "Hummingbird Bit", "Bit");
