//@fix Write documentation.

function BroadcastDropSlot(parent,key,isHatBlock){
	if(isHatBlock==null){
		isHatBlock=false;
	}
	var snapType=Slot.snapTypes.numStrBool;
	if(isHatBlock){
		snapType=Slot.snapTypes.none;
	}
	this.isHatBlock=isHatBlock;
	DropSlot.call(this,parent,key,snapType);
}
BroadcastDropSlot.prototype = Object.create(DropSlot.prototype);
BroadcastDropSlot.prototype.constructor = BroadcastDropSlot;
BroadcastDropSlot.prototype.populateList=function(){
	this.clearOptions();
	CodeManager.updateAvailableMessages();
	if(this.isHatBlock){
		this.addOption("any message",new SelectionData("any_message"));
	}
	var messages=CodeManager.broadcastList;
	for(var i=0;i<messages.length;i++){
		var currentMessage=messages[i];
		this.addOption('"'+currentMessage+'"',new StringData(currentMessage));
	}
	this.addOption("new",new SelectionData("new_message"));
};
BroadcastDropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new BroadcastDropSlot(parentCopy,this.isHatBlock);
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};
BroadcastDropSlot.prototype.checkBroadcastMessageAvailable=function(message){
	if(this.enteredData!=null&&this.enteredData.type==Data.types.string){
		return message==this.enteredData.getValue();
	}
	return false;
};
BroadcastDropSlot.prototype.updateAvailableMessages=function(){
	if(this.enteredData!=null&&this.enteredData.type==Data.types.string){
		CodeManager.addBroadcastMessage(this.enteredData.getValue());
	}
};