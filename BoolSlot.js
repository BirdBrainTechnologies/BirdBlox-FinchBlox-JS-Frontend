function BoolSlot(parent){
	HexSlot.call(this,parent,Slot.snapTypes.bool);
}
BoolSlot.prototype = Object.create(HexSlot.prototype);
BoolSlot.prototype.constructor = BoolSlot;