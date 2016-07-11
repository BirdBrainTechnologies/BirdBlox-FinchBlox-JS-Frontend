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
XmlWriter.unEscape=function(string) {
	string = string + "";
	string = string.replace(/&apos;/g, "'");
	string = string.replace(/&quot;/g, '"');
	string = string.replace(/&gt;/g, '>');
	string = string.replace(/&lt;/g, '<');
	string = string.replace(/&amp;/g, '&');
	return string;
};
XmlWriter.downloadDoc=function(xmlDoc,name){
	var blob = new Blob([XmlWriter.docToText(xmlDoc)], {type: "text/plain;charset=utf-8"});
	saveAs(blob, name+".xml");
};
XmlWriter.openDoc=function(xmlString){
	var parser = new DOMParser();
	return parser.parseFromString(xmlString, "text/xml");
};
XmlWriter.findElement=function(xmlDoc,tagName){
	tagName=XmlWriter.escape(tagName);
	var results=xmlDoc.getElementsByTagName(tagName);
	if(results.length==0){
		return null;
	}
	return results[0];
};
XmlWriter.findSubElements=function(node,tagName){
	if(node==null){
		return [];
	}
	var children=node.childNodes;
	var results=[];
	for(var i=0;i<children.length;i++){
		if(children[i].nodeType==1&&children[i].nodeName==tagName){
			results.push(children[i]);
		}
	}
	return results;
};
XmlWriter.findSubElement=function(node,tagName){
	if(node==null){
		return null;
	}
	var children=node.childNodes;
	for(var i=0;i<children.length;i++){
		if(children[i].nodeType==1&&children[i].nodeName==tagName){
			return children[i];
		}
	}
	return null;
};
XmlWriter.getAttribute=function(element,name,defaultVal,isNum){
	if(isNum==null){
		isNum=false;
	}
	if(defaultVal==null){
		defaultVal=null;
	}
	var val=element.getAttribute(XmlWriter.escape(name));
	if(val==null){
		return defaultVal;
	}
	val=XmlWriter.unEscape(val);
	if(isNum){
		var numData=(new StringData(val)).asNum();
		if(numData.isValid){
			return numData.getValue();
		}
		return defaultVal;
	}
	return val;
};
XmlWriter.getTextNode=function(element,name,defaultVal,isNum){
	if(isNum==null){
		isNum=false;
	}
	if(defaultVal==null){
		defaultVal=null;
	}
	var innerNode=XmlWriter.findSubElement(element,name);
	if(innerNode==null){
		return defaultVal;
	}
	var childNodes=innerNode.childNodes;
	if(childNodes.length>=1&&childNodes[0].nodeType==3){
		var val = childNodes[0].nodeValue;
		if(val==null){
			return defaultVal;
		}
		val=XmlWriter.unEscape(val);
		if(isNum){
			var numData=(new StringData(val)).asNum();
			if(numData.isValid){
				return numData.getValue();
			}
			return defaultVal;
		}
		return val;
	}
	return defaultVal;
};
XmlWriter.docToText=function(xmlDoc){
	var serializer = new XMLSerializer();
	return serializer.serializeToString(xmlDoc);
};