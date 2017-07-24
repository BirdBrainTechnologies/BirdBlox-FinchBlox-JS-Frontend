/* HtmlServer is a static class that will manage HTTP requests.
 * This class is not nearly finished.
 */
function HtmlServer(){
	HtmlServer.port=22179;
	HtmlServer.dialogVisible=false;
	HtmlServer.logHttp = false || DebugOptions.shouldLogHttp();
}
HtmlServer.decodeHtml = function(message){
	return decodeURIComponent(message.replace(/\+/g, " "));
};
HtmlServer.encodeHtml=function(message){
	/*if(message==""){
		return "%20"; //Empty strings can't be used in the URL.
	}*/
	var eVal;
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
HtmlServer.sendRequestWithCallback=function(request,callbackFn,callbackErr,isPost,postData){
	callbackFn = DebugOptions.safeFunc(callbackFn);
	callbackErr = DebugOptions.safeFunc(callbackErr);
	if(HtmlServer.logHttp&&request.indexOf("totalStatus")<0&&
		request.indexOf("discover_")<0&&request.indexOf("status")<0&&request.indexOf("response")<0) {
		GuiElements.alert(HtmlServer.getUrlForRequest(request));
	}
	if(DebugOptions.shouldSkipHtmlRequests()) {
		setTimeout(function () {
			if(false) {
				if(callbackErr != null) {
					callbackErr(418, "I'm a teapot");
				}
			} else {
				if(callbackFn != null) {
					//callbackFn('[{"name":"hi","id":"there"}]');
					callbackFn('{"files":["hello","world"],"signedIn":true,"account":"101010tw42@gmail.com"}');
					//callbackFn('[{"name":"hi","id":"there"}]');
				}
			}
		}, 20);
		return;
	}
	if(isPost == null) {
		isPost=false;
	}
	var requestType="GET";
	if(isPost){
		requestType="POST";
	}
	try {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4) {
				if (200 <= xhttp.status && xhttp.status <= 299) {
					if(callbackFn!=null){
						callbackFn(xhttp.responseText);
					}
				}
				else {
					if(callbackErr!=null){
						if(HtmlServer.logHttp){
							GuiElements.alert("HTTP ERROR: " + xhttp.status + ", RESP: " + xhttp.responseText);
						}
						callbackErr(xhttp.status, xhttp.responseText);
					}
					//GuiElements.alert("HTML error: "+xhttp.status+" \""+xhttp.responseText+"\"");
				}
			}
		};
		xhttp.open(requestType, HtmlServer.getUrlForRequest(request), true); //Get the names
		if(isPost){
			xhttp.setRequestHeader("Content-type", "text/plain; charset=utf-8");
			xhttp.send(postData);
		}
		else{
			xhttp.send(); //Make the request
		}
	}
	catch(err){
		if(callbackErr!=null){
			callbackErr();
		}
	}
};
HtmlServer.sendRequest=function(request,requestStatus){
	/*
	 setTimeout(function(){
		requestStatus.error = false;
		requestStatus.finished = true;
		requestStatus.result = "7";
	}, 300);
	return;
	*/
	if(requestStatus!=null){
		requestStatus.error=false;
		var callbackFn=function(response){
			callbackFn.requestStatus.finished=true;
			callbackFn.requestStatus.result=response;
		};
		callbackFn.requestStatus=requestStatus;
		var callbackErr=function(code, result){
			callbackErr.requestStatus.finished=true;
			callbackErr.requestStatus.error=true;
			callbackErr.requestStatus.code = code;
			callbackErr.requestStatus.result = result;
		};
		callbackErr.requestStatus=requestStatus;
		HtmlServer.sendRequestWithCallback(request,callbackFn,callbackErr);
	}
	else{
		HtmlServer.sendRequestWithCallback(request);
	}
}
HtmlServer.getHBRequest=function(hBIndex,request,params){
	DebugOptions.validateNonNull(params);
	var res = "hummingbird/";
	res += request;
	res += "?id=" + HtmlServer.encodeHtml(HummingbirdManager.connectedHBs[hBIndex].id);
	res += params;
	return res;
};
HtmlServer.getUrlForRequest=function(request){
	return "http://localhost:"+HtmlServer.port+"/"+request;
}
HtmlServer.getFileName=function(callbackFn,callbackErr){
	var HS=HtmlServer;
	var onResponseReceived=function(response){
		if(response=="File has no name."){
			HtmlServer.getFileName(onResponseReceived.callbackFn,onResponseReceived.callbackErr);
		}
		else{
			onResponseReceived.callbackFn(response);
		}
	};
	onResponseReceived.callbackFn=callbackFn;
	onResponseReceived.callbackErr=callbackErr;
	HS.sendRequestWithCallback("filename",onResponseReceived,callbackErr);
};

HtmlServer.getSetting=function(key,callbackFn,callbackErr){
	HtmlServer.sendRequestWithCallback("settings/get?key="+HtmlServer.encodeHtml(key),callbackFn,callbackErr);
};
HtmlServer.setSetting=function(key,value){
	var request = "settings/set";
	request += "?key=" + HtmlServer.encodeHtml(key);
	request += "&value=" + HtmlServer.encodeHtml(value);
	HtmlServer.sendRequestWithCallback(request);
};
HtmlServer.sendFinishedLoadingRequest = function(){
	HtmlServer.sendRequestWithCallback("ui/contentLoaded")
};