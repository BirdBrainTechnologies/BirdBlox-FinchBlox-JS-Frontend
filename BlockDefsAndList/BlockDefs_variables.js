/* Implementation of blocks that deal with variables and lists.  Most of these blocks have a DropSlot to select
 * the list to read/modify.  Some of the List Blocks allow this Slot to be given either an existing List
 * or a ListData, such as returned from the Split block.
 */


/**
 * Variable Blocks are special since their constructor takes an extra Variable parameter.
 * @param {number} x
 * @param {number} y
 * @param {Variable} variable - The variable that this Block will return the value of
 * @constructor
 */
function B_Variable(x, y, variable) {
	ReporterBlock.call(this, x, y, "variables", Block.returnTypes.string);
	this.variable = variable;
	this.addPart(new LabelText(this, this.variable.getName()));
}
B_Variable.prototype = Object.create(ReporterBlock.prototype);
B_Variable.prototype.constructor = B_Variable;
/* Return the value of the variable */
B_Variable.prototype.startAction = function() {
	return new ExecutionStatusResult(this.variable.getData());
};
/**
 * @inheritDoc
 * @param {Document} xmlDoc - The document to write to
 * @return {Node} - The node for this Block
 */
B_Variable.prototype.createXml = function(xmlDoc) {
	const block = XmlWriter.createElement(xmlDoc, "block");
	XmlWriter.setAttribute(block, "type", this.blockTypeName);
	XmlWriter.setAttribute(block, "variable", this.variable.getName());
	return block;
};
/**
 * Called from the Block's context menu if it is in a DisplayStack
 */
B_Variable.prototype.renameVar = function() {
	// Shows dialog for new name
	this.variable.rename();
};
/**
 * Called from the Block's context menu if it is in a DisplayStack
 */
B_Variable.prototype.deleteVar = function() {
	// Deletes variable if unused, or shows confirmation dialog
	this.variable.delete();
};
/**
 * @inheritDoc
 * @param {Variable} variable
 */
B_Variable.prototype.renameVariable = function(variable) {
	if (variable === this.variable) {
		// Update the block by changing its label
		this.parts[0].remove();
		this.parts[0] = new LabelText(this, this.variable.getName());
		if (this.stack != null) {
			// The stack may now be a different size
			this.stack.updateDim();
		}
	}
};
/**
 * @inheritDoc
 * @param {Variable} variable
 */
B_Variable.prototype.deleteVariable = function(variable) {
	if (variable === this.variable) {
		// Delete occurrences of this Block
		this.unsnap().remove();
	}
};
/**
 * @inheritDoc
 * @param {Variable} variable
 * @return {boolean}
 */
B_Variable.prototype.checkVariableUsed = function(variable) {
	return variable === this.variable
};
/**
 * Creates a variable Block from XML
 * @param {Node} blockNode - The node to import from
 * @return {Block|null} - The imported Block
 */
B_Variable.importXml = function(blockNode) {
	const variableName = XmlWriter.getAttribute(blockNode, "variable");
	const variable = CodeManager.findVar(variableName);
	if (variable != null) {
		return new B_Variable(0, 0, variable);
	}
	return null;
};



function B_SetTo(x, y) {
	CommandBlock.call(this, x, y, "variables");
	this.addPart(new VarDropSlot(this, "VDS_1"));
	this.addPart(new NumOrStringSlot(this, "RndS_val", new NumData(0)));
	this.parseTranslation(Language.getStr("block_set_variable"));
}
B_SetTo.prototype = Object.create(CommandBlock.prototype);
B_SetTo.prototype.constructor = B_SetTo;
/* Sets the variable to the provided value */
B_SetTo.prototype.startAction = function() {
	// Get the selection data that refers to a variable
	const variableD = this.slots[0].getData();
	// Get the data to assign to the variable
	const data = this.slots[1].getData();
	const type = data.type;
	const types = Data.types;
	if (type === types.bool || type === types.num || type === types.string) {
		// If the selection data is not empty
		if (variableD.type === Data.types.selection && !variableD.isEmpty()) {
			// Extract the indicated variable
			const variable = variableD.getValue();
			// And set its value
			variable.setData(data);
		}
	}
	return new ExecutionStatusDone();
};



function B_ChangeBy(x, y) {
	CommandBlock.call(this, x, y, "variables");
	this.addPart(new VarDropSlot(this, "VDS_1"));
	this.addPart(new NumSlot(this, "NumS_val", 1));
	this.parseTranslation(Language.getStr("block_change_variable"));
}
B_ChangeBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeBy.prototype.constructor = B_ChangeBy;
/* Adds the value to the indicated variable */
B_ChangeBy.prototype.startAction = function() {
	const variableD = this.slots[0].getData();
	const incrementD = this.slots[1].getData();
	if (variableD.type === Data.types.selection && !variableD.isEmpty()) {
		const variable = variableD.getValue();
		const currentD = variable.getData().asNum();
		const newV = incrementD.getValue() + currentD.getValue();
		const isValid = currentD.isValid && incrementD.isValid;
		const newD = new NumData(newV, isValid);
		variable.setData(newD);
	}
	return new ExecutionStatusDone();
};


/**
 * Variable Blocks are special since their constructor takes an extra List parameter.
 * @param {number} x
 * @param {number} y
 * @param {List} list - The list that this Block should return the value of
 * @constructor
 */
function B_List(x, y, list) {
	ReporterBlock.call(this, x, y, "lists", Block.returnTypes.string);
	this.list = list;
	this.addPart(new LabelText(this, this.list.getName()));
}
B_List.prototype = Object.create(ReporterBlock.prototype);
B_List.prototype.constructor = B_List;
/* Returns a StringData representing the List's contents, comma separated */
B_List.prototype.startAction = function() {
	return new ExecutionStatusResult(this.list.getData().asString());
};
/**
 * Writes the Block to Xml
 * @param {Document} xmlDoc - The document to write to
 * @return {Node} - The Block node
 */
B_List.prototype.createXml = function(xmlDoc) {
	const block = XmlWriter.createElement(xmlDoc, "block");
	XmlWriter.setAttribute(block, "type", this.blockTypeName);
	XmlWriter.setAttribute(block, "list", this.list.getName());
	return block;
};
/**
 * Imports a List Block from the provided XML node
 * @param {Node} blockNode - The node to import from
 * @return {Block|null} - The imported Block
 */
B_List.importXml = function(blockNode) {
	// The list is stored as a string
	const listName = XmlWriter.getAttribute(blockNode, "list");
	const list = CodeManager.findList(listName);
	if (list != null) {
		return new B_List(0, 0, list);
	}
	return null;
};
/**
 * Called from the Block's context menu if it is in a DisplayStack
 */
B_List.prototype.renameLi = function() {
	this.list.rename();
};
/**
 * Called from the Block's context menu if it is in a DisplayStack
 */
B_List.prototype.deleteLi = function() {
	this.list.delete();
};
/**
 * @inheritDoc
 * @param {List} list
 */
B_List.prototype.renameList = function(list) {
	if (list === this.list) {
		this.parts[0].remove();
		this.parts[0] = new LabelText(this, this.list.getName());
		if (this.stack != null) {
			this.stack.updateDim();
		}
	}
};
/**
 * @inheritDoc
 * @param {List} list
 */
B_List.prototype.deleteList = function(list) {
	if (list === this.list) {
		this.unsnap().remove();
	}
};
/**
 * @inheritDoc
 * @param {List} list
 * @return {boolean}
 */
B_List.prototype.checkListUsed = function(list) {
	return list === this.list
};



function B_AddToList(x, y) {
	CommandBlock.call(this, x, y, "lists");
	/* Any type can be added to a list */
	const snapType = Slot.snapTypes.numStrBool;
	const inputType = Slot.outputTypes.any;
	this.addPart(new RectSlot(this, "RectS_item", snapType, inputType, new StringData("")));
	this.addPart(new ListDropSlot(this, "LDS_1"));
	this.parseTranslation(Language.getStr("block_add_to_list"));
}
B_AddToList.prototype = Object.create(CommandBlock.prototype);
B_AddToList.prototype.constructor = B_AddToList;
/* Adds the item to the list */
B_AddToList.prototype.startAction = function() {
	/* Gets the SelectionData referring to the list */
	const listD = this.slots[1].getData();
	if (listD.type === Data.types.selection && !listD.isEmpty()) {
		/* Extracts the List from the SelectionData */
		const list = listD.getValue();
		/* Gets the array value of the ListData stored in the List */
		const array = list.getData().getValue();
		/* Gets the item to add */
		const itemD = this.slots[0].getData();
		/* Adds the item to the array */
		if (itemD.isValid) {
			array.push(itemD);
		} else {
			array.push(itemD.asString());
		}
	}
	return new ExecutionStatusDone();
};



function B_DeleteItemOfList(x, y) {
	CommandBlock.call(this, x, y, "lists");
	this.addPart(new IndexSlot(this, "NumS_idx", true));
	this.addPart(new ListDropSlot(this, "LDS_1"));
	this.parseTranslation(Language.getStr("block_delete_from_list"));
}
B_DeleteItemOfList.prototype = Object.create(CommandBlock.prototype);
B_DeleteItemOfList.prototype.constructor = B_DeleteItemOfList;
/* Deletes the item from the List if it exists */
B_DeleteItemOfList.prototype.startAction = function() {
	const listD = this.slots[1].getData();
	if (listD.type === Data.types.selection && !listD.isEmpty()) {
		const indexD = this.slots[0].getData();
		const list = listD.getValue();
		const listData = list.getData();
		const array = listData.getValue();
		if (indexD.type === Data.types.selection && indexD.getValue() === "all") {
			// Delete everything from the List
			list.setData(new ListData());
		} else {
			const index = listData.getIndex(indexD);
			if (index != null) {
				// Delete the indicated index
				array.splice(index, 1);
			}
		}
	}
	return new ExecutionStatusDone();
};



function B_InsertItemAtOfList(x, y) {
	CommandBlock.call(this, x, y, "lists");
	this.addPart(new RectSlot(this, "RectS_item", Slot.snapTypes.numStrBool, Slot.outputTypes.any, new StringData("")));
	this.addPart(new IndexSlot(this, "NumS_idx", false));
	this.addPart(new ListDropSlot(this, "LDS_1"));
	this.parseTranslation(Language.getStr("block_insert_into_list"));
}
B_InsertItemAtOfList.prototype = Object.create(CommandBlock.prototype);
B_InsertItemAtOfList.prototype.constructor = B_InsertItemAtOfList;
/* Inserts the item at the indicated position */
B_InsertItemAtOfList.prototype.startAction = function() {
	const listD = this.slots[2].getData();
	if (listD.type === Data.types.selection && !listD.isEmpty()) {
		const indexD = this.slots[1].getData();
		const list = listD.getValue();
		const listData = list.getData();
		const array = listData.getValue();
		const itemD = this.slots[0].getData();
		const index = listData.getIndex(indexD);
		// If the value the user provided is too large, insert after the last element
		if (index == null || indexD.getValue() > array.length) {
			let insertAtEnd = indexD.type === Data.types.num && indexD.getValue() > array.length;
			// Or if the user selected "last" (the only SelectionData)
			insertAtEnd = insertAtEnd || (indexD.isSelection());
			if (insertAtEnd) {
				if (itemD.isValid) {
					array.push(itemD);
				} else {
					array.push(itemD.asString());
				}
			}
			return new ExecutionStatusDone();
		}
		// If everything is valid, simply insert the item
		if (itemD.isValid) {
			array.splice(index, 0, itemD);
		} else {
			array.splice(index, 0, itemD.asString());
		}
	}
	return new ExecutionStatusDone();
};



function B_ReplaceItemOfListWith(x, y) {
	CommandBlock.call(this, x, y, "lists");
	this.addPart(new IndexSlot(this, "NumS_idx", false));
	this.addPart(new ListDropSlot(this, "LDS_1"));
	this.addPart(new RectSlot(this, "RectS_item", Slot.snapTypes.numStrBool, Slot.outputTypes.any, new StringData("")));
	this.parseTranslation(Language.getStr("block_replace_list_item"));
}
B_ReplaceItemOfListWith.prototype = Object.create(CommandBlock.prototype);
B_ReplaceItemOfListWith.prototype.constructor = B_ReplaceItemOfListWith;
/* Replaces the item at the specified index with another one */
B_ReplaceItemOfListWith.prototype.startAction = function() {
	const listD = this.slots[1].getData();
	if (listD.type === Data.types.selection && !listD.isEmpty()) {
		const indexD = this.slots[0].getData();
		const list = listD.getValue();
		const listData = list.getData();
		const array = listData.getValue();
		const itemD = this.slots[2].getData();
		const index = listData.getIndex(indexD);
		if (index == null) {
			// Index is out of bounds, do nothing
			return new ExecutionStatusDone();
		}
		// Replace the item
		if (itemD.isValid) {
			array[index] = itemD;
		} else {
			array[index] = itemD.asString();
		}
	}
	return new ExecutionStatusDone();
};



function B_CopyListToList(x, y) {
	CommandBlock.call(this, x, y, "lists");
	/* This Slot also accepts ListData, such as data from the Split block */
	this.addPart(new ListDropSlot(this, "LDS_from", Slot.snapTypes.list));
	/* This Slot must have an already existing List, not a ListData */
	this.addPart(new ListDropSlot(this, "LDS_to"));
	this.parseTranslation(Language.getStr("block_copy_list"));
}
B_CopyListToList.prototype = Object.create(CommandBlock.prototype);
B_CopyListToList.prototype.constructor = B_CopyListToList;
/* Copies one list to another */
B_CopyListToList.prototype.startAction = function() {
	const listD1 = this.slots[0].getData();
	const listD2 = this.slots[1].getData();
	// If the second list is valid
	if (listD2.type === Data.types.selection && !listD2.isEmpty()) {
		let listDataToCopy;
		if (listD1.type === Data.types.selection && !listD1.isEmpty()) {
			// Retrieve the first list's data if it was selected from the DropSlot
			listDataToCopy = listD1.getValue().getData();
		} else if (listD1.type === Data.types.list) {
			// Retrieve the ListData
			listDataToCopy = listD1;
		} else {
			// First list is of wrong type of Data. Exit.
			return new ExecutionStatusDone();
		}
		// Get the List from the SelectionData
		const listToCopyTo = listD2.getValue();
		// Copy the Data to it
		listToCopyTo.setData(listDataToCopy.duplicate());
	}
	return new ExecutionStatusDone();
};



function B_ItemOfList(x, y) {
	ReporterBlock.call(this, x, y, "lists", Block.returnTypes.string);
	this.addPart(new IndexSlot(this, "NumS_idx", false));
	// Accepts both Lists and ListData
	this.addPart(new ListDropSlot(this, "LDS_1", Slot.snapTypes.list));
	this.parseTranslation(Language.getStr("block_list_item"));
}
B_ItemOfList.prototype = Object.create(ReporterBlock.prototype);
B_ItemOfList.prototype.constructor = B_ItemOfList;
/* Gets the item form the list */
B_ItemOfList.prototype.startAction = function() {
	const listD = this.slots[1].getData();
	let indexD;
	if (listD.type === Data.types.selection && !listD.isEmpty()) {
		// If the list was selected, retrieve it
		indexD = this.slots[0].getData();
		const list = listD.getValue();
		const listData = list.getData();
		// Index in and return the value
		return new ExecutionStatusResult(this.getItemOfList(listData, indexD));
	} else if (listD.type === Data.types.list) {
		indexD = this.slots[0].getData();
		// Index in and return the value
		return new ExecutionStatusResult(this.getItemOfList(listD, indexD));
	} else {
		// Bad Data, exit
		return new ExecutionStatusResult(new StringData("", false));
	}
};
/**
 * Gets the item from the ListData at the specified index
 * TODO: move this function into ListData
 * @param {ListData} listData - the Data to read from
 * @param {NumData} indexD - The index to retrieve
 * @return {StringData} - The retrieved data, as a StringData
 */
B_ItemOfList.prototype.getItemOfList = function(listData, indexD) {
	const array = listData.getValue();
	const index = listData.getIndex(indexD);
	if (index == null) {
		return new StringData("", false);
	} else {
		return array[index];
	}
};



function B_LengthOfList(x, y) {
	ReporterBlock.call(this, x, y, "lists", Block.returnTypes.num);
	// Accepts both Lists and ListData
	this.addPart(new ListDropSlot(this, "LDS_1", Slot.snapTypes.list));
	this.parseTranslation(Language.getStr("block_list_length"));
}
B_LengthOfList.prototype = Object.create(ReporterBlock.prototype);
B_LengthOfList.prototype.constructor = B_LengthOfList;
/* Returns the number of items in the List or ListData */
B_LengthOfList.prototype.startAction = function() {
	const listD = this.slots[0].getData();
	if (listD.type === Data.types.selection && !listD.isEmpty()) {
		const list = listD.getValue();
		const array = list.getData().getValue();
		return new ExecutionStatusResult(new NumData(array.length));
	} else if (listD.type === Data.types.list) {
		return new ExecutionStatusResult(new NumData(listD.getValue().length));
	} else {
		return new ExecutionStatusResult(new NumData(0, false));
	}
};



function B_ListContainsItem(x, y) {
	PredicateBlock.call(this, x, y, "lists");
	this.addPart(new ListDropSlot(this, "LDS_1", Slot.snapTypes.list));
	const snapType = Slot.snapTypes.numStrBool;
	const inputType = Slot.outputTypes.any;
	this.addPart(new RectSlot(this, "RectS_item", snapType, inputType, new StringData("")));
	this.parseTranslation(Language.getStr("block_list_contains"));
}
B_ListContainsItem.prototype = Object.create(PredicateBlock.prototype);
B_ListContainsItem.prototype.constructor = B_ListContainsItem;
/* Returns BoolData indicating if the item is in the List */
B_ListContainsItem.prototype.startAction = function() {
	const listD = this.slots[0].getData();
	if (listD.type === Data.types.selection && !listD.isEmpty()) {
		const list = listD.getValue();
		const listData = list.getData();
		const itemD = this.slots[1].getData();
		return new ExecutionStatusResult(this.checkListContainsItem(listData, itemD));
	} else if (listD.type === Data.types.list) {
		const itemD = this.slots[1].getData();
		return new ExecutionStatusResult(this.checkListContainsItem(listD, itemD));
	} else {
		return new ExecutionStatusResult(new BoolData(false, true));
	}
};
/**
 * Returns BoolData indicating if the item is in the List
 * @param {ListData} listData - The list to examine
 * @param {Data} itemD - The item to check
 * @return {BoolData} - true iff itemD appears in listData
 */
B_ListContainsItem.prototype.checkListContainsItem = function(listData, itemD) {
	const array = listData.getValue();
	for (let i = 0; i < array.length; i++) {
		if (Data.checkEquality(itemD, array[i])) {
			return new BoolData(true, true);
		}
	}
	return new BoolData(false, true);
};
