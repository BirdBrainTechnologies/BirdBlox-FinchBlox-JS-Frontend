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
 * Renames the Flutter
 *
 * @param      {String}  newName    The new name
 * @param      {String}  successFn  The success function
 */
Flutter.prototype.rename = function(newName, successFn) {
	let oldNameEncoded = HtmlServer.encodeHtml(this.name);
	let newNameEncoded = HtmlServer.encodeHtml(newName);
	let request = "flutter/" + oldNameEncoded + "/rename/" + newNameEncoded;
	HtmlServer.sendRequestWithCallback(request, successFn, successFn);
	this.name = newName;
};

/**
 * Disconnects from a flutter
 *
 * @param      {Function}  successFn  The success function
 */
Flutter.prototype.disconnect = function(successFn) {
	let request = "flutter/" + HtmlServer.encodeHtml(this.name) + "/disconnect";
	HtmlServer.sendRequestWithCallback(request, successFn, successFn);
};


/**
 * Connects to the flutter device
 *
 * @param      {function}  successFn  The success function
 */
Flutter.prototype.connect = function(successFn) {
	let request = "flutter/" + HtmlServer.encodeHtml(this.name) + "/connect";
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
		let request = "flutter/" + HtmlServer.encodeHtml(this.name) + "/in/" + sensorType + "/" + port;
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
			let requestPrefix = "flutter/" + HtmlServer.encodeHtml(this.name) + "/out/servo/";
			mem.request = requestPrefix + port + "/" + value;
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
			let requestPrefix = "flutter/" + HtmlServer.encodeHtml(this.name) + "/out/buzzer/";
			mem.request = requestPrefix + volume + "/" + frequency;
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
			let requestPrefix = "flutter/" + HtmlServer.encodeHtml(this.name) + "/out/triled/";
			mem.request = requestPrefix + port + "/" + valueR + "/" + valueG + "/" + valueB;
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