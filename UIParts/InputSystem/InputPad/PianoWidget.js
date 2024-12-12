/**
 * Used for selecting a note to play in note blocks.
 * @constructor
 */
InputWidget.Piano = function(index) {
  this.index = index; //widget index; FinchBlox only
  this.keys = {};
  this.type = "piano";
  this.keysY = 0
  this.octaveOffset = 0 //how many octaves away from default?
};
InputWidget.Piano.prototype = Object.create(InputWidget.prototype);
InputWidget.Piano.prototype.constructor = InputWidget.Piano;

InputWidget.Piano.setConstants = function() {
  const P = InputWidget.Piano;

  P.grayOutline = (Hatchling || HatchPlus) ? Colors.ballyGrayLight : Colors.iron 
  P.purpleOutline = (Hatchling || HatchPlus) ? Colors.ballyPurpleDark : Colors.fbPurpleBorder

  P.bnMargin = 2;
  P.firstNote = 48;
  P.numWhiteKeys = FinchBlox ? 14 : 15;
  P.inputPadWidth = FinchBlox ? InputPad.width : InputPad.width * 3
  P.whiteKeyW = (P.inputPadWidth - P.bnMargin * (P.numWhiteKeys - 1)) / P.numWhiteKeys;
  P.blackKeyW = P.whiteKeyW * 0.65;

  P.wkIcon = VectorPaths.mvPianoWhiteKey;
  const wKeyRatio = P.wkIcon.height / P.wkIcon.width;
  P.whiteKeyH = P.whiteKeyW * wKeyRatio;

  P.bkIcon = VectorPaths.mvPianoBlackKey;
  const bKeyRatio = P.bkIcon.height / P.bkIcon.width;
  P.blackKeyH = P.blackKeyW * bKeyRatio;
  P.font = Font.uiFont(34).bold();

  P.blackKeys = [49, 51, 54, 56, 58, 61, 63, 66, 68, 70, 73, 75, 78, 80, 82];

  P.noteStrings = {}
  for (let i = 0; i < 8; i++) {
    P.noteStrings[24+i*12] = "C" + (i+1)
    P.noteStrings[25+i*12] = "C#" + (i+1)
    P.noteStrings[26+i*12] = "D" + (i+1)
    P.noteStrings[27+i*12] = "D#" + (i+1)
    P.noteStrings[28+i*12] = "E" + (i+1)
    P.noteStrings[29+i*12] = "F" + (i+1)
    P.noteStrings[30+i*12] = "F#" + (i+1)
    P.noteStrings[31+i*12] = "G" + (i+1)
    P.noteStrings[32+i*12] = "G#" + (i+1)
    P.noteStrings[33+i*12] = "A" + (i+1)
    P.noteStrings[34+i*12] = "A#" + (i+1)
    P.noteStrings[35+i*12] = "B" + (i+1)
  }
  P.noteStrings[120] = "C9"
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
  //console.log("show piano " + this.index + " " + data[this.index] + " " + data.getValue());

  if (FinchBlox) {
    this.makeBns(data[this.index]);
  } else {
    const midiNum = data.getValue()

    //Add the note label above the keyboard
    const labelText = InputWidget.Piano.noteStrings[midiNum]
    const L = InputWidget.Label;
    this.textE = GuiElements.draw.text(x, y, "", L.font, L.color);
    GuiElements.update.textLimitWidth(this.textE, labelText, InputPad.width);
    const textW = GuiElements.measure.textWidth(this.textE);
    this.textY = y + L.font.charHeight + L.margin;
    const textX = InputWidget.Piano.inputPadWidth / 2 - textW / 2;
    GuiElements.move.text(this.textE, textX, this.textY);
    parentGroup.appendChild(this.textE);

    //Add the arrow buttons to change the octave
    const bnW = L.font.charHeight
    const bnY = y + L.margin
    const iconP = VectorPaths.bdPlay
    const iconC = Colors.ballyBrandBlueLight
    const lowerBn = new Button(x, bnY, bnW, bnW, this.group, InputPad.background)
    lowerBn.addColorIcon(iconP, bnW, iconC, 180)
    lowerBn.markAsOverlayPart(this.overlay)
    lowerBn.setCallbackFunction(function() { this.changeOctave(false) }.bind(this))
    const bn2X = InputWidget.Piano.inputPadWidth - bnW
    const raiseBn = new Button(bn2X, bnY, bnW, bnW, this.group, InputPad.background)
    raiseBn.addColorIcon(iconP, bnW, iconC)
    raiseBn.markAsOverlayPart(this.overlay)
    raiseBn.setCallbackFunction(function() { this.changeOctave(true) }.bind(this))

    //Calculate the position of the keys based on how much space the label takes up
    this.keysY = this.textY + L.margin + InputPad.margin

    //Calculate where the specified note is located
    if (midiNum < 48) { this.octaveOffset = 12 * Math.floor((midiNum - 48)/12) }
    if (midiNum > 72) { this.octaveOffset = 12 * Math.ceil((midiNum - 72)/12) }
    console.log("*** octaveOffset: " + this.octaveOffset + "  " + midiNum)

    this.makeBns(midiNum - this.octaveOffset);

    
  }

  /* The data in the Slot starts out gray to indicate that it will be deleted on modification. The number 0 is not
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
  const L = InputWidget.Label;
  this.height = L.font.charHeight + 2*L.margin + InputPad.margin + P.whiteKeyH + P.bnMargin * 2;
  this.width = P.whiteKeyW * P.numWhiteKeys + (P.numWhiteKeys - 1) * P.bnMargin;
};

/**
 * Grays out the Slot to indicate that it will be deleted on modification, unless it is 0, in which case there is
 * nothing to modify
 */
/*InputWidget.Piano.prototype.grayOutUnlessZero = function() {
  const data = this.displayNum.getData();
  if (this.displayNum.isNum || data.getValue() !== 0) {
    this.slotShape.grayOutValue();
  }
};*/

/**
 * Generates the buttons for the NumPad
 */
InputWidget.Piano.prototype.makeBns = function(keySelected) {
  const P = InputWidget.Piano;
  let currentNum = P.firstNote;
  let xPos = 0;
  let yPos = this.keysY;
  var blackKeys = [];
  for (let i = 0; i < P.numWhiteKeys; i++) {
    this.makeWhiteKey(xPos, yPos, currentNum);

    currentNum += 1;
    if (this.isBlackKey(currentNum) && i != P.numWhiteKeys-1) {
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
  button.iconInverts = true;
  GuiElements.update.stroke(button.icon.pathE, P.grayOutline, 1);
}

InputWidget.Piano.prototype.makeBlackKey = function(x, y, num) {
  const P = InputWidget.Piano;
  x += P.whiteKeyW + P.bnMargin / 2 - P.blackKeyW / 2;
  let button = this.makeKey(x, y, num, P.blackKeyW, P.blackKeyH);
  button.addColorIcon(VectorPaths.mvPianoBlackKey, P.blackKeyH, Colors.black);
  button.iconInverts = true;
}

InputWidget.Piano.prototype.makeKey = function(x, y, num, w, h) {
  //console.log("make key " + num + " at " + x);
  const P = InputWidget.Piano;
  let button = new Button(x, y, w, h, this.group, Colors.white);
  button.setCallbackFunction(function() {
    this.keyPressed(num + this.octaveOffset)
  }.bind(this));
  button.setUnToggleFunction(function() {});
  button.markAsOverlayPart(this.overlay);
  GuiElements.update.opacity(button.bgRect, 0);
  this.keys[num] = button;

  if (HatchPlus) { button.highlightFore = Colors.ballyPurpleLight }

  return button;
}

InputWidget.Piano.prototype.isBlackKey = function(noteNum) {
  if (InputWidget.Piano.blackKeys.indexOf(noteNum) !== -1) {
    return true;
  }
  return false;
}
/**
 * Adds the number to the end of the DisplayNum, or deletes the current data if it is gray
 * @param {number} num - The number 0-9 to append
 */
InputWidget.Piano.prototype.keyPressed = function(num) {
  //this.displayNum = new DisplayNum(new NumData(num));
  //this.updateFn(this.displayNum.getData(), this.displayNum.getString());
  //this.updateFn(num, InputWidget.Piano.noteStrings[num]);
  if (FinchBlox) {
    this.updateFn(num, this.index);
  } else {
    this.updateFn(new NumData(num));
  }

  //console.log("pressed key " + num);
  //this.finishFn(this.displayNum.getData());
  this.updatePressed(num);
};

InputWidget.Piano.prototype.updatePressed = function(midiNum) {
  const P = InputWidget.Piano;
  const keyIndex = midiNum - this.octaveOffset
  if (this.pressedKey != null && keyIndex != this.pressedKey) {
    const oldPressed = this.keys[this.pressedKey];
    oldPressed.unToggle();

    const isBlack = (InputWidget.Piano.blackKeys.indexOf(this.pressedKey) !== -1);
    if (isBlack) {
      GuiElements.update.stroke(oldPressed.icon.pathE, Colors.black, 0);
    } else {
      GuiElements.update.stroke(oldPressed.icon.pathE, P.grayOutline, 1);
    }
  }
  this.pressedKey = keyIndex;
  const newPressed = this.keys[this.pressedKey];
  GuiElements.update.stroke(newPressed.icon.pathE, P.purpleOutline, 1);

  //FinchBlox doesn't have a label over the keyboard
  if (!FinchBlox) {
    const labelText = InputWidget.Piano.noteStrings[midiNum]
    const ipW = InputWidget.Piano.inputPadWidth;
    GuiElements.update.textLimitWidth(this.textE, labelText, ipW);
    const textW = GuiElements.measure.textWidth(this.textE);
    const textX = ipW / 2 - textW / 2;
    GuiElements.move.text(this.textE, textX, this.textY);
  }

}

InputWidget.Piano.prototype.changeOctave = function(raise) {
  this.octaveOffset = raise ? this.octaveOffset + 12 : this.octaveOffset - 12
  this.octaveOffset = Math.max(-24, Math.min(48, this.octaveOffset))

  this.keys[this.pressedKey].press();
  this.keys[this.pressedKey].release();
}
