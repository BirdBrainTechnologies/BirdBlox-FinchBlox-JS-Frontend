function NumData(value,isValid){
	if(isNaN(value)||!isFinite(value)){
		value=0;
		isValid=false;
	}
	Data.call(this,Data.types.num,value,isValid);
}
NumData.prototype = Object.create(Data.prototype);
NumData.prototype.constructor = NumData;
NumData.prototype.asNum=function(){
	return this;
};
NumData.prototype.asBool=function(){
	if(this.getValue()==1){
		return new BoolData(true,this.isValid);
	}
	else if(this.getValue()==0){
		return new BoolData(false,this.isValid);
	}
	else{
		return new BoolData(false,false);
	}
};
NumData.prototype.asString=function(){
	if(this.isValid){
		var num=this.getValue();
		num=+num.toFixed(10);
		return new StringData(num+"",true);
	}
	else{
		return new StringData("not a valid number");
	}
};
NumData.prototype.asPositiveString=function(){ //Converts to a string but avoids scientific notation
	var num=Math.abs(this.getValue());
	num=+num.toFixed(10);
	return new StringData(num+"",true);
};
NumData.prototype.getValueInR=function(min,max,positive,integer){
	var val=this.getValue();
	if(positive==true&&val<0){
		val=0;
	}
	if(integer==true){
		val=Math.round(val);
	}
	if(val<min){
		val=min;
	}
	if(val>max){
		val=max;
	}
	return val;
};
NumData.prototype.getValueWithC=function(positive,integer){
	var val=this.getValue();
	if(positive==true&&val<0){
		val=0;
	}
	if(integer==true){
		val=Math.round(val);
	}
	return val;
};
NumData.importXml=function(dataNode){
	var value=XmlWriter.getTextNode(dataNode,"value",null,true);
	if(value == null) return null;
	if((value+"").indexOf(".")==-1){
		return new NumData(parseInt(value));
	}
	else{
		return new NumData(parseFloat(value));
	}
};