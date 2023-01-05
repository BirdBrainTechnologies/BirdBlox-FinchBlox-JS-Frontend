/**
 * Manages communication with a Hatchling
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceHatchling(name, id, RSSI, device) {
  DeviceWithPorts.call(this, name, id, RSSI, device);
  this.hlState = []
}
DeviceHatchling.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHatchling.prototype.constructor = DeviceHatchling;
Device.setDeviceTypeName(DeviceHatchling, "hatchling", "Hatchling", "Hatch");

DeviceHatchling.prototype.setHatchlingState = function(state) {
  this.hlState = state
}
