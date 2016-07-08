/* Child of Block. The DoubleLoopBlock is for Blocks like CommandBlock but with two spaces for additional Blocks
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {boolean} midLabelText - i.e. "Else".  The text to label the second BlockSlot.
 */
function DoubleLoopBlock(x,y,category,midLabelText){
	this.midLabelText=midLabelText; //Is set before constructor so Block is ready to render when constructor runs.
	Block.call(this,6,Block.returnTypes.none,x,y,category);
}
DoubleLoopBlock.prototype = Object.create(Block.prototype);
DoubleLoopBlock.prototype.constructor = DoubleLoopBlock;
DoubleLoopBlock.prototype.duplicate=function(x,y){ //Must be overridden to set midLabelText with constructor.
	var copiedClass=function(x1,y1,category,midLabelText){
		DoubleLoopBlock.call(this,x1,y1,category,midLabelText);
	};
	copiedClass.prototype = Object.create(this.constructor.prototype);
	copiedClass.prototype.constructor = copiedClass;
	
	var myCopy=new copiedClass(x,y,this.category,this.midLabelText);
	myCopy.blockTypeName=this.blockTypeName;
	myCopy.bottomOpen=this.bottomOpen;
	for(var i=0;i<this.parts.length;i++){
		myCopy.addPart(this.parts[i].duplicate(myCopy));
	}
	if(this.blockSlot1!=null){
		myCopy.blockSlot1=this.blockSlot1.duplicate(myCopy);
	}
	if(this.blockSlot2!=null){
		myCopy.blockSlot2=this.blockSlot2.duplicate(myCopy);
	}
	if(this.nextBlock!=null){
		myCopy.nextBlock=this.nextBlock.duplicate(0,0);
		myCopy.nextBlock.parent=myCopy;
	}
	return myCopy;
}