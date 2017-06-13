/*function OpenDialog(listOfFiles){
	OpenDialog.currentDialog=this;
	this.x = 0;
	this.y = 0;
	this.files=listOfFiles.split("\n");
	this.group=GuiElements.create.group(0,0);
	this.bgRect=GuiElements.create.rect(this.group);
	GuiElements.update.color(this.bgRect,OpenDialog.bgColor);
	this.menuBnList=this.makeMenuBnList();
	this.cancelBn=this.makeCancelBn();
	this.updateBgRect();
	this.titleRect=this.createTitleRect();
	this.titleText=this.createTitleLabel();
	this.updateGroupPosition();
	GuiElements.layers.dialog.appendChild(this.group);
	GuiElements.blockInteraction();
}
OpenDialog.setConstants=function(){
	OpenDialog.currentDialog=null;

	OpenDialog.titleBarColor=Colors.lightGray;
	OpenDialog.titleBarFontC=Colors.white;
	OpenDialog.bgColor=Colors.black;
	OpenDialog.titleBarH=30;
	OpenDialog.width=200;
	OpenDialog.cancelBnWidth=100;
	OpenDialog.cancelBnHeight=MenuBnList.bnHeight;
	OpenDialog.bnMargin=5;

	OpenDialog.fontSize=16;
	OpenDialog.font="Arial";
	OpenDialog.fontWeight="normal";
	OpenDialog.charHeight=12;
};
OpenDialog.prototype.makeMenuBnList=function(){
	var bnM=OpenDialog.bnMargin;
	//var menuBnList=new MenuBnList(this.group,bnM,bnM+OpenDialog.titleBarH,bnM,OpenDialog.width-2*bnM);
	var menuBnList=new SmoothMenuBnList(this, this.group,bnM,bnM+OpenDialog.titleBarH,OpenDialog.width-2*bnM);
	menuBnList.setMaxHeight(this.calcMaxHeight());
	for(var i=0;i<this.files.length-1;i++){
		this.addBnListOption(this.files[i],menuBnList);
	}
	menuBnList.show();
	return menuBnList;
};
OpenDialog.prototype.calcMaxHeight=function(){
	return GuiElements.height-OpenDialog.titleBarH-OpenDialog.cancelBnHeight-OpenDialog.bnMargin*3;
};
OpenDialog.prototype.addBnListOption=function(file,menuBnList){
	var dialog=this;
	menuBnList.addOption(file,function(){dialog.openFile(file)});
};
OpenDialog.prototype.makeCancelBn=function(){
	var OD=OpenDialog;
	var width=OD.cancelBnWidth;
	var height=OD.cancelBnHeight;
	var x=OD.width/2-width/2;
	var y=this.menuBnList.height+OD.bnMargin*2+OD.titleBarH;
	var cancelBn=new Button(x,y,width,height,this.group);
	cancelBn.addText("Cancel");
	var callbackFn=function(){
		callbackFn.dialog.closeDialog();
	};
	callbackFn.dialog=this;
	cancelBn.setCallbackFunction(callbackFn,true);
	return cancelBn;
};
OpenDialog.prototype.updateBgRect=function(){
	var OD=OpenDialog;
	this.height=OD.titleBarH+OD.bnMargin*3+OD.cancelBnHeight+this.menuBnList.height;

	GuiElements.update.rect(this.bgRect,0,OD.titleBarH,OpenDialog.width,this.height-OD.titleBarH);
};
OpenDialog.prototype.createTitleRect=function(){
	var OD=OpenDialog;
	var rect=GuiElements.draw.rect(0,0,OD.width,OD.titleBarH,OD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
OpenDialog.prototype.createTitleLabel=function(){
	var OD=OpenDialog;
	var textE=GuiElements.draw.text(0,0,"Open",OD.fontSize,OD.titleBarFontC,OD.font,OD.fontWeight);
	var x=OD.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=OD.titleBarH/2+OD.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
OpenDialog.prototype.updateGroupPosition=function(){
	var OD=OpenDialog;
	this.x=GuiElements.width/2-OD.width/2;
	this.y=GuiElements.height/2-this.height/2;
	GuiElements.move.group(this.group,this.x,this.y);
	if(this.menuBnList != null) {
		this.menuBnList.updatePosition();
	}
};
OpenDialog.prototype.closeDialog=function(){

};
OpenDialog.prototype.openFile=function(fileName){
	SaveManager.userOpen(fileName);
	this.closeDialog();
};
OpenDialog.prototype.relToAbsX = function(x){
	return x + this.x;
};
OpenDialog.prototype.relToAbsY = function(y){
	return y + this.y;
};*/