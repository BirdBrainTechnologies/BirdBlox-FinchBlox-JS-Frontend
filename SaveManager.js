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
			CodeManager.importXml(project);
		}
	} else{
		SaveManager.loadData("<project><tabs></tabs></project>"); //TODO: change this line
		//TODO: fail file open
	}
};
SaveManager.backendSetName = function(fileName){
	SaveManager.named = true;
	SaveManager.fileName = fileName;
	TitleBar.setText(fileName);
};
SaveManager.backendClose = function(){
	SaveManager.loadBlank();
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
	const xmlDocText = XmlWriter.docToText(CodeManager.createXml());
	const request = new HttpRequestBuilder("data/autoSave");
	HtmlServer.sendRequestWithCallback(request.toString(),nextAction, null,true,xmlDocText);
};
SaveManager.userOpenFile = function(fileName){
	if(SaveManager.fileName === fileName) {return;}
	SaveManager.autoSave(function(){
		const request = new HttpRequestBuilder("data/open");
		request.addParam("filename", fileName);
		HtmlServer.sendRequestWithCallback(request.toString());
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
	HtmlServer.showDialog(title,message,defaultName,function(cancelled,response){
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
	request.addParam("recording", "" + isRecording);
	HtmlServer.sendRequestWithCallback(request.toString());
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
	request.addParam("recording", "" + isRecording);
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};
SaveManager.getAvailableName = function(filename, callbackFn, isRecording){
	if(isRecording == null){
		isRecording = false;
	}
	DebugOptions.validateNonNull(callbackFn);
	const request = new HttpRequestBuilder("data/getAvailableName");
	request.addParam("filename", filename);
	request.addParam("recording", "" + isRecording);
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
SaveManager.userDuplicateFile = function(filename){
	SaveManager.promptDuplicate(filename, "Enter name for duplicate file");
};
SaveManager.promptDuplicate = function(message, filename){
	SaveManager.getAvailableName(filename, function(availableName){
		SaveManager.promptDuplicateWithDefault(message, filename, availableName);
	});
};
SaveManager.promptDuplicateWithDefault = function(message, filename, defaultName){
	HtmlServer.showDialog("Duplicate", message, defaultName, function(cancelled, response){
		if(!cancelled){
			SaveManager.sanitizeDuplicate(response.trim(), filename);
		}
	});
};
SaveManager.sanitizeDuplicate = function(proposedName, filename){
	if(proposedName === ""){
		SaveManager.promptDuplicate("Name cannot be blank. Enter a file name.", filename);
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable){
			if(alreadySanitized && alreadyAvailable){
				SaveManager.duplicate(filename, availableName);
			} else if(!alreadySanitized){
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptDuplicateWithDefault(message, filename, availableName);
			} else if(!alreadyAvailable){
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptDuplicateWithDefault(message, filename, availableName);
			}
		});
	}
};
SaveManager.duplicate = function(filename, newName){
	const request = new HttpRequestBuilder("data/duplicate");
	request.addParam("filename", filename);
	request.addParam("newFilename", newName);
	HtmlServer.sendRequestWithCallback(request.toString());
};
SaveManager.userExportFile = function(filename){
	if(SaveManager.fileName == null) return;
	SaveManager.export();
};
SaveManager.export=function(filename){
	const request = new HttpRequestBuilder("data/export");
	request.addParam("filename", filename);
	HtmlServer.sendRequestWithCallback(request.toString());
};
SaveManager.saveAsNew = function(){
	SaveManager.saving = true;
	const request = new HttpRequestBuilder("data/new");
	const xmlDocText = XmlWriter.docToText(CodeManager.createXml());
	HtmlServer.sendRequestWithCallback(request.toString(), function(){
		SaveManager.saving = false;
	}, function(){
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



