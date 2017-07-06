/**
 * Created by Tom on 7/4/2017.
 */
function NumOrStringSlot(parent, key, data){
	const inputType = EditableSlot.inputTypes.any;
	const snapType = Slot.snapTypes.numStrBool;
	const outputType = Slot.outputTypes.any;
	RoundSlot.call(this, parent, key, inputType, snapType, outputType, data, false, false);
}
NumOrStringSlot.prototype = Object.create(RoundSlot.prototype);
NumOrStringSlot.prototype.constructor = NumOrStringSlot;
NumOrStringSlot.prototype.populatePad = function(selectPad){
	selectPad.addAction("Enter text", function(callbackFn){
		const inputDialog = new InputDialog(this.parent.textSummary(this), true);
		inputDialog.show(this.slotShape, function(){}, function(data, cancelled){
			callbackFn(data, !cancelled);
		}, this.enteredData);
	}.bind(this)); //TODO: clean up edit text options
};
