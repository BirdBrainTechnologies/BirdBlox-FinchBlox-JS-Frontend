/* This file contains the implementations of hummingbird bit blocks
 */

//MARK: hummingbird bit outputs
function B_HummingbirdBitOutputBase(x, y, outputType, blockTranslationKey, numberOfPorts, valueKey, minVal, maxVal, displayUnits, defaultVal) {
  B_DeviceWithPortsOutputBase.call(this, x, y, DeviceHummingbirdBit, outputType, blockTranslationKey, numberOfPorts, valueKey,
    minVal, maxVal, displayUnits, defaultVal);
}
B_HummingbirdBitOutputBase.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_HummingbirdBitOutputBase.prototype.constructor = B_HummingbirdBitOutputBase;

function B_BBPositionServo(x, y) {
  B_HummingbirdBitOutputBase.call(this, x, y, "servo", "block_Position_Servo", 4, "angle", 0, 180, Language.getStr("Angle"), 90);
}
B_BBPositionServo.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBPositionServo.prototype.constructor = B_BBPositionServo;

function B_BBRotationServo(x, y) {
  B_HummingbirdBitOutputBase.call(this, x, y, "servo", "block_Rotation_Servo", 4, "percent", -100, 100, Language.getStr("Speed"));
}
B_BBRotationServo.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBRotationServo.prototype.constructor = B_BBRotationServo;

function B_BBLed(x, y) {
  B_HummingbirdBitOutputBase.call(this, x, y, "led", "block_LED", 3, "intensity", 0, 100, Language.getStr("Intensity"));
}
B_BBLed.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBLed.prototype.constructor = B_BBLed;

function B_BBTriLed(x, y) {
  B_DeviceWithPortsTriLed.call(this, x, y, DeviceHummingbirdBit, 2);
}
B_BBTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_BBTriLed.prototype.constructor = B_BBTriLed;

function B_BBBuzzer(x, y) {
  B_DeviceWithPortsBuzzer.call(this, x, y, DeviceHummingbirdBit);
}
B_BBBuzzer.prototype = Object.create(B_DeviceWithPortsBuzzer.prototype);
B_BBBuzzer.prototype.constructor = B_BBBuzzer;


//MARK: hummingbird bit sensors
function B_BBSensors(x, y) {
  ReporterBlock.call(this, x, y, DeviceHummingbirdBit.getDeviceTypeId());
  this.deviceClass = DeviceHummingbirdBit;
  this.numberOfPorts = 3;

  // Default option for sensor is Light.
  const dS = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Light"), "light"));
  //const dS = new DropSlot(this, "SDS_1", null, null, new SelectionData("", 0));
  dS.addOption(new SelectionData(Language.getStr("Distance"), "distance"));
  dS.addOption(new SelectionData(Language.getStr("Dial"), "dial"));
  dS.addOption(new SelectionData(Language.getStr("Light"), "light"));
  dS.addOption(new SelectionData(Language.getStr("Sound"), "sound"));
  dS.addOption(new SelectionData(Language.getStr("Other"), "other"));

  this.addPart(new DeviceDropSlot(this, "DDS_1", this.deviceClass));
  this.addPart(dS);
  this.addPart(new PortSlot(this, "PortS_1", this.numberOfPorts));
}
B_BBSensors.prototype = Object.create(ReporterBlock.prototype);
B_BBSensors.prototype.constructor = B_BBSensors;
/* Sends the request for the sensor data. */
B_BBSensors.prototype.startAction = function() {
  let deviceIndex = this.slots[0].getData().getValue();
  let sensorSelection = this.slots[1].getData().getValue();
  if (sensorSelection == "distance") {
    Block.setDisplaySuffix(B_BBSensors, "cm");
  } else if (sensorSelection == "other") {
    Block.setDisplaySuffix(B_BBSensors, "V");
  } else {
    Block.removeDisplaySuffix(B_BBSensors);
  }

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
    mem.requestStatus.sensorSelection = sensorSelection;
    device.readSensor(mem.requestStatus, sensorSelection, port);
    return new ExecutionStatusRunning();
  } else {
    this.displayError("Invalid port number");
    return new ExecutionStatusError(); // Invalid port, exit early
  }
};
/* Returns the result of the request */
B_BBSensors.prototype.updateAction = function() {
  const status = this.runMem.requestStatus;
  if (status.finished) {
    if (status.error) {
      this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
      return new ExecutionStatusError();
    } else {
      const result = new StringData(status.result);
      const num = result.asNum().getValue();
      var rounded = Math.round(num);
      if (status.sensorSelection == "other") {
        rounded = Math.round(num * 100) / 100;
      }
      return new ExecutionStatusResult(new NumData(rounded));
    }
  }
  return new ExecutionStatusRunning(); // Still running
};



//MARK: micro:bit outputs

function B_BBLedArray(x, y) {
  B_MicroBitLedArray.call(this, x, y, DeviceHummingbirdBit);
}
B_BBLedArray.prototype = Object.create(B_MicroBitLedArray.prototype);
B_BBLedArray.prototype.constructor = B_BBLedArray;


function B_BBPrint(x, y) {
  B_MicroBitPrint.call(this, x, y, DeviceHummingbirdBit);
}
B_BBPrint.prototype = Object.create(B_MicroBitPrint.prototype);
B_BBPrint.prototype.constructor = B_BBPrint;


//MARK: micro:bit inputs

function B_BBButton(x, y) {
  B_MicroBitButton.call(this, x, y, DeviceHummingbirdBit);
};
B_BBButton.prototype = Object.create(B_MicroBitButton.prototype);
B_BBButton.prototype.constructor = B_BBButton;


function B_BBOrientation(x, y) {
  B_MicroBitOrientation.call(this, x, y, DeviceHummingbirdBit);
};
B_BBOrientation.prototype = Object.create(B_MicroBitOrientation.prototype);
B_BBOrientation.prototype.constructor = B_BBOrientation;


function B_BBMagnetometer(x, y) {
  B_MicroBitMagnetometer.call(this, x, y, DeviceHummingbirdBit);
}
B_BBMagnetometer.prototype = Object.create(B_MicroBitMagnetometer.prototype);
B_BBMagnetometer.prototype.constructor = B_BBMagnetometer;


function B_BBCompass(x, y) {
  B_MicroBitCompass.call(this, x, y, DeviceHummingbirdBit);
}
B_BBCompass.prototype = Object.create(B_MicroBitCompass.prototype);
B_BBCompass.prototype.constructor = B_BBCompass;

function B_BBV2Sensor(x, y) {
  B_MicroBitV2Sensor.call(this, x, y, DeviceHummingbirdBit);
}
B_BBV2Sensor.prototype = Object.create(B_MicroBitV2Sensor.prototype);
B_BBV2Sensor.prototype.constructor = B_BBV2Sensor;
