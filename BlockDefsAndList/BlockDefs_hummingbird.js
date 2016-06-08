function b_HBServo(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird ServoB"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0));
}
b_HBServo.prototype = Object.create(CommandBlock.prototype);
b_HBServo.prototype.constructor = b_HBServo;
b_HBServo.prototype.startAction=function(){
	var mem=this.runMem;
	mem.port=this.slots[0].getData().getValueWithC(true,true);
	mem.value=this.slots[1].getData().getValueInR(0,180,true,true);
	if(mem.port>=1&&mem.port<=4) {
		mem.command = "out/servo/" + mem.port + "/" + mem.value;
		mem.finished = false;
		var xhttp = new XMLHttpRequest();
		xhttp.runMem = mem;
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4) {
				xhttp.runMem.finished = true;
			}
		};
		xhttp.open("GET", HummingbirdManager.getCommandForHB(mem.command), true);
		xhttp.send();
		return this;
	}
	else{
		return this.nextBlock;
	}
}
b_HBServo.prototype.updateAction=function(){
	if(this.runMem.finished==true){
		return this.nextBlock;
	}
	else{
		return this;
	}
}




////////////////////


function b_HBMotor(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Motor"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0));
}
b_HBMotor.prototype = Object.create(CommandBlock.prototype);
b_HBMotor.prototype.constructor = b_HBMotor;

function b_HBVibration(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Vibration"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0,true));
}
b_HBVibration.prototype = Object.create(CommandBlock.prototype);
b_HBVibration.prototype.constructor = b_HBVibration;

function b_HBLed(x,y){
	CommandBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird LED"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new NumSlot(this,0,true));
}
b_HBLed.prototype = Object.create(CommandBlock.prototype);
b_HBLed.prototype.constructor = b_HBLed;

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

function b_HBLight(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Light"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBLight.prototype = Object.create(ReporterBlock.prototype);
b_HBLight.prototype.constructor = b_HBLight;

function b_HBTempC(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Temperature C"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBTempC.prototype = Object.create(ReporterBlock.prototype);
b_HBTempC.prototype.constructor = b_HBTempC;

function b_HBTempF(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Temperature F"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBTempF.prototype = Object.create(ReporterBlock.prototype);
b_HBTempF.prototype.constructor = b_HBTempF;

function b_HBDistCM(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Distance CM"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBDistCM.prototype = Object.create(ReporterBlock.prototype);
b_HBDistCM.prototype.constructor = b_HBDistCM;

function b_HBDistInch(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"HB Distance Inch"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBDistInch.prototype = Object.create(ReporterBlock.prototype);
b_HBDistInch.prototype.constructor = b_HBDistInch;

function b_HBKnob(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Knob"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBKnob.prototype = Object.create(ReporterBlock.prototype);
b_HBKnob.prototype.constructor = b_HBKnob;

function b_HBSound(x,y){
	ReporterBlock.call(this,x,y,"hummingbird");
	this.addPart(new LabelText(this,"Hummingbird Sound"));
	this.addPart(new NumSlot(this,1,true,true));
}
b_HBSound.prototype = Object.create(ReporterBlock.prototype);
b_HBSound.prototype.constructor = b_HBSound;