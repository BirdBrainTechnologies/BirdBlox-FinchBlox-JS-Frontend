function HBStatusLight(x,centerY,parent,statusFn){
	var HBSL=HBStatusLight;
	this.cx=x+HBSL.radius;
	this.cy=centerY;
	this.statusFn=statusFn;
	this.parentGroup=parent;
	this.circleE=this.generateCircle();
	var thisStatusLight=this;
	this.updateTimer = self.setInterval(function () { thisStatusLight.updateStatus() }, HBSL.updateInterval);
}
HBStatusLight.setConstants=function(){
	var HBSL=HBStatusLight;
	HBSL.greenColor="#0f0";
	HBSL.redColor="#f00";
	HBSL.radius=6;
	HBSL.updateInterval=100;
};
HBStatusLight.prototype.generateCircle=function(){
	var HBSL=HBStatusLight;
	return GuiElements.draw.circle(this.cx,this.cy,HBSL.radius,HBSL.greenColor,this.parentGroup);
};
HBStatusLight.prototype.updateStatus=function(){
	var HBSL=HBStatusLight;
	if(this.statusFn()){
		GuiElements.update.color(this.circleE,HBSL.greenColor);
	}
	else{
		GuiElements.update.color(this.circleE,HBSL.redColor);
	}
};