/**
 * Displays a slider for selecting values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number | object} startVal - Value to start the slider at. May be an
 *                                     object in the case of an rgb slider.
 */
InputWidget.Slider = function (min, max, startVal, sliderColor) {
  this.min = min;
  this.max = max;
  this.range = max - min;
  this.value = startVal;
  if (typeof startVal == 'object') {
    this.position = 5;
  } else {
    this.position = startVal;
  }
  this.sliderColor = sliderColor;
};
InputWidget.Slider.prototype = Object.create(InputWidget.prototype);
InputWidget.Slider.prototype.constructor = InputWidget.Slider;

InputWidget.Slider.setConstants = function() {
  const S = InputWidget.Slider;
  S.width = InputPad.width;
  S.height = 40;
  S.hMargin = 20;
  S.barHeight = 2;
  S.sliderIconPath = VectorPaths.mvFinch;
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
  //this.sliderH = S.barHeight * 5;
  this.sliderH = 30;//10
  this.sliderW = VectorIcon.computeWidth(S.sliderIconPath, this.sliderH);
  this.sliderY = (S.height - this.sliderH)/2;
  //const sliderX = this.barX + (this.barW - this.sliderW)/2;
  const sliderX = this.barX + (this.position/(this.range)) * (this.barW - this.sliderW);

  const minLabel = GuiElements.draw.text(5, labelY, this.min, font, Colors.white);
  this.group.appendChild(minLabel);
  const maxLabel = GuiElements.draw.text(this.width - 20, labelY, this.max, font, Colors.white);
  this.group.appendChild(maxLabel);

  const sliderBar = GuiElements.draw.rect(this.barX, this.barY, this.barW, S.barHeight, Colors.black);
  this.group.appendChild(sliderBar);

  //this.slider = GuiElements.draw.rect(sliderX, this.sliderY, this.sliderW, this.sliderH, Colors.easternBlue);
  //this.group.appendChild(this.slider);
  //TouchReceiver.addListenersSlider(this.slider, this);
  let color = Colors.easternBlue;
  if (this.sliderColor != null) { color = this.sliderColor; }
  this.sliderIcon = new VectorIcon(sliderX, this.sliderY, S.sliderIconPath, color, this.sliderH, this.group, null, 90);
  TouchReceiver.addListenersSlider(this.sliderIcon.pathE, this);
}

InputWidget.Slider.prototype.drag = function(x) {
  let relX = x - this.overlay.x - this.overlay.margin;

  if (relX > this.barX && relX < (this.barX + this.barW - this.sliderW)) {
    this.sliderX = relX;
    this.position = Math.round(((relX - this.barX)*1.01/(this.barW - this.sliderW))*(this.range));
    //GuiElements.update.rect(this.slider, this.sliderX, this.sliderY, this.sliderW, this.sliderH);
    this.sliderIcon.move(this.sliderX, this.sliderY);

    if (typeof this.value == 'number') {
      this.value = this.position;
    } else {
      //if it is an rgb color object
      if (this.value.r != null) {
        const p = this.position / this.range;
        //red -> yellow
        if (p < 0.17) {
          this.value.r = 100;
          this.value.g = Math.round(100*p/0.17);
          this.value.b = 0;
        //yellow -> green
        } else if (p < 0.33) {
          this.value.r = Math.round(100 - (100 * (p - 0.17)/0.17));
          this.value.g = 100;
          this.value.b = 0;
        //green -> cyan
        } else if (p < 0.5) {
          this.value.r = 0;
          this.value.g = 100;
          this.value.b = Math.round(100 * (p - 0.33)/0.17);
        //cyan -> blue
        } else if (p < 0.67) {
          this.value.r = 0;
          this.value.g = Math.round(100 - (100 * (p - 0.5)/0.17));
          this.value.b = 100;
        //blue -> magenta
        } else if (p < 0.83) {
          this.value.r = Math.round(100 * (p - 0.67)/0.17);
          this.value.g = 0;
          this.value.b = 100;
        //magenta -> red
        } else {
          this.value.r = 100;
          this.value.g = 0;
          this.value.b = Math.round(100 - (100 * (p - 0.83)/0.17));
        }
        //console.log("color updated to " + this.value.r + ", " + this.value.g + ", " + this.value.b);
      }
    }
    this.updateFn(this.value);
    //console.log("slider val " + this.value + " " + relX + " " + this.barX + " " + this.barW );
  }
}
