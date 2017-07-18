/**
 * Created by Tom on 7/17/2017.
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
CloseButton.prototype.press=function(){
	if(!this.pressed){
		this.pressed=true;
		this.setColor(true);
	}
};
CloseButton.prototype.release=function(){
	if(this.pressed){
		this.pressed = false;
		this.setColor(false);
		this.callbackFn();
	}
};
CloseButton.prototype.interrupt=function(){
	if(this.pressed){
		this.pressed = false;
		this.setColor(false);
	}
};
CloseButton.prototype.markAsOverlayPart = function(overlay){
	this.partOfOverlay = overlay;
};
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