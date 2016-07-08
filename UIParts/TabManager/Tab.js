function Tab(sprite,name){
	this.name=name;
	this.sprite=sprite;
	this.textE=this.generateText(this.name);
	this.pathE=this.generatePath();
	this.mainG=GuiElements.create.group(0,0);
	this.scrollX=0;
	this.scrollY=0;
	this.visible=false;
	TabManager.addTab(this);
	this.stackList=new Array();
	this.isRunning=false;
	this.scrolling=false;
	this.scrollXOffset=0;
	this.scrollYOffset=0;
	this.dim=function(){};
	this.dim.x1=0;
	this.dim.y1=0;
	this.dim.x2=0;
	this.dim.y2=0;
	this.dim.width=0;
	this.dim.height=0;
}
Tab.prototype.generatePath=function(){
	var TM=TabManager;
	var pathE=GuiElements.create.path();
	GuiElements.update.color(pathE,TM.hiddenTabFill);
	return pathE;
}
Tab.prototype.generateText=function(text){
	var TM=TabManager;
	var textE=GuiElements.draw.text(0,0,text,TM.labelFontSize,TM.labelFill,TM.labelFont,"normal");
	this.textHeight=TM.labelFontCharH;
	return textE;
}
Tab.prototype.updatePosition=function(x){
	var TM=TabManager;
	this.textWidth=GuiElements.measure.textWidth(this.textE);
	this.width=this.textWidth+TM.tabSlantWidth*2+TM.tabHMargin*2;
	this.height=TM.tabAreaHeight;
	this.textY=this.textHeight/2+this.height/2;
	if(this.width<TM.tabMinW){
		this.width=TM.tabMinW;
		this.textX=this.width/2-this.textWidth/2;
	}
	else{
		this.textX=x+TM.tabSlantWidth+TM.tabHMargin;
	}
	GuiElements.update.trapezoid(this.pathE,x,0,this.width,this.height,TM.tabSlantWidth);
	GuiElements.move.text(this.textE,this.textX,this.textY);
	if(!this.visible){
		TM.tabBarG.appendChild(this.pathE);
		TM.tabBarG.appendChild(this.textE);
		this.visible=true;
	}
	return x+this.width;
}
Tab.prototype.activate=function(){
	GuiElements.layers.activeTab.appendChild(this.mainG);
	GuiElements.update.color(this.pathE,TabManager.activeTabFill);
}
Tab.prototype.deactivate=function(){
	this.mainG.remove();
	GuiElements.update.color(this.pathE,TabManager.hiddenTabFill);
}
Tab.prototype.addStack=function(stack){
	this.stackList.push(stack);
}
Tab.prototype.removeStack=function(stack){
	var index=this.stackList.indexOf(stack);
	this.stackList.splice(index,1);
}
Tab.prototype.getSprite=function(){
	return this.sprite;
}
Tab.prototype.relToAbsX=function(x){
	return x+this.scrollX;
};
Tab.prototype.relToAbsY=function(y){
	return y+this.scrollY;
};
Tab.prototype.absToRelX=function(x){
	return x-this.scrollX;
};
Tab.prototype.absToRelY=function(y){
	return y-this.scrollY;
};
Tab.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
Tab.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
Tab.prototype.findBestFit=function(){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		stacks[i].findBestFit();
	}
}
Tab.prototype.eventFlagClicked=function(){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		stacks[i].eventFlagClicked();
	}
};
Tab.prototype.eventBroadcast=function(message){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		stacks[i].eventBroadcast(message);
	}
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
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		stacks[i].updateAvailableMessages();
	}
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
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		stacks[i].stop();
	}
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
		this.scroll(this.scrollXOffset + x, this.scrollYOffset + y);
	}
};
Tab.prototype.scroll=function(x,y) {
	//this.scrollX=x;
	//this.scrollY=y;
	//GuiElements.move.group(this.mainG,this.scrollX,this.scrollY);
	var dim=this.dim;
	var x1=x+dim.xDiff;
	var y1=y+dim.yDiff;

	var newObjX=this.scrollOneVal(dim.xDiff+this.scrollX,dim.width,x1,TabManager.tabSpaceX,TabManager.tabSpaceWidth);
	var newObjY=this.scrollOneVal(dim.yDiff+this.scrollY,dim.height,y1,TabManager.tabSpaceY,TabManager.tabSpaceHeight);
	this.scrollX=newObjX-dim.xDiff;
	this.scrollY=newObjY-dim.yDiff;
	GuiElements.move.group(this.mainG,this.scrollX,this.scrollY);
};
Tab.prototype.endScroll=function(){
	this.scrolling=false;
};
Tab.prototype.scrollOneVal=function(objectX,objectW,targetX,containerX,containerW){
	var minX;
	var maxX;
	if(objectW<containerW){
		if(objectX>=containerX&&objectX+objectW<=containerX+containerW){
			return objectX;
		}
		minX=Math.min(containerX,objectX);
		maxX=Math.max(containerX+containerW-objectW,objectX);
	}
	else{
		minX=Math.min(containerX+containerW-objectW,objectX);
		maxX=Math.max(containerX,objectX);
	}
	var rVal=targetX;
	rVal=Math.min(rVal,maxX);
	rVal=Math.max(rVal,minX);
	return rVal;
};
Tab.prototype.updateTabDim=function(){
	var dim=this.dim;
	dim.width=0;
	dim.height=0;
	dim.x1=null;
	dim.y1=null;
	dim.x2=null;
	dim.y2=null;
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		stacks[i].updateTabDim();
	}
	if(dim.x1==null){
		dim.x1=0;
		dim.y1=0;
		dim.x2=0;
		dim.y2=0;
	}
	dim.x1-=TabManager.spaceScrollMargin;
	dim.y1-=TabManager.spaceScrollMargin;
	dim.x2+=TabManager.spaceScrollMargin;
	dim.y2+=TabManager.spaceScrollMargin;
	dim.width=dim.x2-dim.x1;
	dim.height=dim.y2-dim.y1;
	dim.xDiff=this.dim.x1;
	dim.yDiff=this.dim.y1;
};
Tab.prototype.createXml=function(xmlDoc){
	var tab=XmlWriter.createElement(xmlDoc,"tab");
	XmlWriter.setAttribute(tab,"name",this.name);
	XmlWriter.setAttribute(tab,"x",this.scrollXOffset);
	XmlWriter.setAttribute(tab,"y",this.scrollYOffset);
	var stacks=XmlWriter.createElement(xmlDoc,"stacks");
	for(var i=0;i<this.stackList.length;i++){
		stacks.appendChild(this.stackList[i].createXml(xmlDoc));
	}
	tab.appendChild(stacks);
	return tab;
};
