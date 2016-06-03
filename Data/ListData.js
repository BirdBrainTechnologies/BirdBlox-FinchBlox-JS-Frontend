//Not implemented
function ListData(value,isValid){
	Data.call(this,Data.types.list,value,isValid);
}
ListData.prototype = Object.create(Data.prototype);
ListData.prototype.constructor = ListData;