function FBSaveFile (x, y, w, h, parentGroup, parentLayer) {
  this.parentX = x;
  this.parentY = y;
  this.parentW = w;
  this.parentH = h;
  this.parentGroup = parentGroup;
  this.parentLayer = parentLayer
}

FBSaveFile.prototype.show = function() {
  const r = TitleBar.defaultCornerRounding;
  const innerWidth = GuiElements.width/2;
  const innerHeight = innerWidth * 3/10;
  const buttonW = innerWidth/3;
  const buttonH = buttonW * 2/5;
  const iconH = buttonH*2/3;
  const buttonMargin = innerWidth / 20;
  const confirmX = innerWidth/2 - buttonW - buttonMargin/2;
  const cancelX = innerWidth/2 + buttonMargin/2;
  const font = Button.defaultFont;
  const textY = (innerHeight/3 + font.charHeight) / 2;

  this.innerGroup = GuiElements.create.group(0, 0);
  this.textRect = GuiElements.draw.rect(0, 0, innerWidth, innerHeight/3, Colors.white, TitleBar.defaultCornerRounding, TitleBar.defaultCornerRounding);
  //this.textRect.setAttribute("contenteditable", "true");
  GuiElements.update.stroke(this.textRect, Colors.fbGray, 2);
  this.innerGroup.appendChild(this.textRect);
  //TouchReceiver.addListenersEditText(this.textRect, this);
  //this.editText = document.createElement("input");
  //this.editText.setAttribute("type", "text");
  //this.editText = document.createElement("text");
  //this.editText.setAttributeNS(null, "contenteditable", "true");
  //this.editText.setAttribute("x", 0);
  //this.editText.setAttribute("y", 0);
  //this.editText.setAttribute("width", innerWidth);
  //this.editText.setAttribute("height", innerHeight/3);
  //this.editText.setAttribute("value", "TEST!!");
  //this.editText = GuiElements.draw.text(0, textY, "foo", font, Colors.fbGray);
  //this.editText.setAttributeNS(null, "contenteditable", 'true');
  //this.editText.classList.remove("noselect");
  //this.innerGroup.appendChild(this.editText);
  //TouchReceiver.addListenersEditText(this.editText, this);
  const fo = document.createElementNS('http://www.w3.org/2000/svg',"foreignObject");
  fo.setAttribute('width', innerWidth);
  fo.setAttribute('height', innerHeight/3);
  fo.setAttribute("style", "text-align: left;");
  const foDiv = document.createElement('div');
  const textNode = document.createTextNode("Click to edit");
  foDiv.appendChild(textNode);
  foDiv.setAttribute("contentEditable", "true");
  foDiv.setAttribute("width", "auto");
  foDiv.setAttribute("style", "display: inline-block; pointer-events: auto; -webkit-user-select: auto;");
  fo.appendChild(foDiv);
  this.innerGroup.appendChild(fo);
  TouchReceiver.addListenersEditText(foDiv, this);

  //GuiElements.layers.overlayOverlayScroll.appendChild(foDiv);
  //document.body.appendChild(foDiv);
  //this.parentLayer.appendChild(fo);
  //GuiElements.svgs[1].appendChild(fo);
  //const svg = document.createElementNS('http://www.w3.org/2000/svg',"svg");
  //let svg = document.getElementById("testSvg");
  //svg.setAttribute("xmlns:xlink", "http://www.w3.org/2000/xlink");
  //svg.appendChild(fo);
  //document.body.appendChild(svg);

  this.confirmBn = new Button(confirmX, innerHeight/2, buttonW, buttonH, this.innerGroup, Colors.flagGreen, r, r);
  this.confirmBn.addIcon(VectorPaths.faCheck, iconH);
  this.cancelBn = new Button(cancelX, innerHeight/2, buttonW, buttonH, this.innerGroup, Colors.stopRed, r, r)
  this.cancelBn.addIcon(VectorPaths.faTimes, iconH);

  this.bubbleOverlay = new FBBubbleOverlay(Overlay.types.inputPad, 20, this.innerGroup, this, Colors.easternBlue);
  this.bubbleOverlay.display(this.parentX, this.parentY, this.parentX + this.parentW, this.parentY + this.parentH, innerWidth, innerHeight);
}

FBSaveFile.prototype.close = function() {
	this.bubbleOverlay.hide();
};
