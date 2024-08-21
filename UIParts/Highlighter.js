/**
 * Static class in charge of indicating where the blocks being dragged will snap to when dropped.  It has a single
 * white (or black if Blocks are running) path element which it moves around and reshapes
 */
function Highlighter() {
  Highlighter.path = Highlighter.createPath();
  Highlighter.shadowGroup = GuiElements.create.group(0, 0);
  Highlighter.visible = false;
  Highlighter.currentlyDisplaced = null //For Hatchling, keep track of blocks temporarily moved
}

/**
 * Creates a path object for the highlighter
 * @return {Element}
 */
Highlighter.createPath = function() {
  const bG = BlockGraphics.highlight;
  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttributeNS(null, "stroke", bG.strokeC);
  path.setAttributeNS(null, "stroke-width", bG.strokeW);
  path.setAttributeNS(null, "fill", "none");
  return path;
};

/**
 * Highlights a Block/Slot based on the provided information
 * @param {number} x - The x coord the highlighter should appear at
 * @param {number} y - The y coord the highlighter should appear at
 * @param {number} width - The width the highlighter should have (for slots)
 * @param {number} height - The height the highlighter should have (for slots)
 * @param {number} type - The type of path according to the BlockGraphics type system
 * @param {boolean} isSlot - Whether the thing being highlighted is a Slot
 * @param {boolean} isGlowing - Whether the thing being highlighted already has a white outline (since it is running)
 *                              and should therefore by highlighted in black
 * @param {boolean} isComment - Whether the instigator is a Comment
 */
Highlighter.highlight = function(x, y, width, height, type, isSlot, isGlowing, isComment) {
  const myX = CodeManager.dragAbsToRelX(x);
  const myY = CodeManager.dragAbsToRelX(y);
  const pathD = BlockGraphics.buildPath.highlight(myX, myY, width, height, type, isSlot, isComment);
  Highlighter.path.setAttributeNS(null, "d", pathD);
  if (!Highlighter.visible) {
    GuiElements.layers.highlight.appendChild(Highlighter.path);
    Highlighter.visible = true;
  }
  const bG = BlockGraphics.highlight;
  if (isGlowing != null && isGlowing) {
    Highlighter.path.setAttributeNS(null, "stroke", bG.strokeDarkC);
  } else {
    Highlighter.path.setAttributeNS(null, "stroke", bG.strokeC);
  }
};

/**
 * Creates a flat grey version of the stack. Used in FinchBlox instead of a
 * highlight line. Hatchling makes it just an outline, and slides any following blocks 
 * out of the way.
 * @param {Object} fit - The current best fit. May be a BlockStack, a BlockSlot, or a Block.
 * @param {BlockStack} stack - The moving stack that is looking for a place to snap
 */
Highlighter.showShadow = function(fit, stack) {
  let myX = 0;
  //let myY = CodeManager.dragAbsToRelX(fit.getAbsY());
  let myY = 0;
  let snapFront = false;
  let firstDisplaced = null
  if (fit instanceof BlockStack) {
    myY = fit.tab.absToRelY(fit.getAbsY());
    //myX = CodeManager.dragAbsToRelX(fit.getAbsX());
    myX = fit.tab.absToRelX(fit.getAbsX());
    if (HatchPlus) { myX = myX - BlockGraphics.command.bumpOffset - BlockGraphics.command.cornerRadius; }
    snapFront = true;
  } else if (fit instanceof BlockSlot) {
    //myY = CodeManager.dragAbsToRelY(fit.getAbsY());
    myY = fit.parent.stack.tab.absToRelY(fit.getAbsY());
    //myX = CodeManager.dragAbsToRelX(fit.getAbsX()) - BlockGraphics.command.fbBumpDepth;
    myX = fit.parent.stack.tab.absToRelX(fit.getAbsX()) - BlockGraphics.command.fbBumpDepth;
    firstDisplaced = fit.child
  } else {
    //myX = CodeManager.dragAbsToRelX(fit.relToAbsX(fit.width));
    myY = fit.stack.tab.absToRelY(fit.getAbsY());
    myX = fit.stack.tab.absToRelX(fit.relToAbsX(fit.width));
    if (HatchPlus) {
      myY = fit.stack.tab.absToRelY(fit.relToAbsY(fit.height));
      myX = fit.stack.tab.absToRelX(fit.getAbsX()) - BlockGraphics.command.bumpOffset - BlockGraphics.command.cornerRadius;
    }
    firstDisplaced = fit.nextBlock
  }
  const color = (Hatchling || HatchPlus) ? Colors.ballyGrayDark : Colors.iron;

  let block = stack.firstBlock;
  let shadowW = 0;
  let shadowH = 0;
  while (block != null) {
    let group = GuiElements.create.group(0, 0, this.shadowGroup);
    let pathE = GuiElements.create.path(group);
    if (Hatchling || HatchPlus) {
      GuiElements.update.color(pathE, Colors.white);
      GuiElements.update.stroke(pathE, color, 1)
    } else {
      GuiElements.update.color(pathE, color);
    }
    GuiElements.move.group(group, block.x + BlockGraphics.command.fbBumpDepth, block.y);
    let pathD = block.path.getAttribute("d");
    pathE.setAttributeNS(null, "d", pathD);
    shadowW += block.width + BlockGraphics.command.fbBumpDepth;
    shadowH += block.height
    block = block.nextBlock;
  }
  if (snapFront) {
    if (HatchPlus) {
      myY -= shadowH
    } else {
      myX -= shadowW + BlockGraphics.command.fbBumpDepth;
    }
  }

  if (Hatchling || HatchPlus) {
    if (Highlighter.currentlyDisplaced != null && 
      firstDisplaced != Highlighter.currentlyDisplaced) {
      Highlighter.currentlyDisplaced.unSlide(true)
    }
    Highlighter.currentlyDisplaced = firstDisplaced
    if (firstDisplaced != null) {
      if (HatchPlus) {
        firstDisplaced.tempSlide(shadowH)
      } else {
        firstDisplaced.tempSlide(shadowW)
      }
    }
  }

  GuiElements.move.group(this.shadowGroup, myX, myY);

  if (!Highlighter.visible) {
    //GuiElements.layers.highlight.appendChild(Highlighter.shadowGroup);
    //GuiElements.layers.activeTab.appendChild(Highlighter.shadowGroup);
    TabManager.activeTab.mainG.appendChild(Highlighter.shadowGroup);
    Highlighter.visible = true;
  }

}


/**
 * Removes the highlighter from view
 */
Highlighter.hide = function() {
  if (Highlighter.visible) {
    Highlighter.path.remove();
    while (this.shadowGroup.firstChild) {
      this.shadowGroup.removeChild(this.shadowGroup.firstChild);
    }
    Highlighter.shadowGroup.remove();
    if (Highlighter.currentlyDisplaced != null) {
      Highlighter.currentlyDisplaced.unSlide(true)
      Highlighter.currentlyDisplaced = null
    }
    Highlighter.visible = false;
  }
};
