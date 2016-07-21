function Button(x,y,width,height,parent){
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.group=GuiElements.create.group(x,y,parent);
	this.buildBg();
	this.pressed=false;
	this.enabled=true;
	this.hasText=false;
	this.hasIcon=false;
	this.iconInverts=false;
	this.callback=null;
	this.delayedCallback=null;
	this.toggles=false;
	this.toggleFunction=null;
	this.toggled=false;
	this.isOverlayPart=false;
	this.menuBnList=null;
}
Button.setGraphics=function(){
	Button.bg=Colors.darkGray;
	Button.foreground=Colors.white;
	Button.highlightBg=Colors.white;
	Button.highlightFore=Colors.darkGray;
	Button.disabledBg=Colors.darkGray;
	Button.disabledFore=Colors.Black;

	Button.defaultFontSize=16;
	Button.defaultFont="Arial";
	Button.defaultFontWeight="normal";
	Button.defaultCharHeight=12;
}
Button.prototype.buildBg=function(){
	this.bgRect=GuiElements.draw.rect(0,0,this.width,this.height,Button.bg);
	this.group.appendChild(this.bgRect);
	TouchReceiver.addListenersBN(this.bgRect,this);
}
Button.prototype.addText=function(text,font,size,weight,height){
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
	
	
	this.textE=GuiElements.draw.text(0,0,"",size,Button.foreground,font,weight);
	GuiElements.update.textLimitWidth(this.textE,text,this.width);
	this.group.appendChild(this.textE);
	var bbox=this.textE.getBBox();
	var textW=GuiElements.measure.textWidth(this.textE);
	var textX=(this.width-textW)/2;
	var textY=(this.height+height)/2;
	GuiElements.move.text(this.textE,textX,textY);
	this.hasText=true;
	TouchReceiver.addListenersBN(this.textE,this);
}
Button.prototype.addIcon=function(pathId,height){
	if(this.hasIcon){
		this.icon.remove();
	}
	this.hasIcon=true;
	this.iconInverts=true;
	var iconW=VectorIcon.computeWidth(pathId,height);
	var iconX=(this.width-iconW)/2;
	var iconY=(this.height-height)/2;
	this.icon=new VectorIcon(iconX,iconY,pathId,Button.foreground,height,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
}
Button.prototype.addColorIcon=function(pathId,height,color){
	if(this.hasIcon){
		this.icon.remove();
	}
	this.hasIcon=true;
	this.iconInverts=false;
	var iconW=VectorIcon.computeWidth(pathId,height);
	var iconX=(this.width-iconW)/2;
	var iconY=(this.height-height)/2;
	this.icon=new VectorIcon(iconX,iconY,pathId,color,height,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
}
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
		if(this.hasText){
			this.textE.setAttributeNS(null,"fill",Button.disabledFore);
		}
		if(this.hasIcon&&this.iconInverts){
			this.icon.setColor(Button.disabledFore);
		}
	}
};
Button.prototype.enable=function(){
	if(!this.enabled){
		this.enabled=true;
		this.pressed=false;
		this.bgRect.setAttributeNS(null,"fill",Button.bg);
		if(this.hasText){
			this.textE.setAttributeNS(null,"fill",Button.foreground);
		}
		if(this.hasIcon&&this.iconInverts){
			this.icon.setColor(Button.foreground);
		}
	}
};
Button.prototype.press=function(){
	if(this.enabled&&!this.pressed){
		this.pressed=true;
		this.bgRect.setAttributeNS(null,"fill",Button.highlightBg);
		if(this.hasText){
			this.textE.setAttributeNS(null,"fill",Button.highlightFore);
		}
		if(this.hasIcon&&this.iconInverts){
			this.icon.setColor(Button.highlightFore);
		}
		if(this.callback!=null){
			this.callback();
		}
	}
};
Button.prototype.release=function(){
	if(this.enabled&&this.pressed){
		this.pressed=false;
		if(!this.toggles||this.toggled) {
			this.bgRect.setAttributeNS(null, "fill", Button.bg);
			if (this.hasText) {
				this.textE.setAttributeNS(null, "fill", Button.foreground);
			}
			if (this.hasIcon && this.iconInverts) {
				this.icon.setColor(Button.foreground);
			}
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
	if(this.enabled&&this.pressed&&!this.toggled){
		this.pressed=false;
		this.bgRect.setAttributeNS(null,"fill",Button.bg);
		if(this.hasText){
			this.textE.setAttributeNS(null,"fill",Button.foreground);
		}
		if(this.hasIcon&&this.iconInverts){
			this.icon.setColor(Button.foreground);
		}
	}
};
Button.prototype.unToggle=function(){
	if(this.enabled&&this.toggled){
		this.bgRect.setAttributeNS(null, "fill", Button.bg);
		if (this.hasText) {
			this.textE.setAttributeNS(null, "fill", Button.foreground);
		}
		if (this.hasIcon && this.iconInverts) {
			this.icon.setColor(Button.foreground);
		}
	}
	this.toggled=false;
	this.pressed=false;
};
Button.prototype.remove=function(){
	this.group.remove();
};
Button.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,this.x,this.y);
};