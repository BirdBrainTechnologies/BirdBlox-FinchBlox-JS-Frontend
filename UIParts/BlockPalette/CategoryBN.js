/**
 * A button shown in the BlockPalette and used to activate a Category
 * @param {number} x
 * @param {number} y
 * @param {Category} category
 * @constructor
 */
function CategoryBN(x, y, category) {
  this.x = x;
  this.y = y;
  this.category = category;
  this.text = this.category.name;
  this.catId = this.category.id;
  if (FinchBlox) {
    this.fill = Hatchling ? Colors.blockPalette[this.catId] : Colors.getColor(this.catId);
  } else {
    this.fill = Colors.getGradient(this.catId);
  }
  this.buildGraphics();
  if (FinchBlox) { //&& !Hatchling) {
    this.setHidden();
  }
}

CategoryBN.setGraphics = function() {
  const BP = BlockPalette;
  const CBN = CategoryBN;
  CBN.bg = Colors.white;
  CBN.font = Font.uiFont(15);
  CBN.foreground = Colors.black;
  CBN.colorW = 8; // The width of the band of color on the left
  CBN.labelLMargin = 6; // The amount of space between the text of the button and the band of color

  if (FinchBlox) {
    CBN.hMargin = Hatchling ? 0 : BP.catHMargin;
    CBN.height = BP.catH;
    CBN.selectedH = BP.catH + 10;
    CBN.iconScale = Hatchling ? 1 : 0.65;
    CBN.width = 60;
    CBN.vMargin = 15;
    CBN.labelX = CBN.colorW + CBN.labelLMargin;
    CBN.labelY = (CBN.height + CBN.font.charHeight) / 2;
    CBN.cornerRadius = 8;
  } else {
    CBN.hMargin = BP.catHMargin;
    CBN.height = 30;
    CBN.width = (BP.width - 2 * BP.catHMargin - CBN.hMargin) / 2;
    const numberOfRows = Math.ceil(BlockList.catCount() / 2);
    CBN.vMargin = (BP.catH - BP.catVMargin - numberOfRows * CBN.height) / (numberOfRows - 1);
    CBN.labelX = CBN.colorW + CBN.labelLMargin;
    CBN.labelY = (CBN.height + CBN.font.charHeight) / 2;
  }

};

/**
 * Renders the visuals of the CategoryBN
 */
CategoryBN.prototype.buildGraphics = function() {
  const CBN = CategoryBN;
  this.group = GuiElements.create.group(this.x, this.y, GuiElements.layers.categories);
  if (FinchBlox) {
    //this.bgRect = GuiElements.draw.rect(0, 0, CBN.width, CBN.height, this.fill);
    this.bgRect = GuiElements.draw.tab(0, 0, CBN.width, CBN.height, this.fill, CBN.cornerRadius);
    if (Hatchling) { GuiElements.update.opacity(this.bgRect, 0) }
  } else {
    this.bgRect = GuiElements.draw.rect(0, 0, CBN.width, CBN.height, CBN.bg);
  }

  this.group.appendChild(this.bgRect);
  if (FinchBlox) {
    let iconPath = VectorPaths.categoryIcons[this.catId];
    let iconH = CBN.height * CBN.iconScale;
    let iconW = VectorIcon.computeWidth(iconPath, iconH);
    let iconX = (CBN.width - iconW) / 2;
    let iconY = (CBN.height - iconH) / 2;
    let color = Hatchling ? Colors.getColor(this.catId) : Button.foreground
    this.icon = new VectorIcon(iconX, iconY, iconPath, color, iconH, this.group, false);
    if (iconPath == VectorPaths.microbit) { 
      this.icon.setColor(Colors.bbtDarkGray)
      this.icon.addBackgroundRect() 
    }
    this.label = this.icon.pathE;
  } else {
    this.colorRect = GuiElements.draw.rect(0, 0, CBN.colorW, CBN.height, this.fill);
    this.label = GuiElements.draw.text(CBN.labelX, CBN.labelY, this.text, CBN.font, CBN.foreground);
  }
  if (!FinchBlox) {
    this.group.appendChild(this.colorRect);
    this.group.appendChild(this.label);
  }
  GuiElements.layers.categories.appendChild(this.group);
  this.addListeners();
};

/**
 * Makes the button appear selected
 */
CategoryBN.prototype.select = function() {
  if (Hatchling) {
    BlockPalette.updatePaletteColor(Colors.blockPalette[this.catId]);
    GuiElements.update.opacity(this.bgRect, 1)
    BlockPalette.updateOutline()
  } else if (FinchBlox) {
    let pop = CategoryBN.height - CategoryBN.selectedH;
    GuiElements.move.group(this.group, this.x, this.y + pop);
    GuiElements.update.tab(this.bgRect, 0, 0, CategoryBN.width, CategoryBN.selectedH, CategoryBN.cornerRadius);

    BlockPalette.updatePaletteColor(Colors.blockPalette[this.catId]);

    let iconPath = VectorPaths.categoryIcons[this.catId];
    let iconH = CategoryBN.selectedH * CategoryBN.iconScale;
    let iconW = VectorIcon.computeWidth(iconPath, iconH);
    let iconX = (CategoryBN.width - iconW) / 2;
    let iconY = (CategoryBN.selectedH - iconH) / 2;
    this.icon.update(iconX, iconY, iconH);
  } else {
    this.bgRect.setAttributeNS(null, "fill", this.fill);
    this.label.setAttributeNS(null, "fill", Colors.white);
  }
};

/**
 * Makes the button appear deselected
 */
CategoryBN.prototype.deselect = function() {
  if (Hatchling) {
    GuiElements.update.opacity(this.bgRect, 0)
  } else if (FinchBlox) {
    GuiElements.move.group(this.group, this.x, this.y);
    GuiElements.update.tab(this.bgRect, 0, 0, CategoryBN.width, CategoryBN.height, CategoryBN.cornerRadius);

    let iconPath = VectorPaths.categoryIcons[this.catId];
    let iconH = CategoryBN.height * CategoryBN.iconScale;
    let iconW = VectorIcon.computeWidth(iconPath, iconH);
    let iconX = (CategoryBN.width - iconW) / 2;
    let iconY = (CategoryBN.height - iconH) / 2;
    this.icon.update(iconX, iconY, iconH);
  } else {
    this.bgRect.setAttributeNS(null, "fill", CategoryBN.bg);
    this.label.setAttributeNS(null, "fill", Colors.black);
  }
};

/**
 * Adds event listeners to the parts of the button
 */
CategoryBN.prototype.addListeners = function() {
  const TR = TouchReceiver;
  const cat = this.category;
  TouchReceiver.addListenersCat(this.bgRect, cat);
  if (!FinchBlox) {
    TouchReceiver.addListenersCat(this.colorRect, cat);
  } else if (this.icon.bgRect) {
    TouchReceiver.addListenersCat(this.icon.bgRect, cat);
  }
  TouchReceiver.addListenersCat(this.label, cat);
};

/**
 * For FinchBlox only. Show or Hide this button based on the currently selected
 * difficulty level.
 */
CategoryBN.prototype.setHidden = function() {
  const level = this.category.level;
  //if (level != LevelMenu.currentLevel && this.group.parentNode != null) {
  if (level != LevelManager.currentLevel && this.group.parentNode != null) {
    this.group.parentNode.removeChild(this.group);
    //} else if (level == LevelMenu.currentLevel && this.group.parentNode == null) {
  } else if (level == LevelManager.currentLevel && this.group.parentNode == null) {
    GuiElements.layers.categories.appendChild(this.group);
  }
};
