/**
 * Adds a button to the block. Used in FinchBlox.
 * @param {Block} parent - The Block this button is a part of
 * @param {number} startingValue - The initial value to display
 */
function BlockButton(parent){
  this.buttonMargin = 2*BlockPalette.blockButtonOverhang * (1/9);
  this.lineHeight = 2*BlockPalette.blockButtonOverhang * (8/9);
  this.cornerRadius = BlockPalette.blockButtonOverhang;

  this.height = this.blockButtonMargin + this.lineHeight;//2*BlockPalette.blockButtonOverhang;
  this.width = 60;
  this.textColor = Colors.bbtDarkGray;
  this.font = Font.uiFont(12);
  this.outlineStroke = 1;

 this.parent = parent;
 //this.value = startingValue;
 //this.x = (parent.width - this.width)/2;
 this.x = 0;
 //this.y = parent.height - this.height;
 this.y = 0;
 this.widgets = [];
 this.displaySuffixes = [];
 this.values = [];

 this.outlineColor = Colors.blockOutline[parent.category];
 if (this.outlineColor == null) { this.outlineColor = Colors.categoryColors[parent.category]; }
 if (this.outlineColor == null) { this.outlineColor = Colors.iron; }

 const me = this;
 this.callbackFunction = function() {
   if (!me.parent.stack.isDisplayStack) { //Disable popups for blocks in the blockpalette
     const inputSys = me.createInputSystem();
     inputSys.show(null, me.updateValue.bind(me), function(){}, me.values, me.outlineColor, parent);
   }
 }

// this.draw();

 this.isSlot = false;
};
BlockButton.prototype = Object.create(BlockPart.prototype);
BlockButton.prototype.constructor = BlockButton;

BlockButton.prototype.draw = function() {
  if (this.button != null) { this.button.remove(); }
  this.button = new Button(this.x, this.y, this.width, this.height, this.parent.group, Colors.white, this.cornerRadius, this.cornerRadius);
  GuiElements.update.stroke(this.button.bgRect, this.outlineColor, this.outlineStroke);
  this.button.setCallbackFunction(this.callbackFunction, true);
}

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

BlockButton.prototype.updateValue = function(newValue, index) {//, displayString) {
  //this.value = newValue;
  this.values[index] = newValue;
  let text = [];
  for (let i = 0; i < this.widgets.length; i++) {
    text[i] = "";
    if (typeof this.values[i] == 'object' && this.values[i].r != null){
      const s = 255/100;
      const color = Colors.rgbToHex(this.values[i].r * s, this.values[i].g * s, this.values[i].b * s);
      //console.log("new button color: " + color);
      //GuiElements.update.color(this.button.bgRect, color);

      if (this.widgets.length == 1) {
        this.button.updateBgColor(color);
      } else {
        if (this.colorLabel != null) {
          this.colorLabel.remove();
        }
        const clW = this.button.width;
        const clH = this.button.height/this.widgets.length;
        const clX = 0;
        const clY = i * clH;
        const clR = this.cornerRadius;
        this.colorLabel = GuiElements.draw.tab(clX, clY, clW, clH, color, clR);
        this.button.group.appendChild(this.colorLabel);
        TouchReceiver.addListenersBN(this.colorLabel, this.button);

        this.button.bgRect.remove();
        GuiElements.update.color(this.button.bgRect, "none");
        this.button.group.appendChild(this.button.bgRect);
      }


    //} else if (displayString != null) {
    //  this.button.addText(displayString, this.font, this.textColor);
    } else if (this.widgets[i].type == "piano") {
      text[i] = InputWidget.Piano.noteStrings[this.values[i]];
    } else if (this.widgets[i].type == "ledArray") {
      if (this.ledArrayImage != null) {
        this.ledArrayImage.group.remove();
      }
      let image = GuiElements.draw.ledArray(this.button.group, this.values[i], 1.8);
      const iX = this.button.width/2 - image.width/2;
      //const iY = this.button.height/2 - image.width/2;
      const iY = (i+1) * this.button.height/(this.widgets.length + 1) - image.width/2;
      GuiElements.move.group(image.group, iX, iY);
      this.ledArrayImage = image;
    } else {
      text[i] = this.values[i].toString() + this.displaySuffixes[i];
    }
  }
  this.button.addMultiText(text, this.font, this.textColor);
  /*
  if (typeof this.value == 'object' && this.value.r != null){
    const s = 255/100;
    const color = Colors.rgbToHex(this.value.r * s, this.value.g * s, this.value.b * s);
    //console.log("new button color: " + color);
    //GuiElements.update.color(this.button.bgRect, color);
    this.button.updateBgColor(color);
  //} else if (displayString != null) {
  //  this.button.addText(displayString, this.font, this.textColor);
  } else if (this.widgets[0].type == "piano") {
    this.button.addText(InputWidget.Piano.noteStrings[this.value], this.font, this.textColor);
  } else if (this.widgets[0].type == "ledArray") {
    if (this.ledArrayImage != null) {
      this.ledArrayImage.group.remove();
    }
    let image = GuiElements.draw.ledArray(this.button.group, this.value, 1.8);
    const iX = this.button.width/2 - image.width/2;
    const iY = this.button.height/2 - image.width/2;
    GuiElements.move.group(image.group, iX, iY);
    this.ledArrayImage = image;
  } else {
    const text = this.value.toString() + this.displaySuffixes[0];
    this.button.addText(text, this.font, this.textColor);
  }
*/
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
BlockButton.prototype.addSlider = function(type, startingValue, options) {
  //this.value = startingValue;
  //this.values.push(startingValue);

  let suffix = "";
  switch (type) {
    case "distance":
      suffix = " cm";
      break;
    case "percent":
      suffix = "%";
      break;
    case "angle_left":
    case "angle_right":
      suffix = "°";
      break;
  //  case "time":
  //    suffix = " ";
  //    break;
    default:
      suffix = "";
  }

  const sliderColor = Colors.categoryColors[this.parent.category];
  //this.widgets.push(new InputWidget.Slider(type, options, this.value, sliderColor, suffix));
  const slider = new InputWidget.Slider(type, options, startingValue, sliderColor, suffix, this.widgets.length);
  this.addWidget(slider, suffix, startingValue); //null, suffix);
  //his.displaySuffixes[this.widgets.length - 1]  = suffix;

/*
  this.height = 2*BlockPalette.blockButtonOverhang*this.widgets.length;
  this.draw();
  this.updateValue(this.value);*/
}
BlockButton.prototype.addPiano = function(startingValue) {
  //this.value = startingValue;
  //this.values.push(startingValue);
  //this.addWidget(new InputWidget.Piano(), InputWidget.Piano.noteStrings[startingValue]);
  this.addWidget(new InputWidget.Piano(this.widgets.length), "", startingValue);
  /*
  this.widgets.push(new InputWidget.Piano());

  this.height = 2*BlockPalette.blockButtonOverhang*this.widgets.length;
  this.draw();
  this.updateValue(this.value, InputWidget.Piano.noteStrings[this.value]);*/
}
BlockButton.prototype.addWidget = function(widget, suffix, startingValue) {
  this.widgets.push(widget);
  this.displaySuffixes.push(suffix);
  this.values.push(startingValue);
  //this.height = 2*BlockPalette.blockButtonOverhang*this.widgets.length;
  this.height = this.buttonMargin + this.lineHeight * this.widgets.length;
  this.draw();
  const index = this.widgets.length - 1;
  this.updateValue(this.values[index], index); //, displayString);
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
