function BubbleOverlay(color, margin, innerGroup, parent, hMargin){
	if(hMargin==null){
		hMargin=0;
	}
	this.bgColor=color;
	this.margin=margin;
	this.hMargin=hMargin;
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
	BubbleOverlay.overlap=1;
};
BubbleOverlay.prototype.buildBubble=function(){
	this.buildGroups();
	this.makeBg();
};
BubbleOverlay.prototype.buildGroups=function(){
	this.group=GuiElements.create.group(0,0);
	TouchReceiver.addListenersOverlayPart(this.group);
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
	var BO=BubbleOverlay;
	var width=innerWidth+2*this.margin;
	if(width<BO.minW){
		width=BO.minW;
	}
	var height=innerHeight+2*this.margin;
	GuiElements.move.group(this.innerGroup,(width-innerWidth)/2,(height-innerHeight)/2);

	var triOffset=(width-BO.triangleW)/2;
	var halfOffset=width/2;
	var tallH=height+BO.triangleH;

	var arrowDown=(lowerY+tallH>GuiElements.height);
	var yCoord=lowerY+BO.triangleH;
	var xCoord=x-halfOffset;
	var arrowDir=1;
	var arrowX=triOffset;
	var arrowY=BO.overlap;
	if(arrowDown){
		arrowDir=-1;
		yCoord=upperY-tallH;
		arrowY=height-BO.overlap;
	}
	if(xCoord<this.hMargin){
		arrowX+=xCoord-this.hMargin;
		xCoord=this.hMargin;
	}
	if(xCoord+width>GuiElements.width-this.hMargin){
		arrowX=width+x-GuiElements.width-BO.triangleW/2+this.hMargin;
		xCoord=GuiElements.width-width-this.hMargin;
	}
	if(arrowX<0){
		arrowX=0;
	}
	if(arrowX>width-BubbleOverlay.triangleW){
		arrowX=width-BubbleOverlay.triangleW;
	}
	GuiElements.move.group(this.group,xCoord,yCoord);
	GuiElements.update.triangle(this.triangle,arrowX,arrowY,BO.triangleW,(BO.triangleH+BO.overlap)*arrowDir);
	GuiElements.update.rect(this.bgRect,0,0,width,height);
	this.show();
};
BubbleOverlay.prototype.getVPadding=function() {
	return this.margin*2+BubbleOverlay.triangleH;
};