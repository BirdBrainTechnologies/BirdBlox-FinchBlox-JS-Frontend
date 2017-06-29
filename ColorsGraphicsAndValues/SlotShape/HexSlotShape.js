/**
 * Created by Tom on 6/29/2017.
 */
function HexSlotShape(slot){
	SlotShape.call(this, slot);
}
HexSlotShape.prototype = Object.create(SlotShape.prototype);
HexSlotShape.prototype.constructor = HexSlotShape;
HexSlotShape.setConstants = function(){
	const HSS = HexSlotShape;
	const bG=BlockGraphics.predicate;
	HSS.slotWidth = bG.slotWidth;
	HSS.slotHeight = bG.slotHeight;
};
HexSlotShape.prototype.buildSlot = function(){
	const HSS = HexSlotShape;
	SlotShape.prototype.buildSlot.call(this);
	this.slotE = BlockGraphics.create.slot(this.group,2,this.slot.parent.category);
	TouchReceiver.addListenersChild(this.slotE,this.slot); //Adds event listeners.
};
HexSlotShape.prototype.updateDim = function(){
	const HSS = HexSlotShape;
	this.width=HSS.slotWidth;
	this.height=HSS.slotHeight;
};
HexSlotShape.prototype.updateAlign = function(){
	BlockGraphics.update.path(this.slotE,0,0,this.width,this.height,2,true);
};