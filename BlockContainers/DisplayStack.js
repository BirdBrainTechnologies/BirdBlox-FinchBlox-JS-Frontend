/**
 * DisplayStacks are used for holding Blocks in the BlockPalette.
 * DisplayStacks are similar to BlockStacks but cannot snap other blocks in.
 * When a Block in a DisplayStack is dragged, it is duplicated into a BlockStack.
 * Like BlockStacks, they require a Block to be created
 * @param {Block} firstBlock - The first Block in the DisplayStack
 * @param {Element} group - The group the DisplayStack should be inside
 * @param {Category} category - The category the DisplayStack is a member of
 * @constructor
 */
function DisplayStack(firstBlock, group, category) {
  this.isDisplayStack = true;
	this.firstBlock = firstBlock;
  this.returnType = firstBlock.returnType; // The DisplayStack returns the same type of value as its Block.
	// Location determined by first Block
	this.x = firstBlock.getAbsX();
	this.y = firstBlock.getAbsY();
	this.group = GuiElements.create.group(this.x, this.y, group);
	this.category = category;
	this.firstBlock.changeStack(this);
	this.dim = {};
	// Dimensions of regions command blocks can be attached to.
	this.dim.cw = 0;
	this.dim.ch = 0;
	// Dimensions of regions reporter/predicate blocks can be attached to.
	this.dim.rw = 0;
	this.dim.rh = 0;
	this.updateDim();
	this.isRunning = false;
  this.zoom = 1; //FinchBlox zooms some blocks to fit in block palette
	//this.currentBlock = null;
	this.move(this.x, this.y);

  this.updateTimer = null;
}

/**
 * Computes the dimensions of the Stack and stores them
 */
DisplayStack.prototype.updateDim = function() {
	// Reset values to defaults
	this.dim.cAssigned = false;
	this.dim.rAssigned = false;
	this.firstBlock.updateDim();
	this.firstBlock.updateAlign(0, 0);
	this.dim.cx1 = this.firstBlock.x;
	this.dim.cy1 = this.firstBlock.y;
	this.dim.cx2 = this.dim.cx1;
	this.dim.cy2 = this.dim.cy1;
	this.dim.rx1 = 0;
	this.dim.ry1 = 0;
	this.dim.rx2 = 0;
	this.dim.ry2 = 0;
	// Block expands bounding box to encompass it
	this.firstBlock.updateStackDim();

	// Compute dimensions from bounding box
	this.dim.cw = this.dim.cx2 - this.dim.cx1;
	this.dim.ch = this.dim.cy2 - this.dim.cy1;
	this.dim.rw = this.dim.rx2 - this.dim.rx1;
	this.dim.rh = this.dim.ry2 - this.dim.ry1;

	// Convert to abs coords
	// TODO: see if these are used anywhere
	this.dim.cx1 = this.relToAbsX(this.dim.cx1);
	this.dim.cy1 = this.relToAbsY(this.dim.cy1);
	this.dim.rx1 = this.relToAbsX(this.dim.rx1);
	this.dim.ry1 = this.relToAbsY(this.dim.ry1);

	// Notify category that size has changed
	this.category.updateWidth();
};

/**
 * @param {number} x
 * @return {number}
 */
DisplayStack.prototype.relToAbsX = function(x) {
	return this.category.relToAbsX(x + this.x);
};
/**
 * @param {number} y
 * @return {number}
 */
DisplayStack.prototype.relToAbsY = function(y) {
	return this.category.relToAbsY(y + this.y);
};
/**
 * @param {number} x
 * @return {number}
 */
DisplayStack.prototype.absToRelX = function(x) {
	return this.category.absToRelX(x) - this.x;
};
/**
 * @param {number} y
 * @return {number}
 */
DisplayStack.prototype.absToRelY = function(y) {
	return this.category.absToRelY(y) - this.y;
};
/**
 * @return {number}
 */
DisplayStack.prototype.getAbsX = function() {
	return this.relToAbsX(0);
};
/**
 * @return {number}
 */
DisplayStack.prototype.getAbsY = function() {
	return this.relToAbsY(0);
};

/**
 * Moves the Stack to the specified coords
 * @param {number} x - Relative x coord
 * @param {number} y - Relative y coord
 */
DisplayStack.prototype.move = function(x, y) {
	this.x = x;
	this.y = y;
  if (FinchBlox && (this.firstBlock.type == 5)) {
    //The loop blocks appear smaller in the blockPalette so that they fit in the space.
    this.zoom = 0.85;
    const zY = y + (this.firstBlock.height * (1-this.zoom));
    GuiElements.move.group(this.group, x, zY, this.zoom);
  } else {
    GuiElements.move.group(this.group, x, y);
  }
};

/**
 * Stops the execution of the DisplayStack and its contents. Removes the glow as well.
 */
DisplayStack.prototype.stop = function() {
	if (this.isRunning) {
		this.firstBlock.stop();
		this.endRun(); // Removes glow and sets isRunning.
	}
};

/**
 * Updates the execution of the DisplayStack and its contents. Returns boolean
 * to indicate if still running.
 * @return {ExecutionStatus}
 */
DisplayStack.prototype.updateRun = function() {
	if (this.isRunning) {
		// Different procedures are used if the Block returns a value.
		if (this.returnType === Block.returnTypes.none) {
			// Update the current Block.
			let execStatus = this.firstBlock.updateRun();
			if (!execStatus.isRunning()) {
					this.endRun();
					return new ExecutionStatusDone();
			} else {
          return new ExecutionStatusRunning();
      }
		} else {
			// Procedure for Blocks that return a value.
			let execStatus = this.firstBlock.updateRun();
			if (execStatus.isRunning()) {
				return new ExecutionStatusRunning();
			} else if (execStatus.hasError()) {
				this.endRun();
				return new ExecutionStatusDone();
			} else {
				// When it is done running, display the result.
				this.firstBlock.displayResult(execStatus.getResult());
				this.endRun(); // Execution is done.
				return new ExecutionStatusDone();
			}
		}
	} else {
		// It's not running, so we are done
		return new ExecutionStatusDone();
	}
};

/**
 * Starts execution of the DisplayStack. Makes BlockStack glow, too.
 */
DisplayStack.prototype.startRun = function() {
	if (!this.isRunning) { // Only start if not already running.
		this.isRunning = true;
		this.firstBlock.glow();
    this.updateTimer = self.setInterval(function(){ this.updateRun(); }.bind(this), CodeManager.updateInterval);
	}
};

/**
 * Ends execution and removes glow. Does not call stop() function on Blocks;
 * assumes they have stopped already.
 */
DisplayStack.prototype.endRun = function() {
	this.isRunning = false;
	this.firstBlock.stopGlow();
  window.clearInterval(this.updateTimer);
};

/**
 * Copies the DisplayStack to the specified location
 * TODO: check if these are abs or rel coords
 * @param {number} x - Relative x coord
 * @param {number} y - Relative y coord
 * @return {BlockStack}
 */
DisplayStack.prototype.duplicate = function(x, y) {
	const tab = TabManager.activeTab;
	const firstCopyBlock = this.firstBlock.duplicate(x, y);
	return new BlockStack(firstCopyBlock, tab);
};

/**
 * Removes the DisplayStack
 */
DisplayStack.prototype.remove = function() {
	this.group.remove();
};

/**
 * @param deviceClass
 */
DisplayStack.prototype.hideDeviceDropDowns = function(deviceClass) {
	this.updateDim();
};

/**
 * @param deviceClass
 */
DisplayStack.prototype.showDeviceDropDowns = function(deviceClass) {
	this.updateDim();
};

/**
 * @param {string} message
 */
DisplayStack.prototype.passRecursivelyDown = function(message) {
	const myMessage = message;
	let funArgs = Array.prototype.slice.call(arguments, 1);

	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	this.passRecursively.apply(this, arguments);

	if(myMessage === "showDeviceDropDowns" && this.showDeviceDropDowns != null) {
		this.showDeviceDropDowns.apply(this, funArgs);
	}
	if(myMessage === "hideDeviceDropDowns" && this.hideDeviceDropDowns != null) {
		this.hideDeviceDropDowns.apply(this, funArgs);
	}
};

/**
 * @param {string} functionName
 */
DisplayStack.prototype.passRecursively = function(functionName) {
	let args = Array.prototype.slice.call(arguments, 1);
	this.firstBlock[functionName].apply(this.firstBlock, args);
};
