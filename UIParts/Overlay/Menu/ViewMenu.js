/**
 * Deprecated menu that used to control zoom.  Replaced with SettingsMenu
 * @param {Button} button
 * @constructor
 */
function ViewMenu(button) {
	Menu.call(this, button);
}
ViewMenu.prototype = Object.create(Menu.prototype);
ViewMenu.prototype.constructor = ViewMenu;
ViewMenu.prototype.loadOptions = function() {
	this.addOption(Language.getStr("Zoom_in"), this.optionZoomIn, false);
	this.addOption(Language.getStr("Zoom_out"), this.optionZoomOut, false);
	this.addOption(Language.getStr("Reset_zoom"), this.optionResetZoom, true);
};
ViewMenu.prototype.optionZoomIn = function() {
	GuiElements.zoomMultiple += GuiElements.zoomAmount;
	GuiElements.zoomMultiple = Math.min(GuiElements.zoomMultiple, GuiElements.maxZoomMult);
	GuiElements.updateZoom();
};
ViewMenu.prototype.optionZoomOut = function() {
	GuiElements.zoomMultiple -= GuiElements.zoomAmount;
	GuiElements.zoomMultiple = Math.max(GuiElements.zoomMultiple, GuiElements.minZoomMult);
	GuiElements.updateZoom();
};
ViewMenu.prototype.optionResetZoom = function() {
	GuiElements.zoomMultiple = 1;
	GuiElements.updateZoom();
};