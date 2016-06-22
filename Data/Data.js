function Data(type,value,isValid){
	this.type=type;
	this.value=value;
	this.isValid=isValid;
	if(isValid==null){
		this.isValid=true;
	}
}
Data.setConstants=function(){
	Data.types=new function(){};
	Data.types.num=0;
	Data.types.bool=1;
	Data.types.string=2;
	Data.types.list=3;
	Data.types.selection=4;//A selection from a block's drop down.  Could be a sprite, variable, etc.
}
Data.prototype.asNum=function(){
	return new NumData(0,false);
}
Data.prototype.asBool=function(){
	return new BoolData(false,false);
}
Data.prototype.asString=function(){
	return new StringData("",false);
}
Data.prototype.asList=function(){
	return new ListData(null,false);
};
Data.prototype.getValue=function(){ //might remove
	return this.value;
}
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