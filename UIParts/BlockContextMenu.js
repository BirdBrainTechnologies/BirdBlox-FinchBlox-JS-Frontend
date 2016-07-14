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
	this.menuBnList.isOverlayPart=true;
	this.addOptions();
	this.menuBnList.show();
	this.bubbleOverlay=new BubbleOverlay(BCM.bgColor,BCM.bnMargin,this.group,this);
	this.bubbleOverlay.display(this.x,this.y,this.y,this.menuBnList.width,this.menuBnList.height);
};
BlockContextMenu.prototype.addOptions=function(){
	if(this.block.stack.isDisplayStack){
		if(this.block.blockTypeName=="B_Variable"){
			var funcRen=function(){
				funcRen.block.renameVar();
				funcRen.BCM.close();
			};
			funcRen.block=this.block;
			funcRen.BCM=this;
			this.menuBnList.addOption("Rename", funcRen);
			var funcDel=function(){
				funcDel.block.deleteVar();
				funcDel.BCM.close();
			};
			funcDel.block=this.block;
			funcDel.BCM=this;
			this.menuBnList.addOption("Delete", funcDel);
		}
		if(this.block.blockTypeName=="B_List"){
			var funcRen=function(){
				funcRen.block.renameLi();
				funcRen.BCM.close();
			};
			funcRen.block=this.block;
			funcRen.BCM=this;
			this.menuBnList.addOption("Rename", funcRen);
			var funcDel=function(){
				funcDel.block.deleteLi();
				funcDel.BCM.close();
			};
			funcDel.block=this.block;
			funcDel.BCM=this;
			this.menuBnList.addOption("Delete", funcDel);
		}
	}
	else {
		var funcDup = function () {
			funcDup.BCM.duplicate();
		};
		funcDup.BCM = this;
		this.menuBnList.addOption("Duplicate", funcDup);
	}
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