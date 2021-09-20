/**
 * Popup for FinchBlox. Used when the user chooses to delete a file.
 */

function FBConfirmDelete(x, y, w, h, parentGroup, fileName) {
  FBPopup.call(this, x, y, w, h, parentGroup);
  this.fileName = fileName;
}
FBConfirmDelete.prototype = Object.create(FBPopup.prototype);
FBConfirmDelete.prototype.constructor = FBConfirmDelete;

FBConfirmDelete.prototype.show = function() {
  FBPopup.prototype.show.call(this, 1/2);

  const titleFont = Font.secondaryUiFont(82);//Font.uiFont(82);
  const titleK = 5; //Space between trash and question mark
  const qmE = GuiElements.draw.text(0, 0, "?", titleFont, FBPopup.trashColor)
  const qmW = GuiElements.measure.textWidth(qmE)
  const trashH = 60;
  const trashW = VectorIcon.computeWidth(FBPopup.trashIcon, trashH);
  const qmX = (this.innerWidth - trashW - qmW - titleK) / 2 + trashW + titleK;
  const qmY = 1 + (trashH + titleFont.charHeight) / 2;//FBPopup.bubbleMargin + 1 + (trashH + titleFont.charHeight) / 2;
  const trashX = (this.innerWidth - trashW - qmW - titleK) / 2;
  const trashY = 0; //FBPopup.bubbleMargin;
  const trash = new VectorIcon(trashX, trashY, FBPopup.trashIcon, FBPopup.trashColor, trashH, this.innerGroup);
  GuiElements.move.text(qmE, qmX, qmY);
  this.innerGroup.appendChild(qmE);

  const displayName = this.fileName.slice(0, -2);
  const font = Font.secondaryUiFont(25);
  const fileE = GuiElements.draw.text(0, 0, displayName, font, FBPopup.fontColor)
  const fileW = GuiElements.measure.textWidth(fileE);
  const fileX = (this.innerWidth - fileW) / 2;
  const fileY = trashY + trashH + FBPopup.bubbleMargin + font.charHeight;
  GuiElements.move.text(fileE, fileX, fileY);
  this.innerGroup.appendChild(fileE);

  this.addConfirmCancelBns();
}

FBConfirmDelete.prototype.confirm = function() {
  LevelManager.userDeleteFile(this.fileName)
}