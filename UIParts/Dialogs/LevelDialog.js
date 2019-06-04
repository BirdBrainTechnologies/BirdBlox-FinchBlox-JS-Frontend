/**
 * A dialog for changing the difficulty level. Used in FinchBlox.
 */
function LevelDialog() {
  RowDialog.call(this, true, null, 5, 0, 0, 0, true);

  this.buttons = [];
}
LevelDialog.prototype = Object.create(RowDialog.prototype);
LevelDialog.prototype.constructor = LevelDialog;

LevelDialog.setGlobals = function() {
  const LD = LevelDialog;
  LD.color = Colors.seance;
  LD.strokeW = 2;
  LD.bnR = 10;

  LD.totalLevels = 3;
  LD.currentLevel = 1;
}

LevelDialog.prototype.createContent = function() {
  const LD = LevelDialog;
  const rowGroup = GuiElements.create.group(0, 0);

  const margin = this.width/16;
  const bnDim = (this.width - margin*(2+(LD.totalLevels-1)*1.5))/LD.totalLevels; //buttons are square

  //const y = margin;
  const y = (this.height - bnDim)/2;
  var x = margin;

  for (let i = 1; i <= LD.totalLevels; i++) {
    const button = new Button(x, y, bnDim, bnDim, rowGroup, Colors.white, LD.bnR, LD.bnR);
    GuiElements.update.stroke(button.bgRect, LD.color, LD.strokeW);
    button.addText(i, Font.uiFont(90), LD.color);
    button.setCallbackFunction(function(){LevelDialog.setLevel(i);}, false);
    button.setCallbackFunction(function(){RowDialog.currentDialog.closeDialog();}, true);

    this.buttons.push(button);
    x+= bnDim + 1.5*margin;
  }

  this.highlightSelected();

  return rowGroup;
}

LevelDialog.setLevel = function(level) {
  const LD = LevelDialog;
  if (LD.currentLevel != level) {
    LD.currentLevel = level;
    BlockPalette.setLevel();
    TabManager.activeTab.clear();
    TitleBar.levelButton.addText(level, Font.uiFont(30), Colors.white);
  }
  RowDialog.currentDialog.highlightSelected();
}

LevelDialog.prototype.highlightSelected = function() {
  const LD = LevelDialog;
  for (let i = 0; i < LD.totalLevels; i++){
    const bn = this.buttons[i];
    if (LD.currentLevel == i + 1){
      GuiElements.update.color(bn.bgRect, LD.color);
      GuiElements.update.color(bn.textE, Colors.white);
    } else {
      GuiElements.update.color(bn.bgRect, Colors.white);
      GuiElements.update.color(bn.textE, LD.color);
    }
  }

}
