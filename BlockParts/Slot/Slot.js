/**
 * Slot is an abstract class that represents a space on a Block where data can be entered and other Blocks can be
 * attached.
 * Every Slot has a parent Block which it relies on heavily.
 * Slots can be edited in different ways, as indicated by their shape.
 * Slots can accept different types of Blocks and can automatically convert Data into a certain type.
 * Block implementations first update their Slots (compute their values) before accessing them during execution.
 * Each Slot has a slotShape, as determined by the subclass that manages the appearance of the slot when nothing
 * is snapped to it.
 * Slots must implement highlight(); textSummary(); and getDataNotFromChild();
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of. Slots can't change their parents.
 * @param {string} key - The name of the Slot. Used for reading and writing save files.
 * @param {number} snapType - [none, numStrBool, bool, list, any] The type of Blocks which can be attached to the Slot.
 * @param {number} outputType - [any, num, string, bool, list] The type of Data the Slot should convert to.
 */
function Slot(parent, key, snapType, outputType){
	DebugOptions.validateNonNull(parent, key, snapType, outputType);
	//Key always includes "_" and is of the form DataType_description. See BlockDefs for examples
	DebugOptions.assert(key.includes("_"));
	//Store data passed by constructor.
	this.snapType = snapType;
	this.outputType = outputType;
	this.parent = parent; //Parent Block.
	this.key = key;
	this.hasChild = false; //Nothing is attached yet.
	this.child = null; //Stores attached Block.
	this.width = 0; //Will be computed later using updateDim
	this.height = 0;
	this.x = 0;
	this.y = 0;
	this.isSlot = true; //All Block parts have this property. //TODO: Remove unused field
	this.running = 0; //Running: 0 = Not started 2 = Running 3 = Completed //TODO: Switch to enum
	this.resultIsFromChild = false; //The result to return comes from a child Block, not a direct input.
	this.resultData = null; //passed to Block for use in implementation.
	/** @type {SlotShape} */
	this.slotShape = undefined;
}
Slot.setConstants = function(){
	//The type of Blocks which can be attached to the Slot.
	Slot.snapTypes = {};
	Slot.snapTypes.none = 0; //Nothing can attach (dropdowns often)
	Slot.snapTypes.numStrBool = 1; //Blocks with return type num, string, or bool can attach (will be auto cast).
	Slot.snapTypes.bool = 2; //Only Blocks that return bool can attach.
	Slot.snapTypes.list = 3; //Only Blocks that return lists can attach.
	Slot.snapTypes.any = 4; //Any type of Block can attach (used for the = Block).
	//The type of Data the Slot should convert to before outputting. Guarantees the Block gets the type it wants.
	Slot.outputTypes = {};
	Slot.outputTypes.any = 0; //No conversion will occur.
	Slot.outputTypes.num = 1; //Convert to num.
	Slot.outputTypes.string = 2; //Convert to string.
	Slot.outputTypes.bool = 3; //Convert to bool.
	Slot.outputTypes.list = 4; //Convert to list.
};

/** Recursively updates dimensions and those of children. */
Slot.prototype.updateDim = function(){
	if(this.hasChild){
		//Width is determined by child if it has one.
		this.child.updateDim(); //Pass on message.
		this.width = this.child.width;
		this.height = this.child.height;
	}
	else{
		//Otherwise, the size of the slot graphic is used.
		this.width = this.slotShape.width;
		this.height = this.slotShape.height;
	}
};

/**
 * Recursively updates Slot's alignment and alignment of children.
 * @param {number} x - The x coord the Slot should have when completed relative to the Block it is in.
 * @param {number} y - The y coord ths Slot should have measured from the center of the Slot.
 * @return {number} - The width of the Slot, indicating how much the next item should be shifted over.
 * TODO: Measure y from top of Slot to make it consistent with Block.
 */
Slot.prototype.updateAlign = function(x, y){
	DebugOptions.validateNumbers(x, y);
	if(this.hasChild){
		//The x and y coords the child should have.
		//TODO: Use relToAbs for this
		const xCoord = x + this.parent.x; //converts coord from inside this Block's g to outside g
		const yCoord = y + this.parent.y - this.height / 2; //Converts y to make it relative to top of Block.
		this.x = x; //Sets this Slot's x.
		this.y = y - this.height / 2; //Converts y to make it relative to top of Block.
		return this.child.updateAlign(xCoord, yCoord); //Update child.
		//This Slot itself does not need to change visibly because it is covered by a Block.
	}
	else{
		this.x = x; //Sets this Slot's x.
		this.y = y - this.height / 2; //Converts y to make it relative to top of Block.
		this.slotShape.move(this.x, this.y); //Moves the graphic to the correct position
		return this.width;
	}
};

/**
 * Attaches a Block to the Slot.  Changes the Block's stack to that of the Slot
 * @param {Block} block - The Block to attach.
 * TODO: Stop code that is currently running.
 */
Slot.prototype.snap = function(block){
	DebugOptions.validateNonNull(block);
	block.parent = this; //Set the Block's parent.
	if(this.hasChild){ //If the Slot already has a child, detach it and move it out of the way.
		const prevChild = this.child;
		prevChild.unsnap(); //Detach the old Block.
		prevChild.stack.shiftOver(block.stack.dim.rw, block.stack.dim.rh); //Move it over. //Fix! stack.dim
	}
	this.hasChild = true;
	this.child = block; //Set child.
	this.slotShape.hide(); //Slot graphics are covered and should be hidden.
	if(block.stack != null) {
		const oldG = block.stack.group; //Old group can be deleted.
		block.stack.remove(); //TODO: use delete() instead.
		block.changeStack(this.parent.stack); //Move Block into this stack.
		oldG.remove();
	}
	if(this.parent.stack != null) {
		this.parent.stack.updateDim(); //Update parent's dimensions.
	}
};

/**
 * Recursively changes the stack of the Slot's children.
 * @param {BlockStack} stack - The stack to change to.
 */
Slot.prototype.changeStack = function(stack){
	DebugOptions.validateNonNull(stack);
	if(this.hasChild){
		this.child.changeStack(stack); //Pass the message.
	}
};

/**
 * Recursively stops the Slot and its children.
 */
Slot.prototype.stop = function(){
	this.clearMem(); //Stop Slot.
	if(this.hasChild){
		this.child.stop(); //Stop children.
	}
};

/**
 * Update's the Slot's execution. Returns if it is still running.
 * @return {ExecutionStatus} - Is the Slot still running or has crashed?
 */
Slot.prototype.updateRun = function(){
	if(this.running === 3){ //If the Slot has finished running, no need to update.
		return new ExecutionStatusDone(); //Done running
	}
	if(this.hasChild){
		let childExecStatus = this.child.updateRun();
		if(!childExecStatus.isRunning()){ //Update the child first until it is done.
			if(childExecStatus.hasError()){
				this.running = 3;
				return childExecStatus;
			} else{
				this.running = 3; //Copy data from child and finish execution.
				this.resultData = this.convertData(childExecStatus.getResult()); //Convert it to the proper type.
				this.resultIsFromChild = true;
				return new ExecutionStatusDone();
			}
		}
		else{
			this.running = 2; //Waiting for child to finish.
			return new ExecutionStatusRunning(); //Still running
		}
	}
	else{
		//The result is not from the child, so the getData function will figure out what to do.
		this.running = 3;
		this.resultIsFromChild = false;
		return new ExecutionStatusDone(); //Done running
	}
};

/**
 * Overridden by subclasses. Returns the result of the Slot's execution.
 * @return {Data} - The result of the Slot's execution.
 */
Slot.prototype.getData = function(){
	if(this.running === 3){
		//If the Slot finished executing, resultIsFromChild determines where to read the result from.
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return this.getDataNotFromChild();
		}
	}
	//If it isn't done executing and has a child, throw an error.
	DebugOptions.assert(!this.hasChild);
	DebugOptions.assert(false);
};

/**
 * Returns the result if the slot has no child
 * @abstract
 */
Slot.prototype.getDataNotFromChild = function(){
	GuiElements.markAbstract();
};

/** Recursively updates the dimensions of the BlockStack. */
Slot.prototype.updateStackDim = function(){
	if(this.hasChild){
		this.child.updateStackDim(); //Pass on message.
	}
};

/** Removes the child and makes the Slot's graphics visible again. */
Slot.prototype.removeChild = function(){
	this.hasChild = false;
	this.child = null;
	this.slotShape.show();
};

/**
 * Checks if the moving BlockStack fits within this Slot. Then recursively passes message on to children.
 * Returns nothing. Results stored in CodeManager.fit.
 * @return {boolean} - true iff this Slot or one of its descendants can accept the moving blocks
 */
Slot.prototype.findBestFit = function(){
	// Only the highest eligible slot on the connection tree is allowed to accept the blocks.
	let childHasMatch = false;
	// The slot is a leaf unless one of its decedents is a leaf.
	if(this.hasChild){
		childHasMatch = this.child.findBestFit(); // Pass on the message.
	}
	if(childHasMatch){
		// Don't bother checking this slot if it already has a matching decedents.
		return true;
	}

	// shorthand
	const move = CodeManager.move;
	const fit = CodeManager.fit;

	// Use coords relative to screen.
	const x = this.getAbsX();
	const y = this.getAbsY();
	const myHeight = this.getAbsHeight();
	const myWidth = this.getAbsWidth();

	// Is the BlockStack's type compatible with the Slot?
	const typeMatches = this.checkFit(move.returnType);

	// Does the bounding box of the BlockStack overlap with the bounding box of the Slot?
	const width = move.bottomX - move.topX;
	const height = move.bottomY - move.topY;
	const locationMatches = move.rInRange(move.topX, move.topY, width, height, x,y, myWidth, myHeight);

	// If so, use distance to find the best fit
	if(typeMatches && locationMatches){
		const xDist = move.touchX - (x + this.width / 2); //Compute the distance.
		const yDist = move.touchY - (y + this.height / 2);
		const dist = xDist * xDist + yDist * yDist;
		if(!fit.found || dist < fit.dist){
			fit.found = true; //Store the match.
			fit.bestFit = this;
			fit.dist = dist;
		}
		// Found match
		return true;
	}
	// No compatible descendants
	return false;
};

/**
 * Determines if a Block's return type is compatible with this Slot's snap type.
 * @param {number} outputType - [none, num, string, bool, list] The return type of the Block.
 * @return {boolean} - Is the return type compatible with the snap type?
 */
Slot.prototype.checkFit = function(outputType){
	DebugOptions.validateNonNull(outputType);
	const sT = Slot.snapTypes;
	const rT = Block.returnTypes;
	const snapType = this.snapType;
	if(snapType === sT.none){
		//If the Slot accepts nothing, it isn't compatible.
		return false;
	}
	else if(snapType === sT.any){
		//If the Slot accepts anything, it is compatible.
		return true;
	}
	else if(snapType === sT.numStrBool){
		//Num, string, or bool is compatible.
		return outputType === rT.num || outputType === rT.string || outputType === rT.bool;
	}
	else if(snapType === sT.bool){
		//Only bool is compatible.
		return outputType === rT.bool;
	}
	else if(snapType === sT.list){
		//Only list is compatible.
		return outputType === rT.list;
	}
	else{
		//Should never be called.
		DebugOptions.assert(false);
		return false;
	}
};

// These functions convert between screen (absolute) coordinates and local (relative) coordinates.
/**
 * @param {number} x
 * @returns {number}
 */
Slot.prototype.relToAbsX = function(x){
	return this.parent.relToAbsX(x + this.x);
};
/**
 * @param {number} y
 * @returns {number}
 */
Slot.prototype.relToAbsY = function(y){
	return this.parent.relToAbsY(y + this.y);
};
/**
 * @param {number} x
 * @returns {number}
 */
Slot.prototype.absToRelX = function(x){
	return this.parent.absToRelX(x) - this.x;
};
/**
 * @param {number} y
 * @returns {number}
 */
Slot.prototype.absToRelY = function(y){
	return this.parent.absToRelY(y) - this.y;
};
/**
 * Returns the x coord of the Slot relative to the screen (not the group it is contained in).
 * @return {number} - The x coord of the Slot relative to the screen.
 */
Slot.prototype.getAbsX = function(){
	return this.relToAbsX(0);
};
/**
 * Returns the y coord of the Slot relative to the screen (not the group it is contained in).
 * @return {number} - The y coord of the Slot relative to the screen.
 */
Slot.prototype.getAbsY = function(){//Fix for tabs
	return this.relToAbsY(0);
};
/**
 * @returns {number}
 */
Slot.prototype.getAbsWidth = function(){
	return this.relToAbsX(this.width) - this.getAbsX();
};
/**
 * @returns {number}
 */
Slot.prototype.getAbsHeight = function(){
	return this.relToAbsY(this.height) - this.getAbsY();
};

/**
 * Copies data and blocks from a Slot into this Slot
 * @param {Slot} slot - The slot to copy from
 */
Slot.prototype.copyFrom = function(slot){
	DebugOptions.validateNonNull(slot);
	if(slot.hasChild){
		this.snap(slot.child.duplicate(0,0));
	}
};

/** Clears the result data of the Slot and resets its running state. Is called by Block's clearMem function. */
Slot.prototype.clearMem = function(){
	this.resultData = null;
	this.running = 0;
};

/**
 * Converts the provided data to match the Slot's output type and returns it.
 * TODO: make NumSlot override this and lock value to min/max.  Perhaps combine with sanitize
 * @param {Data} data - The Data to convert.
 * @return {Data} - The converted Data.
 */
Slot.prototype.convertData = function(data){
	DebugOptions.validateNonNull(data);
	const outType = this.outputType;
	const oT = Slot.outputTypes;
	if(outType === oT.any){
		//If any type will do, just return it.
		return data;
	}
	else if(outType === oT.num){
		//Convert to a num.
		return data.asNum();
	}
	else if(outType === oT.string){
		//Convert to a string.
		return data.asString();
	}
	else if(outType === oT.bool){
		//Convert to a bool.
		return data.asBool();
	}
	else if(outType === oT.list){
		//Convert to a list.
		return data.asList();
	}
	//Should not be called.
	DebugOptions.assert(false);
	return null;
};

/** Overridden by subclasses. Updates the available broadcast messages. */
Slot.prototype.updateAvailableMessages = function(){

};

/**
 * Recursively renames a variable
 * @param {Variable} variable
 */
Slot.prototype.renameVariable = function(variable){
	this.passRecursively("renameVariable",variable);
};

/**
 * Recursively deletes a variable
 * @param {Variable} variable
 */
Slot.prototype.deleteVariable = function(variable){
	this.passRecursively("deleteVariable",variable);
};

/**
 * Recursively renames a list
 * @param {List} list
 */
Slot.prototype.renameList = function(list){
	this.passRecursively("renameList",list);
};

/**
 * Deletes a list
 * @param {List} list
 */
Slot.prototype.deleteList = function(list){
	this.passRecursively("deleteList",list);
};

/**
 * Recursively hides device dropdowns
 * @param deviceClass - A subclass of the Device class
 */
Slot.prototype.hideDeviceDropDowns = function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
};

/**
 * Recursively shows device dropdowns
 * @param deviceClass - A subclass of the Device class
 */
Slot.prototype.showDeviceDropDowns = function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
};

/**
 * Recursively counts devices in use of a certain device type
 * @param deviceClass - A subclass of the Device class
 * @returns {number}
 */
Slot.prototype.countDevicesInUse = function(deviceClass){
	if(this.hasChild){
		return this.child.countDevicesInUse(deviceClass);
	}
	return 0;
};

Slot.prototype.updateAvailableSensors = function(){
	this.passRecursively("updateAvailableSensors");
};

Slot.prototype.updateConnectionStatus = function(){

};

Slot.prototype.passRecursivelyDown = function(message){
	let funArgs = Array.prototype.slice.call(arguments, 1);
	if(message === "updateConnectionStatus") {
		this.updateConnectionStatus.apply(this, funArgs);
	}
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	this.passRecursively.apply(this, arguments);
};

/**
 * Calls the given function on its children
 * @param {string} functionName - The name of the function being called
 */
Slot.prototype.passRecursively = function(functionName){
	const args = Array.prototype.slice.call(arguments, 1);
	if(this.hasChild){
		this.child[functionName].apply(this.child, args);
	}
};

/**
 * Checks if the given variable is ever referenced
 * @param {Variable} variable - The variable to check
 * @returns {boolean} - Returns if the variable is used by the Slot's descendants
 */
Slot.prototype.checkVariableUsed = function(variable){
	if(this.hasChild){
		return this.child.checkVariableUsed(variable);
	}
	return false;
};

/**
 * Checks if the given list is ever referenced
 * @param {List} list - The list to check
 * @returns {boolean} - Returns if the list is used by the Slot's descendants
 */
Slot.prototype.checkListUsed = function(list){
	if(this.hasChild){
		return this.child.checkListUsed(list);
	}
	return false;
};

/**
 * Appends information about this Slot to the document
 * @param {DOMParser} xmlDoc - The document to append to
 * @return {Node} - The XML node of the Slot
 */
Slot.prototype.createXml = function(xmlDoc){
	DebugOptions.validateNonNull(xmlDoc);
	const slot = XmlWriter.createElement(xmlDoc,"slot");
	XmlWriter.setAttribute(slot,"key",this.key);
	if(this.hasChild){
		const child = XmlWriter.createElement(xmlDoc,"child");
		child.appendChild(this.child.createXml(xmlDoc));
		slot.appendChild(child);
	}
	return slot;
};

/**
 * Imports the data from the node to this Slot
 * @param {Node} slotNode
 * @return {Slot} - A reference to this Slot
 */
Slot.prototype.importXml = function(slotNode) {
	DebugOptions.validateNonNull(slotNode);
	const childNode = XmlWriter.findSubElement(slotNode, "child");
	const blockNode = XmlWriter.findSubElement(childNode, "block");
	if(blockNode != null) {
		const childBlock = Block.importXml(blockNode);
		if(childBlock != null) {
			this.snap(childBlock);
		}
	}
	return this;
};

/**
 * Returns this Slot's key
 * @returns {string}
 */
Slot.prototype.getKey = function(){
	return this.key;
};

/**
 * Draws a white border around the slot to indicate that the blocks being dragged will snap to it if released.
 * @abstract
 */
Slot.prototype.highlight = function(){
	DebugOptions.markAbstract();
};

/**
 * Creates a string representing the slot and its content
 * @return {string}
 * @abstract
 */
Slot.prototype.textSummary = function(){
	DebugOptions.markAbstract();
};

Slot.prototype.makeActive = function(){
	this.slotShape.makeActive();
};

Slot.prototype.makeInactive = function(){
	this.slotShape.makeInactive();
};
Slot.prototype.setActive = function(active){
	if(active){
		this.makeActive();
	} else {
		this.makeInactive();
	}
};