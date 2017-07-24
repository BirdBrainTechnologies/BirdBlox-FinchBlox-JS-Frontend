function SaveManager(){
	SaveManager.fileName = null;
	SaveManager.named = false;
	SaveManager.autoSaveTimer = new Timer(SaveManager.autoSaveInterval, SaveManager.autoSave);
	SaveManager.autoSaveTimer.start();
	SaveManager.saving = false;
}
SaveManager.setConstants = function(){
	//SaveManager.invalidCharacters = "\\/:*?<>|.\n\r\0\"";
	SaveManager.invalidCharactersFriendly = "\\/:*?<>|.$";
	SaveManager.autoSaveInterval = 1000 * 15;
};
SaveManager.backendOpen = function(fileName, data, named) {
	SaveManager.named = named;
	SaveManager.fileName = fileName;
	SaveManager.loadData(data);
};
SaveManager.loadData = function(data) {
	if (data.length > 0) {
		if (data.charAt(0) === "%") {
			data = decodeURIComponent(data);
		}
		const xmlDoc = XmlWriter.openDoc(data);
		const project = XmlWriter.findElement(xmlDoc, "project");
		if (project == null) {
			SaveManager.loadData("<project><tabs></tabs></project>"); //TODO: change this line
		} else {
			(DebugOptions.safeFunc(CodeManager.importXml))(project);
		}
	} else{
		SaveManager.loadData("<project><tabs></tabs></project>"); //TODO: change this line
		//TODO: fail file open
	}
};
SaveManager.backendSetName = function(fileName, named){
	SaveManager.named = named;
	SaveManager.fileName = fileName;
	TitleBar.setText(fileName);
};
SaveManager.backendClose = function(){
	SaveManager.loadBlank();
};
SaveManager.backendMarkLoading = function(){
	OpenDialog.closeDialog();
	CodeManager.markLoading("Loading...");
};

SaveManager.loadBlank = function(){
	SaveManager.fileName = null;
	SaveManager.named = false;
	SaveManager.loadData("<project><tabs></tabs></project>");
};
SaveManager.userNew = function(){
	SaveManager.autoSave(function(){
		const request = new HttpRequestBuilder("data/close");
		HtmlServer.sendRequestWithCallback(request.toString(), function(){
			SaveManager.loadBlank();
		});
	});
};
SaveManager.autoSave = function(nextAction){
	if(SaveManager.fileName == null){
		if (nextAction != null) nextAction();
		return;
	}
	const xmlDocText = XmlWriter.docToText(CodeManager.createXml());
	const request = new HttpRequestBuilder("data/autoSave");
	HtmlServer.sendRequestWithCallback(request.toString(),nextAction, null,true,xmlDocText);
};
SaveManager.userOpenFile = function(fileName){
	if(SaveManager.fileName === fileName) {return;}
	const request = new HttpRequestBuilder("data/open");
	request.addParam("filename", fileName);
	CodeManager.markLoading("Loading...");
	HtmlServer.sendRequestWithCallback(request.toString(),function(){

	}, function(){
		CodeManager.cancelLoading();
	});
};
SaveManager.userRenameFile = function(isRecording, oldFilename, nextAction){
	SaveManager.promptRename(isRecording, oldFilename, "Name", null, nextAction);
};
SaveManager.promptRename = function(isRecording, oldFilename, title, message, nextAction){
	SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, oldFilename, nextAction);
};
SaveManager.promptRenameWithDefault = function(isRecording, oldFilename, title, message, defaultName, nextAction){
	if(message == null){
		message = "Enter a file name";
	}
	HtmlServer.showDialog(title,message,defaultName,true,function(cancelled,response){
		if(!cancelled){
			SaveManager.sanitizeRename(isRecording, oldFilename, title, response.trim(), nextAction);
		}
	});
};
// Checks if a name is legitimate and renames the current file to that name if it is.
SaveManager.sanitizeRename = function(isRecording, oldFilename, title, proposedName, nextAction){
	if(proposedName === ""){
		SaveManager.promptRename(isRecording, oldFilename, title, "Name cannot be blank. Enter a file name.", nextAction);
	} else if(proposedName === oldFilename) {
		if(nextAction != null) nextAction();
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable){
			if(alreadySanitized && alreadyAvailable){
				SaveManager.renameSoft(isRecording, oldFilename, title, availableName, nextAction);
			} else if(!alreadySanitized){
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, availableName, nextAction);
			} else if(!alreadyAvailable){
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, availableName, nextAction);
			}
		}, isRecording);
	}
};
SaveManager.renameSoft = function(isRecording, oldFilename, title, newName, nextAction){
	const request = new HttpRequestBuilder("data/rename");
	request.addParam("oldFilename", oldFilename);
	request.addParam("newFilename", newName);
	SaveManager.addTypeToRequest(request, isRecording);
	let callback = nextAction;
	if(isRecording){
		callback = function(){
			CodeManager.renameRecording(oldFilename, newName);
			if(nextAction != null) nextAction();
		}
	}
	HtmlServer.sendRequestWithCallback(request.toString(), callback);
};
SaveManager.userDeleteFile=function(isRecording, filename, nextAction){
	const question = "Are you sure you want to delete \"" + filename + "\"?";
	HtmlServer.showChoiceDialog("Delete", question, "Cancel", "Delete", true, function (response) {
		if(response === "2") {
			SaveManager.delete(isRecording, filename, nextAction);
		}
	}, null);
};
SaveManager.delete = function(isRecording, filename, nextAction){
	const request = new HttpRequestBuilder("data/delete");
	request.addParam("filename", filename);
	SaveManager.addTypeToRequest(request, isRecording);
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};
SaveManager.getAvailableName = function(filename, callbackFn, isRecording){
	if(isRecording == null){
		isRecording = false;
	}
	DebugOptions.validateNonNull(callbackFn);
	const request = new HttpRequestBuilder("data/getAvailableName");
	request.addParam("filename", filename);
	SaveManager.addTypeToRequest(request, isRecording);
	HtmlServer.sendRequestWithCallback(request.toString(), function(response){
		let json = {};
		try {
			json = JSON.parse(response);
		} catch(e){

		}
		if(json.availableName != null){
			callbackFn(json.availableName, json.alreadySanitized == true, json.alreadyAvailable == true);
		}
	});
};
SaveManager.userDuplicateFile = function(filename, nextAction){
	SaveManager.promptDuplicate("Enter name for duplicate file", filename, nextAction);
};
SaveManager.promptDuplicate = function(message, filename, nextAction){
	SaveManager.getAvailableName(filename, function(availableName){
		SaveManager.promptDuplicateWithDefault(message, filename, availableName, nextAction);
	});
};
SaveManager.promptDuplicateWithDefault = function(message, filename, defaultName, nextAction){
	HtmlServer.showDialog("Duplicate", message, defaultName, true, function(cancelled, response){
		if(!cancelled){
			SaveManager.sanitizeDuplicate(response.trim(), filename, nextAction);
		}
	});
};
SaveManager.sanitizeDuplicate = function(proposedName, filename, nextAction){
	if(proposedName === ""){
		SaveManager.promptDuplicate("Name cannot be blank. Enter a file name.", filename, nextAction);
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable){
			if(alreadySanitized && alreadyAvailable){
				SaveManager.duplicate(filename, availableName, nextAction);
			} else if(!alreadySanitized){
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptDuplicateWithDefault(message, filename, availableName, nextAction);
			} else if(!alreadyAvailable){
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptDuplicateWithDefault(message, filename, availableName, nextAction);
			}
		});
	}
};
SaveManager.duplicate = function(filename, newName, nextAction){
	const request = new HttpRequestBuilder("data/duplicate");
	request.addParam("filename", filename);
	request.addParam("newFilename", newName);
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};
SaveManager.userExportFile = function(filename, x1, x2, y1, y2){
	SaveManager.exportFile(filename, x1, x2, y1, y2);
};
SaveManager.exportFile = function(filename, x1, x2, y1, y2){
	const request = new HttpRequestBuilder("data/export");
	request.addParam("filename", filename);
	if(x1 != null && x2 != null && y1 != null && y2 != null) {
		request.addParam("tlx", x1);
		request.addParam("tly", y1);
		request.addParam("brx", x2);
		request.addParam("bry", y2);
	}
	HtmlServer.sendRequestWithCallback(request.toString());
};
SaveManager.saveAsNew = function(){
	SaveManager.saving = true;
	const request = new HttpRequestBuilder("data/new");
	const xmlDocText = XmlWriter.docToText(CodeManager.createXml());
	CodeManager.markLoading("Saving...");
	HtmlServer.sendRequestWithCallback(request.toString(), function(){
		SaveManager.saving = false;
	}, function(){
		CodeManager.cancelLoading();
		SaveManager.saving = false;
	}, true, xmlDocText);
};
SaveManager.markEdited=function(){
	CodeManager.updateModified();
	if(SaveManager.fileName == null && !SaveManager.saving){
		SaveManager.saveAsNew();
	}
	if(SaveManager.fileName != null){
		SaveManager.autoSave();
	}
};
SaveManager.currentDoc = function(){ //Autosaves
	if(SaveManager.fileName == null) return null;
	var result = {};
	result.data = XmlWriter.docToText(CodeManager.createXml());
	result.filename = SaveManager.fileName;
	return result;
};
SaveManager.saveAndName = function(message, nextAction){
	let title = "Enter name";
	if(SaveManager.fileName == null){
		if (nextAction != null) nextAction();
		return;
	}
	SaveManager.autoSave(function () {
		if (SaveManager.named) {
			if (nextAction != null) nextAction();
		}
		else {
			SaveManager.promptRename(false, SaveManager.fileName, title, message, function () {
				SaveManager.named = true;
				if (nextAction != null) nextAction();
			});
		}
	});
};
SaveManager.userOpenDialog = function(){
	const message = "Please name this file";
	SaveManager.saveAndName(message, OpenDialog.showDialog, OpenDialog.showDialog);
};
SaveManager.addTypeToRequest = function(request, isRecording){
	request.addParam("type", isRecording ? "recording" : "file");
};
SaveManager.fileIsOpen = function(){
	return SaveManager.fileName != null;
};