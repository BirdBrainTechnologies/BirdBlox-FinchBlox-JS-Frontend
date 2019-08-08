/**
 * Static class in charge of indicating where the blocks being dragged will snap to when dropped.  It has a single
 * white (or black if Blocks are running) path element which it moves around and reshapes
 */
function Highlighter() {
	Highlighter.path = Highlighter.createPath();
	Highlighter.shadowGroup = GuiElements.create.group(0, 0);
	Highlighter.visible = false;
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
 */
Highlighter.highlight = function(x, y, width, height, type, isSlot, isGlowing) {
	const myX = CodeManager.dragAbsToRelX(x);
	const myY = CodeManager.dragAbsToRelX(y);
	const pathD = BlockGraphics.buildPath.highlight(myX, myY, width, height, type, isSlot);
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
 * highlight line.
 * @param x
 * @param y
 * @param stack
 */
Highlighter.showShadow = function(fit, stack) {
	let myX = 0;
	//let myY = CodeManager.dragAbsToRelX(fit.getAbsY());
  let myY = 0;
	let snapFront = false;
	if (fit instanceof BlockStack) {
    myY = fit.tab.absToRelY(fit.getAbsY());
		//myX = CodeManager.dragAbsToRelX(fit.getAbsX());
    myX = fit.tab.absToRelX(fit.getAbsX());
		snapFront = true;
	} else if (fit instanceof BlockSlot) {
    //myY = CodeManager.dragAbsToRelY(fit.getAbsY());
    myY = fit.parent.stack.tab.absToRelY(fit.getAbsY());
		//myX = CodeManager.dragAbsToRelX(fit.getAbsX()) - BlockGraphics.command.fbBumpDepth;
    myX = fit.parent.stack.tab.absToRelX(fit.getAbsX()) - BlockGraphics.command.fbBumpDepth;
	} else {
	 	//myX = CodeManager.dragAbsToRelX(fit.relToAbsX(fit.width));
    myY = fit.stack.tab.absToRelY(fit.getAbsY());
    myX = fit.stack.tab.absToRelX(fit.relToAbsX(fit.width));
	}
	const color = Colors.iron;

	let block = stack.firstBlock;
	let shadowW = 0;
	while(block != null){
		let group = GuiElements.create.group(0, 0, this.shadowGroup);
		let pathE = GuiElements.create.path(group);
		GuiElements.update.color(pathE, color);
		GuiElements.move.group(group, block.x + BlockGraphics.command.fbBumpDepth, block.y);
		let pathD = block.path.getAttribute("d");
		pathE.setAttributeNS(null, "d", pathD);
		shadowW += block.width + BlockGraphics.command.fbBumpDepth;
		block = block.nextBlock;
	}
	if (snapFront) { myX -= shadowW + BlockGraphics.command.fbBumpDepth; }

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
		Highlighter.visible = false;
	}
};
