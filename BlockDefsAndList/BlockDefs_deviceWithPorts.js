/**
 * Created by Tom on 6/14/2017.
 */
function B_DeviceWithPortsSensorBase(x, y, deviceClass, sensorType, displayName, numberOfPorts){
	ReporterBlock.call(this,x,y,deviceClass.getDeviceTypeId());
	this.deviceClass = deviceClass;
	this.sensorType = sensorType;
	this.displayName = displayName;
	this.numberOfPorts = numberOfPorts;
	this.addPart(new DeviceDropSlot(this,"DDS_1", deviceClass));
	this.addPart(new LabelText(this,displayName));
	this.addPart(new PortSlot(this,"PortS_1", numberOfPorts)); //Four sensor ports.
}
B_DeviceWithPortsSensorBase.prototype = Object.create(ReporterBlock.prototype);
B_DeviceWithPortsSensorBase.prototype.constructor = B_DeviceWithPortsSensorBase;
/* Generic Hummingbird input functions. */
B_DeviceWithPortsSensorBase.prototype.startAction=function(){
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
B_DeviceWithPortsSensorBase.prototype.updateAction=function(){
	var status = this.runMem.requestStatus;
	if (status.finished) {
		if(status.error){
			this.displayError(this.deviceClass.getNotConnectedMessage());
			return new ExecutionStatusError();
		} else {
			var result = new StringData(status.result);
			if(result.isNumber()){
				return new ExecutionStatusResult(result.asNum());
			}
			else{
				return new ExecutionStatusResult(new NumData(0, false));
			}
		}
	}
	return new ExecutionStatusRunning(); // Still running
};
Device.configureBlock(B_DeviceWithPortsSensorBase);

function B_DeviceWithPortsOutputBase(x, y, deviceClass, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal, displayUnits){
	CommandBlock.call(this,x,y,deviceClass.getDeviceTypeId());
	this.deviceClass = deviceClass;
	this.outputType = outputType;
	this.displayName = displayName;
	this.numberOfPorts = numberOfPorts;
	this.minVal = minVal;
	this.maxVal = maxVal;
	this.positive = minVal >= 0;
	this.valueKey = valueKey;
	this.displayUnits = displayUnits;
	this.addPart(new DeviceDropSlot(this,"DDS_1", deviceClass));
	this.addPart(new LabelText(this,displayName));
	this.addPart(new PortSlot(this,"PortS_1", numberOfPorts)); //Four sensor ports.
	const numSlot = new NumSlot(this,"NumS_out", 0, this.positive, true);
	numSlot.addLimits(this.minVal, this.maxVal, displayUnits);
	this.addPart(numSlot);
}
B_DeviceWithPortsOutputBase.prototype = Object.create(CommandBlock.prototype);
B_DeviceWithPortsOutputBase.prototype.constructor = B_DeviceWithPortsOutputBase;
B_DeviceWithPortsOutputBase.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	let port = this.slots[1].getData().getValue();
	let value = this.slots[2].getData().getValueInR(this.minVal, this.maxVal, this.positive, true); // [0,180]
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
B_DeviceWithPortsOutputBase.prototype.updateAction = function() {
	if(this.runMem.requestStatus.finished){
		if(this.runMem.requestStatus.error){
			this.displayError(this.deviceClass.getNotConnectedMessage());
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone();
	}
	else{
		return new ExecutionStatusRunning();
	}
};
Device.configureBlock(B_DeviceWithPortsOutputBase);



function B_DeviceWithPortsTriLed(x, y, deviceClass, numberOfPorts) {
	CommandBlock.call(this, x, y, deviceClass.getDeviceTypeId());
	this.deviceClass = deviceClass;
	this.numberOfPorts = numberOfPorts;
	this.addPart(new DeviceDropSlot(this,"DDS_1", deviceClass, true));
	this.addPart(new LabelText(this, "TRI-LED"));
	this.addPart(new PortSlot(this,"PortS_1", numberOfPorts)); //Positive integer.
	this.addPart(new LabelText(this, "R"));
	this.addPart(new NumSlot(this,"NumS_r", 0, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "G"));
	this.addPart(new NumSlot(this,"NumS_g", 0, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "B"));
	this.addPart(new NumSlot(this,"NumS_b", 0, true, true)); //Positive integer.
}
B_DeviceWithPortsTriLed.prototype = Object.create(CommandBlock.prototype);
B_DeviceWithPortsTriLed.prototype.constructor = B_DeviceWithPortsTriLed;
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
	if(this.runMem.requestStatus.finished){
		if(this.runMem.requestStatus.error){
			this.displayError(this.deviceClass.getNotConnectedMessage());
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone();
	}
	else{
		return new ExecutionStatusRunning();
	}
};
Device.configureBlock(B_DeviceWithPortsTriLed);
