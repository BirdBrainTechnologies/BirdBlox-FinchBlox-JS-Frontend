/* This file contains the implementations of MicroBit blocks
 */

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
