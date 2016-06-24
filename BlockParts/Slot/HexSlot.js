/* HexSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a hexagonal Slot that can hold Blocks but not be edited via InputPad or dialog.
 * Its input type and output type is always bool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {number [none,numStrBool,bool,list,any} snapType - The type of Blocks which can be attached to the RoundSlot.
 */
function HexSlot(parent,snapType){
	Slot.call(this,parent,Slot.inputTypes.bool,snapType,Slot.outputTypes.bool); //Call constructor.
	this.buildSlot(); //Create the SVG elements that make up the Slot.
}
HexSlot.prototype = Object.create(Slot.prototype);
HexSlot.prototype.constructor = HexSlot;
/* Builds the Slot's SVG path.
 */
HexSlot.prototype.buildSlot=function(){
	this.slotE=this.generateSlot();
};
/* Moves the Slot's SVG elements to the specified location.
 * @param {number} x - The x coord of the Slot.
 * @param {number} y - The y coord of the Slot.
 */
HexSlot.prototype.moveSlot=function(x,y){
	BlockGraphics.update.path(this.slotE,x,y,this.width,this.height,2,true);//Fix! BG
};
/* Makes the Slot's SVG elements invisible. Used when child is added.
 */
HexSlot.prototype.hideSlot=function(){
	this.slotE.remove();
};
/* Makes the Slot's SVG elements visible. Used when child is removed.
 */
HexSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.slotE);
};
/* Generates and returns an SVG path element to be the hexagon part of the Slot.
 * @return {SVG path} - The finished SVG path element.
 * @fix BlockGraphics number reference.
 */
HexSlot.prototype.generateSlot=function(){
	var obj=BlockGraphics.create.slot(this.parent.group,2,this.parent.category);
	TouchReceiver.addListenersChild(obj,this.parent); //Adds event listeners.
	return obj;
};
/* Computes the dimensions of the SVG elements making up the Slot.
 * Only called if has no child.
 */
HexSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.predicate;
	this.width=bG.slotWidth; //Has no child or value, so just use defaults.
	this.height=bG.slotHeight
};
/* Adds an indicator showing that the moving BlockStack will snap onto this Slot if released.
 * @fix BlockGraphics
 */
HexSlot.prototype.highlight=function(){
	var isSlot=!this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,2,isSlot);
};
/* Recursively copies the HexSlot and its children.
 * @param {Block} parentCopy - A copy of the HexSlot's parent.
 * @return {HexSlot} - A copy of the HexSlot.
 */
HexSlot.prototype.duplicate=function(parentCopy){
	//Use constructor.
	var myCopy=new HexSlot(parentCopy,this.snapType);
	if(this.hasChild){ //Copy child
		myCopy.snap(this.child.duplicate(0,0));
	}
	return myCopy;
};
/* Returns a text-based version of the Slot for display in dialogs.
 * @return {string} - The text-based summary of the Slot.
 */
HexSlot.prototype.textSummary=function(){
	//Angle brackets are used because it is a HexSlot.
	if(this.hasChild){ //If it has a child, just use an ellipsis.
		return "<...>";
	}
	else{ //Otherwise, it is empty.
		return "<>";
	}
};
/* Returns the result of the HexSlot's execution for use by its parent Block.
 * @return {Data} - The result of the HexSlot's execution.
 */
HexSlot.prototype.getData=function(){
	if(this.running==3){ //The Slot must have finished executing.
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return new BoolData(false,false); //The Slot is empty. Return default value of false.
		}
	}
	GuiElements.throwError("Called HexSlot.getData() when running="+this.running);
	return null;
};