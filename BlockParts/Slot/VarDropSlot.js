//@fix Write documentation.

function VarDropSlot(parent){
	DropSlot.call(this,parent,Slot.snapTypes.none);
	var variables=CodeManager.variableList;
	if(variables.length>0){
		var lastVar=variables[variables.length-1];
		this.setSelectionData(lastVar.getName(),new SelectionData(lastVar));
	}
}
VarDropSlot.prototype = Object.create(DropSlot.prototype);
VarDropSlot.prototype.constructor = VarDropSlot;
VarDropSlot.prototype.populateList=function(){
	this.clearOptions();
	var variables=CodeManager.variableList;
	for(var i=0;i<variables.length;i++){
		var currentVar=variables[i];
		this.addOption(currentVar.getName(),new SelectionData(currentVar));
	}
};
VarDropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new VarDropSlot(parentCopy);
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};