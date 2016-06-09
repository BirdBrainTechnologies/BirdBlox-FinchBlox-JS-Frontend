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
/* Gets the names of the connected Hummingbirds and saves them to HummingbirdManager.hBNames */
HummingbirdManager.getHBNames=function(){
	var callbackFn=function(response){
		HummingbirdManager.hBNames = response; //Save the names of the Hummingbirds
		GuiElements.alert(response); //Show them in the debug span
	}
	var callbackErr=function(){
		HummingbirdManager.hBNames = "Hummingbird";//Temp for testing
		GuiElements.alert("Error connecting to HB"); //Show the error in the debug span
	}
	HtmlServer.sendRequestWithCallback("hummingbird/names",callbackFn,callbackErr);
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
				result=parseInt(block.runMem.requestStatus.result);
			}
			else{
				result=parseFloat(block.runMem.requestStatus.result);
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