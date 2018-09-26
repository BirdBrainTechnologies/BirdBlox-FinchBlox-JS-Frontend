/**
 * Represents a user-created List that is part of the current project.  A list holds ListData, which in turn contains
 * an array.  Lists can be edited, while the ListData they pass should not be butated while another object is using it.
 * Two Lists can't point to the same ListData, so there should never be aliasing.
 * @param {string} name - The name of the list.  Must be unique among Lists
 * @param {ListData} data - The data to initialize this list with
 * @constructor
 */
function List(name, data) {
	this.name = name;
	if (data != null) {
		this.data = data;
	} else {
		this.data = new ListData();
	}
	CodeManager.addList(this);
}

/**
 * Retrieves the name of the list
 * @return {string}
 */
List.prototype.getName = function() {
	return this.name;
};

/**
 * Creates SelectionData for choosing the List from a DropSlot
 * @return {SelectionData}
 */
List.prototype.getSelectionData = function() {
	return new SelectionData(this.name, this);
};

/**
 * Retrieves the ListData from the List
 * @return {ListData}
 */
List.prototype.getData = function() {
	return this.data;
};

/**
 * Sets the List's ListData
 * @param {ListData} data
 */
List.prototype.setData = function(data) {
	this.data = data;
};

/**
 * Removes the list from the CodeManager, effectively deleting it
 */
List.prototype.remove = function() {
	this.data = null;
	CodeManager.removeList(this);
};

/**
 * Saves information about the List to XML
 * @param {Document} xmlDoc - The document to write to
 * @return {Node} - The XML Node for the List
 */
List.prototype.createXml = function(xmlDoc) {
	const list = XmlWriter.createElement(xmlDoc, "list");
	XmlWriter.setAttribute(list, "name", this.name);
	list.appendChild(this.data.createXml(xmlDoc));
	return list;
};

/**
 * Creates a List from XML
 * @param {Element} listNode - The XML Node with information about the List
 * @return {List}
 */
List.importXml = function(listNode) {
	const name = XmlWriter.getAttribute(listNode, "name");
	if (name != null) {
		const dataNode = XmlWriter.findSubElement(listNode, "data");
		let data = new ListData();
		if (dataNode != null) {
			const newData = Data.importXml(dataNode);
			if (newData != null) {
				data = newData;
			}
		}
		return new List(name, data);
	}
};

/**
 * Prompts the user to rename the list
 */
List.prototype.rename = function() {
	const callbackFn = function(cancelled, response) {
		if (!cancelled && CodeManager.checkListName(response)) {
			this.name = response;
			CodeManager.renameList(this);
		}
	}.bind(this);
	DialogManager.showPromptDialog(Language.getStr("Rename_list"), Language.getStr("Enter_new_name"), this.name, true, callbackFn);
};

/**
 * Prompts the user to delete the list, or just deletes it if it is never used
 */
List.prototype.delete = function() {
	if (CodeManager.checkListUsed(this)) {
		const callbackFn = function(response) {
			if (response === "2") {
				this.remove();
				CodeManager.deleteList(this);
			}
		}.bind(this);
		callbackFn.list = this;
		let question = Language.getStr("List_delete_question");
		DialogManager.showChoiceDialog(Language.getStr("Delete_list"), question, Language.getStr("Dont_delete"), Language.getStr("Delete"), true, callbackFn);
	} else {
		this.remove();
		CodeManager.deleteList(this);
	}
};
