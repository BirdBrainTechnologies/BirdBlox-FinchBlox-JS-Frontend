function TitleBar(){
	let TB=TitleBar;
	TB.titleTextVisble = true;
	TB.titleText = "";
	TB.debugEnabled = false;
	TitleBar.createBar();
	TitleBar.makeButtons();
	TitleBar.makeTitleText();
}
TitleBar.setGraphicsPart1=function(){
	var TB=TitleBar;
	if(GuiElements.smallMode) {
		TB.height = 44;
		TB.buttonMargin=Button.defaultMargin / 2;
	} else {
		TB.height = 54;
		TB.buttonMargin=Button.defaultMargin;
	}
	TB.buttonW = TB.height * 64 / 54;
	TB.longButtonW=85;
	TB.bnIconMargin=3;
	TB.bg=Colors.black;
	TB.flagFill="#0f0";
	TB.stopFill="#f00";
	TB.titleColor=Colors.white;
	TB.font=Font.uiFont(16).bold();
	
	TB.buttonH=TB.height-2*TB.buttonMargin;
	TB.bnIconH=TB.buttonH-2*TB.bnIconMargin;
	TB.shortButtonW = TB.buttonH;
	TB.shortButtonW = TB.buttonW;

	TB.width=GuiElements.width;
};
TitleBar.setGraphicsPart2 = function(){
	var TB=TitleBar;
	TB.stopBnX=GuiElements.width-TB.buttonW-TB.buttonMargin;
	TB.flagBnX=TB.stopBnX-TB.buttonW-TB.buttonMargin;
	TB.undoBnX=TB.flagBnX-TB.buttonW-3*TB.buttonMargin;
	TB.debugX=TB.undoBnX-TB.longButtonW-3*TB.buttonMargin;

	TB.fileBnX=TB.buttonMargin;
	if(GuiElements.smallMode) {
		TB.showBnX = TB.buttonMargin;
		TB.fileBnX=TB.showBnX + TB.buttonMargin + TB.shortButtonW;
	}
	TB.viewBnX=TB.fileBnX+TB.buttonMargin+TB.buttonW;
	TB.hummingbirdBnX=BlockPalette.width-Button.defaultMargin-TB.buttonW;
	TB.statusX=TB.hummingbirdBnX-TB.buttonMargin-DeviceStatusLight.radius*2;

	TB.titleLeftX = BlockPalette.width;
	TB.titleRightX = TB.flagBnX - TB.buttonMargin;
	TB.titleWidth = TB.titleRightX - TB.titleLeftX;
};
TitleBar.createBar=function(){
	var TB=TitleBar;
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

	TB.deviceStatusLight=new DeviceStatusLight(TB.statusX,TB.height/2,TBLayer,DeviceManager);
	TB.hummingbirdBn=new Button(TB.hummingbirdBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.hummingbirdBn.addIcon(VectorPaths.connect,TB.bnIconH * 0.8);
	TB.hummingbirdMenu=new DeviceMenu(TB.hummingbirdBn);

	if(GuiElements.smallMode) {
		TB.showHideBn = new ShowHideButton(this.showBnX, TB.buttonMargin, TB.buttonW, TB.buttonH, TBLayer,TB.bnIconH);
		TB.showHideBn.setCallbackFunctions(GuiElements.showPaletteLayers, GuiElements.hidePaletteLayers);
		TB.showHideBn.build(GuiElements.paletteLayersVisible);
	} else {
		TB.showHideBn = null;
	}

	TB.fileBn=new Button(TB.fileBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.fileBn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.fileBn.setCallbackFunction(SaveManager.userOpenDialog, true);
	//TB.fileMenu=new FileMenu(TB.fileBn);
	TB.viewBn=new Button(TB.viewBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.viewBn.addIcon(VectorPaths.settings,TB.bnIconH);
	TB.viewMenu=new SettingsMenu(TB.viewBn);

	TB.undoButton = new Button(TB.undoBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.undoButton.addIcon(VectorPaths.undoDelete, TB.bnIconH * 0.9);
	UndoManager.setUndoButton(TB.undoButton);

	TB.debugBn=null;
	if(TB.debugEnabled) {
		TB.enableDebug();
	}
	/*
	TB.test1Bn=new Button(TB.flagBnX-TB.buttonW-2*TB.buttonMargin,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.test1Bn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.test1Bn.setCallbackFunction(SaveManager.reloadTest,true);
	TB.test2Bn=new Button(TB.flagBnX-2*TB.buttonW-4*TB.buttonMargin,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.test2Bn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.test2Bn.setCallbackFunction(SaveManager.listTest,true);
	*/
};
TitleBar.removeButtons = function(){
	let TB=TitleBar;
	TB.flagBn.remove();
	TB.stopBn.remove();
	TB.fileBn.remove();
	TB.viewBn.remove();
	TB.undoButton.remove();
	TB.hummingbirdBn.remove();
	if(TB.debugBn != null) TB.debugBn.remove();
	if(TB.showHideBn != null) TB.showHideBn.remove();
	TB.deviceStatusLight.remove();
};
TitleBar.makeTitleText=function(){
	var TB=TitleBar;
	TB.titleLabel=GuiElements.draw.text(0,0,"",TB.font,TB.titleColor);
	GuiElements.layers.titlebar.appendChild(TB.titleLabel);
};
TitleBar.setText=function(text){
	const TB = TitleBar;
	if(text == null) text = "";
	TB.titleText = text;
	TitleBar.updateText();
};
TitleBar.updateText = function(){
	let TB=TitleBar;
	if(GuiElements.width < BlockPalette.width * 2) {
		if(TB.titleTextVisble) {
			TB.titleLabel.remove();
			TB.titleTextVisble = false;
		}
	} else {
		if(!TB.titleTextVisble) {
			GuiElements.layers.titlebar.appendChild(TB.titleLabel);
			TB.titleTextVisble = true;
		}
		let maxWidth = TB.titleWidth;
		GuiElements.update.textLimitWidth(TB.titleLabel, TB.titleText, maxWidth);
		let width=GuiElements.measure.textWidth(TB.titleLabel);
		let x=GuiElements.width/2-width/2;
		let y=TB.height/2+TB.font.charHeight/2;
		if(x < TB.titleLeftX) {
			x = TB.titleLeftX;
		} else if(x + width > TB.titleRightX) {
			x = TB.titleRightX - width;
		}
		GuiElements.move.text(TB.titleLabel,x,y);
	}
};
TitleBar.enableDebug=function(){
	var TB=TitleBar;
	TB.debugEnabled = true;
	var TBLayer=GuiElements.layers.titlebar;
	if(TB.debugBn==null) {
		TB.debugBn = new Button(TB.debugX, TB.buttonMargin, TB.longButtonW, TB.buttonH, TBLayer);
		TB.debugBn.addText("Debug");
		TB.debugMenu = new DebugMenu(TB.debugBn);
	}
};
TitleBar.hideDebug = function(){
	TitleBar.debugEnabled = false;
	TitleBar.debugBn.remove();
	TitleBar.debugBn = null;
};
TitleBar.updateZoomPart1 = function(){
	TitleBar.setGraphicsPart1();
};
TitleBar.updateZoomPart2=function(){
	let TB=TitleBar;
	let viewShowing = TB.viewBn.toggled;
	TB.setGraphicsPart2();
	GuiElements.update.rect(TB.bgRect, 0, 0, TB.width, TB.height);
	TitleBar.removeButtons();
	TitleBar.makeButtons();
	if(viewShowing){
		TB.viewBn.press();
		TB.viewBn.release();
	}
	TB.updateText();
};