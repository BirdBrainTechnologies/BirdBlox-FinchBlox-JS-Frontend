/**
 * Created by Tom on 6/13/2017.
 */

function OpenDialog(fileList){
	const OD = OpenDialog;
	const RD = RowDialog;
	this.fileList = fileList;
	this.files = fileList.localFiles;
	if(GuiElements.isAndroid) {
		RD.call(this, false, "Open", this.files.length, OD.tabRowHeight, OD.extraBottomSpace, OD.tabRowHeight - 1);
	} else {
		RD.call(this, false, "Open", this.files.length, 0, OpenDialog.extraBottomSpace);
	}
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.addHintText("No saved programs");
}
OpenDialog.prototype = Object.create(RowDialog.prototype);
OpenDialog.prototype.constructor = OpenDialog;
OpenDialog.setConstants = function(){
	OpenDialog.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
	OpenDialog.currentDialog = null;
	OpenDialog.cloudBnWidth = RowDialog.smallBnWidth * 1.6;
	OpenDialog.tabRowHeight = RowDialog.titleBarH;
};
OpenDialog.prototype.show = function(){
	RowDialog.prototype.show.call(this);
	OpenDialog.currentDialog = this;
	this.createNewBn();
	if(GuiElements.isIos) {
		this.createCloudBn();
	}
	if(GuiElements.isAndroid){
		this.createTabRow();
	}
};
OpenDialog.prototype.createRow = function(index, y, width, contentGroup){
	const cols = 3;
	const RD = RowDialog;
	let largeBnWidth = width - RD.smallBnWidth * cols - RD.bnMargin * cols;
	const file = this.files[index];
	this.createFileBn(file, largeBnWidth, 0, y, contentGroup);

	/*
	let currentX = largeBnWidth + RD.bnMargin;
	this.createExportBn(file, currentX, y, contentGroup);
	currentX += RD.bnMargin + RD.smallBnWidth;
	this.createDuplicateBn(file, currentX, y, contentGroup);
	currentX += RD.bnMargin + RD.smallBnWidth;
	this.createRenameBn(file, currentX, y, contentGroup);
	currentX += RD.bnMargin + RD.smallBnWidth;
	this.createDeleteBn(file, currentX, y, contentGroup);
	*/

	let currentX = largeBnWidth + RD.bnMargin;
	this.createRenameBn(file, currentX, y, contentGroup);
	currentX += RD.bnMargin + RD.smallBnWidth;
	//this.createDuplicateBn(file, currentX, y, contentGroup);
	if(this.fileList.signedIn) {
		this.createUploadBn(file, currentX, y, contentGroup);
	} else {
		this.createExportBn(file, currentX, y, contentGroup);
	}
	currentX += RD.bnMargin + RD.smallBnWidth;
	this.createMoreBn(file, currentX, y, contentGroup);
};
OpenDialog.prototype.createFileBn = function(file, bnWidth, x, y, contentGroup){
	RowDialog.createMainBnWithText(file, bnWidth, x, y, contentGroup, function(){
		this.closeDialog();
		SaveManager.userOpenFile(file);
	}.bind(this));
};

OpenDialog.prototype.createDeleteBn = function(file, x, y, contentGroup){
	var me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.trash, x, y, contentGroup, function(){
		SaveManager.userDeleteFile(false, file, function(){
			me.reloadDialog();
		});
	});
};
OpenDialog.prototype.createRenameBn = function(file, x, y, contentGroup){
	var me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.edit, x, y, contentGroup, function(){
		SaveManager.userRenameFile(false, file, function(){
			me.reloadDialog();
		});
	});
};
OpenDialog.prototype.createDuplicateBn = function(file, x, y, contentGroup){
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.copy, x, y, contentGroup, function(){
		SaveManager.userDuplicateFile(file, function(){
			me.reloadDialog();
		});
	});
};
OpenDialog.prototype.createExportBn = function(file, x, y, contentGroup){
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.share, x, y, contentGroup, function(){
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
OpenDialog.prototype.createUploadBn = function(file, x, y, contentGroup){
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.cloudUpload, x, y, contentGroup, function(){
		const request = new HttpRequestBuilder("cloud/upload");
		request.addParam("filename", file);
		HtmlServer.sendRequestWithCallback(request.toString());
	});
};

OpenDialog.prototype.createMoreBn = function(file, x, y, contentGroup){
	RowDialog.createSmallBnWithIcon(VectorPaths.dots, x, y, contentGroup, function(){
		const x1 = this.contentRelToAbsX(x);
		const x2 = this.contentRelToAbsX(x + RowDialog.smallBnWidth);
		const y1 = this.contentRelToAbsY(y);
		const y2 = this.contentRelToAbsY(y + RowDialog.bnHeight);
		let type = FileContextMenu.types.localSignedOut;
		if(this.fileList.signedIn) {
			type = FileContextMenu.types.localSignedIn;
		}
		new FileContextMenu(this, file, type, x1, x2, y1, y2);
	}.bind(this));
};
OpenDialog.prototype.createNewBn = function(){
	let RD = RowDialog;
	let OD = OpenDialog;
	let x = RD.bnMargin;
	let y = this.getExtraBottomY();
	let button = new Button(x, y, this.getContentWidth(), RD.bnHeight, this.group);
	button.addText("New");
	button.setCallbackFunction(function(){
		this.closeDialog();
		SaveManager.userNew();
	}.bind(this), true);
	return button;
};
OpenDialog.prototype.reloadDialog = function(){
	let thisScroll = this.getScroll();
	let me = this;
	HtmlServer.sendRequestWithCallback("data/files",function(response){
		if(OpenDialog.currentDialog === me) {
			me.closeDialog();
			const openDialog = new OpenDialog(new FileList(response));
			openDialog.show();
			openDialog.setScroll(thisScroll);
		}
	});
};
OpenDialog.prototype.createCloudBn = function(){
	const OD = OpenDialog;
	const RD = RowDialog;
	const x = this.width - RD.bnMargin - OD.cloudBnWidth;
	let button = new Button(x, RD.bnMargin, OD.cloudBnWidth, RD.titleBarH - 2 * RD.bnMargin, this.group);
	button.addIcon(VectorPaths.cloud);
	button.setCallbackFunction(function(){
		HtmlServer.sendRequestWithCallback("cloud/showPicker");
	}, true);
};
OpenDialog.prototype.createTabRow = function(){
	const OD = OpenDialog;
	let y = this.getExtraTopY();
	let tabRow = new TabRow(0, y, this.width, OD.tabRowHeight, this.group, 0);

	tabRow.addTab("On Device", "device");
	tabRow.addTab(this.fileList.getCloudTitle(), "cloud");

	tabRow.setCallbackFunction(this.tabSelected.bind(this));
	tabRow.show();
	return tabRow;
};
OpenDialog.prototype.tabSelected = function(tab){
	if(tab === "cloud") {
		const cloudDialog = new OpenCloudDialog(this.fileList);
		this.hide();
		cloudDialog.show();
	}
};
OpenDialog.showDialog = function(){
	HtmlServer.sendRequestWithCallback("data/files",function(response){
		var openDialog = new OpenDialog(new FileList(response));
		openDialog.show();
	});
};
OpenDialog.prototype.closeDialog = function(){
	OpenDialog.currentDialog = null;
	RowDialog.prototype.closeDialog.call(this);
};
OpenDialog.closeDialog = function(){
	if(OpenDialog.currentDialog != null) {
		OpenDialog.currentDialog.closeDialog();
	}
};
OpenDialog.filesChanged = function(){
	if(OpenDialog.currentDialog != null && OpenDialog.currentDialog.constructor === OpenDialog){
		OpenDialog.currentDialog.reloadDialog();
	}
};