

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
    default:
      icon = VectorPaths.trash;
  }
  let blockIcon = new BlockIcon(this, icon, Colors.white, "moveFinch", 30);
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
