/**
 * A menu which is only enabled when testing (as determined by DebugOptions) which provides options for debugging
 * @param {Button} button
 * @constructor
 */
function DebugMenu(button) {
	Menu.call(this, button, 130);
	// Used for storing the last request issued using the debug menu so it can be prefilled
	this.lastRequest = "";
	this.lastResponse = "";
}
DebugMenu.prototype = Object.create(Menu.prototype);
DebugMenu.prototype.constructor = DebugMenu;

/**
 * @inheritDoc
 */
DebugMenu.prototype.loadOptions = function() {
	// Turns on logging (printing to the debug span) if disabled
	this.addOption("Enable logging", DebugOptions.enableLogging);
	// Provides a dialog to load a file by pasting in XML
	this.addOption("Load file", this.loadFile);
	// Shows the XML for the current file in a new tab
	this.addOption("Download file", this.downloadFile);
	// Hides the debug menu
	this.addOption("Hide Debug", this.disableDebug);
	// Displays the version of the frontend, as set in version.js
	this.addOption("Version", this.optionVersion);
	// Sends the specified request to the backend
	this.addOption("Send request", this.optionSendRequest);
	// Creates fake robots in the connection menus for testing
	this.addOption("Allow virtual Robots", DebugOptions.enableVirtualDevices);
	// Clears the debug span
	this.addOption("Clear log", this.optionClearLog);
	// Tests throwing an error in the JS
	this.addOption("Throw error", function() {
		throw new UserException("test error");
	});
	// Prevents the JS from shutting off when there is an error
	this.addOption("Stop error locking", DebugOptions.stopErrorLocking);
};

DebugMenu.prototype.disableDebug = function() {
	DebugOptions.enabled = false;
	TitleBar.hideDebug();
}

/**
 * Provides a dialog to paste XML into so is can be loaded as a file
 */
DebugMenu.prototype.loadFile = function() {
	DialogManager.showPromptDialog("Load File", "Paste file contents", "", true, function(cancelled, resp) {
		if (!cancelled) {
			SaveManager.backendOpen("Pasted file", resp, true);
		}
	});
};

/**
 * Opens the XML for the current file in a new tab
 */
DebugMenu.prototype.downloadFile = function() {
	const xml = XmlWriter.docToText(CodeManager.createXml());
	const url = "data:text/plain," + HtmlServer.encodeHtml(xml);
	window.open(url, '_blank');
};

/**
 * Prints the version of the frontend as stored in Version.js
 */
DebugMenu.prototype.optionVersion = function() {
	GuiElements.alert("Version: " + GuiElements.appVersion);
};

/**
 * Clears the debug log
 */
DebugMenu.prototype.optionClearLog = function() {
	GuiElements.alert("");
};

/**
 * Provides a dialog for sending requests to the backend
 */
DebugMenu.prototype.optionSendRequest = function() {
	let message = this.lastResponse;
	if (this.lastResponse === "") {
		message = "Request: http://localhost:22179/[...]"
	}
	const me = this;
	DialogManager.showPromptDialog("Send request", message, this.lastRequest, true, function(cancel, request) {
		if (!cancel && (request !== "" || me.lastRequest !== "")) {
			if (request === "") {
				request = me.lastRequest;
			}
			me.lastRequest = request;
			HtmlServer.sendRequestWithCallback(request, function(resp) {
				me.lastResponse = "Response: \"" + resp + "\"";
				me.optionSendRequest();
			}, function() {
				me.lastResponse = "Error sending request";
				me.optionSendRequest();
			});
		} else {
			me.lastResponse = "";
		}
	}, function() {
		me.lastResponse = "";
	});
};