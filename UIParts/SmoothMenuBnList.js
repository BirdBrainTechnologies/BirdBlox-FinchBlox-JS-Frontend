/**
 * Created by Tom on 6/5/2017.
 */

function SmoothMenuBnList(parent, parentGroup,x,y,width){
	this.x=x;
	this.y=y;
	this.width=width;
	if(width==null){
		this.width=null;
	}
	this.height=0;
	this.bnHeight=SmoothMenuBnList.bnHeight;
	this.bnMargin=Button.defaultMargin;
	this.bnsGenerated=false;
	this.bnTextList=[];
	this.bnFunctionsList=[];
	this.bns=null;

	this.build();
	this.parentGroup=parentGroup;
	this.parent = parent;

	this.visible=false;
	this.isOverlayPart=false;
	this.internalHeight=0;

	this.maxHeight=null;

	this.scrolling=false;
	this.scrollYOffset=0;
	this.scrollY=0;
	this.scrollable=false;

}
SmoothMenuBnList.setGraphics=function(){
	var SMBL=SmoothMenuBnList;
	SMBL.bnHeight=34; //25
	SMBL.bnHMargin=10; //only used when width not specified.
	SMBL.minWidth=40;
};
SmoothMenuBnList.prototype.build = function(){
	//this.foreignObject = GuiElements.create.foreignObject();
	this.scrollDiv = GuiElements.create.scrollDiv();
	TouchReceiver.addListenersSmoothMenuBnListScrollRect(this.scrollDiv, this);
	this.svg = GuiElements.create.svg(this.scrollDiv);
	this.zoomG = GuiElements.create.group(0, 0, this.svg);
};
SmoothMenuBnList.prototype.setMaxHeight=function(maxHeight){
	this.maxHeight=maxHeight;
};
SmoothMenuBnList.prototype.addOption=function(text,func){
	this.bnsGenerated=false;
	this.bnTextList.push(text);
	if(func==null){
		this.bnFunctionsList.push(null);
	}
	else{
		this.bnFunctionsList.push(func);
	}
};
SmoothMenuBnList.prototype.show=function(){
	this.generateBns();
	if(!this.visible){
		this.visible=true;
		GuiElements.layers.div.appendChild(this.scrollDiv);
		this.updatePosition();
		if(GuiElements.isIos && this.scrollable) {
			this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv);
		}
	}
};
SmoothMenuBnList.prototype.hide=function(){
	if(this.visible){
		this.visible=false;
		GuiElements.layers.div.removeChild(this.scrollDiv);
		if(this.fixScrollTimer != null) {
			window.clearInterval(this.fixScrollTimer);
		}
	}
};
SmoothMenuBnList.prototype.generateBns=function(){
	var columns=1;
	this.computeWidth();
	if(!this.bnsGenerated){
		this.clearBnsArray();
		var currentY=0;
		var currentX=0;
		var column=0;
		var count=this.bnTextList.length;
		var bnWidth=0;
		for(var i=0;i<count;i++){
			if(column==columns){
				column=0;
				currentX=0;
				currentY+=this.bnHeight+this.bnMargin;
			}
			if(column==0) {
				bnWidth = (this.width + this.bnMargin) / columns - this.bnMargin;
				var remainingBns=count-i;
				if(remainingBns<columns){
					bnWidth=(this.width+this.bnMargin)/remainingBns-this.bnMargin;
				}
			}
			this.bns.push(this.generateBn(currentX,currentY,bnWidth,this.bnTextList[i],this.bnFunctionsList[i]));
			currentX+=bnWidth+this.bnMargin;
			column++;
		}
		currentY+=this.bnHeight;
		this.internalHeight=currentY;
		if(count==0){
			this.internalHeight=0;
		}
		this.height=this.internalHeight;
		if(this.maxHeight!=null){
			this.height=Math.min(this.internalHeight,this.maxHeight);
		}
		this.scrollable=this.height!=this.internalHeight;
		this.bnsGenerated=true;
		this.updatePosition();
	}
};
SmoothMenuBnList.prototype.computeWidth=function(){
	if(this.width==null) {
		var columns = 1;
		var MBL = MenuBnList;
		var longestW = 0;
		for (var i = 0; i < this.bnTextList.length; i++) {
			var currentW = GuiElements.measure.stringWidth(this.bnTextList[i], Button.defaultFont, Button.defaultFontSize, Button.defaultFontWeight);
			if (currentW > longestW) {
				longestW = currentW;
			}
		}
		this.width = columns * longestW + columns * 2 * MBL.bnHMargin + (columns - 1) * this.bnMargin;
		if (this.width < MBL.minWidth) {
			this.width = MBL.minWidth;
		}
	}
};
SmoothMenuBnList.prototype.isEmpty=function(){
	return this.bnTextList.length==0;
};
SmoothMenuBnList.prototype.clearBnsArray=function(){
	if(this.bns!=null){
		for(var i=0;i<this.bns.length;i++){
			this.bns[i].remove();
		}
	}
	this.bns=[];
};
SmoothMenuBnList.prototype.generateBn=function(x,y,width,text,func){
	var bn=new Button(x,y,width,this.bnHeight,this.zoomG);
	bn.addText(text);
	bn.setCallbackFunction(func,true);
	bn.isOverlayPart=this.isOverlayPart;
	bn.smoothMenuBnList=this;
	return bn;
};
SmoothMenuBnList.prototype.updatePosition = function(){
	if(this.visible) {
		//Compensates for a WebKit bug which prevents transformations from moving foreign objects
		var realX = this.parent.relToAbsX(this.x);
		var realY = this.parent.relToAbsY(this.y);
		realX = GuiElements.relToAbsX(realX);
		realY = GuiElements.relToAbsY(realY);
		var zoom = GuiElements.zoomFactor;

		GuiElements.update.smoothScrollBnList(this.scrollDiv, this.svg, this.zoomG, realX, realY, this.width,
			this.height, this.internalHeight, zoom, this.scrollable);
	}
};
SmoothMenuBnList.prototype.updateZoom = function(){
	this.updatePosition();
};
SmoothMenuBnList.prototype.getScroll = function(){
	if(!this.visible) return 0;
	return this.scrollDiv.scrollTop;
};
SmoothMenuBnList.prototype.setScroll = function(scrollTop){
	if(!this.visible) return;
	scrollTop = Math.max(0, scrollTop);
	var height = parseInt(window.getComputedStyle(this.scrollDiv).getPropertyValue('height'), 10);
	scrollTop = Math.min(this.scrollDiv.scrollHeight - height, scrollTop);
	this.scrollDiv.scrollTop = scrollTop;
};