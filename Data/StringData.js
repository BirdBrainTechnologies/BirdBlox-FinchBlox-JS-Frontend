function StringData(value,isValid){
	Data.call(this,Data.types.string,value,isValid);
}
StringData.prototype = Object.create(Data.prototype);
StringData.prototype.constructor = StringData;
StringData.prototype.asNum=function(){
	if(this.isNumber()){
		return new NumData(parseFloat(this.getValue()),this.isValid);
	}
	else{
		return new NumData(0,false);
	}
}
StringData.prototype.asBool=function(){
	if(this.getValue().toUpperCase()=="TRUE"){
		return new BoolData(true,this.isValid);
	}
	else if(this.getValue().toUpperCase()=="FALSE"){
		return new BoolData(false,this.isValid);
	}
	return new BoolData(false,false);
}
StringData.prototype.asString=function(){
	return this;
}
StringData.prototype.isNumber=function(){ //Checks to see if the number can be converted to a valid number
	var numberRE = /^[+-]?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/  //from https://en.wikipedia.org/wiki/Regular_expression
	return numberRE.test(this.getValue());
}
StringData.importXml=function(dataNode){
	var value=XmlWriter.getTextNode(dataNode,"value","");
	return new StringData(value);
};