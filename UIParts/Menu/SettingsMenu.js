function SettingsMenu(button){
	Menu.call(this,button);
}
SettingsMenu.prototype = Object.create(Menu.prototype);
SettingsMenu.prototype.constructor = SettingsMenu;
SettingsMenu.prototype.loadOptions = function() {
	this.addOption("Zoom in", this.optionZoomIn,false); //, VectorPaths.zoomIn);
	this.addOption("Zoom out", this.optionZoomOut,false); //, VectorPaths.zoomOut);
	this.addOption("Reset zoom", this.optionResetZoom,true); //, VectorPaths.resetZoom);
	if(SettingsManager.enableSnapNoise.getValue() === "true") {
		this.addOption("Disable snap noise", this.disableSnapping, true); //, VectorPaths.volumeMute);
	} else {
		this.addOption("Enable snap noise", this.enableSnapping, true); //, VectorPaths.volumeUp);
	}
};
SettingsMenu.prototype.optionZoomIn=function(){
	SettingsManager.zoom.writeValue(GuiElements.zoomMultiple + GuiElements.zoomAmount);
	GuiElements.zoomMultiple = SettingsManager.zoom.getValue();
	GuiElements.updateZoom();
};
SettingsMenu.prototype.optionZoomOut=function(){
	SettingsManager.zoom.writeValue(GuiElements.zoomMultiple - GuiElements.zoomAmount);
	GuiElements.zoomMultiple = SettingsManager.zoom.getValue();
	GuiElements.updateZoom();
};
SettingsMenu.prototype.optionResetZoom=function(){
	SettingsManager.zoom.writeValue(1);
	GuiElements.zoomMultiple = SettingsManager.zoom.getValue();
	GuiElements.updateZoom();
};
SettingsMenu.prototype.enableSnapping = function(){
	SettingsManager.enableSnapNoise.writeValue("true");
};
SettingsMenu.prototype.disableSnapping = function(){
	SettingsManager.enableSnapNoise.writeValue("false");
};