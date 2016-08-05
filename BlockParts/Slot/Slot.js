/* Slot is an abstract class that represents a space on a Block where data can be entered and Block attached.
 * Every Slot has a parent Block which it relies on heavily.
 * Slots can be edited in different ways, as indicated by their shape.
 * Slots can accept different types of Blocks and can automatically convert Data into a certain type.
 * Block implementations first update their Slots (compute their values) before accessing them.
 * Slots must implement updateDimNR(); moveSlot(x,y); hideSlot(); showSlot(); highlight(); buildSlot();
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of. Slots can't change their parents.
 * @param {number [none,num,string,drop]} inputType - The type of Data which can be directly entered into the Slot.
 * @param {number [none,numStrBool,bool,list,any} snapType - The type of Blocks which can be attached to the Slot.
 * @param {number [any,num,string,bool,list] - The type of Data the Slot should convert to before outputting.
 */
function Slot(parent,inputType,snapType,outputType){
	//Store data passed by constructor.
	this.inputType=inputType;
	this.snapType=snapType;
	this.outputType=outputType;
	this.parent=parent; //Parent Block.
	this.hasChild=false; //Nothing is attached yet.
	this.child=null; //Stores attached Block.
	this.width=0; //Will be computed later.
	this.height=0;
	this.x=0;
	this.y=0;
	this.isSlot=true; //All Block parts have this property.
	this.running=0; //Running: 0=Not started 2=Running 3=Completed
	this.resultIsFromChild=false; //The result to return comes from a child Block, not a direct input.
	this.resultData=null; //passed to Block for use in implementation.
}
Slot.setConstants=function(){
	//The type of Data which can be directly entered into the Slot.
	Slot.inputTypes=function(){};
	Slot.inputTypes.none=0; //Predicate Slots cannot be directly entered into.
	Slot.inputTypes.num=1; //Edited with numberpad
	Slot.inputTypes.string=2; //Edited with dialog.
	Slot.inputTypes.drop=3; //Edited with dropdown.
	//The type of Blocks which can be attached to the Slot.
	Slot.snapTypes=function(){};
	Slot.snapTypes.none=0; //Nothing can attach (dropdowns often)
	Slot.snapTypes.numStrBool=1; //Blocks with return type num, string, or bool can attach (will be auto cast).
	Slot.snapTypes.bool=2; //Only Blocks that return bool can attach.
	Slot.snapTypes.list=3; //Only Blocks that return lists can attach.
	Slot.snapTypes.any=4; //Any type of Block can attach (used for the = Block).
	//The type of Data the Slot should convert to before outputting. Guarantees the Block gets the type it wants.
	Slot.outputTypes=function(){};
	Slot.outputTypes.any=0; //No conversion will occur.
	Slot.outputTypes.num=1; //Convert to num.
	Slot.outputTypes.string=2; //Convert to string.
	Slot.outputTypes.bool=3; //Convert to bool.
	Slot.outputTypes.list=4; //Convert to list.
};
/* Recursively updates dimensions and those of children. */
Slot.prototype.updateDim=function(){
	if(this.hasChild){
		this.child.updateDim(); //Pass on message.
		this.width=this.child.width; //Width is determined by child if it has one.
		this.height=this.child.height;
	}
	else{
		//Run non recursive (NR) version if it has no child.
		this.updateDimNR(); //Depends on type of Slot. Implemented by subclasses.
	}
};
/* Recursively updates Slot's alignment and alignment of children.
 * @param {number} x - The x coord the Slot should have when completed relative to the Block it is in.
 * @param {number} y - The y coord ths Slot should have measured from the center of the Slot.
 * @return {number} - The width of the Slot, indicating how much the next item should be shifted over.
 * @fix - Measure y from top of Slot to make it consistent with Block.
 */
Slot.prototype.updateAlign=function(x,y){
	if(this.hasChild){
		//The x and y coords the child should have.
		var xCoord=x+this.parent.x; //converts coord from inside this Block's g to outside g
		var yCoord=y+this.parent.y-this.height/2; //Converts y to make it relative to top of Block.
		this.x=x; //Sets this Slot's x.
		this.y=y-this.height/2; //Converts y to make it relative to top of Block.
		return this.child.updateAlign(xCoord,yCoord); //Update child.
		//This Slot itself does not need to change visibly because it is covered by a Block.
	}
	else{
		this.x=x; //Sets this Slot's x.
		this.y=y-this.height/2; //Converts y to make it relative to top of Block.
		this.moveSlot(this.x,this.y); //Implemented by subclasses. Moves all parts of the Slot to new location.
		return this.width;
	}
};
/* Attaches a Block to the Slot.
 * @param {Block} block - The Block to attach.
 * @fix - stop Blocks that are currently running.
 */
Slot.prototype.snap=function(block){
	block.parent=this; //Set the Block's parent.
	if(this.hasChild){ //If the Slot already has a child, detach it and move it out of the way.
		var prevChild=this.child;
		prevChild.unsnap(); //Detach the old Block.
		prevChild.stack.shiftOver(block.stack.dim.rw,block.stack.dim.rh); //Move it over. //Fix! stack.dim
	}
	this.hasChild=true;
	this.child=block; //Set child.
	this.hideSlot(); //Slot graphics are covered and should be hidden.
	if(block.stack!=null) {
		var oldG = block.stack.group; //Old group can be deleted.
		block.stack.remove(); //Fix! use delete() instead.
		block.changeStack(this.parent.stack); //Move Block into this stack.
		oldG.remove();
	}
	if(this.parent.stack!=null) {
		this.parent.stack.updateDim(); //Update parent's dimensions.
	}
};
/* Recursively changes the stack of the Slot's children.
 * @param {BlockStack} stack - The stack to change to.
 */
Slot.prototype.changeStack=function(stack){
	if(this.hasChild){
		this.child.changeStack(stack); //Pass the message.
	}
};
/* Recursively stops the Slot and its children.
 */
Slot.prototype.stop=function(){
	this.clearMem(); //Stop Slot.
	if(this.hasChild){
		this.child.stop(); //Stop children.
	}
};
/* Update's the Slot's execution. Returns if it is still running.
 * @return {boolean} - Is the Slot still running?
 */
Slot.prototype.updateRun=function(){
	if(this.running==3){ //If the Slot has finished running, no need to update.
		return false; //Done running
	}
	if(this.hasChild){
		if(!this.child.updateRun()){ //Update the child first until it is done.
			this.running=3; //Copy data from child and finish execution.
			this.resultData=this.convertData(this.child.getResultData()); //Convert it to the proper type.
			this.resultIsFromChild=true;
			return false; //Done running
		}
		else{
			this.running=2; //Waiting for child to finish.
			return true; //Still running
		}
	}
	else{
		//The result is not from the child, so the getData function will figure out what to do.
		this.running=3;
		this.resultIsFromChild=false;
		return false; //Done running
	}
};
/* Overridden by subclasses. Returns the result of the Slot's execution.
 * @return {Data} - The result of the Slot's execution.
 */
Slot.prototype.getData=function(){
	if(this.running==3){ //It should be done running.
		if(this.resultIsFromChild){
			return this.resultData; //Return the result from the child.
		}
	}
	else{
		GuiElements.throwError("Slot.getData() run when Slot.running="+this.running);
	}
	return null; //Return the default value/entered value. Function is overridden to provide one.
};
/* Recursively updates the dimensions of the BlockStack.
 */
Slot.prototype.updateStackDim=function(){
	if(this.hasChild){
		this.child.updateStackDim(); //Pass on message.
	}
};
/* Removes the child and makes the Slot's graphics visible again.
 */
Slot.prototype.removeChild=function(){
	this.hasChild=false;
	this.child=null;
	this.showSlot();
};
/* Checks if the moving BlockStack fits within this Slot. Then recursively passes message on to children.
 * Returns nothing. Results stored in CodeManager.fit.
 */
Slot.prototype.findBestFit=function(){
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.getAbsX(); //Use coords relative to screen.
	var y=this.getAbsY();
	var typeMatches=this.checkFit(move.returnType); //Is the BlockStack's type compatible with the Slot?
	//Does the bounding box of the BlockStack overlap with the bounding box of the Slot?
	var locationMatches=move.rInRange(move.topX,move.topY,move.width,move.height,x,y,this.width,this.height);
	if(typeMatches&&locationMatches){
		var xDist=move.touchX-(x+this.width/2); //Compute the distance.
		var yDist=move.touchY-(y+this.height/2);
		var dist=xDist*xDist+yDist*yDist;
		if(!fit.found||dist<fit.dist){
			fit.found=true; //Store the match.
			fit.bestFit=this;
			fit.dist=dist;
		}
	}
	if(this.hasChild){
		this.child.findBestFit(); //Pass on the message.
	}
};
/* Determines if a Block's return type is compatible with this Slot's snap type.
 * @param {number [none,num,string,bool,list]} returnType - The return type of the Block.
 * @return {boolean} - Is the return type compatible with the snap type?
 */
Slot.prototype.checkFit=function(returnType){
	var sT=Slot.snapTypes;
	var rT=Block.returnTypes;
	var snapType=this.snapType;
	if(snapType==sT.none){
		//If the Slot accepts nothing, it isn't compatible.
		return false;
	}
	else if(snapType==sT.any){
		//If the Slot accepts anything, it is compatible.
		return true;
	}
	else if(snapType==sT.numStrBool){
		//Num, string, or bool is compatible.
		return returnType==rT.num||returnType==rT.string||returnType==rT.bool;
	}
	else if(snapType==sT.bool){
		//Only bool is compatible.
		return returnType==rT.bool;
	}
	else if(snapType==sT.list){
		//Only list is compatible.
		return returnType==rT.list;
	}
	else{
		//Should never be called.
		return false;
	}
};
/* Returns the x coord of the Slot relative to the screen (not the group it is contained in).
 * @return {number} - The x coord of the Slot relative to the screen.
 */
Slot.prototype.getAbsX=function(){
	return this.x+this.parent.getAbsX();
};
/* Returns the y coord of the Slot relative to the screen (not the group it is contained in).
 * @return {number} - The y coord of the Slot relative to the screen.
 */
Slot.prototype.getAbsY=function(){//Fix for tabs
	return this.y+this.parent.getAbsY();
};
/* Recursively copies the Slot and its children. Overridden by subclasses.
 * @param {Block} parentCopy - A copy of the Slot's parent.
 * @return {Slot} - A copy of the Slot.
 */
Slot.prototype.duplicate=function(parentCopy){
	var myCopy=new Slot(parentCopy,this.inputType,this.snapType,this.outputType);
	if(this.hasChild){
		myCopy.child=this.child.duplicate(0,0); //Copy child at 0,0. Doesn't matter where because will updateAlign().
		myCopy.hasChild=true;
	}
	return myCopy;
};
/* Clears the result data of the Slot and resets its running state. Is called by Block's clearMem function.
 */
Slot.prototype.clearMem=function(){
	this.resultData=null;
	this.running=0;
};
/* Converts the provided data to match the Slot's output type and returns it.
 * @param {Data} data - The Data to convert.
 * @return {Data} - The converted Data.
 */
Slot.prototype.convertData=function(data){
	var outType=this.outputType;
	var oT=Slot.outputTypes;
	if(outType==oT.any){
		//If any type will do, just return it.
		return data;
	}
	else if(outType==oT.num){
		//Convert to a num.
		return data.asNum();
	}
	else if(outType==oT.string){
		//Convert to a string.
		return data.asString();
	}
	else if(outType==oT.bool){
		//Convert to a bool.
		return data.asBool();
	}
	else if(outType==oT.list){
		//Convert to a list.
		return data.asList();
	}
	//Should not be called.
	return null;
};
/* Overridden by subclasses. Checks if a given message is still in use by any of the DropSlots. */
Slot.prototype.checkBroadcastMessageAvailable=function(message){
	return false;
};
/* Overridden by subclasses. Updates the available broadcast messages. */
Slot.prototype.updateAvailableMessages=function(){

};
Slot.prototype.renameVariable=function(variable){
	this.passRecursively("renameVariable",variable);
};
Slot.prototype.deleteVariable=function(variable){
	this.passRecursively("deleteVariable",variable);
};
Slot.prototype.renameList=function(list){
	this.passRecursively("renameList",list);
};
Slot.prototype.deleteList=function(list){
	this.passRecursively("deleteList",list);
};
Slot.prototype.hideHBDropDowns=function(){
	this.passRecursively("hideHBDropDowns");
};
Slot.prototype.showHBDropDowns=function(){
	this.passRecursively("showHBDropDowns");
};
Slot.prototype.countHBsInUse=function(){
	if(this.hasChild){
		return this.child.countHBsInUse();
	}
	return 0;
};
Slot.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	if(this.hasChild){
		this.child[functionName].apply(this.child,args);
	}
};
Slot.prototype.checkVariableUsed=function(variable){
	if(this.hasChild){
		return this.child.checkVariableUsed(variable);
	}
	return false;
};
Slot.prototype.checkListUsed=function(list){
	if(this.hasChild){
		return this.child.checkListUsed(list);
	}
	return false;
};
/*Slot.prototype.createXml=function(xmlDoc){
	var slot=XmlWriter.createElement(xmlDoc,"slot");
	XmlWriter.setAttribute(slot,"type","Slot");
	if(this.hasChild){
		var child=XmlWriter.createElement(xmlDoc,"child");
		child.appendChild(this.child.createXml(xmlDoc));
		slot.appendChild(child);
	}
	return slot;
};*/
/* Recursively tells children to glow. No longer used.
 * @fix delete this.
 */
/*
Slot.prototype.glow=function(){
	if(this.hasChild){
		this.child.glow();
	}
};
*/
/* Recursively tells children to stop glowing. No longer used.
 * @fix delete this.
 */
/*
Slot.prototype.stopGlow=function(){
	if(this.hasChild){
		this.child.stopGlow();
	}
};
*/