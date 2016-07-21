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
				if(callbackFn.nextAction!=null) {
					callbackFn.nextAction();
				}
			}
		};
		callbackFn.nextAction=nextAction;
		HtmlServer.showChoiceDialog("Save changes",question,"Don't Save","Save",true,callbackFn);
	}
	else if(nextAction!=null) {
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
		response=SaveManager.cleanFileName(response);
		if(!cancelled&&response.length>0) {
			SaveManager.checkOverwrite(response,function(){
				SaveManager.fileName=response;
				SaveManager.named=true;
				SaveManager.save(callbackFn.nextAction);
			},function(){
				SaveManager.saveAs(callbackFn.nextAction);
			});
		}
	};
	callbackFn.nextAction=nextAction;
	HtmlServer.showDialog("Save","Enter a file name","",callbackFn);
};
SaveManager.checkOverwrite=function(checkName,successAction,failAction){
	var callbackFn=function(response){
		if(response.split("\n").indexOf(checkName)!=-1){
			SaveManager.overwritePrompt(callbackFn.checkName,callbackFn.successAction,callbackFn.failAction);
		}
		else{
			callbackFn.successAction();
		}
	};
	callbackFn.checkName=checkName;
	callbackFn.successAction=successAction;
	callbackFn.failAction=failAction;
	HtmlServer.sendRequestWithCallback("data/files",callbackFn);
};
SaveManager.overwritePrompt=function(checkName,successAction,failAction){
	var callbackFn=function(response){
		if(response==2){
			callbackFn.successAction();
		}
		else{
			callbackFn.failAction();
		}
	};
	callbackFn.checkName=checkName;
	callbackFn.successAction=successAction;
	callbackFn.failAction=failAction;
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
			//HtmlServer.showChoiceDialog("file",xmlString,"Done","Done",true);
		}
		var xmlDoc = XmlWriter.openDoc(xmlString);
		var project = XmlWriter.findElement(xmlDoc, "project");
		if (project == null) {
			return;
		}
		CodeManager.importXml(project);
	}
};
SaveManager.cleanFileName=function(fileName){
	var illegalChars="#%&{}\\<>*?/ $!'\":@+`|=\n.";
	fileName=fileName.trim();
	for(var i=0;i<illegalChars.length;i++){
		fileName=fileName.split(illegalChars.charAt(i)).join();
	}
	if(fileName.length>30){
		fileName=fileName.substring(0,30);
	}
	fileName=fileName.trim();
	return fileName;
};
SaveManager.renamePrompt=function(){
	var currentName=SaveManager.fileName;
	if(!SaveManager.named){
		currentName="";
	}
	var callbackFn=function(cancelled,response){
		response=SaveManager.cleanFileName(response);
		if(!cancelled&&response.length>0) {
			SaveManager.checkOverwrite(response,function(){
				SaveManager.rename(response);
			},SaveManager.renamePrompt);
		}
	};
	HtmlServer.showDialog("Rename","Enter a file name",currentName,callbackFn);
};
SaveManager.rename=function(newName){
	var callbackFn=function(){
		SaveManager.fileName=callbackFn.newName;
		SaveManager.named=true;
		SaveManager.save(null);
	};
	callbackFn.newName=newName;
	HtmlServer.sendRequestWithCallback("data/rename/"+SaveManager.fileName+"/"+newName,callbackFn);
};
SaveManager.promptForDelete=function(){
	if(!SaveManager.named&&!SaveManager.modified){
		return;
	}
	var callbackFn=function(response){
		if(response==2){
			SaveManager.modified=false;
			if(SaveManager.named){
				SaveManager.delete();
			}
			else{
				SaveManager.new();
			}
		}
	};
	var question="Are you sure you want to delete \""+SaveManager.fileName+"\"?";
	HtmlServer.showChoiceDialog("Delete",question,"Cancel","Delete",true,callbackFn,null);
};
SaveManager.delete=function(){
	var callbackFn=function(){
		SaveManager.new();
	};
	HtmlServer.sendRequestWithCallback("data/delete/"+SaveManager.fileName,callbackFn);
};


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
