/**
 * Data is used hold type information about values passed between executing Blocks.  It creates a sort of type system
 * for the values obtained during Block execution.  For example, when an addition Block is run, it accepts two
 * receives two NumData instances and returns a new NumData instance.  Since Blocks of the wrong type can often be
 * snapped together (for example, the joinStrings Block can be put into a multiplication Block), all types of Data
 * can be converted into any other type of Data (using asNum(), asString(), etc.).  However, whether the data is "valid"
 * is also tracked, with nonsensical conversions always flagging the data as invalid.  Blocks can choose how to respond
 * when the data they receive is invalid.  Data can also be saved to XML, which is used to save the contents of
 * EditableSlots and values of variables to file.
 *
 * The types of data are invisible to the user, and those Data is always automatically converted to the most reasonable
 * type automatically without the user's knowledge.
 *
 * All Data is treated as immutable
 *
 * Note that the Data class is abstract
 *
 * @param {number} type - [num, bool, string, list, selection]
 * @param {*} value - The value being stored in the Data, should correspond to the type of Data
 * @param {boolean} [isValid=true] - Whether the Data has not gone through any illegal conversions (equivalent of NaN)
 * @constructor
 */
function Data(type, value, isValid) {
  this.type = type;
  this.value = value;
  this.isValid = isValid;
  if (isValid == null) {
    this.isValid = true;
  }
}

Data.setConstants = function() {
  Data.types = {};
  Data.types.num = 0;
  Data.types.bool = 1;
  Data.types.string = 2;
  Data.types.list = 3;
  Data.types.selection = 4; //A selection from a block's drop down.  Could be a sound, variable, string, etc.
};

/* These functions manage the conversion of one type of data into another.  By default, they produce invalid Data
 * initialized to default values.  Subclasses provide better conversion functions where applicable
 */

Data.prototype.asNum = function() {
  return new NumData(0, false);
};
Data.prototype.asBool = function() {
  return new BoolData(false, false);
};
Data.prototype.asString = function() {
  return new StringData("", false);
};
Data.prototype.asList = function() {
  return new ListData(null, false);
};
Data.prototype.asSelection = function() {
  return SelectionData.empty(false);
};

/**
 * Extracts the value from the data
 * @return {*}
 */
Data.prototype.getValue = function() {
  return this.value;
};

/**
 * Determines whether the Data is SelectionData
 * @return {boolean}
 */
Data.prototype.isSelection = function() {
  return this.type === Data.types.selection;
};

/**
 * Determines whether the Data will produce a valid number when asNum() is called.  For example,
 * StringData("3").asNum() is valid with value 3.
 * @return {boolean}
 */
Data.prototype.isNumber = function() {
  return false;
};

/**
 * Determines if two Data should be considered equal by the equality Block.
 * @param {Data} data1
 * @param {Data} data2
 * @return {boolean}
 */
Data.checkEquality = function(data1, data2) {
  const val1 = data1.getValue();
  const val2 = data2.getValue();
  const string1 = data1.asString().getValue();
  const string2 = data2.asString().getValue();
  const numD1 = data1.asNum();
  const numD2 = data2.asNum();
  const types = Data.types;
  const isValid = data1.isValid && data2.isValid;
  if (data1.type === data2.type) { //If the types match, just compare directly.
    return isValid && val1 === val2; //Invalid data is never equal.
  } else if (data1.type === types.string || data2.type === types.string) { //If one is a string...
    if (string1 === string2) { //If both strings match, result is true.
      return true;
    } else if (data1.type === types.num || data2.type === types.num) { //Still the numbers could match like "3.0"=3.
      if (numD1.isValid && numD2.isValid) { //If both are valid numbers...
        return numD1.getValue() === numD2.getValue(); //Compare numerical values.
      } else {
        return false; //A string and unequal/invalid number are not equal.
      }
    } else {
      return false; //Two unequal, nonnumerical strings are unequal.
    }
  } else {
    return false; //If the types don't match and neither is a string, they are unequal.
  }
};

/**
 * Converts the Data to XML
 * @param {Document} xmlDoc - The document to write to
 * @return {Node}
 */
Data.prototype.createXml = function(xmlDoc) {
  // We store the type of Data, whether it is valid, and what its value is

  const data = XmlWriter.createElement(xmlDoc, "data");
  XmlWriter.setAttribute(data, "type", this.getDataTypeName());
  XmlWriter.setAttribute(data, "isValid", this.isValid);

  // The value is converted to a string by appending "".  For Variables and Lists, the name is used.
  const value = XmlWriter.createElement(xmlDoc, "value");
  let valueString = this.getValue() + "";
  if (this.getValue().constructor.name === "Variable") {
    valueString = this.getValue().name;
  } else if (this.getValue().constructor.name === "List") {
    valueString = this.getValue().name;
  }
  const valueText = XmlWriter.createTextNode(xmlDoc, valueString);
  value.appendChild(valueText);
  data.appendChild(value);
  return data;
};

/**
 * Reads data from XML.  Returns null if Data is corrupt
 * @param {Node} dataNode
 * @return {Data|null}
 */
Data.importXml = function(dataNode) {
  const typeName = XmlWriter.getAttribute(dataNode, "type");
  const type = Data.getDataTypeFromName(typeName);
  if (type == null) {
    return null;
  }
  return type.importXml(dataNode);
};

/**
 * Gets the string representation of this Data's type
 * @return {string}
 */
Data.prototype.getDataTypeName = function() {
  if (this.type === Data.types.num) {
    return "num";
  } else if (this.type === Data.types.bool) {
    return "bool";
  } else if (this.type === Data.types.string) {
    return "string";
  } else if (this.type === Data.types.list) {
    return "list";
  } else if (this.type === Data.types.selection) {
    return "selection";
  } else {
    DebugOptions.throw("Data is not a valid type");
  }
};

/**
 * Gets the class of Data from a string representing its type or null of the type is invalid
 * @param {string} typeName
 * @return {*|null} - A subclass of Data corresponding to the type, or null if no such subclass exists
 */
Data.getDataTypeFromName = function(typeName) {
  if (typeName === "num") {
    return NumData;
  } else if (typeName === "bool") {
    return BoolData;
  } else if (typeName === "string") {
    return StringData;
  } else if (typeName === "list") {
    return ListData;
  } else if (typeName === "selection") {
    return SelectionData;
  } else {
    return null;
  }
};
