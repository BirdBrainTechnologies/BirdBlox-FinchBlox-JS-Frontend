/**
 * RectSlots generally hold strings and are edited through a prompt dialog
 * @param {Block} parent
 * @param {string} key
 * @param {number} snapType
 * @param {number} outputType
 * @param {Data} data
 * @constructor
 */
function RectSlot(parent, key, snapType, outputType, data) {
  EditableSlot.call(this, parent, key, EditableSlot.inputTypes.string, snapType, outputType, data);
  this.slotShape = new RectSlotShape(this, this.dataToString(data));
  this.slotShape.show();
}
RectSlot.prototype = Object.create(EditableSlot.prototype);
RectSlot.prototype.constructor = RectSlot;

/**
 * @inheritDoc
 */
RectSlot.prototype.highlight = function() { //TODO: Fix BlockGraphics
  let isSlot = !this.hasChild;
  Highlighter.highlight(this.getAbsX(), this.getAbsY(), this.width, this.height, 3, isSlot);
};

/**
 * @inheritDoc
 * @param {string} textSummary
 * @return {string}
 */
RectSlot.prototype.formatTextSummary = function(textSummary) {
  return "[" + textSummary + "]";
};

/**
 * @inheritDoc
 * @return {InputDialog}
 */
RectSlot.prototype.createInputSystem = function() {
  if (HatchPlus) {
    const x1 = this.getAbsX();
    const y1 = this.getAbsY();
    const x2 = this.relToAbsX(this.width);
    const y2 = this.relToAbsY(this.height);
    const inputPad = new InputPad(x1, x2, y1, y2);

    inputPad.addWidget(new InputWidget.TextWidget(this.enteredData));
    return inputPad;
  }

  return new InputDialog(this.parent.textSummary(this), true);
};
