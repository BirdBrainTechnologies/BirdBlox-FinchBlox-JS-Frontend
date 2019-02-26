/**
 * A dialog for managing cloud files on Android.  Contains a tab for returning to the OpenDialog
 * @param {FileList} fileList - Used to obtain account information
 * @param {Array<string>} [cloudFileList] - An array of files on the cloud, or null if they haven't been loaded yet
 * @param {string} [error] - The error that occurred while loading files (if present)
 * @constructor
 */
function OpenCloudDialog(fileList, cloudFileList, error) {
	const OD = OpenDialog;
	const RD = RowDialog;
	this.fileList = fileList;
	// We need to load the files if the user is signed in and the files aren't loaded and there isn't an error
	this.loading = cloudFileList == null && this.fileList.signedIn && error == null;
	// There's only one row for the sign in button if there are no files
	let count = 1;
	// There isn't any hint text unless we are signed in
	let hintText = "";

	if (this.fileList.signedIn) {
		if (error != null) {
			// An error occurred, display the error
			hintText = error;
		} else if (this.loading) {
			hintText = Language.getStr("Loading") + "...";
		} else {
			hintText = Language.getStr("No_saved_programs");
		}
		this.files = cloudFileList;
		if (this.files == null) {
			this.files = [];
		}
		count = this.files.length;
	}

	RD.call(this, false, Language.getStr("Open"), count, OD.tabRowHeight, 0, OD.tabRowHeight - 1);
	// this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.addHintText(hintText);

	// Load the files from the backend
	if (this.loading) {
		this.loadFiles();
	}
}
OpenCloudDialog.prototype = Object.create(RowDialog.prototype);
OpenCloudDialog.prototype.constructor = OpenCloudDialog;

/**
 * @inheritDoc
 */
OpenCloudDialog.prototype.show = function() {
	RowDialog.prototype.show.call(this);
	OpenDialog.currentDialog = this;
	this.createTabRow();
};

/**
 * Creates a row for managing the files, or just a sign in button if we aren't signed in
 * @inheritDoc
 * @param {number} index
 * @param {number} y
 * @param {number} width
 * @param {Element} contentGroup
 */
OpenCloudDialog.prototype.createRow = function(index, y, width, contentGroup) {
	const RD = RowDialog;
	if (this.fileList.signedIn) {
		const cols = 2;
		const file = this.files[index];

		const largeBnWidth = width - RD.smallBnWidth * cols - RD.bnMargin * cols;
		this.createFileBn(file, largeBnWidth, 0, y, contentGroup);

		let currentX = largeBnWidth + RD.bnMargin;
		this.createRenameBn(file, currentX, y, contentGroup);
		currentX += RD.bnMargin + RD.smallBnWidth;
		this.createMoreBn(file, currentX, y, contentGroup);

	} else {
		this.createSignInBn(width, 0, y, contentGroup);
	}
};

/**
 * Creates a button for downloading a file
 * @param {string} file - The name of the file
 * @param {number} bnWidth
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenCloudDialog.prototype.createFileBn = function(file, bnWidth, x, y, contentGroup) {
	const button = RowDialog.createMainBn(bnWidth, x, y, contentGroup, function() {
		const request = new HttpRequestBuilder("cloud/download");
		request.addParam("filename", file);
		HtmlServer.sendRequestWithCallback(request.toString());
	}.bind(this));
	button.addSideTextAndIcon(VectorPaths.cloudDownload, null, file);
};

/**
 * Creates a sign in button
 * @param {number} bnWidth
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenCloudDialog.prototype.createSignInBn = function(bnWidth, x, y, contentGroup) {
	const button = RowDialog.createMainBn(bnWidth, x, y, contentGroup, function() {
		HtmlServer.sendRequestWithCallback("cloud/signIn");
	}.bind(this));
	button.addText(Language.getStr("Sign_in"));
};

/**
 * Creates a button for renaming a file
 * @param {string} file - The name of the file
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenCloudDialog.prototype.createRenameBn = function(file, x, y, contentGroup) {
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.edit, x, y, contentGroup, function() {
		const request = new HttpRequestBuilder("cloud/rename");
		request.addParam("filename", file);
		HtmlServer.sendRequestWithCallback(request.toString());
	});
};

/**
 * Creates a button for displaying additional options
 * @param {string} file - The name of the file
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
OpenCloudDialog.prototype.createMoreBn = function(file, x, y, contentGroup) {
	RowDialog.createSmallBnWithIcon(VectorPaths.dots, x, y, contentGroup, function() {
		// Get the coords to show the menu at
		const x1 = this.contentRelToAbsX(x);
		const x2 = this.contentRelToAbsX(x + RowDialog.smallBnWidth);
		const y1 = this.contentRelToAbsY(y);
		const y2 = this.contentRelToAbsY(y + RowDialog.bnHeight);
		// Show the more options menu
		new FileContextMenu(this, file, FileContextMenu.types.cloud, x1, x2, y1, y2);
	}.bind(this));
};

/**
 * Creates a tab to return to the OpenDialog
 * @return {TabRow}
 */
OpenCloudDialog.prototype.createTabRow = function() {
	const OD = OpenDialog;
	let y = this.getExtraTopY();
	let tabRow = new TabRow(0, y, this.width, OD.tabRowHeight, this.group, 1);

	tabRow.addTab(Language.getStr("On_Device"), "device");
	let signOutFn = null;
	// If signed in, an X appears in the tab which signs the user out
	if (this.fileList.signedIn) {
		signOutFn = this.userSignOut.bind(this);
	}
	tabRow.addTab(this.fileList.getCloudTitle(), "cloud", signOutFn);

	tabRow.setCallbackFunction(this.tabSelected.bind(this));
	tabRow.show();
	return tabRow;
};

/**
 * Switches back to the OpenDialog if the user selects that tab
 * @param {string} tab - The id of the selected tab
 */
OpenCloudDialog.prototype.tabSelected = function(tab) {
	if (tab === "device") {
		const openDialog = new OpenDialog(this.fileList);
		this.hide();
		openDialog.show();
		openDialog.reloadDialog();
	}
};

/**
 * @inheritDoc
 */
OpenCloudDialog.prototype.closeDialog = function() {
	OpenDialog.currentDialog = null;
	RowDialog.prototype.closeDialog.call(this);
};

/**
 * Re-retrieves the local files and shows an OpenDialog
 */
OpenCloudDialog.prototype.reloadToOpen = function() {
	const me = this;
	HtmlServer.sendRequestWithCallback("data/files", function(response) {
		if (OpenDialog.currentDialog === me) {
			me.closeDialog();
			const openDialog = new OpenDialog(new FileList(response));
			openDialog.show();
		}
	});
};

/**
 * Reloads the OpenCloudDialog with the specified cloud files.  Re-retrieves local files and account info
 * @param {Array<string>} [cloudFileList] - The list of cloud files.  If  undefined, redownloads
 */
OpenCloudDialog.prototype.reloadDialog = function(cloudFileList) {
	if (cloudFileList == null) {
		cloudFileList = null;
	}

	let thisScroll = this.getScroll();
	let me = this;
	HtmlServer.sendRequestWithCallback("data/files", function(response) {
		if (OpenDialog.currentDialog === me) {
			me.closeDialog();
			const openDialog = new OpenCloudDialog(new FileList(response), cloudFileList);
			openDialog.show();
			openDialog.setScroll(thisScroll);
		}
	});
};

/**
 * Confirms the user's intent to sign out and then signs out
 */
OpenCloudDialog.prototype.userSignOut = function() {
	DebugOptions.assert(this.fileList.account != null);
	let message = Language.getStr("Disconnect_account_question");
	//message += Language.getStr("Files_will_remain");
	const me = this;
	DialogManager.showChoiceDialog(Language.getStr("Disconnect_account"), message, Language.getStr("Dont_disconnect"), Language.getStr("Disconnect"), true, function(result) {
		if (result === "2") {
			me.signOut();
		}
	});
};

/**
 * Issues a signOut request and reloads the dialog
 */
OpenCloudDialog.prototype.signOut = function() {
	const me = this;
	HtmlServer.sendRequestWithCallback("cloud/signOut", function() {
		me.reloadDialog();
	});
};

/**
 * Requests the list of cloud files and creates a new OpenCloudDialog with them, or shows an error
 */
OpenCloudDialog.prototype.loadFiles = function() {
	const me = this;
	HtmlServer.sendRequestWithCallback("cloud/list", function(response) {
		if (OpenDialog.currentDialog === me) {
			const object = JSON.parse(response);
			//let files = object.files;
			let files = FileList.getSortedList(object.files);
			if (files != null) {
				me.closeDialog();
				const cloudDialog = new OpenCloudDialog(me.fileList, files);
				cloudDialog.show();
			}
		}
	}, function(status, error) {
		if (OpenDialog.currentDialog === me) {
			me.closeDialog();
			const cloudDialog = new OpenCloudDialog(me.fileList, null, error);
			cloudDialog.show();
		}
	});
};

/**
 * Parses the list of cloud files and reloads the OpenCloudDialog with them
 * @param {string} [jsonString] - List of new cloud files as a JSON array of strings encoded as a string
 */
OpenCloudDialog.filesChanged = function(jsonString) {
	if (OpenDialog.currentDialog != null && OpenDialog.currentDialog.constructor === OpenCloudDialog) {
		if (jsonString != null) {
			jsonString = JSON.parse(jsonString).files;
		}
		OpenDialog.currentDialog.reloadDialog(jsonString);
	}
};
