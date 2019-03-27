/**
 * Adds a button to the block. Used in FinchBlox.
 * @param {Block} parent - The Block this button is a part of
 * @param {number} startingValue - The initial value to display
 */
function BlockButton(parent, startingValue){
 this.parent = parent;
 this.value = startingValue;
 this.height = 15;
 this.width = 40;
 this.cornerRadius = 2;
 this.x = (parent.width - this.width)/2;
 this.y = parent.height - this.height;
 this.widgets = [];

 const me = this;
 this.button = new Button(this.x, this.y, this.width, this.height, parent.group, Colors.lightGray, this.cornerRadius, this.cornerRadius);
 this.updateValue(startingValue);
 this.button.setCallbackFunction(function() {
   const inputSys = me.createInputSystem();
   inputSys.show(null, me.updateValue.bind(me), function(){}, null);
 }, true);

 this.isSlot = false;
};
BlockButton.prototype = Object.create(BlockPart.prototype);
BlockButton.prototype.constructor = BlockButton;

/**
* @param {number} x - The x coord the icon should have relative to the Block it is in
* @param {number} y - The y coord ths icon should have measured from the center of the icon
* @return {number} - The width of the icon, indicating how much the next item should be shifted over.
*/
BlockButton.prototype.updateAlign = function(x, y) {
	DebugOptions.validateNumbers(x, y);
	this.move(x, y);
	return this.width;
};

/**
* BlockButtons are of constant size, so updateDim does nothing
*/
BlockButton.prototype.updateDim = function() {

};

/**
 * Moves the button and sets this.x and this.y to the specified coordinates
 * @param {number} x
 * @param {number} y
 */
BlockButton.prototype.move = function(x, y) {
	DebugOptions.validateNumbers(x, y);
	this.x = x;
	this.y = y;
	this.button.move(x, y);
};

BlockButton.prototype.updateValue = function(newValue, displayString) {
  this.value = newValue;
  if (typeof this.value == 'object' && this.value.r != null){
    const color = Colors.rgbToHex(this.value.r, this.value.g, this.value.b);
    //GuiElements.update.color(this.button.bgRect, color);
    this.button.updateBgColor(color);
  } else if (displayString != null) {
    this.button.addText(displayString);
  } else {
    this.button.addText(this.value.toString());
  }

  this.parent.updateValues();
};

BlockButton.prototype.createInputSystem = function() {
  const x1 = this.getAbsX();
	const y1 = this.getAbsY();
	const x2 = this.relToAbsX(this.width);
	const y2 = this.relToAbsY(this.height);
	const inputPad = new InputPad(x1, x2, y1, y2);

  this.widgets.forEach(function(widget) {
    inputPad.addWidget(widget);
  });

  return inputPad;
};
BlockButton.prototype.addSlider = function() {
  this.widgets.push(new InputWidget.Slider(0, 100, this.value));
}
BlockButton.prototype.addPiano = function() {
  this.widgets.push(new InputWidget.Piano());
  this.updateValue(this.value, InputWidget.Piano.noteStrings[this.value]);
}


// These functions convert between screen (absolute) coordinates and local (relative) coordinates.
//TODO: These functions are copied from Slot. Move to BlockPart?
/**
 * @param {number} x
 * @returns {number}
 */
BlockButton.prototype.relToAbsX = function(x){
	return this.parent.relToAbsX(x + this.x);
};
/**
 * @param {number} y
 * @returns {number}
 */
BlockButton.prototype.relToAbsY = function(y){
	return this.parent.relToAbsY(y + this.y);
};
/**
 * @param {number} x
 * @returns {number}
 */
BlockButton.prototype.absToRelX = function(x){
	return this.parent.absToRelX(x) - this.x;
};
/**
 * @param {number} y
 * @returns {number}
 */
BlockButton.prototype.absToRelY = function(y){
	return this.parent.absToRelY(y) - this.y;
};
/**
 * Returns the x coord of the Slot relative to the screen (not the group it is contained in).
 * @return {number} - The x coord of the Slot relative to the screen.
 */
BlockButton.prototype.getAbsX = function(){
	return this.relToAbsX(0);
};
/**
 * Returns the y coord of the Slot relative to the screen (not the group it is contained in).
 * @return {number} - The y coord of the Slot relative to the screen.
 */
BlockButton.prototype.getAbsY = function(){//Fix for tabs
	return this.relToAbsY(0);
};
/**
 * @returns {number}
 */
BlockButton.prototype.getAbsWidth = function(){
	return this.relToAbsX(this.width) - this.getAbsX();
};
/**
 * @returns {number}
 */
BlockButton.prototype.getAbsHeight = function(){
	return this.relToAbsY(this.height) - this.getAbsY();
};
