/**
 * ListDropSlot are used to select a List.  They also provide an option to create a new List.
 * @param {Block} parent
 * @param {string} key
 * @param {number} [snapType=none] - [none, list] Some slots allow ListData bocks like Split to be attached
 * @constructor
 */
function ListDropSlot(parent, key, snapType) {
  if (snapType == null) {
    snapType = Slot.snapTypes.none
  }
  // When created, a list slot shows the most recently created list as its value
  const lists = CodeManager.listList;
  let data = SelectionData.empty();
  if (lists.length > 0) {
    const lastList = lists[lists.length - 1];
    data = lastList.getSelectionData();
  }
  DropSlot.call(this, parent, key, null, snapType, data, true);
}
ListDropSlot.prototype = Object.create(DropSlot.prototype);
ListDropSlot.prototype.constructor = ListDropSlot;

/**
 * @inheritDoc
 * @param {InputWidget.SelectPad} selectPad
 */
ListDropSlot.prototype.populatePad = function(selectPad) {
  // Add each list as an option
  CodeManager.listList.forEach(function(list) {
    selectPad.addOption(list.getSelectionData());
  });
  // Add the Create list option
  selectPad.addAction(Language.getStr("Create_List"), function(callback) {
    // When selected, tell the CodeManager to open a dialog to create a list
    CodeManager.newList(function(list) {
      // If successful, save the newly created variable as the value
      callback(list.getSelectionData(), true);
    }, function() {
      // Otherwise, leave the pad open
      callback(null, false);
      // TODO: could just remove the above line entirely
    })
  });
};

/**
 * @inheritDoc
 * @param {boolean|string|number|List} value
 * @return {SelectionData|null}
 */
ListDropSlot.prototype.selectionDataFromValue = function(value) {
  DebugOptions.validateNonNull(value);
  // If the value is a List, use its SelectionData
  if (value.constructor === List) return value.getSelectionData();
  // Otherwise, assume the value is a string and look it up in CodeManager
  // TODO: perhaps verify the value is a string
  const list = CodeManager.findList(value);
  if (list == null) return null;
  // If we find something, use that
  return list.getSelectionData();
};

/**
 * @inheritDoc
 * @param {List} list
 */
ListDropSlot.prototype.renameList = function(list) {
  if (this.enteredData != null && this.enteredData.getValue() === list) {
    this.setData(list.getSelectionData(), false, true);
  }
  this.passRecursively("renameList", list);
};

/**
 * @inheritDoc
 * @param {List} list
 */
ListDropSlot.prototype.deleteList = function(list) {
  if (!this.enteredData.isEmpty() && this.enteredData.getValue() === list) {
    this.setData(SelectionData.empty(), false, true);
  }
  this.passRecursively("deleteList", list);
};

/**
 * @inheritDoc
 * @param {List} list
 */
ListDropSlot.prototype.checkListUsed = function(list) {
  if (this.hasChild) {
    return DropSlot.prototype.checkListUsed.call(this, list);
  } else if (this.enteredData != null && this.enteredData.getValue() === list) {
    return true;
  }
  return false;
};
