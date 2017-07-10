//@fix Write documentation.

function SoundDropSlot(parent,key, isRecording){
	DropSlot.call(this,parent,key);
	this.isRecording = isRecording;
}
SoundDropSlot.prototype = Object.create(DropSlot.prototype);
SoundDropSlot.prototype.constructor = SoundDropSlot;
SoundDropSlot.prototype.createInputSystem = function(){
	const x1 = this.getAbsX();
	const y1 = this.getAbsY();
	const x2 = this.relToAbsX(this.width);
	const y2 = this.relToAbsY(this.height);
	return new SoundInputPad(x1, x2, y1, y2, this.isRecording);
};
SoundDropSlot.prototype.sanitizeNonSelectionData = function(data) {
	return null
};
SoundDropSlot.prototype.selectionDataFromValue = function(value) {
	if (this.isRecording) {
		return new SelectionData(value, value);
	} else {
		let sound = Sound.lookupById(value);
		if (sound != null) return new SelectionData(sound.name, sound.id);
		return new SelectionData(value, value);
	}
};