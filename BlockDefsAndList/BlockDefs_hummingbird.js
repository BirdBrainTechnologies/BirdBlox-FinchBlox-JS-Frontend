function b_HBServo(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Servo"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0));
}
b_HBServo.prototype = Object.create(CommandBlock.prototype);
b_HBServo.prototype.constructor = b_HBServo;
b_HBServo.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"servo",0,180);
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
	return HummingbirdManager.sensorStartAction(this,"sensor",0);
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
	return HummingbirdManager.outputStartAction(this,"motor",-100,100);
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
	return HummingbirdManager.outputStartAction(this,"vibration",-100,100);
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
	return HummingbirdManager.outputStartAction(this,"led",0,255);
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
	return HummingbirdManager.sensorStartAction(this,"temperature",0);
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
	return HummingbirdManager.sensorStartAction(this,"distance",0);
}
b_HBDistCM.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,false,0);
}



function b_HBKnob(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Knob"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBKnob.prototype = Object.create(ReporterBlock.prototype);
b_HBKnob.prototype.constructor = b_HBKnob;
b_HBKnob.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"sensor",0);
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
	return HummingbirdManager.sensorStartAction(this,"sound",0);
}
b_HBSound.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,false,0);
}
////////////////////



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
b_HBTriLed.prototype.constructor = b_HBTriLed;



function b_HBTempF(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Temperature F"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBTempF.prototype = Object.create(ReporterBlock.prototype);
b_HBTempF.prototype.constructor = b_HBTempF;



function b_HBDistInch(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Distance Inch"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBDistInch.prototype = Object.create(ReporterBlock.prototype);
b_HBDistInch.prototype.constructor = b_HBDistInch;

