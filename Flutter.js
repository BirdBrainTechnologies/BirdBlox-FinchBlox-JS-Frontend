"use strict";

function Flutter(name, id) {
	this.name = name;
	this.id = id;
}

// TODO: Move this function somewhere else?
Flutter.prototype.promptRename = function(callbackFn) {
	let inst = this;
	DialogManager.showPromptDialog("Rename", "Enter new name", this.name, true, function(cancelled, result) {
		if (!cancelled) {
			result = result.trim();
			if (result.length > 30) {
				result = result.substring(0, 30);
			}
			result = result.trim();
			if (result.length > 0) {
				inst.rename(result, callbackFn);
			}
		}
	});
};

/**
 * Disconnects from a flutter
 *
 * @param      {Function}  successFn  The success function
 */
Flutter.prototype.disconnect = function(successFn) {
	let request = "flutter/disconnect?id=" + HtmlServer.encodeHtml(this.id);
	HtmlServer.sendRequestWithCallback(request, successFn, successFn);
};


/**
 * Connects to the flutter device
 *
 * @param      {function}  successFn  The success function
 */
Flutter.prototype.connect = function(successFn) {
	let request = "flutter/connect?id=" + HtmlServer.encodeHtml(this.id);
	HtmlServer.sendRequestWithCallback(request, successFn, successFn);
};

/**
 * Gets the name of this flutter
 *
 * @return     {String}  Name of the flutter device
 */
Flutter.prototype.getName = function() {
	return this.name;
};

Flutter.prototype.readSensor = function(context, sensorType, port) {
	if (context.sent) {
		return (context.requestStatus.finished != true);  // Return true if not finished
	} else {
		let request = "flutter/in?id=" + HtmlServer.encodeHtml(this.id) + "&port=" + port + "&sensor=" + sensorType;
		context.requestStatus = {};
		HtmlServer.sendRequest(request, context.requestStatus);
		context.sent = true;
		return new ExecutionStatusRunning();  // Still running
	}
};

Flutter.prototype.setServoOrSave = function(shouldSend, block, port, value) {
	var mem = block.runMem;
	if (mem.sent) {
		if(mem.requestStatus.finished){
			if(mem.requestStatus.error){
				block.displayError("Flutter not connected");
				return new ExecutionStatusError();
			}
			return new ExecutionStatusDone();
		}
		else{
			return new ExecutionStatusRunning();
		}
	} else {
		if (mem.request == null) {
			// TODO: Validation
			let requestPrefix = "flutter/out/servo?id=" + HtmlServer.encodeHtml(this.id);
			mem.request = requestPrefix + "&port=" + port + "&angle=" + value;
			mem.requestStatus = {};
		}
		if (shouldSend) {
			mem.sent = true;
			HtmlServer.sendRequest(mem.request, mem.requestStatus, 30);
			return new ExecutionStatusRunning();  // Still running
		} else {
			mem.sent = false;
			return new ExecutionStatusRunning();  // Still running
		}
	}
};

Flutter.prototype.setBuzzerOrSave = function(shouldSend, block, volume, frequency) {
	var mem = block.runMem;
	if (mem.sent) {
		if(mem.requestStatus.finished){
			if(mem.requestStatus.error){
				block.displayError("Flutter not connected");
				return new ExecutionStatusError();
			}
			return new ExecutionStatusDone();
		}
		else{
			return new ExecutionStatusRunning();
		}
	} else {
		if (mem.request == null) {
			// TODO: Validation
			let requestPrefix = "flutter/out/buzzer?id=" + HtmlServer.encodeHtml(this.id);
			mem.request = requestPrefix + "&volume=" + volume + "&frequency=" + frequency;
			mem.requestStatus = {};
		}
		if (shouldSend) {
			mem.sent = true;
			HtmlServer.sendRequest(mem.request, mem.requestStatus);
			return new ExecutionStatusRunning();  // Still running
		} else {
			mem.sent = false;
			return new ExecutionStatusRunning();  // Still running
		}
	}
};


Flutter.prototype.setTriLEDOrSave = function(shouldSend, block, port, valueR, valueG, valueB) {
	var mem = block.runMem;
	if (mem.sent) {
		if(mem.requestStatus.finished){
			if(mem.requestStatus.error){
				block.displayError("Flutter not connected");
				return new ExecutionStatusError();
			}
			return new ExecutionStatusDone();
		}
		else{
			return new ExecutionStatusRunning();
		}
	} else {
		if (mem.request == null) {
			// TODO: Validation
			let requestPrefix = "flutter/out/triled?id=" + HtmlServer.encodeHtml(this.id);
			mem.request = requestPrefix + "&port=" + port + "&red=" + valueR + "&green=" + valueG + "&blue=" + valueB;
			mem.requestStatus = {};
		}
		if (shouldSend) {
			mem.sent = true;
			HtmlServer.sendRequest(mem.request, mem.requestStatus);
			return new ExecutionStatusRunning();  // Still running
		} else {
			mem.sent = false;
			return new ExecutionStatusRunning();  // Still running
		}
	}
};