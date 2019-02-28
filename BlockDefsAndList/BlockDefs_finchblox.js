

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

//Level 2 motion blocks
function B_FBMotionL2(x, y, direction, defaultValue){
  B_FBMotion.call(this, x, y, direction);

  let blockButton = new BlockButton(this, defaultValue);
  this.addPart(blockButton);
}
B_FBMotionL2.prototype = Object.create(B_FBMotion.prototype);
B_FBMotionL2.prototype.constructor = B_FBMotionL2;
function B_FBRightL2(x, y) {
  B_FBMotionL2.call(this, x, y, "right", 90);
}
B_FBRightL2.prototype = Object.create(B_FBMotionL2.prototype);
B_FBRightL2.prototype.constructor = B_FBRightL2;
