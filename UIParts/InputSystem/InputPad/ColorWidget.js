/**
 * A widget with a flat circular color picker 
 * 
 */
InputWidget.Color = function(index, iconColor, multi) {
	this.type = "colorPicker"
	this.index = index
    this.iconColor = iconColor
    this.multi = multi
    console.log("*** color widget multi=" + multi)

	this.hue = 0 
	this.saturation = 0 
	this.brightness = 100

}
InputWidget.Color.prototype = Object.create(InputWidget.prototype)
InputWidget.Color.prototype.constructor = InputWidget.Color

//Global color history
InputWidget.Color.recentColors = [
    "#FF8800", 
    "#8800FF",
    "#FF0088",
    "#0088FF", 
    //"#FFFF00",
    "#88FF00",
    "#00FF88", 
    //"#00FFFF",
    
     
    //"#FF00FF",
    
    "#FF8888",
    //"#FFCC88",
    "#FFFF88",
    //"#88FF88",
    //"#88FFFF",
    //"#8888FF",
    //"#FF88FF"
    ]
InputWidget.Color.staticColors = [
    //"#000000",
    "#FFFFFF",
    "#FF0000", 
    "#00FF00",
    "#0000FF",

    "#FFFF00",
    "#00FFFF",
    "#FF00FF",
    "#000000",
    ]
InputWidget.Color.addRecentColor = function(color) {

    //Do not add colors from the static color list
    if (InputWidget.Color.staticColors.indexOf(color) != -1) {
        return
    }

    const rcs = InputWidget.Color.recentColors

    //Remove first instance of color or pop last item
    const index = rcs.indexOf(color)
    if (index > -1) {
        rcs.splice(index, 1)
    } else {
        rcs.pop() //remove the last element to maintain array length
    }

    //add the new color to the beginning of the list
    rcs.unshift(color)
}

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
    const margin = 10 //this.height/20 //100 //10
    const smIconH = 35 
    this.setColor(data[this.index])

    //Add icon at top
    const iconPath = this.multi ? VectorPaths.bdMultiLightBulb : VectorPaths.bdLightBulb
    const iconH = 80
    const iconW = VectorIcon.computeWidth(iconPath, iconH)
    const iconX = (this.width - iconW)/2
    const iconY = this.multi ? 0 : ( (this.height - iconH)/2 )
    const icon = new VectorIcon(iconX, iconY, iconPath, this.iconColor, iconH, this.group)

    //Add the color wheel
    this.colorWheelX = margin //this.width/2 - this.height - margin
    this.colorWheelH = this.height - 2*margin //this.width/2 - margin*2 //this.width*2/7 - margin*2  //this.width/3 - margin*2 //this.height/2
    this.colorWheelY = this.height - this.colorWheelH - margin
  	this.colorwheel = GuiElements.draw.image("Color_circle_(RGB)", this.colorWheelX, this.colorWheelY, this.colorWheelH, this.colorWheelH, this.group, true)
  	TouchReceiver.addListenersColorWheel(this.colorwheel, this)

    //Add the circular preview on the color wheel
    this.preview = GuiElements.draw.circle(0, 0, smIconH/2, Colors.black, this.group)
    GuiElements.update.stroke(this.preview, Colors.white, 3)
    TouchReceiver.addListenersColorWheel(this.preview, this)
    this.updatePreview()

    //Make the current color the first color in the recent color list 
    InputWidget.Color.addRecentColor(this.getHex())

    /* The slider just wasn't working out

    //Add a brightness slider
    const sX = this.width*2/7 // /3 //starting x of slider area
    const sY = this.height*2/3 //center y of slider area
    const sW = this.width*3/7 // /3 //width of slider area
    const iconHighPath = VectorPaths.bdLight 
    const iconLowPath = VectorPaths.bdDark
    const iLowW = VectorIcon.computeWidth(iconLowPath, smIconH)
    const iHighW = VectorIcon.computeWidth(iconHighPath, smIconH)
    const iconM = 5 //margin between slider icons and slider
    let barH = smIconH
    this.barX = sX + iLowW + iconM + barH/2 //this.width/3//this.height + 2*margin //this.width/2 + margin
    this.barW = sW - iLowW - iHighW - 2*iconM - barH//this.width/3//this.width - this.barX - margin //this.width/2 - margin*3
    let barY = sY - barH/2 //2*this.height/3 - barH/2
    let sliderH = smIconH*3/2 //20
    this.sliderW = VectorIcon.computeWidth(InputWidget.Slider.sliderIconPath, sliderH);
    this.sliderY = sY - sliderH/2 //2*this.height/3 - sliderH/2
    this.sliderX = this.barX + (this.brightness / 100) * (this.barW - this.sliderW)
    

    //Make the icons on either side of the slider
    const iconLow = new VectorIcon(sX, barY, iconLowPath, this.iconColor, smIconH, this.group)
    const iconHigh = new VectorIcon(sX + sW - iHighW, barY, iconHighPath, this.iconColor, smIconH, this.group)
    
    //Make round ends for the slider bar
    const lowEnd = GuiElements.draw.circle(this.barX, sY, barH/2, Colors.black, this.group)
    this.highEnd = GuiElements.draw.circle(this.barX + this.barW, sY, barH/2, Colors.black, this.group)

    //Make the bar beneath the slider
    this.sliderBar = GuiElements.draw.rect(this.barX, barY, this.barW, barH, Colors.black)//, barH/2, barH/2)//barGradient);
    this.group.appendChild(this.sliderBar);
    TouchReceiver.addListenersSlider(this.sliderBar, this);
    //GuiElements.update.stroke(this.sliderBar, Colors.ballyGrayDark, 0.1)

    //Make the slider
    this.sliderIcon = new VectorIcon(this.sliderX, this.sliderY, InputWidget.Slider.sliderIconPath, Colors.black, sliderH, this.group, null, 90);
    TouchReceiver.addListenersSlider(this.sliderIcon.pathE, this);
    GuiElements.update.stroke(this.sliderIcon.pathE, Colors.white, 10)
    //Add center lines

    const x1 = InputWidget.Slider.sliderIconPath.height * 3/7//this.sliderW * 1/3
    const x2 = InputWidget.Slider.sliderIconPath.height * 4/7//this.sliderW * 2/3
    const y1 = InputWidget.Slider.sliderIconPath.width * 1/3//this.sliderH * 1/3
    const y2 = InputWidget.Slider.sliderIconPath.width * 2/3//this.sliderH * 2/3
    const line1 = GuiElements.draw.line(y1, x1, y2, x1, Colors.white, 5, true)
    const line2 = GuiElements.draw.line(y1, x2, y2, x2, Colors.white, 5, true)
    this.sliderIcon.group.appendChild(line1)
    this.sliderIcon.group.appendChild(line2)
    TouchReceiver.addListenersSlider(line1, this)
    TouchReceiver.addListenersSlider(line2, this)

    this.updateSlider()

    */


    //Add the recent colors picker
    this.recentColorButtons = []
    const rX = this.width - this.height + margin //this.width*5/7 // *2/3 //x coord to start this section
    const rY = (this.height - smIconH)/2 //margin //this.height/3 //y coord to start this section
    const rW = this.height - 2*margin //this.width*2/7 ///3 //width of section
    const rIconPath = VectorPaths.bdRecent
    const rIconW = VectorIcon.computeWidth(rIconPath, smIconH)
    const rIconX = rX + (rW - rIconW)/2
    const recentIcon = new VectorIcon(rIconX, rY, rIconPath, this.iconColor, smIconH, this.group)
    const recentCs = InputWidget.Color.recentColors
    const bnM = 15//10
    const bnH = (rW - 7*bnM)/4 //(rW - 3*bnM)/4 //(rW - 10*bnM)/3
    let bnX = rX + 2*bnM // rX //rX + 4*bnM
    let bnY = rY + smIconH + bnM
    
    for (let i = 0; i < recentCs.length; i++) {

        let color = recentCs[i]
        const bn = new Button(bnX, bnY, bnH, bnH, this.group, color, 6, 6)
        bn.markAsOverlayPart(this.overlay)
        
        this.recentColorButtons.push(bn)

        bnX += bnH + bnM
        if ((i+1)%4 == 0) {//if ((i+1)%3 == 0) {
            bnX = rX + 2*bnM // rX // + 4*bnM
            bnY += bnH + bnM
        }
    }

    //Add the static color buttons
    this.staticColorButtons = []
    const staticCs = InputWidget.Color.staticColors
    //bnX = this.width/2 - bnH - bnM/2
    bnY = margin //this.height/2
    for (let i = 0; i < staticCs.length; i++) {
        const color = staticCs[i]
        const bn = new Button(bnX, bnY, bnH, bnH, this.group, color, 6, 6)
        bn.markAsOverlayPart(this.overlay)
        this.updateColorBn(bn, color)
        this.staticColorButtons.push(bn)

        bnX += bnH + bnM
        if (i == 3) { //1) {
            //bnX = this.width/2 - bnH - bnM/2 //this.width/2 - 1.5*bnH - bnM
            bnX = rX + 2*bnM
            bnY += bnH + bnM
        }
    }

    /*
    this.addStaticColorButton(bnX, bnY, bnH, Colors.black)
    bnX += bnH + bnM
    this.addStaticColorButton(bnX, bnY, bnH, Colors.white)
    bnX = this.width/2 - 1.5*bnH - bnM
    bnY += bnH + bnM
    this.addStaticColorButton(bnX, bnY, bnH, Colors.red)
    bnX += bnH + bnM
    this.addStaticColorButton(bnX, bnY, bnH, Colors.green)
    bnX += bnH + bnM
    this.addStaticColorButton(bnX, bnY, bnH, Colors.blue)*/

    //Add color picking for each bulb if this is for a multibulb block
    if (this.multi) {
        this.bulbValues = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]
        this.bulbButtons = []
        let bulbM = bnM/2
        let bulbH = (this.height - iconH)/4 - bulbM
        let bulbX = (this.width - bulbH)/2
        let bulbY = iconH
        for (let i = 0; i < this.bulbValues.length; i++) {
            let bulb = new Button(bulbX, bulbY, bulbH, bulbH, this.group, 
                this.bulbValues[i], bulbH/2, bulbH/2)
            bulbY += bulbH + bulbM
            bulb.markAsOverlayPart(this.overlay)
            bulb.setCallbackFunction(function() {
                this.selectBulb(i)
            }.bind(this))

            this.bulbButtons[i] = bulb
        }
        this.selectBulb(0)
    }


    this.updateRecentBns()
}

InputWidget.Color.prototype.updateRecentBns = function() {
    const recentCs = InputWidget.Color.recentColors

    for (let i = 0; i < recentCs.length; i++) {
        const bn = this.recentColorButtons[i]
        const color = recentCs[i]
        
        this.updateColorBn(bn, color)
    }

    this.selectBns()
}

InputWidget.Color.prototype.updateColorBn = function(bn, color) {
    bn.updateBgColor(color)

    bn.setCallbackFunction(function() {
        //this.updateSlider()
        this.setColor(color)
        //this.updateFn(this.getHex(), this.index)
        this.updateButtonValue()
        this.updatePreview()
        this.selectBns()
        InputWidget.Color.addRecentColor(color)
    }.bind(this), true)
}

InputWidget.Color.prototype.selectBns = function () {
    const currentColor = this.getHex()

    function setOutline(bn) {
        const outlineW = (bn.bg == currentColor) ? 6 : 3
        GuiElements.update.stroke(bn.bgRect, Colors.ballyGray, outlineW)
    }

    for (let i = 0; i < this.recentColorButtons.length; i++) {
        setOutline(this.recentColorButtons[i])
    }
    for (let i = 0; i < this.staticColorButtons.length; i++) {
        setOutline(this.staticColorButtons[i])
    }
}

InputWidget.Color.prototype.selectBulb = function (index) {

    this.currentBulb = index

    function setOutline(bn, id) {
        const outlineW = (id == index) ? 6 : 3
        GuiElements.update.stroke(bn.bgRect, Colors.ballyGray, outlineW)
    }

    for (let i = 0; i < this.bulbButtons.length; i++) {
        setOutline(this.bulbButtons[i], i)
    }
    
}

InputWidget.Color.prototype.updateButtonValue = function () {
    if (this.multi) {
        let color = this.getHex()
        this.bulbValues[this.currentBulb] = color
        this.bulbButtons[this.currentBulb].updateBgColor(color)

        let val = ""
        for (let i = 0; i < this.bulbValues.length; i++) {
            val += this.bulbValues[i] + ";"
        }
        this.updateFn(val.slice(0, -1), this.index)
    } else {
        this.updateFn(this.getHex(), this.index)
    }
}

/*InputWidget.Color.prototype.drag = function(x) {
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
    GuiElements.update.color(this.highEnd, color)
    GuiElements.update.color(this.sliderIcon.pathE, color)
}*/

/**
 * Calculate the new color based on the user's touch.
 * Parts from https://github.com/ivanvmat/color-picker
 */
InputWidget.Color.prototype.dragColor = function(x, y) {
	let relX = x - this.colorWheelX - this.overlay.x - this.overlay.margin;
	let relY = y - this.colorWheelY - this.overlay.y - this.overlay.margin;

	// get canvas radius and prepare values to calculation of hue and saturation based on thumb position
    let r = this.colorWheelH/2 //this.height/2 
    let dx = relX - r 
    let dy = relY - r 

    // calculate angle of vector from control center to thumb element
    let angle = Math.atan2(dy, dx) * 360 / (2 * Math.PI) - 90; //Math.atan2(y1 - y2, x1 - x2) * 360 / (2 * Math.PI) - 90;
    if(angle < 0) angle += 360;
    
    let scale_length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    
        // calculate hue and saturation values based on thumb position
    this.hue = angle;
    this.saturation = Math.min(100, Math.ceil(scale_length / r * 100));
    this.brightness = 100

    //console.log("dragColor hue=" + this.hue + "; saturation=" + this.saturation + "; x=" + relX + "; y=" + relY + "; r=" + r)


    //console.log(this.getHex())
    //this.updateSlider()
    //this.updateFn(this.getHex(), this.index)
    this.updateButtonValue()
    this.updatePreview()
                
}

/**
 * Update the position of the preview circle
 * Parts from https://github.com/ivanvmat/color-picker
 */
InputWidget.Color.prototype.updatePreview = function() {
    //thumb.style.left = (canvas_bb.width / 2) + ((canvas_bb.width / 2)/100*color_picker.color.s) * Math.cos(utils.degreesToRadians(color_picker.color.h + 90)) - (thumb_bb.width / 2) + 'px';
    //thumb.style.top = (canvas_bb.height / 2) + ((canvas_bb.width / 2)/100*color_picker.color.s)  * Math.sin(utils.degreesToRadians(color_picker.color.h + 90)) - (thumb_bb.height / 2) + 'px';
    const cx = this.colorWheelX + this.colorWheelH/2 + ((this.colorWheelH/2)/100*this.saturation) * Math.cos( (this.hue + 90)*(Math.PI/180) )       
    const cy = this.colorWheelY + this.colorWheelH/2 + ((this.colorWheelH/2)/100*this.saturation) * Math.sin( (this.hue + 90)*(Math.PI/180) )  
    GuiElements.update.color(this.preview, this.getHex())
    GuiElements.move.circle(this.preview, cx, cy) 
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

    //const rgb = [(red * 255),(green * 255),(blue * 255)];

    //const hex = rgb.map(v => Math.round(v).toString(16).padStart(2, '0') );

    //return "#" + hex.join('').toUpperCase()

    return Colors.rgbToHex((red * 255),(green * 255),(blue * 255)).toUpperCase()
}

InputWidget.Color.prototype.dropColor = function() {
    InputWidget.Color.addRecentColor(this.getHex())
    this.updateRecentBns()
}

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 */
InputWidget.Color.prototype.updateDim = function(x, y) {
  const S = InputWidget.Slider; //TODO
  this.height = S.height * 1.5;
  this.width = S.width;
}


/**
 * Set new color based on the given hex value.
 * Parts from https://github.com/ivanvmat/color-picker
 */
InputWidget.Color.prototype.setColor =function(hex) {

    let [red, green, blue] = Colors.hexToRgb(hex)

    red /= 255;
    green /= 255;
    blue /= 255;

    const minVal = Math.min(red, green, blue);
    const maxVal = Math.max(red, green, blue);
    const delta = maxVal - minVal;

    let hue, saturation;
    const value = maxVal;
    if (delta === 0) {
        hue = saturation = 0;
    } else {
        saturation = delta / maxVal;
        const dr = (((maxVal - red) / 6) + (delta / 2)) / delta;
        const dg = (((maxVal - green) / 6) + (delta / 2)) / delta;
        const db = (((maxVal - blue) / 6) + (delta / 2)) / delta;

        if (red === maxVal) {
            hue = db - dg;
        } else if (green === maxVal) {
            hue = (1 / 3) + dr - db;
        } else if (blue === maxVal) {
            hue = (2 / 3) + dg - dr;
        }

        if (hue < 0) {
            hue += 1;
        } else if (hue > 1) {
            hue -= 1;
        }
    }

    // Red down color wheel
    //this.hue = hue * 360
    this.hue = (hue*360 + 180) % 360
    this.saturation = saturation * 100
    this.brightness = value * 100
}


