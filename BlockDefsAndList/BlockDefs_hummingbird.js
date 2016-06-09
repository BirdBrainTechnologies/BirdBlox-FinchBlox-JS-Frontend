function b_HBServo(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Servo"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0));
}
b_HBServo.prototype = Object.create(CommandBlock.prototype);
b_HBServo.prototype.constructor = b_HBServo;
b_HBServo.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"servo",0,180); //0 to 180
}
b_HBServo.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
}

function b_HBLight(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Light"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBLight.prototype = Object.create(ReporterBlock.prototype);
b_HBLight.prototype.constructor = b_HBLight;
b_HBLight.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"sensor",0); //positive int
}
b_HBLight.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
}



function b_HBMotor(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Motor"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0));
}
b_HBMotor.prototype = Object.create(CommandBlock.prototype);
b_HBMotor.prototype.constructor = b_HBMotor;
b_HBMotor.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"motor",-100,100); //-100 to 100
}
b_HBMotor.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
}

function b_HBVibration(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Vibration"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0,true));
}
b_HBVibration.prototype = Object.create(CommandBlock.prototype);
b_HBVibration.prototype.constructor = b_HBVibration;
b_HBVibration.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"vibration",0,100); //0 to 100
}
b_HBVibration.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
}

function b_HBLed(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird LED"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0,true));
}
b_HBLed.prototype = Object.create(CommandBlock.prototype);
b_HBLed.prototype.constructor = b_HBLed;
b_HBLed.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"led",0,100); //0 to 100 int
}
b_HBLed.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
}



function b_HBTempC(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Temperature C"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBTempC.prototype = Object.create(ReporterBlock.prototype);
b_HBTempC.prototype.constructor = b_HBTempC;
b_HBTempC.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"temperature",0); //int
}
b_HBTempC.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
}


function b_HBDistCM(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Distance CM"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBDistCM.prototype = Object.create(ReporterBlock.prototype);
b_HBDistCM.prototype.constructor = b_HBDistCM;
b_HBDistCM.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"distance",0); //positive int
}
b_HBDistCM.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
}



function b_HBKnob(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Knob"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBKnob.prototype = Object.create(ReporterBlock.prototype);
b_HBKnob.prototype.constructor = b_HBKnob;
b_HBKnob.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"sensor",0); //positive int
}
b_HBKnob.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
}

function b_HBSound(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Sound"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBSound.prototype = Object.create(ReporterBlock.prototype);
b_HBSound.prototype.constructor = b_HBSound;
b_HBSound.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"sound",0); //positive int
}
b_HBSound.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
}




function b_HBTriLed(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB TRI-LED"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new LabelText(this,"R"));
	this.addPart(new NumSlot(this,0,true));
	this.addPart(new LabelText(this,"G"));
	this.addPart(new NumSlot(this,0,true));
	this.addPart(new LabelText(this,"B"));
	this.addPart(new NumSlot(this,0,true));
}
b_HBTriLed.prototype = Object.create(CommandBlock.prototype);
b_HBTriLed.prototype.constructor = b_HBTriLed; //0 to 100 int
b_HBTriLed.prototype.startAction=function(){
	var mem=this.runMem;
	mem.port=this.slots[0].getData().getValueWithC(true,true);
	mem.valueR=this.slots[1].getData().getValueInR(0,100,true,true);
	mem.valueG=this.slots[2].getData().getValueInR(0,100,true,true);
	mem.valueB=this.slots[3].getData().getValueInR(0,100,true,true);
	if(mem.port>=1&&mem.port<=4) {
		mem.request = "out/triled/"+mem.port+"/"+mem.valueR+"/"+mem.valueG+"/"+mem.valueB;
		mem.requestStatus=function(){};
		HtmlServer.sendHBRequest(mem.request,mem.requestStatus);
		return true; //Still running
	}
	else{
		return false; //Done running
	}
}
b_HBTriLed.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this,true,0);
}
////////////////////


function b_HBTempF(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Temperature F"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBTempF.prototype = Object.create(ReporterBlock.prototype);
b_HBTempF.prototype.constructor = b_HBTempF; //round to int
b_HBTempF.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"temperature",0); //positive int
}
b_HBTempF.prototype.updateAction=function(){
	if(HummingbirdManager.sensorUpdateAction(this,true,0)){
		if(this.resultData.isValid){
			this.resultData=new NumData(Math.round(this.runMem.requestStatus.result*1.8+32));
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
}





function b_HBDistInch(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Distance Inch"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBDistInch.prototype = Object.create(ReporterBlock.prototype);
b_HBDistInch.prototype.constructor = b_HBDistInch; //positive float
b_HBDistInch.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"distance",0); //positive int
}
b_HBDistInch.prototype.updateAction=function(){
	if(HummingbirdManager.sensorUpdateAction(this,true,0)){
		if(this.resultData.isValid){
			var result=this.runMem.requestStatus.result;
			this.resultData=new NumData((result/2.54).toFixed(1)*1);
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
}

