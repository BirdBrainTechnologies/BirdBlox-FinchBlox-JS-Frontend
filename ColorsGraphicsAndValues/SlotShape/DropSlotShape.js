/**
 * Controls the DropDown graphic for a DropSlot
 * @param {Slot} slot
 * @param {string} initialText
 * @constructor
 */
function DropSlotShape(slot, initialText) {
	EditableSlotShape.call(this, slot, initialText, DropSlotShape);
}
DropSlotShape.prototype = Object.create(EditableSlotShape.prototype);
DropSlotShape.prototype.constructor = DropSlotShape;
DropSlotShape.setConstants = function() {
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

/**
 * @inheritDoc
 */
DropSlotShape.prototype.buildSlot = function() {
	EditableSlotShape.prototype.buildSlot.call(this);
};

/**
 * @inheritDoc
 */
DropSlotShape.prototype.buildBackground = function() {
	this.bgE = this.generateBg();
	this.triE = this.generateTri();
};

/**
 * Creates the dark, semi-transparent background of the Slot
 * @return {Node} - The rectangle for the background
 */
DropSlotShape.prototype.generateBg = function() {
	const DSS = DropSlotShape;
	const bgE = GuiElements.create.rect(this.group);
	GuiElements.update.color(bgE, DSS.bgColor);
	GuiElements.update.opacity(bgE, DSS.bgOpacity);
	TouchReceiver.addListenersSlot(bgE, this.slot);
	return bgE;
};

/**
 * Creates the triangle for the side of the DropSlotShape
 * @return {Node} - an SVG path object
 */
DropSlotShape.prototype.generateTri = function() {
	const DSS = DropSlotShape;
	const triE = GuiElements.create.path(this.group);
	GuiElements.update.color(triE, DSS.triColor);
	TouchReceiver.addListenersSlot(triE, this.slot);
	return triE;
};

/**
 * @inheritDoc
 */
DropSlotShape.prototype.updateDim = function() {
	EditableSlotShape.prototype.updateDim.call(this);
};

/**
 * @inheritDoc
 */
DropSlotShape.prototype.updateAlign = function() {
	const DSS = DropSlotShape;
	// Align the text and hit box of the Slot
	EditableSlotShape.prototype.updateAlign.call(this);

	// Compute the location of the triangle
	const triX = this.width - DSS.slotRMargin + DSS.textMargin;
	const triY = this.height / 2 - DSS.triH / 2;
	GuiElements.update.triangle(this.triE, triX, triY, DSS.triW, 0 - DSS.triH);

	// Align the background
	GuiElements.update.rect(this.bgE, 0, 0, this.width, this.height);
};

/**
 * @inheritDoc
 */
DropSlotShape.prototype.select = function() {
	const DSS = DropSlotShape;
	EditableSlotShape.prototype.select.call(this);
	GuiElements.update.opacity(this.bgE, DSS.selectedBgOpacity);
	GuiElements.update.color(this.triE, DSS.selectedTriColor);
};

/**
 * @inheritDoc
 */
DropSlotShape.prototype.deselect = function() {
	const DSS = DropSlotShape;
	EditableSlotShape.prototype.deselect.call(this);
	GuiElements.update.opacity(this.bgE, DSS.bgOpacity);
	GuiElements.update.color(this.triE, DSS.triColor);
};