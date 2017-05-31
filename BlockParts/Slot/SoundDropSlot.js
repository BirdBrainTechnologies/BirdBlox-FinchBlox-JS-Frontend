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
SoundDropSlot.prototype.edit=function(){
	DropSlot.prototype.edit.call(this, function(){
		if(this.enteredData != null) {
			var soundName = this.enteredData.getValue();
			if(Sounds.checkNameIsValid(soundName)){
				var request = "sound/play/"+soundName;
				HtmlServer.sendRequestWithCallback(request);
				GuiElements.alert("sent: " + request);
			}
			else{
				GuiElements.alert("Bad sound: " + soundName);
			}
		}
		else{
			GuiElements.alert("No data");
		}
	});
};