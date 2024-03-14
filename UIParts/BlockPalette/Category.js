/**
 * Represents a selection of Blocks available in the BlockPalette.  Each Category has a button which, when pressed,
 * brings it to the foreground.
 * The contents of a category is determined by the BlockList static class. Each category has a dedicated function in
 * BlockList that populates its contents.
 *
 * @param {number} buttonX - The x coord of the CategoryBN's location
 * @param {number} buttonY - The y coord of the CategoryBN
 * @param {string} name - The display name of the category to show on the button
 * @param {string} id - The id used to refer to the category
 * @constructor
 */
function Category(buttonX, buttonY, name, id) {
  this.buttonX = buttonX;
  this.buttonY = buttonY;
  this.id = id;
  this.name = name;

  //this.x = 0;
  //this.y = TitleBar.height + BlockPalette.catH;
  this.x = BlockPalette.catX;
  this.y = BlockPalette.catY + BlockPalette.catH;

  this.level = 4;
  const l = parseInt(this.id.split("_").pop());
  if (!isNaN(l)) {
    this.level = l;
  }

  this.group = GuiElements.create.group(0, 0);
  this.smoothScrollBox = new SmoothScrollBox(this.group, GuiElements.layers.paletteScroll, BlockPalette.x, BlockPalette.y,
    BlockPalette.width, BlockPalette.height, 0, 0);
  this.button = new CategoryBN(this.buttonX, this.buttonY, this);

  //When the screen is flipped for right to left languages, the categories will
  // still appear left justified (so that long blocks push the rest off the
  // screen) unless this value is set. TODO: find a more logical solution to this problem
  if (Language.isRTL) {
    this.group.parentNode.parentNode.setAttribute('style', 'position: absolute; left: 0px;');
  }

  this.prepareToFill();
  this.fillGroup();
}

/**
 * Prepares this Category to be filled with Block/Buttons/etc.
 */
Category.prototype.prepareToFill = function() {
  // Initialize arrays to track contents
  this.blocks = [];
  this.displayStacks = [];
  this.buttons = [];
  this.labels = [];
  this.collapsibleSets = [];
  this.buttonsThatRequireFiles = [];

  // Keep track of current position in category
  this.currentBlockX = BlockPalette.mainHMargin;
  this.currentBlockY = BlockPalette.mainVMargin;
  this.lastHadStud = false;

  // Used to determine when filling the category is done
  this.finalized = false;
};

/**
 * Uses a function in BlockList to fill this Category, and marks the Category as finalized once filled.
 */
Category.prototype.fillGroup = function() {
  DebugOptions.assert(!this.finalized);
  BlockList["populateCat_" + this.id](this);
  this.finalize();
};

/**
 * Removes all contents of the category so it can be rebuilt
 */
Category.prototype.clearGroup = function() {
  this.displayStacks.forEach(function(stack) {
    stack.remove();
  });
  this.buttons.forEach(function(button) {
    button.remove();
  });
  this.labels.forEach(function(label) {
    label.remove();
  });
  this.collapsibleSets.forEach(function(set) {
    set.remove();
  });
};

/**
 * Removes all contents and rebuilds the category.  Called when available blocks should change
 */
Category.prototype.refreshGroup = function() {
  this.clearGroup();
  this.prepareToFill();
  this.fillGroup();
};

/**
 * Marks this category as no longer being filled
 */
Category.prototype.finalize = function() {
  DebugOptions.assert(!this.finalized);
  this.finalized = true;
  if (FinchBlox) {
    this.height = this.maxBlockHeight + BlockPalette.blockButtonOverhang + BlockPalette.mainVMargin;; // + 2*BlockPalette.mainVMargin;
  } else {
    this.height = this.currentBlockY;
  }
  this.updateWidth();
};

/**
 * Add a Block with the specified name
 * @param {string} blockName
 */
Category.prototype.addBlockByName = function(blockName) {
  DebugOptions.assert(!this.finalized);
  const block = new window[blockName](this.currentBlockX, this.currentBlockY);
  this.addBlock(block);
};

/**
 * Add a Variable Block for the specified variable
 * @param {Variable} variable
 */
Category.prototype.addVariableBlock = function(variable) {
  DebugOptions.assert(!this.finalized);
  const block = new B_Variable(this.currentBlockX, this.currentBlockY, variable);
  this.addBlock(block);
};

/**
 * Add a List Block for the specified List
 * @param {List} list
 */
Category.prototype.addListBlock = function(list) {
  DebugOptions.assert(!this.finalized);
  const block = new B_List(this.currentBlockX, this.currentBlockY, list);
  this.addBlock(block);
};

/**
 * Add a Block that has already been created
 * @param {Block} block
 */
Category.prototype.addBlock = function(block) {
  DebugOptions.assert(!this.finalized);
  this.blocks.push(block);
  // If the last Block had a stud and the top of this Block is flat, we shift this Block down a bit
  if (this.lastHadStud && !block.topOpen) {
    this.currentBlockY += BlockGraphics.command.bumpDepth;
    block.move(this.currentBlockX, this.currentBlockY);
  }
  // If this Block is a hat block, we make room for the hat
  if (block.hasHat && !FinchBlox) {
    this.currentBlockY += BlockGraphics.hat.hatHEstimate;
    block.move(this.currentBlockX, this.currentBlockY);
  }
  // We put the Block in a DisplayStack
  const displayStack = new DisplayStack(block, this.group, this);
  this.displayStacks.push(displayStack);
  // Update the coords for the next Block
  if (FinchBlox) {
    this.currentBlockX += displayStack.firstBlock.width * displayStack.zoom;
    this.currentBlockX += BlockPalette.blockMargin;
    if (this.maxBlockHeight == null ||
      this.maxBlockHeight < displayStack.firstBlock.height) {
      this.maxBlockHeight = displayStack.firstBlock.height;
    }
  } else {
    this.currentBlockY += displayStack.firstBlock.height;
    this.currentBlockY += BlockPalette.blockMargin;
    this.lastHadStud = block.bottomOpen;
  }
};

/**
 * Creates and adds a CollapsibleSet with a CollapsibleItem for each entry in the nameIdList.
 * Used in the Robots category
 * @param {Array<object>} nameIdList - An array or objects, each with fields for name and id
 * @return {CollapsibleSet}
 */
Category.prototype.addCollapsibleSet = function(nameIdList) {
  DebugOptions.assert(!this.finalized);
  const x = this.currentBlockX;
  const y = this.currentBlockY;
  const set = new CollapsibleSet(y, nameIdList, this, this.group);
  this.collapsibleSets.push(set);
  this.lastHadStud = false;
  this.currentBlockY += set.height;
  this.currentBlockY += BlockPalette.blockMargin;
  return set;
};

/**
 * Adds space between Blocks to denote sections
 */
Category.prototype.addSpace = function() {
  DebugOptions.assert(!this.finalized);
  this.currentBlockY += BlockPalette.sectionMargin;
};

/**
 * Adds a Button with the specified callback function
 * @param {string} text - The text to place on the Button
 * @param {function} callback - Called when the Button is tapped
 * @param {boolean} [onlyEnabledIfOpen=false] - Whether the Button should only be enabled if a file is open (Ex: the Record Bn)
 * @return {Button} - The created button
 */
Category.prototype.addButton = function(text, callback, onlyEnabledIfOpen) {
  DebugOptions.assert(!this.finalized);
  if (onlyEnabledIfOpen == null) {
    onlyEnabledIfOpen = false;
  }

  const width = BlockPalette.insideBnW;
  const height = BlockPalette.insideBnH;
  if (this.lastHadStud) {
    this.currentBlockY += BlockGraphics.command.bumpDepth;
  }

  const button = new Button(this.currentBlockX, this.currentBlockY, width, height, this.group);
  const BP = BlockPalette;
  button.addText(text);
  button.setCallbackFunction(callback, true);
  this.currentBlockY += height;
  this.currentBlockY += BlockPalette.blockMargin;
  this.buttons.push(button);
  this.lastHadStud = false;
  if (onlyEnabledIfOpen) {
    if (!SaveManager.fileIsOpen()) {
      button.disable();
    }
    this.buttonsThatRequireFiles.push(button);
  }
  return button;
};

/**
 * Adds a text label
 * @param {string} text - The text to display
 */
Category.prototype.addLabel = function(text) {
  DebugOptions.assert(!this.finalized);
  const BP = BlockPalette;
  const x = this.currentBlockX;
  const y = this.currentBlockY;
  const labelE = GuiElements.draw.text(x, y, text, BP.labelFont, BP.labelColor);
  this.group.appendChild(labelE);
  this.labels.push(labelE);
  const height = GuiElements.measure.textHeight(labelE);
  GuiElements.move.element(labelE, x, y + height);
  this.currentBlockY += height;
  this.currentBlockY += BlockPalette.blockMargin;
  this.lastHadStud = false;
};

/**
 * Removes some of the space at the bottom so the height measurement is correct
 */
Category.prototype.trimBottom = function() {
  DebugOptions.assert(!this.finalized);
  if (this.lastHadStud) {
    this.currentBlockY += BlockGraphics.command.bumpDepth;
  }
  this.currentBlockY -= BlockPalette.blockMargin;
  this.currentBlockY += BlockPalette.mainVMargin;
};

/**
 * Centers the blocks horizontally in the block palette. For FinchBlox.
 */
Category.prototype.centerBlocks = function() {
  this.computeWidth();
  const newX = BlockPalette.x + (BlockPalette.width - this.width) / 2;
  this.smoothScrollBox.move(newX, BlockPalette.y);
}

/**
 * Brings the category to the foreground and marks it as selected in the BlockPalette
 */
Category.prototype.select = function() {
  if (BlockPalette.selectedCat === this) {
    return;
  }
  if (BlockPalette.selectedCat != null) {
    BlockPalette.selectedCat.deselect();
  }
  BlockPalette.selectedCat = this;
  this.button.select();
  this.smoothScrollBox.show();
};

/**
 * Removes the category from the foreground
 */
Category.prototype.deselect = function() {
  BlockPalette.selectedCat = null;
  this.smoothScrollBox.hide();
  this.button.deselect();
};

/**
 * Computes the width of the Category and stores it in this.width
 */
Category.prototype.computeWidth = function() {
  if (FinchBlox) {
    let totalW = BlockPalette.blockMargin * (this.blocks.length - 1);
    for (let i = 0; i < this.blocks.length; i++) {
      totalW += this.blocks[i].width;
    }
    //totalW += 15; //Add for the extra bump on the last block
    totalW += 2 * BlockPalette.mainHMargin;
    this.width = totalW;
  } else {
    let currentWidth = 0;
    // The width is the maximum width across DisplayStacks and CollapsibleSets
    for (let i = 0; i < this.blocks.length; i++) {
      const blockW = this.blocks[i].width;
      if (blockW > currentWidth) {
        currentWidth = blockW;
      }
    }
    this.collapsibleSets.forEach(function(set) {
      const width = set.width;
      currentWidth = Math.max(width, currentWidth);
    });
    this.width = Math.max(currentWidth + 2 * BlockPalette.mainHMargin, BlockPalette.width);
  }
};

/**
 * Recomputes the width of the Category and updates the smoothScrollBox to match it
 */
Category.prototype.updateWidth = function() {
  if (!this.finalized) return;
  this.computeWidth();
  this.smoothScrollBox.setContentDims(this.width, this.height);
};

/**
 * Updates the dimensions of a Category that contains a CollapsibleSet.  Called by the CollapsibleSet after
 * expand/collapse
 */
Category.prototype.updateDimSet = function() {
  if (!this.finalized) return;
  this.computeWidth();
  let currentH = BlockPalette.mainVMargin;
  this.collapsibleSets.forEach(function(set) {
    currentH += set.height;
    currentH += BlockPalette.blockMargin;
  });
  currentH -= BlockPalette.blockMargin;
  currentH += BlockPalette.mainVMargin;
  this.height = currentH;
  this.smoothScrollBox.setContentDims(this.width, this.height);
};

/**
 * Indicates that a file is now open.
 */
Category.prototype.markOpen = function() {
  this.buttonsThatRequireFiles.forEach(function(button) {
    button.enable();
  });
};

/* Convert coordinates relative to the Category to coords relative to the screen */
/**
 * @param {number} x
 * @return {number}
 */
Category.prototype.relToAbsX = function(x) {
  if (!this.finalized) return x;
  return this.smoothScrollBox.relToAbsX(x);
};
/**
 * @param {number} y
 * @return {number}
 */
Category.prototype.relToAbsY = function(y) {
  if (!this.finalized) return y;
  return this.smoothScrollBox.relToAbsY(y);
};
/**
 * @param {number} x
 * @return {number}
 */
Category.prototype.absToRelX = function(x) {
  if (!this.finalized) return x;
  return this.smoothScrollBox.absToRelX(x);
};
/**
 * @param {number} y
 * @return {number}
 */
Category.prototype.absToRelY = function(y) {
  if (!this.finalized) return y;
  return this.smoothScrollBox.absToRelY(y);
};
/**
 * @return {number}
 */
Category.prototype.getAbsX = function() {
  return this.relToAbsX(0);
};
/**
 * @return {number}
 */
Category.prototype.getAbsY = function() {
  return this.relToAbsY(0);
};

/**
 * Passes a message to Slots/Blocks/CollapsibleSets within this Category
 * @param {string} message
 */
Category.prototype.passRecursivelyDown = function(message) {
  Array.prototype.unshift.call(arguments, "passRecursivelyDown");
  this.passRecursively.apply(this, arguments);
};
/**
 * @param {string} functionName
 */
Category.prototype.passRecursively = function(functionName) {
  const args = Array.prototype.slice.call(arguments, 1);
  this.displayStacks.forEach(function(stack) {
    stack[functionName].apply(stack, args);
  });
  this.collapsibleSets.forEach(function(set) {
    set[functionName].apply(set, args);
  });
};

/**
 * Updates the dimensions of the category in response to a screen resize
 */
Category.prototype.updateZoom = function() {
  if (!this.finalized) return;
  if (FinchBlox) {
    let newX = (BlockPalette.width - this.width) / 2;
    if (Hatchling) { newX += BlockPalette.x }
    this.smoothScrollBox.move(newX, BlockPalette.y);
  } else {
    this.smoothScrollBox.move(0, BlockPalette.y);
  }
  this.smoothScrollBox.updateZoom();
  this.smoothScrollBox.setDims(BlockPalette.width, BlockPalette.height);
};

/**
 * Passes a suggested collapse/expand message to any collapsible sets within this category
 * @param {string} id
 * @param {boolean} collapsed
 */
Category.prototype.setSuggestedCollapse = function(id, collapsed) {
  this.collapsibleSets.forEach(function(set) {
    set.setSuggestedCollapse(id, collapsed);
  });
};
