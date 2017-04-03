function FileMenu(button){
	Menu.call(this,button);
	this.addOption("New", this.optionNew);
	this.addOption("Open", this.optionOpen);
	this.addOption("Save", this.optionSave);
	this.addOption("Save as", this.optionSaveAs);
	this.addOption("Rename", this.optionRename);
	this.addOption("Delete", this.optionDelete);
	//this.addOption("Import", this.optionImport);
	this.addOption("Export", this.optionExport);
	this.addOption("Advanced", this.optionEnableDebug);
	this.addOption("Exit", this.optionExit);
	this.buildMenu();
}
FileMenu.prototype = Object.create(Menu.prototype);
FileMenu.prototype.constructor = FileMenu;
FileMenu.prototype.optionNew=function(){
	SaveManager.new();
};
FileMenu.prototype.optionOpen=function(){
	var callbackFn=function(response){
		new OpenDialog(response);
	};
	HtmlServer.sendRequestWithCallback("data/files",callbackFn);
};
FileMenu.prototype.optionSave=function(){
	SaveManager.save();
};
FileMenu.prototype.optionSaveAs=function(){
	SaveManager.saveAs();
};
FileMenu.prototype.optionRename=function(){
	SaveManager.renamePrompt();
};
FileMenu.prototype.optionDelete=function(){
	SaveManager.promptForDelete();
};
FileMenu.prototype.optionImport=function(){

};
FileMenu.prototype.optionExport=function(){
	SaveManager.exportPrompt();
};
FileMenu.prototype.optionEnableDebug=function(){
	TitleBar.enableDebug();
};
FileMenu.prototype.optionExit=function(){
	SaveManager.checkPromptSave(function() {
		HtmlServer.sendRequest("tablet/exit");
	});
}