/**
 * Special BubbleOverlay for FinchBlox
 */
function FBBubbleOverlay(overlayType, margin, innerGroup, parent, outlineColor, block) {
  this.width = GuiElements.width * 19/20;
  this.outlineColor = outlineColor;
  this.block = block;
  BubbleOverlay.call(this, overlayType, Colors.white, margin, innerGroup, parent, GuiElements.layers.overlay);
}
FBBubbleOverlay.prototype = Object.create(BubbleOverlay.prototype);
FBBubbleOverlay.prototype.constructor = FBBubbleOverlay;

/**
 * Override the makeBg function to give FinchBlox look.
 */
FBBubbleOverlay.prototype.makeBg = function() {
  this.bgRect = GuiElements.draw.rect(0, 0, this.width, 0, this.bgColor, 10, 10);
  this.bgGroup.appendChild(this.bgRect);
  GuiElements.update.stroke(this.bgRect, this.outlineColor, 2);
 	this.triangle = GuiElements.create.path(this.bgGroup);
 	GuiElements.update.color(this.triangle, this.outlineColor);
}

FBBubbleOverlay.prototype.show = function () {
  if (!this.visible) {
    BubbleOverlay.prototype.show.call(this);
    this.layerG.appendChild(this.block.group);
    let absX = this.block.stack.relToAbsX(this.block.x);
    let absY = this.block.stack.relToAbsY(this.block.y);
    GuiElements.move.group(this.block.group, absX, absY);
    GuiElements.blockInteraction();
  }
}

FBBubbleOverlay.prototype.hide = function () {
  BubbleOverlay.prototype.hide.call(this);
  this.block.group.remove();
  this.block.stack.group.appendChild(this.block.group);
  GuiElements.move.group(this.block.group, this.block.x, this.block.y);
  GuiElements.unblockInteraction();
}

FBBubbleOverlay.prototype.display = function (x1, x2, y1, y2, innerWidth, innerHeight) {
	DebugOptions.validateNumbers(x1, x2, y1, y2, innerWidth, innerHeight);
	const BO = BubbleOverlay;

  const height = innerHeight + 2 * this.margin;

  /* Center the content in the bubble */
	GuiElements.move.group(this.innerGroup, this.margin, this.margin);

  //Determine whether the overlay should go on the bottom or top
  const longH = height + BO.triangleH;
  const attemptB = Math.max(0, y2 + longH - GuiElements.height);
	const attemptT = Math.max(0, longH - y1);
  const triangleX = (x1 + x2) / 2;
  let triangleY = NaN;
  let triangleDir = 1;
  if (attemptB <= attemptT){
    this.y = y2 + BO.triangleH;
    triangleY = y2;
  } else {
    this.y = y1 - longH;
    triangleY = y1;
    triangleDir = -1;
  }
  // Convert the triangle's coords from abs to rel coords
  this.x = (GuiElements.width - this.width)/2;
	const triX = triangleX - this.x;
	const triY = triangleY - this.y;
	const triH = (BO.triangleH + BO.overlap) * triangleDir;

	// Move the elements using the results
  GuiElements.move.group(this.group, this.x, this.y);
	GuiElements.update.triangleFromPoint(this.triangle, triX, triY, BO.triangleW, triH, true);
	GuiElements.update.rect(this.bgRect, 0, 0, this.width, height);
	this.show();
}
