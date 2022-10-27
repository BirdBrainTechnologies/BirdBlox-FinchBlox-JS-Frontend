/**
 * Displays text in a large, white box at the bottom of the screen.  Triggered by display Block.  No SVG elements
 * are created until build() is called.
 * @param {number} position - A 0-indexed number indicating the position of the DisplayBox on the screen
 * @constructor
 */
function DisplayBox(position) {
  this.position = position;
  this.visible = false;
  this.layer = GuiElements.layers.display;
}

DisplayBox.setGraphics = function() {
  const DB = DisplayBox;
  DB.bgColor = Colors.white;
  DB.fontColor = Colors.black;
  DB.font = Font.uiFont(35);
  DB.screenMargin = 60;
  DB.rectH = 50;
  DB.margin = 10;
  DB.rectX = DB.screenMargin;
  DB.rectW = GuiElements.width - 2 * DB.screenMargin;
};

/**
 * Builds the elements of the box
 */
DisplayBox.prototype.build = function() {
  const DB = DisplayBox;
  this.rectY = this.getRectY();
  this.rectE = GuiElements.draw.rect(DB.rectX, this.rectY, DB.rectW, DB.rectH, DB.bgColor);
  this.textE = GuiElements.draw.text(0, 0, "", DB.font, DB.fontColor);
  TouchReceiver.addListenersDisplayBox(this.rectE);
  TouchReceiver.addListenersDisplayBox(this.textE);
};

/**
 * Computes the y-cord of the box based on the position and constants
 * @return {number}
 */
DisplayBox.prototype.getRectY = function() {
  const DB = DisplayBox;
  const fromBottom = 2 - this.position;
  return GuiElements.height - (DB.rectH + DB.margin) * fromBottom - DB.rectH - DB.screenMargin;
};

/**
 * Resets the graphics
 */
DisplayBox.updateZoom = function() {
  DisplayBox.setGraphics();
};

/**
 * Resizes the box
 */
DisplayBox.prototype.updateZoom = function() {
  const DB = DisplayBox;
  this.rectY = this.getRectY();
  const textW = GuiElements.measure.textWidth(this.textE);
  const textX = DB.rectX + DB.rectW / 2 - textW / 2;
  const textY = this.rectY + DB.rectH / 2 + DB.font.charHeight / 2;
  GuiElements.move.text(this.textE, textX, textY);
  GuiElements.update.rect(this.rectE, DB.rectX, this.rectY, DB.rectW, DB.rectH);
};

/**
 * Sets the text of the box
 * @param {string} text - The text to show
 */
DisplayBox.prototype.displayText = function(text) {
  const DB = DisplayBox;
  GuiElements.update.textLimitWidth(this.textE, text, DB.rectW);
  const textW = GuiElements.measure.textWidth(this.textE);
  const textX = DB.rectX + DB.rectW / 2 - textW / 2;
  const textY = this.rectY + DB.rectH / 2 + DB.font.charHeight / 2;
  GuiElements.move.text(this.textE, textX, textY);
  this.show();
};

/**
 * Make the DisplayBox visible
 */
DisplayBox.prototype.show = function() {
  if (!this.visible) {
    this.layer.appendChild(this.rectE);
    this.layer.appendChild(this.textE);
    this.visible = true;
  }
};

/**
 * Hides the DisplayBox
 */
DisplayBox.prototype.hide = function() {
  if (this.visible) {
    this.textE.remove();
    this.rectE.remove();
    this.visible = false;
  }
};
