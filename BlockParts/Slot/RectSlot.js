function RectSlot(parent,snapType,outputType,value){
	Slot.call(this,parent,Slot.inputTypes.string,snapType,outputType);
	this.enteredData=new StringData(value);
	this.buildSlot();
}
RectSlot.prototype = Object.create(Slot.prototype);
RectSlot.prototype.constructor = RectSlot;
RectSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight;
	this.textW=0;
	this.slotE=this.generateSlot(3);//Fix BG
	this.textE=this.generateText(this.enteredData.getValue());
}
RectSlot.prototype.moveSlot=function(x,y){
	var bG=BlockGraphics.getType(3);//Fix BG
	BlockGraphics.update.path(this.slotE,x,y,this.width,this.height,3,true);//Fix BG
	var textX=x+this.width/2-this.textW/2;
	var textY=y+this.textH/2+this.height/2;
	BlockGraphics.update.text(this.textE,textX,textY);
}
RectSlot.prototype.hideSlot=function(){
	this.slotE.remove();
	this.textE.remove();
}
RectSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.slotE);
	this.parent.group.appendChild(this.textE);
}
RectSlot.prototype.generateText=function(text){ //Fix BG
	var obj=BlockGraphics.create.valueText(text,this.parent.group);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
}
RectSlot.prototype.generateSlot=function(type){//Fix BG
	var obj=BlockGraphics.create.slot(this.parent.group,type,this.parent.category);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
}
RectSlot.prototype.changeText=function(text){
	GuiElements.update.text(this.textE,text);
	this.parent.stack.updateDim();
}
RectSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.getType(3);//Fix BG
	this.textW=GuiElements.measure.textWidth(this.textE);
	var width=this.textW+2*bG.slotHMargin;
	var height=bG.slotHeight;
	if(width<bG.slotWidth){
		width=bG.slotWidth;
	}
	this.width=width;
	this.height=height;
}
RectSlot.prototype.highlight=function(){//Fix BG
	var isSlot=!this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
}
RectSlot.prototype.edit=function(){
	var newText=prompt(this.parent.textSummary(this));
	if(newText!=null){
		this.enteredData=new StringData(newText);
		this.changeText(newText);
	}
}
RectSlot.prototype.edit=function(){
	var question=this.parent.textSummary(this);
	var currentVal=this.enteredData.getValue();
	var callbackFn=function(cancelled,response){
		if(!cancelled){
			callbackFn.slot.enteredData=new StringData(response);
			callbackFn.slot.changeText(response);
		}
	}
	callbackFn.slot=this;
	HtmlServer.showDialog("Edit text",question,currentVal,callbackFn);
}

RectSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new RectSlot(parentCopy,this.snapType,this.outputType,this.enteredData.getValue());
	if(this.hasChild){
		myCopy.child=this.child.duplicate(0,0);
		myCopy.hasChild=true;
	}
	return myCopy;
}
RectSlot.prototype.textSummary=function(){
	if(this.hasChild){
		return "[...]";
	}
	else{
		return "["+this.enteredData.getValue()+"]";
	}
}
RectSlot.prototype.getData=function(){
	if(this.running==3){
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return this.enteredData;
		}
	}
	if(this.hasChild){
		return null;
	}
	else{
		return this.enteredData;
	}
}