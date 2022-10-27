/**
 * FBSaveFile - FinchBlox popup for naming the currently open file
 *
 * @param  {type} x           parent x
 * @param  {type} y           parent y
 * @param  {type} w           parent w
 * @param  {type} h           parent h
 * @param  {type} parentGroup parent group
 */
function FBSaveFile(x, y, w, h, parentGroup, currentName) {
  FBPopup.call(this, x, y, w, h, parentGroup);
  this.currentName = currentName;
}
FBSaveFile.prototype = Object.create(FBPopup.prototype);
FBSaveFile.prototype.constructor = FBSaveFile;

FBSaveFile.prototype.show = function() {
  FBPopup.prototype.show.call(this, 3 / 10);

  const r = TitleBar.defaultCornerRounding;

  //The grey rectangle around the text box
  this.textBoxHeight = this.innerHeight / 3;
  this.textRect = GuiElements.draw.rect(0, 0, this.innerWidth, this.textBoxHeight, Colors.white, r, r);
  GuiElements.update.stroke(this.textRect, Colors.fbGray, 2);
  this.innerGroup.appendChild(this.textRect);
  TouchReceiver.addListenersEditText(this.textRect, this);

  this.addConfirmCancelBns();

  const font = FBPopup.font;
  const textColor = FBPopup.fontColor;
  const textY = font.charHeight / 2; //(innerHeight/3 + font.charHeight) / 2;
  this.charCount = 0;

  this.editableText = GuiElements.create.editableText(font, textColor, 0, textY, this.innerWidth, this.textBoxHeight, this.innerGroup)
  if (this.currentName != null) {
    this.editableText.textContent = this.currentName;
  }

  TouchReceiver.addListenersEditText(this.editableText, this);

  this.editText();
}

FBSaveFile.prototype.editText = function() {
  FBPopup.isEditingText = true;
  this.editableText.focus();
}

FBSaveFile.prototype.confirm = function() {
  if (this.editableText == null ||
    this.editableText.textContent == null ||
    this.editableText.textContent == "") {
    //console.log("confirm button pressed without a name");
    return;
  }

  let fileName = this.editableText.textContent

  if (fileName == this.currentName) {
    //console.log("confirm button pressed without changing the name.")
    return;
  }

  //console.log("Name file " + fileName);
  LevelManager.saveAs(fileName, (this.currentName != null));
}
