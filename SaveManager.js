function SaveManager(){

}
SaveManager.autoSave=function(){
	XmlWriter.download(CodeManager.createXml(),"autoSave");
};