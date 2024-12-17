/*
 * This file contains the implementations of hatchling blocks that aren't taken
 * from FinchBlox, as well as several utility functions
 *
 * Hatchling specific blocks - These blocks do not need startAction,
 * updateAction, etc. Hatchling only uses the microBlocks vm which
 * has its own runtime.  
 */


const HL_Utils = {}
//                      blue         yellow       sea-green    magenta      white        orange
//HL_Utils.portColors = ["#0000FF", "#FFFF00", "#00FF88", "#FF00FF", "#FFFFFF", "#FF4400"]//["#00f", "#ff0", "#0f0", "#f0f", "#0ff", "#f80"]//["#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f"]
HL_Utils.portNames = ["A", "B", "C", "D", "E", "F"]
HL_Utils.noPort = "X"
HL_Utils.unknownPort = "?"
HL_Utils.symbolDict = {
  "0000001010000001000101110": "bdSymbolHappy", //smiley face
  "0000001010000000111010001": "bdSymbolFrown", //frowny face
  "0101000000001000101000100": "bdSymbolSurprised", //surprise face
  "1010010100111101101011110": "bdSymbolPeace", //OK
  "0111010101111111111110101": "bdSymbolGhost", //alien
  "1111110001100011000111111": "bdSymbolSquare", //square
  "0101011111111110111000100": "bdSymbolHeart", //heart
  "0010001010100010101000100": "bdSymbolDiamond", //diamond
  "0000000000000000000000000": null //off
}
HL_Utils.alphaDict = {
  "0110010010111101001010010": "A", // A
  "1110010010111001001011100": "B", // B
  "0111010000100001000001110": "C", // C
  "1110010010100101001011100": "D", // D
  "1111010000111001000011110": "E", // E
  "1111010000111001000010000": "F", // F
  "0111010000100111000101110": "G", // G
  "1001010010111101001010010": "H", // H
  "1110001000010000100011100": "I", // I
  "0111000100001001010001100": "J", // J - mod
  "1001010100110001010010010": "K", // K
  "1000010000100001000011110": "L", // L
  "1000111011101011000110001": "M", // M
  "1000111001101011001110001": "N", // N
  "0110010010100101001001100": "O", // O
  "1110010010111001000010000": "P", // P
  "0110010010101101001001101": "Q", // Q - mod
  "1110010010111001010010010": "R", // R
  "0110010000011000001011100": "S", // S
  "1111100100001000010000100": "T", // T
  "1000110001100011000101110": "U", // U
  "1000110001100010101000100": "V", // V
  "1000110001101011101110001": "W", // W
  "1000101010001000101010001": "X", // X - mod
  "1000101010001000010000100": "Y", // Y
  "1111100010001000100011111": "Z"  // Z
}
HL_Utils.addHLButton = function(block, portType) {
  block.port = -1 //unknown
  block.hlButton = new BlockButton(block, 14)//14, 10)//12)//10)//15)//20);
  block.hlButton.addPortWidget(portType)
  //block.hlButton.button.unbutton()
  HL_Utils.findPorts(block)
}
HL_Utils.updatePort = function(block) {
  if (block.hlButton != null) {
    block.port = HL_Utils.portNames.indexOf(block.hlButton.values[0])//HL_Utils.portColors.indexOf(block.hlButton.values[0])
    //console.log("update port for " + block.constructor.name + " to " + block.port)

    //If the block is on the canvas, and a port has not been selected by the user, set this port as the user selected port
    if ((block.userSelectedPort == null) && (block.port >= 0) && (block.stack != null) && !block.stack.isDisplayStack) {
      block.userSelectedPort = block.port
      //console.log("updatePort " + ((block.stack != null) ? !block.stack.isDisplayStack : false) + " set user port to " + block.userSelectedPort)
    }
    block.updateActive()
  }
}
HL_Utils.findPorts = function(block) {
  if (block.hlButton == null) {
    return //No point if there is nothing to update
  }

  const blockOnCanvas = ((block.stack != null) ? !block.stack.isDisplayStack : false)
  //console.log("findPorts for " + block.constructor.name + " " + block.portType + " " + blockOnCanvas)
  let device = DeviceHatchling.getManager().getDevice(0);
  if (device != null && device.connected) {

    let ports = device.getPortsByType(block.portType)
    if (ports.length >= 1) {
      let p = ports[0]
      if (ports.length > 1) {
        block.shouldShowPortsPopup = true

        if (block.userSelectedPort != null) {
          //console.log("findPorts " + blockOnCanvas + " userSelectedPort == " + block.userSelectedPort)
          let index = ports.indexOf(block.userSelectedPort)
          if (index > 0) { //we have already set to index zero above
            p = ports[index]
          }
        }
      }

      //console.log("findPorts " + blockOnCanvas + " using port " + p)
      block.hlButton.updateValue(HL_Utils.portNames[p], 0)
      
    }

    if (ports.length == 0) {
      block.hlButton.updateValue(HL_Utils.noPort, 0)
    }

    if (ports.length == 1) {
      block.hlButton.button.unbutton()
    } else {
      block.hlButton.button.rebutton()
    }

    //if we are updating the block associated with the current ports popup, update the popup
    if (device.updateListener != null && device.updateListener.parent == block.hlButton) {
      device.updateListener.value = device.updateListener.parent.values[0]
    }
  } else {
    block.hlButton.button.rebutton()
    block.hlButton.updateValue(HL_Utils.unknownPort, 0)
    //block.hlButton.button.unbutton()
    //block.hlButton.button.hide()
  }
}
HL_Utils.checkActive = function(block) {
  return true
  //console.log("checkActive " + block.constructor.name)
  //Always active in blockPalette
  /*if (block.stack != null && block.stack.isDisplayStack) {
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
  return false*/

  //let portFound = HL_Utils.findPorts(this)
  //console.log(this.constructor.name + " " + portFound + " " + (this.stack == null ? "no stack" : this.stack.isDisplayStack))
  //return portFound
}
/*HL_Utils.setupAction = function(block) {
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
}*/
//Return true if the block is ok to execute
HL_Utils.checkAction = function(block) {
  if (block.port == -1) {
    if (block.hlButton != null) {
      block.hlButton.callbackFunction()
    }

    console.error("Accessory not connected " + block.constructor.name)
    return false
  }
  return true
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

HL_Utils.birdBloxCheckActive = function(block) {
  //console.log("birdBloxCheckActive for " + block.constructor.name)
  let device = DeviceHatchling.getManager().getDevice(0);
  if (device != null) {
    const currentState = device.portStates[block.port]

    if (block.stack != null && block.stack.isDisplayStack && block.portType != currentState) {
      HL_Utils.replaceBlock(block, currentState)
      return (currentState != 0)
    } else {
      return (block.portType == currentState && currentState != 0)
    }

  }
  return false
}
//To replace the block in the palette when something new is plugged in to a port 
HL_Utils.replaceBlock = function(block, currentState) {
  console.log("update block for port " + block.port + " to " + currentState)
  if (!block.stack.isDisplayStack) { return }

  let blockName = ""
  switch (currentState) {
  case 0: 
    blockName = "B_HLEmptyPort" + HL_Utils.portNames[block.port]
    break;
  case 1:
    blockName = "B_HLBBRotationServo"
    break;
  case 3:
    blockName = "B_HLBBPositionServo"
    break;
  case 8:
    blockName = "B_HLBBFairyLights"
    break;
  case 9:
    blockName = "B_HLBBSingleNeopix"
    break;
  case 10:
    blockName = "B_HLBBNeopixStrip"
    break;
  case 14:
    blockName = "B_HLBBDistance"
    break;
  default: //If we don't know this state, just leave things the way they are
    return;
  }

  block.stack.category.replaceBlock(block, blockName)
}
HL_Utils.BBcreateXml = function(block, xmlDoc) {
  let blockXml = Block.prototype.createXml.call(block, xmlDoc)
  XmlWriter.setAttribute(blockXml, "port", block.port)
  return blockXml
}
HL_Utils.BBimportXml = function(blockNode) {
  const type = XmlWriter.getAttribute(blockNode, "type");
  const port = XmlWriter.getAttribute(blockNode, "port")
  let block = new window[type](0, 0, port)
  block.copyFromXml(blockNode)
  return block
}
HL_Utils.createXml = function(block, xmlDoc) {
  let blockXml = Block.prototype.createXml.call(block, xmlDoc)
  XmlWriter.setAttribute(blockXml, "userPort", block.userSelectedPort)
  return blockXml
}
HL_Utils.importXml = function(blockNode) {
  const type = XmlWriter.getAttribute(blockNode, "type");
  const userSelectedPort = parseInt(XmlWriter.getAttribute(blockNode, "userPort"))
  //console.log("*** found user true port " + userSelectedPort)
  let block = new window[type](0, 0, userSelectedPort)
  block.copyFromXml(blockNode)
  HL_Utils.findPorts(block)
  return block
}




function B_HLOutputBase(x, y, category, outputType, portType, userSelectedPort) {
  this.outputType = outputType
  this.portType = portType
  this.userSelectedPort = userSelectedPort
  //if ((this.stack != null) && !this.stack.isDisplayStack) {
    //console.log("*** Set user port true for " + this.constructor.name + " to " + this.userSelectedPort)
  //}
  CommandBlock.call(this, x, y, category);

  HL_Utils.addHLButton(this, portType)
}
B_HLOutputBase.prototype = Object.create(CommandBlock.prototype);
B_HLOutputBase.prototype.constructor = B_HLOutputBase;

/*B_HLOutputBase.prototype.startAction = function() {
  let device = HL_Utils.setupAction(this);
  if (device == null || !this.active) {
    return new ExecutionStatusError();
  }
  if (this.port == -1 || this.port >= HL_Utils.portNames.length) {
    //no port chosen. Or possibly port our of bounds. Todo: pop up window if something is connected?
    return new ExecutionStatusError();
  }
  device.setOutput(this.runMem.requestStatus, this.outputType, this.port, this.value, this.valueKey)
  return new ExecutionStatusRunning();
};*/
B_HLOutputBase.prototype.updateValues = function() {
  HL_Utils.updatePort(this)
  if (this.valueBN != null) {
    if (this.portType == 1) { //rotation servo
      /*let percent = this.valueBN.values[0] * 0.9
      if (percent < 5) { percent = 0 }
      if (this.flip) { percent = -percent - 15 } //rotate counter clockwise
      this.value = percent*/

      this.value = this.valueBN.values[0] * (this.flip ? -1 : 1)

      /*if (percent == 0) {
        this.value = 89 //off signal
      } else if (percent > 100) {
        this.value = 174
      } else if (percent < -100) {
        this.value = 2
      } else if (percent > 0) {
        this.value = Math.round( (percent * 75/100) + 98 ) 
      } else if (percent < 0) {
        this.value = Math.round( 78 + (percent * 75/100) )
      }*/
    } else if (this.portType == 8) { //fairy lights
      let percent = this.valueBN.values[0]
      if (percent > 100) {
        this.value = 254
      } else if (percent < 0) {
        this.value = 0
      } else {
        this.value = Math.round(percent * 254/100)
      }
    /*} else if (this.portType == 3) { //position servo
      this.value = Math.round(this.valueBN.values[0] / 1.5) + 2
      //this.value = this.valueBN.values[0] + 5*/
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
/*B_HLOutputBase.prototype.updateAction = function() {
  if (this.runMem.requestStatus.finished) {
    if (this.runMem.requestStatus.error) {
      return new ExecutionStatusError();
    }
    return new ExecutionStatusDone();
  } else {
    return new ExecutionStatusRunning();
  }
};*/
B_HLOutputBase.prototype.checkActive = function() {
  return HL_Utils.checkActive(this)
}
B_HLOutputBase.prototype.createXml = function(xmlDoc) {
  return HL_Utils.createXml(this, xmlDoc)
}

function B_HLPositionServo(x, y, defaultAngle, userSelectedPort) {
  this.value = defaultAngle //90; //defaultAngle
  this.valueKey = "angle"
  B_HLOutputBase.call(this, x, y, "motion_2", "positionServo", 3, userSelectedPort);

  let icon = VectorPaths["bdPosition"];
  switch (defaultAngle) {
  case 0:
    icon = VectorPaths["bdPosition0"];
    break;
  case 180:
    icon = VectorPaths["bdPosition180"];
    break;
  }
  this.blockIcon = new BlockIcon(this, icon, Colors.white, "pServo", 40);
  this.blockIcon.isEndOfLine = true;
  this.addPart(this.blockIcon);

}
B_HLPositionServo.prototype = Object.create(B_HLOutputBase.prototype);
B_HLPositionServo.prototype.constructor = B_HLPositionServo;

function B_HL_PS_L1(x, y, defaultAngle, userSelectedPort) {
  B_HLPositionServo.call(this, x, y, defaultAngle, userSelectedPort)

  this.blockIcon.addText(defaultAngle.toString() + "°", 28 - (defaultAngle/11.25), 40);
}
B_HL_PS_L1.prototype = Object.create(B_HLPositionServo.prototype)
B_HL_PS_L1.prototype.constructor = B_HL_PS_L1
//MicroBlocks functions
B_HL_PS_L1.prototype.primName = function() { return "hatchlingServoWithDelay" }
B_HL_PS_L1.prototype.argList = function() { 
  let port = HL_Utils.portNames[this.port]
  let duration = 1000
  //let val = this.value + 2 //0 and 1 are off commands

  return [port, this.value, duration] 
}
/*B_HL_PS_L1.prototype.primName = function() { return "blockList" }
B_HL_PS_L1.prototype.argList = function() { 
  let prim = "[h:psv]"
  let port = HL_Utils.portNames[this.port]
  let duration = 1000
  let val = this.value + 2 //0 and 1 are off commands

  return [new BlockArg(prim, [port, val]), 
    new BlockArg("waitMillis", [duration])] 
}*/


function B_HL_PS_L1_0(x, y, userSelectedPort) {
  B_HL_PS_L1.call(this, x, y, 0, userSelectedPort)
}
B_HL_PS_L1_0.prototype = Object.create(B_HL_PS_L1.prototype)
B_HL_PS_L1_0.prototype.constructor = B_HL_PS_L1_0
B_HL_PS_L1_0.importXml = HL_Utils.importXml

function B_HL_PS_L1_90(x, y, userSelectedPort) {
  B_HL_PS_L1.call(this, x, y, 90, userSelectedPort)
}
B_HL_PS_L1_90.prototype = Object.create(B_HL_PS_L1.prototype)
B_HL_PS_L1_90.prototype.constructor = B_HL_PS_L1_90
B_HL_PS_L1_90.importXml = HL_Utils.importXml

function B_HL_PS_L1_180(x, y, userSelectedPort) {
  B_HL_PS_L1.call(this, x, y, 180, userSelectedPort)
}
B_HL_PS_L1_180.prototype = Object.create(B_HL_PS_L1.prototype)
B_HL_PS_L1_180.prototype.constructor = B_HL_PS_L1_180
B_HL_PS_L1_180.importXml = HL_Utils.importXml

function B_HL_PS_L2(x, y, userSelectedPort) {
  B_HLPositionServo.call(this, x, y, 90, userSelectedPort)

  this.valueBN = new BlockButton(this);
  this.valueBN.addSlider("servo", this.value, [0, 180]);
  this.addPart(this.valueBN);
}
B_HL_PS_L2.prototype = Object.create(B_HLPositionServo.prototype)
B_HL_PS_L2.prototype.constructor = B_HL_PS_L2
B_HL_PS_L2.importXml = HL_Utils.importXml
//MicroBlocks functions
B_HL_PS_L2.prototype.primName = function() { return "hatchlingServoWithDelay" }
B_HL_PS_L2.prototype.argList = function() { 
  let port = HL_Utils.portNames[this.port]
  let duration = 0 //duration < 10 causes the servo to stay on
  //let val = this.value + 2 //0 and 1 are off commands

  return [port, this.value, duration] 
}
/*B_HL_PS_L2.prototype.primName = function() { return "[h:psv]" }
B_HL_PS_L2.prototype.argList = function() { return [HL_Utils.portNames[this.port], this.value + 2] }
*/

/**
 * Wave a position servo
 */
function B_HLWave(x, y, userSelectedPort) {
  B_HLOutputBase.call(this, x, y, "motion_2", "wave", 3, userSelectedPort);

  const icon = VectorPaths["bdPositionWW"];
  this.blockIcon = new BlockIcon(this, icon, Colors.white, "pServo", 40);
  this.blockIcon.isEndOfLine = true;
  this.addPart(this.blockIcon);
}
B_HLWave.prototype = Object.create(B_HLOutputBase.prototype);
B_HLWave.prototype.constructor = B_HLWave;
B_HLWave.importXml = HL_Utils.importXml
//MicroBlocks functions
B_HLWave.prototype.primName = function() { return "blockList" }
B_HLWave.prototype.argList = function() { 
  let prim = "hatchlingServoWithDelay"
  let port = HL_Utils.portNames[this.port]
  let duration = 1000
  return [new BlockArg(prim, [port, 90, duration]),  
    new BlockArg(prim, [port, 180, duration])] 
}
/*B_HLWave.prototype.primName = function() { return "blockList" }
B_HLWave.prototype.argList = function() { 
  let prim = "[h:psv]" 
  let port = HL_Utils.portNames[this.port]
  let waitTime = 1000

  return [new BlockArg(prim, [port, 92]), 
    new BlockArg("waitMillis", [waitTime]), 
    new BlockArg(prim, [port, 182]),
    new BlockArg("waitMillis", [waitTime])] 
}*/


function B_HLRotationServo(x, y, flip, userSelectedPort) {
  this.value = 0 //255 //off signal
  this.defaultSpeed = 50;
  this.valueKey = "value"
  this.flip = flip
  B_HLOutputBase.call(this, x, y, "motion_2", "rotationServo", 1, userSelectedPort);

  const icon = flip ? VectorPaths["bdRotateRight"] : VectorPaths["bdRotateLeft"];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "rServo", 45);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);

}
B_HLRotationServo.prototype = Object.create(B_HLOutputBase.prototype);
B_HLRotationServo.prototype.constructor = B_HLRotationServo;


function B_HL_RS_L1(x, y, flip, userSelectedPort) {
  B_HLRotationServo.call(this, x, y, flip, userSelectedPort)

  this.value = this.flip ? -50 : 50 //-60 : 45
}
B_HL_RS_L1.prototype = Object.create(B_HLRotationServo.prototype);
B_HL_RS_L1.prototype.constructor = B_HL_RS_L1;
//MicroBlocks functions
B_HL_RS_L1.prototype.primName = function() { return "hatchlingMotorWithDelay" }
B_HL_RS_L1.prototype.argList = function() { 
  let port = HL_Utils.portNames[this.port]
  let duration = 1000

  return [port, this.value, duration]
}
/*B_HL_RS_L1.prototype.primName = function() { return "blockList" }
B_HL_RS_L1.prototype.argList = function() { 
  let prim = "[h:rsv]"
  let port = HL_Utils.portNames[this.port]
  let duration = 1000

  return [new BlockArg(prim, [port, this.value]), 
    new BlockArg("waitMillis", [duration]), 
    new BlockArg(prim, [port, 0])] 
}*/

function B_HL_RS_L1_CW(x, y, userSelectedPort) {
  B_HL_RS_L1.call(this, x, y, false, userSelectedPort)
}
B_HL_RS_L1_CW.prototype = Object.create(B_HL_RS_L1.prototype);
B_HL_RS_L1_CW.prototype.constructor = B_HL_RS_L1_CW;
B_HL_RS_L1_CW.importXml = HL_Utils.importXml

function B_HL_RS_L1_CC(x, y, userSelectedPort) {
  B_HL_RS_L1.call(this, x, y, true, userSelectedPort)
}
B_HL_RS_L1_CC.prototype = Object.create(B_HL_RS_L1.prototype);
B_HL_RS_L1_CC.prototype.constructor = B_HL_RS_L1_CC;
B_HL_RS_L1_CC.importXml = HL_Utils.importXml

function B_HL_RS_L2(x, y, flip, userSelectedPort) {
  B_HLRotationServo.call(this, x, y, flip, userSelectedPort)

  this.valueBN = new BlockButton(this);
  this.valueBN.addSlider("motor_" + flip, this.defaultSpeed, [0, 100]);
  this.addPart(this.valueBN);
}
B_HL_RS_L2.prototype = Object.create(B_HLRotationServo.prototype);
B_HL_RS_L2.prototype.constructor = B_HL_RS_L2;
//MicroBlocks functions
B_HL_RS_L2.prototype.primName = function() { return "hatchlingMotorWithDelay" }
B_HL_RS_L2.prototype.argList = function() { 
  let port = HL_Utils.portNames[this.port]
  let duration = 0 //duration < 10 causes the motor to stay on

  return [port, this.value, duration]
}
/*B_HL_RS_L2.prototype.primName = function() { return "[h:rsv]" }
B_HL_RS_L2.prototype.argList = function() { return [HL_Utils.portNames[this.port], this.value] }
*/

function B_HL_RS_L2_CW(x, y, userSelectedPort) {
  B_HL_RS_L2.call(this, x, y, false, userSelectedPort)
}
B_HL_RS_L2_CW.prototype = Object.create(B_HL_RS_L2.prototype);
B_HL_RS_L2_CW.prototype.constructor = B_HL_RS_L2_CW;
B_HL_RS_L2_CW.importXml = HL_Utils.importXml

function B_HL_RS_L2_CC(x, y, userSelectedPort) {
  B_HL_RS_L2.call(this, x, y, true, userSelectedPort)
}
B_HL_RS_L2_CC.prototype = Object.create(B_HL_RS_L2.prototype);
B_HL_RS_L2_CC.prototype.constructor = B_HL_RS_L2_CC;
B_HL_RS_L2_CC.importXml = HL_Utils.importXml


function B_HLSingleNeopix(x, y, defaultColor, userSelectedPort, duration) {
  this.value = defaultColor //"#FFFFFF"
  this.valueKey = "color"
  this.duration = duration
  /*this.red = 100;
  this.green = 100;
  this.blue = 100;*/
  B_HLOutputBase.call(this, x, y, "color_2", "singleNeopix", 9, userSelectedPort);

  const icon = VectorPaths["bdLightBulb"];
  this.blockIcon = new BlockIcon(this, icon, Colors.white, "sNeopix", 45);
  this.blockIcon.isEndOfLine = true;
  this.addPart(this.blockIcon);

}
B_HLSingleNeopix.prototype = Object.create(B_HLOutputBase.prototype);
B_HLSingleNeopix.prototype.constructor = B_HLSingleNeopix;
//MicroBlocks functions
B_HLSingleNeopix.prototype.primName = function() { return "hatchlingNeopixelWithDelay" }
B_HLSingleNeopix.prototype.argList = function() { 
  let port = HL_Utils.portNames[this.port]
  let rgb = Colors.hexToRgb(this.value)
  for (let i = 0; i < rgb.length; i++) {
    rgb[i] = Math.round(rgb[i] * 100/255)
  }
  return [port, rgb[0], rgb[1], rgb[2], this.duration]
}

B_HLSingleNeopix.prototype.updateColor = function() {
  /*const s = 255 / 100;
  this.colorHex = Colors.rgbToHex(this.red * s, this.green * s, this.blue * s);
  GuiElements.update.color(this.blockIcon.icon.pathE, this.colorHex);*/
  GuiElements.update.color(this.blockIcon.icon.pathE, this.value)
}

function B_HL_SN_L1(x, y, color, userSelectedPort) {
  B_HLSingleNeopix.call(this, x, y, color, userSelectedPort, 1000)

  //this.updateColor()
  this.blockIcon.addIndicatorCircle(this.value, 40, 50)
}
B_HL_SN_L1.prototype = Object.create(B_HLSingleNeopix.prototype);
B_HL_SN_L1.prototype.constructor = B_HL_SN_L1;
//MicroBlocks functions
/*B_HL_SN_L1.prototype.primName = function() { return "hatchlingNeopixelWithDelay" }
B_HL_SN_L1.prototype.argList = function() { 
  let port = HL_Utils.portNames[this.port]
  let duration = 1000
  let rgb = Colors.hexToRgb(this.value)

  return [port, rgb[0], rgb[1], rgb[2], duration]
}*/
/*B_HL_SN_L1.prototype.primName = function() { return "blockList" }
B_HL_SN_L1.prototype.argList = function() { 
  let prim = "[h:np]"
  let port = HL_Utils.portNames[this.port]
  let duration = 1000
  let rgb = Colors.hexToRgb(this.value)

  return [new BlockArg(prim, [port, rgb[0], rgb[1], rgb[2]]), 
    new BlockArg("waitMillis", [duration]), 
    new BlockArg(prim, [port, 0, 0, 0])] 
}*/

function B_HL_SN_L1_Red(x, y, userSelectedPort) {
  B_HL_SN_L1.call(this, x, y, "#FF0000", userSelectedPort)
}
B_HL_SN_L1_Red.prototype = Object.create(B_HL_SN_L1.prototype);
B_HL_SN_L1_Red.prototype.constructor = B_HL_SN_L1_Red
B_HL_SN_L1_Red.importXml = HL_Utils.importXml

function B_HL_SN_L1_Green(x, y, userSelectedPort) {
  B_HL_SN_L1.call(this, x, y, "#00FF00", userSelectedPort)
}
B_HL_SN_L1_Green.prototype = Object.create(B_HL_SN_L1.prototype);
B_HL_SN_L1_Green.prototype.constructor = B_HL_SN_L1_Green
B_HL_SN_L1_Green.importXml = HL_Utils.importXml

function B_HL_SN_L1_Blue(x, y, userSelectedPort) {
  B_HL_SN_L1.call(this, x, y, "#0000FF", userSelectedPort)
}
B_HL_SN_L1_Blue.prototype = Object.create(B_HL_SN_L1.prototype);
B_HL_SN_L1_Blue.prototype.constructor = B_HL_SN_L1_Blue
B_HL_SN_L1_Blue.importXml = HL_Utils.importXml

function B_HL_SN_L1_White(x, y, userSelectedPort) {
  B_HL_SN_L1.call(this, x, y, "#FFFFFF", userSelectedPort)
}
B_HL_SN_L1_White.prototype = Object.create(B_HL_SN_L1.prototype);
B_HL_SN_L1_White.prototype.constructor = B_HL_SN_L1_White
B_HL_SN_L1_White.importXml = HL_Utils.importXml

function B_HL_SN_L2(x, y, userSelectedPort) {
  B_HLSingleNeopix.call(this, x, y, "#FFFFFF", userSelectedPort, 0)

  //this.colorButton = new BlockButton(this);
  //this.colorButton.addSlider("color", { r: this.red, g: this.green, b: this.blue });
  /*this.colorButton.addSlider("color_red", this.red)
  this.colorButton.addSlider("color_green", this.green)
  this.colorButton.addSlider("color_blue", this.blue)*/
  this.valueBN = new BlockButton(this)
  this.valueBN.addColorPicker(this.value)
  this.addPart(this.valueBN);
}
B_HL_SN_L2.prototype = Object.create(B_HLSingleNeopix.prototype);
B_HL_SN_L2.prototype.constructor = B_HL_SN_L2;
B_HL_SN_L2.importXml = HL_Utils.importXml
//MicroBlocks functions
/*B_HL_SN_L2.prototype.primName = function() { return "hatchlingNeopixelWithDelay" }
B_HL_SN_L2.prototype.argList = function() { 
  let duration = 0 //duration < 10 causes the neopix to stay on
  let rgb = Colors.hexToRgb(this.value)
  return [HL_Utils.portNames[this.port], rgb[0], rgb[1], rgb[2], duration] 
}*/
// B_HL_SN_L2.prototype.primName = function() { return "[h:np]" }
// B_HL_SN_L2.prototype.argList = function() { 
//   /*let hex = this.value.slice(1).toLowerCase()
//   let r = hex.charAt(0) + '' + hex.charAt(1);
//   let g = hex.charAt(2) + '' + hex.charAt(3);
//   let b = hex.charAt(4) + '' + hex.charAt(5);
//   r = parseInt(r, 16);
//   g = parseInt(g, 16);
//   b = parseInt(b, 16);*/
//   let rgb = Colors.hexToRgb(this.value)
//   return [HL_Utils.portNames[this.port], rgb[0], rgb[1], rgb[2]] 
// }

/**
 * This block just turns the single neopixel off. Level 2 only
 */
function B_HLSingleNeopixOff(x, y, userSelectedPort) {
  this.valueKey = "color"

  let category = "color_2"
  B_HLOutputBase.call(this, x, y, category, "singleNeopix", 9, userSelectedPort);

  const icon = VectorPaths["bdLightBulb"];
  this.blockIcon = new BlockIcon(this, icon, Colors.white, "sNeopix", 45);
  this.blockIcon.negate(Colors.blockOutline["color_2"])
  this.blockIcon.isEndOfLine = true;
  this.addPart(this.blockIcon);

}
B_HLSingleNeopixOff.prototype = Object.create(B_HLOutputBase.prototype);
B_HLSingleNeopixOff.prototype.constructor = B_HLSingleNeopixOff;
//MicroBlocks functions
B_HLSingleNeopixOff.prototype.primName = function() { return "hatchlingNeopixelWithDelay" }
B_HLSingleNeopixOff.prototype.argList = function() { 
  return [HL_Utils.portNames[this.port], 0, 0, 0, 0]
}


function B_HLNeopixStrip(x, y, userSelectedPort) {
  this.value = ""
  this.valueKey = "colors"
  this.red = 100;
  this.green = 100;
  this.blue = 100;
  this.blockIcons = []
  this.colorButtons = []

  B_HLOutputBase.call(this, x, y, "color_2", "neopixStrip", 10, userSelectedPort);

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
B_HLNeopixStrip.importXml = HL_Utils.importXml
//MicroBlocks functions
B_HLNeopixStrip.prototype.primName = function() { return "[h:nps]" } //TODO: update to new format
B_HLNeopixStrip.prototype.argList = function() { return [HL_Utils.portNames[this.port], 'all', this.red, this.green, this.blue] }

function B_HLFairyLights(x, y, userSelectedPort) {
  this.value = 254
  this.valueKey = "value"

  B_HLOutputBase.call(this, x, y, "color_2", "fairyLights", 8, userSelectedPort);

  const icon = VectorPaths["bdFairyLights"];
  this.blockIcon = new BlockIcon(this, icon, Colors.white, "fairyLights", 45);
  this.blockIcon.isEndOfLine = true;
  this.addPart(this.blockIcon);

}
B_HLFairyLights.prototype = Object.create(B_HLOutputBase.prototype);
B_HLFairyLights.prototype.constructor = B_HLFairyLights;

function B_HLFairyLightsL1(x, y, userSelectedPort) {
  B_HLFairyLights.call(this, x, y, userSelectedPort)
}
B_HLFairyLightsL1.prototype = Object.create(B_HLFairyLights.prototype);
B_HLFairyLightsL1.prototype.constructor = B_HLFairyLightsL1;
B_HLFairyLightsL1.importXml = HL_Utils.importXml
//MicroBlocks functions
B_HLFairyLightsL1.prototype.primName = function() { return "hatchlingFairyLightWithDelay" }
B_HLFairyLightsL1.prototype.argList = function() { 
  let port = HL_Utils.portNames[this.port]
  let duration = 1000

  return [port, this.value, duration]
}
/*B_HLFairyLightsL1.prototype.primName = function() { return "blockList" }
B_HLFairyLightsL1.prototype.argList = function() { 
  let prim = "[h:fl]"
  let port = HL_Utils.portNames[this.port]
  let duration = 1000

  return [new BlockArg(prim, [port, this.value]), 
    new BlockArg("waitMillis", [duration]), 
    new BlockArg(prim, [port, 0])] 
}*/

function B_HLFairyLightsL2(x, y, userSelectedPort) {
  B_HLFairyLights.call(this, x, y, userSelectedPort)

  this.valueBN = new BlockButton(this);
  this.valueBN.addSlider("light", 100, [0, 100]);
  this.addPart(this.valueBN);
}
B_HLFairyLightsL2.prototype = Object.create(B_HLFairyLights.prototype);
B_HLFairyLightsL2.prototype.constructor = B_HLFairyLightsL2;
B_HLFairyLightsL2.importXml = HL_Utils.importXml
//MicroBlocks functions
B_HLFairyLightsL2.prototype.primName = function() { return "hatchlingFairyLightWithDelay" }
B_HLFairyLightsL2.prototype.argList = function() { 
  return [HL_Utils.portNames[this.port], this.value, 0] 
}
//B_HLFairyLightsL2.prototype.primName = function() { return "[h:fl]" }
//B_HLFairyLightsL2.prototype.argList = function() { return [HL_Utils.portNames[this.port], this.value] }


function B_HLAlphabet(x, y) {
  this.useAlphabet = true

  B_FBLedArrayL2.call(this, x, y)
}
B_HLAlphabet.prototype = Object.create(B_FBLedArrayL2.prototype);
B_HLAlphabet.prototype.constructor = B_HLAlphabet;

// Wait until sensor reaches threshold
function B_HLWaitUntil(x, y, usePort, sensor, userSelectedPort) {
  CommandBlock.call(this, x, y, "sensor_2");
  this.usePort = usePort
  this.sensor = sensor

  if (usePort) {
    HL_Utils.addHLButton(this, this.portType)
    this.userSelectedPort = userSelectedPort
    //const blockIcon = new BlockIcon(this, VectorPaths.faClockSolid, Colors.white, "clock", 20);
    //this.addPart(blockIcon);
    /*const blockIcon2 = new BlockIcon(this, VectorPaths.faRuler, Colors.white, "ruler", 35);//20);
    blockIcon2.isEndOfLine = true;
    this.addPart(blockIcon2);*/
    //distance only

  } else {
    /*const blockIcon = new BlockIcon(this, VectorPaths.faClockSolid, Colors.white, "clock", 35);
    blockIcon.isEndOfLine = true;
    this.addPart(blockIcon);*/
    //clap, light, shake
    /*this.sensorPaths = [VectorPaths.clap, VectorPaths.mjSun, VectorPaths.share]
    this.sensorTypes = ["clap", "light", "shake"]
    this.sensorSelection = this.sensorPaths[1]
    this.sensorBN = new BlockButton(this);
    this.sensorBN.addSlider("sensor", this.sensorSelection, this.sensorPaths);
    this.addPart(this.sensorBN);*/
  }
  let sensorPaths = [VectorPaths.bdRuler, VectorPaths.bdClap, VectorPaths.bdNoLight, VectorPaths.bdButton]
  let sensorTypes = ["distance", "clap", "light", "button"]
  let path = sensorPaths[sensorTypes.indexOf(this.sensor)]

  const blockIcon = new BlockIcon(this, path, Colors.white, "sensor", 45)
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);
}
B_HLWaitUntil.prototype = Object.create(CommandBlock.prototype);
B_HLWaitUntil.prototype.constructor = B_HLWaitUntil;
//MicroBlocks functions
B_HLWaitUntil.prototype.primName = function() { return "waitUntil" }
B_HLWaitUntil.prototype.argList = function() { 
  let args = []
  /*if(!this.usePort) {
    sensor = this.sensorTypes[this.sensorPaths.indexOf(this.sensorSelection)]
  } else {
    args = [HL_Utils.portNames[this.port]]
  }*/
  if (this.usePort) {
    args = [HL_Utils.portNames[this.port]]
  }
  let prim = null
  let threshold = 0
  let operator = "<"
  switch (this.sensor) {
  case "distance":
    prim = "[h:ds]"
    threshold = 20
    break;
  case "light":
    prim = "[display:lightLevel]"
    threshold = 200 //150
    break;
  case "clap":
    prim = "[h:cl]" //number of claps since this function was last called
    threshold = 0
    operator = ">"
    break;
  case "button":
    prim = "[h:bt]" //number of times either button A or B on the micro:bit was pressed since last called
    threshold = 0
    operator = ">"
    break;
  default:
    console.error("WaitUntil block: Unknown sensor " + this.sensor)
  }
  if (prim == null) { return [] }

  return [new BlockArg(operator, [new BlockArg(prim, args), threshold])]

  /*return [{
    primName: function() { return "<" },
    argList: function() { return [{
      primName: function() { return prim },
      argList: function () { return args }
    }, threshold]}
  }] */
}

/*B_HLWaitUntil.prototype.startAction = function() {
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

    //let sensor = "distance"
    //if(!this.usePort) {
    //  sensor = this.sensorTypes[this.sensorPaths.indexOf(this.sensorSelection)]
    //}
    
    let sensor = this.sensor
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
        //this.threshold = this.distance
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
}*/
B_HLWaitUntil.prototype.updateValues = function() {
  if (this.sensorBN != null) {
    this.sensorSelection = this.sensorBN.values[0];
  }
}

function B_HLWaitUntilClap(x, y) {
  B_HLWaitUntil.call(this, x, y, false, "clap")
}
B_HLWaitUntilClap.prototype = Object.create(B_HLWaitUntil.prototype);
B_HLWaitUntilClap.prototype.constructor = B_HLWaitUntilClap;

function B_HLWaitUntilLight(x, y) {
  B_HLWaitUntil.call(this, x, y, false, "light")
}
B_HLWaitUntilLight.prototype = Object.create(B_HLWaitUntil.prototype);
B_HLWaitUntilLight.prototype.constructor = B_HLWaitUntilLight;

function B_HLWaitUntilButton(x, y) {
  B_HLWaitUntil.call(this, x, y, false, "button")
}
B_HLWaitUntilButton.prototype = Object.create(B_HLWaitUntil.prototype);
B_HLWaitUntilButton.prototype.constructor = B_HLWaitUntilButton;


//Wait until for port connected sensors
function B_HLWaitUntilPort(x, y, sensor, userSelectedPort) {

  B_HLWaitUntil.call(this, x, y, true, sensor, userSelectedPort)

  this.thresholdBN = new BlockButton(this);
  this.thresholdBN.addSlider(this.sensorType, this.threshold, this.blockOptions);
  this.addPart(this.thresholdBN);
}
B_HLWaitUntilPort.prototype = Object.create(B_HLWaitUntil.prototype);
B_HLWaitUntilPort.prototype.constructor = B_HLWaitUntilPort;

B_HLWaitUntilPort.prototype.updateValues = function() {
  HL_Utils.updatePort(this)
  if (this.thresholdBN != null) {
    this.threshold = this.thresholdBN.values[0]
  }
}
B_HLWaitUntilPort.prototype.checkActive = function() {
  return HL_Utils.checkActive(this)
}

function B_HLWaitUntilDistance(x, y, userSelectedPort) {
  this.portType = 14
  this.sensorType = "distance"
  this.threshold = 10 //How close something has to be to trigger the block
  this.blockOptions = [5, 100]

  B_HLWaitUntilPort.call(this, x, y, "distance", userSelectedPort)
}
B_HLWaitUntilDistance.prototype = Object.create(B_HLWaitUntilPort.prototype);
B_HLWaitUntilDistance.prototype.constructor = B_HLWaitUntilDistance;
B_HLWaitUntilDistance.importXml = HL_Utils.importXml

/*function B_HLWaitUntilDial(x, y, userSelectedPort) {

}
B_HLWaitUntilDial.prototype = Object.create(B_HLWaitUntilPort.prototype);
B_HLWaitUntilDial.prototype.constructor = B_HLWaitUntilDial;
B_HLWaitUntilDial.importXml = HL_Utils.importXml*/

/*function B_HLWaitUntilPortButton(x, y, userSelectedPort) {

}
B_HLWaitUntilPortButton.prototype = Object.create(B_HLWaitUntilPort.prototype);
B_HLWaitUntilPortButton.prototype.constructor = B_HLWaitUntilPortButton;
B_HLWaitUntilPortButton.importXml = HL_Utils.importXml*/


// function B_HLPortBlock(x, y, port) {
//   this.port = port 
//   CommandBlock.call(this, x, y, "portblocks");

//   this.updateBlockType(0)
//   this.updateActive()
// }
// B_HLPortBlock.prototype = Object.create(CommandBlock.prototype)
// B_HLPortBlock.prototype.constructor = B_HLPortBlock
// B_HLPortBlock.prototype.updateConnectionStatus = function() {
//   this.updateActive()
// }
// B_HLPortBlock.prototype.checkActive = function() {
//   let device = DeviceHatchling.getManager().getDevice(0);
//   if (device != null) {
//     const currentState = device.portStates[this.port]

//     /*// Update blocks on the canvas and in block palette
//     if (this.portType != currentState) {
//         this.updateBlockType(currentState)
//     }
//     return (currentState != 0)*/


//     //just update the block if it is in the block palette
//     if (this.stack != null && this.stack.isDisplayStack) {
//       if (this.portType != currentState) {
//         this.updateBlockType(currentState)
//       }
//       return (currentState != 0)  //Nothing attached to port for type == 0
//     } else {
//       return (currentState != 0) && (this.portType == currentState)
//     }

//   }
//   return false
// }
// B_HLPortBlock.prototype.updateBlockType = function(newPortType) {
//   this.portType = newPortType
//   this.outputType = null
//   this.sensorType = null
//   this.removeParts()
//   if (this.portType == 0) { //Nothing attached, at port name label
//     this.isStatic = true //This block cannot be dragged from the block palette
//     this.icon = new LabelText(this, HL_Utils.portNames[this.port], HL_Utils.portColors[this.port])
//   } else {
//     this.isStatic = false
//     let iconName = null
//     let iconH = 0
//     switch(this.portType) {
//     case 1: iconName = "bsArrowClockwise"; iconH = 30; break; //rotation servo
//     case 3: iconName = "bsSpeedometer2"; iconH = 27; break; //position servo
//     case 8: iconName = "bsStars"; iconH = 27; break; //fairy lights
//     case 9: iconName = "faLightbulb"; iconH = 27; break; //single neopixel
//     case 10: iconName = "faLightbulb"; iconH = 25; break; //4 neopixel strip
//     case 14: iconName = "faRuler"; iconH = 20; break; //distance sensor
//     default:
//       console.error("PortBlock unsupported port type " + this.portType)
//       return
//     }
//     this.icon = new BlockIcon(this, VectorPaths[iconName], HL_Utils.portColors[this.port], iconName, iconH)
//   }
//   this.icon.isEndOfLine = true
//   this.addPart(this.icon)

//   if (this.portType != 0) {
//     this.button = new BlockButton(this)
//     switch(this.portType) {
//     case 1:
//       this.outputType = "rotationServo"
//       this.value = 255 //off signal
//       this.valueKey = "value"
//       this.button.addSlider("percent", 0, [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100])
//       break;
//     case 3:
//       this.outputType = "positionServo"
//       this.value = 90; //defaultAngle
//       this.valueKey = "angle"
//       this.button.addSlider("angle_right", 90, [0, 30, 60, 90, 120, 150, 180, 210, 240, 270])
//       break;
//     case 8:
//       this.outputType = "fairyLights"
//       this.value = ""
//       this.valueKey = "value"
//       this.button.addSlider("percent", 50, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
//       break;
//     case 9:
//       this.outputType = "singleNeopix"
//       this.value = ""
//       this.valueKey = "color"
//       this.button.addSlider("color_red", 100)
//       this.button.addSlider("color_green", 100)
//       this.button.addSlider("color_blue", 100)
//       break;
//     case 10:
//       this.outputType = "neopixStrip"
//       this.value = ""
//       this.valueKey = "colors"
//       this.button.addSlider("color_red", 100)
//       this.button.addSlider("color_green", 100)
//       this.button.addSlider("color_blue", 100)
//       break;
//     case 14:
//       this.sensorType = "distance"
//       this.value = 10
//       this.useLessThan = true
//       this.button.addSlider("distance", 10, [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
//       break;
//     }
//     this.addPart(this.button)
//   }
//   if (this.stack != null) {
//     this.stack.updateDim()
//   }
// }
// B_HLPortBlock.prototype.updateValues = function() {
//   let percent = null
//   switch(this.portType) {
//   case 1:
//     percent = this.button.values[0]
//     if (percent == 0) {
//       this.value = 89 //off signal
//     } else if (percent > 100) {
//       this.value = 174
//     } else if (percent < -100) {
//       this.value = 2
//     } else if (percent > 0) {
//       this.value = Math.round( (percent * 75/100) + 98 ) 
//     } else if (percent < 0) {
//       this.value = Math.round( 78 + (percent * 75/100) )
//     }
//     break;
//   case 3:
//     this.value = Math.round(this.button.values[0] / 1.5) + 2
//     break;
//   case 8:
//     percent = this.button.values[0]
//     if (percent > 100) {
//       this.value = 254
//     } else if (percent < 0) {
//       this.value = 0
//     } else {
//       this.value = Math.round(percent * 254/100)
//     }
//     break;
//   case 9:
//     if (this.button.widgets.length == 3) {
//       const red = this.button.values[0];
//       const green = this.button.values[1];
//       const blue = this.button.values[2];
//       this.value = Math.round(red*2.55) + ":" + Math.round(green*2.55) + ":" + Math.round(blue*2.55)
//     }
//     break;
//   case 10:
//     //TODO
//     break;
//   case 14:
//     this.value = this.button.values[0]
//     break;
//   default:
//     console.error("cannot update values for unsupported port type " + this.portType)
//     break;
//   }
// }

// B_HLPortBlock.prototype.startAction = function() {
//   if (this.portType == 0) {
//     return new ExecutionStatusDone();
//   }

//   let device = HL_Utils.setupAction(this)
//   if (device == null || !this.active) {
//     return new ExecutionStatusError();
//   }

//   if (this.portType != 14) { //Not a sensor type
//     device.setOutput(this.runMem.requestStatus, this.outputType, this.port, this.value, this.valueKey)
//   }

//   return new ExecutionStatusRunning();
// }
// B_HLPortBlock.prototype.updateAction = function() {
//   if (this.portType == 14) { //Sensors
//     let device = DeviceHatchling.getManager().getDevice(0)
//     if (device == null) { return new ExecutionStatusError(); }
      
//     const num = device.getSensorValue(this.port)
//     console.log(num)
//     if ((!this.useLessThan && num > this.value) || (this.useLessThan && num < this.value)) {
//       return new ExecutionStatusDone();
//     }

//     return new ExecutionStatusRunning();
//   } else {
//     if (this.runMem.requestStatus.finished) {
//       if (this.runMem.requestStatus.error) {
//         return new ExecutionStatusError();
//       }
//       return new ExecutionStatusDone();
//     } else {
//       return new ExecutionStatusRunning();
//     }
//   }

// }

// function B_HLPortA(x, y) {
//   B_HLPortBlock.call(this, x, y, 0)
// }
// B_HLPortA.prototype = Object.create(B_HLPortBlock.prototype)
// B_HLPortA.prototype.constructor = B_HLPortA

// function B_HLPortB(x, y) {
//   B_HLPortBlock.call(this, x, y, 1)
// }
// B_HLPortB.prototype = Object.create(B_HLPortBlock.prototype)
// B_HLPortB.prototype.constructor = B_HLPortB

// function B_HLPortC(x, y) {
//   B_HLPortBlock.call(this, x, y, 2)
// }
// B_HLPortC.prototype = Object.create(B_HLPortBlock.prototype)
// B_HLPortC.prototype.constructor = B_HLPortC

// function B_HLPortD(x, y) {
//   B_HLPortBlock.call(this, x, y, 3)
// }
// B_HLPortD.prototype = Object.create(B_HLPortBlock.prototype)
// B_HLPortD.prototype.constructor = B_HLPortD

// function B_HLPortE(x, y) {
//   B_HLPortBlock.call(this, x, y, 4)
// }
// B_HLPortE.prototype = Object.create(B_HLPortBlock.prototype)
// B_HLPortE.prototype.constructor = B_HLPortE

// function B_HLPortF(x, y) {
//   B_HLPortBlock.call(this, x, y, 5)
// }
// B_HLPortF.prototype = Object.create(B_HLPortBlock.prototype)
// B_HLPortF.prototype.constructor = B_HLPortF


/*** BirdBlox Style Blocks  ***/

function B_HLEmptyPort(x, y, port) {
  this.port = port 
  this.portType = 0

  ReporterBlock.call(this, x, y) //By leaving the category empty, we can make a sort of ghost block
  this.isStatic = true //This block cannot be dragged from the block palette

  const labelText = "( " + Language.getStr("port") + " " + HL_Utils.portNames[this.port] + " " + Language.getStr("is_empty") + " )"
  const label = new LabelText(this, labelText, Colors.ballyGray)
  this.addPart(label)
}
B_HLEmptyPort.prototype = Object.create(ReporterBlock.prototype);
B_HLEmptyPort.prototype.constructor = B_HLEmptyPort;
B_HLEmptyPort.prototype.checkActive = function() {
  return HL_Utils.birdBloxCheckActive(this)
  //return true //empty ports don't do anything but should not be marked inactive either
}

function B_HLEmptyPortA(x, y) {
  B_HLEmptyPort.call(this, x, y, 0);
}
B_HLEmptyPortA.prototype = Object.create(B_HLEmptyPort.prototype);
B_HLEmptyPortA.prototype.constructor = B_HLEmptyPortA;

function B_HLEmptyPortB(x, y) {
  B_HLEmptyPort.call(this, x, y, 1);
}
B_HLEmptyPortB.prototype = Object.create(B_HLEmptyPort.prototype);
B_HLEmptyPortB.prototype.constructor = B_HLEmptyPortB;

function B_HLEmptyPortC(x, y) {
  B_HLEmptyPort.call(this, x, y, 2);
}
B_HLEmptyPortC.prototype = Object.create(B_HLEmptyPort.prototype);
B_HLEmptyPortC.prototype.constructor = B_HLEmptyPortC;

function B_HLEmptyPortD(x, y) {
  B_HLEmptyPort.call(this, x, y, 3);
}
B_HLEmptyPortD.prototype = Object.create(B_HLEmptyPort.prototype);
B_HLEmptyPortD.prototype.constructor = B_HLEmptyPortD;

function B_HLEmptyPortE(x, y) {
  B_HLEmptyPort.call(this, x, y, 4);
}
B_HLEmptyPortE.prototype = Object.create(B_HLEmptyPort.prototype);
B_HLEmptyPortE.prototype.constructor = B_HLEmptyPortE;

function B_HLEmptyPortF(x, y) {
  B_HLEmptyPort.call(this, x, y, 5);
}
B_HLEmptyPortF.prototype = Object.create(B_HLEmptyPort.prototype);
B_HLEmptyPortF.prototype.constructor = B_HLEmptyPortF;


/**
 * Blocks for the control of hatchling accessories plugged in to ports 
 */
function B_HLBirdBloxOutput(x, y, outputType, portType, port, minVal, maxVal) {
  this.outputType = outputType
  this.portType = portType
  this.port = port
  this.minVal = minVal
  this.maxVal = maxVal
  this.positive = (this.minVal >= 0)
  if (this.port == null) { console.error("Port must be specified") }

  CommandBlock.call(this, x, y, "ports")//DeviceHatchling.getDeviceTypeId());

  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));
  this.addPart(new LabelText(this, (Language.getStr("port") + " " + HL_Utils.portNames[this.port]) ))
}
B_HLBirdBloxOutput.prototype = Object.create(CommandBlock.prototype);
B_HLBirdBloxOutput.prototype.constructor = B_HLBirdBloxOutput;

/*B_HLBirdBloxOutput.prototype.startAction = function() {
  let device = HL_Utils.setupAction(this);
  if (device == null || !this.active) {
    return new ExecutionStatusError();
  }
  if (this.port == -1 || this.port >= HL_Utils.portColors.length) {
    //no port chosen. Or possibly port our of bounds. Todo: pop up window if something is connected?
    return new ExecutionStatusError();
  }
  let userValue = 0
  if (this.portType != 10) { 
    userValue = this.slots[1].getData().getValueInR(this.minVal, this.maxVal, this.positive, true); 
  }
  switch(this.portType) {
  case 1:
    if (userValue == 0) {
      this.value = 89 //off signal
    } else if (userValue > 0) {
      this.value = Math.round( (userValue * 75/100) + 98 ) 
    } else {
      this.value = Math.round( 78 + (userValue * 75/100) )
    }
    break;
  case 3:
    this.value = Math.round(userValue / 1.5) + 2
    break;
  case 8:
    this.value = Math.round(userValue * 254/100)
    break;
  case 9:
    let userValue2 = this.slots[2].getData().getValueInR(this.minVal, this.maxVal, this.positive, true);
    let userValue3 = this.slots[3].getData().getValueInR(this.minVal, this.maxVal, this.positive, true);
    this.value = Math.round(userValue*2.55) + ":" + Math.round(userValue2*2.55) + ":" + Math.round(userValue3*2.55)
    break;
  case 10:
    let place = this.slots[1].getData().getValue()
    let r = this.slots[2].getData().getValueInR(this.minVal, this.maxVal, this.positive, true);
    let g = this.slots[3].getData().getValueInR(this.minVal, this.maxVal, this.positive, true);
    let b = this.slots[4].getData().getValueInR(this.minVal, this.maxVal, this.positive, true);
    this.value = Math.round(r*2.55) + "," + Math.round(g*2.55) + "," + Math.round(b*2.55) + "," + place
    break;
  default:
    this.value = userValue
    break;
  }
  device.setOutput(this.runMem.requestStatus, this.outputType, this.port, this.value, this.valueKey)
  return new ExecutionStatusRunning();
};
B_HLBirdBloxOutput.prototype.updateAction = function() {
  if (this.runMem.requestStatus.finished) {
    if (this.runMem.requestStatus.error) {
      return new ExecutionStatusError();
    }
    return new ExecutionStatusDone();
  } else {
    return new ExecutionStatusRunning();
  }
};*/
B_HLBirdBloxOutput.prototype.checkActive = function() {
  return HL_Utils.birdBloxCheckActive(this)
}
B_HLBirdBloxOutput.prototype.createXml = function(xmlDoc) {
  return HL_Utils.BBcreateXml(this, xmlDoc)
}


function B_HLBBRotationServo(x, y, port) {
  this.defaultSpeed = 50;
  this.valueKey = "value"
  B_HLBirdBloxOutput.call(this, x, y, "rotationServo", 1, port, -100, 100);

  const numSlot = new NumSlot(this, "NumS_out", 0, false, true)
  numSlot.addLimits(this.minVal, this.maxVal, Language.getStr("Speed"))
  this.addPart(numSlot)
  this.parseTranslation(Language.getStr("block_Rotation_Servo"))
}
B_HLBBRotationServo.prototype = Object.create(B_HLBirdBloxOutput.prototype);
B_HLBBRotationServo.prototype.constructor = B_HLBBRotationServo;
B_HLBBRotationServo.importXml = HL_Utils.BBimportXml
//MicroBlocks functions
B_HLBBRotationServo.prototype.primName = function() { return "hatchlingMotorWithDelay" }
B_HLBBRotationServo.prototype.argList = function() { 
  /*let slot = this.slots[0]
  if (slot.hasChild) {
    console.error("SLOT CHILDREN NOT IMPLEMENTED FOR ROTATION SERVO!")
    return []
  } else {
    let port = HL_Utils.portNames[this.port]
    let value = slot.getDataNotFromChild().getValueInR(this.minVal, this.maxVal, this.positive, true); 
    console.log("*** rotation servo " + value)
    value = value * 0.9
    if (value < 5 && value > -5) { value = 0 }
    if (value < 0) { value = value - 15 }
    let duration = 0 //duration < 10 causes the motor to stay on

    console.log("*** rotation servo final value " + value)
    return [port, value, duration]
  }*/

  return [HL_Utils.portNames[this.port], this.slots[0].getMicroBlocksInstructions(), 0]
  
}

function B_HLBBPositionServo(x, y, port) {
  this.value = 90; //defaultAngle
  this.valueKey = "angle"
  B_HLBirdBloxOutput.call(this, x, y, "positionServo", 3, port, 0, 180);

  const numSlot = new NumSlot(this, "NumS_out", 90, true, true)
  numSlot.addLimits(this.minVal, this.maxVal, Language.getStr("Angle"))
  this.addPart(numSlot)
  this.parseTranslation(Language.getStr("block_Position_Servo"))
}
B_HLBBPositionServo.prototype = Object.create(B_HLBirdBloxOutput.prototype);
B_HLBBPositionServo.prototype.constructor = B_HLBBPositionServo;
B_HLBBPositionServo.importXml = HL_Utils.BBimportXml
//MicroBlocks functions
B_HLBBPositionServo.prototype.primName = function() { return "hatchlingServoWithDelay" }
B_HLBBPositionServo.prototype.argList = function() { 
  /*let slot = this.slots[1]
  if (slot.hasChild) {
    console.error("SLOT CHILDREN NOT IMPLEMENTED FOR POSITION SERVO!")
    return []
  } else {
    let value = slot.getDataNotFromChild().getValueInR(this.minVal, this.maxVal, this.positive, true) + 2 //0 and 1 are off commands
    return [HL_Utils.portNames[this.port], value, 0] 
  }*/
  return [HL_Utils.portNames[this.port], this.slots[0].getMicroBlocksInstructions(), 0] 
}

function B_HLBBFairyLights(x, y, port) {
  this.value = ""
  this.valueKey = "value"
  this.defaultIntensity = 50

  B_HLBirdBloxOutput.call(this, x, y, "fairyLights", 8, port, 0, 100);

  const numSlot = new NumSlot(this, "NumS_out", 0, true, true)
  numSlot.addLimits(this.minVal, this.maxVal, Language.getStr("Intensity"))
  this.addPart(numSlot)
  this.parseTranslation(Language.getStr("block_Fairy_Lights"))
}
B_HLBBFairyLights.prototype = Object.create(B_HLBirdBloxOutput.prototype);
B_HLBBFairyLights.prototype.constructor = B_HLBBFairyLights;
B_HLBBFairyLights.importXml = HL_Utils.BBimportXml
//MicroBlocks functions
B_HLBBFairyLights.prototype.primName = function() { return "hatchlingFairyLightWithDelay" }
B_HLBBFairyLights.prototype.argList = function() { 
  /*let slot = this.slots[1]
  if (slot.hasChild) {
    console.error("SLOT CHILDREN NOT IMPLEMENTED FOR FAIRY LIGHTS!")
    return []
  } else {
    let value = slot.getDataNotFromChild().getValueInR(this.minVal, this.maxVal, this.positive, true)
    value = Math.round(value * 254/100)

    return [HL_Utils.portNames[this.port], value, 0] 
  }*/

  /*let percent = this.slots[1].getMicroBlocksInstructions()
  console.error("Remember to scale this!")
  let value = percent
  
  return [HL_Utils.portNames[this.port], value, 0] */
  return [HL_Utils.portNames[this.port], this.slots[0].getMicroBlocksInstructions(), 0]
}

function B_HLBBSingleNeopix(x, y, port) {
  this.value = ""
  this.valueKey = "color"
  this.red = 100;
  this.green = 100;
  this.blue = 100;
  B_HLBirdBloxOutput.call(this, x, y, "singleNeopix", 9, port, 0, 100);

  const ledSlot1 = new NumSlot(this, "NumS_r", 0, true, true); //Positive integer.
  ledSlot1.addLimits(this.minVal, this.maxVal, Language.getStr("Intensity"));
  this.addPart(ledSlot1);
  const ledSlot2 = new NumSlot(this, "NumS_g", 0, true, true); //Positive integer.
  ledSlot2.addLimits(this.minVal, this.maxVal, Language.getStr("Intensity"));
  this.addPart(ledSlot2);
  const ledSlot3 = new NumSlot(this, "NumS_b", 0, true, true); //Positive integer.
  ledSlot3.addLimits(this.minVal, this.maxVal, Language.getStr("Intensity"));
  this.addPart(ledSlot3);
  this.parseTranslation(Language.getStr("block_Single_Neopixel"));
}
B_HLBBSingleNeopix.prototype = Object.create(B_HLBirdBloxOutput.prototype);
B_HLBBSingleNeopix.prototype.constructor = B_HLBBSingleNeopix;
B_HLBBSingleNeopix.importXml = HL_Utils.BBimportXml
//MicroBlocks functions
B_HLBBSingleNeopix.prototype.primName = function() { return "hatchlingNeopixelWithDelay" }
B_HLBBSingleNeopix.prototype.argList = function() { 
  /*let rgb = []
  let success = true

  for (let i = 1; i <= 3; i++) {
    let slot = this.slots[i]
    if (slot.hasChild) {
      console.error("SLOT CHILDREN NOT IMPLEMENTED! (slot " + i + " has a child)")
      success = false
    } else {
      let value = slot.getDataNotFromChild().getValueInR(this.minVal, this.maxVal, this.positive, true)
      rgb[i-1] = Math.round(value * 254/100) //TODO: Check scaling
    }
  }

  if (success) {
    return [HL_Utils.portNames[this.port], rgb[0], rgb[1], rgb[2], 0] 
  } else {
    return []
  }*/

  return [HL_Utils.portNames[this.port], this.slots[0].getMicroBlocksInstructions(),
    this.slots[1].getMicroBlocksInstructions(), this.slots[2].getMicroBlocksInstructions(), 0]
}

/*function B_HLBBNeopixStrip(x, y, port) {
  this.value = ""
  this.valueKey = "colors"
  this.red = 100;
  this.green = 100;
  this.blue = 100;

  B_HLBirdBloxOutput.call(this, x, y, "neopixStrip", 10, port);

  const ds = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("all"), "all"));
  ds.addOption(new SelectionData("1", "1"));
  ds.addOption(new SelectionData("2", "2"));
  ds.addOption(new SelectionData("3", "3"));
  ds.addOption(new SelectionData("4", "4"));
  ds.addOption(new SelectionData(Language.getStr("all"), "all"));
  this.addPart(ds);

  const ledSlot1 = new NumSlot(this, "NumS_r", 0, true, true); //Positive integer.
  ledSlot1.addLimits(0, 100, Language.getStr("Intensity"));
  this.addPart(ledSlot1);
  const ledSlot2 = new NumSlot(this, "NumS_g", 0, true, true); //Positive integer.
  ledSlot2.addLimits(0, 100, Language.getStr("Intensity"));
  this.addPart(ledSlot2);
  const ledSlot3 = new NumSlot(this, "NumS_b", 0, true, true); //Positive integer.
  ledSlot3.addLimits(0, 100, Language.getStr("Intensity"));
  this.addPart(ledSlot3);

  this.parseTranslation(Language.getStr("block_Neopixel_Strip"));
}
B_HLBBNeopixStrip.prototype = Object.create(B_HLBirdBloxOutput.prototype);
B_HLBBNeopixStrip.prototype.constructor = B_HLBBNeopixStrip;
B_HLBBNeopixStrip.importXml = HL_Utils.BBimportXml*/


/**
 * Blocks for getting values from hatchling sensor plugged in to a port
 */
function B_HLBirdBloxSensor(x, y, portType, port) {
  this.portType = portType
  this.port = port
  if (this.port == null) { console.error("Port must be specified") }
  ReporterBlock.call(this, x, y, "ports") //DeviceHatchling.getDeviceTypeId());

  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));
  this.addPart(new LabelText(this, (Language.getStr("port") + " " + HL_Utils.portNames[this.port]) ))
}
B_HLBirdBloxSensor.prototype = Object.create(ReporterBlock.prototype);
B_HLBirdBloxSensor.prototype.constructor = B_HLBirdBloxSensor
/*B_HLBirdBloxSensor.prototype.startAction = function() {
  let device = DeviceHatchling.getManager().getDevice(0)
  if (device == null) { return new ExecutionStatusError(); }
      
  const num = device.getSensorValue(this.port)
  console.log(num)
  return new ExecutionStatusResult(new NumData(num));
};*/
B_HLBirdBloxSensor.prototype.checkActive = function() {
  return HL_Utils.birdBloxCheckActive(this)
}
B_HLBirdBloxSensor.prototype.createXml = function(xmlDoc) {
  return HL_Utils.BBcreateXml(this, xmlDoc)
}

function B_HLBBDistance(x, y, port) {
  B_HLBirdBloxSensor.call(this, x, y, 14, port)

  this.addPart(new LabelText(this, Language.getStr("Distance")))
}
B_HLBBDistance.prototype = Object.create(B_HLBirdBloxSensor.prototype);
B_HLBBDistance.prototype.constructor = B_HLBBDistance
B_HLBBDistance.importXml = HL_Utils.BBimportXml
//MicroBlocks functions
B_HLBBDistance.prototype.primName = function() { return "[h:ds]" }
B_HLBBDistance.prototype.argList = function() { return [HL_Utils.portNames[this.port]] }



//MARK: micro:bit outputs

function B_HLLedArray(x, y) {
  //B_MicroBitLedArray.call(this, x, y, DeviceHatchling);

  CommandBlock.call(this, x, y, "display") //DeviceHatchling.getDeviceTypeId());
  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));
  const label = new LabelText(this, Language.getStr("block_LED_Display"));
  label.isEndOfLine = true;
  this.addPart(label);

  for (let i = 0; i < 5; i++) {
    this.addPart(new Toggle(this, "Toggle_led1" + i, false));
    this.addPart(new Toggle(this, "Toggle_led2" + i, false));
    this.addPart(new Toggle(this, "Toggle_led3" + i, false));
    this.addPart(new Toggle(this, "Toggle_led4" + i, false));
    const lastLed = new Toggle(this, "Toggle_led5" + i, false);
    lastLed.isEndOfLine = true;
    this.addPart(lastLed);
  }
}
//B_HLLedArray.prototype = Object.create(B_MicroBitLedArray.prototype);
B_HLLedArray.prototype = Object.create(CommandBlock.prototype);
B_HLLedArray.prototype.constructor = B_HLLedArray;
//MicroBlocks functions
B_HLLedArray.prototype.primName = function() { return "mbDisplay" } //"[display:mbDisplay]" }
B_HLLedArray.prototype.argList = function() {
  let success = true
  let ledStatusString = "";
  /*for (let i = 0; i < 25; i++) {
    let slot = this.slots[i+1]
    if (slot.hasChild) {
      console.error("SLOTS NOT IMPLEMENTED FOR LED ARRAY!")
      success = false
    } else {
      ledStatusString += (slot.getDataNotFromChild().getValue()) ? "1" : "0"
    }
  }

  if (success) {
    return [parseInt(ledStatusString.split("").reverse().join(""), 2)]
  } else {
    return []
  }*/

  for (let i = 0; i < 25; i++) {
    let toggle = this.parts[i+1]
    ledStatusString += (toggle.getData().getValue()) ? "1" : "0"
  }

  return [parseInt(ledStatusString.split("").reverse().join(""), 2)]
}


function B_HLPrint(x, y) {
  //B_MicroBitPrint.call(this, x, y, DeviceHatchling);

  CommandBlock.call(this, x, y, "display");
  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));
  // StrS_1 refers to the first string slot.
  this.addPart(new StringSlot(this, "StrS_1", "HELLO"));
  this.parseTranslation(Language.getStr("block_scroll_text"));
}
B_HLPrint.prototype = Object.create(CommandBlock.prototype) //B_MicroBitPrint.prototype);
B_HLPrint.prototype.constructor = B_HLPrint;
//MicroBlocks functions
B_HLPrint.prototype.primName = function() { return "hatchlingDisplayText" } //"[display:mbDisplay]" }
B_HLPrint.prototype.argList = function() {
  return [this.slots[0].getMicroBlocksInstructions()]
}


function B_HLPlot(x, y) {
  CommandBlock.call(this, x, y, "display");
  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  const xSlot = new NumSlot(this, "Num_x", 3, true, true);
  xSlot.addLimits(1, 5);
  this.addPart(xSlot);

  const ySlot = new NumSlot(this, "Num_x", 3, true, true);
  ySlot.addLimits(1, 5);
  this.addPart(ySlot);

  this.parseTranslation(Language.getStr("block_plot"));
}
B_HLPlot.prototype = Object.create(CommandBlock.prototype)
B_HLPlot.prototype.constructor = B_HLPlot
//MicroBlocks functions
B_HLPlot.prototype.primName = function() { return "[display:mbPlot]" }
B_HLPlot.prototype.argList = function() { 
  return [this.slots[0].getMicroBlocksInstructions(), this.slots[1].getMicroBlocksInstructions()] 
}


function B_HLUnplot(x, y) {
  CommandBlock.call(this, x, y, "display");
  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  const xSlot = new NumSlot(this, "Num_x", 3, true, true);
  xSlot.addLimits(1, 5);
  this.addPart(xSlot);

  const ySlot = new NumSlot(this, "Num_x", 3, true, true);
  ySlot.addLimits(1, 5);
  this.addPart(ySlot);

  this.parseTranslation(Language.getStr("block_unplot"));
}
B_HLUnplot.prototype = Object.create(CommandBlock.prototype)
B_HLUnplot.prototype.constructor = B_HLUnplot
//MicroBlocks functions
B_HLUnplot.prototype.primName = function() { return "[display:mbUnplot]" }
B_HLUnplot.prototype.argList = function() { 
  return [this.slots[0].getMicroBlocksInstructions(), this.slots[1].getMicroBlocksInstructions()] 
}


function B_HLBuzzer(x, y) {
  //B_DeviceWithPortsBuzzer.call(this, x, y, DeviceHatchling);
  CommandBlock.call(this, x, y, "sound")

  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  const noteSlot = new NoteSlot(this, "Note_out", 60, true, true);
  noteSlot.addLimits(24, 120, Language.getStr("Note")); //accepted midi notes range from 24 to 120
  this.addPart(noteSlot);

  const typeSlot = new DropSlot(this, "SDS_2", null, null, new SelectionData(Language.getStr("quarter"), 4));
  typeSlot.addOption(new SelectionData(Language.getStr("whole"), 1));
  typeSlot.addOption(new SelectionData(Language.getStr("dotted_half"), 3));
  typeSlot.addOption(new SelectionData(Language.getStr("half"), 2));
  typeSlot.addOption(new SelectionData(Language.getStr("dotted_quarter"), 6));
  typeSlot.addOption(new SelectionData(Language.getStr("quarter"), 4));
  typeSlot.addOption(new SelectionData(Language.getStr("dotted_eighth"), 12));
  typeSlot.addOption(new SelectionData(Language.getStr("eighth"), 8));
  typeSlot.addOption(new SelectionData(Language.getStr("sixteenth"), 16));
  this.addPart(typeSlot);
  this.parseTranslation(Language.getStr("block_play_note_type"));
};
B_HLBuzzer.prototype = Object.create(CommandBlock.prototype) //B_DeviceWithPortsBuzzer.prototype);
B_HLBuzzer.prototype.constructor = B_HLBuzzer;
//MicroBlocks functions
B_HLBuzzer.prototype.primName = function() { return "hatchlingPlayNote" }
B_HLBuzzer.prototype.argList = function() { 
  return [this.slots[0].getMicroBlocksInstructions(), this.slots[1].getMicroBlocksInstructions()]

  /*let midiNote = 0
  if (this.slots[1].hasChild) {
    console.error("SLOTS NOT IMPLEMENTED FOR BUZZER!")
    return []
  } else {
    midiNote = this.slots[1].getDataNotFromChild().getValue()
  }

  let beats = 0
  if (this.slots[2].hasChild) {
    console.error("SLOTS NOT IMPLEMENTED FOR BUZZER!")
    return []
  } else {
    beats = this.slots[2].getDataNotFromChild().getValue()
  }

  let frequency = 440 * Math.pow(2, (midiNote - 69)/12)
  let duration = (100 * beats)
  return [frequency, duration]*/
}

function B_HLTone(x, y) {
  CommandBlock.call(this, x, y, "sound")

  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  const freqSlot = new NumSlot(this, "FreqS_out", 440, true, true)
  freqSlot.addLimits(20, 20000, "Hz") //Accepted frequencies range from 20 to 20000 Hz
  this.addPart(freqSlot)

  const durationSlot = new NumSlot(this, "durS_out", 100, true, true)
  durationSlot.addLimits(10, 10000, "ms") //duration must be at least 10 ms
  this.addPart(durationSlot)

  this.parseTranslation(Language.getStr("block_play_tone"));
}
B_HLTone.prototype = Object.create(CommandBlock.prototype)
B_HLTone.prototype.constructor = B_HLTone
//MicroBlocks functions
B_HLTone.prototype.primName = function() { return "hatchlingPlayTone" }
B_HLTone.prototype.argList = function() {
  return [this.slots[0].getMicroBlocksInstructions(), this.slots[1].getMicroBlocksInstructions()]
}

function B_HLRest(x, y) {
  CommandBlock.call(this, x, y, "sound")

  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  const typeSlot = new DropSlot(this, "SDS_2", null, null, new SelectionData(Language.getStr("quarter"), 4));
  typeSlot.addOption(new SelectionData(Language.getStr("whole"), 1));
  typeSlot.addOption(new SelectionData(Language.getStr("dotted_half"), 3));
  typeSlot.addOption(new SelectionData(Language.getStr("half"), 2));
  typeSlot.addOption(new SelectionData(Language.getStr("dotted_quarter"), 6));
  typeSlot.addOption(new SelectionData(Language.getStr("quarter"), 4));
  typeSlot.addOption(new SelectionData(Language.getStr("dotted_eighth"), 12));
  typeSlot.addOption(new SelectionData(Language.getStr("eighth"), 8));
  typeSlot.addOption(new SelectionData(Language.getStr("sixteenth"), 16));
  this.addPart(typeSlot);

  this.parseTranslation(Language.getStr("block_rest"));
}
B_HLRest.prototype = Object.create(CommandBlock.prototype)
B_HLRest.prototype.constructor = B_HLRest
//MicroBlocks functions
B_HLRest.prototype.primName = function() { return "hatchlingPlayNote" }
B_HLRest.prototype.argList = function() { 
  return [0, this.slots[0].getMicroBlocksInstructions()]
}


//MARK: micro:bit inputs

function B_HLBBClaps(x, y) {
  ReporterBlock.call(this, x, y, "sensors")// DeviceHatchling.getDeviceTypeId());
  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  this.addPart(new LabelText(this, Language.getStr("block_Claps")));
}
B_HLBBClaps.prototype = Object.create(ReporterBlock.prototype)
B_HLBBClaps.prototype.constructor = B_HLBBClaps
//MicroBlocks functions
B_HLBBClaps.prototype.primName = function() { return "[h:cl]" }
B_HLBBClaps.prototype.argList = function() { return [] }


function B_HLBBButtonPresses(x, y) {
  ReporterBlock.call(this, x, y, "sensors") //DeviceHatchling.getDeviceTypeId());
  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  this.addPart(new LabelText(this, Language.getStr("block_Button_Presses")));
}
B_HLBBButtonPresses.prototype = Object.create(ReporterBlock.prototype)
B_HLBBButtonPresses.prototype.constructor = B_HLBBButtonPresses
//MicroBlocks functions
B_HLBBButtonPresses.prototype.primName = function() { return "[h:bt]" }
B_HLBBButtonPresses.prototype.argList = function() { return [] }


function B_HLButton(x, y) {
  PredicateBlock.call(this, x, y, "sensors");

  const choice = new DropSlot(this, "SDS_1", null, null, new SelectionData("A", "buttonA"));
  choice.addOption(new SelectionData("A", "buttonA"));
  choice.addOption(new SelectionData("B", "buttonB"));
  this.addPart(choice);
  this.parseTranslation(Language.getStr("block_Button"));

};
B_HLButton.prototype = Object.create(B_MicroBitButton.prototype);
B_HLButton.prototype.constructor = B_HLButton;
//MicroBlocks functions
B_HLButton.prototype.primName = function() { return this.slots[0].getMicroBlocksInstructions() }
B_HLButton.prototype.argList = function() { return [] }


/**
 * A Block to ask for the values of the accelerometer
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function B_HLAccelerometer(x, y){
  ReporterBlock.call(this, x, y, "sensors") //deviceClass.getDeviceTypeId());
  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  const label = new LabelText(this, Language.getStr("Accelerometer"));
  this.addPart(label);

  const pickAxis = new DropSlot(this, "SDS_2", null, null, new SelectionData("X", "tiltX"));
  pickAxis.addOption(new SelectionData("X", "tiltX"));
  pickAxis.addOption(new SelectionData("Y", "tiltY"));
  pickAxis.addOption(new SelectionData("Z", "tiltZ"));
  this.addPart(pickAxis);
}
B_HLAccelerometer.prototype = Object.create(ReporterBlock.prototype)
B_HLAccelerometer.prototype.constructor = B_HLAccelerometer
//MicroBlocks functions
B_HLAccelerometer.prototype.primName = function() { 
  return "[sensors:" + this.slots[0].getMicroBlocksInstructions() + "]"
}
B_HLAccelerometer.prototype.argList = function() { return [] }

Block.setDisplaySuffix(B_HLAccelerometer, "m/s" + String.fromCharCode(178));


/** 
 * Get the micro:bit sound 
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function B_HLSound(x, y){
  ReporterBlock.call(this, x, y, "sensors") //deviceClass.getDeviceTypeId());
  //this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceHatchling));

  const label = new LabelText(this, Language.getStr("Sound"));
  this.addPart(label);
}
B_HLSound.prototype = Object.create(ReporterBlock.prototype)
B_HLSound.prototype.constructor = B_HLSound
//MicroBlocks functions
B_HLSound.prototype.primName = function() { return "[h:ld]" }
B_HLSound.prototype.argList = function() { return [] }




/*function B_HLOrientation(x, y) {
  B_MicroBitOrientation.call(this, x, y, DeviceHatchling);
};
B_HLOrientation.prototype = Object.create(B_MicroBitOrientation.prototype);
B_HLOrientation.prototype.constructor = B_HLOrientation;
B_HLOrientation.prototype.checkActive = function() {
  return false //Disabled for now
}


function B_HLMagnetometer(x, y) {
  B_MicroBitMagnetometer.call(this, x, y, DeviceHatchling);
}
B_HLMagnetometer.prototype = Object.create(B_MicroBitMagnetometer.prototype);
B_HLMagnetometer.prototype.constructor = B_HLMagnetometer;
B_HLMagnetometer.prototype.checkActive = function() {
  return false //Disabled for now
}


function B_HLCompass(x, y) {
  B_MicroBitCompass.call(this, x, y, DeviceHatchling);
}
B_HLCompass.prototype = Object.create(B_MicroBitCompass.prototype);
B_HLCompass.prototype.constructor = B_HLCompass;
B_HLCompass.prototype.checkActive = function() {
  return false //Disabled for now
}


function B_HLV2Sensor(x, y) {
  B_MicroBitV2Sensor.call(this, x, y, DeviceHatchling);
}
B_HLV2Sensor.prototype = Object.create(B_MicroBitV2Sensor.prototype);
B_HLV2Sensor.prototype.constructor = B_HLV2Sensor;
B_HLV2Sensor.prototype.checkActive = function() {
  return false //Disabled for now
}*/


/////MicroBlocks specific blocks - TODO: put elsewhere?

/*function B_MicroBlocksList(x, y) {
  ReporterBlock.call(this, x, y, "data", Block.returnTypes.list)

  this.addPart(new LabelText(this, Language.getStr("list")));
  this.addPart(new RectSlot(this, "item_1", Slot.snapTypes.any, Slot.outputTypes.any, new StringData("cat")));
  this.addPart(new RectSlot(this, "item_2", Slot.snapTypes.any, Slot.outputTypes.any, new StringData("dog")));
}
B_MicroBlocksList.prototype = Object.create(ReporterBlock.prototype)
B_MicroBlocksList.prototype.constructor = B_MicroBlocksList
//MicroBlocks functions
B_MicroBlocksList.prototype.primName = function() { return "[data:makeList]" }
B_MicroBlocksList.prototype.argList = function() { 
  return [this.slots[0].getMicroBlocksInstructions(), this.slots[1].getMicroBlocksInstructions()]
} */

/*function B_AddToMBList(x, y) {
  CommandBlock.call(this, x, y, "data");
  //Any type can be added to a list 
  const snapType = Slot.snapTypes.numStrBool;
  const inputType = Slot.outputTypes.any;
  this.addPart(new RectSlot(this, "RectS_item", snapType, inputType, new StringData("")));
  //this.addPart(new RoundSlot(this, "RoundSlot_list", EditableSlot.inputTypes.string, Slot.snapTypes.any, Slot.outputTypes.list, new ListData()))
  this.addPart(new VarDropSlot(this, "VDS_1"))
  this.parseTranslation(Language.getStr("block_add_to_list"));
}
B_AddToMBList.prototype = Object.create(CommandBlock.prototype);
B_AddToMBList.prototype.constructor = B_AddToMBList;
//MicroBlocks functions
B_AddToMBList.prototype.primName = function() { return "[data:addLast]" }
B_AddToMBList.prototype.argList = function() { 
  return [this.slots[0].getMicroBlocksInstructions(), this.slots[1].getMicroBlocksInstructions()]
} */

