/**
 * Created by Tom on 7/17/2017.
 */
function OpenCloudDialog(fileList, cloudFileList, error){
	const OD = OpenDialog;
	const RD = RowDialog;
	this.fileList = fileList;
	this.loading = cloudFileList == null && this.fileList.signedIn;
	let count = 1;
	let hintText = "";

	if(this.fileList.signedIn) {
		if (error != null) {
			hintText = error;
		} else if (this.loading) {
			hintText = "Loading...";
		} else {
			hintText = "No saved programs"
		}
		this.files = cloudFileList;
		if(this.files == null){
			this.files = [];
		}
		count = this.files.length;
	}

	RD.call(this, false, "Open", count, OD.tabRowHeight, 0, OD.tabRowHeight - 1);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.addHintText(hintText);

	if (this.loading) {
		this.loadFiles();
	}
}
OpenCloudDialog.prototype = Object.create(RowDialog.prototype);
OpenCloudDialog.prototype.constructor = OpenCloudDialog;
OpenCloudDialog.prototype.show = function(){
	RowDialog.prototype.show.call(this);
	OpenDialog.currentDialog = this;
	this.createTabRow();
};
OpenCloudDialog.prototype.createRow = function(index, y, width, contentGroup){
	const RD = RowDialog;
	if(this.fileList.signedIn) {
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
OpenCloudDialog.prototype.createFileBn = function(file, bnWidth, x, y, contentGroup){
	const button = RowDialog.createMainBn(bnWidth, x, y, contentGroup, function(){
		const request = new HttpRequestBuilder("cloud/download");
		request.addParam("filename", file);
		HtmlServer.sendRequestWithCallback(request.toString());
	}.bind(this));
	button.addSideTextAndIcon(VectorPaths.cloudDownload, null, file);
};
OpenCloudDialog.prototype.createSignInBn = function(bnWidth, x, y, contentGroup){
	const button = RowDialog.createMainBn(bnWidth, x, y, contentGroup, function(){
		HtmlServer.sendRequestWithCallback("cloud/signIn");
	}.bind(this));
	button.addText("Sign in");
};
OpenCloudDialog.prototype.createRenameBn = function(file, x, y, contentGroup){
	const me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.edit, x, y, contentGroup, function(){
		const request = new HttpRequestBuilder("cloud/rename");
		request.addParam("filename", file);
		HtmlServer.sendRequestWithCallback(request.toString());
	});
};
OpenCloudDialog.prototype.createMoreBn = function(file, x, y, contentGroup){
	RowDialog.createSmallBnWithIcon(VectorPaths.dots, x, y, contentGroup, function(){
		const x1 = this.contentRelToAbsX(x);
		const x2 = this.contentRelToAbsX(x + RowDialog.smallBnWidth);
		const y1 = this.contentRelToAbsY(y);
		const y2 = this.contentRelToAbsY(y + RowDialog.bnHeight);
		new FileContextMenu(this, file, FileContextMenu.types.cloud, x1, x2, y1, y2);
	}.bind(this));
};

OpenCloudDialog.prototype.createTabRow = function(){
	const OD = OpenDialog;
	let y = this.getExtraTopY();
	let tabRow = new TabRow(0, y, this.width, OD.tabRowHeight, this.group, 1);

	tabRow.addTab("On Device", "device");
	let signOutFn = null;
	if(this.fileList.signedIn) {
		signOutFn = this.userSignOut.bind(this);
	}
	tabRow.addTab(this.fileList.getCloudTitle(), "cloud", signOutFn);

	tabRow.setCallbackFunction(this.tabSelected.bind(this));
	tabRow.show();
	return tabRow;
};
OpenCloudDialog.prototype.tabSelected = function(tab){
	if(tab === "device") {
		const openDialog = new OpenDialog(this.fileList);
		this.hide();
		openDialog.show();
		openDialog.reloadDialog();
	}
};
OpenCloudDialog.prototype.closeDialog = function(){
	OpenDialog.currentDialog = null;
	RowDialog.prototype.closeDialog.call(this);
};
OpenCloudDialog.prototype.reloadToOpen = function() {
	const me = this;
	HtmlServer.sendRequestWithCallback("data/files",function(response){
		if(OpenDialog.currentDialog === me) {
			me.closeDialog();
			const openDialog = new OpenDialog(new FileList(response));
			openDialog.show();
		}
	});
};
OpenCloudDialog.prototype.reloadDialog = function(cloudFileList){
	if(cloudFileList == null) {
		cloudFileList = null;
	}

	let thisScroll = this.getScroll();
	let me = this;
	HtmlServer.sendRequestWithCallback("data/files",function(response){
		if(OpenDialog.currentDialog === me) {
			me.closeDialog();
			const openDialog = new OpenCloudDialog(new FileList(response), cloudFileList);
			openDialog.show();
			openDialog.setScroll(thisScroll);
		}
	});
};
OpenCloudDialog.prototype.createStatusRow = function(){

};
OpenCloudDialog.prototype.userSignOut = function(){
	DebugOptions.assert(this.fileList.account != null);
	let message = "Disconnect account " + this.fileList.account + "?\n";
	message += "Downloaded files will remain on this device.";
	const me = this;
	HtmlServer.showChoiceDialog("Disconnect account", message, "Don't disconnect", "disconnect", true, function(result){
		if (result === "2") {
			me.signOut();
		}
	});
};
OpenCloudDialog.prototype.signOut = function(){
	const me = this;
	HtmlServer.sendRequestWithCallback("cloud/signOut", function(){
		me.reloadDialog();
	});
};
OpenCloudDialog.prototype.loadFiles = function() {
	const me = this;
	HtmlServer.sendRequestWithCallback("cloud/list",function(response){
		if(OpenDialog.currentDialog === me) {
			const object = JSON.parse(response);
			let files = object.files;
			if (files != null) {
				me.closeDialog();
				const cloudDialog = new OpenCloudDialog(me.fileList, files);
				cloudDialog.show();
			}
		}
	}, function(status, error){
		if(OpenDialog.currentDialog === me) {
			me.closeDialog();
			const cloudDialog = new OpenCloudDialog(me.fileList, null, error);
			cloudDialog.show();
		}
	});
};
OpenCloudDialog.filesChanged = function(jsonString){
	if(OpenDialog.currentDialog != null && OpenDialog.currentDialog.constructor === OpenCloudDialog){
		if(jsonString != null) {
			jsonString = JSON.parse(jsonString).files;
		}
		OpenDialog.currentDialog.reloadDialog(jsonString);
	}
};