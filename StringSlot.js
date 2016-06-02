function StringSlot(parent,value){
	RectSlot.call(this,parent,Slot.snapTypes.numStrBool,Slot.outputTypes.string,value);
}
StringSlot.prototype = Object.create(RectSlot.prototype);
StringSlot.prototype.constructor = StringSlot;