/**
 * A VectorIcon controls an SVG path element. It draws the information for the path from VectorPaths.js and rescales
 * the path appropriately.
 * @param {number} x - The x coord of the path
 * @param {number} y - The y coord of the path
 * @param {object} pathId - The object from VectorPaths containing the information about the path to draw
 * @param {string} color - Color in hex
 * @param {number} height - The height the path should be.  Width is computed from this
 * @param {Element} parent - An SVG group element the path should go inside
 * @param {boolean} mirror - True if the icon should be mirrored with the rest of the site for rtl languages
 * @constructor
 */
function VectorIcon(x, y, pathId, color, height, parent, mirror, rotation) {
	this.x = x;
	this.y = y;
	this.color = color;
	this.height = height;
	this.pathId = pathId;
	this.parent = parent;
	this.mirror = mirror;
  this.rotation = rotation;
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
	this.scaleX = this.height / this.pathId.height;
	this.scaleY = this.scaleX;
	this.width = this.scaleY * this.pathId.width;

	//If the icon should not be mirrored, it will need to be flipped for rtl
	// languages. The negative scale flips the icon along the horizontal axis, but
	// it then also needs to be translated by the width to pisition it correctly.
	if (Language.isRTL && !this.mirror) {
		this.scaleX = -this.scaleX;
		this.x += this.width;
	}

	this.group = GuiElements.create.group(this.x, this.y, this.parent);
  if (this.rotation != null) {
    this.group.setAttributeNS(null, "transform", "rotate(" + this.rotation + ", " + (this.x+(this.width/2)) + ", " + (this.y+(this.height/2)) + ") translate(" + this.x + "," + this.y + ") scale(" + this.scaleX + ", " + this.scaleY + ")");
  } else {
    this.group.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ") scale(" + this.scaleX + ", " + this.scaleY + ")");
  }
	this.pathE = GuiElements.create.path(this.group);
	this.pathE.setAttributeNS(null, "d", this.pathId.path);
	this.pathE.setAttributeNS(null, "fill", this.color);
  if (this.pathId.transform != null) {
    this.pathE.setAttributeNS(null, "transform", this.pathId.transform);
  }
	this.group.appendChild(this.pathE);
};

VectorIcon.prototype.update = function(x, y, height) {
  this.x = x;
  this.y = y;
  if (height != null) {
    this.height = height;
    this.scaleX = this.height / this.pathId.height;
    this.scaleY = this.scaleX;
  	this.width = this.scaleY * this.pathId.width;
  }
  this.group.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ") scale(" + this.scaleX + ", " + this.scaleY + ")");
}

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
	if (Language.isRTL && !this.mirror) { x += this.width; }
	this.x = x;
	this.y = y;
	this.group.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ") scale(" + this.scaleX + ", " + this.scaleY + ")");
};

/* Deletes the icon and removes the path from its parent group. */
VectorIcon.prototype.remove = function() {
	this.pathE.remove();
};

/**
 *  Add a second path to this icon. Shares the same group and transforms
 * @param pathId - VectorPaths entry
 * @param color - fill color hex value
 */
VectorIcon.prototype.addSecondPath = function(pathId, color){
  this.pathId2 = pathId;
  this.color2 = color;

  this.pathE2 = GuiElements.create.path(this.group);
	this.pathE2.setAttributeNS(null, "d", this.pathId2.path);
	this.pathE2.setAttributeNS(null, "fill", this.color2);
  if (this.pathId2.transform != null) {
    this.pathE2.setAttributeNS(null, "transform", this.pathId2.transform);
  }
	this.group.appendChild(this.pathE2);
}
