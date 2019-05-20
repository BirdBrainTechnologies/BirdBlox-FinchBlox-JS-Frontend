/**
 * An InputSystem for editing NumSlots and DropSlots, provides a set of controls (InputWidgets) in an OverlayBubble
 * which edit the Data in the Slot.
 * The InputPad is flexible as it holds a stack of varying "widgets" as determined by the Slot that constructs it.
 * Widgets are added before the InputPad is shown using addWidget.  Right now, SelectPadWidgets and NumPadWidgets
 * are the main entry mechanisms, but more widgets could be added in the future (for example, a sliders or knobs)
 *
 * The coordinates of the bubble are provided as parameters
 * @param {number} x1
 * @param {number} x2
 * @param {number} y1
 * @param {number} y2
 * @constructor
 */
function InputPad(x1, x2, y1, y2) {
	InputSystem.call(this);
	this.widgets = [];
	const coords = this.coords = {};
	coords.x1 = x1;
	coords.x2 = x2;
	coords.y1 = y1;
	coords.y2 = y2;
}
InputPad.prototype = Object.create(InputSystem.prototype);
InputPad.prototype.constructor = InputPad;

InputPad.setConstants = function() {
	const IP = InputPad;
  if (FinchBlox) {
    IP.background = Colors.white;
  	IP.margin = Button.defaultMargin;
  	IP.width = GuiElements.width * 19/20;
  } else {
    IP.background = Colors.lightGray;
  	IP.margin = Button.defaultMargin;
  	IP.width = 160;
  }
};

/**
 * Adds a Widget to the InputPad.  The Widget and pad will be constructed when show() is called
 * @param {InputWidget} widget - The Widget to add to the InputPad
 */
InputPad.prototype.addWidget = function(widget) {
	this.widgets.push(widget);
};

/**
 * Builds the InputPad and Widgets
 * @inheritDoc
 * @param {EditableSlotShape} slotShape
 * @param {function} updateFn
 * @param {function} finishFn
 * @param {Data} data
 * @param color - the outline color for the input pad
 */
InputPad.prototype.show = function(slotShape, updateFn, finishFn, data, color, block) {
	InputSystem.prototype.show.call(this, slotShape, updateFn, finishFn, data);
	const IP = InputPad;
	this.group = GuiElements.create.group(0, 0);
	this.updateDim();
	const type = Overlay.types.inputPad;
	var layer = GuiElements.layers.inputPad;
	const coords = this.coords;
  if (FinchBlox) {
    this.bubbleOverlay = new FBBubbleOverlay(type, IP.margin, this.group, this, color, block);
  } else {
    this.bubbleOverlay = new BubbleOverlay(type, IP.background, IP.margin, this.group, this, layer);

  }
	this.bubbleOverlay.display(coords.x1, coords.x2, coords.y1, coords.y2, this.width, this.height);
	this.showWidgets(this.bubbleOverlay);
};

/**
 * Computes the dimensions of the InputPad and its widgets, storing them in this.width and this.height
 */
InputPad.prototype.updateDim = function() {
	const IP = InputPad;
	let height = 0;
	this.widgets.forEach(function(widget) {
		// Some widgets have adjustable heights (like SelectPads)
		if (widget.fixedHeight()) {
			// Fixed-height widgets have their height computed and stored
			widget.updateDim();
			height += widget.height;
		}
		height += IP.margin;
	});
	height -= IP.margin;
	height = Math.max(height, 0);
	const maxHeight = GuiElements.height - 2 * IP.margin;
	// The remaining available screen space is computed and allocated to adjustable-height widgets
	// TODO: currently this code only works if there is at most one adjustable-height widget
	let allocH = (maxHeight - height);
	this.widgets.forEach(function(widget) {
		if (!widget.fixedHeight()) {
			// Gives all the remaining space to this widget
			widget.setMaxHeight(allocH);
			widget.updateDim();
			// The widget might not use all the space, and only the space it does use is added
			height += widget.height;
		}
	});
	// Store the final results
	this.height = height;
	this.width = IP.width;
};

/**
 * Builds the widgets at the correct locations, assuming updateDim was already called.
 * @param {BubbleOverlay} overlay
 */
InputPad.prototype.showWidgets = function(overlay) {
	const IP = InputPad;
	let y = 0;
	for (let i = 0; i < this.widgets.length; i++) {
		this.widgets[i].show(0, y, this.group, overlay, this.slotShape, this.updateEdit.bind(this),
			this.finishEdit.bind(this), this.currentData);
		y += this.widgets[i].height + IP.margin;
	}
};

/**
 * Closes the pad and all its widgets
 * @inheritDoc
 */
InputPad.prototype.close = function() {
	if (this.closed) return;
	InputSystem.prototype.close.call(this);
	this.widgets.forEach(function(widget) {
		widget.close();
	});
	this.bubbleOverlay.close();
};

/**
 * Function called by Widgets to update Slot
 * @param {Data} newData - The Data to store in the Slot
 * @param {string} text - The text to display in the Slot
 */
InputPad.prototype.updateEdit = function(newData, text) {
	this.updateFn(newData, text);
	this.currentData = newData;
};

/**
 * Function called by widgets to finish editing Slot
 * @param {Data} newData - The Data to save to the Slot
 */
InputPad.prototype.finishEdit = function(newData) {
	this.currentData = newData;
	this.close();
};
