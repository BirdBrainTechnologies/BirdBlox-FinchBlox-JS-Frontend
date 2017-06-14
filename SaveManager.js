function SaveManager(){
	if(SaveManager.currentDoc != null){
		SaveManager.fileName = SaveManager.currentDoc;
		SaveManager.named = SaveManager.currentDocNamed == "true";
		SaveManager.open(SaveManager.currentDoc, SaveManager.named);
	}

	SaveManager.invalidCharacters = "\\/:*?<>|.\n\r\0\"";
	SaveManager.invalidCharactersFriendly = "\\/:*?<>|.$";
	SaveManager.newFileName = "program";
	SaveManager.saving = false;
	SaveManager.fileName = null;
	SaveManager.named = false;

	SaveManager.getCurrentDoc();
}

SaveManager.openBlank = function(nextAction){
	SaveManager.saveCurrentDoc(true);
	SaveManager.loadFile("<project><tabs></tabs></project>");
	if(nextAction != null) nextAction();
};
SaveManager.saveAndName = function(message, nextAction){
	var title = "Enter name";
	if(SaveManager.fileName == null){
		if (nextAction != null) nextAction();
		return;
	}
	SaveManager.forceSave(function () {
		if (SaveManager.named) {
			if (nextAction != null) nextAction();
		}
		else {
			SaveManager.promptRename(SaveManager.fileName, title, message, function () {
				SaveManager.named = true;
				if (nextAction != null) nextAction();
			});
		}
	});
};
SaveManager.userOpenFile = function(fileName){
	if(SaveManager.fileName == fileName) {return;}
	SaveManager.saveAndName("Please name this file before opening a new file", function(){
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
		SaveManager.saveCurrentDoc(false, fileName, true);
		if(nextAction != null) nextAction();
	});
};
// Saves a the current file and overwrites if the name exists
SaveManager.forceSave = function(nextAction){
	var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
	var request = new HttpRequestBuilder("data/save");
	request.addParam("filename", SaveManager.fileName);
	HtmlServer.sendRequestWithCallback(request.toString(),nextAction, null,true,xmlDocText);
};
SaveManager.userRename = function(){
	if(SaveManager.fileName == null) return;
	SaveManager.forceSave(function(){
		SaveManager.promptRename(SaveManager.fileName, "Rename");
	});
};
SaveManager.userRenameFile = function(oldFilename, nextAction){
	SaveManager.promptRename(oldFilename, "Rename", null, nextAction);
};
SaveManager.promptRename = function(oldFilename, title, message, nextAction){
	SaveManager.promptRenameWithDefault(oldFilename, title, message, oldFilename, nextAction);
};
SaveManager.promptRenameWithDefault = function(oldFilename, title, message, defaultName, nextAction){
	if(message == null){
		message = "Enter a file name";
	}
	HtmlServer.showDialog(title,message,defaultName,function(cancelled,response){
		if(!cancelled){
			SaveManager.sanitizeRename(oldFilename, title, response, nextAction);
		}
	});
};
// Checks if a name is legitimate and renames the current file to that name if it is.
SaveManager.sanitizeRename = function(oldFilename, title, proposedName, nextAction){
	if(proposedName == ""){
		SaveManager.promptRename(oldFilename, title, "Name cannot be blank. Enter a file name.", nextAction);
	} else if(proposedName == oldFilename) {
		if(nextAction != null) nextAction();
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable){
			if(alreadySanitized && alreadyAvailable){
				SaveManager.renameSoft(oldFilename, title, availableName, nextAction);
			} else if(!alreadySanitized){
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptRenameWithDefault(oldFilename, title, message, availableName, nextAction);
			} else if(!alreadyAvailable){
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptRenameWithDefault(oldFilename, title, message, availableName, nextAction);
			}
		});
	}
};
SaveManager.renameSoft = function(oldFilename, title, newName, nextAction){
	var request = new HttpRequestBuilder("data/rename");
	request.addParam("oldFilename", oldFilename);
	request.addParam("newFilename", newName);
	request.addParam("options", "soft");
	HtmlServer.sendRequestWithCallback(request.toString(), function(){
		SaveManager.saveCurrentDoc(false, newName, true);
		if(nextAction != null) nextAction();
	}, function(){
		SaveManager.sanitizeRename(title, newName, nextAction);
	});
};
SaveManager.userDelete=function(){
	if(SaveManager.fileName == null) return;
	SaveManager.userDeleteFile(SaveManager.fileName);
};
SaveManager.userDeleteFile=function(filename, nextAction){
	var question = "Are you sure you want to delete \"" + filename + "\"?";
	HtmlServer.showChoiceDialog("Delete", question, "Cancel", "Delete", true, function (response) {
		if(response == "2") {
			SaveManager.delete(filename, function(){
				SaveManager.openBlank(nextAction);
			});
		}
	}, null);
};
SaveManager.delete = function(filename, nextAction){
	var request = new HttpRequestBuilder("data/delete");
	request.addParam("filename", filename);
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};
SaveManager.userNew = function(){
	SaveManager.saveAndName("Please name this file before creating a new file", SaveManager.openBlank);
};
/**
 * Issues a getAvailableName request and calls the callback with the results
 * @param filename {String}
 * @param callbackFn {function|undefined} - callbackFn(availableName, alreadySanitized, alreadyAvailable)
 */
SaveManager.getAvailableName = function(filename, callbackFn){
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
	if(SaveManager.fileName == null) return;
	SaveManager.forceSave(function(){
		SaveManager.promptDuplicate("Enter name for duplicate file");
	});
};
SaveManager.promptDuplicate = function(message){
	SaveManager.getAvailableName(SaveManager.fileName, function(availableName){
		HtmlServer.showDialog("Duplicate", message, availableName, function(cancelled, response){
			if(!cancelled){
				SaveManager.duplicate(response);
			}
		});
	});
};
SaveManager.duplicate = function(filename){
	var request = new HttpRequestBuilder("data/save");
	request.addParam("filename", filename);
	request.addParam("options", "soft");
	HtmlServer.sendRequestWithCallback(request.toString(), function(){
		SaveManager.saveCurrentDoc(false, filename, true);
	}, function(){
		let message = "\"" + filename + "\" already exists.  Enter a different name.";
		SaveManager.promptDuplicate(message);
	});
};
SaveManager.userExport=function(){
	if(SaveManager.fileName == null) return;
	SaveManager.saveAndName("Please name this file so it can be exported", function(){
		SaveManager.export();
	});
};
SaveManager.export=function(){
	var request = new HttpRequestBuilder("data/export");
	request.addParam("filename", SaveManager.fileName);
	HtmlServer.sendRequestWithCallback(request.toString());
};
SaveManager.saveAsNew = function(){
	SaveManager.saving = true;
	var request = new HttpRequestBuilder("data/save");
	request.addParam("options", "new");
	request.addParam("filename", SaveManager.newFileName);
	var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
	HtmlServer.sendRequestWithCallback(request.toString(), function(availableName){
		SaveManager.saveCurrentDoc(false, availableName, false);
		SaveManager.saving = false;
	}, function(){
		SaveManager.saving = false;
	}, true, xmlDocText);
};
SaveManager.markEdited=function(){
	if(SaveManager.fileName == null && !SaveManager.saving){
		SaveManager.saveAsNew();
	}
};
SaveManager.saveCurrentDoc = function(blank, fileName, named){
	if(blank){
		fileName = null;
		named = false;
		TitleBar.setText("");
	} else {
		TitleBar.setText(fileName);
	}
	SaveManager.fileName = fileName;
	SaveManager.named = named;
	let namedString = SaveManager.named? "true" : "false";
	if(blank) namedString = "blank";
	HtmlServer.setSetting("currentDocNamed", namedString);
	HtmlServer.setSetting("currentDoc", SaveManager.fileName);
};
SaveManager.getCurrentDoc = function(){
	var load = {};
	load.name = false;
	load.named = false;
	load.blank = false;
	load.currentDoc = null;
	load.currentDocNamed = null;
	var checkProgress = function(){
		if(load.name && load.named){
			if(load.currentDoc != null) {
				SaveManager.open(load.currentDoc, load.currentDocNamed);
			}
		}
	};
	HtmlServer.getSetting("currentDoc", function(response){
		load.currentDoc = response;
		load.name = true;
		checkProgress();
	});
	HtmlServer.getSetting("currentDocNamed", function(response){
		if(response == "true"){
			load.currentDocNamed = true;
		} else if (response == "false") {
			load.currentDocNamed = false;
		} else if (response == "blank") {
			load.currentDoc = null;
		}
		load.named = true;
		checkProgress();
	});
};



SaveManager.import=function(fileName){
	let name = HtmlServer.decodeHtml(fileName);
	SaveManager.userOpenFile(name);
};
/*SaveManager.getCurrentDocName = function(callbackFnName, callbackFnNameSet){
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
};*/
SaveManager.autoSave = function(){
	if(SaveManager.fileName == null) return null;
	var result = {};
	result.data = XmlWriter.docToText(CodeManager.createXml());
	result.filename = SaveManager.fileName;
	return result;
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
