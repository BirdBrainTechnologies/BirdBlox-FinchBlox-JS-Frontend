function SaveManager(){

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
	XmlWriter.downloadDoc(CodeManager.createXml(),"save");
};
SaveManager.open=function(fileName){
	fileName=fileName.replace(".xml","");
	var callbackFn=function(response){
		SaveManager.loadFile(response);
	};
	HtmlServer.sendRequestWithCallback("load/"+fileName,callbackFn);
};
SaveManager.saveAs=function(){
	var callbackFn=function(response){
		XmlWriter.downloadDoc(CodeManager.createXml(),"save");
	};
	HtmlServer.sendRequestWithCallback("new",callbackFn);
};
SaveManager.new=function(){
	HtmlServer.sendRequestWithCallback("new");
	SaveManager.loadFile("<project><tabs></tabs></project>");
};
