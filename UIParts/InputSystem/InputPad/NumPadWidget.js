/**
 * Used for entering numbers into Slots.  Utilizes a DisplayNum to determine how the number changes as keys are pressed
 * @param {boolean} positive - Whether the +/- key should be disabled
 * @param {boolean} integer - Whether the decimal point key should be disabled
 * @constructor
 */
InputWidget.NumPad = function(positive, integer) {
	this.positive = positive;
	this.integer = integer;
};
InputWidget.NumPad.prototype = Object.create(InputWidget.prototype);
InputWidget.NumPad.prototype.constructor = InputWidget.NumPad;

InputWidget.NumPad.setConstants = function() {
	const NP = InputWidget.NumPad;
	NP.bnMargin = InputPad.margin;
	NP.bnWidth = (InputPad.width - NP.bnMargin * 2) / 3;
	NP.bnHeight = 40;
	NP.longBnW = (InputPad.width - NP.bnMargin) / 2;
	NP.font = Font.uiFont(34).bold();
	NP.plusMinusH = 22;
	NP.bsIconH = 25;
	NP.okIconH = NP.bsIconH;
};

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 * @param {Element} parentGroup
 * @param {BubbleOverlay} overlay
 * @param {EditableSlotShape} slotShape
 * @param {function} updateFn
 * @param {function} finishFn
 * @param {Data} data
 */
InputWidget.NumPad.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);
	this.group = GuiElements.create.group(x, y, parentGroup);
	this.displayNum = new DisplayNum(data);
	this.makeBns();
	/* The data in the Slot starts out gray to indicate that it will be deleted on modification. THe number 0 is not
	 * grayed since there's nothing to delete. */
	this.grayOutUnlessZero();
};

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 */
InputWidget.NumPad.prototype.updateDim = function(x, y) {
	const NP = InputWidget.NumPad;
	this.height = NP.bnHeight * 5 + NP.bnMargin * 4;
	this.width = InputPad.width;
};

/**
 * Grays out the Slot to indicate that it will be deleted on modification, unless it is 0, in which case there is
 * nothing to modify
 */
InputWidget.NumPad.prototype.grayOutUnlessZero = function() {
	const data = this.displayNum.getData();
	if (this.displayNum.isNum || data.getValue() !== 0) {
		this.slotShape.grayOutValue();
	}
};

/**
 * Generates the buttons for the NumPad
 */
InputWidget.NumPad.prototype.makeBns = function() {
	const NP = InputWidget.NumPad;
	let currentNum;
	let xPos = 0;
	let yPos = 0;
	for (let i = 0; i < 3; i++) {
		xPos = 0;
		for (let j = 0; j < 3; j++) {
			currentNum = 7 - i * 3 + j;
			this.makeNumBn(xPos, yPos, currentNum);
			xPos += NP.bnMargin;
			xPos += NP.bnWidth;
		}
		yPos += NP.bnMargin;
		yPos += NP.bnHeight;
	}
	this.makeNumBn(NP.bnMargin + NP.bnWidth, NP.bnMargin * 3 + NP.bnHeight * 3, 0);
	this.makePlusMinusBn(0, NP.bnMargin * 3 + NP.bnHeight * 3);
	this.makeDecimalBn(NP.bnMargin * 2 + NP.bnWidth * 2, NP.bnMargin * 3 + NP.bnHeight * 3);
	this.bsButton = this.makeBsBn(0, NP.bnMargin * 4 + NP.bnHeight * 4);
	this.okButton = this.makeOkBn(NP.bnMargin + NP.longBnW, NP.bnMargin * 4 + NP.bnHeight * 4);
};

/**
 * Generates a button that contains text (like a number, +/- button, or decimal point)
 * @param {number} x - The x coord of the button
 * @param {number} y - The y coord of the button
 * @param {string} text - The string to show on the button
 * @param {function} callbackFn - The function to call as the button is pressed
 * @return {Button}
 */
InputWidget.NumPad.prototype.makeTextButton = function(x, y, text, callbackFn) {
	const NP = InputWidget.NumPad;
	let button = new Button(x, y, NP.bnWidth, NP.bnHeight, this.group);
	button.addText(text, NP.font);
	button.setCallbackFunction(callbackFn, false);
	button.markAsOverlayPart(this.overlay);
	return button;
};

/**
 * Generates a button for a number
 * @param {number} x - The y coord of the button
 * @param {number} y - The x coord of the Button
 * @param {number} num - The number the button will display and append to the DisplayNum
 * @return {Button}
 */
InputWidget.NumPad.prototype.makeNumBn = function(x, y, num) {
	return this.makeTextButton(x, y, num + "", function() {
		this.numPressed(num)
	}.bind(this));
};

/**
 * Generates the +/- button that switches the sign of the DisplayNum
 * @param {number} x - The x coord of the button
 * @param {number} y - The y coord of the button
 * @return {Button}
 */
InputWidget.NumPad.prototype.makePlusMinusBn = function(x, y) {
	let button = this.makeTextButton(x, y, String.fromCharCode(177), this.plusMinusPressed.bind(this));
	if (this.positive) button.disable();
	return button;
};

/**
 * Generates the decimal point button
 * @param {number} x - The x coord of the button
 * @param {number} y - The y coord of the button
 * @return {Button}
 */
InputWidget.NumPad.prototype.makeDecimalBn = function(x, y) {
	let button = this.makeTextButton(x, y, ".", this.decimalPressed.bind(this));
	if (this.integer) button.disable();
	return button;
};

/**
 * Generates the Undo/Backspace button
 * @param {number} x - The x coord of the button
 * @param {number} y - The y coord of the button
 * @return {Button}
 */
InputWidget.NumPad.prototype.makeBsBn = function(x, y) {
	const NP = InputWidget.NumPad;
	let button = new Button(x, y, NP.longBnW, NP.bnHeight, this.group);
	button.addIcon(VectorPaths.backspace, NP.bsIconH);
	button.setCallbackFunction(this.bsPressed.bind(this), false);
	button.setCallbackFunction(this.bsReleased.bind(this), true);
	button.markAsOverlayPart(this.overlay);
	return button;
};

/**
 * Generates the check mark button that finishes the edit
 * @param {number} x - The x coord of the button
 * @param {number} y - The y coord of the button
 * @return {Button}
 */
InputWidget.NumPad.prototype.makeOkBn = function(x, y) {
	const NP = InputWidget.NumPad;
	let button = new Button(x, y, NP.longBnW, NP.bnHeight, this.group);
	button.addIcon(VectorPaths.checkmark, NP.okIconH);
	button.setCallbackFunction(this.okPressed.bind(this), true);
	button.markAsOverlayPart(this.overlay);
	return button;
};

/**
 * Adds the number to the end of the DisplayNum, or deletes the current data if it is gray
 * @param {number} num - The number 0-9 to append
 */
InputWidget.NumPad.prototype.numPressed = function(num) {
	this.removeUndo();
	this.deleteIfGray();
	this.displayNum.addDigit(num + "");
	this.sendUpdate();
};

/**
 * Changes the sign of the DisplayNum, or deletes the current Data if it is gray
 */
InputWidget.NumPad.prototype.plusMinusPressed = function() {
	this.removeUndo();
	this.deleteIfGray();
	this.displayNum.switchSign();
	this.sendUpdate();
};

/**
 * Appends a decimal point to the DisplayNum, or deletes the current data if it is gray
 */
InputWidget.NumPad.prototype.decimalPressed = function() {
	this.removeUndo();
	this.deleteIfGray();
	this.displayNum.addDecimalPoint();
	this.sendUpdate();
};

/**
 * If the current data is gray, deletes the current Data and replaces the backspace button with an undo button
 */
InputWidget.NumPad.prototype.deleteIfGray = function() {
	if (this.slotShape.isGray) {
		this.showUndo();
		this.displayNum = new DisplayNum(new NumData(0));
		this.slotShape.unGrayOutValue();
		this.sendUpdate();
	}
};

/**
 * Changes the backspace button to an undo button and saves the current data so it can be restored on undo
 */
InputWidget.NumPad.prototype.showUndo = function() {
	if (!this.undoAvailable) {
		this.undoAvailable = true;
		this.undoData = this.displayNum.getData();
		this.updateBsIcon();
	}
};

/**
 * Changes the undo button to a backspace icon
 */
InputWidget.NumPad.prototype.removeUndo = function() {
	this.removeUndoDelayed();
	this.updateBsIcon();
};

/**
 * Clears undo data and sets undo to unavailable
 */
InputWidget.NumPad.prototype.removeUndoDelayed = function() {
	if (this.undoAvailable) {
		this.undoAvailable = false;
		this.undoData = null;
	}
};

/**
 * Changes the icon of the backspace button to match its current state (backspace/undo)
 */
InputWidget.NumPad.prototype.updateBsIcon = function() {
	const NP = InputWidget.NumPad;
	if (this.undoAvailable !== this.undoVisible) {
		if (this.undoAvailable) {
			this.bsButton.addIcon(VectorPaths.undo, NP.bsIconH);
			this.undoVisible = true;
		} else {
			this.bsButton.addIcon(VectorPaths.backspace, NP.bsIconH);
			this.undoVisible = false;
		}
	}
};

/**
 * Restores the stored undo data and replaces the undo button with a backspace button
 */
InputWidget.NumPad.prototype.undo = function() {
	const NP = InputWidget.NumPad;
	if (this.undoAvailable) {
		this.displayNum = new DisplayNum(this.undoData);
		this.removeUndoDelayed();
		this.slotShape.grayOutValue();
		this.sendUpdate();
	}
};

/**
 * The backspace button's icon is only changed when it is released, not when it is pressed
 */
InputWidget.NumPad.prototype.bsReleased = function() {
	this.updateBsIcon();
};

/**
 * Triggers a backspace or undo action depending on the current state
 */
InputWidget.NumPad.prototype.bsPressed = function() {
	if (this.undoAvailable) {
		this.undo();
	} else {
		this.removeUndoDelayed();
		this.slotShape.unGrayOutValue();
		if (!this.displayNum.isNum) {
			this.displayNum = new DisplayNum(new NumData(0));
		}
		this.displayNum.backspace();
		this.sendUpdate();
	}
};

/**
 * Saves the data to the slot
 */
InputWidget.NumPad.prototype.okPressed = function() {
	this.finishFn(this.displayNum.getData());
};

/**
 * Updates the Slot's appearance to reflect the current edits
 */
InputWidget.NumPad.prototype.sendUpdate = function() {
	this.updateFn(this.displayNum.getData(), this.displayNum.getString());
};
