function SaveManager(){
	if(SaveManager.currentDoc != null){
		SaveManager.fileName = SaveManager.currentDoc;
		SaveManager.named = SaveManager.currentDocNamed == "true";
		SaveManager.open(SaveManager.currentDoc, SaveManager.named);
	} else {
		SaveManager.new();
	}

	SaveManager.invalidCharacters = "\\/:*?<>|.\n\r\0\"";
	SaveManager.invalidCharactersFriendly = "\\/:*?<>|.$";
	SaveManager.newFileName = "program";
	SaveManager.makeFunctionsSafe();
}
SaveManager.userOpen = function(fileName){
	SaveManager.saveAndName("Open", null, true, function(){
		SaveManager.open(fileName);
	});
};

SaveManager.open=function(fileName, named, nextAction){
	if(named == null){
		named = true;
	}
	var request = new HttpRequestBuilder("data/load");
	request.addParam("filename", fileName);
	HtmlServer.sendRequestWithCallback(request.toString(), function (response) {
		SaveManager.loadFile(response);
		SaveManager.fileName = fileName;
		SaveManager.named = named;
		SaveManager.empty = false;
		TitleBar.setText(SaveManager.fileName);
		HtmlServer.setSetting("currentDoc", SaveManager.fileName);
		let namedString = SaveManager.named? "true" : "false";
		HtmlServer.setSetting("currentDocNamed", namedString);
		if(nextAction != null) nextAction();
	});
};

SaveManager.saveAndName = function(title, message, deleteEmpty, nextAction){
	if(SaveManager.empty && deleteEmpty){
		SaveManager.delete(nextAction);
	} else {
		SaveManager.forceSave(function () {
			if (SaveManager.named) {
				if (nextAction != null) nextAction();
			}
			else {
				SaveManager.promptRename(title, message, function () {
					if (nextAction != null) nextAction();
				});
			}
		});
	}
};

// Saves a file and overwrites if the name exists
SaveManager.forceSave = function(nextAction){
	var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
	var request = new HttpRequestBuilder("data/save");
	request.addParam("filename", SaveManager.fileName);
	HtmlServer.sendRequestWithCallback(request.toString(),nextAction, null,true,xmlDocText);
};

SaveManager.userRename = function(){
	SaveManager.forceSave(function(){
		SaveManager.promptRename("Rename", null);
	});
};

SaveManager.promptRename = function(title, message, nextAction){
	SaveManager.promptRenameWithDefault(title, message, SaveManager.fileName, nextAction);
};

SaveManager.promptRenameWithDefault = function(title, message, defaultName, nextAction){
	if(message == null){
		message = "Enter a file name";
	}
	HtmlServer.showDialog(title,message,defaultName,function(cancelled,response){
		if(!cancelled){
			SaveManager.sanitizeRename(title, response, nextAction);
		}
	});
};

// Checks if a name is legitimate and renames the current file to that name if it is.
SaveManager.sanitizeRename = function(title, proposedName, nextAction){

	if(proposedName == ""){
		SaveManager.promptRename(title, "Name cannot be blank. Enter a file name.", SaveManager.fileName, nextAction);
	} else if(proposedName == SaveManager.fileName) {
		SaveManager.named = true;
		if(nextAction != null) nextAction();
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable){
			if(alreadySanitized && alreadyAvailable){
				SaveManager.renameSoft(title, availableName, nextAction);
			} else if(!alreadySanitized){
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptRenameWithDefault(title, message, availableName, nextAction);
			} else if(!alreadyAvailable){
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptRenameWithDefault(title, message, availableName, nextAction);
			}
		});
	}
};

SaveManager.renameSoft = function(title, newName, nextAction){
	var request = new HttpRequestBuilder("data/rename");
	request.addParam("oldFilename", SaveManager.fileName);
	request.addParam("newFilename", newName);
	request.addParam("options", "soft");
	HtmlServer.sendRequestWithCallback(request.toString(), function(){
		SaveManager.named = true;
		SaveManager.fileName = newName;
		TitleBar.setText(SaveManager.fileName);
		if(nextAction != null) nextAction();
	}, function(){
		SaveManager.sanitizeRename(title, newName, nextAction);
	});
};

SaveManager.userDelete=function(){
	if(SaveManager.empty && !SaveManager.named){
		SaveManager.delete();
	} else {
		var question = "Are you sure you want to delete \"" + SaveManager.fileName + "\"?";
		HtmlServer.showChoiceDialog("Delete", question, "Cancel", "Delete", true, function (response) {
			if(response == "2") {
				SaveManager.delete(SaveManager.new);
			}
		}, null);
	}
};
SaveManager.delete = function(nextAction){
	var request = new HttpRequestBuilder("data/delete");
	request.addParam("filename", SaveManager.fileName);
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};
SaveManager.userNew = function(){
	SaveManager.saveAndName("New", null, true, SaveManager.new);
};
SaveManager.new = function(){
	var request = new HttpRequestBuilder("data/save");
	request.addParam("options", "new");
	request.addParam("filename", SaveManager.newFileName);
	HtmlServer.sendRequestWithCallback(request.toString(), function(availableName){
		SaveManager.fileName = availableName;
		TitleBar.setText(SaveManager.fileName);
		SaveManager.named = false;
		SaveManager.empty = true;
		SaveManager.loadFile("<project><tabs></tabs></project>");
	});
};
/**
 * Issues a getAvailableName request and calls the callback with the results
 * @param filename {String}
 * @param callbackFn {function|undefined} - callbackFn(availableName, alreadySanitized, alreadyAvailable)
 */
SaveManager.getAvailableName = function(filename, callbackFn){
	SaveManager.printStatus("getAvailableName");
	DebugOptions.validateNonNull(callbackFn);
	var request = new HttpRequestBuilder("data/getAvailableName");
	request.addParam("filename", filename);
	HtmlServer.sendRequestWithCallback(request.toString(), function(response){
		var json = JSON.parse(response);
		if(json.availableName != null){
			callbackFn(json.availableName, json.alreadySanitized == true, json.alreadyAvailable == true);
		}
	});
};
SaveManager.loadFile=function(xmlString) {
	SaveManager.printStatus("loadFile");
	if (xmlString.length > 0) {
		if (xmlString.charAt(0) == "%") {
			xmlString = decodeURIComponent(xmlString);
			//HtmlServer.showChoiceDialog("file",xmlString,"Done","Done",true);
		}
		var xmlDoc = XmlWriter.openDoc(xmlString);
		var project = XmlWriter.findElement(xmlDoc, "project");
		if (project == null) {
			SaveManager.loadFile("<project><tabs></tabs></project>");
		}
		CodeManager.importXml(project);
	}
};
SaveManager.userDuplicate = function(){
	SaveManager.printStatus("userDuplicate");
	SaveManager.forceSave(function(){
		SaveManager.promptDuplicate("Enter name for duplicate file");
	});
};
SaveManager.promptDuplicate = function(message, nextAction){
	SaveManager.printStatus("promptDuplicate");
	SaveManager.getAvailableName(SaveManager.fileName, function(availableName){
		HtmlServer.showDialog("Duplicate", message, availableName, function(cancelled, response){
			if(!cancelled){
				SaveManager.duplicate(response);
			}
		});
	});
};
SaveManager.duplicate = function(filename){
	SaveManager.printStatus("duplicate");
	var request = new HttpRequestBuilder("data/save");
	request.addParam("filename", filename);
	request.addParam("options", "soft");
	HtmlServer.sendRequestWithCallback(request.toString(), function(){
		SaveManager.fileName = filename;
		TitleBar.setText(SaveManager.fileName);
		SaveManager.named = true;
		SaveManager.empty = false;
	}, function(){
		let message = "\"" + filename + "\" already exists.  Enter a different name.";
		SaveManager.promptDuplicate(message);
	});
};
SaveManager.userExport=function(){
	SaveManager.printStatus("userExport");
	SaveManager.saveAndName("Export", null, false, function(){
		SaveManager.export();
	});
};
SaveManager.export=function(){
	SaveManager.printStatus("export");
	var request = new HttpRequestBuilder("data/export");
	request.addParam("filename", SaveManager.fileName);
	HtmlServer.sendRequestWithCallback(request.toString());
};
SaveManager.markEdited=function(){
	SaveManager.printStatus("markEdited");
	SaveManager.empty = false;
};
SaveManager.import=function(fileName){
	SaveManager.printStatus("import");
	let name = HtmlServer.encodeHtml(fileName);
	SaveManager.userOpen(name);
};
SaveManager.getCurrentDocName = function(callbackFnName, callbackFnNameSet){
	SaveManager.printStatus("getCurrentDocName");
	HtmlServer.getSetting("currentDoc", function(response){
		SaveManager.currentDoc = response;
		SaveManager.fileName = response;
		callbackFnName();
	}, callbackFnName);
	HtmlServer.getSetting("currentDocNamed", function(response){
		SaveManager.currentDocNamed = response;
		callbackFnNameSet();
	}, callbackFnNameSet);
};
SaveManager.autoSave = function(){
	SaveManager.printStatus("autoSave");
	return xmlDocText=XmlWriter.docToText(CodeManager.createXml());
};
SaveManager.printStatus = function(functionName){
	var data = "fn: " + functionName + "\n";
	data += "fileName: " + SaveManager.fileName + "\n";
	data += "empty: " + SaveManager.empty + "\n";
	data += "named: " + SaveManager.named + "\n";

	data += "currrentDoc: " + SaveManager.currentDoc + "\n";
	data += "currentDocNamed: " + SaveManager.currentDocNamed + "\n";
};
SaveManager.makeFunctionsSafe = function(){
	var funcs = ["userOpen", "open", "saveAndName", "forceSave", "userRename", "promptRename", "promptRenameWithDefault",
	"sanitizeRename", "sanitizeRename", "renameSoft", "userDelete", "delete", "userNew", "new", "getAvailableName", "loadFile",
	"userDuplicate", "promptDuplicate", "duplicate", "userExport", "export", "markEdited", "import", "getCurrentDocName",
	"autoSave"];
	for (let i = 0; i < funcs.length; i++){
		let func = funcs[i];
		SaveManager[func] = DebugOptions.safeFunc(SaveManager[func]);
	}
};

/*

function SaveManager(){
	SaveManager.fileName="New project";
	//SaveManager.modified=false;
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
		HtmlServer.sendRequestWithCallback("data/load?filename=" + fileName, callbackFn);
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
			else if(response=="1"){
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
		HtmlServer.sendRequestWithCallback("data/save?filename="+SaveManager.fileName,nextAction, null,true,xmlDocText);
		SaveManager.markSaved();
	}
	else{
		SaveManager.saveAs(nextAction);
	}
};
SaveManager.exportPrompt=function(){
	SaveManager.save(SaveManager.export);
};
SaveManager.export=function(){
	var fileName;
	if(SaveManager.named){
		fileName=SaveManager.fileName;
		var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
		HtmlServer.sendRequestWithCallback("data/export?filename="+fileName);
	}
};
SaveManager.import=function(fileName,projectData){
	SaveManager.loadFile(projectData);
	SaveManager.fileName = fileName;
	SaveManager.named = true;
	SaveManager.markEdited();
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
		if(response=="2"){
			callbackFn.successAction();
		}
		else if(response=="1"){
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
			SaveManager.loadFile("<project><tabs></tabs></project>");
		}
		CodeManager.importXml(project);
	}

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
	var request = "data/rename/";
	request += "?oldFilename=" + SaveManager.fileName;
	request += "&newFilename=" + newName;
	HtmlServer.sendRequestWithCallback(request,callbackFn);
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
	HtmlServer.sendRequestWithCallback("data/delete?filename="+SaveManager.fileName,callbackFn);
};
SaveManager.autoSave=function(){
	if(SaveManager.named){
		SaveManager.save();
	}
	else{
		var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
		HtmlServer.sendRequestWithCallback("data/autoSave",null, null,true,xmlDocText);
		SaveManager.markSaved();
	}
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
}; */
