/* Child of Block. The CommandBlock is for Blocks that return booleans.
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 */
function PredicateBlock(x,y,category){
	Block.call(this,2,Block.returnTypes.bool,x,y,category); //Call constructor.
}
PredicateBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
PredicateBlock.prototype.constructor = PredicateBlock;
