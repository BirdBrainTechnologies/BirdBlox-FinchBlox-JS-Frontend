/**
 * An interface for parts of a Block such as LabelText, BlockIcons, and Slots.
 * @param {Block} parent - The Block this part is a member of
 * @constructor
 */
function BlockPart(parent) {
  DebugOptions.markAbstract();
  this.parent = parent;
  this.isSlot = false;
  this.width = NaN;
  this.height = NaN;
  this.isEndOfLine = false; //Set to true if the next block part should rap to next line
}

/**
 * Move the part to the specified location and returns where the next part should be.
 * Called by the Block any time it has changed size/shape
 * @param {number} x - The x coord the part should have relative to the Block it is in
 * @param {number} y - The y coord ths part should have measured from the center of the part
 * @return {number} - The width of the part, indicating how much the next item in the Block should be shifted over.
 */
BlockPart.prototype.updateAlign = function(x, y) {
  DebugOptions.markAbstract();
  return this.width;
};

/**
 * Makes this part recalculate its dimensions, which it stores in this.width and this.height for the Block to retrieve.
 */
BlockPart.prototype.updateDim = function() {
  DebugOptions.markAbstract();
  this.width = NaN;
  this.height = NaN;
};

/**
 * Creates a text representation of the part
 * @return {string}
 */
BlockPart.prototype.textSummary = function() {
  DebugOptions.markAbstract();
  return "";
};

/**
 * Makes the part appear active
 */
BlockPart.prototype.makeActive = function() {

};

/**
 * Makes the part appear inactive
 */
BlockPart.prototype.makeInactive = function() {

};

/**
 * @param {boolean} active
 */
BlockPart.prototype.setActive = function(active) {
  if (active) {
    this.makeActive();
  } else {
    this.makeInactive();
  }
};
