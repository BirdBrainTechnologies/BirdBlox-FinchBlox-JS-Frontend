/**
 * StringSlot is a subclass of RectSlot.
 * It creates a RectSlot optimized for use with strings.
 * It automatically converts any results into StringData and has a snapType of numStrBool.
 * @constructor
 * @param {Block} parent
 * @param {string} key
 * @param {string} value - The initial string stored in the Slot.
 */
function StringSlot(parent, key, value) {
  //Make RectSlot.
  RectSlot.call(this, parent, key, Slot.snapTypes.numStrBool, Slot.outputTypes.string, new StringData(value));
}
StringSlot.prototype = Object.create(RectSlot.prototype);
StringSlot.prototype.constructor = StringSlot;
