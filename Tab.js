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
Tab.prototype.getAbsX=function(){
	return this.scrollX;
}
Tab.prototype.getAbsY=function(){
	return this.scrollY;
}
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
}
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
Tab.prototype.startRun=function(){
	this.isRunning=true;
	TabManager.startRun();
}