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