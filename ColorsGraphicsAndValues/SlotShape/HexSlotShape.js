/**
 * Controls the graphics of a HexSlot
 * @param {Slot} slot
 * @constructor
 */
function HexSlotShape(slot) {
	SlotShape.call(this, slot);
}
HexSlotShape.prototype = Object.create(SlotShape.prototype);
HexSlotShape.prototype.constructor = HexSlotShape;

HexSlotShape.setConstants = function() {
	const HSS = HexSlotShape;
	const bG = BlockGraphics.predicate;
	HSS.slotWidth = bG.slotWidth;
	HSS.slotHeight = bG.slotHeight;
};

/**
 * @inheritDoc
 */
HexSlotShape.prototype.buildSlot = function() {
	const HSS = HexSlotShape;
	SlotShape.prototype.buildSlot.call(this);
	this.slotE = BlockGraphics.create.slot(this.group, 2, this.slot.parent.category, this.active);
	TouchReceiver.addListenersSlot(this.slotE, this.slot); //Adds event listeners.
};

/**
 * @inheritDoc
 */
HexSlotShape.prototype.updateDim = function() {
	const HSS = HexSlotShape;
	this.width = HSS.slotWidth;
	this.height = HSS.slotHeight;
};

/**
 * @inheritDoc
 */
HexSlotShape.prototype.updateAlign = function() {
	BlockGraphics.update.path(this.slotE, 0, 0, this.width, this.height, 2, true);
};

/**
 * @inheritDoc
 */
HexSlotShape.prototype.makeActive = function() {
	if (!this.active) {
		this.active = true;
		BlockGraphics.update.hexSlotGradient(this.slotE, this.slot.parent.category, this.active);
	}
};

/**
 * @inheritDoc
 */
HexSlotShape.prototype.makeInactive = function() {
	if (this.active) {
		this.active = false;
		BlockGraphics.update.hexSlotGradient(this.slotE, this.slot.parent.category, this.active);
	}
};