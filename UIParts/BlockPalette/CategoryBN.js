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
		this.fill = Colors.getColor(this.catId);
	} else {
		this.fill = Colors.getGradient(this.catId);
	}
	this.buildGraphics();
}

CategoryBN.setGraphics = function() {
	const BP = BlockPalette;
	const CBN = CategoryBN;
	CBN.bg = Colors.white;
	CBN.font = Font.uiFont(15);
	CBN.foreground = Colors.black;
	CBN.colorW = 8;   // The width of the band of color on the left
	CBN.labelLMargin = 6;   // The amount of space between the text of the button and the band of color

	if (FinchBlox) {
		CBN.hMargin = BP.catHMargin;
		CBN.height = 50;
		CBN.selectedH = 60;
		CBN.width = 60;
		CBN.vMargin = 15;
		CBN.labelX = CBN.colorW + CBN.labelLMargin;
		CBN.labelY = (CBN.height + CBN.font.charHeight) / 2;
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
	if (FinchBlox){
		//this.bgRect = GuiElements.draw.rect(0, 0, CBN.width, CBN.height, this.fill);
		this.bgRect = GuiElements.draw.tabBN(0, 0, CBN.width, CBN.height, this.fill);
	} else {
		this.bgRect = GuiElements.draw.rect(0, 0, CBN.width, CBN.height, CBN.bg);
	}

	this.group.appendChild(this.bgRect);
	if (FinchBlox) {
		let iconPath = VectorPaths.language;
		let iconH = CBN.height * 0.75;
		let iconW = VectorIcon.computeWidth(iconPath, iconH);
		let iconX = (CBN.width - iconW)/2;
		let iconY = (CBN.height - iconH)/2;
		console.log("vector icon " + iconX + " " + iconY + " " + iconH);
		this.icon = new VectorIcon(iconX, iconY, iconPath, Button.foreground, iconH, this.group, false);
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
	if (FinchBlox){
		let pop = CategoryBN.height - CategoryBN.selectedH;
		GuiElements.move.group(this.group, this.x, this.y + pop);
		GuiElements.update.tabBN(this.bgRect, 0, 0, CategoryBN.width, CategoryBN.selectedH);
	} else {
		this.bgRect.setAttributeNS(null, "fill", this.fill);
		this.label.setAttributeNS(null, "fill", Colors.white);
	}
};

/**
 * Makes the button appear deselected
 */
CategoryBN.prototype.deselect = function() {
	if (FinchBlox) {
		GuiElements.move.group(this.group, this.x, this.y);
		GuiElements.update.tabBN(this.bgRect, 0, 0, CategoryBN.width, CategoryBN.height);
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
	if (!FinchBlox) { TouchReceiver.addListenersCat(this.colorRect, cat); }
	TouchReceiver.addListenersCat(this.label, cat);
};
