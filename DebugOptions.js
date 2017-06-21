"use strict";

function DebugOptions(){
	var DO = DebugOptions;
	DO.enabled = false;

	DO.mouse = false;
	DO.addVirtualHB = true;
	DO.addVirtualFlutter = false;
	DO.showVersion = false;
	DO.showDebugMenu = true;
	DO.logErrors = true;
	DO.lockErrors = false;
	DO.errorLocked = false;
	DO.logHttp = true;
	DO.skipInitSettings = false;
	DO.blockLogging = false;
	DO.skipHtmlRequests = false;
	if(DO.enabled){
		DO.applyConstants();
	}
}
DebugOptions.applyConstants = function(){
	var DO = DebugOptions;
	if(!DO.enabled) return;
};

DebugOptions.applyActions = function(){
	var DO = DebugOptions;
	if(!DO.enabled) return;
	if(DO.addVirtualHB){
		let virHB = new DeviceHummingbird("Virtual HB","idOfVirtualHb");
		DeviceHummingbird.getManager().setOneDevice(virHB);
	}
	if(DO.addVirtualFlutter){
		let virtual = new DeviceFlutter("Virtual F","idOfVirtualF");
		DeviceFlutter.getManager().setOneDevice(virtual);
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
DebugOptions.shouldSkipHtmlRequests = function(){
	var DO = DebugOptions;
	return DO.enabled && (DO.skipHtmlRequests || DO.mouse);
};
DebugOptions.shouldLogHttp=function(){
	var DO = DebugOptions;
	return DO.enabled && DO.logHttp;
};
DebugOptions.safeFunc = function(func){
	if(func == null) return null;
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
				HtmlServer.showChoiceDialog("ERROR",err.message + "\n" + err.stack ,"OK","OK",true, function(){});
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
DebugOptions.validateOptionalNums = function(){
	if(!DebugOptions.shouldLogErrors()) return;
	for(let i = 0; i < arguments.length; i++){
		if(arguments[i] != null && (isNaN(arguments[i]) || !isFinite(arguments[i]))){
			throw new UserException("Invalid optional number");
		}
	}
};
DebugOptions.assert = function(bool){
	if(!bool && DebugOptions.shouldLogErrors()){
		throw new UserException("Assertion Failure");
	}
};
DebugOptions.stopErrorLocking = function(){
	DebugOptions.lockErrors = false;
};
DebugOptions.enableLogging = function(){
	DebugOptions.blockLogging = false;
};
DebugOptions.throw = function(message){
	if(!DebugOptions.shouldLogErrors()) return;
	throw new UserException(message);
};

function UserException(message) {
	this.message = message;
	this.name = 'UserException';
	this.stack = (new Error()).stack;
}