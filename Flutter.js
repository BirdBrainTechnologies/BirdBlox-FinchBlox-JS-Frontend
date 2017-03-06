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