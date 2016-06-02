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
	Data.types.selection=4;//A selection from a block's dropdown.  Could be a sprite, variable, etc.
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
Data.prototype.getValue=function(){ //might remove
	return this.value;
}