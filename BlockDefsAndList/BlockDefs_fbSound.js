/**
 * This file contains the implementations for the blocks specific to the FinchBlox
 * sound category.
 */

function B_FBSound(x, y, level) {
  this.level = level;
  CommandBlock.call(this,x,y,"sound_"+level);

  let iconH = 35;
  if (level == 1) { iconH = 24; }
  this.blockIcon = new BlockIcon(this, VectorPaths.mvMusicNote, Colors.white, "finchSound", iconH);
  this.blockIcon.isEndOfLine = true;
  this.addPart(this.blockIcon);

  this.midiNote = 60;
  this.beats = 1;
}
B_FBSound.prototype = Object.create(CommandBlock.prototype);
B_FBSound.prototype.constructor = B_FBSound;

B_FBSound.prototype.startAction = function () {
  const mem = this.runMem;
  mem.timerStarted = false;
  mem.duration = CodeManager.beatsToMs(this.beats);
  mem.requestStatus = {};
  mem.requestStatus.finished = true; //change when sending actual request
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;

  let device = DeviceFinch.getManager().getDevice(0);
  if (device != null) {
    //Setting a buzzer with a duration of 0 has strange results on the micro:bit.
		if (mem.duration > 0) {
			device.setBuzzer(mem.requestStatus, this.midiNote, mem.duration);
		} else {
			mem.requestStatus.finished = true;
		}
  } else {
    mem.requestStatus.finished = true;
    mem.duration = 0;
    TitleBar.flashFinchButton();
  }

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
B_FBSound.prototype.updateValues = function () {
  if (this.noteButton != null) {
    this.midiNote = this.noteButton.values[0];

    if (this.noteButton.widgets.length == 2) {
      this.beats = this.noteButton.values[1];
    }
  }
}

//********* Level 1 blocks *********

function B_FBSoundL1(x, y, note, midiNote) {
  B_FBSound.call(this, x, y, 1);
  this.midiNote = midiNote;

  //this.addPart(new LabelText(this, note));
  this.blockIcon.addText(note);
}
B_FBSoundL1.prototype = Object.create(B_FBSound.prototype);
B_FBSoundL1.prototype.constructor = B_FBSoundL1;

function B_FBC(x, y) {
  B_FBSoundL1.call(this, x, y, "C", 60);
}
B_FBC.prototype = Object.create(B_FBSoundL1.prototype);
B_FBC.prototype.constructor = B_FBC;

function B_FBD(x, y) {
  B_FBSoundL1.call(this, x, y, "D", 62);
}
B_FBD.prototype = Object.create(B_FBSoundL1.prototype);
B_FBD.prototype.constructor = B_FBD;

function B_FBE(x, y) {
  B_FBSoundL1.call(this, x, y, "E", 64);
}
B_FBE.prototype = Object.create(B_FBSoundL1.prototype);
B_FBE.prototype.constructor = B_FBE;

function B_FBF(x, y) {
  B_FBSoundL1.call(this, x, y, "F", 65);
}
B_FBF.prototype = Object.create(B_FBSoundL1.prototype);
B_FBF.prototype.constructor = B_FBF;

function B_FBG(x, y) {
  B_FBSoundL1.call(this, x, y, "G", 67);
}
B_FBG.prototype = Object.create(B_FBSoundL1.prototype);
B_FBG.prototype.constructor = B_FBG;

//********* Level 2 blocks *********

function B_FBSoundL2(x, y) {
  B_FBSound.call(this, x, y, 2);

  this.noteButton = new BlockButton(this);
  this.noteButton.addPiano(this.midiNote);
  this.addPart(this.noteButton);
}
B_FBSoundL2.prototype = Object.create(B_FBSound.prototype);
B_FBSoundL2.prototype.constructor = B_FBSoundL2;

//********* Level 3 blocks *********

function B_FBSoundL3(x, y) {
  B_FBSound.call(this, x, y, 3);

  this.noteButton = new BlockButton(this);
  this.noteButton.addPiano(this.midiNote);
  this.addPart(this.noteButton);

  this.noteButton.addSlider("beats", this.beats, [1, 2, 3, 4]);

/*
  this.beatsButton = new BlockButton(this);
  this.beatsButton.addSlider("beats", this.beats, [1, 2, 3, 4]);
  this.addPart(this.beatsButton);*/
}
B_FBSoundL3.prototype = Object.create(B_FBSound.prototype);
B_FBSoundL3.prototype.constructor = B_FBSoundL3;
