"use strict";

function Flutter(name) {
	this.name = name;
}

// TODO: Move this function somewhere else?
Flutter.prototype.promptRename = function(callbackFn) {
	let inst = this;
	HtmlServer.showDialog("Rename", "Enter new name", this.name, function(cancelled, result) {
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
	let request = "flutter/disconnect?name=" + HtmlServer.encodeHtml(this.name);
	HtmlServer.sendRequestWithCallback(request, successFn, successFn);
};


/**
 * Connects to the flutter device
 *
 * @param      {function}  successFn  The success function
 */
Flutter.prototype.connect = function(successFn) {
	let request = "flutter/connect?name=" + HtmlServer.encodeHtml(this.name);
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
		let request = "flutter/in?name=" + HtmlServer.encodeHtml(this.name) + "&port=" + port;
		context.requestStatus = {};
		HtmlServer.sendRequest(request, context.requestStatus);
		context.sent = true;
		return true;  // Still running
	}
};

Flutter.prototype.setServoOrSave = function(shouldSend, block, port, value) {
	var mem = block.runMem;
	if (mem.sent) {
		if(mem.requestStatus.finished){
			if(mem.requestStatus.error){
				block.throwError("Flutter not connected");
			}
			return false;
		}
		else{
			return true;
		}
	} else {
		if (mem.request == null) {
			// TODO: Validation
			let requestPrefix = "flutter/out/servo?name=" + HtmlServer.encodeHtml(this.name);
			mem.request = requestPrefix + "&port=" + port + "&angle=" + value;
			mem.requestStatus = {};
		}
		if (shouldSend) {
			mem.sent = true;
			HtmlServer.sendRequest(mem.request, mem.requestStatus);
			return true;  // Still running
		} else {
			mem.sent = false;
			return true;  // Still running
		}
	}
};

Flutter.prototype.setBuzzerOrSave = function(shouldSend, block, volume, frequency) {
	var mem = block.runMem;
	if (mem.sent) {
		if(mem.requestStatus.finished){
			if(mem.requestStatus.error){
				block.throwError("Flutter not connected");
			}
			return false;
		}
		else{
			return true;
		}
	} else {
		if (mem.request == null) {
			// TODO: Validation
			let requestPrefix = "flutter/out/buzzer?name=" + HtmlServer.encodeHtml(this.name);
			mem.request = requestPrefix + "&volume=" + volume + "&frequency=" + frequency;
			mem.requestStatus = {};
		}
		if (shouldSend) {
			mem.sent = true;
			HtmlServer.sendRequest(mem.request, mem.requestStatus);
			return true;  // Still running
		} else {
			mem.sent = false;
			return true;  // Still running
		}
	}
};


Flutter.prototype.setTriLEDOrSave = function(shouldSend, block, port, valueR, valueG, valueB) {
	var mem = block.runMem;
	if (mem.sent) {
		if(mem.requestStatus.finished){
			if(mem.requestStatus.error){
				block.throwError("Flutter not connected");
			}
			return false;
		}
		else{
			return true;
		}
	} else {
		if (mem.request == null) {
			// TODO: Validation
			let requestPrefix = "flutter/out/triled?name=" + HtmlServer.encodeHtml(this.name);
			mem.request = requestPrefix + "&port=" + port + "&red=" + valueR + "&green=" + valueG + "&blue=" + valueB;
			mem.requestStatus = {};
		}
		if (shouldSend) {
			mem.sent = true;
			HtmlServer.sendRequest(mem.request, mem.requestStatus);
			return true;  // Still running
		} else {
			mem.sent = false;
			return true;  // Still running
		}
	}
};