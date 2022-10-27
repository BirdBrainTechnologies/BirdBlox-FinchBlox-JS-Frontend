/**
 * NoteSlot is a subclass of NumSlot which is a subclass of RoundSlot.
 * It creates a RoundSlot optimized for use with musical notes.
 * It automatically converts any results into NumData and has a snapType of numStrBool.
 * @constructor
 * @param {Block} parent
 * @param {string} key
 * @param {number} value
 * @param {boolean} [positive] - Determines if the NumPad will have the plus/minus Button disabled.
 * @param {boolean} [integer] - Determines if the NumPad will have the decimal point Button disabled.
 */
function NoteSlot(parent, key, value, positive, integer) {
  NumSlot.call(this, parent, key, value, positive, integer);
}
NoteSlot.prototype = Object.create(NumSlot.prototype);
NoteSlot.prototype.constructor = NoteSlot;

/**
 * @inheritDoc
 * @return {InputPad}
 */
NoteSlot.prototype.createInputSystem = function() {
  const x1 = this.getAbsX();
  const y1 = this.getAbsY();
  const x2 = this.relToAbsX(this.width);
  const y2 = this.relToAbsY(this.height);

  const labelText = InputWidget.Piano.noteStrings[this.enteredData.getValue()]
  this.label = new InputWidget.Label(labelText)

  const inputPad = new InputPad(x1, x2, y1, y2);
  inputPad.addWidget(this.label);
  inputPad.addWidget(new InputWidget.Piano(0));

  return inputPad;
};


NoteSlot.prototype.updateEdit = function(data) {
  //Call the updateEdit function of the superclass
  Object.getPrototypeOf(Object.getPrototypeOf(this)).updateEdit.call(this, data);

  const midiNote = this.enteredData.getValue()

  //Update the label with the note name
  const labelText = InputWidget.Piano.noteStrings[midiNote]
  const ipW = InputWidget.Piano.inputPadWidth;
  GuiElements.update.textLimitWidth(this.label.textE, labelText, ipW);
  const textW = GuiElements.measure.textWidth(this.label.textE);
  const textX = ipW / 2 - textW / 2;
  const textY = this.label.textY;
  GuiElements.move.text(this.label.textE, textX, textY);

  //Play the proposed note
  HtmlServer.sendTabletSoundRequest(midiNote, CodeManager.beatsToMs(0.5));
}
