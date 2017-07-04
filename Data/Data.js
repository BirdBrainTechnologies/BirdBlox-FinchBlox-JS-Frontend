function Data(type,value,isValid){
	this.type=type;
	this.value=value;
	this.isValid=isValid;
	if(isValid==null){
		this.isValid=true;
	}
}
Data.setConstants=function(){
	Data.types=function(){};
	Data.types.num=0;
	Data.types.bool=1;
	Data.types.string=2;
	Data.types.list=3;
	Data.types.selection=4;//A selection from a block's drop down.  Could be a sprite, variable, etc.
};
Data.prototype.asNum=function(){
	return new NumData(0,false);
};
Data.prototype.asBool=function(){
	return new BoolData(false,false);
};
Data.prototype.asString=function(){
	return new StringData("",false);
};
Data.prototype.asList=function(){
	return new ListData(null,false);
};
Data.prototype.asSelection = function(){
	return SelectionData.empty(false);
};
Data.prototype.getValue=function(){ //might remove
	return this.value;
};
Data.prototype.isSelection = function(){
	return false;
};
Data.checkEquality=function(data1,data2){
	var val1=data1.getValue();
	var val2=data2.getValue();
	var string1=data1.asString().getValue();
	var string2=data2.asString().getValue();
	var numD1=data1.asNum();
	var numD2=data2.asNum();
	var types=Data.types;
	var isValid=data1.isValid&&data2.isValid;
	if(data1.type==data2.type){ //If the types match, just compare directly.
		return isValid&&val1==val2; //Invalid data is never equal.
	}
	else if(data1.type==types.string||data2.type==types.string){ //If one is a string...
		if(string1==string2) { //If both strings match, result is true.
			return true;
		}
		else if(data1.type==types.num||data2.type==types.num){ //Still the numbers could match like "3.0"=3.
			if(numD1.isValid&&numD2.isValid){ //If both are valid numbers...
				return numD1.getValue()==numD2.getValue(); //Compare numerical values.
			}
			else{
				return false; //A string and unequal/invalid number are not equal.
			}
		}
		else{
			return false; //Two unequal, nonnumerical strings are unequal.
		}
	}
	else{
		return false; //If the types don't match and neither is a string, they are unequal.
	}
};
Data.prototype.createXml=function(xmlDoc){
	var data=XmlWriter.createElement(xmlDoc,"data");
	XmlWriter.setAttribute(data,"type",this.getDataTypeName());
	XmlWriter.setAttribute(data,"isValid",this.isValid);
	var value=XmlWriter.createElement(xmlDoc,"value");
	var valueString=this.getValue()+"";
	if(this.getValue().constructor.name=="Variable"){
		valueString=this.getValue().name;
	}
	else if(this.getValue().constructor.name=="List"){
		valueString=this.getValue().name;
	}
	var valueText=XmlWriter.createTextNode(xmlDoc,valueString);
	value.appendChild(valueText);
	data.appendChild(value);
	return data;
};
Data.importXml=function(dataNode){
	var typeName=XmlWriter.getAttribute(dataNode,"type");
	var type=Data.getDataTypeFromName(typeName);
	if(type==null){
		return null;
	}
	return type.importXml(dataNode);
};
Data.prototype.getDataTypeName=function(){
	if(this.type==Data.types.num){
		return "num";
	}
	else if(this.type==Data.types.bool){
		return "bool";
	}
	else if(this.type==Data.types.string){
		return "string";
	}
	else if(this.type==Data.types.list){
		return "list";
	}
	else if(this.type==Data.types.selection){
		return "selection";
	}
	else{
		return null;
	}
};
Data.getDataTypeFromName=function(typeName){
	if(typeName=="num"){
		return NumData;
	}
	else if(typeName=="bool"){
		return BoolData;
	}
	else if(typeName=="string"){
		return StringData;
	}
	else if(typeName=="list"){
		return ListData;
	}
	else if(typeName=="selection"){
		return SelectionData;
	}
	else{
		return null;
	}
};