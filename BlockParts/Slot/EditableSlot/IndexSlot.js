/**
 * Created by Tom on 7/7/2017.
 */
function IndexSlot(parent,key) {
	const inputType = EditableSlot.inputTypes.any;
	const snapType = Slot.snapTypes.numStrBool;
	const outputType = Slot.outputTypes.any;
	RoundSlot.call(this, parent, key, inputType, snapType, outputType, new NumData(1), true, true);
	this.addOption(new SelectionData("last", "last"));
	this.addOption(new SelectionData("random", "random"));
	this.addOption(new SelectionData("all", "all"));
}
IndexSlot.prototype = Object.create(RoundSlot.prototype);
IndexSlot.prototype.constructor = IndexSlot;
IndexSlot.prototype.sanitizeData = function(data){
	data = RoundSlot.prototype.sanitizeData.call(this, data);
	if(data == null) return null;
	if(!data.isSelection()) {
		const numData = data.asNum();
		if(!numData.isValid) return null;
		let value = numData.getValueWithC(true, true);
		value = Math.max(1, value);
		return new NumData(value);
	}
	return data;
};