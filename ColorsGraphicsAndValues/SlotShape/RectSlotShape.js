/**
 * Created by Tom on 6/29/2017.
 */
function RectSlotShape(slot, initialText){
	EditableSlotShape.call(this, slot, initialText, RectSlotShape);
}
RectSlotShape.prototype = Object.create(EditableSlotShape.prototype);
RectSlotShape.prototype.constructor = RectSlotShape;
RectSlotShape.setConstants = function(){
	const RSS = RectSlotShape;
	RSS.slotLMargin = BlockGraphics.string.slotHMargin;
	RSS.slotRMargin = BlockGraphics.string.slotHMargin;
	RSS.slotHeight = BlockGraphics.string.slotHeight;
	RSS.slotWidth = BlockGraphics.string.slotWidth;
	RSS.valueText = {};
	RSS.valueText.fill = BlockGraphics.valueText.fill;
	RSS.valueText.grayedFill = BlockGraphics.valueText.grayedFill;
	RSS.valueText.selectedFill = BlockGraphics.valueText.selectedFill;
};
RectSlotShape.prototype.buildSlot=function(){
	EditableSlotShape.prototype.buildSlot.call(this);
};
RectSlotShape.prototype.buildBackground = function(){
	this.slotE = BlockGraphics.create.slot(this.group,3);
	TouchReceiver.addListenersSlot(this.slotE,this.slot);
};
RectSlotShape.prototype.updateDim = function(){
	EditableSlotShape.prototype.updateDim.call(this);
};
RectSlotShape.prototype.updateAlign = function(){
	EditableSlotShape.prototype.updateAlign.call(this);
	BlockGraphics.update.path(this.slotE,0,0,this.width,this.height,3,true);//Fix! BG
};