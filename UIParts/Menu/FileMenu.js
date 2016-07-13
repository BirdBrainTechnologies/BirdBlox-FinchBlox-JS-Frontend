function FileMenu(button){
	Menu.call(this,button);
	this.addOption("New", this.optionNew);
	this.addOption("Open", this.optionOpen);
	this.addOption("Save", this.optionSave);
	this.addOption("Save as", this.optionSaveAs);
	this.addOption("Import", this.optionImport);
	this.addOption("Export", this.optionExport);
	this.buildMenu();
}
FileMenu.prototype = Object.create(Menu.prototype);
FileMenu.prototype.constructor = FileMenu;
FileMenu.prototype.optionNew=function(){
	SaveManager.new();
};
FileMenu.prototype.optionOpen=function(){
	//new OpenDialog("sadsadsa\nsdfdsfdsf");
	var callbackFn=function(response){
		new OpenDialog(response);
	};
	HtmlServer.sendRequestWithCallback("files",callbackFn);
};
FileMenu.prototype.optionSave=function(){
	SaveManager.save();
};
FileMenu.prototype.optionSaveAs=function(){
	SaveManager.saveAs();
};
FileMenu.prototype.optionImport=function(){

};
FileMenu.prototype.optionExport=function(){

};