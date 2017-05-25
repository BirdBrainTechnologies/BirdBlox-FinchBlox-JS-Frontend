function TabManager(){
	var TM=TabManager;
	TM.tabList=new Array();
	TM.activeTab=null;
	TM.createInitialTab();
	TabManager.createTabSpaceBg();
	TM.isRunning=false;
	TM.scrolling=false;
	TM.zooming = false;
}
TabManager.setGraphics=function(){
	var TM=TabManager;
	TM.bg=Colors.black;


	TM.tabAreaX=BlockPalette.width;
	TM.tabAreaY=TitleBar.height;
	TM.tabAreaWidth=GuiElements.width-BlockPalette.width;

	/* No longer different from tabArea since tab bar was removed */
	TM.tabSpaceX=BlockPalette.width;
	TM.tabSpaceY=TitleBar.height;
	TM.tabSpaceWidth=GuiElements.width-TM.tabSpaceX;
	TM.tabSpaceHeight=GuiElements.height-TM.tabSpaceY;
	TM.spaceScrollMargin=50;
};
TabManager.createTabSpaceBg=function(){
	var TM=TabManager;
	TM.bgRect=GuiElements.draw.rect(TM.tabSpaceX,TM.tabSpaceY,TM.tabSpaceWidth,TM.tabSpaceHeight,Colors.lightGray);
	TouchReceiver.addListenersTabSpace(TM.bgRect);
	GuiElements.layers.aTabBg.appendChild(TM.bgRect);
};
TabManager.updatePositions=function(){
	/* This might not be needed now that tabs aren't visible */
};
TabManager.addTab=function(tab){
	TabManager.tabList.push(tab);
};
TabManager.removeTab=function(tab){
	var index=TabManager.tabList.indexOf(tab);
	TabManager.stackList.splice(index,1);
};
TabManager.createInitialTab=function(){
	var TM=TabManager;
	var t=new Tab();
	TM.activateTab(TM.tabList[0]);
	TM.updatePositions();
};
TabManager.activateTab=function(tab){
	if(TabManager.activeTab!=null){
		TabManager.activeTab.deactivate();
	}
	tab.activate();
	TabManager.activeTab=tab;
};
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
TabManager.startScroll=function(x,y){
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
TabManager.startZooming = function(x1, y1, x2, y2){
	var TM=TabManager;
	if(!TM.zooming){
		TM.zooming = true;
		TM.activeTab.startZooming(x1, y1, x2, y2);
	}
};
TabManager.updateZooming = function(x1, y1, x2, y2){
	var TM=TabManager;
	if(TM.zooming){
		TM.activeTab.updateZooming(x1, y1, x2, y2);
	}
};
TabManager.endZooming = function(){
	var TM=TabManager;
	if(TM.zooming){
		TM.zooming = false;
		TM.activeTab.endZooming();
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
	if(tabsNode!=null) {
		var tabNodes = XmlWriter.findSubElements(tabsNode, "tab");
		var active = XmlWriter.getAttribute(tabsNode, "active");
		for (var i = 0; i < tabNodes.length; i++) {
			Tab.importXml(tabNodes[i]);
		}
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
TabManager.hideDeviceDropDowns=function(){
	TabManager.passRecursively("hideDeviceDropDowns");
};
TabManager.showDeviceDropDowns=function(){
	TabManager.passRecursively("showDeviceDropDowns");
};
TabManager.countHBsInUse=function(){
	var largest=1;
	for(var i=0;i<TabManager.tabList.length;i++){
		largest=Math.max(largest,TabManager.tabList[i].countHBsInUse());
	}
	return largest;
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
	TM.tabAreaWidth=GuiElements.width-BlockPalette.width;
	TM.tabSpaceWidth=GuiElements.width-TM.tabSpaceX;
	TM.tabSpaceHeight=GuiElements.height-TM.tabSpaceY;
	GuiElements.update.rect(TM.bgRect,TM.tabSpaceX,TM.tabSpaceY,TM.tabSpaceWidth,TM.tabSpaceHeight);
};
TabManager.getActiveZoom = function(){
	if(TabManager.activateTab == null){
		return 1;
	}
	return TabManager.activeTab.getZoom();
};