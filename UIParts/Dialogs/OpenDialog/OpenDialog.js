/**
 * Created by Tom on 6/13/2017.
 */

function OpenDialog(listOfFiles){
	this.files=listOfFiles.split("\n");
	if(listOfFiles === ""){
		this.files = [];
	}
	RowDialog.call(this, true, "Open", this.files.length, 0, OpenDialog.extraBottomSpace);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.addHintText("No saved programs");
}
OpenDialog.prototype = Object.create(RowDialog.prototype);
OpenDialog.constructor = OpenDialog;
OpenDialog.setConstants = function(){
	OpenDialog.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
	OpenDialog.currentDialog = null;
};
OpenDialog.prototype.show = function(){
	RowDialog.prototype.show.call(this);
	OpenDialog.currentDialog = this;
	this.createNewBn();
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
	this.createDuplicateBn(file, currentX, y, contentGroup);
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
		SaveManager.userExportFile(file);
	});
};
OpenDialog.prototype.createMoreBn = function(file, x, y, contentGroup){
	RowDialog.createSmallBnWithIcon(VectorPaths.dots, x, y, contentGroup, function(){
		const x1 = this.contentRelToAbsX(x);
		const x2 = this.contentRelToAbsX(x + RowDialog.smallBnWidth);
		const y1 = this.contentRelToAbsY(y);
		const y2 = this.contentRelToAbsY(y + RowDialog.bnHeight);
		new FileContextMenu(this, file, x1, x2, y1, y2);
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
		me.closeDialog();
		var openDialog = new OpenDialog(response);
		openDialog.show();
		openDialog.setScroll(thisScroll);
	});
};
OpenDialog.showDialog = function(){
	HtmlServer.sendRequestWithCallback("data/files",function(response){
		var openDialog = new OpenDialog(response);
		openDialog.show();
	});
};
OpenDialog.prototype.closeDialog = function(){
	OpenDialog.currentDialog = null;
	RowDialog.prototype.closeDialog.call(this);
};