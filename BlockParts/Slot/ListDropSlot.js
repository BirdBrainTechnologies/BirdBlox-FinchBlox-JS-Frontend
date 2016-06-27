//@fix Write documentation.

function ListDropSlot(parent,snapType){
	if(snapType==null){
		snapType=Slot.snapTypes.none
	}
	DropSlot.call(this,parent,snapType);
	var lists=CodeManager.listList;
	if(lists.length>0){
		var lastList=lists[lists.length-1];
		this.setSelectionData(lastList.getName(),new SelectionData(lastList));
	}
}
ListDropSlot.prototype = Object.create(DropSlot.prototype);
ListDropSlot.prototype.constructor = ListDropSlot;
ListDropSlot.prototype.populateList=function(){
	this.clearOptions();
	var lists=CodeManager.listList;
	for(var i=0;i<lists.length;i++){
		var currentList=lists[i];
		this.addOption(currentList.getName(),new SelectionData(currentList));
	}
};
ListDropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new ListDropSlot(parentCopy,this.snapType);
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};