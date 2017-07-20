/**
 * A set of DisplayStacks under a header in the BlockPalette that can expand or collapse when selected
 * @param {string} name - THe name to show in the header
 * @param {string} id - The id of this item
 * @param {CollapsibleSet} collapsibleSet - The set this item is a member of
 * @param {Element} group - The group this item should add itself to
 * @constructor
 */
function CollapsibleItem(name, id, collapsibleSet, group) {
	const CI = CollapsibleItem;
	this.x = 0;
	this.name = name;
	this.id = id;
	this.set = collapsibleSet;
	this.group = GuiElements.create.group(0, 0, group);
	// This group is where the Blocks are added.  It is right below the header and is added/removed to expand/collapse
	this.innerGroup = GuiElements.create.group(0, CI.hitboxHeight);
	this.collapsed = true;
	this.suggestedCollapse = true;
	this.createLabel();

	this.prepareToFill();
}

CollapsibleItem.setConstants = function() {
	const CI = CollapsibleItem;
	CI.hitboxHeight = 25;
	CI.hitboxWidth = BlockPalette.width;

	CI.labelFont = BlockPalette.labelFont;
	CI.labelColor = BlockPalette.labelColor;

	CI.triBoxWidth = CI.hitboxHeight;
	CI.triangleWidth = 10;
	CI.triangleHeight = 5;
};

/**
 * Creates the header above the blocks, which includes a triangle, a label, and a hit box around both
 */
CollapsibleItem.prototype.createLabel = function() {
	const CI = CollapsibleItem;

	this.triE = GuiElements.create.path();
	GuiElements.update.color(this.triE, CI.labelColor);
	this.updateTriangle();

	const labelY = (CI.hitboxHeight + CI.labelFont.charHeight) / 2;
	this.label = GuiElements.draw.text(CI.triBoxWidth, labelY, this.name, CI.labelFont, CI.labelColor);
	this.hitboxE = GuiElements.draw.rect(0, 0, CI.hitboxWidth, CI.hitboxHeight, CI.labelColor);
	GuiElements.update.opacity(this.hitboxE, 0);
	this.group.appendChild(this.label);
	this.group.appendChild(this.triE);
	this.group.appendChild(this.hitboxE);

	TouchReceiver.addListenersCollapsibleItem(this.hitboxE, this);
};

/**
 * Changes the path of the triangle to be horizontal/vertical depending on the state of the item
 */
CollapsibleItem.prototype.updateTriangle = function() {
	let vertical = !this.collapsed;
	const CI = CollapsibleItem;
	let pointX;
	let pointY;
	if (!vertical) {
		pointX = (CI.triBoxWidth + CI.triangleHeight) / 2;
		pointY = CI.hitboxHeight / 2;
	} else {
		pointX = CI.triBoxWidth / 2;
		pointY = (CI.hitboxHeight + CI.triangleHeight) / 2;
	}
	return GuiElements.update.triangleFromPoint(this.triE, pointX, pointY, CI.triangleWidth, -CI.triangleHeight, vertical);
};

/**
 * prepares the item to be filled with Blocks
 */
CollapsibleItem.prototype.prepareToFill = function() {
	this.currentBlockX = BlockPalette.mainHMargin;
	this.currentBlockY = BlockPalette.mainVMargin;
	this.blocks = [];
	this.displayStacks = [];
	this.lastHadStud = false;
	this.finalized = false;
};

/**
 * Marks this category as no longer being filled
 */
CollapsibleItem.prototype.finalize = function() {
	DebugOptions.assert(!this.finalized);
	this.finalized = true;
	this.innerHeight = this.currentBlockY;
	this.updateWidth();
};

/**
 * Add a Block with the specified name
 * @param {string} blockName
 */
CollapsibleItem.prototype.addBlockByName = function(blockName) {
	DebugOptions.assert(!this.finalized);
	const block = new window[blockName](this.currentBlockX, this.currentBlockY);
	this.addBlock(block);
};

/**
 * Add a Block that has already been created
 * @param {Block} block
 */
CollapsibleItem.prototype.addBlock = function(block) {
	DebugOptions.assert(!this.finalized);
	this.blocks.push(block);
	if (this.lastHadStud && !block.topOpen) {
		this.currentBlockY += BlockGraphics.command.bumpDepth;
		block.move(this.currentBlockX, this.currentBlockY);
	}
	if (block.hasHat) {
		this.currentBlockY += BlockGraphics.hat.hatHEstimate;
		block.move(this.currentBlockX, this.currentBlockY);
	}
	const displayStack = new DisplayStack(block, this.innerGroup, this);
	this.displayStacks.push(displayStack);
	this.currentBlockY += displayStack.firstBlock.height;
	this.currentBlockY += BlockPalette.blockMargin;
	this.lastHadStud = block.bottomOpen;
};

/**
 * Adds space between Blocks to denote sections
 */
CollapsibleItem.prototype.addSpace = function() {
	DebugOptions.assert(!this.finalized);
	this.currentBlockY += BlockPalette.sectionMargin;
};

/**
 * Removes some of the space at the bottom so the height measurement is correct
 */
CollapsibleItem.prototype.trimBottom = function() {
	DebugOptions.assert(!this.finalized);
	if (this.lastHadStud) {
		this.currentBlockY += BlockGraphics.command.bumpDepth;
	}
	this.currentBlockY -= BlockPalette.blockMargin;
	this.currentBlockY += BlockPalette.mainVMargin;
};

/**
 * Updates the dimensions and alignment of the CollapsibleItem
 * @param {number} newY - The y coord the item should have when done
 * @return {number} - The height of the item, so the next item knows where to go
 */
CollapsibleItem.prototype.updateDimAlign = function(newY) {
	this.y = newY;
	GuiElements.move.group(this.group, this.x, this.y);
	return this.getHeight();
};

/**
 * Retrieves the width of the item, given its current collapsed/expanded state
 * @return {number}
 */
CollapsibleItem.prototype.getWidth = function() {
	if (this.collapsed) {
		return 0;
	} else {
		return this.innerWidth;
	}
};

/**
 * Retrieves the height of the item, given its current collapsed/expanded state
 * @return {number}
 */
CollapsibleItem.prototype.getHeight = function() {
	const CI = CollapsibleItem;
	if (this.collapsed) {
		return CI.hitboxHeight;
	} else {
		return CI.hitboxHeight + this.innerHeight;
	}
};

/**
 * Computes and stores the width of the item
 */
CollapsibleItem.prototype.computeWidth = function() {
	let currentWidth = 0;
	for (let i = 0; i < this.blocks.length; i++) {
		const blockW = this.blocks[i].width;
		if (blockW > currentWidth) {
			currentWidth = blockW;
		}
	}
	this.innerWidth = currentWidth;
};

/**
 * Hides the Blocks below the header and tells the set to update its dimensions
 */
CollapsibleItem.prototype.collapse = function() {
	if (!this.collapsed) {
		this.collapsed = true;
		this.innerGroup.remove();
		this.updateTriangle();
		this.set.updateDimAlign();
	}
};

/**
 * Shows the Blocks below the header and tells the set to update its dimensions
 */
CollapsibleItem.prototype.expand = function() {
	if (this.collapsed) {
		this.collapsed = false;
		this.group.appendChild(this.innerGroup);
		this.updateTriangle();
		this.set.updateDimAlign();
	}
};

/**
 * Computes and stores the width of the item and tells the set to update its width
 */
CollapsibleItem.prototype.updateWidth = function() {
	this.computeWidth();
	this.set.updateWidth();
};

/* Converts between coordinates relative to the item and coordinates relative to the screen */
/**
 * @param {number} x
 * @return {number}
 */
CollapsibleItem.prototype.relToAbsX = function(x) {
	const CI = CollapsibleItem;
	return this.set.category.relToAbsX(x + this.x);
};
/**
 * @param {number} y
 * @return {number}
 */
CollapsibleItem.prototype.relToAbsY = function(y) {
	const CI = CollapsibleItem;
	return this.set.category.relToAbsY(y + this.y + CI.hitboxHeight);
};
/**
 * @param {number} x
 * @return {number}
 */
CollapsibleItem.prototype.absToRelX = function(x) {
	const CI = CollapsibleItem;
	return this.set.category.absToRelX(x) - this.x;
};
/**
 * @param {number} y
 * @return {number}
 */
CollapsibleItem.prototype.absToRelY = function(y) {
	const CI = CollapsibleItem;
	return this.set.category.absToRelY(y) - this.y - CI.hitboxHeight;
};

/**
 * Removes the item from the SVG
 */
CollapsibleItem.prototype.remove = function() {
	this.group.remove();
};

/**
 * Toggles the item's expand/collapse state
 */
CollapsibleItem.prototype.toggle = function() {
	if (this.collapsed) {
		this.expand();
	} else {
		this.collapse();
	}
};

/**
 * Prompts the item to set its expand/collapse state if it matches the id and the user has not overridden the suggested
 * state
 * @param {string} id - The id of the relevant item
 * @param {boolean} collapsed - Whether the suggested state is collapsed or expanded
 */
CollapsibleItem.prototype.setSuggestedCollapse = function(id, collapsed) {
	if (id !== this.id) return;
	/* We only change the state if the current state matches the previous suggested state.  That way if the user,
	 * for example, manually collapses the item, then connects 3 devices, it won't expand each time.
	 */
	if (collapsed !== this.suggestedCollapse) {
		this.suggestedCollapse = collapsed;
		if (collapsed) {
			this.collapse();
		} else {
			this.expand();
		}
	}
};

/* Passes messages to DisplayStacks */
CollapsibleItem.prototype.passRecursivelyDown = function(message) {
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	this.passRecursively.apply(this, arguments);
};
CollapsibleItem.prototype.passRecursively = function(functionName) {
	const args = Array.prototype.slice.call(arguments, 1);
	this.displayStacks.forEach(function(stack) {
		stack[functionName].apply(stack, args);
	});
};