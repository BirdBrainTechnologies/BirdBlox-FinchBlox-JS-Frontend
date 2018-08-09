/**
 * IndexSlots are used to select indexes in Lists. They have special options for "last" "random" and "all"
 * @param {Block} parent
 * @param {string} key
 * @param {boolean} includeAll - indicates whether "all" should be an option
 * @constructor
 */
function IndexSlot(parent, key, includeAll) {
	// inputType doesn't matter as much since we have our own sanitize function
	const inputType = EditableSlot.inputTypes.any;
	const snapType = Slot.snapTypes.numStrBool;
	// Both SelectionData and NumData must be allowed
	const outputType = Slot.outputTypes.any;
	// Default value is 1
	RoundSlot.call(this, parent, key, inputType, snapType, outputType, new NumData(1), true, true);

	// Add selectable options
	this.addOption(new SelectionData(Language.getStr("last"), "last"));
	this.addOption(new SelectionData(Language.getStr("random"), "random"));
	if (includeAll) {
		this.addOption(new SelectionData(Language.getStr("all"), "all"));
	}
}
IndexSlot.prototype = Object.create(RoundSlot.prototype);
IndexSlot.prototype.constructor = IndexSlot;

/**
 * @inheritDoc
 * @param {Data|null} data
 * @return {Data|null}
 */
IndexSlot.prototype.sanitizeData = function(data) {
	// Checks to ensure SelectionData is valid
	data = RoundSlot.prototype.sanitizeData.call(this, data);
	if (data == null) return null;
	if (!data.isSelection()) {
		// If it isn't selectionData, make sure it is a positive integer, fixing it as necessary
		const numData = data.asNum();
		if (!numData.isValid) return null;
		let value = numData.getValueWithC(true, true);
		value = Math.max(1, value);
		return new NumData(value);
	}
	return data;
};
