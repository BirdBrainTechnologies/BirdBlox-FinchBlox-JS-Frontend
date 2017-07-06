/* NumSlot is a subclass of RoundSlot.
 * It creates a RoundSlot optimized for use with numbers.
 * It automatically converts any results into NumData and has a snapType of numStrBool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {number} value - The initial number stored in the Slot.
 * @param {boolean} positive - (optional) Determines if the NumPad will have the plus/minus Button disabled.
 * @param {boolean} integer - (optional) Determines if the NumPad will have the decimal point Button disabled.
 */
function NumSlot(parent,key,value,positive,integer){
	if(positive==null){ //Optional parameters are false by default.
		positive=false;
	}
	if(integer==null){
		integer=false;
	}
	//Make RoundSlot.
	const inputType = EditableSlot.inputTypes.num;
	const snapType = Slot.snapTypes.numStrBool;
	const outputType = Slot.outputTypes.num;
	RoundSlot.call(this, parent, key, inputType, snapType, outputType, new NumData(value), positive, integer);
}
NumSlot.prototype = Object.create(RoundSlot.prototype);
NumSlot.prototype.constructor = NumSlot;