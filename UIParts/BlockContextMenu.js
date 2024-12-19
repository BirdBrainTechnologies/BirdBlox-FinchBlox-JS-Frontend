/**
 * A menu that appears when a Block is long pressed. Provides options to delete or duplicate the block.
 * Also used to give a rename option to variables and lists
 *
 * @param {Block} block
 * @param {number} x - The x coord the menu should appear at
 * @param {number} y - The y coord the menu should appear at
 * @constructor
 */
function BlockContextMenu(block, x, y) {
  this.block = block;
  this.x = x;
  this.y = y;
  this.showMenu();
}

BlockContextMenu.setGraphics = function() {
  const BCM = BlockContextMenu;
  BCM.bnMargin = HatchPlus ? Button.defaultMargin/2 : Button.defaultMargin;
  BCM.bgColor = HatchPlus ? Colors.ballyBrandBlue : Colors.lightGray;
  BCM.blockShift = 20;
};

/**
 * Renders the menu
 */
BlockContextMenu.prototype.showMenu = function() {
  const BCM = BlockContextMenu;
  this.group = GuiElements.create.group(0, 0);

  let layer = GuiElements.layers.inputPad;
  let overlayType = Overlay.types.inputPad;
  this.bubbleOverlay = new BubbleOverlay(overlayType, BCM.bgColor, BCM.bnMargin, this.group, this, layer);
  this.menuBnList = new SmoothMenuBnList(this.bubbleOverlay, this.group, 0, 0);
  this.menuBnList.markAsOverlayPart(this.bubbleOverlay);
  this.addOptions();
  const height = this.menuBnList.previewHeight();
  const width = this.menuBnList.previewWidth();
  this.bubbleOverlay.display(this.x, this.x, this.y, this.y, this.menuBnList.width, height);
  this.menuBnList.show();
};

/**
 * Adds options to the menu based on the stack the menu is for.
 */
BlockContextMenu.prototype.addOptions = function() {
  // TODO: This information should probably be passed in by the constructor, not figured out by the ContextMenu
  if (this.block.stack.isDisplayStack) {
    if (this.block.constructor === B_Variable) {

      this.menuBnList.addOption(Language.getStr("Rename"), function() {
        this.block.renameVar();
        this.close();
      }.bind(this));

      this.menuBnList.addOption(Language.getStr("Delete"), function() {
        this.block.deleteVar();
        this.close();
      }.bind(this));

    }
    if (this.block.constructor === B_List) {

      this.menuBnList.addOption(Language.getStr("Rename"), function() {
        this.block.renameLi();
        this.close();
      }.bind(this));

      this.menuBnList.addOption(Language.getStr("Delete"), function() {
        this.block.deleteLi();
        this.close();
      }.bind(this));

    }
  } else {

    if (this.block.comment == null) {
      this.menuBnList.addOption(Language.getStr("Add_Comment"), function() {
        this.block.addComment();
        this.close();
      }.bind(this));
    }

    this.menuBnList.addOption(Language.getStr("Duplicate"), function() {
      this.duplicate();
    }.bind(this));

    if (HatchPlus) {
      this.menuBnList.addOption(Language.getStr("Duplicate_All"), function() {
        this.duplicate(true)
      }.bind(this))
      this.menuBnList.addOption(Language.getStr("Extract_Block"), function() {
        this.extract()
      }.bind(this))
    }

    this.menuBnList.addOption(Language.getStr("Delete"), function() {
      // Delete the stack and add it to the UndoManager
      UndoManager.deleteStack(this.block.unsnap());
      this.close();
    }.bind(this));

  }
};

/**
 * Duplicates this menu's Block and all blocks below it.
 */
BlockContextMenu.prototype.duplicate = function(all) {
  const BCM = BlockContextMenu;
  const newX = this.block.getAbsX() + BCM.blockShift;
  const newY = this.block.getAbsY() + BCM.blockShift;
  const blockCopy = this.block.duplicate(newX, newY, all);
  const tab = this.block.stack.tab;
  const copyStack = new BlockStack(blockCopy, tab);
  //copyStack.updateDim();
  this.close();
};

/**
 * Extracts this menu's Block.
 */
BlockContextMenu.prototype.extract = function() {
  let parent = this.block.parent 
  let next = this.block.nextBlock
  const BCM = BlockContextMenu;
  let newX = this.block.getAbsX() 
  let newY = this.block.getAbsY() 
  this.block.unsnap()
  
  if (next != null) {
    next.unsnap()
    if (parent != null) {
      parent.snap(next)
    } else {
      newY -= BCM.blockShift
    }
  }
  if (parent != null) {
    newX += parent.width + BCM.blockShift
    newY -= BCM.blockShift
  }
  //this.block.stack.move(newX, newY)

  CodeManager.move.start(this.block, this.block.getAbsX(), this.block.getAbsY())
  CodeManager.move.update(newX, newY)
  while (CodeManager.fit.found) {
    newX += BCM.blockShift
    newY -= BCM.blockShift;
    CodeManager.move.update(newX, newY)
  }
  CodeManager.move.end()

  this.close()
}

/**
 * Closes the menu
 */
BlockContextMenu.prototype.close = function() {
  this.block = null;
  this.bubbleOverlay.hide();
  this.menuBnList.hide();
};
