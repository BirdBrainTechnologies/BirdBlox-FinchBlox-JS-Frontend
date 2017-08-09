/**
 * NumSlot is a subclass of RoundSlot.
 * It creates a RoundSlot optimized for use with numbers.
 * It automatically converts any results into NumData and has a snapType of numStrBool.
 * @constructor
 * @param {Block} parent
 * @param {string} key
 * @param {number} value
 * @param {boolean} [positive] - Determines if the NumPad will have the plus/minus Button disabled.
 * @param {boolean} [integer] - Determines if the NumPad will have the decimal point Button disabled.
 */
function NumSlot(parent, key, value, positive, integer) {
	// Optional parameters are false by default.
	if (positive == null) {
		positive = false;
	}
	if (integer == null) {
		integer = false;
	}
	const inputType = EditableSlot.inputTypes.num;
	const snapType = Slot.snapTypes.numStrBool;
	const outputType = Slot.outputTypes.num;

	// Make RoundSlot.
	RoundSlot.call(this, parent, key, inputType, snapType, outputType, new NumData(value), positive, integer);

	// Limits can be set later
	this.minVal = null;
	this.maxVal = null;
}
NumSlot.prototype = Object.create(RoundSlot.prototype);
NumSlot.prototype.constructor = NumSlot;

/**
 * Configures the Slot to bound its input to the provided min and max. Used by sanitizeData, and shown on
 * the InputPad with the provided displayUnits in the form "DisplayUnits (min - max)"
 * @param {number|null} [min] - The minimum value or null if no bound
 * @param {number|null} [max] - The maximum value or null if no bound
 * @param {string|null} [displayUnits] - The units/label to show before the min/max or null if none
 */
NumSlot.prototype.addLimits = function(min, max, displayUnits) {
	this.minVal = min;
	this.maxVal = max;
	if(min == null || max == null) return;
	if (displayUnits == null) {
		this.labelText = "(" + min + " - " + max + ")";
	} else {
		this.labelText = displayUnits + " (" + min + " - " + max + ")";
	}
};

/**
 * @inheritDoc
 * @param {Data|null} data
 * @return {Data|null}
 */
NumSlot.prototype.sanitizeData = function(data) {
	// Forces Data to NumData
	data = RoundSlot.prototype.sanitizeData.call(this, data);
	if (data == null) return null;
	const value = data.asNum().getValueInR(this.minVal, this.maxVal, this.positive, this.integer);
	return new NumData(value, data.isValid);
};