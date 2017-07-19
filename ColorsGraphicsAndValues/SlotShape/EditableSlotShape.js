/**
 * Abstract subclass of SlotShape for Slots that allow values (strings/numbers) to be directly entered into the Slot
 * EditableSlotShape can be controlled by an InputSystem
 * EditableSlots have text to display the entered value and a rectangular hit box that is slightly larger than
 * the visual elements of the SlotShape
 * @param {Slot} slot
 * @param {string} initialText - The initial value to display
 * @param {object} dimConstants - An object provided by the subclass with constants for colors/margins
 * @constructor
 */
function EditableSlotShape(slot, initialText, dimConstants) {
	SlotShape.call(this, slot);
	this.text = initialText;
	this.dimConstants = dimConstants;

	// Text can be in one of three color states: selected, deselected, and grayed
	this.isGray = false;
}
EditableSlotShape.prototype = Object.create(SlotShape.prototype);
EditableSlotShape.prototype.constructor = EditableSlotShape;

EditableSlotShape.setConstants = function() {
	const ESS = EditableSlotShape;
	ESS.charHeight = BlockGraphics.valueText.charHeight;
	ESS.hitBox = {};
	ESS.hitBox.hMargin = BlockGraphics.hitBox.hMargin;
	ESS.hitBox.vMargin = BlockGraphics.hitBox.vMargin;
};

/**
 * Create the visual elements of the Slot, but no need to position them correctly
 */
EditableSlotShape.prototype.buildSlot = function() {
	SlotShape.prototype.buildSlot.call(this);
	this.buildBackground();

	this.textE = BlockGraphics.create.valueText(this.text, this.group);
	GuiElements.update.color(this.textE, this.dimConstants.valueText.fill);
	this.hitBoxE = BlockGraphics.create.slotHitBox(this.group);

	// When the SlotShape is touched, tell TR the Slot was touched
	TouchReceiver.addListenersSlot(this.textE, this.slot);
	TouchReceiver.addListenersSlot(this.hitBoxE, this.slot);
};

/**
 * Create the element representing the background
 */
EditableSlotShape.prototype.buildBackground = function() {
	GuiElements.markAbstract();
};

/**
 * Set the text of the SlotShape
 * @param {string} text
 */
EditableSlotShape.prototype.changeText = function(text) {
	this.text = text; //Store value
	GuiElements.update.text(this.textE, text); //Update text.
	this.updateDim();
	this.updateAlign();
};

/**
 * Make the SlotShape appear selected
 */
EditableSlotShape.prototype.select = function() {
	const dC = this.dimConstants;
	GuiElements.update.color(this.textE, dC.valueText.selectedFill);
};

/**
 * Make the SlotShape appear deselected
 */
EditableSlotShape.prototype.deselect = function() {
	const dC = this.dimConstants;
	GuiElements.update.color(this.textE, dC.valueText.fill);
};

/**
 * Make the SlotShape's text grayed out
 */
EditableSlotShape.prototype.grayOutValue = function() {
	const dC = this.dimConstants;
	GuiElements.update.color(this.textE, dC.valueText.grayedFill);
	this.isGray = true;
};

/**
 * Stop the SlotShape's text from being grayed out
 */
EditableSlotShape.prototype.unGrayOutValue = function() {
	const dC = this.dimConstants;
	GuiElements.update.color(this.textE, dC.valueText.selectedFill);
	this.isGray = false;
};

/**
 * Compute the width and height of the SlotShape.  Called agin when text changes
 */
EditableSlotShape.prototype.updateDim = function() {
	const dC = this.dimConstants;
	this.textW = GuiElements.measure.textWidth(this.textE); //Measure text element.
	let width = this.textW + dC.slotLMargin + dC.slotRMargin; //Add space for margins.
	let height = dC.slotHeight; //Has no child, so is just the default height.
	if (width < dC.slotWidth) { //Check if width is less than the minimum.
		width = dC.slotWidth;
	}
	this.width = width; //Save computations.
	this.height = height;
};

/**
 * Move all the parts of the SlotShape to the correct location
 */
EditableSlotShape.prototype.updateAlign = function() {
	const dC = this.dimConstants;
	const textX = (this.width + dC.slotLMargin - dC.slotRMargin) / 2 - this.textW / 2; //Centers the text horizontally.
	const textY = EditableSlotShape.charHeight / 2 + this.height / 2; //Centers the text vertically
	BlockGraphics.update.text(this.textE, textX, textY); //Move the text.
	const bGHB = BlockGraphics.hitBox; //Get data about the size of the hit box.
	const hitX = bGHB.hMargin; //Compute its x and y coords.
	const hitY = bGHB.vMargin;
	const hitW = this.width + bGHB.hMargin * 2; //Compute its width and height.
	const hitH = this.height + bGHB.vMargin * 2;
	GuiElements.update.rect(this.hitBoxE, hitX, hitY, hitW, hitH); //Move/resize its rectangle.
};