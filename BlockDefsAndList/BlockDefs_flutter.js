"use strict";
/* Output Blocks */
function B_FlutterServo(x, y) {
	CommandBlock.call(this, x, y, "flutter");
	this.addPart(new DeviceDropSlot(this,"DDS_1", FlutterManager));
	this.addPart(new LabelText(this, "Servo"));
	this.addPart(new PortSlot(this,"PortS_1", 3)); //Positive integer.
	this.addPart(new NumSlot(this,"NumS_angle", 0, true, true)); //Positive integer.
}
B_FlutterServo.prototype = Object.create(CommandBlock.prototype);
B_FlutterServo.prototype.constructor = B_FlutterServo;
/* Generic flutter single output functions. */
B_FlutterServo.prototype.startAction = function() {
	let flutter = FlutterManager.GetDeviceByIndex(this.slots[0].getData().getValue());
	if (flutter == null) {
		return new ExecutionStatusDone(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	mem.flutter = flutter;
	let port = this.slots[1].getData().getValue(); // Positive integer.
	let value = this.slots[2].getData().getValueInR(0, 180); // [0,180]
	let shouldSend = CodeManager.checkHBOutputDelay(this.stack);
	return flutter.setServoOrSave(shouldSend, this, port, value);
};
B_FlutterServo.prototype.updateAction = function() {
	let shouldSend = CodeManager.checkHBOutputDelay(this.stack);
	return this.runMem.flutter.setServoOrSave(shouldSend, this);
};

function B_FlutterTriLed(x, y) {
	CommandBlock.call(this, x, y, "flutter");
	this.addPart(new DeviceDropSlot(this,"DDS_1", FlutterManager, true));
	this.addPart(new LabelText(this, "TRI-LED"));
	this.addPart(new PortSlot(this,"PortS_1", 3)); //Positive integer.
	this.addPart(new LabelText(this, "R"));
	this.addPart(new NumSlot(this,"NumS_r", 0, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "G"));
	this.addPart(new NumSlot(this,"NumS_g", 0, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "B"));
	this.addPart(new NumSlot(this,"NumS_b", 0, true, true)); //Positive integer.
}
B_FlutterTriLed.prototype = Object.create(CommandBlock.prototype);
B_FlutterTriLed.prototype.constructor = B_FlutterTriLed;
/* Sends a request if the port is an integer from 1 to 4. */
B_FlutterTriLed.prototype.startAction = function() {
	let flutter = FlutterManager.GetDeviceByIndex(this.slots[0].getData().getValue());
	if (flutter == null) {
		this.displayError("Flutter not connected");
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	mem.flutter = flutter;
	let port = this.slots[1].getData().getValue(); // Positive integer.
	let valueR = this.slots[2].getData().getValueInR(0, 100, true, true); //Positive integer.
	let valueG = this.slots[3].getData().getValueInR(0, 100, true, true); //Positive integer.
	let valueB = this.slots[4].getData().getValueInR(0, 100, true, true); //Positive integer.
	let shouldSend = CodeManager.checkHBOutputDelay(this.stack);
	if (port != null && port > 0 && port < 4) {
		return flutter.setTriLEDOrSave(shouldSend, this, port, valueR, valueG, valueB);
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};
/* Waits for the request to finish. */
B_FlutterTriLed.prototype.updateAction = function() {
	let shouldSend = CodeManager.checkHBOutputDelay(this.stack);
	return this.runMem.flutter.setTriLEDOrSave(shouldSend, this);
};




function B_FlutterBuzzer(x, y) {
	CommandBlock.call(this, x, y, "flutter");
	this.addPart(new DeviceDropSlot(this,"DDS_1", FlutterManager, true));
	this.addPart(new LabelText(this, "Buzzer"));
	this.addPart(new LabelText(this, "Volume"));
	this.addPart(new NumSlot(this,"NumS_vol", 20, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "Frequency"));
	this.addPart(new NumSlot(this,"NumS_freq", 10000, true, true)); //Positive integer.
}
B_FlutterBuzzer.prototype = Object.create(CommandBlock.prototype);
B_FlutterBuzzer.prototype.constructor = B_FlutterBuzzer;
/* Generic flutter single output functions. */
B_FlutterBuzzer.prototype.startAction = function() {
	let flutter = FlutterManager.GetDeviceByIndex(this.slots[0].getData().getValue());
	if (flutter == null) {
		return new ExecutionStatusDone(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	mem.flutter = flutter;

	let volume = this.slots[1].getData().getValueInR(0, 100);
	let frequency = this.slots[2].getData().getValueInR(0, 20000);

	// TODO: error checking?
	let shouldSend = CodeManager.checkHBOutputDelay(this.stack);
	return flutter.setBuzzerOrSave(shouldSend, this, volume, frequency);
};
B_FlutterBuzzer.prototype.updateAction = function() {
	let shouldSend = CodeManager.checkHBOutputDelay(this.stack);
	return this.runMem.flutter.setBuzzerOrSave(shouldSend, this);
};





/* Input Blocks */
function B_FlutterSensorBase(x, y, sensorType, displayName) {
	ReporterBlock.call(this, x, y, "flutter");
	this.sensorType = sensorType;
	this.displayName = displayName;
	this.addPart(new DeviceDropSlot(this,"DDS_1", FlutterManager));
	this.addPart(new LabelText(this, displayName));
	this.addPart(new PortSlot(this,"PortS_1", 3)); //Positive integer.
}
B_FlutterSensorBase.prototype = Object.create(ReporterBlock.prototype);
B_FlutterSensorBase.constructor = B_FlutterSensorBase;
B_FlutterSensorBase.prototype.startAction = function() {
	let flutter = FlutterManager.GetDeviceByIndex(this.slots[0].getData().getValue());
	if (flutter == null) {
		this.displayError("Flutter not connected");
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	mem.flutter = flutter;
	mem.sent = false;
	let port = this.slots[1].getData().getValue();
	if (port != null && port > 0 && port < 4) {
		return flutter.readSensor(mem, this.sensorType, port);
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};
B_FlutterSensorBase.prototype.updateAction = function() {
	if (this.runMem.flutter == null) {
		this.displayError("Flutter not connected");
		return new ExecutionStatusError(); // Exited early
	}
	if (this.runMem.flutter.readSensor(this.runMem) == false) {
		if(this.runMem.requestStatus.error){
			this.displayError("Flutter not connected");
			return new ExecutionStatusError();
		} else {
			var result = new StringData(this.runMem.requestStatus.result);
			if(result.isNumber()){
				return new ExecutionStatusResult(result.asNum());
			}
			else{
				GuiElements.alert("Got this response, which is not a number: \"" + this.runMem.requestStatus.result + "\"");
				return new ExecutionStatusResult(new NumData(0, false));
			}
		}
	}
	return new ExecutionStatusRunning(); // Still running
};

function B_FlutterLight(x, y) {
	B_FlutterSensorBase.call(this, x, y, "light", "Light");
}
B_FlutterLight.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterLight.prototype.constructor = B_FlutterLight;

function B_FlutterTempC(x, y) {
	B_FlutterSensorBase.call(this, x, y, "temperature", "Temperature C");
}
B_FlutterTempC.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterTempC.prototype.constructor = B_FlutterTempC;
Block.setDisplaySuffix(B_FlutterTempC, String.fromCharCode(176) + "C");



function B_FlutterDistCM(x, y) {
	B_FlutterSensorBase.call(this, x, y, "distance", "Distance CM");
}
B_FlutterDistCM.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterDistCM.prototype.constructor = B_FlutterDistCM;
Block.setDisplaySuffix(B_FlutterDistCM, "cm");


function B_FlutterKnob(x, y) {
	B_FlutterSensorBase.call(this, x, y, "sensor", "Knob");
}
B_FlutterKnob.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterKnob.prototype.constructor = B_FlutterKnob;


function B_FlutterSoil(x, y) {
	B_FlutterSensorBase.call(this, x, y, "soil", "Soil Moisture");
}
B_FlutterSoil.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterSoil.prototype.constructor = B_FlutterSoil;


function B_FlutterSound(x, y) {
	B_FlutterSensorBase.call(this, x, y, "sound", "Sound");
}
B_FlutterSound.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterSound.prototype.constructor = B_FlutterSound;


function B_FlutterTempF(x, y) {
	B_FlutterSensorBase.call(this, x, y, "temperature", "Temperature F");
}
B_FlutterTempF.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterTempF.prototype.constructor = B_FlutterTempF;
/* Waits for the request to finish then converts C to F. */
B_FlutterTempF.prototype.updateAction = function() {
	let baseStatus = B_FlutterSensorBase.prototype.updateAction.call(this);
	if(baseStatus.hasError() || baseStatus.isRunning()){
		return baseStatus;
	} else{
		let tempInC = baseStatus.getResult().getValue();
		let tempInF = Math.round(tempInC * 1.8 + 32);
		return new ExecutionStatusResult(new NumData(tempInF)); //Rounded to Integer
	}
};
Block.setDisplaySuffix(B_FlutterTempF, String.fromCharCode(176) + "F");


function B_FlutterDistInch(x, y) {
	B_FlutterSensorBase.call(this, x, y, "distance", "Distance Inch");
}
B_FlutterDistInch.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterDistInch.prototype.constructor = B_FlutterDistInch;
/* Waits for the request to finish then converts cm to in. */
B_FlutterDistInch.prototype.updateAction = function() {
	let baseStatus = B_FlutterSensorBase.prototype.updateAction.call(this);
	if(baseStatus.hasError() || baseStatus.isRunning()){
		return baseStatus;
	} else{
		let distInCM = baseStatus.getResult().getValue();
		let distInInches = (distInCM / 2.54).toFixed(1) * 1;
		return new ExecutionStatusResult(new NumData(distInInches)); //Rounded to Integer
	}
};
Block.setDisplaySuffix(B_FlutterDistInch, "inches");
