function CommandBlock(x,y,category,bottomOpen){
	Block.call(this,0,Block.returnTypes.none,x,y,category);
	if(bottomOpen!=null&&bottomOpen==false){
		this.bottomOpen=false;
	}
}
CommandBlock.prototype = Object.create(Block.prototype);
CommandBlock.prototype.constructor = CommandBlock;