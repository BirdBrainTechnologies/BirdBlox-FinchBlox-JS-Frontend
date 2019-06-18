/* This file contains templates for Blocks common to robots that have an
 * attached micro:bit. Each robot has its own BlockDefs file, but many
 * of the defined Blocks are just subclasses of the Blocks here.
 */


/**
 * A Block that defines the symbol to display on the led array
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @constructor
 */
function B_MicroBitLedArray(x, y, deviceClass) {
  CommandBlock.call(this,x,y,deviceClass.getDeviceTypeId());
  this.deviceClass = deviceClass;
  this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
  const label = new LabelText(this, Language.getStr("block_LED_Display"));
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
     return new ExecutionStatusError(); // device was invalid, exit early
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


/**
 * A Block that defines the text to display on the led array
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @constructor
 */
function B_MicroBitPrint(x, y, deviceClass){
  CommandBlock.call(this, x, y, deviceClass.getDeviceTypeId());
  this.deviceClass = deviceClass;
  this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
  // StrS_1 refers to the first string slot.
  this.addPart(new StringSlot(this, "StrS_1", "HELLO"));
  this.parseTranslation(Language.getStr("block_Print"));
}
B_MicroBitPrint.prototype = Object.create(CommandBlock.prototype);
B_MicroBitPrint.prototype.constructor = B_MicroBitPrint;
/* Sends the request */
B_MicroBitPrint.prototype.startAction = function() {
  let deviceIndex = this.slots[0].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
    this.displayError(this.deviceClass.getNotConnectedMessage());
    return new ExecutionStatusError(); // device was invalid, exit early
  }

  let mem = this.runMem;
  let printString = this.slots[1].getData().getValue();
  mem.blockDuration = (printString.length * 600);
  mem.timerStarted = false;
  mem.requestSent = false;
  mem.printString = printString;
  mem.device = device;

  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;


  return new ExecutionStatusRunning();
};
/* Sends requests of 18 characters until full string is printed */
// June 2019 - changed limit to 10 char to accomidate finch.
B_MicroBitPrint.prototype.updateAction = function() {
  const mem = this.runMem;
  if (!mem.timerStarted) {
    const status = mem.requestStatus;
    if (!mem.requestSent) {
      const ps = mem.printString;
      const psSubstring = ps.substring(0,10);//18);
      mem.device.readPrintBlock(mem.requestStatus, psSubstring);
      mem.blockDuration = (psSubstring.length * 600);
      mem.requestSent = true;
      if (ps.length > 10) {//18) {
        mem.printString = ps.substring(10);//18);
      } else {
        mem.printString = null;
      }
      return new ExecutionStatusRunning();
    } else if (status.finished === true) {
      mem.startTime = new Date().getTime();
      mem.timerStarted = true;
    } else {
      return new ExecutionStatusRunning(); // Still running
    }
  }
  if (new Date().getTime() >= mem.startTime + mem.blockDuration) {
    if (mem.printString != null) {
      mem.requestSent = false;
      mem.timerStarted = false;
      mem.requestStatus.finish = false;
      return new ExecutionStatusRunning();
    } else {
      return new ExecutionStatusDone(); // Done running
    }
  } else {
    return new ExecutionStatusRunning(); // Still running
  }
};


/**
 * A Block to ask if a button was pressed
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @constructor
 */
function B_MicroBitButton(x, y, deviceClass){
  PredicateBlock.call(this, x, y, deviceClass.getDeviceTypeId());
  this.deviceClass = deviceClass;
  this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));

  const choice = new DropSlot(this, "SDS_1", null, null, new SelectionData("A", "buttonA"));
  choice.addOption(new SelectionData("A", "buttonA"));
  choice.addOption(new SelectionData("B", "buttonB"));
  this.addPart(choice);
  this.parseTranslation(Language.getStr("block_Button"));
};
B_MicroBitButton.prototype = Object.create(PredicateBlock.prototype);
B_MicroBitButton.prototype.constructor = B_MicroBitButton;

B_MicroBitButton.prototype.startAction=function(){
  let deviceIndex = this.slots[0].getData().getValue();
  let sensorSelection = this.slots[1].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
    this.displayError(this.deviceClass.getNotConnectedMessage());
    return new ExecutionStatusError(); // Device was invalid, exit early
  }
  let mem = this.runMem;
  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;
  device.readButtonSensor(mem.requestStatus, sensorSelection);
  return new ExecutionStatusRunning();
};

B_MicroBitButton.prototype.updateAction = function() {
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


/**
 * A Block to ask about the orientation of the micro:bit
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @constructor
 */
function B_MicroBitOrientation(x, y, deviceClass){
  PredicateBlock.call(this, x, y, deviceClass.getDeviceTypeId());
  this.deviceClass = deviceClass;
  this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));

  const orientation = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Screen_Up"), "screenUp"));
  orientation.addOption(new SelectionData(Language.getStr("Screen_Up"), "screenUp"));
  orientation.addOption(new SelectionData(Language.getStr("Screen_Down"), "screenDown"));
  orientation.addOption(new SelectionData(Language.getStr("Tilt_Left"), "tiltLeft"));
  orientation.addOption(new SelectionData(Language.getStr("Tilt_Right"), "tiltRight"));
  orientation.addOption(new SelectionData(Language.getStr("Logo_Up"), "logoUp"));
  orientation.addOption(new SelectionData(Language.getStr("Logo_Down"), "logoDown"));
  orientation.addOption(new SelectionData(Language.getStr("Shake"), "shake"));
  this.addPart(orientation);
};
B_MicroBitOrientation.prototype = Object.create(PredicateBlock.prototype);
B_MicroBitOrientation.prototype.constructor = B_MicroBitOrientation;

B_MicroBitOrientation.prototype.startAction=function(){
  let deviceIndex = this.slots[0].getData().getValue();
  let sensorSelection = this.slots[1].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
    this.displayError(this.deviceClass.getNotConnectedMessage());
    return new ExecutionStatusError(); // device was invalid, exit early
  }
  let mem = this.runMem;
  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;
  device.readButtonSensor(mem.requestStatus, sensorSelection);
  return new ExecutionStatusRunning();
};

B_MicroBitOrientation.prototype.updateAction = function() {
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


/**
 * A Block to ask for the values of the magnetometer or accelerometer
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @constructor
 */
function B_MicroBitMagnetometer(x, y, deviceClass){
   ReporterBlock.call(this,x,y,deviceClass.getDeviceTypeId());
   this.deviceClass = deviceClass;
   this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));

   const pickBlock = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Accelerometer"), "accelerometer"));
   pickBlock.addOption(new SelectionData(Language.getStr("Magnetometer"), "magnetometer"));
   pickBlock.addOption(new SelectionData(Language.getStr("Accelerometer"), "accelerometer"));
   this.addPart(pickBlock);

   const pickAxis = new DropSlot(this, "SDS_2", null, null, new SelectionData("X", "x"));
   pickAxis.addOption(new SelectionData("X", "x"));
   pickAxis.addOption(new SelectionData("Y", "y"));
   pickAxis.addOption(new SelectionData("Z", "z"));
   this.addPart(pickAxis);
}
B_MicroBitMagnetometer.prototype = Object.create(ReporterBlock.prototype);
B_MicroBitMagnetometer.prototype.constructor = B_MicroBitMagnetometer;
/* Sends the request for the sensor data. */
B_MicroBitMagnetometer.prototype.startAction=function(){
  let deviceIndex = this.slots[0].getData().getValue();
  let sensorSelection = this.slots[1].getData().getValue();
  if (sensorSelection == "accelerometer") {
     Block.setDisplaySuffix(B_MicroBitMagnetometer, "m/s" + String.fromCharCode(178));
  } else {
     Block.setDisplaySuffix(B_MicroBitMagnetometer, String.fromCharCode(956) + "T");
  }
  let axisSelection = this.slots[2].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
     this.displayError(this.deviceClass.getNotConnectedMessage());
     return new ExecutionStatusError(); // device was invalid, exit early
  }
  let mem = this.runMem;
  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;
  device.readMagnetometerSensor(mem.requestStatus, sensorSelection, axisSelection);
  return new ExecutionStatusRunning();
};

B_MicroBitMagnetometer.prototype.updateAction = function(){
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


/**
 * A Block to ask for the compass value
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @constructor
 */
function B_MicroBitCompass(x, y, deviceClass){
   ReporterBlock.call(this,x,y,deviceClass.getDeviceTypeId());
   this.deviceClass = deviceClass;
   this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
   this.addPart(new LabelText(this, Language.getStr("block_Compass")));
}
B_MicroBitCompass.prototype = Object.create(ReporterBlock.prototype);
B_MicroBitCompass.prototype.constructor = B_MicroBitCompass;

B_MicroBitCompass.prototype.startAction=function(){
   let deviceIndex = this.slots[0].getData().getValue();
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
   device.readCompass(mem.requestStatus);
   return new ExecutionStatusRunning();
};

B_MicroBitCompass.prototype.updateAction = function(){
   const status = this.runMem.requestStatus;
       if (status.finished) {
           if(status.error){
               this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
               return new ExecutionStatusError();
           } else {
               const result = new StringData(status.result);
               const numResult = result.asNum();
               const num = Math.round(numResult.getValue());
               return new ExecutionStatusResult(new NumData(num, numResult.isValid));
           }
       }
       return new ExecutionStatusRunning(); // Still running
};
Block.setDisplaySuffix(B_MicroBitCompass, String.fromCharCode(176));
