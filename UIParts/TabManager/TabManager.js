function TabManager(){
	var TM=TabManager;
	TM.buildTabBar();
	TM.tabList=new Array();
	TM.activeTab=null;
	TM.createInitialTab();
	TabManager.createTabSpaceBg();
	TM.isRunning=false;
	TM.scrolling=false;
}
TabManager.setGraphics=function(){
	var TM=TabManager;
	TM.bg=Colors.black;
	TM.tabAreaHeight=TitleBar.height;
	TM.activeTabFill=Colors.lightGray;
	TM.hiddenTabFill=Colors.darkGray;
	TM.tabSlantWidth=15;
	TM.tabHMargin=7;
	TM.tabMinW=80;
	
	TM.labelFill=Colors.white;
	TM.labelFont="Arial";
	TM.labelFontSize=14;
	TM.labelFontCharH=12;
	
	TM.bgHeight=TitleBar.height+TM.tabAreaHeight;
	TM.bgWidth=GuiElements.width;
	TM.tabAreaX=BlockPalette.width;
	TM.tabAreaY=TitleBar.height;
	TM.tabAreaWidth=GuiElements.width-BlockPalette.width;

	TM.tabSpaceX=BlockPalette.width;
	TM.tabSpaceY=TitleBar.height+TM.tabAreaHeight;
	TM.tabSpaceWidth=GuiElements.width-TM.tabSpaceX;
	TM.tabSpaceHeight=GuiElements.height-TM.tabSpaceY;
	TM.spaceScrollMargin=50;
}
TabManager.buildTabBar=function(){
	var TM=TabManager;
	TM.bgRect=GuiElements.draw.rect(0,0,TM.bgWidth,TM.bgHeight,TM.bg);
	GuiElements.layers.TabsBg.appendChild(TM.bgRect);
	TM.tabBarG=GuiElements.create.group(TM.tabAreaX,TM.tabAreaY);
	GuiElements.layers.TabsBg.appendChild(TM.tabBarG);
};
TabManager.createTabSpaceBg=function(){
	var TM=TabManager;
	TM.bgRect=GuiElements.draw.rect(TM.tabSpaceX,TM.tabSpaceY,TM.tabSpaceWidth,TM.tabSpaceHeight,Colors.lightGray);
	TouchReceiver.addListenersTabSpace(TM.bgRect)
	GuiElements.layers.aTabBg.appendChild(TM.bgRect);
};
TabManager.updatePositions=function(){
	var x=0;
	for(var i=0;i<TabManager.tabList.length;i++){
		x=TabManager.tabList[i].updatePosition(x);
	}
}
TabManager.addTab=function(tab){
	TabManager.tabList.push(tab);
}
TabManager.removeTab=function(tab){
	var index=TabManager.tabList.indexOf(tab);
	TabManager.stackList.splice(index,1);
}
TabManager.createInitialTab=function(){
	var TM=TabManager;
	var t=new Tab(null,"Scripts");
	TM.activateTab(TM.tabList[0]);
	TM.updatePositions();
}
TabManager.activateTab=function(tab){
	if(TabManager.activeTab!=null){
		TabManager.activeTab.deactivate();
	}
	tab.activate();
	TabManager.activeTab=tab;
}
TabManager.eventFlagClicked=function(){
	for(var i=0;i<TabManager.tabList.length;i++){
		TabManager.tabList[i].eventFlagClicked();
	}
}
TabManager.updateRun=function(){	
	if(!this.isRunning){
		return false;
	}
	var rVal=false;
	for(var i=0;i<TabManager.tabList.length;i++){
		rVal=TabManager.tabList[i].updateRun()||rVal;
	}
	this.isRunning=rVal;
	return this.isRunning;
}
TabManager.stop=function(){
	for(var i=0;i<TabManager.tabList.length;i++){
		TabManager.tabList[i].stop();
	}
	this.isRunning=false;
}
TabManager.startRun=function(){
	TabManager.isRunning=true;
	CodeManager.startUpdateTimer();
}
TabManager.startScoll=function(x,y){
	var TM=TabManager;
	if(!TM.scrolling){
		TM.scrolling=true;
		TM.activeTab.startScroll(x,y);
	}
};
TabManager.updateScroll=function (x,y){
	var TM=TabManager;
	if(TM.scrolling){
		TM.activeTab.updateScroll(x,y);
	}
};
TabManager.endScroll=function(){
	var TM=TabManager;
	if(TM.scrolling){
		TM.scrolling=false;
		TM.activeTab.endScroll();
	}
};