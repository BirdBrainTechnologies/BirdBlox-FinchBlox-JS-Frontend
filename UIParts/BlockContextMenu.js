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
	BCM.bnMargin = Button.defaultMargin;
	BCM.bgColor = Colors.lightGray;
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
BlockContextMenu.prototype.duplicate = function() {
	const BCM = BlockContextMenu;
	const newX = this.block.getAbsX() + BCM.blockShift;
	const newY = this.block.getAbsY() + BCM.blockShift;
	const blockCopy = this.block.duplicate(newX, newY);
	const tab = this.block.stack.tab;
	const copyStack = new BlockStack(blockCopy, tab);
	//copyStack.updateDim();
	this.close();
};

/**
 * Closes the menu
 */
BlockContextMenu.prototype.close = function() {
	this.block = null;
	this.bubbleOverlay.hide();
	this.menuBnList.hide();
};
