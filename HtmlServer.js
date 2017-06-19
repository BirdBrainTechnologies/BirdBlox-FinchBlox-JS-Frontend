/* HtmlServer is a static class that will manage HTTP requests.
 * This class is not nearly finished.
 */
function HtmlServer(){
	HtmlServer.port=22179;
	HtmlServer.dialogVisible=false;
	HtmlServer.logHttp=false || DebugOptions.shouldLogHttp();
}
HtmlServer.decodeHtml = function(message){
	return decodeURIComponent(message);
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
			/*if(callbackErr != null) {
				callbackErr();
			}*/
			if(callbackFn != null) {
				callbackFn("3000");
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
						callbackErr(xhttp.status);
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
		var callbackErr=function(){
			callbackErr.requestStatus.finished=true;
			callbackErr.requestStatus.error=true;
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
HtmlServer.showDialog=function(title,question,prefill,callbackFn,callbackErr){
	TouchReceiver.touchInterrupt();
	HtmlServer.dialogVisible=true;
	//GuiElements.alert("Showing...");
	if(TouchReceiver.mouse){ //Kept for debugging on a PC
		var newText=prompt(question);
		HtmlServer.dialogVisible=false;
		callbackFn(newText==null,newText);
	}
	else{
		var HS=HtmlServer;
		var request = "tablet/dialog";
		request+="?title=" + HS.encodeHtml(title);
		request+="&question="+HS.encodeHtml(question);
		request+="&prefill="+HS.encodeHtml(prefill);
		request+="&selectAll=true";
		var onDialogPresented=function(result){
			//GuiElements.alert("dialog presented...");
			HS.getDialogResponse(onDialogPresented.callbackFn,onDialogPresented.callbackErr);
		}
		onDialogPresented.callbackFn=callbackFn;
		onDialogPresented.callbackErr=callbackErr;
		var onDialogFail=function(){
			//GuiElements.alert("dialog failed...");
			HtmlServer.dialogVisible=false;
			if(onDialogFail.callbackErr!=null) {
				onDialogFail.callbackErr();
			}
		}
		onDialogFail.callbackErr=callbackErr;
		HS.sendRequestWithCallback(request,onDialogPresented,onDialogPresented);
	}
}
HtmlServer.getDialogResponse=function(callbackFn,callbackErr){
	var HS=HtmlServer;
	var request = "tablet/dialog_response";
	var onResponseReceived=function(response){
		if(response=="No Response"){
			HS.sendRequestWithCallback(request,onResponseReceived,function(){
				//GuiElements.alert("Error2");
				HtmlServer.dialogVisible=false;
				callbackErr();
			});
			//GuiElements.alert("No resp");
		}
		else if(response=="Cancelled"){
			HtmlServer.dialogVisible=false;
			onResponseReceived.callbackFn(true);
			//GuiElements.alert("Cancelled");
		}
		else{
			HtmlServer.dialogVisible=false;
			var trimmed=response.substring(1,response.length-1);
			onResponseReceived.callbackFn(false,trimmed);
			//GuiElements.alert("Done");
		}
	}
	onResponseReceived.callbackFn=callbackFn;
	onResponseReceived.callbackErr=callbackErr;
	HS.sendRequestWithCallback(request,onResponseReceived,function(){
		HtmlServer.dialogVisible=false;
		if(callbackErr != null) {
			callbackErr();
		}
	});
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
HtmlServer.showChoiceDialog=function(title,question,option1,option2,swapIfMouse,callbackFn,callbackErr){
	TouchReceiver.touchInterrupt();
	HtmlServer.dialogVisible=true;
	if(TouchReceiver.mouse){ //Kept for debugging on a PC
		var result=confirm(question);
		HtmlServer.dialogVisible=false;
		if(swapIfMouse){
			result=!result;
		}
		if(result){
			callbackFn("1");
		}
		else{
			callbackFn("2");
		}
	}
	else {
		var HS = HtmlServer;
		var request = "tablet/choice";
		request += "?title=" + HS.encodeHtml(title);
		request += "&question=" + HS.encodeHtml(question);
		request += "&button1=" + HS.encodeHtml(option1);
		request += "&button2=" + HS.encodeHtml(option2);
		var onDialogPresented = function (result) {
			HS.getChoiceDialogResponse(onDialogPresented.callbackFn, onDialogPresented.callbackErr);
		};
		onDialogPresented.callbackFn = callbackFn;
		onDialogPresented.callbackErr = callbackErr;
		var onDialogFail = function () {
			HtmlServer.dialogVisible = false;
			if (onDialogFail.callbackErr != null) {
				onDialogFail.callbackErr();
			}
		};
		onDialogFail.callbackErr = callbackErr;
		HS.sendRequestWithCallback(request, onDialogPresented, onDialogFail);
	}
};
HtmlServer.getChoiceDialogResponse=function(callbackFn,callbackErr){
	var HS=HtmlServer;
	var request = "tablet/choice_response";
	var onResponseReceived=function(response){
		if(response=="0"){
			HtmlServer.getChoiceDialogResponse(onResponseReceived.callbackFn,onResponseReceived.callbackErr);
		}
		else{
			HtmlServer.dialogVisible=false;
			onResponseReceived.callbackFn(response);
		}
	};
	onResponseReceived.callbackFn=callbackFn;
	onResponseReceived.callbackErr=callbackErr;
	HS.sendRequestWithCallback(request,onResponseReceived,function(){
		HS.dialogVisible = false;
		if (callbackErr != null) {
			callbackErr();
		}
	});
};
HtmlServer.showAlertDialog=function(title,message,button,callbackFn,callbackErr){
	TouchReceiver.touchInterrupt();
	HtmlServer.dialogVisible=true;
	if(TouchReceiver.mouse){ //Kept for debugging on a PC
		var result=alert(message);
		HtmlServer.dialogVisible=false;
	}
	else {
		var HS = HtmlServer;
		var request = new HttpRequestBuilder("tablet/dialog/alert");
		request.addParam("title", HS.encodeHtml(title));
		request.addParam("message", HS.encodeHtml(message));
		request.addParam("button", HS.encodeHtml(button));
		HS.sendRequestWithCallback(request.toString(), callbackFn, callbackErr);
	}
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