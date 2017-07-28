/**
 * Controls the graphics for a RoundSlot
 * @param {Slot} slot
 * @param {string} initialText
 * @constructor
 */
function RoundSlotShape(slot, initialText) {
	EditableSlotShape.call(this, slot, initialText, RoundSlotShape);
}
RoundSlotShape.prototype = Object.create(EditableSlotShape.prototype);
RoundSlotShape.prototype.constructor = RoundSlotShape;

RoundSlotShape.setConstants = function() {
	const RSS = RoundSlotShape;
	const bG = BlockGraphics.reporter;
	RSS.slotLMargin = bG.slotHMargin;
	RSS.slotRMargin = bG.slotHMargin;
	RSS.slotHeight = bG.slotHeight;
	RSS.slotWidth = bG.slotWidth;

	RSS.valueText = {};
	RSS.valueText.fill = BlockGraphics.valueText.fill;
	RSS.valueText.grayedFill = BlockGraphics.valueText.grayedFill;
	RSS.valueText.selectedFill = BlockGraphics.valueText.selectedFill;

	RSS.slotSelectedFill = bG.slotSelectedFill;
	RSS.slotFill = bG.slotFill;
};

/**
 * @inheritDoc
 */
RoundSlotShape.prototype.buildSlot = function() {
	EditableSlotShape.prototype.buildSlot.call(this);
};

/**
 * @inheritDoc
 */
RoundSlotShape.prototype.buildBackground = function() {
	this.slotE = BlockGraphics.create.slot(this.group, 1);
	TouchReceiver.addListenersSlot(this.slotE, this.slot);
};

/**
 * @inheritDoc
 */
RoundSlotShape.prototype.updateDim = function() {
	EditableSlotShape.prototype.updateDim.call(this);
};

/**
 * @inheritDoc
 */
RoundSlotShape.prototype.updateAlign = function() {
	EditableSlotShape.prototype.updateAlign.call(this);
	BlockGraphics.update.path(this.slotE, 0, 0, this.width, this.height, 1, true); //Fix! BG
};

/**
 * @inheritDoc
 */
RoundSlotShape.prototype.select = function() {
	const RSS = RoundSlotShape;
	EditableSlotShape.prototype.select.call(this);
	GuiElements.update.color(this.slotE, RSS.slotSelectedFill);
};

/**
 * @inheritDoc
 */
RoundSlotShape.prototype.deselect = function() {
	const RSS = RoundSlotShape;
	EditableSlotShape.prototype.deselect.call(this);
	GuiElements.update.color(this.slotE, RSS.slotFill);
};