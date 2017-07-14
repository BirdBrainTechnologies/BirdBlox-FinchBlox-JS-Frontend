function BoolData(value,isValid){
	Data.call(this,Data.types.bool,value,isValid);
}
BoolData.prototype = Object.create(Data.prototype);
BoolData.prototype.constructor = BoolData;
BoolData.prototype.asNum=function(){
	if(this.getValue()){
		return new NumData(1,this.isValid);
	}
	else{
		return new NumData(0,this.isValid);
	}
}
BoolData.prototype.asBool=function(){
	return this;
}
BoolData.prototype.asString=function(){
	if(this.getValue()){
		return new StringData("true",true);
	}
	else{
		return new StringData("false",true);
	}
}
BoolData.importXml=function(dataNode){
	let value = XmlWriter.getTextNode(dataNode, "value");
	if(value == null) return null;
	return new BoolData(value == "true");
};