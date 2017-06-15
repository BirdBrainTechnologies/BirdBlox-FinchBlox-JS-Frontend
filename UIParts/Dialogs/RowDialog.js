/**
 * Created by Tom on 6/13/2017.
 */

function RowDialog(autoHeight, title, rowCount, extraTop, extraBottom){
	RowDialog.currentDialog=this;
	this.autoHeight = autoHeight;
	this.title = title;
	this.rowCount = rowCount;
	this.centeredButtons = [];
	this.extraTopSpace = extraTop;
	this.extraBottomSpace = extraBottom;
	this.visible = false;
}
RowDialog.setConstants=function(){
	RowDialog.currentDialog=null;

	RowDialog.titleBarColor=Colors.lightGray;
	RowDialog.titleBarFontC=Colors.white;
	RowDialog.bgColor=Colors.black;
	RowDialog.titleBarH=30;
	RowDialog.centeredBnWidth=100;
	RowDialog.bnHeight=MenuBnList.bnHeight;
	RowDialog.bnMargin=5;
	RowDialog.minWidth = 300;
	RowDialog.minHeight = 200;

	RowDialog.fontSize=16;
	RowDialog.font="Arial";
	RowDialog.fontWeight="normal";
	RowDialog.charHeight=12;
};
RowDialog.prototype.addCenteredButton = function(text, callbackFn){
	let entry = {};
	entry.text = text;
	entry.callbackFn = callbackFn;
	this.centeredButtons.push(entry);
};

RowDialog.prototype.show = function(){
	if(!this.visible) {
		this.visible = true;
		this.calcHeights();
		this.calcWidths();
		this.x = GuiElements.width / 2 - this.width / 2;
		this.y = GuiElements.height / 2 - this.height / 2;
		this.group = GuiElements.create.group(this.x, this.y);
		this.bgRect = this.drawBackground();

		this.titleRect = this.createTitleRect();
		this.titleText = this.createTitleLabel(this.title);

		this.rowGroup = this.createRows();
		this.createCenteredBns();
		this.scrollBox = this.createScrollBox(); // could be null
		if (this.scrollBox != null) {
			this.scrollBox.show();
		}

		GuiElements.layers.overlay.appendChild(this.group);

		GuiElements.blockInteraction();
	}
};
RowDialog.prototype.calcHeights = function(){
	var RD = RowDialog;
	let centeredBnHeight = (RD.bnHeight + RD.bnMargin) * this.centeredButtons.length + RD.bnMargin;
	let nonScrollHeight = RD.titleBarH + centeredBnHeight + RD.bnMargin;
	nonScrollHeight += this.extraTopSpace + this.extraBottomSpace;
	let minHeight = Math.max(GuiElements.height / 2, RD.minHeight);
	let ScrollHeight = this.rowCount * (RowDialog.bnMargin + RowDialog.bnHeight) - RowDialog.bnMargin;
	let totalHeight = nonScrollHeight + ScrollHeight;
	if(!this.autoHeight) totalHeight = 0;
	this.height = Math.min(Math.max(minHeight, totalHeight), GuiElements.height);
	this.centeredButtonY = this.height - centeredBnHeight + RD.bnMargin;
	this.innerHeight = ScrollHeight;
	this.scrollBoxHeight = Math.min(this.height - nonScrollHeight, ScrollHeight);
	this.scrollBoxY = RD.bnMargin + RD.titleBarH;
};
RowDialog.prototype.calcWidths=function(){
	var RD = RowDialog;
	let thirdWidth = GuiElements.width / 3;
	this.width = Math.min(GuiElements.width, Math.max(thirdWidth, RD.minWidth));
	this.scrollBoxWidth = this.width - 2 * RD.bnMargin;
	this.scrollBoxX = RD.bnMargin;
	this.centeredButtonX = this.width / 2 - RD.centeredBnWidth / 2;
};
RowDialog.prototype.drawBackground = function(){
	let rect = GuiElements.draw.rect(0, 0, this.width, this.height, RowDialog.bgColor);
	this.group.appendChild(rect);
	return rect;
};
RowDialog.prototype.createTitleRect=function(){
	var RD=RowDialog;
	var rect=GuiElements.draw.rect(0,0,this.width,RD.titleBarH,RD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
RowDialog.prototype.createTitleLabel=function(title){
	var RD=RowDialog;
	var textE=GuiElements.draw.text(0,0,title,RD.fontSize,RD.titleBarFontC,RD.font,RD.fontWeight);
	var x=this.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=RD.titleBarH/2+RD.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
RowDialog.prototype.createRows = function(){
	var RD = RowDialog;
	let y = 0;
	var rowGroup = GuiElements.create.group(0, 0);
	for(let i = 0; i < this.rowCount; i++){
		this.createRow(i, y, this.width - RD.bnMargin * 2, rowGroup);
		y += RD.bnHeight + RD.bnMargin;
	}
	return rowGroup;
};
RowDialog.prototype.createRow = function(index, y, width, contentGroup){
	
};
RowDialog.prototype.createCenteredBns = function(){
	var RD = RowDialog;
	let y = this.centeredButtonY;
	for(let i = 0; i < this.centeredButtons.length; i++){
		this.createCenteredBn(y, this.centeredButtons[i]);
		y += RD.bnHeight + RD.bnMargin;
	}
};
RowDialog.prototype.createCenteredBn = function(y, entry){
	var RD = RowDialog;
	var button = new Button(this.centeredButtonX, y, RD.centeredBnWidth, RD.bnHeight, this.group);
	button.addText(entry.text);
	button.setCallbackFunction(entry.callbackFn, true);
};
RowDialog.prototype.createScrollBox = function(){
	if(this.rowCount == 0) return null;
	let x = this.x + this.scrollBoxX;
	let y = this.y + this.scrollBoxY;
	return new SmoothScrollBox(this.rowGroup, GuiElements.layers.frontScroll, x, y,
		this.scrollBoxWidth, this.scrollBoxHeight, this.scrollBoxWidth, this.innerHeight, false);
};
RowDialog.prototype.closeDialog = function(){
	if(this.visible) {
		this.visible = false;
		RowDialog.currentDialog = null;
		this.group.remove();
		if (this.scrollBox != null) {
			this.scrollBox.hide();
		}
		this.scrollBox = null;
		GuiElements.unblockInteraction();
	}
};
RowDialog.prototype.getScroll = function(){
	if(this.scrollBox == null) return 0;
	return this.scrollBox.getScrollY();
};
RowDialog.prototype.setScroll = function(y){
	if(this.scrollBox == null) return;
	this.scrollBox.setScrollY(y);
};
RowDialog.prototype.updateZoom = function(){
	if(this.visible) {
		let scroll = this.getScroll();
		this.closeDialog();
		this.show();
		this.setScroll(scroll);
	}
};
RowDialog.prototype.reloadRows = function(rowCount){
	this.rowCount = rowCount;
	if(this.visible) {
		this.visible = false;
		let scroll = this.getScroll();
		this.group.remove();
		if (this.scrollBox != null) {
			this.scrollBox.hide();
		}
		this.scrollBox = null;
		this.show();
		this.setScroll(scroll);
	}
};
RowDialog.prototype.isScrolling = function(){
	if(this.scrollBox != null){
		return this.scrollBox.isMoving();
	}
	return false;
};