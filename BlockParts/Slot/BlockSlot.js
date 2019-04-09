/**
 * BlockSlots are included in Blocks like if/else and loops to hold a stack of Blocks inside the slot. They are very
 * different from Slots, and are not a subclass of Slot. They do pass messages recursively to their children, and
 * compute the height of the stack of children they contain.
 * @param {Block} parent - The Block this Slot is part of
 * @constructor
 */
function BlockSlot(parent) {
	this.parent = parent;
	this.child = null;
	this.hasChild = false;
	this.height = 0;
  this.width = 0;
	this.x = 0;
	this.y = 0;
	this.isBlockSlot = true;   // Used so Blocks can identify if their parent is a BlockSlot
	this.isRunning = false;
	this.currentBlock = null;   // Currently executing Block in the slot
}

/**
 * @return {number}
 */
BlockSlot.prototype.getAbsX = function() {
	return this.parent.stack.relToAbsX(this.x);
};
/**
 * @return {number}
 */
BlockSlot.prototype.getAbsY = function() {
	return this.parent.stack.relToAbsY(this.y);
};

/**
 * Recursively computes the height of the BlockSlot
 */
BlockSlot.prototype.updateDim = function() {
	if (this.hasChild) {
		this.child.updateDim();
		this.height = this.child.addHeights();
    this.width = this.child.addWidths();
	} else {
		this.height = BlockGraphics.loop.bottomH;
    this.width = BlockGraphics.loop.armW;
	}
};

/**
 * Moves the BlockSlot and children to the specified coords and recursively updates their alignment
 * @param {number} x
 * @param {number} y
 */
BlockSlot.prototype.updateAlign = function(x, y) {
	this.x = x;
	this.y = y;
	if (this.hasChild) {
		this.child.updateAlign(x, y);
	}
};

/**
 * Connects the specified to this BlockSlot, potentially displacing the BlockSlot's existing children
 * @param {Block} block - The Block to add to this BlockSlot
 */
BlockSlot.prototype.snap = function(block) {
	// Displace existing block, if more Blocks can't go below this one
	if (!block.getLastBlock().bottomOpen && this.child != null) {
		const BG = BlockGraphics.command;
		this.child.unsnap().shiftOver(BG.shiftX, block.stack.getHeight() + BG.shiftY);
	}

	// Set the stack's execution status and glow
	const stack = this.parent.stack;
	if (stack != null && block.stack != null) {
		block.stack.stop();
		if(stack.isRunning) {
			block.glow();
		}
	}

	// Fix relationships between Blocks
	block.parent = this;
	if (this.hasChild) {
		const lastBlock = block.getLastBlock();
		const prevChild = this.child;
		lastBlock.nextBlock = prevChild;
		prevChild.parent = lastBlock;
	}
	this.hasChild = true;
	this.child = block;

	if (block.stack != null) {
		// Remove the old BlockStack and transfer the Block to this one
		const oldG = block.stack.group;
		block.stack.remove();
		block.changeStack(this.parent.stack);
		oldG.remove();
	}
	if (stack != null) {
		// Update the positions of everything
		this.parent.stack.updateDim();
	}
};

/**
 * Recursively change's this BlockSlot's children's stacks to the specified stack
 * @param {BlockStack} stack
 */
BlockSlot.prototype.changeStack = function(stack) {
	if (this.hasChild) {
		this.child.changeStack(stack);
	}
};

/**
 * Recursively tells children to update the stack dimensions
 */
BlockSlot.prototype.updateStackDim = function() {
	if (this.hasChild) {
		this.child.updateStackDim();
	}
};

/**
 * Sets this BlockSlot to have no children
 */
BlockSlot.prototype.removeChild = function() {
	this.hasChild = false;
	this.child = null;
};

/**
 * Checks if the moving Block could fit in this BlockStack and then passes the findBestFit message recursively
 */
BlockSlot.prototype.findBestFit = function() {
	const move = CodeManager.move;
	const fit = CodeManager.fit;
	const x = this.getAbsX();
	const y = this.getAbsY();

	// Check if the Block fits in this BlockSlot (above the top Block in it, if any)
	if (move.topOpen) {
		const snap = BlockGraphics.command.snap;
		if (move.pInRange(move.topX, move.topY, x - snap.left, y - snap.top, snap.left + snap.right, snap.top + snap.bottom)) {
			const xDist = move.topX - x;
			const yDist = move.topY - y;
			const dist = xDist * xDist + yDist * yDist;
			if (!fit.found || dist < fit.dist) {
				fit.found = true;
				fit.bestFit = this;
				fit.dist = dist;
			}
		}
	}
	// Check if it fits in this BlockSlot's children
	if (this.hasChild) {
		this.child.findBestFit();
	}
};

/**
 * Adds indicator that moving Block will snap to this BlockSlot if released
 */
BlockSlot.prototype.highlight = function() {
	Highlighter.highlight(this.getAbsX(), this.getAbsY(), 0, 0, 0, false, this.parent.isGlowing);
};

/**
 * Duplicates Blocks from the provided blockSlot into this BlockSlot recursively
 * @param {BlockSlot} blockSlot
 */
BlockSlot.prototype.copyFrom = function(blockSlot) {
	if (blockSlot.hasChild) {
		this.snap(blockSlot.child.duplicate(0, 0));
	}
};

/**
 * Prepares this BlockSlot for execution
 */
BlockSlot.prototype.startRun = function() {
	if (!this.isRunning && this.hasChild) {
		this.isRunning = true;
		this.currentBlock = this.child;
	}
};

/**
 * Recursively stops this BlockSlot and its children's execution
 */
BlockSlot.prototype.stop = function() {
	if (this.isRunning && this.hasChild) {
		this.child.stop();
	}
	this.isRunning = false;
};

/**
 * Updates execution of the BlockSlot
 * @return {ExecutionStatus} - Indicates whether this BlockSlot is still executing
 */
BlockSlot.prototype.updateRun = function() {
	if (this.isRunning) {
		if (this.currentBlock.stack !== this.parent.stack) {
			//If the current Block has been removed, don't run it.
			this.isRunning = false;
			return new ExecutionStatusDone();
		}
		// Run the current Block
		let execStatus = this.currentBlock.updateRun();
		if (!execStatus.isRunning()) {
			// If the current Block is done, show an error or move on to the next one
			if (execStatus.hasError()) {
				this.isRunning = false;
				return execStatus;
			} else {
				this.currentBlock = this.currentBlock.nextBlock;
			}
		}
		if (this.currentBlock != null) {
			return new ExecutionStatusRunning();
		} else {
			// Done with all Blocks in the BlockSlot
			this.isRunning = false;
			return new ExecutionStatusDone();
		}
	} else {
		return new ExecutionStatusDone();
	}
};

/**
 * Recursively makes children glow
 */
BlockSlot.prototype.glow = function() {
	if (this.hasChild) {
		this.child.glow();
	}
};

/**
 * Recursively makes children stop glowing
 */
BlockSlot.prototype.stopGlow = function() {
	if (this.hasChild) {
		this.child.stopGlow();
	}
};

/**
 * Recursively updates the available broadcast messages.
 */
BlockSlot.prototype.updateAvailableMessages = function() {
	if (this.hasChild) {
		this.child.updateAvailableMessages();
	}
};

/**
 * Creates XML for this BlockSlot
 * @param {Document} xmlDoc - The document to modify
 * @return {Node} - The XML representing this BlockSlot
 */
BlockSlot.prototype.createXml = function(xmlDoc) {
	const blockSlot = XmlWriter.createElement(xmlDoc, "blockSlot");
	if (this.hasChild) {
		const blocks = XmlWriter.createElement(xmlDoc, "blocks");
		this.child.writeToXml(xmlDoc, blocks);
		blockSlot.appendChild(blocks);
	}
	return blockSlot;
};

/**
 * Copies data from XML into this BlockSlot
 * @param {Node} blockSlotNode
 */
BlockSlot.prototype.importXml = function(blockSlotNode) {
	const blocksNode = XmlWriter.findSubElement(blockSlotNode, "blocks");
	const blockNodes = XmlWriter.findSubElements(blocksNode, "block");
	if (blockNodes.length > 0) {
		let firstBlock = null;
		let i = 0;
		while (firstBlock == null && i < blockNodes.length) {
			// Get the first Block to import correctly
			firstBlock = Block.importXml(blockNodes[i]);
			i++;
		}
		if (firstBlock == null) {
			// No Blocks imported correctly
			return;
		}
		this.snap(firstBlock);
		let previousBlock = firstBlock;
		// Import the rest of the Blocks
		while (i < blockNodes.length) {
			const newBlock = Block.importXml(blockNodes[i]);
			if (newBlock != null) {
				previousBlock.snap(newBlock);
				previousBlock = newBlock;
			}
			i++;
		}
	}
};

/**
 * @param {Variable} variable
 */
BlockSlot.prototype.renameVariable = function(variable) {
	this.passRecursively("renameVariable", variable);
};

/**
 * @param {Variable} variable
 */
BlockSlot.prototype.deleteVariable = function(variable) {
	this.passRecursively("deleteVariable", variable);
};

/**
 * @param {List} list
 */
BlockSlot.prototype.renameList = function(list) {
	this.passRecursively("renameList", list);
};

/**
 * @param {List} list
 */
BlockSlot.prototype.deleteList = function(list) {
	this.passRecursively("deleteList", list);
};

/**
 * @param {Variable} variable
 */
BlockSlot.prototype.checkVariableUsed = function(variable) {
	if (this.hasChild) {
		return this.child.checkVariableUsed(variable);
	}
	return false;
};

/**
 * @param {List} list
 */
BlockSlot.prototype.checkListUsed = function(list) {
	if (this.hasChild) {
		return this.child.checkListUsed(list);
	}
	return false;
};

/**
 * @param deviceClass - a subclass of Device
 */
BlockSlot.prototype.countDevicesInUse = function(deviceClass) {
	if (this.hasChild) {
		return this.child.countDevicesInUse(deviceClass);
	}
	return 0;
};

/**
 * @param {string} message
 */
BlockSlot.prototype.passRecursivelyDown = function(message) {
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	this.passRecursively.apply(this, arguments);
};

/**
 * @param {string} functionName
 */
BlockSlot.prototype.passRecursively = function(functionName) {
	const args = Array.prototype.slice.call(arguments, 1);
	if (this.hasChild) {
		this.child[functionName].apply(this.child, args);
	}
};
