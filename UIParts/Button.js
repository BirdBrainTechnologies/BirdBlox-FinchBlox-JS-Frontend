/**
 * A key UI element that creates a button.  Buttons can trigger a function when they are pressed/released and
 * can contain an icon, image, text, or combination.  They are drawn as soon as the constructor is called, and
 * can ten have text and callbacks added on.
 *
 * @param {number} x - The x coord the button should appear at
 * @param {number} y - The y coord the button should appear at
 * @param {number} width - The width of the button
 * @param {number} height - The height of the button
 * @param {Element} [parent] - The group the button should append itself to
 * @param {string} color - (optional) background color for the button
 * @param {number} rx - (optional) Corner rounding parameter
 * @param {number} ry - (optional) Corner rounding parameter
 * @constructor
 */
function Button(x, y, width, height, parent, color, rx, ry) {
	DebugOptions.validateNumbers(x, y, width, height);
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.parentGroup = parent;
	this.group = GuiElements.create.group(x, y, parent);
  //color for the background of the button
  if (color != null){
    this.bg = color;
  } else {
    this.bg = Button.bg;
  }
  this.rx = rx;
  this.ry = ry;
	this.buildBg();
	this.pressed = false;
	this.enabled = true;
	this.hasText = false;
	this.hasIcon = false;
	this.hasImage = false;
	this.textInverts = false;   // Whether the text inverts color when the button is pressed
	this.iconInverts = false;   // Whether the icon inverts color when the button is pressed
	this.callback = null;   // The function to call when the button is pressed
	this.delayedCallback = null;   // The function to call when the button is released
	this.toggles = false;   // Whether the button should stick in the pressed state until tapped again
	this.unToggleFunction = null;   // The function to call when the button is tapped to make is stop being pressed
	this.longTouchFunction = null;   // The function to call when the button is long pressed
	this.disabledTapCallback = null;   // Called when the user taps a disabled function
	this.toggled = false;   // Whether the button is currently stuck in the pressed state (only if it toggles)
	this.partOfOverlay = null;   // The overlay the button is a part of (if any)
	this.scrollable = false;   // Whether the button is part of something that scrolls and shouldn't prevent scrolling
}

Button.setGraphics = function() {
	Button.bg = Colors.bbt;
	Button.foreground = Colors.white;
	// "highlight" = color when pressed
	Button.highlightBg = Colors.white;
	Button.highlightFore = Colors.bbt;
	Button.disabledBg = Colors.darkGray;
	Button.disabledFore = Colors.black;

	// The suggested margin between adjacent margins
  if (FinchBlox){
    Button.defaultMargin = 10;
  } else {
    Button.defaultMargin = 5;
  }

	// The suggested font for the forground of buttons
	Button.defaultFont = Font.uiFont(16);

	Button.defaultIconH = 15;
	Button.defaultSideMargin = 10;
};

/**
 * Creates the rectangle that is the background of the button
 */
Button.prototype.buildBg = function() {
	this.bgRect = GuiElements.draw.rect(0, 0, this.width, this.height, this.bg, this.rx, this.ry);
	this.group.appendChild(this.bgRect);
	TouchReceiver.addListenersBN(this.bgRect, this);
};

/**
 * Adds text to the button
 * @param {string} text - The text to add
 * @param {Font} [font] - The font to use (defaultFont if unspecified)
 * @param {string} color - (optional) Color for the text. Use Button.foreground if unspecified
 */
Button.prototype.addText = function(text, font, color) {
	DebugOptions.validateNonNull(text);
	this.removeContent();
	if (font == null) {
		font = Button.defaultFont;
	}
  if (color == null) {
    color = Button.foreground;
  }
	this.textInverts = true;

	this.textE = GuiElements.draw.text(0, 0, "", font, color);
	GuiElements.update.textLimitWidth(this.textE, text, this.width);
	this.group.appendChild(this.textE);

	// Text is centered
	const textW = GuiElements.measure.textWidth(this.textE);
	const textX = (this.width - textW) / 2;
	const textY = (this.height + font.charHeight) / 2;
	GuiElements.move.text(this.textE, textX, textY);
	this.hasText = true;
	TouchReceiver.addListenersBN(this.textE, this);
};

/**
 * Adds an icon to the button
 * @param {object} pathId - Entry from VectorPaths
 * @param {number} height - The height the icon should have in the button
 * @param {number} xOffset - Distance from center to place icon. Default 0.
 * @param {boolean} mirror - True if the icon should be mirrored for rtl languages
 */
Button.prototype.addIcon = function(pathId, height, xOffset, mirror) {
	if (height == null) {
		height = Button.defaultIconH;
	}
	if (xOffset == null) {
		xOffset = 0;
	}
	this.removeContent();
	this.hasIcon = true;
	this.iconInverts = true;
	// Icon is centered vertically and horizontally.
	const iconW = VectorIcon.computeWidth(pathId, height);
	const iconX = xOffset + (this.width - iconW) / 2;
	const iconY = (this.height - height) / 2;
	this.icon = new VectorIcon(iconX, iconY, pathId, Button.foreground, height, this.group, mirror);
	TouchReceiver.addListenersBN(this.icon.pathE, this);
};

/**
 * Adds an icon and text to the button, with the icon to the left of the text separated by the specified sideMargin,
 * in the center of the button
 * @param {object} pathId - Entry from VectorPaths
 * @param {number|null} [iconHeight] - The height the icon should have in the button
 * @param {number|null} [sideMargin] - The space between the icon and the text
 * @param {string} text - The text to show
 * @param {Font|null} [font] - The font to use
 * @param {string|null} [color=null] - Color in hex, or null if text inverts and uses foreground color
 */
Button.prototype.addCenteredTextAndIcon = function(pathId, iconHeight, sideMargin, text, font, color) {
	this.removeContent();
	if (color == null) {
		color = Button.foreground;
		this.textInverts = true;
		this.iconInverts = true;
	}
	if (font == null) {
		font = Button.defaultFont;
	}
	if (iconHeight == null) {
		iconHeight = Button.defaultIconH;
	}
	if (sideMargin == null) {
		sideMargin = Button.defaultSideMargin;
	}
	this.hasIcon = true;
	this.hasText = true;

	const iconW = VectorIcon.computeWidth(pathId, iconHeight);
	this.textE = GuiElements.draw.text(0, 0, "", font, color);
	GuiElements.update.textLimitWidth(this.textE, text, this.width - iconW - sideMargin);
	this.group.appendChild(this.textE);
	const textW = GuiElements.measure.textWidth(this.textE);
	const totalW = textW + iconW + sideMargin;
	const iconX = (this.width - totalW) / 2;
	const iconY = (this.height - iconHeight) / 2;
	const textX = iconX + iconW + sideMargin;
	const textY = (this.height + font.charHeight) / 2;
	GuiElements.move.text(this.textE, textX, textY);
	TouchReceiver.addListenersBN(this.textE, this);
	this.icon = new VectorIcon(iconX, iconY, pathId, color, iconHeight, this.group);
	TouchReceiver.addListenersBN(this.icon.pathE, this);
};

/**
 * Adds an icon and text to the button, with the icon aligned to the left/right and the text centered.
 *
 * @param {object} pathId - Entry from VectorPaths
 * @param {number|null} [iconHeight] - The height the icon should have in the button
 * @param {string} text - The text to show
 * @param {Font|null} [font] - The font to use
 * @param {string|null} [color=null] - Color in hex, or null if text inverts and uses foreground color
 * @param {string|null} [iconColor=null] - Color in hex, or null if icon inverts and uses foreground color
 * @param {boolean} leftSide - Whether the icon should be aligned to the left or right of the button
 * @param {boolean} shiftCenter - Whether the text should be aligned to the center of the remaining space or
 *                                the center of the entire button
 */
Button.prototype.addSideTextAndIcon = function(pathId, iconHeight, text, font, color, iconColor, leftSide, shiftCenter) {
	this.removeContent();
	if (color == null) {
		color = this.currentForeground();
		this.textInverts = true;
	}
	if (iconColor == null) {
		iconColor = this.currentForeground();
		this.iconInverts = true;
	}
	if (font == null) {
		font = Button.defaultFont;
	}
	if (iconHeight == null) {
		iconHeight = Button.defaultIconH;
	}
	if (leftSide == null) {
		leftSide = true;
	}
	if (shiftCenter == null) {
		shiftCenter = true;
	}
	this.hasIcon = true;
	this.hasText = true;

	/* Margin between icon and side of button is equal to vertical margin */
	const sideMargin = (this.height - iconHeight) / 2;
	const iconW = VectorIcon.computeWidth(pathId, iconHeight);
	this.textE = GuiElements.draw.text(0, 0, "", font, color);
	/* Text must leave space for icon, margin between icon and text, and margins for both sides */
	const textMaxW = this.width - iconW - sideMargin * 3;
	GuiElements.update.textLimitWidth(this.textE, text, textMaxW);
	this.group.appendChild(this.textE);
	const textW = GuiElements.measure.textWidth(this.textE);

	let iconX;
	if (leftSide) {
		iconX = sideMargin;
	} else {
		iconX = this.width - iconW - sideMargin;
	}
	const iconY = (this.height - iconHeight) / 2;

	let textX;
	if (!shiftCenter) {
		textX = (this.width - textW) / 2;
	} else if (leftSide) {
		textX = (iconX + iconW + this.width - textW) / 2;
	} else {
		textX = (this.width - textW - iconW - sideMargin) / 2;
	}

	if (leftSide) {
		textX = Math.max(textX, iconX + iconW + sideMargin);
	} else {
		textX = Math.min(textX, iconX - textW - sideMargin);
	}

	const textY = (this.height + font.charHeight) / 2;
	GuiElements.move.text(this.textE, textX, textY);
	TouchReceiver.addListenersBN(this.textE, this);
	this.icon = new VectorIcon(iconX, iconY, pathId, iconColor, iconHeight, this.group);
	TouchReceiver.addListenersBN(this.icon.pathE, this);
};

/**
 * Adds an image to the button.  Use of images is discouraged since they can take time to load.  No images are used
 * as of right now.
 * @param {object} imageData - has entries for width, height, lightName, darkName.
 * @param {number} height - The height the image should have
 */
Button.prototype.addImage = function(imageData, height) {
	this.removeContent();
	const imageW = imageData.width / imageData.height * height;
	const imageX = (this.width - imageW) / 2;
	const imageY = (this.height - height) / 2;
	this.imageE = GuiElements.draw.image(imageData.lightName, imageX, imageY, imageW, height, this.group);
	this.imageData = imageData;
	this.hasImage = true;
	TouchReceiver.addListenersBN(this.imageE, this);
};

/**
 * Adds a colored icon to the button that does not invert when the icon is tapped
 * TODO: combine with addIcon using a nullable parameter for color
 * @param {object} pathId - Entry from VectorPaths
 * @param {number} height - The height of the icon
 * @param {string} color - Color in hex
 */
Button.prototype.addColorIcon = function(pathId, height, color) {
	this.removeContent();
	this.hasIcon = true;
	this.iconInverts = false;
	const iconW = VectorIcon.computeWidth(pathId, height);
	const iconX = (this.width - iconW) / 2;
	const iconY = (this.height - height) / 2;
	this.icon = new VectorIcon(iconX, iconY, pathId, color, height, this.group);
	TouchReceiver.addListenersBN(this.icon.pathE, this);
};

Button.prototype.addSecondIcon = function(pathId, height, color, rotation) {
  const iconW = VectorIcon.computeWidth(pathId, height);
	const iconX = (this.width - iconW) / 2;
	const iconY = (this.height - height) / 2;
	this.icon2 = new VectorIcon(iconX, iconY, pathId, color, height, this.group, null, rotation);
	TouchReceiver.addListenersBN(this.icon2.pathE, this);
};

/**
 * Removes all icons/images/text in the button so it can be replaced
 */
Button.prototype.removeContent = function() {
	if (this.hasIcon) {
		this.icon.remove();
	}
	if (this.hasImage) {
		this.imageE.remove();
	}
	if (this.hasText) {
		this.textE.remove();
	}
};

/**
 * Sets a function to call when the button is interacted with
 * @param {function} callback
 * @param {boolean} delay - Whether the function should be called when the Button is released vs tapped
 */
Button.prototype.setCallbackFunction = function(callback, delay) {
	if (delay) {
		this.delayedCallback = callback;
	} else {
		this.callback = callback;
	}
};

/**
 * Sets the function to call when the button is untoggled and enables toggling
 * @param {function} callback
 */
Button.prototype.setUnToggleFunction = function(callback) {
	this.unToggleFunction = callback;
	this.toggles = true;
};

/**
 * Sets a function to call when the button is long touched
 * @param {function} callback
 */
Button.prototype.setLongTouchFunction = function(callback) {
	this.longTouchFunction = callback;
};

Button.prototype.setDisabledTabFunction = function(callback) {
	this.disabledTapCallback = callback;
};

/**
 * Disables the button so it cannot be interacted with
 */
Button.prototype.disable = function() {
	if (this.enabled) {
		this.enabled = false;
		this.pressed = false;
		this.bgRect.setAttributeNS(null, "fill", Button.disabledBg);
		if (this.hasText && this.textInverts) {
			this.textE.setAttributeNS(null, "fill", Button.disabledFore);
		}
		if (this.hasIcon && this.iconInverts) {
			this.icon.setColor(Button.disabledFore);
		}
	}
};

/**
 * Enables the button so it is interactive again
 */
Button.prototype.enable = function() {
	if (!this.enabled) {
		this.enabled = true;
		this.pressed = false;
		this.setColor(false);
	}
};

/**
 * Presses the button
 */
Button.prototype.press = function() {
	if (!this.pressed) {
		this.pressed = true;
		if (!this.enabled) return;
		this.setColor(true);
		if (this.callback != null) {
			this.callback();
		}
	}
};

/**
 * Releases the Button
 */
Button.prototype.release = function() {
	if (this.pressed) {
		this.pressed = false;
		if (!this.enabled) {
			if (this.disabledTapCallback != null) {
				this.disabledTapCallback();
			}
			return;
		}
		if (!this.toggles || this.toggled) {
			this.setColor(false);
		}
		if (this.toggles && this.toggled) {
			this.toggled = false;
			this.unToggleFunction();
		} else {
			if (this.delayedCallback != null) {
				this.delayedCallback();
			}
			if (this.toggles && !this.toggled) {
				this.toggled = true;
			}
		}
	}
};

/**
 * Removes the Button's visual highlight without triggering any actions
 */
Button.prototype.interrupt = function() {
	if (this.pressed && !this.toggles) {
		this.pressed = false;
		if (!this.enabled) return;
		this.setColor(false);
	}
};

/**
 * Tells the button to exit the toggled state
 */
Button.prototype.unToggle = function() {
	if (this.enabled && this.toggled) {
		this.setColor(false);
	}
	this.toggled = false;
	this.pressed = false;
};

/**
 * Runs the long touch function
 * @return {boolean} - whether the long touch function is non-null
 */
Button.prototype.longTouch = function() {
	if (this.longTouchFunction != null) {
		this.longTouchFunction();
		return true;
	}
	return false;
};

/**
 * Removes the Button (supposed to be permanent)
 */
Button.prototype.remove = function() {
	this.group.remove();
};

/**
 * Hides the button temporarily
 */
Button.prototype.hide = function() {
	this.group.remove();
};

/**
 * Makes the Button visible again
 */
Button.prototype.show = function() {
	this.parentGroup.appendChild(this.group);
};

/**
 * Moves the Button to the specified location
 * @param {number} x
 * @param {number} y
 */
Button.prototype.move = function(x, y) {
	this.x = x;
	this.y = y;
	GuiElements.move.group(this.group, this.x, this.y);
};

/**
 * Sets the color of the button and foreground to match the pressed/released state
 * @param {boolean} isPressed - Whether the button is pressed
 */
Button.prototype.setColor = function(isPressed) {
  if (isPressed && FinchBlox) {
    let darkColor = Colors.darkenColor(this.bg, 0.8);
    this.bgRect.setAttributeNS(null, "fill", darkColor);
	} else if (isPressed) {
		this.bgRect.setAttributeNS(null, "fill", Button.highlightBg);
		if (this.hasText && this.textInverts) {
			this.textE.setAttributeNS(null, "fill", Button.highlightFore);
		}
		if (this.hasIcon && this.iconInverts) {
			this.icon.setColor(Button.highlightFore);
		}
		if (this.hasImage) {
			GuiElements.update.image(this.imageE, this.imageData.darkName);
		}
	} else if (FinchBlox) {
    this.bgRect.setAttributeNS(null, "fill", this.bg);
    if (this.hasIcon) { this.icon.setColor(Button.foreground); }
  } else {
		this.bgRect.setAttributeNS(null, "fill", this.bg);
		if (this.hasText && this.textInverts) {
			this.textE.setAttributeNS(null, "fill", Button.foreground);
		}
		if (this.hasIcon && this.iconInverts) {
			this.icon.setColor(Button.foreground);
		}
		if (this.hasImage) {
			GuiElements.update.image(this.imageE, this.imageData.lightName);
		}
	}
};

/**
 * Marks that the Button is part of something that scrolls so it doesn't stop scrolling when it is tapped
 * (using preventDefault in TouchReceiver)
 */
Button.prototype.makeScrollable = function() {
	this.scrollable = true;
};

/**
 * Retrieves the current foreground color to use, based on the Button's state
 * @return {*}
 */
Button.prototype.currentForeground = function() {
	if (!this.enabled) {
		return Button.disabledFore;
	} else if (this.pressed) {
		return Button.highlightFore;
	} else {
		return Button.foreground;
	}
};

/**
 * Marks that the Button is part of the specified overlay so it doesn't close it when tapped
 * @param {Overlay} overlay
 */
Button.prototype.markAsOverlayPart = function(overlay) {
	this.partOfOverlay = overlay;
};

/**
 * Removes the marking that the Button is part of an overlay
 */
Button.prototype.unmarkAsOverlayPart = function() {
	this.partOfOverlay = null;
};
