function DebugMenu(button){
	Menu.call(this,button,false,130);
	this.addOption("Version", this.optionVersion);
	this.addOption("HB names", this.optionHBs);
	this.addOption("Log HTTP", this.optionLogHttp);
	this.addOption("Allow virtual HBs", this.optionVirtualHBs);
	this.addOption("Clear log", this.optionClearLog);
	this.addOption("Connect Multiple", HummingbirdManager.showConnectMultipleDialog);
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
DebugMenu.prototype.optionZoom=function(){
	HtmlServer.getSetting("zoom",function(response){
		GuiElements.alert("Zoom: "+(response));
	});
};
DebugMenu.prototype.optionHBs=function(){
	HtmlServer.sendRequestWithCallback("hummingbird/names",function(response){
		GuiElements.alert("Names: "+response.split("\n").join(","));
	});
};
DebugMenu.prototype.optionLogHttp=function(){
	HtmlServer.logHttp=true;
};
DebugMenu.prototype.optionVirtualHBs=function(){
	HummingbirdManager.allowVirtualHBs=true;
};
DebugMenu.prototype.optionClearLog=function(){
	GuiElements.alert("");
};