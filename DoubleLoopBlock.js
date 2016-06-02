function DoubleLoopBlock(x,y,category,midLabelText){
	this.midLabelText=midLabelText;
	Block.call(this,6,Block.returnTypes.none,x,y,category);
}
DoubleLoopBlock.prototype = Object.create(Block.prototype);
DoubleLoopBlock.prototype.constructor = DoubleLoopBlock;
DoubleLoopBlock.prototype.duplicate=function(x,y){
	var copiedClass=function(x1,y1,category,midLabelText){
		DoubleLoopBlock.call(this,x1,y1,category,midLabelText);
	}
	copiedClass.prototype = Object.create(this.constructor.prototype);
	copiedClass.prototype.constructor = copiedClass;
	
	var myCopy=new copiedClass(x,y,this.category,this.midLabelText);
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