/**
 * Menu for selecting files in FinchBlox. Since this menu appears as
 * a BubbleOverlay, it is not a direct subclass of Menu.
 */


function FBFileSelect(x, y, w, h, parentGroup){
  this.parentX = x;
  this.parentY = y;
  this.parentW = w;
  this.parentH = h;
  this.parentGroup = parentGroup;
  this.parentLayer = GuiElements.layers.titlebar;
};

FBFileSelect.setConstants = function() {
	const FS = FBFileSelect;
	FS.bnMargin = Button.defaultMargin;
  FS.color = Colors.easternBlue;
  FS.bubbleMargin = 20;
  FS.font = Button.defaultFont;
  FS.fontColor = Colors.bbtDarkGray;
  FS.trashIcon = VectorPaths.faTrash;
  FS.trashColor = Colors.stopRed;
};

FBFileSelect.prototype.show = function() {
  const FS = FBFileSelect;
  const layer = GuiElements.layers.inputPad;
  const overlayType = Overlay.types.inputPad;//overlayType, margin, innerGroup, parent, outlineColor, block
  const r = TitleBar.defaultCornerRounding;
  this.innerWidth = GuiElements.width/2;
  this.innerHeight = this.innerWidth/2;// * 3/10;
  this.bnW = TitleBar.longButtonW;
  this.bnH = TitleBar.tallButtonH;
  const buttonX = (this.innerWidth - this.bnW)/2;
  const buttonY = this.bnH/4;
  const iconH = this.bnH*2/3;

  this.innerGroup = GuiElements.create.group(0, 0);


	this.bubbleOverlay = new FBBubbleOverlay(overlayType, FS.bubbleMargin, this.innerGroup, this, FS.color);//, null, this.button);
	//this.menuBnList = new SmoothMenuBnList(this.bubbleOverlay, this.group, 0, 0);
	//this.menuBnList.markAsOverlayPart(this.bubbleOverlay);

	//const height = this.menuBnList.previewHeight();
	//const width = this.menuBnList.previewWidth();
	//this.bubbleOverlay.display(this.x, this.x, this.y, this.y, this.menuBnList.width, height);
  //this.bubbleOverlay.display(GuiElements.width/3, GuiElements.width*2/3, GuiElements.height/4, GuiElements.height/2, 100, 100);
  this.bubbleOverlay.display(this.parentX, this.parentY, this.parentX + this.parentW, this.parentY + this.parentH, this.innerWidth, this.innerHeight);
  this.x = this.bubbleOverlay.x;
  this.y = this.bubbleOverlay.y;

  this.newFileBn = new Button(buttonX, buttonY, this.bnW, this.bnH, this.innerGroup, FS.color, r, r);
  this.newFileBn.addIcon(VectorPaths.faPlus, iconH);
  this.newFileBn.setCallbackFunction(function() {
    this.close();
    (new LevelDialog()).show();
  }.bind(this), true);
  this.newFileBn.partOfOverlay = this.bubbleOverlay;

	//this.menuBnList.show();

  //this.menuBnList.addOption("1", function(){ f(1, this); }.bind(this));

  this.fileList = []
  this.suffixList = []
  for (let i = 0; i < LevelManager.filesSavedLocally.length; i++) {
    const file = LevelManager.filesSavedLocally[i];
    const suffix = file.slice(-2);
    switch (suffix) {
      case LevelManager.fileLevelSuffixes[1]:
      case LevelManager.fileLevelSuffixes[2]:
      case LevelManager.fileLevelSuffixes[3]:
        this.fileList.push(file);
        //this.suffixList.push(suffix);
    }
  }
  this.rowCount = this.fileList.length;
  this.contentWidth = this.innerWidth + 2*FS.bubbleMargin - 4;
  this.hintText = "";

  const RD = RowDialog;
  const scrollHeight = this.rowCount * (RD.bnMargin + RD.bnHeight) - RD.bnMargin;
  const availableHeight = this.innerHeight - 1.5*this.bnH + FS.bubbleMargin/2;
  this.scrollBoxX = 2; //do not overlap the bubble outline
  this.scrollBoxY = 1.5*this.bnH + FS.bubbleMargin;
  this.scrollBoxWidth = this.contentWidth;
  this.scrollBoxHeight = Math.min(availableHeight, scrollHeight);

  this.rowGroup = RD.prototype.createContent.call(this);
  this.scrollBox = RD.prototype.createScrollBox.call(this); // could be null
  if (this.scrollBox != null) {
    this.scrollBox.partOfOverlay = this.bubbleOverlay;
    this.scrollBox.show();
  }
};

FBFileSelect.prototype.createRow = function(index, y, width, contentGroup) {
  const FS = FBFileSelect;
  const fileName = this.fileList[index];
  const displayName = fileName.slice(0,-2);
  const fileLevel = fileName.slice(-1);

	var color;
	if (index % 2 == 0) {
		color = Colors.white;
	} else {
		color = Colors.fbGray;
	}


	// TODO: use RowDialog.createMainBnWithText instead
	const button = new Button(0, y, width, RowDialog.bnHeight, contentGroup, color);

  //Add the filename
	//button.addText(fileName + " (" + fileLevel + ")", FS.font, FS.fontColor);
  const textX = FS.bubbleMargin;
  const textY = (button.height + FS.font.charHeight) / 2;
  const textE = GuiElements.draw.text(textX, textY, "", FS.font, FS.fontColor);
	GuiElements.update.textLimitWidth(textE, displayName, button.width);
  button.group.appendChild(textE);
  TouchReceiver.addListenersBN(textE, button);


  //Add the trash button
  const trashH = 20;
  const trashW = VectorIcon.computeWidth(FS.trashIcon, trashH);
  const trashX = button.width - FS.bubbleMargin - trashW;
  const trashY = (button.height - trashH)/2;
  //const trash = new VectorIcon(trashX, trashY, FS.trashIcon, FS.trashColor, trashH, button.group);
  const trashBn = new Button(trashX, trashY, trashW, trashH, button.group, color);
  trashBn.addColorIcon(FS.trashIcon, trashH, FS.trashColor);
  trashBn.setCallbackFunction(function () {
    console.log("pressed the trash button")
    this.close();
    const cd = new FBConfirmDelete(this.parentX, this.parentY, this.parentW, this.parentH, this.parentGroup, fileName)
    console.log(cd)
    cd.show();
  }.bind(this), true);
  //trashBn.partOfOverlay = this.bubbleOverlay;

  //Add level number
  const levelE = GuiElements.draw.text(0, 0, fileLevel, FS.font, Colors.seance);
  const levelW = GuiElements.measure.textWidth(levelE);
  const levelX = trashX - FS.bubbleMargin - levelW;
  const levelY = textY;
  GuiElements.move.text(levelE, levelX, levelY);
  button.group.appendChild(levelE);
  TouchReceiver.addListenersBN(levelE, button);


	button.setCallbackFunction(function() {
		this.selectFile(index);
	}.bind(this), true);
	button.makeScrollable();
  button.partOfOverlay = this.bubbleOverlay;
};

FBFileSelect.prototype.selectFile = function(index) {
  LevelManager.openFile(this.fileList[index]);
  this.close();
}

FBFileSelect.prototype.close = function() {
  this.scrollBox.hide();
	this.bubbleOverlay.hide();
	//this.menuBnList.hide();
};
