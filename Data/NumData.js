/**
 * Data that contains a number value
 * @param value
 * @param isValid
 * @constructor
 */
function NumData(value, isValid) {
	if (isNaN(value) || !isFinite(value)) {
		value = 0;
		isValid = false;
	}
	Data.call(this, Data.types.num, value, isValid);
}
NumData.prototype = Object.create(Data.prototype);
NumData.prototype.constructor = NumData;

/**
 * @return {NumData}
 */
NumData.prototype.asNum = function() {
	return this;
};

/**
 * 0 becomes false and 1 becomes true.  Anything else is invalid
 * @return {BoolData}
 */
NumData.prototype.asBool = function() {
	if (this.getValue() === 1) {
		return new BoolData(true, this.isValid);
	} else if (this.getValue() === 0) {
		return new BoolData(false, this.isValid);
	} else {
		return new BoolData(false, false);
	}
};

/**
 * Rounds number and displays it
 * @return {StringData}
 */
NumData.prototype.asString = function() {
	if (this.isValid) {
		let num = this.getValue();
		num = +num.toFixed(10);
		if (num < 0 && Language.isRTL) {
			return new StringData(Language.forceLTR + num, true);
		}
		return new StringData(num + "", true);
	} else {
		return new StringData(Language.getStr("not_a_valid_number"));
	}
};

/**
 * Converts to a string but avoids scientific notation
 * @return {StringData}
 */
NumData.prototype.asPositiveString = function() {
	let num = Math.abs(this.getValue());
	num = +num.toFixed(10);
	return new StringData(num + "", true);
};

/**
 * Gets the NumData's value within a range.
 * @param {number} [min] - The lower bound
 * @param {number} [max] - The upper bound
 * @param {boolean} positive - Whether the number should be non-negative
 * @param {boolean} integer - Whether the number should be rounded to the nearest integer
 * @return {number}
 */
NumData.prototype.getValueInR = function(min, max, positive, integer) {
	let val = this.getValue();
	if (positive === true && val < 0) {
		val = 0;
	}
	if (integer === true) {
		val = Math.round(val);
	}
	if (min != null && val < min) {
		val = min;
	}
	if (max != null && val > max) {
		val = max;
	}
	return val;
};

/**
 * Returns the value of the NumData, possibly non-negative or rounded to the nearest integer
 * @param {boolean} [positive=false] - Whether the number should be non-negative
 * @param {boolean} [integer=false] - Whether the number should be rounded to the nearest integer
 * @return {number}
 */
NumData.prototype.getValueWithC = function(positive, integer) {
	let val = this.getValue();
	if (positive === true && val < 0) {
		val = 0;
	}
	if (integer === true) {
		val = Math.round(val);
	}
	return val;
};

/**
 * Imports the NumData from XML
 * @param {Node} dataNode
 * @return {NumData|null}
 */
NumData.importXml = function(dataNode) {
	const value = XmlWriter.getTextNode(dataNode, "value", null, true);
	if (value == null) return null;
	// We use StringData to help with the conversion
	const stringData = new StringData(value);
	const numData = stringData.asNum();
	if (numData.isValid) {
		return numData;
	} else {
		// It's not a number.  Treat it as corrupt.
		return null;
	}
};
