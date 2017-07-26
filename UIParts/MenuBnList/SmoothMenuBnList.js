/**
 * A stack of buttons which become scrollable if thee isn't enough screen space.  Is not build until show() is called.
 * Options should be added through addOption before show() is called.  setMaxHeight can also be called to cause the
 * list to scroll if the maximum height is exceeded.
 * TODO: use SmoothScrollBox instead of manually implementing scrolling
 *
 * @param parent - Some UI object that implements relToAbsX and relToAbsY
 * TODO: remove parentGroup as it is not used
 * @param {Element} parentGroup - The group the SmoothMenuBnList should add itself to
 * @param {number} x - The rel x coord the list should appear at
 * @param {number} y - The rel y coord the list should appear at
 * @param {number} [width] - The width the list should have.  If null, computed on the fly to match longest entry
 * @param {Element} [layer] - The layer the list should place the scrollDiv on. frontScroll used by default
 * @constructor
 */
function SmoothMenuBnList(parent, parentGroup, x, y, width, layer) {
	if (layer == null) {
		layer = GuiElements.layers.frontScroll;
	}
	this.x = x;
	this.y = y;
	this.width = width;
	if (width == null) {
		this.width = null;
	}
	// computed later
	this.height = 0;
	// Store constants TODO: not really necessary
	this.bnHeight = SmoothMenuBnList.bnHeight;
	this.bnMargin = Button.defaultMargin;
	this.bnsGenerated = false;
	// Prepare list to store options.
	/** @type {Array<object>} - An array of objects with properties like text, func, and addTextFn */
	this.options = [];
	/** @type {null|Array<object>} */
	this.bns = null;

	// Build the scroll box but not the buttons
	this.build();
	this.parentGroup = parentGroup;
	this.parent = parent;
	this.layer = layer;

	this.visible = false;
	// May be set later with markAsOverlayPart
	this.partOfOverlay = null;
	this.internalHeight = 0;

	this.maxHeight = null;

	this.scrolling = false;
	this.scrollYOffset = 0;
	this.scrollY = 0;
	this.scrollable = false;

	this.scrollStatus = {};
}

SmoothMenuBnList.setGraphics = function() {
	const SMBL = SmoothMenuBnList;
	SMBL.bnHeight = 34;
	SMBL.bnHMargin = 10; //only used when width not specified.
	SMBL.minWidth = 40;
};

/**
 * Build the parts necessary to make a scrollable list, but not the buttons
 */
SmoothMenuBnList.prototype.build = function() {
	this.scrollDiv = GuiElements.create.scrollDiv();
	TouchReceiver.addListenersSmoothMenuBnListScrollRect(this.scrollDiv, this);
	this.svg = GuiElements.create.svg(this.scrollDiv);
	this.zoomG = GuiElements.create.group(0, 0, this.svg);
};

/**
 * Configures the SmoothMenuBnList to scroll if a certain height is exceeded
 * @param {number} maxHeight
 */
SmoothMenuBnList.prototype.setMaxHeight = function(maxHeight) {
	this.maxHeight = maxHeight;
};

/**
 * Adds an option to the SmoothMenuBnList
 * @param {string} text - The text to display on the Button.  Not used if addTextFn is defined
 * @param {function|null} func - type () -> (), the function to call when the option is selected
 * @param {function|null} addTextFn - type (Button) -> (), formats the button for this option
 */
SmoothMenuBnList.prototype.addOption = function(text, func, addTextFn) {
	if (func == null) {
		func = null;
	}
	if (addTextFn == null) {
		addTextFn = null;
	}

	this.bnsGenerated = false;
	const option = {};
	option.func = func;
	option.text = text;
	option.addTextFn = addTextFn;
	this.options.push(option);
};

/**
 * Builds the buttons and shows the list on the screen
 */
SmoothMenuBnList.prototype.show = function() {
	this.generateBns();
	if (!this.visible) {
		this.visible = true;
		this.layer.appendChild(this.scrollDiv);
		this.updatePosition();
		// See SmoothScrollBox for an explaination of why this is necessary
		this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv, this.scrollStatus);
		TouchReceiver.setInitialScrollFix(this.scrollDiv);
	}
};

/**
 * Hides the list so it can be shown again
 */
SmoothMenuBnList.prototype.hide = function() {
	if (this.visible) {
		this.visible = false;
		this.layer.removeChild(this.scrollDiv);
		if (this.fixScrollTimer != null) {
			window.clearInterval(this.fixScrollTimer);
		}
	}
};

/**
 * Creates the buttons for the list
 */
SmoothMenuBnList.prototype.generateBns = function() {
	// The width is computed and stored in
	this.computeWidth();
	if (!this.bnsGenerated) {
		this.clearBnsArray();
		let currentY = 0;
		let count = this.options.length;
		for (let i = 0; i < count; i++) {
			this.bns.push(this.generateBn(0, currentY, this.width, this.options[i]));
			currentY += this.bnHeight + this.bnMargin;
		}
		currentY -= this.bnMargin;
		this.internalHeight = currentY;
		if (count === 0) {
			this.internalHeight = 0;
		}
		this.height = this.internalHeight;
		if (this.maxHeight != null) {
			this.height = Math.min(this.internalHeight, this.maxHeight);
		}
		this.scrollable = this.height !== this.internalHeight;
		this.bnsGenerated = true;
		this.updatePosition();
	}
};
SmoothMenuBnList.prototype.computeWidth = function() {
	if (this.width == null) {
		const columns = 1;
		const MBL = MenuBnList;
		let longestW = 0;
		for (let i = 0; i < this.options.length; i++) {
			const string = this.options[i].text;
			const currentW = GuiElements.measure.stringWidth(string, Button.defaultFont, Button.defaultFontSize, Button.defaultFontWeight);
			if (currentW > longestW) {
				longestW = currentW;
			}
		}
		this.width = columns * longestW + columns * 2 * MBL.bnHMargin + (columns - 1) * this.bnMargin;
		if (this.width < MBL.minWidth) {
			this.width = MBL.minWidth;
		}
	}
};
SmoothMenuBnList.prototype.isEmpty = function() {
	return this.options.length === 0;
};
SmoothMenuBnList.prototype.clearBnsArray = function() {
	if (this.bns != null) {
		for (let i = 0; i < this.bns.length; i++) {
			this.bns[i].remove();
		}
	}
	this.bns = [];
};
SmoothMenuBnList.prototype.generateBn = function(x, y, width, option) {
	const bn = new Button(x, y, width, this.bnHeight, this.zoomG);
	bn.setCallbackFunction(option.func, true);
	if (option.addTextFn != null) {
		option.addTextFn(bn);
	} else {
		bn.addText(option.text);
	}
	bn.partOfOverlay = this.partOfOverlay;
	bn.makeScrollable();
	return bn;
};
SmoothMenuBnList.prototype.updatePosition = function() {
	if (this.visible) {
		//Compensates for a WebKit bug which prevents transformations from moving foreign objects
		let realX = this.parent.relToAbsX(this.x);
		let realY = this.parent.relToAbsY(this.y);
		realX = GuiElements.relToAbsX(realX);
		realY = GuiElements.relToAbsY(realY);

		GuiElements.update.smoothScrollSet(this.scrollDiv, this.svg, this.zoomG, realX, realY, this.width,
			this.height, this.width, this.internalHeight);
	}
};
SmoothMenuBnList.prototype.updateZoom = function() {
	this.updatePosition();
};
SmoothMenuBnList.prototype.getScroll = function() {
	if (!this.visible) return 0;
	return this.scrollDiv.scrollTop;
};
SmoothMenuBnList.prototype.setScroll = function(scrollTop) {
	if (!this.visible) return;
	scrollTop = Math.max(0, scrollTop);
	const height = parseInt(window.getComputedStyle(this.scrollDiv).getPropertyValue('height'), 10);
	scrollTop = Math.min(this.scrollDiv.scrollHeight - height, scrollTop);
	this.scrollDiv.scrollTop = scrollTop;
};
SmoothMenuBnList.prototype.markAsOverlayPart = function(overlay) {
	this.partOfOverlay = overlay;
};
SmoothMenuBnList.prototype.isScrolling = function() {
	if (!this.visible) return false;
	return !this.scrollStatus.still;
};
SmoothMenuBnList.prototype.previewHeight = function() {
	let height = (this.bnHeight + this.bnMargin) * this.options.length - this.bnMargin;
	height = Math.max(height, 0);
	if (this.maxHeight != null) {
		height = Math.min(height, this.maxHeight);
	}
	return height;
};
SmoothMenuBnList.prototype.previewWidth = function() {
	this.computeWidth();
	return this.width;
};
SmoothMenuBnList.previewHeight = function(count, maxHeight) {
	let height = (SmoothMenuBnList.bnHeight + Button.defaultMargin) * count - Button.defaultMargin;
	height = Math.max(height, 0);
	if (maxHeight != null) {
		height = Math.min(height, maxHeight);
	}
	return height;
};