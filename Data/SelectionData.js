function SelectionData(value,isValid){
	Data.call(this,Data.types.selection,value,true); //Selection Data comes from a drop down and is always valid.
}
SelectionData.prototype = Object.create(Data.prototype);
SelectionData.prototype.constructor = SelectionData;
SelectionData.prototype.asString=function(){
	var valueString="";
	if(this.getValue().constructor.name=="Variable"){
		valueString=this.getValue().name;
	}
	else if(this.getValue().constructor.name=="List"){
		valueString=this.getValue().name;
	}
	else{
		valueString=this.getValue()+"";
	}
	return new StringData(valueString,true);
};
SelectionData.importXml=function(dataNode){
	var value=XmlWriter.getTextNode(dataNode,"value");
	return new SelectionData(value);
};