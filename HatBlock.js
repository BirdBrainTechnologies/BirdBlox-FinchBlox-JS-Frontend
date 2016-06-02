function HatBlock(x,y,category){
	Block.call(this,4,Block.returnTypes.none,x,y,category);
}
HatBlock.prototype = Object.create(Block.prototype);
HatBlock.prototype.constructor = HatBlock;