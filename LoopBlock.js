function LoopBlock(x,y,category,bottomOpen){
	Block.call(this,5,Block.returnTypes.none,x,y,category);
	if(bottomOpen!=null&&bottomOpen==false){
		this.bottomOpen=false;
	}
}
LoopBlock.prototype = Object.create(Block.prototype);
LoopBlock.prototype.constructor = LoopBlock;