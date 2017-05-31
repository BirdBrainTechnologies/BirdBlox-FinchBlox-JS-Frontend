//@fix Write documentation.

function ListDropSlot(parent,key,snapType){
	if(snapType==null){
		snapType=Slot.snapTypes.none
	}
	DropSlot.call(this,parent,key,snapType);
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
ListDropSlot.prototype.importXml=function(slotNode){
	this.setSelectionData("",null);
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="DropSlot"){
		return this;
	}
	var enteredDataNode=XmlWriter.findSubElement(slotNode,"enteredData");
	var dataNode=XmlWriter.findSubElement(enteredDataNode,"data");
	if(dataNode!=null){
		var data=Data.importXml(dataNode);
		if(data!=null){
			var list=CodeManager.findList(data.getValue());
			if(list!=null) {
				this.setSelectionData(list.getName(), new SelectionData(list));
			}
		}
	}
	var childNode=XmlWriter.findSubElement(slotNode,"child");
	var blockNode=XmlWriter.findSubElement(childNode,"block");
	if(blockNode!=null) {
		var childBlock = Block.importXml(blockNode);
		if (childBlock != null) {
			this.snap(childBlock);
		}
	}
	return this;
};
ListDropSlot.prototype.renameList=function(list){
	if(this.enteredData!=null&&this.enteredData.getValue()==list){
		this.changeText(list.getName());
	}
	this.passRecursively("renameList",list);
};
ListDropSlot.prototype.deleteList=function(list){
	if(this.enteredData!=null&&this.enteredData.getValue()==list){
		this.setSelectionData("",null);
	}
	this.passRecursively("deleteList",list);
};
ListDropSlot.prototype.checkListUsed=function(list){
	if(this.hasChild){
		return DropSlot.prototype.checkListUsed.call(this,list);
	}
	else if(this.enteredData!=null&&this.enteredData.getValue()==list){
		return true;
	}
	return false;
};