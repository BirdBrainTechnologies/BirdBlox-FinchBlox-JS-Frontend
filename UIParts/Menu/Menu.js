function Menu(button,width){
	if(width==null){
		width=Menu.defaultWidth;
	}
	DebugOptions.validateNumbers(width);
	this.width=width;
	this.x=button.x;
	this.y=button.y+button.height;
	this.group=GuiElements.create.group(this.x,this.y);
	TouchReceiver.addListenersOverlayPart(this.group);
	this.bgRect=GuiElements.create.rect(this.group);
	GuiElements.update.color(this.bgRect,Menu.bgColor);
	this.menuBnList=null;
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
	this.alternateFn=null;
	this.scheduleAlternate=false;
}
Menu.setGraphics=function(){
	Menu.defaultWidth=100;
	Menu.bnMargin=Button.defaultMargin;
	Menu.bgColor=Colors.black;
};
Menu.prototype.move=function(){
	this.x=this.button.x;
	this.y=this.button.y+this.button.height;
	GuiElements.move.group(this.group,this.x,this.y);
};
Menu.prototype.createMenuBnList=function(){
	if(this.menuBnList!=null){
		this.menuBnList.hide();
	}
	var bnM=Menu.bnMargin;
	this.menuBnList=new MenuBnList(this.group,bnM,bnM,bnM,this.width);
	this.menuBnList.isOverlayPart=true;
	var maxH = GuiElements.height - this.y - Menu.bnMargin * 2;
	this.menuBnList.setMaxHeight(maxH);
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
Menu.prototype.previewOpen=function(){
	return true;
};
Menu.prototype.loadOptions=function(){

};
Menu.prototype.open=function(){
	if(!this.visible) {
		if(this.previewOpen()) {
			this.createMenuBnList();
			this.loadOptions();
			this.buildMenu();
			GuiElements.layers.overlay.appendChild(this.group);
			this.visible = true;
			GuiElements.overlay.set(this);
			this.button.isOverlayPart = true;
			this.scheduleAlternate=false;
		}
		else{
			this.button.toggled=true;
			this.scheduleAlternate=true;
		}
	}
};
Menu.prototype.close=function(onlyOnDrag){
	if(onlyOnDrag) return;
	if(this.visible){
		this.group.remove();
		this.visible=false;
		GuiElements.overlay.remove(this);
		this.button.unToggle();
		this.button.isOverlayPart=false;
	}
	else if(this.scheduleAlternate){
		this.scheduleAlternate=false;
		this.alternateFn();
	}
};
Menu.prototype.addAlternateFn=function(alternateFn){
	this.alternateFn=alternateFn;
};