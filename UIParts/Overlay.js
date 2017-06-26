/**
 * Created by Tom on 6/26/2017.
 */
/* Overlay is an abstract class representing UI elements that appear over other elements and should disappear when other
 * elements are tapped.  They don't necessarily have a lot in common, so their constructor is empty. */
function Overlay(){
	
}
/* All overlays have a close function */
Overlay.prototype.close = function() {
	DebugOptions.markAbstract();
};
/* Initializes the static elements of the class */
Overlay.setStatics = function(){
	/* Keeps track of open overlays */
	Overlay.openOverlays = new Set();
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