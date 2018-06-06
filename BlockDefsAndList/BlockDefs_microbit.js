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
    this.addPart(new ToggleSlot(this, "Toggle_led1" + i));
    this.addPart(new ToggleSlot(this, "Toggle_led2" + i));
    this.addPart(new ToggleSlot(this, "Toggle_led3" + i));
    this.addPart(new ToggleSlot(this, "Toggle_led4" + i));
    const lastLed = new ToggleSlot(this, "Toggle_led5" + i);
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


//Code that I added
// ASK WHAT SHOULD THE 2nd field of NumOrStringSlot be??


function B_MBPrint(x, y, deviceClass, numberOfPorts) {
	CommandBlock.call(this, x, y, deviceClass.getDeviceTypeId());
	this.deviceClass = deviceClass;
    this.dislayName = "Print Block"
	this.addPart(new DeviceDropSlot(this,"DDS_1", deviceClass, true));
	this.addPart(new LabelText(this, "Print (Hi or 90)"));
	// Default message that is displayed
	this.addPart(new StringSlot(this, "StrS_msg", "Hello"));
}

B_MBPrint.prototype = Object.create(B_MicroBitOutputBase.prototype);
B_MBPrint.prototype.constructor = B_MBPrint;

// Sends the request
B_MBPrint.prototype.startAction = function() {

    const mem = this.runMem;
    mem.request = "tablet/pressure";
    mem.requestStatus = function() {};
    HtmlServer.sendRequest(mem.request, mem.requestStatus);
    return new ExecutionStatusRunning(); // Still running

};


//Waits for the request to finish.

B_MBPrint.prototype.updateAction = function() {
if(this.runMem.requestStatus.finished){
		if(this.runMem.requestStatus.error){
			let status = this.runMem.requestStatus;
			this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone();
	}
	else{
		return new ExecutionStatusRunning();
	}
};




//end of code that I added

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
