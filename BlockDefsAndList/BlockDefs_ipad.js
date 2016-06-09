function b_DeviceShaken(x,y){
	PredicateBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device Shaken"));
}
b_DeviceShaken.prototype = Object.create(PredicateBlock.prototype);
b_DeviceShaken.prototype.constructor = b_DeviceShaken;
b_DeviceShaken.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "iPad/shake";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
}
b_DeviceShaken.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			this.resultData=new BoolData(status.result=="1",true);
		}
		else{
			this.resultData=new BoolData(false,false);
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
}



function b_DeviceSSID(x,y){
	ReporterBlock.call(this,x,y,"ipad",Block.returnTypes.string);
	this.addPart(new LabelText(this,"Device SSID"));
}
b_DeviceSSID.prototype = Object.create(ReporterBlock.prototype);
b_DeviceSSID.prototype.constructor = b_DeviceSSID;
b_DeviceSSID.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "iPad/ssid";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
}
b_DeviceSSID.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			this.resultData=new StringData(status.result,true);
		}
		else{
			this.resultData=new StringData("",false);
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
}



function b_DevicePressure(x,y){
	ReporterBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device Pressure"));
}
b_DevicePressure.prototype = Object.create(ReporterBlock.prototype);
b_DevicePressure.prototype.constructor = b_DevicePressure;
b_DevicePressure.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "iPad/pressure";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
}
b_DevicePressure.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result=parseFloat(status.result);
			this.resultData=new NumData(result,true);
		}
		else{
			this.resultData=new NumData(0,false);
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
}


function b_DeviceRelativeAltitude(x,y){
	ReporterBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device Relative Altitude"));
}
b_DeviceRelativeAltitude.prototype = Object.create(ReporterBlock.prototype);
b_DeviceRelativeAltitude.prototype.constructor = b_DeviceRelativeAltitude;
b_DeviceRelativeAltitude.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "iPad/altitude";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
}
b_DeviceRelativeAltitude.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result=parseFloat(status.result);
			this.resultData=new NumData(result,true);
		}
		else{
			this.resultData=new NumData(0,false);
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
}


function b_DeviceOrientation(x,y){
	ReporterBlock.call(this,x,y,"ipad",Block.returnTypes.string);
	this.addPart(new LabelText(this,"Device Orientation"));
}
b_DeviceOrientation.prototype = Object.create(ReporterBlock.prototype);
b_DeviceOrientation.prototype.constructor = b_DeviceOrientation;
b_DeviceOrientation.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "iPad/orientation";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
}
b_DeviceOrientation.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			this.resultData=new StringData(status.result,true);
		}
		else{
			this.resultData=new StringData("",false);
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
}
/////////////////





function b_DeviceLocation(x,y){
	ReporterBlock.call(this,x,y,"ipad",Block.returnTypes.list);
	this.addPart(new LabelText(this,"Device Location"));
}
b_DeviceLocation.prototype = Object.create(ReporterBlock.prototype);
b_DeviceLocation.prototype.constructor = b_DeviceLocation;


function b_DeviceAcceleration(x,y){
	ReporterBlock.call(this,x,y,"ipad",Block.returnTypes.list);
	this.addPart(new LabelText(this,"Device Acceleration"));
}
b_DeviceAcceleration.prototype = Object.create(ReporterBlock.prototype);
b_DeviceAcceleration.prototype.constructor = b_DeviceAcceleration;

