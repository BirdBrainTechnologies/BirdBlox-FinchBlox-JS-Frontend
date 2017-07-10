/**
 * Created by Tom on 6/5/2017.
 */

function SmoothMenuBnList(parent, parentGroup,x,y,width,layer){
	if(layer == null){
		layer = GuiElements.layers.frontScroll;
	}
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
	this.options = [];
	this.bns=null;

	this.build();
	this.parentGroup=parentGroup;
	this.parent = parent;
	this.layer = layer;

	this.visible=false;
	this.partOfOverlay=null;
	this.internalHeight=0;

	this.maxHeight=null;

	this.scrolling=false;
	this.scrollYOffset=0;
	this.scrollY=0;
	this.scrollable=false;

	this.scrollStatus = {};
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
SmoothMenuBnList.prototype.addOption=function(text,func,icon){
	if(func == null){
		func = null;
	}
	if(icon == null){
		icon = null;
	}

	this.bnsGenerated=false;
	const option = {};
	option.func = func;
	option.text = text;
	option.icon = icon;
	this.options.push(option);
};
SmoothMenuBnList.prototype.show=function(){
	this.generateBns();
	if(!this.visible){
		this.visible=true;
		this.layer.appendChild(this.scrollDiv);
		this.updatePosition();
		this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv, this.scrollStatus);
		TouchReceiver.setInitialScrollFix(this.scrollDiv);
	}
};
SmoothMenuBnList.prototype.hide=function(){
	if(this.visible){
		this.visible=false;
		this.layer.removeChild(this.scrollDiv);
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
		var count=this.options.length;
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
			this.bns.push(this.generateBn(currentX,currentY,bnWidth,this.options[i]));
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
		for (let i = 0; i < this.options.length; i++) {
			const string = this.options[i].text;
			var currentW = GuiElements.measure.stringWidth(string, Button.defaultFont, Button.defaultFontSize, Button.defaultFontWeight);
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
	return this.options.length === 0;
};
SmoothMenuBnList.prototype.clearBnsArray=function(){
	if(this.bns!=null){
		for(let i=0;i<this.bns.length;i++){
			this.bns[i].remove();
		}
	}
	this.bns=[];
};
SmoothMenuBnList.prototype.generateBn=function(x,y,width,option){
	const bn = new Button(x,y,width,this.bnHeight,this.zoomG);
	bn.addText(option.text);
	bn.setCallbackFunction(option.func,true);
	if(option.icon != null){
		bn.addSideTextAndIcon(option.icon, null, option.text);
	}
	bn.partOfOverlay = this.partOfOverlay;
	bn.makeScrollable();
	return bn;
};
SmoothMenuBnList.prototype.updatePosition = function(){
	if(this.visible) {
		//Compensates for a WebKit bug which prevents transformations from moving foreign objects
		var realX = this.parent.relToAbsX(this.x);
		var realY = this.parent.relToAbsY(this.y);
		realX = GuiElements.relToAbsX(realX);
		realY = GuiElements.relToAbsY(realY);

		GuiElements.update.smoothScrollSet(this.scrollDiv, this.svg, this.zoomG, realX, realY, this.width,
			this.height, this.width, this.internalHeight);
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
SmoothMenuBnList.prototype.markAsOverlayPart = function(overlay){
	this.partOfOverlay = overlay;
};
SmoothMenuBnList.prototype.isScrolling = function(){
	if(!this.visible) return false;
	return !this.scrollStatus.still;
};
SmoothMenuBnList.prototype.previewHeight = function(){
	let height = (this.bnHeight + this.bnMargin) * this.options.length - this.bnMargin;
	height = Math.max(height, 0);
	if(this.maxHeight!=null){
		height = Math.min(height, this.maxHeight);
	}
	return height;
};
SmoothMenuBnList.previewHeight = function(count, maxHeight){
	let height = (SmoothMenuBnList.bnHeight + Button.defaultMargin) * count - Button.defaultMargin;
	height = Math.max(height, 0);
	if(maxHeight != null){
		height = Math.min(height, maxHeight);
	}
	return height;
};