/* HummingbirdManager is a static class that will manage connections to the Hummingbird via HTTP requests.
 * It serves as a bridge between the Hummingbird and the the rest of the application.
 * Ultimately, all HTTP requests to the Hummingbird will be made through this class.
 * This class is not nearly finished.
 */
function HummingbirdManager(){
	var HM=HummingbirdManager;
	GuiElements.alert("Beginning HB Scan"); //For debugging purposes.
	HM.getHBNames(); //Gets the names of the Hummingbirds and stores them.
}
/* Replaces special characters to prepare messages for HTTP requests */
HummingbirdManager.encodeHTML=function(message) {
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
/* Gets the names of the connected Hummingbirds and saves them to HummingbirdManager.hBNames */
HummingbirdManager.getHBNames=function(){
	var HM=HummingbirdManager;
	var xhttp = new XMLHttpRequest();
	try {
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {
					HM.hBNames = xhttp.responseText; //Save the names of the Hummingbirds
					GuiElements.alert(xhttp.responseText); //Show them in the debug span
				}
				else {
					HM.hBNames = "Hummingbird";//Temp for testing
					GuiElements.alert("Error: " + xhttp.status); //Show the error in the debug span
				}
			}
		};
		xhttp.open("GET", "http://localhost:22179/hummingbird/names/", true); //Get the names
		xhttp.send(); //Make the request
	}
	catch(err){
		GuiElements.alert(err); //*****This line is executed with exception 101*****
	}
}
/* Adds the localhost and hummingbird name to the HTTP request.
 * @fix this only works if there is only one hummingbird conencted and its name is in HM.hBNames
 * @fix does not support multiple hummingbirds
 */
HummingbirdManager.getCommandForHB=function(command){
	var HM=HummingbirdManager;
	return "http://localhost:22179/hummingbird/"+HM.encodeHTML(HM.hBNames)+"/"+command;
}
HummingbirdManager.outputStartAction=function(block,urlPart,minVal,maxVal){
	var mem=block.runMem;
	mem.port=block.slots[0].getData().getValueWithC(true,true);
	mem.value=block.slots[1].getData().getValueInR(minVal,maxVal,false,true);
	if(mem.port>=1&&mem.port<=4) {
		mem.request = "out/"+urlPart+"/" + mem.port + "/" + mem.value;
		mem.requestStatus=function(){};
		HtmlServer.sendHBRequest(mem.request,mem.requestStatus);
		return block;
	}
	else{
		return block.nextBlock;
	}
}
HummingbirdManager.outputUpdateAction=function(block){
	if(block.runMem.requestStatus.finished==true){
		return block.nextBlock;
	}
	else{
		return block;
	}
}
HummingbirdManager.sensorStartAction=function(block,urlPart,defaultValue){
	var mem=block.runMem;
	mem.port=block.slots[0].getData().getValueWithC(true,true);
	if(mem.port>=1&&mem.port<=4) {
		mem.request = "in/sensor/" + mem.port;
		mem.requestStatus=function(){};
		HtmlServer.sendHBRequest(mem.request,mem.requestStatus);
		return false;
	}
	else{
		block.resultData=new NumData(defaultValue,false);
		return true;
	}
}
HummingbirdManager.sensorUpdateAction=function(block,integer,defaultValue){
	if(block.runMem.requestStatus.finished==true){
		if(block.runMem.requestStatus.error==false){
			var result;
			if(integer){
				result=parseInt(this.runMem.requestStatus.result);
			}
			else{
				result=parseFloat(this.runMem.requestStatus.result);
			}
			block.resultData=new NumData(result);
		}
		else{
			block.resultData=new NumData(defaultValue,false);
		}
		return true;
	}
	else{
		return false;
	}
}