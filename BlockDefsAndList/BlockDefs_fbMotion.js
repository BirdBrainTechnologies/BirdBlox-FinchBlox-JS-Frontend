/**
 * This file contains the implementations for the blocks specific to the FinchBlox
 * motion category.
 */

function B_FBMotion(x, y, direction, level) {
  this.direction = direction;
  this.level = level;
  this.rightSpeed = 0;
  this.leftSpeed = 0;
  this.rightDist = 0;
  this.leftDist = 0;
  CommandBlock.call(this,x,y,"motion_"+level);

  const icon = VectorPaths.blockIcons["motion_" + direction];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "moveFinch", 30);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);
}
B_FBMotion.prototype = Object.create(CommandBlock.prototype);
B_FBMotion.prototype.constructor = B_FBMotion;

B_FBMotion.prototype.startAction = function () {
  const mem = this.runMem;
  mem.timerStarted = false;
  mem.duration = 1000;
  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;

  let device = DeviceFinch.getManager().getDevice(0);
  if (device != null) {
    device.setMotor(this.runMem.requestStatus, this.leftSpeed, this.leftDist, this.rightSpeed, this.rightDist);
  } else {
    mem.requestStatus.finished = true;
    mem.duration = 0;
    TitleBar.flashFinchButton();
  }

  return new ExecutionStatusRunning();
}
B_FBMotion.prototype.updateAction = function () {
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
      return new ExecutionStatusDone(); // Done running
  } else {
      return new ExecutionStatusRunning(); // Still running
  }
}
B_FBMotion.prototype.addL2Button = function(defaultValue) {
  switch (this.direction) {
    case "forward":
      this.leftSpeed = 50;
      this.rightSpeed = 50;
      this.leftDist = defaultValue;
      this.rightDist = defaultValue;
      this.distanceBN = new BlockButton(this, defaultValue);
      this.distanceBN.addSlider();
      this.addPart(this.distanceBN);
      break;
    case "backward":
      this.leftSpeed = -50;
      this.rightSpeed = -50;
      this.leftDist = defaultValue;
      this.rightDist = defaultValue;
      this.distanceBN = new BlockButton(this, defaultValue);
      this.distanceBN.addSlider();
      this.addPart(this.distanceBN);
      break;
    case "right":
      this.leftSpeed = 50;
      this.rightSpeed = -50;
      this.leftDist = 10;
      this.rightDist = 10;
      this.angleBN = new BlockButton(this, defaultValue);
      this.angleBN.addSlider();
      this.addPart(this.angleBN);
      break;
    case "left":
      this.leftSpeed = -50;
      this.rightSpeed = 50;
      this.leftDist = 10;
      this.rightDist = 10;
      this.angleBN = new BlockButton(this, defaultValue);
      this.angleBN.addSlider();
      this.addPart(this.angleBN);
      break;
    default:
      GuiElements.alert("unknown direction in motion block add l2 bn");
    }
}
B_FBMotion.prototype.updateValues = function () {
  if (this.distanceBN != null) {
    this.leftDist = this.distanceBN.value;
    this.rightDist = this.distanceBN.value;
  }
  if (this.angleBN != null) {

  }
  if (this.speedBN != null) {
    switch (this.direction) {
      case "forward":
        this.leftSpeed = this.speedBN.value;
        this.rightSpeed = this.speedBN.value;
        break;
      case "backward":
        this.leftSpeed = -this.speedBN.value;
        this.rightSpeed = -this.speedBN.value;
        break;
      case "right":
        this.leftSpeed = this.speedBN.value;
        this.rightSpeed = -this.speedBN.value;
        break;
      case "left":
        this.leftSpeed = -this.speedBN.value;
        this.rightSpeed = this.speedBN.value;
        break;
      default:
        GuiElements.alert("unknown direction in motion block update values");
    }
  }
  console.log("Move " + this.direction + " block update values: " + this.rightSpeed + ", " + this.leftSpeed + ", " + this.rightDist + ", " + this.leftDist);
}

function B_FBForward(x, y) {
  B_FBMotion.call(this, x, y, "forward", 1);

  this.leftSpeed = 50;
  this.rightSpeed = 50;
  this.leftDist = 10;
  this.rightDist = 10;
}
B_FBForward.prototype = Object.create(B_FBMotion.prototype);
B_FBForward.prototype.constructor = B_FBForward;
function B_FBBackward(x, y) {
  B_FBMotion.call(this, x, y, "backward", 1);

  this.leftSpeed = -50;
  this.rightSpeed = -50;
  this.leftDist = 10;
  this.rightDist = 10;
}
B_FBBackward.prototype = Object.create(B_FBMotion.prototype);
B_FBBackward.prototype.constructor = B_FBBackward;
function B_FBRight(x, y) {
  B_FBMotion.call(this, x, y, "right", 1);

  this.leftSpeed = 50;
  this.rightSpeed = -50;
  this.leftDist = 10;
  this.rightDist = 10;
}
B_FBRight.prototype = Object.create(B_FBMotion.prototype);
B_FBRight.prototype.constructor = B_FBRight;
function B_FBLeft(x, y) {
  B_FBMotion.call(this, x, y, "left", 1);

  this.leftSpeed = -50;
  this.rightSpeed = 50;
  this.leftDist = 10;
  this.rightDist = 10;
}
B_FBLeft.prototype = Object.create(B_FBMotion.prototype);
B_FBLeft.prototype.constructor = B_FBLeft;

//Level 2 motion blocks
function B_FBMotionL2(x, y, direction, defaultValue){
  B_FBMotion.call(this, x, y, direction, 2);

  this.addL2Button(defaultValue);
}
B_FBMotionL2.prototype = Object.create(B_FBMotion.prototype);
B_FBMotionL2.prototype.constructor = B_FBMotionL2;

function B_FBForwardL2(x, y) {
  B_FBMotionL2.call(this, x, y, "forward", 10);
}
B_FBForwardL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBForwardL2.prototype.constructor = B_FBForwardL2;
function B_FBBackwardL2(x, y) {
  B_FBMotionL2.call(this, x, y, "backward", 10);
}
B_FBBackwardL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBBackwardL2.prototype.constructor = B_FBBackwardL2;
function B_FBRightL2(x, y) {
  B_FBMotionL2.call(this, x, y, "right", 90);
}
B_FBRightL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBRightL2.prototype.constructor = B_FBRightL2;
function B_FBLeftL2(x, y) {
  B_FBMotionL2.call(this, x, y, "left", 90);
}
B_FBLeftL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBLeftL2.prototype.constructor = B_FBLeftL2;

//Level 3 motion blocks
function B_FBMotionL3(x, y, direction, defaultValue, defaultSpeed){
  B_FBMotion.call(this, x, y, direction, 3);

  this.addL2Button(defaultValue);

  this.speedBN = new BlockButton(this, defaultSpeed);
  this.speedBN.addSlider();
  this.addPart(this.speedBN);
}
B_FBMotionL3.prototype = Object.create(B_FBMotionL2.prototype);
B_FBMotionL3.prototype.constructor = B_FBMotionL3;

function B_FBForwardL3(x, y) {
  B_FBMotionL3.call(this, x, y, "forward", 10, 50);
}
B_FBForwardL3.prototype = Object.create(B_FBMotionL3.prototype);
B_FBForwardL3.prototype.constructor = B_FBForwardL3;
function B_FBBackwardL3(x, y) {
  B_FBMotionL3.call(this, x, y, "backward", 10, 50);
}
B_FBBackwardL3.prototype = Object.create(B_FBMotionL3.prototype);
B_FBBackwardL3.prototype.constructor = B_FBBackwardL3;
function B_FBRightL3(x, y) {
  B_FBMotionL3.call(this, x, y, "right", 90, 50);
}
B_FBRightL3.prototype = Object.create(B_FBMotionL3.prototype);
B_FBRightL3.prototype.constructor = B_FBRightL3;
function B_FBLeftL3(x, y) {
  B_FBMotionL3.call(this, x, y, "left", 90, 50);
}
B_FBLeftL3.prototype = Object.create(B_FBMotionL3.prototype);
B_FBLeftL3.prototype.constructor = B_FBLeftL3;
