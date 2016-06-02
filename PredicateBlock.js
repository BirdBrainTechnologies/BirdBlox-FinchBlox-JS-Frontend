function PredicateBlock(x,y,category){
	Block.call(this,2,Block.returnTypes.bool,x,y,category);
}
PredicateBlock.prototype = Object.create(Block.prototype);
PredicateBlock.prototype.constructor = PredicateBlock;
