//@fix Write documentation.

function SoundDropSlot(parent){
	DropSlot.call(this,parent);
}
SoundDropSlot.prototype = Object.create(DropSlot.prototype);
SoundDropSlot.prototype.constructor = SoundDropSlot;

SoundDropSlot.prototype.populateList=function(){
	this.clearOptions();
	for(var i=0;i<Sounds.getSoundCount();i++){
		var currentSound=Sounds.getSoundName(i);
		this.addOption(currentSound,new SelectionData(currentSound));
	}
};
SoundDropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new SoundDropSlot(parentCopy,this.isHatBlock);
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};
/**
 * Copies data and blocks from a Slot into this Slot
 * @param {SoundDropSlot} slot - The slot to copy from
 */
SoundDropSlot.prototype.copyFrom=function(slot){
	var data = slot.enteredData;
	this.enteredData = data;
	this.changeText(data.asString().getValue());
};
SoundDropSlot.prototype.edit=function(){
	var me = this;
	DropSlot.prototype.edit.call(this, function(){
		if(me.enteredData != null) {
			var soundName = me.enteredData.getValue();
			HtmlServer.sendRequestWithCallback("sound/stop", function(){
				if(Sounds.checkNameIsValid(soundName)){
					var request = "sound/play/"+soundName;
					HtmlServer.sendRequestWithCallback(request);
					GuiElements.alert("sent: " + request);
				}
				else{
					GuiElements.alert("Bad sound: " + soundName);
				}
			});
		}
		else{
			GuiElements.alert("No data");
		}
	});
};
SoundDropSlot.prototype.deselect=function(){
	DropSlot.prototype.deselect.call(this);
	HtmlServer.sendRequestWithCallback("sound/stop");
};