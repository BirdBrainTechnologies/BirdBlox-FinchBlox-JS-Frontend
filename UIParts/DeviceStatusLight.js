"use strict";

function DeviceStatusLight(x,centerY,parent){
	var HBSL=DeviceStatusLight;
	this.cx=x+HBSL.radius;
	this.cy=centerY;
	this.parentGroup=parent;
	this.circleE=this.generateCircle();
	var thisStatusLight=this;
	if(true||!TouchReceiver.mouse) {
		this.updateTimer = self.setInterval(function () {
			thisStatusLight.updateStatus()
		}, HBSL.updateInterval);
	}
	thisStatusLight.updateStatus();
}
DeviceStatusLight.setConstants=function(){
	var HBSL=DeviceStatusLight;
	HBSL.greenColor="#0f0";
	HBSL.redColor="#f00";
	HBSL.startColor=Colors.black;
	HBSL.offColor=Colors.darkGray;
	HBSL.radius=6;
	HBSL.updateInterval=300;
};
DeviceStatusLight.prototype.generateCircle=function(){
	var HBSL=DeviceStatusLight;
	return GuiElements.draw.circle(this.cx,this.cy,HBSL.radius,HBSL.startColor,this.parentGroup);
};
DeviceStatusLight.prototype.updateStatus=function(){
	if (HummingbirdManager.GetDeviceCount() > 0) {
		HummingbirdManager.UpdateConnectionStatus();
	}
	if (FlutterManager.GetDeviceCount() > 0) {
		FlutterManager.UpdateConnectionStatus();
	}
	let hbStatus = HummingbirdManager.GetConnectionStatus();
	let flutterStatus = FlutterManager.GetConnectionStatus();

	let overallStatus = Math.min(hbStatus, flutterStatus);  // Lower status means more error
	switch(overallStatus) {
		case 0:
			GuiElements.update.color(this.circleE,DeviceStatusLight.redColor);
			break;
		case 1:
			GuiElements.update.color(this.circleE,DeviceStatusLight.greenColor);
			break;
		case 2:
			GuiElements.update.color(this.circleE,DeviceStatusLight.offColor);
			break;
	}
};
DeviceStatusLight.prototype.remove=function(){
	this.circleE.remove();
	this.updateTimer=window.clearInterval(this.updateTimer);
};