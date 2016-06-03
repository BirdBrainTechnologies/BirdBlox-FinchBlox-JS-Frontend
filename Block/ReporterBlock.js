function ReporterBlock(x,y,category,returnType){
	if(returnType==null){
		returnType=Block.returnTypes.num;
	}
	Block.call(this,1,returnType,x,y,category);
}
ReporterBlock.prototype = Object.create(Block.prototype);
ReporterBlock.prototype.constructor = ReporterBlock;