function UndoManager() {
	const UM = UndoManager;
	UM.undoButton = null;
	UM.undoStack = [];
	UM.undoLimit = 20;
}

UndoManager.setUndoButton = function(button) {
	const UM = UndoManager;
	UM.undoButton = button;
	UM.undoButton.setCallbackFunction(UndoManager.undoDelete, true);
	UM.updateButtonEnabled();
};

UndoManager.deleteStack = function(stack) {
	const UM = UndoManager;
	const doc = XmlWriter.newDoc("undoData");
	const stackData = stack.createXml(doc);
	stack.remove();
	UM.undoStack.push(stackData);
	while(UM.undoStack.length > UM.undoLimit) {
		UM.undoStack.shift();
	}
	UM.updateButtonEnabled();
};

UndoManager.undoDelete = function(){
	const UM = UndoManager;
	if(UM.undoStack.length === 0) return;
	let success = false;
	while (!success) {
		const stackData = UM.undoStack.pop();
		success = success || TabManager.undoDelete(stackData);
	}
	UM.updateButtonEnabled();
};

UndoManager.updateButtonEnabled = function(){
	const UM = UndoManager;
	if(UM.undoButton == null) return;
	if(UM.undoStack.length > 0) {
		UM.undoButton.enable();
	} else {
		UM.undoButton.disable();
	}
};

UndoManager.clearUndos = function() {
	const UM = UndoManager;
	UM.undoStack = [];
	UM.updateButtonEnabled();
};