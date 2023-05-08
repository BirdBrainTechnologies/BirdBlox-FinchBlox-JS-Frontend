/**
 * Displays text on a block.  For example, the say for secs block has 3 LabelText objects: "say", "for", "secs".
 * @param {Block} parent - The Block this LabelText is a member of
 * @param {string} text - The text to display
 * @constructor
 */
function LabelText(parent, text, disabledColor) {
  DebugOptions.validateNonNull(parent, text);
  this.text = text;
  this.width = 0; // Computed later with updateDim
  this.height = BlockGraphics.labelText.font.charHeight;
  this.x = 0;
  this.y = 0;
  this.parent = parent;
  this.textE = this.generateText(text);
  this.isSlot = false; // All BlockParts have this property
  this.visible = true;
  this.disabledColor = disabledColor
}
LabelText.prototype = Object.create(BlockPart.prototype);
LabelText.prototype.constructor = LabelText;

/**
 * @param {number} x - The x coord the text should have relative to the Block it is in
 * @param {number} y - The y coord ths text should have measured from the center of the text
 * @return {number} - The width of the text, indicating how much the next item should be shifted over.
 */
LabelText.prototype.updateAlign = function(x, y) {
  this.move(x, y + this.height / 2);
  return this.width;
};

/**
 * Computes the dimensions of the text and stores them in this.height and this.width
 */
LabelText.prototype.updateDim = function() {
  // Dimensions are only computed once, since text can't change
  if (this.width === 0) {
    GuiElements.layers.temp.appendChild(this.textE);
    this.width = GuiElements.measure.textWidth(this.textE);
    this.textE.remove();
    this.parent.group.appendChild(this.textE);
  }
};

/**
 * Creates text in the SVG from the specified string
 * @param {string} text - The text to create
 * @return {Node} - The SVG text element
 */
LabelText.prototype.generateText = function(text) {
  const obj = BlockGraphics.create.labelText(text, this.parent.group);
  TouchReceiver.addListenersChild(obj, this.parent);
  return obj;
};

/**
 * Moves text to coords and stores them in this.x and this.y
 * @param {number} x
 * @param {number} y
 */
LabelText.prototype.move = function(x, y) {
  this.x = x;
  this.y = y;
  BlockGraphics.update.text(this.textE, x, y);
};

/**
 * Creates a string representation of the label
 * @return {string}
 */
LabelText.prototype.textSummary = function() {
  return this.text;
};

/**
 * Unhides the label
 */
LabelText.prototype.show = function() {
  if (!this.visible) {
    this.parent.group.appendChild(this.textE);
    this.visible = true;
  }
};

/**
 * Removes the label from the SVG
 */
LabelText.prototype.hide = function() {
  if (this.visible) {
    this.textE.remove();
    this.visible = false;
  }
};

/**
 * Intended to permanently remove label from SVG
 */
LabelText.prototype.remove = function() {
  this.textE.remove();
};

LabelText.prototype.makeActive = function() {
  GuiElements.update.color(this.textE, BlockGraphics.labelText.fill);
};

LabelText.prototype.makeInactive = function() {
  if (this.disabledColor != null) {
    GuiElements.update.color(this.textE, this.disabledColor);
  } else {
    GuiElements.update.color(this.textE, BlockGraphics.labelText.disabledFill);
  }
};
