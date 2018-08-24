"use strict";

/**
 * This static class provides functions for debugging.  It had contracts and a safeFunc higher order function which
 * wraps a function in a try/catch and shows an alert if there is an error.  When enabled is set to false, all these
 * features turn off, except error logging, which happens silently in the background
 */
function DebugOptions() {
	const DO = DebugOptions;
	DO.enabled = false;

	/* Whether errors should be checked for and sent to the backend.  This is the only option that persists if
	 * DO is not enabled */
	DO.logErrors = true;
	// Whether a dialog should be presented with the content of the error
	DO.notifyErrors = true;

	DO.mouse = true;
	// On launch, virtual devices can be added
	DO.addVirtualHB = false;
	DO.addVirtualFlutter = false;
	// When scanning, virtual devices can be added to the lists
	DO.allowVirtualDevices = false;
	DO.showVersion = false;
	DO.showDebugMenu = false;
	// When there's an error, should the entire UI freeze to ensure it isn't missed?
	DO.lockErrors = false;
	DO.errorLocked = false;
	DO.logHttp = true;
	DO.skipInitSettings = false;
	DO.allowLogging = true;
	DO.skipHtmlRequests = false;
	if (DO.enabled) {
		DO.applyConstants();
	}
}

/**
 * Runs before other classes setConstants functions.  Provides an opportunity to do some setup
 */
DebugOptions.applyConstants = function() {
	const DO = DebugOptions;
	if (!DO.enabled) return;
	// Currently nothing happens here.
};

/**
 * Runs after the UI is loaded
 */
DebugOptions.applyActions = function() {
	const DO = DebugOptions;
	if (!DO.enabled) return;
	if (DO.addVirtualHB) {
		let virHB = DO.createVirtualDevice(DeviceHummingbird, "");
		DeviceHummingbird.getManager().appendDevice(virHB);
	}
	if (DO.addVirtualFlutter) {
		let virHB = DO.createVirtualDevice(DeviceFlutter, "");
		DeviceFlutter.getManager().appendDevice(virHB);
	}
	if (DO.showVersion) {
		GuiElements.alert("Version: " + GuiElements.appVersion);
	}
	if (DO.showDebugMenu) {
		TitleBar.enableDebug();
	}
};

/**
 * Creates a virtual device with the specified type and id
 * @param deviceClass - Subclass of Device
 * @param {string} id - Used for name and id of device, with "Virtual" prepended to it
 * @return {Device}
 */
DebugOptions.createVirtualDevice = function(deviceClass, id) {
	const typeName = deviceClass.getDeviceTypeName(true);
	const name = "Virtual" + typeName + id;
	return new deviceClass(name, name);
};

/* These functions all check if a certain type of debugging should be enabled and are called from other classes. */
/** @return {boolean} */
DebugOptions.shouldLogErrors = function() {
	return DebugOptions.logErrors;   // This is the one setting that still works if DO is not enabled.
};
/** @return {boolean} */
DebugOptions.shouldNotifyErrors = function() {
	return DebugOptions.notifyErrors && DebugOptions.enabled;
};
/** @return {boolean} */
DebugOptions.shouldUseMouseMode = function() {
	return DebugOptions.mouse && DebugOptions.enabled;
};
/** @return {boolean} */
DebugOptions.shouldSkipInitSettings = function() {
	const DO = DebugOptions;
	return DO.enabled && DO.mouse && DO.skipInitSettings;
};
/** @return {boolean} */
DebugOptions.shouldSkipHtmlRequests = function() {
	const DO = DebugOptions;
	return DO.enabled && (DO.skipHtmlRequests || DO.mouse);
};
/** @return {boolean} */
DebugOptions.shouldUseJSDialogs = function() {
	const DO = DebugOptions;
	return DO.enabled && (DO.mouse);
};
/** @return {boolean} */
DebugOptions.shouldLogHttp = function() {
	const DO = DebugOptions;
	return DO.enabled && DO.logHttp;
};
/** @return {boolean} */
DebugOptions.shouldAllowVirtualDevices = function() {
	const DO = DebugOptions;
	return DO.allowVirtualDevices && DO.enabled;
};
/** @return {boolean} */
DebugOptions.shouldAllowLogging = function() {
	const DO = DebugOptions;
	return DO.allowLogging && DO.enabled;
};

/* These functions configure DO */
DebugOptions.enableVirtualDevices = function() {
	const DO = DebugOptions;
	DO.allowVirtualDevices = true;
};
DebugOptions.stopErrorLocking = function() {
	DebugOptions.lockErrors = false;
};
DebugOptions.enableLogging = function() {
	DebugOptions.allowLogging = true;
};

/**
 * This function takes in a function and returns a function wrapped in a try/catch that shows a dialog with a stack
 * trace on error.  If DO isn't enabled, it just returns the original function.
 * @param {function} func
 * @return {function}
 */
DebugOptions.safeFunc = function(func) {
	if (func == null) return null;
	if (DebugOptions.shouldLogErrors() || DebugOptions.shouldNotifyErrors()) {
		return function() {
			try {
				if (!DebugOptions.errorLocked || !DebugOptions.lockErrors) {
					func.apply(this, arguments);
				}
			} catch (err) {
				DebugOptions.errorLocked = true;
				const request = new HttpRequestBuilder("debug/log");
				const errorTrace = err.message + "\n" + err.stack;
				HtmlServer.sendRequestWithCallback(request.toString(), null, null, true, errorTrace);
				if (DebugOptions.shouldNotifyErrors()) {
					GuiElements.alert("ERROR: " + err.message);
					DialogManager.showAlertDialog("ERROR", errorTrace, "OK");
				}
			}
		}
	} else {
		return func;
	}
};

/* Contracts test a certain condition and throw an error if it isn't met */

/**
 * Verifies that all parameters are numbers that are finite and not NaN
 */
DebugOptions.validateNumbers = function() {
	if (!DebugOptions.shouldLogErrors()) return;
	for (let i = 0; i < arguments.length; i++) {
		if (isNaN(arguments[i]) || !isFinite(arguments[i])) {
			throw new UserException("Invalid Number");
		}
	}
};
/**
 * Verifies that all parameters are not null or undefined
 */
DebugOptions.validateNonNull = function() {
	if (!DebugOptions.shouldLogErrors()) return;
	for (let i = 0; i < arguments.length; i++) {
		if (arguments[i] == null) {
			throw new UserException("Null parameter");
		}
	}
};
/**
 * Verifies that all parameters are either numbers or null
 */
DebugOptions.validateOptionalNums = function() {
	if (!DebugOptions.shouldLogErrors()) return;
	for (let i = 0; i < arguments.length; i++) {
		if (arguments[i] != null && (isNaN(arguments[i]) || !isFinite(arguments[i]))) {
			throw new UserException("Invalid optional number");
		}
	}
};
/**
 * Verifies that the boolean is true
 * @param {boolean} bool
 */
DebugOptions.assert = function(bool) {
	if (!bool && DebugOptions.shouldLogErrors()) {
		throw new UserException("Assertion Failure");
	}
};
/**
 * Throws a custom message
 * @param {string} message
 */
DebugOptions.throw = function(message) {
	if (!DebugOptions.shouldLogErrors()) return;
	throw new UserException(message);
};
/**
 * Marks that a function is abstract and must be overrided before it is run. If run it throws an error.
 */
DebugOptions.markAbstract = function() {
	DebugOptions.throw("Abstract function may not be called");
};

/**
 * A class for custom exceptions
 * @param {string} message
 * @constructor
 */
function UserException(message) {
	this.message = message;
	this.name = 'UserException';
	this.stack = (new Error()).stack;   // Get the call stack
}