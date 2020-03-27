/**
 * FBSaveFile - FinchBlox popup for naming the currently open file
 *
 * @param  {type} x           parent x
 * @param  {type} y           parent y
 * @param  {type} w           parent w
 * @param  {type} h           parent h
 * @param  {type} parentGroup parent group
 */
function FBSaveFile (x, y, w, h, parentGroup) {
  FBPopup.call(this, x, y, w, h, parentGroup);
}
FBSaveFile.prototype = Object.create(FBPopup.prototype);
FBSaveFile.prototype.constructor = FBSaveFile;

FBSaveFile.prototype.show = function() {
  FBPopup.prototype.show.call(this, 3/10);

  const r = TitleBar.defaultCornerRounding;

  //The grey rectangle around the text box
  this.textBoxHeight = this.innerHeight/3;
  this.textRect = GuiElements.draw.rect(0, 0, this.innerWidth, this.textBoxHeight, Colors.white, r, r);
  GuiElements.update.stroke(this.textRect, Colors.fbGray, 2);
  this.innerGroup.appendChild(this.textRect);
  TouchReceiver.addListenersEditText(this.textRect, this);

  this.addConfirmCancelBns();

  const font = FBPopup.font;
  const textColor = FBPopup.fontColor;
  const textY = font.charHeight/2;//(innerHeight/3 + font.charHeight) / 2;
  this.charCount = 0;

  const fo = document.createElementNS('http://www.w3.org/2000/svg',"foreignObject");
  fo.setAttribute('width', this.innerWidth);
  fo.setAttribute('height', this.textBoxHeight);
  fo.setAttribute("style", "text-align: center;");
  fo.setAttribute("x", 0);
  fo.setAttribute("y", textY);

  this.editableText = document.createElement('div');
  this.editableText.setAttribute("contentEditable", "true");
  this.editableText.setAttribute("width", this.innerWidth);
  this.editableText.setAttribute("style", "pointer-events: auto; -webkit-user-select: auto;");
  this.editableText.style.display = "block";
  this.editableText.style.color = textColor;
  this.editableText.style.fontFamily = font.fontFamily;
  this.editableText.style.fontSize = font.fontSize;
  this.editableText.style.outline = "none";

  fo.appendChild(this.editableText);
  this.innerGroup.appendChild(fo);
  TouchReceiver.addListenersEditText(this.editableText, this);

  //Also, add a listner for when the user presses the enter key
  this.editableText.addEventListener("keydown", function(event) {
    //event.preventDefault();
    /* Deprecated
    if (event.keyCode === 13) { //enter
      //this.confirm();
      //this.close();
      this.editableText.blur();
    }
    if (event.keyCode === 46 || event.keyCode === 8) { //delete or backspace
      this.charCount--;
    }
    */
    /*switch (event.code) {
      case 'Enter':
        this.editableText.blur();
        break;
      case 'Backspace':
      case 'Delete':
        this.charCount--;
        break;
    }*/
    //Use of keyCode is depricated, but necessary for old iPads at least
    if (event.code == 'Enter' || event.keyCode === 13) { //enter
      //this.confirm();
      //this.close();
      this.editableText.blur();
    }
    if (event.code == 'Delete' || event.code == 'Backspace' ||
      event.keyCode === 46 || event.keyCode === 8) { //delete or backspace
      this.charCount--;
    }

  }.bind(this));
  //TODO: maybe also look at keypress event to limit to reasonable characters
  // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
  this.editableText.addEventListener('keypress', function(event) {
    console.log("pressed a key count=" + this.charCount);
    if (this.charCount >= 24) {
      event.preventDefault();
    } else {
      this.charCount++;
    }
  }.bind(this));

  /*this.editableText.onfocus = function() {
    console.log("onfocus!")
    console.log(this);
    //this.value = this.value;
    this.setSelectionRange(1000,1001);
  }*/

  this.editText();
}

FBSaveFile.prototype.editText = function() {
  FBPopup.isEditingText = true;
  this.editableText.focus();
}

FBSaveFile.prototype.confirm = function () {
  if (this.editableText == null ||
    this.editableText.textContent == null ||
    this.editableText.textContent == "") {
      console.log("confirm button pressed without a name");
      return;
    }

  let fileName = this.editableText.textContent
  console.log("Name file " + fileName);
  LevelManager.saveAs(fileName);
}

FBSaveFile.prototype.close = function() {
  FBPopup.isEditingText = false;
  FBPopup.prototype.close.call(this);
};
