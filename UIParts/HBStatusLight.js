function HBStatusLight(x,centerY,parent){
	var HBSL=HBStatusLight;
	this.cx=x+HBSL.radius;
	this.cy=centerY;
	this.parentGroup=parent;
	this.circleE=this.generateCircle();
	var thisStatusLight=this;
	if(!TouchReceiver.mouse) {
		this.updateTimer = self.setInterval(function () {
			thisStatusLight.updateStatus()
		}, HBSL.updateInterval);
	}
	thisStatusLight.updateStatus();
}
HBStatusLight.setConstants=function(){
	var HBSL=HBStatusLight;
	HBSL.greenColor="#0f0";
	HBSL.redColor="#f00"
	HBSL.startColor=Colors.black;
	HBSL.offColor=Colors.darkGray;
	HBSL.radius=6;
	HBSL.updateInterval=300;
};
HBStatusLight.prototype.generateCircle=function(){
	var HBSL=HBStatusLight;
	return GuiElements.draw.circle(this.cx,this.cy,HBSL.radius,HBSL.startColor,this.parentGroup);
};
HBStatusLight.prototype.updateStatus=function(){
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
			GuiElements.update.color(this.circleE,HBStatusLight.redColor);
			break;
		case 1:
			GuiElements.update.color(this.circleE,HBStatusLight.greenColor);
			break;
		case 2:
			GuiElements.update.color(this.circleE,HBStatusLight.offColor);
			break;
	}
};
HBStatusLight.prototype.remove=function(){
	this.circleE.remove();
	this.updateTimer=window.clearInterval(this.updateTimer);
};