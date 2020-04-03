/**
 * Menu for selecting files in FinchBlox. Since this menu appears as
 * a BubbleOverlay, it is not a direct subclass of Menu.
 */


function FBFileSelect(x, y, w, h, parentGroup){
  FBPopup.call(this, x, y, w, h, parentGroup);
};
FBFileSelect.prototype = Object.create(FBPopup.prototype);
FBFileSelect.prototype.constructor = FBFileSelect;

FBFileSelect.prototype.show = function() {
  const RD = RowDialog;
  const r = TitleBar.defaultCornerRounding;
  const buttonW = TitleBar.longButtonW;
  const buttonH = TitleBar.tallButtonH;
  const buttonX = (FBPopup.innerWidth - buttonW)/2;
  const buttonY = buttonH/4;
  const iconH = buttonH*2/3;
  const bnSectionH = 2*buttonY + buttonH + FBPopup.bubbleMargin; //1.5*buttonH + FBPopup.bubbleMargin;

  //Get the list of files to display and determine how much space that will take
  const list = []
  for (let i = 0; i < LevelManager.filesSavedLocally.length; i++) {
    const file = LevelManager.filesSavedLocally[i];
    const suffix = file.slice(-2);
    switch (suffix) {
      case LevelManager.fileLevelSuffixes[1]:
      case LevelManager.fileLevelSuffixes[2]:
      case LevelManager.fileLevelSuffixes[3]:
        list.push(file);
    }
  }
  this.fileList = FileList.getSortedList(list);
  this.rowCount = this.fileList.length;
  const scrollHeight = this.rowCount * (RD.bnMargin + RD.bnHeight) - RD.bnMargin;

  const maxBubbleH = GuiElements.height - 2.5 * TitleBar.height;
  const heightToWidthRatio = (Math.min(bnSectionH + scrollHeight, maxBubbleH))/(FBPopup.innerWidth);
  FBPopup.prototype.show.call(this, heightToWidthRatio);// 1/2);

  this.newFileBn = new Button(buttonX, buttonY, buttonW, buttonH, this.innerGroup, FBPopup.color, r, r);
  this.newFileBn.addIcon(VectorPaths.faPlus, iconH);
  this.newFileBn.setCallbackFunction(function() {
    this.close();
    (new LevelDialog()).show();
  }.bind(this), true);
  this.newFileBn.partOfOverlay = this.bubbleOverlay;

  //Calculations for the scrollbox
  const availableHeight = this.innerHeight - bnSectionH;
  this.contentWidth = this.innerWidth + 2*FBPopup.bubbleMargin - 4;
  this.hintText = "";
  //this.scrollBoxX = 2; //do not overlap the bubble outline
  //this.scrollBoxY = bnSectionH;//1.5*buttonH + FBPopup.bubbleMargin;
  const scrollBoxX = 2 + this.x;
  const scrollBoxY = bnSectionH + FBPopup.bubbleMargin + this.y;
  const scrollBoxWidth = this.contentWidth;
  const scrollBoxHeight = Math.min(availableHeight, scrollHeight);
  //console.log("making content. sx=" + scrollBoxX + " sy=" + scrollBoxY + " this.y=" + this.y + " sh=" + scrollHeight + " ah=" + availableHeight + " sbh=" + scrollBoxHeight + " rc=" + this.rowCount + " bnh=" + RD.bnHeight);
  //Create the rows to display and the scrollbox to contain them
  if(this.rowCount != 0) {
    this.rowGroup = RD.prototype.createContent.call(this);
  //this.scrollBox = RD.prototype.createScrollBox.call(this); // could be null
  //if (this.scrollBox != null) {
    this.scrollBox = new SmoothScrollBox(this.rowGroup, GuiElements.layers.frontScroll,
      scrollBoxX, scrollBoxY, scrollBoxWidth, scrollBoxHeight, scrollBoxWidth, scrollHeight);
    this.scrollBox.partOfOverlay = this.bubbleOverlay;
    this.scrollBox.show();
  }
};

FBFileSelect.prototype.createRow = function(index, y, width, contentGroup) {
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
  const textX = FBPopup.bubbleMargin;
  const textY = (button.height + FBPopup.font.charHeight) / 2;
  const textE = GuiElements.draw.text(textX, textY, "", FBPopup.font, FBPopup.fontColor);
	GuiElements.update.textLimitWidth(textE, displayName, button.width);
  button.group.appendChild(textE);
  TouchReceiver.addListenersBN(textE, button);

  //Add the trash button
  const trashH = 18;
  const trashW = VectorIcon.computeWidth(FBPopup.trashIcon, trashH);
  const trashX = button.width - FBPopup.bubbleMargin - trashW;
  const trashY = (button.height - trashH)/2;
  const trashBn = new Button(trashX, trashY, trashW, trashH, button.group, color);
  trashBn.addColorIcon(FBPopup.trashIcon, trashH, FBPopup.trashColor);
  trashBn.partOfOverlay = this.bubbleOverlay;
  trashBn.setCallbackFunction(function () {
    this.close();
    const cd = new FBConfirmDelete(this.parentX, this.parentY, this.parentW, this.parentH, this.parentGroup, fileName)
    //console.log(cd)
    cd.show();
  }.bind(this), true);
  //trashBn.partOfOverlay = this.bubbleOverlay;

  //Add level number
  const levelFont = Font.uiFont(18)
  const levelRectH = levelFont.charHeight * 3/2;
  const levelRectW = levelRectH * 8/7;
  const levelRectY = (button.height - levelRectH)/2;
  const levelRectX = trashX - 2*FBPopup.bubbleMargin - levelRectW;
  const lr = 4; //corner rounding of level label
  const levelRect = GuiElements.draw.rect(levelRectX, levelRectY, levelRectW, levelRectH, Colors.seance, lr, lr);
  button.group.appendChild(levelRect);
  TouchReceiver.addListenersBN(levelRect, button);
  const levelE = GuiElements.draw.text(0, 0, fileLevel, levelFont, Colors.white);
  const levelW = GuiElements.measure.textWidth(levelE);
  const levelX = levelRectX + (levelRectW - levelW)/2; //trashX - FBPopup.bubbleMargin - levelW;
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
  this.close();
  LevelManager.openFile(this.fileList[index]);
}

FBFileSelect.prototype.close = function() {
  if (this.scrollBox != null) { this.scrollBox.hide(); }
  FBPopup.prototype.close.call(this);
};
