/**
 * Display the name of the current file and a button to bring up the file
 * chooser or save the current file if there is no current file name. Used in
 * finchblox only.
 */

function FBFileNameDisplay() {
  const TB = TitleBar;
  const TBLayer = GuiElements.layers.titlebar;
  const h = TB.tallButtonH;
  this.margin = TB.buttonMargin * 2 / 3;
  this.W = 2 * TB.longButtonW;
  this.H = h - 2 * this.margin;
  this.bnW = this.H - this.margin;
  this.X = TB.width - this.bnW - 4 * this.margin; //- TB.buttonW;
  this.Y = TB.height + this.margin;
  this.r = TB.defaultCornerRounding;
  this.font = Font.secondaryUiFont(16); //Button.defaultFont;
  this.textW = 0;
  this.bgColor = Colors.fbGray;

  this.group = GuiElements.create.group(this.X, this.Y, TBLayer);
  const fileDisplayBG = GuiElements.draw.rect(0, 0, this.W, this.H, this.bgColor, this.r, this.r);
  this.group.appendChild(fileDisplayBG);

  //this.isInNoSaveState = false; //true when there are files to load and nothing to save.
  //this.addButton(false);
  this.update();

}

FBFileNameDisplay.prototype.update = function() {
  const TB = TitleBar;
  if (this.textBn != null) {
    this.textBn.remove();
    //this.textE.parentElement.remove();
    //console.log(this.textE.parentElement);
    this.textW = 0;
  }

  if (SaveManager.fileName == undefined) { //When the app is first loaded
    this.addButton(false);
  } else if (SaveManager.fileName == LevelManager.savePointFileNames[LevelManager.currentLevel]) {
    this.X = TB.width - this.bnW - 4 * this.margin; //- TB.buttonW;
    GuiElements.move.group(this.group, this.X, this.Y);
    const stackList = TabManager.activeTab.stackList;
    //If there is anything to save, make the button a save button
    if (stackList.length > 1 || !(stackList.length != 0 &&
        stackList[0].firstBlock.isStartBlock && stackList[0].firstBlock.nextBlock == null)) {
      this.addButton(true);
      //this.isInNoSaveState = false;
      //Otherwise, let the user skip to the file menu
    } else {
      this.addButton(false);
      //this.isInNoSaveState = true;
    }
  } else {
    //console.log("will display " + SaveManager.fileName)
    const displayName = SaveManager.fileName.slice(0, -2);
    const textX = 2 * this.margin;
    const textY = (this.H + this.font.charHeight) / 2
    //const textY = 0//(this.H - this.font.charHeight)/2
    this.textW = GuiElements.measure.stringWidth(displayName, this.font);
    //this.textE = GuiElements.draw.text(textX, textY, displayName, this.font, Colors.bbtDarkGray);
    //this.group.appendChild(this.textE);
    this.textBn = new Button(textX, 0, this.textW, this.H, this.group, this.bgColor);
    this.textBn.addText(displayName, this.font, Colors.bbtDarkGray);
    this.X = TB.width - this.bnW - this.textW - 6 * this.margin;
    GuiElements.move.group(this.group, this.X, this.Y);
    this.textBn.setCallbackFunction(function() {
      (new FBSaveFile(this.X, this.Y, this.W, this.H, this.group, displayName)).show();
    }.bind(this), true);

    this.addButton(false);
    //this.isInNoSaveState = false;
    //TouchReceiver.addListenersEditText(this.textE, this);
  }
}

FBFileNameDisplay.prototype.addButton = function(isSaveBn) {
  //console.log("Called add button with " + isSaveBn);
  const TB = TitleBar;
  const bnX = TB.width - this.X - this.bnW - 2 * this.margin; //(TB.buttonW - this.bnW) / 2;
  const bnH = this.H - 2 * this.margin;
  const bnR = this.r / 2;
  const icon = isSaveBn ? VectorPaths.faSave : VectorPaths.faFile

  if (this.button != null) {
    this.button.remove();
  }

  this.button = new Button(bnX, this.margin, this.bnW, bnH, this.group, Colors.easternBlue, bnR, bnR);
  this.button.addIcon(icon, TB.bnIconH * 0.5);
  //TB.fileBn.setCallbackFunction(function() {(new FBFileSelect(TB.fileBn, TB.fileDisplay)).show();}, true);
  if (isSaveBn) {
    this.button.setCallbackFunction(function() {
      (new FBSaveFile(this.X, this.Y, this.W, this.H, this.group)).show();
    }.bind(this), true);
  } else {
    this.button.setCallbackFunction(function() {
      (new FBFileSelect(this.X, this.Y, this.W, this.H, this.group)).show();
    }.bind(this), true);
  }
}


FBFileNameDisplay.prototype.remove = function() {
  this.group.remove();
}
