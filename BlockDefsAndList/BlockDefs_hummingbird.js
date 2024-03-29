/* This file contains the implementations of hummingbird blocks
 */
function B_HummingbirdOutputBase(x, y, outputType, blockTranslationKey, numberOfPorts, valueKey, minVal, maxVal, displayUnits) {
  B_DeviceWithPortsOutputBase.call(this, x, y, DeviceHummingbird, outputType, blockTranslationKey, numberOfPorts, valueKey,
    minVal, maxVal, displayUnits);
}
B_HummingbirdOutputBase.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_HummingbirdOutputBase.prototype.constructor = B_HummingbirdOutputBase;



function B_HBServo(x, y) {
  B_HummingbirdOutputBase.call(this, x, y, "servo", "block_Servo", 4, "angle", 0, 180, Language.getStr("Angle"));
}
B_HBServo.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBServo.prototype.constructor = B_HBServo;



function B_HBMotor(x, y) {
  B_HummingbirdOutputBase.call(this, x, y, "motor", "block_Motor", 2, "speed", -100, 100, Language.getStr("Speed"));
}
B_HBMotor.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBMotor.prototype.constructor = B_HBMotor;



function B_HBVibration(x, y) {
  B_HummingbirdOutputBase.call(this, x, y, "vibration", "block_Vibration", 2, "intensity", 0, 100, Language.getStr("Intensity"));
}
B_HBVibration.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBVibration.prototype.constructor = B_HBVibration;



function B_HBLed(x, y) {
  B_HummingbirdOutputBase.call(this, x, y, "led", "block_LED", 4, "intensity", 0, 100, Language.getStr("Intensity"));
}
B_HBLed.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBLed.prototype.constructor = B_HBLed;



function B_HummingbirdSensorBase(x, y, sensorType, displayName) {
  B_DeviceWithPortsSensorBase.call(this, x, y, DeviceHummingbird, sensorType, displayName, 4);
}
B_HummingbirdSensorBase.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_HummingbirdSensorBase.prototype.constructor = B_HummingbirdSensorBase;



function B_HBLight(x, y) {
  B_HummingbirdSensorBase.call(this, x, y, "light", Language.getStr("Light"));
}
B_HBLight.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBLight.prototype.constructor = B_HBLight;



function B_HBTempC(x, y) {
  B_HummingbirdSensorBase.call(this, x, y, "temperature", "");
  this.parseTranslation(Language.getStr("block_Temperature_C"));
}
B_HBTempC.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBTempC.prototype.constructor = B_HBTempC;
Block.setDisplaySuffix(B_HBTempC, String.fromCharCode(176) + "C");



function B_HBDistCM(x, y) {
  B_HummingbirdSensorBase.call(this, x, y, "distance", Language.getStr("Distance") + " " + Language.getStr("CM"));
}
B_HBDistCM.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBDistCM.prototype.constructor = B_HBDistCM;
Block.setDisplaySuffix(B_HBDistCM, "cm");



function B_HBKnob(x, y) {
  B_HummingbirdSensorBase.call(this, x, y, "sensor", Language.getStr("Dial"));
}
B_HBKnob.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBKnob.prototype.constructor = B_HBKnob;



function B_HBSound(x, y) {
  B_HummingbirdSensorBase.call(this, x, y, "sound", Language.getStr("Sound"));
}
B_HBSound.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBSound.prototype.constructor = B_HBSound;


function B_HBTriLed(x, y) {
  B_DeviceWithPortsTriLed.call(this, x, y, DeviceHummingbird, 2);
}
B_HBTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_HBTriLed.prototype.constructor = B_HBTriLed;


/* Special Blocks */


function B_HBTempF(x, y) {
  B_HummingbirdSensorBase.call(this, x, y, "temperature", "");
  this.parseTranslation(Language.getStr("block_Temperature_F"));
}
B_HBTempF.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBTempF.prototype.constructor = B_HBTempF;
/* Waits for the request to finish then converts C to F. */
B_HBTempF.prototype.updateAction = function() {
  const status = B_DeviceWithPortsSensorBase.prototype.updateAction.call(this);
  if (status.hasError() || status.isRunning()) {
    return status;
  } else {
    let resultC = status.getResult();
    if (resultC != null && resultC.isValid) {
      let result = new NumData(Math.round(resultC.getValue() * 1.8 + 32));
      return new ExecutionStatusResult(result);
    } else {
      return status;
    }
  }
};
Block.setDisplaySuffix(B_HBTempF, String.fromCharCode(176) + "F");



function B_HBDistInch(x, y) {
  B_HummingbirdSensorBase.call(this, x, y, "distance", Language.getStr("Distance") + " " + Language.getStr("Inch"));
}
B_HBDistInch.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBDistInch.prototype.constructor = B_HBDistInch;
/* Waits for the request to finish then converts cm to in. */
B_HBDistInch.prototype.updateAction = function() {
  const status = B_DeviceWithPortsSensorBase.prototype.updateAction.call(this);
  if (status.hasError() || status.isRunning()) {
    return status;
  } else {
    let resultMm = status.getResult();
    if (resultMm != null && resultMm.isValid) {
      let result = new NumData((resultMm.getValue() / 2.54).toFixed(0) * 1);
      return new ExecutionStatusResult(result);
    } else {
      return status;
    }
  }
};
Block.setDisplaySuffix(B_HBDistInch, "inches");
