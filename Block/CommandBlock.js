/* Child of Block. The CommandBlock is for Blocks that return no value but have no BlockSlots.
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {boolean} bottomOpen - Can Blocks be attached to the bottom of this Block?
 */
function CommandBlock(x,y,category,bottomOpen){
	Block.call(this,0,Block.returnTypes.none,x,y,category); //Call constructor.
	if(bottomOpen!=null&&bottomOpen==false){ //if bottomOpen is false, change it from the default.
		this.bottomOpen=false;
	}
}
CommandBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
CommandBlock.prototype.constructor = CommandBlock;