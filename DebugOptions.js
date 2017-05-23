"use strict";

function DebugOptions(){
	var DO = DebugOptions;
	DO.enabled = false;

	DO.mouse = true;
	DO.addVirtualHB = false;
	DO.addVirtualFlutter = true;

	if(DO.enabled){
		DO.applyConstants();
	}
}
DebugOptions.applyConstants = function(){
	var DO = DebugOptions;
	if(DO.mouse){
		TouchReceiver.mouse = true;
	}
};
DebugOptions.applyActions = function(){
	var DO = DebugOptions;
	if(DO.addVirtualHB){
		let virHB = new Hummingbird("Virtual HB");
		virHB.connect();
	}
	if(DO.addVirtualFlutter){
		FlutterManager.ConnectDevice("Virtual F");
	}
};