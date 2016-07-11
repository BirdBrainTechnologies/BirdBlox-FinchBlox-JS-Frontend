function List(name,data){
	this.name=name;
	if(data!=null){
		this.data=data;
	}
	else{
		this.data=new ListData();
	}
	CodeManager.addList(this);
}
List.prototype.getName=function(){
	return this.name;
};
List.prototype.changeName=function(newName){
	if(this.name!=this.newName){
		this.name=newName;
	}
};
List.prototype.getData=function(){
	return this.data;
};
List.prototype.setData=function(data){
	this.data=data;
};
List.prototype.remove=function(){
	this.data=null;
	CodeManager.removeList(this);
};
List.prototype.createXml=function(xmlDoc) {
	var list = XmlWriter.createElement(xmlDoc, "list");
	XmlWriter.setAttribute(list, "name", this.name);
	list.appendChild(this.data.createXml(xmlDoc));
	return list;
};
List.importXml=function(listNode){
	var name=XmlWriter.getAttribute(listNode,"name");
	if(name!=null){
		var dataNode=XmlWriter.findSubElement(listNode,"data");
		var data=new ListData();
		if(dataNode!=null){
			var newData=Data.importXml(dataNode);
			if(newData!=null){
				data=newData;
			}
		}
		return new List(name,data);
	}
};
/*
List.prototype.getIndex=function(indexData){
	var listData=this.data;
	var array=listData.getValue();
	if(array.length==0){
		return null;
	}
	if(indexData==null){
		return null;
	}
	var indexV=indexData.getValue();
	var min=1;
	var max=array.length;
	if(indexData.type==Data.types.selection){
		if(indexV=="last"){
			return array.length-1;
		}
		else if(indexV=="random"){
			return Math.floor(Math.random() * array.length);
		}
		else{
			return null;
		}
	}
	else if(indexData.type==Data.types.num){
		if(!indexData.isValid){
			return null;
		}
		return indexData.getValueInR(min,max,true,true)-1;
	}
	else{
		return null;
	}
};*/