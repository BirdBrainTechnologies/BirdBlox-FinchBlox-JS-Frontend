/**
 * Represents a user-created Variable that is part of the current project.  A variable can hold NumData, StringData,
 * and BoolData, but not ListData or SelectionData.
 * @param {string} name - The name of the variable
 * @param {Data} [data] - The initial data in the variable
 * @constructor
 */
function Variable(name, data) {
  this.name = name;
  this.data = data;
  if (this.data == null) {
    this.data = new NumData(0);
  }
  CodeManager.addVariable(this);
}

/**
 * Gets the name of the Variable
 * @return {string}
 */
Variable.prototype.getName = function() {
  return this.name;
};

/**
 * Returns SelectionData for the Variable to be selected from a DropSlot
 * @return {SelectionData}
 */
Variable.prototype.getSelectionData = function() {
  return new SelectionData(this.name, this);
};

/**
 * Gets the data stored in the Variable
 * @return {Data}
 */
Variable.prototype.getData = function() {
  return this.data;
};

/**
 * Sets the data in the Variable
 * @param data
 */
Variable.prototype.setData = function(data) {
  this.data = data;
};

/**
 * Removes the Variable from the CodeManager
 */
Variable.prototype.remove = function() {
  this.data = null;
  CodeManager.removeVariable(this);
};

/**
 * Exports information about the Variable to XML
 * @param {Document} xmlDoc - The document to write to
 * @return {Node} - The node for the Variable
 */
Variable.prototype.createXml = function(xmlDoc) {
  const variable = XmlWriter.createElement(xmlDoc, "variable");
  XmlWriter.setAttribute(variable, "name", this.name);
  variable.appendChild(this.data.createXml(xmlDoc));
  return variable;
};

/**
 * Creates a Variable from XML
 * @param {Node} variableNode
 * @return {Variable|null}
 */
Variable.importXml = function(variableNode) {
  const name = XmlWriter.getAttribute(variableNode, "name");
  if (name != null) {
    const dataNode = XmlWriter.findSubElement(variableNode, "data");
    let data = new NumData(0);
    if (dataNode != null) {
      const newData = Data.importXml(dataNode);
      if (newData != null) {
        data = newData;
      }
    }
    return new Variable(name, data);
  }
  return null
};

/**
 * Prompts the user to rename the variable
 */
Variable.prototype.rename = function() {
  const callbackFn = function(cancelled, response) {
    if (!cancelled && CodeManager.checkVarName(response)) {
      callbackFn.variable.name = response;
      CodeManager.renameVariable(callbackFn.variable);
    }
  };
  callbackFn.variable = this;
  DialogManager.showPromptDialog(Language.getStr("Rename"), Language.getStr("Enter_new_name"), this.name, true, callbackFn);
};

/**
 * Prompts the user to delete the Variable
 */
Variable.prototype.delete = function() {
  if (CodeManager.checkVariableUsed(this)) {
    const callbackFn = function(response) {
      if (response === "2") {
        callbackFn.variable.remove();
        CodeManager.deleteVariable(callbackFn.variable);
      }
    };
    callbackFn.variable = this;
    let question = Language.getStr("Delete_question");
    DialogManager.showChoiceDialog(Language.getStr("Delete"), question, Language.getStr("Dont_delete"), Language.getStr("Delete"), true, callbackFn);
  } else {
    this.remove();
    CodeManager.deleteVariable(this);
  }
};
