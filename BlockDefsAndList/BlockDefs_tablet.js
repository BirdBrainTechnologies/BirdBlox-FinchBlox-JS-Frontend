/* This file contains the implementations for Blocks in the tablet category. */
/* TODO: remove redundancy by making these blocks subclasses of a single Block */


/*
function B_ThrowError(x, y) {
	ReporterBlock.call(this, x, y, "tablet", Block.returnTypes.string);
	this.addPart(new LabelText(this, "Throw error!"));
}
B_ThrowError.prototype = Object.create(ReporterBlock.prototype);
B_ThrowError.prototype.constructor = B_ThrowError;
B_ThrowError.prototype.startAction = function() {
	DebugOptions.throw("Execution of B_ThrowError");
};
*/


function B_DeviceShaken(x, y) {
	PredicateBlock.call(this, x, y, "tablet");
	this.addPart(new LabelText(this, Language.getStr("Device_Shaken")));
}
B_DeviceShaken.prototype = Object.create(PredicateBlock.prototype);
B_DeviceShaken.prototype.constructor = B_DeviceShaken;
/* Make the request. */
B_DeviceShaken.prototype.startAction = function() {
	const mem = this.runMem;
	mem.request = "tablet/shake";
	mem.requestStatus = function() {};
	HtmlServer.sendRequest(mem.request, mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for the request to finish. */
B_DeviceShaken.prototype.updateAction = function() {
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
B_DeviceShaken.prototype.checkActive = function() {
	return TabletSensors.sensors.accelerometer;
};



function B_DeviceSSID(x, y) {
	ReporterBlock.call(this, x, y, "tablet", Block.returnTypes.string);
	this.addPart(new LabelText(this, Language.getStr("Device_SSID")));
}
B_DeviceSSID.prototype = Object.create(ReporterBlock.prototype);
B_DeviceSSID.prototype.constructor = B_DeviceSSID;
/* Make the request. */
B_DeviceSSID.prototype.startAction = function() {
	const mem = this.runMem;
	mem.request = "tablet/ssid";
	mem.requestStatus = function() {};
	HtmlServer.sendRequest(mem.request, mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for the request to finish. */
B_DeviceSSID.prototype.updateAction = function() {
	const mem = this.runMem;
	const status = mem.requestStatus;
	if (status.finished === true) {
		if (status.error === false) {
			return new ExecutionStatusResult(new StringData(status.result, true));
		} else {
			if (status.result.length > 0) {
				this.displayError(status.result);
				return new ExecutionStatusError();
			} else {
				return new ExecutionStatusResult(new StringData("", false)); //"" is default.
			}
		}
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};



function B_DevicePressure(x, y) {
	ReporterBlock.call(this, x, y, "tablet");
	this.addPart(new LabelText(this, Language.getStr("Device_Pressure")));
}
B_DevicePressure.prototype = Object.create(ReporterBlock.prototype);
B_DevicePressure.prototype.constructor = B_DevicePressure;
/* Make the request. */
B_DevicePressure.prototype.startAction = function() {
	const mem = this.runMem;
	mem.request = "tablet/pressure";
	mem.requestStatus = function() {};
	HtmlServer.sendRequest(mem.request, mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for the request to finish. */
B_DevicePressure.prototype.updateAction = function() {
	const mem = this.runMem;
	const status = mem.requestStatus;
	if (status.finished === true) {
		if (status.error === false) {
			const result = Number(status.result);
			const num = Math.round(result * 100) / 100;
			return new ExecutionStatusResult(new NumData(num, true));
		} else {
			if (status.result.length > 0) {
				this.displayError(status.result);
				return new ExecutionStatusError();
			} else {
				return new ExecutionStatusResult(new NumData(0, false)); //0 is default.
			}
		}
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};
B_DevicePressure.prototype.checkActive = function() {
	return TabletSensors.sensors.barometer;
};
Block.setDisplaySuffix(B_DevicePressure, "kPa");



function B_DeviceRelativeAltitude(x, y) {
	ReporterBlock.call(this, x, y, "tablet");
	this.addPart(new LabelText(this,  Language.getStr("Device_Relative_Altitude")));
}
B_DeviceRelativeAltitude.prototype = Object.create(ReporterBlock.prototype);
B_DeviceRelativeAltitude.prototype.constructor = B_DeviceRelativeAltitude;
/* Make the request. */
B_DeviceRelativeAltitude.prototype.startAction = function() {
	const mem = this.runMem;
	mem.request = "tablet/altitude";
	mem.requestStatus = function() {};
	HtmlServer.sendRequest(mem.request, mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for the request to finish. */
B_DeviceRelativeAltitude.prototype.updateAction = function() {
	const mem = this.runMem;
	const status = mem.requestStatus;
	if (status.finished === true) {
		if (status.error === false) {
			const result = Number(status.result);
			return new ExecutionStatusResult(new NumData(result, true));
		} else {
			if (status.result.length > 0) {
				this.displayError(status.result);
				return new ExecutionStatusError();
			} else {
				return new ExecutionStatusResult(new NumData(0, false)); //0 is default.
			}
		}
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};
B_DeviceRelativeAltitude.prototype.checkActive = function() {
	return TabletSensors.sensors.barometer;
};
Block.setDisplaySuffix(B_DeviceRelativeAltitude, "m");



function B_DeviceOrientation(x, y) {
	ReporterBlock.call(this, x, y, "tablet", Block.returnTypes.string);
	this.addPart(new LabelText(this, Language.getStr("Device_Orientation")));
}
B_DeviceOrientation.prototype = Object.create(ReporterBlock.prototype);
B_DeviceOrientation.prototype.constructor = B_DeviceOrientation;
/* Make the request. */
B_DeviceOrientation.prototype.startAction = function() {
	const mem = this.runMem;
	mem.request = "tablet/orientation";
	mem.requestStatus = function() {};
	HtmlServer.sendRequest(mem.request, mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for the request to finish. */
B_DeviceOrientation.prototype.updateAction = function() {
	const mem = this.runMem;
	const status = mem.requestStatus;
	if (status.finished === true) {
		if (status.error === false) {
			return new ExecutionStatusResult(new StringData(status.result, true));
		} else {
			if (status.result.length > 0) {
				this.displayError(status.result);
				return new ExecutionStatusError();
			} else {
				return new ExecutionStatusResult(new StringData("", false)); //"" is default.
			}
		}
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};
B_DeviceOrientation.prototype.checkActive = function() {
	return TabletSensors.sensors.accelerometer;
};



function B_DeviceAcceleration(x, y) {
	ReporterBlock.call(this, x, y, "tablet", Block.returnTypes.num);
	this.addPart(new LabelText(this,  Language.getStr("Device")));
	const dS = new DropSlot(this, "DS_axis", null, null, new SelectionData("X", 0));
	dS.addOption(new SelectionData("X", 0));
	dS.addOption(new SelectionData("Y", 1));
	dS.addOption(new SelectionData("Z", 2));
	dS.addOption(new SelectionData("Total", "total"));
	this.addPart(dS);
	this.addPart(new LabelText(this, Language.getStr("Acceleration")));
}
B_DeviceAcceleration.prototype = Object.create(ReporterBlock.prototype);
B_DeviceAcceleration.prototype.constructor = B_DeviceAcceleration;
/* Make the request. */
B_DeviceAcceleration.prototype.startAction = function() {
	const mem = this.runMem;
	mem.request = "tablet/acceleration";
	mem.requestStatus = function() {};
	mem.axis = this.slots[0].getData().getValue();
	HtmlServer.sendRequest(mem.request, mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for the request to finish. Then get the correct axis. */
B_DeviceAcceleration.prototype.updateAction = function() {
	const mem = this.runMem;
	const status = mem.requestStatus;
	if (status.finished === true) {
		if (status.error === false) {
			const parts = status.result.split(" ");
			let result;
			if (mem.axis === "total") {
				let x = Number(parts[0]);
				let y = Number(parts[1]);
				let z = Number(parts[2]);
				result = Math.round(Math.sqrt(x * x + y * y + z * z) * 100)/100;
			} else {
				result = Math.round(Number(parts[mem.axis]) * 100) / 100;
			}
			return new ExecutionStatusResult(new NumData(result, true));
		} else {
			if (status.result.length > 0) {
				this.displayError(status.result);
				return new ExecutionStatusError();
			} else {
				return new ExecutionStatusResult(new NumData(0, false)); //0 is default.
			}
		}
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};
B_DeviceAcceleration.prototype.checkActive = function() {
	return TabletSensors.sensors.accelerometer;
};
Block.setDisplaySuffix(B_DeviceAcceleration, "m/s" + String.fromCharCode(178));



function B_DeviceLocation(x, y) {
	ReporterBlock.call(this, x, y, "tablet", Block.returnTypes.num);
	this.addPart(new LabelText(this, Language.getStr("Device")));
	const dS = new DropSlot(this, "DS_dir", null, null, new SelectionData(Language.getStr("Latitude"), 0));
	dS.addOption(new SelectionData(Language.getStr("Latitude"), 0));
	dS.addOption(new SelectionData(Language.getStr("Longitude"), 1));
	this.addPart(dS);
}
B_DeviceLocation.prototype = Object.create(ReporterBlock.prototype);
B_DeviceLocation.prototype.constructor = B_DeviceLocation;
/* Make the request. */
B_DeviceLocation.prototype.startAction = function() {
	const mem = this.runMem;
	mem.request = "tablet/location";
	mem.requestStatus = function() {};
	mem.axis = this.slots[0].getData().getValue();
	HtmlServer.sendRequest(mem.request, mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for the request to finish. Then get the correct axis. */
B_DeviceLocation.prototype.updateAction = function() {
	const mem = this.runMem;
	const status = mem.requestStatus;
	if (status.finished === true) {
		if (status.error === false) {
			const result = new StringData( status.result.split(" ")[mem.axis] );
			const num = Math.round(result.asNum().getValue() * 100) / 100;
			return new ExecutionStatusResult(new NumData(num, true));
		} else {
			if (status.result.length > 0) {
				this.displayError(status.result);
				return new ExecutionStatusError();
			} else {
				return new ExecutionStatusResult(new NumData(0, false)); //0 is default.
			}
		}
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};
B_DeviceLocation.prototype.checkActive = function() {
	return TabletSensors.sensors.gps;
};
