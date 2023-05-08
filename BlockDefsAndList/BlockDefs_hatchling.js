/*
 * This file contains the implementations of hatchling blocks that aren't taken
 * from FinchBlox
 */

const HL_Utils = {}
//                      blue         yellow       sea-green    magenta      white        orange
HL_Utils.portColors = ["#0000FF", "#FFFF00", "#00FF88", "#FF00FF", "#FFFFFF", "#FF4400"]//["#00f", "#ff0", "#0f0", "#f0f", "#0ff", "#f80"]//["#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f"]
HL_Utils.addHLButton = function(block, portType) {
  block.port = -1 //unknown
  block.hlButton = new BlockButton(block, 20);
  block.hlButton.addSlider("hatchling_" + portType, Colors.bbtDarkGray, HL_Utils.portColors)
}
HL_Utils.updatePort = function(block) {
  if (block.hlButton != null) {
    block.port = HL_Utils.portColors.indexOf(block.hlButton.values[0])
    console.log("update port for " + block.constructor.name + " to " + block.port)
    block.updateActive()
  }
}
HL_Utils.findPorts = function(block) {
  console.log("findPorts for " + block.constructor.name)
  let device = DeviceHatchling.getManager().getDevice(0);
  if (block.hlButton != null && device != null) {
    let ports = device.getPortsByType(block.portType)
    //console.log("findPorts found:")
    //console.log(ports)
    if (ports.length >= 1) {
      block.hlButton.updateValue(HL_Utils.portColors[ports[0]], 0)
      //block.port = ports[0]
      if (ports.length > 1) {
        //block.hlButton.callbackFunction()
        block.shouldShowPortsPopup = true
      }
    }
  }
}
HL_Utils.checkActive = function(block) {
  //console.log("checkActive " + block.constructor.name)
  //Always active in blockPalette
  if (block.stack != null && block.stack.isDisplayStack) {
    //console.log("found display stack - returning true")
    return true
  }
  //Not active if no port selected
  if (block.port == -1) { return false }

  //Active if correct accessory is plugged in to selected port.
  let device = DeviceHatchling.getManager().getDevice(0);
  if (device != null) {
    let ports = device.getPortsByType(block.portType)
    if (ports.indexOf(block.port) != -1) {
      //console.log("found port " + block.port + " within " + ports + " - returning true")
      return true
    }
  }
  //console.log("found nothing - returning false")
  return false

  //let portFound = HL_Utils.findPorts(this)
  //console.log(this.constructor.name + " " + portFound + " " + (this.stack == null ? "no stack" : this.stack.isDisplayStack))
  //return portFound
}
HL_Utils.setupAction = function(block) {
  let mem = block.runMem;
  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;

  let device = DeviceHatchling.getManager().getDevice(0);
  if (device == null) {
    mem.requestStatus.finished = true;
    mem.duration = 0;
    TitleBar.flashFinchButton();
  }
  return device;
}
HL_Utils.showPortsPopup = function(block) {
  if (block.shouldShowPortsPopup) {
    block.shouldShowPortsPopup = false
    setTimeout(function() {
      block.hlButton.button.press()
      block.hlButton.button.release()
    }, 100);
  }
}


function B_HLOutputBase(x, y, category, outputType, portType) {
  this.outputType = outputType
  this.portType = portType
  CommandBlock.call(this, x, y, category);

  HL_Utils.addHLButton(this, portType)
}
B_HLOutputBase.prototype = Object.create(CommandBlock.prototype);
B_HLOutputBase.prototype.constructor = B_HLOutputBase;

B_HLOutputBase.prototype.startAction = function() {
  let device = HL_Utils.setupAction(this);
  if (device == null || !this.active) {
    return new ExecutionStatusError();
  }
  if (this.port == -1 || this.port >= HL_Utils.portColors.length) {
    //no port chosen. Or possibly port our of bounds. Todo: pop up window if something is connected?
    return new ExecutionStatusError();
  }
  device.setOutput(this.runMem.requestStatus, this.outputType, this.port, this.value, this.valueKey)
  return new ExecutionStatusRunning();
};
B_HLOutputBase.prototype.updateValues = function() {
  HL_Utils.updatePort(this)
  if (this.valueBN != null) {
    if (this.portType == 1) { //rotation servo
      let percent = this.valueBN.values[0]
      if (this.flip) { percent = -percent } //rotate counter clockwise
      if (percent == 0) {
        this.value = 89 //off signal
      } else if (percent > 100) {
        this.value = 174
      } else if (percent < -100) {
        this.value = 2
      } else if (percent > 0) {
        this.value = Math.round( (percent * 75/100) + 98 ) 
      } else if (percent < 0) {
        this.value = Math.round( 78 + (percent * 75/100) )
      }
    } else if (this.portType == 8) { //fairy lights
      let percent = this.valueBN.values[0]
      if (percent > 100) {
        this.value = 254
      } else if (percent < 0) {
        this.value = 0
      } else {
        this.value = Math.round(percent * 254/100)
      }
    } else if (this.portType == 3) { //position servo
      this.value = Math.round(this.valueBN.values[0] / 1.5) + 2
      //this.value = this.valueBN.values[0] + 5
    } else {
      this.value = this.valueBN.values[0]
    }
  }
  if (this.colorButton != null) {
    if (this.colorButton.widgets.length == 3) {
      this.red = this.colorButton.values[0];
      this.green = this.colorButton.values[1];
      this.blue = this.colorButton.values[2];
    }

    /*this.red = this.colorButton.values[0].r;
    this.green = this.colorButton.values[0].g;
    this.blue = this.colorButton.values[0].b;*/
    
    this.value = Math.round(this.red*2.55) + ":" +
      Math.round(this.green*2.55) + ":" + Math.round(this.blue*2.55)
    this.updateColor();
  }
  if (this.portType == 10 && this.colorButtons.length == 4) { //neopixel strip
    this.value = ""
    for (let i = 0; i < this.colorButtons.length; i++) {
      /*this.value = this.value + Math.round(this.colorButtons[i].values[0].r*2.55) + ","
      this.value = this.value + Math.round(this.colorButtons[i].values[0].g*2.55) + ","
      this.value = this.value + Math.round(this.colorButtons[i].values[0].b*2.55) + ","*/
      this.value = this.value + Math.round(this.colorButtons[i].values[0]*2.55) + ","
      this.value = this.value + Math.round(this.colorButtons[i].values[1]*2.55) + ","
      this.value = this.value + Math.round(this.colorButtons[i].values[2]*2.55) + ","
    }
  }
}
B_HLOutputBase.prototype.updateAction = function() {
  if (this.runMem.requestStatus.finished) {
    if (this.runMem.requestStatus.error) {
      return new ExecutionStatusError();
    }
    return new ExecutionStatusDone();
  } else {
    return new ExecutionStatusRunning();
  }
};
B_HLOutputBase.prototype.checkActive = function() {
  return HL_Utils.checkActive(this)
}

function B_HLPositionServo(x, y) {
  this.value = 90; //defaultAngle
  this.valueKey = "angle"
  B_HLOutputBase.call(this, x, y, "motion_3", "positionServo", 3);

  const icon = VectorPaths["bsSpeedometer2"];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "pServo", 27);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);

  this.valueBN = new BlockButton(this);
  this.valueBN.addSlider("angle_right", this.value, [0, 30, 60, 90, 120, 150, 180, 210, 240, 270]);
  this.addPart(this.valueBN);
}
B_HLPositionServo.prototype = Object.create(B_HLOutputBase.prototype);
B_HLPositionServo.prototype.constructor = B_HLPositionServo;

function B_HLRotationServo(x, y, flip) {
  this.value = 255 //off signal
  this.defaultSpeed = 50;
  this.valueKey = "value"
  this.flip = flip
  B_HLOutputBase.call(this, x, y, "motion_3", "rotationServo", 1);

  const icon = flip ? VectorPaths["bsArrowClockwise"] : VectorPaths["bsArrowCounterClockwise"];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "rServo", 30, null, true);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);

  this.valueBN = new BlockButton(this);
  this.valueBN.addSlider("percent", this.defaultSpeed, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  this.addPart(this.valueBN);
}
B_HLRotationServo.prototype = Object.create(B_HLOutputBase.prototype);
B_HLRotationServo.prototype.constructor = B_HLRotationServo;

//To rotate the servo counter clockwise.
function B_HLccRotationServo(x, y) {
  B_HLRotationServo.call(this, x, y, true)
}
B_HLccRotationServo.prototype = Object.create(B_HLRotationServo.prototype);
B_HLccRotationServo.prototype.constructor = B_HLccRotationServo;

function B_HLSingleNeopix(x, y) {
  this.value = ""
  this.valueKey = "color"
  this.red = 100;
  this.green = 100;
  this.blue = 100;
  B_HLOutputBase.call(this, x, y, "color_3", "singleNeopix", 9);

  const icon = VectorPaths["faLightbulb"];
  this.blockIcon = new BlockIcon(this, icon, Colors.white, "sNeopix", 27);
  this.blockIcon.isEndOfLine = true;
  this.addPart(this.blockIcon);

  this.colorButton = new BlockButton(this);
  //this.colorButton.addSlider("color", { r: this.red, g: this.green, b: this.blue });
  this.colorButton.addSlider("color_red", this.red)
  this.colorButton.addSlider("color_green", this.green)
  this.colorButton.addSlider("color_blue", this.blue)
  this.addPart(this.colorButton);
}
B_HLSingleNeopix.prototype = Object.create(B_HLOutputBase.prototype);
B_HLSingleNeopix.prototype.constructor = B_HLSingleNeopix;
B_HLSingleNeopix.prototype.updateColor = function() {
  const s = 255 / 100;
  this.colorHex = Colors.rgbToHex(this.red * s, this.green * s, this.blue * s);
  GuiElements.update.color(this.blockIcon.icon.pathE, this.colorHex);
}

function B_HLNeopixStrip(x, y) {
  this.value = ""
  this.valueKey = "colors"
  this.red = 100;
  this.green = 100;
  this.blue = 100;
  this.blockIcons = []
  this.colorButtons = []

  B_HLOutputBase.call(this, x, y, "color_3", "neopixStrip", 10);

  const icon = VectorPaths["faLightbulb"];
  /*this.blockIcon1 = new BlockIcon(this, icon, Colors.white, "neopix1", 27);
  this.addPart(this.blockIcon1);
  this.blockIcon2 = new BlockIcon(this, icon, Colors.white, "neopix2", 27);
  this.addPart(this.blockIcon2);
  this.blockIcon3 = new BlockIcon(this, icon, Colors.white, "neopix3", 27);
  this.addPart(this.blockIcon3);
  this.blockIcon4 = new BlockIcon(this, icon, Colors.white, "neopix4", 27);
  this.addPart(this.blockIcon4);
  this.blockIcon4.isEndOfLine = true;

  this.colorButtons[0] = new BlockButton(this, 25);
  this.colorButtons[0].addSlider("color", { r: this.red, g: this.green, b: this.blue });
  this.addPart(this.colorButtons[0]);
  this.colorButtons[1] = new BlockButton(this, 25);
  this.colorButtons[1].addSlider("color", { r: this.red, g: this.green, b: this.blue });
  this.addPart(this.colorButtons[1]);
  this.colorButtons[2] = new BlockButton(this, 25);
  this.colorButtons[2].addSlider("color", { r: this.red, g: this.green, b: this.blue });
  this.addPart(this.colorButtons[2]);
  this.colorButtons[3] = new BlockButton(this, 25);
  this.colorButtons[3].addSlider("color", { r: this.red, g: this.green, b: this.blue });
  this.addPart(this.colorButtons[3]);*/

  for (let i = 0; i < 4; i++) {
    this.blockIcons[i] = new BlockIcon(this, icon, Colors.white, "neopix"+i, 27);
    this.addPart(this.blockIcons[i]);
  }
  this.blockIcons[3].isEndOfLine = true

  for (let i = 0; i < 4; i++) {
    this.colorButtons[i] = new BlockButton(this, 25);
    this.colorButtons[i].addSlider("color_red", this.red)
    this.colorButtons[i].addSlider("color_green", this.green)
    this.colorButtons[i].addSlider("color_blue", this.blue)
    this.addPart(this.colorButtons[i]);
  }

}
B_HLNeopixStrip.prototype = Object.create(B_HLOutputBase.prototype);
B_HLNeopixStrip.prototype.constructor = B_HLNeopixStrip;

function B_HLFairyLights(x, y) {
  this.value = ""
  this.valueKey = "value"
  this.defaultIntensity = 50

  B_HLOutputBase.call(this, x, y, "color_3", "fairyLights", 8);

  const icon = VectorPaths["bsStars"];
  this.blockIcon = new BlockIcon(this, icon, Colors.white, "fairyLights", 27);
  this.blockIcon.isEndOfLine = true;
  this.addPart(this.blockIcon);

  this.valueBN = new BlockButton(this);
  this.valueBN.addSlider("percent", this.defaultIntensity, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  this.addPart(this.valueBN);
}
B_HLFairyLights.prototype = Object.create(B_HLOutputBase.prototype);
B_HLFairyLights.prototype.constructor = B_HLFairyLights;

function B_HLAlphabet(x, y) {
  this.useAlphabet = true

  B_FBLedArrayL2.call(this, x, y)
}
B_HLAlphabet.prototype = Object.create(B_FBLedArrayL2.prototype);
B_HLAlphabet.prototype.constructor = B_HLAlphabet;

// Wait until sensor reaches threshold
function B_HLWaitUntil(x, y, usePort) {
  CommandBlock.call(this, x, y, "sensor_3");
  this.usePort = usePort

  if (usePort) {
    HL_Utils.addHLButton(this, this.portType)
    const blockIcon = new BlockIcon(this, VectorPaths.faClockSolid, Colors.white, "clock", 20);
    this.addPart(blockIcon);
    const blockIcon2 = new BlockIcon(this, VectorPaths.faRuler, Colors.white, "ruler", 20);
    blockIcon2.isEndOfLine = true;
    this.addPart(blockIcon2);
    //distance only

  } else {
    const blockIcon = new BlockIcon(this, VectorPaths.faClockSolid, Colors.white, "clock", 35);
    blockIcon.isEndOfLine = true;
    this.addPart(blockIcon);
    //clap, light, shake
    this.sensorPaths = [VectorPaths.clap, VectorPaths.mjSun, VectorPaths.share]
    this.sensorTypes = ["clap", "light", "shake"]
    this.sensorSelection = this.sensorPaths[1]
    this.sensorBN = new BlockButton(this);
    this.sensorBN.addSlider("sensor", this.sensorSelection, this.sensorPaths);
    this.addPart(this.sensorBN);
  }
  
  
}
B_HLWaitUntil.prototype = Object.create(CommandBlock.prototype);
B_HLWaitUntil.prototype.constructor = B_HLWaitUntil;

B_HLWaitUntil.prototype.startAction = function() {
  let device = HL_Utils.setupAction(this)
  if (device == null) { return new ExecutionStatusError(); }

  this.blankRequestStatus = {};
  this.blankRequestStatus.finished = false;
  this.blankRequestStatus.error = false;
  this.blankRequestStatus.result = null;
  this.blankRequestStatus.requestSent = false;

  this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);

  return new ExecutionStatusRunning();
}
B_HLWaitUntil.prototype.updateAction = function() {
  const status = this.runMem.requestStatus;
  if (status.requestSent) {
    if (status.finished) {
      if (!status.error) {
        const result = new StringData(status.result);
        const num = (result.asNum().getValue());
        console.log(num)
        if ((!this.useLessThan && num > this.threshold) || (this.useLessThan && num < this.threshold)) {
          return new ExecutionStatusDone();
        }
      }
      //If there's an error or if the condition hasn't been met, start over.
      this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
    }
  } else {
    let device = DeviceHatchling.getManager().getDevice(0)
    if (device == null) { return new ExecutionStatusError(); }

    let sensor = "distance"
    if(!this.usePort) {
      sensor = this.sensorTypes[this.sensorPaths.indexOf(this.sensorSelection)]
    }
    
    let port = null
    this.useLessThan = false
    switch(sensor) {
      case "clap":
        if (!device.hasV2Microbit) { return new ExecutionStatusError(); }
        this.threshold = 50
        sensor = "V2sound"
        break;
      case "light":
        this.threshold = 5
        port = "left"
        break;
      case "distance": 
        this.threshold = this.distance
        this.useLessThan = true
        port = this.port
        break;
      case "shake": //TODO: shake not working. Also, consider using buttons?
        break;
    }//TODO: since we keep a copy of the sensor data in the Hatchling device, maybe we can skip all this?
    console.log("checking " + sensor + " at port " + port)
    device.readSensor(status, sensor, port)
    status.requestSent = true;
  }
  return new ExecutionStatusRunning();
}
B_HLWaitUntil.prototype.updateValues = function() {
  if (this.sensorBN != null) {
    this.sensorSelection = this.sensorBN.values[0];
  }
}

//Wait until for port connected sensors
function B_HLWaitUntilPort(x, y) {
  this.portType = 14 // just for distance sensor for now.
  this.distance = 10

  B_HLWaitUntil.call(this, x, y, true)

  this.distanceBN = new BlockButton(this);
  this.distanceBN.addSlider("distance", this.distance, [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  this.addPart(this.distanceBN);
}
B_HLWaitUntilPort.prototype = Object.create(B_HLWaitUntil.prototype);
B_HLWaitUntilPort.prototype.constructor = B_HLWaitUntilPort;

B_HLWaitUntilPort.prototype.updateValues = function() {
  HL_Utils.updatePort(this)
  if (this.distanceBN != null) {
    this.distance = this.distanceBN.values[0]
  }
}
B_HLWaitUntilPort.prototype.checkActive = function() {
  return HL_Utils.checkActive(this)
}


function B_HLPortBlock(x, y, port) {
  this.port = port 
  CommandBlock.call(this, x, y, "portblocks");

  this.updateBlockType(0)
  this.updateActive()
}
B_HLPortBlock.prototype = Object.create(CommandBlock.prototype)
B_HLPortBlock.prototype.constructor = B_HLPortBlock
B_HLPortBlock.prototype.updateConnectionStatus = function() {
  this.updateActive()
}
B_HLPortBlock.prototype.checkActive = function() {
  let device = DeviceHatchling.getManager().getDevice(0);
  if (device != null) {
    const currentState = device.portStates[this.port]

    /*// Update blocks on the canvas and in block palette
    if (this.portType != currentState) {
        this.updateBlockType(currentState)
    }
    return (currentState != 0)*/


    //just update the block if it is in the block palette
    if (this.stack != null && this.stack.isDisplayStack) {
      if (this.portType != currentState) {
        this.updateBlockType(currentState)
      }
      return (currentState != 0)  //Nothing attached to port for type == 0
    } else {
      return (currentState != 0) && (this.portType == currentState)
    }

  }
  return false
}
B_HLPortBlock.prototype.updateBlockType = function(newPortType) {
  this.portType = newPortType
  this.outputType = null
  this.sensorType = null
  this.removeParts()
  if (this.portType == 0) { //Nothing attached, at port name label
    const labels = ["A", "B", "C", "D", "E", "F"]
    this.icon = new LabelText(this, labels[this.port], HL_Utils.portColors[this.port])
  } else {
    let iconName = null
    let iconH = 0
    switch(this.portType) {
    case 1: iconName = "bsArrowClockwise"; iconH = 30; break; //rotation servo
    case 3: iconName = "bsSpeedometer2"; iconH = 27; break; //position servo
    case 8: iconName = "bsStars"; iconH = 27; break; //fairy lights
    case 9: iconName = "faLightbulb"; iconH = 27; break; //single neopixel
    case 10: iconName = "faLightbulb"; iconH = 25; break; //4 neopixel strip
    case 14: iconName = "faRuler"; iconH = 20; break; //distance sensor
    default:
      console.error("PortBlock unsupported port type " + this.portType)
      return
    }
    this.icon = new BlockIcon(this, VectorPaths[iconName], HL_Utils.portColors[this.port], iconName, iconH)
  }
  this.icon.isEndOfLine = true
  this.addPart(this.icon)

  if (this.portType != 0) {
    this.button = new BlockButton(this)
    switch(this.portType) {
    case 1:
      this.outputType = "rotationServo"
      this.value = 255 //off signal
      this.valueKey = "value"
      this.button.addSlider("percent", 0, [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100])
      break;
    case 3:
      this.outputType = "positionServo"
      this.value = 90; //defaultAngle
      this.valueKey = "angle"
      this.button.addSlider("angle_right", 90, [0, 30, 60, 90, 120, 150, 180, 210, 240, 270])
      break;
    case 8:
      this.outputType = "fairyLights"
      this.value = ""
      this.valueKey = "value"
      this.button.addSlider("percent", 50, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      break;
    case 9:
      this.outputType = "singleNeopix"
      this.value = ""
      this.valueKey = "color"
      this.button.addSlider("color_red", 100)
      this.button.addSlider("color_green", 100)
      this.button.addSlider("color_blue", 100)
      break;
    case 10:
      this.outputType = "neopixStrip"
      this.value = ""
      this.valueKey = "colors"
      this.button.addSlider("color_red", 100)
      this.button.addSlider("color_green", 100)
      this.button.addSlider("color_blue", 100)
      break;
    case 14:
      this.sensorType = "distance"
      this.value = 10
      this.useLessThan = true
      this.button.addSlider("distance", 10, [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      break;
    }
    this.addPart(this.button)
  }
  if (this.stack != null) {
    this.stack.updateDim()
  }
}
B_HLPortBlock.prototype.updateValues = function() {
  let percent = null
  switch(this.portType) {
  case 1:
    percent = this.button.values[0]
    if (percent == 0) {
      this.value = 89 //off signal
    } else if (percent > 100) {
      this.value = 174
    } else if (percent < -100) {
      this.value = 2
    } else if (percent > 0) {
      this.value = Math.round( (percent * 75/100) + 98 ) 
    } else if (percent < 0) {
      this.value = Math.round( 78 + (percent * 75/100) )
    }
    break;
  case 3:
    this.value = Math.round(this.button.values[0] / 1.5) + 2
    break;
  case 8:
    percent = this.button.values[0]
    if (percent > 100) {
      this.value = 254
    } else if (percent < 0) {
      this.value = 0
    } else {
      this.value = Math.round(percent * 254/100)
    }
    break;
  case 9:
    if (this.button.widgets.length == 3) {
      const red = this.button.values[0];
      const green = this.button.values[1];
      const blue = this.button.values[2];
      this.value = Math.round(red*2.55) + ":" + Math.round(green*2.55) + ":" + Math.round(blue*2.55)
    }
    break;
  case 10:
    //TODO
    break;
  case 14:
    this.value = this.button.values[0]
    break;
  default:
    console.error("cannot update values for unsupported port type " + this.portType)
    break;
  }
}

B_HLPortBlock.prototype.startAction = function() {
  if (this.portType == 0) {
    return new ExecutionStatusDone();
  }

  let device = HL_Utils.setupAction(this)
  if (device == null || !this.active) {
    return new ExecutionStatusError();
  }

  if (this.portType != 14) { //Not a sensor type
    device.setOutput(this.runMem.requestStatus, this.outputType, this.port, this.value, this.valueKey)
  }

  return new ExecutionStatusRunning();
}
B_HLPortBlock.prototype.updateAction = function() {
  if (this.portType == 14) { //Sensors
    let device = DeviceHatchling.getManager().getDevice(0)
    if (device == null) { return new ExecutionStatusError(); }
      
    const num = device.getSensorValue(this.port)
    console.log(num)
    if ((!this.useLessThan && num > this.value) || (this.useLessThan && num < this.value)) {
      return new ExecutionStatusDone();
    }

    return new ExecutionStatusRunning();
  } else {
    if (this.runMem.requestStatus.finished) {
      if (this.runMem.requestStatus.error) {
        return new ExecutionStatusError();
      }
      return new ExecutionStatusDone();
    } else {
      return new ExecutionStatusRunning();
    }
  }

}

function B_HLPortA(x, y) {
  B_HLPortBlock.call(this, x, y, 0)
}
B_HLPortA.prototype = Object.create(B_HLPortBlock.prototype)
B_HLPortA.prototype.constructor = B_HLPortA

function B_HLPortB(x, y) {
  B_HLPortBlock.call(this, x, y, 1)
}
B_HLPortB.prototype = Object.create(B_HLPortBlock.prototype)
B_HLPortB.prototype.constructor = B_HLPortB

function B_HLPortC(x, y) {
  B_HLPortBlock.call(this, x, y, 2)
}
B_HLPortC.prototype = Object.create(B_HLPortBlock.prototype)
B_HLPortC.prototype.constructor = B_HLPortC

function B_HLPortD(x, y) {
  B_HLPortBlock.call(this, x, y, 3)
}
B_HLPortD.prototype = Object.create(B_HLPortBlock.prototype)
B_HLPortD.prototype.constructor = B_HLPortD

function B_HLPortE(x, y) {
  B_HLPortBlock.call(this, x, y, 4)
}
B_HLPortE.prototype = Object.create(B_HLPortBlock.prototype)
B_HLPortE.prototype.constructor = B_HLPortE

function B_HLPortF(x, y) {
  B_HLPortBlock.call(this, x, y, 5)
}
B_HLPortF.prototype = Object.create(B_HLPortBlock.prototype)
B_HLPortF.prototype.constructor = B_HLPortF


