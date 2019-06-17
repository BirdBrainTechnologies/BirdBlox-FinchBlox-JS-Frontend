/**
 * This file contains the implementations for the blocks specific to the FinchBlox
 * motion category.
 */

function B_FBMotion(x, y, direction, level) {
  this.direction = direction;
  this.level = level;
  this.defaultAngle = 90;
  this.defaultDistance = 10;
  this.defaultSpeed = 50;

  this.setDefaults();

  CommandBlock.call(this,x,y,"motion_"+level);

  //const icon = VectorPaths.blockIcons["motion_" + direction];
  const icon = VectorPaths.mvArrow;
  const rotation = B_FBMotion.iconRotation[direction];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "moveFinch", 32, rotation);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);
}
B_FBMotion.prototype = Object.create(CommandBlock.prototype);
B_FBMotion.prototype.constructor = B_FBMotion;

B_FBMotion.prototype.startAction = function () {
  const mem = this.runMem;
  //mem.timerStarted = false;
  //mem.duration = 1000;
  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;

  let device = DeviceFinch.getManager().getDevice(0);
  if (device != null) {
    device.setMotors(this.runMem.requestStatus, this.leftSpeed, this.leftDist, this.rightSpeed, this.rightDist);
  } else {
    mem.requestStatus.finished = true;
    mem.duration = 0;
    TitleBar.flashFinchButton();
  }

  return new ExecutionStatusRunning();
}
B_FBMotion.prototype.updateAction = function () {
  if(this.runMem.requestStatus.finished) {
		return new ExecutionStatusDone();
	} else {
		return new ExecutionStatusRunning();
	}
  /*
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
  }*/
}
B_FBMotion.prototype.setDefaults = function() {
  switch (this.direction) {
    case "forward":
      this.leftSpeed = this.defaultSpeed;
      this.rightSpeed = this.defaultSpeed;
      break;
    case "backward":
      this.leftSpeed = -this.defaultSpeed;
      this.rightSpeed = -this.defaultSpeed;
      break;
    case "right":
      this.leftSpeed = this.defaultSpeed;
      this.rightSpeed = -this.defaultSpeed;
      break;
    case "left":
      this.leftSpeed = -this.defaultSpeed;
      this.rightSpeed = this.defaultSpeed;
      break;
    default:
        GuiElements.alert("unknown direction in motion block set defaults");
  }
  switch (this.direction) {
    case "forward":
    case "backward":
      this.leftDist = this.defaultDistance;
      this.rightDist = this.defaultDistance;
      break;
    case "right":
    case "left":
      this.leftDist = this.defaultAngle * DeviceFinch.cmPerDegree;
      this.rightDist = this.defaultAngle * DeviceFinch.cmPerDegree;
      break;
    default:
        GuiElements.alert("unknown direction in motion block set defaults");
  }
}
B_FBMotion.prototype.addL2Button = function() {
  switch (this.direction) {
    case "forward":
    case "backward":
      this.distanceBN = new BlockButton(this);
      this.distanceBN.addSlider("distance", this.defaultDistance, [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]);
      this.addPart(this.distanceBN);
      break;
    case "right":
    case "left":
      this.angleBN = new BlockButton(this, this.defaultAngle);
      this.angleBN.addSlider("angle_" + this.direction, this.defaultAngle, [5, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]);
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
    this.leftDist = this.angleBN.value * DeviceFinch.cmPerDegree;
    this.rightDist = this.angleBN.value * DeviceFinch.cmPerDegree;
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
  //console.log("Move " + this.direction + " block update values: " + this.rightSpeed + ", " + this.leftSpeed + ", " + this.rightDist + ", " + this.leftDist);
}
B_FBMotion.iconRotation = {
  "forward": 0,
  "right": 90,
  "backward": 180,
  "left": 270
}


//****  Level 1 Blocks ****//

function B_FBForward(x, y) {
  B_FBMotion.call(this, x, y, "forward", 1);
}
B_FBForward.prototype = Object.create(B_FBMotion.prototype);
B_FBForward.prototype.constructor = B_FBForward;
function B_FBBackward(x, y) {
  B_FBMotion.call(this, x, y, "backward", 1);
}
B_FBBackward.prototype = Object.create(B_FBMotion.prototype);
B_FBBackward.prototype.constructor = B_FBBackward;
function B_FBRight(x, y) {
  B_FBMotion.call(this, x, y, "right", 1);
}
B_FBRight.prototype = Object.create(B_FBMotion.prototype);
B_FBRight.prototype.constructor = B_FBRight;
function B_FBLeft(x, y) {
  B_FBMotion.call(this, x, y, "left", 1);
}
B_FBLeft.prototype = Object.create(B_FBMotion.prototype);
B_FBLeft.prototype.constructor = B_FBLeft;


//****  Level 2 Blocks ****//

function B_FBMotionL2(x, y, direction){
  B_FBMotion.call(this, x, y, direction, 2);

  this.addL2Button();
}
B_FBMotionL2.prototype = Object.create(B_FBMotion.prototype);
B_FBMotionL2.prototype.constructor = B_FBMotionL2;

function B_FBForwardL2(x, y) {
  B_FBMotionL2.call(this, x, y, "forward");
}
B_FBForwardL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBForwardL2.prototype.constructor = B_FBForwardL2;
function B_FBBackwardL2(x, y) {
  B_FBMotionL2.call(this, x, y, "backward");
}
B_FBBackwardL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBBackwardL2.prototype.constructor = B_FBBackwardL2;
function B_FBRightL2(x, y) {
  B_FBMotionL2.call(this, x, y, "right");
}
B_FBRightL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBRightL2.prototype.constructor = B_FBRightL2;
function B_FBLeftL2(x, y) {
  B_FBMotionL2.call(this, x, y, "left");
}
B_FBLeftL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBLeftL2.prototype.constructor = B_FBLeftL2;


//****  Level 3 Blocks ****//

function B_FBMotionL3(x, y, direction){
  B_FBMotion.call(this, x, y, direction, 3);

  this.addL2Button();

  this.speedBN = new BlockButton(this);
  this.speedBN.addSlider("percent", this.defaultSpeed, [25, 50, 75, 100]);
  this.addPart(this.speedBN);
}
B_FBMotionL3.prototype = Object.create(B_FBMotionL2.prototype);
B_FBMotionL3.prototype.constructor = B_FBMotionL3;

function B_FBForwardL3(x, y) {
  B_FBMotionL3.call(this, x, y, "forward");
}
B_FBForwardL3.prototype = Object.create(B_FBMotionL3.prototype);
B_FBForwardL3.prototype.constructor = B_FBForwardL3;
function B_FBBackwardL3(x, y) {
  B_FBMotionL3.call(this, x, y, "backward");
}
B_FBBackwardL3.prototype = Object.create(B_FBMotionL3.prototype);
B_FBBackwardL3.prototype.constructor = B_FBBackwardL3;
function B_FBRightL3(x, y) {
  B_FBMotionL3.call(this, x, y, "right");
}
B_FBRightL3.prototype = Object.create(B_FBMotionL3.prototype);
B_FBRightL3.prototype.constructor = B_FBRightL3;
function B_FBLeftL3(x, y) {
  B_FBMotionL3.call(this, x, y, "left");
}
B_FBLeftL3.prototype = Object.create(B_FBMotionL3.prototype);
B_FBLeftL3.prototype.constructor = B_FBLeftL3;
