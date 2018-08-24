/**
 * Child of Block. The Calibrate is for Blocks that return no value but have no BlockSlots.
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 */
function CalibrateBlock(x, y, category) {
    Block.call(this, 7, Block.returnTypes.none, x, y, category);
}


CalibrateBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
CalibrateBlock.prototype.constructor = CalibrateBlock;
