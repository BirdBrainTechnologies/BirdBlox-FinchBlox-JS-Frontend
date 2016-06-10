function SelectionData(value,isValid){
	Data.call(this,Data.types.selection,value,true); //Selection Data comes from a drop down and is always valid.
}
SelectionData.prototype = Object.create(Data.prototype);
SelectionData.prototype.constructor = SelectionData;
