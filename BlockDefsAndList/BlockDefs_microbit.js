/* This file contains the implementations of MicroBit blocks
 */

//MARK: micro:bit outputs in case they're needed later.

function B_MicroBitOutputBase(x, y, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal, displayUnits) {
	B_DeviceWithPortsOutputBase.call(this, x, y, DeviceMicroBit, outputType, displayName, numberOfPorts, valueKey,
		minVal, maxVal, displayUnits);
}
B_MicroBitOutputBase.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_MicroBitOutputBase.prototype.constructor = B_MicroBitOutputBase;



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
    this.addPart(new ToggleSlot(this, "Toggle_led1" + i, false));
    this.addPart(new ToggleSlot(this, "Toggle_led2" + i, false));
    this.addPart(new ToggleSlot(this, "Toggle_led3" + i, false));
    this.addPart(new ToggleSlot(this, "Toggle_led4" + i, false));
    const lastLed = new ToggleSlot(this, "Toggle_led5" + i, false);
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
	this.displayName = "Print";


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
	let printString = this.slots[1].getData().getValue();

	mem.requestStatus = {};
	mem.requestStatus.finished = false;
	mem.requestStatus.error = false;
	mem.requestStatus.result = null;
	device.readPrintBlock(mem.requestStatus, printString);

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

/*
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

*/


function B_MBMagnetometer(x, y){
	ReporterBlock.call(this,x,y,DeviceMicroBit.getDeviceTypeId());
	this.deviceClass = DeviceMicroBit;
	this.displayName = "";
	this.numberOfPorts = 1;

	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
	this.addPart(new LabelText(this,this.displayName));


    const pickBlock = new DropSlot(this, "SDS_1", null, null, new SelectionData("Accelerometer " + "(m/s" + String.fromCharCode(178)
    + ")", "accelerometer"));

    pickBlock.addOption(new SelectionData("Magnetometer (" + String.fromCharCode(956) + "T)", "magnetometer"));
    pickBlock.addOption(new SelectionData("Accelerometer " + "(m/s" + String.fromCharCode(178)
    + ")", "accelerometer"));
    this.addPart(pickBlock);

    const pickAxis = new DropSlot(this, "SDS_2", null, null, new SelectionData("X", "x"));
    pickAxis.addOption(new SelectionData("X", "x"));
    pickAxis.addOption(new SelectionData("Y", "y"));
    pickAxis.addOption(new SelectionData("Z", "z"));
    this.addPart(pickAxis);

	//this.addPart(new PortSlot(this,"PortS_1", this.numberOfPorts));
}
B_MBMagnetometer.prototype = Object.create(ReporterBlock.prototype);
B_MBMagnetometer.prototype.constructor = B_MBMagnetometer;
/* Sends the request for the sensor data. */
B_MBMagnetometer.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
    let sensorSelection = this.slots[1].getData().getValue();
    let axisSelection = this.slots[2].getData().getValue();
    console.log(sensorSelection)
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	let port = 1;
	if (port != null && port > 0 && port <= this.numberOfPorts) {
		mem.requestStatus = {};
		mem.requestStatus.finished = false;
		mem.requestStatus.error = false;
		mem.requestStatus.result = null;
		device.readMagnetometerSensor(mem.requestStatus, sensorSelection, axisSelection);
		return new ExecutionStatusRunning();
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};



//B_MBMagnetometer.prototype.updateAction = B_DeviceWithPortsSensorBase.prototype.updateAction;


B_MBMagnetometer.prototype.updateAction = function(){

	const status = this.runMem.requestStatus;
    	if (status.finished) {
    		if(status.error){
    			this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
    			return new ExecutionStatusError();
    		} else {
    			const result = new StringData(status.result);
    			const num = result.asNum().getValue();

    			return new ExecutionStatusResult(new NumData(num));
    		}
    	}
    	return new ExecutionStatusRunning(); // Still running

};








// Here is the block for B_MBButton.

function B_MBButton(x, y){
	//ReporterBlock.call(this,x,y,DeviceMicroBit.getDeviceTypeId());
	PredicateBlock.call(this, x, y, DeviceMicroBit.getDeviceTypeId());
	this.deviceClass = DeviceMicroBit;
	this.displayName = "Button";
	this.numberOfPorts = 1;

	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
	this.addPart(new LabelText(this,this.displayName));


    const choice = new DropSlot(this, "SDS_1", null, null, new SelectionData("A", "buttonA"));
    choice.addOption(new SelectionData("A", "buttonA"));
    choice.addOption(new SelectionData("B", "buttonB"));
    this.addPart(choice);

};


//B_MBButton.prototype = Object.create(ReporterBlock.prototype);
B_MBButton.prototype = Object.create(PredicateBlock.prototype);
B_MBButton.prototype.constructor = B_MBButton;



B_MBButton.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
    let sensorSelection = this.slots[1].getData().getValue();

    console.log(sensorSelection)
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	let port = 1;
	if (port != null && port > 0 && port <= this.numberOfPorts) {
		mem.requestStatus = {};
		mem.requestStatus.finished = false;
		mem.requestStatus.error = false;
		mem.requestStatus.result = null;
		device.readButtonSensor(mem.requestStatus, sensorSelection);
		return new ExecutionStatusRunning();
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};



//B_MBButton.prototype.updateAction = B_DeviceWithPortsSensorBase.prototype.updateAction;

B_MBButton.prototype.updateAction = function() {


	const mem = this.runMem;
	const status = mem.requestStatus;
	if (status.finished === true) {
		if (status.error === false) {
			return new ExecutionStatusResult(new BoolData(status.result === "1", true));
		} else {
			if (status.result.length > 0) {
				this.displayError(status.result);
				return new ExecutionStatusError();
			} else {
				return new ExecutionStatusResult(new BoolData(false, false)); // false is default.
			}
		}
	} else {
		return new ExecutionStatusRunning(); // Still running
	}

};


/*



*/













function B_MBOrientation(x, y){
	//ReporterBlock.call(this,x,y,DeviceMicroBit.getDeviceTypeId());
	PredicateBlock.call(this, x, y, DeviceMicroBit.getDeviceTypeId());
	this.deviceClass = DeviceMicroBit;
	this.displayName = "";
	this.numberOfPorts = 1;

	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
	this.addPart(new LabelText(this,this.displayName));


    const orientation = new DropSlot(this, "SDS_1", null, null, new SelectionData("Screen Up", "screenUp"));
    orientation.addOption(new SelectionData("Screen Up", "screenUp"));
    orientation.addOption(new SelectionData("Screen Down", "screenDown"));
    orientation.addOption(new SelectionData("Tilt Left", "tiltLeft"));
    orientation.addOption(new SelectionData("Tilt Right", "tiltRight"));
    orientation.addOption(new SelectionData("Logo Up", "logoUp"));
    orientation.addOption(new SelectionData("Logo Down", "logoDown"));
    orientation.addOption(new SelectionData("Shake", "shake"));
    this.addPart(orientation);

};


//B_MBOrientation.prototype = Object.create(ReporterBlock.prototype);
B_MBOrientation.prototype = Object.create(PredicateBlock.prototype);
B_MBOrientation.prototype.constructor = B_MBOrientation;




B_MBOrientation.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
    let sensorSelection = this.slots[1].getData().getValue();

    console.log(sensorSelection)
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	let port = 1;
	if (port != null && port > 0 && port <= this.numberOfPorts) {
		mem.requestStatus = {};
		mem.requestStatus.finished = false;
		mem.requestStatus.error = false;
		mem.requestStatus.result = null;
		device.readButtonSensor(mem.requestStatus, sensorSelection);
		return new ExecutionStatusRunning();
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};



//B_MBOrientation.prototype.updateAction = B_DeviceWithPortsSensorBase.prototype.updateAction;


B_MBOrientation.prototype.updateAction = function() {

	const mem = this.runMem;
	const status = mem.requestStatus;
	if (status.finished === true) {
		if (status.error === false) {
			return new ExecutionStatusResult(new BoolData(status.result === "1", true));
		} else {
			if (status.result.length > 0) {
				this.displayError(status.result);
				return new ExecutionStatusError();
			} else {
				return new ExecutionStatusResult(new BoolData(false, false)); // false is default.
			}
		}
	} else {
		return new ExecutionStatusRunning(); // Still running
	}




};
