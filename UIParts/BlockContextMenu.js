function BlockContextMenu(block,x,y){
	this.block=block;
	this.x=x;
	this.y=y;
	this.showMenu();
}
BlockContextMenu.setGraphics=function(){
	var BCM=BlockContextMenu;
	BCM.bnMargin=8;
	BCM.bgColor=Colors.black;
	BCM.blockShift=20;
};
BlockContextMenu.prototype.showMenu=function(){
	var BCM=BlockContextMenu;
	this.group=GuiElements.create.group(0,0);
	this.menuBnList=new MenuBnList(this.group,0,0,BCM.bnMargin);
	var func=function(){
		func.BCM.duplicate();
	};
	func.BCM=this;
	this.menuBnList.addOption("Duplicate",func);
	this.menuBnList.isOverlayPart=true;
	this.menuBnList.show();
	this.bubbleOverlay=new BubbleOverlay(BCM.bgColor,BCM.bnMargin,this.group,this);
	this.bubbleOverlay.display(this.x,this.y,this.y,this.menuBnList.width,this.menuBnList.height);
};
BlockContextMenu.prototype.duplicate=function(){
	var BCM=BlockContextMenu;
	var newX=this.block.getAbsX()+BCM.blockShift;
	var newY=this.block.getAbsY()+BCM.blockShift;
	var blockCopy=this.block.duplicate(newX,newY);
	var tab=this.block.stack.tab;
	var copyStack=new BlockStack(blockCopy,tab);
	//copyStack.updateDim();
	this.close();
};
BlockContextMenu.prototype.close=function(){
	this.block=null;
	this.bubbleOverlay.hide();
};