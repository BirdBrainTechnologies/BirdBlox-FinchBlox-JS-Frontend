/**
 * Adds a colored icon that can be used as part of a Block. Used in the "when flag tapped" Block
 * @param {Block} parent - The Block this icon is a part of
 * @param pathId - entry of VectorPaths corresponding to the icon to use
 * @param {string} color - Hex representation of the color to use
 * @param {string} altText - Text representation of icon is used for creating text summary
 * @param {number} height - Height of the icon. Icon will automatically center vertically
 * @param {number} rotation - amount to rotate the icon in degrees
 * @constructor
 */
function BlockIcon(parent, pathId, color, altText, height, rotation) {
	DebugOptions.validateNonNull(parent, pathId, color, altText);
	DebugOptions.validateNumbers(height);
	this.pathId = pathId;
	this.color = color;
	this.altText = altText;
	this.width = VectorIcon.computeWidth(pathId, height);
	this.height = height;
	this.x = 0;
	this.y = 0;
	this.parent = parent;
	this.icon = new VectorIcon(0, 0, pathId, color, height, this.parent.group, false, rotation);
	TouchReceiver.addListenersChild(this.icon.pathE, this.parent);
	this.isSlot = false;
}
BlockIcon.prototype = Object.create(BlockPart.prototype);
BlockIcon.prototype.constructor = BlockIcon;

/**
 * @param {number} x - The x coord the icon should have relative to the Block it is in
 * @param {number} y - The y coord ths icon should have measured from the center of the icon
 * @return {number} - The width of the icon, indicating how much the next item should be shifted over.
 */
BlockIcon.prototype.updateAlign = function(x, y) {
	DebugOptions.validateNumbers(x, y);
	this.move(x, y - this.height / 2);
	return this.width;
};

/**
 * BlockIcons are of constant size, so updateDim does nothing
 */
BlockIcon.prototype.updateDim = function() {

};

/**
 * Moves the icon and sets this.x and this.y to the specified coordinates
 * @param {number} x
 * @param {number} y
 */
BlockIcon.prototype.move = function(x, y) {
	DebugOptions.validateNumbers(x, y);
	this.x = x;
	this.y = y;
	this.icon.move(x, y);
};

/**
 * Creates a text representation of the BlockIcon
 * @return {string}
 */
BlockIcon.prototype.textSummary = function() {
	return this.altText;
};

/**
 * Adds a second icon on top of the first and returns a reference to it.
 * @param pathId - entry of VectorPaths corresponding to the icon to use
 * @param {string} color - Hex representation of the color to use
 */
BlockIcon.prototype.addSecondIcon = function(pathId, color){
	this.icon.addSecondPath(pathId, color);
	TouchReceiver.addListenersChild(this.icon.pathE2, this.parent);
}
