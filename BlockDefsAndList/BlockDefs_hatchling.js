/*
 * This file contains the implementations of hatchling blocks that aren't taken
 * from FinchBlox
 */

const HL_Utils = {}
HL_Utils.portColors = ["#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f"]
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
  if (device == null) {
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
      if (percent >= -10 && percent <= 10) {
        this.value = 255 //off signal
      } else if (percent > 100) {
        this.value = 254
      } else if (percent < -100) {
        this.value = 0
      } else {
        this.value = ( (percent * 23) / 100 ) + 122  //from bambi
      }
    } else {
      this.value = this.valueBN.values[0]
    }
  }
  if (this.colorButton != null) {
    this.red = this.colorButton.values[0].r;
    this.green = this.colorButton.values[0].g;
    this.blue = this.colorButton.values[0].b;
    this.value = this.red*2.55 + ":" + this.green*2.55 + ":" + this.blue*2.55
    this.updateColor();
  }
  if (this.portType == 10 && this.colorButtons.length == 4) { //neopixel strip
    this.value = ""
    for (let i = 0; i < this.colorButtons.length; i++) {
      this.value = this.value + this.colorButtons[i].values[0].r*2.55 + ","
      this.value = this.value + this.colorButtons[i].values[0].g*2.55 + ","
      this.value = this.value + this.colorButtons[i].values[0].b*2.55 + ","
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

  const icon = VectorPaths["faCompassDrafting"];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "pServo", 27);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);

  this.valueBN = new BlockButton(this);
  this.valueBN.addSlider("angle_right", this.value, [0, 30, 60, 90, 120, 150, 180]);
  this.addPart(this.valueBN);
}
B_HLPositionServo.prototype = Object.create(B_HLOutputBase.prototype);
B_HLPositionServo.prototype.constructor = B_HLPositionServo;

function B_HLRotationServo(x, y, flip) {
  this.value = 255 //off signal
  this.defaultSpeed = 50;
  this.valueKey = "percent"
  this.flip = flip
  B_HLOutputBase.call(this, x, y, "motion_3", "rotationServo", 1);

  const icon = flip ? VectorPaths["mjTurnLeft"] : VectorPaths["faArrowsSpin"];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "rServo", 27, null, true);
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
  this.colorButton.addSlider("color", { r: this.red, g: this.green, b: this.blue });
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
  this.colorButtons = []

  B_HLOutputBase.call(this, x, y, "color_3", "neopixStrip", 10);

  const icon = VectorPaths["faLightbulb"];
  this.blockIcon1 = new BlockIcon(this, icon, Colors.white, "neopix1", 27);
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
  this.addPart(this.colorButtons[3]);


}
B_HLNeopixStrip.prototype = Object.create(B_HLOutputBase.prototype);
B_HLNeopixStrip.prototype.constructor = B_HLNeopixStrip;

// Wait until sensor reaches threshold
function B_HLWaitUntil(x, y) {
  CommandBlock.call(this, x, y, "sensor_3");
  const blockIcon = new BlockIcon(this, VectorPaths.faClockSolid, Colors.white, "clock", 35);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);
  //clap, light, distance, shake
  this.sensorPaths = [VectorPaths.clap, VectorPaths.mjSun, VectorPaths.language, VectorPaths.share]
  this.sensorTypes = ["clap", "light", "distance", "shake"]
  this.sensorSelection = this.sensorPaths[1]
  this.sensorBN = new BlockButton(this);
  this.sensorBN.addSlider("sensor", this.sensorSelection, this.sensorPaths);
  this.addPart(this.sensorBN);
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
        if ((num > this.threshold) || (this.useLessThan && num < this.threshold)) {
          return new ExecutionStatusDone();
        }
      }
      //If there's an error or if the condition hasn't been met, start over.
      this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
    }
  } else {
    let device = DeviceHatchling.getManager().getDevice(0)
    if (device == null) { return new ExecutionStatusError(); }

    let sensor = this.sensorTypes[this.sensorPaths.indexOf(this.sensorSelection)]
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
      case "distance": //TODO: add port button when this sensor is working
        this.threshold = 10
        //port = this.port
        break;
      case "shake": //TODO: shake not working. Also, consider using buttons?
        break;
    }//TODO: since we keep a copy of the sensor data in the Hatchling device, maybe we can skip all this?
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
