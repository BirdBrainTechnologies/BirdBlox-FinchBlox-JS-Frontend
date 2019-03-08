/**
 * This file contains the implementations for the blocks specific to the FinchBlox
 * sound category.
 */

function B_FBSound(x, y, level) {
  this.level = level;
  CommandBlock.call(this,x,y,"sound_"+level);

  let blockIcon = new BlockIcon(this, VectorPaths.faMusic, Colors.white, "finchSound", 30);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);
}
B_FBSound.prototype = Object.create(CommandBlock.prototype);
B_FBSound.prototype.constructor = B_FBSound;

B_FBSound.prototype.startAction = function () {
  const mem = this.runMem;
  mem.timerStarted = false;
  mem.duration = 1000;
  mem.requestStatus = {};
  mem.requestStatus.finished = true; //change when sending actual request
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;
  return new ExecutionStatusRunning();
}
B_FBSound.prototype.updateAction = function () {
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

function B_FBSoundL1(x, y) {
  B_FBSound.call(this, x, y, 1);
}
B_FBSoundL1.prototype = Object.create(B_FBSound.prototype);
B_FBSoundL1.prototype.constructor = B_FBSoundL1;

function B_FBSoundL2(x, y) {
  B_FBSound.call(this, x, y, 2);
}
B_FBSoundL2.prototype = Object.create(B_FBSound.prototype);
B_FBSoundL2.prototype.constructor = B_FBSoundL2;

function B_FBSoundL3(x, y) {
  B_FBSound.call(this, x, y, 3);
}
B_FBSoundL3.prototype = Object.create(B_FBSound.prototype);
B_FBSoundL3.prototype.constructor = B_FBSoundL3;
