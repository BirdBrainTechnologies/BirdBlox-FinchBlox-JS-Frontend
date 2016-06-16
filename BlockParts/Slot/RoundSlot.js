/* RoundSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a Slot that can be edited with the InputPad's NumPad.
 * It is generally designed for nums, but can snap or output other types.
 * Its input type, however, is always num.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {number [none,numStrBool,bool,list,any} snapType - The type of Blocks which can be attached to the RoundSlot.
 * @param {number [any,num,string,bool,list] outputType - The type of Data the RoundSlot should convert to.
 * @param {number} value - The initial number stored in the Slot.
 * @param {boolean} positive - Determines if the NumPad will have the plus/minus Button disabled.
 * @param {boolean} integer - Determines if the NumPad will have the decimal point Button disabled.
 */
function RoundSlot(parent,snapType,outputType,value,positive,integer){
	Slot.call(this,parent,Slot.inputTypes.num,snapType,outputType); //Call constructor.
	//Entered data stores the data that has been entered using the InputPad.
	this.enteredData=new NumData(value); //Set entered data to initial value.
	this.positive=positive; //Store other properties.
	this.integer=integer;
	this.buildSlot(); //Create the SVG elements that make up the Slot.
	this.selected=false; //Indicates if the Slot is visually selected for editing.
	//Declare arrays for special options to list above the NumPad (i.e. "last" for "Item _ of Array" blocks)
	this.optionsText=new Array(); //The text of the special option.
	this.optionsData=new Array(); //The Data representing that option (never visible to the user).
}
RoundSlot.prototype = Object.create(Slot.prototype);
RoundSlot.prototype.constructor = RoundSlot;
/* Builds the Slot's SVG elements such as its oval, text, and invisible hit box.
 */
RoundSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight; //Used for center alignment.
	this.textW=0; //Will be calculated later.
	this.slotE=this.generateSlot();//Fix! BG
	this.textE=this.generateText(this.enteredData.getValue());
	this.hitBoxE=this.generateHitBox(); //Creates an invisible box for receiving touches.
};
/* Moves the Slot's SVG elements to the specified location.
 * @param {number} x - The x coord of the Slot.
 * @param {number} y - The y coord of the Slot.
 */
RoundSlot.prototype.moveSlot=function(x,y){
	var bG=BlockGraphics.getType(1);//Fix! BG
	BlockGraphics.update.path(this.slotE,x,y,this.width,this.height,1,true);//Fix! BG
	var textX=x+bG.slotHMargin; //The text has a left margin in the oval. //Fix! does not center if Slot too small.
	var textY=y+this.textH/2+this.height/2; //The text is centered in the oval.
	BlockGraphics.update.text(this.textE,textX,textY); //Move the text.
	var bGHB=BlockGraphics.hitBox; //Get data about the size of the hit box.
	var hitX=x-bGHB.hMargin; //Compute its x and y coords.
	var hitY=y-bGHB.vMargin;
	var hitW=this.width+bGHB.hMargin*2; //Compute its width and height.
	var hitH=this.height+bGHB.vMargin*2;
	GuiElements.update.rect(this.hitBoxE,hitX,hitY,hitW,hitH); //Move/resize its rectangle.
};
/* Makes the Slot's SVG elements invisible. Used when child is added.
 */
RoundSlot.prototype.hideSlot=function(){
	this.slotE.remove();
	this.textE.remove();
	this.hitBoxE.remove();
};
/* Makes the Slot's SVG elements visible. Used when child is removed.
 */
RoundSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.slotE);
	this.parent.group.appendChild(this.textE);
	this.parent.group.appendChild(this.hitBoxE);
};
/* Generates and returns an SVG text element to display the Slot's value.
 * @param {string} text - The text to add to the element.
 * @return {SVG text} - The finished SVG text element.
 */
RoundSlot.prototype.generateText=function(text){ //Fix BG
	var obj=BlockGraphics.create.valueText(text,this.parent.group);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
/* Generates and returns an SVG path element to be the oval part of the Slot.
 * @return {SVG path} - The finished SVG path element.
 * @fix BlockGraphics number reference.
 */
RoundSlot.prototype.generateSlot=function(){
	var obj=BlockGraphics.create.slot(this.parent.group,1,this.parent.category);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
/* Generates and returns a transparent rectangle which enlarges the touch area of the Slot.
 * @return {SVG rect} - The finished SVG rect element.
 */
RoundSlot.prototype.generateHitBox=function(){
	var obj=BlockGraphics.create.slotHitBox(this.parent.group);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
/* Changes the value text of the Slot. Stores value in this.text. Updates parent's stack dims.
 * @param {string} text - The text to change the visible value to.
 */
RoundSlot.prototype.changeText=function(text){
	this.text=text; //Store value
	GuiElements.update.text(this.textE,text); //Update text.
	this.parent.stack.updateDim(); //Update dimensions.
};
/* Computes the dimensions of the SVG elements making up the Slot.
 * Only called if has no child.
 */
RoundSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.reporter; //Get dimension data.
	this.textW=GuiElements.measure.textWidth(this.textE); //Measure text element.
	var width=this.textW+2*bG.slotHMargin; //Add space for margins.
	var height=bG.slotHeight; //Has no child, so is just the default height.
	if(width<bG.slotWidth){ //Check if width is less than the minimum.
		width=bG.slotWidth;
	}
	this.width=width; //Save computations.
	this.height=height;
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
		var x=this.getAbsX(); //Get coords relative to the screen.
		var y=this.getAbsY();
		this.select(); //Change appearance to reflect editing.
		InputPad.resetPad(); //Prepare the InputPad for editing.
		for(var i=0;i<this.optionsText.length;i++){ //Add special options to the inputPad (if any).
			InputPad.addOption(this.optionsText[i],this.optionsData[i]);
		}
		//Show the NumPad at the proper location.
		InputPad.showNumPad(this,x+this.width/2,y,y+this.height,this.positive,this.integer);
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
		GuiElements.throwError("Attempt to call saveNumData on Slot that is not selected.");
	}
};
/* Recursively copies the RoundSlot and its children.
 * @param {Block} parentCopy - A copy of the RoundSlot's parent.
 * @return {RoundSlot} - A copy of the RoundSlot.
 */
RoundSlot.prototype.duplicate=function(parentCopy){
	var value=this.enteredData.getValue();
	//Use constructor.
	var myCopy=new RoundSlot(parentCopy,this.snapType,this.outputType,value,this.positive,this.integer);
	for(var i=0;i<this.optionsText.length;i++){ //Copy special options.
		myCopy.addOption(this.optionsText[i],this.optionsData[i]);
	}
	if(this.hasChild){ //Copy child
		myCopy.child=this.child.duplicate(0,0);
		myCopy.hasChild=true;
	}
	return myCopy;
};
/* Selects the Slot for editing and changes its appearance.
 */
RoundSlot.prototype.select=function(){
	this.selected=true;
	GuiElements.update.color(this.slotE,BlockGraphics.reporter.slotSelectedFill);
	GuiElements.update.color(this.textE,BlockGraphics.valueText.selectedFill);
};
/* Deselects the Slot after editing and changes its appearance.
 */
RoundSlot.prototype.deselect=function(){
	this.selected=false;
	GuiElements.update.color(this.slotE,BlockGraphics.reporter.slotFill);
	GuiElements.update.color(this.textE,BlockGraphics.valueText.fill);
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
	GuiElements.update.color(this.textE,BlockGraphics.valueText.grayedFill);
};
/* Makes the value text the default edit color again. */
RoundSlot.prototype.ungrayValue=function(){
	GuiElements.update.color(this.textE,BlockGraphics.valueText.selectedFill);
};