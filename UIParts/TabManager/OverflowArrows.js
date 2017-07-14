function OverflowArrows(){
	var OA = OverflowArrows;
	this.group = GuiElements.create.group(0, 0);
	this.triTop = this.makeTriangle();
	this.triLeft = this.makeTriangle();
	this.triRight = this.makeTriangle();
	this.triBottom = this.makeTriangle();
	this.setArrowPos();
	this.visible = false;
}
OverflowArrows.prototype.makeTriangle=function(){
	var OA = OverflowArrows;
	var tri = GuiElements.create.path();
	GuiElements.update.color(tri, Colors.white);
	GuiElements.update.opacity(tri, OA.opacity);
	GuiElements.makeClickThrough(tri);
	return tri;
};
OverflowArrows.setConstants=function(){
	var OA = OverflowArrows;
	OA.triangleW = 25;
	OA.triangleH = 15;
	OA.margin = 15;
	OA.opacity = 0.5;
};
OverflowArrows.prototype.setArrows=function(left, right, top, bottom){
	if(left == right) {
		this.showIfTrue(this.triLeft, false);
		this.showIfTrue(this.triRight, false);
	}
	else{
		this.showIfTrue(this.triLeft, left < this.left);
		this.showIfTrue(this.triRight, right > this.right);
	}
	if(top == bottom){
		this.showIfTrue(this.triTop, false);
		this.showIfTrue(this.triBottom, false);
	}
	else {
		this.showIfTrue(this.triTop, top < this.top);
		this.showIfTrue(this.triBottom, bottom > this.bottom);
	}
};
OverflowArrows.prototype.showIfTrue=function(tri,shouldShow){
	if(shouldShow){
		this.group.appendChild(tri);
	} else{
		tri.remove();
	}
};
OverflowArrows.prototype.show=function(){
	if(!this.visible) {
		this.visible = true;
		GuiElements.layers.overflowArr.appendChild(this.group);
	}
};
OverflowArrows.prototype.hide=function(){
	if(this.visible){
		this.visible = false;
		this.group.remove();
	}
};
OverflowArrows.prototype.updateZoom=function(){
	this.setArrowPos();
};
OverflowArrows.prototype.setArrowPos=function(){
	var OA = OverflowArrows;
	this.left = BlockPalette.width;
	if(!GuiElements.paletteLayersVisible) {
		this.left = 0;
	}
	this.top = TitleBar.height;
	this.right = GuiElements.width;
	this.bottom = GuiElements.height;
	this.midX = (this.left + this.right) / 2;
	this.midY = (this.top + this.bottom) / 2;

	GuiElements.update.triangleFromPoint(this.triTop, this.midX, this.top + OA.margin, OA.triangleW, OA.triangleH, true);
	GuiElements.update.triangleFromPoint(this.triLeft, this.left + OA.margin, this.midY, OA.triangleW, OA.triangleH, false);
	GuiElements.update.triangleFromPoint(this.triRight, this.right - OA.margin, this.midY, OA.triangleW, -OA.triangleH, false);
	GuiElements.update.triangleFromPoint(this.triBottom, this.midX, this.bottom - OA.margin, OA.triangleW, -OA.triangleH, true);
};