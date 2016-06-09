/* HtmlServer is a static class that will manage HTTP requests.
 * This class is not nearly finished.
 */
function HtmlServer(){
	HtmlServer.port=22179;
}
HtmlServer.encodeHtml=function(message){
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
}
HtmlServer.sendHBRequest=function(request,requestStatus){
	var reportStatus=false;
	if(requestStatus!=null){
		reportStatus=true;
		requestStatus.finished=false;
		requestStatus.error=false;
	}
	try {
		var xhttp = new XMLHttpRequest();
		xhttp.requestStatus=requestStatus;
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {
					if(reportStatus){
						xhttp.requestStatus.finished=true;
						xhttp.requestStatus.result=xhttp.responseText;
						//GuiElements.alert(xhttp.responseText);
					}
				}
				else {
					if(reportStatus){
						xhttp.requestStatus.finished=true;
						xhttp.requestStatus.error=true;
					}
				}
			}
		};
		xhttp.open("GET", HtmlServer.getUrlForHB(request), true); //Get the names
		GuiElements.alert(HtmlServer.getUrlForHB(request));
		xhttp.send(); //Make the request
	}
	catch(err){
		if(reportStatus){
			requestStatus.finished=true;
			requestStatus.error=true;
		}
	}
}
HtmlServer.getUrlForHB=function(request){
	return HtmlServer.getUrl(HtmlServer.encodeHtml(HummingbirdManager.hBNames)+"/"+request);
}
HtmlServer.getUrl=function(request){
	return "http://localhost:"+HtmlServer.port+"/hummingbird/"+request;
}