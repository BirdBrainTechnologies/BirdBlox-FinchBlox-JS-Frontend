/**
 * Created by Tom on 6/29/2017.
 */
function DropSlotShape(slot, initialText){
	EditableSlotShape.call(this, slot, initialText, DropSlotShape);
}
DropSlotShape.prototype = Object.create(EditableSlotShape.prototype);
DropSlotShape.prototype.constructor = DropSlotShape;
DropSlotShape.setConstants = function(){
	const DSS = DropSlotShape;
	const bG = BlockGraphics.dropSlot;
	DSS.bgColor = bG.bg;
	DSS.bgOpacity = bG.bgOpacity;
	DSS.selectedBgOpacity = bG.selectedBgOpacity;
	DSS.triColor = bG.triColor;
	DSS.selectedTriColor = bG.selectedTriColor;
	DSS.triW = bG.triW;
	DSS.triH = bG.triH;

	DSS.slotLMargin = bG.slotHMargin;
	DSS.textMargin = DSS.slotLMargin;
	DSS.slotRMargin = DSS.slotLMargin + DSS.textMargin + DSS.triW;
	DSS.slotHeight = bG.slotHeight;
	DSS.slotWidth = bG.slotWidth;

	DSS.valueText = {};
	DSS.valueText.fill = bG.textFill;
	DSS.valueText.grayedFill = BlockGraphics.valueText.grayedFill;
	DSS.valueText.selectedFill = bG.textFill;
};
DropSlotShape.prototype.buildSlot = function(){
	EditableSlotShape.prototype.buildSlot.call(this);
};
DropSlotShape.prototype.buildBackground = function(){
	this.bgE=this.generateBg();
	this.triE=this.generateTri();
};
DropSlotShape.prototype.generateBg=function(){
	const DSS = DropSlotShape;
	const bgE=GuiElements.create.rect(this.group);
	GuiElements.update.color(bgE,DSS.bgColor);
	GuiElements.update.opacity(bgE,DSS.bgOpacity);
	TouchReceiver.addListenersSlot(bgE,this.slot);
	return bgE;
};
DropSlotShape.prototype.generateTri=function(){
	const DSS = DropSlotShape;
	const triE=GuiElements.create.path(this.group);
	GuiElements.update.color(triE,DSS.triColor);
	TouchReceiver.addListenersSlot(triE,this.slot);
	return triE;
};
DropSlotShape.prototype.updateDim = function(){
	EditableSlotShape.prototype.updateDim.call(this);
};
DropSlotShape.prototype.updateAlign = function(){
	const DSS = DropSlotShape;
	EditableSlotShape.prototype.updateAlign.call(this);

	const triX=this.width - DSS.slotRMargin + DSS.textMargin;
	const triY=this.height/2 - DSS.triH/2;
	GuiElements.update.triangle(this.triE,triX,triY,DSS.triW,0-DSS.triH);

	GuiElements.update.rect(this.bgE,0,0,this.width,this.height);
};
DropSlotShape.prototype.select = function(){
	const DSS = DropSlotShape;
	EditableSlotShape.prototype.select.call(this);
	GuiElements.update.opacity(this.bgE,DSS.selectedBgOpacity);
	GuiElements.update.color(this.triE,DSS.selectedTriColor);
};
DropSlotShape.prototype.deselect = function(){
	const DSS = DropSlotShape;
	EditableSlotShape.prototype.deselect.call(this);
	GuiElements.update.opacity(this.bgE,DSS.bgOpacity);
	GuiElements.update.color(this.triE,DSS.triColor);
};