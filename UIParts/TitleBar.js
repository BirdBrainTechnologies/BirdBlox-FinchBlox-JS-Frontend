/**
 * The bar at the top of the screen.  The TitleBar is a static class which builds the title bar when TitleBar() is
 * called by GuiElements.  It changes its appearance on small screens, becoming shorter and adding a show/hide button
 * to show/hide the BlockPalette.  Its title shows the name of the current project.
 */
function TitleBar() {
	let TB = TitleBar;
	TB.titleTextVisble = true;
	TB.titleText = "";
	TB.prevTitleText = "";
	TB.debugEnabled = false;
	TitleBar.createBar();
	TitleBar.makeButtons();
	TitleBar.makeTitleText();
}

/**
 * The TitleBar must set certain graphics before the BlockPalette, but others after.  Thus it has two setGraphics
 * functions.
 */
TitleBar.setGraphicsPart1 = function() {
	const TB = TitleBar;
	if (GuiElements.smallMode) {
		TB.height = 35;
		TB.buttonMargin = Button.defaultMargin / 2;
	} else {
		TB.height = 54;
		TB.buttonMargin = Button.defaultMargin;
	}
	TB.width = GuiElements.width;
	TB.buttonW = TB.height * 64 / 54;

	const maxBnWidth = (TB.width - 11 * TB.buttonMargin - DeviceStatusLight.radius * 2) / 7;
	TB.buttonW = Math.min(maxBnWidth, TB.buttonW);

	TB.longButtonW = 85;
	TB.bnIconMargin = 3;

	TB.bg = Colors.lightGray;
	TB.flagFill = Colors.green;
	TB.batteryFill = Colors.lightGray;
	TB.stopFill = Colors.red;
	TB.titleColor = Colors.white;
	TB.font = Font.uiFont(16).bold();

	TB.buttonH = TB.height - 2 * TB.buttonMargin;
	TB.bnIconH = TB.buttonH - 2 * TB.bnIconMargin;
	const maxIconHeight = maxBnWidth * 0.7;
	TB.bnIconH = Math.min(maxIconHeight, TB.bnIconH);
	TB.shortButtonW = TB.buttonH;
	TB.shortButtonW = TB.buttonW;

};

TitleBar.setGraphicsPart2 = function() {
	/* Compute the locations of all the buttons */
	const TB = TitleBar;
	TB.stopBnX = GuiElements.width - TB.buttonW - TB.buttonMargin;
	TB.flagBnX = TB.stopBnX - TB.buttonW - TB.buttonMargin;
	TB.undoBnX = TB.flagBnX - TB.buttonW - TB.buttonMargin;
	TB.batteryBnX  = TB.undoBnX - TB.buttonW - TB.buttonMargin;
	TB.debugX = TB.batteryBnX - TB.longButtonW - TB.buttonMargin;

	TB.fileBnX = TB.buttonMargin;
	TB.viewBnX = TB.fileBnX + TB.buttonMargin + TB.buttonW;
	TB.hummingbirdBnX = TB.viewBnX + TB.buttonMargin + TB.buttonW;

	TB.titleLeftX = BlockPalette.width;
	TB.titleRightX = TB.undoBnX - TB.buttonMargin;
	TB.titleWidth = TB.titleRightX - TB.titleLeftX;

	let suggestedUndoBnX = TB.hummingbirdBnX + TB.buttonW + TB.buttonMargin;
	if (TB.undoBnX < suggestedUndoBnX) {
		TB.hummingbirdBnX = TB.undoBnX - TB.buttonW - TB.buttonMargin;
	}
	TB.statusX = TB.hummingbirdBnX + 2 * TB.buttonMargin;
};

/**
 * Creates the rectangle for the TitleBar
 */
TitleBar.createBar = function() {
	const TB = TitleBar;
	TB.bgRect = GuiElements.draw.rect(0, 0, TB.width, TB.height, TB.bg);
	GuiElements.layers.titleBg.appendChild(TB.bgRect);
};

/**
 * Creates all the buttons and menus
 */
TitleBar.makeButtons = function() {
	const TB = TitleBar;
	const TBLayer = GuiElements.layers.titlebar;
	TB.flagBn = new Button(TB.flagBnX, TB.buttonMargin, TB.buttonW, TB.buttonH, TBLayer);
	TB.flagBn.addColorIcon(VectorPaths.flag, TB.bnIconH, TB.flagFill);
	TB.flagBn.setCallbackFunction(CodeManager.eventFlagClicked, false);
	TB.stopBn = new Button(TB.stopBnX, TB.buttonMargin, TB.buttonW, TB.buttonH, TBLayer);
	TB.stopBn.addColorIcon(VectorPaths.stop, TB.bnIconH, TB.stopFill);
	TB.stopBn.setCallbackFunction(CodeManager.stop, false);
	TB.batteryBn = new Button(TB.batteryBnX, TB.buttonMargin, TB.buttonW, TB.buttonH, TBLayer);
  TB.batteryBn.addColorIcon(VectorPaths.battery, TB.bnIconH, TB.batteryFill);
  TB.batteryMenu = new BatteryMenu(TB.batteryBn);

	TB.hummingbirdBn = new Button(TB.hummingbirdBnX, TB.buttonMargin, TB.longButtonW, TB.buttonH, TBLayer);
	const hbBnIconOffset = 2 * TB.buttonMargin;
	TB.hummingbirdBn.addIcon(VectorPaths.connect, TB.bnIconH * 0.8, hbBnIconOffset);
	TB.hummingbirdMenu = new DeviceMenu(TB.hummingbirdBn);
	TB.deviceStatusLight = new DeviceStatusLight(TB.statusX, TB.height / 2, TBLayer, DeviceManager);

	TB.fileBn = new Button(TB.fileBnX, TB.buttonMargin, TB.buttonW, TB.buttonH, TBLayer);
	TB.fileBn.addIcon(VectorPaths.file, TB.bnIconH);
	TB.fileBn.setCallbackFunction(OpenDialog.closeFileAndShowDialog, true);

	TB.viewBn = new Button(TB.viewBnX, TB.buttonMargin, TB.buttonW, TB.buttonH, TBLayer);
	TB.viewBn.addIcon(VectorPaths.settings, TB.bnIconH);
	TB.viewMenu = new SettingsMenu(TB.viewBn);
	TB.viewBn.setLongTouchFunction(function() {
		//DialogManager.showAlertDialog("Test", "Test", "Test");
		GuiElements.alert("Long touch");
		TB.viewMenu.reloadAdvanced();
	});

	TB.undoButton = new Button(TB.undoBnX, TB.buttonMargin, TB.buttonW, TB.buttonH, TBLayer);
	TB.undoButton.addIcon(VectorPaths.undoDelete, TB.bnIconH * 0.9);
	UndoManager.setUndoButton(TB.undoButton);

	TB.debugBn = null;
	if (TB.debugEnabled) {
		TB.enableDebug();
	}
};

/**
 * Removes all the buttons so they can be redrawn
 */
TitleBar.removeButtons = function() {
	let TB = TitleBar;
	TB.flagBn.remove();
	TB.stopBn.remove();
	TB.fileBn.remove();
	TB.viewBn.remove();
	TB.undoButton.remove();
	TB.hummingbirdBn.remove();
	TB.batteryBn.remove();
	if (TB.debugBn != null) TB.debugBn.remove();
	if (TB.showHideBn != null) TB.showHideBn.remove();
	TB.deviceStatusLight.remove();
};

/**
 * Makes the text element for the TitleBar
 */
TitleBar.makeTitleText = function() {
	const TB = TitleBar;
	TB.titleLabel = GuiElements.draw.text(0, 0, "", TB.font, TB.titleColor);
	GuiElements.layers.titlebar.appendChild(TB.titleLabel);
};



/**
 * Sets the text of the TitleBar
 * @param {string|null} text - The text to display or null if there is no text
 */
TitleBar.setText = function(text) {
	const TB = TitleBar;
	if (text == null) text = TB.prevTitleText;
	else TB.prevTitleText = text;
	TB.titleText = text;
	TitleBar.updateText();
};

/**
 * Moves the text to the correct position
 */
TitleBar.updateText = function() {
	let TB = TitleBar;
	if (GuiElements.width < BlockPalette.width * 2) {
		if (TB.titleTextVisble) {
			// The text doesn't fit.  Hide it.
			TB.titleLabel.remove();
			TB.titleTextVisble = false;
		}
	} else {
		if (!TB.titleTextVisble) {
			// The text fits but is hidden. Show it.
			GuiElements.layers.titlebar.appendChild(TB.titleLabel);
			TB.titleTextVisble = true;
		}
		let maxWidth = TB.titleWidth;
		GuiElements.update.textLimitWidth(TB.titleLabel, TB.titleText, maxWidth);
		let width = GuiElements.measure.textWidth(TB.titleLabel);
		let x = GuiElements.width / 2 - width / 2;
		let y = TB.height / 2 + TB.font.charHeight / 2;
		if (x < TB.titleLeftX) {
			x = TB.titleLeftX;
		} else if (x + width > TB.titleRightX) {
			x = TB.titleRightX - width;
		}
		GuiElements.move.text(TB.titleLabel, x, y);
	}
};

/**
 * Builds the debug Button
 */
TitleBar.enableDebug = function() {
	const TB = TitleBar;
	TB.debugEnabled = true;
	const TBLayer = GuiElements.layers.titlebar;
	if (TB.debugBn == null) {
		TB.debugBn = new Button(TB.debugX, TB.buttonMargin, TB.longButtonW, TB.buttonH, TBLayer);
		TB.debugBn.addText("Debug");
		TB.debugMenu = new DebugMenu(TB.debugBn);
	}
};

/**
 * Hides the debug button
 */
TitleBar.hideDebug = function() {
	TitleBar.debugEnabled = false;
	TitleBar.debugBn.remove();
	TitleBar.debugBn = null;
};

/**
 * Like setGraphics, there are two updateZoom functions
 */
TitleBar.updateZoomPart1 = function() {
	TitleBar.setGraphicsPart1();
};

/**
 * Redraws the buttons
 */
TitleBar.updateZoomPart2 = function() {
	let TB = TitleBar;
	let viewShowing = TB.viewBn.toggled;
	TB.setGraphicsPart2();
	GuiElements.update.rect(TB.bgRect, 0, 0, TB.width, TB.height);
	TitleBar.removeButtons();
	TitleBar.makeButtons();
	if (viewShowing) {
		// This menu must stay open even while resizing
		TB.viewBn.press();
		TB.viewBn.release();
		// Pressing the button shows the menu.
	}
	TB.updateText();
};
