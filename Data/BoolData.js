/**
 * Data that contains a boolean value
 * @param {boolean} value
 * @param {boolean} [isValid=true]
 * @constructor
 */
function BoolData(value, isValid) {
	Data.call(this, Data.types.bool, value, isValid);
}
BoolData.prototype = Object.create(Data.prototype);
BoolData.prototype.constructor = BoolData;

/**
 * Converts true to 1 and false to 0
 * @return {NumData}
 */
BoolData.prototype.asNum = function() {
	if (this.getValue()) {
		return new NumData(1, this.isValid);
	} else {
		return new NumData(0, this.isValid);
	}
};

/**
 * @return {BoolData}
 */
BoolData.prototype.asBool = function() {
	return this;
};

/**
 * @return {StringData}
 */
BoolData.prototype.asString = function() {
	if (this.getValue()) {
		return new StringData("true", true);
	} else {
		return new StringData("false", true);
	}
};

/**
 * @param {Document} dataNode
 * @return {BoolData|null}
 */
BoolData.importXml = function(dataNode) {
	let value = XmlWriter.getTextNode(dataNode, "value");
	if (value == null) return null;
	return new BoolData(value === "true");
};