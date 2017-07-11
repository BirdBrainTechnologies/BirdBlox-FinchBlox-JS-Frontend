"use strict";
/**
 * Block is an abstract class that represents an executable block.
 * Blocks are nearly always contained within BlockStacks or DisplayStacks.
 * Blocks are initially created outside a BlockStacks, but are immediately moved into one.  
 * This is because BlockStacks must always contain at least one Block, so the Block must be created first.
 * @constructor
 * TODO: remove the type parameter and use blockShape and instead.
 * @param {number} type - The shape of the Block.  0 = Command, 1 = Reporter, 2 = Predicate, 4 = Hat, 5 = Loop, 6 = DoubleLoop.
 * @param {number} returnType - The type of data the Block returns.  Possible values stored in Block.returnTypes.
 * @param {number} x - The x coord of the Block (relative to the Tab/BlockStack/DisplayStack it is in).
 * @param {number} y - The y coord of the Block.
 * @param {string} category - The Block's category in string form.
 */
function Block(type,returnType,x,y,category){ //Type: 0 = Command, 1 = Reporter, 2 = Predicate Fix! BG
	this.blockTypeName = this.constructor.name; //Keeps track of what type of Block this is.

	this.x = x; //Store coords
	this.y = y;
	this.type = type; //Fix! remove this property
	this.bottomOpen=(type===0 || type === 4 || type === 5 || type === 6); //Can Blocks be attached to the bottom of this Block?
	this.topOpen=(type===0 || type === 5 || type === 6); //Can Blocks be attached to the top of this Block?
	this.returnsValue=(returnType!==Block.returnTypes.none); //Does this Block attack to Slots and return a value?
	this.returnType = returnType; //What type of value does this Block return?
	this.hasBlockSlot1=(type === 5 || type === 6); //Is this Block like an if block that has a special BlockSlot?
	this.hasBlockSlot2=(type === 6); //Does it have two BlockSlots?
	this.hasHat=(type === 4); //Is it a HatBlock?

	this.group = GuiElements.create.group(x,y); //Make a group to contain the part of this Block.
	this.parent = null; //A Block's parent is the Block/Slot/BlockSlot that it is attached to.  Currently, it has none.
	this.parts = []; //The parts of a Block include its LabelText, BlockIcons, and Slots.
	/** @type {Slot[]} */
	this.slots = []; //The slots array just holds the Slots.
	this.running = 0; //Running: 0 = Not started, 1 = Waiting for slots to finish, 2 = Running, 3 = Completed.
	this.category = category;
	this.isGlowing = false;
	this.active = this.checkActive(); //Indicates if the Block is full color or grayed out (as a result of a missing sensor/robot)

	this.stack = null; //It has no Stack yet.
	this.path = this.generatePath(); //This path is the main visual part of the Block. It is colored based on category.
	this.height = 0; //Will be set later when the Block's dimensions are updated.
	this.width = 0;
	this.runMem = function(){}; //serves as a place for the block to store info while running
	if(this.bottomOpen){
		this.nextBlock = null; //Reference to the Block below this one.
	}
	if(this.returnsValue){
		this.resultData = null; //Stores the Data to be passed on to the Slot containing this Block.
	}
	if(this.hasBlockSlot1){
		this.topHeight = 0; //The height of just the top of the Block (where the LabelText and Slots are)
		this.blockSlot1 = new BlockSlot(this);
	}
	if(this.hasBlockSlot2){
		//The height of the middle part of a DoubleLoopBlock (where the LabelText "else" is on the if/else Block)
		this.midHeight = 0;
		this.midLabel = new LabelText(this,this.midLabelText); //The text to appear in the middle section (i.e. "else");
		this.blockSlot2 = new BlockSlot(this);
	}
}

/**
 * Sets the possible values for Block.returnTypes.
 */
Block.setConstants = function(){
	Block.returnTypes = function(){};
	Block.returnTypes.none = 0; //A command Block always is Block.returnTypes.none.
	Block.returnTypes.num = 1;
	Block.returnTypes.string = 2;
	Block.returnTypes.bool = 3;
	Block.returnTypes.list = 4;
};

/**
 * Converts an x coord relative to the Block to an x coord relative to the screen
 * @param {number} x
 * @returns {number}
 */
Block.prototype.relToAbsX = function(x){
	if(this.stack != null) {
		return this.stack.relToAbsX(x + this.x);
	}
	return x + this.x;
};
/**
 * Converts a y coord relative to the Block to a y coord relative to the screen
 * @param {number} y
 * @returns {number}
 */
Block.prototype.relToAbsY = function(y){
	if(this.stack != null) {
		return this.stack.relToAbsY(y + this.y);
	}
	return y + this.y;
};
/**
 * Converts an x coord relative to the screen to an x coord relative to the Block
 * @param x
 * @returns {number}
 */
Block.prototype.absToRelX = function(x){
	if(this.stack != null) {
		return this.stack.absToRelX(x) - this.x;
	}
	return x - this.x;
};
/**
 * Converts a y coord relative to the screen to a y coord relative to the Block
 * @param y
 * @returns {number}
 */
Block.prototype.absToRelY = function(y){
	if(this.stack != null) {
		return this.stack.absToRelY(y) - this.y;
	}
	return y - this.y;
};
/**
 * Returns the x coord of the Block relative to the screen (not the group it is contained in).
 * @return {number} - The x coord of the Block relative to the screen.
 */
Block.prototype.getAbsX = function(){
	return this.relToAbsX(0);
};
/**
 * Returns the y coord of the Block relative to the screen.
 * @return {number} - The y coord of the Block relative to the screen.
 */
Block.prototype.getAbsY = function(){
	return this.relToAbsY(0);
};

/**
 * Creates and returns the main SVG path element for the Block.
 * @return {object} - The main SVG path element for the Block.
 */
Block.prototype.generatePath = function(){
	const pathE = BlockGraphics.create.block(this.category, this.group, this.returnsValue, this.active);
	TouchReceiver.addListenersChild(pathE,this);
	return pathE;
};

/**
 * Adds a part (LabelText, BlockIcon, or Slot) to the Block.
 * @param {LabelText|BlockIcon|Slot} part - part to add.
 */
Block.prototype.addPart = function(part){
	this.parts.push(part);
	if(part.isSlot){ //Slots are kept track of separately for recursive calls.
		this.slots.push(part);
	}
};

/**
 * Moves the Block and sets its this.x and this.y values.
 * @param {number} x - New x coord.
 * @param {number} y - New y coord.
 */
Block.prototype.move = function(x,y){
	this.x = x;
	this.y = y;
	//All parts of the Block are contained within its group to allow for easy movement.
	GuiElements.move.group(this.group, x, y);
};

/**
 * Recursively stops the Block, its Slots, and any subsequent Blocks.
 */
Block.prototype.stop = function(){
	this.running = 0; //Stop this Block.
	this.runMem = {}; //Clear memory
	for(let i = 0;i < this.slots.length;i++){
		this.slots[i].stop(); //Stop this Block's Slots.
	}
	if(this.blockSlot1 != null){
		this.blockSlot1.stop(); //Stop the BlockSlots.
	}
	if(this.blockSlot2 != null){
		this.blockSlot2.stop();
	}
	if(this.bottomOpen&&this.nextBlock != null){
		this.nextBlock.stop(); //Stop the next Block.
	}
};

/**
 * Updates this currently executing Block and returns if the Block is still running
 * @return {ExecutionStatus} - Indicates if the Block is still running and should be updated again.
 */
Block.prototype.updateRun = function(){
	//If a Block is told to run and it has not started or believes it is finished (from a previous execution)...
	if(this.running === 0 || this.running === 3){
		for(let i = 0;i < this.slots.length;i++){ //...Reset all Slots to prepare for execution
			this.slots[i].stop();
		}
		this.running = 1; //Now the Block is ready to run its Slots.
	}
	let myExecStatus; //The value to return.
	if(this.running === 1){ //If the Block is currently waiting on its Slots...
		for(let i = 0;i < this.slots.length;i++){
			//Check to see if each Slot is done and update the first Slot that isn't done.
			let slotExecStatus = this.slots[i].updateRun();
			//If the slot is still running...
			if(slotExecStatus.isRunning()){
				//The Block is still running and will execute again next time
				return new ExecutionStatusRunning();
			} else if(slotExecStatus.hasError()) {
				//If the slot through an error, the Block is done running, and will pass the error up the call stack.
				this.running = 3;
				return slotExecStatus;
			}
		}
		this.running = 2; //If all Slots are done running, the Block itself may now run.
		//This function is overridden by the class of the particular Block.
		//It sets the Block up for execution, and if it is a simple Block, may even complete execution.
		myExecStatus = this.startAction();
	}
	else if(this.running === 2){ //If the Block is currently running, update it.
		//This function is also overridden and is called repeatedly until the Block is done running.
		myExecStatus = this.updateAction();
	}
	if(!myExecStatus.isRunning()){ //If the block is done running...
		if(this.running !== 0) {
			this.running = 3; //Record that the Block is done, provided that it was started
		}
		this.clearMem(); //Clear its runMem to prevent its computations from leaking into subsequent executions.
	}
	return myExecStatus; //Return a boolean indicating if this Block is done.
};

/**
 * Will be overridden. Is triggered once when the Block is first executed. Contains the Block's actual behavior.
 * @return {ExecutionStatus} - indicating if it has finished.
 */
Block.prototype.startAction = function(){
	return new ExecutionStatusRunning(); //Still running
};

/**
 * Will be overridden. Is triggered repeatedly until the Block is done running. Contains the Block's actual behavior.
 * @return {ExecutionStatus} - The next Block to run or a boolean indicating if it has finished.
 */
Block.prototype.updateAction = function(){
	return new ExecutionStatusRunning(); //Still running //Fix! by default this should be false.
};

/**
 * Once the Block is done executing, this function is used by a Slot to retrieve the Block's result.
 * Only used if Block returns a value.
 * Once the Block returns its value, it is done and can reset its state.
 * @return {Data} - The result of the Block's execution.
 */
Block.prototype.getResultData = function(){
	DebugOptions.assert(this.returnsValue);
	if(this.running === 3){ //Only return data if the Block is done running.
		this.running = 0; //Reset the Block's state. Prevents same data from ever being re-returned
		return this.resultData; //Access stored result data and return it.
	}
	return null; //If called when the block is not done running, return null. This should never happen.
};

/**
 * Recursively moves the Block, its Slots, and subsequent Blocks to another stack.
 * @param {BlockStack} stack - The stack the Blocks will be moved to.
 */
Block.prototype.changeStack = function(stack){
	this.stack = stack; //Move this Block to the stack
	this.group.remove(); //Remove this Block's SVG group from that of the old stack.
	stack.group.appendChild(this.group); //Add this Block's SVG group to the new stack.
	for(let i = 0;i < this.slots.length;i++){
		this.slots[i].changeStack(stack); //Recursively tell this Block's Slots to move thir children to the new stack.
	}
	if(this.nextBlock != null){
		this.nextBlock.changeStack(stack); //Tell the next block to move.
	}
	if(this.blockSlot1 != null){
		this.blockSlot1.changeStack(stack); //If this block is a loop/if tell its contents to move.
	}
	if(this.blockSlot2 != null){
		this.blockSlot2.changeStack(stack); //If it has a second BlockSlot, move it too.
	}
};

/**
 * Each BlockStack keeps track of its bounding rectangle.  This function recursively tells the Blocks to update it.
 * Each Block checks to see if it is outside the proposed bounding rectangle and if so adjusts it.
 * This function just handles the recursive part. The actual checks and adjustment are handled by updateStackDimO
 */
Block.prototype.updateStackDim = function(){
	//Slots are updated separately by updateStackDimRI.
	if(this.blockSlot1 != null){
		this.blockSlot1.updateStackDim(); //If this block is a loop/if tell its contents to update.
	}
	if(this.blockSlot2 != null){
		this.blockSlot2.updateStackDim(); //If it has a second BlockSlot, update it too.
	}
	this.updateStackDimRI(); //Update the stack dimensions using information from this Block.
	if(this.nextBlock != null){
		this.nextBlock.updateStackDim(); //Tell the next block to update.
	}
};

/**
 * Handles more of the recursion for updateStackDim.
 * RI stands for Recursive Inside.  RI functions update slots but not subsequent Blocks or BlockSlots.
 * This allows other functions to avoid unnecessary updates when full recursion is not needed.
 * updateStackDimO handled the actual updates.
 */
Block.prototype.updateStackDimRI = function(){
	for(let i = 0;i < this.slots.length;i++){
		this.slots[i].updateStackDim(); //Pass message on to Slots.
	}
	this.updateStackDimO(); //Update this Block.
};

/**
 * Checks to see if the Block is outside the bounding box of its Stack and if so adjusts it.
 * It is called recursively by updateStackDim and updateStackDimRI.
 * The stack has two bounding boxes. Both are used when looking for potential Blocks to snap to.
 * Reporters/predicates can snap to the large r bounding box.
 * Commands can snap to the smaller c bounding box.
 * (the r box is larger because they can be snapped to the middle of other blocks while command blocks can't)
 * The point of stack bounding boxes is that when looking for potential Blocks to snap only those inside a matching
 * stack have to be investigated.
 */
Block.prototype.updateStackDimO = function(){
	let sDim = this.stack.dim; //Loads the stack's dimension data.
	let snap = BlockGraphics.command.snap; //Loads the snap bounding box for command blocks.
	if(this.bottomOpen || this.topOpen){ //Only update the c box if this is a command block //Fix! use !this.returnsValue
		let cx1 = this.x - snap.left; //Create bounding rectangle for this particular command Block
		let cy1 = this.y - snap.top;
		let cx2 = this.x + snap.right;
		let cy2 = this.y + this.height + snap.bottom;
		if(cx1 < sDim.cx1){ //If the edge of the Block is outside the stack, adjust the stack's dims.
			sDim.cx1 = cx1;
		}
		if(cy1 < sDim.cy1){
			sDim.cy1 = cy1;
		}
		if(cx2>sDim.cx2){
			sDim.cx2 = cx2;
		}
		if(cy2>sDim.cy2){
			sDim.cy2 = cy2;
		}
	}
	let rx1 = this.x; //The r bounding box is just the size of the Block itself.
	let ry1 = this.y;
	let rx2 = this.x + this.width;
	let ry2 = this.y + this.height;
	if(rx1 < sDim.rx1){ //If the edge of the Block is outside the stack, adjust the stack's dims.
		sDim.rx1 = rx1;
	}
	if(ry1 < sDim.ry1){
		sDim.ry1 = ry1;
	}
	if(rx2>sDim.rx2){
		sDim.rx2 = rx2;
	}
	if(ry2>sDim.ry2){
		sDim.ry2 = ry2;
	}
	//The Stacks dimensions now include the Block.
	//Note that the r box is also the visual bounding box of the stack as well as the reporter snap bounding box.
};

/**
 * Recursively adjusts the sizes of all the parts of the Block (Slots, children, labels, etc.)
 * It does not move the parts, however.  That is done later using updateAlign once the sizing is finished.
 */
Block.prototype.updateDim = function(){
	let bG = BlockGraphics.getType(this.type); //Fix! loads dimension data from BlockGraphics.
	if(this.topOpen || this.bottomOpen){ //If this is a command block, then use the BlockGraphics for command blocks.
		bG = BlockGraphics.command; //If the block if a Loop or DoubleLoop, use the CommandBlock dimension instead.
	}
	let width = 0;
	width += bG.hMargin; //The left margin of the Block.
	let height = 0;
	for(let i = 0;i < this.parts.length;i++){
		this.parts[i].updateDim(); //Tell all parts of the Block to update before using their widths for calculations.
		width += this.parts[i].width; //Fill the width of the middle of the Block
		if(this.parts[i].height>height){ //The height of the Block is the height of the tallest member.
			height = this.parts[i].height;
		}
		if(i < this.parts.length - 1){
			width += BlockGraphics.block.pMargin; //Add "part margin" between parts of the Block.
		}
	}
	width += bG.hMargin; //Add the right margin of the Block.
	height += 2*bG.vMargin; //Add the bottom and top margins of the Block.
	if(height < bG.height){ //If the height is less than the min height, fix it.
		height = bG.height;
	}
	if(this.hasBlockSlot1){ //If it has a BlockSlot update that.
		this.topHeight = height; //The topHeight is the height of everything avove the BlockSlot.
		this.blockSlot1.updateDim(); //Update the BlockSlot.
		height += this.blockSlot1.height; //The total height, however, includes the BlockSlot.
		height += BlockGraphics.loop.bottomH; //It also includes the bottom part of the loop.
	}
	if(this.hasBlockSlot2){ //If the Block has a second BlockSlot...
		this.midLabel.updateDim(); //Update the label in between the two BlockSlots.
		this.midHeight = this.midLabel.height; //Add the Label's height to the total.
		this.midHeight += 2*bG.vMargin; //The height between the BlockSlots also includes the margin of that area.
		if(this.midHeight < bG.height){ //If it's less than the minimum, adjust it.
			this.midHeight = bG.height;
		}
		height += this.midHeight; //Add the midHeight to the total.
		this.blockSlot2.updateDim(); //Update the secodn BlockSlot.
		height += this.blockSlot2.height; //Add its height to the total.
	}
	//If the Block was a loop or DoubleLoop now we are dealing with its actual properties (not those of command)
	bG = BlockGraphics.getType(this.type);
	if(width < bG.width){ //If it is less than the minimum width, adjust it.
		width = bG.width;
	}
	this.resize(width,height); //Resize this Block to the new widths.
	if(this.nextBlock != null){
		this.nextBlock.updateDim(); //Pass the message to the next Block.
	}
};

/**
 * Recursively adjusts the positioning of all the parts of the Block (Slots, children, labels, etc.)
 * The BlockStack calls this function after the updateDim function, so all sizes are correct.
 * @param {number} x - The x coord this block should have when completed.
 * @param {number} y - The y coord the block should have.
 * @return {number} - The width of the current block, indicating how much the x should shift over.
 * y is measured from the top for all Blocks, x is measured from the left.
 */
Block.prototype.updateAlign = function(x,y){
	let bG = BlockGraphics;
	this.updateAlignRI(x,y); //Update recursively within the block.
	if(this.hasBlockSlot1){ //Then tell all susequent blocks to align.
		this.blockSlot1.updateAlign(this.x + bG.loop.side,this.y + this.topHeight);
	}
	if(this.hasBlockSlot2){
		this.blockSlot2.updateAlign(this.x + bG.loop.side,this.y + this.topHeight + this.blockSlot1.height + this.midHeight);
		this.midLabel.updateAlign(bG.loop.side,this.topHeight + this.blockSlot1.height + this.midHeight/2);
	}
	if(this.nextBlock != null){
		this.nextBlock.updateAlign(this.x,this.y + this.height);
	}
	return this.width;
};

/**
 * Adjusts the positioning of the Block's internal parts.  Recursively updates their children.
 * @param {number} x - The x coord this block should have when completed.
 * @param {number} y - The y coord the block should have.
 * y is measured from the top for all Blocks, x is measured from the left.
 */
Block.prototype.updateAlignRI = function(x,y){
	this.move(x,y); //Move to the desired location
	let bG = BlockGraphics.getType(this.type);
	let yCoord = this.height/2; //Compute coords for internal parts.
	let xCoord = 0;
	if(this.hasBlockSlot1){
		yCoord = this.topHeight/2; //Internal parts measure their y coords from the center of the block.
	}
	if(this.bottomOpen || this.topOpen){
		bG = BlockGraphics.command;
	}
	xCoord += bG.hMargin;
	for(let i = 0;i < this.parts.length;i++){
		xCoord += this.parts[i].updateAlign(xCoord,yCoord); //As each element is adjusted, shift over by the space used.
		if(i < this.parts.length - 1){
			xCoord += BlockGraphics.block.pMargin;
		}
	}
};

/**
 * Resizes the path of the Block to the specified width and height.  The sizes of its BlockSlots are also considered.
 * @param {number} width - The desired width of the Block.
 * @param {number} height - The desired height of the Block.
 */
Block.prototype.resize = function(width,height){
	let BG = BlockGraphics;
	//First set width and height properties.
	this.width = width;
	this.height = height;
	//Then collect other necessary information.
	let innerHeight1 = 0;
	let innerHeight2 = 0;
	let midHeight = 0;
	if(this.hasBlockSlot1){
		innerHeight1 = this.blockSlot1.height;
	}
	if(this.hasBlockSlot2){
		innerHeight2 = this.blockSlot2.height;
		midHeight = this.midHeight;
	}
	//Tell BlockGraphics to change the path description to match the new properties.
	BG.update.path(this.path,0,0,width,height,this.type,false,innerHeight1,innerHeight2,midHeight,this.bottomOpen);
};

/**
 * Recursively searches for the Block with best fits the currently moving BlockStack.
 * Stores information about any matches in CodeManager.fit and uses data from CodeManager.move.
 * A command block attempts to find a connection between its bottom and the moving stack's top.
 * Connections to the top of the stack's findBestFit.
 */
Block.prototype.findBestFit = function(){
	let move = CodeManager.move;
	let fit = CodeManager.fit;
	let x = this.getAbsX(); //Get coords to compare.
	let y = this.getAbsY();
	let height = this.relToAbsY(this.height) - y;
	let hasMatch = false;

	if(move.returnsValue) { //If a connection between the stack and block are possible...
		for(let i = 0;i < this.slots.length;i++){
			let slotHasMatch = this.slots[i].findBestFit();
			hasMatch = slotHasMatch || hasMatch;
		}
	}
	else if(move.topOpen&&this.bottomOpen) { //If a connection between the stack and block are possible...
		let snap = BlockGraphics.command.snap; //Load snap bounding box
		//see if corner of moving block falls within the snap bounding box.
		let snapBLeft = x - snap.left;
		let snapBTop = y - snap.top;
		let snapBWidth = snap.left + snap.right;
		let snapBHeight = snap.top + height + snap.bottom;
		//Check if point falls in a rectangular range.
		if(move.pInRange(move.topX,move.topY,snapBLeft,snapBTop,snapBWidth,snapBHeight)) {
			let xDist = move.topX - x; //If it does, compute the distance with the distance formula.
			let yDist = move.topY - (y + this.height);
			let dist = xDist * xDist + yDist * yDist; //Technically this is the distance^2.
			if (!fit.found || dist < fit.dist) { //See if this fit is closer than the current best fit.
				fit.found = true; //If so, save it and other helpful infromation.
				fit.bestFit = this;
				fit.dist = dist;
			}
		}
	}
	if(this.hasBlockSlot1){ //Pass the message on recursively.
		this.blockSlot1.findBestFit();
	}
	if(this.hasBlockSlot2){
		this.blockSlot2.findBestFit();
	}
	if(this.nextBlock != null){
		this.nextBlock.findBestFit();
	}
	return hasMatch;
};

/**
 * Adds an indicator showing that the moving BlockStack will snap onto this Block if released.
 * The indicator is a different color/shape depending on the Block's type and if it is running.
 */
Block.prototype.highlight = function(){
	if(this.bottomOpen){
		Highlighter.highlight(this.getAbsX(),this.relToAbsY(this.height),this.width,this.height,0,false,this.isGlowing);
	}
	else{ //If a block returns a value, the BlockStack can only attach to one of its slots, not the Block itself.
		GuiElements.throwError("Error: attempt to highlight block that has bottomOpen = false");
	}
};

/**
 * Attaches the provided Block (and all subsequent Block's) to the bottom of this Block. Then runs updateDim();
 * @param {Block} block - The first Block in the stack to attach to this Block.
 */
Block.prototype.snap = function(block){
	//If the Block cannot have other blocks below it, any other blocks must now be disconnected.
	//Get the bottom Block in the stack to be inserted.
	let bottomStackBlock = block.getLastBlock();
	//If the stack being inserted can't have blocks below it, and there is a block after this Block...
	if(!bottomStackBlock.bottomOpen&&this.nextBlock != null){
		let bG = BlockGraphics.command;
		//Disconnect the blocks after this Block and shift them over to make room.
		this.nextBlock.unsnap().shiftOver(bG.shiftX,block.stack.getHeight()+bG.shiftY);
	}
	let stack = this.stack;
	//If the Block we are inserting is part of a stack...
	if(block.stack != null) {
		block.stack.stop();
		if(stack.isRunning) {
			// Make it glow if this stack is running
			block.glow();
		}
	}
	let upperBlock = this; //The Block which will go above the inserted stack.
	let lowerBlock = this.nextBlock;//The Block which will go below the inserted stack. Might be null.
	let topStackBlock = block; //The top Block in the stack to be inserted.

	//The top of where the stack is inserted note which Blocks are above/below them.
	upperBlock.nextBlock = topStackBlock;
	topStackBlock.parent = upperBlock;
	//The bottom of where the stack is inserted does the same.
	bottomStackBlock.nextBlock = lowerBlock;
	if(lowerBlock != null){ //There might not be a Block below the inserted stack.
		lowerBlock.parent = bottomStackBlock;
	}
	let oldG = null;
	if(block.stack != null) {
		oldG = block.stack.group; //Get a handle to the old stack's group
		block.stack.remove(); //Remove the old stack.
	}
	if(this.stack != null) {
		block.changeStack(this.stack); //Move the block over into this stack
	}
	if(oldG != null) {
		oldG.remove(); //Remove the old stack's group.
	}
	if(this.stack != null) {
		//Update the dimensions now that the movement is complete.
		this.stack.updateDim();
		//Update the arros on the sides of the screen in case the new block now extends beyond the edge
		this.stack.tab.updateArrows();
	}
};

/**
 * Disconnects this Block from the Blocks above it and returns the newly-created BlockStack. Calls updateDim on parent.
 * @return {BlockStack} - A BlockStack containing this Block and all subsequent Blocks.
 */
Block.prototype.unsnap = function(){
	//If this has a parent, then it needs to disconnect and make a new stack.  Otherwise, it returns its current stack.
	if(this.parent != null){
		if(this.parent.isSlot || this.parent.isBlockSlot){ //Sees if it is attached to a Slot not another Block.
			this.parent.removeChild(); //Leave the Slot.
			this.parent.parent.stack.updateDim(); //Tell the stack the Slot belongs to to update its dimensions.
		}
		else{ //This Block is connected to another Block.
			this.parent.nextBlock = null; //Disconnect from parent Block.
			this.parent.stack.updateDim(); //Tell parent's stack to update dimensions.
		}
		this.parent = null; //Delete reference to parent Block/Slot/BlockSlot.
		//Make a new BlockStack with this Block in current Tab.  Also moves over any subsequent Blocks.
		return new BlockStack(this,this.stack.getTab());
	}
	//If the Block already had no parent, just return this Block's stack.
	return this.stack;
};

/**
 * Recursively finds and returns the last Block in this BlockStack.
 * @return {Block} - The last Block in this BlockStack.
 */
Block.prototype.getLastBlock = function(){
	if(this.nextBlock == null){
		return this; //This Block is the last one.
	}
	else{
		return this.nextBlock.getLastBlock(); //Try the next Block.
	}
};

/**
 * Recursively returns the height of this Block and all subsequent Blocks. Used by BlockSlots to determine height.
 * @return {number} - The height of this Block and all subsequent Blocks.
 */
Block.prototype.addHeights = function(){
	if(this.nextBlock != null){
		return this.height + this.nextBlock.addHeights(); //Return this Block's height plus those below it.
	}
	else{
		return this.height; //This is the last Block. Return its height.
	}
};

/**
 * Returns a copy of this Block, its Slots, subsequent Blocks, and nested Blocks.
 * Mutually recursive with copyFrom.
 * @param {number} x - The new Block's x coord.
 * @param {number} y - The new Block's y coord.
 * @return {Block} - This Block's copy.
 */
Block.prototype.duplicate = function(x, y){
	let myCopy = null;
	// First we use this Block's constructor to create a new block of the same type
	// If this Block is a list or variable Block, we must pass that data to the constructor
	if(this.variable != null){
		myCopy = new this.constructor(x, y, this.variable);
	}
	else if(this.list != null){
		myCopy = new this.constructor(x, y, this.list);
	}
	else {
		myCopy = new this.constructor(x, y);
	}
	// Then we tell the new block to copy its data from this Block
	myCopy.copyFrom(this);
	return myCopy;
};

/**
 * Takes a Block and copies its slot data.  Duplicates all blocks below the Block and in its slots.
 * Mutually recursive with duplicate.
 * @param {Block} block - The block to copy the data from.  Must be of the same type.
 */
Block.prototype.copyFrom = function(block){
	DebugOptions.assert(block.blockTypeName === this.blockTypeName);
	for(let i = 0; i < this.slots.length; i++){ //Copy block's slots to this Block.
		this.slots[i].copyFrom(block.slots[i]);
	}
	if(this.blockSlot1 != null){ //Copy the contents of its BlockSlots.
		this.blockSlot1.copyFrom(block.blockSlot1);
	}
	if(this.blockSlot2 != null){
		this.blockSlot2.copyFrom(block.blockSlot2);
	}
	if(block.nextBlock != null){ //Copy subsequent Blocks.
		this.nextBlock = block.nextBlock.duplicate(0,0);
		this.nextBlock.parent = this;
	}
};

/**
 * Returns an entirely text-based version of the Block for display in dialogs.
 * May exclude a slot and replace if with "___".
 * @param {Slot} slotToExclude - (optional) The Slot to replace with "___".
 * @return {string} - The finished text summary.
 */
Block.prototype.textSummary = function(slotToExclude){
	let summary = "";
	for(let i = 0; i < this.parts.length; i++){
		if(this.parts[i] === slotToExclude){
			//Replace slot with underscores.
			summary += "___";
		}
		else{
			summary += this.parts[i].textSummary(); //Recursively build text summary from text summary of contents.
		}
		if(i < this.parts.length - 1){ //Add space between part descriptions.
			summary += " ";
		}
	}
	return summary;
};

/**
 * Overridden by subclasses. Alerts Block that the flag was clicked. Most Blocks won't respond to this directly.
 */
Block.prototype.eventFlagClicked = function(){

};

/**
 * Overridden by subclasses. Passes broadcast message to Block.
 */
Block.prototype.eventBroadcast = function(message){

};

/**
 * Overridden by subclasses. Checks if a broadcast with the given message is currently running on this block.
 * Used to tell Broadcast and wait blocks if they can stop waiting.
 */
Block.prototype.checkBroadcastRunning = function(message){
	return false;
};

/**
 * Recursively updates the available broadcast messages.
 */
Block.prototype.updateAvailableMessages = function(){
	for(let i = 0;i < this.slots.length;i++){
		this.slots[i].updateAvailableMessages();
	}
	if(this.blockSlot1 != null){
		this.blockSlot1.updateAvailableMessages();
	}
	if(this.blockSlot2 != null){
		this.blockSlot2.updateAvailableMessages();
	}
	if(this.bottomOpen&&this.nextBlock != null){
		this.nextBlock.updateAvailableMessages();
	}
};

/**
 * Deletes the Block's running memory (memory reserved for computations related to execution)
 * Also deletes the runMem of the Block's slots, but not runMem of Blocks in those Slots
 */
Block.prototype.clearMem = function(){
	//Delete all runMem.
	this.runMem = new function(){};
	for(let i = 0;i < this.slots.length;i++){
		this.slots[i].clearMem(); //Removes resultData and resets running state to 0 (NOT recursive).
	}
};

/**
 * Returns the result of the Block's execution.
 * The data is then removed to prevent the result from being returned again.
 */
Block.prototype.getResultData = function(){
	DebugOptions.assert(this.resultData != null);
	let result = this.resultData;
	this.resultData = null;
	return result;
};

/**
 * Recursively adds a white outline to indicate that the BlockStack is running.
 */
Block.prototype.glow = function(){
	BlockGraphics.update.glow(this.path);
	this.isGlowing = true; //Used by other classes to determine things like highlight color.
	if(this.blockSlot1 != null){
		this.blockSlot1.glow();
	}
	if(this.blockSlot2 != null){
		this.blockSlot2.glow();
	}
	if(this.bottomOpen&&this.nextBlock != null){
		this.nextBlock.glow();
	}
};

/**
 * Recursively removes the outline.
 */
Block.prototype.stopGlow = function(){
	BlockGraphics.update.stroke(this.path,this.category,this.returnsValue,this.active);
	this.isGlowing = false;
	if(this.blockSlot1 != null){
		this.blockSlot1.stopGlow();
	}
	if(this.blockSlot2 != null){
		this.blockSlot2.stopGlow();
	}
	if(this.bottomOpen&&this.nextBlock != null){
		this.nextBlock.stopGlow();
	}
};

/**
 * Changes the Block's appearance and its Slots (but not their children) to indicate that this Block
 * is inactive and cannot be run.  Used by sensors that a device does not support and robot blocks for
 * robots that are not connected
 */
Block.prototype.makeInactive = function(){
	if(this.active){
		this.active = false;
		BlockGraphics.update.blockActive(this.path, this.category, this.returnsValue, this.active);
		this.slots.forEach(function(slot) {
			slot.makeInactive();
		});
	}
};

/**
 * Undoes the visual changes of makeInactive.  Calls makeActive on all Slots
 */
Block.prototype.makeActive = function(){
	if(!this.active){
		this.active = true;
		BlockGraphics.update.blockActive(this.path, this.category, this.returnsValue, this.active);
		this.slots.forEach(function(slot) {
			slot.makeActive();
		});
	}
};

/**
 * @param {boolean} active
 */
Block.prototype.setActive = function(active){
	if(active){
		this.makeActive();
	} else {
		this.makeInactive();
	}
};

/**
 * Returns a value indicating if this block is active.  Overrided by subclasses.
 * @return {boolean}
 */
Block.prototype.checkActive = function(){
	// Most Blocks are always active
	return true;
};

/**
 * Uses checkActive and setActive to update the Blocks appearance
 */
Block.prototype.updateActive = function(){
	this.setActive(this.checkActive());
};

/**
 * Recursively writes this Block and those below it to XML
 * @param {DOMParser} xmlDoc - The document to write to
 * @param {Node} xmlBlocks - The <Blocks> tag in the document
 */
Block.prototype.writeToXml = function(xmlDoc,xmlBlocks){
	xmlBlocks.appendChild(this.createXml(xmlDoc));
	if(this.bottomOpen&&this.nextBlock != null){
		this.nextBlock.writeToXml(xmlDoc,xmlBlocks);
	}
};

/**
 * Writes this Block to XML (non recursive)
 * @param {DOMParser} xmlDoc - The document to write to
 * @return {Node}
 */
Block.prototype.createXml = function(xmlDoc){
	let block = XmlWriter.createElement(xmlDoc,"block");
	XmlWriter.setAttribute(block,"type",this.blockTypeName);
	let slots = XmlWriter.createElement(xmlDoc,"slots");
	// Indicates that we are using the new saving system, which uses keys assigned to each Slot to identify
	// which data goes to which Slot.  The old system uses the order of appearance in the XML to match data to Slots
	XmlWriter.setAttribute(slots,"keyVal","true");
	for(let i = 0;i < this.slots.length;i++){
		slots.appendChild(this.slots[i].createXml(xmlDoc));
	}
	block.appendChild(slots);
	if(this.blockSlot1 != null){
		let blockSlots = XmlWriter.createElement(xmlDoc,"blockSlots");
		blockSlots.appendChild(this.blockSlot1.createXml(xmlDoc));
		if(this.blockSlot2 != null){
			blockSlots.appendChild(this.blockSlot2.createXml(xmlDoc));
		}
		block.appendChild(blockSlots);
	}
	return block;
};

/**
 * Reads a Block from XML and returns the Block or null if the data is corrupt
 * @param blockNode {Node} - Block node of th XML file being read
 * @return {Block|null} - The imported Block, or null if the data is corrupt
 */
Block.importXml = function(blockNode){
	// Get the correct class of the Block
	let type = XmlWriter.getAttribute(blockNode,"type");
	let block;
	try {
		// All classes start with "B_"
		if (type.substring(0, 2) === "B_") {
			// Find the constructor's import function
			if(window[type].importXml != null){
				// If the Block has a special import function, use that
				return window[type].importXml(blockNode);
			}
			else {
				// Otherwise, use the Block's constructor
				block = new window[type](0, 0);
				// Copy the data into the Block
				block.copyFromXml(blockNode);
				return block;
			}
		}
		else{
			// The data is corrupt
			return null;
		}
	}
	catch(e) {
		// The data is corrupt
		return null;
	}
};

/**
 * Copies the data from the Block tag into the Block
 * @param {Node} blockNode - The node to copy the data from
 */
Block.prototype.copyFromXml = function(blockNode){
	let slotsNode = XmlWriter.findSubElement(blockNode,"slots");
	// Copy the data about the Slots into the Block.
	this.importSlotXml(slotsNode);
	let blockSlotsNode = XmlWriter.findSubElement(blockNode,"blockSlots");
	let blockSlotNodes = XmlWriter.findSubElements(blockSlotsNode,"blockSlot");
	// Copy data about BlockSlots
	if(this.blockSlot1 != null&&blockSlotNodes.length >= 1){
		this.blockSlot1.importXml(blockSlotNodes[0]);
	}
	if(this.blockSlot2 != null&&blockSlotNodes.length >= 2){
		this.blockSlot2.importXml(blockSlotNodes[1]);
	}
};

/**
 * Imports the data about the Slots into the Block.
 * @param {Node} slotsNode - The node to copy the data from
 */
Block.prototype.importSlotXml = function(slotsNode){
	// Determine if we are using the key/value system or legacy, order dependant system.
	let keyVal = XmlWriter.getAttribute(slotsNode, "keyVal", "false") === "true";
	let slotNodes = XmlWriter.findSubElements(slotsNode,"slot");
	if(keyVal){
		// Import data for each slot
		this.slots.forEach(function(slot){
			let key = slot.getKey();
			let slotNode = XmlWriter.findNodeByKey(slotNodes, key);
			// Import data if that key exists.  Otherwise, leave the Slot at default values
			if(slot != null) {
				slot.importXml(slotNode);
			}
		});
	}
	else{
		// Import the data for each Slot in order
		for(let i = 0;i < slotNodes.length&&i < this.slots.length;i++){
			this.slots[i].importXml(slotNodes[i]);
		}
	}
};

/**
 * Recursively notifies the Block that a variable has changed names
 * @param {Variable} variable - The variable that was renamed
 */
Block.prototype.renameVariable = function(variable){
	this.passRecursively("renameVariable", variable);
};

/**
 * Recursively notifies the Block that a variable has been deleted
 * @param {Variable} variable - The variable that was deleted
 */
Block.prototype.deleteVariable = function(variable){
	this.passRecursively("deleteVariable", variable);
};

/**
 * Recursively notifies the Block that a list has changed names
 * @param {List} list - The list that was renamed
 */
Block.prototype.renameList = function(list){
	this.passRecursively("renameList", list);
};

/**
 * Recursively notifies the Block that a list has been deleted
 * @param {List} list - The list that was deleted
 */
Block.prototype.deleteList = function(list){
	this.passRecursively("deleteList", list);
};

/**
 * Recursively determines if a variable is in use
 * @param {Variable} variable - The variable to check
 * @return {boolean} - true iff the variable is used in at least one Block
 */
Block.prototype.checkVariableUsed = function(variable){
	for(let i = 0;i < this.slots.length;i++){
		if(this.slots[i].checkVariableUsed(variable)){
			return true;
		}
	}
	if(this.blockSlot1 != null){
		if(this.blockSlot1.checkVariableUsed(variable)){
			return true;
		}
	}
	if(this.blockSlot2 != null){
		if(this.blockSlot2.checkVariableUsed(variable)){
			return true;
		}
	}
	if(this.bottomOpen&&this.nextBlock != null){
		if(this.nextBlock.checkVariableUsed(variable)){
			return true;
		}
	}
	return false;
};

/**
 * Recursively determines if a list is in use
 * @param {List} list - The list to check
 * @return {boolean} - true iff the list is used in at least one Block
 */
Block.prototype.checkListUsed = function(list){
	for(let i = 0;i < this.slots.length;i++){
		if(this.slots[i].checkListUsed(list)){
			return true;
		}
	}
	if(this.blockSlot1 != null){
		if(this.blockSlot1.checkListUsed(list)){
			return true;
		}
	}
	if(this.blockSlot2 != null){
		if(this.blockSlot2.checkListUsed(list)){
			return true;
		}
	}
	if(this.bottomOpen&&this.nextBlock != null){
		if(this.nextBlock.checkListUsed(list)){
			return true;
		}
	}
	return false;
};

/**
 * Recursively tells the device DropDown menus to switch to label mode, as multiple devices are no longer connected
 * @param deviceClass - A subclass of Device.  Only DropDowns for this device are affected
 */
Block.prototype.hideDeviceDropDowns = function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
};

/**
 * Recursively tells the device DropDown menus to switch to DropDown mode, as multiple devices are now connected
 * @param deviceClass - A subclass of Device.  Only DropDowns for this device are affected
 */
Block.prototype.showDeviceDropDowns = function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
};

/**
 * Recursively counts the maximum selected DropDown value for a DeviceDropDown of the specified deviceClass
 * @param deviceClass - A subclass of Device.  Only DropDowns for this device are affected
 * @return {number} - The maximum value + 1 (since selections are 0-indexed)
 */
Block.prototype.countDevicesInUse = function(deviceClass){
	// At least 1 option is available on all DropDowns
	let largest = 1;
	// Find the largest result of all calls
	for(let i = 0;i < this.slots.length;i++){
		largest = Math.max(largest,this.slots[i].countDevicesInUse(deviceClass));
	}
	if(this.blockSlot1 != null){
		largest = Math.max(largest,this.blockSlot1.countDevicesInUse(deviceClass));
	}
	if(this.blockSlot2 != null){
		largest = Math.max(largest,this.blockSlot2.countDevicesInUse(deviceClass));
	}
	if(this.bottomOpen&&this.nextBlock != null){
		largest = Math.max(largest,this.nextBlock.countDevicesInUse(deviceClass));
	}
	return largest;
};

/**
 * Called when the available sensors changes. Each Block checks if it is still enabled and then passes the message.
 */
Block.prototype.updateAvailableSensors = function(){
	this.updateActive();
	this.passRecursively("updateAvailableSensors");
};

/**
 * Called when a Robot's status changes.  Overrided by subclasses.
 */
Block.prototype.updateConnectionStatus = function(){

};

/**
 * Calls a function on all the Block's slots.  All parameters after the functionName are passed to the function
 * as arguments
 * @param functionName - The name of the function to call on each child
 */
Block.prototype.passRecursively = function(functionName){
	let args = Array.prototype.slice.call(arguments, 1);
	for(let i = 0;i < this.slots.length;i++){
		let currentSlot = this.slots[i];
		currentSlot[functionName].apply(currentSlot,args);
	}
	if(this.blockSlot1 != null){
		this.blockSlot1[functionName].apply(this.blockSlot1,args);
	}
	if(this.blockSlot2 != null){
		this.blockSlot2[functionName].apply(this.blockSlot2,args);
	}
	if(this.bottomOpen&&this.nextBlock != null){
		this.nextBlock[functionName].apply(this.nextBlock,args);
	}
};

/**
 * Recursively instructs all slots to pass a message.  The message is likely a function name that is called when
 * it reaches an object of the correct type.  Subsequent arguments are passed as well.
 * @param {string} message - Possibly the name of the function to call to send the message
 */
Block.prototype.passRecursivelyDown = function(message){
	let funArgs = Array.prototype.slice.call(arguments, 1);
	// If the message is intended for Blocks...
	if(message === "updateConnectionStatus") {
		// Call the message and pass in the arguments
		this.updateConnectionStatus.apply(this, funArgs);
	}
	// Add "passRecursivelyDown" as the first argument
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	// Call passRecursivelyDown on all children
	this.passRecursively.apply(this, arguments);
};

/**
 * Instructs the Block to display its result of execution
 * @param {Data} data - The result to display
 */
Block.prototype.displayResult = function(data){
	// Get the string representation of the data
	let value = data.asString().getValue();
	// Display it, not as an error
	this.displayValue(value, false);
};

/**
 * Shows a bubble below the Block with the provided message
 * @param {string} message - The message to show
 * @param {boolean} error - Indicates if the bubble should be formatted like an error
 */
Block.prototype.displayValue = function(message, error){
	// Get the coords where to show the bubble
	let x = this.getAbsX();
	let y = this.getAbsY();
	let width = this.relToAbsX(this.width) - x;
	let height = this.relToAbsY(this.height) - y;
	// Display a bubble at the location
	GuiElements.displayValue(message, x, y, width, height, error);
};

/**
 * Show a bubble with the error
 * @param {string} message - The error to show
 */
Block.prototype.displayError = function(message){
	this.displayValue(message, true);
};

/**
 * Takes a subclass of Block and modifies its display function to include a suffix (used to display sensor units)
 * @param Class - The subclass of Block to modify
 * @param {string} suffix - The string to append to the normal display response
 */
Block.setDisplaySuffix = function(Class, suffix){
	// Use setDeviceSuffixFn with a function that just returns the suffix
	Block.setDeviceSuffixFn(Class, function(){
		return suffix;
	});
};

/**
 * Takes a subclass of Block and modifies its display function to append a suffix, determined from a function
 * @param Class - The subclass of Block to modify
 * @param {function} suffixFn - function () -> string that returns the desired suffix
 */
Block.setDeviceSuffixFn = function(Class, suffixFn){
	Class.prototype.displayResult = function(data){
		// Only valid data is followed by a suffix
		if(data.isValid) {
			let value = data.asString().getValue();
			this.displayValue(value + " " + suffixFn(), false);
		}
		else{
			this.displayValue(data.asString().getValue(), false);
		}
	};
};