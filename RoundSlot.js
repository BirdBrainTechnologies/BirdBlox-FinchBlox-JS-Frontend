//Combine with rect slot?
function RoundSlot(parent,snapType,outputType,value,positive,integer){
	Slot.call(this,parent,Slot.inputTypes.num,snapType,outputType);
	this.enteredData=new NumData(value);
	this.positive=positive;
	this.integer=integer;
	this.buildSlot();
	this.selected=false;
}
RoundSlot.prototype = Object.create(Slot.prototype);
RoundSlot.prototype.constructor = RoundSlot;
RoundSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight;
	this.textW=0;
	this.slotE=this.generateSlot(1);//Fix BG
	this.textE=this.generateText(this.enteredData.getValue());
}
RoundSlot.prototype.moveSlot=function(x,y){
	var bG=BlockGraphics.getType(1);//Fix BG
	BlockGraphics.update.path(this.slotE,x,y,this.width,this.height,1,true);//Fix BG
	var textX=x+bG.slotHMargin;
	var textY=y+this.textH/2+this.height/2;
	BlockGraphics.update.text(this.textE,textX,textY);
}
RoundSlot.prototype.hideSlot=function(){
	this.slotE.remove();
	this.textE.remove();
}
RoundSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.slotE);
	this.parent.group.appendChild(this.textE);
}
RoundSlot.prototype.generateText=function(text){ //Fix BG
	var obj=BlockGraphics.create.valueText(text,this.parent.group);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
}
RoundSlot.prototype.generateSlot=function(type){//Fix BG
	var obj=BlockGraphics.create.slot(this.parent.group,type,this.parent.category);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
}
RoundSlot.prototype.changeText=function(text){
	GuiElements.update.text(this.textE,text);
	this.parent.stack.updateDim();
}
RoundSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.getType(1);//Fix BG
	this.textW=GuiElements.measure.textWidth(this.textE);
	var width=this.textW+2*bG.slotHMargin;
	var height=bG.slotHeight;
	if(width<bG.slotWidth){
		width=bG.slotWidth;
	}
	this.width=width;
	this.height=height;
}
RoundSlot.prototype.highlight=function(){//Fix BG
	var isSlot=!this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,1,isSlot);
}
RoundSlot.prototype.edit=function(){
	if(!this.selected){
		var x=this.getAbsX();
		var y=this.getAbsY();
		this.select();
		InputPad.showNumPad(this,x+this.width/2,y,y+this.height,this.positive,this.integer);
	}
}
RoundSlot.prototype.updateEdit=function(visibleText,Data){
	if(this.selected){
		this.enteredData=Data;
		this.changeText(visibleText);
	}
}
RoundSlot.prototype.saveEdit=function(Data){
	if(this.selected){
		this.enteredData=Data;
		this.changeText(Data.asString().getValue());
		this.deselect();
	}
}
RoundSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new RoundSlot(parentCopy,this.snapType,this.outputType,this.enteredData.getValue(),this.positive,this.integer);
	if(this.hasChild){
		myCopy.child=this.child.duplicate(0,0);
		myCopy.hasChild=true;
	}
	return myCopy;
}
RoundSlot.prototype.select=function(){
	this.selected=true;
	GuiElements.update.color(this.slotE,BlockGraphics.reporter.slotSelectedFill);
	GuiElements.update.color(this.textE,BlockGraphics.valueText.selectedFill);
}
RoundSlot.prototype.deselect=function(){
	this.selected=false;
	GuiElements.update.color(this.slotE,BlockGraphics.reporter.slotFill);
	GuiElements.update.color(this.textE,BlockGraphics.valueText.fill);
}
RoundSlot.prototype.textSummary=function(){
	if(this.hasChild){
		return "(...)";
	}
	else{
		return "("+this.enteredData.asString().getValue()+")";
	}
}
RoundSlot.prototype.getData=function(){
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