/**
 * Created by Tom on 6/26/2017.
 */
/* Overlay is an abstract class representing UI elements that appear over other elements and should disappear when other
 * elements are tapped.  Only one overlay of each type can exist on the screen at once. */
function Overlay(type){
	this.type = type;
}
/* All overlays have a close function */
Overlay.prototype.close = function() {
	DebugOptions.markAbstract();
};
Overlay.prototype.addOverlayAndCloseOthers = function(){
	Overlay.closeOverlaysOfType(this.type);
	Overlay.addOverlay(this);
};
/* Initializes the static elements of the class */
Overlay.setStatics = function(){
	/* Keeps track of open overlays */
	Overlay.openOverlays = new Set();
	Overlay.types = {};
	Overlay.types.inputPad = 1;
	Overlay.types.resultBubble = 2;
	Overlay.types.menu = 3;
	Overlay.types.connectionList = 4;
};
Overlay.addOverlay = function(overlay){
	if(!Overlay.openOverlays.has(overlay)) {
		Overlay.openOverlays.add(overlay);
	}
};
Overlay.removeOverlay = function(overlay){
	if(Overlay.openOverlays.has(overlay)) {
		Overlay.openOverlays.delete(overlay);
	}
};
Overlay.closeOverlays = function(){
	Overlay.openOverlays.forEach(function(overlay){
		overlay.close();
	});
};
Overlay.closeOverlaysExcept = function(overlay){
	Overlay.openOverlays.forEach(function(currentOverlay){
		if(currentOverlay !== overlay) {
			currentOverlay.close();
		}
	});
};
Overlay.closeOverlaysOfType = function(type){
	Overlay.openOverlays.forEach(function(currentOverlay){
		if(currentOverlay.type === type) {
			currentOverlay.close();
		}
	});
};