/**
 * A VectorIcon controls an SVG path element. It draws the information for the path from VectorPaths.js and rescales
 * the path appropriately.
 * @param {number} x - The x coord of the path
 * @param {number} y - The y coord of the path
 * @param {object} pathId - The object from VectorPaths containing the information about the path to draw
 * @param {string} color - Color in hex
 * @param {number} height - The height the path should be.  Width is computed from this
 * @param {Element} parent - An SVG group element the path should go inside
 * @constructor
 */
function VectorIcon(x, y, pathId, color, height, parent) {
	this.x = x;
	this.y = y;
	this.color = color;
	this.height = height;
	this.pathId = pathId;
	this.parent = parent;
	this.pathE = null;
	this.draw();
}

/**
 * Static function used to preview the width of a VectorIcon before it is drawn
 * @param {object} pathId - An object from VectorPaths
 * @param {number} height - The height to use for the previewed path
 * @return {number} - The width the icon would have, if created
 */
VectorIcon.computeWidth = function(pathId, height) {
	const scale = height / pathId.height;
	return scale * pathId.width;
};

/**
 * Creates the SVG pathE and the group to contain it
 */
VectorIcon.prototype.draw = function() {
	this.scale = this.height / this.pathId.height;
	this.width = this.scale * this.pathId.width;
	this.group = GuiElements.create.group(this.x, this.y, this.parent);
	this.group.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ") scale(" + this.scale + ")");
	this.pathE = GuiElements.create.path(this.group);
	this.pathE.setAttributeNS(null, "d", this.pathId.path);
	this.pathE.setAttributeNS(null, "fill", this.color);
	this.group.appendChild(this.pathE);
};

/**
 * Changes the color of the icon
 * @param {string} color - color in hex
 */
VectorIcon.prototype.setColor = function(color) {
	this.color = color;
	this.pathE.setAttributeNS(null, "fill", this.color);
};

/**
 * Moves the icon to the specified coordinates
 * @param {number} x
 * @param{number} y
 */
VectorIcon.prototype.move = function(x, y) {
	this.x = x;
	this.y = y;
	this.group.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ") scale(" + this.scale + ")");
};

/* Deletes the icon and removes the path from its parent group. */
VectorIcon.prototype.remove = function() {
	this.pathE.remove();
};