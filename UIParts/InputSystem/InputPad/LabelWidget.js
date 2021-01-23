/**
 * Displays centered text in an InputPad
 * @param {string} text - The text to display
 * @constructor
 */
InputWidget.Label = function(text) {
	this.text = text;
};
InputWidget.Label.prototype = Object.create(InputWidget.prototype);
InputWidget.Label.prototype.constructor = InputWidget.Label;

InputWidget.Label.setConstants = function() {
	const L = InputWidget.Label;
	L.font = Font.uiFont(16).bold();
	L.margin = 2;
	L.color = Colors.white;
};

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 * @param {Element} parentGroup
 */
InputWidget.Label.prototype.show = function(x, y, parentGroup) {
	const L = InputWidget.Label;
	this.textE = GuiElements.draw.text(x, y, "", L.font, L.color);
	GuiElements.update.textLimitWidth(this.textE, this.text, InputPad.width);
	const textW = GuiElements.measure.textWidth(this.textE);
	const textX = InputPad.width / 2 - textW / 2;
	const textY = y + L.font.charHeight + L.margin;
	GuiElements.move.text(this.textE, textX, textY);
	parentGroup.appendChild(this.textE);
	this.textY = textY;
};

/**
 * Computes the height of the label
 */
InputWidget.Label.prototype.updateDim = function() {
	const L = InputWidget.Label;
	this.height = L.font.charHeight + 2 * L.margin;
	this.width = L.maxWidth;
};
