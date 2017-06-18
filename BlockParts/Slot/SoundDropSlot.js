//@fix Write documentation.

function SoundDropSlot(parent,key, isRecording){
	DropSlot.call(this,parent,key);
	this.isRecording = isRecording;
}
SoundDropSlot.prototype = Object.create(DropSlot.prototype);
SoundDropSlot.prototype.constructor = SoundDropSlot;

SoundDropSlot.prototype.populateList = function(){
	this.clearOptions();
	const me = this;
	let list = Sound.getSoundList(this.isRecording);
	list.forEach(function(sound){
		me.addOption(sound.name, new SelectionData(sound.id));
	});
};
SoundDropSlot.prototype.edit=function(){
	var me = this;
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
};