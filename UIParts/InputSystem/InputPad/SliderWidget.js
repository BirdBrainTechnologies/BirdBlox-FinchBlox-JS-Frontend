/**
 * Displays a slider for selecting values
 * @param {string} type - Type of value this slider will be used to select
 * @param {Array} options - (optional) list of discrete values to present in the slider
 * @param {number | object} startVal - Value to start the slider at. May be an
 *                                     object in the case of an rgb slider.
 * @param {string} sliderColor - Color hex value. Determined by the category of the parent block.
 * @param {string} displaySuffix - Suffix for the displayed value (eg. "cm")
 * @param {number} index - Position of this slider in the InputSystem.
 */
InputWidget.Slider = function (type, options, startVal, sliderColor, displaySuffix, index) {
  this.type = type;
  this.options = options;
  this.value = startVal;
  this.sliderColor = sliderColor;
  this.displaySuffix = displaySuffix;
  this.index = index;

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
  S.height = S.width/8;//80;
  S.hMargin = 20;
  S.barHeight = 4;
  S.barColor = Colors.iron;
  S.sliderIconPath = VectorPaths.mvFinch;
  S.optionMargin = 10;//5;//distance between ticks and option display
  S.font = Font.uiFont(24);//Font.uiFont(16);
  S.optionFont = Font.uiFont(16);//Font.uiFont(12);//InputWidget.Label.font;
  S.textColor = Colors.bbtDarkGray;

  GuiElements.create.spectrum();
};

/**
 * @inheritDoc
 */
InputWidget.Slider.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);

  this.parentGroup = parentGroup;
	this.group = GuiElements.create.group(x, y, parentGroup);
  this.bgRect = GuiElements.draw.rect(0, 0, this.width, this.height, "none");
  //Normally, invisible shapes don't respond to touch events.
  this.bgRect.setAttributeNS(null, "pointer-events", "all");

	this.group.appendChild(this.bgRect);
	TouchReceiver.addListenersSlider(this.bgRect, this);

  //this.value = data;
  //console.log("show slider at index " + this.index + " with data " + data);
  this.value = data[this.index];
  this.makeSlider();

  TouchReceiver.addListenersSlider(this.overlay.bgRect, this);

  const valueIndex = this.optionValues.indexOf(this.value);
  if (valueIndex != -1) {
    this.moveToOption(valueIndex);
  } else if (this.type == "color") {
    this.moveToPosition(InputWidget.Slider.colorToPercent(this.value));
  } else {
    this.moveToValue();
  }
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

/**
 * Draws the slider on the screen. Called by show().
 */
InputWidget.Slider.prototype.makeSlider = function() {
  const S = InputWidget.Slider;
  this.position = 0;
  this.range = 100;

  this.barX = S.hMargin;
  this.barY = (S.height - S.barHeight)/2;
  this.barW = S.width - 2 * S.hMargin;
  let barColor = S.barColor;

  this.sliderH = 35;//30;//10
  this.sliderW = VectorIcon.computeWidth(S.sliderIconPath, this.sliderH);
  this.sliderY = (S.height - this.sliderH)/2;
  this.sliderX = this.barX + (this.position/(this.range)) * (this.barW - this.sliderW);

  //Add a color spectrum behind a color slider
  if (this.type == 'color') {
    barColor = Colors.white;
    const spectrum = "url(#gradient_spectrum)";
    const specH = S.barHeight * 20;
    const specY = this.barY - specH/2 + S.barHeight/2;
    const colorRect = GuiElements.draw.rect(this.barX, specY, this.barW, specH, spectrum, 4, 4);
    this.group.appendChild(colorRect);
    TouchReceiver.addListenersSlider(colorRect, this);
  } else {
    //all other types of sliders need to make space for an additional label at the bottom
    const spaceNeeded = this.height/11;
    this.barY -= spaceNeeded;
    this.sliderY -= spaceNeeded;
  }

  //Add an angle diagram for an angle slider
  if (this.type.startsWith('angle')) {
    this.cR = (this.height - S.hMargin/2)/2;
    this.cX = this.width - S.hMargin - this.cR;
    this.cY = this.height/2;

    let arrowPath = VectorPaths.mvTurnArrowRight;
    const arrowH = this.cR * 0.67;
    const arrowW = VectorIcon.computeWidth(arrowPath, arrowH);
    let arrowX = this.cX;
    const arrowY = this.cY - this.cR * 1.18;
    if (this.type.endsWith('left')) {
      arrowPath = VectorPaths.mvTurnArrowLeft;
      arrowX -= arrowW
    }
    const arrow = new VectorIcon(arrowX, arrowY, arrowPath, S.textColor, arrowH, this.group);

    this.angleWedge = GuiElements.draw.wedge(this.cX, this.cY, this.cR, 45, this.sliderColor);
    this.group.appendChild(this.angleWedge);

    this.angleCircle = GuiElements.draw.circle(this.cX, this.cY, this.cR, "none", this.group);
    GuiElements.update.stroke(this.angleCircle, S.textColor, 1);

    const iconH = 40;
    const iconX = this.cX - this.sliderW/2;
    const iconY = (S.height - iconH)/2;
    this.angleIcon = new VectorIcon(iconX, iconY, S.sliderIconPath, Colors.white, iconH, this.group);
    GuiElements.update.stroke(this.angleIcon.pathE, S.textColor, 6);

    this.barW -= 2*this.cR + S.hMargin + InputPad.margin;
  }

  //Make the bar beneath the slider
  const sliderBar = GuiElements.draw.rect(this.barX, this.barY, this.barW, S.barHeight, barColor);
  this.group.appendChild(sliderBar);
  TouchReceiver.addListenersSlider(sliderBar, this);

  //If there is a list of options to display, add them with a tick mark at each
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

  //Make the slider
  let color = Colors.easternBlue;
  if (this.sliderColor != null) { color = this.sliderColor; }
  this.sliderIcon = new VectorIcon(this.sliderX, this.sliderY, S.sliderIconPath, color, this.sliderH, this.group, null, 90);
  TouchReceiver.addListenersSlider(this.sliderIcon.pathE, this);

  //The following are placeholders that will be updated in updateLabel.
  if (this.type == 'ledArray') {
    //Add an image at the bottom to show your selection
    this.imageG = GuiElements.create.group(0, 0, this.group);
  } else if (this.type != 'color') {
    //Add a label at the bottom to show your selection
    this.textE = GuiElements.draw.text(0, 0, "", InputWidget.Slider.font, S.textColor);
  	this.group.appendChild(this.textE);
  }
  if (this.type == 'time') {
    const labelIconH = 23;
    const labelIconP = VectorPaths.faClock;
    this.labelIconW = VectorIcon.computeWidth(labelIconP, labelIconH);
    this.labelIcon = new VectorIcon(0, 0, labelIconP, Colors.bbtDarkGray, labelIconH, this.group);
  }
}

/**
 * Adds one option to the slider display. Called by makeSlider when there are
 * specified options to display.
 * @param {number} x - x position of the option
 * @param {number} y - y position of the option
 * @param {string} option - String representation of the option
 * @param {number} tickH - Hight of the tickmark to display for this option
 * @param {number} tickW - Width of the tickmark to display for this option
 * @param {boolean} isOnEdge - true if this is the first or last option on the slider.
 */
InputWidget.Slider.prototype.addOption = function(x, y, option, tickH, tickW, isOnEdge) {
  const S = InputWidget.Slider;
  const font = S.optionFont;

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
      let image = GuiElements.draw.ledArray(this.group, option, 2.2);
      const iX = x - image.width/2 + tickW/2;
      const iY = y - image.width - S.optionMargin;
      GuiElements.move.group(image.group, iX, iY);
      break;
    case "percent":
    case "distance":
    case "angle_left":
    case "angle_right":
    case "time":
      let width = GuiElements.measure.stringWidth(option, font);
      let textX = x - width/2 + tickW/2;
      let textY = y - S.optionMargin; //font.charHeight/2 - S.optionMargin;
      let textE = GuiElements.draw.text(textX, textY, option, font, S.textColor);
      this.group.appendChild(textE);
      break;
  }
}

/**
 * Moves the slider as the user drags their finger.
 * @param {number} x - x position of the touch event
 */
InputWidget.Slider.prototype.drag = function(x) {
  let relX = x - this.overlay.x - this.overlay.margin;

  const errorMargin = 10;
  const barMaxX = this.barX + this.barW;
  if (relX < this.barX && relX > this.barX - errorMargin){ relX = this.barX; }
  if (relX > barMaxX && relX < barMaxX + errorMargin){ relX = barMaxX; }

  if (relX >= this.barX && relX <= barMaxX) {
    this.sliderX = relX - this.sliderW/2;
    this.position = Math.round(((relX - this.barX)/(this.barW))*(this.range));
    this.sliderIcon.move(this.sliderX, this.sliderY);

    if (typeof this.value == 'number') {
      if (this.optionValues.length != 0) {

        if (relX < this.optionXs[0]) {
          this.value = this.optionValues[0];
        } else if (relX > this.optionXs[this.optionXs.length - 1]) {
          this.value = this.optionValues[this.optionValues.length -1];
        } else {
          let v = 0;
          for (let i = 0; i < this.optionXs.length; i++) {
            if (this.optionXs[i] <= relX && this.optionXs[i+1] > relX) { v = i; }
          }
          const xRange = this.optionXs[v+1] - this.optionXs[v];
          const vRange = this.optionValues[v+1] - this.optionValues[v];
          const p = (relX - this.optionXs[v])/xRange;
          this.value = Math.round(this.optionValues[v] + p * vRange);
        }

      } else {
        this.value = this.position;
      }
    } else if (typeof this.value == 'string') {
      //do nothing?
    } else {
      //if it is an rgb color object
      if (this.value.r != null) {
        const p = this.position / this.range;
        this.value = InputWidget.Slider.percentToColor(p);
      }
    }

    if (this.type.startsWith("angle")) {
      this.value = Math.round(this.value/5) * 5; //round off to the nearest 5 degrees
      this.updateAngle();
    }

    this.updateLabel();
    this.updateFn(this.value, this.index);
  }
}

/**
 * For color sliders, the position of the slider must be translated into a color
 * value.
 * @param {number} p - Decimal percentage (ie proportion) of the way across the slider that the current position lies.
 * @return {Object} Color represented by the given slider position.
 */
InputWidget.Slider.percentToColor = function(p) {
  let color = {};

  if (p < 0.17) {
    color.r = 100;
    color.g = Math.round(100*p/0.17);
    color.b = 0;
  //yellow -> green
  } else if (p < 0.33) {
    color.r = Math.round(100 - (100 * (p - 0.17)/0.17));
    color.g = 100;
    color.b = 0;
  //green -> cyan
  } else if (p < 0.5) {
    color.r = 0;
    color.g = 100;
    color.b = Math.round(100 * (p - 0.33)/0.17);
  //cyan -> blue
  } else if (p < 0.67) {
    color.r = 0;
    color.g = Math.round(100 - (100 * (p - 0.5)/0.17));
    color.b = 100;
  //blue -> magenta
  } else if (p < 0.83) {
    color.r = Math.round(100 * (p - 0.67)/0.17);
    color.g = 0;
    color.b = 100;
  //magenta -> red
  } else {
    color.r = 100;
    color.g = 0;
    color.b = Math.round(100 - (100 * (p - 0.83)/0.17));
  }

  return color;
}

/**
 * The reverse of percentToColor. Takes the current color value and turns it into
 * a decimal percent (proportion) so that the slider can be loaded in the correct
 * position.
 * @param {Object} color - Color value to convert
 * @return {number} Relative position of this color on the slider
 */
InputWidget.Slider.colorToPercent = function(color) {
  let p = 0;

  if (color.r == 100 && color.b == 0) {//between red and yellow
    p = color.g * 0.17/100;
  } else if (color.g == 100 && color.b == 0) {//between yellow and green
    p = 0.17 + (100 - color.r) * 0.17/100;
  } else if (color.r == 0 && color.g == 100) {//between green and cyan
    p = 0.33 + color.b * 0.17/100;
  } else if (color.r == 0 && color.b == 100) {//between cyan and blue
    p = 0.5 + (100 - color.g) * 0.17/100;
  } else if (color.g == 0 && color.b == 100) {//between blue and magenta
    p = 0.66 + color.r * 0.17/100;
  } else if (color.r == 100 && color.g == 0) {//between magenta and red
    p = 0.83 + (100 - color.b) * 0.17/100;
  }
  return p;
}

/**
 * Called when the slider is released (no longer being dragged).
 */
InputWidget.Slider.prototype.drop = function() {
  const x = this.sliderX + this.sliderW/2;

  if (this.snapToOption) {
    //let relX = x - this.overlay.x - this.overlay.margin;
    let relX = x;
    let dist = 1000;
    let bestFit = 0;

    for (let i = 0; i < this.optionXs.length; i++) {
      //console.log("option at " + this.optionXs[i] + " relX " + relX);
      let optionDist = Math.abs(this.optionXs[i] - relX);
      if (optionDist < dist) {
        dist = optionDist;
        bestFit = i;
      }
    }

    this.moveToOption(bestFit);
  }
}

/**
 * Moves the slider to the specified option in the option list.
 * @param {number} optionIndex - Option to move the slider to
 */
InputWidget.Slider.prototype.moveToOption = function(optionIndex) {
  this.sliderX = this.optionXs[optionIndex] - this.sliderW/2;
  this.sliderIcon.move(this.sliderX, this.sliderY);
  this.value = this.optionValues[optionIndex];
  if (this.type.startsWith("angle")) { this.updateAngle(); }
  this.updateLabel();
  this.updateFn(this.value, this.index);
}

/**
 * Moves the slider to the given position.
 * @param {number} p - Position to move the slider to (given as a decimal percent of the slider).
 */
InputWidget.Slider.prototype.moveToPosition = function(p) {
  this.sliderX = this.barX + p * this.barW - this.sliderW/2;
  this.sliderIcon.move(this.sliderX, this.sliderY);
  //todo: Update value here?
  this.updateLabel();
}

/**
 * Moves the slider to the current value.
 */
InputWidget.Slider.prototype.moveToValue = function() {
  if (typeof this.value == 'number') {
    //console.log("move to value " + this.value);
    if (this.optionValues.length != 0) {
      let v = -1;
      for (let i = 0; i < this.optionValues.length; i++) {
        if (this.optionValues[i] < this.value && this.optionValues[i+1] > this.value) {
          v = i;
        }
      }
      if (v != -1) {
        let range = this.optionValues[v+1] - this.optionValues[v];
        let xRange = this.optionXs[v+1] - this.optionXs[v];
        let p = (this.value - this.optionValues[v])/range;
        let x = this.optionXs[v] + xRange * p;
        this.sliderX = x - this.sliderW/2;
        this.sliderIcon.move(this.sliderX, this.sliderY);
      }
    }
  }
  if (this.type.startsWith("angle")) { this.updateAngle(); }
  this.updateLabel();
}

/**
 * For angle sliders only. Updates the angle graphic to represent the current slider value.
 */
InputWidget.Slider.prototype.updateAngle = function() {
  const counterClockwise = (this.type.endsWith("left"));
  if (this.angleWedge != null) {
    GuiElements.update.wedge(this.angleWedge, this.cX, this.cY, this.cR, this.value, counterClockwise);
    if (this.value == 360) {
      GuiElements.update.color(this.angleCircle, Colors.easternBlue);
    } else {
      GuiElements.update.color(this.angleCircle, "none");
    }
  }
  if (this.angleIcon != null) {
    let rotation = this.value;
    if (counterClockwise) { rotation = 360 - this.value;}
    this.angleIcon.setRotation(rotation);
  }
}

/**
 * Updates the label under the slider to the current value.
 */
InputWidget.Slider.prototype.updateLabel = function() {
  if (this.textE != null) {
    const margin = 35; //space between slider bar and this label.
    GuiElements.update.textLimitWidth(this.textE, this.value + this.displaySuffix, this.barW);
  	const textW = GuiElements.measure.textWidth(this.textE);
    let iconW = 0;
    if (this.labelIcon != null) {
      iconW = this.labelIconW;
      const iconX = this.barX + (this.barW + textW + 10)/2 - iconW/2;
      const iconY = this.barY + margin - 3;
      this.labelIcon.move(iconX, iconY);
    }
  	const textX = this.barX + this.barW / 2 - (textW + iconW)/2;
  	const textY = this.barY + InputWidget.Slider.font.charHeight + margin;
  	GuiElements.move.text(this.textE, textX, textY);
  }
  if (this.imageG != null) {
    const margin = 25; //space between slider bar and this image.
    this.imageG.remove();
    let image = GuiElements.draw.ledArray(this.group, this.value, 4);
    const iX = this.barX + this.barW/2 - image.width/2;
    const iY = this.barY + margin;
    GuiElements.move.group(image.group, iX, iY);
    this.imageG = image.group;
  }
}
