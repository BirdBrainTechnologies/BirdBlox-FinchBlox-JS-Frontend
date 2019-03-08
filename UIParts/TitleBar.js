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
    //TODO: Add FinchBlox option here
		TB.buttonMargin = Button.defaultMargin / 2;
	} else {
    if (FinchBlox) {
      TB.height = 100;
    } else {
      TB.height = 54;
    }
		TB.buttonMargin = Button.defaultMargin;
	}
	TB.width = GuiElements.width;

  if (FinchBlox) {
    TB.buttonW = TB.height * 2/3;
    const maxBnWidth = (TB.width - 9 * TB.buttonMargin) / 12;
    TB.buttonW = Math.min(maxBnWidth, TB.buttonW);
    TB.longButtonW = 2.5 * TB.buttonW;
    TB.finchBnW = 1.5 * TB.buttonW;
  	TB.bnIconMargin = 3;
    TB.bg = Colors.easternBlue;
    TB.buttonH = TB.height/2;
  	TB.bnIconH = TB.buttonH - 2 * TB.bnIconMargin;
  	const maxIconHeight = maxBnWidth * 0.7;
  	TB.bnIconH = Math.min(maxIconHeight, TB.bnIconH);
    TB.tallButtonH = TB.buttonH * 1.25;
    TB.defaultCornerRounding = 10;
  } else {
    TB.buttonW = TB.height * 64 / 54;
  	const maxBnWidth = (TB.width - 11 * TB.buttonMargin - DeviceStatusLight.radius * 2) / 7;
  	TB.buttonW = Math.min(maxBnWidth, TB.buttonW);
    TB.longButtonW = 85;
  	TB.bnIconMargin = 3;
    TB.bg = Colors.lightGray;
    TB.buttonH = TB.height - 2 * TB.buttonMargin;
  	TB.bnIconH = TB.buttonH - 2 * TB.bnIconMargin;
  	const maxIconHeight = maxBnWidth * 0.7;
  	TB.bnIconH = Math.min(maxIconHeight, TB.bnIconH);
  }
	TB.flagFill = Colors.green;
	TB.batteryFill = Colors.lightGray;
	TB.stopFill = Colors.red;
	TB.titleColor = Colors.white;
	TB.font = Font.uiFont(16).bold();

	TB.shortButtonW = TB.buttonH;
	TB.shortButtonW = TB.buttonW;
};

TitleBar.setGraphicsPart2 = function() {
	/* Compute the locations of all the buttons */
	const TB = TitleBar
  if (FinchBlox) {
    TB.finchBnX = 2*TB.buttonMargin;
    TB.levelBnX = TB.finchBnX + TB.finchBnW + TB.buttonMargin;
    TB.levelBnY = (TB.height/2) - (TB.buttonH/2);
    TB.flagBnX = (GuiElements.width - TB.buttonMargin)/2 - TB.longButtonW;
    TB.stopBnX = (GuiElements.width + TB.buttonMargin)/2;
    TB.trashBnX = GuiElements.width - 2 * TB.buttonMargin - TB.buttonW;
    TB.undoBnX = TB.trashBnX - TB.buttonW - TB.buttonMargin;
  } else {
    TB.stopBnX = GuiElements.width - TB.buttonW - TB.buttonMargin;
    TB.flagBnX = TB.stopBnX - TB.buttonW - TB.buttonMargin;
    TB.undoBnX = TB.flagBnX - TB.buttonW - TB.buttonMargin;
  }

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
  if (FinchBlox) {
    TB.bgShape = GuiElements.create.path(GuiElements.layers.titleBg);
    TB.bgShape.setAttributeNS(null, "fill", Colors.white);
    TB.updateShapePath();
  }
};
TitleBar.updateShapePath = function() {
  const TB = TitleBar;
  const shapeW = 2*TB.longButtonW;
  const shapeH = TB.height - TB.buttonMargin;
  const r = shapeH/2;
  var path = " m " + (TB.width - shapeW)/2 + "," + TB.buttonMargin;
  path += " l " + shapeW + ",0";
  path += " a " + r + " " + r + " 0 0 1 " + r + " " + r;
  path += " a " + r + " " + r + " 0 0 0 " + r + " " + r;
  path += " l " + (-shapeW-4*r) + ",0";
  path += " a " + r + " " + r + " 0 0 0 " + r + " " + (-r);
  path += " a " + r + " " + r + " 0 0 1 " + r + " " + (-r);
  path += " z ";

  TB.bgShape.setAttributeNS(null, "d", path);
}

/**
 * Creates all the buttons and menus
 */
TitleBar.makeButtons = function() {
	const TB = TitleBar;
	const TBLayer = GuiElements.layers.titlebar;
  if (FinchBlox) {
    const r = TB.defaultCornerRounding
  	TB.flagBn = new Button(TB.flagBnX, (TB.height/2) - (TB.tallButtonH/2), TB.longButtonW, TB.tallButtonH, TBLayer, Colors.flagGreen, r, r);
    TB.flagBn.addIcon(VectorPaths.faFlag, TB.bnIconH);
  	TB.flagBn.setCallbackFunction(CodeManager.eventFlagClicked, false);
    TB.stopBn = new Button(TB.stopBnX, (TB.height/2) - (TB.tallButtonH/2), TB.longButtonW, TB.tallButtonH, TBLayer, Colors.stopRed, r, r);
  	TB.stopBn.addIcon(VectorPaths.stop, TB.bnIconH);
  	TB.stopBn.setCallbackFunction(CodeManager.stop, false);

    TB.undoButton = new Button(TB.undoBnX, (TB.height/2) - (TB.buttonH/2), TB.buttonW, TB.buttonH, TBLayer, Colors.neonCarrot, r, r);
  	TB.undoButton.addIcon(VectorPaths.faUndoAlt, TB.bnIconH * 0.8);
  	UndoManager.setUndoButton(TB.undoButton);

    TB.trashButton = new Button(TB.trashBnX, (TB.height/2) - (TB.buttonH/2), TB.buttonW, TB.buttonH, TBLayer, Colors.seance, r, r);
    TB.trashButton.addIcon(VectorPaths.faTrash, TB.bnIconH * 0.8);
    TB.trashButton.setCallbackFunction(function(){TabManager.activeTab.clear();}, false);

    TB.levelButton = new Button(TB.levelBnX, TB.levelBnY, TB.buttonW, TB.buttonH, TBLayer, Colors.lightGray, r, r);
    TB.levelButton.setCallbackFunction(function(){
      new LevelMenu(TB.levelBnX + TB.buttonW/2, TB.levelBnY + TB.buttonH);
    },false);

    TB.finchButton = new Button(TB.finchBnX, (TB.height/2) - (TB.tallButtonH/2), TB.finchBnW, TB.tallButtonH, TBLayer, Colors.finchGreen, TB.longButtonW/2, TB.tallButtonH/2);
    TB.finchButton.setCallbackFunction(function(){(new DiscoverDialog(DeviceFinch)).show();}, false);
  } else {
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
  }

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
  if (FinchBlox) {
    TB.flagBn.remove();
  	TB.stopBn.remove();
    TB.undoButton.remove();
    TB.finchButton.remove();
    TB.levelButton.remove();
    TB.trashButton.remove();
  } else {
    TB.flagBn.remove();
  	TB.stopBn.remove();
    TB.fileBn.remove();
  	TB.viewBn.remove();
    TB.undoButton.remove();
    TB.hummingbirdBn.remove();
  	TB.batteryBn.remove();
    TB.deviceStatusLight.remove();
  }
	if (TB.debugBn != null) TB.debugBn.remove();
	if (TB.showHideBn != null) TB.showHideBn.remove();
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
	if (!FinchBlox) {let viewShowing = TB.viewBn.toggled;}
	TB.setGraphicsPart2();
	GuiElements.update.rect(TB.bgRect, 0, 0, TB.width, TB.height);
  TB.updateShapePath();
	TitleBar.removeButtons();
	TitleBar.makeButtons();
	if (!FinchBlox && viewShowing) {
		// This menu must stay open even while resizing
		TB.viewBn.press();
		TB.viewBn.release();
		// Pressing the button shows the menu.
	}
	TB.updateText();
};

/**
 * Determines whether the specified point is over the TitleBar.  Used for
 * determining if Blocks should be deleted in FinchBlox.
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
 TitleBar.isStackOverTitleBar = function(x, y){
   const TB = TitleBar;
   return CodeManager.move.pInRange(x, y, 0, 0, TB.width, TB.height);
 }
