function SaveManager(){
	SaveManager.fileName="";
	SaveManager.modified=false;
}
SaveManager.autoSave=function(){
	XmlWriter.downloadDoc(CodeManager.createXml(),"autoSave");
};
SaveManager.loadFile=function(xmlString){
	var xmlDoc=XmlWriter.openDoc(xmlString);
	var project=XmlWriter.findElement(xmlDoc,"project");
	if(project==null){
		return;
	}
	CodeManager.importXml(project);
};
SaveManager.loadTest=function(){
	var file='';
	SaveManager.loadFile(file);
};
SaveManager.reloadTest=function(){
	var xmlDoc=CodeManager.createXml();
	var file=XmlWriter.docToText(xmlDoc);
	XmlWriter.downloadDoc(xmlDoc,"autoSave");
	SaveManager.loadFile(file);
};
SaveManager.listTest=function(){
	var callbackFn=function(response){
		GuiElements.alert(response);
	};
	HtmlServer.sendRequestWithCallback("files",callbackFn);
};
SaveManager.save=function(){
	var callbackFn=function(response) {
		SaveManager.fileName=response;
		SaveManager.markSaved();
	};
	XmlWriter.openDocInTab(CodeManager.createXml());
	HtmlServer.sendRequestWithCallback("filename",callbackFn);
};
SaveManager.open=function(fileName){
	var callbackFn=function(response){
		SaveManager.loadFile(response);
		var callbackFn2=function(response) {
			SaveManager.fileName=response;
			SaveManager.markSaved();
		};
		HtmlServer.sendRequestWithCallback("filename",callbackFn2);
	};
	HtmlServer.sendRequestWithCallback("load/"+fileName,callbackFn);
};
SaveManager.saveAs=function(){
	var callbackFn=function(response){
		SaveManager.save();
	};
	HtmlServer.sendRequestWithCallback("new",callbackFn);
};
SaveManager.new=function(){
	HtmlServer.sendRequestWithCallback("new");
	SaveManager.fileName="New project";
	SaveManager.markSaved();
	SaveManager.loadFile("<project><tabs></tabs></project>");
};
SaveManager.markEdited=function(){
	if(!SaveManager.modified){
		TitleBar.setText(SaveManager.fileName+"*");
		SaveManager.modified=true;
	}
};
SaveManager.markSaved=function(){
	SaveManager.modified=false;
	TitleBar.setText(SaveManager.fileName);
};