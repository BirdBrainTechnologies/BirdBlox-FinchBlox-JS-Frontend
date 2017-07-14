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
	this.defaultVal = defaultVal;
	this.number = number;
	this.integer = integer;
	this.min = min;
	this.max = max;
	this.value = defaultVal;
}
Setting.prototype.getValue = function(){
	return this.value;
};
/*
Setting.prototype.setValue = function(value){
	this.value = value;
};
*/
Setting.prototype.writeValue = function(value){
	this.value = value;
	if(this.number) {
		this.value = (new NumData(value)).getValueInR(this.min, this.max);
	}
	const request = new HttpRequestBuilder("settings/set");
	request.addParam("key", this.key);
	request.addParam("value", HtmlServer.encodeHtml(value));
	HtmlServer.sendRequestWithCallback(request.toString());
};
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