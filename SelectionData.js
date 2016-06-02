function SelectionData(value,isValid){
	Data.call(this,Data.types.selection,value,isValid);
}
SelectionData.prototype = Object.create(Data.prototype);
SelectionData.prototype.constructor = SelectionData;
