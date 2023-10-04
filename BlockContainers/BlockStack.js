/**
 * BlockStack is a class that holds a stack of Blocks.
 * BlockStacks move, execute, and snap the Blocks within them.
 * They pass messages onto their Blocks, which are passed on recursively.
 * Blocks are initially created outside a BlockStacks, but are immediately moved into one.
 * Empty BlockStacks are not allowed because each BlockStack must have a non-null firstBlock property.
 * @constructor
 * @param {Block} firstBlock - The first Block in the BlockStack.
 * The firstBlock is automatically moved along with subsequent Blocks into the BlockStack.
 * @param {Tab} tab - The tab the BlockStack lives within.
 */
function BlockStack(firstBlock, tab) {
  tab.addStack(this); // The Tab maintains a list of all its BlockStacks.
  this.firstBlock = firstBlock;
  this.firstBlock.stop(); // Prevents execution.
  this.firstBlock.stopGlow(); // Removes visual indicator of execution.
  this.returnType = firstBlock.returnType; // The BlockStack returns the same type of value as its first Block.
  this.tab = tab;
  this.x = 0;
  this.y = 0;
  this.x = this.absToRelX(firstBlock.getAbsX());
  this.y = this.absToRelY(firstBlock.getAbsY());
  this.tabGroup = tab.mainG; // Stores the SVG group element of the Tab it is within.
  this.group = GuiElements.create.group(this.x, this.y, this.tabGroup); // Creates a group for the BlockStack.
  this.firstBlock.changeStack(this); // Moves all Blocks into the BlockStack.
  this.dim = {}; // Stores information about the snap bounding box of the BlockStack.
  // this.dim values will be assigned later.
  this.dim.cw = 0; // Dimensions of regions command blocks can be attached to.
  this.dim.ch = 0;
  this.dim.rw = 0; // Dimensions of regions reporter/predicate blocks can be attached to.
  this.dim.rh = 0;
  this.dim.cx1 = 0; // These will be measured relative to the Tab, not the BlockStack.
  this.dim.cy1 = 0;
  this.dim.rx1 = 0;
  this.dim.ry1 = 0;
  this.updateDim(); // Updates the this.dim values, the dimensions of the Blocks, and aligns them.
  this.isRunning = false;
  this.currentBlock = null; // Keeps track of which Block in the BlockStack is currently executing.
  this.isDisplayStack = false;
  this.runningBroadcastMessage = ""; // Keeps track of if this stack's execution was started by a broadcast.
  this.move(this.x, this.y);
  this.flying = false; // BlockStacks being moved enter flying mode so they are above other BlockStacks and Tabs.
  this.tab.updateArrows();

  this.startRunIfAutoExec();
}

/**
 * If the first block is set to autoExecute, start the stack.
 * Used when a new stack is created or when a stack is stopped.
 */
BlockStack.prototype.startRunIfAutoExec = function() {
  if (this.firstBlock.autoExecute) {
    this.startRun();
  }
}

/**
 * Recursively updates the this.dim values, the dimensions of the Blocks, and and the Blocks' alignment.
 */
BlockStack.prototype.updateDim = function() {
  // Recursively updates the dimensions of the Blocks.
  this.firstBlock.updateDim();
  // The first Block is aligned to the top-left corner of the BlockStack.
  // Blocks recursively aligned.
  this.firstBlock.updateAlign(0, 0);
  // Clear existing values from bounding boxes.
  // During updateStackDim, these values are measured relative to the BlockStack.
  this.dim.cx1 = 0;
  this.dim.cy1 = 0;
  this.dim.cx2 = 0;
  this.dim.cy2 = 0;
  this.dim.rx1 = 0;
  this.dim.ry1 = 0;
  this.dim.rx2 = 0;
  this.dim.ry2 = 0;
  // Recursively each box updates the this.dim boxes to include their own bounding boxes.
  this.firstBlock.updateStackDim();
  // Dimensions of both types of boxes are calculated.
  this.dim.cw = this.dim.cx2 - this.dim.cx1;
  this.dim.ch = this.dim.cy2 - this.dim.cy1;
  this.dim.rw = this.dim.rx2 - this.dim.rx1;
  this.dim.rh = this.dim.ry2 - this.dim.ry1;
  //Reallign any comments
  this.arrangeComments();
};

/**
 * Converts a coordinate relative to the inside of the stack to one relative to the screen.
 * @param {number} x - The coord relative to the inside fo the stack.
 * @return {number} - The coord relative to the screen.
 */
BlockStack.prototype.relToAbsX = function(x) {
  if (this.flying) {
    return CodeManager.dragRelToAbsX(x + this.x);
  } else {
    return this.tab.relToAbsX(x + this.x); // In a Tab; return x plus Tab's offset.
  }
};

/**
 * @param {number} y
 * @return {number}
 */
BlockStack.prototype.relToAbsY = function(y) {
  if (this.flying) {
    return CodeManager.dragRelToAbsY(y + this.y); // Not in a Tab; scale by dragLayer's scale
  } else {
    return this.tab.relToAbsY(y + this.y); // In a Tab; return y plus Tab's offset.
  }
};
/**
 * Converts a coordinate relative to the screen to one relative to the inside of the stack.
 * @param {number} x - The coord relative to the screen.
 * @return {number} - The coord relative to the inside fo the stack.
 */
BlockStack.prototype.absToRelX = function(x) {
  if (this.flying) {
    return CodeManager.dragAbsToRelX(x) - this.x;
  } else {
    return this.tab.absToRelX(x) - this.x; // In a Tab; return x minus Tab's offset.
  }
};
/**
 * @param {number} y
 * @return {number}
 */
BlockStack.prototype.absToRelY = function(y) {
  if (this.flying) {
    return CodeManager.dragAbsToRelY(y) - this.y;
  } else {
    return this.tab.absToRelY(y) - this.y; // In a Tab; return y minus Tab's offset.
  }
};
/**
 * Returns the x coord of the BlockStack relative to the screen.
 * @return {number} The x coord of the BlockStack relative to the screen.
 */
BlockStack.prototype.getAbsX = function() {
  return this.relToAbsX(0);
};
/**
 * Returns the y coord of the BlockStack relative to the screen.
 * @return {number} The y coord of the BlockStack relative to the screen.
 */
BlockStack.prototype.getAbsY = function() {
  return this.relToAbsY(0);
};

BlockStack.prototype.findBlockByID = function(request) {
  this.firstBlock.findBlockByID(request)
}
/**
 * Searches the Blocks within this BlockStack to find one which fits the moving BlockStack.
 * Returns no values but stores results on CodeManager.fit.
 */
BlockStack.prototype.findBestFit = function(moveManager) {
  let move = CodeManager.move;
  if (moveManager != null) {
    move = moveManager.move
  }
  // If the thing being moved is a comment...
  if (move.comment) {
    // Check if the corner of the moving Comment falls within this BlockStack's
    // bounding box plus snap region.
    const snap = BlockGraphics.command.snap
    let absCx = this.relToAbsX(this.dim.rx1);
    let absCy = this.relToAbsY(this.dim.ry1 - snap.top);
    let absW = this.relToAbsX(this.dim.rw + snap.left + snap.right) - absCx;
    let absH = this.relToAbsY(this.dim.rh + snap.bottom) - absCy;
    if (CodeManager.move.pInRange(move.topX, move.topY, absCx, absCy, absW, absH)) {
      this.firstBlock.findBestFit(moveManager);
    }
  }

  // If this BlockStack is the one being moved, it can't attach to itself.
  if (move.stack === this) {
    return;
  }
  // Check if the moving BlockStack can attach to the top of this BlockStack.
  if (move.bottomOpen && this.firstBlock.topOpen) {
    this.findBestFitTop(moveManager);
  }
  // Recursively check if the moving BlockStack can attach to the bottom of any Blocks in this BlockStack.
  if (move.topOpen) {
    // Only check recursively if the corner of the moving BlockStack falls within this BlockStack's snap box.
    let absCx = this.relToAbsX(this.dim.cx1);
    let absCy = this.relToAbsY(this.dim.cy1);
    let absW = this.relToAbsX(this.dim.cw) - absCx;
    let absH = this.relToAbsY(this.dim.ch) - absCy;
    if (CodeManager.move.pInRange(move.topX, move.topY, absCx, absCy, absW, absH)) {
      this.firstBlock.findBestFit(moveManager);
    }
  }
  // Recursively check recursively if the moving BlockStack can attach one of this BlockStack's Slots.
  if (move.returnsValue) {
    // Only check if the BlockStack's bounding box overlaps with this BlockStack's bounding box.
    let absRx = this.relToAbsX(this.dim.rx1);
    let absRy = this.relToAbsY(this.dim.ry1);
    let absW = this.relToAbsX(this.dim.rw) - absRx;
    let absH = this.relToAbsY(this.dim.rh) - absRy;
    let width = move.bottomX - move.topX;
    let height = move.bottomY - move.topY;
    if (CodeManager.move.rInRange(move.topX, move.topY, width, height, absRx, absRy, absW, absH)) {
      this.firstBlock.findBestFit(moveManager);
    }
  }
};

/**
 * Moves this BlockStack to a new location relative to the Tab. Updates this.x and this.y accordingly.
 * @param {number} x - the x coord to move to.
 * @param {number} y - the y coord to move to.
 */
BlockStack.prototype.move = function(x, y) {
  this.x = x;
  this.y = y;
  GuiElements.move.group(this.group, x, y);
};

/**
 * Recursively stops the execution of the BlockStack and its contents. Removes the glow as well.
 */
BlockStack.prototype.stop = function() {
  if (this.isRunning) {
    this.firstBlock.stop();
    this.endRun(); // Removes glow and sets isRunning.
  }
};

/**
 * Updates the execution of the BlockStack and its contents. Returns boolean to indicate if still running.
 * @return {ExecutionStatus}
 */
BlockStack.prototype.updateRun = function() {
  if (this.isRunning) {
    // Different procedures are used if the Block returns a value.
    if (this.returnType === Block.returnTypes.none) {
      // If the current Block has been removed, don't run it.
      if (this.currentBlock.stack !== this) {
        if (this.firstBlock.autoExecute) {
          this.currentBlock = this.firstBlock;
        } else {
          this.endRun(); // Stop execution.
          return new ExecutionStatusDone();
        }
      }
      // Update the current Block.
      let execStatus = this.currentBlock.updateRun();
      if (!execStatus.isRunning()) {
        // If the block threw a error, display it
        if (execStatus.hasError()) {
          this.endRun();
          return new ExecutionStatusDone();
        } else {
          // Otherwise, the next block will run next.
          this.currentBlock = this.currentBlock.nextBlock;
        }
      }
      // If the end of the BlockStack has been reached, end execution, unless
      // the first block is set to autoExecute. Then start over.
      if (this.currentBlock != null) {
        return new ExecutionStatusRunning();
      } else if (this.firstBlock.autoExecute) {
        this.currentBlock = this.firstBlock;
        return new ExecutionStatusRunning();
      } else {
        this.endRun();
        return new ExecutionStatusDone();
      }
    } else {
      // Procedure for Blocks that return a value.
      let execStatus = this.currentBlock.updateRun();
      if (execStatus.isRunning()) {
        return new ExecutionStatusRunning();
      } else if (execStatus.hasError()) {
        this.endRun();
        return new ExecutionStatusDone();
      } else {
        // When it is done running, display the result.
        this.currentBlock.displayResult(execStatus.getResult());
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
 * Starts execution of the BlockStack starting with the specified Block. Makes BlockStack glow, too.
 * @param {Block} [startBlock] - The first Block to execute. By default, this.firstBlock is used.
 * @param {string} [broadcastMessage] - Indicates if execution was triggered by a broadcast
 */
BlockStack.prototype.startRun = function(startBlock, broadcastMessage) {
  if (startBlock == null) {
    startBlock = this.firstBlock;
  }
  if (broadcastMessage == null) {
    broadcastMessage = "";
  }
  this.runningBroadcastMessage = broadcastMessage;
  if (!this.isRunning) { // Only start if not already running.
    this.isRunning = true;
    this.currentBlock = startBlock;
    this.firstBlock.glow();
    this.tab.startRun(); // Starts Tab if it is not already running.
  }
  if (Hatchling) {
    let runtime = new MicroBlocksRuntime()
    runtime.showInstructions(startBlock)
    runtime.showCompiledBytes(startBlock)
  }
};

/**
 * Ends execution and removes glow. Does not call stop() function on Blocks; assumes they have stopped already.
 */
BlockStack.prototype.endRun = function() {
  this.isRunning = false;
  this.firstBlock.stopGlow();
};

/**
 * Checks if the moving BlockStack can snap on to the top of this BlockStack. Returns nothing.
 * Results are stored in CodeManager.fit.
 * Only called if moving BlockStack returns no value.
 */
BlockStack.prototype.findBestFitTop = function(moveManager) {
  const snap = BlockGraphics.command.snap; // Get snap bounding box for command Blocks.
  let move = CodeManager.move;
  let fit = CodeManager.fit;
  if (moveManager != null) {
    move = moveManager.move
    fit = moveManager.fit
  }

  const x = this.firstBlock.getAbsX(); // Uses screen coordinates.
  const y = this.firstBlock.getAbsY();
  const height = this.relToAbsY(this.firstBlock.height) - y;
  const width = this.relToAbsX(this.firstBlock.width) - x;
  /* Now the BlockStack will check if the bottom-left corner of the moving BlockStack falls within
   * the snap bounding box of the first Block in the BlockStack. */
  // Gets the bottom-left corner of the moving BlockStack.
  const moveBottomLeftX = move.topX;
  const moveBottomLeftY = move.bottomY;
  const moveTopRightX = move.bottomX;
  const moveTopRightY = move.topY;
  // Gets the snap bounding box of the first Block.
  //TODO: Use the c box here?
  const snapBLeft = x - snap.left;
  const snapBTop = y - snap.top;
  const snapBWidth = snap.left + snap.right;
  const snapBHeight = snap.top + height + snap.bottom;
  const snapFWidth = snap.left + width + snap.right;
  const snapFHeight = snap.top + snap.bottom;
  // Checks if the point falls in the box.
  let success = false;
  if (FinchBlox) { //because these blocks connect horizontally, check the top right corner
    success = CodeManager.move.pInRange(moveTopRightX, moveTopRightY, snapBLeft, snapBTop, snapFWidth, snapFHeight);
  } else {
    success = CodeManager.move.pInRange(moveBottomLeftX, moveBottomLeftY, snapBLeft, snapBTop, snapBWidth, snapBHeight);
  }
  if (success) {
    let xDist = move.topX - x;
    let yDist = move.bottomY - y;
    if (FinchBlox) {
      xDist = move.bottomX - x;
      yDist = move.topY - y;
    }
    const dist = xDist * xDist + yDist * yDist; // Computes the distance.
    if (!fit.found || dist < fit.dist) { // Compares it to existing fit.
      fit.found = true;
      fit.bestFit = this; // Note that in this case the bestFit is set to a BlockStack, not a Block.
      fit.dist = dist; // Saves the fit.
    }
  }
};

/**
 * Recursively attaches the provided Block and its subsequent Blocks to the top of this BlockStack.
 * @param {Block} block - The Block to attach to this BlockStack.
 */
BlockStack.prototype.snap = function(block) {
  block.stack.stop();
  if (this.isRunning) {
    // Make it glow if this stack is running
    block.glow();
  }
  /* Move this BlockStack up by the height of the of the stack the Block belongs to.
   * This compensates for the amount existing Blocks will be shifted down by the newly-added Blocks. */
  if (FinchBlox) { //Move over by width in the case of FinchBlox
    this.move(this.x - block.stack.getWidth(), this.y);
  } else {
    this.move(this.x, this.y - block.stack.getHeight());
  }

  // The new top Block.
  const topStackBlock = block;
  // The last Block in the stack being added.
  const bottomStackBlock = block.getLastBlock();
  // The topmost of the existing Blocks.
  const upperBlock = this.firstBlock;

  // Fix references between Blocks to glue them together.
  this.firstBlock = topStackBlock;
  topStackBlock.parent = null;
  bottomStackBlock.nextBlock = upperBlock;
  upperBlock.parent = bottomStackBlock;
  // The old BlockStack can now be destroyed.
  const oldG = block.stack.group;
  block.stack.remove();
  block.changeStack(this);
  oldG.remove();

  this.updateDim();
  this.startRunIfAutoExec();

  if (Hatchling) { HL_Utils.showPortsPopup(block) }
};

/**
 * Adds an indicator showing that the moving BlockStack will snap onto the top of this BlockStack if released.
 */
BlockStack.prototype.highlight = function() {
  Highlighter.highlight(this.getAbsX(), this.getAbsY(), 0, this.firstBlock.height, 0, false, this.isRunning);
};

/**
 * Shifts this BlockStack by the specified amount.
 * @param {number} x - The amount to shift in the x direction.
 * @param {number} y - The amount to shift in the y direction.
 */
BlockStack.prototype.shiftOver = function(x, y) {
  this.move(this.x + x, this.y + y);
};

/**
 * Recursively copies this BlockStack and all its contents to a new BlockStack. Returns the new BlockStack.
 * @return {BlockStack} - The newly-copied BlockStack.
 */
BlockStack.prototype.duplicate = function(x, y) {
  // First duplicate the Blocks.
  const firstCopyBlock = this.firstBlock.duplicate(x, y);
  // Then put them in a new BlockStack.
  return new BlockStack(firstCopyBlock, this.tab);
};

/**
 * Returns the Tab this BlockStack belongs to. Used by the Blocks it contains when they need to kow their tab.
 * @return {Tab} - The Tab this BlockStack belongs to.
 */
BlockStack.prototype.getTab = function() {
  return this.tab;
};

/**
 * Moves this BlockStack out of the Tab's group and into the drag layer about other Blocks.
 */
BlockStack.prototype.fly = function() {
  // Remove group from Tab (visually only).
  this.group.remove();
  // Add group to drag layer.
  GuiElements.layers.drag.appendChild(this.group);
  // Get current location on screen.
  const absX = this.getAbsX();
  const absY = this.getAbsY();
  // Record that this BlockStack is flying.
  this.flying = true;
  // Move to ensure that position on screen does not change.
  this.move(CodeManager.dragAbsToRelX(absX), CodeManager.dragAbsToRelY(absY));
  this.tab.updateArrows();
};

/**
 * Moves this BlockStack back into its Tab's group.
 */
BlockStack.prototype.land = function() {
  this.group.remove(); // Remove from drag layer.
  this.tabGroup.appendChild(this.group); // Go back into tab group.
  const absX = this.getAbsX(); // Get current location on screen.
  const absY = this.getAbsY();
  this.flying = false;
  // Move to ensure that position on screen does not change.
  this.move(this.tab.absToRelX(absX), this.tab.absToRelY(absY));
  this.tab.updateArrows();

  if (Hatchling) { HL_Utils.showPortsPopup(this.firstBlock) }
};

/**
 * Stops execution and removes the BlockStack digitally and visually.
 */
BlockStack.prototype.remove = function() {
  this.stop();
  this.group.remove();
  this.tab.removeStack(this);
  this.tab.updateArrows();
};

/**
 * Deletes all the comments attached to blocks in this stack. Called when
 * deleting the stack.
 */
BlockStack.prototype.deleteComments = function() {
  let nextBlock = this.firstBlock
  while (nextBlock != null) {
    if (nextBlock.comment != null) {
      UndoManager.deleteComment(nextBlock.comment)
    }
    nextBlock = nextBlock.nextBlock
  }
}

/**
 * Arranges the comments attached to this stack so that none overlap
 */
BlockStack.prototype.arrangeComments = function() {

  function checkBlock(block, commentsPlaced) {

    if (block.comment != null) {
      let cmnt = block.comment
      let xOffset = 0
      let check = block
      while (check.parent != null && check.parent.isSlot) {
        xOffset += check.parent.x
        check = check.parent.parent
      }

      let maxDistFromStackEdge = getWidthFromMap(check, cmnt.height)
      let maxWidth = check.absToRelX(check.stack.relToAbsX(maxDistFromStackEdge))
      cmnt.x = maxWidth + 2 * Comment.margin - xOffset
      cmnt.y = check.y - block.y //0
      commentsPlaced.forEach(function(placedComment) {
        const b2 = placedComment.parent
        let x1 = block.stack.absToRelX(block.relToAbsX(cmnt.x))
        let y1 = block.stack.absToRelY(block.relToAbsY(cmnt.y)) //cmnt.parent.y
        let w1 = cmnt.width
        let h1 = cmnt.height
        let x2 = b2.stack.absToRelX(b2.relToAbsX(placedComment.x))
        let y2 = b2.stack.absToRelY(b2.relToAbsY(placedComment.y)) //placedComment.parent.y
        let w2 = placedComment.width
        let h2 = placedComment.height
        if (CodeManager.move.rInRange(x1, y1, w1, h1, x2, y2, w2, h2)) {
          maxWidth = block.absToRelX(block.stack.relToAbsX(x2 + w2))
          cmnt.x = maxWidth + 2 * Comment.margin
        }
      });
      GuiElements.move.group(cmnt.group, cmnt.x, cmnt.y)

      const lineWidth = cmnt.x - block.width
      cmnt.lineX = block.width
      cmnt.lineY = block.hasBlockSlot1 ? block.topHeight / 2 : block.height / 2
      GuiElements.update.rect(cmnt.line, cmnt.lineX, cmnt.lineY, lineWidth, Comment.lineHeight)

      cmnt.setPosition()
      commentsPlaced.push(cmnt)
    }
    return commentsPlaced
  }

  function mapBlock(block, mapArray) {
    //skip slots since they are within other blocks
    if (block.parent != null && block.parent.isSlot) {
      return mapArray
    }

    mapArray.push({
      'x': (block.x + block.width),
      'y': block.y
    })
    return mapArray
  }

  function traverseStack(block, func, variable) {
    if (block == null) {
      return variable
    }
    variable = func(block, variable)
    for (let i = 0; i < block.slots.length; i++) {
      variable = traverseStack(block.slots[i].child, func, variable)
    }
    if (block.blockSlot1 != null) {
      variable = traverseStack(block.blockSlot1.child, func, variable)
    }
    if (block.blockSlot2 != null) {
      variable = traverseStack(block.blockSlot2.child, func, variable)
    }
    variable = traverseStack(block.nextBlock, func, variable)
    return variable
  }

  function getWidthFromMap(block, commentHeight) {
    let maxW = block.width + block.x
    for (let i = 0; i < map.length; i++) {
      let y = map[i].y
      if (y > block.y && y < (block.y + commentHeight)) {
        maxW = Math.max(maxW, map[i].x)
      }
    }
    return maxW
  }

  let map = traverseStack(this.firstBlock, mapBlock, [])
  map.sort(function(a, b) {
    return a.y - b.y
  })

  let commentsPlaced = traverseStack(this.firstBlock, checkBlock, [])

}

/**
 * Passes message to first Block in BlockStack that the flag was tapped.
 */
BlockStack.prototype.eventFlagClicked = function() {
  // Only pass message if not already running.
  if (!this.isRunning) {
    this.firstBlock.eventFlagClicked();
  }
};

/**
 * Passes broadcast message to first Block in BlockStack.
 * @param {string} message - The broadcast message
 */
BlockStack.prototype.eventBroadcast = function(message) {
  this.firstBlock.eventBroadcast(message);
};

/**
 * Checks if a broadcast is still running (used for the broadcast and wait Block).
 * @param {string} message - The broadcast message
 */
BlockStack.prototype.checkBroadcastRunning = function(message) {
  if (this.isRunning) {
    return this.runningBroadcastMessage === message;
  }
  return false;
};

/**
 * Recursively updates the available broadcast messages.
 */
BlockStack.prototype.updateAvailableMessages = function() {
  this.firstBlock.updateAvailableMessages();
};

/**
 * Recursively returns the last Block in the BlockStack.
 * @return {Block} - The last Block in the BlockStack.
 */
BlockStack.prototype.getLastBlock = function() {
  return this.firstBlock.getLastBlock();
};

/**
 * Updates the dimensions of the Tab
 */
BlockStack.prototype.updateTabDim = function() {
  // Flying blocks don't count
  if (this.flying) return;

  // If this stack's bounding box is outside the Tab's current bounding box, update the Tab's box to include it.
  const dim = this.tab.dim;
  if (dim.x1 == null || this.x < dim.x1) {
    dim.x1 = this.x;
  }
  if (dim.y1 == null || this.y < dim.y1) {
    dim.y1 = this.y;
  }
  const x2 = this.x + this.dim.rw;
  if (dim.x2 == null || x2 > dim.x2) {
    dim.x2 = x2;
  }
  const y2 = this.y + this.dim.rh;
  if (dim.y2 == null || y2 > dim.y2) {
    dim.y2 = y2;
  }
};

/**
 * Writes the BlockStack to XML
 * @param {Document} xmlDoc - The document to write to
 * @param {boolean} skipFirstBlock - do not record the first block if true (FinchBlox)
 * @return {Node} - The XML node representing the BlockStack
 */
BlockStack.prototype.createXml = function(xmlDoc, skipFirstBlock) {
  const stack = XmlWriter.createElement(xmlDoc, "stack");
  XmlWriter.setAttribute(stack, "x", this.x);
  XmlWriter.setAttribute(stack, "y", this.y);
  // Create a tag for Blocks and recursively write the Blocks to it.
  const blocks = XmlWriter.createElement(xmlDoc, "blocks");
  if (skipFirstBlock) {
    if (this.firstBlock.nextBlock != null) {
      this.firstBlock.nextBlock.writeToXml(xmlDoc, blocks);
    } else {
      return null;
    }
  } else {
    this.firstBlock.writeToXml(xmlDoc, blocks);
  }
  stack.appendChild(blocks);
  return stack;
};

/**
 * Creates a BlockStack from XML
 * @param {Node} stackNode - The tag to import from
 * @param {Tab} tab - The Tab to import into
 * @return {BlockStack|null} stack - The imported stack
 */
BlockStack.importXml = function(stackNode, tab) {
  const x = XmlWriter.getAttribute(stackNode, "x", 0, true);
  const y = XmlWriter.getAttribute(stackNode, "y", 0, true);
  const blocksNode = XmlWriter.findSubElement(stackNode, "blocks");
  const blockNodes = XmlWriter.findSubElements(blocksNode, "block");

  // All stacks must have at least one Block to be created
  let firstBlock = null;
  let i = 0;
  // The first Block to successfully import becomes the first Block in the Stack
  while (firstBlock == null && i < blockNodes.length) {
    firstBlock = Block.importXml(blockNodes[i]);
    i++;
  }
  if (firstBlock == null) {
    // All Blocks could not import.  Exit.
    return null;
  }
  const stack = new BlockStack(firstBlock, tab);
  stack.move(x, y);
  // We iterate through the Blocks, keeping track of the previous Block so we can link them properly
  let previousBlock = firstBlock;
  while (i < blockNodes.length) {
    const newBlock = Block.importXml(blockNodes[i]);
    if (newBlock != null) {
      previousBlock.snap(newBlock);
      previousBlock = newBlock;
    }
    i++;
  }
  stack.updateDim();
  return stack;
};

/**
 * Notifies the BlockStack that a variable has been renamed.  Passed recursively.
 * @param {Variable} variable - The variable that has been renamed
 */
BlockStack.prototype.renameVariable = function(variable) {
  this.passRecursively("renameVariable", variable);
};

/**
 * Notifies the BlockStack that a variable has been deleted.  Passed recursively.
 * @param {Variable} variable - The variable that has been deleted
 */
BlockStack.prototype.deleteVariable = function(variable) {
  this.passRecursively("deleteVariable", variable);
};

/**
 * Notifies the BlockStack that a list has been renamed.  Passed recursively.
 * @param {List} list - The list that has been renamed
 */
BlockStack.prototype.renameList = function(list) {
  this.passRecursively("renameList", list);
};

/**
 * Notifies the BlockStack that a list has been deleted.  Passed recursively.
 * @param {List} list - The list that has been deleted
 */
BlockStack.prototype.deleteList = function(list) {
  this.passRecursively("deleteList", list);
};

/**
 * @param {Variable} variable
 * @return {boolean}
 */
BlockStack.prototype.checkVariableUsed = function(variable) {
  return this.firstBlock.checkVariableUsed(variable);
};

/**
 * @param {List} list
 * @return {boolean}
 */
BlockStack.prototype.checkListUsed = function(list) {
  return this.firstBlock.checkListUsed(list);
};

/**
 * Updates dimensions after device dropdowns become visible
 * @param deviceClass
 */
BlockStack.prototype.hideDeviceDropDowns = function(deviceClass) {
  this.updateDim();
};

/**
 * Updates dimensions after device dropdowns become hidden
 * @param deviceClass
 */
BlockStack.prototype.showDeviceDropDowns = function(deviceClass) {
  this.updateDim();
};

/**
 * @param deviceClass
 * @return {number}
 */
BlockStack.prototype.countDevicesInUse = function(deviceClass) {
  return this.firstBlock.countDevicesInUse(deviceClass);
};

/**
 * @param {string} message
 */
BlockStack.prototype.passRecursivelyDown = function(message) {
  const myMessage = message;
  let funArgs = Array.prototype.slice.call(arguments, 1);

  Array.prototype.unshift.call(arguments, "passRecursivelyDown");
  this.passRecursively.apply(this, arguments);

  if (myMessage === "showDeviceDropDowns" && this.showDeviceDropDowns != null) {
    this.showDeviceDropDowns.apply(this, funArgs);
  }
  if (myMessage === "hideDeviceDropDowns" && this.hideDeviceDropDowns != null) {
    this.hideDeviceDropDowns.apply(this, funArgs);
  }
};

/**
 *
 * @param {string} functionName
 */
BlockStack.prototype.passRecursively = function(functionName) {
  let args = Array.prototype.slice.call(arguments, 1);
  this.firstBlock[functionName].apply(this.firstBlock, args);
};

/**
 * Returns the width of the BlockStack (using relative coordinates)
 * @return {number}
 */
BlockStack.prototype.getWidth = function() {
  return this.dim.rw;
};

/**
 * Returns the height of the BlockStack (using relative coordinates)
 * @return {number}
 */
BlockStack.prototype.getHeight = function() {
  return this.dim.rh;
};
