/**
 * HexSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a hexagonal Slot that can hold Blocks but not be edited via InputPad or dialog.
 * Its input type and output type is always bool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {string} key - The name of the Slot. Used for reading and writing save files.
 * @param {number} snapType - [none,numStrBool,bool,list,any] The type of Blocks which can be attached to the HexSlot.
 */
function HexSlot(parent, key, snapType) {
  Slot.call(this, parent, key, snapType, Slot.outputTypes.bool); //Call constructor.
  this.slotShape = new HexSlotShape(this);
  this.slotShape.show();
}
HexSlot.prototype = Object.create(Slot.prototype);
HexSlot.prototype.constructor = HexSlot;

/**
 * @inheritDoc
 * TODO: fix BlockGraphics
 */
HexSlot.prototype.highlight = function() {
  const slotGraphicShowing = !this.hasChild;
  Highlighter.highlight(this.getAbsX(), this.getAbsY(), this.width, this.height, 2, slotGraphicShowing);
};

/**
 * @inheritDoc
 * @return {string}
 */
HexSlot.prototype.textSummary = function() {
  //Angle brackets are used because it is a HexSlot.
  if (this.hasChild) { //If it has a child, just use an ellipsis.
    return "<...>";
  } else { //Otherwise, it is empty.
    return "<>";
  }
};

/**
 * @inheritDoc
 * @return {Data}
 */
HexSlot.prototype.getDataNotFromChild = function() {
  return new BoolData(false, false); //The Slot is empty. Return default value of false.
};
