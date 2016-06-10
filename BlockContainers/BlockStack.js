
function BlockStack(firstBlock,tab){
	tab.addStack(this);
	this.firstBlock=firstBlock;
	this.firstBlock.stop();
	this.firstBlock.stopGlow();
	this.returnType=firstBlock.returnType;
	this.x=0;
	this.y=0;
	this.x=firstBlock.getAbsX();
	this.y=firstBlock.getAbsY();
	//this.group=GuiElements.create.group(this.x,this.y,GuiElements.layers.activeTab);
	this.tab=tab;
	this.tabGroup=tab.mainG;
	this.group=GuiElements.create.group(this.x,this.y,this.tabGroup);
	this.firstBlock.changeStack(this);
	this.dim=function(){};
	this.dim.cw; //Dimensions of regions command blocks can be attached to.
	this.dim.ch;
	this.dim.rw; //Dimensions of regions reporter/predicate blocks can be attached to.
	this.dim.rh;
	this.updateDim();
	this.isRunning=false;
	this.currentBlock=null;
	this.isDisplayStack=false;
	this.move(this.x,this.y);
	this.flying=false;
}
BlockStack.prototype.updateDim=function() {
	this.dim.cAssigned=false;
	this.dim.rAssigned=false;
	this.firstBlock.updateDim();
	this.firstBlock.updateAlign(0,0);
	this.dim.cx1=this.firstBlock.x;
	this.dim.cy1=this.firstBlock.y;
	this.dim.cx2=this.dim.cx1;
	this.dim.cy2=this.dim.cy1;
	this.dim.rx1=0;
	this.dim.ry1=0;
	this.dim.rx2=0;
	this.dim.ry2=0;
	this.firstBlock.updateStackDim();
	
	this.dim.cw=this.dim.cx2-this.dim.cx1;
	this.dim.ch=this.dim.cy2-this.dim.cy1;
	this.dim.rw=this.dim.rx2-this.dim.rx1;
	this.dim.rh=this.dim.ry2-this.dim.ry1;
	
	this.dim.cx1+=this.getAbsX();
	this.dim.cy1+=this.getAbsY();
	this.dim.rx1+=this.getAbsX();
	this.dim.ry1+=this.getAbsY();
}
BlockStack.prototype.getAbsX=function(){
	if(this.flying){
		return this.x;
	}
	else{
		return this.x+this.tab.getAbsX();
	}
}
BlockStack.prototype.getAbsY=function(){
	if(this.flying){
		return this.y;
	}
	else{
		return this.y+this.tab.getAbsY();
	}
}
BlockStack.prototype.findBestFit=function(){
	//Not implemented, check top of block
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	if(move.stack===this){
		return;
	}
	if(move.bottomOpen&&this.firstBlock.topOpen){
		this.findBestFitTop();
	}
	if(move.topOpen){
		if(move.pInRange(move.topX,move.topY,this.dim.cx1,this.dim.cy1,this.dim.cw,this.dim.ch)){
			this.firstBlock.findBestFit();
		}
	}
	if(move.returnsValue){	
		if(move.rInRange(move.topX,move.topY,move.width,move.height,this.dim.rx1,this.dim.ry1,this.dim.rw,this.dim.rh)){
			this.firstBlock.findBestFit();
		}
	}
}
BlockStack.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y);
}
BlockStack.prototype.stop=function(){
	if(this.isRunning){
		this.firstBlock.stop();
		this.endRun();
	}
}
BlockStack.prototype.updateRun=function(){
	if(this.isRunning){
		if(this.returnType==Block.returnTypes.none){
			if(this.currentBlock.stack!=this){ //If the current Block has been removed, don't run it.
				this.endRun();
				return this.isRunning;
			}
			if(!this.currentBlock.updateRun()){
				this.currentBlock=this.currentBlock.nextBlock;
			}
			if(this.currentBlock==null){
				this.endRun();
			}
		}
		else{
			if(this.currentBlock.updateRun()){
				GuiElements.displayValue(this.currentBlock.getValue());
				this.endRun();
			}
		}
	}
	return this.isRunning;
}
BlockStack.prototype.startRun=function(startBlock){
	if(startBlock==null){
		startBlock=this.firstBlock;
	}
	if(!this.isRunning){
		this.isRunning=true;
		this.currentBlock=startBlock;
		this.firstBlock.glow();
		this.tab.startRun();
	}
};
BlockStack.prototype.endRun=function(){
	this.isRunning=false;
	this.firstBlock.stopGlow();
};
BlockStack.prototype.findBestFitTop=function(){
	var snap=BlockGraphics.command.snap;
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.firstBlock.getAbsX();
	var y=this.firstBlock.getAbsY();
	if(move.pInRange(move.topX,move.topY+move.height,x-snap.left,y-snap.top,snap.left+snap.right,snap.top+this.firstBlock.height+snap.bottom)){
		var xDist=move.topX-x;
		var yDist=(move.topY+move.height)-y;
		var dist=xDist*xDist+yDist*yDist;
		if(!fit.found||dist<fit.dist){
			fit.found=true;
			fit.bestFit=this;
			fit.dist=dist;
		}
	}
}
BlockStack.prototype.snap=function(block){
	if(this.isRunning&&!block.stack.isRunning){
		block.glow();
	}
	else if(!this.isRunning&&block.stack.isRunning){ //Blocks that are added are stopped.
		block.stack.stop();
	}
	else if(this.isRunning&&block.isRunning){ //The added block is stopped, but still glows as part of a running stack.
		block.stop();
	}
	this.move(this.x,this.y-block.stack.dim.rh);
	
	var topStackBlock=block;
	var bottomStackBlock=block.getLastBlock();
	var upperBlock=this.firstBlock;
	
	this.firstBlock=topStackBlock;
	topStackBlock.parent=null;
	bottomStackBlock.nextBlock=upperBlock;
	upperBlock.parent=bottomStackBlock;
	
	var oldG=block.stack.group;
	block.stack.remove();
	block.changeStack(this);
	oldG.remove();
	
	this.updateDim();
}
BlockStack.prototype.highlight=function(){
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),0,0,0,false,this.isRunning);
}
BlockStack.prototype.shiftOver=function(x,y){
	this.move(this.x+x,this.y+y);
}
BlockStack.prototype.duplicate=function(x,y,group){
	var firstCopyBlock=this.firstBlock.duplicate(x,y);
	var copyStack=new BlockStack(firstCopyBlock,this.tab);
	return copyStack;
}
BlockStack.prototype.getTab=function(){
	return this.tab;
}
BlockStack.prototype.getSprite=function(){
	return this.tab.getSprite();
}
BlockStack.prototype.fly=function(){
	this.group.remove();
	GuiElements.layers.drag.appendChild(this.group);
	this.flying=true;
}
BlockStack.prototype.land=function(){
	this.group.remove();
	this.tabGroup.appendChild(this.group);
	this.flying=false;
}
BlockStack.prototype.remove=function(){
	this.tab.removeStack(this);
}
BlockStack.prototype.delete=function(){
	this.stop();
	this.group.remove();
	this.remove();
}
BlockStack.prototype.eventFlagClicked=function(){
	if(!this.isRunning){
		this.firstBlock.eventFlagClicked();
	}
}