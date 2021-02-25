/**
 * Generic class for Finch Command Blocks
 */
function B_FinchCommand(x, y, type) {
	this.deviceClass = DeviceFinch;
	CommandBlock.call(this, x, y, this.deviceClass.getDeviceTypeId());
	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
}
B_FinchCommand.prototype = Object.create(CommandBlock.prototype);
B_FinchCommand.prototype.constructor = B_FinchCommand;
B_FinchCommand.prototype.setupAction = function() {
	let mem = this.runMem;
	mem.requestStatus = {};
	mem.requestStatus.finished = false;
	mem.requestStatus.error = false;
	mem.requestStatus.result = null;

	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
	}
	return device;
};
B_FinchCommand.prototype.updateAction = function() {
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


function B_FinchSetMotorsAndWait(x, y) {
	B_FinchCommand.call(this, x, y);
}
B_FinchSetMotorsAndWait.prototype = Object.create(B_FinchCommand.prototype);
B_FinchSetMotorsAndWait.prototype.constructor = B_FinchSetMotorsAndWait;
B_FinchSetMotorsAndWait.prototype.sendCheckMoving = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	device.readSensor(this.runMem.requestStatus, "isMoving");
	return new ExecutionStatusRunning();
};
B_FinchSetMotorsAndWait.prototype.checkMoving = function() {
	const isMoving = (this.runMem.requestStatus.result === "1");
	const moveStartTimedOut = (new Date().getTime() > this.moveSentTime + 500);
	if ((this.wasMoving || moveStartTimedOut) && !isMoving) {
		return new ExecutionStatusDone();
	}
	this.wasMoving = isMoving;

	return this.sendCheckMoving();
}
B_FinchSetMotorsAndWait.prototype.updateAction = function() {
	let status = this.runMem.requestStatus;
	if(status.finished){
		if(status.error){
			this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
			return new ExecutionStatusError();
		} else if (!this.moveSent) {
			if (this.moveTicks <= 0) { //ticks=0 is command for continuous motion.
				//return new ExecutionStatusDone();
				// Make this a stop command in case the finch was already moving.
				this.moveTicks = 0;
				this.moveSpeedL = 0;
				this.moveSpeedR = 0;
			}
			this.wasMoving = (status.result === "1");
			this.moveSentTime = new Date().getTime();
			let device = this.setupAction();
			if (device == null) {
				return new ExecutionStatusError(); // Device was invalid, exit early
			}
			device.setMotors(this.runMem.requestStatus, this.moveSpeedL, this.moveTicks, this.moveSpeedR, this.moveTicks);
			this.moveSent = true;
			return new ExecutionStatusRunning();
		} else if (!this.moveSendFinished) {
			if (this.moveTicks == 0) {
				return new ExecutionStatusDone();
			}
			this.moveSendFinished = true;
			return this.sendCheckMoving();
		} else {
			return this.checkMoving();
		}
	} else {
		return new ExecutionStatusRunning();
	}
};

/**
 * Finch Move block
 */
function B_FinchMove(x, y) {
	B_FinchSetMotorsAndWait.call(this, x, y);

	const ds = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Forward"), "forward"));
	ds.addOption(new SelectionData(Language.getStr("Forward"), "forward"));
	ds.addOption(new SelectionData(Language.getStr("Backward"), "backward"));
	this.addPart(ds);

	const distSlot = new NumSlot(this, "Num_dist", 10, true, true);
	distSlot.addLimits(0, 10000);
	this.addPart(distSlot);

	const speedSlot = new NumSlot(this, "Num_speed", 50, true, true);
	speedSlot.addLimits(0, 100);
	this.addPart(speedSlot);

	this.parseTranslation(Language.getStr("block_finch_move"));
}
B_FinchMove.prototype = Object.create(B_FinchSetMotorsAndWait.prototype);
B_FinchMove.prototype.constructor = B_FinchMove;
B_FinchMove.prototype.startAction = function() {

	const direction = this.slots[1].getData().getValue();
	this.moveTicks = Math.round(this.slots[2].getData().getValue() * DeviceFinch.ticksPerCM);
	let speed = this.slots[3].getData().getValue();

	if (direction == "backward") { speed = -speed; }
	this.moveSpeedL = speed;
	this.moveSpeedR = speed;

	this.moveSent = false;
	this.moveSendFinished = false;
	this.wasMoving = false;
	return this.sendCheckMoving();
};


/**
 * Finch Turn Block
 */
function B_FinchTurn(x, y) {
	B_FinchSetMotorsAndWait.call(this, x, y);

	const ds = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Right"), "right"));
	ds.addOption(new SelectionData(Language.getStr("Right"), "right"));
	ds.addOption(new SelectionData(Language.getStr("Left"), "left"));
	this.addPart(ds);

	const angleSlot = new NumSlot(this, "Num_dist", 90, true, true);
	angleSlot.addLimits(0, 360000);
	this.addPart(angleSlot);

	const speedSlot = new NumSlot(this, "Num_speed", 50, true, true);
	speedSlot.addLimits(0, 100);
	this.addPart(speedSlot);

	this.parseTranslation(Language.getStr("block_finch_turn"));
}
B_FinchTurn.prototype = Object.create(B_FinchSetMotorsAndWait.prototype);
B_FinchTurn.prototype.constructor = B_FinchTurn;
B_FinchTurn.prototype.startAction = function() {

	const direction = this.slots[1].getData().getValue();
	const angle = this.slots[2].getData().getValue();
	const speed = this.slots[3].getData().getValue();
	this.moveTicks = Math.round(angle * DeviceFinch.ticksPerDegree);

	if (direction == "right") {
		this.moveSpeedL = speed;
		this.moveSpeedR = -speed;
	} else { // direction == "left"
		this.moveSpeedL = -speed;
		this.moveSpeedR = speed;
	}

	this.moveSent = false;
	this.moveSendFinished = false;
	this.wasMoving = false;
	return this.sendCheckMoving();
};

function B_FinchMotors(x, y) {
	B_FinchCommand.call(this, x, y);

	const leftSlot = new NumSlot(this, "Num_speed_l", 0, false, true);
	leftSlot.addLimits(-100, 100);
	this.addPart(leftSlot);

	const rightSlot = new NumSlot(this, "Num_speed_r", 0, false, true);
	rightSlot.addLimits(-100, 100);
	this.addPart(rightSlot);

	this.parseTranslation(Language.getStr("block_finch_motors"));
};
B_FinchMotors.prototype = Object.create(B_FinchCommand.prototype);
B_FinchMotors.prototype.constructor = B_FinchMotors;
B_FinchMotors.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	let leftSpeed = this.slots[1].getData().getValue();
	let rightSpeed = this.slots[2].getData().getValue();

	device.setMotors(this.runMem.requestStatus, leftSpeed, 0, rightSpeed, 0);
	return new ExecutionStatusRunning();
};

function B_FinchStop(x, y) {
		B_FinchCommand.call(this, x, y);
		this.addPart(new LabelText(this, Language.getStr("Stop")));
};
B_FinchStop.prototype = Object.create(B_FinchCommand.prototype);
B_FinchStop.prototype.constructor = B_FinchStop;
B_FinchStop.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	device.setMotors(this.runMem.requestStatus, 0, 0, 0, 0);
	return new ExecutionStatusRunning();
};

function B_FinchBeak(x, y) {
	B_FinchCommand.call(this, x, y);

	const ledSlot1 = new NumSlot(this,"NumS_r", 0, true, true); //Positive integer.
	ledSlot1.addLimits(0, 100, Language.getStr("Intensity"));
	this.addPart(ledSlot1);
	const ledSlot2 = new NumSlot(this,"NumS_g", 0, true, true); //Positive integer.
	ledSlot2.addLimits(0, 100, Language.getStr("Intensity"));
	this.addPart(ledSlot2);
	const ledSlot3 = new NumSlot(this,"NumS_b", 0, true, true); //Positive integer.
	ledSlot3.addLimits(0, 100, Language.getStr("Intensity"));
	this.addPart(ledSlot3);

	this.parseTranslation(Language.getStr("block_finch_beak"));
};
B_FinchBeak.prototype = Object.create(B_FinchCommand.prototype);
B_FinchBeak.prototype.constructor = B_FinchBeak;
B_FinchBeak.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	let red = this.slots[1].getData().getValueInR(0, 100, true, true);
	let green = this.slots[2].getData().getValueInR(0, 100, true, true);
	let blue = this.slots[3].getData().getValueInR(0, 100, true, true);

	device.setBeak(this.runMem.requestStatus, red, green, blue);
	return new ExecutionStatusRunning();
};


function B_FinchTail(x, y) {
	B_FinchCommand.call(this, x, y);

	const ds = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("all"), "all"));
	ds.addOption(new SelectionData("1", "1"));
	ds.addOption(new SelectionData("2", "2"));
	ds.addOption(new SelectionData("3", "3"));
	ds.addOption(new SelectionData("4", "4"));
	ds.addOption(new SelectionData(Language.getStr("all"), "all"));
	this.addPart(ds);

	const ledSlot1 = new NumSlot(this,"NumS_r", 0, true, true); //Positive integer.
	ledSlot1.addLimits(0, 100, Language.getStr("Intensity"));
	this.addPart(ledSlot1);
	const ledSlot2 = new NumSlot(this,"NumS_g", 0, true, true); //Positive integer.
	ledSlot2.addLimits(0, 100, Language.getStr("Intensity"));
	this.addPart(ledSlot2);
	const ledSlot3 = new NumSlot(this,"NumS_b", 0, true, true); //Positive integer.
	ledSlot3.addLimits(0, 100, Language.getStr("Intensity"));
	this.addPart(ledSlot3);

	this.parseTranslation(Language.getStr("block_finch_tail"));
};
B_FinchTail.prototype = Object.create(B_FinchCommand.prototype);
B_FinchTail.prototype.constructor = B_FinchTail;
B_FinchTail.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	let position = this.slots[1].getData().getValue();
	let red = this.slots[2].getData().getValueInR(0, 100, true, true);
	let green = this.slots[3].getData().getValueInR(0, 100, true, true);
	let blue = this.slots[4].getData().getValueInR(0, 100, true, true);

	device.setTail(this.runMem.requestStatus, position, red, green, blue);
	return new ExecutionStatusRunning();
};

function B_FNLedArray(x,y){
  B_MicroBitLedArray.call(this, x, y, DeviceFinch);
}
B_FNLedArray.prototype = Object.create(B_MicroBitLedArray.prototype);
B_FNLedArray.prototype.constructor = B_FNLedArray;

function B_FNPrint(x, y){
  B_MicroBitPrint.call(this, x, y, DeviceFinch);
}
B_FNPrint.prototype = Object.create(B_MicroBitPrint.prototype);
B_FNPrint.prototype.constructor = B_FNPrint;

function B_FNBuzzer(x, y){
  B_DeviceWithPortsBuzzer.call(this, x, y, DeviceFinch);
}
B_FNBuzzer.prototype = Object.create(B_DeviceWithPortsBuzzer.prototype);
B_FNBuzzer.prototype.constructor = B_FNBuzzer;

function B_FinchResetEncoders(x, y) {
	B_FinchCommand.call(this, x, y);
	this.addPart(new LabelText(this, Language.getStr("block_finch_reset_encoders")));
};
B_FinchResetEncoders.prototype = Object.create(B_FinchCommand.prototype);
B_FinchResetEncoders.prototype.constructor = B_FinchResetEncoders;
B_FinchResetEncoders.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	this.runMem.timerStarted = false;
	device.resetEncoders(this.runMem.requestStatus);
	return new ExecutionStatusRunning();
}
B_FinchResetEncoders.prototype.updateAction = function() {
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
	//This block runs for a short time to allow the finch to have a chance to reset.
  if (new Date().getTime() >= mem.startTime + 500) {
      return new ExecutionStatusDone(); // Done running
  } else {
      return new ExecutionStatusRunning(); // Still running
  }
}

/**
 * The base for all finch specific sensor blocks
 */
function B_FinchSensorBase(x, y) {
	this.deviceClass = DeviceFinch;
	ReporterBlock.call(this,x,y,this.deviceClass.getDeviceTypeId());
	this.addPart(new DeviceDropSlot(this,"DDS_1", this.deviceClass));
	this.offset = 0 //subtract this much from the raw value before scaling
	this.scalingFactor = 1 //multiply result by this value
	this.displayDecimalPlaces = 0 //display this many digits after the decimal
	this.invert = false //invert the final value (return 100 - value)
	this.capResult = false //Keep result in range of 0 to 100
}
B_FinchSensorBase.prototype = Object.create(ReporterBlock.prototype);
B_FinchSensorBase.prototype.constructor = B_FinchSensorBase;
B_FinchSensorBase.prototype.setupAction = function() {
	let mem = this.runMem;
	mem.requestStatus = {};
	mem.requestStatus.finished = false;
	mem.requestStatus.error = false;
	mem.requestStatus.result = null;

	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
	}
	return device;
};
B_FinchSensorBase.prototype.updateAction = function(){
	const status = this.runMem.requestStatus;
	if (status.finished) {
		if(status.error){
			this.displayError(this.deviceClass.getNotConnectedMessage(status.code, status.result));
			return new ExecutionStatusError();
		} else {
			const result = new StringData(status.result);
			const num = ((result.asNum().getValue()) - this.offset) * this.scalingFactor;
			const fact = Math.pow(10, this.displayDecimalPlaces)
			var rounded = Math.round(num * fact) / fact;
			if (this.invert) { rounded = 100 - rounded; }
			if (this.capResult) { rounded = Math.min(100, Math.max(0, rounded)) }
			return new ExecutionStatusResult(new NumData(rounded));
		}
	}
	return new ExecutionStatusRunning(); // Still running
};

function B_FinchEncoder(x, y) {
	B_FinchSensorBase.call(this, x, y);

	this.displayDecimalPlaces = 2;
	//792 ticks per rotation
	this.scalingFactor = 1/792;

	const ds = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Right"), "right"));
	ds.addOption(new SelectionData(Language.getStr("Right"), "right"));
	ds.addOption(new SelectionData(Language.getStr("Left"), "left"));
	this.addPart(ds);

	this.parseTranslation(Language.getStr("block_encoder"));
};
B_FinchEncoder.prototype = Object.create(B_FinchSensorBase.prototype);
B_FinchEncoder.prototype.constructor = B_FinchEncoder;
B_FinchEncoder.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	let encoder = this.slots[1].getData().getValue();

	device.readSensor(this.runMem.requestStatus, "encoder", encoder);
	return new ExecutionStatusRunning();
}
Block.setDisplaySuffix(B_FinchEncoder, "rotations");

function B_FinchDistance(x, y) {
	B_FinchSensorBase.call(this, x, y);
	this.scalingFactor = DeviceFinch.cmPerDistance;

	this.addPart(new LabelText(this, Language.getStr("Distance")));
};
B_FinchDistance.prototype = Object.create(B_FinchSensorBase.prototype);
B_FinchDistance.prototype.constructor = B_FinchDistance;
B_FinchDistance.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}
	if (device.hasV2Microbit) {
		//V2 distance values are reported in cm.
		this.scalingFactor = 1;
	} else {
		this.scalingFactor = DeviceFinch.cmPerDistance;
	}

	device.readSensor(this.runMem.requestStatus, "distance");
	return new ExecutionStatusRunning();
}
Block.setDisplaySuffix(B_FinchDistance, "cm");

function B_FinchLight(x, y) {
	B_FinchSensorBase.call(this, x, y);
	this.capResult = true;

	const ds = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Right"), "right"));
	ds.addOption(new SelectionData(Language.getStr("Right"), "right"));
	ds.addOption(new SelectionData(Language.getStr("Left"), "left"));
	this.addPart(ds);

	this.addPart(new LabelText(this, Language.getStr("Light")));
};
B_FinchLight.prototype = Object.create(B_FinchSensorBase.prototype);
B_FinchLight.prototype.constructor = B_FinchLight;
B_FinchLight.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	let position = this.slots[1].getData().getValue();

	device.readSensor(this.runMem.requestStatus, "light", position);
	return new ExecutionStatusRunning();
}

function B_FinchLine(x, y) {
	B_FinchSensorBase.call(this, x, y);
	this.offset = 6;
	this.scalingFactor = 100/121;
	this.invert = true;
	this.capResult = true;

	const ds = new DropSlot(this, "SDS_1", null, null, new SelectionData(Language.getStr("Right"), "right"));
	ds.addOption(new SelectionData(Language.getStr("Right"), "right"));
	ds.addOption(new SelectionData(Language.getStr("Left"), "left"));
	this.addPart(ds);

	this.addPart(new LabelText(this, Language.getStr("Line")));
};
B_FinchLine.prototype = Object.create(B_FinchSensorBase.prototype);
B_FinchLine.prototype.constructor = B_FinchLine;
B_FinchLine.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	let position = this.slots[1].getData().getValue();

	device.readSensor(this.runMem.requestStatus, "line", position);
	return new ExecutionStatusRunning();
}

function B_FinchBattery(x, y) {
	B_FinchSensorBase.call(this, x, y);
	this.displayDecimalPlaces = 2;

	this.addPart(new LabelText(this, Language.getStr("Battery")));
};
B_FinchBattery.prototype = Object.create(B_FinchSensorBase.prototype);
B_FinchBattery.prototype.constructor = B_FinchBattery;
B_FinchBattery.prototype.startAction = function() {
	let device = this.setupAction();
	if (device == null) {
		return new ExecutionStatusError(); // Device was invalid, exit early
	}

	device.readSensor(this.runMem.requestStatus, "battery");
	return new ExecutionStatusRunning();
}
Block.setDisplaySuffix(B_FinchBattery, "V");

function B_FNMagnetometer(x, y){
  B_MicroBitMagnetometer.call(this, x, y, DeviceFinch);
}
B_FNMagnetometer.prototype = Object.create(B_MicroBitMagnetometer.prototype);
B_FNMagnetometer.prototype.constructor = B_FNMagnetometer;

function B_FNButton(x, y){
  B_MicroBitButton.call(this, x, y, DeviceFinch);
};
B_FNButton.prototype = Object.create(B_MicroBitButton.prototype);
B_FNButton.prototype.constructor = B_FNButton;

function B_FNCompass(x, y){
  B_MicroBitCompass.call(this, x, y, DeviceFinch);
}
B_FNCompass.prototype = Object.create(B_MicroBitCompass.prototype);
B_FNCompass.prototype.constructor = B_FNCompass;

function B_FNV2Sensor(x, y){
  B_MicroBitV2Sensor.call(this, x, y, DeviceFinch);
}
B_FNV2Sensor.prototype = Object.create(B_MicroBitV2Sensor.prototype);
B_FNV2Sensor.prototype.constructor = B_FNV2Sensor;

function B_FNOrientation(x, y){
  B_MicroBitOrientation.call(this, x, y, DeviceFinch);
};
B_FNOrientation.prototype = Object.create(B_MicroBitOrientation.prototype);
B_FNOrientation.prototype.constructor = B_FNOrientation;
