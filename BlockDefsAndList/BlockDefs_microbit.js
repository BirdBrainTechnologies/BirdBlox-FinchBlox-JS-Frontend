/* This file contains the implementations of MicroBit blocks
 */

//MARK: micro:bit outputs in case they're needed later.

function B_MicroBitOutputBase(x, y, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal, displayUnits) {
	B_DeviceWithPortsOutputBase.call(this, x, y, DeviceMicroBit, outputType, displayName, numberOfPorts, valueKey,
		minVal, maxVal, displayUnits);
}
B_MicroBitOutputBase.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_MicroBitOutputBase.prototype.constructor = B_HummingbirdBitOutputBase;



//MARK: outputs
function B_MicroBitLedArray(x, y, deviceClass) {
  CommandBlock.call(this,x,y,deviceClass.getDeviceTypeId());
	this.deviceClass = deviceClass;
	this.displayName = "LED Array";

  this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
  const label = new LabelText(this,this.displayName);
  label.isEndOfLine = true;
	this.addPart(label);

  for (let i = 0; i < 5; i++ ){
    this.addPart(new ToggleSlot(this, "Toggle_led"));
    this.addPart(new ToggleSlot(this, "Toggle_led"));
    this.addPart(new ToggleSlot(this, "Toggle_led"));
    this.addPart(new ToggleSlot(this, "Toggle_led"));
    const lastLed = new ToggleSlot(this, "Toggle_led");
    lastLed.isEndOfLine = true;
    this.addPart(lastLed);
  }


}
B_MicroBitLedArray.prototype = Object.create(CommandBlock.prototype);
B_MicroBitLedArray.prototype.constructor = B_MicroBitLedArray;
/* Sends the request */
B_MicroBitLedArray.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}

  let ledStatusString = "";
  for (let i = 0; i < 25; i++){
    if (this.slots[i + 1].getData().getValue()){
      ledStatusString += "1";
    } else {
      ledStatusString += "0";
    }
  }

	let mem = this.runMem;
  mem.requestStatus = {};
	mem.requestStatus.finished = false;
	mem.requestStatus.error = false;
	mem.requestStatus.result = null;

	device.setLedArray(mem.requestStatus, ledStatusString);
	return new ExecutionStatusRunning();
}
/* Waits until the request completes */
B_MicroBitLedArray.prototype.updateAction = B_DeviceWithPortsOutputBase.prototype.updateAction





// Try #3 at micro:bit blocks





function B_MBPrint(x, y){
	CommandBlock.call(this, x, y, DeviceMicroBit.getDeviceTypeId());
	this.deviceClass = DeviceMicroBit;
	this.displayName = "Print (Hi or 90)";


	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
	this.addPart(new LabelText(this,this.displayName));
	// StrS_1 refers to the first string slot.
	this.addPart(new StringSlot(this, "StrS_1", "HELLO"));

}

B_MBPrint.prototype = Object.create(CommandBlock.prototype);
B_MBPrint.prototype.constructor = B_MBPrint;

/* Sends the request */
B_MBPrint.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}

	let mem = this.runMem;
	let note = this.slots[1].getData();

	mem.requestStatus = {};
	mem.requestStatus.finished = false;
	mem.requestStatus.error = false;
	mem.requestStatus.result = null;

	return new ExecutionStatusRunning();
};

/* Waits until the request completes */
B_MBPrint.prototype.updateAction = B_DeviceWithPortsOutputBase.prototype.updateAction;



// End of Try #3 at micro:bit blocks.



// Try #1 of creating the micro:bit accelerometer and magnetometer blocks

function B_MBAccelerometerMagnetometer(x, y){
	CommandBlock.call(this, x, y, DeviceMicroBit.getDeviceTypeId());
	this.deviceClass = DeviceMicroBit;
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


B_MBAccelerometerMagnetometer.prototype = Object.create(CommandBlock.prototype);
B_MBAccelerometerMagnetometer.prototype.constructor = B_MBAccelerometerMagnetometer;



B_MBAccelerometerMagnetometer.prototype.updateAction = B_DeviceWithPortsSensorBase.prototype.updateAction;
B_MBAccelerometerMagnetometer.prototype.startAction = B_DeviceWithPortsSensorBase.prototype.startAction;


// End of Try #1 of creating the micro:bit accelerometer and magnetometer blocks

function B_MBLedArray(x,y){
  B_MicroBitLedArray.call(this, x, y, DeviceMicroBit);
}
B_MBLedArray.prototype = Object.create(B_MicroBitLedArray.prototype);
B_MBLedArray.prototype.constructor = B_MBLedArray;

//MARK: inputs
function B_MBButton(x, y) {
	B_DeviceWithPortsSensorBase.call(this, x, y, DeviceMicroBit, "button", "Button", 2);
}
B_MBButton.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_MBButton.prototype.constructor = B_MBButton;

function B_MBButton(x, y) {
	B_DeviceWithPortsSensorBase.call(this, x, y, DeviceMicroBit, "button", "Button", 2);
}
B_MBButton.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_MBButton.prototype.constructor = B_MBButton;


// This is the micro:bit print block. Need to figure out how to enter both text and numbers.
// outputType is 2, because we want it to be a string.

/*
function B_MBPrint(x, y) {
	B_MicroBitOutputBase.call(this, x, y, 2, "Print", 0, "text", 0, 100, "Intensity");
}
B_MBPrint.prototype = Object.create(B_MicroBitOutputBase.prototype);
B_MBPrint.prototype.constructor = B_MBPrint;
*/