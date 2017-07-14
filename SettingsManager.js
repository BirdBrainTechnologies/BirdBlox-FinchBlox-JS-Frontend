function SettingsManager(){
	const SM = SettingsManager;
	SM.zoom = new Setting("zoom", 1, true, false, GuiElements.minZoomMult, GuiElements.maxZoomMult);
	SM.enableSnapNoise = new Setting("enableSnapNoise", "true");
	SM.sideBarVisible = new Setting("sideBarVisible", "true");
}
SettingsManager.loadSettings = function(callbackFn){
	const SM = SettingsManager;
	SM.sideBarVisible.readValue(function(){
		SM.enableSnapNoise.readValue(function(){
			SM.zoom.readValue(callbackFn);
		});
	});
};