/**
 * Abstract class that controls a dialog with a scrollable region containing a number of rows. Each row normally
 * contains buttons but can also have other types of content. Only one dialog can be visible at any time.
 * The constructor does not draw anything, rather show() must be called.  Calling hide() then show() is used to reload
 * the dialog.  When show() is called, createRow is automatically called to generate each row, which must be implemented
 * by the subclass
 * @param {boolean} autoHeight - Whether the dialog should get taller as number of row increase. Discouraged for
 *                               dialogs that reload frequently
 * @param {string} title - The test to display in the title bar
 * @param {number} rowCount - The number of row to load. Determines how many times createRow is called
 * @param {number} extraTop - The amount of additional space to put between the title bar and the rows (for extra ui)
 * @param {number} extraBottom - The amount of extra space to put below the rows
 * @param {number} [extendTitleBar=0] - The amount the title bar's background should be extended
 * @constructor
 */
function RowDialog(autoHeight, title, rowCount, extraTop, extraBottom, extendTitleBar) {
	if (extendTitleBar == null) {
		extendTitleBar = 0;
	}
	this.autoHeight = autoHeight;
	this.title = title;
	this.rowCount = rowCount;
	this.extraTopSpace = extraTop;
	this.extraBottomSpace = extraBottom;
	this.extendTitleBar = extendTitleBar;
	/* The close/cancel/dismiss buttons at the bottom of the dialog are centeredButtons.  They should be added with
	 * addCenteredButton before show() is called */
	/** @type {Array<object>} - An array of entries including text and callbackFn for each button */
	this.centeredButtons = [];
	/** @type {string} - The text to display if there are no rows. Set using addHintText before show() is called */
	this.hintText = "";
	this.visible = false;
}

RowDialog.setConstants = function() {
	//TODO: This really should be in a separate "setStatics" function, since it isn't a constant
	RowDialog.currentDialog = null;

	RowDialog.titleBarColor = Colors.lightGray;
	RowDialog.titleBarFontC = Colors.white;
	RowDialog.bgColor = Colors.black;
	RowDialog.centeredBnWidth = 100;
	RowDialog.bnHeight = MenuBnList.bnHeight;
	RowDialog.bnMargin = 5;
	RowDialog.titleBarH = RowDialog.bnHeight + RowDialog.bnMargin;

	// The dialog tries to take up a certain ratio of the smaller of the screen's dimensions
	RowDialog.widthRatio = 0.7;
	RowDialog.heightRatio = 0.75;

	// But if that is too small, it uses the min dimensions
	RowDialog.minWidth = 400;
	RowDialog.minHeight = 400;

	RowDialog.hintMargin = 5;
	RowDialog.titleBarFont = Font.uiFont(16).bold();
	RowDialog.hintTextFont = Font.uiFont(16);
	RowDialog.centeredfontWeight = "bold";
	RowDialog.smallBnWidth = 45;
	RowDialog.iconH = 15;
};

/**
 * Adds information for a centered button to the centeredButtons array. The buttons are built when "show" is called
 * They show up at the bottom of the dialog
 * @param {string} text - The text to show on the button
 * @param {function} callbackFn - The function to call when the button is tapped
 */
RowDialog.prototype.addCenteredButton = function(text, callbackFn) {
	let entry = {};
	entry.text = text;
	entry.callbackFn = callbackFn;
	this.centeredButtons.push(entry);
};

/**
 * Builds all the visuals of the dialog and sets the dialog as currentDialog.  Closes any existing dialogs.
 */
RowDialog.prototype.show = function() {
	if (!this.visible) {
		this.visible = true;
		// Close existing dialog if any
		if (RowDialog.currentDialog != null && RowDialog.currentDialog !== this) {
			RowDialog.currentDialog.closeDialog();
		}
		RowDialog.currentDialog = this;
		this.calcHeights();
		this.calcWidths();
		this.x = GuiElements.width / 2 - this.width / 2;
		this.y = GuiElements.height / 2 - this.height / 2;
		this.group = GuiElements.create.group(this.x, this.y);
		this.bgRect = this.drawBackground();

		this.titleRect = this.createTitleRect();
		this.titleText = this.createTitleLabel(this.title);

		// All the rows go in this group, which is scrollable
		this.rowGroup = this.createContent();
		this.createCenteredBns();
		this.scrollBox = this.createScrollBox(); // could be null
		if (this.scrollBox != null) {
			this.scrollBox.show();
		}

		GuiElements.layers.overlay.appendChild(this.group);

		GuiElements.blockInteraction();
	}
};

/**
 * Computes the height of the dialog and its content.
 */
RowDialog.prototype.calcHeights = function() {
	const RD = RowDialog;
	let centeredBnHeight = (RD.bnHeight + RD.bnMargin) * this.centeredButtons.length + RD.bnMargin;
	let nonScrollHeight = RD.titleBarH + centeredBnHeight + RD.bnMargin;
	nonScrollHeight += this.extraTopSpace + this.extraBottomSpace;
	const shorterDim = Math.min(GuiElements.height, GuiElements.width);
	let minHeight = Math.max(shorterDim * RowDialog.heightRatio, RD.minHeight);
	let ScrollHeight = this.rowCount * (RD.bnMargin + RD.bnHeight) - RD.bnMargin;
	let totalHeight = nonScrollHeight + ScrollHeight;
	if (!this.autoHeight) totalHeight = 0;
	this.height = Math.min(Math.max(minHeight, totalHeight), GuiElements.height);
	this.centeredButtonY = this.height - centeredBnHeight + RD.bnMargin;
	this.innerHeight = ScrollHeight;
	this.scrollBoxHeight = Math.min(this.height - nonScrollHeight, ScrollHeight);
	this.scrollBoxY = RD.bnMargin + RD.titleBarH + this.extraTopSpace;
	this.extraTopY = RD.titleBarH;
	this.extraBottomY = this.height - centeredBnHeight - this.extraBottomSpace + RD.bnMargin;
};

/**
 * Computes the width of the dialog and its content.
 */
RowDialog.prototype.calcWidths = function() {
	const RD = RowDialog;
	const shorterDim = Math.min(GuiElements.height, GuiElements.width);
	this.width = Math.min(GuiElements.width, Math.max(shorterDim * RD.widthRatio, RD.minWidth));
	this.scrollBoxWidth = this.width - 2 * RD.bnMargin;
	this.scrollBoxX = RD.bnMargin;
	this.centeredButtonX = this.width / 2 - RD.centeredBnWidth / 2;
	this.contentWidth = this.width - RD.bnMargin * 2;
};

/**
 * Draws the gray background rectangle of the dialog
 * @return {Element} - The SVG rect element
 */
RowDialog.prototype.drawBackground = function() {
	let rect = GuiElements.draw.rect(0, 0, this.width, this.height, RowDialog.bgColor);
	this.group.appendChild(rect);
	return rect;
};

/**
 * Draws the black rect behind the title bar
 * @return {Element} - The SVG rect element
 */
RowDialog.prototype.createTitleRect = function() {
	const RD = RowDialog;
	const rect = GuiElements.draw.rect(0, 0, this.width, RD.titleBarH + this.extendTitleBar, RD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};

/**
 * Draws the title text
 * @param {string} title - The text for the title
 * @return {Element} - The SVG text element
 */
RowDialog.prototype.createTitleLabel = function(title) {
	var RD = RowDialog;
	var textE = GuiElements.draw.text(0, 0, title, RD.titleBarFont, RD.titleBarFontC);
	var x = this.width / 2 - GuiElements.measure.textWidth(textE) / 2;
	var y = RD.titleBarH / 2 + RD.titleBarFont.charHeight / 2;
	GuiElements.move.text(textE, x, y);
	this.group.appendChild(textE);
	return textE;
};

/**
 * Creates the rows of the rowDialog and returns the group containing them
 * @return {Element} the SVG group element containing the rows
 */
RowDialog.prototype.createContent = function() {
	const RD = RowDialog;
	let y = 0;
	const rowGroup = GuiElements.create.group(0, 0);
	if (this.rowCount > 0) {
		for (let i = 0; i < this.rowCount; i++) {
			// Determined by subclass
			this.createRow(i, y, this.contentWidth, rowGroup);
			y += RD.bnHeight + RD.bnMargin;
		}
	} else if (this.hintText !== "") {
		this.createHintText();
	}
	return rowGroup;
};

/**
 * Creates the content for the row at this index and adds it to the contentGroup
 * @param {number} index
 * @param {number} y - The y coord relative to the contentGroup
 * @param {number} width - The width the row should be
 * @param {Element} contentGroup - The SVG group element the content should be added to
 */
RowDialog.prototype.createRow = function(index, y, width, contentGroup) {
	DebugOptions.markAbstract();
};

/**
 * Generates the centered buttons and adds them to the group
 */
RowDialog.prototype.createCenteredBns = function() {
	const RD = RowDialog;
	let y = this.centeredButtonY;
	this.centeredButtonEs = [];
	for (let i = 0; i < this.centeredButtons.length; i++) {
		let bn = this.createCenteredBn(y, this.centeredButtons[i]);
		this.centeredButtonEs.push(bn);
		y += RD.bnHeight + RD.bnMargin;
	}
};

/**
 * Creates a centered button for the given entry
 * @param {number} y - Where the button should be placed vertically
 * @param {object} entry - The information for the button with fields for text and callbackFn
 * @return {Button}
 */
RowDialog.prototype.createCenteredBn = function(y, entry) {
	const RD = RowDialog;
	const button = new Button(this.centeredButtonX, y, RD.centeredBnWidth, RD.bnHeight, this.group);
	button.addText(entry.text, null, null, RD.centeredfontWeight);
	button.setCallbackFunction(entry.callbackFn, true);
	return button;
};

/**
 * Creates the SmoothScrollBox for the dialog
 * @return {SmoothScrollBox}
 */
RowDialog.prototype.createScrollBox = function() {
	if (this.rowCount === 0) return null;
	let x = this.x + this.scrollBoxX;
	let y = this.y + this.scrollBoxY;
	return new SmoothScrollBox(this.rowGroup, GuiElements.layers.frontScroll, x, y,
		this.scrollBoxWidth, this.scrollBoxHeight, this.scrollBoxWidth, this.innerHeight);
};

/**
 * Creates the text below the title bar.  Should only be called if hinText !== "" and there are no rows
 */
RowDialog.prototype.createHintText = function() {
	const RD = RowDialog;
	this.hintTextE = GuiElements.draw.text(0, 0, "", RD.hintTextFont, RD.titleBarFontC);
	GuiElements.update.textLimitWidth(this.hintTextE, this.hintText, this.width);
	let textWidth = GuiElements.measure.textWidth(this.hintTextE);
	let x = this.width / 2 - textWidth / 2;
	let y = this.scrollBoxY + RD.hintTextFont.charHeight + RD.hintMargin;
	GuiElements.move.text(this.hintTextE, x, y);
	this.group.appendChild(this.hintTextE);
};

/**
 * Removes the dialog from view and unblocks the ui behind it.  Subclasses to cleanup here.
 */
RowDialog.prototype.closeDialog = function() {
	if (this.visible) {
		this.hide();
		GuiElements.unblockInteraction();
	}
};

/**
 * Gets the amount the user has scrolled the contentGroup
 * @return {number}
 */
RowDialog.prototype.getScroll = function() {
	if (this.scrollBox == null) return 0;
	return this.scrollBox.getScrollY();
};

/**
 * Sets scroll to a certain amount.  Used when content is reloaded
 * @param y
 */
RowDialog.prototype.setScroll = function(y) {
	if (this.scrollBox == null) return;
	this.scrollBox.setScrollY(y);
};

/**
 * Reloads the dialog if the zoom level changes
 */
RowDialog.prototype.updateZoom = function() {
	if (this.visible) {
		let scroll = this.getScroll();
		this.closeDialog();
		this.show();
		this.setScroll(scroll);
	}
};

/**
 * Notifies the open dialog that the zoom level has changed
 */
RowDialog.updateZoom = function() {
	if (RowDialog.currentDialog != null) {
		RowDialog.currentDialog.updateZoom();
	}
};

/**
 * Removes the content of the dialog from view, but does not unblock the UI or preform cleanup
 */
RowDialog.prototype.hide = function() {
	if (this.visible) {
		this.visible = false;
		this.group.remove();
		if (this.scrollBox != null) {
			this.scrollBox.hide();
		}
		this.scrollBox = null;
		if (RowDialog.currentDialog === this) {
			RowDialog.currentDialog = null;
		}
	}
};

/**
 * Rebuild the dialog.  Called when the content of the rows change
 * @param {number} rowCount - The new number of rows
 */
RowDialog.prototype.reloadRows = function(rowCount) {
	this.rowCount = rowCount;
	if (this.visible) {
		let scroll = this.getScroll();
		this.hide();
		this.show();
		this.setScroll(scroll);
	}
};

/**
 * Determines whether the rowDialog is currently scrolling, so subclasses can avoid reloading it while it is moving
 * @return {boolean}
 */
RowDialog.prototype.isScrolling = function() {
	if (this.scrollBox != null) {
		return this.scrollBox.isMoving();
	}
	return false;
};
RowDialog.prototype.addHintText = function(hintText) {
	this.hintText = hintText;
};
RowDialog.prototype.getExtraTopY = function() {
	return this.extraTopY;
};
RowDialog.prototype.getExtraBottomY = function() {
	return this.extraBottomY;
};
RowDialog.prototype.getContentWidth = function() {
	return this.contentWidth;
};
RowDialog.prototype.getCenteredButton = function(i) {
	return this.centeredButtonEs[i];
};
RowDialog.prototype.contentRelToAbsX = function(x) {
	if (!this.visible) return x;
	return this.scrollBox.relToAbsX(x);
};
RowDialog.prototype.contentRelToAbsY = function(y) {
	if (!this.visible) return y;
	return this.scrollBox.relToAbsY(y);
};
RowDialog.createMainBn = function(bnWidth, x, y, contentGroup, callbackFn) {
	var RD = RowDialog;
	var button = new Button(x, y, bnWidth, RD.bnHeight, contentGroup);
	if (callbackFn != null) {
		button.setCallbackFunction(callbackFn, true);
	}
	button.makeScrollable();
	return button;
};
RowDialog.createMainBnWithText = function(text, bnWidth, x, y, contentGroup, callbackFn) {
	var button = RowDialog.createMainBn(bnWidth, x, y, contentGroup, callbackFn);
	button.addText(text);
	return button;
};
RowDialog.createSmallBn = function(x, y, contentGroup, callbackFn) {
	var RD = RowDialog;
	var button = new Button(x, y, RD.smallBnWidth, RD.bnHeight, contentGroup);
	if (callbackFn != null) {
		button.setCallbackFunction(callbackFn, true);
	}
	button.makeScrollable();
	return button;
};
RowDialog.createSmallBnWithIcon = function(iconId, x, y, contentGroup, callbackFn) {
	let RD = RowDialog;
	let button = RowDialog.createSmallBn(x, y, contentGroup, callbackFn);
	button.addIcon(iconId, RD.iconH);
	return button;
};