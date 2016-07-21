function ViewMenu(button){
	ViewMenu.setConstants();
	Menu.call(this,button);
	this.addOption("Zoom in", this.optionZoomIn,false);
	this.addOption("Zoom out", this.optionZoomOut,false);
	this.buildMenu();
}
ViewMenu.prototype = Object.create(Menu.prototype);
ViewMenu.prototype.constructor = ViewMenu;
ViewMenu.setConstants=function(){
	ViewMenu.minZoom=0.7;
	ViewMenu.maxZoom=1.7;
	ViewMenu.zoomAmount=0.2;
};
ViewMenu.prototype.optionZoomIn=function(){
	GuiElements.zoomFactor+=ViewMenu.zoomAmount;
	GuiElements.zoomFactor=Math.min(GuiElements.zoomFactor,ViewMenu.maxZoom);
	GuiElements.updateZoom();
};
ViewMenu.prototype.optionZoomOut=function(){
	GuiElements.zoomFactor-=ViewMenu.zoomAmount;
	GuiElements.zoomFactor=Math.max(GuiElements.zoomFactor,ViewMenu.minZoom);
	GuiElements.updateZoom();
};