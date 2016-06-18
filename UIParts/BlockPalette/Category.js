function Category(buttonX,buttonY,index){
	this.index=index;
	this.buttonX=buttonX;
	this.buttonY=buttonY;
	this.x=0;
	this.y=TitleBar.height+BlockPalette.catH;
	this.maxX=this.x;
	this.maxY=this.y;
	this.group=this.createGroup();
	this.id=BlockList.getCatId(index);
	this.name=BlockList.getCatName(index);
	this.currentBlockX=BlockPalette.mainHMargin;
	this.currentBlockY=BlockPalette.mainVMargin;
	this.lastHadStud=false;
	this.button=this.createButton();
	this.blocks=new Array();
	this.fillGroup();
	this.scrolling=false;
	this.scrollXOffset=0;
	this.scrollYOffset=0;

}
Category.prototype.createButton=function(){
	return new CategoryBN(this.buttonX,this.buttonY,this);
}
Category.prototype.createGroup=function(){
	return GuiElements.create.group(this.x,this.y);
}
Category.prototype.fillGroup=function(){
	BlockList["populateCat_"+this.id](this);
}
Category.prototype.addBlock=function(blockName){
	var block=new window[blockName](this.currentBlockX,this.currentBlockY);
	this.blocks.push(block);
	if(this.lastHadStud&&!block.topOpen){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
		block.move(this.currentBlockX,this.currentBlockY);
	}
	if(block.hasHat){
		this.currentBlockY+=BlockGraphics.hat.hatHEstimate;
		block.move(this.currentBlockX,this.currentBlockY);
	}
	this.displayStack=new DisplayStack(block,this.group,this);
	height=this.displayStack.firstBlock.height;
	this.currentBlockY+=height;
	this.currentBlockY+=BlockPalette.blockMargin;
	this.lastHadStud=false;
	if(block.bottomOpen){
		this.lastHadStud=true;
	}
}
Category.prototype.addSpace=function(){
	this.currentBlockY+=BlockPalette.sectionMargin;
}
Category.prototype.trimBottom=function(){
	if(this.lastHadStud){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
	}
	this.currentBlockY-=BlockPalette.blockMargin;
	this.currentBlockY+=BlockPalette.mainVMargin;
	this.height=this.currentBlockY;
	this.updateWidth();
	this.setMinCoords();
}
Category.prototype.select=function(){
	if(BlockPalette.selectedCat==this){
		return;
	}
	if(BlockPalette.selectedCat!=null){
		BlockPalette.selectedCat.deselect();
	}
	GuiElements.layers.palette.appendChild(this.group);
	BlockPalette.selectedCat=this;
	this.button.select();
}
Category.prototype.deselect=function(){
	BlockPalette.selectedCat=null;
	this.group.remove();
	this.button.deselect();
}
Category.prototype.startScroll=function(x,y){
	if(!this.scrolling) {
		this.scrolling = true;
		this.scrollXOffset = this.x - x;
		this.scrollYOffset = this.y - y;
		this.updateWidth();
		this.setMinCoords();
	}
};
Category.prototype.updateScroll=function(x,y){
	if(this.scrolling) {
		this.scroll(this.scrollXOffset + x, this.scrollYOffset + y);
	}
};
Category.prototype.scroll=function(x,y){
	if(this.scrolling) {
		var minX=Math.min(this.x,this.minX);
		x = Math.max(minX,x);
		x = Math.min(this.maxX,x);
		var minY=Math.min(this.y,this.minY);
		y = Math.max(minY,y);
		y = Math.min(this.maxY,y);
		this.x=x;
		this.y=y;
		GuiElements.move.group(this.group, this.x, this.y);
	}
};
Category.prototype.endScroll=function(){
	this.scrolling=false;
};
Category.prototype.updateWidth=function(){
	var currentWidth=0;
	for(var i=0;i<this.blocks.length;i++){
		var blockW=this.blocks[i].width;
		if(blockW>currentWidth){
			currentWidth=blockW;
		}
	}
	this.width=currentWidth+2*BlockPalette.mainHMargin;
};
Category.prototype.setMinCoords=function(){
	var vScrollRange=this.height-BlockPalette.height;
	this.minY=this.maxY-vScrollRange;
	var hScrollRange=this.width-BlockPalette.width;
	this.minX=this.maxX-hScrollRange;
};
Category.prototype.getAbsX=function(){
	return this.x;
};
Category.prototype.getAbsY=function(){
	return this.y;
};