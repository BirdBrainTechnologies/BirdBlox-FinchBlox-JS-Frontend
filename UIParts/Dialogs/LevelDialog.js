/**
 * A dialog for changing the difficulty level. Used in FinchBlox.
 */
function LevelDialog() {
  //  RowDialog.call(this, true, null, 5, 0, 0, 0, true);
  this.visible = false;
  this.buttons = [];
}
//LevelDialog.prototype = Object.create(RowDialog.prototype);
//LevelDialog.prototype.constructor = LevelDialog;

LevelDialog.setConstants = function() {
  const LD = LevelDialog;
  LD.color = Colors.seance;
  LD.strokeW = 1.5;
  LD.bnR = 10;
}

LevelDialog.prototype.show = function() {
  if (!this.visible) {
    this.visible = true;

    // Close existing dialog if any
    if (RowDialog.currentDialog != null && RowDialog.currentDialog !== this) {
      RowDialog.currentDialog.closeDialog();
    }
    RowDialog.currentDialog = this;

    this.width = GuiElements.width * 0.6;
    this.height = this.width * 0.35;
    this.font = Font.uiFont(this.height / 2);
    this.x = GuiElements.width / 2 - this.width / 2;
    this.y = GuiElements.height / 2 - this.height / 2;
    this.group = GuiElements.create.group(this.x, this.y);
    this.bgRect = this.drawBackground();
    this.rowGroup = this.createContent();
  }

  GuiElements.layers.overlay.appendChild(this.group);

  GuiElements.blockInteraction();
}

/**
 * Draws the gray background rectangle of the dialog
 * @return {Element} - The SVG rect element
 */
LevelDialog.prototype.drawBackground = function() {
  const RD = RowDialog;
  let rect = GuiElements.draw.rect(0, 0, this.width, this.height, RD.bgColor, RD.cornerR, RD.cornerR);
  this.group.appendChild(rect);
  return rect;
};

LevelDialog.prototype.createContent = function() {
  const LD = LevelDialog;
  const LM = LevelManager;
  const rowGroup = GuiElements.create.group(0, 0);

  //const margin = this.width/16;
  const bnMargin = this.width * 0.1 //0.08; //Margin between buttons
  const hMargin = bnMargin * 0.5; //4/3; //Margin on outer edges
  //const bnDim = (this.width - margin*(2+(LD.totalLevels-1)*1.5))/LD.totalLevels; //buttons are square
  const bnDim = (this.width - 2 * hMargin - bnMargin * (LM.totalLevels - 1)) / LM.totalLevels

  //const y = margin;
  const y = (this.height - bnDim) / 2;
  //var x = margin;
  var x = hMargin

  for (let i = 1; i <= LM.totalLevels; i++) {
    const button = new Button(x, y, bnDim, bnDim, rowGroup, Colors.white, LD.bnR, LD.bnR);
    GuiElements.update.stroke(button.bgRect, LD.color, LD.strokeW);
    button.addText(i, this.font, LD.color);
    //for iOS 9, using i directly in the callback causes variable scoping problems
    switch (i) {
      case 1:
        button.setCallbackFunction(function() {
          this.setLevel(1);
        }.bind(this), false);
        break;
      case 2:
        button.setCallbackFunction(function() {
          this.setLevel(2);
        }.bind(this), false);
        break;
      case 3:
        button.setCallbackFunction(function() {
          this.setLevel(3);
        }.bind(this), false);
        break;
    }
    //button.setCallbackFunction(function(){this.setLevel(i);}.bind(this), false);
    button.setCallbackFunction(function() {
      this.close();
    }.bind(this), true);

    this.buttons.push(button);
    //x+= bnDim + 1.5*margin;
    x += bnDim + bnMargin;
  }

  this.highlightSelected();

  this.group.appendChild(rowGroup);
  return rowGroup;
}

LevelDialog.prototype.setLevel = function(level) {
  LevelManager.setLevel(level);
  LevelManager.loadLevelSavePoint();
  this.highlightSelected();
}

LevelDialog.prototype.highlightSelected = function() {
  const LM = LevelManager;
  for (let i = 0; i < LM.totalLevels; i++) {
    const bn = this.buttons[i];
    if (LM.currentLevel == i + 1) {
      GuiElements.update.color(bn.bgRect, LevelDialog.color);
      GuiElements.update.color(bn.textE, Colors.white);
    } else {
      GuiElements.update.color(bn.bgRect, Colors.white);
      GuiElements.update.color(bn.textE, LevelDialog.color);
    }
  }
}

LevelDialog.prototype.close = function() {
  if (this.visible) {
    this.visible = false;
    this.group.remove();
    if (RowDialog.currentDialog === this) {
      RowDialog.currentDialog = null;
    }
  }
}

/**
 * Removes the dialog from view and unblocks the ui behind it.
 */
LevelDialog.prototype.closeDialog = function() {
  //console.log("LevelDialog.prototype.closeDialog")
  this.close();
  GuiElements.unblockInteraction();
}
