/**
 * Abstract class that represents a menu displayed when a Button in the TitleBar is tapped.  The Menu requires a button
 * to attach to, which it automatically configures the callbacks for.  Subclasses override the loadOptions function
 * which is called every time the Menu is open and should call addOption() to determine which options to show. If the
 * width of the menu is unspecified, it will be set to default
 *
 * @param {Button} button - The Button the Menu should attach to
 * @param {number} [width] - The width of the Menu
 * @constructor
 */
function Menu(button, width) {
	if (width == null) {
		width = Menu.defaultWidth;
	}
	// Menus are a type of Overlay
	Overlay.call(this, Overlay.types.menu);
	DebugOptions.validateNumbers(width);
	this.width = width;
	// The position of the menu is determined by the button
	this.x = button.x;
	this.y = button.y + button.height;
	this.group = GuiElements.create.group(this.x, this.y);
	TouchReceiver.addListenersOverlayPart(this.group);
	this.bgRect = GuiElements.create.rect(this.group);
	GuiElements.update.color(this.bgRect, Menu.bgColor);
	this.menuBnList = null;
	this.visible = false;

	// Configure callbacks
	button.setCallbackFunction(this.open.bind(this), false);
	button.setToggleFunction(this.close.bind(this));

	this.button = button;

	/* The alternateFn is specified using addAlternateFn() and is called if previewOpen returns false */
	this.alternateFn = null;
	this.scheduleAlternate = false;
}
Menu.prototype = Object.create(Overlay.prototype);
Menu.prototype.constructor = Menu;

Menu.setGraphics = function() {
	Menu.defaultWidth = 170;
	Menu.bnMargin = Button.defaultMargin;
	Menu.bgColor = Colors.black;
};

/**
 * Recomputes the Menu's location based on the location of the Button
 */
Menu.prototype.move = function() {
	this.x = this.button.x;
	this.y = this.button.y + this.button.height;
	GuiElements.move.group(this.group, this.x, this.y);
	if (this.menuBnList != null) {
		this.menuBnList.updatePosition();
	}
};

/**
 * Generates the SmoothMenuBnList for the Menu
 */
Menu.prototype.createMenuBnList = function() {
	if (this.menuBnList != null) {
		this.menuBnList.hide();
	}
	const bnM = Menu.bnMargin;
	this.menuBnList = new SmoothMenuBnList(this, this.group, bnM, bnM, this.width);
	this.menuBnList.markAsOverlayPart(this);
	const maxH = GuiElements.height - this.y - Menu.bnMargin * 2;
	this.menuBnList.setMaxHeight(maxH);
};

/**
 * Adds an option to the menu.  Should be called within the loadOptions function
 * @param {string} text - The text to display the option
 * @param {function} func - type () -> (), the function to call when the option is tapped
 * @param {boolean} [close=true] - Whether the Menu should close or remain open when the option is selected
 * @param {function} [addTextFn] - type (Button) -> (), the function to call on the button to add the text.
 *                                 If provided, no text will be added to the button; rather the function is expected
 *                                 to do all formatting.
 */
Menu.prototype.addOption = function(text, func, close, addTextFn) {
	if (addTextFn == null) {
		addTextFn = null;
	}
	if (close == null) {
		close = true;
	}
	this.menuBnList.addOption(text, function() {
		if (close) {
			this.close();
		}
		if (func != null) {
			func.call(this);
		}
	}.bind(this), addTextFn);
};

/**
 * Creates the buttons and background of the menu
 */
Menu.prototype.buildMenu = function() {
	const mBL = this.menuBnList;
	mBL.generateBns();
	GuiElements.update.rect(this.bgRect, 0, 0, mBL.width + 2 * Menu.bnMargin, mBL.height + 2 * Menu.bnMargin);
};

/**
 * Determines whether the Menu should open or the alternate function should be run.  The alternate function is run after
 * the user releases the button, so it must be scheduled, not run immediately.
 * @return {boolean}
 */
Menu.prototype.previewOpen = function() {
	// By default, the Menu always opens.  But subclasses like the DeviceMenu override this method
	return true;
};

/**
 * Abstract function that is called when the Menu opens to populate the options.  Calls addOption for each option
 */
Menu.prototype.loadOptions = function() {
	DebugOptions.markAbstract();
};
Menu.prototype.open = function() {
	if (!this.visible) {
		if (this.previewOpen()) {
			this.createMenuBnList();
			this.loadOptions();
			this.buildMenu();
			GuiElements.layers.overlay.appendChild(this.group);
			this.menuBnList.show();
			this.visible = true;
			this.addOverlayAndCloseOthers();
			this.button.markAsOverlayPart(this);
			this.scheduleAlternate = false;
		} else {
			this.button.toggled = true;
			this.scheduleAlternate = true;
		}
	}
};

/**
 * closes the Menu
 * @inheritDoc
 */
Menu.prototype.close = function() {
	if (this.visible) {
		this.group.remove();
		this.menuBnList.hide();
		this.visible = false;
		Overlay.removeOverlay(this);
		this.button.unToggle();
		this.button.unmarkAsOverlayPart();
	} else if (this.scheduleAlternate) {
		this.scheduleAlternate = false;
		this.alternateFn();
	}
};

/**
 * Sets a function which is called when previewOpen returns false
 * @param {function} alternateFn - type () -> ()
 */
Menu.prototype.addAlternateFn = function(alternateFn) {
	this.alternateFn = alternateFn;
};

/**
 * @param {number} x
 * @return {number}
 */
Menu.prototype.relToAbsX = function(x) {
	return x + this.x;
};
/**
 * @param {number} y
 * @return {number}
 */
Menu.prototype.relToAbsY = function(y) {
	return y + this.y;
};

/**
 * Resizes and repositions the menu
 */
Menu.prototype.updateZoom = function() {
	if (this.menuBnList != null) {
		this.menuBnList.updateZoom();
	}
};