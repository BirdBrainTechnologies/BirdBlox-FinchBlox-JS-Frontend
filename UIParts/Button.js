function Button(x,y,width,height,parent){
	DebugOptions.validateNumbers(x, y, width, height);
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.parentGroup = parent;
	this.group=GuiElements.create.group(x,y,parent);
	this.buildBg();
	this.pressed=false;
	this.enabled=true;
	this.hasText=false;
	this.hasIcon=false;
	this.hasImage=false;
	this.foregroundInverts=false;
	this.callback=null;
	this.delayedCallback=null;
	this.toggles=false;
	this.toggleFunction=null;
	this.toggled=false;
	this.partOfOverlay=null;
	this.scrollable = false;
}
Button.setGraphics=function(){
	Button.bg=Colors.darkGray;
	Button.foreground=Colors.white;
	Button.highlightBg=Colors.white;
	Button.highlightFore=Colors.darkGray;
	Button.disabledBg=Colors.darkGray;
	Button.disabledFore=Colors.black;

	Button.defaultMargin = 5;

	Button.defaultFontSize=16;
	Button.defaultFont="Arial";
	Button.defaultFontWeight="normal";
	Button.defaultCharHeight=12;

	Button.defaultIconH = 15;
	Button.defaultSideMargin = 10;
};
Button.prototype.buildBg=function(){
	this.bgRect=GuiElements.draw.rect(0,0,this.width,this.height,Button.bg);
	this.group.appendChild(this.bgRect);
	TouchReceiver.addListenersBN(this.bgRect,this);
}
Button.prototype.addText=function(text,font,size,weight,height){
	DebugOptions.validateNonNull(text);
	this.removeContent();
	if(font==null){
		font=Button.defaultFont;
	}
	if(size==null){
		size=Button.defaultFontSize;
	}
	if(weight==null){
		weight=Button.defaultFontWeight;
	}
	if(height==null){
		height=Button.defaultCharHeight;
	}
	DebugOptions.validateNumbers(size, height);
	this.foregroundInverts = true;
	
	this.textE=GuiElements.draw.text(0,0,"",size,Button.foreground,font,weight);
	GuiElements.update.textLimitWidth(this.textE,text,this.width);
	this.group.appendChild(this.textE);
	var textW=GuiElements.measure.textWidth(this.textE);
	var textX=(this.width-textW)/2;
	var textY=(this.height+height)/2;
	GuiElements.move.text(this.textE,textX,textY);
	this.hasText=true;
	TouchReceiver.addListenersBN(this.textE,this);
}
Button.prototype.addIcon=function(pathId,height){
	if(height == null){
		height = Button.defaultIconH;
	}
	this.removeContent();
	this.hasIcon=true;
	this.foregroundInverts=true;
	var iconW=VectorIcon.computeWidth(pathId,height);
	var iconX=(this.width-iconW)/2;
	var iconY=(this.height-height)/2;
	this.icon=new VectorIcon(iconX,iconY,pathId,Button.foreground,height,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
};
Button.prototype.addCenteredTextAndIcon = function(pathId, iconHeight, sideMargin, text, font, size, weight, charH, color){
	this.removeContent();
	if(color == null){
		color = Button.foreground;
		this.foregroundInverts = true;
	}
	if(font==null){
		font=Button.defaultFont;
	}
	if(size==null){
		size=Button.defaultFontSize;
	}
	if(weight==null){
		weight=Button.defaultFontWeight;
	}
	if(charH==null){
		charH=Button.defaultCharHeight;
	}
	if(iconHeight == null){
		iconHeight = Button.defaultIconH;
	}
	if(sideMargin == null){
		sideMargin = Button.defaultSideMargin;
	}
	this.hasIcon = true;
	this.hasText = true;
	
	var iconW=VectorIcon.computeWidth(pathId,iconHeight);
	this.textE=GuiElements.draw.text(0,0,"",size,color,font,weight);
	GuiElements.update.textLimitWidth(this.textE,text,this.width - iconW - sideMargin);
	this.group.appendChild(this.textE);
	var textW=GuiElements.measure.textWidth(this.textE);
	var totalW = textW + iconW + sideMargin;
	var iconX = (this.width - totalW) / 2;
	var iconY = (this.height-iconHeight)/2;
	var textX = iconX + iconW + sideMargin;
	var textY = (this.height+charH)/2;
	GuiElements.move.text(this.textE,textX,textY);
	TouchReceiver.addListenersBN(this.textE,this);
	this.icon=new VectorIcon(iconX,iconY,pathId,color,iconHeight,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
};
Button.prototype.addSideTextAndIcon = function(pathId, iconHeight, text, font, size, weight, charH, color){
	this.removeContent();
	if(color == null){
		color = this.currentForeground();
		this.foregroundInverts = true;
	}
	if(font==null){
		font=Button.defaultFont;
	}
	if(size==null){
		size=Button.defaultFontSize;
	}
	if(weight==null){
		weight=Button.defaultFontWeight;
	}
	if(charH==null){
		charH=Button.defaultCharHeight;
	}
	if(iconHeight == null){
		iconHeight = Button.defaultIconH;
	}
	this.hasIcon = true;
	this.hasText = true;

	const sideMargin = (this.height - iconHeight) / 2;
	const iconW = VectorIcon.computeWidth(pathId,iconHeight);
	this.textE=GuiElements.draw.text(0,0,"",size,color,font,weight);
	const textMaxW = this.width - iconW - sideMargin;
	GuiElements.update.textLimitWidth(this.textE,text,textMaxW);
	this.group.appendChild(this.textE);
	const textW=GuiElements.measure.textWidth(this.textE);
	const iconX = sideMargin;
	const iconY = (this.height-iconHeight)/2;
	var textX = (iconX + iconW + this.width - textW) / 2;
	//textX = Math.max(iconW + sideMargin * 2, textX);
	var textY = (this.height+charH)/2;
	GuiElements.move.text(this.textE,textX,textY);
	TouchReceiver.addListenersBN(this.textE,this);
	this.icon=new VectorIcon(iconX,iconY,pathId,color,iconHeight,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
};
Button.prototype.addImage=function(imageData,height){
	this.removeContent();
	var imageW=imageData.width/imageData.height*height;
	var imageX=(this.width-imageW)/2;
	var imageY=(this.height-height)/2;
	this.imageE=GuiElements.draw.image(imageData.lightName,imageX,imageY,imageW,height,this.group);
	this.imageData=imageData;
	this.hasImage=true;
	TouchReceiver.addListenersBN(this.imageE,this);
};
Button.prototype.addColorIcon=function(pathId,height,color){
	this.removeContent();
	this.hasIcon=true;
	this.foregroundInverts=false;
	var iconW=VectorIcon.computeWidth(pathId,height);
	var iconX=(this.width-iconW)/2;
	var iconY=(this.height-height)/2;
	this.icon=new VectorIcon(iconX,iconY,pathId,color,height,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
}
Button.prototype.removeContent = function(){
	if(this.hasIcon){
		this.icon.remove();
	}
	if(this.hasImage){
		this.imageE.remove();
	}
	if(this.hasText){
		this.textE.remove();
	}
};
Button.prototype.setCallbackFunction=function(callback,delay){
	if(delay){
		this.delayedCallback=callback;
	}
	else{
		this.callback=callback;
	}
};
Button.prototype.setToggleFunction=function(callback){
	this.toggleFunction=callback;
	this.toggles=true;
};
Button.prototype.disable=function(){
	if(this.enabled){
		this.enabled=false;
		this.pressed=false;
		this.bgRect.setAttributeNS(null,"fill",Button.disabledBg);
		if(this.hasText&&this.foregroundInverts){
			this.textE.setAttributeNS(null,"fill",Button.disabledFore);
		}
		if(this.hasIcon&&this.foregroundInverts){
			this.icon.setColor(Button.disabledFore);
		}
	}
};
Button.prototype.enable=function(){
	if(!this.enabled){
		this.enabled=true;
		this.pressed=false;
		this.setColor(false);
	}
};
Button.prototype.press=function(){
	if(this.enabled&&!this.pressed){
		this.pressed=true;
		this.setColor(true);
		if(this.callback!=null){
			this.callback();
		}
	}
};
Button.prototype.release=function(){
	if(this.enabled&&this.pressed){
		this.pressed=false;
		if(!this.toggles||this.toggled) {
			this.setColor(false);
		}
		if(this.toggles&&this.toggled){
			this.toggled=false;
			this.toggleFunction();
		}
		else {
			if (this.delayedCallback != null) {
				this.delayedCallback();
			}
			if (this.toggles && !this.toggled) {
				this.toggled = true;
			}
		}
	}
};
/* Removes the Button's visual highlight without triggering any actions */
Button.prototype.interrupt=function(){
	if(this.enabled&&this.pressed&&!this.toggles){
		this.pressed=false;
		this.setColor(false);
	}
};
Button.prototype.unToggle=function(){
	if(this.enabled&&this.toggled){
		this.setColor(false);
	}
	this.toggled=false;
	this.pressed=false;
};
Button.prototype.remove=function(){
	this.group.remove();
};
Button.prototype.hide = function(){
	this.group.remove();
};
Button.prototype.show = function(){
	this.parentGroup.appendChild(this.group);
};
Button.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,this.x,this.y);
};
Button.prototype.setColor=function(isPressed){
	if(isPressed) {
		this.bgRect.setAttributeNS(null,"fill",Button.highlightBg);
		if(this.hasText&&this.foregroundInverts){
			this.textE.setAttributeNS(null,"fill",Button.highlightFore);
		}
		if(this.hasIcon&&this.foregroundInverts){
			this.icon.setColor(Button.highlightFore);
		}
		if(this.hasImage){
			GuiElements.update.image(this.imageE,this.imageData.darkName);
		}
	}
	else{
		this.bgRect.setAttributeNS(null, "fill", Button.bg);
		if (this.hasText && this.foregroundInverts) {
			this.textE.setAttributeNS(null, "fill", Button.foreground);
		}
		if (this.hasIcon && this.foregroundInverts) {
			this.icon.setColor(Button.foreground);
		}
		if(this.hasImage){
			GuiElements.update.image(this.imageE,this.imageData.lightName);
		}
	}
};
Button.prototype.makeScrollable = function(){
	this.scrollable = true;
};
Button.prototype.currentForeground = function(){
	if(!this.enabled){
		return Button.disabledFore;
	} else if(this.pressed) {
		return Button.highlightFore;
	} else {
		return Button.foreground;
	}
};
Button.prototype.markAsOverlayPart = function(overlay){
	this.partOfOverlay = overlay;
};
Button.prototype.unmarkAsOverlayPart = function(){
	this.partOfOverlay = null;
};