/**
 * RoundSlots are Slots that generally hold numbers and are edited using the InputPad.  They can have special optios
 * on the InputPad that allow specific NumData, StringData, or SelectionData to be entered.
 * TODO: Make RoundSlot and DropSlot subclasses of a shared class to remove redundant code
 * @param {Block} parent
 * @param {string} key
 * @param {number} inputType
 * @param {number} snapType
 * @param {number} outputType
 * @param {Data} data
 * @param {boolean} positive - Whether the Slot should be limited to positive inputs
 * @param {boolean} integer - Whether the Slot should be limited to integer inputs
 * @constructor
 */
function RoundSlot(parent, key, inputType, snapType, outputType, data, positive, integer) {
  EditableSlot.call(this, parent, key, inputType, snapType, outputType, data);
  this.slotShape = new RoundSlotShape(this, this.dataToString(data));
  this.slotShape.show();
  // A list of additional options to show on the InputPad
  this.optionsList = [];
  this.positive = positive;
  this.integer = integer;
  // Text for the label that appears at te top of the pad
  this.labelText = "";
}
RoundSlot.prototype = Object.create(EditableSlot.prototype);
RoundSlot.prototype.constructor = RoundSlot;

/**
 * @inheritDoc
 */
RoundSlot.prototype.highlight = function() {
  const isSlot = !this.hasChild; //TODO: Fix! unclear.
  Highlighter.highlight(this.getAbsX(), this.getAbsY(), this.width, this.height, 1, isSlot);
};

/**
 * @inheritDoc
 * @param {string} textSummary
 * @return {string}
 */
RoundSlot.prototype.formatTextSummary = function(textSummary) {
  return "(" + textSummary + ")";
};

/**
 * Adds an additional option to be selected from the InputPad
 * @param {Data} data
 * @param {string} displayText
 */
RoundSlot.prototype.addOption = function(data, displayText) {
  if (displayText == null) {
    displayText = null;
  }
  const option = {};
  option.displayText = displayText;
  option.data = data;
  this.optionsList.push(option);
};

/**
 * Adds additional options to the InputPad's SelectPad
 * @param {InputWidget.SelectPad} selectPad - the SelectPad that will be added to this Slot's InputPad
 */
RoundSlot.prototype.populatePad = function(selectPad) {
  this.optionsList.forEach(function(option) {
    selectPad.addOption(option.data, option.displayText);
  });
};

/**
 * @inheritDoc
 * @return {InputPad}
 */
RoundSlot.prototype.createInputSystem = function() {
  const x1 = this.getAbsX();
  const y1 = this.getAbsY();
  const x2 = this.relToAbsX(this.width);
  const y2 = this.relToAbsY(this.height);
  const inputPad = new InputPad(x1, x2, y1, y2);

  // Add label to the top of the pad
  if (this.labelText !== "") {
    inputPad.addWidget(new InputWidget.Label(this.labelText));
  }

  const selectPad = new InputWidget.SelectPad();
  this.populatePad(selectPad);
  if (!selectPad.isEmpty()) {
    inputPad.addWidget(selectPad);
  }

  inputPad.addWidget(new InputWidget.NumPad(this.positive, this.integer));
  return inputPad;
};

/**
 * Creates SelectionData from the provided value, if that value is a valid option. Otherwise returns null
 * @param {number|boolean|string} value
 * @return {SelectionData|null}
 */
RoundSlot.prototype.selectionDataFromValue = function(value) {
  for (let i = 0; i < this.optionsList.length; i++) {
    const option = this.optionsList[i];
    if (option.data.getValue() === value) {
      return option.data;
    }
  }
  return null;
};

/**
 * @inheritDoc
 * @param {Data} data
 * @return {Data|null}
 */
RoundSlot.prototype.sanitizeData = function(data) {
  // Convert Data to the correct type
  data = EditableSlot.prototype.sanitizeData.call(this, data);
  if (data == null) return null;
  if (data.isSelection()) {
    // Never trust the displayText of user-provided SelectionData. Instead, look it up based on value
    const value = data.getValue();
    return this.selectionDataFromValue(value);
  }
  // If the Data is not SelectionData and it's of the correct type, it must be valid
  return data;
};

/**
 * Sets the labelText to the provided string
 * @param {string} text
 */
RoundSlot.prototype.addLabelText = function(text) {
  this.labelText = text;
};
