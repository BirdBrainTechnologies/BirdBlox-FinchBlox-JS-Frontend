/**
 * Static class in charge of indicating where the blocks being dragged will snap to when dropped.  It has a single
 * white (or black if Blocks are running) path element which it moves around and reshapes
 * @constructor
 */
function Highlighter() {
	Highlighter.path = Highlighter.createPath();
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
 * Removes the highlighter from view
 */
Highlighter.hide = function() {
	if (Highlighter.visible) {
		Highlighter.path.remove();
		Highlighter.visible = false;
	}
};