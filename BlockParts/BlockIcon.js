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
	this.xOffset = 0;
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
	this.icon.move(x + this.xOffset, y);
	if (this.textE != null){
		GuiElements.move.text(this.textE, this.x + this.textXOffset, this.y + this.textYOffset);
	}
	if (this.negateG != null){
		GuiElements.move.group(this.negateG, this.x, this.y);
	}
	if (this.icon2 != null){
		this.icon2.move(x + this.icon2xOffset, y + this.icon2yOffset);
	}
	if (this.obstacle != null){
		GuiElements.move.element(this.obstacle, this.x + this.xOffset, this.y);
	}
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
 * @param {boolean} centerBelow - if true, center the new icon below the first.
 * @param {number} height - height of the second icon
 * @param {number} margin - space between icons
 */
BlockIcon.prototype.addSecondIcon = function(pathId, color, centerBelow, height, margin){
	if (centerBelow == null) { centerBelow = false; }
	if (height == null) { height = this.height; }
	if (margin == null) { margin = 0; }
	if (centerBelow) {
    const w = VectorIcon.computeWidth(pathId, height);
		if (w > this.width) {
			this.xOffset = w/2 - this.width/2;
			this.icon2xOffset = 0;
			this.width = w;
		} else {
			this.icon2xOffset = this.width/2 - w/2;
		}
    this.icon2yOffset = this.height + margin;
		this.height += height + margin;
		this.icon2 = new VectorIcon(0, 0, pathId, color, height, this.parent.group);
		TouchReceiver.addListenersChild(this.icon2.pathE, this.parent);
  } else {
		this.icon.addSecondPath(pathId, color, centerBelow);
		TouchReceiver.addListenersChild(this.icon.pathE2, this.parent);
	}
}

/**
 * Add some text to this icon. Created for the FinchBlox level 1 music block.
 * Also used for FinchBlox level 3 repeat block.
 * @param {string} text - Text to add
 */
BlockIcon.prototype.addText = function(text, xOffset, yOffset) {
	if (this.textE != null) {
		this.parent.group.removeChild(this.textE);
	}
	
	const font = Font.uiFont(28);
	//this.textXOffset = 12;
	//this.textYOffset = 30 + font.charHeight/2;
	this.textXOffset = xOffset;
	this.textYOffset = yOffset + font.charHeight/2;
	const x = this.x + this.textXOffset;
	const y = this.y + this.textYOffset;

	this.textE = GuiElements.draw.text(x, y, text, font, this.color);
	this.parent.group.appendChild(this.textE);
	TouchReceiver.addListenersChild(this.textE, this.parent);

	const textHeight = GuiElements.measure.textHeight(this.textE);
	const textWidth = GuiElements.measure.textWidth(this.textE);
	this.height = this.textYOffset;
	this.width = this.textXOffset + textWidth;
	//console.log("BlockIcon addText " + x + ", " + y + "; " + this.height + " " + this.width);
}

/**
 * Add a white rounded rectangle background behind the icon
 */
BlockIcon.prototype.addBackgroundRect = function() {
	this.icon.addBackgroundRect();
	TouchReceiver.addListenersChild(this.icon.bgRect, this.parent);
}

/**
	* Add a circle with a slash over the icon
	* @param color - color of the circle and slash
	*/
BlockIcon.prototype.negate = function(color) {
	this.negateG = GuiElements.create.group(this.x, this.y, this.parent.group);
	const cr = this.width/2;//(2*this.scaleX);
	const cx = this.x + cr;
	const cy = this.y + cr;
	const circle = GuiElements.draw.circle(cx, cy, cr, "none", this.negateG);
	GuiElements.update.stroke(circle, color, 3);

	const slash = GuiElements.create.path(this.negateG);
	let slashPath = "M " + (cx + cr*Math.cos(315 * Math.PI/180)) + ",";
	slashPath += (cy + cr*Math.sin(315 * Math.PI/180));
	slashPath += " L " + (cx + cr*Math.cos(135 * Math.PI/180)) + ",";
	slashPath += (cy + cr*Math.sin(135 * Math.PI/180));
	slash.setAttributeNS(null, "d", slashPath);
	GuiElements.update.stroke(slash, color, 3);
}

/**
	* Add a rectangular obstacle above the icon
	* @param color - color of the rectangle
	*/
BlockIcon.prototype.addObstacle = function(color) {

	const w = 30;//40;//60;
	const o = 5;//10;
	const h = 7;//11;
	const r = 1.5;//2;
	const margin = 5;
	if (w > this.width) {
		this.xOffset = 0;
		this.icon2xOffset = w/2 - this.width/2;
		this.width = w;
	} else {
		this.xOffset = this.width/2 - w/2;
	}
	this.xOffset -= o;
	this.icon2yOffset = h + margin;
	this.height += h + margin;
	this.icon2 = this.icon;

	this.obstacle = GuiElements.draw.rect((-o), 0, w+2*o, h, color, r, r);
	this.parent.group.appendChild(this.obstacle);
	TouchReceiver.addListenersChild(this.obstacle, this.parent);
}
