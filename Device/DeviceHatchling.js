/**
 * Manages communication with a Hatchling
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceHatchling(name, id, RSSI, device, advertisedName) {
  DeviceWithPorts.call(this, name, id, RSSI, device);
  this.hlState = []
  // Code for what is connected to each of the 6 ports (A-F). Current options:
  // * 0  = Empty Port
  // * 1  = Rotation Servo
  // * 3  = Position Servo
  // * 8  = Fairy Lights
  // * 9  = Single Neopixel
  // * 10 = Strip of 4 Neopixels
  // * 14 = Distance Sensor
  this.supportedStates = [0, 1, 3, 8, 9, 10, 14]
  this.portStates = [0, 0, 0, 0, 0, 0]
  this.advertisedName = advertisedName

  this.messageInProgress = null
}
DeviceHatchling.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHatchling.prototype.constructor = DeviceHatchling;
Device.setDeviceTypeName(DeviceHatchling, "hatchling", "Hatchling", "Hatchling");

DeviceHatchling.prototype.setHatchlingState = function(state) {
  console.log("From hatchling: [" + state + "]")

  if (this.messageInProgress != null) {
    let newLength = this.messageInProgress.data.length + state.length
    let currentData = new Uint8Array(newLength)
    currentData.set(this.messageInProgress.data, 0)
    currentData.set(state, this.messageInProgress.data.length)
    if (newLength < this.messageInProgress.length) {
      this.messageInProgress.data = currentData
    } else {
      this.messageInProgress = null
      mbRuntime.handleMessage(currentData)
    }

    return
  }
  
  let msgType = state[0]
  switch(msgType) {
    case 252:  //Hatchling state message

      this.hlState = state

      let newPortVals = []
      /*newPortVals[0] = state[10] & 0x1F //port A
      newPortVals[1] = state[11] & 0x1F //port B
      newPortVals[2] = state[12] & 0x1F //port C
      newPortVals[3] = state[13] & 0x1F //port D
      newPortVals[4] = ((state[10] >> 5) << 3) | (state[11] >> 5) //port E
      newPortVals[5] = ((state[12] >> 5) << 3) | (state[13] >> 5) //port F*/
      newPortVals[0] = state[7] //port A
      newPortVals[1] = state[8] //port B
      newPortVals[2] = state[9] //port C
      newPortVals[3] = state[10] //port D
      newPortVals[4] = state[11] //port E
      newPortVals[5] = state[12] //port F


      for (let i = 0; i < this.portStates.length; i++) {
        if (this.portStates[i] != newPortVals[i]) {
          if (this.supportedStates.includes(newPortVals[i])) {
            console.log("New value for port " + i + ": " + newPortVals[i])
            this.setOutput(null, "portOff", i, 0, "offValue")
            this.portStates[i] = newPortVals[i]
            CodeManager.updateAvailablePorts(i);
          } else {
            console.log("Unsupported type " + newPortVals[i] + " at port " + i)
          }
        }
      }

      break;
    case 250:
      //Microblocks short message
      mbRuntime.handleMessage(state)
      if (state.length > 3) {
        console.error("Short message length > 3.")
        this.setHatchlingState(state.slice(3)) //TODO: REMOVE! Temporary! Can miss some packets.
      }
      break;
    case 251:
      //Microblocks long message. Data format:
      //[0xFB, OpCode, ChunkOrVariableID, DataSize-LSB, DataSize-MSB, ...data...]
      let messageLength = ( state[3] | (state[4] << 8) )
      if (messageLength <= 15) { //All data fits in this packet
        mbRuntime.handleMessage(state)
      } else {
        this.messageInProgress = {
          'length': (messageLength + 5), //because we must include the header bytes, not just data
          'data': state
        }
      }
      break;
    default:
      console.error("Data received starts with unknown code: " + state)
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

/**
 * Issues a request to read a hatchling sensor.
 * @param {object} status - An object provided by the caller to track the progress of the request
 * @param {string} sensor - What type of sensor (Light, distance, etc.)
 * @param {string} port - Which port the sensor is plugged in to (null for micro:bit sensors)
 */
DeviceHatchling.prototype.readSensor = function(status, sensor, port) {
  const request = new HttpRequestBuilder("robot/in");
  request.addParam("type", this.getDeviceTypeId());
  request.addParam("id", this.id);
  request.addParam("sensor", sensor);
  if (port != null) {
    request.addParam("port", port);
  }
  HtmlServer.sendRequest(request.toString(), status, true);
}

/**
 * Retrieves the sensor value for the given port from the locally stored array
 * @param {number} port - The port to return the value for
 */
DeviceHatchling.prototype.getSensorValue = function(port) {
  return this.hlState[ port + 14 ]
}

/**
 * getHatchlingCode - calculate the color code displayed on the hatchling
 * @param {string} devName Advertised name of the robot
 * @return {[string]} hex values of the 6 colors displayed.
 */
DeviceHatchling.prototype.getHatchlingCode = function() {
  let digits = this.advertisedName.substr(this.advertisedName.length - 5)
  let colorArray = []
  let total = 0
  for (let i = 0; i < digits.length; i++) {
    let hex = parseInt(digits[i], 16)
    total = total + hex
    colorArray.push(this.getColor(hex))
  }
  colorArray.push(this.getColor(total%16))

  return colorArray
}

DeviceHatchling.prototype.getColor = function(number) {
  switch (number) {
    case 0:
    case 1:
      return "#f00"
    case 2:
    case 3:
      return "#f60"
    case 4:
    case 5:
      return "#ff0"
    case 6:
    case 7:
      return "#0f0"
    case 8:
    case 9:
      return "#0ff"
    case 10:
    case 11:
      return "#00f"
    case 12:
    case 13:
      return "#f0f"
    case 14:
    case 15:
      return "#fff"
    default:
      return "#000"
  }
}
