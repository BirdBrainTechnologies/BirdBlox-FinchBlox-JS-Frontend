/**
 * Effectively the "enum" datatype.  Used for selections from DropSlots.  Has both displayText (what the user sees
 * the option listed as) and a value (used internally) that could be anything (number, string).  Selecting a Variable
 * or List from a DropSlot results in SelectionData with a value that's a reference to a Variable or List.  However,
 * when SelectionData is written to XML, the value is first turned into a string.  The Block using the SelectionData
 * reconstructs the correct value from the string.
 *
 * SelectionData uses "" as the value for "Empty SelectionData" (essentially null) when nothing it selected.
 *
 * @param {string} displayText - The text shown to the user on the DropSlot with this data
 * @param {*} value - Used internally, type depends on context
 * @param {boolean} [isValid=true]
 * @constructor
 */
function SelectionData(displayText, value, isValid) {
	// Only the empty SelectionData can have "" as the value.  So value === "" implies displayText === ""
	DebugOptions.assert(value !== "" || displayText === "");

	DebugOptions.validateNonNull(displayText, value);
	Data.call(this, Data.types.selection, value, isValid);
	this.displayText = displayText;
}
SelectionData.prototype = Object.create(Data.prototype);
SelectionData.prototype.constructor = SelectionData;

/**
 * When converted to a string, the display text is used
 * @return {StringData}
 */
SelectionData.prototype.asString = function() {
	return new StringData(this.displayText, true);
};

/**
 * @return {SelectionData}
 */
SelectionData.prototype.asSelection = function() {
	return this;
};

/**
 * Returns whether this SelectionData is the empty (null) SelectionData.
 * @return {boolean}
 */
SelectionData.prototype.isEmpty = function() {
	return this.value === "";
};

/**
 * Generates SelectionData from XML.  When imported, displayText = "" and value is a string.  All DropSlots/RoundSlots
 * sanitize the data and reconstruct the original displayText and value.  This prevents the user from editing their
 * save file to put arbitrary, invalid displayText in the SelectionData.  It also allows us to change the displayed
 * text of an option without breaking save files
 * @param {Node} dataNode
 * @return {SelectionData|null}
 */
SelectionData.importXml = function(dataNode) {
	const value = XmlWriter.getTextNode(dataNode, "value");
	if (value == null) return null;
	return new SelectionData("", value);
};

/**
 * Returns new empty SelectionData
 * TODO: perhaps remove isValid parameter
 * @param {boolean} [isValid=true]
 * @return {SelectionData}
 */
SelectionData.empty = function(isValid) {
	return new SelectionData("", "", isValid);
};