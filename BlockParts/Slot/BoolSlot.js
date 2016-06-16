/* BoolSlot is a subclass of HexSlot.
 * It creates a RectSlot optimized for use with booleans.
 * It has a snapType of bool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 */
function BoolSlot(parent){
	//Make HexSlot.
	HexSlot.call(this,parent,Slot.snapTypes.bool);
}
BoolSlot.prototype = Object.create(HexSlot.prototype);
BoolSlot.prototype.constructor = BoolSlot;