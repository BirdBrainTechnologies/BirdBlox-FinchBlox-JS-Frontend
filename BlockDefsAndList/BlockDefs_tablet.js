/* This file contains the implementations for Blocks in the tablet category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */

function B_DeviceShaken(x,y){
	PredicateBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"Device Shaken"));
}
B_DeviceShaken.prototype = Object.create(PredicateBlock.prototype);
B_DeviceShaken.prototype.constructor = B_DeviceShaken;
/* Make the request. */
B_DeviceShaken.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/shake";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
};
/* Wait for the request to finish. */
B_DeviceShaken.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			this.resultData=new BoolData(status.result=="1",true);
		}
		else{
			this.resultData=new BoolData(false,false); //false is default.
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};



function B_DeviceSSID(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.string);
	this.addPart(new LabelText(this,"Device SSID"));
}
B_DeviceSSID.prototype = Object.create(ReporterBlock.prototype);
B_DeviceSSID.prototype.constructor = B_DeviceSSID;
/* Make the request. */
B_DeviceSSID.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/ssid";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
};
/* Wait for the request to finish. */
B_DeviceSSID.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			this.resultData=new StringData(status.result,true);
		}
		else{
			this.resultData=new StringData("",false); //"" is default.
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};



function B_DevicePressure(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"Device Pressure"));
}
B_DevicePressure.prototype = Object.create(ReporterBlock.prototype);
B_DevicePressure.prototype.constructor = B_DevicePressure;
/* Make the request. */
B_DevicePressure.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/pressure";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
};
/* Wait for the request to finish. */
B_DevicePressure.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result=parseFloat(status.result);
			this.resultData=new NumData(result,true);
		}
		else{
			this.resultData=new NumData(0,false); //0 is default.
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};
Block.setDisplaySuffix(B_DevicePressure, "kPa");


function B_DeviceRelativeAltitude(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"Device Relative Altitude"));
}
B_DeviceRelativeAltitude.prototype = Object.create(ReporterBlock.prototype);
B_DeviceRelativeAltitude.prototype.constructor = B_DeviceRelativeAltitude;
/* Make the request. */
B_DeviceRelativeAltitude.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/altitude";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
};
/* Wait for the request to finish. */
B_DeviceRelativeAltitude.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result=parseFloat(status.result);
			this.resultData=new NumData(result,true);
		}
		else{
			this.resultData=new NumData(0,false); //0 is default.
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};
Block.setDisplaySuffix(B_DeviceRelativeAltitude, "m");



function B_DeviceOrientation(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.string);
	this.addPart(new LabelText(this,"Device Orientation"));
}
B_DeviceOrientation.prototype = Object.create(ReporterBlock.prototype);
B_DeviceOrientation.prototype.constructor = B_DeviceOrientation;
/* Make the request. */
B_DeviceOrientation.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/orientation";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
};
/* Wait for the request to finish. */
B_DeviceOrientation.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			this.resultData=new StringData(status.result,true);
		}
		else{
			this.resultData=new StringData("",false); //"" is default.
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};



function B_DeviceAcceleration(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.num);
	this.addPart(new LabelText(this,"Device"));
	var dS=new DropSlot(this);
	dS.addOption("X",new SelectionData(0));
	dS.addOption("Y",new SelectionData(1));
	dS.addOption("Z",new SelectionData(2));
	dS.setSelectionData("X",new SelectionData(0));
	this.addPart(dS);
	this.addPart(new LabelText(this,"Acceleration"));
}
B_DeviceAcceleration.prototype = Object.create(ReporterBlock.prototype);
B_DeviceAcceleration.prototype.constructor = B_DeviceAcceleration;
/* Make the request. */
B_DeviceAcceleration.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/acceleration";
	mem.requestStatus=function(){};
	mem.axis=this.slots[0].getData().getValue();
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
};
/* Wait for the request to finish. Then get the correct axis. */
B_DeviceAcceleration.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result = status.result.split(" ")[mem.axis]; //Values separated by spaces.
			this.resultData=new NumData(parseFloat(result),true);
		}
		else{
			this.resultData=new NumData(0,false); //0 is default.
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};
Block.setDisplaySuffix(B_DeviceAcceleration, "m/s" + String.fromCharCode(178));


function B_DeviceLocation(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.num);
	this.addPart(new LabelText(this,"Device"));
	var dS=new DropSlot(this);
	dS.addOption("Latitude",new SelectionData(0));
	dS.addOption("Longitude",new SelectionData(1));
	dS.setSelectionData("Latitude",new SelectionData(0));
	this.addPart(dS);
}
B_DeviceLocation.prototype = Object.create(ReporterBlock.prototype);
B_DeviceLocation.prototype.constructor = B_DeviceLocation;
/* Make the request. */
B_DeviceLocation.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/location";
	mem.requestStatus=function(){};
	mem.axis=this.slots[0].getData().getValue();
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return true; //Still running
};
/* Wait for the request to finish. Then get the correct axis. */
B_DeviceLocation.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result = status.result.split(" ")[mem.axis];
			this.resultData=new NumData(parseFloat(result),true);
		}
		else{
			this.resultData=new NumData(0,false); //0 is default.
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};
/////////////////


function B_Display(x,y){
	CommandBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"Display"));
	this.addPart(new StringSlot(this,"hello"));
}
B_Display.prototype = Object.create(CommandBlock.prototype);
B_Display.prototype.constructor = B_Display;
B_Display.prototype.startAction=function(){
	var message=this.slots[0].getData().getValue();
	DisplayBox.displayText(message);
	return false; //Done running
};






