/**
 * An abstract class representing a way of inputting data into an EditableSlot.  Each EditableSlot can make an
 * InputSystem when it is told to edit(), which it provides with its slotShape, initial data, and functions to
 * call when editing is complete.
 * Some InputSystems require additional information, which is provided through the subclass of the constructor
 * @constructor
 */
function InputSystem(){
	this.visible = false;   // Whether the system is showing
	this.closed = false;   // Once closed, the system cannot be opened again (only shown once)
	this.cancelled = false;   // Whether the system set a value or was cancelled (for dialogs)
}

/**
 * Shows the InputSystem when the Slot is edited
 * @param {EditableSlotShape} slotShape - The slotShape of the Slot
 * @param {function} updateFn - type (Data, string) -> (), called with Data and displayText to change how the Slot looks
 * @param {function} finishFn - type (Data) -> (), called to finish editing and sets the value to Data
 * @param {Data} data - The initial Data in the Slot
 */
InputSystem.prototype.show = function(slotShape, updateFn, finishFn, data){
	DebugOptions.assert(!this.visible);
	DebugOptions.assert(!this.closed);
	this.visible = true;
	this.slotShape = slotShape;
	this.updateFn = updateFn;
	this.finishFn = finishFn;
	this.currentData = data;
};

/**
 * Closes the InputSystem and calls the finishFn to end the editing
 */
InputSystem.prototype.close = function(){
	if(this.closed) return;
	this.closed = true;
	this.visible = false;
	this.finishFn(this.currentData, this.cancelled);
};