/**
 * Displays a slider for selecting values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number | object} startVal - Value to start the slider at. May be an
 *                                     object in the case of an rgb slider.
 */
InputWidget.Slider = function (type, options, startVal, sliderColor, displaySuffix) {
  this.type = type;
  this.options = options;
  this.value = startVal;
  this.sliderColor = sliderColor;
  this.displaySuffix = displaySuffix;

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
  S.font = Font.uiFont(16);

  GuiElements.create.spectrum();
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

  //some slider types need extra elements
  if (this.type == 'color') {
    barColor = Colors.white;
    const spectrum = "url(#gradient_spectrum)";
    const specH = S.barHeight * 20;
    const specY = this.barY - specH/2 + S.barHeight/2;
    const colorRect = GuiElements.draw.rect(this.barX, specY, this.barW, specH, spectrum, 4, 4);
    this.group.appendChild(colorRect);
    TouchReceiver.addListenersSlider(colorRect, this);
  } if (this.type.startsWith('angle')) {
    this.cR = (this.height - S.hMargin/2)/2;
    this.cX = this.width - S.hMargin - this.cR;
    this.cY = this.height/2;
/*
    const arrowPath = VectorPaths.mvTurnArrowRight;
    const arrowH = 20;
    const arrowW = VectorIcon.computeWidth(arrowPath, arrowH);
    const arrowX = this.cX - arrowW/2;
    const arrowY = this.cY - arrowH.2;
    const arrow = new VectorIcon(arrowX, arrowY, arrowPath, Colors.black, arrowH, this.group);
*/
    this.angleWedge = GuiElements.draw.wedge(this.cX, this.cY, this.cR, 45, this.sliderColor);
    this.group.appendChild(this.angleWedge);

    this.angleCircle = GuiElements.draw.circle(this.cX, this.cY, this.cR, "none", this.group);
    GuiElements.update.stroke(this.angleCircle, Colors.black, 1);

    const iX = this.cX - this.sliderW/2;
    this.angleIcon = new VectorIcon(iX, this.sliderY, S.sliderIconPath, Colors.white, this.sliderH, this.group);
    GuiElements.update.stroke(this.angleIcon.pathE, Colors.black, 6);

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

  if (this.type != 'color' && this.type != 'ledArray') {
    //Add a label at the bottom to show your selection
    this.textE = GuiElements.draw.text(0, 0, "", InputWidget.Slider.font, Colors.black);
  	this.group.appendChild(this.textE);
  }
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
    case "angle_left":
    case "angle_right":
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
        //red -> yellow
        this.value = InputWidget.Slider.percentToColor(p);
        //console.log("color updated to " + this.value.r + ", " + this.value.g + ", " + this.value.b);
      }
    }

    if (this.type.startsWith("angle")) {
      this.value = Math.round(this.value/5) * 5; //round off to the nearest 5 degrees
      this.updateAngle();
    }

    this.updateLabel();
    this.updateFn(this.value);
    //console.log("slider val " + this.value + " " + relX + " " + this.barX + " " + this.barW );
  }
}

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
  if (this.type.startsWith("angle")) { this.updateAngle(); }
  this.updateLabel();
  this.updateFn(this.value);
}

InputWidget.Slider.prototype.moveToPosition = function(p) {
  this.sliderX = this.barX + p * this.barW - this.sliderW/2;
  this.sliderIcon.move(this.sliderX, this.sliderY);
  //todo: Update value here?
  this.updateLabel();
}

InputWidget.Slider.prototype.moveToValue = function() {
  if (typeof this.value == 'number') {
    console.log("move to value " + this.value);
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

InputWidget.Slider.prototype.updateLabel = function() {
  if (this.textE != null) {
    GuiElements.update.textLimitWidth(this.textE, this.value + this.displaySuffix, this.barW);
  	const textW = GuiElements.measure.textWidth(this.textE);
  	const textX = this.barX + this.barW / 2 - textW / 2;
  	const textY = this.barY + InputWidget.Slider.font.charHeight + 30;
  	GuiElements.move.text(this.textE, textX, textY);
  }
}
