/**
 * Created by Tom on 6/13/2017.
 */
/**
 * Creates a UI element that is in a div layer and contains a scrollDiv with the content from the group.  The group
 * can change size, as long as it calls updateDims with the new innerHeight and innerWidth.
 * @param group
 * @param layer
 * @param width {number}
 * @param height {number}
 * @param innerWidth {number}
 * @param innerHeight {number}
 * @constructor
 */
function SmoothScrollBox(group, layer, width, height, innerWidth, innerHeight){
	DebugOptions.validateNonNull(group, layer);
	DebugOptions.validateNumbers(width, height, innerWidth, innerHeight);
	this.width = width;
	this.height = height;
	this.layer = layer;
	this.scrollDiv = GuiElements.create.scrollDiv();
	this.contentSvg = GuiElements.create.svg(this.scrollDiv);
	this.contentGroup = GuiElements.create.group(0, 0, this.contentSvg);
	this.visible = false;
}
SmoothScrollBox.prototype.updateDims = function(innerWidth, innerHeight){
	this.innerWidth = innerWidth;
	this.innerHeight = innerHeight;
};
SmoothScrollBox.prototype.updateZoom = function(){

};
SmoothScrollBox.prototype.show = function(){
	if(!this.visible){
		this.visible = true;
		this.layer.appendChild(this.scrollDiv);
	}
};
SmoothScrollBox.prototype.hide = function(){
	if(this.visible){
		this.visible = false;
		this.layer.removeChild(this.scrollDiv);
	}
};