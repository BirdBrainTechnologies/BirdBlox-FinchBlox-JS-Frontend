function Menu(button,reloadOnOpen,width){
	if(width==null){
		width=Menu.defaultWidth;
	}
	this.width=width;
	if(reloadOnOpen==null){
		reloadOnOpen=false;
	}
	this.reloadOnOpen=reloadOnOpen;
	this.x=button.x;
	this.y=button.y+button.height;
	this.group=GuiElements.create.group(this.x,this.y);
	TouchReceiver.addListenersOverlayPart(this.group);
	this.bgRect=GuiElements.create.rect(this.group);
	GuiElements.update.color(this.bgRect,Menu.bgColor);
	this.menuBnList=null;
	this.createMenuBnList();
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
	Menu.bnMargin=5;
	Menu.bgColor=Colors.black;
};
Menu.prototype.createMenuBnList=function(){
	if(this.menuBnList!=null){
		this.menuBnList.hide();
	}
	var bnM=Menu.bnMargin;
	this.menuBnList=new MenuBnList(this.group,bnM,bnM,bnM,this.width);
	this.menuBnList.isOverlayPart=true;
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
			if (this.reloadOnOpen) {
				this.createMenuBnList();
				this.loadOptions();
				this.buildMenu();
			}
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
Menu.prototype.close=function(){
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