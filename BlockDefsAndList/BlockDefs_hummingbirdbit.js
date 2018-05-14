/* This file contains the implementations of hummingbird bit blocks
 */
function B_HummingbirdBitOutputBase(x, y, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal, displayUnits) {
	B_DeviceWithPortsOutputBase.call(this, x, y, DeviceHummingbirdBit, outputType, displayName, numberOfPorts, valueKey,
		minVal, maxVal, displayUnits);
}
B_HummingbirdBitOutputBase.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_HummingbirdBitOutputBase.prototype.constructor = B_HummingbirdBitOutputBase;

function B_HMPositionServo(x, y) {
	B_HummingbirdBitOutputBase.call(this, x, y, "servo", "Position Servo", 4, "angle", 0, 180, "Angle");

  this.addPart(new LabelText(this,'\xBA'));
}
B_HMPositionServo.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_HMPositionServo.prototype.constructor = B_HMPositionServo;

function B_HMRotationServo(x, y) {
	B_HummingbirdBitOutputBase.call(this, x, y, "servo", "Rotation Servo", 4, "percent", -100, 100, "Percent");

  this.addPart(new LabelText(this,"%"));
}
B_HMRotationServo.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_HMRotationServo.prototype.constructor = B_HMRotationServo;

function B_HMLed(x, y) {
	B_HummingbirdBitOutputBase.call(this, x, y, "led", "LED", 4, "intensity", 0, 100, "Intensity");
}
B_HMLed.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_HMLed.prototype.constructor = B_HMLed;

function B_HMTriLed(x, y) {
	B_DeviceWithPortsTriLed.call(this, x, y, DeviceHummingbirdBit, 2);
}
B_HMTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_HMTriLed.prototype.constructor = B_HMTriLed;


function B_HummingbirdBitSensorBase(x, y, sensorType, displayName) {
	B_DeviceWithPortsSensorBase.call(this, x, y, DeviceHummingbirdBit, sensorType, displayName, 4);
}
B_HummingbirdBitSensorBase.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_HummingbirdBitSensorBase.prototype.constructor = B_HummingbirdBitSensorBase;

function B_HMKnob(x, y) {
	B_HummingbirdBitSensorBase.call(this, x, y, "sensor", "Knob");
}
B_HMKnob.prototype = Object.create(B_HummingbirdBitSensorBase.prototype);
B_HMKnob.prototype.constructor = B_HMKnob;




function B_HummingbirdBitSensors(x, y){
	ReporterBlock.call(this,x,y,DeviceHummingbirdBit.getDeviceTypeId());
	this.deviceClass = DeviceHummingbirdBit;
	this.displayName = ""; //TODO: perhapse remove this
	this.numberOfPorts = 3;

  const dS = new DropSlot(this, "SDS_1", null, null, new SelectionData("", 0));
  dS.addOption(new SelectionData("Distance (cm)", "distance"));
  dS.addOption(new SelectionData("Dial", "sensor"));
  dS.addOption(new SelectionData("Light", "light"));
  dS.addOption(new SelectionData("Sound", "sound"));
  dS.addOption(new SelectionData("Other (V)", "other"));

	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
	this.addPart(new LabelText(this,this.displayName));
  this.addPart(dS);
	this.addPart(new PortSlot(this,"PortS_1", this.numberOfPorts));
}
B_HummingbirdBitSensors.prototype = Object.create(ReporterBlock.prototype);
B_HummingbirdBitSensors.prototype.constructor = B_HummingbirdBitSensors;
/* Sends the request for the sensor data. */
B_HummingbirdBitSensors.prototype.startAction=function(){
	let deviceIndex = this.slots[0].getData().getValue();
  let sensorSelection = this.slots[1].getData().getValue();
  console.log(sensorSelection)
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	let port = this.slots[2].getData().getValue();
	if (port != null && port > 0 && port <= this.numberOfPorts) {
		mem.requestStatus = {};
		mem.requestStatus.finished = false;
		mem.requestStatus.error = false;
		mem.requestStatus.result = null;
		device.readSensor(mem.requestStatus, sensorSelection, port);
		return new ExecutionStatusRunning();
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};
/* Returns the result of the request */
B_HummingbirdBitSensors.prototype.updateAction = B_DeviceWithPortsSensorBase.prototype.updateAction;
