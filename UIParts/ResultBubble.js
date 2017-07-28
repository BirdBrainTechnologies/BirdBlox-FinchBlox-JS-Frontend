/**
 * A bubble-shaped element that holds text containing the result of executing a block that was tapped.
 * Becomes visible as soon as it is constructed.
 * @param {number} leftX - left boundary of the Block
 * @param {number} rightX - right boundary of the Block
 * @param {number} upperY - top boundary of the Block
 * @param {number} lowerY - bottom boundary of the Block
 * @param {string} text - The text to show in the bubble
 * @param {boolean} [error=false] - Whether the bubble should be formatted as an error
 * @constructor
 */
function ResultBubble(leftX, rightX, upperY, lowerY, text, error) {
	const RB = ResultBubble;
	if (error == null) {
		error = false;
	}
	let fontColor = RB.fontColor;
	let bgColor = RB.bgColor;
	if (error) {
		fontColor = RB.errorFontColor;
		bgColor = RB.errorBgColor;
	}
	const height = RB.font.charHeight;
	const textE = GuiElements.draw.text(0, height, text, RB.font, fontColor);
	GuiElements.update.textLimitWidth(textE, text, GuiElements.width - RB.hMargin * 2);
	const width = GuiElements.measure.textWidth(textE);
	const group = GuiElements.create.group(0, 0);
	group.appendChild(textE);
	let layer = GuiElements.layers.resultBubble;
	let overlayType = Overlay.types.resultBubble;
	this.bubbleOverlay = new BubbleOverlay(overlayType, bgColor, RB.margin, group, this, layer);
	this.bubbleOverlay.display(leftX, rightX, upperY, lowerY, width, height);
}

ResultBubble.setConstants = function() {
	const RB = ResultBubble;
	RB.fontColor = Colors.black;
	RB.errorFontColor = Colors.white;
	RB.bgColor = Colors.white;
	RB.errorBgColor = "#c00000";
	RB.font = Font.uiFont(16);
	RB.margin = 4;
	/*RB.lifetime=3000;*/
	RB.hMargin = 20;
};

/**
 * Hides the result
 */
ResultBubble.prototype.close = function() {
	this.bubbleOverlay.hide();
};

/**
 * Displays a ResultBubble below a block
 * @param {string} value - The message to display
 * @param {number} x - The x coord of the Block
 * @param {number} y - The y coord of the Block
 * @param {number} width - The width of the Block
 * @param {number} height - The height of the Block
 * @param {boolean} [error=false] - Whether the bubble should be formatted as an error
 */
ResultBubble.displayValue = function(value, x, y, width, height, error) {
	if (error == null) {
		error = false;
	}
	const leftX = x;
	const rightX = x + width;
	const upperY = y;
	const lowerY = y + height;
	new ResultBubble(leftX, rightX, upperY, lowerY, value, error);
};