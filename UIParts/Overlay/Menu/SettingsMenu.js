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
	const icon = VectorPaths.language;
	const me = this;
	this.addOption("", null, false, function(bn) {
		bn.addIcon(icon, 25);
		me.languageMenu = new LanguageMenu(bn, me);
		me.languageMenu.move();
	});
	// Used to have icons, but they didn't work two well and have been disabled
	this.addOption(Language.getStr("Zoom_in"), this.optionZoomIn, false); //, VectorPaths.zoomIn);
	this.addOption(Language.getStr("Zoom_out"), this.optionZoomOut, false); //, VectorPaths.zoomOut);
	this.addOption(Language.getStr("Reset_zoom"), this.optionResetZoom, true); //, VectorPaths.resetZoom);
	if (SettingsManager.enableSnapNoise.getValue() === "true") {
		this.addOption(Language.getStr("Disable_snap_noise"), this.disableSnapping, true); //, VectorPaths.volumeMute);
	} else {
		this.addOption(Language.getStr("Enable_snap_noise"), this.enableSnapping, true); //, VectorPaths.volumeUp);
	}
	this.addOption(Language.getStr("CompassCalibrate"), function() {
			(new CalibrateCompassDialog()).show();
	});
	if (this.showAdvanced) {
		this.addOption(Language.getStr("Send_debug_log"), this.optionSendDebugLog, true);
		this.addOption(Language.getStr("Show_debug_menu"), this.enableDebug, true);
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
	const request = new HttpRequestBuilder("debug/shareLog");
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
		this.hide();
		this.open(true);
		if (this.button.toggled) {
			this.button.pressed = false;
		}
	}
};

SettingsMenu.prototype.enableDebug = function() {
	DebugOptions.enabled = true;
	TitleBar.enableDebug();
}
