function BubbleOverlay(color, margin, innerGroup, parent){
	this.bgColor=color;
	this.margin=margin;
	this.innerGroup=innerGroup;
	this.parent=parent;
	this.layerG=GuiElements.layers.overlay;
	this.visible=false;
	this.buildBubble();
}
BubbleOverlay.setGraphics=function(){
	BubbleOverlay.triangleW=15;
	BubbleOverlay.triangleH=7;
	BubbleOverlay.minW=25;
};
BubbleOverlay.prototype.buildBubble=function(){
	this.buildGroups();
	this.makeBg();
};
BubbleOverlay.prototype.buildGroups=function(){
	this.group=GuiElements.create.group(0,0);
	this.bgGroup=GuiElements.create.group(0,0,this.group);
	this.group.appendChild(this.innerGroup);
	GuiElements.move.group(this.innerGroup,this.margin,this.margin);
};
BubbleOverlay.prototype.makeBg=function(){
	this.bgRect=GuiElements.create.rect(this.bgGroup);
	GuiElements.update.color(this.bgRect,this.bgColor);
	this.triangle=GuiElements.create.path(this.bgGroup);
	GuiElements.update.color(this.triangle,this.bgColor);
};
BubbleOverlay.prototype.show=function(){
	if(!this.visible) {
		this.layerG.appendChild(this.group);
		this.visible=true;
		GuiElements.overlay.set(this);
	}
};
BubbleOverlay.prototype.hide=function(){
	if(this.visible) {
		this.group.remove();
		this.visible=false;
		GuiElements.overlay.remove(this);
	}
};
BubbleOverlay.prototype.close=function(){
	this.hide();
	this.parent.close();
};
BubbleOverlay.prototype.display=function(x,upperY,lowerY,innerWidth,innerHeight){
	var width=innerWidth+2*this.margin;
	if(width<BubbleOverlay.minW){
		width=BubbleOverlay.minW;
	}
	var height=innerHeight+2*this.margin;
	GuiElements.move.group(this.innerGroup,(width-innerWidth)/2,(height-innerHeight)/2);

	var triOffset=(width-BubbleOverlay.triangleW)/2;
	var halfOffset=width/2;
	var tallH=height+BubbleOverlay.triangleH;

	var arrowDown=(lowerY+tallH>GuiElements.height);
	var yCoord=lowerY+BubbleOverlay.triangleH;
	var xCoord=x-halfOffset;
	var arrowDir=1;
	var arrowX=triOffset;
	var arrowY=0;
	if(arrowDown){
		arrowDir=-1;
		yCoord=upperY-tallH;
		arrowY=height;
	}
	if(xCoord<0){
		arrowX+=xCoord;
		xCoord=0;
	}
	if(xCoord+width>GuiElements.width){
		arrowX=width+x-GuiElements.width-BubbleOverlay.triangleW/2;
		xCoord=GuiElements.width-width;
	}
	GuiElements.move.group(this.group,xCoord,yCoord);
	GuiElements.update.triangle(this.triangle,arrowX,arrowY,BubbleOverlay.triangleW,BubbleOverlay.triangleH*arrowDir);
	GuiElements.update.rect(this.bgRect,0,0,width,height);
	this.show();
};