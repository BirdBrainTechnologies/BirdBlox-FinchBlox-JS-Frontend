/**
 * Child of Block. The CommandBlock is for Blocks that return values other than booleans.
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {number} returnType - (optional) The type of data the Block returns (from Block.returnTypes). Default: num.
 */
function ReporterBlock(x, y, category, returnType) {
	if (returnType == null) {
		returnType = Block.returnTypes.num; //Return nums by default.
	}
	Block.call(this, 1, returnType, x, y, category); //Call constructor.
}
ReporterBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
ReporterBlock.prototype.constructor = ReporterBlock;