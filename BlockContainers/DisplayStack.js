function DisplayStack(firstBlock,group,category){
	//this.index=CodeManager.addStack(this); //Universal codeManager needed
	this.firstBlock=firstBlock;
	this.type=firstBlock.type;
	this.x=firstBlock.getAbsX();
	this.y=firstBlock.getAbsY();
	this.group=GuiElements.create.group(this.x,this.y,group);
	this.category=category;
	this.firstBlock.changeStack(this);
	this.dim=function(){};
	this.dim.cw; //Dimensions of regions command blocks can be attached to.
	this.dim.ch;
	this.dim.rw; //Dimensions of regions reporter/predicate blocks can be attached to.
	this.dim.rh;
	this.updateDim();
	this.isRunning=false;
	this.currentBlock=null;
	this.isDisplayStack=true;
	this.move(this.x,this.y);
}
DisplayStack.prototype.updateDim=function() {
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
DisplayStack.prototype.getAbsX=function(){
	return this.x+this.category.getAbsX();
}
DisplayStack.prototype.getAbsY=function(){//Fix
	return this.y+this.category.getAbsY();
}
//DisplayStack.prototype.findBestFit=function()
DisplayStack.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y);
}
DisplayStack.prototype.stop=function(){
	this.firstBlock.stop();
	this.endRun();
}
DisplayStack.prototype.updateRun=function(){
	if(this.type==0){
		this.currentBlock=this.currentBlock.run();
		if(this.currentBlock==null){
			this.endRun();
		}
	}
	else{
		if(this.currentBlock.run()==2){
			GuiElements.displayValue(this.currentBlock.rVal);
			this.endRun();
		}
	}
}
DisplayStack.prototype.startRun=function(){
	this.isRunning=true;
	this.currentBlock=this.firstBlock;
}
DisplayStack.prototype.endRun=function(){
	this.isRunning=false;
}
DisplayStack.prototype.duplicate=function(x,y){
	var tab=TabManager.activeTab;
	var firstCopyBlock=this.firstBlock.duplicate(x,y);
	var copyStack=new BlockStack(firstCopyBlock,tab);
	return copyStack;
}
//DisplayStack.prototype.findBestFitTop=function()
//DisplayStack.prototype.snap=function(block)
//DisplayStack.prototype.highlight=function()
//DisplayStack.prototype.shiftOver=function(x,y)
DisplayStack.prototype.getSprite=function(){
	if(TabManager.activeTab!=null){
		return TabManager.activeTab.getSprite();
	}
	else{
		return null;
	}
}