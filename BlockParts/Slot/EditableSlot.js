/**
 * Created by Tom on 6/30/2017.
 */
function EditableSlot(parent, key, inputType, snapType, outputType, data){
	Slot.call(this, parent, key, inputType, snapType, outputType);
	this.enteredData = data;
	//parent, key, inputType, snapType, outputType
}
EditableSlot.prototype = Object.create(Slot.prototype);
EditableSlot.prototype.constructor = EditableSlot;
