function Category(buttonX,buttonY,index){
	this.index=index;
	this.buttonX=buttonX;
	this.buttonY=buttonY;
	this.x=0;
	this.y=TitleBar.height+BlockPalette.catH;
	this.maxX=this.x;
	this.maxY=this.y;
	this.scrollDiv=this.createDiv();
	TouchReceiver.addListenersPalette(this.scrollDiv);
	TouchReceiver.createScrollFixTimer(this.scrollDiv);
	this.contentSvg = GuiElements.create.svg(this.scrollDiv);
	this.contentGroup = GuiElements.create.group(0,BlockPalette.y, this.contentSvg);
	this.id=BlockList.getCatId(index);
	this.name=BlockList.getCatName(index);
	this.currentBlockX=BlockPalette.mainHMargin;
	this.currentBlockY=BlockPalette.mainVMargin;
	this.lastHadStud=false;
	this.button=this.createButton();
	this.blocks=new Array();
	this.displayStacks=new Array();
	this.buttons=new Array();
	this.labels=new Array();
	this.fillGroup();
	this.scrolling=false;
	this.scrollXOffset=0;
	this.scrollYOffset=0;
}
Category.prototype.createButton=function(){
	return new CategoryBN(this.buttonX,this.buttonY,this);
}
Category.prototype.createDiv=function(){
	return GuiElements.create.scrollDiv();
}
Category.prototype.fillGroup=function(){
	BlockList["populateCat_"+this.id](this);
}
Category.prototype.clearGroup=function(){
	for(var i=0;i<this.displayStacks.length;i++){
		this.displayStacks[i].delete();
	}
	this.blocks=new Array();
	this.displayStacks=new Array();
	for(var i=0;i<this.buttons.length;i++){
		this.buttons[i].remove();
	}
	this.buttons=new Array();
	for(var i=0;i<this.labels.length;i++){
		this.contentGroup.removeChild(this.labels[i]);
	}
	this.labels=new Array();
	this.currentBlockX=BlockPalette.mainHMargin;
	this.currentBlockY=BlockPalette.mainVMargin;
	this.lastHadStud=false;
};
Category.prototype.refreshGroup=function(){
	this.clearGroup();
	this.fillGroup();
};
Category.prototype.addBlockByName=function(blockName){
	var block=new window[blockName](this.currentBlockX,this.currentBlockY);
	this.addBlock(block);
};
Category.prototype.addVariableBlock=function(variable){
	var block=new B_Variable(this.currentBlockX,this.currentBlockY,variable);
	this.addBlock(block);
};
Category.prototype.addListBlock=function(list){
	var block=new B_List(this.currentBlockX,this.currentBlockY,list);
	this.addBlock(block);
};
Category.prototype.addBlock=function(block){
	this.blocks.push(block);
	if(this.lastHadStud&&!block.topOpen){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
		block.move(this.currentBlockX,this.currentBlockY);
	}
	if(block.hasHat){
		this.currentBlockY+=BlockGraphics.hat.hatHEstimate;
		block.move(this.currentBlockX,this.currentBlockY);
	}
	var displayStack=new DisplayStack(block,this.contentGroup,this);
	this.displayStacks.push(displayStack);
	var height=displayStack.firstBlock.height;
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
Category.prototype.addButton=function(text,callback){
	var width = BlockPalette.insideBnW;
	var height = BlockPalette.insideBnH;
	if(this.lastHadStud){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
	}
	var button=new Button(this.currentBlockX,this.currentBlockY,width,height,this.contentGroup);
	var BP=BlockPalette;
	button.addText(text,BP.bnDefaultFont,BP.bnDefaultFontSize,"normal",BP.bnDefaultFontCharHeight);
	button.setCallbackFunction(callback,true);
	this.currentBlockY+=height;
	this.currentBlockY+=BlockPalette.blockMargin;
	this.buttons.push(button);
	this.lastHadStud=false;
};
Category.prototype.addLabel=function(text){
	var BP=BlockPalette;
	var x=this.currentBlockX;
	var y=this.currentBlockY;
	var labelE = GuiElements.draw.text(x,y,text,BP.labelFontSize,BP.labelColor,BP.labelFont);
	this.contentGroup.appendChild(labelE);
	this.labels.push(labelE);
	var height=GuiElements.measure.textHeight(labelE);
	GuiElements.move.element(labelE,x,y+height);
	this.currentBlockY+=height;
	this.currentBlockY+=BlockPalette.blockMargin;
	this.lastHadStud=false;
};
Category.prototype.trimBottom=function(){
	if(this.lastHadStud){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
	}
	this.currentBlockY-=BlockPalette.blockMargin;
	this.currentBlockY+=BlockPalette.mainVMargin;
};
Category.prototype.finalize = function(){
	this.height=this.currentBlockY;
	this.updateWidth();
	this.setMinCoords();
	this.updateSmoothScrollSet();
};

Category.prototype.select=function(){
	if(BlockPalette.selectedCat==this){
		return;
	}
	if(BlockPalette.selectedCat!=null){
		BlockPalette.selectedCat.deselect();
	}
	GuiElements.layers.paletteScroll.appendChild(this.scrollDiv);
	BlockPalette.selectedCat=this;
	this.button.select();
}
Category.prototype.deselect=function(){
	BlockPalette.selectedCat=null;
	GuiElements.layers.paletteScroll.removeChild(this.scrollDiv);
	this.button.deselect();
}
/*
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
*/
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
Category.prototype.relToAbsX=function(x){
	return x - this.scrollDiv.scrollLeft / this.currentZoom;
};
Category.prototype.relToAbsY=function(y){
	return y - this.scrollDiv.scrollTop  / this.currentZoom + BlockPalette.y;
};
Category.prototype.absToRelX=function(x){
	return x + this.scrollDiv.scrollLeft;
};
Category.prototype.absToRelY=function(y){
	return y + this.scrollDiv.scrollTop + BlockPalette.y;
};
Category.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
Category.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
Category.prototype.showDeviceDropDowns=function(){
	for(var i=0;i<this.displayStacks.length;i++){
		this.displayStacks[i].showDeviceDropDowns();
	}
};
Category.prototype.hideDeviceDropDowns=function(){
	for(var i=0;i<this.displayStacks.length;i++){
		this.displayStacks[i].hideDeviceDropDowns();
	}
};
Category.prototype.updateZoom = function(){
	var currentScrollX = this.scrollDiv.scrollLeft / this.currentZoom;
	var currentScrollY = this.scrollDiv.scrollTop / this.currentZoom;
	this.updateSmoothScrollSet();
	this.scrollDiv.scrollLeft = currentScrollX * this.currentZoom;
	this.scrollDiv.scrollTop = currentScrollY * this.currentZoom;
};
Category.prototype.updateSmoothScrollSet = function(){
	var y = GuiElements.relToAbsY(BlockPalette.y);
	GuiElements.update.smoothScrollSet(this.scrollDiv, this.contentSvg, this.contentGroup, 0, y, BlockPalette.width, BlockPalette.height, this.height);
	this.currentZoom = GuiElements.zoomFactor;
};