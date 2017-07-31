/**
 * DropSlots have their data selected using the InputPad and often hold SelectionData
 * TODO: reduce redundancy with RoundSlot
 * @param {Block} parent
 * @param {string} key
 * @param {number|null} [inputType=select]
 * @param {number|null} [snapType=none]
 * @param {Data} [data=SelectionData.empty()] - The initial Data
 * @param {boolean} [nullable] - Whether empty SelectionData be allowed. By default, is true iff Data == null
 * @constructor
 */
function DropSlot(parent, key, inputType, snapType, data, nullable) {
	if (inputType == null) {
		inputType = EditableSlot.inputTypes.select;
	}
	if (snapType == null) {
		snapType = Slot.snapTypes.none;
	}
	if (data == null) {
		// If no Data was provided, it must be nullable
		DebugOptions.assert(nullable !== false);
		nullable = true;
		data = SelectionData.empty();
	} else if (nullable == null) {
		// If data was provided and nullable is not defined, set it to false
		nullable = false;
	}
	EditableSlot.call(this, parent, key, inputType, snapType, Slot.outputTypes.any, data);
	this.slotShape = new DropSlotShape(this, this.dataToString(data));
	this.slotShape.show();
	this.optionsList = [];
	this.nullable = nullable;
}
DropSlot.prototype = Object.create(EditableSlot.prototype);
DropSlot.prototype.constructor = DropSlot;

/**
 * @inheritDoc
 * TODO: fix BlockGraphics
 */
DropSlot.prototype.highlight = function() {
	const isSlot = !this.hasChild;
	Highlighter.highlight(this.getAbsX(), this.getAbsY(), this.width, this.height, 3, isSlot);
};

/**
 * @inheritDoc
 * @param {string} textSummary
 * @return {string}
 */
DropSlot.prototype.formatTextSummary = function(textSummary) {
	return "[" + textSummary + "]";
};

/**
 * Adds an option that opens a dialog so the user can enter text
 * @param {string} displayText - The text used to display the option
 */
DropSlot.prototype.addEnterText = function(displayText) {
	const option = {};
	option.displayText = displayText;
	option.isAction = true;
	this.optionsList.push(option);
};

/**
 * Adds an option, that when selected set the Slot to the provided value
 * @param {Data} data
 * @param {string} [displayText=null]
 */
DropSlot.prototype.addOption = function(data, displayText) {
	if (displayText == null) {
		displayText = null;
	}
	const option = {};
	option.displayText = displayText;
	option.data = data;
	option.isAction = false;
	this.optionsList.push(option);
};

/**
 * Adds the options to the InputPad's SelectPad
 * @param {InputWidget.SelectPad} selectPad - The pad to add the options to
 */
DropSlot.prototype.populatePad = function(selectPad) {
	this.optionsList.forEach(function(option) {
		// All actions are Edit Text actions
		if (option.isAction) {
			selectPad.addAction(option.displayText, function(callbackFn) {
				// When selected, the item shows a text entry dialog
				const inputDialog = new InputDialog(this.parent.textSummary(this), true);
				inputDialog.show(this.slotShape, function() {}, function(data, cancelled) {
					// When the dialog is closed, the item runns the callback with the data the user entered
					callbackFn(data, !cancelled);
				}, this.enteredData);
			}.bind(this)); //TODO: clean up edit text options
		} else {
			selectPad.addOption(option.data, option.displayText);
		}
	}.bind(this));
};

/**
 * Creates an InputPad with a SelectPad with this Slot's options
 * @return {InputPad}
 */
DropSlot.prototype.createInputSystem = function() {
	const x1 = this.getAbsX();
	const y1 = this.getAbsY();
	const x2 = this.relToAbsX(this.width);
	const y2 = this.relToAbsY(this.height);
	const inputPad = new InputPad(x1, x2, y1, y2);

	const selectPad = new InputWidget.SelectPad();
	this.populatePad(selectPad);
	inputPad.addWidget(selectPad);

	return inputPad;
};

/**
 * Creates SelectionData from the provided value, if that value is a valid option. Otherwise returns null
 * @param {number|boolean|string} value
 * @return {SelectionData|null}
 */
DropSlot.prototype.selectionDataFromValue = function(value) {
	for (let i = 0; i < this.optionsList.length; i++) {
		const option = this.optionsList[i];
		if (!option.isAction && option.data.getValue() === value) {
			return option.data;
		}
	}
	return null;
};

/**
 * Overrided by subclasses to sanitize other types of Data. By default, all non-selection Data is valid
 * @param {Data} data
 * @return {Data|null}
 */
DropSlot.prototype.sanitizeNonSelectionData = function(data) {
	return data;
};

/**
 * @inheritDoc
 * @param {Data} data
 * @return {Data|null}
 */
DropSlot.prototype.sanitizeData = function(data) {
	data = EditableSlot.prototype.sanitizeData.call(this, data);
	if (data == null) return null;
	if (data.isSelection()) {
		const value = data.getValue();
		if (value === "" && this.nullable) {
			return SelectionData.empty();
		}
		return this.selectionDataFromValue(value);
	}
	return this.sanitizeNonSelectionData(data);
};