function DebugMenu(button){
	Menu.call(this,button);
	this.addOption("Version", this.optionVersion);
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