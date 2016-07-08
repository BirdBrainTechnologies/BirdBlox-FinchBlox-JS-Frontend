function XmlWriter(){

}
XmlWriter.setAttribute=function(element,name,value){
	name=XmlWriter.escape(name);
	value=XmlWriter.escape(value);
	element.setAttribute(name,value);
};
XmlWriter.createElement=function(xmlDoc,tagName){
	tagName=XmlWriter.escape(tagName);
	return xmlDoc.createElement(tagName);
};
XmlWriter.createTextNode=function(xmlDoc,data){
	data=XmlWriter.escape(data);
	return xmlDoc.createTextNode(data);
};
XmlWriter.newDoc=function(tagName){
	tagName=XmlWriter.escape(tagName);
	var xmlString = "<"+tagName+"></"+tagName+">";
	var parser = new DOMParser();
	return parser.parseFromString(xmlString, "text/xml");
};
XmlWriter.escape=function(string){
	string=string+"";
	string=string.replace(/&/g, '&amp;');
	string=string.replace(/</g, '&lt;');
	string=string.replace(/>/g, '&gt;');
	string=string.replace(/"/g, '&quot;');
	string=string.replace(/'/g, '&apos;');
	return string;
};
XmlWriter.download=function(xmlDoc,name){
	var serializer = new XMLSerializer();
	xmlString = serializer.serializeToString(xmlDoc);
	var blob = new Blob([xmlString], {type: "text/plain;charset=utf-8"});
	saveAs(blob, name+".xml");
};