/**
 * Manages communication with a Hatchling
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceHatchling(name, id, RSSI, device, advertisedName) {
  console.log("DeviceHatchling " + name + ", " + id + ", " + RSSI + ", " + device + ", " + advertisedName)
  DeviceWithPorts.call(this, name, id, RSSI, device);
  console.log("device created.")
  this.hlState = []
  // Code for what is connected to each of the 6 ports (A-F). Current options:
  // * 0  = Empty Port
  // * 1  = Rotation Servo
  // * 3  = Position Servo
  // * 8  = Fairy Lights
  // * 9  = Single Neopixel
  // * 10 = Strip of 4 Neopixels
  // * 14 = Distance Sensor
  // * 31 = Microbit Not Connected to Hatchling
  this.supportedStates = [0, 1, 3, 8, 9, 10, 14, 31]
  this.portStates = [0, 0, 0, 0, 0, 0]
  this.advertisedName = advertisedName
  this.batteryLevel = null

  this.messageInProgress = null
}
DeviceHatchling.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHatchling.prototype.constructor = DeviceHatchling;
Device.setDeviceTypeName(DeviceHatchling, "hatchling", "Hatchling", "Hatchling");

DeviceHatchling.prototype.setHatchlingState = function(state) {
  //console.log("From hatchling: [" + state + "]")

  if (this.messageInProgress != null) {
    //console.log("Message from Hatchling in progress: " + this.messageInProgress.length + ", " + this.messageInProgress.data)
    let newLength = this.messageInProgress.data.length + state.length
    let currentData = new Uint8Array(newLength)
    currentData.set(this.messageInProgress.data, 0)
    currentData.set(state, this.messageInProgress.data.length)
    if (newLength < this.messageInProgress.length) {
      this.messageInProgress.data = currentData
    } else {
      this.messageInProgress = null
      //console.log("Long msg from hatchling: [" + currentData + "]")
      this.setHatchlingState(currentData)
    }

    return
  }

  //Microblocks short message data format: [0xFA, OpCode, ChunkOrVariableID]
  //Microblocks long message data format:
  //[0xFB, OpCode, ChunkOrVariableID, DataSize-LSB, DataSize-MSB, ...data...]

  if (state[0] != 250 && state[0] != 251) {
    console.error("Data received starts with unknown code: " + state)
    return
  }

  let messageLength = (state[0] == 250) ? 3 : (( state[3] | (state[4] << 8) ) + 5) //Add 5 for header bytes
  
  if (state.length == messageLength) {
    mbRuntime.handleMessage(state)
  } else if (state.length > messageLength) {
    mbRuntime.handleMessage(state.slice(0, messageLength))
    this.setHatchlingState(state.slice(messageLength))
  } else if (state.length < messageLength) {
    this.messageInProgress = {
      'length': messageLength, 
      'data': state
    }
  }
  
}

/**
 * Receive a broadcast message from the hatchling. Currently, only port state
 * updates are supported.
 */
DeviceHatchling.prototype.receiveBroadcast = function(msg) {
  //The hatchling state is now sent as a broadcast message. more work will need to be done if 
  // we want to support other broadcast messages...
  if (msg[0] != 252) {
    console.error("Unsupported broadcast message " + msg[0])
    return
  }

  this.hlState = msg.slice(1)
  this.batteryLevel = this.hlState[6] //TODO: Hook up battery monitoring

  for (let i = 0; i < this.portStates.length; i++) {
    if (this.portStates[i] != this.hlState[i]) {
      if (this.supportedStates.includes(this.hlState[i])) {
        let oldState = this.portStates[i]
        console.log("New value for port " + i + ": " + this.hlState[i] + " (was " + oldState + ")")
        this.setOutput(null, "portOff", i, 0, "offValue")
        this.portStates[i] = this.hlState[i]
        if (this.portStates[i] == 31) { this.portStates[i] = 0 } //31 is basically also port empty
        CodeManager.updateAvailablePorts(i, oldState, this.portStates[i]);
      } else {
        console.log("Unsupported type " + this.hlState[i] + " at port " + i)
      }
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
  //HtmlServer.sendRequest(request.toString(), status, true);
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
  //let digits = this.advertisedName.substr(this.advertisedName.length - 5)

  //TODO: Remove this function and associated color coding
  let digits = "2468A"

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

/** Temporarily override functions to make sure we don't send any regular requests 
 * now that we are using the MicroBlocks VM
 */

DeviceHatchling.prototype.setOutput = function(status, outputType, port, value, valueKey) {
}

DeviceHatchling.prototype.setTriLed = function(status, port, red, green, blue) {
}

DeviceHatchling.prototype.setBuzzer = function(status, note, duration) {
}

DeviceHatchling.prototype.setLedArray = function(status, ledStatusString) {
}


