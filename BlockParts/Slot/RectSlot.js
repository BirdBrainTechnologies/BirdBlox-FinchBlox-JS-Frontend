/* RectSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a Slot that can be edited with a dialog.
 * It is generally designed to hold a string and its input type is always string.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {number [none,numStrBool,bool,list,any} snapType - The type of Blocks which can be attached to the RoundSlot.
 * @param {number [any,num,string,bool,list] outputType - The type of Data the RoundSlot should convert to.
 * @param {string} value - The initial string stored in the Slot.
 */
function RectSlot(parent,key,snapType,outputType,value){
	Slot.call(this,parent,key,Slot.inputTypes.string,snapType,outputType); //Call constructor.
	this.enteredData=new StringData(value); //Set entered data to initial value.
	this.slotShape = new RectSlotShape(this, value);
	this.slotShape.show();
}
RectSlot.prototype = Object.create(Slot.prototype);
RectSlot.prototype.constructor = RectSlot;
/* Builds the Slot's SVG elements such as its rectangle, text, and invisible hit box.
 */
/*
RectSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight; //Used for centering.
	this.textW=0; //Will be calculated later.
	this.slotE=this.generateSlot();
	this.textE=this.generateText(this.enteredData.getValue());
	this.hitBoxE=this.generateHitBox(); //Creates an invisible box for receiving touches.
};
*/
/* Moves the Slot's SVG elements to the specified location.
 * @param {number} x - The x coord of the Slot.
 * @param {number} y - The y coord of the Slot.
 * @fix moving hitbox is redundant with RoundSlot.
 */
RectSlot.prototype.moveSlot=function(x,y){
	this.slotShape.move(x, y);
};
/* Makes the Slot's SVG elements invisible. Used when child is added.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.hideSlot=function(){
	this.slotShape.hide();
};
/* Makes the Slot's SVG elements visible. Used when child is removed.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.showSlot=function(){
	this.slotShape.show();
};
/* Generates and returns an SVG text element to display the Slot's value.
 * @param {string} text - The text to add to the element.
 * @return {SVG text} - The finished SVG text element.
 * @fix redundant with RoundSlot.
 */
/*
RectSlot.prototype.generateText=function(text){ //Fix BG
	var obj=BlockGraphics.create.valueText(text,this.parent.group);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
*/
/* Generates and returns an SVG path element to be the rectangle part of the Slot.
 * @return {SVG path} - The finished SVG path element.
 * @fix BlockGraphics number reference.
 */
/*
RectSlot.prototype.generateSlot=function(){//Fix BG
	var obj=BlockGraphics.create.slot(this.parent.group,3,this.parent.category);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
};
*/
/* Generates and returns a transparent rectangle which enlarges the touch area of the Slot.
 * @return {SVG rect} - The finished SVG rect element.
 * @fix redundant with RoundSlot.
 */
/*
RectSlot.prototype.generateHitBox=function(){
	var obj=BlockGraphics.create.slotHitBox(this.parent.group);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
*/
/* Changes the value text of the Slot. Updates parent's stack dims.
 * @param {string} text - The text to change the visible value to.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.changeText=function(text){
	this.slotShape.changeText(text);
	if(this.parent.stack!=null) {
		this.parent.stack.updateDim(); //Update dimensions.
	}
};
/* Computes the dimensions of the SVG elements making up the Slot.
 * Only called if has no child.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.updateDimNR=function(){
	this.width = this.slotShape.width;
	this.height = this.slotShape.height;
};
/* Adds an indicator showing that the moving BlockStack will snap onto this Slot if released.
 * @fix BlockGraphics
 */
RectSlot.prototype.highlight=function(){//Fix BG
	var isSlot=!this.hasChild; //Fix! unclear.
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
};
/* Opens a dialog to edit this Slot.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.edit=function(){
	//Builds a text-based representation of the Block with "___" in place of this Slot.
	var question=this.parent.textSummary(this);
	//Get the current value for the hint text.
	var currentVal=this.enteredData.getValue();
	//The callback function changes the text.
	var callbackFn=function(cancelled,response){
		if(!cancelled){
			callbackFn.slot.enteredData=new StringData(response);
			callbackFn.slot.changeText(response);
			SaveManager.markEdited();
		}
	};
	callbackFn.slot=this;
	//Show the dialog.
	HtmlServer.showDialog("Edit text",question,currentVal,callbackFn);
};
/**
 * Copies data and blocks from a Slot into this Slot
 * @param {RectSlot} slot - The slot to copy from
 */
RectSlot.prototype.copyFrom=function(slot){
	var data = slot.enteredData;
	this.enteredData = data;
	this.changeText(data.asString().getValue());
	if(slot.hasChild){
		this.snap(slot.child.duplicate(0,0));
	}
};
/* Returns a text-based version of the Slot for display in dialogs.
 * @return {string} - The text-based summary of the Slot.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.textSummary=function(){
	//Square brackets are used because it is a RectSlot.
	if(this.hasChild){ //If it has a child, just use an ellipsis.
		return "[...]";
	}
	else{ //Otherwise, print the value.
		return "["+this.enteredData.getValue()+"]";
	}
};
/* Returns the result of the RoundSlot's execution for use by its parent Block.
 * @return {Data} - The result of the RectSlot's execution.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.getData=function(){
	if(this.running==3){
		//If the Slot finished executing, resultIsFromChild determines where to read the result from.
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return this.enteredData;
		}
	}
	if(this.hasChild){
		//If it isn't done executing and has a child, throw an error.
		GuiElements.throwError("RectSlot.getData() run with child when running="+this.running);
		return null;
	}
	else{
		//If it has no child, data can be read at any time.
		return this.enteredData;
	}
};

RectSlot.prototype.createXml=function(xmlDoc){
	var slot = Slot.prototype.createXml.call(this, xmlDoc);
	XmlWriter.setAttribute(slot,"type","RectSlot");
	var enteredData=XmlWriter.createElement(xmlDoc,"enteredData");
	enteredData.appendChild(this.enteredData.createXml(xmlDoc));
	slot.appendChild(enteredData);
	if(this.hasChild){
		var child=XmlWriter.createElement(xmlDoc,"child");
		child.appendChild(this.child.createXml(xmlDoc));
		slot.appendChild(child);
	}
	return slot;
};
RectSlot.prototype.importXml=function(slotNode){
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="RectSlot"){
		return this;
	}
	var enteredDataNode=XmlWriter.findSubElement(slotNode,"enteredData");
	var dataNode=XmlWriter.findSubElement(enteredDataNode,"data");
	if(dataNode!=null){
		var data=Data.importXml(dataNode);
		if(data!=null){
			this.enteredData=data;
			var text=data.asString().getValue();
			this.changeText(text);
		}
	}
	var childNode=XmlWriter.findSubElement(slotNode,"child");
	var blockNode=XmlWriter.findSubElement(childNode,"block");
	if(blockNode!=null) {
		var childBlock = Block.importXml(blockNode);
		if (childBlock != null) {
			this.snap(childBlock);
		}
	}
	return this;
};