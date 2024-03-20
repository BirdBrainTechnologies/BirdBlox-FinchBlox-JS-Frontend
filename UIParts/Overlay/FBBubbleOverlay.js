/**
 * Special BubbleOverlay for FinchBlox
 */
function FBBubbleOverlay(overlayType, margin, innerGroup, parent, outlineColor, block) {
  if (block != null && !Hatchling) {
    this.width = GuiElements.width * 19 / 20;
  }
  this.outlineColor = Hatchling ? Colors.white : outlineColor;
  this.block = block;
  BubbleOverlay.call(this, overlayType, Colors.white, margin, innerGroup, parent, GuiElements.layers.overlay);
  this.blockG = GuiElements.create.group(0, 0, GuiElements.layers.overlay);
}
FBBubbleOverlay.prototype = Object.create(BubbleOverlay.prototype);
FBBubbleOverlay.prototype.constructor = FBBubbleOverlay;

/**
 * Override the makeBg function to give FinchBlox look.
 */
FBBubbleOverlay.prototype.makeBg = function() {
  this.bgRect = GuiElements.draw.rect(0, 0, 0, 0, this.bgColor, 10, 10);
  this.bgGroup.appendChild(this.bgRect);
  GuiElements.update.stroke(this.bgRect, this.outlineColor, 4);
  this.triangle = GuiElements.create.path(this.bgGroup);
  GuiElements.update.color(this.triangle, this.outlineColor);
}

FBBubbleOverlay.prototype.show = function() {
  if (!this.visible) {
    BubbleOverlay.prototype.show.call(this);

    if (this.block != null) {
      const zf = TabManager.activeTab.zoomFactor;
      GuiElements.update.zoom(this.blockG, zf);
      this.blockG.appendChild(this.block.group);
      //this.layerG.appendChild(this.block.group);

      let absX = this.block.stack.relToAbsX(this.block.x);
      let absY = this.block.stack.relToAbsY(this.block.y);
      GuiElements.move.group(this.block.group, absX / zf, absY / zf);
    } else if (this.parent.parentGroup != null) {
      this.blockG.appendChild(this.parent.parentGroup);
    }
    GuiElements.blockInteraction();
  }
}

FBBubbleOverlay.prototype.hide = function() {
  BubbleOverlay.prototype.hide.call(this);
  if (this.block != null) {
    this.block.group.remove();
    this.block.stack.group.appendChild(this.block.group);
    GuiElements.move.group(this.block.group, this.block.x, this.block.y);
  } else if (this.parent.parentGroup != null) {
    this.parent.parentLayer.appendChild(this.parent.parentGroup);
  }
  GuiElements.unblockInteraction();
}

FBBubbleOverlay.prototype.display = function(x1, x2, y1, y2, innerWidth, innerHeight) {
  DebugOptions.validateNumbers(x1, x2, y1, y2, innerWidth, innerHeight);
  const BO = BubbleOverlay;

  const height = innerHeight + 2 * this.margin;
  const width = this.width || innerWidth + 2 * this.margin;
  const overlap = 2; //how much should the triangle overlap the button?

  /* Center the content in the bubble */
  GuiElements.move.group(this.innerGroup, this.margin, this.margin);

  //Determine whether the overlay should go on the bottom or top
  const preferBottom = (this.block == null) || (y1 > (this.block.y + (this.block.stack ? this.block.stack.y : 0) + this.block.height/3))
  const longH = height + BO.triangleH;
  const attemptB = Math.max(0, y2 + longH - GuiElements.height);
  const attemptT = Math.max(0, longH - y1);
  const triangleX = (x1 + x2) / 2;
  let triangleY = NaN;
  let triangleDir = 1;
  if ((attemptB <= attemptT && preferBottom) || attemptB < attemptT) { //place beneath block part
    this.y = y2 + BO.triangleH - overlap;
    triangleY = y2 - overlap;
  } else { //place above block part
    this.y = y1 - longH;
    triangleY = y1;
    triangleDir = -1;
  }
  // Convert the triangle's coords from abs to rel coords
  this.x = (GuiElements.width - width) / 2;
  if (Hatchling) {
    let maxX = GuiElements.width - this.margin - width 
    let minX = this.margin
    this.x = Math.min(Math.max(minX, (triangleX - width/2)), maxX)
  }
  var triX = triangleX - this.x;
  if (this.block == null) {
    this.x = GuiElements.width - width - this.margin;
    triX = triangleX;
  }
  const triY = triangleY - this.y;
  const triH = (BO.triangleH + BO.overlap) * triangleDir;

  // Move the elements using the results
  GuiElements.move.group(this.group, this.x, this.y);
  GuiElements.update.triangleFromPoint(this.triangle, triX, triY, BO.triangleW, triH, true);
  GuiElements.update.rect(this.bgRect, 0, 0, width, height);
  this.show();
}
