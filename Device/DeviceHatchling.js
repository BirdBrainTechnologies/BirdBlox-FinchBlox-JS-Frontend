/**
 * Manages communication with a Hatchling
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceHatchling(name, id, RSSI, device) {
  DeviceWithPorts.call(this, name, id, RSSI, device);
  this.hlState = []
  // Code for what is connected to each of the 6 ports (A-F). Current options:
  // * 0  = Empty Port
  // * 1  = Rotation Servo
  // * 3  = Position Servo
  // * 9  = Single Neopixel
  // * 10 = Strip of 4 Neopixels
  // * 14 = Distance Sensor
  this.portStates = [0, 0, 0, 0, 0, 0]
}
DeviceHatchling.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHatchling.prototype.constructor = DeviceHatchling;
Device.setDeviceTypeName(DeviceHatchling, "hatchling", "Hatchling", "Hatch");

DeviceHatchling.prototype.setHatchlingState = function(state) {
  this.hlState = state

  let newPortVals = []
  newPortVals[0] = state[10] & 0x1F //port A
  newPortVals[1] = state[11] & 0x1F //port B
  newPortVals[2] = state[12] & 0x1F //port C
  newPortVals[3] = state[13] & 0x1F //port D
  newPortVals[4] = ((state[13] >> 5) << 3) | (state[14] >> 5) //port E
  newPortVals[5] = ((state[15] >> 5) << 3) | (state[16] >> 5) //port F

  for (let i = 0; i < this.portStates.length; i++) {
    if (this.portStates[i] != newPortVals[i]) {
      console.log("New value for port " + i + ": " + newPortVals[i])
      this.portStates[i] = newPortVals[i]
      //TODO: trigger enable/disable appropriate blocks
    }
  }
}

/**
 * Returns an array containing the port numbers for any ports which have an
 * accessory of the given type currently connected. For example, specify type 1
 * for all ports with rotation servos attached.
 */
DeviceHatchling.prototype.getPortsByType = function(type) {
  let ports = []
  for (let i = 0; i < this.portStates.length; i++) {
    if (this.portStates[i] == type) {
      ports.push(i)
    }
  }
  return ports
}
