/**
 * VarDropSlot are used to select a variable from a list.  They also provide an option to create a new variable.
 * @param {string} key
 * @param {Block} parent
 * @constructor
 */
function VarDropSlot(parent, key) {
  const variables = CodeManager.variableList;
  // When created, a variable slot shows the most recently created variable as its value
  let data = SelectionData.empty();
  if (variables.length > 0) {
    const lastVar = variables[variables.length - 1];
    data = lastVar.getSelectionData();
  }
  // Variable Blocks are nullable, even though they have a default value
  DropSlot.call(this, parent, key, null, null, data, true);
}
VarDropSlot.prototype = Object.create(DropSlot.prototype);
VarDropSlot.prototype.constructor = VarDropSlot;

/**
 * @inheritDoc
 * @param {InputWidget.SelectPad} selectPad
 */
VarDropSlot.prototype.populatePad = function(selectPad) {
  // Add each variable as an option
  CodeManager.variableList.forEach(function(variable) {
    selectPad.addOption(variable.getSelectionData());
  });
  // Add the Create variable option
  selectPad.addAction(Language.getStr("Create_Variable"), function(callback) {
    // When selected, tell the CodeManager to open a dialog to create a variable
    CodeManager.newVariable(function(variable) {
      // If successful, save the newly created variable as the value
      callback(variable.getSelectionData(), true);
    }, function() {
      // Otherwise, leave the pad open
      callback(null, false);
      // TODO: could just remove the above line entirely
    })
  });
};

/**
 * @inheritDoc
 * @param {boolean|string|number|Variable} value
 * @return {SelectionData|null}
 */
VarDropSlot.prototype.selectionDataFromValue = function(value) {
  DebugOptions.validateNonNull(value);
  // If the value is a Variable, use its SelectionData
  if (value.constructor === Variable) return value.getSelectionData();
  // Otherwise, assume the value is a string and look it up in CodeManager
  // TODO: perhaps verify the value is a string
  const variable = CodeManager.findVar(value);
  if (variable == null) return null;
  // If we find something, use that
  return variable.getSelectionData();
};

/**
 * @inheritDoc
 * @param {Variable} variable
 */
VarDropSlot.prototype.renameVariable = function(variable) {
  // If the variable that was renamed is the same as this Slot's value...
  if (this.enteredData != null && this.enteredData.getValue() === variable) {
    // Change the name appearing on this Slot
    this.setData(variable.getSelectionData(), false, true);
  }
};

/**
 * @inheritDoc
 * @param {Variable} variable
 */
VarDropSlot.prototype.deleteVariable = function(variable) {
  // If the variable that was renamed is the same as this Slot's value...
  if (this.enteredData != null && this.enteredData.getValue() === variable) {
    // Change the Data to empty
    this.setData(SelectionData.empty(), false, true);
  }
};

/**
 * @inheritDoc
 * @param {Variable} variable
 * @return {boolean}
 */
VarDropSlot.prototype.checkVariableUsed = function(variable) {
  // Returns that this variable is in use if it matches this Slot's value
  return this.enteredData != null && this.enteredData.getValue() === variable;
};
