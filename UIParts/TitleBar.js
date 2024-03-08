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
    if (FinchBlox) {
      TB.height = 90; //100;
      TB.solidHeight = Hatchling ? 25 : 5; //height that is solid blue all the way across
    } else {
      TB.height = 54;
    }
    TB.buttonMargin = Hatchling ? Button.defaultMargin * 2 : Button.defaultMargin;
  }
  TB.width = GuiElements.width;

  if (FinchBlox) {
    TB.buttonH = TB.height / 2;
    TB.tallButtonH = TB.buttonH * 1.25;
    TB.buttonW = Hatchling ? TB.tallButtonH * (3/2) : TB.tallButtonH * (5 / 4);
    const maxBnWidth = (TB.width - 6 * TB.buttonMargin) / 8;
    TB.buttonW = Math.min(maxBnWidth, TB.buttonW);
    TB.longButtonW = TB.tallButtonH * (5 / 2);
    const maxLongBnW = maxBnWidth * 2;
    TB.longButtonW = Math.min(maxLongBnW, TB.longButtonW);

    TB.bnIconMargin = 3;
    TB.bg = Hatchling ? Colors.ballyGrayLight : Colors.easternBlue;
    TB.bnIconH = TB.buttonH - 2 * TB.bnIconMargin;
    const maxIconHeight = maxBnWidth * 0.7;
    TB.bnIconH = Math.min(maxIconHeight, TB.bnIconH);

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
    TB.finchBnX = 2 * TB.buttonMargin;
    TB.flagBnX = (GuiElements.width - TB.buttonMargin) / 2 - TB.longButtonW;
    TB.stopBnX = (GuiElements.width + TB.buttonMargin) / 2;
  } else {
    TB.stopBnX = GuiElements.width - TB.buttonW - TB.buttonMargin;
    TB.flagBnX = TB.stopBnX - TB.buttonW - TB.buttonMargin;
    TB.undoBnX = TB.flagBnX - TB.buttonW - TB.buttonMargin;
  }

  TB.batteryBnX = TB.undoBnX - TB.buttonW - TB.buttonMargin;
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
  if (FinchBlox) {
    TB.bgRect = GuiElements.draw.rect(0, 0, TB.width, TB.solidHeight, TB.bg); //TB.buttonMargin, TB.bg);
  } else {
    TB.bgRect = GuiElements.draw.rect(0, 0, TB.width, TB.height, TB.bg);
  }

  GuiElements.layers.titleBg.appendChild(TB.bgRect);
  if (FinchBlox) {
    TB.bgShape = GuiElements.create.path(GuiElements.layers.titleBg);
    TB.bgShape.setAttributeNS(null, "fill", TB.bg);
    TB.updateShapePath();
  }
};
TitleBar.updateShapePath = function() {
  const TB = TitleBar;
  const r = Hatchling ? ((TB.height - TB.solidHeight) / 6) : ((TB.height - TB.solidHeight) / 2); //TB.buttonMargin)/2;
  const shapeW = Hatchling ? (TB.width * 2/7 - r) : (TB.width / 2 - TB.longButtonW - 2 * r);
  const midW = Hatchling ? (TB.width * 3/7 - 2*r) : (2 * TB.longButtonW)

  var path = " m 0,0";
  path += " l " + TB.width + ",0 0," + TB.height + " " + (-shapeW) + ",0";
  path += " a " + r + " " + r + " 0 0 1 " + (-r) + " " + (-r);
  if (Hatchling) { path += " v " + -r*4 }
  path += " a " + r + " " + r + " 0 0 0 " + (-r) + " " + (-r);
  path += " l " + (-midW) + ",0";
  path += " a " + r + " " + r + " 0 0 0 " + (-r) + " " + r;
  if (Hatchling) { path += " v " + r*4 }
  path += " a " + r + " " + r + " 0 0 1 " + (-r) + " " + r;
  path += " l " + (-shapeW) + ",0";
  path += " z ";

  TB.bgShape.setAttributeNS(null, "d", path);

  TB.sideWidth = shapeW + r;
}

/**
 * Creates all the buttons and menus
 */
TitleBar.makeButtons = function() {
  const TB = TitleBar;
  const TBLayer = GuiElements.layers.titlebar;
  if (FinchBlox) {
    const r = TB.defaultCornerRounding;
    const y = (TB.height / 2) - (TB.tallButtonH / 2);
    const startStopY = Hatchling ? (y/2 + TB.solidHeight) : y
    const h = TB.tallButtonH;
    const startStopH = Hatchling ? TB.buttonH : TB.tallButtonH;
    TB.undoBnX = TB.width - TB.sideWidth / 2 + TB.buttonMargin / 2;
    TB.levelBnX = Hatchling ? (TB.longButtonW + TB.buttonMargin - 10) : TB.width - TB.sideWidth / 2 - TB.buttonMargin / 2 - TB.buttonW;
    TB.fileBnX = TB.width - TB.sideWidth / 2 - TB.buttonMargin / 2 - TB.buttonW;


    let flagBnColor = Hatchling ? Colors.ballyGreenLight : Colors.flagGreen
    let flagBnOutline = Hatchling ? Colors.ballyGreen : null
    TB.flagBn = new Button(TB.flagBnX, startStopY, TB.longButtonW, startStopH, TBLayer, flagBnColor, r, r, flagBnOutline);
    TB.flagBn.setCallbackFunction(CodeManager.eventFlagClicked, false);

    let stopBnColor = Hatchling ? Colors.ballyRedLight : Colors.stopRed
    let stopBnOutline = Hatchling ? Colors.ballyRed : null
    TB.stopBn = new Button(TB.stopBnX, startStopY, TB.longButtonW, startStopH, TBLayer, stopBnColor, r, r, stopBnOutline);
    TB.stopBn.setCallbackFunction(CodeManager.stop, false);

    let undoBnColor = Hatchling ? Colors.ballyGrayLight : Colors.neonCarrot
    let undoBnOutline = Hatchling ? Colors.ballyBrandBlue : null
    TB.undoButton = new Button(TB.undoBnX, y, TB.buttonW, h, TBLayer, undoBnColor, r, r, undoBnOutline);
    UndoManager.setUndoButton(TB.undoButton);

    //Add icons to buttons
    if (Hatchling) {
      TB.flagBn.addColorIcon(VectorPaths.bdStart, TB.bnIconH * 1.3, Colors.ballyGreen);
      TB.stopBn.addColorIcon(VectorPaths.bdStop, TB.bnIconH * 1.3, Colors.ballyRed);
      TB.undoButton.addColorIcon(VectorPaths.bdUndo, TB.bnIconH * 0.5, Colors.ballyBrandBlue);

      TB.fileBn = new Button(TB.fileBnX, y, TB.buttonW, h, TBLayer, undoBnColor, r, r, undoBnOutline);
      TB.fileBn.addColorIcon(VectorPaths.bdFile, TB.bnIconH * 0.78, Colors.ballyBrandBlue);
      TB.fileBn.setCallbackFunction(function() {}, true);
    } else {
      TB.flagBn.addIcon(VectorPaths.faFlag, TB.bnIconH);
      TB.stopBn.addIcon(VectorPaths.stop, TB.bnIconH * 0.9);
      TB.undoButton.addIcon(VectorPaths.faUndoAlt, TB.bnIconH * 0.8);
    }

    //TB.trashButton = new Button(TB.trashBnX, (TB.height/2) - (TB.buttonH/2), TB.buttonW, TB.buttonH, TBLayer, Colors.seance, r, r);
    //TB.trashButton = new Button(TB.trashBnX, y, TB.buttonW, h, TBLayer, Colors.neonCarrot, r, r);
    //TB.trashButton.addIcon(VectorPaths.faTrash, TB.bnIconH * 0.8);
    //TB.trashButton.setCallbackFunction(function(){TabManager.activeTab.clear();}, false);
    //TB.trashButton.setCallbackFunction(function(){ UndoManager.deleteTab(); }, false);

    //if (!Hatchling) {
      let levelBnColor = Hatchling ? Colors.ballyBrandBlue : Colors.seance
      let levelBnW = Hatchling ? TB.buttonW * 3/4 : TB.buttonW
      TB.levelButton = new Button(TB.levelBnX, y, levelBnW, h, TBLayer, levelBnColor, r, r);
      TB.levelButton.addText(LevelManager.currentLevel, LevelManager.levelButtonFont, Colors.white);
      TB.levelButton.setCallbackFunction(function() {
        if (Hatchling) {

          let level = (LevelManager.currentLevel == 1) ? 2 : 1
          LevelManager.setLevel(level);
          LevelManager.loadLevelSavePoint();

          //When I try to animate the svg group, it travels off screen fine, but
          //reappears on the screen rather than animating. This happens if I use
          //css on the group too.
          /*let code = TabManager.activeTab.mainG
          let w = TB.width.toString()
          let animate = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
          animate.setAttributeNS(null, "attributeName", "transform");
          animate.setAttributeNS(null, "from", "0 0");
          animate.setAttributeNS(null, "to", "-" + w + " 0");
          animate.setAttributeNS(null, "begin", "0s");
          animate.setAttributeNS(null, "dur", "1s");
          animate.setAttributeNS(null, "repeatCount", "1");
          code.appendChild(animate)
          console.log(code)
          animate.beginElement()

          setTimeout(()=>{
            animate.remove()

            GuiElements.move.group(code, w, 0)

            let level = (LevelManager.currentLevel == 1) ? 2 : 1
            LevelManager.setLevel(level);
            LevelManager.loadLevelSavePoint();

            animate = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
            animate.setAttributeNS(null, "attributeName", "transform");
            animate.setAttributeNS(null, "from", w +" 0");
            animate.setAttributeNS(null, "to", "0 0");
            animate.setAttributeNS(null, "begin", "0s");
            animate.setAttributeNS(null, "dur", "1s");
            animate.setAttributeNS(null, "repeatCount", "1");
            code.appendChild(animate)
            console.log(code)
            animate.beginElement()
          }, 1000)*/


          //Slide the whole interface out of view and back
          /*let b = document.body//TabManager.activeTab.mainG //document.body
          let up = (LevelManager.currentLevel == 1)
          let class1 = up ? "slideLeft" : "slideRight"
          let class2 = up ? "popRight" : "popLeft"
          let class3 = "center"
          b.classList.add(class1)
          
          setTimeout(()=>{
            console.log("popping over...")
            b.classList.remove(class1)
            b.classList.add(class2)

            let level = up ? 2 : 1
            LevelManager.setLevel(level);
            LevelManager.loadLevelSavePoint();
            
          }, 1000)
          setTimeout(()=>{
            console.log("sliding back in")
            b.classList.remove(class2)
            b.classList.add(class3)
          }, 1050)
          setTimeout(()=>{
            
            b.classList.remove(class3)
          }, 2100)*/

          
        } else {
          (new LevelDialog()).show();
        }
      }, true);
    //}

    TB.updateStatus = function(status) {
      //GuiElements.alert("TitleBar update status to " + status);
      const finchBn = TitleBar.finchButton;
      let color = Hatchling ? Colors.ballyGrayLight : Colors.stopRed;
      let outlineColor = Hatchling ? Colors.ballyRed : Colors.darkenColor(Colors.stopRed, 0.5);
      let shortName = "";
      if (status === DeviceManager.statuses.connected) {
        color = Hatchling ? Colors.ballyGrayLight : Colors.finchGreen;
        outlineColor = Hatchling ? Colors.ballyBrandBlue : Colors.flagGreen;
        let sn = null
        if (Hatchling) {
          sn = DeviceHatchling.getManager().connectedDevices[0].shortName;
        } else {
          sn = DeviceFinch.getManager().connectedDevices[0].shortName;
        }
        if (sn != null) {
          shortName = sn;
        }
        finchBn.xIcon.pathE.remove();
        if (!Hatchling) { 
          finchBn.battIcon.group.appendChild(finchBn.battIcon.pathE);
          finchBn.icon.move(finchBn.finchConnectedX, finchBn.finchY); 
        }
        DeviceManager.checkBattery();
      } else {
        finchBn.xIcon.group.appendChild(finchBn.xIcon.pathE);
        if (!Hatchling) { 
          finchBn.battIcon.pathE.remove();
          finchBn.icon.move(finchBn.finchX, finchBn.finchY); 
        }
      }
      finchBn.updateBgColor(color);
      if (Hatchling) { 
        GuiElements.update.color(finchBn.icon.pathE, outlineColor) 
        GuiElements.update.stroke(finchBn.bgRect, outlineColor, Button.strokeW)
      } else {
        GuiElements.update.stroke(finchBn.icon.pathE, outlineColor, 4);
      }
      GuiElements.update.text(finchBn.textE, shortName);
    }
    DeviceManager.setStatusListener(TB.updateStatus);

    const fBnX = Hatchling ? TB.buttonMargin : ((TB.sideWidth - TB.longButtonW) / 2)
    const fBnW = Hatchling ? TB.longButtonW * 13/16 : TB.longButtonW
    TB.finchButton = new Button(fBnX, (TB.height / 2) - (TB.tallButtonH / 2), fBnW, TB.tallButtonH, TBLayer, Colors.fbGray, r, r);

    TB.finchButton.addFinchBnIcons();
    TB.finchButton.setCallbackFunction(function() {
      const deviceClass = Hatchling ? DeviceHatchling : DeviceFinch
      switch (DeviceManager.getStatus()) {
        case DeviceManager.statuses.noDevices:
          (new DiscoverDialog(deviceClass)).show();
          break;
        case DeviceManager.statuses.connected:
          DeviceManager.removeAllDevices();
          break;
        default:
          DeviceManager.removeAllDevices();
          (new DiscoverDialog(deviceClass)).show();
      }
    }, true);

    if (!Hatchling) {
      TB.fileBn = new FBFileNameDisplay();
      const rcBnW = TB.fileBn.H + TB.fileBn.r //TB.shortButtonW
      const rcBnH = TB.fileBn.H - TB.fileBn.margin
      const rcBnX = TB.width - rcBnW + TB.fileBn.r
      const rcBnY = TB.height + 2 * TB.fileBn.margin + TB.fileBn.H
      TB.recenterBn = new Button(rcBnX, rcBnY, rcBnW, rcBnH, TBLayer, TB.fileBn.bgColor, TB.fileBn.r, TB.fileBn.r)
      TB.recenterBn.addColorIcon(VectorPaths.faCrosshairs, TB.bnIconH * 0.5, Colors.bbtDarkGray)
      TB.recenterBn.setCallbackFunction(function() {
        TabManager.activeTab.recenter()
      })
    }

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
  TB.flagBn.remove();
  TB.stopBn.remove();
  TB.fileBn.remove();
  TB.undoButton.remove();
  if (FinchBlox) {
    TB.finchButton.remove();
    //if (!Hatchling) { TB.levelButton.remove(); }
    TB.levelButton.remove();
    //  TB.trashButton.remove();
  } else {
    TB.viewBn.remove();
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
  var viewShowing = false;
  if (!FinchBlox) {
    viewShowing = TB.viewBn.toggled;
  }
  TB.setGraphicsPart2();
  if (FinchBlox) {
    GuiElements.update.rect(TB.bgRect, 0, 0, TB.width, TB.solidHeight); //TB.buttonMargin);
    TB.updateShapePath();
  } else {
    GuiElements.update.rect(TB.bgRect, 0, 0, TB.width, TB.height);
  }
  TB.removeButtons();
  TB.makeButtons();
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
TitleBar.isStackOverTitleBar = function(x, y) {
  const TB = TitleBar;
  return CodeManager.move.pInRange(x, y, 0, 0, TB.width, TB.height);
}

/**
 * Used in FinchBlox. Flashes the finch button if the user tries to run blocks
 * without a finch connected.
 */
TitleBar.flashFinchButton = function() {
  const finchBn = TitleBar.finchButton;
  if (finchBn != null) {
    //finchBn.flash();
    new HelpingHand(finchBn)
  }
}
