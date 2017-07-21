/**
 * Created by Tom on 6/13/2017.
 */

function RowDialog(autoHeight, title, rowCount, extraTop, extraBottom, extendTitleBar){
	if(extendTitleBar == null){
		extendTitleBar = 0;
	}
	this.autoHeight = autoHeight;
	this.title = title;
	this.rowCount = rowCount;
	this.centeredButtons = [];
	this.extraTopSpace = extraTop;
	this.extraBottomSpace = extraBottom;
	this.extendTitleBar = extendTitleBar;
	this.visible = false;
	this.hintText = "";
}
RowDialog.setConstants=function(){
	RowDialog.currentDialog=null;

	RowDialog.titleBarColor=Colors.lightGray;
	RowDialog.titleBarFontC=Colors.white;
	RowDialog.bgColor=Colors.black;
	RowDialog.centeredBnWidth=100;
	RowDialog.bnHeight=MenuBnList.bnHeight;
	RowDialog.bnMargin=5;
	RowDialog.titleBarH = RowDialog.bnHeight + RowDialog.bnMargin;
	RowDialog.minWidth = 400;
	RowDialog.minHeight = 400;
	RowDialog.hintMargin = 5;

	RowDialog.titleBarFont = Font.uiFont(16).bold();
	RowDialog.hintTextFont = Font.uiFont(16);
	RowDialog.centeredfontWeight="bold";
	RowDialog.smallBnWidth = 45;
	RowDialog.iconH = 15;
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
		if(RowDialog.currentDialog != null && RowDialog.currentDialog !== this){
			RowDialog.currentDialog.closeDialog();
		}
		RowDialog.currentDialog=this;
		this.calcHeights();
		this.calcWidths();
		this.x = GuiElements.width / 2 - this.width / 2;
		this.y = GuiElements.height / 2 - this.height / 2;
		this.group = GuiElements.create.group(this.x, this.y);
		this.bgRect = this.drawBackground();

		this.titleRect = this.createTitleRect();
		this.titleText = this.createTitleLabel(this.title);

		this.rowGroup = this.createContent();
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
	let minHeight = Math.max(GuiElements.height / 1.5, RD.minHeight);
	let ScrollHeight = this.rowCount * (RD.bnMargin + RD.bnHeight) - RD.bnMargin;
	let totalHeight = nonScrollHeight + ScrollHeight;
	if(!this.autoHeight) totalHeight = 0;
	this.height = Math.min(Math.max(minHeight, totalHeight), GuiElements.height);
	this.centeredButtonY = this.height - centeredBnHeight + RD.bnMargin;
	this.innerHeight = ScrollHeight;
	this.scrollBoxHeight = Math.min(this.height - nonScrollHeight, ScrollHeight);
	this.scrollBoxY = RD.bnMargin + RD.titleBarH + this.extraTopSpace;
	this.extraTopY = RD.titleBarH;
	this.extraBottomY = this.height - centeredBnHeight - this.extraBottomSpace + RD.bnMargin;
};
RowDialog.prototype.calcWidths=function(){
	var RD = RowDialog;
	let thirdWidth = GuiElements.width / 2;
	this.width = Math.min(GuiElements.width, Math.max(thirdWidth, RD.minWidth));
	this.scrollBoxWidth = this.width - 2 * RD.bnMargin;
	this.scrollBoxX = RD.bnMargin;
	this.centeredButtonX = this.width / 2 - RD.centeredBnWidth / 2;
	this.contentWidth = this.width - RD.bnMargin * 2;
};
RowDialog.prototype.drawBackground = function(){
	let rect = GuiElements.draw.rect(0, 0, this.width, this.height, RowDialog.bgColor);
	this.group.appendChild(rect);
	return rect;
};
RowDialog.prototype.createTitleRect=function(){
	var RD=RowDialog;
	var rect=GuiElements.draw.rect(0,0,this.width,RD.titleBarH + this.extendTitleBar,RD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
RowDialog.prototype.createTitleLabel=function(title){
	var RD=RowDialog;
	var textE=GuiElements.draw.text(0,0,title,RD.titleBarFont,RD.titleBarFontC);
	var x=this.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=RD.titleBarH/2+RD.titleBarFont.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
RowDialog.prototype.createContent = function(){
	var RD = RowDialog;
	let y = 0;
	var rowGroup = GuiElements.create.group(0, 0);
	if(this.rowCount > 0) {
		for (let i = 0; i < this.rowCount; i++) {
			this.createRow(i, y, this.contentWidth, rowGroup);
			y += RD.bnHeight + RD.bnMargin;
		}
	}
	else if(this.hintText != "") {
		this.createHintText();
	}
	return rowGroup;
};
RowDialog.prototype.createRow = function(index, y, width, contentGroup){
	
};
RowDialog.prototype.createCenteredBns = function(){
	var RD = RowDialog;
	let y = this.centeredButtonY;
	this.centeredButtonEs = [];
	for(let i = 0; i < this.centeredButtons.length; i++){
		let bn = this.createCenteredBn(y, this.centeredButtons[i]);
		this.centeredButtonEs.push(bn);
		y += RD.bnHeight + RD.bnMargin;
	}
};
RowDialog.prototype.createCenteredBn = function(y, entry){
	var RD = RowDialog;
	var button = new Button(this.centeredButtonX, y, RD.centeredBnWidth, RD.bnHeight, this.group);
	button.addText(entry.text, null, null, RD.centeredfontWeight);
	button.setCallbackFunction(entry.callbackFn, true);
	return button;
};
RowDialog.prototype.createScrollBox = function(){
	if(this.rowCount === 0) return null;
	let x = this.x + this.scrollBoxX;
	let y = this.y + this.scrollBoxY;
	return new SmoothScrollBox(this.rowGroup, GuiElements.layers.frontScroll, x, y,
		this.scrollBoxWidth, this.scrollBoxHeight, this.scrollBoxWidth, this.innerHeight);
};
RowDialog.prototype.createHintText = function(){
	var RD = RowDialog;
	this.hintTextE = GuiElements.draw.text(0, 0, "", RD.hintTextFont, RD.titleBarFontC);
	GuiElements.update.textLimitWidth(this.hintTextE, this.hintText, this.width);
	let textWidth = GuiElements.measure.textWidth(this.hintTextE);
	let x = this.width / 2 - textWidth / 2;
	let y = this.scrollBoxY + RD.hintTextFont.charHeight + RD.hintMargin;
	GuiElements.move.text(this.hintTextE, x, y);
	this.group.appendChild(this.hintTextE);
};
RowDialog.prototype.closeDialog = function(){
	if(this.visible) {
		this.hide();
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
RowDialog.updateZoom = function(){
	if(RowDialog.currentDialog != null){
		RowDialog.currentDialog.updateZoom();
	}
};
RowDialog.prototype.hide = function(){
	if(this.visible) {
		this.visible = false;
		this.group.remove();
		if (this.scrollBox != null) {
			this.scrollBox.hide();
		}
		this.scrollBox = null;
		if(RowDialog.currentDialog === this) {
			RowDialog.currentDialog = null;
		}
	}
};
RowDialog.prototype.reloadRows = function(rowCount){
	this.rowCount = rowCount;
	if(this.visible) {
		let scroll = this.getScroll();
		this.hide();
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
RowDialog.prototype.addHintText = function(hintText){
	this.hintText = hintText;
};
RowDialog.prototype.getExtraTopY = function(){
	return this.extraTopY;
};
RowDialog.prototype.getExtraBottomY = function(){
	return this.extraBottomY;
};
RowDialog.prototype.getContentWidth = function(){
	return this.contentWidth;
};
RowDialog.prototype.getCenteredButton = function(i){
	return this.centeredButtonEs[i];
};
RowDialog.prototype.contentRelToAbsX = function(x){
	if(!this.visible) return x;
	return this.scrollBox.relToAbsX(x);
};
RowDialog.prototype.contentRelToAbsY = function(y){
	if(!this.visible) return y;
	return this.scrollBox.relToAbsY(y);
};
RowDialog.createMainBn = function(bnWidth, x, y, contentGroup, callbackFn){
	var RD = RowDialog;
	var button = new Button(x, y, bnWidth, RD.bnHeight, contentGroup);
	if(callbackFn != null) {
		button.setCallbackFunction(callbackFn, true);
	}
	button.makeScrollable();
	return button;
};
RowDialog.createMainBnWithText = function(text, bnWidth, x, y, contentGroup, callbackFn){
	var button = RowDialog.createMainBn(bnWidth, x, y, contentGroup, callbackFn);
	button.addText(text);
	return button;
};
RowDialog.createSmallBn = function(x, y, contentGroup, callbackFn){
	var RD = RowDialog;
	var button = new Button(x, y, RD.smallBnWidth, RD.bnHeight, contentGroup);
	if(callbackFn != null) {
		button.setCallbackFunction(callbackFn, true);
	}
	button.makeScrollable();
	return button;
};
RowDialog.createSmallBnWithIcon = function(iconId, x, y, contentGroup, callbackFn){
	let RD = RowDialog;
	let button = RowDialog.createSmallBn(x, y, contentGroup, callbackFn);
	button.addIcon(iconId, RD.iconH);
	return button;
};
