function FileMenu(button){
	Menu.call(this,button);
}
FileMenu.prototype = Object.create(Menu.prototype);
FileMenu.prototype.constructor = FileMenu;
FileMenu.prototype.loadOptions = function(){
	this.addOption("New", SaveManager.userNew);
	this.addOption("Open", OpenDialog.showDialog);
	this.addOption("Duplicate", SaveManager.userDuplicate);
	this.addOption("Rename", SaveManager.userRename);
	this.addOption("Delete", SaveManager.userDelete);
	this.addOption("Share", SaveManager.userExport);
	this.addOption("Debug", this.optionEnableDebug);
	if(GuiElements.isKindle) {
		this.addOption("Exit", this.optionExit);
	}
};
FileMenu.prototype.optionNew=function(){
	SaveManager.new();
};
FileMenu.prototype.optionEnableDebug=function(){
	TitleBar.enableDebug();
};
FileMenu.prototype.optionExit=function(){
	SaveManager.checkPromptSave(function() {
		HtmlServer.sendRequest("tablet/exit");
	});
};