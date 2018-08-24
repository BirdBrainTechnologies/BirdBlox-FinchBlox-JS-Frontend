/**
 * Creates a UI element that is in a div layer and contains a scrollDiv with the content from the group.  The group
 * can change size, as long as it calls updateDims with the new innerHeight and innerWidth.
 * The scrollbox is one of the few components to use regular HTML (in this case a scrollable div).  This allows for
 * smoother scrolling
 *
 * Unfortunately, iOS tries to scroll the entire website if the SmoothScrollBox is at the minimum/maximum scrolling
 * position vertically.  To prevent the entire webapp from scrolling, the body is set to position:fixed, but the
 * iPad still tries to scroll it, which has no visual affect but locks the focus on the body until the user stops
 * touching the screen for 2 secs or so (preventing them from scrolling the actual SmoothScrollBox).  To stop this,
 * a timer regularly checks if the box is scrolled to an extreme position and moves it 1 pixel to compensate.  This
 * behaviour is registered with TouchReceiver.createScrollFixTimer()
 *
 * The smoothScrollBox must use actual screen coordinates. Unlike other parts of the SVG it can't ignore the present
 * zoom level (as most relToAbs functions do), and thus uses GuiElements.relToAbs to account for the zoom and get
 * real absolute coords, rather than the fake abs coords provided in the constructor (which ignore the zoom level)
 *
 * @param {Element} group - The group the scrollBox should put inside the svg inside the div
 * @param {Element} layer - The layer the (outer div) the scrollDiv should be added to
 * @param {number} absX - The x screen coord the scrollDiv should appear at
 * @param {number} absY - The y screen coord the scrollDiv should appear at
 * @param {number} width - The width the div containing the content should have
 * @param {number} height - The height the div containing the content should have
 * @param {number} innerWidth - The width of the content within the div.  If larger, the div will scroll
 * @param {number} innerHeight - The height of the content within the div.  If larger, the div will scroll
 * @param {Overlay|null} [partOfOverlay=null] - The Overlay this SmoothScrollBox is a part of, or null if N/A
 * @constructor
 */
function SmoothScrollBox(group, layer, absX, absY, width, height, innerWidth, innerHeight, partOfOverlay) {
	if (partOfOverlay == null) {
		partOfOverlay = null;
	}
	DebugOptions.validateNonNull(group, layer);
	DebugOptions.validateNumbers(width, height, innerWidth, innerHeight);
	this.x = absX;
	this.y = absY;
	this.width = width;
	this.height = height;
	this.innerWidth = innerWidth;
	this.innerHeight = innerHeight;
	this.layer = layer;
	this.scrollDiv = GuiElements.create.scrollDiv();
	TouchReceiver.addListenersScrollBox(this.scrollDiv, this);
	this.contentSvg = GuiElements.create.svg(this.scrollDiv);
	this.contentGroup = GuiElements.create.group(0, 0, this.contentSvg);
	this.contentGroup.appendChild(group);
	this.scrollStatus = {};
	this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv, this.scrollStatus);
	this.visible = false;
	this.currentZoom = GuiElements.zoomFactor;
	this.partOfOverlay = partOfOverlay;
}

/**
 * Recomputes the sizes and positions of the SmoothScrollBox
 */
SmoothScrollBox.prototype.updateScrollSet = function() {
	if (this.visible) {
		let realX = GuiElements.relToAbsX(this.x);
		let realY = GuiElements.relToAbsY(this.y);

		GuiElements.update.smoothScrollSet(this.scrollDiv, this.contentSvg, this.contentGroup, realX, realY, this.width,
			this.height, this.innerWidth, this.innerHeight);
	}
};

/**
 * Captures the scroll position, calls updateScrollSet, and restores the scroll position
 */
SmoothScrollBox.prototype.updateZoom = function() {
	const currentScrollX = this.getScrollX();
	const currentScrollY = this.getScrollY();
	this.currentZoom = GuiElements.zoomFactor;
	this.updateScrollSet();
	this.setScrollX(currentScrollX);
	this.setScrollY(currentScrollY);
};

/**
 * Changes the dimensions of the content inside the SmoothScrollBox
 * @param {number} innerWidth - The new width of the content
 * @param {number} innerHeight - The new height of the content
 */
SmoothScrollBox.prototype.setContentDims = function(innerWidth, innerHeight) {
	this.innerHeight = innerHeight;
	this.innerWidth = innerWidth;
	this.updateScrollSet();
};

/**
 * Changes the dimensions of the outside of the SmoothScrollBox
 * @param {number} width
 * @param {number} height
 */
SmoothScrollBox.prototype.setDims = function(width, height) {
	this.width = width;
	this.height = height;
	this.updateScrollSet();
};

/**
 * Changes the position of the SmoothScrollBox
 * @param {number} absX
 * @param {number} absY
 */
SmoothScrollBox.prototype.move = function(absX, absY) {
	this.x = absX;
	this.y = absY;
	this.updateScrollSet();
};

/**
 * Makes the SmoothScrollBox visible
 */
SmoothScrollBox.prototype.show = function() {
	if (!this.visible) {
		this.visible = true;
		this.layer.appendChild(this.scrollDiv);
		this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv);
		this.updateScrollSet();
		TouchReceiver.setInitialScrollFix(this.scrollDiv);
	}
};

/**
 * Hides the SmoothScrollBox
 */
SmoothScrollBox.prototype.hide = function() {
	if (this.visible) {
		this.visible = false;
		this.layer.removeChild(this.scrollDiv);
		if (this.fixScrollTimer != null) {
			window.clearInterval(this.fixScrollTimer);
		}
	}
};

/* Convert between coords inside the group in the SmoothScrollBox and screen coords */
/**
 * @param {number} x
 * @return {number}
 */
SmoothScrollBox.prototype.relToAbsX = function(x) {
	return x - this.scrollDiv.scrollLeft / this.currentZoom + this.x;
};
/**
 * @param {number} y
 * @return {number}
 */
SmoothScrollBox.prototype.relToAbsY = function(y) {
	return y - this.scrollDiv.scrollTop / this.currentZoom + this.y;
};
/**
 * @param {number} x
 * @return {number}
 */
SmoothScrollBox.prototype.absToRelX = function(x) {
	return x + this.scrollDiv.scrollLeft * this.currentZoom - this.x;
};
/**
 * @param {number} y
 * @return {number}
 */
SmoothScrollBox.prototype.absToRelY = function(y) {
	return y + this.scrollDiv.scrollTop * this.currentZoom - this.y;
};

/* Get/set the scroll amount in various directions */
/**
 * @return {number}
 */
SmoothScrollBox.prototype.getScrollY = function() {
	if (!this.visible) return 0;
	return this.scrollDiv.scrollTop / this.currentZoom;
};
/**
 * @return {number}
 */
SmoothScrollBox.prototype.getScrollX = function() {
	if (!this.visible) return 0;
	return this.scrollDiv.scrollLeft / this.currentZoom;
};
/**
 * @param {number} x
 */
SmoothScrollBox.prototype.setScrollX = function(x) {
	this.scrollDiv.scrollLeft = x * this.currentZoom;
	TouchReceiver.setInitialScrollFix(this.scrollDiv);
};
/**
 * @param {number} y
 */
SmoothScrollBox.prototype.setScrollY = function(y) {
	this.scrollDiv.scrollTop = y * this.currentZoom;
	TouchReceiver.setInitialScrollFix(this.scrollDiv);
};

/**
 * Determines whether the scrollBox is currently being scrolled
 * @return {boolean}
 */
SmoothScrollBox.prototype.isMoving = function() {
	return !this.scrollStatus.still;
};