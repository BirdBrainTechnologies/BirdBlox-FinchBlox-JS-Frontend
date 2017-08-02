/**
 * A dialog for opening and managing local files.  On iOS, a cloud button is included for opening cloud files, and
 * on Android an additional tab opens an OpenCloudDialog for managing cloud files.
 * @param {FileList} fileList - A list of files and account information retrieved from the backend
 * @constructor
 */
function OpenDialog(fileList) {
	const OD = OpenDialog;
	const RD = RowDialog;
	this.fileList = fileList;
	this.files = fileList.localFiles;
	if (GuiElements.isAndroid) {
		// On Android, space is needed for the row of tabs
		RD.call(this, false, "Open", this.files.length, OD.tabRowHeight, OD.extraBottomSpace, OD.tabRowHeight - 1);
	} else {
		RD.call(this, false, "Open", this.files.length, 0, OpenDialog.extraBottomSpace);
	}
	// this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.addHintText("No saved programs");
}
OpenDialog.prototype = Object.create(RowDialog.prototype);
OpenDialog.prototype.constructor = OpenDialog;

OpenDialog.setConstants = function() {
	OpenDialog.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
	OpenDialog.currentDialog = null; // The currently open dialog, can also be an OpenCloudDialog
	OpenDialog.cloudBnWidth = RowDialog.smallBnWidth * 1.6;
	OpenDialog.tabRowHeight = RowDialog.titleBarH;
};

/**
 * @inheritDoc
 */
OpenDialog.prototype.show = function() {
	RowDialog.prototype.show.call(this);
	OpenDialog.currentDialog = this;
	this.createNewBn();
	if (GuiElements.isIos) {
		this.createCloudBn();
	}
	if (GuiElements.isAndroid) {
		this.createTabRow();
	}
};

/**
 * @inheritDoc
 * @param {number} index
 * @param {number} y
 * @param {number} width
 * @param {Element} contentGroup
 */
OpenDialog.prototype.createRow = function(index, y, width, contentGroup) {
	const cols = 3;
	const RD = RowDialog;
	let largeBnWidth = width - RD.smallBnWidth * cols - RD.bnMargin * cols;
	const file = this.files[index];
	this.createFileBn(file, largeBnWidth, 0, y, contentGroup);

	let currentX = largeBnWidth + RD.bnMargin;
	this.createRenameBn(file, currentX, y, contentGroup);
	currentX += RD.bnMargin + RD.smallBnWidth;
	//this.createDuplicateBn(file, currentX, y, contentGroup);
	if (this.fileList.signedIn) {
		// If signed in, the export button is replaced with an upload button (the export button goes in the more menu)
		this.createUploadBn(file, currentX, y, contentGroup);
	} else {
		this.createExportBn(file, currentX, y, contentGroup);
	}
	currentX += RD.bnMargin + RD.smallBnWidth;
	this.createMoreBn(file, currentX, y, contentGroup);
};

/**
 * Creates the button which shows the file name and opens the file when tapped
 * @param {string} file - The name of the file
 * @param {number} bnWidth
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenDialog.prototype.createFileBn = function(file, bnWidth, x, y, contentGroup) {
	RowDialog.createMainBnWithText(file, bnWidth, x, y, contentGroup, function() {
		this.closeDialog();
		SaveManager.userOpenFile(file);
	}.bind(this));
};

/**
 * Creates the button for deleting files.  This button has been moved into the more menu, so this function is not used
 * anymore.
 * @param {string} file - The name of the file to delete
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenDialog.prototype.createDeleteBn = function(file, x, y, contentGroup) {
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.trash, x, y, contentGroup, function() {
		SaveManager.userDeleteFile(false, file, function() {
			me.reloadDialog();
		});
	});
};

/**
 * Creates the button for renaming files
 * @param {string} file - The name of the file to delete
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenDialog.prototype.createRenameBn = function(file, x, y, contentGroup) {
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.edit, x, y, contentGroup, function() {
		SaveManager.userRenameFile(false, file, function() {
			me.reloadDialog();
		});
	});
};

/**
 * Creates a button for duplicating files
 * @param {string} file - The name of the file to delete
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenDialog.prototype.createDuplicateBn = function(file, x, y, contentGroup) {
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.copy, x, y, contentGroup, function() {
		SaveManager.userDuplicateFile(file, function() {
			me.reloadDialog();
		});
	});
};

/**
 * Creates a button for exporting files
 * @param {string} file - The name of the file to delete
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenDialog.prototype.createExportBn = function(file, x, y, contentGroup) {
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.share, x, y, contentGroup, function() {
		let x1 = this.contentRelToAbsX(x);
		let x2 = this.contentRelToAbsX(x + RowDialog.smallBnWidth);
		let y1 = this.contentRelToAbsY(y);
		let y2 = this.contentRelToAbsY(y + RowDialog.bnHeight);
		x1 = GuiElements.relToAbsX(x1);
		x2 = GuiElements.relToAbsX(x2);
		y1 = GuiElements.relToAbsX(y1);
		y2 = GuiElements.relToAbsX(y2);
		SaveManager.userExportFile(file, x1, x2, y1, y2);
	}.bind(this));
};

/**
 * Creates a button for uploading files.  Only available on Android
 * @param {string} file - The name of the file to delete
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenDialog.prototype.createUploadBn = function(file, x, y, contentGroup) {
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.cloudUpload, x, y, contentGroup, function() {
		const request = new HttpRequestBuilder("cloud/upload");
		request.addParam("filename", file);
		HtmlServer.sendRequestWithCallback(request.toString());
	});
};

/**
 * Creates a button for more actions, which are listed in a dropdown
 * @param {string} file - The name of the file to delete
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenDialog.prototype.createMoreBn = function(file, x, y, contentGroup) {
	RowDialog.createSmallBnWithIcon(VectorPaths.dots, x, y, contentGroup, function() {
		const x1 = this.contentRelToAbsX(x);
		const x2 = this.contentRelToAbsX(x + RowDialog.smallBnWidth);
		const y1 = this.contentRelToAbsY(y);
		const y2 = this.contentRelToAbsY(y + RowDialog.bnHeight);
		let type = FileContextMenu.types.localSignedOut;
		if (this.fileList.signedIn) {
			type = FileContextMenu.types.localSignedIn;
		}
		new FileContextMenu(this, file, type, x1, x2, y1, y2);
	}.bind(this));
};

/**
 * Creates a button at the bottom of the dialog for opening a blank, new file.
 * @return {Button}
 */
OpenDialog.prototype.createNewBn = function() {
	let RD = RowDialog;
	let OD = OpenDialog;
	let x = RD.bnMargin;
	let y = this.getExtraBottomY();
	let button = new Button(x, y, this.getContentWidth(), RD.bnHeight, this.group);
	button.addText("New");
	button.setCallbackFunction(function() {
		SaveManager.userNew(this.closeDialog.bind(this))
	}.bind(this), true);
	return button;
};

/**
 * Re-retrieves the list of open files from the backend and reloads the dialog
 */
OpenDialog.prototype.reloadDialog = function() {
	let thisScroll = this.getScroll();
	let me = this;
	HtmlServer.sendRequestWithCallback("data/files", function(response) {
		if (OpenDialog.currentDialog === me) {
			me.closeDialog();
			const openDialog = new OpenDialog(new FileList(response));
			openDialog.show();
			openDialog.setScroll(thisScroll);
		}
	});
};

/**
 * Creates a button in the top-right corner of the dialog for opening from cloud storage (iOS only)
 */
OpenDialog.prototype.createCloudBn = function() {
	const OD = OpenDialog;
	const RD = RowDialog;
	const x = this.width - RD.bnMargin - OD.cloudBnWidth;
	let button = new Button(x, RD.bnMargin, OD.cloudBnWidth, RD.titleBarH - 2 * RD.bnMargin, this.group);
	button.addIcon(VectorPaths.cloud);
	button.setCallbackFunction(function() {
		HtmlServer.sendRequestWithCallback("cloud/showPicker");
	}, true);
};

/**
 * Creates tabs for opening the the OpenCloudDialog (Android only)
 * @return {TabRow}
 */
OpenDialog.prototype.createTabRow = function() {
	const OD = OpenDialog;
	let y = this.getExtraTopY();
	let tabRow = new TabRow(0, y, this.width, OD.tabRowHeight, this.group, 0);

	tabRow.addTab("On Device", "device");
	tabRow.addTab(this.fileList.getCloudTitle(), "cloud");

	tabRow.setCallbackFunction(this.tabSelected.bind(this));
	tabRow.show();
	return tabRow;
};

/**
 * Switches to the OpenCloudDialog if its tab is selected
 * @param {string} tab - The id of the selected tab
 */
OpenDialog.prototype.tabSelected = function(tab) {
	if (tab === "cloud") {
		const cloudDialog = new OpenCloudDialog(this.fileList);
		this.hide();
		cloudDialog.show();
	}
};

/**
 * Retrieves a list of local files and cloud account information (on Android) and shows an Open dialog
 */
OpenDialog.showDialog = function() {
	OpenDialog.opening = true; // Allows the action to be canceled if OpenDialog.closeDialog is called in the interval
	HtmlServer.sendRequestWithCallback("data/files", function(response) {
		if (!OpenDialog.opening) return;
		const openDialog = new OpenDialog(new FileList(response));
		openDialog.show();
		OpenDialog.opening = false;
	}, function() {
		OpenDialog.opening = false;
	});
};

OpenDialog.closeFileAndShowDialog = function() {
	SaveManager.userClose(OpenDialog.showDialog);
};

/**
 * @inheritDoc
 */
OpenDialog.prototype.closeDialog = function() {
	OpenDialog.currentDialog = null;
	RowDialog.prototype.closeDialog.call(this);
};

/**
 * Closes the currently open dialog
 */
OpenDialog.closeDialog = function() {
	OpenDialog.opening = false;
	if (OpenDialog.currentDialog != null) {
		OpenDialog.currentDialog.closeDialog();
	}
};

/**
 * Reloads the currently open dialog, if that dialog is an OpenDialog
 */
OpenDialog.filesChanged = function() {
	if (OpenDialog.currentDialog != null && OpenDialog.currentDialog.constructor === OpenDialog) {
		OpenDialog.currentDialog.reloadDialog();
	}
};