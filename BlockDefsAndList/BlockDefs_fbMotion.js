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

  CommandBlock.call(this, x, y, "motion_" + level);

  const icon = VectorPaths[B_FBMotion.iconPaths[direction]];
  let blockIcon = new BlockIcon(this, icon, Colors.white, "moveFinch", 27);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);
}
B_FBMotion.prototype = Object.create(CommandBlock.prototype);
B_FBMotion.prototype.constructor = B_FBMotion;

B_FBMotion.prototype.setupAction = function() {
  let mem = this.runMem;
  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;

  let device = DeviceFinch.getManager().getDevice(0);
  if (device == null) {
    mem.requestStatus.finished = true;
    mem.duration = 0;
    TitleBar.flashFinchButton();
  }
  return device;
};
B_FBMotion.prototype.sendCheckMoving = function() {
  this.device = this.setupAction();
  if (this.device == null) {
    return new ExecutionStatusError(); // Device was invalid, exit early
  }

  this.device.readSensor(this.runMem.requestStatus, "isMoving");
  return new ExecutionStatusRunning();
};
B_FBMotion.prototype.checkMoving = function() {
  this.device.isMoving = (this.runMem.requestStatus.result === "1");
  const moveStartTimedOut = (new Date().getTime() > this.moveSentTime + 500);
  if ((this.wasMoving || moveStartTimedOut) && !this.device.isMoving) {
    return new ExecutionStatusDone();
  }
  this.wasMoving = this.device.isMoving;

  return this.sendCheckMoving();
}
B_FBMotion.prototype.startAction = function() {
  this.moveSent = false;
  this.moveSendFinished = false;
  this.wasMoving = false;
  return this.sendCheckMoving();
}
B_FBMotion.prototype.updateAction = function() {
  if (this.runMem.requestStatus.finished) {
    if (this.runMem.requestStatus.error) {
      return new ExecutionStatusError();
    } else if (!this.moveSent) {
      this.wasMoving = (status.result === "1");
      this.moveSentTime = new Date().getTime();
      this.device = this.setupAction();
      if (this.device == null) {
        return new ExecutionStatusError();
      }
      this.device.setMotors(this.runMem.requestStatus, this.leftSpeed, this.leftTicks, this.rightSpeed, this.rightTicks);
      this.moveSent = true;
      return new ExecutionStatusRunning();
    } else if (!this.moveSendFinished) {
      this.moveSendFinished = true;
      return this.sendCheckMoving();
    } else {
      return this.checkMoving();
    }
  } else {
    return new ExecutionStatusRunning();
  }
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
      this.leftTicks = Math.round(this.defaultDistance * DeviceFinch.ticksPerCM);
      this.rightTicks = Math.round(this.defaultDistance * DeviceFinch.ticksPerCM);
      break;
    case "right":
    case "left":
      this.leftTicks = Math.round(this.defaultAngle * DeviceFinch.ticksPerDegree);
      this.rightTicks = Math.round(this.defaultAngle * DeviceFinch.ticksPerDegree);
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
      this.distanceBN.addSlider("distance", this.defaultDistance, [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
      this.addPart(this.distanceBN);
      break;
    case "right":
    case "left":
      this.angleBN = new BlockButton(this);
      this.angleBN.addSlider("angle_" + this.direction, this.defaultAngle, [5, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]);
      this.addPart(this.angleBN);
      break;
    default:
      GuiElements.alert("unknown direction in motion block add l2 bn");
  }
}
B_FBMotion.prototype.updateValues = function() {
  let speed;
  if (this.distanceBN != null) {
    this.leftTicks = Math.round(this.distanceBN.values[0] * DeviceFinch.ticksPerCM);
    this.rightTicks = Math.round(this.distanceBN.values[0] * DeviceFinch.ticksPerCM);
    speed = this.distanceBN.values[1];
  }
  if (this.angleBN != null) {
    this.leftTicks = Math.round(this.angleBN.values[0] * DeviceFinch.ticksPerDegree);
    this.rightTicks = Math.round(this.angleBN.values[0] * DeviceFinch.ticksPerDegree);
    speed = this.angleBN.values[1];
  }
  if (speed != null) {
    switch (this.direction) {
      case "forward":
        this.leftSpeed = speed;
        this.rightSpeed = speed;
        break;
      case "backward":
        this.leftSpeed = -speed;
        this.rightSpeed = -speed;
        break;
      case "right":
        this.leftSpeed = speed;
        this.rightSpeed = -speed;
        break;
      case "left":
        this.leftSpeed = -speed;
        this.rightSpeed = speed;
        break;
      default:
        GuiElements.alert("unknown direction in motion block update values");
    }
  }
}
B_FBMotion.iconPaths = {
  "forward": "mjForward",
  "right": "mjTurnRight",
  "backward": "mjBack",
  "left": "mjTurnLeft",
  "circle":"bsArrowClockwise"
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

function B_FBMotionL2(x, y, direction) {
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

function B_FBMotionL3(x, y, direction) {
  B_FBMotion.call(this, x, y, direction, 3);

  this.addL2Button();

  if (this.distanceBN != null) {
    this.distanceBN.addSlider("percent", this.defaultSpeed, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  }
  if (this.angleBN != null) {
    this.angleBN.addSlider("percent", this.defaultSpeed, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  }
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


// Circle block

function B_FBCircleL3(x, y) {
  this.angle = 90
  this.radius = 10
  this.direction = "right" //clockwise

  B_FBMotion.call(this, x, y, "circle", 3);

  console.log("Adding circle button " + this.angle + " " + this.radius)
  this.circleBN = new BlockButton(this);
  this.circleBN.addSlider("angle_" + this.direction, this.angle, [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]);
  this.circleBN.addSlider("distance", this.radius, [5, 10, 15, 20])
  this.addPart(this.circleBN);
}
B_FBCircleL3.prototype = Object.create(B_FBMotion.prototype);
B_FBCircleL3.prototype.constructor = B_FBCircleL3

B_FBCircleL3.prototype.updateValues = function() {
  this.angle = this.circleBN.values[0]
  this.radius = this.circleBN.values[1] || this.radius

  //Clockwise circle
  let rightDistance = ( 2 * Math.PI * (this.radius - 5) ) * (this.angle/360)
  let leftDistance = ( 2 * Math.PI * (this.radius + 5) ) * (this.angle/360)
  this.rightTicks = rightDistance * DeviceFinch.ticksPerCM
  this.leftTicks = leftDistance * DeviceFinch.ticksPerCM
  this.leftSpeed = 40
  this.rightSpeed = this.leftSpeed * (rightDistance/leftDistance)
  console.log("updateValues " + rightDistance + " " + leftDistance + " " + this.rightSpeed)
}

/*function B_FBCircleL3(x, y) {
  this.angle = 90
  this.radius = 10
  this.direction = "right" //clockwise
  //792 encoder ticks per rotation
  this.scalingFactor = 1 / 792;

  CommandBlock.call(this, x, y, "motion_3");

  let blockIcon = new BlockIcon(this, VectorPaths.bsArrowClockwise, Colors.white, "circleFinch", 27);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);

  this.circleBN = new BlockButton(this);
  this.circleBN.addSlider("angle_" + this.direction, this.angle, [5, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]);
  this.circleBN.addSlider("distance", this.radius, [5, 10, 15, 20, 25, 30])
  this.addPart(this.circleBN);
      
}
B_FBCircleL3.prototype = Object.create(CommandBlock.prototype);
B_FBCircleL3.prototype.constructor = B_FBCircleL3;

B_FBCircleL3.prototype.startAction = function() {
  let device = DeviceFinch.getManager().getDevice(0);
  if (device == null) {
    TitleBar.flashFinchButton();
    return new ExecutionStatusError();
  }

  this.blankRequestStatus = {};
  this.blankRequestStatus.finished = false;
  this.blankRequestStatus.error = false;
  this.blankRequestStatus.result = null;
  this.blankRequestStatus.requestSent = false;

  this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
  this.runMem.encoderRequestFinished = false
  this.runMem.motorRequestFinished = false;

  //(2piR) is the circumference, (angle/360) is the fraction of circle, 5*pi is the wheel circumference
  //(2 * Math.PI * this.radius) * (this.angle/360) / (5 * Math.PI) which reduces to:
  this.threshold = this.radius * (this.angle/180) / 5
  this.encoderL = null
  this.encoderR = null

  console.log("about to reset encoders ")
  device.resetEncoders(this.runMem.requestStatus)
  this.runMem.requestStatus.requestSent = true

  return new ExecutionStatusRunning();
}
B_FBCircleL3.prototype.updateAction = function() {
  let device = DeviceFinch.getManager().getDevice(0)
  if (device == null) { return new ExecutionStatusDone() }

  const status = this.runMem.requestStatus;
  console.log("updateAction ")
  if (status.requestSent) {
    if (status.finished) {
      if (status.error) {
        return new ExecutionStatusError()
      }
      if (!this.runMem.encoderRequestFinished) { //really need to wait for encoders to go to 0
        this.runMem.encoderRequestFinished = true 
        this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
        console.log("updateAction setting motors")
        device.setMotors(this.runMem.requestStatus, this.speedL, 0, this.speedR, 0);
        device.isMoving = true
        this.runMem.requestStatus.requestSent = true
        return new ExecutionStatusRunning();
      }
      if (this.runMem.encoderRequestFinished && !this.runMem.motorRequestFinished) {
        console.log("updateAction motors set")
        this.runMem.motorRequestFinished = true;
        this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
        return new ExecutionStatusRunning();
      }

      const result = new StringData(status.result);
      const num = (result.asNum().getValue() * this.scalingFactor);
      console.log("updateAction received num " + num + " (" + result.asNum().getValue() + ") with " + this.encoderL + " " + this.encoderR)
      if (this.encoderL == null) {
        this.encoderL = num
        this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
        console.log("updateAction read right encoder")
        device.readSensor(this.runMem.requestStatus, "encoder", "right"); 
        this.runMem.requestStatus.requestSent = true
        return new ExecutionStatusRunning();
      } else {
        this.encoderR = num
      }

      console.log("updateAction " + this.encoderR + " " + this.encoderL + " " + this.threshold)
      const pastThreshold = (Math.abs(this.encoderR - this.encoderL) > this.threshold);
      
      if (pastThreshold || !device.isMoving) {
        if (pastThreshold) {
          device.setMotors(this.runMem.requestStatus, 0, 0, 0, 0);
          device.isMoving = false;
        }
        return new ExecutionStatusDone();
      } else {
        this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
        this.encoderL = null 
        this.encoderR = null
      }
    } else {
      console.log("status unfinished: ", status)
    }
  } else {
    console.log("updateAction read left encoder")
    device.readSensor(status, "encoder", "left"); 
    status.requestSent = true;
  }
  return new ExecutionStatusRunning();
}
B_FBCircleL3.prototype.updateValues = function() {
  this.angle = this.circleBN.values[0]
  this.radius = this.circleBN.values[1] || this.radius

  //Clockwise circle
  let rightDistance = ( 2 * Math.PI * (this.radius - 5) ) * (this.angle/360)
  let leftDistance = ( 2 * Math.PI * (this.radius + 5) ) * (this.angle/360)
  this.speedL = 40
  this.speedR = this.speedL * (rightDistance/leftDistance)
  console.log("updateValues " + rightDistance + " " + leftDistance + " " + this.speedR)
}*/



// Sensor Blocks

function B_FBSensorBlock(x, y, sensor) {
  this.sensor = sensor;
  this.speed = 50;
  this.distanceThreshold = 30
  this.lightThreshold = 5
  this.threshold = this.distanceThreshold / DeviceFinch.cmPerDistance; //obstacle threshold of 30cm
  if (sensor == "dark") {
    this.threshold = this.lightThreshold;
  }
  CommandBlock.call(this, x, y, "motion_3");
}
B_FBSensorBlock.prototype = Object.create(CommandBlock.prototype);
B_FBSensorBlock.prototype.constructor = B_FBSensorBlock;

B_FBSensorBlock.prototype.startAction = function() {
  this.blankRequestStatus = {};
  this.blankRequestStatus.finished = false;
  this.blankRequestStatus.error = false;
  this.blankRequestStatus.result = null;
  this.blankRequestStatus.requestSent = false;

  this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
  this.runMem.motorRequestFinished = false;

  let device = DeviceFinch.getManager().getDevice(0);
  if (device != null) {
    if (this.sensor == "obstacle") {
      if (device.hasV2Microbit) {
        //V2 distance values are reported in cm.
        this.threshold = this.distanceThreshold
      } else {
        this.threshold = this.distanceThreshold / DeviceFinch.cmPerDistance
      }
    }
    device.setMotors(this.runMem.requestStatus, this.speed, 0, this.speed, 0);
    device.isMoving = true;
  } else {
    TitleBar.flashFinchButton();
    return new ExecutionStatusError();
  }

  return new ExecutionStatusRunning();
}
B_FBSensorBlock.prototype.updateAction = function() {
  const status = this.runMem.requestStatus;
  if (status.requestSent) {
    if (status.finished) {
      if (status.error) {
        return new ExecutionStatusError();
      }
      if (!this.runMem.motorRequestFinished) {
        this.runMem.motorRequestFinished = true;
        this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
        return new ExecutionStatusRunning();
      }
      const result = new StringData(status.result);
      const num = (result.asNum().getValue());
      const pastThreshold = (num < this.threshold);
      let device = DeviceFinch.getManager().getDevice(0);
      if (pastThreshold || (device != null && !device.isMoving) || device == null) {
        if (pastThreshold && device != null) {
          device.setMotors(this.runMem.requestStatus, 0, 0, 0, 0);
          device.isMoving = false;
        }
        return new ExecutionStatusDone();
      } else {
        this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
      }
    }
  } else {
    let device = DeviceFinch.getManager().getDevice(0);
    if (device != null) {
      if (this.sensor == "dark") {
        device.readSensor(status, "light", "left");
      } else {
        device.readSensor(status, "distance");
      }
      status.requestSent = true;
    } else {
      return new ExecutionStatusDone();
    }
  }
  return new ExecutionStatusRunning();
}

function B_FBForwardUntilDark(x, y) {
  B_FBSensorBlock.call(this, x, y, "dark");
  this.colorTopHalf(Colors.darkTeal);

  const blockIcon = new BlockIcon(this, VectorPaths.mjSun, Colors.black, "sun", 25);
  blockIcon.icon.setRotation(-8);
  blockIcon.negate(Colors.black);
  blockIcon.isEndOfLine = true;
  blockIcon.addSecondIcon(VectorPaths[B_FBMotion.iconPaths["forward"]], Colors.white, true, null, 5);
  this.addPart(blockIcon);
}
B_FBForwardUntilDark.prototype = Object.create(B_FBSensorBlock.prototype);
B_FBForwardUntilDark.prototype.constructor = B_FBForwardUntilDark;




function B_FBForwardUntilObstacle(x, y) {
  B_FBSensorBlock.call(this, x, y, "obstacle");

  const blockIcon = new BlockIcon(this, VectorPaths[B_FBMotion.iconPaths["forward"]], Colors.white, "obstacle", 25);
  blockIcon.addObstacle(Colors.darkTeal);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);
}
B_FBForwardUntilObstacle.prototype = Object.create(B_FBSensorBlock.prototype);
B_FBForwardUntilObstacle.prototype.constructor = B_FBForwardUntilObstacle;
