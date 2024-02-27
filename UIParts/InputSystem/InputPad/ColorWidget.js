/**
 * A widget with a flat circular color picker and Alpha slider.
 * 
 */
InputWidget.Color = function(index) {
	this.type = "colorPicker"
	this.index = index

	this.hue = 0 
	this.saturation = 0 
	this.brightness = 100

}
InputWidget.Color.prototype = Object.create(InputWidget.prototype)
InputWidget.Color.prototype.constructor = InputWidget.Color


/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 * @param {Element} parentGroup
 * @param {BubbleOverlay} overlay
 * @param {EditableSlotShape} slotShape
 * @param {function} updateFn
 * @param {function} finishFn
 * @param {Data} data
 */
InputWidget.Color.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);
 	this.group = GuiElements.create.group(x, y, parentGroup);
    let margin = 100 //10

    //Add the color wheel
    this.colorWheelX = margin //this.width/2 - this.height - margin
  	this.colorwheel = GuiElements.draw.image("Color_circle_(RGB)", this.colorWheelX, 0, this.height, this.height, this.group, true)
  	TouchReceiver.addListenersColorWheel(this.colorwheel, this)

    //Add a brightness slider
    let barH = InputWidget.Slider.barHeight * 2
    this.barX = this.height + 2*margin //this.width/2 + margin
    this.barW = this.width - this.barX - margin //this.width/2 - margin*3
    let barY = 2*this.height/3 - barH/2
    let sliderH = 20
    this.sliderW = VectorIcon.computeWidth(InputWidget.Slider.sliderIconPath, sliderH);
    this.sliderY = 2*this.height/3 - sliderH/2
    this.sliderX = this.barX + (this.brightness / 100) * (this.barW - this.sliderW)

    //Make the bar beneath the slider
    this.sliderBar = GuiElements.draw.rect(this.barX, barY, this.barW, barH, Colors.black)//barGradient);
    this.group.appendChild(this.sliderBar);
    TouchReceiver.addListenersSlider(this.sliderBar, this);
    GuiElements.update.stroke(this.sliderBar, Colors.darkDarkGray, 0.1)

    //Make the slider
    this.sliderIcon = new VectorIcon(this.sliderX, this.sliderY, InputWidget.Slider.sliderIconPath, Colors.black, sliderH, this.group, null, 90);
    TouchReceiver.addListenersSlider(this.sliderIcon.pathE, this);
    GuiElements.update.stroke(this.sliderIcon.pathE, Colors.darkDarkGray, 3)

    this.updateSlider()
}

InputWidget.Color.prototype.drag = function(x) {
    let relX = x - this.overlay.x - this.overlay.margin

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
        this.brightness = Math.round(((relX - this.barX) / (this.barW)) * 100);
        console.log("set brightness to " + this.brightness)
        this.sliderIcon.move(this.sliderX, this.sliderY);

        this.updateFn(this.getHex(), this.index);
    }
}

InputWidget.Color.prototype.drop = function() {
    console.log("drop brightness slider")
}

InputWidget.Color.prototype.updateSlider = function() {
    let color = this.getHex(true)
    GuiElements.create.gradient("Brightness" + color, "#000000", color, true)
    //GuiElements.create.gradient("Brightness" + color, color, color, true, 0, 1)
    let barGradient = "url(#Brightness" + color + ")"
    GuiElements.update.color(this.sliderBar, barGradient)
    GuiElements.update.color(this.sliderIcon.pathE, color)
}

/**
 * Calculate the new color based on the user's touch.
 * Parts from https://github.com/ivanvmat/color-picker
 */
InputWidget.Color.prototype.dragColor = function(x, y) {
	let relX = x - this.colorWheelX - this.overlay.x - this.overlay.margin;
	let relY = y - this.overlay.y - this.overlay.margin;

	// get canvas radius and prepare values to calculation of hue and saturation based on thumb position
    let r = this.height/2 
    let dx = relX - r 
    let dy = relY - r 

    // calculate angle of vector from control center to thumb element
    let angle = Math.atan2(dy, dx) * 360 / (2 * Math.PI) - 90; //Math.atan2(y1 - y2, x1 - x2) * 360 / (2 * Math.PI) - 90;
    if(angle < 0) angle += 360;
    
    let scale_length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    
        // calculate hue and saturation values based on thumb position
    this.hue = angle;
    this.saturation = Math.min(100, Math.ceil(scale_length / r * 100));

    console.log("dragColor hue=" + this.hue + "; saturation=" + this.saturation + "; x=" + relX + "; y=" + relY + "; r=" + r)


    console.log(this.getHex())
    this.updateSlider()
    this.updateFn(this.getHex(), this.index)
                
}

/**
 * Converts HSV spectrum to RGB and returns the hex value
 * From https://github.com/ivanvmat/color-picker
 * 
 * @returns {String} Hex value of current color
 */
InputWidget.Color.prototype.getHex = function (fullBrightness) {
    let hue = (this.hue / 360) * 6;
    let saturation = this.saturation / 100;
    let value = fullBrightness ? 1 : this.brightness / 100;

    const i = Math.floor(hue);

    const f = hue - i;
    const p = value * (1 - saturation);
    const q = value * (1 - f * saturation);
    const t = value * (1 - (1 - f) * saturation);

    const mod = i % 6;
    //red pointed down on color wheel
    /*const red = [value, q, p, p, t, value][mod];
    const green = [t, value, value, q, p, p][mod];
    const blue = [p, p, t, value, value, q][mod];*/

    const red = [p, t, value, value, q, p][mod];
    const green = [q, p, p, t, value, value][mod];
    const blue = [value, value, q, p, p, t][mod];

    const rgb = [(red * 255),(green * 255),(blue * 255)];

    const hex = rgb.map(v => Math.round(v).toString(16).padStart(2, '0') );

    return "#" + hex.join('').toUpperCase()
}

InputWidget.Color.prototype.dropColor = function() {
	console.log("dropColor")
}

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 */
InputWidget.Color.prototype.updateDim = function(x, y) {
  const S = InputWidget.Slider; //TODO
  this.height = S.height * 2;
  this.width = S.width;
}





