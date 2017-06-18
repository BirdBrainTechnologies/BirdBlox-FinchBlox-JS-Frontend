/**
 * Created by Tom on 6/13/2017.
 */

function OpenDialog(listOfFiles){
	this.files=listOfFiles.split("\n");
	if(listOfFiles == ""){
		this.files = [];
	}
	RowDialog.call(this, true, "Open", this.files.length, 0, 0);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.addHintText("No saved programs");
}
OpenDialog.prototype = Object.create(RowDialog.prototype);
OpenDialog.constructor = OpenDialog;
OpenDialog.setConstants = function(){

};
OpenDialog.prototype.createRow = function(index, y, width, contentGroup){
	var RD = RowDialog;
	let largeBnWidth = width - RD.smallBnWidth * 2 - RD.bnMargin * 2;
	var file = this.files[index];
	this.createFileBn(file, largeBnWidth, 0, y, contentGroup);
	let renameBnX = largeBnWidth + RD.bnMargin;
	this.createRenameBn(file, renameBnX, y, contentGroup);
	let deleteBnX = renameBnX + RD.smallBnWidth + RD.bnMargin;
	this.createDeleteBn(file, deleteBnX, y, contentGroup);
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