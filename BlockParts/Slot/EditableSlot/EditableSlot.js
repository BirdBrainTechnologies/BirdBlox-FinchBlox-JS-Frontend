/**
 * EditableSlot is an abstract class representing Slots that can have a value directly entered into them
 * in addition to accepting Blocks.
 * Subclasses must implement createInputSystem() and formatTextSummary()
 * @param {Block} parent
 * @param {string} key
 * @param {number} inputType
 * @param {number} snapType
 * @param {number} outputType - [any, num, string, select] The type of data that can be directly entered
 * @param {Data} data - The initial value of the Slot
 * @constructor
 */
function EditableSlot(parent, key, inputType, snapType, outputType, data) {
	Slot.call(this, parent, key, snapType, outputType);
	this.inputType = inputType;
	this.enteredData = data;
	this.editing = false;
	//TODO: make the slotShape be an extra argument
}
EditableSlot.prototype = Object.create(Slot.prototype);
EditableSlot.prototype.constructor = EditableSlot;

EditableSlot.setConstants = function() {
	/* The type of Data that can be directly entered into the Slot. */
	EditableSlot.inputTypes = {};
	EditableSlot.inputTypes.any = 0;
	EditableSlot.inputTypes.num = 1;
	EditableSlot.inputTypes.string = 2;
	EditableSlot.inputTypes.select = 3;
};

/**
 * @param {string} text - The text to set the slotShape to display
 * @param {boolean} updateDim - Should the Stack be told to update after this?
 */
EditableSlot.prototype.changeText = function(text, updateDim) {
	this.slotShape.changeText(text);
	if (updateDim && this.parent.stack != null) {
		this.parent.stack.updateDim(); //Update dimensions.
	}
};

/**
 * Tells the Slot to display an inputSys so it can be edited. Also sets the slotShape to appear selected
 */
EditableSlot.prototype.edit = function() {
	DebugOptions.assert(!this.hasChild);
	if (!this.editing) {
		this.editing = true;
		this.slotShape.select();
		const inputSys = this.createInputSystem();
		inputSys.show(this.slotShape, this.updateEdit.bind(this), this.finishEdit.bind(this), this.enteredData);
	}
};

/**
 * Generates and displays an interface to modify the Slot's value
 */
EditableSlot.prototype.createInputSystem = function() {
	DebugOptions.markAbstract();
};

/**
 * Called by the InputSystem to change the Slot's data and displayed text
 * @param {Data} data - The Data the Slot should set its value to
 * @param {string} [visibleText] - The text the Slot should display as its value. Should correspond to Data.
 */
EditableSlot.prototype.updateEdit = function(data, visibleText) {
	DebugOptions.assert(this.editing);
	if (visibleText == null) {
		visibleText = this.dataToString(data);
	}
	this.enteredData = data;
	this.changeText(visibleText, true);
};

/**
 * Called when an InputSystem finishes editing the Slot
 * @param {Data} data - The Data the Slot should be set to
 */
EditableSlot.prototype.finishEdit = function(data) {
	DebugOptions.assert(this.editing);
	if (this.editing) {
		this.setData(data, true, true); //Sanitize data, updateDims
		this.slotShape.deselect();
		this.editing = false;
	}
};

/**
 * Assigns the Slot's Data and updates its text.w
 * @param {Data} data - The Data to set to
 * @param {boolean} sanitize - indicates whether the Data should be run through sanitizeData first
 * @param {boolean} updateDim - indicates if the Stack should updateDim after this
 */
EditableSlot.prototype.setData = function(data, sanitize, updateDim) {
	if (sanitize) {
		data = this.sanitizeData(data);
	}
	if (data == null) return;
	this.enteredData = data;
	this.changeText(this.dataToString(this.enteredData), updateDim);
};

/**
 * Converts the Slot's data to a displayable string. Subclasses override this method to apply formatting
 * @param {Data} data
 * @return {string}
 */
EditableSlot.prototype.dataToString = function(data) {
	return data.asString().getValue();
};

/**
 * Validates that the Data is compatible with this Slot. May attempt to fix invalid Data.
 * By default, this function just converts the data to the correct type. Subclasses override this method.
 * Makes use of inputType
 * @param {Data|null} data - The Data to sanitize
 * @return {Data|null} - The sanitized Data or null if the Data cannot be sanitized
 */
EditableSlot.prototype.sanitizeData = function(data) {
	if (data == null) return null;
	const inputTypes = EditableSlot.inputTypes;
	// Only valid Data of the correct type is allowed
	if (this.inputType === inputTypes.string) {
		data = data.asString();
	} else if (this.inputType === inputTypes.num) {
		data = data.asNum();
	} else if (this.inputType === inputTypes.select) {
		data = data.asSelection();
	}
	if (data.isValid) {
		return data;
	}
	return null;
};

/**
 * @inheritDoc
 * @return {string}
 */
EditableSlot.prototype.textSummary = function() {
	let result = "...";
	if (!this.hasChild) { //If it has a child, just use an ellipsis.
		result = this.dataToString(this.enteredData);
	}
	return this.formatTextSummary(result);
};

/**
 * Takes a textSummary and performs string manipulation to format it according to the Slot type
 * @param {string} textSummary
 * @return {string}
 */
EditableSlot.prototype.formatTextSummary = function(textSummary) {
	DebugOptions.markAbstract();
};

/**
 * Reads the Data from the Slot, assuming that the Slot has no children.
 * @return {Data} - The Data stored in the Slot
 */
EditableSlot.prototype.getDataNotFromChild = function() {
	return this.enteredData;
};

/**
 * Converts the Slot and its children into XML, storing the value in the enteredData as well
 * @inheritDoc
 * @param {DOMParser} xmlDoc
 * @return {Node}
 */
EditableSlot.prototype.createXml = function(xmlDoc) {
	let slot = Slot.prototype.createXml.call(this, xmlDoc);
	let enteredData = XmlWriter.createElement(xmlDoc, "enteredData");
	enteredData.appendChild(this.enteredData.createXml(xmlDoc));
	slot.appendChild(enteredData);
	return slot;
};

/**
 * @inheritDoc
 * @param {Node} slotNode
 * @return {EditableSlot}
 */
EditableSlot.prototype.importXml = function(slotNode) {
	Slot.prototype.importXml.call(this, slotNode);
	const enteredDataNode = XmlWriter.findSubElement(slotNode, "enteredData");
	const dataNode = XmlWriter.findSubElement(enteredDataNode, "data");
	if (dataNode != null) {
		const data = Data.importXml(dataNode);
		if (data != null) {
			this.setData(data, true, false);
		}
	}
	return this;
};

/**
 * @inheritDoc
 * @param {EditableSlot} slot
 */
EditableSlot.prototype.copyFrom = function(slot) {
	Slot.prototype.copyFrom.call(this, slot);
	this.setData(slot.enteredData, false, false);
};