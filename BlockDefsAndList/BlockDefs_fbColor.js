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
function B_FBColor(x, y, level, beak) {
 this.level = level;
 this.isBeak = beak;
 this.red = 0;
 this.green = 0;
 this.blue = 0;
 this.duration = 10;
 CommandBlock.call(this,x,y,"color_"+level);

 const blockIcon = new BlockIcon(this, VectorPaths.mvFinch, Colors.white, "finchColor", 30);
 blockIcon.isEndOfLine = true;
 this.addPart(blockIcon);

 if (beak) {
   //this.ledIcon = GuiElements.draw.triangle(30, 30, 15, 15, Colors.white);
   //this.ledIcon = blockIcon.addSecondIcon(VectorPaths.mvFinchBeak, Colors.iron);
   blockIcon.addSecondIcon(VectorPaths.mvFinchBeak, Colors.iron);
 } else {
   //this.ledIcon = GuiElements.draw.rect(30, 50, 15, 5, Colors.white, 2, 2);
   //this.ledIcon = blockIcon.addSecondIcon(VectorPaths.mvFinchTail, Colors.iron);
   blockIcon.addSecondIcon(VectorPaths.mvFinchTail, Colors.iron);
 }
 this.ledIcon = blockIcon.icon.pathE2;
// this.group.appendChild(this.ledIcon); //TODO: append to block icon somehow instead.
}
B_FBColor.prototype = Object.create(CommandBlock.prototype);
B_FBColor.prototype.constructor = B_FBColor;

B_FBColor.prototype.startAction = function () {
 const mem = this.runMem;
 mem.timerStarted = false;
 mem.duration = 100 * this.duration;
 mem.offSent = false; //when the block is finished executing, turn off led(s)
 mem.requestStatus = {};
 mem.requestStatus.finished = false;
 mem.requestStatus.error = false;
 mem.requestStatus.result = null;

 let device = DeviceFinch.getManager().getDevice(0);
 if (device != null) {
   if (this.isBeak) {
     device.setBeak(mem.requestStatus, this.red, this.green, this.blue);
   } else {
     device.setTail(mem.requestStatus, "all", this.red, this.green, this.blue);
   }
 } else {
   mem.requestStatus.finished = true;
   mem.duration = 0;
   TitleBar.flashFinchButton();
 }

 return new ExecutionStatusRunning();
}
B_FBColor.prototype.updateAction = function () {
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
    if (!mem.offSent){
      console.log("sending led off");
      mem.offSent = true;
      mem.timerStarted = false;
      mem.duration = 0;
      mem.requestStatus.finished = false;
      let device = DeviceFinch.getManager().getDevice(0);
      if (device != null) {
        if (this.isBeak) {
          device.setBeak(mem.requestStatus, 0, 0, 0);
        } else {
          device.setTail(mem.requestStatus, "all", 0, 0, 0);
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
B_FBColor.prototype.updateColor = function () {
  this.colorHex = Colors.rgbToHex(this.red, this.green, this.blue);
  GuiElements.update.color(this.ledIcon, this.colorHex);
}
B_FBColor.prototype.updateValues = function () {
  if (this.colorButton != null) {
    this.red = this.colorButton.value.r;
    this.green = this.colorButton.value.g;
    this.blue = this.colorButton.value.b;
    this.updateColor();
  }
  if (this.durationButton != null) {
    this.duration = this.durationButton.value;
  }
}
B_FBColor.prototype.addL2Button = function () {
  this.blue = 100;
  const color = {r: this.red, g: this.green, b: this.blue};
  this.colorButton = new BlockButton(this, color);
  this.colorButton.addSlider();
  this.addPart(this.colorButton);
  this.updateColor();
}

//********* Level 1 blocks *********

function B_FBColorL1(x, y, beak) {
 B_FBColor.call(this, x, y, 1, beak);
}
B_FBColorL1.prototype = Object.create(B_FBColor.prototype);
B_FBColorL1.prototype.constructor = B_FBColorL1;

function B_FBBeakRed(x, y) {
 B_FBColorL1.call(this, x, y, true);

 this.red = 100;
 this.updateColor();
}
B_FBBeakRed.prototype = Object.create(B_FBColorL1.prototype);
B_FBBeakRed.prototype.constructor = B_FBBeakRed;

function B_FBTailRed(x, y) {
 B_FBColorL1.call(this, x, y, false);

 this.red = 100;
 this.updateColor();
}
B_FBTailRed.prototype = Object.create(B_FBColorL1.prototype);
B_FBTailRed.prototype.constructor = B_FBTailRed;

function B_FBBeakGreen(x, y) {
 B_FBColorL1.call(this, x, y, true);

 this.green = 100;
 this.updateColor();
}
B_FBBeakGreen.prototype = Object.create(B_FBColorL1.prototype);
B_FBBeakGreen.prototype.constructor = B_FBBeakGreen;

function B_FBTailGreen(x, y) {
 B_FBColorL1.call(this, x, y, false);

 this.green = 100;
 this.updateColor();
}
B_FBTailGreen.prototype = Object.create(B_FBColorL1.prototype);
B_FBTailGreen.prototype.constructor = B_FBTailGreen;

function B_FBBeakBlue(x, y) {
 B_FBColorL1.call(this, x, y, true);

 this.blue = 100;
 this.updateColor();
}
B_FBBeakBlue.prototype = Object.create(B_FBColorL1.prototype);
B_FBBeakBlue.prototype.constructor = B_FBBeakBlue;

function B_FBTailBlue(x, y) {
 B_FBColorL1.call(this, x, y, false);

 this.blue = 100;
 this.updateColor();
}
B_FBTailBlue.prototype = Object.create(B_FBColorL1.prototype);
B_FBTailBlue.prototype.constructor = B_FBTailBlue;

//********* Level 2 blocks *********

function B_FBColorL2(x, y, beak) {
 B_FBColor.call(this, x, y, 2, beak);

 this.addL2Button();
}
B_FBColorL2.prototype = Object.create(B_FBColor.prototype);
B_FBColorL2.prototype.constructor = B_FBColorL2;

function B_FBBeakL2(x, y) {
 B_FBColorL2.call(this, x, y, true);
}
B_FBBeakL2.prototype = Object.create(B_FBColorL2.prototype);
B_FBBeakL2.prototype.constructor = B_FBBeakL2;

function B_FBTailL2(x, y) {
 B_FBColorL2.call(this, x, y, false);
}
B_FBTailL2.prototype = Object.create(B_FBColorL2.prototype);
B_FBTailL2.prototype.constructor = B_FBTailL2;

//********* Level 3 blocks *********

function B_FBColorL3(x, y, beak) {
 B_FBColor.call(this, x, y, 3, beak);

 this.addL2Button();

 this.durationButton = new BlockButton(this, this.duration);
 this.durationButton.addSlider();
 this.addPart(this.durationButton);
}
B_FBColorL3.prototype = Object.create(B_FBColor.prototype);
B_FBColorL3.prototype.constructor = B_FBColorL3;

function B_FBBeakL3(x, y) {
 B_FBColorL3.call(this, x, y, true);
}
B_FBBeakL3.prototype = Object.create(B_FBColorL3.prototype);
B_FBBeakL3.prototype.constructor = B_FBBeakL3;

function B_FBTailL3(x, y) {
 B_FBColorL3.call(this, x, y, false);
}
B_FBTailL3.prototype = Object.create(B_FBColorL3.prototype);
B_FBTailL3.prototype.constructor = B_FBTailL3;
