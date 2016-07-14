function SaveManager(){
	SaveManager.fileName="";
	SaveManager.modified=false;
	SaveManager.named=false;
	SaveManager.requestTimer=null;
	SaveManager.timerRunning=false;
}
SaveManager.autoSave=function(){
	XmlWriter.downloadDoc(CodeManager.createXml(),"autoSave");
};
SaveManager.loadFile=function(xmlString){
	var xmlDoc=XmlWriter.openDoc(xmlString);
	var project=XmlWriter.findElement(xmlDoc,"project");
	if(project==null){
		return;
	}
	CodeManager.importXml(project);
};
SaveManager.loadTest=function(){
	var file='';
	SaveManager.loadFile(file);
};
SaveManager.reloadTest=function(){
	var xmlDoc=CodeManager.createXml();
	var file=XmlWriter.docToText(xmlDoc);
	XmlWriter.downloadDoc(xmlDoc,"autoSave");
	SaveManager.loadFile(file);
};
SaveManager.listTest=function(){
	var callbackFn=function(response){
		GuiElements.alert(response);
	};
	HtmlServer.sendRequestWithCallback("files",callbackFn);
};
SaveManager.save=function(updateTitle){
	if(updateTitle==null){
		updateTitle=true;
	}
	XmlWriter.openDocInTab(CodeManager.createXml());
	GuiElements.alert("**********Save************");
	if(updateTitle) {
		var callbackFn = function (response) {
			SaveManager.fileName = response;
			SaveManager.markSaved();
		};
		HtmlServer.getFileName(callbackFn);
	}
};
SaveManager.open=function(fileName){
	SaveManager.checkPromptSave(function() {
		var callbackFn = function (response) {
			SaveManager.loadFile(response);
			var callbackFn2 = function (response) {
				SaveManager.fileName = response;
				SaveManager.named = true;
				SaveManager.markSaved();
			};
			HtmlServer.sendRequestWithCallback("filename", callbackFn2);
		};
		HtmlServer.sendRequestWithCallback("load/" + fileName, callbackFn);
	});
};
SaveManager.saveAs=function(){
	HtmlServer.sendRequestWithCallback("new");
	SaveManager.named=false;
	var now=new Date().getTime();
	while(new Date().getTime()-now<50){

	}
	SaveManager.save();
};
SaveManager.new=function(){
	SaveManager.checkPromptSave(function() {
		HtmlServer.sendRequestWithCallback("new");
		SaveManager.fileName = "New project";
		SaveManager.named = false;
		SaveManager.markSaved();
		SaveManager.loadFile("<project><tabs></tabs></project>");
	});
};
SaveManager.markEdited=function(){
	if(!SaveManager.modified){
		SaveManager.modified=true;
		if(SaveManager.named) {
			TitleBar.setText(SaveManager.fileName + "*");
		}
		else{
			TitleBar.setText("");
		}
	}
};
SaveManager.markSaved=function(){
	SaveManager.modified=false;
	if(SaveManager.named) {
		TitleBar.setText(SaveManager.fileName);
	}
	else{
		TitleBar.setText("");
	}
};
SaveManager.checkPromptSave=function(nextAction){
	if(SaveManager.modified){
		var callbackFn2=function(response){
			callbackFn2.status.finished=true;
			callbackFn2.status.result=response;
		};
		callbackFn2.status=function(){};
		callbackFn2.status.finished=false;
		var question="Would you like to save changes to your project?";
		HtmlServer.showChoiceDialog("Save changes",question,"Don't Save","Save",true,callbackFn2);
		var callbackFn=function(response) {
			if(response=="2"){
				SaveManager.save(false);
			}
			nextAction();
		};
		SaveManager.waitForRequest(callbackFn2.status,callbackFn);
	}
	else{
		nextAction();
	}
};
SaveManager.waitForRequest=function(status,callbackFn){
	if(!SaveManager.timerRunning){
		SaveManager.currentRequestStatus=status;
		SaveManager.currentCallbackFn=callbackFn;
		SaveManager.requestTimer = self.setInterval(function () { SaveManager.checkRequestStatus() }, 5000);
		SaveManager.timerRunning=true;
	}		
};
SaveManager.checkRequestStatus=function(){
	if(SaveManager.currentRequestStatus.finished==true) {
		SaveManager.requestTimer = window.clearInterval(SaveManager.requestTimer);
		SaveManager.timerRunning=false;
		SaveManager.currentCallbackFn(SaveManager.currentRequestStatus.result);
		SaveManager.timerRunning=false;
	}
};