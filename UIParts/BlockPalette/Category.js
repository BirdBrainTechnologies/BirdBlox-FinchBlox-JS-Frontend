function Category(buttonX,buttonY, name, id){
	this.buttonX=buttonX;
	this.buttonY=buttonY;
	this.x=0;
	this.y=TitleBar.height+BlockPalette.catH;
	/* this.maxX=this.x;
	this.maxY=this.y; */
	this.group = GuiElements.create.group(0,0);
	this.smoothScrollBox = new SmoothScrollBox(this.group, GuiElements.layers.paletteScroll, 0, BlockPalette.y,
		BlockPalette.width, BlockPalette.height, 0, 0);
	/*
	TouchReceiver.createScrollFixTimer(this.scrollDiv);
	this.contentSvg = GuiElements.create.svg(this.scrollDiv);
	this.contentGroup = GuiElements.create.group(0,BlockPalette.y, this.contentSvg);
	*/
	this.id=id;
	this.name=name;
	this.currentBlockX=BlockPalette.mainHMargin;
	this.currentBlockY=BlockPalette.mainVMargin;
	this.lastHadStud=false;
	this.button=this.createButton();
	this.blocks=new Array();
	this.displayStacks=new Array();
	this.buttons=new Array();
	this.buttonsThatRequireFile = [];
	this.labels=new Array();
	this.collapsibleSets = [];
	this.finalized = false;
	this.fillGroup();
	this.scrolling=false;
	this.scrollXOffset=0;
	this.scrollYOffset=0;
}
Category.prototype.createButton=function(){
	return new CategoryBN(this.buttonX,this.buttonY,this);
};
Category.prototype.fillGroup=function(){
	BlockList["populateCat_"+this.id](this);
};
Category.prototype.clearGroup=function(){
	this.displayStacks.forEach(function(stack) {
		stack.delete();
	});
	this.blocks = [];
	this.displayStacks = [];

	this.buttons.forEach(function(button){
		button.remove();
	});
	this.buttons = [];

	this.labels.forEach(function(label){
		label.remove();
	});
	this.labels = [];

	this.collapsibleSets.forEach(function(set){
		set.remove();
	});
	this.collapsibleSets = [];

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
	var displayStack=new DisplayStack(block,this.group,this);
	this.displayStacks.push(displayStack);
	var height=displayStack.firstBlock.height;
	this.currentBlockY+=height;
	this.currentBlockY+=BlockPalette.blockMargin;
	this.lastHadStud=false;
	if(block.bottomOpen){
		this.lastHadStud=true;
	}
};
Category.prototype.addCollapsibleSet = function(nameIdList){
	const x = this.currentBlockX;
	const y = this.currentBlockY;
	const set = new CollapsibleSet(y, nameIdList, this, this.group);
	this.collapsibleSets.push(set);
	this.lastHadStud = false;
	this.currentBlockY += set.height;
	this.currentBlockY += BlockPalette.blockMargin;
	return set;
};

Category.prototype.fileOpened = function(){
	this.buttonsThatRequireFile.forEach(function(button){
		button.enable();
	});
};
Category.prototype.fileClosed = function(){
	this.buttonsThatRequireFile.forEach(function(button){
		button.disable();
	});
};

Category.prototype.addSpace=function(){
	this.currentBlockY+=BlockPalette.sectionMargin;
};
Category.prototype.addButton=function(text,callback,onlyActiveIfOpen){
	if(onlyActiveIfOpen == null) {
		onlyActiveIfOpen = false;
	}

	var width = BlockPalette.insideBnW;
	var height = BlockPalette.insideBnH;
	if(this.lastHadStud){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
	}
	var button=new Button(this.currentBlockX,this.currentBlockY,width,height,this.group);
	var BP=BlockPalette;
	button.addText(text);
	button.setCallbackFunction(callback,true);
	this.currentBlockY+=height;
	this.currentBlockY+=BlockPalette.blockMargin;
	this.buttons.push(button);
	this.lastHadStud=false;
	if(onlyActiveIfOpen && !SaveManager.fileIsOpen()){
		button.disable();
		this.buttonsThatRequireFile.push(button);
	}
};
Category.prototype.addLabel=function(text){
	var BP=BlockPalette;
	var x=this.currentBlockX;
	var y=this.currentBlockY;
	var labelE = GuiElements.draw.text(x,y,text,BP.labelFontSize,BP.labelColor,BP.labelFont);
	this.group.appendChild(labelE);
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
	this.finalized = true;
	this.height=this.currentBlockY;
	this.updateWidth();
	//this.updateSmoothScrollSet();
};

Category.prototype.select=function(){
	if(BlockPalette.selectedCat==this){
		return;
	}
	if(BlockPalette.selectedCat!=null){
		BlockPalette.selectedCat.deselect();
	}
	BlockPalette.selectedCat=this;
	this.button.select();
	this.smoothScrollBox.show();
};
Category.prototype.deselect=function(){
	BlockPalette.selectedCat=null;
	this.smoothScrollBox.hide();
	this.button.deselect();
};
Category.prototype.computeWidth = function(){
	var currentWidth=0;
	for(var i=0;i<this.blocks.length;i++){
		var blockW=this.blocks[i].width;
		if(blockW>currentWidth){
			currentWidth=blockW;
		}
	}
	this.collapsibleSets.forEach(function(set){
		const width = set.width;
		currentWidth = Math.max(width, currentWidth);
	});
	this.width=Math.max(currentWidth+2*BlockPalette.mainHMargin, BlockPalette.width);
};
Category.prototype.updateWidth=function(){
	if(!this.finalized) return;
	this.computeWidth();
	this.smoothScrollBox.setContentDims(this.width, this.height);
};
Category.prototype.updateDimSet = function(){
	if(!this.finalized) return;
	this.computeWidth();
	let currentH = BlockPalette.mainVMargin;
	this.collapsibleSets.forEach(function(set){
		currentH += set.height;
		currentH += BlockPalette.blockMargin;
	});
	currentH-=BlockPalette.blockMargin;
	currentH+=BlockPalette.mainVMargin;
	this.height = currentH;
	this.smoothScrollBox.setContentDims(this.width, this.height);
};
Category.prototype.relToAbsX=function(x){
	if(!this.finalized) return x;
	return this.smoothScrollBox.relToAbsX(x);
};
Category.prototype.relToAbsY=function(y){
	if(!this.finalized) return y;
	return this.smoothScrollBox.relToAbsY(y);
};
Category.prototype.absToRelX=function(x){
	if(!this.finalized) return x;
	return this.smoothScrollBox.absToRelX(x);
};
Category.prototype.absToRelY=function(y){
	if(!this.finalized) return y;
	return this.smoothScrollBox.absToRelY(y);
};
Category.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
Category.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
Category.prototype.passRecursivelyDown = function(message){
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	this.passRecursively.apply(this, arguments);
};
Category.prototype.passRecursively = function(functionName){
	const args = Array.prototype.slice.call(arguments, 1);
	this.displayStacks.forEach(function(stack){
		stack[functionName].apply(stack,args);
	});
	this.collapsibleSets.forEach(function(set){
		set[functionName].apply(set,args);
	});
};
Category.prototype.updateZoom = function(){
	if(!this.finalized) return;
	this.smoothScrollBox.move(0, BlockPalette.y);
	this.smoothScrollBox.updateZoom();
	this.smoothScrollBox.setDims(BlockPalette.width, BlockPalette.height);
};
Category.prototype.setSuggestedCollapse = function(id, collapsed) {
	this.collapsibleSets.forEach(function(set){
		set.setSuggestedCollapse(id, collapsed);
	});
};