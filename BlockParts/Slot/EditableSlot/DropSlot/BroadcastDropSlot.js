/**
 * A DropSlot which lists available broadcasts (obtained from CodeManager.broadcastList) and allows the creation
 * of new broadcasts (through an Enter Text option). Reporter blocks that return strings can e attached to the Slot
 * unless it is within a HatBlock
 * @param {Block} parent
 * @param {string} key
 * @param {boolean} [isHatBlock=false] - Whether the slot is in a HatBlock and should include a "any message" option
 * @constructor
 */
function BroadcastDropSlot(parent, key, isHatBlock) {
	if (isHatBlock == null) {
		isHatBlock = false;
	}
	let snapType = Slot.snapTypes.numStrBool;
	if (isHatBlock) {
		snapType = Slot.snapTypes.none;
	}
	DropSlot.call(this, parent, key, EditableSlot.inputTypes.any, snapType);
	if (isHatBlock) {
		this.addOption(new SelectionData("any message", "any_message"));
	}
}
BroadcastDropSlot.prototype = Object.create(DropSlot.prototype);
BroadcastDropSlot.prototype.constructor = BroadcastDropSlot;

/**
 * @inheritDoc
 * @param {InputWidget.SelectPad} selectPad
 */
BroadcastDropSlot.prototype.populatePad = function(selectPad) {
	DropSlot.prototype.populatePad.call(this, selectPad);
	// Refresh the list of messages
	CodeManager.updateAvailableMessages();
	const messages = CodeManager.broadcastList;
	// Add an option for each message
	messages.forEach(function(message) {
		// Broadcasts are surrounded in quotes
		// TODO: make use of quotes around strings more consistent
		selectPad.addOption(new StringData(message), '"' + message + '"');
	});
	// Add an Edit Text option
	selectPad.addAction("new", function(callbackFn) {
		// When the option is selected, show a dialog
		const inputDialog = new InputDialog(this.parent.textSummary(this), false);
		inputDialog.show(this.slotShape, function() {}, function(data, cancelled) {
			// When the dialog is closed, notify the InputSystem of the result using a callback
			callbackFn(data, !cancelled);
		}, this.enteredData);
	}.bind(this));
};

/**
 * @inheritDoc
 * Adds the selected message to the list of available messages. Does not use recursion since BroadCastDropSlots
 * only appear on CommandBlocks/HatBlocks are therefore can't be stacked in each other
 */
BroadcastDropSlot.prototype.updateAvailableMessages = function() {
	if (this.enteredData !== null && this.enteredData.type === Data.types.string) {
		CodeManager.addBroadcastMessage(this.enteredData.getValue());
	}
};

/**
 * For a BroadcastDropSlot, non-selection Data must be StringData
 * @param {Data} data
 * @return {Data|null}
 */
BroadcastDropSlot.prototype.sanitizeNonSelectionData = function(data) {
	data = data.asString();
	if (!data.isValid) return null;
	return data;
};

/**
 * BroadCastDropSlots wrap broadcasts in quotes
 * @inheritDoc
 * @param {Data} data
 * @return {string}
 */
BroadcastDropSlot.prototype.dataToString = function(data) {
	let result = EditableSlot.prototype.dataToString.call(this, data);
	if (data.type === Data.types.string) {
		result = "\"" + result + "\"";
	}
	return result;
};