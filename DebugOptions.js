"use strict";

function DebugOptions(){
	var DO = DebugOptions;
	DO.enabled = true;

	DO.mouse = false;
	DO.addVirtualHB = false;
	DO.addVirtualFlutter = true;
	DO.showVersion = true;
	DO.showDebugMenu = true;
	DO.logErrors = true;
	DO.lockErrors = false;
	DO.errorLocked = false;
	DO.skipInitSettings = false;
	DO.blockLogging = true;
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
	if(DO.showDebugMenu){
		TitleBar.enableDebug();
	}
};
DebugOptions.shouldLogErrors=function(){
	return DebugOptions.logErrors && DebugOptions.enabled;
};
DebugOptions.shouldSkipInitSettings=function(){
	var DO = DebugOptions;
	return DO.enabled && (DO.mouse || DO.skipInitSettings);
};
DebugOptions.safeFunc = function(func){
	if(DebugOptions.shouldLogErrors()){
		return function(){
			try {
				if(!DebugOptions.errorLocked || !DebugOptions.lockErrors) {
					func.apply(this, arguments);
				}
			}
			catch(err) {
				DebugOptions.errorLocked = true;
				GuiElements.alert("ERROR: " + err.message);
				HtmlServer.showChoiceDialog("ERROR",err.message,"OK","OK",true);
			}
		}
	}
	else{
		return func;
	}
};
DebugOptions.validateNumbers = function(){
	if(!DebugOptions.shouldLogErrors()) return;
	for(let i = 0; i < arguments.length; i++){
		if(isNaN(arguments[i]) || !isFinite(arguments[i])){
			throw new UserException("Invalid Number");
		}
	}
};
DebugOptions.validateNonNull = function(){
	if(!DebugOptions.shouldLogErrors()) return;
	for(let i = 0; i < arguments.length; i++){
		if(arguments[i] == null){
			throw new UserException("Null parameter");
		}
	}
};
DebugOptions.stopErrorLocking = function(){
	DebugOptions.lockErrors = false;
};
DebugOptions.enableLogging = function(){
	DebugOptions.blockLogging = false;
};
function UserException(message) {
	this.message = message;
	this.name = 'UserException';
}