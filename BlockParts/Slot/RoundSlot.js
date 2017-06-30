/**
 * RoundSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a Slot that can be edited with the InputPad's NumPad.
 * It is generally designed for nums, but can snap or output other types.
 * Its input type, however, is always num.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {string} key - The name of the Slot. Used for reading and writing save files.
 * @param {number} snapType - [none,numStrBool,bool,list,any] The type of Blocks which can be attached to the RoundSlot.
 * @param {number} outputType - [any,num,string,bool,list] The type of Data the RoundSlot should convert to.
 * @param {number} data - The initial data stored in the Slot. Could be string, num, or selection data.
 * @param {boolean} positive - Determines if the NumPad will have the plus/minus Button disabled.
 * @param {boolean} integer - Determines if the NumPad will have the decimal point Button disabled.
 */
function RoundSlot(parent,key,snapType,outputType,data,positive,integer){
	Slot.call(this,parent,key,Slot.inputTypes.num,snapType,outputType); //Call constructor.
	//Entered data stores the data that has been entered using the InputPad.
	this.enteredData=data; //Set entered data to initial value.
	this.text=this.enteredData.asString().getValue();
	this.positive=positive; //Store other properties.
	this.integer=integer;
	this.slotShape = new RoundSlotShape(this, data.asString().getValue());
	this.slotShape.show();
	this.selected=false; //Indicates if the Slot is visually selected for editing.
	//Declare arrays for special options to list above the NumPad (i.e. "last" for "Item _ of Array" blocks)
	this.optionsText = []; //The text of the special option.
	this.optionsData = []; //The Data representing that option (never visible to the user).
	this.dropColumns = 1; //The number of columns to show in the drop down.
}
RoundSlot.prototype = Object.create(Slot.prototype);
RoundSlot.prototype.constructor = RoundSlot;
RoundSlot.prototype.changeText=function(text){
	this.text=text; //Store value
	this.slotShape.changeText(text);
	if(this.parent.stack!=null) {
		this.parent.stack.updateDim(); //Update dimensions.
	}
};
/* Adds an indicator showing that the moving BlockStack will snap onto this Slot if released.
 * @fix BlockGraphics
 */
RoundSlot.prototype.highlight=function(){
	var isSlot=!this.hasChild; //Fix! unclear.
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,1,isSlot);
};
/* Prepares the Slot for editing using the InputPad. Selects the Slot and shows the NumPad.
 * @fix allow InputPad to be next to Slot.
 */
RoundSlot.prototype.edit=function(){
	if(!this.selected){
		var x1 = this.getAbsX();
		var x2 = this.relToAbsX(this.width); //Get coords relative to the screen.
		var y1 = this.getAbsY();
		var y2 = this.relToAbsY(this.height);
		this.select(); //Change appearance to reflect editing.
		InputPad.resetPad(this.dropColumns); //Prepare the InputPad for editing with the correct number of columns.
		for(var i=0;i<this.optionsText.length;i++){ //Add special options to the inputPad (if any).
			InputPad.addOption(this.optionsText[i],this.optionsData[i]);
		}
		//Show the NumPad at the proper location.
		InputPad.showNumPad(this,x1, x2, y1, y2,this.positive,this.integer);
	}
};
/* Shows a dialog to allow text to be entered into the Slot. Uses a callback function with enteredData and changeText.
 * Only used for special RoundSlots.
 */
RoundSlot.prototype.editText=function(){
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
/* Updates the enteredData value and value text of the Slot to match what has been entered on the InputPad.
 * @param {string} visibleText - What the value text should become.
 * @param {Data} data - What the enteredData should be set to.
 */
RoundSlot.prototype.updateEdit=function(visibleText,data){
	if(this.selected){ //Only can edit if the Slot is selected.
		this.enteredData=data;
		this.changeText(visibleText);
	}
	else{
		GuiElements.throwError("Attempt to call updateEdit on Slot that is not selected.");
	}
};
/* Saves the Data from the InputPad to the Slot, updates the text, and deselects the Slot.
 * @param {Data} data - The Data to save to the Slot.
 */
RoundSlot.prototype.saveNumData=function(data){
	if(this.selected){ //Only can edit if the Slot is selected.
		this.enteredData=data; //Save data.
		this.changeText(data.asString().getValue()); //Display data.
		this.deselect();
	}
	else{
		throw new UserException("Attempt to call updateEdit on Slot that is not selected.");
	}
};
/**
 * Copies data and blocks from a Slot into this Slot
 * @param {RoundSlot} slot - The slot to copy from
 */
RoundSlot.prototype.copyFrom=function(slot){
	var data = slot.enteredData;
	this.enteredData = data;
	this.changeText(data.asString().getValue());
	if(slot.hasChild){
		this.snap(slot.child.duplicate(0,0));
	}
};
/* Selects the Slot for editing and changes its appearance.
 */
RoundSlot.prototype.select=function(){
	this.selected=true;
	this.slotShape.select();
};
/* Deselects the Slot after editing and changes its appearance.
 */
RoundSlot.prototype.deselect=function(){
	this.selected=false;
	this.slotShape.deselect();
};
/* Returns a text-based version of the Slot for display in dialogs.
 * @return {string} - The text-based summary of the Slot.
 */
RoundSlot.prototype.textSummary=function(){
	//Curved parentheses are used because it is a RoundSlot.
	if(this.hasChild){ //If it has a child, just use an ellipsis.
		return "(...)";
	}
	else{ //Otherwise, print the value.
		return "("+this.enteredData.asString().getValue()+")";
	}
};
/* Returns the result of the RoundSlot's execution for use by its parent Block.
 * @return {Data} - The result of the RoundSlot's execution.
 */
RoundSlot.prototype.getData=function(){
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
		GuiElements.throwError("RoundSlot.getData() run with child when running="+this.running);
		return null;
	}
	else{
		//If it has no child, data can be read at any time.
		return this.enteredData;
	}
};
/* Adds a special option to the Slot which will be provided on the NumPad.
 * @param {string} displayText - The text the option will be displayed as.
 * @param {Data} data - The Data which will be stored in the Slot if the option is selected.
 */
RoundSlot.prototype.addOption=function(displayText,data){
	this.optionsText.push(displayText);
	this.optionsData.push(data);
};
/* Saves non-numeric SelectionData into the RoundSlot. Changes the value text and deselects the Slot as well.
 * Only used if a special option has non-numeric Data in it.
 * @param {string} text - The value text to display.
 * @param {SelectionData} data - The Data to store.
 */
RoundSlot.prototype.setSelectionData=function(text,data){
	this.enteredData=data;
	this.changeText(text);
	if(this.selected){
		this.deselect();
	}
};
/* Makes the value text gray to indicate that any key will delete it. */
RoundSlot.prototype.grayOutValue=function(){
	this.slotShape.grayOutValue();
};
/* Makes the value text the default edit color again. */
RoundSlot.prototype.ungrayValue=function(){
	this.slotShape.unGrayOutValue();
};

RoundSlot.prototype.createXml=function(xmlDoc){
	var slot = Slot.prototype.createXml.call(this, xmlDoc);
	XmlWriter.setAttribute(slot,"type","RoundSlot");
	var enteredData=XmlWriter.createElement(xmlDoc,"enteredData");
	enteredData.appendChild(this.enteredData.createXml(xmlDoc));
	slot.appendChild(enteredData);
	XmlWriter.setAttribute(slot,"text",this.text);
	return slot;
};
RoundSlot.prototype.importXml=function(slotNode){
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="RoundSlot"){
		return this;
	}
	var enteredDataNode=XmlWriter.findSubElement(slotNode,"enteredData");
	var dataNode=XmlWriter.findSubElement(enteredDataNode,"data");
	if(dataNode!=null){
		var data=Data.importXml(dataNode);
		if(data!=null){
			this.enteredData=data;
			var text=XmlWriter.getAttribute(slotNode,"text",data.asString().getValue());
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