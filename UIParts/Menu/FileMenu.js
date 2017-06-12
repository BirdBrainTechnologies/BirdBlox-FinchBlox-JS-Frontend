function FileMenu(button){
	Menu.call(this,button);
}
FileMenu.prototype = Object.create(Menu.prototype);
FileMenu.prototype.constructor = FileMenu;
FileMenu.prototype.loadOptions = function(){
	this.addOption("New", SaveManager.userNew);
	this.addOption("Open", SaveManager.optionOpen);
	this.addOption("Duplicate", SaveManager.userDuplicate);
	this.addOption("Rename", SaveManager.userRename);
	this.addOption("Delete", SaveManager.userDelete);
	this.addOption("Export", SaveManager.userExport);
	this.addOption("Debug", this.optionEnableDebug);
	if(GuiElements.isKindle) {
		this.addOption("Exit", this.optionExit);
	}
};
FileMenu.prototype.optionNew=function(){
	SaveManager.new();
};
FileMenu.prototype.optionOpen=function(){
	var callbackFn=function(response){
		new OpenDialog(response);
	};
	HtmlServer.sendRequestWithCallback("data/files",callbackFn);
};
FileMenu.prototype.optionEnableDebug=function(){
	TitleBar.enableDebug();
};
FileMenu.prototype.optionExit=function(){
	SaveManager.checkPromptSave(function() {
		HtmlServer.sendRequest("tablet/exit");
	});
}