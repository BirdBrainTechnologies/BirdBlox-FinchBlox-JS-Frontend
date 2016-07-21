function DebugMenu(button){
	Menu.call(this,button);
	this.addOption("Version", this.optionVersion);
	this.addOption("Screen size", this.optionScreenSize);
	this.addOption("Pixels", this.optionPixelSize);
	this.buildMenu();
}
DebugMenu.prototype = Object.create(Menu.prototype);
DebugMenu.prototype.constructor = DebugMenu;
DebugMenu.prototype.optionNew=function(){
	SaveManager.new();
};
DebugMenu.prototype.optionVersion=function(){
	GuiElements.alert("Version: "+GuiElements.appVersion);
};
DebugMenu.prototype.optionScreenSize=function(){
	HtmlServer.sendRequestWithCallback("iPad/screenSize",function(response){
		GuiElements.alert("Size: "+response);
	});
};
DebugMenu.prototype.optionPixelSize=function(){
	GuiElements.alert(GuiElements.height+" "+GuiElements.width);
};