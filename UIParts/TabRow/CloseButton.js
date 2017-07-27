/**
 * A round button with an x that calls the specified function when tapped
 * @param {number} cx - The x coord of the center of the button
 * @param {number} cy - The y coord of the center of the button
 * @param {number} height - The height of the button (diameter)
 * @param {function} callbackFn - The function to call when the button is tapped
 * @param {Element} group - The SVG group to add the button to
 * @constructor
 */
function CloseButton(cx, cy, height, callbackFn, group){
	const CB = CloseButton;
	this.pressed = false;
	this.group = group;
	this.circleE = GuiElements.draw.circle(cx, cy, height / 2, CB.bg, this.group);
	const iconH = height * CB.iconHMult;
	this.icon = new VectorIcon(cx - iconH / 2, cy - iconH / 2, VectorPaths.letterX, CB.foreground, iconH, this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
	TouchReceiver.addListenersBN(this.circleE,this);
	this.callbackFn = callbackFn;
}

CloseButton.setGraphics=function(){
	const CB = CloseButton;
	CB.bg = Button.bg;
	CB.foreground = Button.foreground;
	CB.highlightBg = Button.highlightBg;
	CB.highlightFore = Button.highlightFore;
	CB.iconHMult = 0.5;
};

/**
 * Makes the button appear to be pressed
 */
CloseButton.prototype.press=function(){
	if(!this.pressed){
		this.pressed=true;
		this.setColor(true);
	}
};

/**
 * Makes the button appear to be released and calls the callback
 */
CloseButton.prototype.release=function(){
	if(this.pressed){
		this.pressed = false;
		this.setColor(false);
		this.callbackFn();
	}
};

/**
 * Makes the function appear to be released without triggering the callback (for when a dialog is shown)
 */
CloseButton.prototype.interrupt=function(){
	if(this.pressed){
		this.pressed = false;
		this.setColor(false);
	}
};

/**
 * Marks this button as a member of the specified overlay so it doesn't close it
 * @param {Overlay} overlay
 */
CloseButton.prototype.markAsOverlayPart = function(overlay){
	this.partOfOverlay = overlay;
};

/**
 * Sets the color of the button to match its pressed/not pressed state
 * @param {boolean} isPressed - Whether the button is pressed
 */
CloseButton.prototype.setColor = function(isPressed) {
	const CB = CloseButton;
	if (isPressed) {
		this.icon.setColor(CB.highlightFore);
		GuiElements.update.color(this.circleE, CB.highlightBg);
	} else {
		this.icon.setColor(CB.foreground);
		GuiElements.update.color(this.circleE, CB.bg);
	}
};