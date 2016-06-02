function NumSlot(parent,value,positive,integer){
	if(positive==null){
		positive=false;
	}
	if(integer==null){
		integer=false;
	}
	RoundSlot.call(this,parent,Slot.snapTypes.numStrBool,Slot.outputTypes.num,value,positive,integer);
}
NumSlot.prototype = Object.create(RoundSlot.prototype);
NumSlot.prototype.constructor = NumSlot;