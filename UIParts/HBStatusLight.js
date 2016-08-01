function HBStatusLight(x,centerY,parent,request){
	var HBSL=HBStatusLight;
	this.cx=x+HBSL.radius;
	this.cy=centerY;
	this.parentGroup=parent;
	this.circleE=this.generateCircle();
	var thisStatusLight=this;
	this.request=request;
	this.updateTimer = self.setInterval(function () { thisStatusLight.updateStatus() }, HBSL.updateInterval);
	thisStatusLight.updateStatus();
}
HBStatusLight.setConstants=function(){
	var HBSL=HBStatusLight;
	HBSL.greenColor="#0f0";
	HBSL.redColor="#f00";
	HBSL.radius=6;
	HBSL.updateInterval=300;
};
HBStatusLight.prototype.generateCircle=function(){
	var HBSL=HBStatusLight;
	return GuiElements.draw.circle(this.cx,this.cy,HBSL.radius,Colors.black,this.parentGroup);
};
HBStatusLight.prototype.updateStatus=function(){
	var HBSL=HBStatusLight;
	var thisStatusLight=this;
	HtmlServer.sendRequestWithCallback(this.request,function(result){
		if(result=="1"){
			GuiElements.update.color(thisStatusLight.circleE,HBStatusLight.greenColor);
		}
		else{
			GuiElements.update.color(thisStatusLight.circleE,HBStatusLight.redColor);
		}
	},function(){
		GuiElements.update.color(thisStatusLight.circleE,HBStatusLight.redColor);
	});
};
HBStatusLight.prototype.remove=function(){
	this.circleE.remove();
	this.updateTimer=window.clearInterval(this.updateTimer);
};