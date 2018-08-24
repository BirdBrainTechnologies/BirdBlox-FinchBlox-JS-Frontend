/**
 * Child of Block. The DoubleLoopBlock is for Blocks like CommandBlock but with two spaces for additional Blocks
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {boolean} midLabelText - i.e. "Else".  The text to label the second BlockSlot.
 */
function DoubleLoopBlock(x, y, category, midLabelText) {
	this.midLabelText = midLabelText; //Is set before constructor so Block is ready to render when constructor runs.
	Block.call(this, 6, Block.returnTypes.none, x, y, category);
}
DoubleLoopBlock.prototype = Object.create(Block.prototype);
DoubleLoopBlock.prototype.constructor = DoubleLoopBlock;