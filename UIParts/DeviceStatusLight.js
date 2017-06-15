"use strict";

function DeviceStatusLight(x,centerY,parent){
	var DSL=DeviceStatusLight;
	this.cx=x+DSL.radius;
	this.cy=centerY;
	this.parentGroup=parent;
	this.circleE=this.generateCircle();
	var thisStatusLight=this;
	if(true||!TouchReceiver.mouse) {
		this.updateTimer = self.setInterval(function () {
			thisStatusLight.updateStatus()
		}, DSL.updateInterval);
	}
	thisStatusLight.updateStatus();
}
DeviceStatusLight.setConstants=function(){
	var DSL=DeviceStatusLight;
	DSL.greenColor="#0f0";
	DSL.redColor="#f00";
	DSL.startColor=Colors.black;
	DSL.offColor=Colors.darkGray;
	DSL.radius=6;
	DSL.updateInterval=300;
};
DeviceStatusLight.prototype.generateCircle=function(){
	var DSL=DeviceStatusLight;
	return GuiElements.draw.circle(this.cx,this.cy,DSL.radius,DSL.startColor,this.parentGroup);
};
DeviceStatusLight.prototype.updateStatus=function(){
	let overallStatus = 2;
	Device.getTypeList().forEach(function(deviceClass){
		deviceClass.getManager().updateTotalStatus();
		overallStatus = Math.min(deviceClass.getManager().getTotalStatus(), overallStatus); // Lower status means more error
	});
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