/**
 * Static class for file management.  Tracks the currently open file and deals with saving/opening files.
 */
function SaveManager() {
	// The name of the name, or null when the blank canvas is open
	SaveManager.fileName = null;
	// The file is auto saved any time it is edited and one every few seconds
	SaveManager.autoSaveTimer = new Timer(SaveManager.autoSaveInterval, SaveManager.autoSave);
	SaveManager.autoSaveTimer.start();
}

SaveManager.setConstants = function() {
	//SaveManager.invalidCharacters = "\\/:*?<>|.\n\r\0\"";
	// These characters can't be used in file names
	SaveManager.invalidCharactersFriendly = "\\/:*?<>|.$";
	SaveManager.autoSaveInterval = 1000 * 60;
	SaveManager.newProgName = "New program";
	SaveManager.emptyProgData = "<project><tabs></tabs></project>";
};

/**
 * Called when the backend would like to open a file
 * @param {string} fileName - The name of the file
 * @param {string} data - The content of the file
 * @param {boolean} named - false if the user should be prompted to name the file when they try to use the OpenDialog
 */
SaveManager.backendOpen = function(fileName, data) {
	SaveManager.fileName = fileName;
	SaveManager.loadData(data);
};

/**
 * Reads the file contents from the XML
 * @param {string} data - A string of XML data
 * TODO: Provide a way for loading to fail if critical tags are missing rather than opening a blank document
 */
SaveManager.loadData = function(data) {
	if (data.length > 0) {
		if (data.charAt(0) === "%") {
			// The data haas an extra layer of encoding that needs to be removed
			data = decodeURIComponent(data);
		}
		const xmlDoc = XmlWriter.openDoc(data);
		const project = XmlWriter.findElement(xmlDoc, "project");
		if (project == null) {
			// There's no project tag.  The data is seriously corrupt, so we just open an empty file
			SaveManager.loadData(SaveManager.emptyProgData);
		} else {
			(DebugOptions.safeFunc(CodeManager.importXml))(project);
		}
	} else {
		// There's no data at all, so open an empty file
		SaveManager.loadData(SaveManager.emptyProgData);
	}
};

/**
 * Changes the name of the open file to match the provided name
 * @param {string} fileName
 */
SaveManager.backendSetName = function(fileName) {
	SaveManager.fileName = fileName;
	TitleBar.setText(fileName);
	CodeManager.markOpen();
};

/**
 * Clears the canvas and shows an Open Dialog
 */
SaveManager.backendClose = function() {
	SaveManager.loadBlank();
	OpenDialog.showDialog();
};

/**
 * Shows that a file is loading
 */
SaveManager.backendMarkLoading = function() {
	OpenDialog.closeDialog();
	CodeManager.markLoading("Loading...");
};

/**
 * Loads a blank canvas
 */
SaveManager.loadBlank = function() {
	SaveManager.fileName = null;
	SaveManager.loadData(SaveManager.emptyProgData);
};

/**
 * Closes the open file and notifies the backend
 * @param {function} nextAction
 */
SaveManager.userClose = function(nextAction) {
	SaveManager.loadBlank();
	const request = new HttpRequestBuilder("data/close");
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};

/**
 * Prompts the user for a name for the new file, creates it, and opens it (when the backend says it's loaded)
 * @param {function} [nextAction]
 */
SaveManager.userNew = function(nextAction) {
	SaveManager.promptNewFile("Enter file name", nextAction);
};

/**
 * Prompts the user for the file to create. Finds a good default name and prefills the dialog with that.
 * @param {string} message - The message to show in the body of the prompt
 * @param {function} [nextAction]
 */
SaveManager.promptNewFile = function(message, nextAction) {
	SaveManager.getAvailableName(SaveManager.newProgName, function(availableName, alreadySanitized, alreadyAvailable) {
		SaveManager.promptNewFileWithDefault(message, availableName, nextAction);
	});
};

/**
 * Prompts the user for the name of the file to create. Prefills the dialog with the default name
 * @param {string} message - The message to show in the body of the prompt
 * @param {string} defaultName - The name to prefill
 * @param {function} [nextAction]
 */
SaveManager.promptNewFileWithDefault = function(message, defaultName, nextAction) {
	DialogManager.showPromptDialog("New", message, defaultName, true, function(cancelled, response) {
		if (!cancelled) {
			SaveManager.sanitizeNew(response.trim(), nextAction);
		}
	});
};

/**
 * Verifies with the backend that the proposed name is valid for a new file and creates it. Prompts user otherwise
 * @param {string} proposedName - The name to check
 * @param {function} [nextAction]
 */
SaveManager.sanitizeNew = function(proposedName, nextAction) {
	if (proposedName === "") {
		const message = "Name cannot be blank. Enter a file name.";
		SaveManager.promptNewFile(message, nextAction);
	} else {
		GuiElements.alert("getting name");
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable) {
			GuiElements.alert("Got available name" + availableName + "," + alreadySanitized + "," + alreadyAvailable);
			if (alreadySanitized && alreadyAvailable) {
				SaveManager.newSoft(availableName, nextAction);
			} else if (!alreadySanitized) {
				GuiElements.alert("not sanitized" + availableName + "," + alreadySanitized + "," + alreadyAvailable);
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptNewFileWithDefault(message, availableName, nextAction);
			} else if (!alreadyAvailable) {
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptNewFileWithDefault(message, availableName, nextAction);
			}
		});
	}
};

/**
 * Creates a new file with the given name, clears the canvas, and shows "Saving..." until the document is opened.
 * @param {string} filename - The already validated name to save the file as
 * @param {function} [nextAction]
 */
SaveManager.newSoft = function(filename, nextAction) {
	const request = new HttpRequestBuilder("data/new");
	request.addParam("filename", filename);
	SaveManager.loadBlank();
	CodeManager.markLoading("Saving...");
	// If the saving fails, we show the open dialog so the user can try again.
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction, null, true, SaveManager.emptyProgData);
};

/**
 * Sends the current file's data to the backend to save
 * @param {function} [nextAction] - The function to call once the data is successfully sent
 */
SaveManager.autoSave = function(nextAction) {
	if (SaveManager.fileName == null) {
		if (nextAction != null) nextAction();
		return;
	}
	const xmlDocText = XmlWriter.docToText(CodeManager.createXml());
	const request = new HttpRequestBuilder("data/autoSave");
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction, null, true, xmlDocText);
};

/**
 * Tells the backend to open the specified file.  The backend will call CallbackManager.data.open with the data.
 * @param {string} fileName - The file to open
 */
SaveManager.userOpenFile = function(fileName) {
	const request = new HttpRequestBuilder("data/open");
	request.addParam("filename", fileName);
	CodeManager.markLoading("Loading...");
	HtmlServer.sendRequestWithCallback(request.toString(), function() {

	}, function() {
		CodeManager.cancelLoading();
	});
};

/**
 * Prompts the user for a name for the file
 * @param {boolean} isRecording - Whether the file is actually a recording (this reduces redundancy since the dialogs
 *                                are the same
 * @param {string} oldFilename - The name of the file to rename
 * @param {function} nextAction - The function to call after the rename is done and succeeds
 */
SaveManager.userRenameFile = function(isRecording, oldFilename, nextAction) {
	// We use the default message with the title "Name"
	SaveManager.promptRename(isRecording, oldFilename, "Name", null, nextAction);
};

/**
 * Prompts the user to rename a file, with the specified title and message for the dialog
 * @param {boolean} isRecording
 * @param {string} oldFilename
 * @param {string} title - The title of the prompt dialog
 * @param {string|null} [message] - The message for the dialog
 * @param {function} nextAction
 */
SaveManager.promptRename = function(isRecording, oldFilename, title, message, nextAction) {
	// We prefill the old filename
	SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, oldFilename, nextAction);
};

/**
 * Prompts the user to rename a file, with the specified suggested name prefilled.
 * @param {boolean} isRecording
 * @param {string} oldFilename
 * @param {string} title
 * @param {string|null} [message="Enter a file name"]
 * @param {string} defaultName - The name to prefill into the dialog
 * @param {function} nextAction
 */
SaveManager.promptRenameWithDefault = function(isRecording, oldFilename, title, message, defaultName, nextAction) {
	if (message == null) {
		message = "Enter a file name";
	}
	// We ask for a new name
	DialogManager.showPromptDialog(title, message, defaultName, true, function(cancelled, response) {
		if (!cancelled) {
			// We see if that name is ok
			SaveManager.sanitizeRename(isRecording, oldFilename, title, response.trim(), nextAction);
		}
	});
};

/**
 * Checks if a name is legitimate and renames the current file to that name if it is.
 * @param {boolean} isRecording
 * @param {string} oldFilename
 * @param {string} title
 * @param {string} proposedName - The name to check
 * @param {function} nextAction
 */
SaveManager.sanitizeRename = function(isRecording, oldFilename, title, proposedName, nextAction) {
	if (proposedName === "") {
		const message = "Name cannot be blank. Enter a file name.";
		SaveManager.promptRename(isRecording, oldFilename, title, message, nextAction);
	} else if (proposedName === oldFilename) {
		if (!isRecording && SaveManager.fileName === oldFilename) {
			const request = new HttpRequestBuilder("data/markAsNamed");
			HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
		} else {
			if (nextAction != null) nextAction();
		}
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable) {
			if (alreadySanitized && alreadyAvailable) {
				SaveManager.renameSoft(isRecording, oldFilename, title, availableName, nextAction);
			} else if (!alreadySanitized) {
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, availableName, nextAction);
			} else if (!alreadyAvailable) {
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, availableName, nextAction);
			}
		}, isRecording);
	}
};

/**
 * Tries to rename the file, does nothing if it fails
 * @param {boolean} isRecording
 * @param {string} oldFilename
 * @param {string} title - The title of the dialog to use if the renaming fails
 * @param {string} newName
 * @param {function} nextAction
 */
SaveManager.renameSoft = function(isRecording, oldFilename, title, newName, nextAction) {
	const request = new HttpRequestBuilder("data/rename");
	request.addParam("oldFilename", oldFilename);
	request.addParam("newFilename", newName);
	SaveManager.addTypeToRequest(request, isRecording);
	let callback = nextAction;
	if (isRecording) {
		callback = function() {
			CodeManager.renameRecording(oldFilename, newName);
			if (nextAction != null) nextAction();
		}
	}
	HtmlServer.sendRequestWithCallback(request.toString(), callback);
};

/**
 * Prompts the user to delete a file
 * @param {boolean} isRecording - Whether the file is actually a recording (to reduce redundant code)
 * @param {string} filename - The name of the file to delete
 * @param {function} nextAction - The action to perform if the file is deleted successfully
 */
SaveManager.userDeleteFile = function(isRecording, filename, nextAction) {
	const question = "Are you sure you want to delete \"" + filename + "\"?";
	DialogManager.showChoiceDialog("Delete", question, "Cancel", "Delete", true, function(response) {
		if (response === "2") {
			SaveManager.delete(isRecording, filename, nextAction);
		}
	}, null);
};

/**
 * Tells the backend to delete a file
 * @param {boolean} isRecording
 * @param {string} filename
 * @param {function} nextAction
 */
SaveManager.delete = function(isRecording, filename, nextAction) {
	const request = new HttpRequestBuilder("data/delete");
	request.addParam("filename", filename);
	SaveManager.addTypeToRequest(request, isRecording);
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};

/**
 * Checks if a name is a valid name for a file (meaning it is unused and has no illegal characters)
 * @param {string} filename - The name to check
 * @param {function} callbackFn - type (string, boolean, boolean), a function to call with the results
 * @param {boolean} [isRecording=false] - Whether the name should be compared to recordings instead of files
 */
SaveManager.getAvailableName = function(filename, callbackFn, isRecording) {
	if (isRecording == null) {
		isRecording = false;
	}
	DebugOptions.validateNonNull(callbackFn);
	// Ask the backend if the name is ok
	const request = new HttpRequestBuilder("data/getAvailableName");
	request.addParam("filename", filename);
	SaveManager.addTypeToRequest(request, isRecording);
	HtmlServer.sendRequestWithCallback(request.toString(), function(response) {
		let json = {};
		try {
			// Response is a JSON object
			json = JSON.parse(response);
		} catch (e) {

		}
		if (json.availableName != null) {
			/* 3 fields of response:
			 * json.availableName - A name that is close to the filename and is valid (is the filename if filename is ok
			 * json.alreadySanitized - boolean indicating if filename was already sanitized (had no illegal characters)
			 * json.alreadyAvailable - boolean indicating if filename is a unique name
			 * the availableName == filename iff alreadySanitized and alreadyAvailable */
			callbackFn(json.availableName, json.alreadySanitized === true, json.alreadyAvailable === true);
		}
	});
};

/**
 * Prompts the user for a name to duplicate a file
 * @param {string} filename - The name of the file to duplicate
 * @param {function} nextAction - The name of the function to call after successful duplication
 */
SaveManager.userDuplicateFile = function(filename, nextAction) {
	SaveManager.promptDuplicate("Enter name for duplicate file", filename, nextAction);
};

/**
 * Prompts the user to duplicate a file, using the specified message in the dialog
 * @param {string} message - The messsage in the duplicate dialog
 * @param {string} filename
 * @param {function} [nextAction]
 */
SaveManager.promptDuplicate = function(message, filename, nextAction) {
	SaveManager.getAvailableName(filename, function(availableName) {
		SaveManager.promptDuplicateWithDefault(message, filename, availableName, nextAction);
	});
};

/**
 * Prompts the user to duplicate a file with the specified name prefilled
 * @param {string} message
 * @param {string} filename
 * @param {string} defaultName - The name to prefill
 * @param {function} [nextAction]
 */
SaveManager.promptDuplicateWithDefault = function(message, filename, defaultName, nextAction) {
	DialogManager.showPromptDialog("Duplicate", message, defaultName, true, function(cancelled, response) {
		if (!cancelled) {
			SaveManager.sanitizeDuplicate(response.trim(), filename, nextAction);
		}
	});
};

/**
 * Checks if the provided name is valid and duplicates if it is. Otherwise, prompts for a valid name
 * @param {string} proposedName - The name to check
 * @param {string} filename
 * @param {function} [nextAction]
 */
SaveManager.sanitizeDuplicate = function(proposedName, filename, nextAction) {
	if (proposedName === "") {
		SaveManager.promptDuplicate("Name cannot be blank. Enter a file name.", filename, nextAction);
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable) {
			if (alreadySanitized && alreadyAvailable) {
				SaveManager.duplicate(filename, availableName, nextAction);
			} else if (!alreadySanitized) {
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptDuplicateWithDefault(message, filename, availableName, nextAction);
			} else if (!alreadyAvailable) {
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptDuplicateWithDefault(message, filename, availableName, nextAction);
			}
		});
	}
};

/**
 * Duplicates the file with the specified name
 * @param {string} filename
 * @param {string} newName
 * @param {function} [nextAction]
 */
SaveManager.duplicate = function(filename, newName, nextAction) {
	const request = new HttpRequestBuilder("data/duplicate");
	request.addParam("filename", filename);
	request.addParam("newFilename", newName);
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};

/**
 * Handles a request from the user to export a file
 * @param {string} filename - The name of the file to export
 * @param {number} x1
 * @param {number} x2
 * @param {number} y1
 * @param {number} y2
 */
SaveManager.userExportFile = function(filename, x1, x2, y1, y2) {
	SaveManager.exportFile(filename, x1, x2, y1, y2);
};

/**
 * Tells the backend to show an export prompt for the file at the specified location
 * @param {string} filename - The name of the file to export
 * @param {number} x1
 * @param {number} x2
 * @param {number} y1
 * @param {number} y2
 */
SaveManager.exportFile = function(filename, x1, x2, y1, y2) {
	const request = new HttpRequestBuilder("data/export");
	request.addParam("filename", filename);
	if (x1 != null && x2 != null && y1 != null && y2 != null) {
		request.addParam("tlx", x1);
		request.addParam("tly", y1);
		request.addParam("brx", x2);
		request.addParam("bry", y2);
	}
	HtmlServer.sendRequestWithCallback(request.toString());
};

/**
 * Tells the backend to save the provided data as a new document.  The backend calls CallbackManager.data.setName
 * when completed
 */
SaveManager.saveAsNew = function() {
	const request = new HttpRequestBuilder("data/new");
	const xmlDocText = XmlWriter.docToText(CodeManager.createXml());
	CodeManager.markLoading("Saving...");
	HtmlServer.sendRequestWithCallback(request.toString(), function() {

	}, function() {
		CodeManager.cancelLoading();
	}, true, xmlDocText);
};

/**
 * Called any time the document is edited.  Saves changes and creates a new document if no file is open
 */
SaveManager.markEdited = function() {
	CodeManager.updateModified();
	if (SaveManager.fileName != null) {
		SaveManager.autoSave();
	}
};

/**
 * Deprecated function called by the backend to get the contents of the open document
 * @return {object} - With fields for data and filename
 */
SaveManager.currentDoc = function() {
	if (SaveManager.fileName == null) return null;
	const result = {};
	result.data = XmlWriter.docToText(CodeManager.createXml());
	result.filename = SaveManager.fileName;
	return result;
};

/**
 * Saves the current file and prompts the user to name it if it isn't named
 * @param {string} message - The message to use when prompting to name
 * @param {function} [nextAction] - The function to call once the file is saved and named
 */
SaveManager.saveAndName = function(message, nextAction) {
	if (SaveManager.fileName == null) {
		if (nextAction != null) nextAction();
		return;
	}
	SaveManager.autoSave(nextAction);
};

/**
 * Called when the user taps the file button.  Saves the file and opens the OpenDialog.  Used to prompt the user to name
 * the file if they had not already
 */
SaveManager.userOpenDialog = function() {
	const message = "Please name this file";
	SaveManager.saveAndName(message, OpenDialog.showDialog);
};

/**
 * Adds a type parameter to the request indicating whether the item is a file or recording
 * @param {HttpRequestBuilder} request - The request to modify
 * @param {boolean} isRecording - Whether the item is a recording instead of a file
 */
SaveManager.addTypeToRequest = function(request, isRecording) {
	request.addParam("type", isRecording ? "recording" : "file");
};

/**
 * Returns whether a file is open
 * @return {boolean}
 */
SaveManager.fileIsOpen = function() {
	return SaveManager.fileName != null;
};