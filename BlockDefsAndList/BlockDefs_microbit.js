/* This file contains the implementations of MicroBit blocks
 */


//MARK: standard micro:bit outputs

function B_MBPrint(x, y){
    B_MicroBitPrint.call(this, x, y, DeviceMicroBit);
};
B_MBPrint.prototype = Object.create(B_MicroBitPrint.prototype);
B_MBPrint.prototype.constructor = B_MBPrint;


function B_MBLedArray(x,y){
  B_MicroBitLedArray.call(this, x, y, DeviceMicroBit);
};
B_MBLedArray.prototype = Object.create(B_MicroBitLedArray.prototype);
B_MBLedArray.prototype.constructor = B_MBLedArray;


//MARK: standard micro:bit inputs

function B_MBMagnetometer(x, y){
  B_MicroBitMagnetometer.call(this, x, y, DeviceMicroBit);
};
B_MBMagnetometer.prototype = Object.create(B_MicroBitMagnetometer.prototype);
B_MBMagnetometer.prototype.constructor = B_MBMagnetometer;


function B_MBButton(x, y){
    B_MicroBitButton.call(this, x, y, DeviceMicroBit);
};
B_MBButton.prototype = Object.create(B_MicroBitButton.prototype);
B_MBButton.prototype.constructor = B_MBButton;


function B_MBOrientation(x, y){
  B_MicroBitOrientation.call(this, x, y, DeviceMicroBit);
};
B_MBOrientation.prototype = Object.create(B_MicroBitOrientation.prototype);
B_MBOrientation.prototype.constructor = B_MBOrientation;


function B_MBCompass(x, y){
    B_MicroBitCompass.call(this, x, y, DeviceMicroBit);
};
B_MBCompass.prototype = Object.create(B_MicroBitCompass.prototype);
B_MBCompass.prototype.constructor = B_MBCompass;

function B_MBV2Sensor(x, y){
    B_MicroBitV2Sensor.call(this, x, y, DeviceMicroBit);
};
B_MBV2Sensor.prototype = Object.create(B_MicroBitV2Sensor.prototype);
B_MBV2Sensor.prototype.constructor = B_MBV2Sensor;


//MARK: Blocks specific to the stand alone micro:bit

function B_MBReadPin(x, y){
    ReporterBlock.call(this,x,y,DeviceMicroBit.getDeviceTypeId());
    this.deviceClass = DeviceMicroBit;
    this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));

    const pin = Language.getStr("pin");
    const pickPin = new DropSlot(this, "SDS_1", null, null, new SelectionData(pin + " 0", "1"));
    pickPin.addOption(new SelectionData(pin + " 0", "1"));
    pickPin.addOption(new SelectionData(pin + " 1", "2"));
    pickPin.addOption(new SelectionData(pin + " 2", "3"));
    this.addPart(pickPin);
    this.parseTranslation(Language.getStr("block_read"));
};
B_MBReadPin.prototype = Object.create(ReporterBlock.prototype);
B_MBReadPin.prototype.constructor = B_MBReadPin;
/* Sends the request for the sensor data. */
B_MBReadPin.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
    let pinSelection = this.slots[1].getData().getValue();
    let device = this.deviceClass.getManager().getDevice(deviceIndex);
    if (device == null) {
        this.displayError(this.deviceClass.getNotConnectedMessage());
        return new ExecutionStatusError(); // Flutter was invalid, exit early
    }
    let mem = this.runMem;

    mem.requestStatus = {};
    mem.requestStatus.finished = false;
    mem.requestStatus.error = false;
    mem.requestStatus.result = null;
    device.readSensor(mem.requestStatus, "pin", pinSelection);
    return new ExecutionStatusRunning();
};

B_MBReadPin.prototype.updateAction = function(){
    const status = this.runMem.requestStatus;
    if (status.finished) {
        if(status.error){
            this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
            return new ExecutionStatusError();
        } else {
            const result = new StringData(status.result);
            const num = Math.round(result.asNum().getValue() * 100) / 100;
            return new ExecutionStatusResult(new NumData(num));
        }
    }
    return new ExecutionStatusRunning(); // Still running
};

function B_MBWriteToPin(x, y) {

  CommandBlock.call(this,x,y,DeviceMicroBit.getDeviceTypeId());
  this.deviceClass = DeviceMicroBit;
  this.outputType = "write";

  this.minVal = 0;
  this.maxVal = 100;
  this.positive = true;
  this.valueKey = "percent";
  this.displayUnits = Language.getStr("Intensity");
  this.defaultValue = 0;

  this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));

  const pin = Language.getStr("pin");
  const pickPin = new DropSlot(this, "SDS_1", null, null, new SelectionData(pin + " 0", "1"));
  pickPin.addOption(new SelectionData(pin + " 0", "1"));
  pickPin.addOption(new SelectionData(pin + " 1", "2"));
  pickPin.addOption(new SelectionData(pin + " 2", "3"));
  this.addPart(pickPin);
  const numSlot = new NumSlot(this, "NumS_out", this.defaultValue, this.positive, true);
  numSlot.addLimits(this.minVal, this.maxVal, this.displayUnits);
  this.addPart(numSlot);
  this.parseTranslation(Language.getStr("block_write"));
};
B_MBWriteToPin.prototype = Object.create(CommandBlock.prototype);
B_MBWriteToPin.prototype.constructor = B_MBWriteToPin;

/* Sends the request */
B_MBWriteToPin.prototype.startAction = function() {
  let deviceIndex = this.slots[0].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
    this.displayError(this.deviceClass.getNotConnectedMessage());
    return new ExecutionStatusError(); // Flutter was invalid, exit early
  }
  let mem = this.runMem;
  let pin = this.slots[1].getData().getValue();
  let value = this.slots[2].getData().getValueInR(this.minVal, this.maxVal, this.positive, true);

  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;
  device.setOutput(mem.requestStatus, this.outputType, pin, value, this.valueKey);
  return new ExecutionStatusRunning();
};
/* Waits until the request completes */
B_MBWriteToPin.prototype.updateAction = B_DeviceWithPortsOutputBase.prototype.updateAction;

function B_MBBuzzer(x, y){
  B_DeviceWithPortsBuzzer.call(this, x, y, DeviceMicroBit);
};
B_MBBuzzer.prototype = Object.create(B_DeviceWithPortsBuzzer.prototype);
B_MBBuzzer.prototype.constructor = B_MBBuzzer;
