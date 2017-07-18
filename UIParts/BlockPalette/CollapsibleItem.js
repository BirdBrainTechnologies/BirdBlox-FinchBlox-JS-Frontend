/**
 * Created by Tom on 7/17/2017.
 */
function CollapsibleItem(name, id, collapsibleSet, group) {
	const CI = CollapsibleItem;
	this.x = 0;
	this.name = name;
	this.id = id;
	this.set = collapsibleSet;
	this.group = GuiElements.create.group(0, 0, group);
	this.innerGroup = GuiElements.create.group(0, CI.hitboxHeight);
	this.currentBlockX = BlockPalette.mainHMargin;
	this.currentBlockY = BlockPalette.mainVMargin;
	this.blocks = [];
	this.displayStacks = [];
	this.lastHadStud = false;
	this.finalized = false;
	this.collapsed = true;
	this.suggestedCollapse = true;
	this.createLabel();
}
CollapsibleItem.setConstants = function() {
	const CI = CollapsibleItem;
	CI.hitboxHeight = 25;
	CI.hitboxWidth = BlockPalette.width;

	CI.labelFont = BlockPalette.labelFont;
	CI.labelFontSize = BlockPalette.labelFontSize;
	CI.labelFontCharHeight = BlockPalette.labelFontCharHeight;
	CI.labelColor = BlockPalette.labelColor;

	CI.triBoxWidth = CI.hitboxHeight;
	CI.triangleWidth = 10;
	CI.triangleHeight = 5;
};
CollapsibleItem.prototype.createLabel = function() {
	const CI = CollapsibleItem;
	this.triE = GuiElements.create.path();
	GuiElements.update.color(this.triE, CI.labelColor);
	this.updateTriangle();

	const labelY = (CI.hitboxHeight + CI.labelFontCharHeight) / 2;
	this.label = GuiElements.draw.text(CI.triBoxWidth, labelY, this.name, CI.labelFontSize, CI.labelColor, CI.labelFont);
	this.hitboxE = GuiElements.draw.rect(0, 0, CI.hitboxWidth, CI.hitboxHeight, CI.labelColor);
	GuiElements.update.opacity(this.hitboxE, 0);
	this.group.appendChild(this.label);
	this.group.appendChild(this.triE);
	this.group.appendChild(this.hitboxE);

	TouchReceiver.addListenersCollapsibleItem(this.hitboxE, this);

};
CollapsibleItem.prototype.updateTriangle = function() {
	let vertical = !this.collapsed;
	const CI = CollapsibleItem;
	let pointX;
	let pointY;
	if (!vertical) {
		pointX = (CI.triBoxWidth + CI.triangleHeight) / 2;
		pointY = CI.hitboxHeight / 2;
	} else {
		pointX = CI.triBoxWidth / 2;
		pointY = (CI.hitboxHeight + CI.triangleHeight) / 2;
	}
	return GuiElements.update.triangleFromPoint(this.triE, pointX, pointY, CI.triangleWidth, -CI.triangleHeight, vertical);
};
CollapsibleItem.prototype.addBlockByName=function(blockName){
	const block = new window[blockName](this.currentBlockX, this.currentBlockY);
	this.addBlock(block);
};
CollapsibleItem.prototype.addBlock=function(block){
	this.blocks.push(block);
	if(this.lastHadStud && !block.topOpen){
		this.currentBlockY += BlockGraphics.command.bumpDepth;
		block.move(this.currentBlockX, this.currentBlockY);
	}
	if(block.hasHat){
		this.currentBlockY += BlockGraphics.hat.hatHEstimate;
		block.move(this.currentBlockX, this.currentBlockY);
	}
	const displayStack = new DisplayStack(block, this.innerGroup, this);
	this.displayStacks.push(displayStack);
	this.currentBlockY += displayStack.firstBlock.height;
	this.currentBlockY += BlockPalette.blockMargin;
	this.lastHadStud=false;
	if (block.bottomOpen) {
		this.lastHadStud = true;
	}
};
CollapsibleItem.prototype.addSpace=function(){
	this.currentBlockY += BlockPalette.sectionMargin;
};
CollapsibleItem.prototype.trimBottom=function(){
	if(this.lastHadStud){
		this.currentBlockY += BlockGraphics.command.bumpDepth;
	}
	this.currentBlockY -= BlockPalette.blockMargin;
	this.currentBlockY += BlockPalette.mainVMargin;
};
CollapsibleItem.prototype.finalize = function(){
	this.finalized = true;
	this.innerHeight = this.currentBlockY;
	this.updateWidth();
};
CollapsibleItem.prototype.updateDimAlign = function(newY) {
	this.y = newY;
	GuiElements.move.group(this.group, this.x, this.y);
	return this.getHeight();
};
CollapsibleItem.prototype.getWidth = function(){
	if(this.collapsed) {
		return 0;
	} else {
		return this.innerWidth;
	}
};
CollapsibleItem.prototype.getHeight = function(){
	const CI = CollapsibleItem;
	if(this.collapsed) {
		return CI.hitboxHeight;
	} else {
		return CI.hitboxHeight + this.innerHeight;
	}
};
CollapsibleItem.prototype.computeWidth = function() {
	let currentWidth = 0;
	for(let i = 0; i < this.blocks.length; i++){
		const blockW = this.blocks[i].width;
		if(blockW > currentWidth){
			currentWidth = blockW;
		}
	}
	this.innerWidth = currentWidth;
};
CollapsibleItem.prototype.collapse = function() {
	if(!this.collapsed) {
		this.collapsed = true;
		this.innerGroup.remove();
		this.updateTriangle();
		this.set.updateDimAlign();
	}
};
CollapsibleItem.prototype.expand = function() {
	if(this.collapsed) {
		this.collapsed = false;
		this.group.appendChild(this.innerGroup);
		this.updateTriangle();
		this.set.updateDimAlign();
	}
};
CollapsibleItem.prototype.updateWidth = function() {
	this.computeWidth();
	this.set.updateWidth();
};
CollapsibleItem.prototype.relToAbsX=function(x){
	const CI = CollapsibleItem;
	return this.set.category.relToAbsX(x + this.x);
};
CollapsibleItem.prototype.relToAbsY=function(y){
	const CI = CollapsibleItem;
	return this.set.category.relToAbsY(y + this.y + CI.hitboxHeight);
};
CollapsibleItem.prototype.absToRelX=function(x){
	const CI = CollapsibleItem;
	return this.set.category.absToRelX(x) - this.x;
};
CollapsibleItem.prototype.absToRelY=function(y){
	const CI = CollapsibleItem;
	return this.set.category.absToRelY(y) - this.y - CI.hitboxHeight;
};
CollapsibleItem.prototype.remove = function(){
	this.group.remove();
};
CollapsibleItem.prototype.toggle = function(){
	if(this.collapsed) {
		this.expand();
	} else {
		this.collapse();
	}
};
CollapsibleItem.prototype.setSuggestedCollapse = function(id, collapsed){
	if(id !== this.id) return;
	if(collapsed !== this.suggestedCollapse){
		this.suggestedCollapse = collapsed;
		if(collapsed) {
			this.collapse();
		} else {
			this.expand();
		}
	}
};

CollapsibleItem.prototype.passRecursivelyDown = function(message){
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	this.passRecursively.apply(this, arguments);
};
CollapsibleItem.prototype.passRecursively = function(functionName){
	const args = Array.prototype.slice.call(arguments, 1);
	this.displayStacks.forEach(function(stack){
		stack[functionName].apply(stack,args);
	});
};