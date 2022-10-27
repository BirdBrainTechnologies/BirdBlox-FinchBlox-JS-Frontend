/**
 * BoolSlot is a subclass of HexSlot.
 * It creates a RectSlot optimized for use with booleans.
 * It has a snapType of bool.
 * @constructor
 * @param {Block} parent
 * @param {string} key
 */
function BoolSlot(parent, key) {
  //Make HexSlot.
  HexSlot.call(this, parent, key, Slot.snapTypes.bool);
}
BoolSlot.prototype = Object.create(HexSlot.prototype);
BoolSlot.prototype.constructor = BoolSlot;
