function DropSlot(parent,snapType){
	if(snapType==null){
		snapType=Slot.snapTypes.none;
	}
	Slot.call(this,parent,Slot.inputTypes.drop,snapType,Slot.outputTypes.any);
	this.enteredData=null;
	this.text="";
	this.buildSlot();
	this.selected=false;
	this.optionsText=new Array();
	this.optionsData=new Array();
	this.dropColumns=1; //The number of columns to show in the drop down.
}
DropSlot.prototype = Object.create(Slot.prototype);
DropSlot.prototype.constructor = DropSlot;
DropSlot.prototype.addOption=function(displayText,data){
	this.optionsText.push(displayText);
	this.optionsData.push(data);
}
DropSlot.prototype.populateList=function(){//overrided by subclasses
	
}
DropSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight;
	this.textW=0;
	this.bgE=this.generateBg();
	this.triE=this.generateTri();
	this.textE=this.generateText();
	this.hitBoxE=this.generateHitBox();
}
DropSlot.prototype.generateBg=function(){
	var bG=BlockGraphics.dropSlot;
	var bgE=GuiElements.create.rect(this.parent.group);
	GuiElements.update.color(bgE,bG.bg);
	GuiElements.update.opacity(bgE,bG.bgOpacity);
	TouchReceiver.addListenersSlot(bgE,this);
	return bgE;
}
DropSlot.prototype.generateTri=function(){
	var bG=BlockGraphics.dropSlot;
	var triE=GuiElements.create.path(this.parent.group);
	GuiElements.update.color(triE,bG.triFill);
	TouchReceiver.addListenersSlot(triE,this);
	return triE;
}
DropSlot.prototype.generateText=function(){ //Fix BG
	var bG=BlockGraphics.dropSlot;
	var obj=BlockGraphics.create.valueText("",this.parent.group);
	GuiElements.update.color(obj,bG.textFill);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
}
DropSlot.prototype.generateHitBox=function(){
	var obj=BlockGraphics.create.slotHitBox(this.parent.group);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
};
DropSlot.prototype.moveSlot=function(x,y){
	var bG=BlockGraphics.dropSlot;
	GuiElements.update.rect(this.bgE,x,y,this.width,this.height);
	var textX=x+bG.slotHMargin;
	var textY=y+this.textH/2+this.height/2;
	BlockGraphics.update.text(this.textE,textX,textY);
	var triX=x+this.width-bG.slotHMargin-bG.triW;
	var triY=y+this.height/2-bG.triH/2;
	GuiElements.update.triangle(this.triE,triX,triY,bG.triW,0-bG.triH);
	var bGHB=BlockGraphics.hitBox;
	var hitX=x-bGHB.hMargin;
	var hitY=y-bGHB.vMargin;
	var hitW=this.width+bGHB.hMargin*2;
	var hitH=this.height+bGHB.vMargin*2;
	GuiElements.update.rect(this.hitBoxE,hitX,hitY,hitW,hitH);
}
DropSlot.prototype.hideSlot=function(){
	this.bgE.remove();
	this.textE.remove();
	this.triE.remove();
}
DropSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.bgE);
	this.parent.group.appendChild(this.triE);
	this.parent.group.appendChild(this.textE);
}
DropSlot.prototype.changeText=function(text){
	this.text=text;
	GuiElements.update.text(this.textE,text);
	if(this.parent.stack!=null){
		this.parent.stack.updateDim();
	}
}
DropSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.dropSlot;
	this.textW=GuiElements.measure.textWidth(this.textE);
	var width=this.textW+3*bG.slotHMargin+bG.triW;
	var height=bG.slotHeight;
	if(width<bG.slotWidth){
		width=bG.slotWidth;
	}
	this.width=width;
	this.height=height;
}
DropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new DropSlot(parentCopy,this.snapType);
	for(var i=0;i<this.optionsText.length;i++){
		myCopy.addOption(this.optionsText[i],this.optionsData[i]);
	}
	if(this.hasChild){
		myCopy.snap(this.child.duplicate(0,0));
	}
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	myCopy.dropColumns=this.dropColumns;
	return myCopy;
}
DropSlot.prototype.highlight=function(){//Fix BG
	var isSlot=!this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
}
DropSlot.prototype.edit=function(){
	if(!this.selected){
		var x=this.getAbsX();
		var y=this.getAbsY();
		this.select();
		InputPad.resetPad(this.dropColumns);
		this.populateList(); //Loads any dynamic options.
		for(var i=0;i<this.optionsText.length;i++){
			InputPad.addOption(this.optionsText[i],this.optionsData[i]);
		}
		InputPad.showDropdown(this,x+this.width/2,y,y+this.height);
	}
}
/* Shows a dialog to allow text to be entered into the Slot. Uses a callback function with enteredData and changeText.
 * Only used for special DropSlots.
 */
DropSlot.prototype.editText=function(){
	//Builds a text-based representation of the Block with "___" in place of this Slot.
	var question=this.parent.textSummary(this);
	//Get the current value for the hint text.
	var currentVal=this.enteredData.getValue();
	//The callback function changes the text.
	var callbackFn=function(cancelled,response){
		if(!cancelled){
			callbackFn.slot.enteredData=new StringData(response);
			callbackFn.slot.changeText(response);
		}
		//callbackFn.slot.deselect();
	};
	callbackFn.slot=this;
	//The error function cancels any change.
	var callbackErr=function(){

	};
	callbackErr.slot=this;
	HtmlServer.showDialog("Edit text",question,currentVal,callbackFn,callbackErr);
	//Visually deselect the Slot.
	callbackFn.slot.deselect();
};
DropSlot.prototype.select=function(){
	var bG=BlockGraphics.dropSlot;
	this.selected=true;
	GuiElements.update.color(this.bgE,bG.selectedBg);
	GuiElements.update.opacity(this.bgE,bG.selectedBgOpacity);
	GuiElements.update.color(this.triE,bG.selectedTriFill);
}
DropSlot.prototype.deselect=function(){
	var bG=BlockGraphics.dropSlot;
	this.selected=false;
	GuiElements.update.color(this.bgE,bG.bg);
	GuiElements.update.opacity(this.bgE,bG.bgOpacity);
	GuiElements.update.color(this.triE,bG.triFill);
}
DropSlot.prototype.textSummary=function(){
	if(this.hasChild){
		return "[...]";
	}
	else{
		if(this.enteredData==null){
			return "[ ]";
		}
		return this.enteredData.asString().getValue();
	}
}
DropSlot.prototype.setSelectionData=function(text,data){
	this.enteredData=data;
	this.changeText(text);
	if(this.selected){
		this.deselect();
	}
};
DropSlot.prototype.getData=function(){
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
DropSlot.prototype.clearOptions=function(){
	this.optionsText=new Array();
	this.optionsData=new Array();
}