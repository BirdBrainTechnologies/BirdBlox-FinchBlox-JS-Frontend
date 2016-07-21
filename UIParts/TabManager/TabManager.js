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
};
TabManager.buildTabBar=function(){
	var TM=TabManager;
	TM.tabBgRect=GuiElements.draw.rect(0,0,TM.bgWidth,TM.bgHeight,TM.bg);
	GuiElements.layers.TabsBg.appendChild(TM.tabBgRect);
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
	TabManager.passRecursively("eventFlagClicked");
};
TabManager.eventBroadcast=function(message){
	TabManager.passRecursively("eventBroadcast",message);
};
TabManager.checkBroadcastRunning=function(message){
	if(this.isRunning){
		for(var i=0;i<TabManager.tabList.length;i++){
			if(TabManager.tabList[i].checkBroadcastRunning(message)){
				return true;
			}
		}
	}
	return false;
};
TabManager.checkBroadcastMessageAvailable=function(message){
	for(var i=0;i<TabManager.tabList.length;i++){
		if(TabManager.tabList[i].checkBroadcastMessageAvailable(message)){
			return true;
		}
	}
	return false;
};
TabManager.updateAvailableMessages=function(){
	TabManager.passRecursively("updateAvailableMessages");
};
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
	TabManager.passRecursively("stop");
	this.isRunning=false;
}
TabManager.stopAllButStack=function(stack){
	TabManager.passRecursively("stopAllButStack",stack);
};
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
TabManager.createXml=function(xmlDoc){
	var TM=TabManager;
	var tabs=XmlWriter.createElement(xmlDoc,"tabs");
	XmlWriter.setAttribute(tabs,"active",TM.activeTab.name);
	for(var i=0;i<TM.tabList.length;i++){
		tabs.appendChild(TM.tabList[i].createXml(xmlDoc));
	}
	return tabs;
};
TabManager.importXml=function(tabsNode){
	var TM=TabManager;
	var tabNodes=XmlWriter.findSubElements(tabsNode,"tab");
	var active=XmlWriter.getAttribute(tabsNode,"active");
	for(var i =0;i<tabNodes.length;i++){
		Tab.importXml(tabNodes[i]);
	}
	TM.updatePositions();
	if(TM.tabList.length==0){
		TM.createInitialTab();
	}
	else if(active==null){
		TM.activateTab(TM.tabList[0]);
	}
	else{
		for(i=0;i<TM.tabList.length;i++){
			if(TM.tabList[i].name==active){
				TM.activateTab(TM.tabList[i]);
				return;
			}
		}
		TM.activateTab(TM.tabList[0]);
	}
};
TabManager.deleteAll=function(){
	var TM=TabManager;
	for(var i=0;i<TM.tabList.length;i++){
		TM.tabList[i].delete();
	}
	TM.tabList=new Array();
	TM.activeTab=null;
	TM.isRunning=false;
	TM.scrolling=false;
};
TabManager.renameVariable=function(variable){
	TabManager.passRecursively("renameVariable",variable);
};
TabManager.deleteVariable=function(variable){
	TabManager.passRecursively("deleteVariable",variable);
};
TabManager.renameList=function(list){
	TabManager.passRecursively("renameList",list);
};
TabManager.deleteList=function(list){
	TabManager.passRecursively("deleteList",list);
};
TabManager.checkVariableUsed=function(variable){
	for(var i=0;i<TabManager.tabList.length;i++){
		if(TabManager.tabList[i].checkVariableUsed(variable)){
			return true;
		}
	}
	return false;
};
TabManager.checkListUsed=function(list){
	for(var i=0;i<TabManager.tabList.length;i++){
		if(TabManager.tabList[i].checkListUsed(list)){
			return true;
		}
	}
	return false;
};
TabManager.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	for(var i=0;i<TabManager.tabList.length;i++){
		var currentList=TabManager.tabList[i];
		currentList[functionName].apply(currentList,args);
	}
};
TabManager.updateZoom=function(){
	var TM=TabManager;
	TM.bgWidth=GuiElements.width;
	TM.tabAreaWidth=GuiElements.width-BlockPalette.width;
	TM.tabSpaceWidth=GuiElements.width-TM.tabSpaceX;
	GuiElements.update.rect(TM.tabBgRect,0,0,TM.bgWidth,TM.bgHeight);
	GuiElements.update.rect(TM.bgRect,TM.tabSpaceX,TM.tabSpaceY,TM.tabSpaceWidth,TM.tabSpaceHeight);
};