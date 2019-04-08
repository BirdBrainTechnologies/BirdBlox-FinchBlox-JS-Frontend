/**
 * Menu for changing difficulty level in FinchBlox. Since this menu appears as
 * a BubbleOverlay, it is not a direct subclass of Menu.
 */

/**
function LevelMenu(x, y){
  this.x = x;
  this.y = y;
  this.open();
};

LevelMenu.setConstants = function() {
	const LM = LevelMenu;
	LM.bnMargin = Button.defaultMargin;
	LM.bgColor = Colors.lightLightGray;

  LM.currentLevel = 1;
};

LevelMenu.prototype.open = function() {
  const LM = LevelMenu;
  this.group = GuiElements.create.group(0, 0);

	let layer = GuiElements.layers.inputPad;
	let overlayType = Overlay.types.inputPad;
	this.bubbleOverlay = new BubbleOverlay(overlayType, LM.bgColor, LM.bnMargin, this.group, this, layer);
	this.menuBnList = new SmoothMenuBnList(this.bubbleOverlay, this.group, 0, 0);
	this.menuBnList.markAsOverlayPart(this.bubbleOverlay);
	this.addOptions();
	const height = this.menuBnList.previewHeight();
	const width = this.menuBnList.previewWidth();
	this.bubbleOverlay.display(this.x, this.x, this.y, this.y, this.menuBnList.width, height);
	this.menuBnList.show();
};

LevelMenu.prototype.addOptions = function() {
  const f = function(level, menu) {
    LevelMenu.setLevel(level);
    menu.close();
  }

  this.menuBnList.addOption("1", function(){ f(1, this); }.bind(this));

  this.menuBnList.addOption("2", function(){ f(2, this); }.bind(this));

  this.menuBnList.addOption("3", function(){ f(3, this); }.bind(this));
};

LevelMenu.setLevel = function(level) {
  const LM = LevelMenu;
  if (LM.currentLevel != level) {
    LM.currentLevel = level;
    BlockPalette.setLevel();
    TabManager.activeTab.clear();
    TitleBar.levelButton.addText(level, Font.uiFont(24).bold(), Colors.bbtDarkGray);
  }
}

LevelMenu.prototype.close = function() {
	this.bubbleOverlay.hide();
	this.menuBnList.hide();
};
*/
