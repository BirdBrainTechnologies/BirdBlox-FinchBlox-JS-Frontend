/* This file contains the implementations for Blocks in the hummingbird category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 * Most relay on the HummingbirdManager to remove redundant code.
 */

function B_HummingbirdOutputBase(x, y, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal, diaplayUnits) {
	B_DeviceWithPortsOutputBase.call(this, x, y, DeviceHummingbird, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal, diaplayUnits);
}
B_HummingbirdOutputBase.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_HummingbirdOutputBase.prototype.constructor = B_HummingbirdOutputBase;



function B_HBServo(x,y){
	B_HummingbirdOutputBase.call(this, x, y, "servo", "Servo", 4, "angle", 0, 180, "Angle");
}
B_HBServo.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBServo.prototype.constructor = B_HBServo;


function B_HBMotor(x,y){
	B_HummingbirdOutputBase.call(this, x, y, "motor", "Motor", 2, "speed", -100, 100, "Speed");
}
B_HBMotor.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBMotor.prototype.constructor = B_HBMotor;



function B_HBVibration(x,y){
	B_HummingbirdOutputBase.call(this, x, y, "vibration", "Vibration", 2, "intensity", 0, 100, "Intensity");
}
B_HBVibration.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBVibration.prototype.constructor = B_HBVibration;



function B_HBLed(x,y){
	B_HummingbirdOutputBase.call(this, x, y, "led", "LED", 4, "intensity", 0, 100, "Intensity");
}
B_HBLed.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBLed.prototype.constructor = B_HBLed;



function B_HummingbirdSensorBase(x, y, sensorType, displayName) {
	B_DeviceWithPortsSensorBase.call(this, x,y, DeviceHummingbird, sensorType, displayName, 4);
}
B_HummingbirdSensorBase.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_HummingbirdSensorBase.prototype.constructor = B_HummingbirdSensorBase;


function B_HBLight(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "sensor", "Light");
}
B_HBLight.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBLight.prototype.constructor = B_HBLight;


function B_HBTempC(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "temperature", "Temperature C");
}
B_HBTempC.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBTempC.prototype.constructor = B_HBTempC;
Block.setDisplaySuffix(B_HBTempC, String.fromCharCode(176) + "C");


function B_HBDistCM(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "distance", "Distance CM");
}
B_HBDistCM.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBDistCM.prototype.constructor = B_HBDistCM;
Block.setDisplaySuffix(B_HBDistCM, "cm");



function B_HBKnob(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "sensor", "Knob");
}
B_HBKnob.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBKnob.prototype.constructor = B_HBKnob;


function B_HBSound(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "sound", "Sound");
}
B_HBSound.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBSound.prototype.constructor = B_HBSound;


///// <Special> /////


function B_HBTriLed(x,y){
	B_DeviceWithPortsTriLed.call(this,x,y, DeviceHummingbird, 2);
}
B_HBTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_HBTriLed.prototype.constructor = B_HBTriLed;


function B_HBTempF(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "temperature", "Temperature F");
}
B_HBTempF.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBTempF.prototype.constructor = B_HBTempF;
B_HBTempF.prototype.updateAction=function(){
	var status = B_DeviceWithPortsSensorBase.prototype.updateAction.call(this);
	if(status.hasError() || status.isRunning()){
		return status;
	} else {
		let resultC = status.getResult();
		if(resultC != null && resultC.isValid) {
			let result=new NumData(Math.round(resultC.getValue()*1.8+32));
			return new ExecutionStatusResult(result);
		} else {
			return status;
		}
	}
};
Block.setDisplaySuffix(B_HBTempF, String.fromCharCode(176) + "F");


function B_HBDistInch(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "distance", "Distance Inch");
}
B_HBDistInch.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBDistInch.prototype.constructor = B_HBDistInch;
B_HBDistInch.prototype.updateAction=function(){
	var status = B_DeviceWithPortsSensorBase.prototype.updateAction.call(this);
	if(status.hasError() || status.isRunning()){
		return status;
	} else {
		let resultMm = status.getResult();
		if(resultMm != null && resultMm.isValid) {
			let result=new NumData((resultMm.getValue()/2.54).toFixed(1)*1);
			return new ExecutionStatusResult(result);
		} else {
			return status;
		}
	}
};
Block.setDisplaySuffix(B_HBDistInch, "inches");