/* Child of Block. The HatBlock is for Blocks like CommandBlock but which have rounded tops which accept no Blocks.
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 */
function HatBlock(x,y,category){
	Block.call(this,4,Block.returnTypes.none,x,y,category); //Call constructor.
}
HatBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
HatBlock.prototype.constructor = HatBlock;