/**
 * ListData holds an array of Data objects as its value.  So to access a string in index 2 of a ListData, you'd do:
 * myListData.getValue()[2].asString().getValue()
 * @param {Array} [value=[]]
 * @param {boolean} [isValid=true]
 * @constructor
 */
function ListData(value, isValid) {
	if (value == null) {
		value = [];
	}
	Data.call(this, Data.types.list, value, isValid);
}
ListData.prototype = Object.create(Data.prototype);
ListData.prototype.constructor = ListData;

/**
 * Creates a copy of the ListData
 * @return {ListData}
 */
ListData.prototype.duplicate = function() {
	const arrayCopy = [];
	for (let i = 0; i < this.value.length; i++) {
		arrayCopy.push(this.value[i]);
	}
	return new ListData(arrayCopy, this.isValid);
};

/**
 * Is a num if it only has one item and that item is a num
 * @return {NumData}
 */
ListData.prototype.asNum = function() {
	if (this.value.length === 1) {
		return this.value[0].asNum();
	} else {
		return new NumData(0, false);
	}
};

/**
 * Prints all elements, comma separated, to a string
 * @return {StringData}
 */
ListData.prototype.asString = function() {
	let resultStr = "";
	for (let i = 0; i < this.value.length; i++) {
		resultStr += this.value[i].asString().getValue();
		if (i < this.value.length - 1) {
			resultStr += ", ";
		}
	}
	return new StringData(resultStr, true);
};

/**
 * Is a Bool if it only has one value and that value is a bool
 * @return {BoolData}
 */
ListData.prototype.asBool = function() {
	if (this.value.length === 1) {
		return this.value[0].asBool();
	} else {
		return new BoolData(false, false);
	}
};

/**
 * @return {ListData}
 */
ListData.prototype.asList = function() {
	return this;
};

/**
 * Converts NumData/SelectionData referring to an index into a number that refers to an index in the ListData, or null
 * @param {Data|null} indexData
 * @return {number|null}
 */
ListData.prototype.getIndex = function(indexData) {
	const array = this.getValue();
	if (array.length === 0) {
		return null; // There are no valid indices to return
	}
	if (indexData == null) {
		return null; // The index data is already invalid
	}
	const indexV = indexData.getValue();
	const min = 1;
	const max = array.length;
	if (indexData.type === Data.types.selection) {
		if (indexV === "last") {
			// Return the index of the last item
			return array.length - 1;
		} else if (indexV === "random") {
			// Return an index of a random item
			return Math.floor(Math.random() * array.length);
		} else {
			// The data is not valid.  Return null.
			return null;
		}
	} else {
		// If it isn't selectionData, the index should be NumData
		indexData = indexData.asNum();
		if (!indexData.isValid) {
			// The data is not valid.  Return null.
			return null;
		}
		// Clamps the index to the bounds of the array
		return indexData.getValueInR(min, max, true, true) - 1;
	}
};

/**
 * @inheritDoc
 * @param {Document} xmlDoc
 * @return {Node}
 */
ListData.prototype.createXml = function(xmlDoc) {
	const data = XmlWriter.createElement(xmlDoc, "data");
	XmlWriter.setAttribute(data, "type", this.getDataTypeName());
	XmlWriter.setAttribute(data, "isValid", this.isValid);

	// The value is a list of Data objects
	const value = xmlDoc.createElement("value");
	for (let i = 0; i < this.value.length; i++) {
		value.appendChild(this.value[i].createXml(xmlDoc));
	}
	data.appendChild(value);
	return data;
};

/**
 * Creates a ListData from XML
 * @param {Node} dataNode
 * @return {ListData}
 */
ListData.importXml = function(dataNode) {
	const valueNode = XmlWriter.findSubElement(dataNode, "value");
	const dataNodes = XmlWriter.findSubElements(valueNode, "data");
	const valueArray = [];
	for (let i = 0; i < dataNodes.length; i++) {
		// Add every valid data node
		const dataEntry = Data.importXml(dataNodes[i]);
		if (dataEntry != null) {
			valueArray.push(dataEntry);
		}
	}
	return new ListData(valueArray);
};