"use strict";

function DeviceStatusLight(x,centerY,parent,statusProvider){
	const DSL=DeviceStatusLight;
	this.cx=x+DSL.radius;
	this.cy=centerY;
	this.parentGroup=parent;
	this.circleE=this.generateCircle();
	this.statusProvider = statusProvider;
	this.statusProvider.setStatusListener(this);
	this.updateStatus(statusProvider.getStatus());
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
	let DSL=DeviceStatusLight;
	return GuiElements.draw.circle(this.cx,this.cy,DSL.radius,DSL.startColor,this.parentGroup);
};
DeviceStatusLight.prototype.updateStatus=function(status){
	const DSL = DeviceStatusLight;
	let color = null;
	const statuses = DeviceManager.statuses;
	if (status === statuses.connected) {
		color = DSL.greenColor;
	} else if (status === statuses.disconnected) {
		color = DSL.redColor;
	} else {
		color = DSL.offColor;
	}
	GuiElements.update.color(this.circleE,color);
};
DeviceStatusLight.prototype.remove=function(){
	this.circleE.remove();
	this.updateTimer=window.clearInterval(this.updateTimer);
};