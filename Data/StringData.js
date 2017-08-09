/**
 * Data that contains a string.
 * @param {string} value
 * @param {boolean} [isValid=true]
 * @constructor
 */
function StringData(value, isValid) {
	Data.call(this, Data.types.string, value, isValid);
}
StringData.prototype = Object.create(Data.prototype);
StringData.prototype.constructor = StringData;

/**
 * If the value could represent a number, it is converted to valid NumData.  Otherwise, invalid NumData(0) is returned
 * @return {NumData}
 */
StringData.prototype.asNum = function() {
	if (this.isNumber()) {
		return new NumData(parseFloat(this.getValue()), this.isValid);
	} else {
		return new NumData(0, false);
	}
};

/**
 * The string is a valid boolean if it is "true" or "false" (any casing)
 * @return {BoolData}
 */
StringData.prototype.asBool = function() {
	if (this.getValue().toUpperCase() === "TRUE") {
		return new BoolData(true, this.isValid);
	} else if (this.getValue().toUpperCase() === "FALSE") {
		return new BoolData(false, this.isValid);
	}
	return new BoolData(false, false);
};

/**
 * @return {StringData}
 */
StringData.prototype.asString = function() {
	return this;
};

/**
 * Checks to see if the number can be converted to a valid number
 * @return {boolean}
 */
StringData.prototype.isNumber = function() {
	//from https://en.wikipedia.org/wiki/Regular_expression
	const numberRE = /^[+-]?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/;
	return numberRE.test(this.getValue());
};

/**
 * Imports StringData from XML
 * @param {Node} dataNode
 * @return {StringData|null}
 */
StringData.importXml = function(dataNode) {
	const value = XmlWriter.getTextNode(dataNode, "value");
	if (value == null) return null;
	return new StringData(value);
};