function HummingbirdManager(){
	var HM=HummingbirdManager;
	GuiElements.alert("Beginning HB Scan");
	HM.getHBNames();
}
HummingbirdManager.encodeHTML=function(val) {
	var eVal;
	if (!encodeURIComponent) {
		eVal = escape(val);
		eVal = eVal.replace(/@/g, "%40");
		eVal = eVal.replace(/\//g, "%2F");
		eVal = eVal.replace(/\+/g, "%2B");
		eVal = eVal.replace(/'/g, "%60");
		eVal = eVal.replace(/"/g, "%22");
		eVal = eVal.replace(/`/g, "%27");
		eVal = eVal.replace(/&/g, "%26");
	} else {
		eVal = encodeURIComponent(val);
		eVal = eVal.replace(/~/g, "%7E");
		eVal = eVal.replace(/!/g, "%21");
		eVal = eVal.replace(/\(/g, "%28");
		eVal = eVal.replace(/\)/g, "%29");
		eVal = eVal.replace(/'/g, "%27");
		eVal = eVal.replace(/"/g, "%22");
		eVal = eVal.replace(/`/g, "%27");
		eVal = eVal.replace(/&/g, "%26");
	}
	return eVal.replace(/\%20/g, "+");
}
HummingbirdManager.getHBNames=function(){
	var HM=HummingbirdManager;
	var xhttp = new XMLHttpRequest();
	try {
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {
					HM.hBNames = xhttp.responseText;
					GuiElements.alert(xhttp.responseText);
				}
				else {
					HM.hBNames = "Hummingbird";//Temp for testing
					GuiElements.alert("Error: " + xhttp.status);
				}
			}
		};
		xhttp.open("GET", "localhost:22179/hummingbird/discover/", true);
		xhttp.send();
	}
	catch(err){
		GuiElements.alert(err);
	}
}
HummingbirdManager.getCommandForHB=function(command){
	var HM=HummingbirdManager;
	return "localhost:22179/hummingbird/"+HM.encodeHTML(HM.hBNames)+"/"+command;
}