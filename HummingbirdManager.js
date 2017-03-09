/* HummingbirdManager is a static class that will manage connections to the Hummingbird via HTTP requests.
 * It serves as a bridge between the Hummingbird and the the rest of the application.
 * Ultimately, all HTTP requests to the Hummingbird will be made through this class.
 * This class is not nearly finished.
 */
function HummingbirdManager(){
	var HM=HummingbirdManager;
	HM.getHBNames(); //Gets the names of the Hummingbirds and stores them.
	HM.selectableHBs=0;
	HM.connectedHBs=[];
	HM.allowVirtualHBs=false;
}

HummingbirdManager.GetDeviceName = function(shorten) {
	if (shorten) {
		return "HB";
	} else {
		return "Hummingbird";
	}
}

/* Gets the names of the connected Hummingbirds and saves them to HummingbirdManager.hBNames */
HummingbirdManager.getHBNames=function(){
	var HM=HummingbirdManager;
	var callbackFn=function(response){
		if(response!="") {
			HM.connectedHBs = [new Hummingbird(response)];
		}
	};
	HtmlServer.sendRequestWithCallback("hummingbird/names",callbackFn);
};
HummingbirdManager.getConnectedHBs=function(){
	var HM=HummingbirdManager;
	return HM.connectedHBs;
};
HummingbirdManager.outputStartAction=function(block,urlPart,minVal,maxVal){
	var mem=block.runMem;
	mem.hBIndex=block.slots[0].getData().getValue();
	mem.portD=block.slots[1].getData();
	mem.port=mem.portD.getValueWithC(true,true); //Positive integer.
	mem.valueD=block.slots[2].getData();
	mem.value=mem.valueD.getValueInR(minVal,maxVal,false,true);
	if(mem.port>=1&&mem.port<=4&&mem.valueD.isValid&&mem.portD.isValid) {
		mem.request = "out/"+urlPart+"/" + mem.port + "/" + mem.value;
		mem.requestStatus=function(){};
		if(CodeManager.checkHBOutputDelay(block.stack)) {
			HtmlServer.sendHBRequest(mem.hBIndex,mem.request, mem.requestStatus);
			CodeManager.updateHBOutputDelay();
			mem.sent=true;
		}
		else{
			mem.sent=false;
		}
		return true; //Still running
	}
	else{
		return false; //Done running
	}
};
HummingbirdManager.outputUpdateAction=function(block){
	var mem=block.runMem;
	if(mem.sent){
		if(block.runMem.requestStatus.finished==true){
			return false; //Done running
		}
		else{
			return true; //Still running
		}
	}
	else{
		if(CodeManager.checkHBOutputDelay(block.stack)){
			HtmlServer.sendHBRequest(mem.hBIndex,mem.request, mem.requestStatus);
			CodeManager.updateHBOutputDelay();
			mem.sent=true;
		}
		return true; //Still running
	}
};
HummingbirdManager.sensorStartAction=function(block,urlPart,defaultValue){
	var mem=block.runMem;
	mem.hBIndex=block.slots[0].getData().getValue();
	mem.portD=block.slots[1].getData();
    mem.port=mem.portD.getValueWithC(true,true); //Positive integer.
    if(mem.port>=1&&mem.port<=4&&mem.portD.isValid) {
		mem.request = "in/"+urlPart+"/" + mem.port;
		mem.requestStatus=function(){};
        HtmlServer.sendHBRequest(mem.hBIndex,mem.request,mem.requestStatus);
        return true; //Still running
	}
	else{
        block.resultData=new NumData(defaultValue,false);
		return false; //Done running
	}
};
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
		return false; //Done running
	}
	else{
		return true; //Still running
	}
}
HummingbirdManager.stopHummingbirds=function(){
	//HtmlServer.sendRequest("hummingbird/out/stop");
	var HM=HummingbirdManager;
	for(var i=0;i<HM.connectedHBs.length;i++){
		HtmlServer.sendHBRequest(i,"out/stop");
	}
};


/////////////Multi-support//////////////////
/*HummingbirdManager.disconnectHB=function(hummingbird){
	var name=hummingbird.name;
	var index=HummingbirdManager.connectedHBs.indexOf(hummingbird);
	HummingbirdManager.connectedHBs.splice(index,1);
	for(var i=0;i<HummingbirdManager.connectedHBs.length;i++){
		if(HummingbirdManager.connectedHBs[i].name==name){
			return;
		}
	}
	var request="hummingbird/"+HtmlServer.encodeHtml(name)+"/disconnect";
	HtmlServer.sendRequestWithCallback(request);
};*/
HummingbirdManager.removeHB=function(hummingbird) {
	var index = HummingbirdManager.connectedHBs.indexOf(hummingbird);
	HummingbirdManager.connectedHBs.splice(index, 1);
};
HummingbirdManager.showConnectOneDialog=function(){
	new ConnectOneHBDialog();
};
HummingbirdManager.disconnectAll=function(){
	var HM=HummingbirdManager;
	while(HM.connectedHBs.length>0){
		HM.connectedHBs[0].disconnect();
	}
};
HummingbirdManager.connectOneHB=function(hBName){
	var HM=HummingbirdManager;
	HM.disconnectAll();
	var newHB=new Hummingbird(hBName);
	newHB.connect();
};
HummingbirdManager.showConnectMultipleDialog=function(){
	new ConnectMultipleHBDialog();
};
HummingbirdManager.replaceHBConnection=function(oldHB, newHBName,callbackFn){
	var HM=HummingbirdManager;
	var index=-1;
	if(oldHB!=null){
		oldHB.disconnect(null,false);
		index = HummingbirdManager.connectedHBs.indexOf(oldHB);
	}
	var newHB=new Hummingbird(newHBName);
	if(index==-1){
		newHB.connect(callbackFn);
	}
	else{
		HM.connectedHBs[index]=newHB;
		newHB.connect(callbackFn,false);
	}
};
HummingbirdManager.getSelectableHBCount=function(){
	return HummingbirdManager.selectableHBs;
};
HummingbirdManager.GetDeviceCount = function() {
	return HummingbirdManager.selectableHBs;
}
HummingbirdManager.updateSelectableHBs=function(){
	var HM=HummingbirdManager;
	var oldCount=HM.selectableHBs;
	var inUse=CodeManager.countHBsInUse();
	var newCount=Math.max(HM.connectedHBs.length,inUse);
	HM.selectableHBs=newCount;
	if(newCount<=1&&oldCount>1){
		CodeManager.hideDeviceDropDowns();
	}
	else if(newCount>1&&oldCount<=1){
		CodeManager.showDeviceDropDowns();
	}
};
HummingbirdManager.displayDebugInfo=function(){
	var HM=HummingbirdManager;
	var info="";
	info+="Selectable count: "+HM.selectableHBs+"\n";
	info+="Connected HBs\n";
	for(var i=0;i<HM.connectedHBs.length;i++){
		info+="HB"+i+": "+HM.connectedHBs[i].name+"\n";
	}
	HtmlServer.showChoiceDialog("Hummingbird Debug",info,"Ok","Ok",true,function(){});
};
HummingbirdManager.recountAndDisplayHBs=function(){
	HummingbirdManager.updateSelectableHBs();
	HummingbirdManager.displayDebugInfo();
};
HummingbirdManager.displayiOSHBNames=function(){
	var HM=HummingbirdManager;
	var callbackFn=function(response){
		HtmlServer.showChoiceDialog("Hummingbirds iOS","Hummingbirds iOS\n"+response,"Ok","Ok",true,function(){});
	};
	HtmlServer.sendRequestWithCallback("hummingbird/names",callbackFn);
};
/*HummingbirdManager.connectHB=function(hummingbird){
	var HM=HummingbirdManager;
	var name=hummingbird.name;
	HM.connectedHBs.push(hummingbird);
	for(var i=0;i<HM.connectedHBs.length-1;i++){
		if(HM.connectedHBs[i].name==name){
			return;
		}
	}
	var request="hummingbird/"+HtmlServer.encodeHtml(name)+"/connect";
	HtmlServer.sendRequestWithCallback(request);
};*/


/*HummingbirdManager.loadConnectedHBs=function(){
	var HM=HummingbirdManager;
	HtmlServer.sendRequestWithCallback("hummingbird/names",function(result){
		if(result!=null&&result!=""){
			HM.connectedHBs=result.split("\n");
		}
		else{
			HM.connectedHBs=[];
		}
	},function(){
		HM.connectedHBs=[];
	});
};*/
