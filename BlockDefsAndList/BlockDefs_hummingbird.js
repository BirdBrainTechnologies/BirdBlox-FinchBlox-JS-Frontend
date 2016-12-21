/* This file contains the implementations for Blocks in the hummingbird category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 * Most relay on the HummingbirdManager to remove redundant code.
 */

function B_HBServo(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this));
	this.addPart(new LabelText(this,"Servo"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
	this.addPart(new NumSlot(this,0,true,true)); //Positive integer.
}
B_HBServo.prototype = Object.create(CommandBlock.prototype);
B_HBServo.prototype.constructor = B_HBServo;
/* Generic Hummingbird single output functions. */
B_HBServo.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"servo",0,180); //0 to 180
};
B_HBServo.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
};



function B_HBLight(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this));
	this.addPart(new LabelText(this,"Light"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
}
B_HBLight.prototype = Object.create(ReporterBlock.prototype);
B_HBLight.prototype.constructor = B_HBLight;
/* Generic Hummingbird input functions. */
B_HBLight.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"sensor",0);
};
B_HBLight.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
};



function B_HBMotor(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this));
	this.addPart(new LabelText(this,"Motor"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
	this.addPart(new NumSlot(this,0, false, true)); //Integer
}
B_HBMotor.prototype = Object.create(CommandBlock.prototype);
B_HBMotor.prototype.constructor = B_HBMotor;
/* Generic Hummingbird single output functions. */
B_HBMotor.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"motor",-100,100); //-100 to 100
};
B_HBMotor.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
};

function B_HBVibration(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this));
	this.addPart(new LabelText(this,"Vibration"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
	this.addPart(new NumSlot(this,0,true, true)); //Positive integer.
}
B_HBVibration.prototype = Object.create(CommandBlock.prototype);
B_HBVibration.prototype.constructor = B_HBVibration;
/* Generic Hummingbird single output functions. */
B_HBVibration.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"vibration",0,100); //0 to 100
};
B_HBVibration.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
};



function B_HBLed(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this));
	this.addPart(new LabelText(this,"LED"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
	this.addPart(new NumSlot(this,0,true, true)); //Positive integer.
}
B_HBLed.prototype = Object.create(CommandBlock.prototype);
B_HBLed.prototype.constructor = B_HBLed;
/* Generic Hummingbird single output functions. */
B_HBLed.prototype.startAction=function(){
	return HummingbirdManager.outputStartAction(this,"led",0,100); //0 to 100
};
B_HBLed.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
};



function B_HBTempC(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this,true));
	this.addPart(new LabelText(this,"Temperature C"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
}
B_HBTempC.prototype = Object.create(ReporterBlock.prototype);
B_HBTempC.prototype.constructor = B_HBTempC;
/* Generic Hummingbird input functions. */
B_HBTempC.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"temperature",0)
};
B_HBTempC.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
};



function B_HBDistCM(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this,true));
	this.addPart(new LabelText(this,"Distance CM"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
}
B_HBDistCM.prototype = Object.create(ReporterBlock.prototype);
B_HBDistCM.prototype.constructor = B_HBDistCM;
/* Generic Hummingbird input functions. */
B_HBDistCM.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"distance",0); //positive int
};
B_HBDistCM.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
};



function B_HBKnob(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this));
	this.addPart(new LabelText(this,"Knob"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
}
B_HBKnob.prototype = Object.create(ReporterBlock.prototype);
B_HBKnob.prototype.constructor = B_HBKnob;
/* Generic Hummingbird input functions. */
B_HBKnob.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"sensor",0);
};
B_HBKnob.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
};



function B_HBSound(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this,true));
	this.addPart(new LabelText(this,"Sound"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
}
B_HBSound.prototype = Object.create(ReporterBlock.prototype);
B_HBSound.prototype.constructor = B_HBSound;
/* Generic Hummingbird input functions. */
B_HBSound.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"sound",0); //positive int
};
B_HBSound.prototype.updateAction=function(){
	return HummingbirdManager.sensorUpdateAction(this,true,0);
};


///// <Special> /////


function B_HBTriLed(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this,true));
	this.addPart(new LabelText(this,"TRI-LED"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
	this.addPart(new LabelText(this,"R"));
	this.addPart(new NumSlot(this,0,true,true)); //Positive integer.
	this.addPart(new LabelText(this,"G"));
	this.addPart(new NumSlot(this,0,true,true)); //Positive integer.
	this.addPart(new LabelText(this,"B"));
	this.addPart(new NumSlot(this,0,true,true)); //Positive integer.
}
B_HBTriLed.prototype = Object.create(CommandBlock.prototype);
B_HBTriLed.prototype.constructor = B_HBTriLed;
/* Sends a request if the port is an integer from 1 to 4. */
B_HBTriLed.prototype.startAction=function(){
	var mem=this.runMem;
	mem.hBIndex=this.slots[0].getData().getValue();
	mem.portD=this.slots[1].getData();
	mem.port=mem.portD.getValueWithC(true,true); //Positive integer.
	mem.dataR=this.slots[2].getData();
	mem.dataG=this.slots[3].getData();
	mem.dataB=this.slots[4].getData();

	mem.valueR=mem.dataR.getValueInR(0,100,true,true); //Positive integer.
	mem.valueG=mem.dataG.getValueInR(0,100,true,true); //Positive integer.
	mem.valueB=mem.dataB.getValueInR(0,100,true,true); //Positive integer.
	mem.isValid=mem.dataR.isValid&&mem.dataG.isValid&&mem.dataB.isValid;

	if(mem.port>=1&&mem.port<=4&&mem.isValid&&mem.portD.isValid) { //Only run if port and input are valid.
		mem.request = "out/triled/"+mem.port+"/"+mem.valueR+"/"+mem.valueG+"/"+mem.valueB;
		mem.requestStatus=function(){};
		if(CodeManager.checkHBOutputDelay(this.stack)){
			HtmlServer.sendHBRequest(mem.hBIndex,mem.request,mem.requestStatus); //Send the request.
			mem.sent=true;
			CodeManager.updateHBOutputDelay();
		}
		else{
			mem.sent=false;
		}
		return true; //Still running
	}
	else{
		return false; //Done running
	}
};
/* Waits for the request to finish. */
B_HBTriLed.prototype.updateAction=function(){
	return HummingbirdManager.outputUpdateAction(this);
};



function B_HBTempF(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new HBDropSlot(this,true));
	this.addPart(new LabelText(this,"Temperature F"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
}
B_HBTempF.prototype = Object.create(ReporterBlock.prototype);
B_HBTempF.prototype.constructor = B_HBTempF;
/* Generic Hummingbird input start. */
B_HBTempF.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"temperature",0);
};
/* Waits for the request to finish then converts C to F. */
B_HBTempF.prototype.updateAction=function(){
	if(!HummingbirdManager.sensorUpdateAction(this,true,0)){
		if(this.resultData.isValid){
			this.resultData=new NumData(Math.round(this.runMem.requestStatus.result*1.8+32)); //Rounded to Integer
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};



function B_HBDistInch(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Distance Inch"));
	this.addPart(new NumSlot(this,1,true,true)); //Positive integer.
}
B_HBDistInch.prototype = Object.create(ReporterBlock.prototype);
B_HBDistInch.prototype.constructor = B_HBDistInch; //positive float
/* Generic Hummingbird input start. */
B_HBDistInch.prototype.startAction=function(){
	return HummingbirdManager.sensorStartAction(this,"distance",0); //positive int
};
/* Waits for the request to finish then converts cm to in. */
B_HBDistInch.prototype.updateAction=function(){
	if(!HummingbirdManager.sensorUpdateAction(this,true,0)){
		if(this.resultData.isValid){
			var result=this.runMem.requestStatus.result;
			this.resultData=new NumData((result/2.54).toFixed(1)*1); //Rounded to 1 decimal place. "*1" converts to num.
		}
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};

