function SaveManager(){
	SaveManager.fileName="New project";
	SaveManager.modified=false;
	SaveManager.named=false;
}
SaveManager.open=function(fileName){
	var callbackFnOpen=function(){
		var callbackFn = function (response) {
			SaveManager.loadFile(response);
			SaveManager.fileName = callbackFn.fileName;
			SaveManager.named = true;
			SaveManager.markSaved();
		};
		callbackFn.fileName=fileName;
		HtmlServer.sendRequestWithCallback("data/load/" + fileName, callbackFn);
	};
	SaveManager.checkPromptSave(callbackFnOpen);
};
SaveManager.markEdited=function(){
	if(!SaveManager.modified){
		SaveManager.modified=true;
		TitleBar.setText(SaveManager.fileName + "*");
	}
};
SaveManager.markSaved=function(){
	SaveManager.modified=false;
	TitleBar.setText(SaveManager.fileName);
};
SaveManager.checkPromptSave=function(nextAction){
	if(SaveManager.modified){
		var question="Would you like to save changes to your project?";
		var callbackFn=function(response) {
			if(response=="2"){
				SaveManager.save(callbackFn.nextAction);
			}
			else{
				callbackFn.nextAction();
			}
		};
		callbackFn.nextAction=nextAction;
		HtmlServer.showChoiceDialog("Save changes",question,"Don't Save","Save",true,callbackFn);
	}
	else{
		nextAction();
	}
};
SaveManager.save=function(nextAction){
	if(SaveManager.named){
		var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
		HtmlServer.sendRequestWithCallback("data/save/"+SaveManager.fileName,nextAction, null,true,xmlDocText);
		SaveManager.markSaved();
	}
	else{
		SaveManager.saveAs(nextAction);
	}
};
SaveManager.saveAs=function(nextAction){
	var callbackFn=function(cancelled,response){
		if(!cancelled){
			SaveManager.checkOverwriteAndSave(response,callbackFn.nextAction);
		}
	};
	callbackFn.nextAction=nextAction;
	HtmlServer.showDialog("Save","Enter a file name","",callbackFn);
};
SaveManager.checkOverwriteAndSave=function(checkName,nextAction){
	var callbackFn=function(response){
		if(response.split("\n").indexOf(checkName)!=-1){
			SaveManager.overwritePrompt(callbackFn.checkName,callbackFn.nextAction);
		}
		else{
			SaveManager.fileName=callbackFn.checkName;
			SaveManager.named=true;
			SaveManager.save(callbackFn.nextAction);
		}
	};
	callbackFn.checkName=checkName;
	callbackFn.nextAction=nextAction;
	HtmlServer.sendRequestWithCallback("data/files",callbackFn);
};
SaveManager.overwritePrompt=function(checkName,nextAction){
	var callbackFn=function(response){
		if(response==2){
			SaveManager.fileName=callbackFn.checkName;
			SaveManager.named=true;
			SaveManager.save(callbackFn.nextAction);
		}
		else{
			SaveManager.saveAs(callbackFn.nextAction);
		}
	};
	callbackFn.checkName=checkName;
	callbackFn.nextAction=nextAction;
	var question="There is already a file named \""+checkName+"\". Would you like to replace it?";
	HtmlServer.showChoiceDialog("Confirm overwrite",question,"Don't replace","Replace",true,callbackFn);
};
SaveManager.new=function(){
	var callbackFnNew=function(){
		SaveManager.fileName = "New project";
		SaveManager.named = false;
		SaveManager.markSaved();
		SaveManager.loadFile("<project><tabs></tabs></project>");
	};
	SaveManager.checkPromptSave(callbackFnNew);
};
SaveManager.loadFile=function(xmlString){
	if(xmlString.length>0) {
		if(xmlString.charAt(0)=="%"){
			xmlString=decodeURIComponent(xmlString);
		}
		var xmlDoc = XmlWriter.openDoc(xmlString);
		var project = XmlWriter.findElement(xmlDoc, "project");
		if (project == null) {
			return;
		}
		CodeManager.importXml(project);
	}
};
/////////////////////////
SaveManager.autoSave=function(){
	XmlWriter.downloadDoc(CodeManager.createXml(),"autoSave");
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