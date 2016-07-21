function Menu(button){
	this.x=button.x;
	this.y=button.y+button.height;
	this.group=GuiElements.create.group(this.x,this.y);
	TouchReceiver.addListenersOverlayPart(this.group);
	var bnM=Menu.bnMargin;
	this.bgRect=GuiElements.create.rect(this.group);
	GuiElements.update.color(this.bgRect,Menu.bgColor);
	this.menuBnList=new MenuBnList(this.group,bnM,bnM,bnM,Menu.defaultWidth);
	this.menuBnList.isOverlayPart=true;
	this.visible=false;
	var callbackFn=function(){
		callbackFn.menu.open();
	};
	callbackFn.menu=this;
	button.setCallbackFunction(callbackFn,false);
	callbackFn=function(){
		callbackFn.menu.close();
	};
	callbackFn.menu=this;
	button.setToggleFunction(callbackFn);
	this.button=button;
}
Menu.setGraphics=function(){
	Menu.defaultWidth=100;
	Menu.bnMargin=5;
	Menu.bgColor=Colors.black;
};
Menu.prototype.addOption=function(text,func,close){
	if(close==null){
		close=true;
	}
	var callbackFn=function(){
		if(callbackFn.close) {
			callbackFn.menu.close();
		}
		callbackFn.func.call(callbackFn.menu);
	};
	callbackFn.menu=this;
	callbackFn.func=func;
	callbackFn.close=close;
	this.menuBnList.addOption(text,callbackFn);
};
Menu.prototype.buildMenu=function(){
	var mBL=this.menuBnList;
	mBL.generateBns();
	GuiElements.update.rect(this.bgRect,0,0,mBL.width+2*Menu.bnMargin,mBL.height+2*Menu.bnMargin);
	this.menuBnList.show();
};
Menu.prototype.open=function(){
	if(!this.visible) {
		GuiElements.layers.overlay.appendChild(this.group);
		this.visible=true;
		GuiElements.overlay.set(this);
		this.button.isOverlayPart=true;
	}
};
Menu.prototype.close=function(){
	if(this.visible){
		this.group.remove();
		this.visible=false;
		GuiElements.overlay.remove(this);
		this.button.unToggle();
		this.button.isOverlayPart=false;
	}
};