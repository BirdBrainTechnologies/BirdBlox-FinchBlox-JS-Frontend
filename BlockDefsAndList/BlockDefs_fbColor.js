/**
 * This file contains the implementations for the blocks specific to the FinchBlox
 * color category.
 */

/**
 * Block for changing the color of the LEDs on the Finch
 * @param {number} x
 * @param {number} y
 * @param {number} level - Which difficulty level is the block for?
 * @param {boolean} beak - if true, set the beak color. Otherwise, tail.
 */
function B_FBColor(x, y, level, type) {
  this.level = level;
  this.isBeak = (type == "beak");
  this.isTail = (type == "tail");
  this.isLEDArray = (type == "LEDArray");
  this.red = 0;
  this.green = 0;
  this.blue = 0;
  this.duration = 10;
  //this.ledStatusString = "1111111111111111111111111";
  this.ledStatusString = "0000001010000001000101110"; //smiley face
  this.ledOffString = "0000000000000000000000000";
  this.ledArray = [];
  CommandBlock.call(this, x, y, "color_" + level);

  let iconPath = VectorPaths.mvFinch;
  let iconColor = Colors.white;
  let iconH = 40;
  if (this.isLEDArray) {
    iconPath = VectorPaths.microbit;
    iconColor = Colors.bbtDarkGray; //Colors.black;
    iconH = 30;
  }
  this.blockIcon = new BlockIcon(this, iconPath, iconColor, "finchColor", iconH);
  this.blockIcon.isEndOfLine = true;
  if (this.isLEDArray) {
    this.blockIcon.addBackgroundRect();
  }
  this.addPart(this.blockIcon);

  if (this.isBeak || this.isTail) {
    let icon2Path = VectorPaths.mvFinchTail;
    if (this.isBeak) {
      icon2Path = VectorPaths.mvFinchBeak;
    }
    this.blockIcon.addSecondIcon(icon2Path, Colors.iron);
    this.ledIcon = this.blockIcon.icon.pathE2;
  } else {
    this.ledArrayImage = GuiElements.draw.ledArray(this.blockIcon.icon.group, this.ledStatusString, 20);
  }

}
B_FBColor.prototype = Object.create(CommandBlock.prototype);
B_FBColor.prototype.constructor = B_FBColor;

//MicroBlocks functions
B_FBColor.prototype.primName = function() { return "[display:mbDisplay]" }
B_FBColor.prototype.argList = function() {
  return [parseInt(this.ledStatusString.split("").reverse().join(""), 2)]
}

B_FBColor.prototype.startAction = function() {
  const mem = this.runMem;
  mem.timerStarted = false;
  mem.duration = 100 * this.duration;
  mem.offSent = false; //when the block is finished executing, turn off led(s)
  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;

  let device = DeviceFinch.getManager().getDevice(0);
  if (Hatchling) { device = DeviceHatchling.getManager().getDevice(0) }
  if (device != null) {
    if (this.isBeak) {
      device.setBeak(mem.requestStatus, this.red, this.green, this.blue);
    } else if (this.isTail) {
      device.setTail(mem.requestStatus, "all", this.red, this.green, this.blue);
    } else if (this.isLEDArray) {
      device.setLedArray(mem.requestStatus, this.ledStatusString);
    }
  } else {
    mem.requestStatus.finished = true;
    mem.duration = 0;
    TitleBar.flashFinchButton();
    return new ExecutionStatusError();
  }

  return new ExecutionStatusRunning();
}
B_FBColor.prototype.updateAction = function() {
  const mem = this.runMem;
  if (!mem.timerStarted) {
    const status = mem.requestStatus;
    if (status.finished === true) {
      mem.startTime = new Date().getTime();
      mem.timerStarted = true;
    } else {
      return new ExecutionStatusRunning(); // Still running
    }
  }
  if (new Date().getTime() >= mem.startTime + mem.duration) {
    if (!mem.offSent) {
      //console.log("sending led off");
      mem.offSent = true;
      mem.timerStarted = false;
      mem.duration = 0;
      mem.requestStatus.finished = false;
      let device = DeviceFinch.getManager().getDevice(0);
      if (device != null) {
        if (this.isBeak) {
          device.setBeak(mem.requestStatus, 0, 0, 0);
        } else if (this.isTail) {
          device.setTail(mem.requestStatus, "all", 0, 0, 0);
        } else if (this.isLEDArray) {
          device.setLedArray(mem.requestStatus, this.ledOffString);
        }
      } else {
        mem.requestStatus.finished = true;
      }
      return new ExecutionStatusRunning(); // Still running
    } else {
      return new ExecutionStatusDone(); // Done running
    }
  } else {
    return new ExecutionStatusRunning(); // Still running
  }
}
B_FBColor.prototype.updateColor = function() {
  if (this.isLEDArray) {
    this.ledArrayImage.group.remove();
    this.ledArrayImage = GuiElements.draw.ledArray(this.blockIcon.icon.group, this.ledStatusString, 20);
    const iX = this.blockIcon.icon.width / (2 * this.blockIcon.icon.scaleX) - this.ledArrayImage.width / 2;
    const iY = this.blockIcon.icon.height / (2 * this.blockIcon.icon.scaleY) - this.ledArrayImage.width / 2 - 35;
    GuiElements.move.group(this.ledArrayImage.group, iX, iY);
    /*
    const values = this.ledStatusString.split("");
    for (let i = 0; i < 25; i++) {
      if (values[i] == "1") {
        GuiElements.update.color(this.ledArray[i], Colors.black);
      } else {
        GuiElements.update.color(this.ledArray[i], Colors.iron);
      }
    }*/
  } else {
    const s = 255 / 100;
    this.colorHex = Colors.rgbToHex(this.red * s, this.green * s, this.blue * s);
    GuiElements.update.color(this.ledIcon, this.colorHex);
  }
}
B_FBColor.prototype.updateValues = function() {
  if (this.colorButton != null) {
    if (this.isLEDArray) {
      this.ledStatusString = this.colorButton.values[0];
    } else {
      this.red = this.colorButton.values[0].r;
      this.green = this.colorButton.values[0].g;
      this.blue = this.colorButton.values[0].b;
    }
    this.updateColor();

    if (this.colorButton.widgets.length == 2) {
      this.duration = this.colorButton.values[1];
    }
  }
}
B_FBColor.prototype.addL2Button = function() {
  if (this.isLEDArray) {
    let options = ["0000001010000001000101110", //smiley face
      "0000001010000000111010001", //frowny face
      "0101000000001000101000100", //surprise face
      "1010010100111101101011110", //OK
      "0111010101111111111110101", //alien
      "1111110001100011000111111", //square
      "0101011111111110111000100", //heart
      "0010001010100010101000100"
    ] //diamond
    if (Hatchling) {
      options.push("0000000000000000000000000") //off
    }
    let defaultVal = options[3]
    if (this.useAlphabet) {
      //Same letters as micro:bit print command unless noted.
      options = ["0110010010111101001010010", // A
        "1110010010111001001011100", // B
        "0111010000100001000001110", // C
        "1110010010100101001011100", // D
        "1111010000111001000011110", // E
        "1111010000111001000010000", // F
        "0111010000100111000101110", // G
        "1001010010111101001010010", // H
        "1110001000010000100011100", // I
        "0111000100001001010001100", // J - mod
        "1001010100110001010010010", // K
        "1000010000100001000011110", // L
        "1000111011101011000110001", // M
        "1000111001101011001110001", // N
        "0110010010100101001001100", // O
        "1110010010111001000010000", // P
        "0110010010101101001001101", // Q - mod
        "1110010010111001010010010", // R
        "0110010000011000001011100", // S
        "1111100100001000010000100", // T
        "1000110001100011000101110", // U
        "1000110001100010101000100", // V
        "1000110001101011101110001", // W
        "1000101010001000101010001", // X - mod
        "1000101010001000010000100", // Y
        "1111100010001000100011111"  // Z
      ]
      defaultVal = options[0]
    }
    this.colorButton = new BlockButton(this);
    this.colorButton.addSlider("ledArray", defaultVal, options);
  } else {
    this.blue = 100;
    const color = {
      r: this.red,
      g: this.green,
      b: this.blue
    };
    this.colorButton = new BlockButton(this);
    this.colorButton.addSlider("color", color);
  }
  this.addPart(this.colorButton);
  this.updateColor();
}

//********* Level 1 blocks *********

function B_FBColorL1(x, y, type) {
  B_FBColor.call(this, x, y, 1, type);
}
B_FBColorL1.prototype = Object.create(B_FBColor.prototype);
B_FBColorL1.prototype.constructor = B_FBColorL1;

function B_FBBeakRed(x, y) {
  B_FBColorL1.call(this, x, y, "beak");

  this.red = 100;
  this.updateColor();
}
B_FBBeakRed.prototype = Object.create(B_FBColorL1.prototype);
B_FBBeakRed.prototype.constructor = B_FBBeakRed;

function B_FBTailRed(x, y) {
  B_FBColorL1.call(this, x, y, "tail");

  this.red = 100;
  this.updateColor();
}
B_FBTailRed.prototype = Object.create(B_FBColorL1.prototype);
B_FBTailRed.prototype.constructor = B_FBTailRed;

function B_FBBeakGreen(x, y) {
  B_FBColorL1.call(this, x, y, "beak");

  this.green = 100;
  this.updateColor();
}
B_FBBeakGreen.prototype = Object.create(B_FBColorL1.prototype);
B_FBBeakGreen.prototype.constructor = B_FBBeakGreen;

function B_FBTailGreen(x, y) {
  B_FBColorL1.call(this, x, y, "tail");

  this.green = 100;
  this.updateColor();
}
B_FBTailGreen.prototype = Object.create(B_FBColorL1.prototype);
B_FBTailGreen.prototype.constructor = B_FBTailGreen;

function B_FBBeakBlue(x, y) {
  B_FBColorL1.call(this, x, y, "beak");

  this.blue = 100;
  this.updateColor();
}
B_FBBeakBlue.prototype = Object.create(B_FBColorL1.prototype);
B_FBBeakBlue.prototype.constructor = B_FBBeakBlue;

function B_FBTailBlue(x, y) {
  B_FBColorL1.call(this, x, y, "tail");

  this.blue = 100;
  this.updateColor();
}
B_FBTailBlue.prototype = Object.create(B_FBColorL1.prototype);
B_FBTailBlue.prototype.constructor = B_FBTailBlue;

//********* Level 2 blocks *********

function B_FBColorL2(x, y, type) {
  B_FBColor.call(this, x, y, 2, type);

  this.addL2Button();
}
B_FBColorL2.prototype = Object.create(B_FBColor.prototype);
B_FBColorL2.prototype.constructor = B_FBColorL2;

function B_FBBeakL2(x, y) {
  B_FBColorL2.call(this, x, y, "beak");
}
B_FBBeakL2.prototype = Object.create(B_FBColorL2.prototype);
B_FBBeakL2.prototype.constructor = B_FBBeakL2;

function B_FBTailL2(x, y) {
  B_FBColorL2.call(this, x, y, "tail");
}
B_FBTailL2.prototype = Object.create(B_FBColorL2.prototype);
B_FBTailL2.prototype.constructor = B_FBTailL2;

function B_FBLedArrayL2(x, y) {
  B_FBColorL2.call(this, x, y, "LEDArray");
}
B_FBLedArrayL2.prototype = Object.create(B_FBColorL2.prototype);
B_FBLedArrayL2.prototype.constructor = B_FBLedArrayL2;


//********* Level 3 blocks *********

function B_FBColorL3(x, y, type) {
  B_FBColor.call(this, x, y, 3, type);

  this.addL2Button();

  this.colorButton.addSlider("time", this.duration, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  /*
   this.durationButton = new BlockButton(this);
   this.durationButton.addSlider("time", this.duration, [1, 5, 10]);
   this.addPart(this.durationButton);*/
}
B_FBColorL3.prototype = Object.create(B_FBColor.prototype);
B_FBColorL3.prototype.constructor = B_FBColorL3;

function B_FBBeakL3(x, y) {
  B_FBColorL3.call(this, x, y, "beak");
}
B_FBBeakL3.prototype = Object.create(B_FBColorL3.prototype);
B_FBBeakL3.prototype.constructor = B_FBBeakL3;

function B_FBTailL3(x, y) {
  B_FBColorL3.call(this, x, y, "tail");
}
B_FBTailL3.prototype = Object.create(B_FBColorL3.prototype);
B_FBTailL3.prototype.constructor = B_FBTailL3;

function B_FBLedArrayL3(x, y) {
  B_FBColorL3.call(this, x, y, "LEDArray");
}
B_FBLedArrayL3.prototype = Object.create(B_FBColorL3.prototype);
B_FBLedArrayL3.prototype.constructor = B_FBLedArrayL3;
