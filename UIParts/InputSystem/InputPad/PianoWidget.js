/**
 * Used for selecting a note to play in note blocks.
 * @constructor
 */
InputWidget.Piano = function() {
	this.keys={};
};
InputWidget.Piano.prototype = Object.create(InputWidget.prototype);
InputWidget.Piano.prototype.constructor = InputWidget.Piano;

InputWidget.Piano.setConstants = function() {
	const P = InputWidget.Piano;
	//P.bnMargin = InputPad.margin;
	P.bnMargin = 2;
	P.firstNote = 60;
	P.numWhiteKeys = 14;
	P.whiteKeyW = (InputPad.width - P.bnMargin * (P.numWhiteKeys-1)) / P.numWhiteKeys;
	P.blackKeyW = P.whiteKeyW*0.65;

	P.wkIcon = VectorPaths.mvPianoWhiteKey;
	const wKeyRatio = P.wkIcon.height/P.wkIcon.width;
	P.whiteKeyH = P.whiteKeyW * wKeyRatio;

	P.bkIcon = VectorPaths.mvPianoBlackKey;
	const bKeyRatio = P.bkIcon.height/P.bkIcon.width;
	P.blackKeyH = P.blackKeyW * bKeyRatio;
	P.font = Font.uiFont(34).bold();

	P.blackKeys = [61, 63, 66, 68, 70, 73, 75, 78, 80, 82];
	P.noteStrings = {
		60:"C4",
		61:"C#4",
		62:"D4",
		63:"D#4",
		64:"E4",
		65:"F4",
		66:"F#4",
		67:"G4",
		68:"G#4",
		69:"A4",
		70:"A#4",
		71:"B4",
		72:"C5",
		73:"C#5",
		74:"D5",
		75:"D#5",
		76:"E5",
		77:"F5",
		78:"F#5",
		79:"G5",
		80:"G#5",
		81:"A5",
		82:"A#5",
		83:"B5",
		84:"C6"
	}
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
InputWidget.Piano.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);
	this.group = GuiElements.create.group(x, y, parentGroup);
	//this.displayNum = new DisplayNum(data);
	console.log("show piano " + data);
	this.makeBns(data);
	/* The data in the Slot starts out gray to indicate that it will be deleted on modification. THe number 0 is not
	 * grayed since there's nothing to delete. */
	//this.grayOutUnlessZero();
};

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 */
InputWidget.Piano.prototype.updateDim = function(x, y) {
	const P = InputWidget.Piano;
	this.height = P.whiteKeyH + P.bnMargin * 2;
	this.width = P.whiteKeyW * P.numWhiteKeys + (P.numWhiteKeys - 1) * P.bnMargin;
};

/**
 * Grays out the Slot to indicate that it will be deleted on modification, unless it is 0, in which case there is
 * nothing to modify
 */
InputWidget.Piano.prototype.grayOutUnlessZero = function() {
	const data = this.displayNum.getData();
	if (this.displayNum.isNum || data.getValue() !== 0) {
		this.slotShape.grayOutValue();
	}
};

/**
 * Generates the buttons for the NumPad
 */
InputWidget.Piano.prototype.makeBns = function(keySelected) {
	const P = InputWidget.Piano;
	let currentNum = P.firstNote;
	let xPos = 0;
	let yPos = 0;
	var blackKeys = [];
	for (let i = 0; i < P.numWhiteKeys; i++) {
		this.makeWhiteKey(xPos, yPos, currentNum);

		currentNum += 1;
		if (this.isBlackKey(currentNum)) {
			let key = {};
			key.xPos = xPos;
			key.yPos = yPos;
			key.currentNum = currentNum;
			blackKeys.push(key);

			currentNum += 1;
		}

		xPos += P.bnMargin;
		xPos += P.whiteKeyW;
	}
	blackKeys.forEach(function(key) {
		this.makeBlackKey(key.xPos, key.yPos, key.currentNum);
	}.bind(this));

	this.keys[keySelected].press();
	this.keys[keySelected].release();

};

InputWidget.Piano.prototype.makeWhiteKey = function(x, y, num) {
	const P = InputWidget.Piano;
	let button = this.makeKey(x, y, num, P.whiteKeyW, P.whiteKeyH);
	button.addColorIcon(VectorPaths.mvPianoWhiteKey, P.whiteKeyH, Colors.white);
	GuiElements.update.stroke(button.icon.pathE, Colors.iron, 1);
}

InputWidget.Piano.prototype.makeBlackKey = function(x, y, num) {
	const P = InputWidget.Piano;
	x += P.whiteKeyW + P.bnMargin/2 - P.blackKeyW/2;
	let button = this.makeKey(x, y, num, P.blackKeyW, P.blackKeyH);
	button.addColorIcon(VectorPaths.mvPianoBlackKey, P.blackKeyH, Colors.black);
}

InputWidget.Piano.prototype.makeKey = function(x, y, num, w, h) {
	//console.log("make key " + num + " at " + x);
	const P = InputWidget.Piano;
	let button = new Button(x, y, w, h, this.group, Colors.white);
	button.setCallbackFunction(function(){this.keyPressed(num)}.bind(this));
	button.setUnToggleFunction(function(){});
	button.markAsOverlayPart(this.overlay);
	GuiElements.update.opacity(button.bgRect, 0);
	this.keys[num] = button;
	return button;
}

InputWidget.Piano.prototype.isBlackKey = function(noteNum){
	if (InputWidget.Piano.blackKeys.includes(noteNum)) { return true; }
	return false;
}
/**
 * Adds the number to the end of the DisplayNum, or deletes the current data if it is gray
 * @param {number} num - The number 0-9 to append
 */
InputWidget.Piano.prototype.keyPressed = function(num) {
	//this.displayNum = new DisplayNum(new NumData(num));
	//this.updateFn(this.displayNum.getData(), this.displayNum.getString());
	this.updateFn(num, InputWidget.Piano.noteStrings[num]);
	console.log("pressed key " + num);
	//this.finishFn(this.displayNum.getData());
	this.updatePressed(num);
};

InputWidget.Piano.prototype.updatePressed = function(num) {
	if (this.pressedKey != null && num != this.pressedKey) {
		const oldPressed = this.keys[this.pressedKey];
		oldPressed.unToggle();

		const isBlack = InputWidget.Piano.blackKeys.includes(this.pressedKey);
		if (isBlack) {
			GuiElements.update.stroke(oldPressed.icon.pathE, Colors.black, 0);
		} else {
			GuiElements.update.stroke(oldPressed.icon.pathE, Colors.iron, 1);
		}
	}
	this.pressedKey = num;
	const newPressed = this.keys[this.pressedKey];
	GuiElements.update.stroke(newPressed.icon.pathE, Colors.fbPurpleBorder, 1);

}
