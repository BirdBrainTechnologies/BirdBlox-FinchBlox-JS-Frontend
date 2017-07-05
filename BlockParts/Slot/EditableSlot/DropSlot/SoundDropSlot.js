//@fix Write documentation.

function SoundDropSlot(parent,key, isRecording){
	DropSlot.call(this,parent,key);
	this.isRecording = isRecording;
}
SoundDropSlot.prototype = Object.create(DropSlot.prototype);
SoundDropSlot.prototype.constructor = SoundDropSlot;
SoundDropSlot.prototype.populatePad = function(selectPad){
	const me = this;
	let list = Sound.getSoundList(this.isRecording);
	list.forEach(function(sound){
		selectPad.addOption(new SelectionData(sound.name, sound.id));
	});
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