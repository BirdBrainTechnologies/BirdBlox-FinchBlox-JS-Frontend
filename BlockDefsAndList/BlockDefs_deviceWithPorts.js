/* This file contains templates for Blocks that control robots.  Each robot has its own BlockDefs file, but many
 * of the defined Blocks are just subclasses of the Blocks here.
 */

/**
 * A Block that polls a sensor
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @param {string} sensorType - Needed for the http request
 * @param {string} displayName - Name present on Block
 * @param {number} numberOfPorts - Used to populate PortSlot
 * @constructor
 */
function B_DeviceWithPortsSensorBase(x, y, deviceClass, sensorType, displayName, numberOfPorts) {
  ReporterBlock.call(this, x, y, deviceClass.getDeviceTypeId());
  this.deviceClass = deviceClass;
  this.sensorType = sensorType;
  this.displayName = displayName; //TODO: perhapse remove this
  this.numberOfPorts = numberOfPorts;
  this.addPart(new DeviceDropSlot(this, "DDS_1", deviceClass));
  this.addPart(new LabelText(this, displayName));
  this.addPart(new PortSlot(this, "PortS_1", numberOfPorts));
}
B_DeviceWithPortsSensorBase.prototype = Object.create(ReporterBlock.prototype);
B_DeviceWithPortsSensorBase.prototype.constructor = B_DeviceWithPortsSensorBase;
/* Sends the request for the sensor data. */
B_DeviceWithPortsSensorBase.prototype.startAction = function() {
  let deviceIndex = this.slots[0].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
    this.displayError(this.deviceClass.getNotConnectedMessage());
    return new ExecutionStatusError(); // Flutter was invalid, exit early
  }
  let mem = this.runMem;
  let port = this.slots[1].getData().getValue();
  if (port != null && port > 0 && port <= this.numberOfPorts) {
    mem.requestStatus = {};
    mem.requestStatus.finished = false;
    mem.requestStatus.error = false;
    mem.requestStatus.result = null;
    device.readSensor(mem.requestStatus, this.sensorType, port);
    return new ExecutionStatusRunning();
  } else {
    this.displayError("Invalid port number");
    return new ExecutionStatusError(); // Invalid port, exit early
  }
};
/* Returns the result of the request */
B_DeviceWithPortsSensorBase.prototype.updateAction = function() {
  const status = this.runMem.requestStatus;
  if (status.finished) {
    if (status.error) {
      this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
      return new ExecutionStatusError();
    } else {
      const result = new StringData(status.result);
      const num = result.asNum().getValue();
      const rounded = Math.round(num);
      return new ExecutionStatusResult(new NumData(rounded));
    }
  }
  return new ExecutionStatusRunning(); // Still running
};


/**
 * A Block that sets an output
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @param {string} outputType - Needed for the http request
 * @param {string} displayName - Name present on Block
 * @param {number} numberOfPorts - Used to populate PortSlot
 * @param {string} valueKey - Needed for the http request. The key used to send the value in the slot
 * @param {number} minVal - The minimum value the output can take
 * @param {number} maxVal - The maximum value the output can take
 * @param {string} displayUnits - The units to display on the inputPad
 * @constructor
 */
function B_DeviceWithPortsOutputBase(x, y, deviceClass, outputType, blockTranslationKey, numberOfPorts, valueKey,
  minVal, maxVal, displayUnits, defaultVal) {
  CommandBlock.call(this, x, y, deviceClass.getDeviceTypeId());
  this.deviceClass = deviceClass;
  this.outputType = outputType;
  this.numberOfPorts = numberOfPorts;
  this.minVal = minVal;
  this.maxVal = maxVal;
  this.positive = minVal >= 0;
  this.valueKey = valueKey;
  this.displayUnits = displayUnits;
  if (defaultVal == null) {
    this.defaultValue = 0;
  } else {
    this.defaultValue = defaultVal;
  }
  this.addPart(new DeviceDropSlot(this, "DDS_1", deviceClass));
  this.addPart(new PortSlot(this, "PortS_1", numberOfPorts)); //Four sensor ports.
  const numSlot = new NumSlot(this, "NumS_out", this.defaultValue, this.positive, true);
  numSlot.addLimits(this.minVal, this.maxVal, displayUnits);
  this.addPart(numSlot);
  this.parseTranslation(Language.getStr(blockTranslationKey));
}
B_DeviceWithPortsOutputBase.prototype = Object.create(CommandBlock.prototype);
B_DeviceWithPortsOutputBase.prototype.constructor = B_DeviceWithPortsOutputBase;
/* Sends the request */
B_DeviceWithPortsOutputBase.prototype.startAction = function() {
  let deviceIndex = this.slots[0].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
    this.displayError(this.deviceClass.getNotConnectedMessage());
    return new ExecutionStatusError(); // Flutter was invalid, exit early
  }
  let mem = this.runMem;
  let port = this.slots[1].getData().getValue();
  let value = this.slots[2].getData().getValueInR(this.minVal, this.maxVal, this.positive, true);
  if (port != null && port > 0 && port <= this.numberOfPorts) {
    mem.requestStatus = {};
    mem.requestStatus.finished = false;
    mem.requestStatus.error = false;
    mem.requestStatus.result = null;
    device.setOutput(mem.requestStatus, this.outputType, port, value, this.valueKey);
    return new ExecutionStatusRunning();
  } else {
    this.displayError("Invalid port number");
    return new ExecutionStatusError(); // Invalid port, exit early
  }
};
/* Waits until the request completes */
B_DeviceWithPortsOutputBase.prototype.updateAction = function() {
  if (this.runMem.requestStatus.finished) {
    if (this.runMem.requestStatus.error) {
      let status = this.runMem.requestStatus;
      this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
      return new ExecutionStatusError();
    }
    return new ExecutionStatusDone();
  } else {
    return new ExecutionStatusRunning();
  }
};


/**
 * Block that sets a Tri-LED
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @param {number} numberOfPorts - Number of Tri-LED ports on the device
 * @constructor
 */
function B_DeviceWithPortsTriLed(x, y, deviceClass, numberOfPorts) {
  CommandBlock.call(this, x, y, deviceClass.getDeviceTypeId());
  this.deviceClass = deviceClass;
  this.numberOfPorts = numberOfPorts;
  this.addPart(new DeviceDropSlot(this, "DDS_1", deviceClass, true));
  this.addPart(new PortSlot(this, "PortS_1", numberOfPorts)); //Positive integer.
  const ledSlot1 = new NumSlot(this, "NumS_r", 0, true, true); //Positive integer.
  ledSlot1.addLimits(0, 100, Language.getStr("Intensity"));
  this.addPart(ledSlot1);
  const ledSlot2 = new NumSlot(this, "NumS_g", 0, true, true); //Positive integer.
  ledSlot2.addLimits(0, 100, Language.getStr("Intensity"));
  this.addPart(ledSlot2);
  const ledSlot3 = new NumSlot(this, "NumS_b", 0, true, true); //Positive integer.
  ledSlot3.addLimits(0, 100, Language.getStr("Intensity"));
  this.addPart(ledSlot3);
  this.parseTranslation(Language.getStr("block_Tri_LED"));
}
B_DeviceWithPortsTriLed.prototype = Object.create(CommandBlock.prototype);
B_DeviceWithPortsTriLed.prototype.constructor = B_DeviceWithPortsTriLed;
/* Sends the request */
B_DeviceWithPortsTriLed.prototype.startAction = function() {
  let deviceIndex = this.slots[0].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
    this.displayError(this.deviceClass.getNotConnectedMessage());
    return new ExecutionStatusError(); // Flutter was invalid, exit early
  }
  let mem = this.runMem;
  mem.requestStatus = {};
  let port = this.slots[1].getData().getValue(); // Positive integer.
  let valueR = this.slots[2].getData().getValueInR(0, 100, true, true); //Positive integer.
  let valueG = this.slots[3].getData().getValueInR(0, 100, true, true); //Positive integer.
  let valueB = this.slots[4].getData().getValueInR(0, 100, true, true); //Positive integer.
  if (port != null && port > 0 && port <= this.numberOfPorts) {
    device.setTriLed(mem.requestStatus, port, valueR, valueG, valueB);
    return new ExecutionStatusRunning();
  } else {
    this.displayError("Invalid port number");
    return new ExecutionStatusError(); // Invalid port, exit early
  }
};
/* Waits for the request to finish. */
B_DeviceWithPortsTriLed.prototype.updateAction = function() {
  if (this.runMem.requestStatus.finished) {
    if (this.runMem.requestStatus.error) {
      let status = this.runMem.requestStatus;
      this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
      return new ExecutionStatusError();
    }
    return new ExecutionStatusDone();
  } else {
    return new ExecutionStatusRunning();
  }
};

/**
 * Block that sets a Buzzer
 * @param {number} x
 * @param {number} y
 * @param deviceClass - A subclass of Device indicating the type of robot
 * @constructor
 */
function B_DeviceWithPortsBuzzer(x, y, deviceClass) {
  CommandBlock.call(this, x, y, deviceClass.getDeviceTypeId());
  this.deviceClass = deviceClass;
  this.minNote = 32
  this.maxNote = 135
  this.minBeat = 0
  this.maxBeat = 16
  this.addPart(new DeviceDropSlot(this, "DDS_1", this.deviceClass));
  //const noteSlot = new NumSlot(this,"Note_out", 60, true, true);
  const noteSlot = new NoteSlot(this, "Note_out", 60, true, true);
  noteSlot.addLimits(this.minNote, this.maxNote, Language.getStr("Note"));
  this.addPart(noteSlot);
  const beatsSlot = new NumSlot(this, "Beats_out", 1, true, false);
  beatsSlot.addLimits(this.minBeat, this.maxBeat, Language.getStr("Beats"));
  this.addPart(beatsSlot);
  this.parseTranslation(Language.getStr("block_Play_Note"));
}
B_DeviceWithPortsBuzzer.prototype = Object.create(CommandBlock.prototype);
B_DeviceWithPortsBuzzer.prototype.constructor = B_DeviceWithPortsBuzzer;
/* Sends the request */
B_DeviceWithPortsBuzzer.prototype.startAction = function() {
  let deviceIndex = this.slots[0].getData().getValue();
  let device = this.deviceClass.getManager().getDevice(deviceIndex);
  if (device == null) {
    this.displayError(this.deviceClass.getNotConnectedMessage());
    return new ExecutionStatusError(); // Flutter was invalid, exit early
  }

  const mem = this.runMem;
  const note = this.slots[1].getData().getValueInR(this.minNote, this.maxNote, true, true)
  const beats = this.slots[2].getData().getValueInR(this.minBeat, this.maxBeat, true, false);
  mem.soundDuration = CodeManager.beatsToMs(beats);
  mem.timerStarted = false;

  mem.requestStatus = {};
  mem.requestStatus.finished = false;
  mem.requestStatus.error = false;
  mem.requestStatus.result = null;
  //Setting a buzzer with a duration of 0 has strange results on the micro:bit.
  if (mem.soundDuration > 0) {
    device.setBuzzer(mem.requestStatus, note, mem.soundDuration);
  } else {
    mem.requestStatus.finished = true;
  }

  return new ExecutionStatusRunning();
};
/* Waits until the request completes */
B_DeviceWithPortsBuzzer.prototype.updateAction = function() {
  const mem = this.runMem;
  if (!mem.timerStarted) {
    const status = mem.requestStatus;
    if (status.finished === true) {
      mem.startTime = new Date().getTime();
      mem.timerStarted = true;
    } else {
      return new ExecutionStatusRunning(); // Still running
    }
  }
  if (new Date().getTime() >= mem.startTime + mem.soundDuration) {
    return new ExecutionStatusDone(); // Done running
  } else {
    return new ExecutionStatusRunning(); // Still running
  }
};
