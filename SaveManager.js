function SaveManager(){
	SaveManager.invalidCharacters = "\\/:*?<>|.\n\r\0\"";
	SaveManager.invalidCharactersFriendly = "\\/:*?<>|.$";
	SaveManager.newFileName = "new program";
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
		if(oldFilename == SaveManager.fileName) {
			SaveManager.saveCurrentDoc(false, newName, true);
		}
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
				if(filename == SaveManager.fileName) {
					SaveManager.openBlank(nextAction);
				} else{
					if(nextAction != null) nextAction();
				}
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
SaveManager.duplicate = function(filename){ //TODO: fix this function to POST
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
			if(!load.blank) {
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
			load.blank = true;
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
SaveManager.currentDoc = function(){ //Autosaves
	if(SaveManager.fileName == null) return null;
	var result = {};
	result.data = XmlWriter.docToText(CodeManager.createXml());
	result.filename = SaveManager.fileName;
	return result;
};