function FBSaveFile (x, y, w, h, parentGroup) {
  this.parentX = x;
  this.parentY = y;
  this.parentW = w;
  this.parentH = h;
  this.parentGroup = parentGroup;
  this.parentLayer = GuiElements.layers.titlebar;
}

FBSaveFile.prototype.show = function() {
  const r = TitleBar.defaultCornerRounding;
  this.innerWidth = GuiElements.width/2;
  const innerHeight = this.innerWidth * 3/10;
  const buttonW = this.innerWidth/3;
  const buttonH = buttonW * 2/5;
  const iconH = buttonH*2/3;
  const buttonMargin = this.innerWidth / 20;
  const confirmX = this.innerWidth/2 - buttonW - buttonMargin/2;
  const cancelX = this.innerWidth/2 + buttonMargin/2;
  this.font = Button.defaultFont;
  this.textColor = Colors.bbtDarkGray;
  this.textBoxHeight = innerHeight/3;
  this.textY = this.font.charHeight/2;//(innerHeight/3 + font.charHeight) / 2;

  this.innerGroup = GuiElements.create.group(0, 0);

  //The grey rectangle around the text box
  this.textRect = GuiElements.draw.rect(0, 0, this.innerWidth, this.textBoxHeight, Colors.white, r, r);
  GuiElements.update.stroke(this.textRect, Colors.fbGray, 2);
  this.innerGroup.appendChild(this.textRect);
  TouchReceiver.addListenersEditText(this.textRect, this);

  this.confirmBn = new Button(confirmX, innerHeight/2, buttonW, buttonH, this.innerGroup, Colors.flagGreen, r, r);
  this.confirmBn.addIcon(VectorPaths.faCheck, iconH);
  this.confirmBn.setCallbackFunction(function () {
    this.confirm();
  }.bind(this), false);

  this.cancelBn = new Button(cancelX, innerHeight/2, buttonW, buttonH, this.innerGroup, Colors.stopRed, r, r)
  this.cancelBn.addIcon(VectorPaths.faTimes, iconH);

  this.bubbleOverlay = new FBBubbleOverlay(Overlay.types.inputPad, 20, this.innerGroup, this, Colors.easternBlue);
  this.bubbleOverlay.display(this.parentX, this.parentY, this.parentX + this.parentW, this.parentY + this.parentH, this.innerWidth, innerHeight);

  this.editText();
}

FBSaveFile.prototype.close = function() {
	this.bubbleOverlay.hide();
};

FBSaveFile.prototype.editText = function() {

  if (this.editableText == null) {

    const fo = document.createElementNS('http://www.w3.org/2000/svg',"foreignObject");
    fo.setAttribute('width', this.innerWidth);
    fo.setAttribute('height', this.textBoxHeight);
    fo.setAttribute("style", "text-align: center;");
    fo.setAttribute("x", 0);
    fo.setAttribute("y", this.textY);

    this.editableText = document.createElement('div');
    //this.editableText = document.createElement('input');
    //this.editableText.setAttribute("type", "text");
    //const textNode = document.createTextNode("click to edit");
    //foDiv.appendChild(textNode);
    this.editableText.setAttribute("contentEditable", "true");
    this.editableText.setAttribute("width", this.innerWidth);
    //this.editableText.setAttribute("style", "display: inline-block; pointer-events: auto; -webkit-user-select: auto; color: " + this.textColor + "; font-family: " + this.font.fontFamily + "; font-size: " + this.font.fontSize + ";");
    this.editableText.setAttribute("style", "pointer-events: auto; -webkit-user-select: auto;");
    this.editableText.style.display = "block";
    this.editableText.style.color = this.textColor;
    this.editableText.style.fontFamily = this.font.fontFamily;
    this.editableText.style.fontSize = this.font.fontSize;
    this.editableText.style.outline = "none";


    fo.appendChild(this.editableText);
    this.innerGroup.appendChild(fo);
    TouchReceiver.addListenersEditText(this.editableText, this);

    //Also, add a listner for when the user presses the enter key
    this.editableText.addEventListener("keydown", function(event) {
      //event.preventDefault();
      if (event.keyCode === 13) {
          //this.confirm();
          //this.close();
          this.editableText.blur();
      }
    }.bind(this));
    //TODO: maybe also look at keypress event to limit to reasonable characters
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
  }
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
