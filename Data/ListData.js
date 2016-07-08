//Not implemented
function ListData(value,isValid){
	if(value==null){
		value=new Array();
	}
	Data.call(this,Data.types.list,value,isValid);
}
ListData.prototype = Object.create(Data.prototype);
ListData.prototype.constructor = ListData;
ListData.prototype.duplicate=function(){
	var arrayCopy=new Array();
	for(var i=0;i<this.value.length;i++){
		arrayCopy.push(this.value[i]);
	}
	return new ListData(arrayCopy,this.isValid);
};
ListData.prototype.asNum=function(){
	if(this.value.length==1){
		return this.value[0].asNum();
	}
	else{
		return new NumData(0,false);
	}
};
ListData.prototype.asString=function(){
	var resultStr="";
	for(var i=0;i<this.value.length;i++){
		resultStr+=this.value[i].asString().getValue();
		if(i<this.value.length-1){
			resultStr+=", ";
		}
	}
	return new StringData(resultStr,true);
};
ListData.prototype.asBool=function(){
	if(this.value.length==1){
		return this.value[0].asBool();
	}
	else{
		return new BoolData(false,false);
	}
};
ListData.prototype.asList=function(){
	return this;
};
ListData.prototype.getIndex=function(indexData){
	var array=this.getValue();
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
};
ListData.prototype.createXml=function(xmlDoc){
	var data=XmlWriter.createElement(xmlDoc,"data");
	XmlWriter.setAttribute(data,"type",this.getDataTypeName());
	XmlWriter.setAttribute(data,"isValid",this.isValid);
	var value=xmlDoc.createElement("value");
	for(var i=0;i<this.value.length;i++){
		value.appendChild(this.value[i].createXml(xmlDoc));
	}
	data.appendChild(value);
	return data;
};