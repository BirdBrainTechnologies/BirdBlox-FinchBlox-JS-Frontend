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