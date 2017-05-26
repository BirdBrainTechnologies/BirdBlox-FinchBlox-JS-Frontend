function ViewMenu(button){
	Menu.call(this,button);
	this.addOption("Zoom in", this.optionZoomIn,false);
	this.addOption("Zoom out", this.optionZoomOut,false);
	this.addOption("Reset zoom", this.optionResetZoom,true);
	this.buildMenu();
}
ViewMenu.prototype = Object.create(Menu.prototype);
ViewMenu.prototype.constructor = ViewMenu;
ViewMenu.prototype.optionZoomIn=function(){
	GuiElements.zoomMultiple+=GuiElements.zoomAmount;
	GuiElements.zoomMultiple=Math.min(GuiElements.zoomMultiple,GuiElements.maxZoomMult);
	GuiElements.updateZoom();
};
ViewMenu.prototype.optionZoomOut=function(){
	GuiElements.zoomMultiple-=GuiElements.zoomAmount;
	GuiElements.zoomMultiple=Math.max(GuiElements.zoomMultiple,GuiElements.minZoomMult);
	GuiElements.updateZoom();
};
ViewMenu.prototype.optionResetZoom=function(){
	GuiElements.zoomMultiple=1;
	GuiElements.updateZoom();
};