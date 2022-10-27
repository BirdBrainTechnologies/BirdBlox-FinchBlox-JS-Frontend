/**
 * A set of four arrows around the edges of the canvas that show off screen Blocks
 * @constructor
 */
function OverflowArrows() {
  this.group = GuiElements.create.group(0, 0);
  this.triTop = this.makeTriangle();
  this.triLeft = this.makeTriangle();
  this.triRight = this.makeTriangle();
  this.triBottom = this.makeTriangle();
  this.setArrowPos();
  this.visible = false;
}

OverflowArrows.setConstants = function() {
  const OA = OverflowArrows;
  OA.triangleW = 25;
  OA.triangleH = 15;
  OA.margin = 15;
  OA.opacity = 0.5;
  if (FinchBlox) {
    OA.color = Colors.fbGray; //Colors.iron; //Colors.lightLightGray;
    OA.outlineColor = Colors.bbtDarkGray;
    OA.outlineW = 1;
  } else {
    OA.color = Colors.white;
  }
};

/**
 * Creates an SVG path element of the correct color.  The actual path information will be added later.
 * @return {Element} - The SVG path element
 */
OverflowArrows.prototype.makeTriangle = function() {
  const OA = OverflowArrows;
  const tri = GuiElements.create.path();
  GuiElements.update.color(tri, OA.color);
  GuiElements.update.opacity(tri, OA.opacity);
  if (FinchBlox) {
    GuiElements.update.stroke(tri, OA.outlineColor, OA.outlineW)
  }
  GuiElements.update.makeClickThrough(tri);
  return tri;
};

/**
 * Updates the visibility of the arrows given the active region of the canvas. If the canvas extends beyond an arrow
 * in one direction, then that arrow becomes visible to indicate off screen blocks
 * @param {number} left - The left boundary of the canvas
 * @param {number} right - The right boundary of the canvas
 * @param {number} top - The top boundary of the canvas
 * @param {number} bottom - The bottom boundary of the canvas
 */
OverflowArrows.prototype.setArrows = function(left, right, top, bottom) {
  if (left === right) {
    // If the width of the canvas is 0, there are no Blocks, so the arrows should be hidden.
    this.showIfTrue(this.triLeft, false);
    this.showIfTrue(this.triRight, false);
  } else {
    this.showIfTrue(this.triLeft, left < this.left);
    this.showIfTrue(this.triRight, right > this.right);
  }
  if (top === bottom) {
    // If the height of the canvas is 0, there are no Blocks, so the arrows should be hidden.
    this.showIfTrue(this.triTop, false);
    this.showIfTrue(this.triBottom, false);
  } else {
    this.showIfTrue(this.triTop, top < this.top);
    this.showIfTrue(this.triBottom, bottom > this.bottom);
  }
};

/**
 * Sets the visibility of the triangle according to the boolean parameter
 * @param {Element} tri - The path to set the visibility of
 * @param {boolean} shouldShow - Whether the path should be visible of not.
 */
OverflowArrows.prototype.showIfTrue = function(tri, shouldShow) {
  if (shouldShow) {
    this.group.appendChild(tri);
  } else {
    tri.remove();
  }
};

/**
 * Makes all overflow arrows visible
 */
OverflowArrows.prototype.show = function() {
  if (!this.visible) {
    this.visible = true;
    GuiElements.layers.overflowArr.appendChild(this.group);
  }
};

/**
 * Makes all overflow arrows hidden
 */
OverflowArrows.prototype.hide = function() {
  if (this.visible) {
    this.visible = false;
    this.group.remove();
  }
};

/**
 * Recomputes the positions of the overflow arrows
 */
OverflowArrows.prototype.updateZoom = function() {
  this.setArrowPos();
};

/**
 * Moves overflowArrows to the correct positions and stores the boundary of the portion of the screen for the canvas
 */
OverflowArrows.prototype.setArrowPos = function() {
  const OA = OverflowArrows;
  this.left = BlockPalette.width;
  if (!GuiElements.paletteLayersVisible || FinchBlox) {
    this.left = 0;
  }
  this.top = TitleBar.height;
  this.right = GuiElements.width;
  this.bottom = GuiElements.height;
  if (FinchBlox) {
    this.bottom = GuiElements.height - BlockPalette.height - CategoryBN.height;
  }

  const midX = (this.left + this.right) / 2;
  const midY = (this.top + this.bottom) / 2;
  const topY = this.top + OA.margin;
  const bottomY = this.bottom - OA.margin;
  const leftX = this.left + OA.margin;
  const rightX = this.right - OA.margin;

  GuiElements.update.triangleFromPoint(this.triTop, midX, topY, OA.triangleW, OA.triangleH, true);
  GuiElements.update.triangleFromPoint(this.triLeft, leftX, midY, OA.triangleW, OA.triangleH, false);
  GuiElements.update.triangleFromPoint(this.triRight, rightX, midY, OA.triangleW, -OA.triangleH, false);
  GuiElements.update.triangleFromPoint(this.triBottom, midX, bottomY, OA.triangleW, -OA.triangleH, true);
};
