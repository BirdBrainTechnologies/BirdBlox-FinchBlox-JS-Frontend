/**
 * Created by Tom on 6/13/2017.
 */

function OpenDialog(listOfFiles){
	this.files=listOfFiles.split("\n");
	RowDialog.call(this, "Open", this.files.length, 0, 0);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this))
}
OpenDialog.prototype = Object.create(RowDialog.prototype);
OpenDialog.constructor = OpenDialog;
OpenDialog.setConstants = function(){
	OpenDialog.smallBnWidth = 30;
	OpenDialog.iconH = 15;
};
OpenDialog.prototype.createRow = function(index, y, width, contentGroup){
	var RD = RowDialog;
	var OD = OpenDialog;
	let largeBnWidth = width - OD.smallBnWidth * 2 - RD.bnMargin * 2;
	var file = this.files[index];
	this.createFileBn(file, largeBnWidth, 0, y, contentGroup);
	let renameBnX = largeBnWidth + RD.bnMargin;
	this.createRenameBn(file, renameBnX, y, contentGroup);
	let deleteBnX = renameBnX + OD.smallBnWidth + RD.bnMargin;
	this.createDeleteBn(file, deleteBnX, y, contentGroup);
};
OpenDialog.prototype.createFileBn = function(file, bnWidth, x, y, contentGroup){
	var RD = RowDialog;
	var button = new Button(x, y, bnWidth, RD.bnHeight, contentGroup);
	button.addText(file);
	var me = this;
	button.setCallbackFunction(function(){
		me.closeDialog();
		SaveManager.userOpenFile(file);
	}, true);
};
OpenDialog.prototype.createDeleteBn = function(file, x, y, contentGroup){
	var RD = RowDialog;
	var OD = OpenDialog;
	var button = new Button(x, y, OD.smallBnWidth, RD.bnHeight, contentGroup);
	button.addIcon(VectorPaths.trash, OD.iconH);
	button.setCallbackFunction(function(){
		SaveManager.userDeleteFile(file);
	}, true);
};
OpenDialog.prototype.createRenameBn = function(file, x, y, contentGroup){
	var RD = RowDialog;
	var OD = OpenDialog;
	var button = new Button(x, y, OD.smallBnWidth, RD.bnHeight, contentGroup);
	button.addIcon(VectorPaths.edit, OD.iconH);
	button.setCallbackFunction(function(){
		SaveManager.userRenameFile(file);
	}, true);
};
