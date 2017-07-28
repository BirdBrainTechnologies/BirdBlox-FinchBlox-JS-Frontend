/**
 * HtmlServer is a static class sends messages to the backend
 */
function HtmlServer() {
	HtmlServer.port = 22179;
	HtmlServer.dialogVisible = false;
}

/**
 * Removes percent encoding from a string
 * @param {string} message - The percent encoded string
 * @return {string} - The decoded string
 */
HtmlServer.decodeHtml = function(message) {
	return decodeURIComponent(message.replace(/\+/g, " "));
};

/**
 * Applies percent encoding to a string
 * @param {string} message - The input string
 * @return {string} - The percent encoded string
 */
HtmlServer.encodeHtml = function(message) {
	/*if(message==""){
		return "%20"; //Empty strings can't be used in the URL.
	}*/
	let eVal;
	if (!encodeURIComponent) {
		eVal = escape(message);
		eVal = eVal.replace(/@/g, "%40");
		eVal = eVal.replace(/\//g, "%2F");
		eVal = eVal.replace(/\+/g, "%2B");
		eVal = eVal.replace(/'/g, "%60");
		eVal = eVal.replace(/"/g, "%22");
		eVal = eVal.replace(/`/g, "%27");
		eVal = eVal.replace(/&/g, "%26");
	} else {
		eVal = encodeURIComponent(message);
		eVal = eVal.replace(/~/g, "%7E");
		eVal = eVal.replace(/!/g, "%21");
		eVal = eVal.replace(/\(/g, "%28");
		eVal = eVal.replace(/\)/g, "%29");
		eVal = eVal.replace(/'/g, "%27");
		eVal = eVal.replace(/"/g, "%22");
		eVal = eVal.replace(/`/g, "%27");
		eVal = eVal.replace(/&/g, "%26");
	}
	return eVal; //.replace(/\%20/g, "+");
};

/**
 * Sends a request to the backend and calls a callback function with the results
 * @param {string} request - The request to send
 * @param {function|null} [callbackFn] - type (string) -> (), called with the response from the backend
 * @param {function|null} [callbackErr] - type ([number], [string]) -> (), called with the error status code and message
 * @param {boolean} [isPost=false] - Whether a post request should be used instead of a get request
 * @param {string} [postData] - The post data to send in the body of the request
 */
HtmlServer.sendRequestWithCallback = function(request, callbackFn, callbackErr, isPost, postData) {
	callbackFn = DebugOptions.safeFunc(callbackFn);
	callbackErr = DebugOptions.safeFunc(callbackErr);
	if (DebugOptions.shouldLogHttp()) {
		// Requests are logged for debugging
		GuiElements.alert(HtmlServer.getUrlForRequest(request));
	}
	if (DebugOptions.shouldSkipHtmlRequests()) {
		// If we're testing on a device without a backend, we reply with a fake response
		setTimeout(function() {
			if (false) {
				// We can respond with a fake error
				if (callbackErr != null) {
					callbackErr(418, "I'm a teapot");
				}
			} else {
				// Or with fake data
				if (callbackFn != null) {
					callbackFn('Started');
					//callbackFn('{"files":["hello","world"],"signedIn":true,"account":"101010tw42@gmail.com"}');
					//callbackFn('[{"name":"hi","id":"there"}]');
				}
			}
		}, 20);
		return;
	}
	if (isPost == null) {
		isPost = false;
	}
	let requestType = "GET";
	if (isPost) {
		requestType = "POST";
	}
	try {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState === 4) {
				if (200 <= xhttp.status && xhttp.status <= 299) {
					if (callbackFn != null) {
						callbackFn(xhttp.responseText);
					}
				} else {
					if (callbackErr != null) {
						if (DebugOptions.shouldLogHttp()) {
							// Show the error on the screen
							GuiElements.alert("HTTP ERROR: " + xhttp.status + ", RESP: " + xhttp.responseText);
						}
						callbackErr(xhttp.status, xhttp.responseText);
					}
				}
			}
		};
		xhttp.open(requestType, HtmlServer.getUrlForRequest(request), true);
		if (isPost) {
			xhttp.setRequestHeader("Content-type", "text/plain; charset=utf-8");
			xhttp.send(postData);
		} else {
			xhttp.send();
		}
	} catch (err) {
		if (callbackErr != null) {
			callbackErr(0, "Sending request failed");
		}
	}
};

/**
 * Sends a request and changes fields of a status object to track its progress.  Used for executing blocks
 * @param {string} request - The request to send
 * @param {object} requestStatus - The status object
 */
HtmlServer.sendRequest = function(request, requestStatus) {
	if (requestStatus != null) {
		requestStatus.error = false;
		const callbackFn = function(response) {
			requestStatus.finished = true;
			requestStatus.result = response;
		};
		const callbackErr = function(code, result) {
			requestStatus.finished = true;
			requestStatus.error = true;
			requestStatus.code = code;
			requestStatus.result = result;
		};
		HtmlServer.sendRequestWithCallback(request, callbackFn, callbackErr);
	} else {
		HtmlServer.sendRequestWithCallback(request);
	}
};

/**
 * Prepends localhost and the port number to the request
 * @param {string} request - The request to modify
 * @return {string} - The completed request
 */
HtmlServer.getUrlForRequest = function(request) {
	return "http://localhost:" + HtmlServer.port + "/" + request;
};

/**
 * Tells the backend that the frontend is done loading the UI
 */
HtmlServer.sendFinishedLoadingRequest = function() {
	HtmlServer.sendRequestWithCallback("ui/contentLoaded")
};