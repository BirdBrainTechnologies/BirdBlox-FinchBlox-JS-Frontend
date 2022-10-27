/**
 * SoundDropSlots select a sound or recording from a list. Uses the SoundInputPad instead of InputPad
 * @param {Block} parent
 * @param {string} key
 * @param {boolean} isRecording - Whether this Slot should list build in sounds or recordings
 * @constructor
 */
function SoundDropSlot(parent, key, isRecording) {
  DropSlot.call(this, parent, key);
  this.isRecording = isRecording;
}
SoundDropSlot.prototype = Object.create(DropSlot.prototype);
SoundDropSlot.prototype.constructor = SoundDropSlot;

/**
 * @inheritDoc
 * @return {SoundInputPad}
 */
SoundDropSlot.prototype.createInputSystem = function() {
  const x1 = this.getAbsX();
  const y1 = this.getAbsY();
  const x2 = this.relToAbsX(this.width);
  const y2 = this.relToAbsY(this.height);
  return new SoundInputPad(x1, x2, y1, y2, this.isRecording);
};

/**
 * Only selectionData is valid
 * @inheritDoc
 * @param {Data} data
 * @return {Data|null}
 * TODO: Technically this isn't necessary since the inputType is selection anyway
 */
SoundDropSlot.prototype.sanitizeNonSelectionData = function(data) {
  return null
};
SoundDropSlot.prototype.selectionDataFromValue = function(value) {
  if (this.isRecording) {
    // If it is a recording, use the name of the recording as the display name
    return new SelectionData(value, value);
  } else {
    // Otherwise, look up the correct name and use that
    let sound = Sound.lookupById(value);
    if (sound != null) return new SelectionData(sound.name, sound.id);
    // If the sound can't be found (maybe it isn't in this version of he app), use the value as the display name
    return new SelectionData(value, value);
  }
};
SoundDropSlot.prototype.renameRecording = function(oldName, newName) {
  if (!this.isRecording) return;
  if (this.enteredData.getValue() === oldName) {
    this.setData(new SelectionData(newName, newName), true, true);
    //TODO: should be fine to make sanitize false
  }
};
SoundDropSlot.prototype.deleteRecording = function(recording) {
  if (!this.isRecording) return;
  if (this.enteredData.getValue() === recording) {
    this.setData(SelectionData.empty(), true, true);
  }
};
