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
    this.draggable = true;
    B_HummingbirdBitOutputBase.call(this, x, y, "servo", Language.getStr("Position_Servo"), 4, "angle", 0, 180, "Angle");

    this.addPart(new LabelText(this,'\xBA'));
}
B_BBPositionServo.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBPositionServo.prototype.constructor = B_BBPositionServo;

function B_BBRotationServo(x, y) {
    this.draggable = true;
    B_HummingbirdBitOutputBase.call(this, x, y, "servo", Language.getStr("Rotation_Servo"), 4, "percent", -100, 100, "Percent");

    this.addPart(new LabelText(this,"%"));
}
B_BBRotationServo.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBRotationServo.prototype.constructor = B_BBRotationServo;

function B_BBLed(x, y) {
    this.draggable = true;
    B_HummingbirdBitOutputBase.call(this, x, y, "led", Language.getStr("LED"), 3, "intensity", 0, 100, "Intensity");

    this.addPart(new LabelText(this,"%"));
}
B_BBLed.prototype = Object.create(B_HummingbirdBitOutputBase.prototype);
B_BBLed.prototype.constructor = B_BBLed;

function B_BBTriLed(x, y) {
    this.draggable = true;
    B_DeviceWithPortsTriLed.call(this, x, y, DeviceHummingbirdBit, 2);
}
B_BBTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_BBTriLed.prototype.constructor = B_BBTriLed;



function B_BBBuzzer(x, y){
  CommandBlock.call(this,x,y,DeviceHummingbirdBit.getDeviceTypeId());
  this.deviceClass = DeviceHummingbirdBit;
  this.displayName = Language.getStr("Play_Note");
  this.draggable = true;
  this.minNote = 0
  this.maxNote = 127
  this.minBeat = 0
  this.maxBeat = 16
  this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
  this.addPart(new LabelText(this,this.displayName));
  const noteSlot = new NumSlot(this,"Note_out", 60, true, true);
  noteSlot.addLimits(this.minNote, this.maxNote, "Note");
  this.addPart(noteSlot);
  this.addPart(new LabelText(this, Language.getStr("for")));
  const beatsSlot = new NumSlot(this,"Beats_out", 1, true, false);
  beatsSlot.addLimits(this.minBeat, this.maxBeat, "Beats");
  this.addPart(beatsSlot);
  this.addPart(new LabelText(this,Language.getStr("Beats")));
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
    //let mem = this.runMem;
    //let note = this.slots[1].getData().getValueInR(this.minNote, this.maxNote, true, true)
    //let beats = this.slots[2].getData().getValueInR(this.minBeat, this.maxBeat, true, false);
    //let soundDuration = CodeManager.beatsToMs(beats);

    const mem = this.runMem;
    const note = this.slots[1].getData().getValueInR(this.minNote, this.maxNote, true, true)
    const beats = this.slots[2].getData().getValueInR(this.minBeat, this.maxBeat, true, false);
    mem.soundDuration = CodeManager.beatsToMs(beats);
    let soundDuration = CodeManager.beatsToMs(beats);
    mem.timerStarted = false;

    mem.requestStatus = {};
    mem.requestStatus.finished = false;
    mem.requestStatus.error = false;
    mem.requestStatus.result = null;
    device.setBuzzer(mem.requestStatus, note, soundDuration);
    return new ExecutionStatusRunning();
};
/* Waits until the request completes */
//B_BBBuzzer.prototype.updateAction = B_DeviceWithPortsOutputBase.prototype.updateAction

B_BBBuzzer.prototype.updateAction = function() {
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
    this.draggable = true;
    this.numberOfPorts = 3;

  // Default option for sensor is Light.
  const dS = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Light"), "light"));
  //const dS = new DropSlot(this, "SDS_1", null, null, new SelectionData("", 0));
  dS.addOption(new SelectionData(Language.getStr("Distance"), "distance"));
  dS.addOption(new SelectionData(Language.getStr("Dial"), "dial"));
  dS.addOption(new SelectionData(Language.getStr("Light"), "light"));
  dS.addOption(new SelectionData(Language.getStr("Sound"), "sound"));
  dS.addOption(new SelectionData(Language.getStr("Other"), "other"));

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
    if (sensorSelection == "distance"){
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
        device.readSensor(mem.requestStatus, sensorSelection, port);
        return new ExecutionStatusRunning();
    } else {
        this.displayError("Invalid port number");
        return new ExecutionStatusError(); // Invalid port, exit early
    }
};
/* Returns the result of the request */
B_BBSensors.prototype.updateAction = B_DeviceWithPortsSensorBase.prototype.updateAction;

function B_BBMagnetometer(x, y){
    ReporterBlock.call(this,x,y,DeviceHummingbirdBit.getDeviceTypeId());
    this.deviceClass = DeviceHummingbirdBit;
    this.displayName = ""; //TODO: perhaps remove this
    this.draggable = true;
    this.numberOfPorts = 1;

    this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
    this.addPart(new LabelText(this,this.displayName));

    const pickBlock = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Accelerometer"), "accelerometer"));

    pickBlock.addOption(new SelectionData(Language.getStr("Magnetometer"), "magnetometer"));
    pickBlock.addOption(new SelectionData(Language.getStr("Accelerometer"), "accelerometer"));

    this.addPart(pickBlock);

    const pickAxis = new DropSlot(this, "SDS_2", null, null, new SelectionData("X", "x"));
    pickAxis.addOption(new SelectionData("X", "x"));
    pickAxis.addOption(new SelectionData("Y", "y"));
    pickAxis.addOption(new SelectionData("Z", "z"));
    this.addPart(pickAxis);

    //this.addPart(new PortSlot(this,"PortS_1", this.numberOfPorts));
}
B_BBMagnetometer.prototype = Object.create(ReporterBlock.prototype);
B_BBMagnetometer.prototype.constructor = B_BBMagnetometer;
/* Sends the request for the sensor data. */
B_BBMagnetometer.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
    let sensorSelection = this.slots[1].getData().getValue();
    if (sensorSelection == "accelerometer") {
        Block.setDisplaySuffix(B_BBMagnetometer, "m/s" + String.fromCharCode(178));
    } else {
        Block.setDisplaySuffix(B_BBMagnetometer, String.fromCharCode(956) + "T");
    }

    let axisSelection = this.slots[2].getData().getValue();
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
        return new ExecutionStatusError(); // Invalid port, exit early
    }
};


B_BBMagnetometer.prototype.updateAction = function(){
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

}

// micro:bit LED block that has been added to the HummingbirdBit menu

function B_BBLedArray(x,y){
    B_MicroBitLedArray.call(this, x, y, DeviceHummingbirdBit);
}
B_BBLedArray.prototype = Object.create(B_MicroBitLedArray.prototype);
B_BBLedArray.prototype.constructor = B_BBLedArray;



// Hummingbird print block





function B_BBPrint(x, y){
    CommandBlock.call(this, x, y, DeviceHummingbirdBit.getDeviceTypeId());
    this.deviceClass = DeviceHummingbirdBit;
    this.displayName = Language.getStr("Print");
    this.draggable = true;

    this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
    this.addPart(new LabelText(this,this.displayName));
    // StrS_1 refers to the first string slot.
    this.addPart(new StringSlot(this, "StrS_1", "HELLO"));

}

B_BBPrint.prototype = Object.create(CommandBlock.prototype);
B_BBPrint.prototype.constructor = B_BBPrint;

/* Sends the request */
B_BBPrint.prototype.startAction = function() {
    let deviceIndex = this.slots[0].getData().getValue();
    let device = this.deviceClass.getManager().getDevice(deviceIndex);
    if (device == null) {
        this.displayError(this.deviceClass.getNotConnectedMessage());
        return new ExecutionStatusError(); // Flutter was invalid, exit early
    }

    let mem = this.runMem;
    let printString = this.slots[1].getData().getValue().substring(0,18);
    mem.blockDuration = (printString.length * 600);
    mem.timerStarted = false;

    mem.requestStatus = {};
    mem.requestStatus.finished = false;
    mem.requestStatus.error = false;
    mem.requestStatus.result = null;
    device.readPrintBlock(mem.requestStatus, printString);

    return new ExecutionStatusRunning();
};

/* Waits until the request completes */
B_BBPrint.prototype.updateAction = function() {
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
    if (new Date().getTime() >= mem.startTime + mem.blockDuration) {
        return new ExecutionStatusDone(); // Done running
    } else {
        return new ExecutionStatusRunning(); // Still running
    }
};



// Here is the block for B_BBButton.

function B_BBButton(x, y){

    PredicateBlock.call(this, x, y, DeviceHummingbirdBit.getDeviceTypeId());
    this.deviceClass = DeviceHummingbirdBit;
    this.displayName = Language.getStr("Button");
    this.numberOfPorts = 1;
    this.draggable = true;
    this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
    this.addPart(new LabelText(this,this.displayName));


    const choice = new DropSlot(this, "SDS_1", null, null, new SelectionData("A", "buttonA"));
    choice.addOption(new SelectionData("A", "buttonA"));
    choice.addOption(new SelectionData("B", "buttonB"));
    this.addPart(choice);

};



B_BBButton.prototype = Object.create(PredicateBlock.prototype);
B_BBButton.prototype.constructor = B_BBButton;



B_BBButton.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
    let sensorSelection = this.slots[1].getData().getValue();
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




B_BBButton.prototype.updateAction = function() {


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

function B_BBOrientation(x, y){
    PredicateBlock.call(this, x, y, DeviceHummingbirdBit.getDeviceTypeId());
    this.deviceClass = DeviceHummingbirdBit;
    this.displayName = "";
    this.numberOfPorts = 1;
    this.draggable = true;
    this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
    this.addPart(new LabelText(this,this.displayName));

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


//B_MBOrientation.prototype = Object.create(ReporterBlock.prototype);
B_BBOrientation.prototype = Object.create(PredicateBlock.prototype);
B_BBOrientation.prototype.constructor = B_BBOrientation;




B_BBOrientation.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
    let sensorSelection = this.slots[1].getData().getValue();
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


B_BBOrientation.prototype.updateAction = function() {

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






// Block for the compass


function B_BBCompass(x, y){
    ReporterBlock.call(this,x,y,DeviceHummingbirdBit.getDeviceTypeId());
    this.deviceClass = DeviceHummingbirdBit;
    this.displayName = Language.getStr("Compass");
    this.numberOfPorts = 1;
    this.draggable = true;
    this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
    this.addPart(new LabelText(this,this.displayName));

}
B_BBCompass.prototype = Object.create(ReporterBlock.prototype);
B_BBCompass.prototype.constructor = B_BBCompass;

B_BBCompass.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
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
        device.readCompass(mem.requestStatus);
        return new ExecutionStatusRunning();
    } else {
        this.displayError("Invalid port number");
        return new ExecutionStatusError(); // Invalid port, exit early
    }
};



B_BBCompass.prototype.updateAction = function(){

    const status = this.runMem.requestStatus;
        if (status.finished) {
            if(status.error){
                this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
                return new ExecutionStatusError();
            } else {
                const result = new StringData(status.result);
                const num = Math.round(result.asNum().getValue());

                return new ExecutionStatusResult(new NumData(num));
            }
        }
        return new ExecutionStatusRunning(); // Still running

};


function B_BBCompassCalibrate(x, y){
    CalibrateBlock.call(this, x, y, DeviceHummingbirdBit.getDeviceTypeId());
    this.deviceClass = DeviceHummingbirdBit;
    this.displayName = Language.getStr("CompassCalibrate");
    this.draggable = false;
    this.numberOfPorts = 1;
    this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
    this.addPart(new LabelText(this,this.displayName));

}
B_BBCompassCalibrate.prototype = Object.create(CalibrateBlock.prototype);
B_BBCompassCalibrate.prototype.constructor = B_BBCompassCalibrate;


B_BBCompassCalibrate.prototype.startAction=function(){
    let deviceIndex = this.slots[0].getData().getValue();
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
        device.calibrateCompass(mem.requestStatus);
        return new ExecutionStatusRunning();
    } else {
        this.displayError("Invalid port number");
        return new ExecutionStatusError(); // Invalid port, exit early
    }
};



B_BBCompassCalibrate.prototype.updateAction = function(){
    const status = this.runMem.requestStatus;
    if (status.finished) {
        if(status.error){
            this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
            return new ExecutionStatusError();
        } else {
            return new ExecutionStatusDone();
        }
    }
    return new ExecutionStatusRunning(); // Still running

};
