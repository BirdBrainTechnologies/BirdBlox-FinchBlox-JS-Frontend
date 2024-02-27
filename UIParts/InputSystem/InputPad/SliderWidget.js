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
InputWidget.Slider = function(type, options, startVal, sliderColor, displaySuffix, index) {
  this.type = type;
  this.options = options;
  this.optionDisabled = [];
  this.value = startVal;
  this.sliderColor = sliderColor;
  this.displaySuffix = displaySuffix;
  this.index = index;

  this.snapToOption = false;
  if (type == "ledArray" || type.startsWith("hatchling") || type == "sensor") {
    this.snapToOption = true;
  }
  this.optionXs = [];
  this.optionValues = [];

  this.cR = 0; //circle radius for angle display if there is one.

  this.sliders = []
};
InputWidget.Slider.prototype = Object.create(InputWidget.prototype);
InputWidget.Slider.prototype.constructor = InputWidget.Slider;

//For any slider with more than one value, eg. wheels
/*Object.defineProperty(InputWidget.Slider.prototype, "vals", {
  get: function() { return this.value.split("_") }
})*/

InputWidget.Slider.Slide = function(startVal, startX, icon, parent) {
  this.value = startVal
  this.sliderX = startX
  this.sliderIcon = icon
  this.parent = parent
  this.optionValues = parent.optionValues 
  this.optionXs = parent.optionXs
  this.index = parent.index
  this.type = parent.type
  this.sliderY = parent.sliderY 
  this.sliderW = parent.sliderW 
  this.sliderH = parent.sliderH 
  this.snapToOption = parent.snapToOption
  this.overlay = parent.overlay
  this.barX = parent.barX 
  this.barW = parent.barW
  this.dragging = false
}
InputWidget.Slider.Slide.prototype.drag = function(x) {
  InputWidget.Slider.prototype.drag.call(this, x)

  let vals = []
  for (let i = 0; i < this.parent.sliders.length; i++) {
    vals.push(this.parent.sliders[i].value)
  }
  this.parent.value = vals.join(" ")
}
InputWidget.Slider.Slide.prototype.drop = function() {
  InputWidget.Slider.prototype.drop.call(this)
}
InputWidget.Slider.Slide.prototype.moveToValue = function() {
  InputWidget.Slider.prototype.moveToValue.call(this)
}
InputWidget.Slider.Slide.prototype.moveToOption = function(i) {
  InputWidget.Slider.prototype.moveToOption.call(this, i)
}
InputWidget.Slider.Slide.prototype.updateLabel = function() {
  this.parent.updateLabel()
}
InputWidget.Slider.Slide.prototype.updateFn = function(v, i) {
  this.parent.updateFn(this.parent.value, i)
}
InputWidget.Slider.Slide.prototype.getValueIndex = function() {
  return this.optionValues.indexOf(this.value)
}



InputWidget.Slider.setConstants = function() {
  const S = InputWidget.Slider;
  S.width = InputPad.width;
  S.height = S.width / 8; //80;
  S.hMargin = 20;
  S.barHeight = 4;
  S.barColor = Colors.iron;
  if (Hatchling) {
    S.sliderIconPath = VectorPaths.faEgg;
  } else {
    S.sliderIconPath = VectorPaths.mvFinch;
  }
  S.optionMargin = 10; //5;//distance between ticks and option display
  S.font = Font.uiFont(24); //Font.uiFont(16);
  S.optionFont = Font.uiFont(16); //Font.uiFont(12);//InputWidget.Label.font;
  S.textColor = Colors.bbtDarkGray;

  GuiElements.create.spectrum();

/* rgb gradient sliders
  if (Hatchling) {
    GuiElements.create.gradient("gradient_red", Colors.black, Colors.red, true)
    GuiElements.create.gradient("gradient_green", Colors.black, Colors.green, true)
    GuiElements.create.gradient("gradient_blue", Colors.black, Colors.blue, true)
  } */
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

  if(this.type.startsWith("hatchling")) {
    let device = DeviceHatchling.getManager().getDevice(0);
    if (device != null) {
      let portType = this.type.split("_")[1]
      let ports = device.getPortsByType(portType)
      for (let i = 0; i < this.options.length; i++) {
        this.optionDisabled[i] = (ports.indexOf(i) == -1)
      }
    }
  }
  //this.value = data;
  //console.log("show slider at index " + this.index + " with data " + data);
  this.value = data[this.index];
  this.makeSlider();

  TouchReceiver.addListenersSlider(this.overlay.bgRect, this);

  //for sliders with more than one value, eg. wheels
  if(this.sliders.length > 1) {  
    for (let i = 0; i < this.sliders.length; i++) {
      let valueIndex = this.sliders[i].getValueIndex()
      if (valueIndex != -1) {
        this.sliders[i].moveToOption(valueIndex)
      } else {
        this.sliders[i].moveToValue()
      }
    }

  } else {
    const valueIndex = this.optionValues.indexOf(this.value);
    if (valueIndex != -1) {
      this.moveToOption(valueIndex);
    } else if (this.type == "color") {
      this.moveToPosition(InputWidget.Slider.colorToPercent(this.value));
    } else if (this.type.startsWith("color_")) {
      this.moveToPosition(this.value / 100)
    } else {
      this.moveToValue();
    }

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
  if (this.type.startsWith("color_")) { this.height = S.height / 2; }
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
  this.barY = (this.height - S.barHeight) / 2;
  this.barW = S.width - 2 * S.hMargin;
  let barColor = S.barColor;

  this.sliderH = 35; //30;//10
  this.sliderW = VectorIcon.computeWidth(S.sliderIconPath, this.sliderH);
  this.sliderY = (this.height - this.sliderH) / 2;
  this.sliderX = this.barX + (this.position / (this.range)) * (this.barW - this.sliderW);

  //Add a color spectrum behind a color slider
  if (this.type == 'color') {
    barColor = Colors.white;
    const spectrum = "url(#gradient_spectrum)";
    const specH = S.barHeight * 20;
    const specY = this.barY - specH / 2 + S.barHeight / 2;
    const colorRect = GuiElements.draw.rect(this.barX, specY, this.barW, specH, spectrum, 4, 4);
    this.group.appendChild(colorRect);
    TouchReceiver.addListenersSlider(colorRect, this);

  //Add a group of 3 sliders to represent rgb values
  } else if (this.type.startsWith("color_")) {
    /* rgb gradient sliders
    barColor = Colors.white;
    const specH = S.barHeight * 10;
    const specY = this.barY - specH / 2 + S.barHeight / 2;
    const gradient = "url(#gradient_" + this.type.split("_")[1] + ")"
    const colorRect = GuiElements.draw.rect(this.barX, specY, this.barW, specH, gradient, 4, 4);
    this.group.appendChild(colorRect);
    TouchReceiver.addListenersSlider(colorRect, this); */

    const triH = S.barHeight * 10;
    const offset = triH/2 - S.barHeight
    this.barY += offset
    this.sliderY += offset
    const color = this.type.split("_")[1]
    const colorTri = GuiElements.draw.rightTriangle(this.barX, this.barY, this.barW, triH, Colors[color])   
    this.group.appendChild(colorTri);
    TouchReceiver.addListenersSlider(colorTri, this);


    //All other sliders have tick marks with options above
  } else {
    const offset = (S.font.charHeight) / 2 //compensate for the space the options take up
    this.barY += offset
    this.sliderY += offset

    this.sideSpaceR = this.height / 2
    //Add an angle diagram for an angle slider
    if (this.type.startsWith('angle')) {
      const circle = this.type.endsWith('clockwise')
      this.cR = this.sideSpaceR - S.hMargin / 4 - S.font.charHeight / 2;
      this.cX = this.width - S.hMargin - this.sideSpaceR; //this.cR;
      this.cY = this.height / 2 - S.font.charHeight / 2;

      if (!circle) {
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
      }

      this.angleCircle = GuiElements.draw.circle(this.cX, this.cY, this.cR, "none", this.group);
      GuiElements.update.stroke(this.angleCircle, S.textColor, 1);

      const iconH = circle ? 17 : 25; 
      const iconW = VectorIcon.computeWidth(S.sliderIconPath, iconH);
      let iconX = this.cX - iconW / 2;
      let iconY = this.cY - iconH / 2;

      if (circle) {
        this.angleWedge = GuiElements.draw.wedge(this.cX, this.cY, this.cR, 45, this.sliderColor, false, true);
        GuiElements.update.stroke(this.angleWedge, this.sliderColor, 3)
        this.group.appendChild(this.angleWedge);

        const bnsY = this.cY + this.cR + iconW/2
        const bnsS = 20
        /*const clockwiseBn = new Button((this.cX - bnsS), bnsY, bnsS, bnsS, this.group, this.sliderColor, 2, 2)
        clockwiseBn.addIcon(VectorPaths.bsArrowClockwise, 15)
        const counterClockwiseBn = new Button(this.cX, bnsY, bnsS, bnsS, this.group, this.sliderColor, 2, 2)
        counterClockwiseBn.addIcon(VectorPaths.bsArrowCounterClockwise, 15)*/


        function mkToggleBn (x, y, s, grp, color, r, cbn, callbackFn, overlay) {
          let button = new Button(x, y, s, s, grp, color, r, r)
          let pathId = cbn ? VectorPaths.bsArrowClockwise : VectorPaths.bsArrowCounterClockwise
          let rotation = cbn ? 290 : 70
          button.addIcon(pathId, 15, null, null, rotation)
          button.setCallbackFunction(function () { callbackFn(cbn) })
          button.markAsOverlayPart(overlay)

          return button
        }

        const callback = function(cBn) {
          let direction = 'clockwise'
          if (this.type == 'angle_clockwise') {
            if (cBn) { return }
            direction = 'counterclockwise'
            this.clockwiseBn.enable()
            this.counterClockwiseBn.disable()
          } else {
            if (!cBn) { return }
            this.counterClockwiseBn.enable()
            this.clockwiseBn.disable()
          }

          this.type = 'angle_' + direction
          this.updateAngle()
          this.updateFn(this.value, this.index)
          
        }.bind(this)
        /*clockwiseBn.setCallbackFunction(function() { callback(true) })
        counterClockwiseBn.setCallbackFunction(function() { callback(false) })
        clockwiseBn.setUnToggleFunction(function () {})
        counterClockwiseBn.setUnToggleFunction(function () {})
        clockwiseBn.markAsOverlayPart(this.overlay)
        counterClockwiseBn.markAsOverlayPart(this.overlay)*/
        this.clockwiseBn = mkToggleBn((this.cX - bnsS), bnsY, bnsS, this.group, this.sliderColor, 2, true, callback, this.overlay)
        this.counterClockwiseBn = mkToggleBn(this.cX, bnsY, bnsS, this.group, this.sliderColor, 2, false, callback, this.overlay)

        let disableBn = (this.type.endsWith('counterclockwise')) ? this.counterClockwiseBn : this.clockwiseBn
        disableBn.disable()
        /*toggledBn.setColor(true)
        toggledBn.pressed = true 
        toggledBn.release()*/

        this.circleIconX = iconX 
        this.circleIconY = iconY
        iconY = iconY - this.cR
      }

      this.angleIcon = new VectorIcon(iconX, iconY, S.sliderIconPath, Colors.white, iconH, this.group);
      GuiElements.update.stroke(this.angleIcon.pathE, S.textColor, 6);
    }
    //Make space to display the selected value to the right.
    this.barW -= 2 * this.sideSpaceR + S.hMargin + InputPad.margin;
  }

  //Make the bar beneath the slider
  const sliderBar = GuiElements.draw.rect(this.barX, this.barY, this.barW, S.barHeight, barColor);
  this.group.appendChild(sliderBar);
  TouchReceiver.addListenersSlider(sliderBar, this);

  //If there is a list of options to display, add them with a tick mark at each
  if (this.options != null && this.options.length != 0) {
    const tickH = 7 * S.barHeight;
    const tickW = S.barHeight * (3 / 4);
    let tickX = this.barX;
    let tickY = this.barY - (tickH - S.barHeight) / 2;
    for (let i = 0; i < this.options.length; i++) {
      const isOnEdge = (i == 0 || i == (this.options.length - 1));
      this.addOption(tickX, tickY, this.options[i], tickH, tickW, isOnEdge, this.optionDisabled[i]);
      tickX += (this.barW - tickW) / (this.options.length - 1);
    }
  }

  //Make the slider
  let color = Colors.easternBlue;
  if (this.sliderColor != null) {
    color = this.sliderColor;
  }
  this.sliderIcon = new VectorIcon(this.sliderX, this.sliderY, S.sliderIconPath, color, this.sliderH, this.group, null, 90);
  TouchReceiver.addListenersSlider(this.sliderIcon.pathE, this);
  if (this.type.startsWith("wheels")) {

    let sliderX2 = this.barX
    let sliderIcon2 = new VectorIcon(sliderX2, this.sliderY, S.sliderIconPath, color, this.sliderH, this.group, null, 90);
    TouchReceiver.addListenersSlider(sliderIcon2.pathE, this);
    let l = GuiElements.draw.text(this.sliderW*1.5, this.sliderH*1.25, "L", InputWidget.Slider.font, Colors.white, null, -90);
    TouchReceiver.addListenersSlider(l, this)
    this.sliderIcon.group.appendChild(l)
    let r = GuiElements.draw.text(this.sliderW*1.5, this.sliderH*1.25, "R", InputWidget.Slider.font, Colors.white, null, -90);
    TouchReceiver.addListenersSlider(r, this)
    sliderIcon2.group.appendChild(r)

    let vals = this.value.split(" ")
    this.sliders = []
    this.sliders.push(new InputWidget.Slider.Slide(parseInt(vals[0]), this.sliderX, this.sliderIcon, this))
    this.sliders.push(new InputWidget.Slider.Slide(parseInt(vals[1]), sliderX2, sliderIcon2, this))
  }

  //The following are placeholders that will be updated in updateLabel.
  if (this.type == 'ledArray') {
    //Add an image at the bottom to show your selection
    this.imageG = GuiElements.create.group(0, 0, this.group);
  } else if (!this.type.startsWith('color') && this.type != 'sensor') { //!this.type.startsWith('hatchling') && this.type != 'sensor') {
    //Add a label at the bottom to show your selection
    this.textE = GuiElements.draw.text(0, 0, "", InputWidget.Slider.font, S.textColor);
    this.group.appendChild(this.textE);
    if (this.type.startsWith("wheels")) {
      this.group.appendChild(document.createElement("br"))
      this.textE2 = GuiElements.draw.text(0, 0, "", InputWidget.Slider.font, S.textColor);
      this.group.appendChild(this.textE2)
    }
  }
  if (this.type == 'time' || this.type == 'sensor') { //this.type.startsWith('hatchling') || this.type == 'sensor') {
    this.labelIconH = 23;
    //const labelIconP = (this.type.startsWith('hatchling')) ? VectorPaths.faLightbulb : VectorPaths.faClock;
    let labelIconP = VectorPaths.faClock
    //if (this.type.startsWith('hatchling')) { labelIconP = VectorPaths.faLightbulb }
    if (this.type == 'sensor') { labelIconP = this.value }

    this.labelIconW = VectorIcon.computeWidth(labelIconP, this.labelIconH);
    this.labelIcon = new VectorIcon(0, 0, labelIconP, Colors.bbtDarkGray, this.labelIconH, this.group);
    /*if (this.type.startsWith('hatchling')) { 
      GuiElements.update.stroke(this.labelIcon.pathE, Colors.bbtDarkGray, 3);
    }*/
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
 * @param {boolean} isDisabled - true if this option is disabled
 */
InputWidget.Slider.prototype.addOption = function(x, y, option, tickH, tickW, isOnEdge, isDisabled) {
  const S = InputWidget.Slider;
  const font = S.optionFont;

  //Ticks on the edges of the slider are longer
  let tickY = y;
  if (isOnEdge) {
    const extra = tickH / 6;
    tickY -= extra;
    tickH += 2 * extra;
  }

  let tick = GuiElements.draw.rect(x, tickY, tickW, tickH, S.barColor);
  this.group.appendChild(tick);
  TouchReceiver.addListenersSlider(tick, this);

  this.optionXs.push(x + tickW / 2);
  this.optionValues.push(option);

  const typeGroup = this.type.split("_")[0]
  switch (typeGroup) {
    case "ledArray":
      let image = GuiElements.draw.ledArray(this.group, option, 2.2);
      const iX = x - image.width / 2 + tickW / 2;
      const iY = y - image.width - S.optionMargin;
      GuiElements.move.group(image.group, iX, iY);
      break;
    /*case "hatchling":
      const iconPath = VectorPaths.faLightbulb
      const iconH = 23
      const iconW = VectorIcon.computeWidth(iconPath, iconH)
      const iconX = x - iconW / 2 + tickW / 2
      const iconY = y - iconH - S.optionMargin
      let icon = new VectorIcon(iconX, iconY, iconPath, option, iconH, this.group)
      GuiElements.update.stroke(icon.pathE, Colors.bbtDarkGray, 3);

      if (isDisabled) {
        const slashG = GuiElements.create.group(0, 0, this.group);
        const slash = GuiElements.create.path(slashG);
        const cr = iconW
        const cx = iconX + iconW/2
        const cy = iconY + iconH/2
        let slashPath = "M " + (cx + cr * Math.cos(315 * Math.PI / 180)) + ",";
        slashPath += (cy + cr * Math.sin(315 * Math.PI / 180));
        slashPath += " L " + (cx + cr * Math.cos(135 * Math.PI / 180)) + ",";
        slashPath += (cy + cr * Math.sin(135 * Math.PI / 180));
        slash.setAttributeNS(null, "d", slashPath);
        GuiElements.update.stroke(slash, S.barColor, 3);
        GuiElements.update.opacity(icon.pathE, 0.3)
      }
      break;*/
    case "sensor":
      const iconP = option
      const iH = 23
      const iW = VectorIcon.computeWidth(iconP, iH)
      const sensorIconX = x - iW / 2 + tickW / 2
      const sensorIconY = y - iH - S.optionMargin
      let sensorIcon = new VectorIcon(sensorIconX, sensorIconY, iconP, Colors.bbtDarkGray, iH, this.group)
      break;
    case "percent":
    case "distance":
    case "angle":
    case "time":
    case "wheels":
    case "hatchling":
      let width = GuiElements.measure.stringWidth(option, font);
      let textX = x - width / 2 + tickW / 2;
      let textY = y - S.optionMargin; //font.charHeight/2 - S.optionMargin;
      let textE = GuiElements.draw.text(textX, textY, option, font, S.textColor);
      this.group.appendChild(textE);

      if (typeGroup == "hatchling" && isDisabled) {
        GuiElements.update.opacity(textE, 0.3)
      }
      break;
  }

  
}

/**
 * Moves the slider as the user drags their finger.
 * @param {number} x - x position of the touch event
 */
InputWidget.Slider.prototype.drag = function(x) {
  let relX = x - this.overlay.x - this.overlay.margin;

  if(this.sliders != null && this.sliders.length > 1) {
    let closest = null 
    for (let i = 0; i < this.sliders.length; i++) {
      if (this.sliders[i].dragging) { 
        closest = this.sliders[i] 
      }
    }

    if (closest == null) {
      closest = this.sliders[0]
      for (let i = 1; i < this.sliders.length; i++) {
        let oldDist = Math.abs(closest.sliderX + closest.sliderW/2 - relX)
        let newDist = Math.abs(this.sliders[i].sliderX + this.sliders[i].sliderW/2 - relX)
        if (newDist < oldDist) {
          closest = this.sliders[i]
        }
      }
    }
    closest.dragging = true
    closest.drag(x)
    return
  }

  const errorMargin = 10;
  const barMaxX = this.barX + this.barW;
  if (relX < this.barX && relX > this.barX - errorMargin) {
    relX = this.barX;
  }
  if (relX > barMaxX && relX < barMaxX + errorMargin) {
    relX = barMaxX;
  }

  if (relX >= this.barX && relX <= barMaxX) {
    this.sliderX = relX - this.sliderW / 2;
    this.position = Math.round(((relX - this.barX) / (this.barW)) * (this.range));
    this.sliderIcon.move(this.sliderX, this.sliderY);

    if (typeof this.value == 'number') {
      if (this.optionValues.length != 0) {

        if (relX < this.optionXs[0]) {
          this.value = this.optionValues[0];
        } else if (relX > this.optionXs[this.optionXs.length - 1]) {
          this.value = this.optionValues[this.optionValues.length - 1];
        } else {
          let v = 0;
          for (let i = 0; i < this.optionXs.length; i++) {
            if (this.optionXs[i] <= relX && this.optionXs[i + 1] > relX) {
              v = i;
            }
          }
          const xRange = this.optionXs[v + 1] - this.optionXs[v];
          const vRange = this.optionValues[v + 1] - this.optionValues[v];
          const p = (relX - this.optionXs[v]) / xRange;
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
      let rv = this.type.endsWith("clockwise") ? 15 : 5
      this.value = Math.round(this.value / rv) * rv; //round off to the nearest 5 or 15 degrees
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
    color.g = Math.round(100 * p / 0.17);
    color.b = 0;
    //yellow -> green
  } else if (p < 0.33) {
    color.r = Math.round(100 - (100 * (p - 0.17) / 0.17));
    color.g = 100;
    color.b = 0;
    //green -> cyan
  } else if (p < 0.5) {
    color.r = 0;
    color.g = 100;
    color.b = Math.round(100 * (p - 0.33) / 0.17);
    //cyan -> blue
  } else if (p < 0.67) {
    color.r = 0;
    color.g = Math.round(100 - (100 * (p - 0.5) / 0.17));
    color.b = 100;
    //blue -> magenta
  } else if (p < 0.83) {
    color.r = Math.round(100 * (p - 0.67) / 0.17);
    color.g = 0;
    color.b = 100;
    //magenta -> red
  } else {
    color.r = 100;
    color.g = 0;
    color.b = Math.round(100 - (100 * (p - 0.83) / 0.17));
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

  if (color.r == 100 && color.b == 0) { //between red and yellow
    p = color.g * 0.17 / 100;
  } else if (color.g == 100 && color.b == 0) { //between yellow and green
    p = 0.17 + (100 - color.r) * 0.17 / 100;
  } else if (color.r == 0 && color.g == 100) { //between green and cyan
    p = 0.33 + color.b * 0.17 / 100;
  } else if (color.r == 0 && color.b == 100) { //between cyan and blue
    p = 0.5 + (100 - color.g) * 0.17 / 100;
  } else if (color.g == 0 && color.b == 100) { //between blue and magenta
    p = 0.66 + color.r * 0.17 / 100;
  } else if (color.r == 100 && color.g == 0) { //between magenta and red
    p = 0.83 + (100 - color.b) * 0.17 / 100;
  }
  return p;
}

/**
 * Called when the slider is released (no longer being dragged).
 */
InputWidget.Slider.prototype.drop = function() {
  //used if there is more than one slider
  if (this.sliders != null && this.sliders.length > 1) {
    for (let i = 0; i < this.sliders.length; i++) {
      if (this.sliders[i].dragging) {
        this.sliders[i].dragging = false
        this.sliders[i].drop()
      }
    }
    return
  }

  const x = this.sliderX + this.sliderW / 2;

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
  this.sliderX = this.optionXs[optionIndex] - this.sliderW / 2;
  this.sliderIcon.move(this.sliderX, this.sliderY);
  this.value = this.optionValues[optionIndex];
  if (this.type.startsWith("angle")) {
    this.updateAngle();
  }
  this.updateLabel();
  this.updateFn(this.value, this.index);
}

/**
 * Moves the slider to the given position.
 * @param {number} p - Position to move the slider to (given as a decimal percent of the slider).
 */
InputWidget.Slider.prototype.moveToPosition = function(p) {
  this.sliderX = this.barX + p * this.barW - this.sliderW / 2;
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
        if (this.optionValues[i] < this.value && this.optionValues[i + 1] > this.value) {
          v = i;
        }
      }
      if (v != -1) {
        let range = this.optionValues[v + 1] - this.optionValues[v];
        let xRange = this.optionXs[v + 1] - this.optionXs[v];
        let p = (this.value - this.optionValues[v]) / range;
        let x = this.optionXs[v] + xRange * p;
        this.sliderX = x - this.sliderW / 2;
        this.sliderIcon.move(this.sliderX, this.sliderY);
      }
    }
  }
  if (this.type.startsWith("angle")) {
    this.updateAngle();
  }
  this.updateLabel();
}

/**
 * For angle sliders only. Updates the angle graphic to represent the current slider value.
 */
InputWidget.Slider.prototype.updateAngle = function() {
  const counterClockwise = (this.type.endsWith("left") || this.type.endsWith("counterclockwise"));
  const arcOnly = (this.type.endsWith("clockwise"));
  if (this.angleWedge != null) {
    GuiElements.update.wedge(this.angleWedge, this.cX, this.cY, this.cR, this.value, counterClockwise, arcOnly);
    if (this.value == 360 && arcOnly) {
      GuiElements.update.stroke(this.angleCircle, this.sliderColor, 3)
    } else if (arcOnly) {
      GuiElements.update.stroke(this.angleCircle, InputWidget.Slider.textColor, 1)
    } else if (this.value == 360) {
      GuiElements.update.color(this.angleCircle, Colors.easternBlue);
    } else {
      GuiElements.update.color(this.angleCircle, "none");
    }
  }
  if (this.angleIcon != null) {
    let rotation = this.value;
    if (counterClockwise) {
      rotation = 360 - this.value;
    }
    if (arcOnly) {
      //let iconX = this.cX - iconW / 2;
      //let iconY = this.cY - iconH / 2;

      //A lot of this math is the same as in GuiElements.update.wedge
      let a = 0;
      if (counterClockwise) {
        a = 270 - this.value;
        if (a < 0) {
          a += 360;
        }
      } else {
        a = this.value + 270;
        if (a > 360) {
          a -= 360;
        }
      }

      let aX = this.circleIconX + this.cR * Math.cos(a * Math.PI / 180); //a*Math.PI/180 = angle in radians
      let aY = this.circleIconY + this.cR * Math.sin(a * Math.PI / 180);

      this.angleIcon.move(aX, aY)
      rotation = counterClockwise ? rotation - 90 : rotation + 90
    }
    this.angleIcon.setRotation(rotation);
  }
}

/**
 * Updates the label next to the slider to the current value.
 */
InputWidget.Slider.prototype.updateLabel = function() {
  const S = InputWidget.Slider;
  if (this.textE != null) {
    let newText = this.value + this.displaySuffix
    if (this.type.startsWith("wheels")) {
      let vals = this.value.split(" ")
      newText = "L " + vals[0] + "%"
      let newText2 = "R " + vals[1] + "%"
      GuiElements.update.text(this.textE2, newText2);
    }
      
    GuiElements.update.textLimitWidth(this.textE, newText, 2 * this.sideSpaceR);
    
    const textW = GuiElements.measure.textWidth(this.textE);
    let iconW = 0;
    if (this.labelIcon != null) {
      iconW = this.labelIconW;
      const iconX = this.width - S.hMargin - this.sideSpaceR + textW / 2 + 5 - iconW / 2;
      const iconY = this.height / 2 - this.labelIconH / 2;
      this.labelIcon.move(iconX, iconY);
    }
    const textX = this.width - S.hMargin - this.sideSpaceR - (textW + iconW) / 2;
    let textY = this.height / 2 + S.font.charHeight / 2;
    //If there is an angle display, make space for that.
    textY += (this.cR ? this.cR + S.font.charHeight / 2 : 0)
    if (this.type.endsWith("clockwise")) { textY -= this.cR*1.5 }
    GuiElements.move.text(this.textE, textX, textY);

    if (this.type.startsWith("wheels")) {
      GuiElements.move.text(this.textE, textX, textY - S.font.charHeight/2);
      GuiElements.move.text(this.textE2, textX, textY + S.font.charHeight);
    }
  } else if (this.labelIcon != null) {
    if (this.type == "sensor") {
      this.labelIcon.remove()
      let labelIconP = this.value
      this.labelIcon = new VectorIcon(0, 0, labelIconP, Colors.bbtDarkGray, this.labelIconH, this.group);
    }
    const iconX = this.width - S.hMargin - this.sideSpaceR - this.labelIconW / 2;
    const iconY = this.height / 2 - this.labelIconH / 2;
    this.labelIcon.move(iconX, iconY);
    if (this.type.startsWith('hatchling')) {
      this.labelIcon.setColor(this.value)
    }
  }
  if (this.imageG != null) {
    this.imageG.remove();
    let image = GuiElements.draw.ledArray(this.group, this.value, 4);
    const iX = this.width - S.hMargin - this.sideSpaceR - image.width / 2;
    const iY = this.height / 2 - image.width / 2;
    GuiElements.move.group(image.group, iX, iY);
    this.imageG = image.group;
  }
}
