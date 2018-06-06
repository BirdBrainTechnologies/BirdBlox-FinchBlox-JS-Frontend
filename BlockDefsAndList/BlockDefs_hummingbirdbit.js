/* This file contains the implementations of hummingbird bit blocks
 */

 //MARK: hummingbird bit outputs
function B_HummingbirdBitOutputBase(x, y, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal, displayUnits) {
	B_DeviceWithPortsOutputBase.call(this, x, y, DeviceHummingbirdBit, outputType, displayName, numberOfPorts, valueKey,
		minVal, maxVal, displayUnits);
}
B_HummingbirdBitOutputBase.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_HummingbirdBitOutputBase.prototype.constructor = B_HummingbirdBitOutputBase;

function B_BBPositionServo(x, y) {
	B_HummingbirdBitOutputBase.call(this, x, y, "servo", "Position Servo", 4, "angle", 0, 180, "Angle");

  this.addPart(new LabelText(this,'\xBA'));
}
B_BBPositionServo.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBPositionServo.prototype.constructor = B_BBPositionServo;

function B_BBRotationServo(x, y) {
	B_HummingbirdBitOutputBase.call(this, x, y, "servo", "Rotation Servo", 4, "percent", -100, 100, "Percent");

  this.addPart(new LabelText(this,"%"));
}
B_BBRotationServo.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBRotationServo.prototype.constructor = B_BBRotationServo;

function B_BBLed(x, y) {
	B_HummingbirdBitOutputBase.call(this, x, y, "led", "LED", 4, "intensity", 0, 100, "Intensity");

  this.addPart(new LabelText(this,"%"));
}
B_BBLed.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBLed.prototype.constructor = B_BBLed;

function B_BBTriLed(x, y) {
	B_DeviceWithPortsTriLed.call(this, x, y, DeviceHummingbirdBit, 2);
}
B_BBTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_BBTriLed.prototype.constructor = B_BBTriLed;



function B_BBBuzzer(x, y){
	CommandBlock.call(this,x,y,DeviceHummingbirdBit.getDeviceTypeId());
	this.deviceClass = DeviceHummingbirdBit;
	this.displayName = "Play note";
  this.minNote = 0
  this.maxNote = 127
  this.minBeat = 0
  this.maxBeat = 16

	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
	this.addPart(new LabelText(this,this.displayName));
	const noteSlot = new NumSlot(this,"Note_out", 60, true, true);
	noteSlot.addLimits(this.minNote, this.maxNote, "Note");
	this.addPart(noteSlot);
  this.addPart(new LabelText(this,"for"));
  const beatsSlot = new NumSlot(this,"Beats_out", 1, true, false);
  beatsSlot.addLimits(this.minBeat, this.maxBeat, "Beats");
  this.addPart(beatsSlot);
  this.addPart(new LabelText(this,"Beats"));
}
B_BBBuzzer.prototype = Object.create(CommandBlock.prototype);
B_BBBuzzer.prototype.constructor = B_BBBuzzer;
/* Sends the request */
B_BBBuzzer.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	let note = this.slots[1].getData().getValueInR(this.minNote, this.maxNote, true, true)
	let beats = this.slots[2].getData().getValueInR(this.minBeat, this.maxBeat, true, false);
  let soundDuration = CodeManager.beatsToMs(beats);

	mem.requestStatus = {};
	mem.requestStatus.finished = false;
	mem.requestStatus.error = false;
	mem.requestStatus.result = null;

	device.setBuzzer(mem.requestStatus, note, soundDuration);
	return new ExecutionStatusRunning();
};
/* Waits until the request completes */
B_BBBuzzer.prototype.updateAction = B_DeviceWithPortsOutputBase.prototype.updateAction

//MARK: microbit outputs



function B_BBLedArray(x,y){
  B_MicroBitLedArray.call(this, x, y, DeviceHummingbirdBit);
}
B_BBLedArray.prototype = Object.create(B_MicroBitLedArray.prototype);
B_BBLedArray.prototype.constructor = B_BBLedArray;


//MARK: hummingbird bit sensors
function B_HummingbirdBitSensorBase(x, y, sensorType, displayName) {
	B_DeviceWithPortsSensorBase.call(this, x, y, DeviceHummingbirdBit, sensorType, displayName, 4);
}
B_HummingbirdBitSensorBase.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_HummingbirdBitSensorBase.prototype.constructor = B_HummingbirdBitSensorBase;

function B_BBKnob(x, y) {
	B_HummingbirdBitSensorBase.call(this, x, y, "sensor", "Knob");
}
B_BBKnob.prototype = Object.create(B_HummingbirdBitSensorBase.prototype);
B_BBKnob.prototype.constructor = B_BBKnob;

function B_BBSensors(x, y){
	ReporterBlock.call(this,x,y,DeviceHummingbirdBit.getDeviceTypeId());
	this.deviceClass = DeviceHummingbirdBit;
	this.displayName = ""; //TODO: perhapse remove this
	this.numberOfPorts = 3;

  // Default option for sensor is Light.
  const dS = new DropSlot(this, "SDS_1", null, null, new SelectionData("Light", "light"));
  //const dS = new DropSlot(this, "SDS_1", null, null, new SelectionData("", 0));
  dS.addOption(new SelectionData("Distance (cm)", "distance"));
  dS.addOption(new SelectionData("Dial", "dial"));
  dS.addOption(new SelectionData("Light", "light"));
  dS.addOption(new SelectionData("Sound", "sound"));
  dS.addOption(new SelectionData("Other (V)", "other"));

	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
	this.addPart(new LabelText(this,this.displayName));
  this.addPart(dS);
	this.addPart(new PortSlot(this,"PortS_1", this.numberOfPorts));
}
B_BBSensors.prototype = Object.create(ReporterBlock.prototype);
B_BBSensors.prototype.constructor = B_BBSensors;
/* Sends the request for the sensor data. */
B_BBSensors.prototype.startAction=function(){
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
B_BBSensors.prototype.updateAction = B_DeviceWithPortsSensorBase.prototype.updateAction;

//MARK: microbit sensor
function B_BBButton(x, y) {
	B_DeviceWithPortsSensorBase.call(this, x, y, DeviceHummingbirdBit, "button", "Button", 2);
}
B_BBButton.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_BBButton.prototype.constructor = B_BBButton;



function B_BBAccelerometerMagnetometer(x, y){
	CommandBlock.call(this, x, y, DeviceHummingbirdBit.getDeviceTypeId());
	this.deviceClass = DeviceHummingbirdBit;
	this.displayName = "";

    this.addPart(new LabelText(this, this.displayName));
    // Device menu
    this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));

    //There are no ports for the accelerometer/magnetometer.

    const pickBlock = new DropSlot(this, "SDS_1", null, null, new SelectionData("Accelerometer", "accelerometer"));
    pickBlock.addOption(new SelectionData("Magnetometer", "magnetometer"));
    pickBlock.addOption(new SelectionData("Accelerometer", "accelerometer"));
    this.addPart(pickBlock);

    const pickAxis = new DropSlot(this, "SDS_2", null, null, new SelectionData("X", "x"));
    pickAxis.addOption(new SelectionData("X", "x"));
    pickAxis.addOption(new SelectionData("Y", "y"));
    pickAxis.addOption(new SelectionData("Z", "z"));
    this.addPart(pickAxis);

};


B_BBAccelerometerMagnetometer.prototype = Object.create(CommandBlock.prototype);
B_BBAccelerometerMagnetometer.prototype.constructor = B_BBAccelerometerMagnetometer;

B_BBAccelerometerMagnetometer.prototype.updateAction = B_DeviceWithPortsSensorBase.prototype.updateAction;
B_BBAccelerometerMagnetometer.prototype.startAction = B_DeviceWithPortsSensorBase.prototype.startAction;
