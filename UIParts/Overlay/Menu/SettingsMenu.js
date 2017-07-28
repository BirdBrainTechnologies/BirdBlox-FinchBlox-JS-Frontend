/**
 * Provides a menu for adjusting the zoom and other settings
 * @param {Button} button
 * @constructor
 */
function SettingsMenu(button) {
	Menu.call(this, button);
}
SettingsMenu.prototype = Object.create(Menu.prototype);
SettingsMenu.prototype.constructor = SettingsMenu;

/**
 * @inheritDoc
 */
SettingsMenu.prototype.loadOptions = function() {
	// Used to have icons, but they didn't work two well and have been disabled
	this.addOption("Zoom in", this.optionZoomIn, false); //, VectorPaths.zoomIn);
	this.addOption("Zoom out", this.optionZoomOut, false); //, VectorPaths.zoomOut);
	this.addOption("Reset zoom", this.optionResetZoom, true); //, VectorPaths.resetZoom);
	if (SettingsManager.enableSnapNoise.getValue() === "true") {
		this.addOption("Disable snap noise", this.disableSnapping, true); //, VectorPaths.volumeMute);
	} else {
		this.addOption("Enable snap noise", this.enableSnapping, true); //, VectorPaths.volumeUp);
	}
	if (this.showAdvanced) {
		this.addOption("Send debug log", this.optionSendDebugLog, true)
	}
};

/**
 * Increases the zoom level and updates the UI
 */
SettingsMenu.prototype.optionZoomIn = function() {
	SettingsManager.zoom.writeValue(GuiElements.zoomMultiple + GuiElements.zoomAmount);
	GuiElements.zoomMultiple = SettingsManager.zoom.getValue();
	GuiElements.updateZoom();
};

/**
 * Decreases the zoom level and updates the UI
 */
SettingsMenu.prototype.optionZoomOut = function() {
	SettingsManager.zoom.writeValue(GuiElements.zoomMultiple - GuiElements.zoomAmount);
	GuiElements.zoomMultiple = SettingsManager.zoom.getValue();
	GuiElements.updateZoom();
};

/**
 * Sets the zoom level back to default
 */
SettingsMenu.prototype.optionResetZoom = function() {
	SettingsManager.zoom.writeValue(1);
	GuiElements.zoomMultiple = SettingsManager.zoom.getValue();
	GuiElements.updateZoom();
};

/**
 * Enables the sound on Block snap
 */
SettingsMenu.prototype.enableSnapping = function() {
	SettingsManager.enableSnapNoise.writeValue("true");
};

/**
 * Disables the sound on Block snap
 */
SettingsMenu.prototype.disableSnapping = function() {
	SettingsManager.enableSnapNoise.writeValue("false");
};

/**
 * Tells the backend to send the current debug log
 */
SettingsMenu.prototype.optionSendDebugLog = function() {
	const request = new HttpRequestBuilder("debug/shareDebug");
	HtmlServer.sendRequestWithCallback(request.toString());
};

/**
 * Shows the SettingsMenu and stores whether it should show with advanced options
 * @param {boolean} [showAdvanced=false]
 */
SettingsMenu.prototype.open = function(showAdvanced) {
	if (showAdvanced == null) {
		showAdvanced = false;
	}
	this.showAdvanced = showAdvanced;
	Menu.prototype.open.call(this);
};

/**
 * Re-opens the menu (if it is open) with advanced options visible)
 */
SettingsMenu.prototype.reloadAdvanced = function() {
	if (this.visible) {
		GuiElements.alert("reload");
		this.hide();
		this.open(true);
		if (this.button.toggled) {
			this.button.pressed = false;
		}
	}
};