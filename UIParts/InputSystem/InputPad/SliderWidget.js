/**
 * Displays a slider for selecting values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number | object} startVal - Value to start the slider at. May be an
 *                                     object in the case of an rgb slider.
 */
InputWidget.Slider = function (type, options, startVal, sliderColor) {
  this.type = type;
  this.options = options;
  //this.min = min;
  //this.max = max;
  //this.range = max - min;
  this.value = startVal;
  //if (typeof startVal == 'object') {
  //  this.position = 5;
  //} else {
  //  this.position = startVal;
  //}
  this.sliderColor = sliderColor;

  this.snapToOption = false;
  if (type == "ledArray") { this.snapToOption = true; }
  this.optionXs = [];
  this.optionValues = [];
};
InputWidget.Slider.prototype = Object.create(InputWidget.prototype);
InputWidget.Slider.prototype.constructor = InputWidget.Slider;

InputWidget.Slider.setConstants = function() {
  const S = InputWidget.Slider;
  S.width = InputPad.width;
  S.height = 80;
  S.hMargin = 20;
  S.barHeight = 4;
  S.barColor = Colors.iron;
  S.sliderIconPath = VectorPaths.mvFinch;
  S.optionMargin = 10;//5;//distance between ticks and option display
};

/**
 * @inheritDoc
 */
InputWidget.Slider.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);
	this.group = GuiElements.create.group(x, y, parentGroup);
  this.parentGroup = parentGroup;
  this.value = data;
  this.makeSlider();

  TouchReceiver.addListenersSlider(this.overlay.bgRect, this);

  const valueIndex = this.optionValues.indexOf(this.value);
  if (valueIndex != -1) { this.moveToOption(valueIndex); }
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
  this.position = 0;
  this.range = 100;
  //const labelY = (S.height + font.charHeight)/2;


  this.barX = S.hMargin;
  this.barY = (S.height - S.barHeight)/2;
  this.barW = S.width - 2 * S.hMargin;
  let barColor = S.barColor;


  //const minLabel = GuiElements.draw.text(5, labelY, this.min, font, Colors.white);
  //this.group.appendChild(minLabel);
  //const maxLabel = GuiElements.draw.text(this.width - 20, labelY, this.max, font, Colors.white);
  //this.group.appendChild(maxLabel);

  if (this.type == 'color') {
    barColor = Colors.white;
    //const spectrum = GuiElements.create.spectrum();
    //const spectrum = Colors.getGradient("tablet")
    GuiElements.create.spectrum();
    const spectrum = "url(#gradient_spectrum)";
    const specH = S.barHeight * 20;
    const specY = this.barY - specH/2 + S.barHeight/2;
    const colorRect = GuiElements.draw.rect(this.barX, specY, this.barW, specH, spectrum, 4, 4);
    this.group.appendChild(colorRect);
  }

  const sliderBar = GuiElements.draw.rect(this.barX, this.barY, this.barW, S.barHeight, barColor);
  this.group.appendChild(sliderBar);
  TouchReceiver.addListenersSlider(sliderBar, this);

  if (this.options != null && this.options.length != 0 ) {

    const tickH = 7 * S.barHeight;//8 * S.barHeight;
    const tickW = S.barHeight * (3/4);//S.barHeight/2;
    let tickX = this.barX;
    let tickY = this.barY - (tickH - S.barHeight)/2;
    for (let i = 0; i < this.options.length; i++) {
      const isOnEdge = (i == 0 || i == (this.options.length -1));
      this.addOption(tickX, tickY, this.options[i], tickH, tickW, isOnEdge);
      tickX += (this.barW - tickW) / (this.options.length - 1);
    }
  }



  //this.sliderH = S.barHeight * 5;
  this.sliderH = 30;//10
  this.sliderW = VectorIcon.computeWidth(S.sliderIconPath, this.sliderH);
  this.sliderY = (S.height - this.sliderH)/2;
  //const sliderX = this.barX + (this.barW - this.sliderW)/2;
  const sliderX = this.barX + (this.position/(this.range)) * (this.barW - this.sliderW);
  //this.slider = GuiElements.draw.rect(sliderX, this.sliderY, this.sliderW, this.sliderH, Colors.easternBlue);
  //this.group.appendChild(this.slider);
  //TouchReceiver.addListenersSlider(this.slider, this);
  let color = Colors.easternBlue;
  if (this.sliderColor != null) { color = this.sliderColor; }
  this.sliderIcon = new VectorIcon(sliderX, this.sliderY, S.sliderIconPath, color, this.sliderH, this.group, null, 90);
  TouchReceiver.addListenersSlider(this.sliderIcon.pathE, this);
}

InputWidget.Slider.prototype.addOption = function(x, y, option, tickH, tickW, isOnEdge) {
  const S = InputWidget.Slider;
  const font = Font.uiFont(12);//InputWidget.Label.font;

  //Ticks on the edges of the slider are longer
  let tickY = y;
  if (isOnEdge) {
    const extra = tickH/6;
    tickY -= extra;
    tickH += 2*extra;
  }

  let tick = GuiElements.draw.rect(x, tickY, tickW, tickH, S.barColor);
  this.group.appendChild(tick);
  TouchReceiver.addListenersSlider(tick, this);

  this.optionXs.push(x + tickW/2);
  this.optionValues.push(option);

  switch (this.type) {
    case "ledArray":
      let image = GuiElements.draw.ledArray(this.group, option, 3);
      const iX = x - image.width/2 + tickW/2;
      const iY = y - image.width - S.optionMargin;
      GuiElements.move.group(image.group, iX, iY);
      break;
    case "percent":
    case "distance":
    case "angle":
      let width = GuiElements.measure.stringWidth(option, font);
      let textX = x - width/2 + tickW/2;
      let textY = y - S.optionMargin; //font.charHeight/2 - S.optionMargin;
      let textE = GuiElements.draw.text(textX, textY, option, font, Colors.black);
      this.group.appendChild(textE);
      break;
  }


}

InputWidget.Slider.prototype.drag = function(x) {
  let relX = x - this.overlay.x - this.overlay.margin;

  if (relX > this.barX && relX < (this.barX + this.barW - this.sliderW)) {
    this.sliderX = relX - this.sliderW/2;
    this.position = Math.round(((relX - this.barX)*1.01/(this.barW - this.sliderW))*(this.range));
    //GuiElements.update.rect(this.slider, this.sliderX, this.sliderY, this.sliderW, this.sliderH);
    this.sliderIcon.move(this.sliderX, this.sliderY);

    if (typeof this.value == 'number') {
      this.value = this.position;
    } else if (typeof this.value == 'string') {
      //do nothing?
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

InputWidget.Slider.prototype.drop = function() {
  const x = this.sliderX + this.sliderW/2;

  if (this.snapToOption) {
    //let relX = x - this.overlay.x - this.overlay.margin;
    let relX = x;
    let dist = 1000;
    let bestFit = 0;

    for (let i = 0; i < this.optionXs.length; i++) {
      console.log("option at " + this.optionXs[i] + " relX " + relX);
      let optionDist = Math.abs(this.optionXs[i] - relX);
      if (optionDist < dist) {
        dist = optionDist;
        bestFit = i;
      }
    }

    this.moveToOption(bestFit);
  }
}

InputWidget.Slider.prototype.moveToOption = function(optionIndex) {
  this.sliderX = this.optionXs[optionIndex] - this.sliderW/2;
  this.sliderIcon.move(this.sliderX, this.sliderY);
  this.value = this.optionValues[optionIndex];
  this.updateFn(this.value);
}
