/**
 * Abstract class for popups for FinchBlox. Is the superclass of all popups
 * other than block inputs.
 */

function FBPopup(x, y, w, h, parentGroup) {
  this.parentX = x;
  this.parentY = y;
  this.parentW = w;
  this.parentH = h;
  this.parentGroup = parentGroup;
  this.parentLayer = GuiElements.layers.titlebar;
}

FBPopup.setConstants = function() {
	FBPopup.bnMargin = Button.defaultMargin;
  FBPopup.color = Colors.easternBlue;
  FBPopup.bubbleMargin = 20;
  FBPopup.font = Font.secondaryUiFont(16);
  FBPopup.fontColor = Colors.bbtDarkGray;
  FBPopup.trashIcon = VectorPaths.faTrash;
  FBPopup.trashColor = Colors.stopRed;
  FBPopup.innerWidth = GuiElements.width/2;

  //Keep iOS 9 from resizing the window when the keyboard comes up
  FBPopup.isEditingText = false;
}

FBPopup.prototype.show = function(heightToWidthRatio) {
  //console.log("Showing fb popup with parent y=" + this.parentY)
  const overlayType = Overlay.types.inputPad;
  this.innerWidth = FBPopup.innerWidth;
  this.innerHeight = this.innerWidth * heightToWidthRatio;

  this.innerGroup = GuiElements.create.group(0, 0);

  this.bubbleOverlay = new FBBubbleOverlay(overlayType, FBPopup.bubbleMargin, this.innerGroup, this, FBPopup.color);
  this.bubbleOverlay.display(this.parentX, this.parentY, this.parentX + this.parentW, this.parentY + this.parentH, this.innerWidth, this.innerHeight);
  this.x = this.bubbleOverlay.x;
  this.y = this.bubbleOverlay.y;
}

FBPopup.prototype.close = function() {
  console.log("called close")
  this.bubbleOverlay.hide();
  if (FBPopup.isEditingText && GuiElements.isAndroid) {
    HtmlServer.sendRequestWithCallback("ui/hideNavigationBar");
  }
  FBPopup.isEditingText = false;

}

FBPopup.prototype.addConfirmCancelBns = function() {
  //console.log("adding buttons")
  const r = TitleBar.defaultCornerRounding;
  const buttonW = this.innerWidth/3;
  const buttonH = buttonW * 2/5;
  const iconH = buttonH*2/3;
  const buttonMargin = this.innerWidth / 20;
  const cancelX = this.innerWidth/2 - buttonW - buttonMargin/2;
  const confirmX = this.innerWidth/2 + buttonMargin/2;
  const buttonY = this.innerHeight - buttonH; //- FBPopup.bubbleMargin;

  this.confirmBn = new Button(confirmX, buttonY, buttonW, buttonH, this.innerGroup, Colors.flagGreen, r, r);
  this.confirmBn.addIcon(VectorPaths.faCheck, iconH);
  this.confirmBn.setCallbackFunction(function () {
    this.confirm();
  }.bind(this), false);

  this.cancelBn = new Button(cancelX, buttonY, buttonW, buttonH, this.innerGroup, Colors.stopRed, r, r)
  this.cancelBn.addIcon(VectorPaths.faTimes, iconH);
  this.cancelBn.setCallbackFunction(function () {
    this.cancel();
  }.bind(this), true);
}

FBPopup.prototype.confirm = function() {
  DebugOptions.markAbstract();
}

FBPopup.prototype.cancel = function() {
  GuiElements.unblockInteraction();
}
