/**
 * The UndoManager is a static class that keeps a stack (as in the data structure) of recently deleted BlockStacks
 * so they can be undeleted.  It can be assigned an undo button, which it will then enable/disable as necessary.
 * The UndoManager stores the deleted BlockStacks as XML nodes.
 */
function UndoManager() {
	const UM = UndoManager;
	UM.undoButton = null;
	UM.undoStack = [];
	UM.undoLimit = 20;
}

/**
 * Assigns a button to the UndoManager, which automatically enables/disables the button and adds the appropriate
 * callback functions
 * @param {Button} button
 */
UndoManager.setUndoButton = function(button) {
	const UM = UndoManager;
	UM.undoButton = button;
	UM.undoButton.setCallbackFunction(UndoManager.undoDelete, true);
	UM.updateButtonEnabled();
};

/**
 * Deletes a Comment and adds it to the undo stack.  If the stack is larger
 * than the limit, the last item is removed.
 * @param stack
 */
UndoManager.deleteComment = function(comment) {
	const UM = UndoManager;
  const doc = XmlWriter.newDoc("undoData");
  var commentData = comment.createXml(doc);
  comment.delete()
  UM.undoStack.push(commentData);
	while(UM.undoStack.length > UM.undoLimit) {
		UM.undoStack.shift();
	}
	UM.updateButtonEnabled();
}

/**
 * Deletes a BlockStack and adds it to the undo stack.  If the stack is larger
 * than the limit, the last item is removed.
 * @param stack
 */
UndoManager.deleteStack = function(stack) {
	const UM = UndoManager;
  const doc = XmlWriter.newDoc("undoData");
  var stackData;
  if(FinchBlox && (LevelManager.currentLevel != 3) && stack.firstBlock.isStartBlock){
		TabManager.activeTab.addStartBlock();
    if (stack.firstBlock.nextBlock != null) {
      stackData = stack.createXml(doc, true);
    } else {
      stack.remove();
      return;
    }
	} else {
    stackData = stack.createXml(doc);
  }
  stack.deleteComments();
	stack.remove();
	UM.undoStack.push(stackData);
	while(UM.undoStack.length > UM.undoLimit) {
		UM.undoStack.shift();
	}
	UM.updateButtonEnabled();
};

/**
 * Deletes the entire contents of the active tab
 * Used in FinchBlox for the trash button.
 */
UndoManager.deleteTab = function() {
  const UM = UndoManager;
  const tab = TabManager.activeTab;
  const doc = XmlWriter.newDoc("undoData");
  var tabData;
  if(FinchBlox && (LevelManager.currentLevel != 3)){
    tabData = tab.createXml(doc, true);
    tab.clear();
    TabManager.activeTab.addStartBlock();
	} else {
    tabData = tab.createXml(doc);
    tab.clear();
  }
	UM.undoStack.push(tabData);
	while(UM.undoStack.length > UM.undoLimit) {
		UM.undoStack.shift();
	}
	UM.updateButtonEnabled();
}

/**
 * Pops an item from the stack and rebuilds it, placing it in the corner of the canvas
 */
UndoManager.undoDelete = function(){
	const UM = UndoManager;
	if(UM.undoStack.length === 0) return;
	let success = false;
	while (!success) {
		const stackData = UM.undoStack.pop();
		success = success || TabManager.undoDelete(stackData);
	}
	UM.updateButtonEnabled();
	SaveManager.markEdited();
};

/**
 * Updates the enabled/disabled state of the undo button based in if the stack is empty
 */
UndoManager.updateButtonEnabled = function(){
	const UM = UndoManager;
	if(UM.undoButton == null) return;
	if(UM.undoStack.length > 0) {
		UM.undoButton.enable();
	} else {
		UM.undoButton.disable();
	}
};

/**
 * Deletes the undo stack (for when a program is closed/opened)
 */
UndoManager.clearUndos = function() {
	const UM = UndoManager;
	UM.undoStack = [];
	UM.updateButtonEnabled();
};
