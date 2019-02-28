/**
 * Displays a slider for selecting values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} startVal - Value to start the slider at
 */
InputWidget.Slider = function (min, max, startVal) {
  this.min = min;
  this.max = max;
  this.value = startVal;
};
InputWidget.Slider.prototype = Object.create(InputWidget.prototype);
InputWidget.Slider.prototype.constructor = InputWidget.Slider;

InputWidget.Slider.setConstants = function() {
  const S = InputWidget.Slider;
  S.width = InputPad.width;
  S.height = 40;
  S.hMargin = 20;
  S.barHeight = 2;
};

/**
 * @inheritDoc
 */
InputWidget.Slider.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);
	this.group = GuiElements.create.group(x, y, parentGroup);
  this.parentGroup = parentGroup;
  this.makeSlider();
};

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 */
InputWidget.Slider.prototype.updateDim = function(x, y) {
  const S = InputWidget.Slider;
  this.height = S.height;
  this.width = S.width;
}

InputWidget.Slider.prototype.makeSlider = function() {
  const S = InputWidget.Slider;
  const font = InputWidget.Label.font;
  const labelY = (S.height + font.charHeight)/2;
  this.barX = S.hMargin;
  this.barY = (S.height - S.barHeight)/2;
  this.barW = S.width - 2 * S.hMargin;
  this.sliderH = S.barHeight * 5;
  this.sliderW = 10
  this.sliderY = (S.height - this.sliderH)/2;
  //const sliderX = this.barX + (this.barW - this.sliderW)/2;
  const sliderX = this.barX + (this.value/(this.max - this.min)) * (this.barW - this.sliderW);

  const minLabel = GuiElements.draw.text(5, labelY, this.min, font, Colors.white);
  this.group.appendChild(minLabel);
  const maxLabel = GuiElements.draw.text(this.width - 20, labelY, this.max, font, Colors.white);
  this.group.appendChild(maxLabel);

  const sliderBar = GuiElements.draw.rect(this.barX, this.barY, this.barW, S.barHeight, Colors.black);
  this.group.appendChild(sliderBar);

  this.slider = GuiElements.draw.rect(sliderX, this.sliderY, this.sliderW, this.sliderH, Colors.easternBlue);
  this.group.appendChild(this.slider);
  TouchReceiver.addListenersSlider(this.slider, this);
}

InputWidget.Slider.prototype.drag = function(x) {
  let relX = x - this.overlay.x - this.overlay.margin;

  if (relX > this.barX && relX < (this.barX + this.barW - this.sliderW)) {
    this.sliderX = relX;
    this.value = Math.round(((relX - this.barX)*1.01/(this.barW - this.sliderW))*(this.max - this.min));
    GuiElements.update.rect(this.slider, this.sliderX, this.sliderY, this.sliderW, this.sliderH);
    this.updateFn(this.value);
    //console.log("slider val " + this.value + " " + relX + " " + this.barX + " " + this.barW );
  }
}
