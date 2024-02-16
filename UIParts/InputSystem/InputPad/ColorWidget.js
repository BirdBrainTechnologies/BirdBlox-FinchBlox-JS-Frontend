/**
 * A widget with a flat circular color picker and Alpha slider.
 * 
 */
InputWidget.Color = function() {
	this.type = "colorPicker"
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
 	//this.pickerDiv = document.createElement('div')
 	//this.pickerDiv.height = 200
 	//this.pickerDiv.width = 200
 	//this.group.appendChild(this.pickerDiv)

 	//this.addStyle() //TODO - only add once
 	/*this.container = document.createElement('div')
 	this.group.appendChild(this.container)

 	this.colorPickerControl()*/

 	let cx = this.width/3
 	let cy = this.height/2
 	let r = this.height/2 - 5
 	console.log("drawing wheel at " + cx + "," + cy)
 	this.wheel = GuiElements.draw.circle(cx, cy, r, Colors.white, this.group)
 	GuiElements.update.stroke(this.wheel, Colors.black, 0.5)
  
  	//this.createColorWheel()

  	/*this.colorwheel = document.createElement('img')
  	this.colorwheel.src = "Images/Color_circle_(RGB).svg"
  	this.colorwheel.height = 100
  	this.colorwheel.width = 100
  	this.group.appendChild(this.colorwheel)*/

  	this.colorwheel = GuiElements.draw.image("Color_circle_(RGB)", 0, 0, 100, 100, this.group, true)
}

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 */
InputWidget.Color.prototype.updateDim = function(x, y) {
  const S = InputWidget.Slider; //TODO
  this.height = S.height;
  this.width = S.width;
}


InputWidget.Color.prototype.createColorWheel = function() {
	// create temporary canvas element
    let can = document.createElement("canvas");
    this.group.appendChild(can)

    // set canvas size
    can.width = can.height = 512;

    // get canvas context
    let ctx = can.getContext("2d");

    // calculate canvas radius
    let radius = can.width / 2;

    // set loop step
    let step = 1 / radius;

    // clear canvas
    ctx.clearRect(0, 0, can.width, can.height);

    // set center points
    let cx = radius;
    let cy = radius;

    // draw hue gradient
    for(let i = 0; i < 360; i += step) {
        // get angle in radians
        let rad = i * (2 * Math.PI) / 360;

        // get line direction from center
        let x = radius * Math.cos(rad),
            y = radius * Math.sin(rad);

        // set stroke style
        ctx.strokeStyle = 'hsl(' + i + ', 100%, 50%)';

        // draw color line
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.lineTo(cx + x, cy + y);
        ctx.stroke();
    }

    // draw saturation gradient
    let grd = ctx.createRadialGradient(cx,cy,0,cx,cx,radius);
    grd.addColorStop(0,'rgba(255, 255, 255, 1)');
    grd.addColorStop(1,'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // draw circle border
    ctx.beginPath();
    ctx.strokeStyle = "rgb(38, 41, 50)";
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    this.wheel = can
}



InputWidget.Color.prototype.addStyle = function() {
	let style = `
	:root, [data-theme="default"]{
	    --base-background-color: rgba(38, 41, 50, 1.0);
	    --thumb-border-color: rgba(255, 255, 255, 0.7);
	    --color-wheel-control-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.85) inset;
	    --brightness-control-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5) inset;
	    --input-controls-tab-header-background-color: rgba(41, 45, 53, 1.0);
	    --input-controls-tab-header-font-color: rgba(255, 255, 255, 1.0);
	    --input-controls-tab-background-color: rgba(0, 0, 0, 0.1);
	    --range-input-control-background-color: rgba(55, 61, 71, 0.6);
	    --range-input-control-background-color--focused: rgba(55, 61, 71, 0.5);
	    --range-input-control-font-color: rgba(255, 255, 255, 1.0);
	    --range-input-control-selection-color:rgba(0, 0, 0, 0.5);
	    --range-input-control-progress-color:rgba(37, 43, 48, 1.0);
	    --text-input-control-background-color: rgba(55, 61, 71, 0.6);
	    --text-input-control-background-color--focused: rgba(55, 61, 71, 0.5);
	    --text-input-control-font-color: rgba(255, 255, 255, 1.0);
	    --text-input-control-selection-color:rgba(0, 0, 0, 0.5);
	}

	[data-theme="light"]{
	    --base-background-color: rgba(217, 214, 205, 1.0);
	    --thumb-border-color: rgba(255, 255, 255, 0.7);
	    --color-wheel-control-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.45) inset;
	    --brightness-control-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25) inset;
	    --input-controls-tab-header-background-color: rgba(221, 218, 210, 1.0);
	    --input-controls-tab-header-font-color: rgba(35, 35, 35, 1.0);
	    --input-controls-tab-background-color: rgba(122, 122, 122, 0.1);
	    --range-input-control-background-color: rgba(221, 218, 210, 0.6);
	    --range-input-control-background-color--focused: rgba(222, 220, 220, 0.5);
	    --range-input-control-font-color: rgba(35, 35, 35, 1.0);
	    --range-input-control-selection-color:rgba(255, 255, 255, 0.5);
	    --range-input-control-progress-color:rgba(228, 228, 228, 1.0);
	    --text-input-control-background-color: rgba(221, 218, 210, 0.6);
	    --text-input-control-background-color--focused: rgba(222, 220, 220, 0.5);
	    --text-input-control-font-color: rgba(35, 35, 35, 1.0);
	    --text-input-control-selection-color:rgba(255, 255, 255, 0.5);
	}

	.color-picker{
	    position: absolute;
	    top: 50%;
	    left: 50%;
	    transform: translate(-50%, -50%);
	    width: 180px;
	    height: auto;
	    min-height: 226px;
	    background: var(--base-background-color);
	    border-radius: 5px;
	    -webkit-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 
	                            0px 2px 2px 0px rgba(0, 0, 0, 0.14), 
	                                0px 1px 5px 0px rgba(0,0,0,.12);
	    -moz-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 
	                        0px 2px 2px 0px rgba(0, 0, 0, 0.14), 
	                            0px 1px 5px 0px rgba(0,0,0,.12);
	    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 
	                    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 
	                        0px 1px 5px 0px rgba(0,0,0,.12);
	    z-index: 1000;
	}
	.color-picker-controls{
	    position: relative;
	    width: 100%;
	    height: auto;
	    display: flex;
	    flex-direction: column;
	}
	.color-picker-controls-group{
	    position: relative;
	    display: block;
	    width: 100%;
	    padding: 10px;
	}

	.color-picker-wheel-control {
	    position: relative;
	    display: flex;
	    flex-direction: row;
	    height: 100%;
	    width: 140px;
	    border: none;
	}
	.color-picker-wheel-control::after {
	    content: '';
	    position: absolute;
	    display: block;
	    top: 0;
	    left: 0;
	    width: 100%;
	    height: 100%;
	    border: 1px solid var(--base-background-color);
	    border-radius: 50%;
	    -webkit-box-shadow: var(--color-wheel-control-box-shadow);
	    -moz-box-shadow: var(--color-wheel-control-box-shadow);
	    box-shadow: var(--color-wheel-control-box-shadow);
	    margin: -1px;
	    pointer-events: none;
	}
	.color-picker-brightness-control {
	    position: relative;
	    display: flex;
	    flex-direction: row;
	    height: 100%;
	    width: 8px;
	    border: 1px solid transparent;
	    border-radius: 3px;
	    margin-left: 10px;
	}
	.color-picker-brightness-control::after {
	    content: '';
	    position: absolute;
	    display: block;
	    top: 0;
	    left: 0;
	    width: 100%;
	    height: 100%;
	    border-radius: 3px;
	    -webkit-box-shadow: var(--brightness-control-box-shadow);
	    -moz-box-shadow: var(--brightness-control-box-shadow);
	    box-shadow: var(--brightness-control-box-shadow);
	    pointer-events: none;
	}
	.color-picker-wheel-control-thumb,
	.color-picker-brightness-control-thumb {
	    position: absolute;
	    display: block;
	    width: 10px;
	    height: 10px;
	    border: 1px solid var(--thumb-border-color);
	    border-radius: 50%;
	    -webkit-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 
	                            0px 2px 2px 0px rgba(0, 0, 0, 0.14), 
	                                0px 1px 5px 0px rgba(0, 0, 0, .12);
	    -moz-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 
	                        0px 2px 2px 0px rgba(0, 0, 0, 0.14), 
	                            0px 1px 5px 0px rgba(0, 0, 0, .12);
	    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 
	                    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 
	                        0px 1px 5px 0px rgba(0, 0, 0, .12);
	    cursor: pointer;
	    z-index: 1000;
	}
	.wheel-canvas,
	.brightness-canvas {
	    width: 100%;
	    height: 100%;
	    border-radius: 3px;
	}

	.color-picker-input-controls{
	    position: relative;
	    width: 100%;
	    height: 100%;
	    display: flex;
	    flex-direction: column;
	    background: var(--input-controls-tab-background-color);
	    border-radius: 3px;
	    overflow: hidden;
	}
	.color-picker-input-controls-tab-headers{
	    position: relative;
	    display: flex;
	    flex-direction: row;
	    width: 100%;
	    height: 25px;
	    overflow: hidden;
	}
	.color-picker-input-controls-tab-headers button{
	    position: relative;
	    display: block;
	    width: 33.33%;
	    height: 100%;
	    background: var(--input-controls-tab-header-background-color);
	    font-size: 9px;
	    color: var(--input-controls-tab-header-font-color);
	    border: none;
	    outline: none;
	}
	.color-picker-input-controls-tab-headers button.selected{
	    background: none;
	}
	.color-picker-input-controls-tabs{
	    position: relative;
	    display: block;
	    width: 100%;
	    height: auto;
	    padding: 4px;
	}
	.color-picker-input-controls-tab{
	    position: relative;
	    display: flex;
	    flex-direction: column;
	}
	.color-picker-input-controls-tab:not(.selected){
	    display: none;
	}


	input{
	    font-size: 100%;
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
	    -webkit-appearance: none;
	    margin: 0;
	}
	input[type=number] {
	    -moz-appearance: textfield;
	}

	.range-input-control{
	    position: relative;
	    display: block;
	    width: 100%;
	    height: auto;
	    min-height: 20px;
	    margin: 1px 0 0 0;
	    background: var(--range-input-control-background-color);
	    font-size: 10px;
	    cursor: ew-resize;
	    overflow: hidden;
	}
	.range-input-control:hover,
	.range-input-control.range-input-control--focused{
	    background: var(--range-input-control-background-color--focused);
	}
	.range-input-control:first-child{
	    border-top-left-radius: 3px;
	    border-top-right-radius: 3px;
	}
	.range-input-control:last-child{
	    border-bottom-left-radius: 3px;
	    border-bottom-right-radius: 3px;
	}
	.range-input-control .range-input-enter-block,
	.range-input-control .range-input-details-block{
	    position: absolute;
	    display: block;
	    top: 0;
	    left: 0;
	    right: 0;
	    bottom: 0;
	}
	.range-input-control:not(.range-input-control--key-input-mode) .range-input-enter-block{
	    display: none;
	}
	.range-input-control.range-input-control--key-input-mode .range-input-enter-block{
	    display: block;
	}
	.range-input-control:not(.range-input-control--key-input-mode) .range-input-details-block{
	    display: block;
	}
	.range-input-control.range-input-control--key-input-mode .range-input-details-block{
	    display: none;
	}
	.range-input-control input{
	    position: absolute;
	    display: block;
	    top: 50%;
	    transform: translate(0, -50%);
	    width: 100%;
	    height: auto;
	    background: none;
	    border: none;
	    color: var(--range-input-control-font-color);
	    text-align: center;
	    outline: none;
	}

	.range-input-control input::-moz-selection { background: var(--range-input-control-selection-color); }
	.range-input-control input::selection { background: var(--range-input-control-selection-color); }
	.range-input-control .range-input-progress{
	    position: absolute;
	    display: block;
	    top: 0;
	    left: 0;
	    height: 100%;
	    background: var(--range-input-control-progress-color);
	}
	.range-input-control .range-input-label,
	.range-input-control .range-input-value{
	    position: absolute;
	    display: block;
	    top: 50%;
	    width: auto;
	    height: auto;
	    transform: translate(0, -50%);
	    color: var(--range-input-control-font-color);
	    pointer-events: none;
	}
	.range-input-control .range-input-label{
	    left: 5px;
	}
	.range-input-control .range-input-value{
	    right: 5px;
	}


	.text-input-control{
	    position: relative;
	    display: block;
	    width: 100%;
	    height: auto;
	    min-height: 20px;
	    background: var(--text-input-control-background-color);
	    font-size: 10px;
	    margin: 1px 0 0 0;
	    cursor: text;
	    overflow: hidden;
	}
	.text-input-control:hover,
	.text-input-control.text-input-control--focused{
	    background: var(--text-input-control-background-color--focused);
	}
	.text-input-control:first-child{
	    border-top-left-radius: 3px;
	    border-top-right-radius: 3px;
	}
	.text-input-control:last-child{
	    border-bottom-left-radius: 3px;
	    border-bottom-right-radius: 3px;
	}
	.text-input-control .text-input-enter-block,
	.text-input-control .text-input-details-block{
	    position: absolute;
	    display: block;
	    top: 0;
	    left: 0;
	    right: 0;
	    bottom: 0;
	}
	.text-input-control:not(.text-input-control--focused) .text-input-enter-block{
	    display: none;
	}
	.text-input-control.text-input-control--focused .text-input-enter-block{
	    display: block;
	}
	.text-input-control:not(.text-input-control--focused) .text-input-details-block{
	    display: block;
	}
	.text-input-control.text-input-control--focused .text-input-details-block{
	    display: none;
	}
	.text-input-control input{
	    position: absolute;
	    display: block;
	    top: 50%;
	    transform: translate(0, -50%);
	    width: 100%;
	    height: auto;
	    background: none;
	    color: var(--text-input-control-font-color);
	    text-align: center;
	    border: none;
	    outline: none;  
	}
	.text-input-control input::-moz-selection { background:var(--text-input-control-selection-color); }
	.text-input-control input::selection { background:var(--text-input-control-selection-color); }
	.text-input-control .text-input-label,
	.text-input-control .text-input-value{
	    position: absolute;
	    display: block;
	    top: 50%;
	    width: auto;
	    height: auto;
	    transform: translate(0, -50%);
	    color: var(--text-input-control-font-color);
	    pointer-events: none;
	}
	.text-input-control .text-input-label{
	    left: 5px;
	}
	.text-input-control .text-input-value{
	    right: 5px;
	}
	`

	let stylesheet = document.createElement('style')
	stylesheet.innerHTML = style 
	document.head.appendChild(stylesheet)
}


//============================================================
//
// Copyright (C) 2022 Ivan Matveev
//
// Permission is hereby granted, free of charge, to any
// person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the
// Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute,
// sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice
// shall be included in all copies or substantial portions
// of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY
// OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
// LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
// EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
// AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
// OR OTHER DEALINGS IN THE SOFTWARE.
//
// See https://github.com/ivanvmat/color-picker
//============================================================


/**
 * Color picker control creation function
*/
InputWidget.Color.prototype.colorPickerControl = function() {
    // copying configuration values
    let config = {
        container: this.pickerDiv,
        theme: 'light',
        useAlpha: true,
        color: {
            r: 255,
            g: 255,
            b: 255
        }
    }

    // private variables
    let self = this,
        controls = {
            color_wheel: null,
            brightness_slider: null,
            tab_selection_buttons: null,
            red_input: null,
            green_input: null,
            blue_input: null,
            hue_input: null,
            saturation_input: null,
            brightness_input: null,
            hex_input: null,
            alpha_input: null,  
        },
        eventHandlers = {
            color_change: null,
            color_wheel_change: null,
            brightness_slider_change: null,
            tab_selection_change: null,
            hue_input_change: null,
            saturation_input_change: null,
            brightness_input_change: null,
            red_input_change: null,
            green_input_change: null,
            blue_input_change: null,
            alpha_input_change: null,
            hex_input_change: null,
        },
        utils = {
            
            /**
             * Converts Hex spectrum to RGB
             * 
             * @param hex Hex value
             * 
             * @returns {Array} Array with RGB values
             */
            hexToRgb: function ( hex ) {
                let r,g,b;
                hex = hex.trim().toLowerCase().replace(/ /g, '').replace(/[^A-Za-z0-9\s]/g,'');
                r = hex.charAt(0) + '' + hex.charAt(1);
                g = hex.charAt(2) + '' + hex.charAt(3);
                b = hex.charAt(4) + '' + hex.charAt(5);
                r = parseInt( r,16 );
                g = parseInt( g,16 );
                b = parseInt( b ,16);
                return [
                    r, 
                    g, 
                    b 
                ];
            },
            /**
             * Gets the size of the element and its position relative to the viewport and scroll offset
             * 
             * @param el Html element
             * 
             * @returns {Object} Size and position of the element
             */
            getBoundingBox: function(el){
            	console.log(el)
                let rect = el.getBoundingClientRect();
                return { top: rect.top + (window.pageYOffset || document.documentElement.scrollTop), left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft), width: rect.width, height: rect.height  };
            },
            /**
             * Converts degrees to radians
             * 
             * @param degrees Angle value in degrees
             * 
             * @returns {Number} Angle value in radians
             */
            degreesToRadians: function(degrees) {
                return degrees * (Math.PI / 180);
            },
            /**
             * Counts the number of decimal places
             * 
             * @param value Value
             * 
             * @returns {Number} Number of decimal places in the specified value
             */
            countDecimals: function (value) {
                if(Math.floor(value.valueOf()) === value.valueOf()) return 0;
                return value.toString().split(".")[1].length || 0; 
            },
            /**
             * Rounds value to specified number of decimal places
             * 
             * @param value Value
             * @param places Number of decimal places
             * 
             * @returns {Number} Rounded value
             */
            round: function(value, places) {
                let res = Number(Math.round(value + 'e' + places) + 'e-' + places);
                return !isNaN(res) ? res : 0;
            }
        },
        eventListeners = {
            open: [],
            change: [],
            close: []
        };

    // properties
    this.root = document.createElement('div');
    //this.container = config.container;
    let _is_open = true;
    Object.defineProperty(self, 'isOpen', {
        get: function() { 
            return _is_open; 
        },
        set: function(v){
            if(v != null){
                // update property value
                _is_open = v;
                // show or hide control based on new value
                self.root.style.visibility = _is_open ? 'visible' : 'collapse';       
                // trigger open or close event based on the new value
                emit(_is_open ? 'open' : 'close', self);
            }
        },
        enumerable: true,
        configurable: true
    });
    let _color = new HSVaColor().fromRGBa(config.color.r || 255, config.color.g || 255, config.color.b || 255);
    Object.defineProperty(self, 'color', {
        get: function() { 
            return _color; 
        },
        set: function(v){
            if(v instanceof HSVaColor){
                // dispose old color
                _color.dispose();
                // update property value
                _color = v;
                // trigger color change event
                emit('change', self.value);
            }
        },
        enumerable: true,
        configurable: true
    });


    /**
     * Event emitter function
     * 
     * @param {String} event Event name 
     * @param {...Any} args Argument list
     */
    let emit = function(event, ...args) {
        eventListeners[event].forEach(cb => cb(...args, self));
    }

    /**
     * Event subscribe function
     * 
     * @param {String} event Event name 
     * @param {Function} fn Function
     */
    this.on = function(event, fn) {
        eventListeners[event] = eventListeners[event] || [];
        eventListeners[event].push(fn);
        return this;
    }

    /**
     * Event unsubscribe function
     * 
     * @param {String} event Event name 
     * @param {Function} fn Function  
     */
    this.off = function(event, fn) {
        const functions = (eventListeners[event] || []);
        const index = functions.indexOf(fn);
        if (~index)
            functions.splice(index, 1);
        return this;
    }

    /**
     * Control initialization function.
     * 
     * Creates a color picker and adds it to the container. Binds events to ui.
     */
    let init = function () {
        // create root element
        self.root.innerHTML = `
            <div class="color-picker"> 
            <div class="color-picker-controls">
                <div class="color-picker-controls-group" style="display: flex; flex-direction: row;height: 160px;">
                    <div class="color-picker-wheel-control" style="height:100%; width:100%;">
                        <canvas id="wheel-canvas" class="wheel-canvas" height="140px" width="140px"></canvas>
                        <div class="color-picker-wheel-control-thumb" style="top:50%; left: 50%;"></div>
                    </div>
                    <div class="color-picker-brightness-control">
                        <canvas id="brightness-canvas" class="brightness-canvas"></canvas>
                        <div class="color-picker-brightness-control-thumb" style="bottom: 0; left: 50%;"></div>
                    </div>
                </div>
                <div class="color-picker-controls-group" style="flex: 1; padding-top: 0;">
                    <div class="color-picker-input-controls">
                        <div class="color-picker-input-controls-tab-headers">
                            <button data-tab="rgb">RGB</button>
                            <button data-tab="hsv" class="selected">HSV</button>
                            <button data-tab="hex">HEX</button>
                        </div>
                        <div class="color-picker-input-controls-tabs">
                            <div class="color-picker-input-controls-tab" data-tab="rgb">
                                <div class="color-picker-red-input range-input-control" data-value="0" data-step="0.01" data-min="0" data-max="255">
                                    <div class="range-input-enter-block">
                                        <input class="range-input" type="number">
                                    </div>
                                    <div class="range-input-details-block">
                                        <span class="range-input-progress"></span>
                                        <span class="range-input-label">R:</span>
                                        <span class="range-input-value">0.00</span>
                                    </div>
                                </div>
                                <div class="color-picker-green-input range-input-control" data-value="0" data-step="0.01" data-min="0" data-max="255">
                                    <div class="range-input-enter-block">
                                        <input class="range-input" type="number">
                                    </div>
                                    <div class="range-input-details-block">
                                        <span class="range-input-progress"></span>
                                        <span class="range-input-label">G:</span>
                                        <span class="range-input-value">0.00</span>
                                    </div>
                                </div>
                                <div class="color-picker-blue-input range-input-control" data-value="0" data-step="0.01" data-min="0" data-max="255">
                                    <div class="range-input-enter-block">
                                        <input class="range-input" type="number">
                                    </div>
                                    <div class="range-input-details-block">
                                        <span class="range-input-progress"></span>
                                        <span class="range-input-label">B:</span>
                                        <span class="range-input-value">0.00</span>
                                    </div>
                                </div>
                            </div>
                            <div class="color-picker-input-controls-tab selected" data-tab="hsv">
                                <div class="color-picker-hue-input range-input-control" data-value="0" data-step="0.01" data-min="0" data-max="360">
                                    <div class="range-input-enter-block">
                                        <input class="range-input" type="number">
                                    </div>
                                    <div class="range-input-details-block">
                                        <span class="range-input-progress"></span>
                                        <span class="range-input-label">H:</span>
                                        <span class="range-input-value">0.00</span>
                                    </div>
                                </div>
                                <div class="color-picker-saturation-input range-input-control" data-value="0" data-step="0.01" data-min="0" data-max="100">
                                    <div class="range-input-enter-block">
                                        <input class="range-input" type="number">
                                    </div>
                                    <div class="range-input-details-block">
                                        <span class="range-input-progress"></span>
                                        <span class="range-input-label">S:</span>
                                        <span class="range-input-value">0.00</span>
                                    </div>
                                </div>
                                <div class="color-picker-brightness-input range-input-control" data-value="0" data-step="0.01" data-min="0" data-max="100">
                                    <div class="range-input-enter-block">
                                        <input class="range-input" type="number">
                                    </div>
                                    <div class="range-input-details-block">
                                        <span class="range-input-progress"></span>
                                        <span class="range-input-label">V:</span>
                                        <span class="range-input-value">0.00</span>
                                    </div>
                                </div>
                            </div>
                            <div class="color-picker-input-controls-tab" data-tab="hex">
                                <div class="color-picker-hex-input text-input-control" data-value="000000" data-is-alphanumeric="true">
                                    <div class="text-input-enter-block">
                                        <input class="text-input" type="text">
                                    </div>
                                    <div class="text-input-details-block">
                                        <span class="text-input-label">Hex:</span>
                                        <span class="text-input-value">000000</span>
                                    </div>
                                </div>
                            </div>` + 
                            ((config.useAlpha) ?
                                `<div class="color-picker-alpha-input range-input-control" data-value="255" data-step="0.01" data-min="0" data-max="255">
                                    <div class="range-input-enter-block">
                                        <input class="range-input" type="number">
                                    </div>
                                    <div class="range-input-details-block">
                                        <span class="range-input-progress"></span>
                                        <span class="range-input-label">A:</span>
                                        <span class="range-input-value">0.00</span>
                                    </div>
                                </div>` : ``)
                        + `</div>
                    </div>
                </div>
            </div>
        </div>`.trim();
        // add root element to container
        self.container.appendChild(self.root);

        // set theme
        self.root.dataset.theme = config.theme;

        // set isOpen state
        self.isOpen = config.isOpen;

        console.log("ready to create color wheel")

        // initialize control to manipulate hue and saturation values
        controls.color_wheel = new ColorWheelControl({ color_picker: self }); 
        controls.color_wheel.values.hue = self.color.h;
        controls.color_wheel.values.saturation = self.color.s;

        console.log("ready to create brightness slider")

        // initialize control to manipulate brightness value
        controls.brightness_slider = new BrightnessSliderControl({ color_picker: self });
        controls.brightness_slider.value = self.color.v;

        // get tab selection buttons list
        controls.tab_selection_buttons = self.root.querySelectorAll('.color-picker-input-controls-tab-headers button');

        // initialize controls to manipulate rgb channels of color
        controls.red_input = new NumberInputControl(self.root.querySelector('.color-picker-red-input'));
        controls.green_input = new NumberInputControl(self.root.querySelector('.color-picker-green-input'));
        controls.blue_input = new NumberInputControl(self.root.querySelector('.color-picker-blue-input'));
        let rgb = utils.hsvToRgb(self.color.h, self.color.s, self.color.v);
        controls.red_input.value = rgb[0];
        controls.green_input.value = rgb[1];
        controls.blue_input.value = rgb[2];

        // initialize controls to manipulate hsv channels of color
        controls.hue_input = new NumberInputControl(self.root.querySelector('.color-picker-hue-input'));
        controls.hue_input.value = self.color.h;
        controls.saturation_input = new NumberInputControl(self.root.querySelector('.color-picker-saturation-input'));
        controls.saturation_input.value = self.color.s;
        controls.brightness_input = new NumberInputControl(self.root.querySelector('.color-picker-brightness-input'));
        controls.brightness_input.value = self.color.v;
        
        // initialize control to manipulate hex value of color
        controls.hex_input = new TextInputControl(self.root.querySelector('.color-picker-hex-input'));
        let hex = utils.hsvToHex(self.color.h, self.color.s, self.color.v); 
        controls.hex_input.value = hex.join('').toUpperCase();
        
        // initialize control to manipulate alpha channel of color
        if(config.useAlpha){
            controls.alpha_input = new NumberInputControl(self.root.querySelector('.color-picker-alpha-input'));
            controls.alpha_input.value = self.color.a;
        }

        // bind events to ui
        bindEvents();
    };

    /**
     * Event binding function
     */
    let bindEvents = function () {
        // create click event handler for tab switching buttons
        eventHandlers.tab_selection_change = function(e){     
            // reset the selected state of the buttons
            controls.tab_selection_buttons.forEach(e => e.classList.remove('selected'));
            self.root.querySelectorAll('.color-picker-input-controls-tab').forEach(e => e.classList.remove('selected'));
            // set the selected state to the current button
            e.target.classList.add("selected");
            // set the selected state to the current tab
            self.root.querySelector('.color-picker-input-controls-tab[data-tab="' + e.target.dataset.tab  + '"]').classList.add('selected');
        };
        // add a click event handler to the tab switch buttons
        controls.tab_selection_buttons.forEach(button => button.addEventListener('click', eventHandlers.tab_selection_change));

        // create a color change event handler
        eventHandlers.color_change = () => self.update();
        // add change event handler to color
        self.color.on('change', eventHandlers.color_change);

        // create change event handler for color wheel control  
        eventHandlers.color_wheel_change = function(values){
            // set new hue value
            self.color.h = values.hue;
            // set new saturation value
            self.color.s = values.saturation;
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to color wheel control
        controls.color_wheel.on('change', eventHandlers.color_wheel_change);

        // create change event handler for brightness slider control  
        eventHandlers.brightness_slider_change = function(value){
            // set new brightness value
            self.color.v = value;
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to brightness slider control
        controls.brightness_slider.on('change', eventHandlers.brightness_slider_change);

        // create change event handler for hue input control  
        eventHandlers.hue_input_change = function(value){
            // set new hue value
            self.color.h = value;
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to hue input control
        controls.hue_input.on('change', eventHandlers.hue_input_change);

        // create change event handler for saturation input control  
        eventHandlers.saturation_input_change = function(value){
            // set new saturation value
            self.color.s = value;
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to saturation input control
        controls.saturation_input.on('change', eventHandlers.saturation_input_change);

        // create change event handler for brightness input control  
        eventHandlers.brightness_input_change = function(value){
            // set new brightness value
            self.color.v = value;
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to brightness input control
        controls.brightness_input.on('change', eventHandlers.brightness_input_change);
    
        // create change event handler for red input control     
        eventHandlers.red_input_change = function(value){    
            // convert rgb color data to hsv
            let hsv = utils.rgbToHsv(controls.red_input.value, controls.green_input.value, controls.blue_input.value);
            // set new hue value
            self.color.h = hsv[0];
            // set new saturation value
            self.color.s = hsv[1];
            // set new brightness value
            self.color.v = hsv[2];
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to red input control
        controls.red_input.on('change', eventHandlers.red_input_change);

        // create change event handler for green input control 
        eventHandlers.green_input_change = function(value){
            // convert rgb color data to hsv
            let hsv = utils.rgbToHsv(controls.red_input.value, controls.green_input.value, controls.blue_input.value);
            // set new hue value
            self.color.h = hsv[0];
            // set new saturation value
            self.color.s = hsv[1];
            // set new brightness value
            self.color.v = hsv[2];
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to green input control
        controls.green_input.on('change', eventHandlers.green_input_change);

        // create change event handler for blue input control 
        eventHandlers.blue_input_change = function(value){
            // convert rgb color data to hsv
            let hsv = utils.rgbToHsv(controls.red_input.value, controls.green_input.value, controls.blue_input.value);
            // set new hue value
            self.color.h = hsv[0];
            // set new saturation value
            self.color.s = hsv[1];
            // set new brightness value
            self.color.v = hsv[2];
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to blue input control
        controls.blue_input.on('change', eventHandlers.blue_input_change);
        
        // create change event handler for hex input control 
        eventHandlers.hex_input_change = function(value){
            // get color hex value
            let hex = controls.hex_input.value.trim().toLowerCase().replace(/ /g, '').replace(/[^A-Za-z0-9\s]/g,'');
            // convert hex color data to hsv
            let hsv = utils.hexToHsv(hex.padEnd(6, "0"));
            // set new hue value
            self.color.h = hsv[0] || 0;
            // set new saturation value
            self.color.s = hsv[1] || 0;
            // set new brightness value
            self.color.v = hsv[2] || 0;
            // update control
            self.update();
            // trigger color change event
            emit('change', self.color);
        };
        // add change event handler to change event listener of hex input control
        controls.hex_input.on('change', eventHandlers.hex_input_change);

        if(config.useAlpha){
            // create change event handler for alpha input control 
            eventHandlers.alpha_input_change = function(value){
                // set new alpha value
                self.color.a = value;
                // update control
                self.update();
                // trigger color change event
                emit('change', self.color);
            };
            // add change event handler to alpha input control
            controls.alpha_input.on('change', eventHandlers.alpha_input_change);
        }
    }

    /**
     * Event unbinding function
     */
    let unbindEvents = function () {
        // remove click event handler from tab switching buttons
        controls.tab_selection_buttons.forEach(button => button.removeEventListener('click', eventHandlers.tab_selection_change));
        // remove change event handler from color
        self.color.off('change', eventHandlers.color_change);
        // remove change event handler from color wheel control
        controls.color_wheel.off('change', eventHandlers.color_wheel_change);
        // remove change event handler from brightness slider control
        controls.brightness_slider.off('change', eventHandlers.brightness_slider_change);
        // remove change event handler from hue input control
        controls.hue_input.off('change', eventHandlers.hue_input_change);
        // remove change event handler from saturation input control
        controls.saturation_input.off('change', eventHandlers.saturation_input_change);
        // remove change event handler from brightness input control
        controls.brightness_input.off('change', eventHandlers.brightness_input_change);
        // remove change event handler from red input control
        controls.red_input.off('change', eventHandlers.red_input_change);
        // remove change event handler from green input control
        controls.green_input.off('change', eventHandlers.green_input_change);
        // remove change event handler from blue input control
        controls.blue_input.off('change', eventHandlers.blue_input_change);
        // remove change event handler from hex input control
        controls.hex_input.off('change', eventHandlers.hex_input_change);
        // remove change event handler from alpha input control
        if(config.useAlpha)
            controls.alpha_input.off('change', eventHandlers.alpha_input_change);
    }

    /**
     * Control opening function
     */
    this.open = () => this.isOpen = true;

    /**
     * Control closing function
     */
    this.close = () => this.isOpen = false;

    /**
     * Control content update function
     */
    this.update = function () {
        // unbind events from control
        unbindEvents();

        // update color wheel control values
        controls.color_wheel.values.hue = self.color.h;
        controls.color_wheel.values.saturation = self.color.s;

        // update brightness slider control value
        controls.brightness_slider.value = self.color.v;

        // update hsv input controls values
        controls.hue_input.value = self.color.h;
        controls.saturation_input.value = self.color.s;
        controls.brightness_input.value = self.color.v;

        // update rgb input controls values
        let rgb = utils.hsvToRgb(self.color.h, self.color.s, self.color.v);
        controls.red_input.value = rgb[0];
        controls.green_input.value = rgb[1];
        controls.blue_input.value = rgb[2];

        // update hex input control value
        let hex = utils.hsvToHex(self.color.h, self.color.s, self.color.v); 
        controls.hex_input.value = hex.join('').toUpperCase();

        // update alpha input control value
        if(config.useAlpha)
            controls.alpha_input.value = self.color.a;

        // bind events to control
        bindEvents();
    };

    /**
     * Control dispose function
     */
    this.dispose = function () {
        // unbind events 
        unbindEvents();

        // dispose properties
        this.isOpen = null;
        _is_open = null;
        this.color.dispose();
        this.color = null;
        _color = null;
        this.root.parentNode.removeChild(this.root);
        this.root = null;
        this.container = null;

        // dispose event handlers
        eventHandlers.color_change = null;
        eventHandlers.tab_selection_change = null;
        eventHandlers.color_wheel_change = null;
        eventHandlers.brightness_slider_change = null;
        eventHandlers.hue_input_change = null;
        eventHandlers.saturation_input_change = null;
        eventHandlers.brightness_input_change = null;
        eventHandlers.red_input_change = null;
        eventHandlers.green_input_change = null;
        eventHandlers.blue_input_change = null;
        eventHandlers.alpha_input_change = null;
        eventHandlers.hex_input_change = null;

        // dispose event listeners
        eventListeners.open.splice(0, eventListeners.open.length);
        eventListeners.open = null;
        eventListeners.change.splice(0, eventListeners.change.length);
        eventListeners.change = null;
        eventListeners.close.splice(0, eventListeners.close.length);
        eventListeners.close = null;

        //dispose controls
        controls.color_wheel.dispose();
        controls.color_wheel = null;
        controls.brightness_slider.dispose();
        controls.brightness_slider = null;
        controls.tab_selection_buttons = null;
        controls.red_input.dispose();
        controls.red_input = null;
        controls.green_input.dispose();
        controls.green_input = null;
        controls.blue_input.dispose();
        controls.blue_input = null;
        controls.hue_input.dispose();
        controls.hue_input = null;
        controls.saturation_input.dispose();
        controls.saturation_input = null;
        controls.brightness_input.dispose();
        controls.brightness_input = null;
        controls.hex_input.dispose();
        controls.hex_input = null;
        if(config.useAlpha)
            controls.alpha_input.dispose();
        controls.alpha_input = null;

        // dispose variables   
        config = null;
        self = null;
        controls = null;
        eventHandlers = null;
        eventListeners = null;
        utils = null;

        // dispose functions
        emit = null;
        init = null;
        bindEvents = null;
        unbindEvents = null;

        // dispose all object members
        for (var member in this) delete this[member];
    };


    /**
     * HSVa color representation model
     * 
     * @param {Number} h Hue value (the hue in the set [0, 360])
     * @param {Number} s Saturation value (the saturation in the set [0, 100])
     * @param {Number} v Brightness value (the brightness in the set [0, 100])
     * @param {Number} a Alpha value (the alpha in the set [0, 255])
     */
    function HSVaColor(h = 360, s = 0, v = 100, a = 255) {
        // properties
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;

        // private variables
        let eventListeners = {
            change: [],
        };


        /**
         * Event emitter function
         * 
         * @param {String} event Event name 
         * @param {...Any} args Argument list
         */
        let emit = function(event, ...args) {
            eventListeners[event].forEach(cb => cb(...args, self));
        }

        /**
         * Event subscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function
         */
        this.on = function(event, fn) {
            eventListeners[event] = eventListeners[event] || [];
            eventListeners[event].push(fn);
            return this;
        }

        /**
         * Event unsubscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function  
         */
        this.off = function(event, fn) {
            const functions = (eventListeners[event] || []);
            const index = functions.indexOf(fn);
            if (~index)
                functions.splice(index, 1);
            return this;
        } 


        /**
         * Creates color from HSVa data
         * 
         * @param {Number} h Hue value
         * @param {Number} s Saturation value
         * @param {Number} v Brightness value
         * @param {Number} a Alpha value
         * 
         * @returns HSVa color representation model
         */
         this.fromHSVa = function( h = 0, s = 0, v = 0, a = 255) {
            this.h = h;
            this.s = s;
            this.v = v;
            this.a = a;
            emit('change', this);
            return this;
        };
        /**
         * Gets color data in HSV representation
         * 
         * @returns HSV color data as an array with the values ​​of each channel
         */
        this.toHSV = function() {
            let mapper = (original, next) => (precision = -1) => {
                return next(~precision ? original.map(v => Number(v.toFixed(precision))) : original);
            };
            let hsv = [this.h, this.s, this.v];
            hsv.toString = mapper(hsv, arr => `hsv(${arr[0]}, ${arr[1]}%, ${arr[2]}%)`);
            return hsv;
        };
        /**
         * Gets color data in HSVa representation
         * 
         * @returns HSVa color data as an array with the values ​​of each channel.
         */
        this.toHSVa = function() {
            let mapper = (original, next) => (precision = -1) => {
                return next(~precision ? original.map(v => Number(v.toFixed(precision))) : original);
            };
            let hsva = [this.h, this.s, this.v, this.a];
            hsva.toString = mapper(hsva, arr => `hsva(${arr[0]}, ${arr[1]}%, ${arr[2]}%, ${this.a})`);
            return hsva;
        };
        /**
         * Creates color from HSLa data
         * 
         * @param {Number} h Hue value
         * @param {Number} s Saturation value
         * @param {Number} l Lightness value
         * @param {Number} a Alpha value
         * 
         * @returns HSVa color representation model
         */
        this.fromHSLa = function(h, s, l, a = 255) {
            let hsv = utils.hslToHsv(h, s, l);
            if(hsv != null){
                this.h = hsv[0] || 0;
                this.s = hsv[1] || 0;
                this.v = hsv[2] || 0;
                this.a = a;
            }
            else{
                console.error('Error while parsing hsl into hsv');
            }
            emit('change', this);
            return this;
        };
        /**
         * Gets color data in HSL representation
         * 
         * @returns HSL color data as an array with the values ​​of each channel
         */
        this.toHSL = function() {
            let mapper = (original, next) => (precision = -1) => {
                return next(~precision ? original.map(v => Number(v.toFixed(precision))) : original);
            };
            let hsl = [...utils.hsvToHsl(this.h, this.s, this.v)];
            hsl.toString = mapper(hsl, arr => `hsl(${arr[0]}, ${arr[1]}%, ${arr[2]}%)`);
            return hsl;
        };
        /**
         * Gets color data in HSLa representation
         * 
         * @returns HSLa color data as an array with the values ​​of each channel
         */
        this.toHSLa = function() {
            let mapper = (original, next) => (precision = -1) => {
                return next(~precision ? original.map(v => Number(v.toFixed(precision))) : original);
            };
            let hsla = [...utils.hsvToHsl(this.h, this.s, this.v), this.a];
            hsla.toString = mapper(hsla, arr => `hsla(${arr[0]}, ${arr[1]}%, ${arr[2]}%, ${this.a})`);
            return hsla;
        };
        /**
         * Creates color from RGBa data
         * 
         * @param {Number} r Red channel value
         * @param {Number} g Green channel value
         * @param {Number} b Blue channel value
         * @param {Number} a Alpha value
         * 
         * @returns HSVa color representation model
         */
        this.fromRGBa = function(r = 0, g = 0, b = 0, a = 255) {
            let hsv = utils.rgbToHsv(r, g, b);
            if(hsv != null){
                this.h = hsv[0] || 0;
                this.s = hsv[1] || 0;
                this.v = hsv[2] || 0;
                this.a = a;
            }
            else{
                console.error('Error while parsing rgb into hsv');
            }
            emit('change', this);
            return this;
        };
        /**
         * Gets color data in RGB representation
         * 
         * @returns RGB color data as an array with the values ​​of each channel
         */
        this.toRGB = function() {
            let mapper = (original, next) => (precision = -1) => {
                return next(~precision ? original.map(v => Number(v.toFixed(precision))) : original);
            };
            let rgb = [...utils.hsvToRgb(this.h, this.s, this.v)];
            rgb.toString = mapper(rgb, arr => `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`);
            return rgb;
        };
        /**
         * Gets color data in RGBa representation
         * 
         * @returns RGBa color data as an array with the values ​​of each channel
         */
        this.toRGBa = function() {
            let mapper = (original, next) => (precision = -1) => {
                return next(~precision ? original.map(v => Number(v.toFixed(precision))) : original);
            };
            let rgba = [...utils.hsvToRgb(this.h, this.s, this.v), this.a];
            rgba.toString = mapper(rgba, arr => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${this.a})`);
            return rgba;
        };
        /**
         * Creates color from HEX data
         * 
         * @param {Number} hex Hex value
         * @param {Number} a Alpha value
         * 
         * @returns HSVa color representation model
         */
        this.fromHEX = function(hex, a = 255) {
            hex = hex.trim().toLowerCase().replace(/ /g, '').replace(/[^A-Za-z0-9\s]/g,'');
            let hsv = utils.hexToHsv(hex.padEnd(6, "0"));
            if(hsv != null){
                this.h = hsv[0] || 0;
                this.s = hsv[1] || 0;
                this.v = hsv[2] || 0;
                this.a = a;
            }
            else{
                console.error('Error while parsing hex into hsv');
            }
            emit('change', this);
            return this;
        };
        /**
         * Gets color data in HEX representation
         * 
         * @returns HEX color data as string
         */
        this.toHEX = function() {
            let hex = utils.hsvToHex(this.h, this.s, this.v);
            return `#${hex.join('').toUpperCase()}`;
        };
        

        /**
         * Control dispose function
         */
        this.dispose = function () {
            // dispose event listeners
            eventListeners.change.splice(0, eventListeners.change.length);
            eventListeners.change = null;

            // dispose functions
            emit = null;

            // dispose all object members
            for (var member in this) delete this[member];
        };
    }
    
    /**
     * Color wheel control creation function
     *
     * @param {Object} color_picker Color picker control
     */
    function ColorWheelControl({ color_picker = null }) {
        // private variables
        let self = this,
            container = color_picker.root.querySelector('.color-picker-wheel-control'),
            canvas = container.querySelector('canvas'),
            intermediateCanvas = document.createElement("canvas"),
            thumb = container.querySelector('.color-picker-wheel-control-thumb'),
            colorGradient,
            isMouseDown = false,
            eventHandlers = {
                thumb_mousedown: null,
                canvas_mousedown: null,
                document_mousemove: null,
                document_mouseup: null,
            },
            eventListeners = {
                change: []
            };

        // properties
        this.values = {};
        let _hue = color_picker.color.h;
        Object.defineProperty(this.values, 'hue', {
            get: function() { 
                return _hue; 
            },
            set: function(v){
                if(v != null){
                    // if the set value is greater than the maximum value, then set the maximum value
                    if(v > 360)
                        v = 360;
                    // if the set value is less than the maximum value, then set the minimum value
                    if(v < 0)
                        v = 0;
                    // update property value
                    _hue = v;
                    // update control
                    self.update();
                }
            },
            enumerable: true,
            configurable: true
        });
        let _saturation = color_picker.color.s;
        Object.defineProperty(this.values, 'saturation', {
            get: function() { 
                return _saturation; 
            },
            set: function(v){
                if(v != null){
                    // if the set value is greater than the maximum value, then set the maximum value
                    if(v > 100)
                        v = 100;
                    // if the set value is less than the maximum value, then set the minimum value
                    if(v < 0)
                        v = 0;
                    // update property value
                    _saturation = v;
                    // update control
                    self.update();
                }
            },
            enumerable: true,
            configurable: true
        });
    

        /**
         * Event emitter  function
         * 
         * @param {String} event Event name 
         * @param {...Any} args Argument list
         */
        let emit = function(event, ...args) {
            eventListeners[event].forEach(cb => cb(...args, self));
        }
    
        /**
         * Event subscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function
         */
        this.on = function(event, fn) {
            eventListeners[event] = eventListeners[event] || [];
            eventListeners[event].push(fn);
            return this;
        }
    
        /**
         * Event unsubscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function  
         */
        this.off = function(event, fn) {
            const functions = (eventListeners[event] || []);
            const index = functions.indexOf(fn);
            if (~index)
                functions.splice(index, 1);
            return this;
        }


        /**
         * Color wheel control initialization function.
         * 
         * Creates and updates control content. Binds events to ui.
         */
        let init = async function () {
            // create color gradient
            await createColorGradient();
            // draw control's canvas
            drawCanvas();
            // update thumb element
            updateThumb();
            // bind events to ui
            bindEvents();
        };

        /**
         * Color gradient creation function.
         * 
         * Creates a color gradient image for later use on the control's canvas.
         */
        let createColorGradient = async function () {
            return new Promise((resolve, reject) => {
                // create temporary canvas element
                let can = document.createElement("canvas");

                // set canvas size
                can.width = can.height = 512;

                // get canvas context
                let ctx = can.getContext("2d");

                // calculate canvas radius
                let radius = can.width / 2;

                // set loop step
                let step = 1 / radius;

                // clear canvas
                ctx.clearRect(0, 0, can.width, can.height);

                // set center points
                let cx = radius;
                let cy = radius;

                // draw hue gradient
                for(let i = 0; i < 360; i += step) {
                    // get angle in radians
                    let rad = i * (2 * Math.PI) / 360;

                    // get line direction from center
                    let x = radius * Math.cos(rad),
                        y = radius * Math.sin(rad);

                    // set stroke style
                    ctx.strokeStyle = 'hsl(' + i + ', 100%, 50%)';

                    // draw color line
                    ctx.beginPath();
                    ctx.moveTo(radius, radius);
                    ctx.lineTo(cx + x, cy + y);
                    ctx.stroke();
                }

                // draw saturation gradient
                let grd = ctx.createRadialGradient(cx,cy,0,cx,cx,radius);
                grd.addColorStop(0,'rgba(255, 255, 255, 1)');
                grd.addColorStop(1,'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();

                // draw circle border
                ctx.beginPath();
                ctx.strokeStyle = "rgb(38, 41, 50)";
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();

                // create image and load canvas result into it
                colorGradient = new Image();
                colorGradient.onload = () => resolve();
                colorGradient.src = can.toDataURL();
            });
        };

        /**
         * Canvas drawing function.
         * 
         * Draws opacity pattern, hue gradient, saturation gradient and brightness layer.
         */
        let drawCanvas = function () {
            // get the size of the main canvas and its position relative to the document
            let canvas_bb = utils.getBoundingBox(canvas);
            console.log("canvas_bb: ")
            console.log(canvas_bb)

            // update main canvas size
            canvas.width = canvas.height = canvas_bb.width;

            // update intermediate canvas size
            intermediateCanvas.width = intermediateCanvas.height = 140//canvas_bb.width;

            // get main canvas context
            let ctx = canvas.getContext("2d");

            // get intermediate canvas context
            let intermediateCtx = intermediateCanvas.getContext("2d");

            // rotate main canvas context to 90 degrees
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.translate(-canvas.width/2, -canvas.height/2);

            // create clipping circle
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.width/2, canvas.width/2, 0, Math.PI*2);
            ctx.clip();
            ctx.closePath();

            // create opacity pattern
            let opacityPattern = document.createElement("canvas");

            // set cell size to 10 pixels
            let cell_size = 10;

            // set the size of the opacity pattern to two cells in height and in width
            opacityPattern.width = cell_size * 2;
            opacityPattern.height = cell_size * 2;

            // get opacity pattern context
            let opacityPatternContext = opacityPattern.getContext("2d");

            // set cells colors
            let cell_1_color = 'rgba(255, 255, 255, 1)', cell_2_color = 'rgba(205, 205,205, 1)';

            // draw first cell
            opacityPatternContext.beginPath();
            opacityPatternContext.fillStyle = cell_1_color;
            opacityPatternContext.fillRect(0, 0, cell_size, cell_size);
            opacityPatternContext.closePath();
            // draw second cell
            opacityPatternContext.beginPath();
            opacityPatternContext.fillStyle = cell_2_color;
            opacityPatternContext.fillRect(cell_size, 0, cell_size, cell_size);
            opacityPatternContext.closePath();
            // draw third cell
            opacityPatternContext.beginPath();
            opacityPatternContext.fillStyle = cell_2_color;
            opacityPatternContext.fillRect(0, cell_size, cell_size, cell_size);
            opacityPatternContext.closePath();
            // draw fourth cell
            opacityPatternContext.beginPath();
            opacityPatternContext.fillStyle = cell_1_color;
            opacityPatternContext.fillRect(cell_size, cell_size, cell_size, cell_size);
            opacityPatternContext.closePath();

            // add opacity pattern on the main canvas context
            let opacity_pattern = ctx.createPattern(opacityPattern, "repeat");

            // draw an opacity pattern on the main canvas
            ctx.beginPath();
            ctx.fillStyle = opacity_pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.closePath(); 

            // draw the border of the color wheel
            ctx.beginPath();
            ctx.strokeStyle = "rgb(217, 214, 205)";
            ctx.arc(canvas.width/2, canvas.width/2, canvas.width/2, 0, Math.PI*2);
            ctx.stroke();
            ctx.closePath();   
            
            console.log("draw color gradient")
            // draw color gradient to intermediate canvas context
            intermediateCtx.drawImage(colorGradient, 0, 0, canvas.width, canvas.height);

            // draw brightness layer to intermediate canvas context
            intermediateCtx.fillStyle = 'rgba(0, 0, 0, ' + Math.abs(1 - (color_picker.color.v / 100)) +')';
            intermediateCtx.fillRect(0, 0,  canvas.width, canvas.height);

            // set transparency level to the main canvas
            ctx.globalAlpha = color_picker.color.a / 255;

            console.log("draw intermediateCanvas")
            // draw intermediate canvas to main canvas context
            ctx.drawImage(intermediateCanvas, 0, 0, canvas.width, canvas.height);
            console.log("intermediateCanvas drawn")
        };

        /**
         * Thumb element updating function.
         * 
         * Positions element and change background color based on hue and saturation values.
         */
        let updateThumb = function () {
            // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
            let canvas_bb = utils.getBoundingBox(canvas);
            let thumb_bb = utils.getBoundingBox(thumb);

            // update thumb background color
            thumb.style.backgroundColor = color_picker.color.toRGB().toString();

            // update thumb position based on hue and saturation values (if it changed outside)
            if(!isMouseDown){
                thumb.style.left = (canvas_bb.width / 2) + ((canvas_bb.width / 2)/100*color_picker.color.s) * Math.cos(utils.degreesToRadians(color_picker.color.h + 90)) - (thumb_bb.width / 2) + 'px';
                thumb.style.top = (canvas_bb.height / 2) + ((canvas_bb.width / 2)/100*color_picker.color.s)  * Math.sin(utils.degreesToRadians(color_picker.color.h + 90)) - (thumb_bb.height / 2) + 'px';
            }

            // update thumb dataset hue and saturation values
            thumb.dataset.value1 = color_picker.color.h;
            thumb.dataset.value2 = color_picker.color.s;
        };

        /**
         * Event binding function
         */
        let bindEvents = function () {
            // create mousedown/touchstart event handler for thumb element
            eventHandlers.thumb_mousedown = function(e){
                // remove document selection before thumb moving
                if (document.selection) {
                    document.selection.empty()
                } else {
                    window.getSelection().removeAllRanges()
                }

                // set isMouseDown flag to true
                isMouseDown = true;
            };
            // add mousedown/touchstart event handler to thumb element
            thumb.addEventListener('mousedown', eventHandlers.thumb_mousedown, true);
            thumb.addEventListener('touchstart', eventHandlers.thumb_mousedown, true);

            // create mousedown/touchstart event handler for canvas element
            eventHandlers.canvas_mousedown = function(e){
                // remove document selection before thumb moving
                if (document.selection) {
                    document.selection.empty()
                } else {
                    window.getSelection().removeAllRanges()
                }

                // set isMouseDown flag to true
                isMouseDown = true;

                // get horizontal and vertical mouse points, relative to the document
                let pageX = e.touches ? e.touches[0].pageX : e.pageX;
                let pageY = e.touches ? e.touches[0].pageY : e.pageY;

                // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
                let canvas_bb = utils.getBoundingBox(canvas);
                let thumb_bb = utils.getBoundingBox(thumb);
                
                // get canvas radius and prepare values to calculation of hue and saturation based on thumb position
                let r = canvas_bb.width / 2,
                    x1 = pageX,
                    y1 = pageY,
                    x2 = (canvas_bb.left + canvas_bb.width / 2),
                    y2 = (canvas_bb.top + canvas_bb.height / 2);

                // calculate angle of vector from control center to thumb element
                let angle = Math.atan2(y1 - y2, x1 - x2) * 360 / (2 * Math.PI) - 90;
                if(angle < 0) angle += 360;
                
                // check if thumb element position outside the color wheel
                if(Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)) > r){
                    // set thumb element position on circle border by angle and radius
                    thumb.style.left = (canvas_bb.width / 2) + r * Math.cos(utils.degreesToRadians(angle + 90)) - (thumb_bb.width / 2) + 'px';
                    thumb.style.top = (canvas_bb.height / 2) + r * Math.sin(utils.degreesToRadians(angle + 90)) - (thumb_bb.height / 2) + 'px';
                }
                else{ // set thumb position by mouse position
                    thumb.style.left = ((pageX - canvas_bb.left) - thumb_bb.width / 2) + 'px';
                    thumb.style.top = ((pageY - canvas_bb.top) - thumb_bb.height / 2) + 'px';
                }

                // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
                canvas_bb = utils.getBoundingBox(canvas);
                thumb_bb = utils.getBoundingBox(thumb);
                
                // calculate length of vector from control center to thumb element
                let dx = ((canvas_bb.left + canvas_bb.width / 2) - (thumb_bb.left + thumb_bb.width / 2)), 
                    dy = ((canvas_bb.top + canvas_bb.height / 2) - (thumb_bb.top + thumb_bb.height / 2)), 
                    scale_length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                
                    // calculate hue and saturation values based on thumb position
                let hue = angle;
                let saturation = Math.min(100, Math.ceil(scale_length / r * 100));
                
                // update control hue and saturation values
                self.values.hue = hue;
                self.values.saturation = saturation;
                
                // update thumb dataset hue and saturation values
                thumb.dataset.value1 = hue;
                thumb.dataset.value2 = saturation;
                
                // trigger change event
                emit('change', self.values);
            };
            // add mousedown/touchstart event handler to canvas element
            canvas.addEventListener('mousedown', eventHandlers.canvas_mousedown, true);
            canvas.addEventListener('touchstart', eventHandlers.canvas_mousedown, true);

            // create mousemove/touchmove event handler for document
            eventHandlers.document_mousemove = function(e){
                // check if isMouseDown flag has true value
                if (isMouseDown) {
                    // prevent scroll
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    // get horizontal and vertical mouse points, relative to the document
                    let pageX = e.touches ? e.touches[0].pageX : e.pageX;
                    let pageY = e.touches ? e.touches[0].pageY : e.pageY;

                    // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
                    let canvas_bb = utils.getBoundingBox(canvas);
                    let thumb_bb = utils.getBoundingBox(thumb);

                    // get canvas radius and prepare values to calculation of hue and saturation based on thumb position
                    let r = canvas_bb.width / 2,
                        x1 = pageX,
                        y1 = pageY,
                        x2 = (canvas_bb.left + canvas_bb.width / 2),
                        y2 = (canvas_bb.top + canvas_bb.height / 2);
                
                    // calculate angle of vector from control center to thumb element
                    let angle = Math.atan2(y1 - y2, x1 - x2) * 360 / (2 * Math.PI) - 90;
                    if(angle < 0) angle += 360;

                    // check if thumb element position outside the color wheel
                    if(Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)) > r){
                        // set thumb element position on circle border by angle and radius
                        thumb.style.left = (canvas_bb.width / 2) + r * Math.cos(utils.degreesToRadians(angle + 90)) - (thumb_bb.width / 2) + 'px';
                        thumb.style.top = (canvas_bb.height / 2) + r * Math.sin(utils.degreesToRadians(angle + 90)) - (thumb_bb.height / 2) + 'px';
                    }
                    else{ // set thumb position by mouse position
                        thumb.style.left = ((pageX - canvas_bb.left) - thumb_bb.width / 2) + 'px';
                        thumb.style.top = ((pageY - canvas_bb.top) - thumb_bb.height / 2) + 'px';
                    }

                    // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
                    canvas_bb = utils.getBoundingBox(canvas);
                    thumb_bb = utils.getBoundingBox(thumb);

                    // calculate length of vector from control center to thumb element
                    let dx = ((canvas_bb.left + canvas_bb.width / 2) - (thumb_bb.left + thumb_bb.width / 2)), 
                        dy = ((canvas_bb.top + canvas_bb.height / 2) - (thumb_bb.top + thumb_bb.height / 2)), 
                        scale_length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                    // calculate hue and saturation values based on thumb position
                    let hue = angle;
                    let saturation = Math.min(100, Math.ceil(scale_length / r * 100));

                    // update control hue and saturation values
                    self.values.hue = hue;
                    self.values.saturation = saturation;

                    // update thumb dataset hue and saturation values
                    thumb.dataset.value1 = hue;
                    thumb.dataset.value2 = saturation;

                    // trigger change event
                    emit('change', self.values);
                }
            };
            // add mousemove/touchmove event handler to document
            document.addEventListener('mousemove', eventHandlers.document_mousemove, true);
            document.addEventListener('touchmove', eventHandlers.document_mousemove, { passive: false });

            // create mouseup/touchend event handler for document
            eventHandlers.document_mouseup = function(e){
                // set isMouseDown flag to false
                isMouseDown = false;
            };
            // add mouseup/touchend event event handler to document
            document.addEventListener('mouseup', eventHandlers.document_mouseup, true);
            document.addEventListener('touchend', eventHandlers.document_mouseup, true);
        }

        /**
         * Event unbinding function
         */
        let unbindEvents = function () {
            // remove event listeners attached to thumb element
            thumb.removeEventListener('mousedown', eventHandlers.thumb_mousedown, false);
            thumb.removeEventListener('touchstart', eventHandlers.thumb_mousedown, false);
            
            // remove event listeners attached to canvas element
            canvas.removeEventListener('mousedown', eventHandlers.canvas_mousedown, false);
            canvas.removeEventListener('touchstart', eventHandlers.canvas_mousedown, false);
            
            // remove event listeners attached to document
            document.removeEventListener('mousemove', eventHandlers.document_mousemove, false);
            document.removeEventListener('touchmove', eventHandlers.document_mousemove, false);
            document.removeEventListener('mouseup', eventHandlers.document_mouseup, false);
            document.removeEventListener('touchend', eventHandlers.document_mouseup, false);
        };

        /**
         * Control content update function
         */
        this.update = function (value) {
            // redraw control's canvas
            drawCanvas();
            // update thumb element
            updateThumb();
        };

        /**
         * Control dispose function
         */
        this.dispose = function () {
            // unbind events from ui
            unbindEvents();

            // dispose properties
            this.values = null;
            _hue = null;
            _saturation = null;  

            // dispose event handlers
            eventHandlers.thumb_mousedown = null;
            eventHandlers.canvas_mousedown = null;
            eventHandlers.document_mousemove = null;
            eventHandlers.document_mouseup = null;

            // dispose event listeners
            eventListeners.change.splice(0, eventListeners.change.length);
            eventListeners.change = null;

            // dispose variables  
            self = null;
            container = null;
            canvas = null; 
            intermediateCanvas = null; 
            thumb = null;
            isMouseDown = null; 
            colorGradient = null;
            eventHandlers = null;
            eventListeners = null;

            // dispose functions
            emit = null;
            init = null;
            createColorGradient = null;
            drawCanvas = null;
            updateThumb = null;
            bindEvents = null;
            unbindEvents = null;

            // dispose all object members
            for (var member in this) delete this[member];
        };

        // run control initialization
        init();
    }
    
    /**
     * Brightness slider control creation function
     *
     * @param {Object} color_picker Color picker control
     */
    function BrightnessSliderControl({ color_picker = null }) {
        // private variables
        let self = this,
            container = color_picker.root.querySelector('.color-picker-brightness-control'),
            canvas = container.querySelector('canvas'),
            thumb = container.querySelector('.color-picker-brightness-control-thumb'),
            isMouseDown = false,
            eventHandlers = {
                thumb_mousedown: null,
                canvas_mousedown: null,
                document_mousemove: null,
                document_mouseup: null,
            },    
            eventListeners = {
                change: []
            };

        // properties
        let _value = color_picker.color.v;
        Object.defineProperty(self, 'value', {
            get: function() { 
                return _value; 
            },
            set: function(v){
                if(v != null){
                    // if the set value is greater than the maximum value, then set the maximum value
                    if(v > 100)
                        v = 100;
                    // if the set value is less than the maximum value, then set the minimum value
                    if(v < 0)
                        v = 0;
                    // update property value
                    _value = v;
                    // update control
                    self.update();
                }
            },
            enumerable: true,
            configurable: true
        });
    

        /**
         * Event emitter  function
         * 
         * @param {String} event Event name 
         * @param {...Any} args Argument list
         */
        let emit = function(event, ...args) {
            eventListeners[event].forEach(cb => cb(...args, self));
        }
    
        /**
         * Event subscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function
         */
        this.on = function(event, fn) {
            eventListeners[event] = eventListeners[event] || [];
            eventListeners[event].push(fn);
            return this;
        }
    
        /**
         * Event unsubscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function  
         */
        this.off = function(event, fn) {
            const functions = (eventListeners[event] || []);
            const index = functions.indexOf(fn);
            if (~index)
                functions.splice(index, 1);
            return this;
        }


        /**
         * Brightness control initialization function.
         * 
         * Creates and updates control content. Binds events to ui.
         */
        let init = function () {
            // draw control's canvas
            drawCanvas();
            // update thumb element
            updateThumb();
            // bind events to ui
            bindEvents();
        };

        /**
         * Canvas drawing function.
         * 
         * Draws brightness gradient.
         */
        let drawCanvas = function () {
            // get the size of the canvas and its position relative to the document
            let canvas_bb = utils.getBoundingBox(canvas);

            // update canvas size
            canvas.width = canvas_bb.width;
            canvas.height = canvas_bb.height;

            // create a canvas gradient
            let gradient = canvas.getContext("2d").createLinearGradient(0, 0, 0, canvas.height);
            
            // get main color data as rgb with brightness equals 100
            let start_color = utils.hsvToRgb(color_picker.color.h, color_picker.color.s, 100);
            let end_color = [0, 0, 0];
            
            // add colors to gradient
            gradient.addColorStop(0, "rgb(" + start_color[0] + "," + start_color[1] + "," + start_color[2] + ")");
            gradient.addColorStop(1, "rgb(" + end_color[0] + "," + end_color[1] + "," + end_color[2] + ")");
            
            // draw gradient on the canvas
            canvas.getContext("2d").fillStyle = gradient;
            canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
        };

        /**
         * Thumb element updating function.
         * 
         * Positions element and change background color based on hue and saturation values.
         */
        let updateThumb = function () {
            // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
            let canvas_bb = utils.getBoundingBox(canvas);
            let thumb_bb = utils.getBoundingBox(thumb);
            
            // update thumb background color 
            thumb.style.backgroundColor = color_picker.color.toRGB().toString();     
            
            // set thumb horizontal position in the center of the brightness scale  
            thumb.style.left = canvas_bb.width / 2 - thumb_bb.width / 2 + 'px';
            
            // update thumb position based on hue value (if it changed outside)  
            if(!isMouseDown) {
                thumb.style.top = - thumb_bb.height/2 + (canvas_bb.height * ((100 - self.value)/100)) + 'px';
            }
            
            // update thumb dataset value
            thumb.dataset.value = self.value;
        };

        /**
         * Event binding function
         */
        let bindEvents = function () {
            // create mousedown/touchstart event handler for thumb element
            eventHandlers.thumb_mousedown = function(e){
                // remove document selection before thumb moving
                if (document.selection) {
                    document.selection.empty()
                } else {
                    window.getSelection().removeAllRanges()
                }

                // set isMouseDown flag to true
                isMouseDown = true;    
            };
            // add mousedown/touchstart event handler to thumb element
            thumb.addEventListener('mousedown', eventHandlers.thumb_mousedown, true);
            thumb.addEventListener('touchstart', eventHandlers.thumb_mousedown, true);

            // create mousedown/touchstart event handler for canvas element
            eventHandlers.canvas_mousedown = function(e){
                // remove document selection before thumb moving
                if (document.selection) {
                    document.selection.empty()
                } else {
                    window.getSelection().removeAllRanges()
                }

                // set isMouseDown flag to true
                isMouseDown = true;

                // get vertical mouse point, relative to the document
                let pageY = e.touches ? e.touches[0].pageY : e.pageY;

                // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
                let canvas_bb = utils.getBoundingBox(canvas);
                let thumb_bb = utils.getBoundingBox(thumb);

                // set thumb horizontal position in the center of the brightness scale
                thumb.style.left = canvas_bb.width / 2 - thumb_bb.width / 2 + 'px';

                // check if the mouse point is within the canvas
                if(canvas_bb.top <= (pageY + thumb_bb.height / 2) && (pageY + thumb_bb.height / 2) <= (canvas_bb.top + canvas_bb.height)){
                    thumb.style.top = (pageY - canvas_bb.top) + 'px';
                }
                else{ // otherwise check if the mouse point is above the canvas, align thumb element to the top of the canvas
                    if(canvas_bb.top > (pageY + thumb_bb.height / 2))
                        thumb.style.top = (-thumb_bb.height / 2) + 'px';
                    else // otherwise align thumb element to the bottom of the canvas
                        thumb.style.top = (canvas_bb.height - thumb_bb.height / 2) + 'px';
                }

                // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
                canvas_bb = utils.getBoundingBox(canvas);
                thumb_bb = utils.getBoundingBox(thumb);

                // calculate brightness value based on thumb position
                let brightness = 100 - ((thumb_bb.top + thumb_bb.height / 2) - canvas_bb.top) / canvas_bb.height * 100;

                // update control brightness value
                self.value = brightness;
                // update thumb dataset brightness value
                thumb.dataset.value = brightness;

                // trigger change event
                emit('change', self.value);
            };
            // add mousedown/touchstart event handler to canvas element
            canvas.addEventListener('mousedown', eventHandlers.canvas_mousedown, true);
            canvas.addEventListener('touchstart', eventHandlers.canvas_mousedown, true);

            // create mousemove/touchmove event handler for document
            eventHandlers.document_mousemove = function(e){
                // check if isMouseDown flag has true value
                if (isMouseDown) {
                    // prevent scroll
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    // get vertical mouse point, relative to the document
                    let pageY = e.touches ? e.touches[0].pageY : e.pageY;

                    // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
                    let canvas_bb = utils.getBoundingBox(canvas);
                    let thumb_bb = utils.getBoundingBox(thumb);

                    // set thumb horizontal position in the center of the brightness scale
                    thumb.style.left = canvas_bb.width / 2 - thumb_bb.width / 2 + 'px';

                    // check if the mouse point is within the canvas
                    if(canvas_bb.top <= (pageY + thumb_bb.height / 2) && (pageY + thumb_bb.height / 2) <= (canvas_bb.top + canvas_bb.height)){
                        thumb.style.top = (pageY - canvas_bb.top) + 'px';
                    }
                    else{ // otherwise check if the mouse point is above the canvas, align thumb element to the top of the canvas
                        if(canvas_bb.top > (pageY + thumb_bb.height / 2))
                            thumb.style.top = (-thumb_bb.height / 2) + 'px';
                        else // otherwise align thumb element to the bottom of the canvas
                            thumb.style.top = (canvas_bb.height - thumb_bb.height / 2) + 'px';
                    }

                    // get the sizes of the canvas and thumb elements and the position of these elements relative to the document
                    canvas_bb = utils.getBoundingBox(canvas);
                    thumb_bb = utils.getBoundingBox(thumb);

                    // calculate brightness value based on thumb position
                    let brightness = 100 - ((thumb_bb.top + thumb_bb.height / 2) - canvas_bb.top) / canvas_bb.height * 100;

                    // update control brightness value
                    self.value = brightness;
                    // update thumb dataset brightness value
                    thumb.dataset.value = brightness;

                    // trigger change event
                    emit('change', self.value);
                }
            };
            // add mousemove/touchmove event handler to document
            document.addEventListener('mousemove', eventHandlers.document_mousemove, true);
            document.addEventListener('touchmove', eventHandlers.document_mousemove, { passive: false });

            // create mouseup/touchend event handler for document
            eventHandlers.document_mouseup = function(e){
                // set isMouseDown flag to false
                isMouseDown = false;
            };
            // add mouseup/touchend event handler to document
            document.addEventListener('mouseup', eventHandlers.document_mouseup, true);
            document.addEventListener('touchend', eventHandlers.document_mouseup, true);
        }

        /**
         * Event unbinding function
         */
        let unbindEvents = function () {
            // remove event listeners attached to thumb element
            thumb.removeEventListener('mousedown', eventHandlers.thumb_mousedown, false);
            thumb.removeEventListener('touchstart', eventHandlers.thumb_mousedown, false);
            
            // remove event listeners attached to canvas element
            canvas.removeEventListener('mousedown', eventHandlers.canvas_mousedown, false);
            canvas.removeEventListener('touchstart', eventHandlers.canvas_mousedown, false);
            
            // remove event listeners attached to document
            document.removeEventListener('mousemove', eventHandlers.document_mousemove, false);
            document.removeEventListener('touchmove', eventHandlers.document_mousemove, false);
            document.removeEventListener('mouseup', eventHandlers.document_mouseup, false);
            document.removeEventListener('touchend', eventHandlers.document_mouseup, false);
        };

        /**
         * Control content update function
         */
        this.update = function (value) {
            // redraw control's canvas
            drawCanvas();
            // update thumb element
            updateThumb();
        };

        /**
         * Control dispose function
         */
        this.dispose = function () {
            // unbind events from ui
            unbindEvents();

            // dispose properties
            this.value = null;
            _value = null;

            // dispose event handlers
            eventHandlers.thumb_mousedown = null;
            eventHandlers.canvas_mousedown = null;
            eventHandlers.document_mousemove = null;
            eventHandlers.document_mouseup = null;

            // dispose event listeners
            eventListeners.change.splice(0, eventListeners.change.length);
            eventListeners.change = null;

            // dispose variables  
            self = null;
            container = null;
            canvas = null; 
            thumb = null;
            isMouseDown = null; 
            eventHandlers = null;
            eventListeners = null;

            // dispose functions
            emit = null;
            init = null;
            drawCanvas = null;
            updateThumb = null;
            bindEvents = null;
            unbindEvents = null;

            // dispose all object members
            for (var member in this) delete this[member];
        };

        // run control initialization
        init();
    };
    
    /**
     * Number input control creation function
     *
     * @param {Object} root Element to which the control is bound
     */
    function NumberInputControl(root) {
        // properties
        this.root = root;
        this.min = Number(root.dataset.min);
        this.max = Number(root.dataset.max);
        this.step = Number(root.dataset.step) || 1;

        // private variables
        let self = this,
            range_input = root.querySelector('.range-input'),
            range_progress = root.querySelector('.range-input-progress'),
            range_value = root.querySelector('.range-input-value'),
            folding_screen = document.createElement('div'),
            changeOnKeyDown = false,
            changeOnMouseMove = false,
            lastMousePosition = null,
            eventHandlers = {
                root_mousedown: null,
                input_focusout: null,
                input_keyup: null,
            },
            eventListeners = {
                focus: [],
                blur: [],
                change: []
            };

        // properties
        let _value = Number(root.dataset.value) || 0;
        Object.defineProperty(self, 'value', {
            get: function() { 
                return _value; 
            },
            set: function(v){
                if(v != null){
                    // if the set value is greater than the maximum value, then set the maximum value
                    if(self.max != null && v > self.max)
                        v = self.max;
                    // if the set value is less  than the maximum value, then set the minimum value
                    if(self.min != null && v < self.min)
                        v = self.min;
                    // round a value to the specified precision in a step
                    _value = utils.round(Number(v), utils.countDecimals(self.step));
                    // set value to input
                    range_input.value = _value;
                    // set value to label
                    range_value.innerHTML = _value;
                    // set progress width
                    if(self.max != null)
                        range_progress.style.width = _value/self.max * 100 + '%';
                    // trigger value changed event
                    emit('change', self.value);
                }
            },
            enumerable: true,
            configurable: true
        });
        let _isFocused = false;
        Object.defineProperty(self, 'isFocused', {
            get: function() { 
                return _isFocused; 
            },
            set: function(v){
                if(v != null){
                    // update property value
                    _isFocused = v;
                    // trigger focus event
                    if(_isFocused){
                        self.root.classList.add('range-input-control--focused');
                        emit('focus', self);
                    }
                    else{
                        emit('blur', self);
                        self.root.classList.remove('range-input-control--focused');
                    }
                }
            },
            enumerable: true,
            configurable: true
        });

        /**
         * Event emitter  function
         * 
         * @param {String} event Event name 
         * @param {...Any} args Argument list
         */
        let emit = function(event, ...args) {
            eventListeners[event].forEach(cb => cb(...args, self));
        }
    
        /**
         * Event subscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function
         */
        this.on = function(event, fn) {
            eventListeners[event] = eventListeners[event] || [];
            eventListeners[event].push(fn);
            return this;
        }
    
        /**
         * Event unsubscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function  
         */
        this.off = function(event, fn) {
            const functions = (eventListeners[event] || []);
            const index = functions.indexOf(fn);
            if (~index)
                functions.splice(index, 1);
            return this;
        }
    
    
        /**
         * Control initialization function.
         * 
         * Sets input value. Binds events to ui.
         */
        let init = function () {
            // set input value
            range_input.value = self.value;

            // set input text value
            range_value.innerHTML = Number(self.value).toFixed(utils.countDecimals(self.step));
            
            // set progress width
            if(self.max != null)
                range_progress.style.width = self.value/self.max * 100% + '%';
            
            // bind events to ui
            bindEvents();
        };
    
        /**
         * Event binding function
         */
        let bindEvents = function () {
            // create mousedown/touchstart event handler for root element
            eventHandlers.root_mousedown = function(e){
                e.stopPropagation();
    
                if( self.root.classList.contains('range-input-control--disabled') 
                    || self.root.classList.contains('range-input-control--mouse-move-mode') 
                        || self.root.classList.contains('range-input-control--key-input-mode'))
                            return;
    
                // set focused state
                self.isFocused = true;
    
                // get horizontal and vertical mouse points, relative to the document
                let pageX = e.touches ? e.touches[0].pageX : e.pageX;
                let pageY = e.touches ? e.touches[0].pageY : e.pageY;

                changeOnKeyDown = true;
                changeOnMouseMove = true;
                lastMousePosition = pageX;

                document.body.appendChild(folding_screen);
                folding_screen.focus();
    
                if(!self.root.classList.contains('range-input-control--mouse-move-mode'))
                    self.root.classList.add('range-input-control--mouse-move-mode');

                // get the size of the root element and its position relative to the viewport
                let root_rect = self.root.getBoundingClientRect();

                // create mousemove/touchmove event handler for document
                let move = function(e){
                    if(!changeOnMouseMove) return;
                    changeOnKeyDown = false;
                        
                    if(e.stopPropagation) e.stopPropagation();
                    if(e.preventDefault) e.preventDefault();

                    // get horizontal and vertical mouse points, relative to the document
                    let pageX = e.touches ? e.touches[0].pageX : e.pageX;
                    let pageY = e.touches ? e.touches[0].pageY : e.pageY;

                    // calculate next step value
                    let step = ((pageX - lastMousePosition) / root_rect.width) * (self.max - self.min);

                    if(pageX == 0)
                        self.value = self.value - self.step;
                    else if(pageX == window.screen.width-1)
                        self.value = self.value + self.step;
                    else
                        self.value = self.value + step;

                    // update last mouse position
                    lastMousePosition = pageX;
                };
                // create mouseup/touchend event handler for document
                let up = function(e){
                    // check if value change mode via mouse move is enabled
                    if(changeOnMouseMove){
                        // reset mouse move mode flag
                        changeOnMouseMove = false;
                        // remove the appropriate class to the root element
                        if(self.root.classList.contains('range-input-control--mouse-move-mode'))
                            self.root.classList.remove('range-input-control--mouse-move-mode');
                        // remove folding screen 
                        if(folding_screen != null && folding_screen.parentNode != null)
                            document.body.removeChild(folding_screen);        
                    }

                    // check if value change mode via keyboard input is enabled
                    if(changeOnKeyDown){
                        // add the appropriate class to the root element
                        if(!self.root.classList.contains('range-input-control--key-input-mode'))
                            self.root.classList.add('range-input-control--key-input-mode');         
                        // set focus to input element
                        range_input.focus();
                        range_input.select();
                    }
                    else{
                        // reset focused state
                        self.isFocused = false;
                    }

                    // remove event listeners attached to document
                    document.removeEventListener('mouseup', up, false);
                    document.removeEventListener('touchend', up, false);
                    document.removeEventListener('mousemove', move, false);
                    document.removeEventListener('touchmove', move, false);
                };

                // add mouseup/touchend event handler to document  
                document.addEventListener('mouseup', up, { once: true });
                document.addEventListener('touchend', up, { once: true });

                // add mousemove/touchmove event handler to document
                document.addEventListener('mousemove', move, { passive: false });
                document.addEventListener('touchmove', move, { passive: false }); 
            };
            // add mousedown/touchstart event handler to root element
            self.root.addEventListener('mousedown', eventHandlers.root_mousedown, true);
            self.root.addEventListener('touchstart', eventHandlers.root_mousedown, true);
    
            // create focusout event handler for input element
            eventHandlers.input_focusout = function(e){
                // remove the appropriate class to the root element
                if(self.root.classList.contains('range-input-control--key-input-mode'))
                    self.root.classList.remove('range-input-control--key-input-mode');

                // reset value to initial
                this.value = self.value;

                // reset focused state
                self.isFocused = false;
            };
            // add focusout event handler to input element
            range_input.addEventListener("focusout", eventHandlers.input_focusout);
    
            // create keyup event handler for input element
            eventHandlers.input_keyup = function(e){
                // check if Escape key was pressed
                if (e.keyCode === 27) {
                    // cancel the default action, if needed
                    e.preventDefault();
                    // remove the appropriate class to the root element
                    if(self.root.classList.contains('range-input-control--key-input-mode'))
                        self.root.classList.remove('range-input-control--key-input-mode');
                    // reset value to initial
                    this.value = self.value;
                    // reset focused state
                    self.isFocused = false;
                }

                // check if Enter key was pressed
                if (e.keyCode === 13) {
                    // cancel the default action, if needed
                    e.preventDefault();
                    // remove the appropriate class to the root element
                    if(self.root.classList.contains('range-input-control--key-input-mode'))
                        self.root.classList.remove('range-input-control--key-input-mode');        
                    // update initial value
                    self.value = this.value;  
                    // reset focused state
                    self.isFocused = false;   
                }
            };
            // add keyup event handler to input element
            range_input.addEventListener("keyup", eventHandlers.input_keyup);
        }
    
        /**
         * Event unbinding function
         */
        let unbindEvents = function () {
            // remove event listeners from root
            self.root.removeEventListener('mousedown', eventHandlers.root_mousedown, false);
            self.root.removeEventListener('touchstart', eventHandlers.root_mousedown, false);
    
            // remove event listeners from input
            range_input.removeEventListener('focusout', eventHandlers.input_focusout, false);
            range_input.removeEventListener('keyup', eventHandlers.input_keyup, false);
        };
    
        /**
         * Control dispose function
         */
        this.dispose = function () {
            // unbind events from ui
            unbindEvents();

            // dispose properties
            this.value = null;
            _value = null;
            this.isFocused = null;
            _isFocused = null;
            this.min = null;
            this.max = null;
            this.step = null;
            this.root.parentNode.removeChild(this.root);
            this.root = null;

            // dispose event handlers
            eventHandlers.root_mousedown = null;
            eventHandlers.input_focusout = null;
            eventHandlers.input_keyup = null;

            // dispose event listeners
            eventListeners.focus.splice(0, eventListeners.focus.length);
            eventListeners.focus = null;
            eventListeners.blur.splice(0, eventListeners.blur.length);
            eventListeners.blur = null;
            eventListeners.change.splice(0, eventListeners.change.length);
            eventListeners.change = null;
            eventListeners = null;

            // dispose variables  
            self = null;
            range_input = null;
            range_progress = null;
            range_value = null;
            folding_screen = null;
            changeOnKeyDown  = null;
            changeOnMouseMove  = null;
            lastMousePosition = null;
            eventHandlers = null;
            eventListeners = null;

            // dispose functions
            emit = null;
            init = null;
            bindEvents = null;
            unbindEvents = null;

            // dispose all object members
            for (var member in this) delete this[member];
        };
    
        // run control initialization
        init();
    }

    /**
     * Text input control creation function
     *
     * @param {Object} root Element to which the control is bound
     */
    function TextInputControl(root) {
        // properties
        this.root = root;
        this.isAlphanumeric = root.dataset.isAlphanumeric || false;

        // private variables
        let self = this,
            text_input = root.querySelector('.text-input'),
            text_value = root.querySelector('.text-input-value'),
            eventHandlers = {
                root_mousedown: null,
                input_focusout: null,
                input_keydown: null,
                input_keyup: null
            },
            eventListeners = {
                focus: [],
                blur: [],
                change: []
            };

        // properties
        let _value = root.dataset.value || '';
        Object.defineProperty(self, 'value', {
            get: function() { 
                return _value; 
            },
            set: function(v){
                if(v != null){
                    // update property value
                    _value = v;
                    // set value to input
                    text_input.value = _value;
                    // set value to label
                    text_value.innerHTML = _value;
                    // trigger value changed event
                    emit('change', self.value);
                }
            },
            enumerable: true,
            configurable: true
        });
        let _isFocused = false;
        Object.defineProperty(self, 'isFocused', {
            get: function() { 
                return _isFocused; 
            },
            set: function(v){
                if(v != null){
                    // update property value
                    _isFocused = v;
                    // trigger focus event
                    if(_isFocused){
                        self.root.classList.add('text-input-control--focused');
                        emit('focus', self);
                    }
                    else{
                        emit('blur', self);
                        self.root.classList.remove('text-input-control--focused');
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
    
        /**
         * Event emitter  function
         * 
         * @param {String} event Event name 
         * @param {...Any} args Argument list
         */
        let emit = function(event, ...args) {
            eventListeners[event].forEach(cb => cb(...args, self));
        }
    
        /**
         * Event subscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function
         */
        this.on = function(event, fn) {
            eventListeners[event] = eventListeners[event] || [];
            eventListeners[event].push(fn);
            return this;
        }
    
        /**
         * Event unsubscribe function
         * 
         * @param {String} event Event name 
         * @param {Function} fn Function  
         */
        this.off = function(event, fn) {
            const functions = (eventListeners[event] || []);
            const index = functions.indexOf(fn);
            if (~index)
                functions.splice(index, 1);
            return this;
        }
    
    
        /**
         * Control initialization function.
         * 
         * Sets input value. Binds events to ui.
         */
        let init = function () {
            // set input value
            text_input.value = self.value;

            // set input text value
            text_value.innerHTML = self.value;

            // bind events to ui
            bindEvents();
        };
    
        /**
         * Event binding function
         */
        let bindEvents = function () {
            // create mousedown/touchstart event handler for root element
            eventHandlers.root_mousedown = function(e){
                e.stopPropagation();
                // break logic execution if root element is disabled
                if( self.root.classList.contains('text-input-control--disabled'))
                    return;

                // set focused state
                self.isFocused = true;

                // create mouseup/touchend event handler for document
                let up = function(e){      
                    // set focus to input element
                    text_input.focus();
                    text_input.select();       
                };
                // add mouseup/touchend event handler to document
                document.addEventListener('mouseup', up, { once: true }); 
                document.addEventListener('touchend', up, { once: true });
            };
            // add mousedown/touchstart event handler to root element
            self.root.addEventListener('mousedown', eventHandlers.root_mousedown, true);
            self.root.addEventListener('touchstart', eventHandlers.root_mousedown, true);
    
            // create focusout event handler for input element
            eventHandlers.input_focusout = function(e){
                this.value = self.value;
                self.isFocused = false;
            };
            // add focusout event handler to input element
            text_input.addEventListener("focusout", eventHandlers.input_focusout, true);
                
            // create keydown event handler for input element
            eventHandlers.input_keydown = function(e){
                let key = e.keyCode || e.charCode;
                if(self.isAlphanumeric){
                    if (!e.key.match(/[a-zA-Z0-9]/) || (document.getSelection().toString().length == 0 && (key !== 37 && key !== 39) && this.value.length == 6 && key!=8 && key!=46)) {
                        e.preventDefault();  
                    }
                }
            };
            // add keydown event handler to input element
            text_input.addEventListener("keydown", eventHandlers.input_keydown, true);

            // create keyup event handler for input element
            eventHandlers.input_keyup = function(e){
                // check if Escape key was pressed
                if (e.keyCode === 27) {
                    // cancel the default action, if needed
                    e.preventDefault();
                    // reset value to initial
                    this.value = self.value;
                    // reset focused state
                    self.isFocused = false;
                }
                // Number 13 is the "Enter" key on the keyboard
                if (e.keyCode === 13) {
                    // Cancel the default action, if needed
                    e.preventDefault();      
                    // update initial value
                    self.value = this.value; 
                    // reset focused state
                    self.isFocused = false;   
                }
            };
            // add keyup event handler to input element
            text_input.addEventListener("keyup", eventHandlers.input_keyup, true);
        }
    
        /**
         * Event unbinding function
         */
        let unbindEvents = function () {
            // remove event listeners from value block
            self.root.removeEventListener('mousedown', eventHandlers.root_mousedown, false);
            self.root.removeEventListener('touchstart', eventHandlers.root_mousedown, false);
    
            // remove event listeners from value input
            text_input.removeEventListener('focusout', eventHandlers.input_focusout, false);
            text_input.removeEventListener("keydown", eventHandlers.input_keydown, false);
            text_input.removeEventListener('keyup', eventHandlers.input_keyup, false);
        };
    
        /**
         * Control dispose function
         */
         this.dispose = function () {
            // unbind events from ui
            unbindEvents();

            // dispose properties
            this.value = null;
            _value = null;
            this.isFocused = null;
            _isFocused = null;
            this.isAlphanumeric = null;
            this.root.parentNode.removeChild(this.root);
            this.root = null;

            // dispose event handlers
            eventHandlers.root_mousedown = null;
            eventHandlers.input_focusout = null;
            eventHandlers.input_keydown = null;
            eventHandlers.input_keyup = null;

            // dispose event listeners
            eventListeners.focus.splice(0, eventListeners.focus.length);
            eventListeners.focus = null;
            eventListeners.blur.splice(0, eventListeners.blur.length);
            eventListeners.blur = null;
            eventListeners.change.splice(0, eventListeners.change.length);
            eventListeners.change = null;
            eventListeners = null;

            // dispose variables  
            self = null;
            text_input = null;
            text_value = null;
            eventHandlers = null;
            eventListeners = null;

            // dispose functions
            emit = null;
            init = null;
            bindEvents = null;
            unbindEvents = null;

            // dispose all object members
            for (var member in this) delete this[member];
        };
    
        // run control initialization
        init();
    }

    // run control initialization
    init();
}