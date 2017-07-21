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
	this.fill = Colors.getGradient(this.catId);
	this.buildGraphics();
}

CategoryBN.setGraphics = function() {
	const BP = BlockPalette;
	const CBN = CategoryBN;
	CBN.bg = Colors.darkDarkGray;
	CBN.font = Font.uiFont(15);
	CBN.foreground = "#fff";
	CBN.height = 30;
	CBN.colorW = 8;   // The width of the band of color on the left
	CBN.labelLMargin = 6;   // The amount of space between the text of the button and the band of color

	CBN.hMargin = BP.catHMargin;
	CBN.width = (BP.width - 2 * BP.catHMargin - CBN.hMargin) / 2;
	const numberOfRows = Math.ceil(BlockList.catCount() / 2);
	CBN.vMargin = (BP.catH - BP.catVMargin - numberOfRows * CBN.height) / (numberOfRows - 1);
	CBN.labelX = CBN.colorW + CBN.labelLMargin;
	CBN.labelY = (CBN.height + CBN.font.charHeight) / 2;
};

/**
 * Renders the visuals of the CategoryBN
 */
CategoryBN.prototype.buildGraphics = function() {
	const CBN = CategoryBN;
	this.group = GuiElements.create.group(this.x, this.y, GuiElements.layers.categories);
	this.bgRect = GuiElements.draw.rect(0, 0, CBN.width, CBN.height, CBN.bg);
	this.colorRect = GuiElements.draw.rect(0, 0, CBN.colorW, CBN.height, this.fill);
	this.label = GuiElements.draw.text(CBN.labelX, CBN.labelY, this.text, CBN.font, CBN.foreground);
	this.group.appendChild(this.bgRect);
	this.group.appendChild(this.colorRect);
	this.group.appendChild(this.label);
	GuiElements.layers.categories.appendChild(this.group);
	this.addListeners();
};

/**
 * Makes the button appear selected
 */
CategoryBN.prototype.select = function() {
	this.bgRect.setAttributeNS(null, "fill", this.fill);
};

/**
 * Makes the button appear deselected
 */
CategoryBN.prototype.deselect = function() {
	this.bgRect.setAttributeNS(null, "fill", CategoryBN.bg);
};

/**
 * Adds event listeners to the parts of the button
 */
CategoryBN.prototype.addListeners = function() {
	const TR = TouchReceiver;
	const cat = this.category;
	TouchReceiver.addListenersCat(this.bgRect, cat);
	TouchReceiver.addListenersCat(this.colorRect, cat);
	TouchReceiver.addListenersCat(this.label, cat);
};