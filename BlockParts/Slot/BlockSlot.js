function BlockSlot(parent){
	this.child=null;
	//this.width=0;
	this.height=0;
	this.x=0;
	this.y=0;
	this.parent=parent;
	this.isBlockSlot=true;
	this.hasChild=false;
	this.isRunning=false;
	this.currentBlock=null;
}
BlockSlot.prototype.getAbsX=function(){
	return this.x+this.parent.stack.getAbsX();
}
BlockSlot.prototype.getAbsY=function(){
	return this.y+this.parent.stack.getAbsY();
}
BlockSlot.prototype.updateDim=function(){
	var bG=BlockGraphics.getType(this.type);
	if(this.hasChild){
		this.child.updateDim();
		this.height=this.child.addHeights();
	}
	else{
		//this.width=0;
		this.height=BlockGraphics.loop.bottomH;
	}
}
BlockSlot.prototype.updateAlign=function(x,y){
	this.x=x;
	this.y=y;
	if(this.hasChild){
		this.child.updateAlign(x,y);
	}
}
BlockSlot.prototype.snap=function(block){
	block.parent=this;
	if(this.hasChild){
		var lastBlock=block.getLastBlock();
		var prevChild=this.child;
		lastBlock.nextBlock=prevChild;
		prevChild.parent=lastBlock;
	}
	this.hasChild=true;
	this.child=block;
	var oldG=block.stack.group;
	block.stack.remove();
	block.changeStack(this.parent.stack);
	oldG.remove();
	this.parent.stack.updateDim();
}
BlockSlot.prototype.changeStack=function(stack){
	if(this.hasChild){
		this.child.changeStack(stack);
	}
}
BlockSlot.prototype.updateStackDim=function(stack){
	if(this.hasChild){
		this.child.updateStackDim(stack);
	}
}
BlockSlot.prototype.removeChild=function(){
	this.hasChild=false;
	this.child=null;
}
BlockSlot.prototype.findBestFit=function(){
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.getAbsX();
	var y=this.getAbsY();
	if(move.topOpen){
		var snap=BlockGraphics.command.snap;
		if(move.pInRange(move.topX,move.topY,x-snap.left,y-snap.top,snap.left+snap.right,snap.top+snap.bottom)){
			var xDist=move.topX-x;
			var yDist=move.topY-y;
			var dist=xDist*xDist+yDist*yDist;
			if(!fit.found||dist<fit.dist){
				fit.found=true;
				fit.bestFit=this;
				fit.dist=dist;
			}
		}
	}
	if(this.hasChild){
		this.child.findBestFit();
	}
}
BlockSlot.prototype.highlight=function(){
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),0,0,0,false);
}
BlockSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new BlockSlot(parentCopy);
	if(this.hasChild){
		myCopy.child=this.child.duplicate(0,0);
		myCopy.hasChild=true;
	}
	return myCopy;
}
BlockSlot.prototype.startRun=function(){
	if(!this.isRunning&&this.hasChild){
		this.isRunning=true;
		this.currentBlock=this.child;
	}
}
BlockSlot.prototype.stop=function(){
	if(this.isRunning&&this.hasChild){
		this.child.stop();
	}
	this.isRunning=false;
}
BlockSlot.prototype.updateRun=function(){
	if(this.isRunning){
		this.currentBlock=this.currentBlock.updateRun();
		if(this.currentBlock==null){
			this.isRunning=false;
		}
	}
	return this.isRunning;
}