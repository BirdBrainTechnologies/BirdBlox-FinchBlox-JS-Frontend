/**
 * NumOrStringSlots are used in the equals Block, as they make it easy to enter numbers but do allow text to be entered
 * @param {Block} parent
 * @param {string} key
 * @param {Data} data
 * @constructor
 */
function NumOrStringSlot(parent, key, data){
	const inputType = EditableSlot.inputTypes.any;
	const snapType = Slot.snapTypes.numStrBool;
	const outputType = Slot.outputTypes.any;
	RoundSlot.call(this, parent, key, inputType, snapType, outputType, data, false, false);
}
NumOrStringSlot.prototype = Object.create(RoundSlot.prototype);
NumOrStringSlot.prototype.constructor = NumOrStringSlot;

/**
 * @inheritDoc
 * @param {InputWidget.SelectPad} selectPad
 */
NumOrStringSlot.prototype.populatePad = function(selectPad){
	selectPad.addAction(Language.getStr("Enter_text"), function(callbackFn){
		// When "Enter text" is selected, create a new inputDialog
		const inputDialog = new InputDialog(this.parent.textSummary(this), true);
		inputDialog.show(this.slotShape, function(){}, function(data, cancelled){
			// When the inputDialog is closed, tell the selectPad to set the data to the result of the inputDialog.
			// CLose the selectPad if the inputDialog wasn't canceled.
			callbackFn(data, !cancelled);
		}, this.enteredData);
	}.bind(this)); //TODO: clean up edit text options
};
