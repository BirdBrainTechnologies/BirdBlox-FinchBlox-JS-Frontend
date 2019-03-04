

function B_FBMotion(x, y, direction) {
  this.deviceClass = DeviceHummingbirdBit;//DeviceFinch;
  this.direction = direction;
  CommandBlock.call(this,x,y,this.deviceClass.getDeviceTypeId());

  var icon;
  switch (direction) {
    case "forward":
      icon = VectorPaths.play;
      break;
    case "backward":
      icon = VectorPaths.backspace;
      break;
    case "right":
      icon = VectorPaths.share;
      break;
    case "left":
      icon = VectorPaths.checkmark;
      break;
    default:
      icon = VectorPaths.trash;
  }
  let blockIcon = new BlockIcon(this, icon, Colors.white, "moveFinch", 30);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);
}
B_FBMotion.prototype = Object.create(CommandBlock.prototype);
B_FBMotion.prototype.constructor = B_FBMotion;

function B_FBForward(x, y) {
  B_FBMotion.call(this, x, y, "forward");
}
B_FBForward.prototype = Object.create(B_FBMotion.prototype);
B_FBForward.prototype.constructor = B_FBForward;
function B_FBBackward(x, y) {
  B_FBMotion.call(this, x, y, "backward");
}
B_FBBackward.prototype = Object.create(B_FBMotion.prototype);
B_FBBackward.prototype.constructor = B_FBBackward;
function B_FBRight(x, y) {
  B_FBMotion.call(this, x, y, "right");
}
B_FBRight.prototype = Object.create(B_FBMotion.prototype);
B_FBRight.prototype.constructor = B_FBRight;
function B_FBLeft(x, y) {
  B_FBMotion.call(this, x, y, "left");
}
B_FBLeft.prototype = Object.create(B_FBMotion.prototype);
B_FBLeft.prototype.constructor = B_FBLeft;

//Level 2 motion blocks
function B_FBMotionL2(x, y, direction, defaultValue){
  B_FBMotion.call(this, x, y, direction);

  let blockButton = new BlockButton(this, defaultValue);
  this.addPart(blockButton);
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
  B_FBMotionL2.call(this, x, y, direction, defaultValue);

  let blockButton = new BlockButton(this, defaultSpeed);
  this.addPart(blockButton);
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
