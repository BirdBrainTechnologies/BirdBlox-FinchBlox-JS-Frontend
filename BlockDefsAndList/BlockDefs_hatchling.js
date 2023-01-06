/*
 * This file contains the implementations of hatchling blocks that aren't taken
 * from FinchBlox
 */

const HL_Utils = {}
HL_Utils.portColors = ["#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f"]
HL_Utils.addHLButton = function(block) {
  block.port = -1 //unknown
  block.hlButton = new BlockButton(block);
  block.hlButton.addSlider("hatchling", Colors.bbtDarkGray, HL_Utils.portColors)
}
HL_Utils.updatePort = function(block) {
  if (block.hlButton != null) {
    block.port = HL_Utils.portColors.indexOf(block.hlButton.values[0])
  }
}
HL_Utils.findPorts = function(block) {
  let device = DeviceHatchling.getManager().getDevice(0);
  if (block.hlButton != null && device != null) {
    let ports = device.getPortsByType(block.portType)
    console.log("findPorts found:")
    console.log(ports)
    if (ports.length == 1) {
      block.hlButton.updateValue(HL_Utils.portColors[ports[0]], 0)
      block.port = ports[0]
    }
  }
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

function B_HLOutputBase(x, y, category, outputType) {
  this.outputType = outputType
  CommandBlock.call(this, x, y, category);

  HL_Utils.addHLButton(this)
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
    this.value = this.valueBN.values[0]
  }
  if (this.colorButton != null) {
    this.red = this.colorButton.values[0].r;
    this.green = this.colorButton.values[0].g;
    this.blue = this.colorButton.values[0].b;
    this.value = this.red + ":" + this.green + ":" + this.blue
    this.updateColor();
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

function B_HLPositionServo(x, y) {
  this.value = 90; //defaultAngle
  this.valueKey = "angle"
  this.portType = 3
  B_HLOutputBase.call(this, x, y, "motion_3", "positionServo");

  const icon = VectorPaths["faCompassDrafting"];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "pServo", 27);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);

  this.valueBN = new BlockButton(this, this.value);
  this.valueBN.addSlider("angle_right", this.value, [0, 30, 60, 90, 120, 150, 180]);
  this.addPart(this.valueBN);
}
B_HLPositionServo.prototype = Object.create(B_HLOutputBase.prototype);
B_HLPositionServo.prototype.constructor = B_HLPositionServo;

function B_HLRotationServo(x, y) {
  this.value = 50; //defaultSpeed
  this.valueKey = "percent"
  this.portType = 1
  B_HLOutputBase.call(this, x, y, "motion_3", "rotationServo");

  const icon = VectorPaths["faArrowsSpin"];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "rServo", 27);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);

  this.valueBN = new BlockButton(this, this.value);
  this.valueBN.addSlider("percent", this.value, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  this.addPart(this.valueBN);
}
B_HLRotationServo.prototype = Object.create(B_HLOutputBase.prototype);
B_HLRotationServo.prototype.constructor = B_HLRotationServo;

function B_HLSingleNeopix(x, y) {
  this.value = ""
  this.valueKey = "color"
  this.portType = 9
  this.red = 100;
  this.green = 100;
  this.blue = 100;
  B_HLOutputBase.call(this, x, y, "color_3", "singleNeopix");

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
