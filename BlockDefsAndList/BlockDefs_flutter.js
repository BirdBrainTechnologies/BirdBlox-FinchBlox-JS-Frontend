"use strict";

/* This file contains implementations of flutter Blocks */


/* Output blocks */
function B_FlutterServo(x, y) {
	B_DeviceWithPortsOutputBase.call(this, x, y, DeviceFlutter, "servo", "Servo", 3, "angle", 0, 180, "Angle");
}
B_FlutterServo.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_FlutterServo.prototype.constructor = B_FlutterServo;



function B_FlutterTriLed(x, y) {
	B_DeviceWithPortsTriLed.call(this, x, y, DeviceFlutter, 3);
}
B_FlutterTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_FlutterTriLed.prototype.constructor = B_FlutterTriLed;



function B_FlutterBuzzer(x, y) {
	CommandBlock.call(this, x, y, "flutter");
	this.addPart(new DeviceDropSlot(this, "DDS_1", DeviceFlutter, true));
	this.addPart(new LabelText(this, "Buzzer"));
	this.addPart(new LabelText(this, "Volume"));
	this.addPart(new NumSlot(this, "NumS_vol", 20, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "Frequency"));
	this.addPart(new NumSlot(this, "NumS_freq", 10000, true, true)); //Positive integer.
}
B_FlutterBuzzer.prototype = Object.create(CommandBlock.prototype);
B_FlutterBuzzer.prototype.constructor = B_FlutterBuzzer;
/* Sends request */
B_FlutterBuzzer.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = DeviceFlutter.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(DeviceFlutter.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let volume = this.slots[1].getData().getValueInR(0, 100, true, true);
	let frequency = this.slots[2].getData().getValueInR(0, 20000, true, true);
	this.runMem.requestStatus = {};
	device.setBuzzer(this.runMem.requestStatus, volume, frequency);
	return new ExecutionStatusRunning();
};
/* Waits for request to finish */
B_FlutterBuzzer.prototype.updateAction = function() {
	if (this.runMem.requestStatus.finished) {
		if (this.runMem.requestStatus.error) {
			const status = this.runMem.requestStatus;
			this.displayError(DeviceFlutter.getNotConnectedMessage(status.code, status.result));
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone();
	} else {
		return new ExecutionStatusRunning();
	}
};



/* Input Blocks */
function B_FlutterSensorBase(x, y, sensorType, displayName) {
	B_DeviceWithPortsSensorBase.call(this, x, y, DeviceFlutter, sensorType, displayName, 3);
}
B_FlutterSensorBase.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_FlutterSensorBase.constructor = B_FlutterSensorBase;



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
	const status = B_FlutterSensorBase.prototype.updateAction.call(this);
	if (status.hasError() || status.isRunning()) {
		return status;
	} else {
		let resultC = status.getResult();
		if (resultC != null && resultC.isValid) {
			let result = new NumData(Math.round(resultC.getValue() * 1.8 + 32));
			return new ExecutionStatusResult(result);
		} else {
			return status;
		}
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
	var status = B_FlutterSensorBase.prototype.updateAction.call(this);
	if (status.hasError() || status.isRunning()) {
		return status;
	} else {
		let resultMm = status.getResult();
		if (resultMm != null && resultMm.isValid) {
			let result = new NumData((resultMm.getValue() / 2.54).toFixed(1) * 1);
			return new ExecutionStatusResult(result);
		} else {
			return status;
		}
	}
};
Block.setDisplaySuffix(B_FlutterDistInch, "inches");