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
	this.hasCallback=false;
	this.callbackDelay=false;
}
Button.setGraphics=function(){
	Button.bg=Colors.darkGray;
	Button.foreground=Colors.white;
	Button.highlightBg=Colors.white;
	Button.highlightFore=Colors.darkGray;
	Button.disabledBg=Colors.darkGray;
	Button.disabledFore=Colors.Black;
}
Button.prototype.buildBg=function(){
	this.bgRect=GuiElements.draw.rect(0,0,this.width,this.height,Button.bg);
	this.group.appendChild(this.bgRect);
	TouchReceiver.addListenersBN(this.bgRect,this);
}
Button.prototype.addText=function(text,font,size,weight,height){
	this.textE=GuiElements.draw.text(0,0,text,size,Button.foreground,font,weight);
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
	this.hasIcon=true;
	this.iconInverts=true;
	var iconW=VectorIcon.computeWidth(pathId,height);
	var iconX=(this.width-iconW)/2;
	var iconY=(this.height-height)/2;
	this.icon=new VectorIcon(iconX,iconY,pathId,Button.foreground,height,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
}
Button.prototype.addColorIcon=function(pathId,height,color){
	this.hasIcon=true;
	this.iconInverts=false;
	var iconW=VectorIcon.computeWidth(pathId,height);
	var iconX=(this.width-iconW)/2;
	var iconY=(this.height-height)/2;
	this.icon=new VectorIcon(iconX,iconY,pathId,color,height,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
}
Button.prototype.setCallbackFunction=function(callback,delay){
	this.callback=callback;
	this.hasCallback=true;
	this.callbackDelay=delay;
}
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
}
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
}
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
		if(this.hasCallback&&!this.callbackDelay){
			this.callback();
		}
	}
}
Button.prototype.release=function(){
	if(this.enabled&&this.pressed){
		this.pressed=false;
		this.bgRect.setAttributeNS(null,"fill",Button.bg);
		if(this.hasText){
			this.textE.setAttributeNS(null,"fill",Button.foreground);
		}
		if(this.hasIcon&&this.iconInverts){
			this.icon.setColor(Button.foreground);
		}
		if(this.hasCallback&&this.callbackDelay){
			this.callback();
		}
	}
}
Button.prototype.remove=function(){
	this.group.remove();
}