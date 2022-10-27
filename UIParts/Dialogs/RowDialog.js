/**
 * Abstract class that controls a dialog with a scrollable region containing a number of rows. Each row normally
 * contains buttons but can also have other types of content. Only one dialog can be visible at any time.
 * The constructor does not draw anything, rather show() must be called.  Calling hide() then show() is used to reload
 * the dialog.  When show() is called, createRow is automatically called to generate each row, which must be implemented
 * by the subclass
 * @param {boolean} autoHeight - Whether the dialog should get taller as number of rows increase. Discouraged for
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

  if (FinchBlox) {
    RowDialog.titleBarColor = Colors.finchGreen;
    RowDialog.bgColor = Colors.white;
    RowDialog.bnMargin = 0;
    RowDialog.cornerR = 5;
    RowDialog.bnHeight = SmoothMenuBnList.bnHeight;
    RowDialog.titleBarH = RowDialog.bnHeight * 2;
    RowDialog.outlineColor = Colors.flagGreen;
  } else {
    RowDialog.titleBarColor = Colors.lightGray;
    RowDialog.bgColor = Colors.lightLightGray;
    RowDialog.bnMargin = 5;
    RowDialog.cornerR = 0;
    RowDialog.bnHeight = SmoothMenuBnList.bnHeight;
    RowDialog.titleBarH = RowDialog.bnHeight + RowDialog.bnMargin;
  }
  RowDialog.titleBarFontC = Colors.white;
  RowDialog.centeredBnWidth = 100;


  // The dialog tries to take up a certain ratio of the smaller of the screen's dimensions
  if (FinchBlox) {
    RowDialog.widthRatio = 0.7;
    RowDialog.heightRatio = 0.2;
  } else {
    RowDialog.widthRatio = 0.7;
    RowDialog.heightRatio = 0.75;
  }

  // But if that is too small, it uses the min dimensions
  if (FinchBlox) {
    RowDialog.minWidth = 400;
    RowDialog.minHeight = 200;
  } else {
    RowDialog.minWidth = 400;
    RowDialog.minHeight = 400;
  }

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
    if (FinchBlox) {
      this.icon = this.createTitleIcon(VectorPaths.mvFinch);
    } else {
      this.titleText = this.createTitleLabel(this.title);
    }


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
  let nonScrollHeight = centeredBnHeight + RD.bnMargin;
  nonScrollHeight += this.extraTopSpace + this.extraBottomSpace;
  nonScrollHeight += RD.titleBarH;
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
  const RD = RowDialog;
  let rect = GuiElements.draw.rect(0, 0, this.width, this.height, RD.bgColor, RD.cornerR, RD.cornerR);
  this.group.appendChild(rect);
  return rect;
};

/**
 * Draws the black rect behind the title bar
 * @return {Element} - The SVG rect element
 */
RowDialog.prototype.createTitleRect = function() {
  const RD = RowDialog;
  var rect;
  if (FinchBlox) {
    rect = GuiElements.draw.tab(0, 0, this.width, RD.titleBarH + this.extendTitleBar, RD.titleBarColor, RD.cornerR);
    GuiElements.update.stroke(rect, RD.outlineColor, 1);
  } else {
    rect = GuiElements.draw.rect(0, 0, this.width, RD.titleBarH + this.extendTitleBar, RD.titleBarColor);
  }
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
 * Draws the title icon
 * @param {object} pathId - Entry from VectorPaths
 * @return {Element} - The SVG element
 */
RowDialog.prototype.createTitleIcon = function(pathId) {
  var RD = RowDialog;

  const iconH = RD.titleBarH * 0.9;
  const iconW = VectorIcon.computeWidth(pathId, iconH);
  const iconX = (this.width - iconW) / 2;
  const iconY = (RD.titleBarH - iconH) / 2;

  const icon = new VectorIcon(iconX, iconY, pathId, Colors.white, iconH, this.group, null, 90);
  GuiElements.update.stroke(icon.pathE, RD.outlineColor, 4);
  return icon;
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
    if (this.title === Language.getStr("Connect_Multiple")) {
      this.createMultipleDialogRow(y, this.contentWidth, rowGroup)
    } else {
      for (let i = 0; i < this.rowCount; i++) {
        // Determined by subclass
        this.createRow(i, y, this.contentWidth, rowGroup);
        y += RD.bnHeight + RD.bnMargin;
      }
    }
  } else if (this.hintText !== "") {
    this.createHintText();
  }
  return rowGroup;
};

RowDialog.prototype.createMultipleDialogRow = function(y, width, contentGroup) {
  DebugOptions.markAbstract();
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
RowDialog.prototype.createHintText = function(offsetX, offsetY) {
  if (offsetX == null) {
    offsetX = 0;
  }
  if (offsetY == null) {
    offsetY = 0;
  }
  const RD = RowDialog;
  this.hintTextE = GuiElements.draw.text(0, 0, "", RD.hintTextFont, RD.titleBarFontC);
  GuiElements.update.textLimitWidth(this.hintTextE, this.hintText, this.width);
  let textWidth = GuiElements.measure.textWidth(this.hintTextE);
  let x = this.width / 2 - textWidth / 2 + offsetX;
  let y = this.scrollBoxY + RD.hintTextFont.charHeight + RD.hintMargin + offsetY;
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

/**
 * Stores the hint text to display when there is no content.  Should be called before show()
 * @param {string} hintText
 */
RowDialog.prototype.addHintText = function(hintText) {
  this.hintText = hintText;
};

/**
 * Called by subclasses to retrieve extraTopY
 * @return {number} - The amount of space above the content
 */
RowDialog.prototype.getExtraTopY = function() {
  return this.extraTopY;
};

/**
 * Called by subclasses to retrieve extraBottomY
 * @return {number} - The amount of space below the content
 */
RowDialog.prototype.getExtraBottomY = function() {
  return this.extraBottomY;
};

/**
 * Called by subclasses to retrieve the width of the dialog
 * @return {number}
 */
RowDialog.prototype.getContentWidth = function() {
  return this.contentWidth;
};

/**
 * Called by subclasses to retrieve the generated center button
 * @return {Button}
 */
RowDialog.prototype.getCenteredButton = function(i) {
  return this.centeredButtonEs[i];
};

/* Convert between relative and abs coords for items in the contentGroup */
/**
 * @param {number} x
 * @return {number}
 */
RowDialog.prototype.contentRelToAbsX = function(x) {
  if (!this.visible) return x;
  return this.scrollBox.relToAbsX(x);
};
/**
 * @param {number} y
 * @return {number}
 */
RowDialog.prototype.contentRelToAbsY = function(y) {
  if (!this.visible) return y;
  return this.scrollBox.relToAbsY(y);
};

/**
 * Used by subclasses to create a large button for the row that calls a certain function when tapped
 * @param {number} bnWidth
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 * @param {function} [callbackFn]
 * @return {Button}
 */
RowDialog.createMainBn = function(bnWidth, x, y, contentGroup, callbackFn) {
  const RD = RowDialog;
  const button = new Button(x, y, bnWidth, RD.bnHeight, contentGroup);
  if (callbackFn != null) {
    button.setCallbackFunction(callbackFn, true);
  }
  button.makeScrollable();
  return button;
};

/**
 * Used by subclasses to create a button with text that calls a function
 * @param {string} text
 * @param {number} bnWidth
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 * @param {function} [callbackFn]
 * @return {Button}
 */
RowDialog.createMainBnWithText = function(text, bnWidth, x, y, contentGroup, callbackFn) {
  const button = RowDialog.createMainBn(bnWidth, x, y, contentGroup, callbackFn);
  button.addText(text);
  return button;
};

/**
 * Used by subclasses to create a small button that calls a function when tapped
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 * @param {function} callbackFn
 * @return {Button}
 */
RowDialog.createSmallBn = function(x, y, contentGroup, callbackFn) {
  const RD = RowDialog;
  const button = new Button(x, y, RD.smallBnWidth, RD.bnHeight, contentGroup);
  if (callbackFn != null) {
    button.setCallbackFunction(callbackFn, true);
  }
  button.makeScrollable();
  return button;
};

/**
 * Used by subclasses to create a small button with an icon
 * @param {object} pathId - entry of VectorPaths
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 * @param {function} callbackFn
 * @return {Button}
 */
RowDialog.createSmallBnWithIcon = function(pathId, x, y, contentGroup, callbackFn) {
  let RD = RowDialog;
  let button = RowDialog.createSmallBn(x, y, contentGroup, callbackFn);
  button.addIcon(pathId, RD.iconH);
  return button;
};
