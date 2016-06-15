/* Child of Block. The DoubleLoopBlock is for Blocks like CommandBlock but with a space for additional Blocks
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {boolean} bottomOpen - Can Blocks be attached to the bottom of this Block?
 */
function LoopBlock(x,y,category,bottomOpen){
	Block.call(this,5,Block.returnTypes.none,x,y,category); //Call constructor.
	if(bottomOpen!=null&&bottomOpen==false){ //if bottomOpen is false, change it from the default.
		this.bottomOpen=false;
	}
}
LoopBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
LoopBlock.prototype.constructor = LoopBlock;