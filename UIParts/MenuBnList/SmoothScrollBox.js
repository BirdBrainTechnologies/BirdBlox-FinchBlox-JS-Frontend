/**
 * Created by Tom on 6/13/2017.
 */
/**
 * Creates a UI element that is in a div layer and contains a scrollDiv with the content from the group.  The group
 * can change size, as long as it calls updateDims with the new innerHeight and innerWidth.
 */
function SmoothScrollBox(group, layer, absX, absY, width, height, innerWidth, innerHeight, isOverlay){
	DebugOptions.validateNonNull(group, layer);
	DebugOptions.validateNumbers(width, height, innerWidth, innerHeight);
	this.x = absX;
	this.y = absY;
	this.width = width;
	this.height = height;
	this.innerWidth = innerWidth;
	this.innerHeight = innerHeight;
	this.layer = layer;
	this.scrollDiv = GuiElements.create.scrollDiv();
	TouchReceiver.addListenersScrollBox(this.scrollDiv, this);
	this.contentSvg = GuiElements.create.svg(this.scrollDiv);
	this.contentGroup = GuiElements.create.group(0, 0, this.contentSvg);
	this.contentGroup.appendChild(group);
	this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv);
	this.visible = false;
	this.currentZoom = GuiElements.zoomFactor;
	this.isOverlayPart = isOverlay;
}
SmoothScrollBox.prototype.updateScrollSet = function(){
	if(this.visible) {
		let realX = GuiElements.relToAbsX(this.x);
		let realY = GuiElements.relToAbsY(this.y);

		GuiElements.update.smoothScrollSet(this.scrollDiv, this.contentSvg, this.contentGroup, realX, realY, this.width,
			this.height, this.innerWidth, this.innerHeight);
	}
};
SmoothScrollBox.prototype.updateZoom = function(){
	var currentScrollX = this.getScrollX();
	var currentScrollY = this.getScrollY();
	this.currentZoom = GuiElements.zoomFactor;
	this.updateScrollSet();
	this.setScrollX(currentScrollX);
	this.setScrollY(currentScrollY);
};
SmoothScrollBox.prototype.setContentDims = function(innerWidth, innerHeight){
	this.innerHeight = innerHeight;
	this.innerWidth = innerWidth;
	this.updateScrollSet();
};
SmoothScrollBox.prototype.setDims = function(width, height){
	this.width = width;
	this.height = height;
	this.updateScrollSet();
};
SmoothScrollBox.prototype.move = function(absX, absY){
	this.x = absX;
	this.y = absY;
	this.updateScrollSet();
};
SmoothScrollBox.prototype.show = function(){
	if(!this.visible){
		this.visible = true;
		this.layer.appendChild(this.scrollDiv);
		this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv);
		this.updateScrollSet();
		TouchReceiver.setInitialScrollFix(this.scrollDiv);
	}
};
SmoothScrollBox.prototype.hide = function(){
	if(this.visible){
		this.visible = false;
		this.layer.removeChild(this.scrollDiv);
		if(this.fixScrollTimer != null) {
			window.clearInterval(this.fixScrollTimer);
		}
	}
};
SmoothScrollBox.prototype.relToAbsX=function(x){
	return x - this.scrollDiv.scrollLeft / this.currentZoom + this.x;
};
SmoothScrollBox.prototype.relToAbsY=function(y){
	return y - this.scrollDiv.scrollTop  / this.currentZoom + this.y;
};
SmoothScrollBox.prototype.absToRelX=function(x){
	return x + this.scrollDiv.scrollLeft * this.currentZoom - this.x;
};
SmoothScrollBox.prototype.absToRelY=function(y){
	return y + this.scrollDiv.scrollTop * this.currentZoom - this.y;
};
SmoothScrollBox.prototype.getScrollY = function(){
	if(!this.visible) return 0;
	return this.scrollDiv.scrollTop / this.currentZoom;
};
SmoothScrollBox.prototype.getScrollX = function(){
	if(!this.visible) return 0;
	return this.scrollDiv.scrollLeft / this.currentZoom;
};
SmoothScrollBox.prototype.setScrollX = function(x){
	this.scrollDiv.scrollLeft = x * this.currentZoom;
	TouchReceiver.setInitialScrollFix(this.scrollDiv);
};
SmoothScrollBox.prototype.setScrollY = function(y){
	this.scrollDiv.scrollTop = y * this.currentZoom;
	TouchReceiver.setInitialScrollFix(this.scrollDiv);
};