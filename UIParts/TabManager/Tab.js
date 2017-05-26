function Tab(){
	this.mainG=GuiElements.create.group(0,0);
	this.scrollX=0;
	this.scrollY=0;
	this.zoomFactor = 1;
	this.visible=false;
	TabManager.addTab(this);
	this.stackList=new Array();
	this.isRunning=false;
	this.scrolling=false;
	this.zooming = false;
	this.scrollXOffset=50;
	this.scrollYOffset=100;
	this.zoomStartDist=null;
	this.startZoom = null;
	this.updateTransform();
	this.overFlowArr = new OverflowArrows();
	this.dim={};
	this.dim.x1=0;
	this.dim.y1=0;
	this.dim.x2=0;
	this.dim.y2=0;
}
Tab.prototype.activate=function(){
	GuiElements.layers.activeTab.appendChild(this.mainG);
	this.overFlowArr.show();
};
Tab.prototype.addStack=function(stack){
	this.stackList.push(stack);
};
Tab.prototype.removeStack=function(stack){
	var index=this.stackList.indexOf(stack);
	this.stackList.splice(index,1);
};
Tab.prototype.getSprite=function(){
	return this.sprite;
}
Tab.prototype.relToAbsX=function(x){
	return x * this.zoomFactor + this.scrollX;
};
Tab.prototype.relToAbsY=function(y){
	return y * this.zoomFactor + this.scrollY;
};
Tab.prototype.absToRelX=function(x){
	return (x - this.scrollX) / this.zoomFactor;
};
Tab.prototype.absToRelY=function(y){
	return (y - this.scrollY) / this.zoomFactor;
};
Tab.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
Tab.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
Tab.prototype.findBestFit=function(){
	this.passRecursively("findBestFit");
};
Tab.prototype.eventFlagClicked=function(){
	this.passRecursively("eventFlagClicked");
};
Tab.prototype.eventBroadcast=function(message){
	this.passRecursively("eventBroadcast",message);
};
Tab.prototype.checkBroadcastRunning=function(message){
	if(this.isRunning){
		var stacks=this.stackList;
		for(var i=0;i<stacks.length;i++){
			if(stacks[i].checkBroadcastRunning(message)){
				return true;
			}
		}
	}
	return false;
};
Tab.prototype.checkBroadcastMessageAvailable=function(message){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		if(stacks[i].checkBroadcastMessageAvailable(message)){
			return true;
		}
	}
	return false;
};
Tab.prototype.updateAvailableMessages=function(){
	this.passRecursively("updateAvailableMessages");
};
Tab.prototype.updateRun=function(){
	if(!this.isRunning){
		return false;
	}
	var stacks=this.stackList;
	var rVal=false;
	for(var i=0;i<stacks.length;i++){
		rVal=stacks[i].updateRun()||rVal;
	}
	this.isRunning=rVal;
	return this.isRunning;
}
Tab.prototype.stop=function(){
	this.passRecursively("stop");
	this.isRunning=false;
}
Tab.prototype.stopAllButStack=function(stack){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		if(stacks[i]!=stack) {
			stacks[i].stop();
		}
	}
};
Tab.prototype.startRun=function(){
	this.isRunning=true;
	TabManager.startRun();
}
Tab.prototype.startScroll=function(x,y){
	if(!this.scrolling) {
		this.scrolling = true;
		this.scrollXOffset = this.scrollX - x;
		this.scrollYOffset = this.scrollY - y;
		this.updateTabDim();
	}
};
Tab.prototype.updateScroll=function(x,y){
	if(this.scrolling) {
		this.scrollX=this.scrollXOffset + x;
		this.scrollY=this.scrollYOffset + y;
		GuiElements.move.group(this.mainG,this.scrollX,this.scrollY, this.zoomFactor);
		this.updateArrowsShift();
		/*this.scroll(this.scrollXOffset + x, this.scrollYOffset + y);*/
	}
};
Tab.prototype.scroll=function(x,y) {
	/*
	this.scrollX=x;
	this.scrollY=y;
	GuiElements.move.group(this.mainG,this.scrollX,this.scrollY);
	var dim=this.dim;
	var x1=x+dim.xDiff;
	var y1=y+dim.yDiff;

	var newObjX=this.scrollOneVal(dim.xDiff+this.scrollX,dim.width,x1,TabManager.tabSpaceX,TabManager.tabSpaceWidth);
	var newObjY=this.scrollOneVal(dim.yDiff+this.scrollY,dim.height,y1,TabManager.tabSpaceY,TabManager.tabSpaceHeight);
	this.scrollX=newObjX-dim.xDiff;
	this.scrollY=newObjY-dim.yDiff;
	GuiElements.move.group(this.mainG,this.scrollX,this.scrollY);
	*/
};
Tab.prototype.endScroll=function(){
	this.scrolling = false;
};
Tab.prototype.scrollOneVal=function(objectX,objectW,targetX,containerX,containerW){
	// var minX;
	// var maxX;
	// if(objectW<containerW){
	// 	if(objectX>=containerX&&objectX+objectW<=containerX+containerW){
	// 		return objectX;
	// 	}
	// 	minX=Math.min(containerX,objectX);
	// 	maxX=Math.max(containerX+containerW-objectW,objectX);
	// }
	// else{
	// 	minX=Math.min(containerX+containerW-objectW,objectX);
	// 	maxX=Math.max(containerX,objectX);
	// }
	// var rVal=targetX;
	// rVal=Math.min(rVal,maxX);
	// rVal=Math.max(rVal,minX);
	// return rVal;
};
Tab.prototype.startZooming = function(x1, y1, x2, y2){
	if(!this.zooming) {
		this.zooming = true;
		var x = (x1 + x2) / 2;
		var y = (y1 + y2) / 2;
		this.scrollXOffset = this.scrollX - x;
		this.scrollYOffset = this.scrollY - y;
		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		this.zoomStartDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		this.startZoom = this.zoomFactor;
		this.updateTabDim();
	}
};
Tab.prototype.updateZooming = function(x1, y1, x2, y2){
	if(this.zooming){
		var x = (x1 + x2) / 2;
		var y = (y1 + y2) / 2;
		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		this.zoomFactor = this.startZoom * dist / this.zoomStartDist;
		this.zoomFactor = Math.max(TabManager.minZoom, Math.min(TabManager.maxZoom, this.zoomFactor));
		var zoomRatio = this.zoomFactor / this.startZoom;
		this.scrollX=this.scrollXOffset * zoomRatio + x;
		this.scrollY=this.scrollYOffset * zoomRatio + y;
		this.updateTransform();
		this.updateArrowsShift();
	}
};
Tab.prototype.updateTransform=function(){
	GuiElements.move.group(this.mainG,this.scrollX,this.scrollY, this.zoomFactor);
	GuiElements.update.zoom(GuiElements.layers.drag, this.zoomFactor);
	GuiElements.update.zoom(GuiElements.layers.highlight, this.zoomFactor);
};
Tab.prototype.endZooming = function(){
	this.zooming = false;
};
Tab.prototype.updateTabDim=function(){
	var dim=this.dim;
	dim.width=0;
	dim.height=0;
	dim.x1=null;
	dim.y1=null;
	dim.x2=null;
	dim.y2=null;
	this.passRecursively("updateTabDim");
	if(dim.x1==null){
		dim.x1=0;
		dim.y1=0;
		dim.x2=0;
		dim.y2=0;
	}
};
Tab.prototype.createXml=function(xmlDoc){
	var tab=XmlWriter.createElement(xmlDoc,"tab");
	XmlWriter.setAttribute(tab,"name",this.name);
	XmlWriter.setAttribute(tab,"x",this.scrollX);
	XmlWriter.setAttribute(tab,"y",this.scrollY);
	var stacks=XmlWriter.createElement(xmlDoc,"stacks");
	for(var i=0;i<this.stackList.length;i++){
		stacks.appendChild(this.stackList[i].createXml(xmlDoc));
	}
	tab.appendChild(stacks);
	return tab;
};
Tab.importXml=function(tabNode){
	var name=XmlWriter.getAttribute(tabNode,"name","Sprite1");
	var x=XmlWriter.getAttribute(tabNode,"x",0,true);
	var y=XmlWriter.getAttribute(tabNode,"y",0,true);
	var tab=new Tab(null,name);
	tab.scrollX=x;
	tab.scrollY=y;
	GuiElements.move.group(tab.mainG,tab.scrollX,tab.scrollY);
	var stacksNode=XmlWriter.findSubElement(tabNode,"stacks");
	if(stacksNode!=null){
		var stackNodes=XmlWriter.findSubElements(stacksNode,"stack");
		for(var i=0;i<stackNodes.length;i++){
			BlockStack.importXml(stackNodes[i],tab);
		}
	}
	return tab;
};
Tab.prototype.delete=function(){
	this.passRecursively("delete");
	this.mainG.remove();
};
Tab.prototype.renameVariable=function(variable){
	this.passRecursively("renameVariable",variable);
};
Tab.prototype.deleteVariable=function(variable){
	this.passRecursively("deleteVariable",variable);
};
Tab.prototype.renameList=function(list){
	this.passRecursively("renameList",list);
};
Tab.prototype.deleteList=function(list){
	this.passRecursively("deleteList",list);
};
Tab.prototype.checkVariableUsed=function(variable){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		if(stacks[i].checkVariableUsed(variable)){
			return true;
		}
	}
	return false;
};
Tab.prototype.checkListUsed=function(list){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		if(stacks[i].checkListUsed(list)){
			return true;
		}
	}
	return false;
};
Tab.prototype.hideDeviceDropDowns=function(){
	this.passRecursively("hideDeviceDropDowns");
};
Tab.prototype.showDeviceDropDowns=function(){
	this.passRecursively("showDeviceDropDowns");
};
Tab.prototype.countHBsInUse=function(){
	var largest=1;
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		largest=Math.max(largest,stacks[i].countHBsInUse());
	}
	return largest;
};
Tab.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		var currentStack=stacks[i];
		var currentL=stacks.length;
		currentStack[functionName].apply(currentStack,args);
		if(currentL!=stacks.length){
			i--;
		}
	}
};
Tab.prototype.getZoom=function(){
	return this.zoomFactor;
};
Tab.prototype.updateZoom=function(){
	this.overFlowArr.updateZoom();
	this.updateArrows();
};
Tab.prototype.updateArrows=function(){
	this.updateTabDim();
	var x1 = this.relToAbsX(this.dim.x1);
	var y1 = this.relToAbsY(this.dim.y1);
	var x2 = this.relToAbsX(this.dim.x2);
	var y2 = this.relToAbsY(this.dim.y2);
	this.overFlowArr.setArrows(x1, x2, y1, y2);
};
Tab.prototype.updateArrowsShift=function(){
	var x1 = this.relToAbsX(this.dim.x1)
	var y1 = this.relToAbsY(this.dim.y1)
	var x2 = this.relToAbsX(this.dim.x2)
	var y2 = this.relToAbsY(this.dim.y2)
	this.overFlowArr.setArrows(x1, x2, y1, y2);
};