/* Overlay is an abstract class representing UI elements that appear over other elements and should disappear when other
 * elements are tapped.  Only one overlay of each type can exist on the screen at once. */
function Overlay(type){
	this.type = type;
}

/* Initializes the static elements of the class */
Overlay.setStatics = function(){
	/* Keeps track of open overlays */
	Overlay.openOverlays = new Set();
	/** @enum {number} */
	Overlay.types = {
		inputPad: 1,
		resultBubble: 2,
		menu: 3,
		connectionList: 4
	};
};

/**
 * All overlays have a close function, called when an overlay of the same type is opened for the user taps outside the
 * overlay
 */
Overlay.prototype.close = function() {
	DebugOptions.markAbstract();
};

/**
 * Adds the overlay to the list of open overlays and closes other overlay of the same type
 */
Overlay.prototype.addOverlayAndCloseOthers = function(){
	Overlay.closeOverlaysOfType(this.type);
	Overlay.addOverlay(this);
};

/**
 * @param {Overlay} overlay - Adds an overlay to the set of open overlays
 */
Overlay.addOverlay = function(overlay){
	if(!Overlay.openOverlays.has(overlay)) {
		Overlay.openOverlays.add(overlay);
	}
};

/**
 * @param {Overlay} overlay - Removes an overlay from the set of open overlays
 */
Overlay.removeOverlay = function(overlay){
	if(Overlay.openOverlays.has(overlay)) {
		Overlay.openOverlays.delete(overlay);
	}
};

/**
 * Closes all open overlays
 */
Overlay.closeOverlays = function(){
	Overlay.openOverlays.forEach(function(overlay){
		overlay.close();
	});
};

/**
 * Closes all open overlays except the provided overlay
 * @param {Overlay} overlay
 */
Overlay.closeOverlaysExcept = function(overlay){
	Overlay.openOverlays.forEach(function(currentOverlay){
		if(currentOverlay !== overlay) {
			currentOverlay.close();
		}
	});
};

/**
 * Closes all overlays except those of the specified type
 * @param {Overlay.types} type
 */
Overlay.closeOverlaysOfType = function(type){
	Overlay.openOverlays.forEach(function(currentOverlay){
		if(currentOverlay.type === type) {
			currentOverlay.close();
		}
	});
};