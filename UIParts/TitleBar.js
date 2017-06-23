function TitleBar(){
	let TB=TitleBar;
	TB.titleTextVisble = true;
	TitleBar.createBar();
	TitleBar.makeButtons();
	TitleBar.makeTitleText();
}
TitleBar.setGraphics=function(){
	var TB=TitleBar;
	TB.height=54;
	TB.buttonMargin=Button.defaultMargin;
	TB.buttonW=64;
	TB.longButtonW=85;
	TB.bnIconMargin=3;
	TB.bg=Colors.black;
	TB.flagFill="#0f0";
	TB.stopFill="#f00";
	TB.titleColor=Colors.white;
	TB.font="Arial";
	TB.fontWeight="Bold";
	TB.fontSize=16;
	TB.fontCharHeight=12;
	
	TB.buttonH=TB.height-2*TB.buttonMargin;
	TB.bnIconH=TB.buttonH-2*TB.bnIconMargin;
};
TitleBar.createBar=function(){
	var TB=TitleBar;
	TB.stopBnX=GuiElements.width-TB.buttonW-TB.buttonMargin;
	TB.flagBnX=TB.stopBnX-TB.buttonW-2*TB.buttonMargin;

	TB.fileBnX=TB.buttonMargin;
	TB.viewBnX=TB.fileBnX+TB.buttonMargin+TB.buttonW;

	TB.hummingbirdBnX=BlockPalette.width-TB.buttonMargin-TB.buttonW;
	TB.statusX=TB.hummingbirdBnX-TB.buttonMargin-DeviceStatusLight.radius*2;
	TB.debugX=TB.flagBnX-TB.longButtonW-2*TB.buttonMargin;

	TB.width=GuiElements.width;
	TB.bgRect=GuiElements.draw.rect(0,0,TB.width,TB.height,TB.bg);
	GuiElements.layers.titleBg.appendChild(TB.bgRect);
};
TitleBar.makeButtons=function(){
	var TB=TitleBar;
	var TBLayer=GuiElements.layers.titlebar;
	TB.flagBn=new Button(TB.flagBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.flagBn.addColorIcon(VectorPaths.flag,TB.bnIconH,TB.flagFill);
	TB.flagBn.setCallbackFunction(CodeManager.eventFlagClicked,false);
	TB.stopBn=new Button(TB.stopBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.stopBn.addColorIcon(VectorPaths.stop,TB.bnIconH,TB.stopFill);
	TB.stopBn.setCallbackFunction(CodeManager.stop,false);

	TB.deviceStatusLight=new DeviceStatusLight(TB.statusX,TB.height/2,TBLayer);
	TB.hummingbirdBn=new Button(TB.hummingbirdBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.hummingbirdBn.addIcon(VectorPaths.connect,TB.bnIconH);
	TB.hummingbirdMenu=new DeviceMenu(TB.hummingbirdBn);

	TB.fileBn=new Button(TB.fileBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.fileBn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.fileMenu=new FileMenu(TB.fileBn);
	TB.viewBn=new Button(TB.viewBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.viewBn.addIcon(VectorPaths.view,TB.bnIconH);
	TB.viewMenu=new ViewMenu(TB.viewBn);
	TB.debugBn=null;
	/*
	TB.test1Bn=new Button(TB.flagBnX-TB.buttonW-2*TB.buttonMargin,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.test1Bn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.test1Bn.setCallbackFunction(SaveManager.reloadTest,true);
	TB.test2Bn=new Button(TB.flagBnX-2*TB.buttonW-4*TB.buttonMargin,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.test2Bn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.test2Bn.setCallbackFunction(SaveManager.listTest,true);
	*/
};
TitleBar.makeTitleText=function(){
	var TB=TitleBar;
	TB.titleLabel=GuiElements.draw.text(0,0,"",TB.fontSize,TB.titleColor,TB.font,TB.fontWeight);
	GuiElements.layers.titlebar.appendChild(TB.titleLabel);
};
TitleBar.setText=function(text){
	var TB=TitleBar;
	GuiElements.update.text(TB.titleLabel,text);
	var width=GuiElements.measure.textWidth(TB.titleLabel);
	var x=GuiElements.width/2-width/2;
	var y=TB.height/2+TB.fontCharHeight/2;
	GuiElements.move.text(TB.titleLabel,x,y);
	TitleBar.hideTextIfTooLarge(x, width);
};
TitleBar.hideTextIfTooLarge = function(textX, textWidth){
	let TB=TitleBar;
	if(textX < BlockPalette.width) {
		if(TB.titleTextVisble) {
			TB.titleLabel.remove();
			TB.titleTextVisble = false;
		}
	} else {
		if(!TB.titleTextVisble) {
			GuiElements.layers.titlebar.appendChild(TB.titleLabel);
			TB.titleTextVisble = true;
		}
	}
};
TitleBar.enableDebug=function(){
	var TB=TitleBar;
	var TBLayer=GuiElements.layers.titlebar;
	if(TB.debugBn==null) {
		TB.debugBn = new Button(TB.debugX, TB.buttonMargin, TB.longButtonW, TB.buttonH, TBLayer);
		TB.debugBn.addText("Debug");
		TB.debugMenu = new DebugMenu(TB.debugBn);
	}
};
TitleBar.hideDebug = function(){
	TitleBar.debugBn.remove();
	TitleBar.debugBn = null;
};
TitleBar.updateZoom=function(){
	var TB=TitleBar;
	TB.width=GuiElements.width;
	GuiElements.update.rect(TB.bgRect, 0, 0, TB.width, TB.height);
	TB.stopBnX=GuiElements.width-TB.buttonW-TB.buttonMargin;
	TB.flagBnX=TB.stopBnX-TB.buttonW-2*TB.buttonMargin;
	TB.debugX=TB.flagBnX-TB.longButtonW-2*TB.buttonMargin;
	TB.stopBn.move(TB.stopBnX,TB.buttonMargin);
	TB.flagBn.move(TB.flagBnX,TB.buttonMargin);
	TB.viewMenu.updateZoom();
	if(TB.debugBn!=null) {
		TB.debugBn.move(TB.debugX, TB.buttonMargin);
		TB.debugMenu.move();
	}
	var width=GuiElements.measure.textWidth(TB.titleLabel);
	var x=GuiElements.width/2-width/2;
	var y=TB.height/2+TB.fontCharHeight/2;
	GuiElements.move.text(TB.titleLabel,x,y);
	TitleBar.hideTextIfTooLarge(x, width);
};