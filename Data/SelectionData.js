function SelectionData(displayText, value, isValid){
	DebugOptions.validateNonNull(displayText, value);
	Data.call(this,Data.types.selection, value, isValid);
	this.displayText = displayText;
}
SelectionData.prototype = Object.create(Data.prototype);
SelectionData.prototype.constructor = SelectionData;
SelectionData.prototype.asString = function(){
	return new StringData(this.displayText, true);
};
SelectionData.prototype.asSelection = function(){
	return this;
};
SelectionData.prototype.isSelection = function(){
	return true;
};
SelectionData.importXml=function(dataNode){
	const value = XmlWriter.getTextNode(dataNode, "value");
	const displayText = XmlWriter.getTextNode(dataNode, "displayText");
	if(value == null || displayText == null) return null;
	return new SelectionData(value);
};
SelectionData.empty = function(isValid){
	return new SelectionData("", "", isValid);
};

