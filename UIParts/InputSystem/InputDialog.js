/**
 * A dialog used to edit the value of the Slot
 * @param {string} textSummary - The textSummary of the Slot
 * @param {boolean} acceptsEmptyString - Whether the empty string is considered valid for this Slot
 * @constructor
 */
function InputDialog(textSummary, acceptsEmptyString) {
	InputSystem.call(this);
	this.textSummary = textSummary;
	this.acceptsEmptyString = acceptsEmptyString;
}

/**
 * Shows a dialog and sets the value of the Slot to whatever the user enters
 * @inheritDoc
 * @param {SlotShape} slotShape
 * @param {function} updateFn
 * @param {function} finishFn
 * @param {Data} data
 */
InputDialog.prototype.show = function(slotShape, updateFn, finishFn, data) {
	InputSystem.prototype.show.call(this, slotShape, updateFn, finishFn, data);
	const oldVal = data.asString().getValue();
	// Only prefill if the data is a string.  Otherwise, display it grayed out in the background.
	const shouldPrefill = data.type === Data.types.string;
	DialogManager.showPromptDialog("Edit text", this.textSummary, oldVal, shouldPrefill, function(cancelled, response) {
		if (!cancelled && (response !== "" || this.acceptsEmptyString)) {
			// Set the data
			this.currentData = new StringData(response);
			this.cancelled = false;
		} else {
			// Mark as cancelled
			this.cancelled = true;
		}
		InputSystem.prototype.close.call(this);
	}.bind(this));
};