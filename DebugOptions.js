"use strict";

function DebugOptions(){
	var DO = DebugOptions;
	DO.enabled = true;

	DO.mouse = false;
	DO.addVirtualHB = false;
	DO.addVirtualFlutter = true;
	DO.showVersion = true;
	if(DO.enabled){
		DO.applyConstants();
	}
}
DebugOptions.applyConstants = function(){
	var DO = DebugOptions;
	if(!DO.enabled) return;
	if(DO.mouse){
		TouchReceiver.mouse = true;
	}
};
DebugOptions.applyActions = function(){
	var DO = DebugOptions;
	if(!DO.enabled) return;
	if(DO.addVirtualHB){
		let virHB = new Hummingbird("Virtual HB");
		virHB.connect();
	}
	if(DO.addVirtualFlutter){
		FlutterManager.ConnectDevice("Virtual F");
	}
	if(DO.showVersion){
		GuiElements.alert("Version: "+GuiElements.appVersion);
	}
};