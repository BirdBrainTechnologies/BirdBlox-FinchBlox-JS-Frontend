function BlockContextMenu(block,x,y){
	this.block=block;
	this.x=x;
	this.y=y;
	this.showMenu();
}
BlockContextMenu.setGraphics=function(){
	var BCM=BlockContextMenu;
	BCM.bnMargin=Button.defaultMargin;
	BCM.bgColor=Colors.black;
	BCM.blockShift=20;
};
BlockContextMenu.prototype.showMenu=function(){
	var BCM=BlockContextMenu;
	this.group=GuiElements.create.group(0,0);
	this.menuBnList=new MenuBnList(this.group,0,0,BCM.bnMargin);
	let layer = GuiElements.layers.inputPad;
	let overlayType = Overlay.types.inputPad;
	this.bubbleOverlay=new BubbleOverlay(overlayType, BCM.bgColor,BCM.bnMargin,this.group,this,null,layer);
	this.menuBnList.markAsOverlayPart(this.bubbleOverlay);
	this.addOptions();
	this.menuBnList.show();
	this.bubbleOverlay.display(this.x,this.x,this.y,this.y,this.menuBnList.width,this.menuBnList.height);
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
		var BCM = this;
		var funcDup = function () {
			funcDup.BCM.duplicate();
		};
		funcDup.BCM = this;
		this.menuBnList.addOption("Duplicate", funcDup);
		this.menuBnList.addOption("Delete",function(){
			BCM.block.unsnap().delete();
			BCM.close();
		})
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