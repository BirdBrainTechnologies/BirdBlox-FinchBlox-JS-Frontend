/**
 * Represents a setting stored on the backend.  Automatically edits and caches the backend value
 * @param {string} key - The key of the setting (on the backend)
 * @param {string|number} defaultVal - The default value of the setting
 * @param {boolean} [number=false] - Whether the setting is a number
 * @param {boolean} [integer=false] - Whether the setting only accepts integer values
 * @param {number|null} [min] - The minimum value the setting can take (null for no minimum)
 * @param {number|null} [max] - The maximum value the setting can take (null for no minimum)
 */
function Setting(key, defaultVal, number, integer, min, max) {
	if(number == null) {
		number = false;
	}
	if(integer == null) {
		integer = false;
	}
	if(min == null) {
		max = null;
	}
	if(max == null) {
		max = null;
	}

	this.key = key;
	this.number = number;
	this.integer = integer;
	this.min = min;
	this.max = max;
	this.value = defaultVal;
}

/**
 * Gets the cached value of the setting
 * @return {number|string}
 */
Setting.prototype.getValue = function(){
	return this.value;
};

/**
 * Sends a request to change the setting and updates the cached value. Validates the value to ensure it is in range
 * @param {number|string} value - The value to store
 */
Setting.prototype.writeValue = function(value){
	this.value = value;
	if(this.number) {
		this.value = (new NumData(value)).getValueInR(this.min, this.max);
	}
	const request = new HttpRequestBuilder("settings/set");
	request.addParam("key", this.key);
	request.addParam("value", HtmlServer.encodeHtml(this.value + ""));
	HtmlServer.sendRequestWithCallback(request.toString());
};

/**
 * Sends a request to get the value of the setting from the backend.  Keeps the current value if it gets no response.
 * @param {function} callbackFn - type (string|number) -> () called with value once read, or with current value if error
 */
Setting.prototype.readValue = function(callbackFn){
	const request = new HttpRequestBuilder("settings/get");
	request.addParam("key", this.key);
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		let res = result;
		if(this.number) {
			const numData = (new StringData(res)).asNum();
			if(numData.isValid) {
				this.value = numData.getValueInR(this.min, this.max, false, this.integer);
			}
		} else {
			this.value = res;
		}
		callbackFn(this.value);
	}.bind(this), function(){
		if(callbackFn != null) callbackFn(this.value);
	}.bind(this));
};