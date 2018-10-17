/**
 * A BubbleOverlay is a type of Overlay that places its content in a speech bubble shaped background that always
 * is on screen.  The bubble appears above, below, left, or right of a rectangular region specified in the display()
 * function.  The InputPad for editing Slots uses a BubbleOverlay.
 *
 * @param {Overlay.types} overlayType - The type of overlay (to prevent two overlays of the same type)
 * @param {string} color - Color of the bubble in hex
 * @param {number} margin - The size of the margin around the content
 * @param {Element} innerGroup - The group with content to put in the overlay
 * @param {*} parent - The object owning the BubbleOverlay. Must implement a close() function
 * @param {Element} [layer] - The layer from GuiElements to insert the overlay into. layers.overlay is default
 * @constructor
 */
function BubbleOverlay(overlayType, color, margin, innerGroup, parent, layer) {
	if (layer == null) {
		layer = GuiElements.layers.overlay;
	}
	Overlay.call(this, overlayType);
	this.x = 0;
	this.y = 0;
	this.bgColor = color;
	this.margin = margin;
	this.innerGroup = innerGroup;
	this.parent = parent;
	this.layerG = layer;
	this.visible = false;
	this.buildBubble();
}
BubbleOverlay.prototype = Object.create(Overlay.prototype);
BubbleOverlay.prototype.constructor = BubbleOverlay;

BubbleOverlay.setGraphics = function() {
	BubbleOverlay.triangleW = 15;
	BubbleOverlay.triangleH = 7;
	BubbleOverlay.minW = 25;
	BubbleOverlay.overlap = 1;
};

/**
 * Creates the groups and graphics for the bubble
 */
BubbleOverlay.prototype.buildBubble = function() {
	this.buildGroups();
	this.makeBg();
};

/**
 * Creates a group for the bubble, a group for the background, and places the innerGroup in the bubble's group
 */
BubbleOverlay.prototype.buildGroups = function() {
	this.group = GuiElements.create.group(0, 0);
	TouchReceiver.addListenersOverlayPart(this.group);
	this.bgGroup = GuiElements.create.group(0, 0, this.group);
	this.group.appendChild(this.innerGroup);
	GuiElements.move.group(this.innerGroup, this.margin, this.margin);
};

/**
 * Makes a rectangle and triangle for the background.  Position is not important yet.
 */
BubbleOverlay.prototype.makeBg = function() {
	this.bgRect = GuiElements.create.rect(this.bgGroup);
	GuiElements.update.color(this.bgRect, this.bgColor);
	this.triangle = GuiElements.create.path(this.bgGroup);
	GuiElements.update.color(this.triangle, this.bgColor);
};

/**
 * Makes the bubble visible, assuming it was already displayed.
 */
BubbleOverlay.prototype.show = function() {
	if (!this.visible) {
		this.layerG.appendChild(this.group);
		this.visible = true;
		this.addOverlayAndCloseOthers();
	}
};

/**
 * Makes the bubble invisible.
 */
BubbleOverlay.prototype.hide = function() {
	if (this.visible) {
		this.group.remove();
		this.visible = false;
		Overlay.removeOverlay(this);
	}
};

/**
 * Closes the bubble and tells its parent to close
 */
BubbleOverlay.prototype.close = function() {
	this.hide();
	this.parent.close();
};

/**
 * Builds the bubble and makes it visible with its point on the boundry of the specified rectangle
 * @param {number} x1 - x coord of top left point of rectangle
 * @param {number} x2 - x coord of bottom right point of rectangle
 * @param {number} y1 - y coord of top left point of rectangle
 * @param {number} y2 - y coord of bottom right point of rectangle
 * @param {number} innerWidth - The width of the content of the bubble
 * @param {number} innerHeight - The height of the content of the bubble
 */
BubbleOverlay.prototype.display = function(x1, x2, y1, y2, innerWidth, innerHeight) {
	DebugOptions.validateNumbers(x1, x2, y1, y2, innerWidth, innerHeight);
	const BO = BubbleOverlay;

	/* Compute dimensions of the bubble */
	let width = innerWidth + 2 * this.margin;
	if (width < BO.minW) {
		width = BO.minW;
	}
	const height = innerHeight + 2 * this.margin;

	/* Center the content in the bubble */
	GuiElements.move.group(this.innerGroup, (width - innerWidth) / 2, (height - innerHeight) / 2);

	/* Compute dimension depending on orientation */
	const longW = width + BO.triangleH;
	const longH = height + BO.triangleH;

	/* Determine how much content is cut off if the bubble goes in each direction */
	const attemptB = Math.max(0, y2 + longH - GuiElements.height);
	const attemptT = Math.max(0, longH - y1);
	const attemptR = Math.max(0, x2 + longW - GuiElements.width);
	const attemptL = Math.max(0, longW - x1);

	/* Find the amount of content cut off using the best attempt */
	const min = Math.min(attemptT, attemptB, attemptL, attemptR);

	/* The vertical direction is used if the top or bottom attempts were the best */
	const vertical = attemptT <= min || attemptB <= min;

	/* To be determined */
	let topLeftX = NaN;   // The x coord of the background rect
	let topLeftY = NaN;   // The y coord of the background rect
	let x = NaN;   // The x coord of the point of the triangle
	let y = NaN;   // The y coord of the point of the triangle
	let triangleDir = 1;   // 1 or -1
	if (vertical) {
		x = (x1 + x2) / 2;
		// Find the best x for the background rect
		topLeftX = this.fitLocationToRange(x, width, GuiElements.width);
		if (attemptB <= min) {
			topLeftY = y2 + BO.triangleH;
			y = y2;
		} else {
			topLeftY = y1 - longH;
			y = y1;
			triangleDir = -1;
		}
	} else {
		y = (y1 + y2) / 2;
		// Find the best y for the background rect
		topLeftY = this.fitLocationToRange(y, height, GuiElements.height);
		if (attemptL <= min) {
			topLeftX = x1 - longW;
			x = x1;
			triangleDir = -1;
		} else {
			topLeftX = x2 + BO.triangleH;
			x = x2;
		}
	}

	// Convert the triangle's coords from abs to rel coords
	const triX = x - topLeftX;
	const triY = y - topLeftY;
	const triH = (BO.triangleH + BO.overlap) * triangleDir;
	this.x = topLeftX;
	this.y = topLeftY;
	GuiElements.move.group(this.group, topLeftX, topLeftY);

	// Move the elements using the results
	GuiElements.update.triangleFromPoint(this.triangle, triX, triY, BO.triangleW, triH, vertical);
	GuiElements.update.rect(this.bgRect, 0, 0, width, height);
	this.show();
};
/**
 * Finds the best x coord for an object the specified width that would like to be centered at the specified center
 * but needs to fit in the specified range
 * By symmetry, also works for y coords with height
 * @param {number} center - The x coord the object would like to be centered at
 * @param {number} width - The width of the object
 * @param {number} range - The width of the space the object needs to fit within
 * @return {number} - The x coord the object should have
 */
BubbleOverlay.prototype.fitLocationToRange = function(center, width, range) {
	let res = center - width / 2;   // The object would like this x coord
	if (width > range) {
		// The object is bigger than the range, so we make it extend beyond both sides equally
		// result:   --[----]--
		res = (range - width) / 2;
	} else if (res < 0) {
		// The object would like to be to the left of the range, so we align it to the left
		// object wants:   --[--      ]
		// result:    [----    ]
		res = 0;
	} else if (res + width > range) {
		// The object would like to be to the right of the range, so we align it to the right
		// object wants:   [      --]--
		// result:    [    ----]
		res = range - width;
	}
	return res;
};

/* Convert between rel and abs coords */
/**
 * @param {number} x
 * @return {number}
 */
BubbleOverlay.prototype.relToAbsX = function(x) {
	return x + this.x + this.margin;
};
/**
 * @param {number} y
 * @return {number}
 */
BubbleOverlay.prototype.relToAbsY = function(y) {
	return y + this.y + this.margin;
};
