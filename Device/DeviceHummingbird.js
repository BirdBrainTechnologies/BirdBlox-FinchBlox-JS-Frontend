/**
 * Manages communication with a Hummingbird
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceHummingbird(name, id, RSSI) {
	DeviceWithPorts.call(this, name, id, RSSI);
}
DeviceHummingbird.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHummingbird.prototype.constructor = DeviceHummingbird;
Device.setDeviceTypeName(DeviceHummingbird, "hummingbird", "Hummingbird", "HB");