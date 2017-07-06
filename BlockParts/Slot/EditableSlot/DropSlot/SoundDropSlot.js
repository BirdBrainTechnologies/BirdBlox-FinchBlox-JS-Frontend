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
SoundDropSlot.prototype.populatePad = function(selectPad){
	/*const me = this;
	let list = Sound.getSoundList(this.isRecording);
	list.forEach(function(sound){
		selectPad.addOption(new SelectionData(sound.name, sound.id));
	});*/
};
/* TODO: Sound previewing
SoundDropSlot.prototype.edit=function(){
	const me = this;
	DropSlot.prototype.edit.call(this, function(){
		if(me.enteredData != null) {
			if(!this.isRecording) {
				let soundId = me.enteredData.getValue();
				Sound.playAndStopPrev(soundId, false);
			}
		}
		else{
			GuiElements.alert("No data");
		}
	});
};
SoundDropSlot.prototype.deselect=function(){
	DropSlot.prototype.deselect.call(this);
	Sound.stopAllSounds();
};*/