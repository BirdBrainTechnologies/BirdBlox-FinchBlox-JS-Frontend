"use strict";
var FrontendVersion = 393;


function DebugOptions(){
	var DO = DebugOptions;
	DO.enabled = true;

	DO.mouse = false;
	DO.addVirtualHB = false;
	DO.addVirtualFlutter = true;
	DO.showVersion = false;
	DO.showDebugMenu = true;
	DO.logErrors = true;
	DO.lockErrors = false;
	DO.errorLocked = false;
	DO.logHttp = true;
	DO.skipInitSettings = false;
	DO.blockLogging = false;
	DO.skipHtmlRequests = false;
	if(DO.enabled){
		DO.applyConstants();
	}
}
DebugOptions.applyConstants = function(){
	var DO = DebugOptions;
	if(!DO.enabled) return;
};
DebugOptions.applyActions = function(){
	var DO = DebugOptions;
	if(!DO.enabled) return;
	if(DO.addVirtualHB){
		let virHB = new DeviceHummingbird("Virtual HB","idOfVirtualHb");
		DeviceHummingbird.getManager().setOneDevice(virHB);
	}
	if(DO.addVirtualFlutter){
		let virtual = new DeviceFlutter("Virtual F","idOfVirtualF");
		DeviceFlutter.getManager().setOneDevice(virtual);
	}
	if(DO.showVersion){
		GuiElements.alert("Version: "+GuiElements.appVersion);
	}
	if(DO.showDebugMenu){
		TitleBar.enableDebug();
	}
};
DebugOptions.shouldLogErrors=function(){
	return DebugOptions.logErrors && DebugOptions.enabled;
};
DebugOptions.shouldSkipInitSettings=function(){
	var DO = DebugOptions;
	return DO.enabled && (DO.mouse || DO.skipInitSettings);
};
DebugOptions.shouldSkipHtmlRequests = function(){
	var DO = DebugOptions;
	return DO.enabled && (DO.skipHtmlRequests || DO.mouse);
};
DebugOptions.shouldLogHttp=function(){
	var DO = DebugOptions;
	return DO.enabled && DO.logHttp;
};
DebugOptions.safeFunc = function(func){
	if(func == null) return null;
	if(DebugOptions.shouldLogErrors()){
		return function(){
			try {
				if(!DebugOptions.errorLocked || !DebugOptions.lockErrors) {
					func.apply(this, arguments);
				}
			}
			catch(err) {
				DebugOptions.errorLocked = true;
				GuiElements.alert("ERROR: " + err.message);
				HtmlServer.showChoiceDialog("ERROR",err.message + "\n" + err.stack ,"OK","OK",true, function(){});
			}
		}
	}
	else{
		return func;
	}
};
DebugOptions.validateNumbers = function(){
	if(!DebugOptions.shouldLogErrors()) return;
	for(let i = 0; i < arguments.length; i++){
		if(isNaN(arguments[i]) || !isFinite(arguments[i])){
			throw new UserException("Invalid Number");
		}
	}
};
DebugOptions.validateNonNull = function(){
	if(!DebugOptions.shouldLogErrors()) return;
	for(let i = 0; i < arguments.length; i++){
		if(arguments[i] == null){
			throw new UserException("Null parameter");
		}
	}
};
DebugOptions.validateOptionalNums = function(){
	if(!DebugOptions.shouldLogErrors()) return;
	for(let i = 0; i < arguments.length; i++){
		if(arguments[i] != null && (isNaN(arguments[i]) || !isFinite(arguments[i]))){
			throw new UserException("Invalid optional number");
		}
	}
};
DebugOptions.assert = function(bool){
	if(!bool && DebugOptions.shouldLogErrors()){
		throw new UserException("Assertion Failure");
	}
};
DebugOptions.stopErrorLocking = function(){
	DebugOptions.lockErrors = false;
};
DebugOptions.enableLogging = function(){
	DebugOptions.blockLogging = false;
};
DebugOptions.throw = function(message){
	if(!DebugOptions.shouldLogErrors()) return;
	throw new UserException(message);
};

function UserException(message) {
	this.message = message;
	this.name = 'UserException';
	this.stack = (new Error()).stack;
}
function Data(type,value,isValid){
	this.type=type;
	this.value=value;
	this.isValid=isValid;
	if(isValid==null){
		this.isValid=true;
	}
}
Data.setConstants=function(){
	Data.types=function(){};
	Data.types.num=0;
	Data.types.bool=1;
	Data.types.string=2;
	Data.types.list=3;
	Data.types.selection=4;//A selection from a block's drop down.  Could be a sprite, variable, etc.
};
Data.prototype.asNum=function(){
	return new NumData(0,false);
};
Data.prototype.asBool=function(){
	return new BoolData(false,false);
};
Data.prototype.asString=function(){
	return new StringData("",false);
};
Data.prototype.asList=function(){
	return new ListData(null,false);
};
Data.prototype.getValue=function(){ //might remove
	return this.value;
};
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

Data.prototype.createXml=function(xmlDoc){
	var data=XmlWriter.createElement(xmlDoc,"data");
	XmlWriter.setAttribute(data,"type",this.getDataTypeName());
	XmlWriter.setAttribute(data,"isValid",this.isValid);
	var value=XmlWriter.createElement(xmlDoc,"value");
	var valueString=this.getValue()+"";
	if(this.getValue().constructor.name=="Variable"){
		valueString=this.getValue().name;
	}
	else if(this.getValue().constructor.name=="List"){
		valueString=this.getValue().name;
	}
	var valueText=XmlWriter.createTextNode(xmlDoc,valueString);
	value.appendChild(valueText);
	data.appendChild(value);
	return data;
};
Data.importXml=function(dataNode){
	var typeName=XmlWriter.getAttribute(dataNode,"type");
	var type=Data.getDataTypeFromName(typeName);
	if(type==null){
		return null;
	}
	return type.importXml(dataNode);
};
Data.prototype.getDataTypeName=function(){
	if(this.type==Data.types.num){
		return "num";
	}
	else if(this.type==Data.types.bool){
		return "bool";
	}
	else if(this.type==Data.types.string){
		return "string";
	}
	else if(this.type==Data.types.list){
		return "list";
	}
	else if(this.type==Data.types.selection){
		return "selection";
	}
	else{
		return null;
	}
};
Data.getDataTypeFromName=function(typeName){
	if(typeName=="num"){
		return NumData;
	}
	else if(typeName=="bool"){
		return BoolData;
	}
	else if(typeName=="string"){
		return StringData;
	}
	else if(typeName=="list"){
		return ListData;
	}
	else if(typeName=="selection"){
		return SelectionData;
	}
	else{
		return null;
	}
};
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
	var value=XmlWriter.getTextNode(dataNode,"value",0,true);
	if((value+"").indexOf(".")==-1){
		return new NumData(parseInt(value));
	}
	else{
		return new NumData(parseFloat(value));
	}
};
function BoolData(value,isValid){
	Data.call(this,Data.types.bool,value,isValid);
}
BoolData.prototype = Object.create(Data.prototype);
BoolData.prototype.constructor = BoolData;
BoolData.prototype.asNum=function(){
	if(this.getValue()){
		return new NumData(1,this.isValid);
	}
	else{
		return new NumData(0,this.isValid);
	}
}
BoolData.prototype.asBool=function(){
	return this;
}
BoolData.prototype.asString=function(){
	if(this.getValue()){
		return new StringData("true",true);
	}
	else{
		return new StringData("false",true);
	}
}
BoolData.importXml=function(dataNode){
	var value=XmlWriter.getTextNode(dataNode,"value","false");
	return new BoolData(value=="true");
};
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
ListData.prototype.getIndex=function(indexData){
	var array=this.getValue();
	if(array.length==0){
		return null;
	}
	if(indexData==null){
		return null;
	}
	var indexV=indexData.getValue();
	var min=1;
	var max=array.length;
	if(indexData.type==Data.types.selection){
		if(indexV=="last"){
			return array.length-1;
		}
		else if(indexV=="random"){
			return Math.floor(Math.random() * array.length);
		}
		else{
			return null;
		}
	}
	else if(indexData.type==Data.types.num){
		if(!indexData.isValid){
			return null;
		}
		return indexData.getValueInR(min,max,true,true)-1;
	}
	else{
		return null;
	}
};
ListData.prototype.createXml=function(xmlDoc){
	var data=XmlWriter.createElement(xmlDoc,"data");
	XmlWriter.setAttribute(data,"type",this.getDataTypeName());
	XmlWriter.setAttribute(data,"isValid",this.isValid);
	var value=xmlDoc.createElement("value");
	for(var i=0;i<this.value.length;i++){
		value.appendChild(this.value[i].createXml(xmlDoc));
	}
	data.appendChild(value);
	return data;
};
ListData.importXml=function(dataNode){
	var valueNode=XmlWriter.findSubElement(dataNode,"value");
	var dataNodes=XmlWriter.findSubElements(valueNode,"data");
	var valueArray=[];
	for(var i=0;i<dataNodes.length;i++){
		var dataEntry=Data.importXml(dataNodes[i]);
		if(dataEntry!=null){
			valueArray.push(dataEntry);
		}
	}
	return new ListData(valueArray);
};
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
/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @constructor
 * @classdesc An abstract class for executing Blocks/Stacks/Slots/BlockSlots to convey their execution status.
 * @abstract
 */
function ExecutionStatus(){
	DebugOptions.throw("Abstract class may not be constructed");
}
/**
 * Is the block/stack/slot currently running?
 * @returns {boolean}
 */
ExecutionStatus.prototype.isRunning = function(){
	return false;
};
/**
 * Has the block/stack/slot encountered an error?
 * @returns {boolean}
 */
ExecutionStatus.prototype.hasError = function(){
	return false;
};
/**
 * What is the result of execution.
 * @returns {Data}
 */
ExecutionStatus.prototype.getResult = function(){
	return null;
};
/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a completed block
 * @class
 * @augments ExecutionStatus
 * @param {Data!} result - The error that occurred
 */
function ExecutionStatusResult(result){
	/** @type {Data!} */
	this.result = result;
}
ExecutionStatusResult.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusResult.constructor = ExecutionStatusResult;
/**
 * @inheritDoc
 */
ExecutionStatusResult.prototype.getResult = function(){
	return this.result;
};
/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a block with an error
 * @class
 * @augments ExecutionStatus
 */
function ExecutionStatusError(){

}
ExecutionStatusError.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusError.constructor = ExecutionStatusError;
/**
 * @inheritDoc
 */
ExecutionStatusError.prototype.hasError = function(){
	return true;
};
/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a block that is done but does not return a value
 * @class
 * @augments ExecutionStatus
 */
function ExecutionStatusDone(){

}
ExecutionStatusDone.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusDone.constructor = ExecutionStatusDone;
/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a running block
 * @class
 * @augments ExecutionStatus
 */
function ExecutionStatusRunning(){

}
ExecutionStatusRunning.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusRunning.constructor = ExecutionStatus;
/**
 * @inheritDoc
 */
ExecutionStatusRunning.prototype.isRunning = function(){
	return true;
};
function Variable(name, data){
	this.name=name;
	this.data=data;
	if(this.data==null){
		this.data=new NumData(0);
	}
	CodeManager.addVariable(this);
}
Variable.prototype.getName=function(){
	return this.name;
};
Variable.prototype.getData=function(){
	return this.data;
};
Variable.prototype.setData=function(data){
	this.data=data;
};
Variable.prototype.remove=function(){
	this.data=null;
	CodeManager.removeVariable(this);
};
Variable.prototype.createXml=function(xmlDoc) {
	var variable = XmlWriter.createElement(xmlDoc, "variable");
	XmlWriter.setAttribute(variable, "name", this.name);
	variable.appendChild(this.data.createXml(xmlDoc));
	return variable;
};
Variable.importXml=function(variableNode){
	var name=XmlWriter.getAttribute(variableNode,"name");
	if(name!=null){
		var dataNode=XmlWriter.findSubElement(variableNode,"data");
		var data=new NumData(0);
		if(dataNode!=null){
			var newData=Data.importXml(dataNode);
			if(newData!=null){
				data=newData;
			}
		}
		return new Variable(name,data);
	}
};
Variable.prototype.rename=function(){
	var callbackFn=function(cancelled,response){
		if(!cancelled&&CodeManager.checkVarName(response)){
			callbackFn.variable.name=response;
			CodeManager.renameVariable(callbackFn.variable);
		}
	};
	callbackFn.variable=this;
	HtmlServer.showDialog("Rename variable","Enter variable name",this.name,callbackFn);
};
Variable.prototype.delete=function(){
	if(CodeManager.checkVariableUsed(this)) {
		var callbackFn = function (response) {
			if (response == "2") {
				callbackFn.variable.remove();
				CodeManager.deleteVariable(callbackFn.variable);
			}
		};
		callbackFn.variable = this;
		var question = "Are you sure you would like to delete the variable \"" + this.name + "\"? ";
		question += "This will delete all copies of this block.";
		HtmlServer.showChoiceDialog("Delete variable", question, "Don't delete", "Delete", true, callbackFn);
	}
	else{
		this.remove();
		CodeManager.deleteVariable(this);
	}
};
function List(name,data){
	this.name=name;
	if(data!=null){
		this.data=data;
	}
	else{
		this.data=new ListData();
	}
	CodeManager.addList(this);
}
List.prototype.getName=function(){
	return this.name;
};
List.prototype.changeName=function(newName){
	if(this.name!=this.newName){
		this.name=newName;
	}
};
List.prototype.getData=function(){
	return this.data;
};
List.prototype.setData=function(data){
	this.data=data;
};
List.prototype.remove=function(){
	this.data=null;
	CodeManager.removeList(this);
};
List.prototype.createXml=function(xmlDoc) {
	var list = XmlWriter.createElement(xmlDoc, "list");
	XmlWriter.setAttribute(list, "name", this.name);
	list.appendChild(this.data.createXml(xmlDoc));
	return list;
};
List.importXml=function(listNode){
	var name=XmlWriter.getAttribute(listNode,"name");
	if(name!=null){
		var dataNode=XmlWriter.findSubElement(listNode,"data");
		var data=new ListData();
		if(dataNode!=null){
			var newData=Data.importXml(dataNode);
			if(newData!=null){
				data=newData;
			}
		}
		return new List(name,data);
	}
};
List.prototype.rename=function(){
	var callbackFn=function(cancelled,response){
		if(!cancelled&&CodeManager.checkListName(response)){
			callbackFn.list.name=response;
			CodeManager.renameList(callbackFn.list);
		}
	};
	callbackFn.list=this;
	HtmlServer.showDialog("Rename list","Enter list name",this.name,callbackFn);
};
List.prototype.delete=function(){
	if(CodeManager.checkListUsed(this)) {
		var callbackFn = function (response) {
			if (response == "2") {
				callbackFn.list.remove();
				CodeManager.deleteList(callbackFn.list);
			}
		};
		callbackFn.list = this;
		var question = "Are you sure you would like to delete the list \"" + this.name + "\"? ";
		question += "This will delete all copies of this block.";
		HtmlServer.showChoiceDialog("Delete list", question, "Don't delete", "Delete", true, callbackFn);
	}
	else{
		this.remove();
		CodeManager.deleteList(this);
	}
};
/*
List.prototype.getIndex=function(indexData){
	var listData=this.data;
	var array=listData.getValue();
	if(array.length==0){
		return null;
	}
	if(indexData==null){
		return null;
	}
	var indexV=indexData.getValue();
	var min=1;
	var max=array.length;
	if(indexData.type==Data.types.selection){
		if(indexV=="last"){
			return array.length-1;
		}
		else if(indexV=="random"){
			return Math.floor(Math.random() * array.length);
		}
		else{
			return null;
		}
	}
	else if(indexData.type==Data.types.num){
		if(!indexData.isValid){
			return null;
		}
		return indexData.getValueInR(min,max,true,true)-1;
	}
	else{
		return null;
	}
};*/
/**
 * Created by Tom on 6/14/2017.
 */
function Device(name, id){
	this.name = name;
	this.id = id;
}
Device.setDeviceTypeName = function(deviceClass, typeId, typeName, shortTypeName){
	deviceClass.getDeviceTypeName = function(shorten, maxChars){
		if(shorten || typeName.length > maxChars){
			return shortTypeName;
		} else {
			return typeName;
		}
	};
	deviceClass.getDeviceTypeId = function(){
		return typeId;
	};
	deviceClass.getNotConnectedMessage = function(){
		return typeName + " not connected";
	};
	var manager = new DeviceManager(deviceClass);
	deviceClass.getManager = function(){
		return manager;
	};
	deviceClass.getConnectionInstructions = function(){
		return "Scanning for devices...";
	};
};
Device.prototype.getDeviceTypeName = function(shorten, maxChars){
	return this.constructor.getDeviceTypeName(shorten, maxChars);
};
Device.prototype.getDeviceTypeId = function(){
	return this.constructor.getDeviceTypeId();
};
Device.prototype.disconnect = function(){
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/disconnect");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};
Device.prototype.connect = function(){
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/connect");
	request.addParam("id", this.id);
	HtmlServer.sendRequestWithCallback(request.toString());
};
Device.fromJson = function(deviceClass, json){
	return new deviceClass(json.name, json.id);
};
Device.fromJsonArray = function(deviceClass, json){
	let res = [];
	for(let i = 0; i < json.length; i++){
		res.push(Device.fromJson(deviceClass, json[i]));
	}
	return res;
};
Device.getTypeList = function(){
	return [DeviceHummingbird, DeviceFlutter];
};
Device.stopAll = function(){
	var request = new HttpRequestBuilder("devices/stop");
	HtmlServer.sendRequestWithCallback(request.toString());
};
/**
 * Created by Tom on 6/14/2017.
 */
function DeviceWithPorts(name, id){
	Device.call(this, name, id);
}
DeviceWithPorts.prototype = Object.create(Device.prototype);
DeviceWithPorts.prototype.constructor = Device;
DeviceWithPorts.prototype.readSensor = function(status, sensorType, port){
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/in/" + sensorType);
	request.addParam("id", this.id);
	request.addParam("port", port);
	HtmlServer.sendRequest(request.toString(), status);
};
DeviceWithPorts.prototype.setOutput = function(status, outputType, port, value, valueKey){
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/out/" + outputType);
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam(valueKey, value);
	HtmlServer.sendRequest(request.toString(), status);
};
DeviceWithPorts.prototype.setTriLed = function(status, port, red, green, blue){
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/out/triled");
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam("red", red);
	request.addParam("green", green);
	request.addParam("blue", blue);
	HtmlServer.sendRequest(request.toString(), status);
};
/**
 * Created by Tom on 6/14/2017.
 */
function DeviceManager(deviceClass){
	this.deviceClass = deviceClass;
	this.connectedDevices = [];
	this.connectionStatus = 2;
	// 0 - At least 1 disconnected
	// 1 - Every device is OK
	// 2 - Nothing connected
	this.selectableDevices = 0;
}
DeviceManager.prototype.getDeviceCount = function() {
	return this.connectedDevices.length;
};
DeviceManager.prototype.getDevice = function(index){
	if(index >= this.getDeviceCount()) return null;
	return this.connectedDevices[index];
};
DeviceManager.prototype.setDevice = function(index, newDevice){
	DebugOptions.assert(index < this.getDeviceCount());
	this.connectedDevices[index].disconnect();
	newDevice.connect();
	this.connectedDevices[index] = newDevice;
	this.updateSelectableDevices();
};
DeviceManager.prototype.removeDevice = function(index){
	this.connectedDevices[index].disconnect();
	this.connectedDevices.splice(index, 1);
	this.updateSelectableDevices();
};
DeviceManager.prototype.appendDevice = function(newDevice){
	newDevice.connect();
	this.connectedDevices.push(newDevice);
	this.updateSelectableDevices();
};
DeviceManager.prototype.setOneDevice = function(newDevice){
	for(let i = 0; i<this.connectedDevices.length; i++){
		this.connectedDevices[i].disconnect();
	}
	newDevice.connect();
	this.connectedDevices = [newDevice];
	this.updateSelectableDevices();
};
DeviceManager.prototype.removeAllDevices = function(){
	this.connectedDevices.forEach(function(device){
		device.disconnect();
	});
	this.connectedDevices = [];
	this.updateSelectableDevices();
};
DeviceManager.prototype.updateTotalStatus = function(){
	if(this.getDeviceCount() == 0){
		this.connectionStatus = 2;
		return;
	}
	var request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/totalStatus");
	var me = this;
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		me.connectionStatus = parseInt(result);
		if (isNaN(me.connectionStatus)) {
			me.connectionStatus = 0;
		}
	});
};
DeviceManager.prototype.getTotalStatus = function(){
	return this.connectionStatus;
};
DeviceManager.prototype.updateSelectableDevices = function(){
	var oldCount=this.selectableDevices;
	var inUse=CodeManager.countDevicesInUse(this.deviceClass);
	var newCount=Math.max(this.getDeviceCount(), inUse);
	this.selectableDevices=newCount;
	if(newCount<=1&&oldCount>1){
		CodeManager.hideDeviceDropDowns(this.deviceClass);
	}
	else if(newCount>1&&oldCount<=1){
		CodeManager.showDeviceDropDowns(this.deviceClass);
	}
	BlockPalette.getCategory("robots").refreshGroup();
};
DeviceManager.prototype.getSelectableDeviceCount=function(){
	return this.selectableDevices;
};
DeviceManager.updateSelectableDevices = function(){
	Device.getTypeList().forEach(function(deviceType){
		deviceType.getManager().updateSelectableDevices();
	});
};
/**
 * Created by Tom on 6/14/2017.
 */
function DeviceHummingbird(name, id){
	DeviceWithPorts.call(this, name, id);
}
DeviceHummingbird.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHummingbird.prototype.constructor = DeviceHummingbird;
Device.setDeviceTypeName(DeviceHummingbird, "hummingbird", "Hummingbird", "HB");

/**
 * Created by Tom on 6/14/2017.
 */
function DeviceFlutter(name, id){
	DeviceWithPorts.call(this, name, id);
}
DeviceFlutter.prototype = Object.create(DeviceWithPorts.prototype);
Device.setDeviceTypeName(DeviceFlutter, "flutter", "Flutter", "F");
DeviceFlutter.prototype.constructor = DeviceFlutter;
DeviceFlutter.prototype.setBuzzer = function(status, volume, frequency){
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/out/buzzer");
	request.addParam("id", this.id);
	request.addParam("volume", volume);
	request.addParam("frequency", frequency);
	HtmlServer.sendRequest(request.toString(), status);
};
DeviceFlutter.getConnectionInstructions = function(){
	return "Press the \"find me\" button on your Flutter";
};


/* GuiElements is a static class that builds the UI and initializes the other classes.
 * It contains functions to create and modify elements of the main SVG.
 * GuiElements is run once the browser has loaded all the js and html files.
 */
function GuiElements(){
	let svg2=document.getElementById("frontSvg");
	let svg1=document.getElementById("middleSvg");
	let svg0=document.getElementById("backSvg");
	GuiElements.svgs = [svg0, svg1, svg2];

	GuiElements.defs=document.getElementById("SvgDefs");
	GuiElements.loadInitialSettings(function(){
		GuiElements.setConstants();
		GuiElements.createLayers();
		GuiElements.currentOverlay=null; //Keeps track of is a BubbleOverlay is visible so that is can be closed.
		GuiElements.dialogBlock=null;
		GuiElements.buildUI();
		HtmlServer.sendFinishedLoadingRequest();
	});
}
/* Runs GuiElements once all resources are loaded. */
document.addEventListener('DOMContentLoaded', function() {
	(DebugOptions.safeFunc(GuiElements))();
}, false);
GuiElements.loadInitialSettings=function(callback){
	DebugOptions();
	HtmlServer();
	GuiElements.setGuiConstants();
	GuiElements.load = {};
	GuiElements.load.version = false;
	GuiElements.load.zoom = false;
	GuiElements.load.os = false;
	GuiElements.load.lastFileName = true;
	GuiElements.load.lastFileNamed = true;
	if(!DebugOptions.shouldSkipInitSettings()) {
		var count = 0;
		var checkIfDone = function () {
			count++;
			GuiElements.alert(""+GuiElements.load.version + GuiElements.load.zoom + GuiElements.load.os + GuiElements.load.lastFileName + GuiElements.load.lastFileNamed);
			if (GuiElements.load.version && GuiElements.load.zoom && GuiElements.load.os && GuiElements.load.lastFileName && GuiElements.load.lastFileNamed) {
				callback();
			}
		};
		GuiElements.getAppVersion(function () {
			GuiElements.load.version = true;
			checkIfDone();
		});
		GuiElements.configureZoom(function () {
			GuiElements.width=window.innerWidth/GuiElements.zoomFactor;
			GuiElements.height=window.innerHeight/GuiElements.zoomFactor;
			GuiElements.load.zoom = true;
			checkIfDone();
		});
		GuiElements.getOsVersion(function(){
			GuiElements.load.os = true;
			checkIfDone();
		});
		/*SaveManager.getCurrentDocName(function(){
			GuiElements.load.lastFileName = true;
			checkIfDone();
		}, function(){
			GuiElements.load.lastFileNamed = true;
			checkIfDone();
		});*/
	}
	else{
		callback();
	}
};
GuiElements.setGuiConstants=function(){
	GuiElements.minZoom=0.25;
	GuiElements.maxZoom=4;
	GuiElements.minZoomMult=0.5;
	GuiElements.maxZoomMult=2;
	GuiElements.zoomAmount=0.1;
	GuiElements.defaultZoomMm = 246.38;
	GuiElements.defaultZoomPx = 1280;
	GuiElements.defaultZoomMultiple = 1;

	GuiElements.computedZoom = GuiElements.defaultZoomMultiple; //The computed default zoom amount for the device
	GuiElements.zoomMultiple = 1; //GuiElements.zoomFactor = zoomMultiple * computedZoom
	GuiElements.zoomFactor = GuiElements.defaultZoomMultiple;

	GuiElements.width=window.innerWidth/GuiElements.zoomFactor;
	GuiElements.height=window.innerHeight/GuiElements.zoomFactor;

	GuiElements.blockerOpacity=0.5;

	GuiElements.isKindle = false;
	GuiElements.isIos = false;
};
/* Many classes have static functions which set constants such as font size, etc. 
 * GuiElements.setConstants runs these functions in sequence, thereby initializing them.
 * Some classes rely on constants from eachother, so the order they execute in is important. */
GuiElements.setConstants=function(){
	Data.setConstants();
	/* If a class is static and does not build a part of the UI, 
	then its main function is used to initialize its constants. */
	VectorPaths();
	ImageLists();
	Sounds();
	BlockList();
	Colors();
	Button.setGraphics();
	//If the constants are only related to the way the UI looks, the method is called setGraphics().
	DeviceStatusLight.setConstants();
	TitleBar.setGraphics();
	BlockGraphics();
	Slot.setConstants();
	Block.setConstants();
	BlockPalette.setGraphics();
	TabManager.setGraphics();
	CategoryBN.setGraphics();
	MenuBnList.setGraphics();
	SmoothMenuBnList.setGraphics();
	Menu.setGraphics();
	DeviceMenu.setGraphics();
	InputPad.setGraphics();
	BubbleOverlay.setGraphics();
	ResultBubble.setConstants();
	BlockContextMenu.setGraphics();
	ConnectOneHBDialog.setConstants();
	ConnectMultipleHBDialog.setConstants();
	DiscoverDialog.setConstants();
	HBConnectionList.setConstants();
	RecordingManager();
	OpenDialog.setConstants();
	RowDialog.setConstants();
	RecordingDialog.setConstants();
	DisplayBox.setGraphics();
	OverflowArrows.setConstants();
	CodeManager();
	SaveManager();
};
/* Debugging function which displays information on screen */
GuiElements.alert=function(message){
	if(DebugOptions.blockLogging == null){
		DebugOptions.blockLogging = true;
	}
	if(!DebugOptions.blockLogging) {
		debug.innerHTML = message; //The iPad app does not support alert dialogs
		//alert(message); //When debugging on a PC this function can be used.
	}
};
/* Alerts the user that an error has occurred. Should never be called.
 * @param {string} errMessage - The error's message passed by the function that threw the error.
 */
GuiElements.throwError=function(errMessage){
	GuiElements.alert(errMessage); //Show the error in the debug area.
}
/* Once each class has its constants set, the UI can be built. UI-related classes are called. */
GuiElements.buildUI=function(){
	document.body.style.backgroundColor=Colors.lightGray; //Sets the background color of the webpage
	Colors.createGradients(); //Adds gradient definitions to the SVG for each block category
	TouchReceiver(); //Adds touch event handlers to the SVG
	TitleBar(); //Creates the title bar and the buttons contained within it.

	TabManager(); //Creates the tab-switching interface below the title bar
	BlockPalette(); //Creates the sidebar on the left with the categories and blocks
	InputPad(); //Builds the inputpad, which is used for number entry and dropdown selection
	DisplayBox(); //Builds the display box for the display block to show messages in.
	/* Builds the SVG path element for the highlighter, 
	the white ring which shows which slot a Block will connect to. */
	Highlighter();
	DebugOptions.applyActions();
};
/* Makes an SVG group element (<g>) for each layer of the interface.
 * Layers are accessible in the form GuiElements.layers.[layerName]
 */
GuiElements.createLayers=function(){
	var create=GuiElements.create;//shorthand
	GuiElements.zoomGroups = [];
	GuiElements.svgs.forEach(function(svg){
		let zoomGroup = create.group(0,0,svg);
		GuiElements.zoomGroups.push(zoomGroup);
		GuiElements.update.zoom(zoomGroup,GuiElements.zoomFactor);
	});

	GuiElements.layers={};
	let i = 0;
	var layers=GuiElements.layers;
	layers.temp=create.layer(i);
	layers.aTabBg=create.layer(i);
	layers.activeTab=create.layer(i);
	layers.TabsBg=create.layer(i);
	layers.paletteBG=create.layer(i);
	layers.paletteScroll = document.getElementById("paletteScrollDiv");
	i++;
	layers.trash=create.layer(i);
	layers.catBg=create.layer(i);
	layers.categories=create.layer(i);
	layers.titleBg=create.layer(i);
	layers.titlebar=create.layer(i);
	layers.overflowArr = create.layer(i);
	layers.stage=create.layer(i);
	layers.display=create.layer(i);
	layers.drag=create.layer(i);
	layers.highlight=create.layer(i);
	layers.tabMenu=create.layer(i);
	layers.dialogBlock=create.layer(i);
	layers.dialog=create.layer(i);
	layers.overlay=create.layer(i);
	layers.frontScroll = document.getElementById("frontScrollDiv");
	i++;
	layers.overlayOverlay=create.layer(i);
};
/* GuiElements.create contains functions for creating SVG elements.
 * The element is built with minimal attributes and returned.
 * It may also be added to a group if included.
 */
GuiElements.create=function(){};
/* Makes a group, adds it to a parent group (if present), and returns it.
 * @param {number} x - The x offset of the group.
 * @param {number} y - The y offset of the group.
 * @param {SVG g} title - (optional) The parent group to add the group to.
 * @return {SVG g} - The group which was created.
 */
GuiElements.create.group=function(x,y,parent){
	DebugOptions.validateOptionalNums(x, y);
	var group=document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Make the group.
	group.setAttributeNS(null,"transform","translate("+x+","+y+")"); //Move the group to (x,y).
	if(parent!=null){ //If provided, add it to the parent.
		parent.appendChild(group);
	}
	return group; //Return the group.
}
/* Creates a group, adds it to the main SVG, and returns it. */
GuiElements.create.layer=function(depth){
	DebugOptions.validateNumbers(depth);
	return GuiElements.create.group(0,0,GuiElements.zoomGroups[depth]);
};
/* Creates a linear SVG gradient and adds it to the SVG defs.
 * @param {text} id - The id of the gradient (needed to reference it later).
 * @param {string} color1 - color in form "#fff" of the top of the gradient.
 * @param {string} color2 - color in form "#fff" of the bottom of the gradient.
 */
GuiElements.create.gradient=function(id,color1,color2){ //Creates a gradient and adds to the defs
	DebugOptions.validateNonNull(color1, color2);
	var gradient=document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
	gradient.setAttributeNS(null,"id",id); //Set attributes.
	gradient.setAttributeNS(null,"x1","0%");
	gradient.setAttributeNS(null,"x2","0%");
	gradient.setAttributeNS(null,"y1","0%");
	gradient.setAttributeNS(null,"y2","100%");
	GuiElements.defs.appendChild(gradient); //Add it to the SVG's defs
	var stop1=document.createElementNS("http://www.w3.org/2000/svg", 'stop'); //Create stop 1.
	stop1.setAttributeNS(null,"offset","0%");
	stop1.setAttributeNS(null,"style","stop-color:"+color1+";stop-opacity:1");
	gradient.appendChild(stop1);
	var stop2=document.createElementNS("http://www.w3.org/2000/svg", 'stop'); //Create stop 2.
	stop2.setAttributeNS(null,"offset","100%");
	stop2.setAttributeNS(null,"style","stop-color:"+color2+";stop-opacity:1");
	gradient.appendChild(stop2);
}
/* Creates an SVG path element and returns it.
 * @param {SVG g} title - (optional) The parent group to add the group to.
 * @return {SVG path} - The path which was created.
 */
GuiElements.create.path=function(group){
	var path=document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	if(group!=null){ //Add it to the parent group if present.
		group.appendChild(path);
	}
	return path; //Return the path.
}
/* Creates an SVG text element and returns it.
 * @return {SVG text} - The text which was created.
 */
GuiElements.create.text=function(){
	var textElement=document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create text.
	return textElement; //Return the text.
};
GuiElements.create.image=function(){
	var imageElement=document.createElementNS("http://www.w3.org/2000/svg", 'image'); //Create text.
	return imageElement; //Return the text.
};
GuiElements.create.foreignObject = function(group){
	var obj = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
	if(group != null){
		group.appendChild(obj);
	}
	return obj;
};
GuiElements.create.svg = function(group){
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	if(group != null){
		group.appendChild(svg);
	}
	return svg;
};
GuiElements.create.scrollDiv = function(group){
	var div = document.createElement("div");
	div.style.position = "absolute";
	if(group != null){
		group.appendChild(div);
	}
	return div;
};
/* Creates an SVG rect element, adds it to a parent group (if present), and returns it.
 * @param {SVG g} title - (optional) The parent group to add the group to.
 * @return {SVG rect} - The rect which was created.
 */
GuiElements.create.rect=function(group){
	var rect=document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create the rect.
	if(group!=null){ //Add it to the parent group if present.
		group.appendChild(rect);
	}
	return rect; //Return the rect.
}
/* GuiElements.create contains functions that create SVG elements and assign thier attributes
 * so they are ready to be drawn on the screen. The element is then returned. 
 * It may also be added to a group if included.
 */
GuiElements.draw=function(){};
/* Creates a filled SVG rect element at a certain location with specified dimensions and returns it.
 * @param {number} x - The rect's x coord.
 * @param {number} y - The rect's y coord.
 * @param {number} width - The rect's width.
 * @param {number} height - The rect's height.
 * @param {string} color - (optional) The rect's fill color in the form "#fff".
 * @return {SVG rect} - The rect which was created.
 */
GuiElements.draw.rect=function(x,y,width,height,color){
	DebugOptions.validateNumbers(x, y, width, height);
	var rect=document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create the rect.
	rect.setAttributeNS(null,"x",x); //Set its attributes.
	rect.setAttributeNS(null,"y",y);
	rect.setAttributeNS(null,"width",width);
	rect.setAttributeNS(null,"height",height);
	if(color!=null) {
		rect.setAttributeNS(null, "fill", color);
	}
	return rect; //Return the rect.
}
/* Creates a filled, triangular SVG path element with specified dimensions and returns it.
 * @param {number} x - The path's x coord.
 * @param {number} y - The path's y coord.
 * @param {number} width - The path's width. (it is an isosceles triangle)
 * @param {number} height - The path's height. (negative will make it point down)
 * @param {string} color - The path's fill color in the form "#fff".
 * @return {SVG path} - The path which was created.
 */
GuiElements.draw.triangle=function(x,y,width,height,color){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height);
	var triangle=document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.triangle(triangle,x,y,width,height); //Set its path description (points).
	triangle.setAttributeNS(null,"fill",color); //Set the fill.
	return triangle; //Return the finished triangle.
};
GuiElements.draw.triangleFromPoint = function(x, y, width, height, color){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height);
	var triangle=document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.triangleFromPoint(triangle,x,y,width,height); //Set its path description (points).
	triangle.setAttributeNS(null,"fill",color); //Set the fill.
	return triangle; //Return the finished triangle.
};
/* Creates a filled, trapezoid-shaped SVG path element with specified dimensions and returns it.
 * @param {number} x - The path's x coord.
 * @param {number} y - The path's y coord.
 * @param {number} width - The path's width. (it is an isosceles trapezoid)
 * @param {number} height - The path's height. (negative will make it point down)
 * @param {number} slantW - The amount the trapezoid slopes in.
 * @param {string} color - The path's fill color in the form "#fff".
 * @return {SVG path} - The path which was created.
 */
GuiElements.draw.trapezoid=function(x,y,width,height,slantW,color){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height, slantW);
	var trapezoid=document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.trapezoid(trapezoid,x,y,width,height,slantW); //Set its path description.
	trapezoid.setAttributeNS(null,"fill",color); //Set the fill.
	return trapezoid; //Return the finished trapezoid.
}
GuiElements.draw.circle=function(cx,cy,radius,color,group){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(cx, cy, radius);
	var circle=document.createElementNS("http://www.w3.org/2000/svg",'circle');
	circle.setAttributeNS(null,"cx",cx);
	circle.setAttributeNS(null,"cy",cy);
	circle.setAttributeNS(null,"r",radius);
	circle.setAttributeNS(null,"fill",color);
	if(group!=null){
		group.appendChild(circle);
	}
	return circle;
};
GuiElements.draw.image=function(imageName,x,y,width,height,parent){
	DebugOptions.validateNumbers(x, y, width, height);
	var imageElement=GuiElements.create.image();
	imageElement.setAttributeNS(null,"x",x);
	imageElement.setAttributeNS(null,"y",y);
	imageElement.setAttributeNS(null,"width",width);
	imageElement.setAttributeNS(null,"height",height);
	//imageElement.setAttributeNS('http://www.w3.org/2000/xlink','href', "Images/"+imageName+".png");
	imageElement.setAttributeNS( "http://www.w3.org/1999/xlink", "href", "Images/"+imageName+".png" );
	imageElement.setAttributeNS(null, 'visibility', 'visible');
	if(parent!=null) {
		parent.appendChild(imageElement);
	}
	return imageElement;
};
/* Creates a SVG text element with text in it with specified formatting and returns it.
 * @param {number} x - The text element's x coord.
 * @param {number} y - The text element's y coord.
 * @param {string} text - The text contained within the element.
 * @param {number} fontSize - The font size of the text.
 * @param {string} color - The text's color in the form "#fff".
 * @param {string} font - the font family of the text.
 * @param {string} weight - (optional) the weight ("bold","normal",etc.) of the text.
 * @return {SVG text} - The text element which was created.
 */
GuiElements.draw.text=function(x,y,text,fontSize,color,font,weight){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y);
	var textElement=GuiElements.create.text();
	textElement.setAttributeNS(null,"x",x);
	textElement.setAttributeNS(null,"y",y);
	textElement.setAttributeNS(null,"font-family",font);
	textElement.setAttributeNS(null,"font-size",fontSize);
	if(weight!=null){
		textElement.setAttributeNS(null,"font-weight",weight);
	}
	textElement.setAttributeNS(null,"fill",color);
	textElement.setAttributeNS(null,"class","noselect"); //Make sure it can't be selected.
	text+=""; //Make text into a string
	text=text.replace(new RegExp(" ", 'g'), String.fromCharCode(160)); //Replace space with nbsp
	var textNode = document.createTextNode(text);
	textElement.textNode=textNode;
	textElement.appendChild(textNode);
	return textElement;
}
/* GuiElements.update contains functions that modify the attributes of existing SVG elements.
 * They do not return anything.
 */
GuiElements.update=function(){};
/* Changes the fill color (or text color) of any SVG element.
 * @param {SVG element} element - The element to be recolored.
 * @param {string} color - The element's new color in the form "#fff".
 */
GuiElements.update.color=function(element,color){
	DebugOptions.validateNonNull(color);
	element.setAttributeNS(null,"fill",color); //Recolors the element.
}
/* Changes the fill opacity of any SVG element.
 * @param {SVG element} element - The element to be modified.
 * @param {number} color - The element's new opacity (from 0 to 1).
 */
GuiElements.update.opacity=function(element,opacity){
	element.setAttributeNS(null,"fill-opacity",opacity); //Sets the opacity.
}
/* Sets an SVG element's stroke
 * @param {SVG element} element - The element to be modified.
 * @param {string} color - The element's new color in the form "#fff".
 * @param {number} strokeW - The width of the stroke
 */
GuiElements.update.stroke=function(element,color,strokeW){
	DebugOptions.validateNonNull(color);
	element.setAttributeNS(null,"stroke",color);
	element.setAttributeNS(null,"stroke-width",strokeW);
};
/* Changes the text of an SVG text element.
 * @param {SVG text} textE - The text element to be modified.
 * @param {string} newText - The element's new text.
 */
GuiElements.update.text=function(textE,newText){
	newText+=""; //Make newText into a string
	newText=newText.replace(new RegExp(" ", 'g'), String.fromCharCode(160)); //Replace space with nbsp
	if(textE.textNode!=null) {
		textE.textNode.remove(); //Remove old text.
	}
	var textNode = document.createTextNode(newText); //Create new text.
	textE.textNode=textNode; //Adds a reference for easy removal.
	textE.appendChild(textNode); //Adds text to element.
}
/* Changes the text of an SVG text element and removes ending characters until the width is less that a max width.
 * Adds "..." if characters are removed.
 * @param {SVG text} textE - The text element to be modified.
 * @param {string} text - The element's new text.
 * @param {number} maxWidth - When finished, the width of the text element will be less that this number.
 */
GuiElements.update.textLimitWidth=function(textE,text,maxWidth){
	GuiElements.update.text(textE,text);
	var currentWidth=GuiElements.measure.textWidth(textE);
	if(currentWidth<maxWidth||text==""){
		return;
	}
	var chars=1;
	var maxChars=text.length;
	var currentText;
	while(chars<=maxChars){
		currentText=text.substring(0,chars);
		GuiElements.update.text(textE,currentText+"...");
		currentWidth=GuiElements.measure.textWidth(textE);
		if(currentWidth>maxWidth){
			chars--;
			break;
		}
		chars++;
	}
	currentText=text.substring(0,chars);
	GuiElements.update.text(textE,currentText+"...");
};
/* Changes the path description of an SVG path object to make it a triangle.
 * @param {SVG path} pathE - The path element to be modified.
 * @param {number} x - The path's new x coord.
 * @param {number} y - The path's new y coord.
 * @param {number} width - The path's new width. (it is an isosceles triangle)
 * @param {number} height - The path's new height. (negative will make it point down)
 */
GuiElements.update.triangle=function(pathE,x,y,width,height){
	DebugOptions.validateNumbers(x, y, width, height);
	var xshift=width/2;
	var path="";
	path+="m "+x+","+y; //Draws bottom-left point.
	path+=" "+xshift+","+(0-height); //Draws top-middle point.
	path+=" "+xshift+","+(height); //Draws bottom-right point.
	path+=" z"; //Closes path.
	pathE.setAttributeNS(null,"d",path); //Sets path description.
};
GuiElements.update.triangleFromPoint = function(pathE, x, y, width, height, vertical){
	DebugOptions.validateNumbers(x, y, width, height);
	if(vertical == null){
		vertical = 0;
	}

	var xshift=width/2;
	var path="";
	path+="m "+x+","+y; //Draws top-middle point.
	if(vertical) {
		path += " " + xshift + "," + (height);
		path += " " + (0 - width) + ",0";
	} else{
		path += " " + (height) + "," + xshift;
		path += " 0," + (0 - width);
	}
	path+=" z"; //Closes path.
	pathE.setAttributeNS(null,"d",path); //Sets path description.
};
/* Changes the path description of an SVG path object to make it a trapezoid.
 * @param {SVG path} pathE - The path element to be modified.
 * @param {number} x - The path's new x coord.
 * @param {number} y - The path's new y coord.
 * @param {number} width - The path's new width. (it is an isosceles trapezoid)
 * @param {number} height - The path's new height. (negative will make it point down)
 * @param {number} slantW - The amount the trapezoid slopes in.
 */
GuiElements.update.trapezoid=function(pathE,x,y,width,height,slantW){
	DebugOptions.validateNumbers(x, y, width, height, slantW);
	var shortW=width-2*slantW; //The width of the top of the trapezoid.
	var path="";
	path+="m "+x+","+(y+height); //Draws the points.
	path+=" "+slantW+","+(0-height);
	path+=" "+shortW+","+0;
	path+=" "+slantW+","+height;
	path+=" z";
	pathE.setAttributeNS(null,"d",path); //Sets path description.
}
/* Moves and resizes an SVG rect element.
 * @param {SVG rect} rect - The rect element to be modified.
 * @param {number} x - The rect's new x coord.
 * @param {number} y - The rect's new y coord.
 * @param {number} width - The rect's new width.
 * @param {number} height - The rect's new height.
 */
GuiElements.update.rect=function(rect,x,y,width,height){
	DebugOptions.validateNumbers(x, y, width, height);
	rect.setAttributeNS(null,"x",x);
	rect.setAttributeNS(null,"y",y);
	rect.setAttributeNS(null,"width",width);
	rect.setAttributeNS(null,"height",height);
}
/* Used for zooming the main zoomGroup which holds the ui */
GuiElements.update.zoom=function(group,scale){
	DebugOptions.validateNumbers(scale);
	group.setAttributeNS(null,"transform","scale("+scale+")");
};
GuiElements.update.image=function(imageE,newImageName){
	//imageE.setAttributeNS('http://www.w3.org/2000/xlink','href', "Images/"+newImageName+".png");
	imageE.setAttributeNS( "http://www.w3.org/1999/xlink", "href", "Images/"+newImageName+".png" );
};
GuiElements.update.smoothScrollSet=function(div, svg, zoomG, x, y, width, height, innerWidth, innerHeight) {
	DebugOptions.validateNonNull(div, svg, zoomG);
	DebugOptions.validateNumbers(x, y, width, height, innerWidth, innerHeight);
	/*foreignObj.setAttributeNS(null,"x",x);
	foreignObj.setAttributeNS(null,"y",y);
	foreignObj.setAttributeNS(null,"width",width * zoom);
	foreignObj.setAttributeNS(null,"height",height * zoom);*/

	var scrollY = innerHeight > height;
	var scrollX = innerWidth > width;
	div.classList.remove("noScroll");
	div.classList.remove("smoothScrollXY");
	div.classList.remove("smoothScrollX");
	div.classList.remove("smoothScrollY");
	if(scrollX && scrollY) {
		div.classList.add("smoothScrollXY");
	} else if(scrollX) {
		div.classList.add("smoothScrollX");
	} else if(scrollY) {
		div.classList.add("smoothScrollY");
	} else {
		div.classList.add("noScroll");
	}

	var zoom = GuiElements.zoomFactor;

	div.style.top = y + "px";
	div.style.left = x + "px";
	div.style.width = (width * zoom) + "px";
	div.style.height = (height * zoom) + "px";

	svg.setAttribute('width', innerWidth * zoom);
	svg.setAttribute('height', innerHeight * zoom);

	GuiElements.update.zoom(zoomG, zoom);
};

GuiElements.makeClickThrough = function(svgE){
	svgE.style.pointerEvents = "none";
};
/* GuiElements.move contains functions that move existing SVG elements.
 * They do not return anything.
 */
GuiElements.move=function(){};
/* Moves a group by changing its transform value.
 * @param {SVG g} group - The group to move.
 * @param {number} x - The new x offset of the group.
 * @param {number} y - The new y offset of the group.
 * @param {number} zoom - (Optional) The amount the group should be scaled.
 */
GuiElements.move.group=function(group,x,y,zoom){
	DebugOptions.validateNumbers(x,y);
	if(zoom == null) {
		group.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
	}
	else{
		group.setAttributeNS(null, "transform", "matrix(" + zoom + ",0,0," + zoom + "," + x + "," + y + ")");
	}
};
/* Moves an SVG text element.
 * @param {SVG text} text - The text to move.
 * @param {number} x - The new x coord of the text.
 * @param {number} y - The new y coord of the text.
 */
GuiElements.move.text=function(text,x,y){
	DebugOptions.validateNumbers(x,y);
	text.setAttributeNS(null,"x",x);
	text.setAttributeNS(null,"y",y);
};
/* Moves an SVG element.
 * @param {SVG element} element - The element to move.
 * @param {number} x - The new x coord of the element.
 * @param {number} y - The new y coord of the element.
 */
GuiElements.move.element=function(element,x,y){
	DebugOptions.validateNumbers(x,y);
	element.setAttributeNS(null,"x",x);
	element.setAttributeNS(null,"y",y);
};
/* Creates a clipping path (crops item) of the specified size and adds to the element if provided.
 * @param {string} id - The id to use for the clipping path.
 * @param {number} x - The x coord of the clipping path.
 * @param {number} y - The y coord of the clipping path.
 * @param {number} width - The width of the clipping path.
 * @param {number} height - The height of the clipping path.
 * @param {SVG element} element - (optional) The element the path should be added to.
 * @return {SVG clipPath} - The finished clipping path.
 */
GuiElements.clip=function(x,y,width,height,element){
	DebugOptions.validateNumbers(x,y,width,height);
	var id=Math.random()+"";
	var clipPath=document.createElementNS("http://www.w3.org/2000/svg", 'clipPath'); //Create the rect.
	var clipRect=GuiElements.draw.rect(x,y,width,height);
	clipPath.appendChild(clipRect);
	clipPath.setAttributeNS(null,"id",id);
	GuiElements.defs.appendChild(clipPath);
	if(element!=null){
		element.setAttributeNS(null,"clip-path","url(#"+id+")");
	}
	return clipPath;
};
/* GuiElements.measure contains functions that measure parts of the UI.
 * They return the measurement.
 */
GuiElements.measure=function(){};
/* Measures the width of an existing SVG text element.
 * @param {SVG text} textE - The text element to measure.
 * @return {number} - The width of the text element.
 */
GuiElements.measure.textWidth=function(textE){ //Measures an existing text SVG element
	return GuiElements.measure.textDim(textE,false);
};
GuiElements.measure.textHeight=function(textE){ //Measures an existing text SVG element
	return GuiElements.measure.textDim(textE,true);
};
/* Measures the width/height of an existing SVG text element.
 * @param {SVG text} textE - The text element to measure.
 * @param {bool} height - true/false for width/height, respectively.
 * @return {number} - The width/height of the text element.
 */
GuiElements.measure.textDim=function(textE, height){ //Measures an existing text SVG element
	if(textE.textContent==""){ //If it has no text, the width is 0.
		return 0;
	}
	//Gets the bounding box, but that is 0 if it isn't visible on the screen.
	var bbox=textE.getBBox();
	var textD=bbox.width; //Gets the width of the bounding box.
	if(height){
		textD=bbox.height; //Gets the height of the bounding box.
	}
	if(textD==0){ //The text element probably is not visible on the screen.
		var parent=textE.parentNode; //Store the text element's current (hidden) parent.
		GuiElements.layers.temp.appendChild(textE); //Change its parent to one we know is visible.
		bbox=textE.getBBox(); //Now get its bounding box.
		textD=bbox.width;
		if(height){
			textD=bbox.height;
		}
		textE.remove(); //Remove it from the temp layer.
		if(parent!=null){
			parent.appendChild(textE); //Add it back to its old parent.
		}
	}
	return textD; //Return the width/height.
};


/* Measures the width of a string if it were used to create a text element with certain formatting.
 * @param {string} text - The string to measure.
 * @param {string} font - The font family of the text element.
 * @param {string} font - The font size of the text element.
 * @param {string} weight - (optional) the weight ("bold","normal",etc.) of the text element.
 * @return {number} - The width of the text element made using the string.
 */
GuiElements.measure.stringWidth=function(text,font,size,weight){
	var textElement=GuiElements.create.text(); //Make the text element.
	textElement.setAttributeNS(null,"font-family",font); //Set the attributes.
	textElement.setAttributeNS(null,"font-size",size);
	if(weight!=null){ //Set weight if specified.
		textElement.setAttributeNS(null,"font-weight",weight);
	}
	textElement.setAttributeNS(null,"class","noselect"); //Make sure it can't be selected.
	var textNode = document.createTextNode(text); //Add the text to the text element.
	textElement.textNode=textNode;
	textElement.appendChild(textNode);
	return GuiElements.measure.textWidth(textElement); //Measure it.
};
GuiElements.measure.position = function(element) {
	var top = 0, left = 0;
	do {
		top += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);

	return {
		top: top,
		left: left
	};
	/* https://stackoverflow.com/questions/1480133/how-can-i-get-an-objects-absolute-position-on-the-page-in-javascript */
};
/* Displays the result of a reporter or predicate Block in a speech bubble next to that block.
 * @param {string} value - The value to display
 * @fix This function has not been created yet.
 */
GuiElements.displayValue=function(value,x,y,width,height, error){
	if(error == null){
		error = false;
	}
	var leftX = x;
	var rightX = x + width;
	var upperY=y;
	var lowerY=y+height;
	new ResultBubble(leftX, rightX,upperY,lowerY,value, error);
};
/* GuiElements.overlay contains functions that keep track of overlays present on the screen.
 */
GuiElements.overlay=function(){};
/* Sets the currently visible overlay and closes any existing overlays.
 * @param the overlay which will be visible.
 */
GuiElements.overlay.set=function(overlay){
	var GE=GuiElements;
	if(GE.currentOverlay!=null){
		GE.currentOverlay.close();
	}
	GE.currentOverlay=overlay;
};
/* Called by a closing overlay to indicate that it is no longer visible.
 * @param the overlay which is no longer visible.
 */
GuiElements.overlay.remove=function(overlay){
	var GE=GuiElements;
	if(GE.currentOverlay==overlay){
		GE.currentOverlay=null;
	}
};
/* Called to force any currently visible overlays to close.
 */
GuiElements.overlay.close=function(){
	var GE=GuiElements;
	if(GE.currentOverlay!=null){
		GE.currentOverlay.close();
	}
};
/* Loads the version number from version.js */
GuiElements.getAppVersion=function(callback){
	GuiElements.appVersion = FrontendVersion;
	callback();
};
GuiElements.getOsVersion=function(callback){
	HtmlServer.sendRequestWithCallback("properties/os", function(resp){
		GuiElements.osVersion = resp;
		var parts = resp.split(" ");
		GuiElements.isKindle = (parts.length >= 1 && parts[0] == "Kindle");
		GuiElements.isIos = (parts.length >= 1 && parts[0] == "iOS");
		callback();
	}, function(){
		GuiElements.osVersion="";
		GuiElements.isKindle = false;
		callback();
	});
};
/* Creates a black rectangle to block interaction with the main screen.  Used for dialogs. */
GuiElements.blockInteraction=function(){
	if(GuiElements.dialogBlock==null) {
		var rect = GuiElements.draw.rect(0, 0, GuiElements.width, GuiElements.height);
		GuiElements.update.opacity(rect,GuiElements.blockerOpacity);
		GuiElements.layers.dialogBlock.appendChild(rect);
		TouchReceiver.touchInterrupt();
		GuiElements.dialogBlock=rect;
	}
};
GuiElements.unblockInteraction=function() {
	if(GuiElements.dialogBlock!=null) {
		GuiElements.dialogBlock.remove();
		GuiElements.dialogBlock=null;
	}
};
GuiElements.updateDialogBlockZoom = function(){
	if(GuiElements.dialogBlock!=null) {
		GuiElements.update.rect(GuiElements.dialogBlock, 0, 0, GuiElements.width, GuiElements.height);
	}
};
/* Tells UI parts that zoom has changed. */
GuiElements.updateZoom=function(){
	GuiElements.zoomFactor = GuiElements.zoomMultiple * GuiElements.computedZoom;
	GuiElements.zoomGroups.forEach(function(zoomGroup){
		GuiElements.update.zoom(zoomGroup,GuiElements.zoomFactor);
	});
	HtmlServer.setSetting("zoom",GuiElements.zoomMultiple);
	GuiElements.updateDims();
};
GuiElements.updateDimsPreview = function(newWidth, newHeight){
	GuiElements.width=newWidth/GuiElements.zoomFactor;
	GuiElements.height=newHeight/GuiElements.zoomFactor;
	TabManager.updateZoom();
	DisplayBox.updateZoom();
	TitleBar.updateZoom();
	BlockPalette.updateZoom();
	GuiElements.updateDialogBlockZoom();
	RowDialog.updateZoom();
};
GuiElements.updateDims = function(){
	GuiElements.width=window.innerWidth/GuiElements.zoomFactor;
	GuiElements.height=window.innerHeight/GuiElements.zoomFactor;
	TabManager.updateZoom();
	DisplayBox.updateZoom();
	TitleBar.updateZoom();
	BlockPalette.updateZoom();
	GuiElements.updateDialogBlockZoom();
	RowDialog.updateZoom();
};
GuiElements.configureZoom = function(callback){
	var GE = GuiElements;
	HtmlServer.sendRequestWithCallback("properties/dims",function(response){
		GE.computedZoom = GE.computeZoomFromDims(response);
		//GuiElements.alert("Requesting zoom from settings.");
		HtmlServer.getSetting("zoom",function(result){
			GE.alert("Dealing with zoom from settings");
			GE.zoomMultiple = parseFloat(result);
			GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			if(GE.zoomFactor < GuiElements.minZoom || GE.zoomFactor > GuiElements.maxZoom || isNaN(GE.zoomFactor)){
				//GuiElements.alert("Zoom from settings was invalid: " + GE.zoomFactor);
				GE.zoomMultiple = 1;
				GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			}
			if(GE.zoomFactor < GuiElements.minZoom || GE.zoomFactor > GuiElements.maxZoom || isNaN(GE.zoomFactor)){
				//GuiElements.alert("Zoom from settings was invalid 2: " + GE.zoomFactor);
				GE.zoomMultiple = 1;
				GE.computedZoom = GE.defaultZoomMultiple;
				GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			}
			//GuiElements.alert("Computed zoom: " + GE.computedZoom);
			callback();
		},function(){
			GE.alert("Error reading zoom from settings");
			GE.zoomMultiple = 1;
			GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			callback();
		}, "1");
	},function(){
		GE.alert("Error reading dims");
		callback();
	}, null, null, "200,200");
};
/* Takes a response from the properties/dims request and computes and sets the appropriate zoom level
 * @param {string} dims - The response from properties/dims
 */
GuiElements.computeZoomFromDims=function(dims){
	//GuiElements.alert("Got dimensions from device.  Computing zoom.");
	//GuiElements.alert("received dims: " + dims);
	var parts = dims.split(",");
	if(parts.length==2) {
		var widthMm = parseFloat(parts[0]);
		var heightMm = parseFloat(parts[1]);
		var diagMm = Math.sqrt(widthMm * widthMm + heightMm * heightMm);
		var widthPx = window.innerWidth;
		var heightPx = window.innerHeight;
		var diagPx = Math.sqrt(widthPx * widthPx + heightPx * heightPx);
		var zoom = (diagPx * GuiElements.defaultZoomMm) / (GuiElements.defaultZoomPx * diagMm);
		//GuiElements.alert("Computed zoom to: " + zoom + " diagPx:" + diagPx + " diagMm:" + diagMm);
		return zoom * GuiElements.defaultZoomMultiple;
	}
	else{
		return 1;
	}
};
GuiElements.relToAbsX = function(x){
	return x * GuiElements.zoomFactor;
};
GuiElements.relToAbsY = function(y){
	return y * GuiElements.zoomFactor;
};



/* BlockList is a static class that holds a list of blocks and categories.
 * It is in charge of populating the BlockPalette by helping to create Category objects.
 */
/* Populates the list of category names. Run by GuiElements. */
function BlockList(){
	BlockList.categories=new Array();
	//List only includes categories that will appear in the BlockPalette. "Lists" category is excluded.
	var cat=BlockList.categories;
	// Catetory names should be capitalized in the way they should be displayed on screen.
	cat.push("Robots");
	cat.push("Operators");
	cat.push("Sound");
	cat.push("Tablet");
	//cat.push("Motion");
	//cat.push("Looks");
	//cat.push("Pen");

	cat.push("Control");
	//cat.push("Sensing");

	cat.push("Variables");
}
/* Returns the id for a category given its index in the category list. Ids are lowercase.
 * @param {number} index - The category's index in the category name list.
 * @return {string} - The category's id (its name in lowercase).
 */
BlockList.getCatId=function(index){
	return BlockList.categories[index].toLowerCase();
};
/* Returns the category's name given its index in the category list.
 * @param {number} index - The category's index in the category name list.
 * @return {string} - The category's name.
 */
BlockList.getCatName=function(index){
	return BlockList.categories[index];
};
/* Returns the length of the category list.
 * @return {number} - The length of the category list.
 */
BlockList.catCount=function(){
	return BlockList.categories.length;
};

/* The following functions populate a Category for the BlockPalette.
 * @param {Category} category - the Category object to populate.
 * Each function has the same structure.
 * Blocks are added with category.addBlockByName(blockNameAsString) and spaces between groups with category.addSpace().
 * category.trimBottom() is used to remove any extra space at the bottom of the category.
 */
BlockList.populateCat_robots = function(category) {
	let anyConnected = false;
	Device.getTypeList().forEach(function(deviceClass){
		if(deviceClass.getManager().getDeviceCount() > 0) {
			anyConnected = true;
			category.addLabel(deviceClass.getDeviceTypeName());
			category.addSpace();
			BlockList["populateCat_" + deviceClass.getDeviceTypeId()](category);
			category.addSpace();
		}
	});
	if(!anyConnected) {
		category.addLabel("Connect a robot first...");
		category.addSpace();
	}
	category.trimBottom();
	category.finalize();
};
BlockList.populateCat_hummingbird=function(category){
	category.addBlockByName("B_HBServo");
	category.addBlockByName("B_HBMotor");
	category.addBlockByName("B_HBVibration");
	category.addSpace();
	category.addBlockByName("B_HBLed");
	category.addBlockByName("B_HBTriLed");
	category.addSpace();
	category.addBlockByName("B_HBLight");
	category.addBlockByName("B_HBTempC");
	category.addBlockByName("B_HBTempF");
	category.addBlockByName("B_HBDistCM");
	category.addBlockByName("B_HBDistInch");
	category.addBlockByName("B_HBKnob");
	category.addBlockByName("B_HBSound");
	category.trimBottom();
	category.finalize();

};
BlockList.populateCat_flutter=function(category){
	category.addBlockByName("B_FlutterServo");
	category.addBlockByName("B_FlutterTriLed");
	category.addBlockByName("B_FlutterBuzzer");
	category.addSpace();
	category.addBlockByName("B_FlutterLight");
	category.addBlockByName("B_FlutterTempC");
	category.addBlockByName("B_FlutterTempF");
	category.addBlockByName("B_FlutterDistCM");
	category.addBlockByName("B_FlutterDistInch");
	category.addBlockByName("B_FlutterKnob");
	category.addBlockByName("B_FlutterSound");
	category.addBlockByName("B_FlutterSoil");
	category.trimBottom();
	category.finalize();

};
BlockList.populateCat_motion=function(category){
	category.addBlockByName("B_Move");
	category.addBlockByName("B_TurnRight");
	category.addBlockByName("B_TurnLeft");
	category.addSpace();
	category.addBlockByName("B_PointInDirection");
	category.addBlockByName("B_PointTowards");
	category.addSpace();
	category.addBlockByName("B_GoToXY");
	category.addBlockByName("B_GoTo");
	category.addBlockByName("B_GlideToXY");
	category.addSpace();
	category.addBlockByName("B_ChangeXBy");
	category.addBlockByName("B_SetXTo");
	category.addBlockByName("B_ChangeYBy");
	category.addBlockByName("B_SetYTo");
	category.addSpace();
	category.addBlockByName("B_IfOnEdgeBounce");
	category.addSpace();
	category.addBlockByName("B_XPosition");
	category.addBlockByName("B_YPosition");
	category.addBlockByName("B_Direction");
	category.trimBottom();
	category.finalize();

}
BlockList.populateCat_looks=function(category){
	category.addBlockByName("B_alert");
	category.addBlockByName("B_SetTitleBarColor");
	category.addSpace();
	category.addBlockByName("B_SayForSecs");
	category.addBlockByName("B_Say");
	category.addBlockByName("B_ThinkForSecs");
	category.addBlockByName("B_Think");
	category.addSpace();
	category.addBlockByName("B_ChangeSizeBy");
	category.addBlockByName("B_SetSizeTo");
	category.addBlockByName("B_Size");
	category.addSpace();
	category.addBlockByName("B_Show");
	category.addBlockByName("B_Hide");
	category.addSpace();
	category.addBlockByName("B_GoToFront");
	category.addBlockByName("B_GoBackLayers");
	category.trimBottom();
	category.finalize();

}
BlockList.populateCat_sound=function(category){
	category.addButton("Record sounds",RecordingDialog.showDialog);
	category.addSpace();
	category.addBlockByName("B_PlaySound");
	category.addBlockByName("B_PlaySoundUntilDone");
	category.addBlockByName("B_StopAllSounds");
	category.addSpace();
	category.addBlockByName("B_RestForBeats");
	category.addBlockByName("B_PlayNoteForBeats");
	category.addSpace();
	category.addBlockByName("B_ChangeTempoBy");
	category.addBlockByName("B_SetTempoTo");
	category.addBlockByName("B_Tempo");
	category.trimBottom();
	category.finalize();

};
BlockList.populateCat_pen=function(category){
	
}
BlockList.populateCat_tablet=function(category){
	category.addBlockByName("B_DeviceShaken");
	category.addBlockByName("B_DeviceLocation");
	category.addBlockByName("B_DeviceSSID");
	category.addBlockByName("B_DevicePressure");
	category.addBlockByName("B_DeviceRelativeAltitude");
	category.addBlockByName("B_DeviceAcceleration");
	category.addBlockByName("B_DeviceOrientation");
	category.addSpace();
	category.addBlockByName("B_Display");
	category.addSpace();
	category.addBlockByName("B_Ask");
	category.addBlockByName("B_Answer");
	category.addSpace();
	category.addBlockByName("B_ResetTimer");
	category.addBlockByName("B_Timer");
	category.addSpace();
	category.addBlockByName("B_CurrentTime");
	category.trimBottom();
	category.finalize();

};
BlockList.populateCat_control=function(category){
	category.addBlockByName("B_WhenFlagTapped");
	//category.addBlockByName("B_WhenIAmTapped");
	category.addBlockByName("B_WhenIReceive");
	category.addSpace();
	category.addBlockByName("B_Broadcast");
	category.addBlockByName("B_BroadcastAndWait");
	category.addBlockByName("B_Message");
	category.addSpace();
	category.addBlockByName("B_Wait");
	category.addBlockByName("B_WaitUntil");
	category.addSpace();
	category.addBlockByName("B_Forever");
	category.addBlockByName("B_Repeat");
	category.addBlockByName("B_RepeatUntil");
	category.addSpace();
	category.addBlockByName("B_If");
	category.addBlockByName("B_IfElse");
	category.addSpace();
	category.addBlockByName("B_Stop");
	category.trimBottom();
	category.finalize();

}
BlockList.populateCat_sensing=function(category){

}
BlockList.populateCat_operators=function(category){
	category.addBlockByName("B_Add");
	category.addBlockByName("B_Subtract");
	category.addBlockByName("B_Multiply");
	category.addBlockByName("B_Divide");
	category.addSpace();
	category.addBlockByName("B_Mod");
	category.addBlockByName("B_Round");
	category.addBlockByName("B_mathOfNumber");
	category.addBlockByName("B_PickRandom");
	category.addSpace();
	category.addBlockByName("B_LessThan");
	category.addBlockByName("B_EqualTo");
	category.addBlockByName("B_GreaterThan");
	category.addSpace();
	category.addBlockByName("B_And");
	category.addBlockByName("B_Or");
	category.addBlockByName("B_Not");
	category.addSpace();
	category.addBlockByName("B_True");
	category.addBlockByName("B_False");
	category.addSpace();
	category.addBlockByName("B_LetterOf");
	category.addBlockByName("B_LengthOf");
	category.addBlockByName("B_join");
	category.addBlockByName("B_Split");
	category.addSpace();
	category.addBlockByName("B_IsAType");
	category.trimBottom();
	category.finalize();


}
// @fix Write Documentation.
BlockList.populateCat_variables=function(category){
	var callbackFn=function(){
		CodeManager.newVariable();
	};
	category.addButton("Create variable",callbackFn);
	category.addSpace();
	var variables=CodeManager.variableList;
	if(variables.length>0){
		for(var i=0;i<variables.length;i++){
			category.addVariableBlock(variables[i]);
		}
		category.addSpace();
		category.addBlockByName("B_SetTo");
		category.addBlockByName("B_ChangeBy");
	}
	callbackFn=function(){
		CodeManager.newList();
	};
	category.addSpace();
	category.addButton("Create list",callbackFn);
	category.addSpace();
	var lists=CodeManager.listList;
	if(lists.length>0){
		for(var i=0;i<lists.length;i++){
			category.addListBlock(lists[i]);
		}
		category.addSpace();
		category.addBlockByName("B_AddToList");
		category.addBlockByName("B_DeleteItemOfList");
		category.addBlockByName("B_InsertItemAtOfList");
		category.addBlockByName("B_ReplaceItemOfListWith");
		category.addBlockByName("B_CopyListToList");
	}
	category.addBlockByName("B_ItemOfList");
	category.addBlockByName("B_LengthOfList");
	category.addBlockByName("B_ListContainsItem");
	category.trimBottom();
	category.finalize();

};

//Static.  Holds constant values for colors used throughout the UI (lightGray, darkGray, black, white)

function Colors(){
	Colors.setCommon();
	Colors.setCategory();
	Colors.setMultipliers();
}
Colors.setCommon=function(){
	Colors.white="#fff";
	Colors.lightGray="#3d3d3d";
	Colors.darkGray="#262626";
	Colors.black="#000";
};
Colors.setCategory=function(){
	Colors.categoryColors = {
		"robots": "#FF9600",
		"hummingbird": "#FF9600",
		"flutter": "#FF9600",
		"motion": "#0000FF",
		"looks": "#8800FF",
		"sound": "#EE00FF", //FF0088
		"pen": "#00CC99",
		"tablet": "#019EFF", //7F7F7F
		"control": "#FFCC00",
		"sensing": "#019EFF",
		"operators": "#44FF00",
		"variables": "#FF5B00",
		"lists": "#FF0000",
	};
};
Colors.setMultipliers=function(){
	Colors.gradStart=1;
	Colors.gradEnd=0.5;
	Colors.gradDarkStart=0.25;
	Colors.gradDarkEnd=0.5;
};
Colors.createGradients=function(){
	Colors.createGradientSet("gradient_",Colors.gradStart,Colors.gradEnd);
	Colors.createGradientSet("gradient_dark_",Colors.gradDarkStart,Colors.gradDarkEnd);
};
Colors.createGradientSet=function(name,multStart,multEnd){
	Object.keys(Colors.categoryColors).map(function(category) {
		let color = Colors.categoryColors[category];
		Colors.createGradientFromColorAndMults(name,category,color,multStart,multEnd);
	});
};
Colors.createGradientFromColorAndMults=function(name,catId,color,multStart,multEnd){
	var darken=Colors.darkenColor;
	var color1=darken(color,multStart);
	var color2=darken(color,multEnd);
	GuiElements.create.gradient(name+catId,color1,color2);
};
Colors.darkenColor=function(color,amt){
	// Source:
	// stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
	var col = parseInt(color.slice(1),16);
    var result = (((col & 0x0000FF) * amt) | ((((col>> 8) & 0x00FF) * amt) << 8) | (((col >> 16) * amt) << 16)).toString(16);
	while(result.length<6){
		result="0"+result;
	}
	return "#"+result;
};
Colors.getColor=function(category){
	return Colors.categoryColors[category];
};
Colors.getGradient=function(category){
	return "url(#gradient_"+category+")";
};
function VectorPaths(){
	var VP=VectorPaths;
	VP.backspace=function(){};
	VP.backspace.path="m 13.7,2.96 -1.9326,1.91387 3.4149,3.37741 -3.4149,3.39614 1.9326,1.9139 3.415,-3.3962 3.4149,3.3962 1.9139,-1.9139 -3.3962,-3.39614 3.3962,-3.37741 -1.9139,-1.91387 -3.4149,3.39618 -3.415,-3.39618 z m -8.1433,-2.83328 23.1165,0 0,16.2679 -23.1165,0 -5.4976,-8.14334 5.4976,-8.12456 z";
	VP.backspace.width=28.614;
	VP.backspace.height=16.2679;
	VP.checkmark=function(){};
	VP.checkmark.path="M 4.5064398,0.02118182 5.6767307,0.81550087 2.3670683,5.6290633 0.02647727,4.0457402 0.82608984,2.8860327 1.9963864,3.6803471 Z";
	VP.checkmark.width=6;
	VP.checkmark.height=6;
	VP.flag=function(){};
	VP.flag.path="m 0,0 11.2202,0 0,5.69439 c 0,3.1469 7.23037,5.69439 16.16532,5.69439 8.91622,0 16.14659,-2.54749 16.14659,-5.69439 0,-3.12817 7.24911,-5.69439 16.16533,-5.69439 8.93494,0 16.16532,2.56622 16.16532,5.69439 l 0,45.53639 c 0,-3.1469 -7.23038,-5.69439 -16.16532,-5.69439 -8.91622,0 -16.16533,2.54749 -16.16533,5.69439 0,3.1469 -7.23037,5.69439 -16.14659,5.69439 -8.93495,0 -16.16532,-2.54749 -16.16532,-5.69439 l 0,53.04774 -11.2202,0 z";
	VP.flag.width=75.863;
	VP.flag.height=104.279;
	VP.stage=function(){};
	VP.stage.path="m 80.789,36.957 12.02565,0 0,14.16105 0,0 0,8.82256 -28.99643,0 z m -80.78916,0 11.96946,0 16.97078,22.98361 -28.94024,0 z m 92.81481,-30.08286 0,27.79761 -12.13804,0 -16.0342,-21.69113 3.42787,-0.33716 c 9.96518,-1.18009 18.45057,-3.1469 24.44467,-5.61947 z m -92.81481,-0.0187 0.37463,0.16858 c 5.9941,2.47257 14.47949,4.43938 24.44467,5.61947 l 3.29675,0.33716 -16.0342,21.69113 -12.08185,0 z m 0,-6.85575 92.88974,0 0,4.28953 -1.49853,0.76799 c -5.60073,2.54749 -14.3109,4.5705 -24.78183,5.71312 l -3.35295,0.33717 -1.40486,0.13112 -6.66843,0.39336 -1.70458,0.0749 -7.02432,0.13112 -7.04307,-0.13112 -1.70457,-0.0749 -6.66843,-0.39336 -1.53598,-0.14985 -3.22183,-0.31844 c -10.47093,-1.14262 -19.16237,-3.16563 -24.78183,-5.71312 l -1.49853,-0.76799 z";
	VP.stage.width=92.890;
	VP.stage.height=59.941;
	VP.stop=function(){};
	VP.stop.path="m 0,19.957 20.23007,-20.26754 28.65926,0 20.26753,20.26754 0,28.6218 -20.26753,20.26753 -28.65926,0 -20.23007,-20.26753 z";
	VP.stop.width=69.157;
	VP.stop.height=69.157;
	VP.file=function(){};
	VP.file.path="m 407.092,0 -370.3896,0 c -17.03792,0 -30.865797,13.82788 -30.865797,30.8658 l 0,432.1212 c 0,17.05335 13.827877,30.8658 30.865797,30.8658 l 277.7922,0 123.4632,-123.4632 0,-339.5238 c 0,-17.03792 -13.81245,-30.8658 -30.8658,-30.8658 z m -92.5974,450.20856 0,-79.81896 79.81896,0 -79.81896,79.81896 z m 92.5974,-110.68476 -92.5974,0 c -17.03792,0 -30.8658,13.82788 -30.8658,30.8658 l 0,92.5974 -246.9264,0 0,-432.1212 370.3896,0 0,308.658 z m -339.5238,-231.4935 c 0,-8.53439 6.89851,-15.4329 15.4329,-15.4329 l 277.7922,0 c 8.53439,0 15.4329,6.89851 15.4329,15.4329 0,8.56526 -6.89851,15.4329 -15.4329,15.4329 l -277.7922,0 c -8.53439,0 -15.4329,-6.89851 -15.4329,-15.4329 z m 0,92.5974 c 0,-8.53439 6.89851,-15.4329 15.4329,-15.4329 l 277.7922,0 c 8.53439,0 15.4329,6.89851 15.4329,15.4329 0,8.56526 -6.89851,15.4329 -15.4329,15.4329 l -277.7922,0 c -8.53439,0 -15.4329,-6.89851 -15.4329,-15.4329 z m 0,92.5974 c 0,-8.53439 6.89851,-15.4329 15.4329,-15.4329 l 277.7922,0 c 8.53439,0 15.4329,6.89851 15.4329,15.4329 0,8.56526 -6.89851,15.4329 -15.4329,15.4329 l -277.7922,0 c -8.53439,0 -15.4329,-6.89851 -15.4329,-15.4329 z";
	VP.file.width=432.121;
	VP.file.height=493.853;
	VP.dropbox=function(){};
	VP.dropbox.path="m 30.561,0 -30.6875,20.03125 21.21875,17 30.9375,-19.09375 -21.46875,-17.9375 z m 21.46875,17.9375 30.96875,19.09375 21.21875,-17 -30.6875,-20.03125 -21.5,17.9375 z m 30.96875,19.09375 -30.96875,19.09375 21.5,17.9375 30.6875,-20.03125 -21.21875,-17 z m -30.96875,19.09375 -30.9375,-19.09375 -21.21875,17 30.6875,20.03125 21.46875,-17.9375 z m 0.0625,3.875 -21.53125,17.875 -9.21875,-6.03125 0,6.75 30.75,18.4375 30.78125,-18.4375 0,-6.75 -9.21875,6.03125 -21.5625,-17.875 z";
	VP.dropbox.width=104.344;
	VP.dropbox.height=97.031;
	VP.undo=function(){};
	VP.undo.path="m 14.148,0 -14.148438,12.3535156 14.148438,13.035156 0,-8.335937 c 14.946332,-0.350494 14.262139,12.84971 9.652344,17.05664 11.806998,-6.123566 8.245989,-26.417489 -9.652344,-25.951171 l 0,-8.1582036 z";
	VP.undo.width=30.664;
	VP.undo.height=34.109;
	VP.edit=function(){};
	VP.edit.path="m 7.198,53.472 23.6129125,18.573045 -30.810495,14.855331 7.1975825,-33.428376 z m 33.2908765,-42.291734 23.612969,18.573214 -29.134082,37.019089 -23.618303,-18.573044 29.139416,-37.019259 z m 8.794609,-11.179794 23.612969,18.573085 -4.64312,5.901916 -23.612969,-18.5730725 4.64312,-5.9019285 z";
	VP.edit.width=72.896;
	VP.edit.height=86.900;
	VP.view=function(){};
	VP.view.path="M 191.74609 0 C 85.854776 0 -1.5158245e-013 85.854776 0 191.74609 C 0 297.63742 85.854776 383.49023 191.74609 383.49023 C 297.63742 383.49023 383.49023 297.63742 383.49023 191.74609 C 383.49023 85.854776 297.63742 9.4739031e-014 191.74609 0 z M 191.74609 47.935547 C 271.04874 47.935547 335.55469 112.44344 335.55469 191.74609 C 335.55469 271.06472 271.04874 335.55469 191.74609 335.55469 C 112.42746 335.55469 47.9375 271.06472 47.9375 191.74609 C 47.9375 112.44344 112.42746 47.935547 191.74609 47.935547 z M 644.55859 62.539062 L 644.55859 150.69922 L 556.39844 150.69922 L 556.39844 177.60547 L 644.55859 177.60547 L 644.55859 265.76562 L 671.14844 265.76562 L 671.14844 177.60547 L 759.30859 177.60547 L 759.30859 150.69922 L 671.14844 150.69922 L 671.14844 62.539062 L 644.55859 62.539062 z M 191.74609 79.894531 C 130.06802 79.894531 79.894531 130.09998 79.894531 191.74609 L 111.85156 191.74609 C 111.85156 147.69261 147.67663 111.85156 191.74609 111.85156 L 191.74609 79.894531 z M 379.94336 312.17773 C 362.4466 339.35762 339.342 362.4782 312.16211 379.95898 L 429.49414 497.27539 C 448.22126 516.00251 478.5646 516.00251 497.25977 497.27539 C 516.00287 478.5962 516.00287 448.25322 497.25977 429.49414 L 379.94336 312.17773 z M 615.19922 390.89844 L 615.19922 416.85547 L 700.50977 416.85547 L 700.50977 390.89844 L 615.19922 390.89844 z ";
	VP.view.width=759.309;
	VP.view.height=511.321;
	VP.trash = {};
	VP.trash.path="m 133.622,0 c -10.303,0 -18.6582,8.35325 -18.6582,18.65625 0,0.0257 0.004,0.0505 0.004,0.0762 l -105.80665,0 c -3.80276,0 -6.89257,6.97823 -6.89257,15.58593 0,8.6077 3.0898,15.58399 6.89257,15.58399 l 297.32422,0 c 3.822,0 6.89453,-6.96699 6.89454,-15.58399 0,-8.5983 -3.07254,-15.58593 -6.89454,-15.58593 l -105.80468,0 c 10e-5,-0.0257 0.004,-0.0505 0.004,-0.0762 0,-10.303 -8.3362,-18.65625 -18.6582,-18.65625 l -48.4043,0 z m -115.46875,66.23829 32.14453,297.77343 215.07032,0 32.12695,-297.77343 -61.72266,0 -16.55273,261.05859 -16.47461,0 16.56836,-261.05859 -53.24805,0 0,261.05859 -16.48437,0 0,-261.05859 -53.22852,0 16.56836,261.05859 -16.47266,0 -16.55273,-261.05859 -61.74219,0 z"
	VP.trash.width = 311.111;
	VP.trash.height = 364.012;
	VP.square = {};
	VP.square.path="m 1,1 10,0 0,10 -10,0 z";
	VP.square.width=12;
	VP.square.height=12;
	VP.play = {};
	VP.play.path="m 0,0 8.66025,5 -8.66025,5 z";
	VP.play.width=8.66025;
	VP.play.height=10;
	VP.circle = {};
	VP.circle.path = "m 0,50 a50,50 0 1,0 100,0 a50,50 0 1,0 -100,0";
	VP.circle.width = 100;
	VP.circle.height = 100;
	VP.pause = {};
	VP.pause.path = "m 3,3 10,0 0,30 -10,0 z m 20,0 10,0 0,30 -10,0 z";
	VP.pause.width = 36;
	VP.pause.height = 36;
}
function ImageLists(){
	var IL=ImageLists;
	IL.hBIcon=function(){};
	IL.hBIcon.lightName="hBIconWhite";
	IL.hBIcon.darkName="hBIconDarkGray";
	IL.hBIcon.width=526;
	IL.hBIcon.height=334;
}

//Static.  Makes block shapes for the SVG.

function BlockGraphics(){
	BlockGraphics.SetBlock();
	BlockGraphics.SetCommand();
	BlockGraphics.SetReporter();
	BlockGraphics.SetPredicate();
	BlockGraphics.SetString();
	BlockGraphics.SetHat();
	BlockGraphics.SetLoop();
	BlockGraphics.SetLabelText();
	BlockGraphics.SetValueText();
	BlockGraphics.SetDropSlot();
	BlockGraphics.SetHighlight();
	BlockGraphics.SetHitBox();
	BlockGraphics.SetGlow();
	BlockGraphics.CalcCommand();
	BlockGraphics.CalcPaths();
}
BlockGraphics.SetBlock=function(){
	BlockGraphics.block=function(){};
	BlockGraphics.block.pMargin=7; //Margin between parts
};
BlockGraphics.SetCommand=function(){
	BlockGraphics.command=function(){};
	BlockGraphics.command.height=34; //27
	BlockGraphics.command.width=40;
	BlockGraphics.command.vMargin=5;
	BlockGraphics.command.hMargin=7;
	//BlockGraphics.command.pMargin=5; //Margin between parts
	BlockGraphics.command.bumpOffset=7;
	BlockGraphics.command.bumpDepth=4;
	BlockGraphics.command.bumpTopWidth=15;
	BlockGraphics.command.bumpBottomWidth=7;
	BlockGraphics.command.cornerRadius=3;
	BlockGraphics.command.snap=function(){};
	BlockGraphics.command.snap.left=20;
	BlockGraphics.command.snap.right=20;
	BlockGraphics.command.snap.top=20;
	BlockGraphics.command.snap.bottom=20;
	BlockGraphics.command.shiftX=20;
	BlockGraphics.command.shiftY=20;
}
BlockGraphics.SetReporter=function(){
	BlockGraphics.reporter=function(){};
	BlockGraphics.reporter.height=30;//22
	BlockGraphics.reporter.width=30;//22
	BlockGraphics.reporter.vMargin=6;
	BlockGraphics.reporter.hMargin=10;//5
	//BlockGraphics.reporter.pMargin=5; //Margin between parts
	BlockGraphics.reporter.slotHeight=22;//18
	BlockGraphics.reporter.slotWidth=22;//18
	BlockGraphics.reporter.slotHMargin=10;//5 //Margin at side of slot
	//BlockGraphics.reporter.slotStrokeC="none";
	//BlockGraphics.reporter.slotStrokeW=1;
	BlockGraphics.reporter.strokeW=1;
	BlockGraphics.reporter.slotFill="#fff";
	BlockGraphics.reporter.slotSelectedFill="#000";
}
BlockGraphics.SetPredicate=function(){
	BlockGraphics.predicate=function(){};
	BlockGraphics.predicate.height=30;//16
	BlockGraphics.predicate.width=27;
	BlockGraphics.predicate.vMargin=6;
	BlockGraphics.predicate.hMargin=10;
	//BlockGraphics.predicate.pMargin=5; //Margin between parts
	BlockGraphics.predicate.hexEndL=10;
	BlockGraphics.predicate.slotHeight=18;
	BlockGraphics.predicate.slotWidth=25;
	BlockGraphics.predicate.slotHMargin=5;
	BlockGraphics.predicate.slotHexEndL=7;
}
BlockGraphics.SetString=function(){
	BlockGraphics.string=function(){};
	BlockGraphics.string.slotHeight=22;//14
	BlockGraphics.string.slotWidth=22;//5
	BlockGraphics.string.slotHMargin=4;//2
	//BlockGraphics.string.slotHMargin=5;
}
BlockGraphics.SetHat=function(){
	BlockGraphics.hat=function(){};
	BlockGraphics.hat.hRadius=60;
	BlockGraphics.hat.vRadius=40;
	BlockGraphics.hat.topW=80;
	BlockGraphics.hat.width=90;
	BlockGraphics.hat.hatHEstimate=10;
	//BlockGraphics.hat.height=20;
}
BlockGraphics.SetLoop=function(){
	BlockGraphics.loop=function(){};
	//BlockGraphics.loop.height=40;
	BlockGraphics.loop.width=40;
	BlockGraphics.loop.bottomH=7;
	BlockGraphics.loop.side=7;
}
BlockGraphics.SetLabelText=function(){
	BlockGraphics.labelText=function(){};
	BlockGraphics.labelText.font="Arial";
	BlockGraphics.labelText.fontSize=12;
	BlockGraphics.labelText.fontWeight="bold";
	BlockGraphics.labelText.fill="#ffffff";
	BlockGraphics.labelText.charHeight=10;
	/*BlockGraphics.labelText.charWidth=3;*/
}
BlockGraphics.SetValueText=function(){
	BlockGraphics.valueText=function(){};
	BlockGraphics.valueText.font="Arial";
	BlockGraphics.valueText.fontSize=12;
	BlockGraphics.valueText.fontWeight="normal";
	BlockGraphics.valueText.fill="#000000";
	BlockGraphics.valueText.charHeight=10;
	BlockGraphics.valueText.selectedFill="#fff";
	BlockGraphics.valueText.grayedFill="#aaa";
	/*BlockGraphics.valueText.charWidth=3;*/
}
BlockGraphics.SetDropSlot=function(){
	BlockGraphics.dropSlot=function(){};
	BlockGraphics.dropSlot.slotHeight=22;
	BlockGraphics.dropSlot.slotWidth=25;
	BlockGraphics.dropSlot.slotHMargin=5;
	BlockGraphics.dropSlot.triH=6;
	BlockGraphics.dropSlot.triW=8;
	//BlockGraphics.dropSlot.menuWidth=100;
	BlockGraphics.dropSlot.bg="#000";
	BlockGraphics.dropSlot.bgOpacity=0.25;
	BlockGraphics.dropSlot.selectedBg="#000";
	BlockGraphics.dropSlot.selectedBgOpacity=1;
	BlockGraphics.dropSlot.triFill="#000";
	BlockGraphics.dropSlot.textFill="#fff";
	BlockGraphics.dropSlot.selectedTriFill="#fff";
}
BlockGraphics.SetHighlight=function(){
	BlockGraphics.highlight=function(){};
	BlockGraphics.highlight.margin=5;
	BlockGraphics.highlight.hexEndL=15;
	BlockGraphics.highlight.slotHexEndL=10;
	BlockGraphics.highlight.strokeC="#fff";
	BlockGraphics.highlight.strokeDarkC="#000";
	BlockGraphics.highlight.strokeW=3;
	BlockGraphics.highlight.commandL=10;
}
BlockGraphics.SetHitBox=function(){
	BlockGraphics.hitBox=function(){};
	BlockGraphics.hitBox.hMargin=BlockGraphics.block.pMargin/2;
	BlockGraphics.hitBox.vMargin=3;
};
BlockGraphics.SetGlow=function(){
	BlockGraphics.glow=function(){};
	BlockGraphics.glow.color="#fff";
	BlockGraphics.glow.strokeW=2;
};

BlockGraphics.CalcCommand=function(){
	var com=BlockGraphics.command;
	com.extraHeight=2*com.cornerRadius;
	com.extraWidth=2*com.cornerRadius+com.bumpTopWidth+com.bumpOffset;
	com.bumpSlantWidth=(com.bumpTopWidth-com.bumpBottomWidth)/2;
}
BlockGraphics.CalcPaths=function(){
	var com=BlockGraphics.command;
	var path1="";
	//path1+="m "+com.x+","+com.y;
	path1+=" "+com.bumpOffset+",0";
	path1+=" "+com.bumpSlantWidth+","+com.bumpDepth;
	path1+=" "+com.bumpBottomWidth+",0";
	path1+=" "+com.bumpSlantWidth+","+(0-com.bumpDepth);
	path1+=" ";
	var path2=",0";
	path2+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+com.cornerRadius+" "+com.cornerRadius;
	path2+=" l 0,";
	var path3="";
	path3+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+(0-com.cornerRadius)+" "+com.cornerRadius;
	path3+=" l ";
	var path4=",0";
	path4+=" "+(0-com.bumpSlantWidth)+","+com.bumpDepth;
	path4+=" "+(0-com.bumpBottomWidth)+",0";
	path4+=" "+(0-com.bumpSlantWidth)+","+(0-com.bumpDepth);
	path4+=" "+(0-com.bumpOffset)+",0";
	path4+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+(0-com.cornerRadius)+" "+(0-com.cornerRadius);
	path4+=" ";
	var path4NoBump=",0";
	path4NoBump+=" "+(0-com.bumpSlantWidth-com.bumpBottomWidth-com.bumpSlantWidth-com.bumpOffset)+",0";
	path4NoBump+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+(0-com.cornerRadius)+" "+(0-com.cornerRadius);
	path4NoBump+=" ";
	var path5="";
	path5+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+com.cornerRadius+" "+(0-com.cornerRadius);
	path5+=" z";
	com.path1=path1;
	com.path2=path2;
	com.path3=path3;
	com.path4=path4;
	com.path4NoBump=path4NoBump;
	com.path5=path5;
};
BlockGraphics.getType=function(type){
	switch(type){
		case 0:
			return BlockGraphics.command;
		case 1:
			return BlockGraphics.reporter;
		case 2:
			return BlockGraphics.predicate;
		case 3:
			return BlockGraphics.string;
		case 4:
			return BlockGraphics.hat;
		case 5:
			return BlockGraphics.loop;
		case 6:
			return BlockGraphics.loop;
	}
}

BlockGraphics.buildPath=function(){}
BlockGraphics.buildPath.command=function(x,y,width,height){
	var path="";
	path+="m "+(x+BlockGraphics.command.cornerRadius)+","+y;
	path+=BlockGraphics.command.path1;

	path+=width-BlockGraphics.command.extraWidth;
	path+=BlockGraphics.command.path2;
	path+=height-BlockGraphics.command.extraHeight;
	path+=BlockGraphics.command.path3;
	path+=BlockGraphics.command.extraWidth-width;
	path+=BlockGraphics.command.path4+"l 0,";
	path+=BlockGraphics.command.extraHeight-height;
	path+=BlockGraphics.command.path5;
	return path;
}
BlockGraphics.buildPath.highlightCommand=function(x,y){
	var path="";
	path+="m "+x+","+y;
	path+="l "+BlockGraphics.command.cornerRadius+",0";
	path+=BlockGraphics.command.path1;
	path+=BlockGraphics.highlight.commandL+",0";
	return path;
}
BlockGraphics.buildPath.reporter=function(x,y,width,height){
	var radius=height/2;
	var flatWidth=width-height;
	var path="";
	path+="m "+(x+radius)+","+(y+height);
	path+=" a "+radius+" "+radius+" 0 0 1 0 "+(0-height);
	path+=" l "+flatWidth+",0";
	path+=" a "+radius+" "+radius+" 0 0 1 0 "+height;
	path+=" z";
	return path;
}
BlockGraphics.buildPath.predicate=function(x,y,width,height,isSlot,isHighlight){
	var hexEndL;
	var halfHeight=height/2;
	var bG;
	if(isHighlight){
		bG=BlockGraphics.highlight;
	} else{
		bG=BlockGraphics.predicate;
	}
	if(isSlot){
		hexEndL=bG.slotHexEndL;
	} else{
		hexEndL=bG.hexEndL;
	}
	var flatWidth=width-2*hexEndL;
	var path="";
	path+="m "+x+","+(y+halfHeight);
	path+=" "+hexEndL+","+(0-halfHeight);
	path+=" "+flatWidth+",0";
	path+=" "+hexEndL+","+halfHeight;
	path+=" "+(0-hexEndL)+","+halfHeight;
	path+=" "+(0-flatWidth)+",0";
	path+=" "+(0-hexEndL)+","+(0-halfHeight);
	path+=" z";
	return path;
}
BlockGraphics.buildPath.string=function(x,y,width,height){
	var path="";
	path+="m "+x+","+y;
	path+=" "+width+",0";
	path+=" 0,"+height;
	path+=" "+(0-width)+",0";
	path+=" z";
	return path;
}
BlockGraphics.buildPath.hat=function(x,y,width,height){
	var path="";
	var hat=BlockGraphics.hat;
	var flatWidth=width-hat.topW-BlockGraphics.command.cornerRadius;
	var flatHeight=height-BlockGraphics.command.cornerRadius*2;
	path+="m "+x+","+y;
	path+=" a "+hat.hRadius+" "+hat.vRadius+" 0 0 1 "+hat.topW+" 0";
	path+=" l "+flatWidth;	
	path+=BlockGraphics.command.path2;
	path+=flatHeight;
	path+=BlockGraphics.command.path3;
	path+=BlockGraphics.command.extraWidth-width;
	path+=BlockGraphics.command.path4;
	path+="z";
	return path;
}
BlockGraphics.buildPath.loop=function(x,y,width,height,innerHeight,bottomOpen){
	if(bottomOpen==null){
		bottomOpen=true;
	}
	var path="";
	var loop=BlockGraphics.loop;
	path+="m "+(x+BlockGraphics.command.cornerRadius)+","+y;
	path+=BlockGraphics.command.path1;
	path+=width-BlockGraphics.command.extraWidth;
	path+=BlockGraphics.command.path2;
	path+=height-innerHeight-2*BlockGraphics.command.cornerRadius-loop.bottomH;
	path+=BlockGraphics.command.path3;
	path+=(BlockGraphics.command.extraWidth-width+loop.side)+",0";
	path+=" "+(0-BlockGraphics.command.bumpSlantWidth)+","+BlockGraphics.command.bumpDepth;
	path+=" "+(0-BlockGraphics.command.bumpBottomWidth)+",0";
	path+=" "+(0-BlockGraphics.command.bumpSlantWidth)+","+(0-BlockGraphics.command.bumpDepth);
	path+=" "+(0-BlockGraphics.command.bumpOffset)+",0";
	path+=" a "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius+" 0 0 0 "+(0-BlockGraphics.command.cornerRadius)+" "+BlockGraphics.command.cornerRadius;
	path+=" l 0,"+(innerHeight-2*BlockGraphics.command.cornerRadius);
	path+=" a "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius+" 0 0 0 "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius;
	path+=" l "+(width-2*BlockGraphics.command.cornerRadius-loop.side);
	path+=BlockGraphics.command.path2;
	path+=loop.bottomH-2*BlockGraphics.command.cornerRadius;
	path+=BlockGraphics.command.path3;
	path+=(BlockGraphics.command.extraWidth-width);
	if(bottomOpen){
		path+=BlockGraphics.command.path4+"l 0,";
	}
	else{
		path+=BlockGraphics.command.path4NoBump+"l 0,";
	}
	path+=(0-height+2*BlockGraphics.command.cornerRadius);
	path+=BlockGraphics.command.path5;
	return path;
}
BlockGraphics.buildPath.doubleLoop=function(x,y,width,height,innerHeight1,innerHeight2,midHeight){
	var path="";
	var loop=BlockGraphics.loop;
	path+="m "+(x+BlockGraphics.command.cornerRadius)+","+y;
	path+=BlockGraphics.command.path1;
	path+=width-BlockGraphics.command.extraWidth;
	var innerHeight=innerHeight1;
	var currentH=height-midHeight-innerHeight1-innerHeight2-2*BlockGraphics.command.cornerRadius-loop.bottomH;
	for(var i=0;i<2;i++){
		path+=BlockGraphics.command.path2;
		path+=currentH;
		path+=BlockGraphics.command.path3;
		path+=(BlockGraphics.command.extraWidth-width+loop.side)+",0";
		path+=" "+(0-BlockGraphics.command.bumpSlantWidth)+","+BlockGraphics.command.bumpDepth;
		path+=" "+(0-BlockGraphics.command.bumpBottomWidth)+",0";
		path+=" "+(0-BlockGraphics.command.bumpSlantWidth)+","+(0-BlockGraphics.command.bumpDepth);
		path+=" "+(0-BlockGraphics.command.bumpOffset)+",0";
		path+=" a "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius+" 0 0 0 "+(0-BlockGraphics.command.cornerRadius)+" "+BlockGraphics.command.cornerRadius;
		path+=" l 0,"+(innerHeight-2*BlockGraphics.command.cornerRadius);
		path+=" a "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius+" 0 0 0 "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius;
		path+=" l "+(width-2*BlockGraphics.command.cornerRadius-loop.side);
		innerHeight=innerHeight2;
		var currentH=midHeight-2*BlockGraphics.command.cornerRadius;
	}
	path+=BlockGraphics.command.path2;
	path+=loop.bottomH-2*BlockGraphics.command.cornerRadius;
	path+=BlockGraphics.command.path3;
	path+=(BlockGraphics.command.extraWidth-width);
	path+=BlockGraphics.command.path4+"l 0,";
	path+=(0-height+2*BlockGraphics.command.cornerRadius);
	path+=BlockGraphics.command.path5;
	return path;
}
BlockGraphics.create=function(){}
BlockGraphics.create.block=function(category,group,returnsValue){
	var path=GuiElements.create.path(group);
	var fill=Colors.getGradient(category);
	path.setAttributeNS(null,"fill",fill);
	BlockGraphics.update.stroke(path,category,returnsValue);
	return path;
}
BlockGraphics.create.slot=function(group,type,category){
	var bG=BlockGraphics.reporter;
	var path=GuiElements.create.path(group);
	if(type==2){
		path.setAttributeNS(null,"fill","url(#gradient_dark_"+category+")");
	}
	else{
		path.setAttributeNS(null,"stroke",bG.slotStrokeC);
		path.setAttributeNS(null,"stroke-width",bG.slotStrokeW);
		path.setAttributeNS(null,"fill",bG.slotFill);
	}
	return path;
}
BlockGraphics.create.slotHitBox=function(group){
	var rectE=GuiElements.create.rect(group);
	rectE.setAttributeNS(null,"fill","#000");
	GuiElements.update.opacity(rectE,0);
	return rectE;
}
BlockGraphics.create.labelText=function(text,group){
	var bG=BlockGraphics.labelText;
	var textElement=GuiElements.create.text();
	textElement.setAttributeNS(null,"font-family",bG.font);
	textElement.setAttributeNS(null,"font-size",bG.fontSize);
	textElement.setAttributeNS(null,"font-weight",bG.fontWeight);
	textElement.setAttributeNS(null,"fill",bG.fill);
	textElement.setAttributeNS(null,"class","noselect");
	var textNode = document.createTextNode(text);
	textElement.appendChild(textNode);
	group.appendChild(textElement);
	return textElement;
}
BlockGraphics.create.valueText=function(text,group){
	var bG=BlockGraphics.valueText;
	var textElement=GuiElements.create.text();
	textElement.setAttributeNS(null,"font-family",bG.font);
	textElement.setAttributeNS(null,"font-size",bG.fontSize);
	textElement.setAttributeNS(null,"font-weight",bG.fontWeight);
	textElement.setAttributeNS(null,"fill",bG.fill);
	textElement.setAttributeNS(null,"class","noselect");
	GuiElements.update.text(textElement,text);
	group.appendChild(textElement);
	return textElement;
}

BlockGraphics.update=function(){}
BlockGraphics.update.path=function(path,x,y,width,height,type,isSlot,innerHeight1,innerHeight2,midHeight,bottomOpen){
	var pathD;
	switch(type){
		case 0:
			pathD=BlockGraphics.buildPath.command(x,y,width,height);
			break;
		case 1:
			pathD=BlockGraphics.buildPath.reporter(x,y,width,height);
			break;
		case 2:
			pathD=BlockGraphics.buildPath.predicate(x,y,width,height,isSlot,false);
			break;
		case 3:
			pathD=BlockGraphics.buildPath.string(x,y,width,height);
			break;
		case 4:
			pathD=BlockGraphics.buildPath.hat(x,y,width,height);
			break;
		case 5:
			pathD=BlockGraphics.buildPath.loop(x,y,width,height,innerHeight1,bottomOpen);
			break;
		case 6:
			pathD=BlockGraphics.buildPath.doubleLoop(x,y,width,height,innerHeight1,innerHeight2,midHeight);
			break;
	}
	path.setAttributeNS(null,"d",pathD);
	return path;
};
BlockGraphics.update.text=function(text,x,y){
	text.setAttributeNS(null,"x",x);
	text.setAttributeNS(null,"y",y);
}
BlockGraphics.update.glow=function(path){
	var glow=BlockGraphics.glow;
	path.setAttributeNS(null,"stroke",glow.color);
	path.setAttributeNS(null,"stroke-width",glow.strokeW);
};
BlockGraphics.update.stroke=function(path,category,returnsValue){
	if(returnsValue){
		var outline=Colors.getColor(category);
		path.setAttributeNS(null,"stroke",outline);
		path.setAttributeNS(null,"stroke-width",BlockGraphics.reporter.strokeW);
	}
	else{
		path.setAttributeNS(null,"stroke-width",0);
	}
};
BlockGraphics.buildPath.highlight=function(x,y,width,height,type,isSlot){
	var bG=BlockGraphics.highlight;
	var pathD;
	var hX=x-bG.margin;
	var hY=y-bG.margin;
	var hWidth=width+2*bG.margin;
	var hHeight=height+2*bG.margin;
	switch(type){
		case 0:
			pathD=BlockGraphics.buildPath.highlightCommand(x,y);
			break;
		case 1:
			pathD=BlockGraphics.buildPath.reporter(hX,hY,hWidth,hHeight);
			break;
		case 2:
			pathD=BlockGraphics.buildPath.predicate(hX,hY,hWidth,hHeight,isSlot,true);
			break;
		case 3:
			pathD=BlockGraphics.buildPath.string(hX,hY,hWidth,hHeight);
			break;
	}
	return pathD;
}
//Move?:
BlockGraphics.bringToFront=function(obj,layer){
	obj.remove();
	layer.appendChild(obj);
}


/*BlockGraphics.create.command=function(x,y,width,height,category){
	var pathD=BlockGraphics.buildPath.command(x,y,width,height);
	var commandPath=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	commandPath.setAttributeNS(null,"d",pathD);
	commandPath.setAttributeNS(null,"fill","url(#gradient_"+category+")");
	return commandPath;
}
BlockGraphics.create.reporter=function(x,y,width,height,category){
	var pathD=BlockGraphics.buildPath.reporter(x,y,width,height);
	var reporterPath=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	reporterPath.setAttributeNS(null,"d",pathD);
	reporterPath.setAttributeNS(null,"fill","url(#gradient_"+category+")");
	return reporterPath;
}
BlockGraphics.create.predicate=function(x,y,width,height,category,isSlot){
	var pathD=BlockGraphics.buildPath.predicate(x,y,width,height,isSlot);
	var predicatePath=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	predicatePath.setAttributeNS(null,"d",pathD);
	predicatePath.setAttributeNS(null,"fill","url(#gradient_"+category+")");
	return predicatePath;
}*/



function Sounds() {
	Sounds.names = [];
	Sounds.durations = [];
	Sounds.loadNames();
}

Sounds.loadNames=function(){
	var request = "sound/names";
	var callback = function(response) {
		Sounds.names = response.split("\n");
		Sounds.names = Sounds.names.filter(function(n){ return n != "" });
		Sounds.durations = Array.apply(null, new Array(Sounds.names.length)).map(Number.prototype.valueOf,0);

		for (var i = 0; i < Sounds.names.length; i++) {
			const index = i;
			var request = "sound/duration?filename=" + Sounds.getSoundName(i);
			var durationCallback = function(duration) {
				//HtmlServer.sendRequest("server/log/LOG:Got_duration:" + index + ":"+ duration);
				Sounds.durations[index] = Number(duration);
			};
			HtmlServer.sendRequestWithCallback(request,durationCallback);
		}

	};
	HtmlServer.sendRequestWithCallback(request, callback);
};

Sounds.getSoundDuration=function(index){
	return Sounds.durations[index];
};

Sounds.getSoundName=function(index){
	return Sounds.names[index];
};
Sounds.getSoundCount=function(){
	return Sounds.names.length;
};
Sounds.indexFromName=function(soundName){
	return Sounds.names.indexOf(soundName);
};
Sounds.checkNameIsValid=function(soundName){
	return Sounds.indexFromName(soundName)>=0;
};

// Stops all sounds and tones
Sounds.stopAllSounds=function(){
	var request = "sound/stopAll"
	var errCallback = function() {
		// TODO(ttsun): Handle error
		//GuiElements.alert("Error stopping all sounds.")
	}
	HtmlServer.sendRequestWithCallback(request, null, errCallback);
}


/* TouchReceiver is a static class that handles all touch events.
 * It adds touch event handlers and keeps track of what types of objects are being touched/dragged.
 */
function TouchReceiver(){
	var TR=TouchReceiver; //shorthand
	//Toggle to determine of mouse or touchscreen events should be used.
	TR.mouse = false || (DebugOptions.mouse && DebugOptions.enabled); //Use true when debugging on a desktop.
	TR.longTouchInterval=700; //The number of ms before a touch is considered a long touch.
	TR.fixScrollingInterval = 100;
	TR.blocksMoving=false; //No BlockStacks are currently moving.
	TR.targetType="none"; //Stores the type of object being interacted with.
	TR.touchDown=false; //Is a finger currently on the screen?
	TR.longTouch=false; //Has the event already been handled by a long touch event?
	TR.target=null; //The object being interacted with.
	TR.startX=0; //The x coord of the initial touch.
	TR.startY=0; //The y coord of the initial touch.
	TR.startX2=0; //The x coord of the second touch.
	TR.startY2=0; //The y coord of the second touch.
	TR.longTouchTimer=null; //Triggers long touch events.
	TR.timerRunning=false; //Indicates if the long touch timer is running.
	TR.zooming = false; //There are not two touches on the screen.
	TR.dragging = false;
	TR.moveThreshold = 10;
	var handlerMove="touchmove"; //Handlers are different for touchscreens and mice.
	var handlerUp="touchend";
	var handlerDown="touchstart";
	if(TR.mouse){
		handlerMove="mousemove";
		handlerUp="mouseup";   
		handlerDown="mousedown";
	}
	TR.handlerMove=handlerMove;
	TR.handlerUp=handlerUp;
	TR.handlerDown=handlerDown;
	 //Add event handlers for handlerMove and handlerUp events to the whole document.
	TR.addListeners();
	//TR.test=true;
}
/* Adds event handlers for handlerMove and handlerUp events to the whole document.
 */
TouchReceiver.addListeners=function(){
	var TR=TouchReceiver;
	TR.addEventListenerSafe(document.body, TR.handlerMove,TouchReceiver.handleMove,false);
	TR.addEventListenerSafe(document.body, TR.handlerUp,TouchReceiver.handleUp,false);
	TR.addEventListenerSafe(document.body, TR.handlerDown,TouchReceiver.handleDocumentDown,false);
};
/* Handles movement events and prevents drag gestures from scrolling document.
 * @param {event} event - passed event arguments.
 * @fix combine with TouchReceiver.touchmove.
 */
TouchReceiver.handleMove=function(event){
	TouchReceiver.touchmove(event); //Deal with movement.
};
/* Handles new touch events.
 * @param {event} event - passed event arguments.
 * @fix combine with TouchReceiver.touchstart.
 */
TouchReceiver.handleUp=function(event){
	TouchReceiver.touchend(event);
	//GuiElements.alert("");
};
TouchReceiver.handleDocumentDown=function(event){
	if(TouchReceiver.touchstart(event)){
		GuiElements.overlay.close(); //Close any visible overlays.
	}
};
/* Returns the touch x coord from the event arguments
 * @param {event} event - passed event arguments.
 * @return {number} - x coord.
 */
TouchReceiver.getX=function(e){
	if(TouchReceiver.mouse){ //Depends on if a desktop or touchscreen is being used.
		return e.clientX/GuiElements.zoomFactor;
	}
	return e.touches[0].pageX/GuiElements.zoomFactor;
};
/* Returns the touch y coord from the event arguments
 * @param {event} event - passed event arguments.
 * @return {number} - y coord.
 */
TouchReceiver.getY=function(e){
	if(TouchReceiver.mouse){ //Depends on if a desktop or touchscreen is being used.
		return e.clientY/GuiElements.zoomFactor;
	}
	return e.touches[0].pageY/GuiElements.zoomFactor;
};
TouchReceiver.getTouchX=function(e, i){
	return e.touches[i].pageX/GuiElements.zoomFactor;
};
TouchReceiver.getTouchY=function(e, i){
	return e.touches[i].pageY/GuiElements.zoomFactor;
};
/* Handles new touch events.  Does not know which element was touched.
 * @param {event} e - passed event arguments.
 * @return {boolean} - returns true iff !TR.touchDown
 */
TouchReceiver.touchstart=function(e, preventD){
	if(preventD == null){
		preventD = true;
	}
	var TR=TouchReceiver; //shorthand
	if(preventD) {
		//GuiElements.alert("Prevented 1");
		e.preventDefault(); //Stops 300 ms delay events
	}
	// e.stopPropagation();
	var startTouch=!TR.touchDown;
	if(startTouch){ //prevents multitouch issues.
		TR.stopLongTouchTimer();
		TR.dragging = false;
		TR.touchDown=true;
		TR.targetType="none"; //Does not know the target of the touch.
		TR.target=null;
		TR.longTouch=false;
		TR.startX=TR.getX(e);
		TR.startY=TR.getY(e);
	}
	return startTouch;
};
TouchReceiver.checkStartZoom=function(e){
	var TR=TouchReceiver; //shorthand
	if(!TR.zooming && !TR.mouse && e.touches.length >= 2){
		if((!TR.dragging && TR.targetIsInTabSpace()) || TabManager.scrolling){
			TR.dragging = true;
			if(TabManager.scrolling){
				TabManager.endScroll();
			}
			TR.zooming = true;
			TR.startX = TR.getTouchX(e, 0);
			TR.startY = TR.getTouchY(e, 0);
			TR.startX2 = TR.getTouchX(e, 1);
			TR.startY2 = TR.getTouchY(e, 1);
			TabManager.startZooming(TR.startX, TR.startY, TR.startX2, TR.startY2);
		}
	}
};
TouchReceiver.targetIsInTabSpace=function(){
	var TR=TouchReceiver; //shorthand
	if(TR.targetType == "tabSpace"){
		return true;
	}
	else if(TR.targetType == "block"){
		return true;
	}
	else if(TR.targetType == "slot"){
		return !TR.target.parent.stack.isDisplayStack;
	}
	return false;
};
/* Handles new touch events for Blocks.  Stores the target Block.
 * @param {Blocks} target - The Block that was touched.
 * @param {event} e - passed event arguments.
 * @fix rename to touchStartBlock.
 */
TouchReceiver.touchStartBlock=function(target,e){
	var TR=TouchReceiver; //shorthand
	if(!target.stack.isDisplayStack) {
		TR.checkStartZoom(e);
	}
	if(TR.touchstart(e)){ //prevent multitouch issues.
		GuiElements.overlay.close(); //Close any visible overlays.
		if(target.stack.isDisplayStack){ //Determine what type of stack the Block is a member of.
			TR.targetType="displayStack";
			TR.setLongTouchTimer();
		}
		else{
			TR.targetType="block";
			TR.setLongTouchTimer();
		}
		TouchReceiver.target=target; //Store target Block.
	}
};
/* Handles new touch events for Slots.  Stores the target Slot.
 * @param {Slot} slot - The Slot that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartSlot=function(slot,e){
	var TR=TouchReceiver;
	if(TR.touchstart(e)){
		if(slot.selected!=true){
			GuiElements.overlay.close(); //Close any visible overlays.
		}
		TR.targetType="slot";
		TouchReceiver.target=slot; //Store target Slot.
		TR.setLongTouchTimer();
	}
};
/* Handles new touch events for CategoryBNs.  Stores the target CategoryBN.
 * @param {Category} target - The Category of the CategoryBN that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartCatBN=function(target,e){
	var TR=TouchReceiver;
	if(TR.touchstart(e)){
		GuiElements.overlay.close(); //Close any visible overlays.
		TR.targetType="category";
		target.select(); //Makes the button light up and the category become visible.
		GuiElements.overlay.close(); //Close any visible overlays.
	}
};
/* Handles new touch events for Buttons.  Stores the target Button.
 * @param {Button} target - The Button that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartBN=function(target,e){
	var TR=TouchReceiver;
	var shouldPreventDefault = !target.scrollable && target.menuBnList == null;
	if(!shouldPreventDefault){
		e.stopPropagation();
	}
	if(TR.touchstart(e, shouldPreventDefault)){
		if(!target.isOverlayPart){
			GuiElements.overlay.close(); //Close any visible overlays.
		}
		TR.targetType="button";
		target.press(); //Changes the button's appearance and may trigger an action.
		TR.target=target;
	}
};
/* Handles new touch events for the background of the palette.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartScrollBox=function(target, e){
	var TR=TouchReceiver;
	if(TR.touchstart(e, false)){
		if(!target.isOverlayPart){
			GuiElements.overlay.close(); //Close any visible overlays.
		}
		TR.targetType="scrollBox";
		TR.target=target; //The type is all that is important. There is only one palette.
		e.stopPropagation();
	}
};
/* @fix Write documentation. */
TouchReceiver.touchStartTabSpace=function(e){
	var TR=TouchReceiver;
	TR.checkStartZoom(e);
	if(TR.touchstart(e)){
		GuiElements.overlay.close(); //Close any visible overlays.
		TR.targetType="tabSpace";
		TR.target=null;
	}
};
/* @fix Write documentation. */
TouchReceiver.touchStartDisplayBox=function(e){
	var TR=TouchReceiver;
	if(TR.touchstart(e)){
		GuiElements.overlay.close(); //Close any visible overlays.
		TR.targetType="displayBox";
		TR.target=null;
		DisplayBox.hide();
		TR.touchDown = false;
		e.stopPropagation();
	}
};
/* @fix Write documentation. */
TouchReceiver.touchStartOverlayPart=function(e){
	var TR=TouchReceiver;
	if(TR.touchstart(e)){

	}
};
TouchReceiver.touchStartMenuBnListScrollRect=function(target,e){
	var TR=TouchReceiver;
	if(TR.touchstart(e)) {
		if(!target.isOverlayPart) {
			GuiElements.overlay.close(); //Close any visible overlays.
		}
		TR.targetType="menuBnList";
		TouchReceiver.target=target; //Store target Slot.
	}
};
TouchReceiver.touchStartSmoothMenuBnList=function(target,e){
	var TR=TouchReceiver;
	if(TR.touchstart(e, false)) {
		if(!target.isOverlayPart) {
			GuiElements.overlay.close(); //Close any visible overlays.
		}
		TR.targetType="smoothMenuBnList";
		TouchReceiver.target=target; //Store target.
		e.stopPropagation();
	}
};

/* Handles touch movement events.  Tells stacks, Blocks, Buttons, etc. how to respond.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchmove=function(e){
	var TR=TouchReceiver;
	var shouldPreventDefault = true;
	if(TR.touchDown&&(TR.hasMovedOutsideThreshold(e) || TR.dragging)){
		TR.dragging = true;
		if(TR.longTouch) {
			GuiElements.overlay.close();
			TR.longTouch = false;
		}
		if(TR.zooming){
			//If we are currently zooming, we update the zoom.
			if(e.touches.length < 2){
				TR.touchend(e);
			}
			else{
				var x1 = TR.getTouchX(e, 0);
				var y1 = TR.getTouchY(e, 0);
				var x2 = TR.getTouchX(e, 1);
				var y2 = TR.getTouchY(e, 1);
				TabManager.updateZooming(x1, y1, x2, y2);
			}
		}
		else {
			//If the user drags a Slot, the block they are dragging should become the target.
			if (TR.targetType == "slot") {
				TR.target = TR.target.parent; //Now the user is dragging a block.
				if (TR.target.stack.isDisplayStack) {
					TR.targetType = "displayStack";
				}
				else {
					TR.targetType = "block";
				}
			}
			/* If the user drags a Block that is in a DisplayStack,
			 the DisplayStack copies to a new BlockStack, which can be dragged. */
			if (TR.targetType == "displayStack") {
				var x = TR.target.stack.getAbsX();
				var y = TR.target.stack.getAbsY();
				//The first block of the duplicated BlockStack is the new target.
				TR.target = TR.target.stack.duplicate(x, y).firstBlock;
				TR.targetType = "block";
			}
			/* If the user drags a Block that is a member of a BlockStack,
			 then the BlockStack should move. */
			if (TR.targetType == "block") {
				//If the CodeManager has not started the movement, this must be done first.
				let x = TR.getX(e);
				let y = TR.getY(e);
				if (TR.blocksMoving) {
					//The CodeManager handles moving BlockStacks.
					CodeManager.move.update(x, y);
				}
				else {
					CodeManager.move.start(TR.target, x, y);
					TR.blocksMoving = true;
				}
			}
			//If the user drags the palette, it should scroll.
			if (TR.targetType == "scrollBox") {
				shouldPreventDefault = false;
			}
			//If the user drags the tab space, it should scroll.
			if (TR.targetType == "tabSpace") {
				if (!TabManager.scrolling) {
					TabManager.startScroll(TR.getX(e), TR.getY(e));
				}
				else {
					TabManager.updateScroll(TR.getX(e), TR.getY(e));
				}
			}
			//If the user drags a button and it has a menuBnList, it should scroll it.
			if (TR.targetType == "button") {
				TR.target.interrupt();
				if ((TR.target.menuBnList != null && TR.target.menuBnList.scrollable)) {
					TR.targetType = "menuBnList";
					TR.target = TR.target.menuBnList;
				} else if (TR.target.scrollable) {
					TR.targetType = "smoothMenuBnList";
					TR.target.interrupt();
					TR.target = null;
				}
			}
			//If the user drags a menuBnList, it should scroll.
			if (TR.targetType == "menuBnList") {
				if (!TR.target.scrolling && TR.target.scrollable) {
					TR.target.startScroll(TR.getY(e));
				}
				else {
					TR.target.updateScroll(TR.getY(e));
				}
			}

			if (TR.targetType == "smoothMenuBnList") {
				shouldPreventDefault = false;
			}
		}
	}
	shouldPreventDefault &= TR.targetType != "smoothMenuBnList";
	shouldPreventDefault &= TR.targetType != "button" || !TR.target.scrollable;
	shouldPreventDefault &= TR.targetType != "scrollBox";
	if(shouldPreventDefault){
		//GuiElements.alert("Prevented 2 t:" + TR.targetType + "!");
		e.preventDefault();
	}
};
TouchReceiver.hasMovedOutsideThreshold=function(e){
	var TR = TouchReceiver;
	if(!TR.touchDown) return false;
	var distX = TR.startX-TR.getX(e);
	var distY = TR.startY-TR.getY(e);
	return (distX * distX + distY * distY >= TR.moveThreshold * TR.moveThreshold);
};
/* Handles touch end events.  Tells stacks, Blocks, Buttons, etc. how to respond.
 * @param {event} e - passed event arguments.
 * @fix DateTime is no longer necessary to prevent repeat events.
 */
TouchReceiver.touchend=function(e){
	var TR=TouchReceiver;
	var shouldPreventDefault = true;
	if(TR.zooming){
		if(e.touches.length == 0){
			TabManager.endZooming();
			TR.zooming = false;
			TR.touchDown=false;
		}
		else if(e.touches.length == 1){
			//Switch from zooming to panning
			TabManager.endZooming();
			TR.zooming = false;
			TR.targetType = "tabSpace";
			TR.target=null;
			TabManager.startScroll(TR.getX(e),TR.getY(e));
		}
		else if(e.touches.length > 1){
			//No action necessary
		}
	}
	else if(TR.touchDown&&!TR.longTouch){ //Prevents multitouch problems.
		TR.touchDown=false;
		TR.dragging = false;
		if(TR.targetType=="block"){
			if(TR.blocksMoving){ //If a stack is moving, tell the CodeManager to end the movement.
				CodeManager.move.end();
				TR.blocksMoving=false;
			}
			else{ //The stack was tapped, so it should run.
				TR.target.stack.startRun();
			}
		}
		else if(TR.targetType=="button"){
			TR.target.release(); //Pass message on to button.
		}
		else if(TR.targetType=="slot"){
			//If a Slot is pressed and released without dragging, it is time to edit its value.
			TR.target.edit();
		}
		else if(TR.targetType=="scrollBox"){
			shouldPreventDefault = false;
		}
		else if(TR.targetType=="tabSpace"){
			TabManager.endScroll();
		}
		else if(TR.targetType=="menuBnList"){
			TR.target.endScroll();
		}
		else if(TR.targetType=="smoothMenuBnList"){
			shouldPreventDefault = false;
		}
	}
	else{
		TR.touchDown = false;
	}
	if(shouldPreventDefault) {
		//GuiElements.alert("Prevented 3");
		e.preventDefault();
	}
};
/* Called when a user's interaction with the screen should be interrupted due to a dialog, etc.
 * Blocks that are moving should stop moving, but actions should not be triggered.
 */
TouchReceiver.touchInterrupt=function(){
	var TR=TouchReceiver;
	var touchWasDown=TR.touchDown;
	TR.touchDown=false;
	if(touchWasDown&&!TR.longTouch){ //Only interrupt if there is a finger on the screen.
		TR.touchDown=false;
		if(TR.targetType=="block"){
			if(TR.blocksMoving){ //If a stack is moving, tell the CodeManager to end the movement.
				CodeManager.move.interrupt();
				TR.blocksMoving=false;
			}
		}
		else if(TR.targetType=="button"){
			TR.target.interrupt(); //Remove the highlight without triggering the action.
		}
		else if(TR.targetType=="scrollBox"){

		}
		else if(TR.targetType=="tabSpace"){
			TabManager.endScroll();
		}
	}
};
/* @fix Write documentation. */
TouchReceiver.touchLong=function(){
	var TR = TouchReceiver;
	TR.stopLongTouchTimer();
	if(TR.touchDown && !TR.zooming){
		if(TR.targetType=="slot"){
			TR.target=TR.target.parent; //Now the user is holding a block.
			if(TR.target.stack.isDisplayStack){
				TR.targetType="displayStack";
			}
			else{
				TR.targetType="block";
			}
		}
		if(TR.targetType=="displayStack"){
			if(!TR.blocksMoving&&(TR.target.blockTypeName=="B_Variable"||TR.target.blockTypeName=="B_List")){
				TR.longTouch=true;
				new BlockContextMenu(TR.target,TR.startX,TR.startY);
			}
		}
		if(TR.targetType=="block"){
			if(!TR.blocksMoving){
				TR.longTouch=true;
				new BlockContextMenu(TR.target,TR.startX,TR.startY);
			}
		}
	}
};
TouchReceiver.setLongTouchTimer=function() {
	var TR = TouchReceiver;
	TR.stopLongTouchTimer();
	TR.longTouchTimer = self.setInterval(function () {
		TouchReceiver.touchLong();
	}, TR.longTouchInterval);
	TR.timerRunning=true;
};
TouchReceiver.stopLongTouchTimer=function(){
	var TR = TouchReceiver;
	if(TR.timerRunning){
		TR.longTouchTimer = window.clearInterval(this.longTouchTimer);
		TR.timerRunning=false;
	}
};
/* Adds handlerDown listeners to the parts of a CategoryBN.
 * @param {SVG element} element - The part of the CategoryBN the listeners are being applied to.
 * @param {Category} category - The category of the CategoryBN.
 * @fix maybe rename this function.
 */
TouchReceiver.addListenersCat=function(element,category){
	var TR=TouchReceiver;
	element.category=category; //Teaches the SVG element to know what Category it belongs to.
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver its Category.
		TouchReceiver.touchStartCatBN(this.category,e);
	}, false);
};
/* Adds handlerDown listeners to the parts of a Block.
 * @param {SVG element} element - The part of the Block the listeners are being applied to.
 * @param {Block} parent - The Block the SVG element belongs to.
 * @fix maybe rename this function
 * @fix maybe use this.block rather than this.parent.
 */
TouchReceiver.addListenersChild=function(element,parent){
	var TR=TouchReceiver;
	element.parent=parent; //Teaches the SVG element to know what Block it belongs to.
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver its Block.
		TouchReceiver.touchStartBlock(this.parent,e);
	}, false);
};
/* Adds handlerDown listeners to the parts of a Slot.
 * @param {SVG element} element - The part of the Slot the listeners are being applied to.
 * @param {Slot} slot - The Slot the SVG element belongs to.
 */
TouchReceiver.addListenersSlot=function(element,slot){
	var TR=TouchReceiver;
	element.slotRef=slot; //Teaches the SVG element to know what Slot it belongs to.
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver its Slot.
		TouchReceiver.touchStartSlot(this.slotRef,e);
	}, false);
};
/* Adds handlerDown listeners to the parts of a Button.
 * @param {SVG element} element - The part of the Button the listeners are being applied to.
 * @param {Button} parent - The Button the SVG element belongs to.
 * @fix maybe use this.button rather than this.parent.
 */
TouchReceiver.addListenersBN=function(element,parent){
	var TR=TouchReceiver;
	element.parent=parent; //Teaches the SVG element to know what Button it belongs to.
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver its Button.
		TouchReceiver.touchStartBN(this.parent,e);
	}, false);
};
/* Adds handlerDown listeners to the background of the Palette. Used for scrolling.
 */
TouchReceiver.addListenersScrollBox=function(element, parent){
	var TR=TouchReceiver;
	element.parent = parent;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver.
		TouchReceiver.touchStartScrollBox(this.parent, e);
	}, false);
};
/* Adds handlerDown listeners to the background space in the Tab where blocks go. Used for scrolling.
 */
TouchReceiver.addListenersTabSpace=function(element){
	var TR=TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TabManager.
		TouchReceiver.touchStartTabSpace(e);
	}, false);
};
/* Adds handlerDown listeners to the parts of the displayBox.
 * @param {SVG element} element - The part of the displayBox the listeners are being applied to.
 */
TouchReceiver.addListenersDisplayBox=function(element){
	var TR=TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver.
		TouchReceiver.touchStartDisplayBox(e);
	}, false);
};
/* Adds handlerDown listeners to the parts of any overlay that do not already have handlers.
 * @param {SVG element} element - The part the listeners are being applied to.
 */
TouchReceiver.addListenersOverlayPart=function(element){
	var TR=TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		TouchReceiver.touchStartOverlayPart(e);
	}, false);
};
TouchReceiver.addListenersMenuBnListScrollRect=function(element,parent){
	var TR=TouchReceiver;
	element.parent=parent;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		TouchReceiver.touchStartMenuBnListScrollRect(this.parent,e);
	}, false);
};
TouchReceiver.addListenersSmoothMenuBnListScrollRect=function(element,parent){
	var TR=TouchReceiver;
	element.parent=parent;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		TouchReceiver.touchStartSmoothMenuBnList(this.parent,e);
	}, false);
};
TouchReceiver.addEventListenerSafe=function(element,type, func){
	element.addEventListener(type, DebugOptions.safeFunc(func), false);
};
TouchReceiver.createScrollFixTimer = function(div, statusObj){
	if(!GuiElements.isIos && statusObj == null) return;
	var mem = {};
	mem.lastY = null;
	mem.lastX = null;
	var fixScroll = function() {
		var stillY = mem.lastY == null || mem.lastY == div.scrollTop;
		var stillX = mem.lastX == null || mem.lastX == div.scrollLeft;
		var still = stillX && stillY;

		statusObj.still = still;
		if(!GuiElements.isIos) return;

		mem.lastY = div.scrollTop;
		mem.lastX = div.scrollLeft;

		var height = parseInt(window.getComputedStyle(div).getPropertyValue('height'), 10);
		if(TouchReceiver.touchDown || !still) return;
		if (div.scrollTop <= 0) {
			div.scrollTop = 1;
		}
		else if (div.scrollHeight - height - 1 <= div.scrollTop) {
			div.scrollTop = div.scrollHeight - height - 2;
		}
	};
	TouchReceiver.setInitialScrollFix(div);
	return self.setInterval(fixScroll, TouchReceiver.fixScrollingInterval);
};
TouchReceiver.setInitialScrollFix = function(div) {
	if (div.scrollTop <= 0) {
		div.scrollTop = 1;
	}
};
function TitleBar(){
	TitleBar.createBar();
	TitleBar.makeButtons();
	TitleBar.makeTitleText();
}
TitleBar.setGraphics=function(){
	var TB=TitleBar;
	TB.height=54;
	TB.buttonMargin=Button.defaultMargin;
	TB.buttonW=64;
	TB.longButtonW=85;
	TB.bnIconMargin=3;
	TB.bg=Colors.black;
	TB.flagFill="#0f0";
	TB.stopFill="#f00";
	TB.titleColor=Colors.white;
	TB.font="Arial";
	TB.fontWeight="Bold";
	TB.fontSize=16;
	TB.fontCharHeight=12;
	
	TB.buttonH=TB.height-2*TB.buttonMargin;
	TB.bnIconH=TB.buttonH-2*TB.bnIconMargin;
};
TitleBar.createBar=function(){
	var TB=TitleBar;
	TB.stopBnX=GuiElements.width-TB.buttonW-TB.buttonMargin;
	TB.flagBnX=TB.stopBnX-TB.buttonW-2*TB.buttonMargin;

	TB.fileBnX=TB.buttonMargin;
	TB.viewBnX=TB.fileBnX+TB.buttonMargin+TB.buttonW;

	TB.hummingbirdBnX=BlockPalette.width-TB.buttonMargin-TB.buttonW;
	TB.statusX=TB.hummingbirdBnX-TB.buttonMargin-DeviceStatusLight.radius*2;
	TB.debugX=TB.flagBnX-TB.longButtonW-2*TB.buttonMargin;

	TB.width=GuiElements.width;
	TB.bgRect=GuiElements.draw.rect(0,0,TB.width,TB.height,TB.bg);
	GuiElements.layers.titleBg.appendChild(TB.bgRect);
};
TitleBar.makeButtons=function(){
	var TB=TitleBar;
	var TBLayer=GuiElements.layers.titlebar;
	TB.flagBn=new Button(TB.flagBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.flagBn.addColorIcon(VectorPaths.flag,TB.bnIconH,TB.flagFill);
	TB.flagBn.setCallbackFunction(CodeManager.eventFlagClicked,false);
	TB.stopBn=new Button(TB.stopBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.stopBn.addColorIcon(VectorPaths.stop,TB.bnIconH,TB.stopFill);
	TB.stopBn.setCallbackFunction(CodeManager.stop,false);

	TB.deviceStatusLight=new DeviceStatusLight(TB.statusX,TB.height/2,TBLayer);
	TB.hummingbirdBn=new Button(TB.hummingbirdBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.hummingbirdBn.addImage(ImageLists.hBIcon,TB.bnIconH);
	TB.hummingbirdMenu=new DeviceMenu(TB.hummingbirdBn);

	TB.fileBn=new Button(TB.fileBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.fileBn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.fileMenu=new FileMenu(TB.fileBn);
	TB.viewBn=new Button(TB.viewBnX,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.viewBn.addIcon(VectorPaths.view,TB.bnIconH);
	TB.viewMenu=new ViewMenu(TB.viewBn);
	TB.debugBn=null;
	/*
	TB.test1Bn=new Button(TB.flagBnX-TB.buttonW-2*TB.buttonMargin,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.test1Bn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.test1Bn.setCallbackFunction(SaveManager.reloadTest,true);
	TB.test2Bn=new Button(TB.flagBnX-2*TB.buttonW-4*TB.buttonMargin,TB.buttonMargin,TB.buttonW,TB.buttonH,TBLayer);
	TB.test2Bn.addIcon(VectorPaths.file,TB.bnIconH);
	TB.test2Bn.setCallbackFunction(SaveManager.listTest,true);
	*/
};
TitleBar.makeTitleText=function(){
	var TB=TitleBar;
	TB.titleLabel=GuiElements.draw.text(0,0,"",TB.fontSize,TB.titleColor,TB.font,TB.fontWeight);
	GuiElements.layers.titlebar.appendChild(TB.titleLabel);
};
TitleBar.setText=function(text){
	var TB=TitleBar;
	GuiElements.update.text(TB.titleLabel,text);
	var width=GuiElements.measure.textWidth(TB.titleLabel);
	var x=GuiElements.width/2-width/2;
	var y=TB.height/2+TB.fontCharHeight/2;
	GuiElements.move.text(TB.titleLabel,x,y);
};
TitleBar.enableDebug=function(){
	var TB=TitleBar;
	var TBLayer=GuiElements.layers.titlebar;
	if(TB.debugBn==null) {
		TB.debugBn = new Button(TB.debugX, TB.buttonMargin, TB.longButtonW, TB.buttonH, TBLayer);
		TB.debugBn.addText("Debug");
		TB.debugMenu = new DebugMenu(TB.debugBn);
	}
};
TitleBar.hideDebug = function(){
	TitleBar.debugBn.remove();
	TitleBar.debugBn = null;
};
TitleBar.updateZoom=function(){
	var TB=TitleBar;
	TB.width=GuiElements.width;
	GuiElements.update.rect(TB.bgRect, 0, 0, TB.width, TB.height);
	TB.stopBnX=GuiElements.width-TB.buttonW-TB.buttonMargin;
	TB.flagBnX=TB.stopBnX-TB.buttonW-2*TB.buttonMargin;
	TB.debugX=TB.flagBnX-TB.longButtonW-2*TB.buttonMargin;
	TB.stopBn.move(TB.stopBnX,TB.buttonMargin);
	TB.flagBn.move(TB.flagBnX,TB.buttonMargin);
	TB.viewMenu.updateZoom();
	if(TB.debugBn!=null) {
		TB.debugBn.move(TB.debugX, TB.buttonMargin);
		TB.debugMenu.move();
	}
	var width=GuiElements.measure.textWidth(TB.titleLabel);
	var x=GuiElements.width/2-width/2;
	var y=TB.height/2+TB.fontCharHeight/2;
	GuiElements.move.text(TB.titleLabel,x,y);
};


function BlockPalette(){
	BlockPalette.categories=new Array();
	BlockPalette.selectedCat=null;
	BlockPalette.createCatBg();
	BlockPalette.createPalBg();
	BlockPalette.createScrollSvg();
	BlockPalette.createCategories();
	BlockPalette.selectFirstCat();
	BlockPalette.scrolling=false;
}
BlockPalette.setGraphics=function(){
	BlockPalette.mainVMargin=10;
	BlockPalette.mainHMargin=Button.defaultMargin;
	BlockPalette.blockMargin=5;
	BlockPalette.sectionMargin=10;
	BlockPalette.insideBnH = 38; // Dimensions for buttons within a category
	BlockPalette.insideBnW = 150;

	BlockPalette.width=253;
	BlockPalette.catVMargin=Button.defaultMargin;
	BlockPalette.catHMargin=Button.defaultMargin;
	BlockPalette.catH=30*3 + BlockPalette.catVMargin*4; //132
	BlockPalette.height=GuiElements.height-TitleBar.height-BlockPalette.catH;
	BlockPalette.catY=TitleBar.height;
	BlockPalette.y=BlockPalette.catY+BlockPalette.catH;
	BlockPalette.bg=Colors.black;
	BlockPalette.catBg=Colors.darkGray;

	BlockPalette.bnDefaultFont="Arial";
	BlockPalette.bnDefaultFontSize=16;
	BlockPalette.bnDefaultFontCharHeight=12;

	BlockPalette.labelFont="Arial";
	BlockPalette.labelFontSize=13;
	BlockPalette.labelFontCharHeight=12;
	BlockPalette.labelColor=Colors.white;

	BlockPalette.trash = null;
	BlockPalette.trashOpacity = 0.8;
	BlockPalette.trashHeight = 120;
	BlockPalette.trashColor = Colors.white;
};
BlockPalette.updateZoom=function(){
	var BP=BlockPalette;
	BlockPalette.height=GuiElements.height-TitleBar.height-BlockPalette.catH;
	GuiElements.update.rect(BP.palRect,0,BP.y,BP.width,BP.height);
	var clipRect=BP.clippingPath.childNodes[0];
	GuiElements.update.rect(clipRect,0,BP.y,BP.width,BP.height);
	for(let i = 0; i < BlockPalette.categories.length; i++){
		BlockPalette.categories[i].updateZoom();
	}
};
BlockPalette.createCatBg=function(){
	var BP=BlockPalette;
	BP.catRect=GuiElements.draw.rect(0,BP.catY,BP.width,BP.catH,BP.catBg);
	GuiElements.layers.catBg.appendChild(BP.catRect);
	GuiElements.move.group(GuiElements.layers.categories,0,TitleBar.height);
}
BlockPalette.createPalBg=function(){
	var BP=BlockPalette;
	BP.palRect=GuiElements.draw.rect(0,BP.y,BP.width,BP.height,BP.bg);
	GuiElements.layers.paletteBG.appendChild(BP.palRect);
	//TouchReceiver.addListenersPalette(BP.palRect);
	BP.clippingPath=GuiElements.clip(0,BP.y,BP.width,BP.height,GuiElements.layers.palette);
};
BlockPalette.createScrollSvg = function(){
	BlockPalette.catScrollSvg = GuiElements.create.svg(GuiElements.layers.categoriesScroll);
};
BlockPalette.createCategories=function(){
	var catCount=BlockList.catCount();
	var firstColumn=true;
	var numberOfRows=Math.ceil(catCount/2);
	var col1X=BlockPalette.catHMargin;
	var col2X=BlockPalette.catHMargin+CategoryBN.hMargin+CategoryBN.width;
	var currentY=BlockPalette.catVMargin;
	var currentX=col1X;
	var usedRows=0;
	for(var i=0;i<catCount;i++){
		if(firstColumn&&usedRows>=numberOfRows){
			currentX=col2X;
			firstColumn=false;
			currentY=BlockPalette.catVMargin;
		}
		var currentCat=new Category(currentX,currentY,i);
		BlockPalette.categories.push(currentCat);
		usedRows++;
		currentY+=CategoryBN.height+CategoryBN.vMargin;
	}
	
}
BlockPalette.getCategory=function(id){
	var i=0;
	while(BlockPalette.categories[i].id!=id){
		i++;
	}
	return BlockPalette.categories[i];
}
BlockPalette.selectFirstCat=function(){
	BlockPalette.categories[0].select();
}
/*BlockPalette.getAbsX=function(){
	return 0;
}
BlockPalette.getAbsY=function(){
	return TitleBar.height+BlockPalette.catH;
}*/
BlockPalette.IsStackOverPalette=function(x,y){
	return CodeManager.move.pInRange(x,y,0,BlockPalette.catY,BlockPalette.width,GuiElements.height-TitleBar.height);
}
BlockPalette.ShowTrash=function() {
	let BP = BlockPalette;
	if (!BP.trash) {
		BP.trash = GuiElements.create.group(0,0);
		let trashBg = GuiElements.draw.rect(0, BP.y, BP.width, BP.height, BP.bg);
		GuiElements.update.opacity(trashBg, BP.trashOpacity);
		BP.trash.appendChild(trashBg);

		let trashWidth = VectorIcon.computeWidth(VectorPaths.trash, BP.trashHeight);
		let imgX = BP.width/2 - trashWidth/2;  // Center X
		let imgY = BP.y + BP.height/2 - BP.trashHeight/2;  // Center Y
		let trashIcon = new VectorIcon(imgX, imgY, VectorPaths.trash, BP.trashColor, BP.trashHeight, BP.trash);

		// Add to group
		GuiElements.layers.trash.appendChild(BP.trash);
	}
};
BlockPalette.HideTrash=function() {
	let BP = BlockPalette;
	if (BP.trash) {
		GuiElements.layers.trash.removeChild(BP.trash);
		BP.trash = null;
	}
};
BlockPalette.startScroll=function(x,y){
	var BP=BlockPalette;
	if(!BP.scrolling){
		BP.scrolling=true;
		BP.selectedCat.startScroll(x,y);
	}
};
BlockPalette.updateScroll=function (x,y){
	var BP=BlockPalette;
	if(BP.scrolling){
		BP.selectedCat.updateScroll(x,y);
	}
};
BlockPalette.endScroll=function(){
	var BP=BlockPalette;
	if(BP.scrolling){
		BP.scrolling=false;
		BP.selectedCat.endScroll();
	}
};
BlockPalette.showDeviceDropDowns=function(deviceClass){
	for(var i=0;i<BlockPalette.categories.length;i++){
		BlockPalette.categories[i].showDeviceDropDowns(deviceClass);
	}
};
BlockPalette.hideDeviceDropDowns=function(deviceClass){
	for(var i=0;i<BlockPalette.categories.length;i++){
		BlockPalette.categories[i].hideDeviceDropDowns(deviceClass);
	}
};
function DisplayStack(firstBlock,group,category){
	//this.index=CodeManager.addStack(this); //Universal codeManager needed
	this.firstBlock=firstBlock;
	this.type=firstBlock.type;
	this.x=firstBlock.getAbsX();
	this.y=firstBlock.getAbsY();
	this.group=GuiElements.create.group(this.x,this.y,group);
	this.category=category;
	this.firstBlock.changeStack(this);
	this.dim=function(){};
	this.dim.cw; //Dimensions of regions command blocks can be attached to.
	this.dim.ch;
	this.dim.rw; //Dimensions of regions reporter/predicate blocks can be attached to.
	this.dim.rh;
	this.updateDim();
	this.isRunning=false;
	this.currentBlock=null;
	this.isDisplayStack=true;
	this.move(this.x,this.y);
}
DisplayStack.prototype.updateDim=function() {
	this.dim.cAssigned=false;
	this.dim.rAssigned=false;
	this.firstBlock.updateDim();
	this.firstBlock.updateAlign(0,0);
	this.dim.cx1=this.firstBlock.x;
	this.dim.cy1=this.firstBlock.y;
	this.dim.cx2=this.dim.cx1;
	this.dim.cy2=this.dim.cy1;
	this.dim.rx1=0;
	this.dim.ry1=0;
	this.dim.rx2=0;
	this.dim.ry2=0;
	this.firstBlock.updateStackDim();
	
	this.dim.cw=this.dim.cx2-this.dim.cx1;
	this.dim.ch=this.dim.cy2-this.dim.cy1;
	this.dim.rw=this.dim.rx2-this.dim.rx1;
	this.dim.rh=this.dim.ry2-this.dim.ry1;
	
	this.dim.cx1+=this.getAbsX();
	this.dim.cy1+=this.getAbsY();
	this.dim.rx1+=this.getAbsX();
	this.dim.ry1+=this.getAbsY();

	this.category.updateWidth();
}
DisplayStack.prototype.relToAbsX=function(x){
	return this.category.relToAbsX(x+this.x);
};
DisplayStack.prototype.relToAbsY=function(y){
	return this.category.relToAbsY(y+this.y);
};
DisplayStack.prototype.absToRelX=function(x){
	return this.category.absToRelX(x)-this.x;
};
DisplayStack.prototype.absToRelY=function(y){
	return this.category.absToRelY(y)-this.y;
};
DisplayStack.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
DisplayStack.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
//DisplayStack.prototype.findBestFit=function()
DisplayStack.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y);
}
DisplayStack.prototype.stop=function(){
	this.firstBlock.stop();
	this.endRun();
}
DisplayStack.prototype.updateRun=function(){
	if(this.type==0){
		this.currentBlock=this.currentBlock.run();
		if(this.currentBlock==null){
			this.endRun();
		}
	}
	else{
		if(this.currentBlock.run()==2){
			GuiElements.displayValue(this.currentBlock.rVal);
			this.endRun();
		}
	}
}
DisplayStack.prototype.startRun=function(){
	this.isRunning=true;
	this.currentBlock=this.firstBlock;
}
DisplayStack.prototype.endRun=function(){
	this.isRunning=false;
}
DisplayStack.prototype.duplicate=function(x,y){
	var tab=TabManager.activeTab;
	var firstCopyBlock=this.firstBlock.duplicate(x,y);
	var copyStack=new BlockStack(firstCopyBlock,tab);
	return copyStack;
};
//DisplayStack.prototype.findBestFitTop=function()
//DisplayStack.prototype.snap=function(block)
//DisplayStack.prototype.highlight=function()
//DisplayStack.prototype.shiftOver=function(x,y)
DisplayStack.prototype.getSprite=function(){
	if(TabManager.activeTab!=null){
		return TabManager.activeTab.getSprite();
	}
	else{
		return null;
	}
}
DisplayStack.prototype.delete=function(){
	this.group.remove();
};
DisplayStack.prototype.hideDeviceDropDowns=function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
	this.updateDim();
};
DisplayStack.prototype.showDeviceDropDowns=function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
	this.updateDim();
};
DisplayStack.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	this.firstBlock[functionName].apply(this.firstBlock,args);
};
function CategoryBN(x,y,category){
	this.x=x;
	this.y=y;
	this.category=category;
	this.loadCatData();
	this.buildGraphics();
}
CategoryBN.setGraphics=function(){
	var BP=BlockPalette;
	CategoryBN.bg=Colors.black;
	CategoryBN.fontSize=15;
	CategoryBN.font="Arial";
	CategoryBN.forground="#fff";
	CategoryBN.height=30;
	CategoryBN.colorW=8;
	CategoryBN.labelLMargin=6;
	CategoryBN.charHeight=10;
	
	CategoryBN.hMargin=BP.catHMargin;
	CategoryBN.width=(BP.width-2*BP.catHMargin-CategoryBN.hMargin)/2;
	var numberOfRows=Math.ceil(BlockList.catCount()/2);
	CategoryBN.vMargin=(BP.catH-2*BP.catVMargin-numberOfRows*CategoryBN.height)/(numberOfRows-1);
	CategoryBN.labelX=CategoryBN.colorW+CategoryBN.labelLMargin;
	CategoryBN.labelY=(CategoryBN.height+CategoryBN.charHeight)/2;
}
CategoryBN.prototype.loadCatData=function(){
	this.text=this.category.name;
	this.catId=this.category.id;
	this.fill=Colors.getGradient(this.catId);
}

CategoryBN.prototype.buildGraphics=function(){
	var CBN=CategoryBN;
	this.group=GuiElements.create.group(this.x,this.y,GuiElements.layers.categories);
	this.bgRect=GuiElements.draw.rect(0,0,CBN.width,CBN.height,CBN.bg);
	this.colorRect=GuiElements.draw.rect(0,0,CBN.colorW,CBN.height,this.fill);
	this.label=GuiElements.draw.text(CBN.labelX,CBN.labelY,this.text,CBN.fontSize,CBN.forground,CBN.font);
	this.group.appendChild(this.bgRect);
	this.group.appendChild(this.colorRect);
	this.group.appendChild(this.label);
	GuiElements.layers.categories.appendChild(this.group);
	this.addListeners();
}
CategoryBN.prototype.select=function(){
	this.bgRect.setAttributeNS(null,"fill",this.fill);
}
CategoryBN.prototype.deselect=function(){
	this.bgRect.setAttributeNS(null,"fill",CategoryBN.bg);
}
CategoryBN.prototype.addListeners=function(){
	var TR=TouchReceiver;
	var cat=this.category;
	TouchReceiver.addListenersCat(this.bgRect,cat);
	TouchReceiver.addListenersCat(this.colorRect,cat);
	TouchReceiver.addListenersCat(this.label,cat);
}

/* outline
tell blockpalette to select cat
cat index
highlight
register touch event



*/
function Category(buttonX,buttonY,index){
	this.index=index;
	this.buttonX=buttonX;
	this.buttonY=buttonY;
	this.x=0;
	this.y=TitleBar.height+BlockPalette.catH;
	/* this.maxX=this.x;
	this.maxY=this.y; */
	this.group = GuiElements.create.group(0,0);
	this.smoothScrollBox = new SmoothScrollBox(this.group, GuiElements.layers.paletteScroll, 0, BlockPalette.y,
		BlockPalette.width, BlockPalette.height, 0, 0);
	/*
	TouchReceiver.createScrollFixTimer(this.scrollDiv);
	this.contentSvg = GuiElements.create.svg(this.scrollDiv);
	this.contentGroup = GuiElements.create.group(0,BlockPalette.y, this.contentSvg);
	*/
	this.id=BlockList.getCatId(index);
	this.name=BlockList.getCatName(index);
	this.currentBlockX=BlockPalette.mainHMargin;
	this.currentBlockY=BlockPalette.mainVMargin;
	this.lastHadStud=false;
	this.button=this.createButton();
	this.blocks=new Array();
	this.displayStacks=new Array();
	this.buttons=new Array();
	this.labels=new Array();
	this.finalized = false;
	this.fillGroup();
	this.scrolling=false;
	this.scrollXOffset=0;
	this.scrollYOffset=0;
}
Category.prototype.createButton=function(){
	return new CategoryBN(this.buttonX,this.buttonY,this);
}
Category.prototype.createDiv=function(){
	return GuiElements.create.scrollDiv();
}
Category.prototype.fillGroup=function(){
	BlockList["populateCat_"+this.id](this);
}
Category.prototype.clearGroup=function(){
	for(var i=0;i<this.displayStacks.length;i++){
		this.displayStacks[i].delete();
	}
	this.blocks=new Array();
	this.displayStacks=new Array();
	for(var i=0;i<this.buttons.length;i++){
		this.buttons[i].remove();
	}
	this.buttons=new Array();
	for(var i=0;i<this.labels.length;i++){
		this.group.removeChild(this.labels[i]);
	}
	this.labels=new Array();
	this.currentBlockX=BlockPalette.mainHMargin;
	this.currentBlockY=BlockPalette.mainVMargin;
	this.lastHadStud=false;
};
Category.prototype.refreshGroup=function(){
	this.clearGroup();
	this.fillGroup();
};
Category.prototype.addBlockByName=function(blockName){
	var block=new window[blockName](this.currentBlockX,this.currentBlockY);
	this.addBlock(block);
};
Category.prototype.addVariableBlock=function(variable){
	var block=new B_Variable(this.currentBlockX,this.currentBlockY,variable);
	this.addBlock(block);
};
Category.prototype.addListBlock=function(list){
	var block=new B_List(this.currentBlockX,this.currentBlockY,list);
	this.addBlock(block);
};
Category.prototype.addBlock=function(block){
	this.blocks.push(block);
	if(this.lastHadStud&&!block.topOpen){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
		block.move(this.currentBlockX,this.currentBlockY);
	}
	if(block.hasHat){
		this.currentBlockY+=BlockGraphics.hat.hatHEstimate;
		block.move(this.currentBlockX,this.currentBlockY);
	}
	var displayStack=new DisplayStack(block,this.group,this);
	this.displayStacks.push(displayStack);
	var height=displayStack.firstBlock.height;
	this.currentBlockY+=height;
	this.currentBlockY+=BlockPalette.blockMargin;
	this.lastHadStud=false;
	if(block.bottomOpen){
		this.lastHadStud=true;
	}
}

Category.prototype.addSpace=function(){
	this.currentBlockY+=BlockPalette.sectionMargin;
}
Category.prototype.addButton=function(text,callback){
	var width = BlockPalette.insideBnW;
	var height = BlockPalette.insideBnH;
	if(this.lastHadStud){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
	}
	var button=new Button(this.currentBlockX,this.currentBlockY,width,height,this.group);
	var BP=BlockPalette;
	button.addText(text,BP.bnDefaultFont,BP.bnDefaultFontSize,"normal",BP.bnDefaultFontCharHeight);
	button.setCallbackFunction(callback,true);
	this.currentBlockY+=height;
	this.currentBlockY+=BlockPalette.blockMargin;
	this.buttons.push(button);
	this.lastHadStud=false;
};
Category.prototype.addLabel=function(text){
	var BP=BlockPalette;
	var x=this.currentBlockX;
	var y=this.currentBlockY;
	var labelE = GuiElements.draw.text(x,y,text,BP.labelFontSize,BP.labelColor,BP.labelFont);
	this.group.appendChild(labelE);
	this.labels.push(labelE);
	var height=GuiElements.measure.textHeight(labelE);
	GuiElements.move.element(labelE,x,y+height);
	this.currentBlockY+=height;
	this.currentBlockY+=BlockPalette.blockMargin;
	this.lastHadStud=false;
};
Category.prototype.trimBottom=function(){
	if(this.lastHadStud){
		this.currentBlockY+=BlockGraphics.command.bumpDepth;
	}
	this.currentBlockY-=BlockPalette.blockMargin;
	this.currentBlockY+=BlockPalette.mainVMargin;
};
Category.prototype.finalize = function(){
	this.finalized = true;
	this.height=this.currentBlockY;
	this.updateWidth();
	//this.updateSmoothScrollSet();
};

Category.prototype.select=function(){
	if(BlockPalette.selectedCat==this){
		return;
	}
	if(BlockPalette.selectedCat!=null){
		BlockPalette.selectedCat.deselect();
	}
	BlockPalette.selectedCat=this;
	this.button.select();
	this.smoothScrollBox.show();
}
Category.prototype.deselect=function(){
	BlockPalette.selectedCat=null;
	this.smoothScrollBox.hide();
	this.button.deselect();
}
Category.prototype.computeWidth = function(){
	var currentWidth=0;
	for(var i=0;i<this.blocks.length;i++){
		var blockW=this.blocks[i].width;
		if(blockW>currentWidth){
			currentWidth=blockW;
		}
	}
	this.width=Math.max(currentWidth+2*BlockPalette.mainHMargin, BlockPalette.width);
};
Category.prototype.updateWidth=function(){
	if(!this.finalized) return;
	this.computeWidth();
	this.smoothScrollBox.setContentDims(this.width, this.height);
};
Category.prototype.relToAbsX=function(x){
	if(!this.finalized) return x;
	return this.smoothScrollBox.relToAbsX(x);
};
Category.prototype.relToAbsY=function(y){
	if(!this.finalized) return y;
	return this.smoothScrollBox.relToAbsY(y);
};
Category.prototype.absToRelX=function(x){
	if(!this.finalized) return x;
	return this.smoothScrollBox.absToRelX(x);
};
Category.prototype.absToRelY=function(y){
	if(!this.finalized) return y;
	return this.smoothScrollBox.absToRelY(y);
};
Category.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
Category.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
Category.prototype.showDeviceDropDowns=function(deviceClass){
	for(var i=0;i<this.displayStacks.length;i++){
		this.displayStacks[i].showDeviceDropDowns(deviceClass);
	}
};
Category.prototype.hideDeviceDropDowns=function(deviceClass){
	for(var i=0;i<this.displayStacks.length;i++){
		this.displayStacks[i].hideDeviceDropDowns(deviceClass);
	}
};
Category.prototype.updateZoom = function(){
	if(!this.finalized) return;
	this.smoothScrollBox.updateZoom();
	this.smoothScrollBox.setDims(BlockPalette.width, BlockPalette.height);
};
function Button(x,y,width,height,parent){
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.parentGroup = parent;
	this.group=GuiElements.create.group(x,y,parent);
	this.buildBg();
	this.pressed=false;
	this.enabled=true;
	this.hasText=false;
	this.hasIcon=false;
	this.hasImage=false;
	this.foregroundInverts=false;
	this.callback=null;
	this.delayedCallback=null;
	this.toggles=false;
	this.toggleFunction=null;
	this.toggled=false;
	this.isOverlayPart=false;
	this.scrollable = false;
}
Button.setGraphics=function(){
	Button.bg=Colors.darkGray;
	Button.foreground=Colors.white;
	Button.highlightBg=Colors.white;
	Button.highlightFore=Colors.darkGray;
	Button.disabledBg=Colors.darkGray;
	Button.disabledFore=Colors.black;

	Button.defaultMargin = 5;

	Button.defaultFontSize=16;
	Button.defaultFont="Arial";
	Button.defaultFontWeight="normal";
	Button.defaultCharHeight=12;
};
Button.prototype.buildBg=function(){
	this.bgRect=GuiElements.draw.rect(0,0,this.width,this.height,Button.bg);
	this.group.appendChild(this.bgRect);
	TouchReceiver.addListenersBN(this.bgRect,this);
}
Button.prototype.addText=function(text,font,size,weight,height){
	if(font==null){
		font=Button.defaultFont;
	}
	if(size==null){
		size=Button.defaultFontSize;
	}
	if(weight==null){
		weight=Button.defaultFontWeight;
	}
	if(height==null){
		height=Button.defaultCharHeight;
	}
	this.foregroundInverts = true;
	
	this.textE=GuiElements.draw.text(0,0,"",size,Button.foreground,font,weight);
	GuiElements.update.textLimitWidth(this.textE,text,this.width);
	this.group.appendChild(this.textE);
	var textW=GuiElements.measure.textWidth(this.textE);
	var textX=(this.width-textW)/2;
	var textY=(this.height+height)/2;
	GuiElements.move.text(this.textE,textX,textY);
	this.hasText=true;
	TouchReceiver.addListenersBN(this.textE,this);
}
Button.prototype.addIcon=function(pathId,height){
	if(this.hasIcon){
		this.icon.remove();
	}
	if(this.hasImage){
		this.imageE.remove();
	}
	this.hasIcon=true;
	this.foregroundInverts=true;
	var iconW=VectorIcon.computeWidth(pathId,height);
	var iconX=(this.width-iconW)/2;
	var iconY=(this.height-height)/2;
	this.icon=new VectorIcon(iconX,iconY,pathId,Button.foreground,height,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
};
Button.prototype.addCenteredTextAndIcon = function(pathId, iconHeight, sideMargin, text, font, size, weight, charH, color){
	if(color == null){
		color = Button.foreground;
		this.foregroundInverts = true;
	}
	if(font==null){
		font=Button.defaultFont;
	}
	if(size==null){
		size=Button.defaultFontSize;
	}
	if(weight==null){
		weight=Button.defaultFontWeight;
	}
	if(charH==null){
		charH=Button.defaultCharHeight;
	}
	this.hasIcon = true;
	this.hasText = true;
	
	var iconW=VectorIcon.computeWidth(pathId,iconHeight);
	this.textE=GuiElements.draw.text(0,0,"",size,color,font,weight);
	GuiElements.update.textLimitWidth(this.textE,text,this.width - iconW - sideMargin);
	this.group.appendChild(this.textE);
	var textW=GuiElements.measure.textWidth(this.textE);
	var totalW = textW + iconW + sideMargin;
	var iconX = (this.width - totalW) / 2;
	var iconY = (this.height-iconHeight)/2;
	var textX = iconX + iconW + sideMargin;
	var textY = (this.height+charH)/2;
	GuiElements.move.text(this.textE,textX,textY);
	TouchReceiver.addListenersBN(this.textE,this);
	this.icon=new VectorIcon(iconX,iconY,pathId,color,iconHeight,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
};
Button.prototype.addSideTextAndIcon = function(pathId, iconHeight, text, font, size, weight, charH, color){
	if(color == null){
		color = Button.foreground;
		this.foregroundInverts = true;
	}
	if(font==null){
		font=Button.defaultFont;
	}
	if(size==null){
		size=Button.defaultFontSize;
	}
	if(weight==null){
		weight=Button.defaultFontWeight;
	}
	if(charH==null){
		charH=Button.defaultCharHeight;
	}
	this.hasIcon = true;
	this.hasText = true;

	var sideMargin = (this.height - iconHeight) / 2;
	var iconW=VectorIcon.computeWidth(pathId,iconHeight);
	this.textE=GuiElements.draw.text(0,0,"",size,color,font,weight);
	var textMaxW = this.width - iconW - sideMargin * 2;
	GuiElements.update.textLimitWidth(this.textE,text,textMaxW);
	this.group.appendChild(this.textE);
	var textW=GuiElements.measure.textWidth(this.textE);
	var iconX = sideMargin;
	var iconY = (this.height-iconHeight)/2;
	var textX = (this.width - textW) / 2;
	textX = Math.max(iconW + sideMargin * 2, textX);
	var textY = (this.height+charH)/2;
	GuiElements.move.text(this.textE,textX,textY);
	TouchReceiver.addListenersBN(this.textE,this);
	this.icon=new VectorIcon(iconX,iconY,pathId,color,iconHeight,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
};
Button.prototype.addImage=function(imageData,height){
	if(this.hasIcon){
		this.icon.remove();
	}
	if(this.hasImage){
		this.imageE.remove();
	}
	var imageW=imageData.width/imageData.height*height;
	var imageX=(this.width-imageW)/2;
	var imageY=(this.height-height)/2;
	this.imageE=GuiElements.draw.image(imageData.lightName,imageX,imageY,imageW,height,this.group);
	this.imageData=imageData;
	this.hasImage=true;
	TouchReceiver.addListenersBN(this.imageE,this);
};
Button.prototype.addColorIcon=function(pathId,height,color){
	if(this.hasIcon){
		this.icon.remove();
	}
	this.hasIcon=true;
	this.foregroundInverts=false;
	var iconW=VectorIcon.computeWidth(pathId,height);
	var iconX=(this.width-iconW)/2;
	var iconY=(this.height-height)/2;
	this.icon=new VectorIcon(iconX,iconY,pathId,color,height,this.group);
	TouchReceiver.addListenersBN(this.icon.pathE,this);
}
Button.prototype.setCallbackFunction=function(callback,delay){
	if(delay){
		this.delayedCallback=callback;
	}
	else{
		this.callback=callback;
	}
};
Button.prototype.setToggleFunction=function(callback){
	this.toggleFunction=callback;
	this.toggles=true;
};
Button.prototype.disable=function(){
	if(this.enabled){
		this.enabled=false;
		this.pressed=false;
		this.bgRect.setAttributeNS(null,"fill",Button.disabledBg);
		if(this.hasText&&this.foregroundInverts){
			this.textE.setAttributeNS(null,"fill",Button.disabledFore);
		}
		if(this.hasIcon&&this.foregroundInverts){
			this.icon.setColor(Button.disabledFore);
		}
	}
};
Button.prototype.enable=function(){
	if(!this.enabled){
		this.enabled=true;
		this.pressed=false;
		this.setColor(false);
	}
};
Button.prototype.press=function(){
	if(this.enabled&&!this.pressed){
		this.pressed=true;
		this.setColor(true);
		if(this.callback!=null){
			this.callback();
		}
	}
};
Button.prototype.release=function(){
	if(this.enabled&&this.pressed){
		this.pressed=false;
		if(!this.toggles||this.toggled) {
			this.setColor(false);
		}
		if(this.toggles&&this.toggled){
			this.toggled=false;
			this.toggleFunction();
		}
		else {
			if (this.delayedCallback != null) {
				this.delayedCallback();
			}
			if (this.toggles && !this.toggled) {
				this.toggled = true;
			}
		}
	}
};
/* Removes the Button's visual highlight without triggering any actions */
Button.prototype.interrupt=function(){
	if(this.enabled&&this.pressed&&!this.toggles){
		this.pressed=false;
		this.setColor(false);
	}
};
Button.prototype.unToggle=function(){
	if(this.enabled&&this.toggled){
		this.setColor(false);
	}
	this.toggled=false;
	this.pressed=false;
};
Button.prototype.remove=function(){
	this.group.remove();
};
Button.prototype.hide = function(){
	this.group.remove();
};
Button.prototype.show = function(){
	this.parentGroup.appendChild(this.group);
};
Button.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,this.x,this.y);
};
Button.prototype.setColor=function(isPressed){
	if(isPressed) {
		this.bgRect.setAttributeNS(null,"fill",Button.highlightBg);
		if(this.hasText&&this.foregroundInverts){
			this.textE.setAttributeNS(null,"fill",Button.highlightFore);
		}
		if(this.hasIcon&&this.foregroundInverts){
			this.icon.setColor(Button.highlightFore);
		}
		if(this.hasImage){
			GuiElements.update.image(this.imageE,this.imageData.darkName);
		}
	}
	else{
		this.bgRect.setAttributeNS(null, "fill", Button.bg);
		if (this.hasText && this.foregroundInverts) {
			this.textE.setAttributeNS(null, "fill", Button.foreground);
		}
		if (this.hasIcon && this.foregroundInverts) {
			this.icon.setColor(Button.foreground);
		}
		if(this.hasImage){
			GuiElements.update.image(this.imageE,this.imageData.lightName);
		}
	}
};
Button.prototype.makeScrollable = function(){
	this.scrollable = true;
};


function DeviceStatusLight(x,centerY,parent){
	var DSL=DeviceStatusLight;
	this.cx=x+DSL.radius;
	this.cy=centerY;
	this.parentGroup=parent;
	this.circleE=this.generateCircle();
	var thisStatusLight=this;
	if(true||!TouchReceiver.mouse) {
		this.updateTimer = self.setInterval(function () {
			thisStatusLight.updateStatus()
		}, DSL.updateInterval);
	}
	thisStatusLight.updateStatus();
}
DeviceStatusLight.setConstants=function(){
	var DSL=DeviceStatusLight;
	DSL.greenColor="#0f0";
	DSL.redColor="#f00";
	DSL.startColor=Colors.black;
	DSL.offColor=Colors.darkGray;
	DSL.radius=6;
	DSL.updateInterval=300;
};
DeviceStatusLight.prototype.generateCircle=function(){
	var DSL=DeviceStatusLight;
	return GuiElements.draw.circle(this.cx,this.cy,DSL.radius,DSL.startColor,this.parentGroup);
};
DeviceStatusLight.prototype.updateStatus=function(){
	let overallStatus = 2;
	Device.getTypeList().forEach(function(deviceClass){
		deviceClass.getManager().updateTotalStatus();
		overallStatus = Math.min(deviceClass.getManager().getTotalStatus(), overallStatus); // Lower status means more error
	});
	switch(overallStatus) {
		case 0:
			GuiElements.update.color(this.circleE,DeviceStatusLight.redColor);
			break;
		case 1:
			GuiElements.update.color(this.circleE,DeviceStatusLight.greenColor);
			break;
		case 2:
			GuiElements.update.color(this.circleE,DeviceStatusLight.offColor);
			break;
	}
};
DeviceStatusLight.prototype.remove=function(){
	this.circleE.remove();
	this.updateTimer=window.clearInterval(this.updateTimer);
};
function InputPad(){
	InputPad.buildPad();
}
InputPad.setGraphics=function(){
	InputPad.buttonW=50;
	InputPad.buttonH=40;
	InputPad.buttonMargin=Button.defaultMargin;
	/*InputPad.triangleW=15;
	InputPad.triangleH=7;*/
	InputPad.fontSize=34;
	InputPad.font="Arial";
	InputPad.fontWeight="bold";
	InputPad.bg=Colors.black;
	InputPad.charHeight=25;
	InputPad.plusMinusH=22;
	InputPad.bsBnH=25;
	InputPad.okBnH=InputPad.bsBnH;
	
	InputPad.BnAreaW=InputPad.buttonW*3+InputPad.buttonMargin*2;
	InputPad.BnAreaH=InputPad.buttonH*5+InputPad.buttonMargin*4;
	InputPad.width=InputPad.BnAreaW;
	InputPad.height=InputPad.BnAreaH;
	
	InputPad.longBnW=(InputPad.width-InputPad.buttonMargin)/2;
	InputPad.triOffset=(InputPad.width-InputPad.triangleW)/2;
	InputPad.halfOffset=InputPad.width/2;
	/*InputPad.tallH=InputPad.height+InputPad.triangleH;*/
	
	InputPad.usingNumberPad=false;
	InputPad.dataIsNumeric=false;
	InputPad.nonNumericData=null;
	InputPad.nonNumericText=null;
	InputPad.displayNum=null;
	InputPad.undoAvailable=false;
	InputPad.undoVisible=false;
	InputPad.undoData=function(){};
	InputPad.undoData.dataIsNumeric=false;
	InputPad.undoData.data=null;
	InputPad.undoData.text=null;
	InputPad.valueGrayed=true;
};
InputPad.buildPad=function(){
	var IP=InputPad;
	IP.group=GuiElements.create.group(0,0);
	IP.visible=false;
	/*IP.makeBg();*/
	IP.bubbleOverlay=new BubbleOverlay(IP.bg,IP.buttonMargin,IP.group,IP);
	IP.bnGroup=GuiElements.create.group(0,0);
	IP.makeBns();
	//IP.menuBnList=new MenuBnList(IP.group,0,0,IP.buttonMargin);
	IP.menuBnList=new SmoothMenuBnList(IP, IP.group,0,0);
	IP.menuBnList.isOverlayPart=true;
	IP.previewFn = null;
};
/*InputPad.makeBg=function(){
	var IP=InputPad;
	IP.bgGroup=GuiElements.create.group(0,0,IP.group);
	IP.bgRect=GuiElements.draw.rect(0,0,IP.width,IP.height,IP.bg);
	IP.triangle=GuiElements.draw.triangle(IP.triOffset,0,IP.triangleW,IP.triangleH,IP.bg);
	IP.bgGroup.appendChild(IP.bgRect);
	IP.bgGroup.appendChild(IP.triangle);
};*/
InputPad.resetPad=function(columns){//removes any options which may have been added to the pad
	var IP=InputPad;
	IP.close();
	if(columns == 1){
		IP.menuBnList = new SmoothMenuBnList(IP, IP.group, 0, 0);
	} else {
		IP.menuBnList = new MenuBnList(IP.group, 0, 0, IP.buttonMargin, null, columns);
	}
	IP.menuBnList.isOverlayPart=true;
	IP.previewFn = null;
};
InputPad.addOption=function(text,data){
	var dataFunction=function(){InputPad.menuBnSelected(text,data)};
	InputPad.menuBnList.addOption(text,dataFunction);
};
InputPad.numPressed=function(num){
	var IP=InputPad;
	IP.removeUndo();
	IP.deleteIfGray();
	IP.displayNum.addDigit(num+"");
	SaveManager.markEdited();
	IP.updateSlot();
	IP.dataIsNumeric=true;
};
InputPad.plusMinusPressed=function(){
	var IP=InputPad;
	IP.removeUndo();
	IP.deleteIfGray();
	IP.displayNum.switchSign();
	SaveManager.markEdited();
	IP.updateSlot();
};
InputPad.decimalPressed=function(){
	var IP=InputPad;
	IP.removeUndo();
	IP.deleteIfGray();
	IP.displayNum.addDecimalPoint();
	SaveManager.markEdited();
	IP.updateSlot();
};
InputPad.deleteIfGray=function(){
	var IP=InputPad;
	if(IP.valueGrayed){
		IP.showUndo();
		IP.dataIsNumeric=true;
		IP.displayNum=new DisplayNum(new NumData(0));
		IP.updateSlot();
		IP.ungray();
	}
};
InputPad.ungray=function(){
	var IP=InputPad;
	if(IP.valueGrayed) {
		IP.slot.ungrayValue();
		IP.valueGrayed=false;
	}
};
InputPad.grayOutValue=function(){
	var IP=InputPad;
	IP.slot.grayOutValue();
	IP.valueGrayed=true;
};
InputPad.showUndo=function(){
	var IP=InputPad;
	if(!IP.undoAvailable) {
		IP.undoAvailable = true;
		IP.undoData.dataIsNumeric = IP.dataIsNumeric;
		if (IP.dataIsNumeric) {
			IP.undoData.data = IP.displayNum.getData();
		}
		else {
			IP.undoData.data = IP.nonNumericData;
			IP.undoData.text = IP.nonNumericText;
		}
		IP.updateBsIcon();
	}
};
InputPad.removeUndo=function(){
	var IP=InputPad;
	IP.removeUndoDelayed();
	IP.updateBsIcon();
};
InputPad.removeUndoDelayed=function(){
	var IP=InputPad;
	if(IP.undoAvailable) {
		IP.undoAvailable = false;
		IP.undoData.data = null;
		IP.undoData.text = null;
	}
};
InputPad.updateBsIcon=function(){
	var IP=InputPad;
	if(IP.undoAvailable!=IP.undoVisible) {
		if(IP.undoAvailable){
			IP.bsButton.addIcon(VectorPaths.undo,IP.bsBnH);
			IP.undoVisible=true;
		}
		else{
			IP.bsButton.addIcon(VectorPaths.backspace,IP.bsBnH);
			IP.undoVisible=false;
		}
	}
};
InputPad.undo=function(){
	var IP=InputPad;
	if(IP.undoAvailable) {
		IP.dataIsNumeric=IP.undoData.dataIsNumeric;
		if(IP.dataIsNumeric){
			IP.displayNum=new DisplayNum(IP.undoData.data);
		}
		else{
			IP.nonNumericData=IP.undoData.data;
			IP.nonNumericText=IP.undoData.text;
		}
		IP.removeUndoDelayed();
		IP.updateSlot();
		IP.grayOutValue();
	}
};
InputPad.bsReleased=function(){
	InputPad.updateBsIcon();
};
InputPad.bsPressed=function(){
	var IP=InputPad;
	if(IP.undoAvailable){
		IP.undo();
	}
	else {
		IP.removeUndoDelayed();
		IP.ungray();
		if(IP.dataIsNumeric) {
			IP.displayNum.backspace();
		}
		else{
			IP.dataIsNumeric=true;
			IP.displayNum=new DisplayNum(new NumData(0));
		}
		IP.updateSlot();
	}
	SaveManager.markEdited();
};
InputPad.okPressed=function(){
	InputPad.close();
};
InputPad.showDropdown=function(slot,leftX,rightX,upperY,lowerY,menuWidth, previewFn){
	var IP=InputPad;
	IP.previewFn = previewFn;
	IP.visible=true;
	IP.usingNumberPad=false;
	IP.specialCommand="";
	IP.slot=slot;
	IP.dataIsNumeric=false;
	IP.nonNumericData=IP.slot.enteredData;
	IP.nonNumericText=IP.slot.text;
	var Vmargins=IP.bubbleOverlay.getVPadding();
	IP.menuBnList.setMaxHeight(Math.max(upperY-Vmargins,GuiElements.height-lowerY-Vmargins));
	IP.menuBnList.generateBns();
	IP.width=IP.menuBnList.width;//+2*IP.buttonMargin;
	IP.height=IP.menuBnList.height;//+2*IP.buttonMargin;
	//IP.menuBnList.move(0,0);
	IP.bubbleOverlay.display(leftX,rightX,upperY,lowerY,IP.width,IP.height);
	IP.menuBnList.show();
	/*IP.tallH=IP.height+IP.triangleH;
	IP.move(x,upperY,lowerY);
	GuiElements.layers.inputPad.appendChild(IP.group);*/
};
InputPad.showNumPad=function(slot,leftX,rightX,upperY,lowerY,positive,integer){
	var IP=InputPad;
	IP.previewFn = null;
	IP.usingNumberPad=true;
	IP.specialCommand="";
	IP.width=InputPad.BnAreaW;
	IP.height=InputPad.BnAreaH;
	/*IP.tallH=IP.height+IP.triangleH;*/
	IP.undoAvailable=false;
	IP.valueGrayed=false;
	if(!IP.menuBnList.isEmpty()){
		IP.menuBnList.width=IP.buttonW*3+IP.buttonMargin*2;
		IP.menuBnList.generateBns();
		IP.height+=IP.menuBnList.height+IP.buttonMargin;
		/*IP.tallH+=IP.menuBnList.height+IP.buttonMargin;*/
		GuiElements.move.group(IP.bnGroup,0,IP.menuBnList.height+IP.buttonMargin);
		//IP.menuBnList.move(0,0);
		IP.menuBnList.show();
	}
	else{
		GuiElements.move.group(IP.bnGroup,0,0);
	}
	var IP=InputPad;
	/*GuiElements.layers.inputPad.appendChild(IP.group);*/
	IP.group.appendChild(IP.bnGroup);
	IP.visible=true;
	IP.slot=slot;
	if(slot.getData().type==Data.types.num){
		var numData=slot.getData();
		if(numData.getValue()==0){
			IP.displayNum=new DisplayNum(new NumData(0));
		}
		else{
			IP.displayNum=new DisplayNum(numData);
			IP.grayOutValue();
		}
		IP.dataIsNumeric=true;
	}
	else{
		IP.dataIsNumeric=false;
		IP.nonNumericData=slot.getData();
		IP.nonNumericText=IP.slot.text;
		IP.grayOutValue();
	}
	if(positive){
		IP.plusMinusBn.disable();
	}
	else{
		IP.plusMinusBn.enable();
	}
	if(integer){
		IP.decimalBn.disable();
	}
	else{
		IP.decimalBn.enable();
	}
	IP.bubbleOverlay.display(leftX,rightX,upperY,lowerY,IP.width,IP.height);
	if(IP.menuBnList.updatePosition != null){
		IP.menuBnList.updatePosition();
	}
	/*InputPad.move(x,upperY,lowerY);*/
};
/*InputPad.move=function(x,upperY,lowerY){
	var IP=InputPad;
	IP.triOffset=(InputPad.width-InputPad.triangleW)/2;
	IP.halfOffset=InputPad.width/2;
	
	var arrowDown=(lowerY+IP.tallH>GuiElements.height);
	var yCoord=lowerY+IP.triangleH;
	var xCoord=x-IP.halfOffset;
	var arrowDir=1;
	var arrowX=IP.triOffset;
	var arrowY=0;
	if(arrowDown){
		arrowDir=-1;
		yCoord=upperY-IP.tallH;
		arrowY=IP.height;
	}
	if(xCoord<0){
		arrowX+=xCoord;
		xCoord=0;
	}
	if(xCoord+IP.width>GuiElements.width){
		arrowX=IP.width+x-GuiElements.width-IP.triangleW/2;
		xCoord=GuiElements.width-IP.width;
	}
	GuiElements.move.group(IP.group,xCoord,yCoord);
	GuiElements.update.triangle(IP.triangle,arrowX,arrowY,IP.triangleW,IP.triangleH*arrowDir);
	GuiElements.update.rect(IP.bgRect,0,0,IP.width,IP.height);
 	IP.menuBnList.move(IP.buttonMargin,IP.buttonMargin);
 	IP.menuBnList.show();
};*/
InputPad.updateSlot=function(){
	var IP=InputPad;
	if(IP.dataIsNumeric){
		IP.slot.updateEdit(IP.displayNum.getString(),IP.displayNum.getData());
	}
	else{
		IP.slot.updateEdit(IP.nonNumericText,IP.nonNumericData);
	}
};
InputPad.close=function(){
	var IP = InputPad;
	if(IP.visible) {
		if (IP.specialCommand=="enter_text") {
			IP.slot.editText();
		}
		else if (IP.specialCommand=="new_message") {
			CodeManager.newBroadcastMessage(IP.slot);
		}
		else if (InputPad.dataIsNumeric) {
			IP.slot.saveNumData(IP.displayNum.getData());
		}
		else {
			IP.slot.setSelectionData(IP.nonNumericText, IP.nonNumericData);
		}
		/*IP.group.remove();*/
		IP.bubbleOverlay.hide();
		IP.visible = false;
		IP.menuBnList.hide();
		IP.bnGroup.remove();
		IP.removeUndo();
	}
};
InputPad.menuBnSelected=function(text,data){
	var IP=InputPad;
	if(data.type==Data.types.num){
		IP.displayNum=new DisplayNum(data);
		IP.dataIsNumeric=true;
	}
	else if(data.type==Data.types.selection&&data.getValue()=="enter_text"){
		IP.specialCommand="enter_text";
	}
	else if(data.type==Data.types.selection&&data.getValue()=="new_message"){
		IP.specialCommand="new_message";
	}
	else{
		IP.dataIsNumeric=false;
		IP.nonNumericText=text;
		IP.nonNumericData=data;
	}
	SaveManager.markEdited();
	if(IP.previewFn != null){
		IP.updateSlot();
		IP.previewFn();
	}
	else {
		IP.close();
	}
};

InputPad.makeBns=function(){
	var IP=InputPad;
	var currentNum;
	var xPos=0;
	var yPos=0;
	for(var i=0;i<3;i++){
		xPos=0;
		for(var j=0;j<3;j++){
			currentNum=7-i*3+j;
			InputPad.makeNumBn(xPos,yPos,currentNum);
			xPos+=IP.buttonMargin;
			xPos+=IP.buttonW;
		}
		yPos+=IP.buttonMargin;
		yPos+=IP.buttonH;
	}
	InputPad.makeNumBn(IP.buttonMargin+IP.buttonW,IP.buttonMargin*3+IP.buttonH*3,0);
	InputPad.makePlusMinusBn(0,IP.buttonMargin*3+IP.buttonH*3);
	InputPad.makeDecimalBn(IP.buttonMargin*2+IP.buttonW*2,IP.buttonMargin*3+IP.buttonH*3);
	InputPad.makeBsBn(0,IP.buttonMargin*4+IP.buttonH*4);
	InputPad.makeOkBn(IP.buttonMargin+IP.longBnW,IP.buttonMargin*4+IP.buttonH*4);
};
InputPad.makeNumBn=function(x,y,num){
	var IP=InputPad;
	var button=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	button.addText(num,IP.font,IP.fontSize,IP.fontWeight,IP.charHeight);
	button.setCallbackFunction(function(){InputPad.numPressed(num)},false);
	button.isOverlayPart=true;
};
InputPad.makePlusMinusBn=function(x,y){
	var IP=InputPad;
	IP.plusMinusBn=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	IP.plusMinusBn.addText(String.fromCharCode(177),IP.font,IP.fontSize,IP.fontWeight,IP.plusMinusH);
	IP.plusMinusBn.setCallbackFunction(InputPad.plusMinusPressed,false);
	IP.plusMinusBn.isOverlayPart=true;
};
InputPad.makeDecimalBn=function(x,y){
	var IP=InputPad;
	IP.decimalBn=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	IP.decimalBn.addText(".",IP.font,IP.fontSize,IP.fontWeight,IP.charHeight);
	IP.decimalBn.setCallbackFunction(InputPad.decimalPressed,false);
	IP.decimalBn.isOverlayPart=true;
};
InputPad.makeBsBn=function(x,y){
	var IP=InputPad;
	IP.bsButton=new Button(x,y,IP.longBnW,IP.buttonH,IP.bnGroup);
	IP.bsButton.addIcon(VectorPaths.backspace,IP.bsBnH);
	IP.bsButton.setCallbackFunction(InputPad.bsPressed,false);
	IP.bsButton.setCallbackFunction(InputPad.bsReleased,true);
	IP.bsButton.isOverlayPart=true;
};
InputPad.makeOkBn=function(x,y){
	var IP=InputPad;
	var button=new Button(x,y,IP.longBnW,IP.buttonH,IP.bnGroup);
	button.addIcon(VectorPaths.checkmark,IP.okBnH);
	button.setCallbackFunction(InputPad.okPressed,true);
	button.isOverlayPart=true;
};
InputPad.relToAbsX = function(x){
	var IP = InputPad;
	return IP.bubbleOverlay.relToAbsX(IP.buttonMargin + x)
};
InputPad.relToAbsY = function(y){
	var IP = InputPad;
	return IP.bubbleOverlay.relToAbsY(IP.buttonMargin + y)
};

function BubbleOverlay(color, margin, innerGroup, parent, hMargin){
	if(hMargin==null){
		hMargin=0;
	}
	this.x = 0;
	this.y = 0;
	this.bgColor=color;
	this.margin=margin;
	this.hMargin=hMargin;
	this.innerGroup=innerGroup;
	this.parent=parent;
	this.layerG=GuiElements.layers.overlay;
	this.visible=false;
	this.buildBubble();
}
BubbleOverlay.setGraphics=function(){
	BubbleOverlay.triangleW=15;
	BubbleOverlay.triangleH=7;
	BubbleOverlay.minW=25;
	BubbleOverlay.overlap=1;
};
BubbleOverlay.prototype.buildBubble=function(){
	this.buildGroups();
	this.makeBg();
};
BubbleOverlay.prototype.buildGroups=function(){
	this.group=GuiElements.create.group(0,0);
	TouchReceiver.addListenersOverlayPart(this.group);
	this.bgGroup=GuiElements.create.group(0,0,this.group);
	this.group.appendChild(this.innerGroup);
	GuiElements.move.group(this.innerGroup,this.margin,this.margin);
};
BubbleOverlay.prototype.makeBg=function(){
	this.bgRect=GuiElements.create.rect(this.bgGroup);
	GuiElements.update.color(this.bgRect,this.bgColor);
	this.triangle=GuiElements.create.path(this.bgGroup);
	GuiElements.update.color(this.triangle,this.bgColor);
};
BubbleOverlay.prototype.show=function(){
	if(!this.visible) {
		this.layerG.appendChild(this.group);
		this.visible=true;
		GuiElements.overlay.set(this);
	}
};
BubbleOverlay.prototype.hide=function(){
	if(this.visible) {
		this.group.remove();
		this.visible=false;
		GuiElements.overlay.remove(this);
	}
};
BubbleOverlay.prototype.close=function(){
	this.hide();
	this.parent.close();
};
BubbleOverlay.prototype.display=function(x1,x2,y1,y2,innerWidth,innerHeight){
	DebugOptions.validateNumbers(x1,x2,y1,y2,innerWidth,innerHeight);
	var BO=BubbleOverlay;
	/* Compute dimensions of the bubble */
	var width=innerWidth+2*this.margin;
	if(width<BO.minW){
		width=BO.minW;
	}
	var height=innerHeight+2*this.margin;
	/* Center the content in the bubble */
	GuiElements.move.group(this.innerGroup,(width-innerWidth)/2,(height-innerHeight)/2);

	/* Compute dimension depending on orientation */
	var longW = width + BO.triangleH;
	var longH = height + BO.triangleH;

	var attemptB = Math.max(0, y2 + longH - GuiElements.height);
	var attemptT = Math.max(0, longH - y1);
	var attemptR = Math.max(0, x2 + longW - GuiElements.width);
	var attemptL = Math.max(0, longW - x1);
	var min = Math.min(attemptT, attemptB, attemptL, attemptR);
	var vertical = attemptT <= min || attemptB <= min;

	var topLeftX = NaN;
	var topLeftY = NaN;
	var x = NaN;
	var y = NaN;
	var triangleDir = 1;
	if(vertical){
		x = (x1 + x2) / 2;
		topLeftX = this.fitLocationToRange(x, width, GuiElements.width);
		if(attemptB <= min){
			topLeftY = y2 + BO.triangleH;
			y = y2;
		}
		else{
			topLeftY = y1 - longH;
			y = y1;
			triangleDir = -1;
		}
	}
	else{
		y = (y1 + y2) / 2;
		topLeftY = this.fitLocationToRange(y, height, GuiElements.height);
		if(attemptL <= min){
			topLeftX = x1 - longW;
			x = x1;
			triangleDir = -1;
		}
		else{
			topLeftX = x2 + BO.triangleH;
			x = x2;
		}
	}
	var triX = x - topLeftX;
	var triY = y - topLeftY;
	var triH = (BO.triangleH+BO.overlap)*triangleDir;
	this.x = topLeftX;
	this.y = topLeftY;
	GuiElements.move.group(this.group,topLeftX,topLeftY);
	GuiElements.update.triangleFromPoint(this.triangle,triX,triY,BO.triangleW,triH, vertical);
	GuiElements.update.rect(this.bgRect,0,0,width,height);
	this.show();
};
BubbleOverlay.prototype.fitLocationToRange = function(center, width, range){
	var res = center - width / 2;
	if(width > range){
		res = (range - width) / 2;
	}
	else if(res < 0){
		res = 0;
	}
	else if(res + width > range){
		res = range - width;
	}
	return res;
};
BubbleOverlay.prototype.getVPadding=function() {
	return this.margin*2+BubbleOverlay.triangleH;
};
BubbleOverlay.prototype.relToAbsX = function(x){
	return x + this.x;
};
BubbleOverlay.prototype.relToAbsY = function(y){
	return y + this.y;
};
function ResultBubble(leftX,rightX,upperY,lowerY,text, error){
	var RB = ResultBubble;
	if(error == null){
		error = false;
	}
	var fontColor = RB.fontColor;
	var bgColor = RB.bgColor;
	if(error){
		fontColor = RB.errorFontColor;
		bgColor = RB.errorBgColor;
	}
	var height=RB.charHeight;
	var textE=GuiElements.draw.text(0,height,text,RB.fontSize,fontColor,RB.font,RB.fontWeight);
	GuiElements.update.textLimitWidth(textE,text,GuiElements.width-RB.hMargin*2);
	var width=GuiElements.measure.textWidth(textE);
	var group=GuiElements.create.group(0,0);
	group.appendChild(textE);
	this.bubbleOverlay=new BubbleOverlay(bgColor,RB.margin,group,this,RB.hMargin);
	this.bubbleOverlay.display(leftX,rightX,upperY,lowerY,width,height);
	/*this.vanishTimer = self.setInterval(function () { GuiElements.overlay.close() }, RB.lifetime);*/
}
ResultBubble.setConstants=function(){
	var RB=ResultBubble;
	RB.fontColor=Colors.black;
	RB.errorFontColor = Colors.white;
	RB.bgColor=Colors.white;
	RB.errorBgColor = "#c00000";
	RB.fontSize=16;
	RB.font="Arial";
	RB.fontWeight="normal";
	RB.charHeight=12;
	RB.margin=4;
	/*RB.lifetime=3000;*/
	RB.hMargin=20;
};
ResultBubble.prototype.close=function(){
	this.bubbleOverlay.hide();
	/*this.vanishTimer = window.clearInterval(this.vanishTimer);*/
};
/**
 * Created by Tom on 6/13/2017.
 */
/**
 * Creates a UI element that is in a div layer and contains a scrollDiv with the content from the group.  The group
 * can change size, as long as it calls updateDims with the new innerHeight and innerWidth.
 */
function SmoothScrollBox(group, layer, absX, absY, width, height, innerWidth, innerHeight, isOverlay){
	DebugOptions.validateNonNull(group, layer);
	DebugOptions.validateNumbers(width, height, innerWidth, innerHeight);
	this.x = absX;
	this.y = absY;
	this.width = width;
	this.height = height;
	this.innerWidth = innerWidth;
	this.innerHeight = innerHeight;
	this.layer = layer;
	this.scrollDiv = GuiElements.create.scrollDiv();
	TouchReceiver.addListenersScrollBox(this.scrollDiv, this);
	this.contentSvg = GuiElements.create.svg(this.scrollDiv);
	this.contentGroup = GuiElements.create.group(0, 0, this.contentSvg);
	this.contentGroup.appendChild(group);
	this.scrollStatus = {};
	this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv, this.scrollStatus);
	this.visible = false;
	this.currentZoom = GuiElements.zoomFactor;
	this.isOverlayPart = isOverlay;
}
SmoothScrollBox.prototype.updateScrollSet = function(){
	if(this.visible) {
		let realX = GuiElements.relToAbsX(this.x);
		let realY = GuiElements.relToAbsY(this.y);

		GuiElements.update.smoothScrollSet(this.scrollDiv, this.contentSvg, this.contentGroup, realX, realY, this.width,
			this.height, this.innerWidth, this.innerHeight);
	}
};
SmoothScrollBox.prototype.updateZoom = function(){
	var currentScrollX = this.getScrollX();
	var currentScrollY = this.getScrollY();
	this.currentZoom = GuiElements.zoomFactor;
	this.updateScrollSet();
	this.setScrollX(currentScrollX);
	this.setScrollY(currentScrollY);
};
SmoothScrollBox.prototype.setContentDims = function(innerWidth, innerHeight){
	this.innerHeight = innerHeight;
	this.innerWidth = innerWidth;
	this.updateScrollSet();
};
SmoothScrollBox.prototype.setDims = function(width, height){
	this.width = width;
	this.height = height;
	this.updateScrollSet();
};
SmoothScrollBox.prototype.move = function(absX, absY){
	this.x = absX;
	this.y = absY;
	this.updateScrollSet();
};
SmoothScrollBox.prototype.show = function(){
	if(!this.visible){
		this.visible = true;
		this.layer.appendChild(this.scrollDiv);
		this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv);
		this.updateScrollSet();
		TouchReceiver.setInitialScrollFix(this.scrollDiv);
	}
};
SmoothScrollBox.prototype.hide = function(){
	if(this.visible){
		this.visible = false;
		this.layer.removeChild(this.scrollDiv);
		if(this.fixScrollTimer != null) {
			window.clearInterval(this.fixScrollTimer);
		}
	}
};
SmoothScrollBox.prototype.relToAbsX=function(x){
	return x - this.scrollDiv.scrollLeft / this.currentZoom + this.x;
};
SmoothScrollBox.prototype.relToAbsY=function(y){
	return y - this.scrollDiv.scrollTop  / this.currentZoom + this.y;
};
SmoothScrollBox.prototype.absToRelX=function(x){
	return x + this.scrollDiv.scrollLeft * this.currentZoom - this.x;
};
SmoothScrollBox.prototype.absToRelY=function(y){
	return y + this.scrollDiv.scrollTop * this.currentZoom - this.y;
};
SmoothScrollBox.prototype.getScrollY = function(){
	if(!this.visible) return 0;
	return this.scrollDiv.scrollTop / this.currentZoom;
};
SmoothScrollBox.prototype.getScrollX = function(){
	if(!this.visible) return 0;
	return this.scrollDiv.scrollLeft / this.currentZoom;
};
SmoothScrollBox.prototype.setScrollX = function(x){
	this.scrollDiv.scrollLeft = x * this.currentZoom;
	TouchReceiver.setInitialScrollFix(this.scrollDiv);
};
SmoothScrollBox.prototype.setScrollY = function(y){
	this.scrollDiv.scrollTop = y * this.currentZoom;
	TouchReceiver.setInitialScrollFix(this.scrollDiv);
};
SmoothScrollBox.prototype.isMoving = function(){
	return !this.scrollStatus.still;
};
function MenuBnList(parentGroup,x,y,bnMargin,width,columns){
	this.x=x;
	this.y=y;
	this.width=width;
	if(width==null){
		this.width=null;
	}
	this.height=0;
	this.bnHeight=MenuBnList.bnHeight;
	this.bnMargin=bnMargin;
	this.bnsGenerated=false;
	this.bnTextList=new Array();
	this.bnFunctionsList=new Array();
	this.bns=null;
	this.group=GuiElements.create.group(x,y);
	this.parentGroup=parentGroup;
	this.visible=false;
	if(columns==null){
		columns=1;
	}
	this.columns=columns;
	this.isOverlayPart=false;
	this.internalHeight=0;
	this.scrolling=false;
	this.scrollYOffset=0;
	this.scrollY=0;
	this.scrollable=false;
	this.maxHeight=null;
}
MenuBnList.setGraphics=function(){
	var MBL=MenuBnList;
	MBL.bnHeight=34; //25
	MBL.bnHMargin=10; //only used when width not specified.
	MBL.minWidth=40;
}
MenuBnList.prototype.setMaxHeight=function(maxHeight){
	this.maxHeight=maxHeight;
	this.clippingPath=GuiElements.clip(0,0,GuiElements.width,maxHeight,this.group);
	this.clipRect=this.clippingPath.childNodes[0];
	this.scrollRect=this.makeScrollRect();
};
MenuBnList.prototype.addOption=function(text,func){
	this.bnsGenerated=false;
	this.bnTextList.push(text);
	if(func==null){
		this.bnFunctionsList.push(null);
	}
	else{
		this.bnFunctionsList.push(func);
	}
}
MenuBnList.prototype.show=function(){
	this.generateBns();
	if(!this.visible){
		this.visible=true;
		this.parentGroup.appendChild(this.group);
	}
}
MenuBnList.prototype.hide=function(){
	if(this.visible){
		this.visible=false;
		this.group.remove();
		if(this.maxHeight!=null) {
			this.clippingPath.remove();
		}
	}
}
MenuBnList.prototype.generateBns=function(){
	var columns=this.columns;
	this.computeWidth(columns);
	if(!this.bnsGenerated){
		this.clearBnsArray();
		var currentY=0;
		var currentX=0;
		var column=0;
		var count=this.bnTextList.length;
		var bnWidth=0;
		for(var i=0;i<count;i++){
			if(column==columns){
				column=0;
				currentX=0;
				currentY+=this.bnHeight+this.bnMargin;
			}
			if(column==0) {
				bnWidth = (this.width + this.bnMargin) / columns - this.bnMargin;
				var remainingBns=count-i;
				if(remainingBns<columns){
					bnWidth=(this.width+this.bnMargin)/remainingBns-this.bnMargin;
				}
			}
			this.bns.push(this.generateBn(currentX,currentY,bnWidth,this.bnTextList[i],this.bnFunctionsList[i]));
			currentX+=bnWidth+this.bnMargin;
			column++;
		}
		currentY+=this.bnHeight;
		this.internalHeight=currentY;
		if(count==0){
			this.internalHeight=0;
		}
		this.height=this.internalHeight;
		if(this.maxHeight!=null){
			this.height=Math.min(this.internalHeight,this.maxHeight);
		}
		this.scrollable=this.height!=this.internalHeight;
		this.updateScrollRect();
		this.bnsGenerated=true;
	}
};
MenuBnList.prototype.clearBnsArray=function(){
	if(this.bns!=null){
		for(var i=0;i<this.bns.length;i++){
			this.bns[i].remove();
		}
	}
	this.bns=new Array();
}
MenuBnList.prototype.generateBn=function(x,y,width,text,func){
	var MBL=MenuBnList;
	var bn=new Button(x,y,width,this.bnHeight,this.group);
	bn.addText(text);
	bn.setCallbackFunction(func,true);
	bn.isOverlayPart=this.isOverlayPart;
	bn.menuBnList=this;
	return bn;
}
MenuBnList.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y+this.scrollY);
	if(this.maxHeight!=null){
		GuiElements.move.element(this.clipRect,0,(0-this.scrollY));
	}
};
MenuBnList.prototype.computeWidth=function(){
	if(this.width==null) {
		var columns = this.columns;
		var MBL = MenuBnList;
		var longestW = 0;
		for (var i = 0; i < this.bnTextList.length; i++) {
			var currentW = GuiElements.measure.stringWidth(this.bnTextList[i], Button.defaultFont, Button.defaultFontSize, Button.defaultFontWeight);
			if (currentW > longestW) {
				longestW = currentW;
			}
		}
		this.width = columns * longestW + columns * 2 * MBL.bnHMargin + (columns - 1) * this.bnMargin;
		if (this.width < MBL.minWidth) {
			this.width = MBL.minWidth;
		}
	}
}
MenuBnList.prototype.makeScrollRect=function(){
	var rectE=GuiElements.create.rect(this.group);
	rectE.setAttributeNS(null,"fill","#000");
	GuiElements.update.opacity(rectE,0);
	TouchReceiver.addListenersMenuBnListScrollRect(rectE,this);
	return rectE;
};
MenuBnList.prototype.updateScrollRect=function(){
	if(this.maxHeight!=null) {
		GuiElements.update.rect(this.scrollRect, 0, 0, this.width, this.internalHeight);
	}
};
MenuBnList.prototype.isEmpty=function(){
	return this.bnTextList.length==0;
};
MenuBnList.prototype.startScroll=function(y){
	if(!this.scrolling){
		this.scrollYOffset = this.scrollY - y;
		this.scrolling=true;
	}
};
MenuBnList.prototype.updateScroll=function(y){
	if(this.scrolling){
		this.scroll(this.scrollYOffset + y);
		this.scrolling=true;
	}
};
MenuBnList.prototype.endScroll=function(){
	if(this.scrolling){
		this.scrolling=false;
	}
};
MenuBnList.prototype.scroll=function(scrollY){
	this.scrollY=scrollY;
	this.scrollY=Math.min(0,this.scrollY);
	this.scrollY=Math.max(this.height-this.internalHeight,this.scrollY);
	this.move(this.x,this.y);
};

/**
 * Created by Tom on 6/5/2017.
 */

function SmoothMenuBnList(parent, parentGroup,x,y,width){
	this.x=x;
	this.y=y;
	this.width=width;
	if(width==null){
		this.width=null;
	}
	this.height=0;
	this.bnHeight=SmoothMenuBnList.bnHeight;
	this.bnMargin=Button.defaultMargin;
	this.bnsGenerated=false;
	this.bnTextList=[];
	this.bnFunctionsList=[];
	this.bns=null;

	this.build();
	this.parentGroup=parentGroup;
	this.parent = parent;

	this.visible=false;
	this.isOverlayPart=false;
	this.internalHeight=0;

	this.maxHeight=null;

	this.scrolling=false;
	this.scrollYOffset=0;
	this.scrollY=0;
	this.scrollable=false;

}
SmoothMenuBnList.setGraphics=function(){
	var SMBL=SmoothMenuBnList;
	SMBL.bnHeight=34; //25
	SMBL.bnHMargin=10; //only used when width not specified.
	SMBL.minWidth=40;
};
SmoothMenuBnList.prototype.build = function(){
	//this.foreignObject = GuiElements.create.foreignObject();
	this.scrollDiv = GuiElements.create.scrollDiv();
	TouchReceiver.addListenersSmoothMenuBnListScrollRect(this.scrollDiv, this);
	this.svg = GuiElements.create.svg(this.scrollDiv);
	this.zoomG = GuiElements.create.group(0, 0, this.svg);
};
SmoothMenuBnList.prototype.setMaxHeight=function(maxHeight){
	this.maxHeight=maxHeight;
};
SmoothMenuBnList.prototype.addOption=function(text,func){
	this.bnsGenerated=false;
	this.bnTextList.push(text);
	if(func==null){
		this.bnFunctionsList.push(null);
	}
	else{
		this.bnFunctionsList.push(func);
	}
};
SmoothMenuBnList.prototype.show=function(){
	this.generateBns();
	if(!this.visible){
		this.visible=true;
		GuiElements.layers.frontScroll.appendChild(this.scrollDiv);
		this.updatePosition();
		this.fixScrollTimer = TouchReceiver.createScrollFixTimer(this.scrollDiv);
	}
};
SmoothMenuBnList.prototype.hide=function(){
	if(this.visible){
		this.visible=false;
		GuiElements.layers.frontScroll.removeChild(this.scrollDiv);
		if(this.fixScrollTimer != null) {
			window.clearInterval(this.fixScrollTimer);
		}
	}
};
SmoothMenuBnList.prototype.generateBns=function(){
	var columns=1;
	this.computeWidth();
	if(!this.bnsGenerated){
		this.clearBnsArray();
		var currentY=0;
		var currentX=0;
		var column=0;
		var count=this.bnTextList.length;
		var bnWidth=0;
		for(var i=0;i<count;i++){
			if(column==columns){
				column=0;
				currentX=0;
				currentY+=this.bnHeight+this.bnMargin;
			}
			if(column==0) {
				bnWidth = (this.width + this.bnMargin) / columns - this.bnMargin;
				var remainingBns=count-i;
				if(remainingBns<columns){
					bnWidth=(this.width+this.bnMargin)/remainingBns-this.bnMargin;
				}
			}
			this.bns.push(this.generateBn(currentX,currentY,bnWidth,this.bnTextList[i],this.bnFunctionsList[i]));
			currentX+=bnWidth+this.bnMargin;
			column++;
		}
		currentY+=this.bnHeight;
		this.internalHeight=currentY;
		if(count==0){
			this.internalHeight=0;
		}
		this.height=this.internalHeight;
		if(this.maxHeight!=null){
			this.height=Math.min(this.internalHeight,this.maxHeight);
		}
		this.scrollable=this.height!=this.internalHeight;
		this.bnsGenerated=true;
		this.updatePosition();
	}
};
SmoothMenuBnList.prototype.computeWidth=function(){
	if(this.width==null) {
		var columns = 1;
		var MBL = MenuBnList;
		var longestW = 0;
		for (var i = 0; i < this.bnTextList.length; i++) {
			var currentW = GuiElements.measure.stringWidth(this.bnTextList[i], Button.defaultFont, Button.defaultFontSize, Button.defaultFontWeight);
			if (currentW > longestW) {
				longestW = currentW;
			}
		}
		this.width = columns * longestW + columns * 2 * MBL.bnHMargin + (columns - 1) * this.bnMargin;
		if (this.width < MBL.minWidth) {
			this.width = MBL.minWidth;
		}
	}
};
SmoothMenuBnList.prototype.isEmpty=function(){
	return this.bnTextList.length==0;
};
SmoothMenuBnList.prototype.clearBnsArray=function(){
	if(this.bns!=null){
		for(var i=0;i<this.bns.length;i++){
			this.bns[i].remove();
		}
	}
	this.bns=[];
};
SmoothMenuBnList.prototype.generateBn=function(x,y,width,text,func){
	var bn=new Button(x,y,width,this.bnHeight,this.zoomG);
	bn.addText(text);
	bn.setCallbackFunction(func,true);
	bn.isOverlayPart=this.isOverlayPart;
	bn.makeScrollable();
	return bn;
};
SmoothMenuBnList.prototype.updatePosition = function(){
	if(this.visible) {
		//Compensates for a WebKit bug which prevents transformations from moving foreign objects
		var realX = this.parent.relToAbsX(this.x);
		var realY = this.parent.relToAbsY(this.y);
		realX = GuiElements.relToAbsX(realX);
		realY = GuiElements.relToAbsY(realY);

		GuiElements.update.smoothScrollSet(this.scrollDiv, this.svg, this.zoomG, realX, realY, this.width,
			this.height, this.width, this.internalHeight);
	}
};
SmoothMenuBnList.prototype.updateZoom = function(){
	this.updatePosition();
};
SmoothMenuBnList.prototype.getScroll = function(){
	if(!this.visible) return 0;
	return this.scrollDiv.scrollTop;
};
SmoothMenuBnList.prototype.setScroll = function(scrollTop){
	if(!this.visible) return;
	scrollTop = Math.max(0, scrollTop);
	var height = parseInt(window.getComputedStyle(this.scrollDiv).getPropertyValue('height'), 10);
	scrollTop = Math.min(this.scrollDiv.scrollHeight - height, scrollTop);
	this.scrollDiv.scrollTop = scrollTop;
};
function Menu(button,width){
	if(width==null){
		width=Menu.defaultWidth;
	}
	DebugOptions.validateNumbers(width);
	this.width=width;
	this.x=button.x;
	this.y=button.y+button.height;
	this.group=GuiElements.create.group(this.x,this.y);
	TouchReceiver.addListenersOverlayPart(this.group);
	this.bgRect=GuiElements.create.rect(this.group);
	GuiElements.update.color(this.bgRect,Menu.bgColor);
	this.menuBnList=null;
	this.visible=false;
	var callbackFn=function(){
		callbackFn.menu.open();
	};
	callbackFn.menu=this;
	button.setCallbackFunction(callbackFn,false);
	callbackFn=function(){
		callbackFn.menu.close();
	};
	callbackFn.menu=this;
	button.setToggleFunction(callbackFn);
	this.button=button;
	this.alternateFn=null;
	this.scheduleAlternate=false;
}
Menu.setGraphics=function(){
	Menu.defaultWidth=100;
	Menu.bnMargin=Button.defaultMargin;
	Menu.bgColor=Colors.black;
};
Menu.prototype.move=function(){
	this.x=this.button.x;
	this.y=this.button.y+this.button.height;
	GuiElements.move.group(this.group,this.x,this.y);
	if(this.menuBnList != null) {
		this.menuBnList.updatePosition();
	}
};
Menu.prototype.createMenuBnList=function(){
	if(this.menuBnList!=null){
		this.menuBnList.hide();
	}
	var bnM=Menu.bnMargin;
	//this.menuBnList=new MenuBnList(this.group,bnM,bnM,bnM,this.width);
	this.menuBnList=new SmoothMenuBnList(this, this.group,bnM,bnM,this.width);
	this.menuBnList.isOverlayPart=true;
	var maxH = GuiElements.height - this.y - Menu.bnMargin * 2;
	this.menuBnList.setMaxHeight(maxH);
};
Menu.prototype.addOption=function(text,func,close){
	if(close==null){
		close=true;
	}
	var callbackFn=function(){
		if(callbackFn.close) {
			callbackFn.menu.close();
		}
		if(callbackFn.func != null) {
			callbackFn.func.call(callbackFn.menu);
		}
	};
	callbackFn.menu=this;
	callbackFn.func=func;
	callbackFn.close=close;
	this.menuBnList.addOption(text,callbackFn);
};
Menu.prototype.buildMenu=function(){
	var mBL=this.menuBnList;
	mBL.generateBns();
	GuiElements.update.rect(this.bgRect,0,0,mBL.width+2*Menu.bnMargin,mBL.height+2*Menu.bnMargin);
};
Menu.prototype.previewOpen=function(){
	return true;
};
Menu.prototype.loadOptions=function(){

};
Menu.prototype.open=function(){
	if(!this.visible) {
		if(this.previewOpen()) {
			this.createMenuBnList();
			this.loadOptions();
			this.buildMenu();
			GuiElements.layers.overlay.appendChild(this.group);
			this.menuBnList.show();
			this.visible = true;
			GuiElements.overlay.set(this);
			this.button.isOverlayPart = true;
			this.scheduleAlternate=false;
		}
		else{
			this.button.toggled=true;
			this.scheduleAlternate=true;
		}
	}
};
Menu.prototype.close=function(onlyOnDrag){
	if(onlyOnDrag) return;
	if(this.visible){
		this.group.remove();
		this.menuBnList.hide();
		this.visible=false;
		GuiElements.overlay.remove(this);
		this.button.unToggle();
		this.button.isOverlayPart=false;
	}
	else if(this.scheduleAlternate){
		this.scheduleAlternate=false;
		this.alternateFn();
	}
};
Menu.prototype.addAlternateFn=function(alternateFn){
	this.alternateFn=alternateFn;
};
Menu.prototype.relToAbsX = function(x){
	return x + this.x;
};
Menu.prototype.relToAbsY = function(y){
	return y + this.y;
};
Menu.prototype.updateZoom = function(){
	if(this.menuBnList != null){
		this.menuBnList.updateZoom();
	}
};
function FileMenu(button){
	Menu.call(this,button);
}
FileMenu.prototype = Object.create(Menu.prototype);
FileMenu.prototype.constructor = FileMenu;
FileMenu.prototype.loadOptions = function(){
	this.addOption("New", SaveManager.userNew);
	this.addOption("Open", OpenDialog.showDialog);
	this.addOption("Duplicate", SaveManager.userDuplicate);
	this.addOption("Rename", SaveManager.userRename);
	this.addOption("Delete", SaveManager.userDelete);
	this.addOption("Share", SaveManager.userExport);
	this.addOption("Debug", this.optionEnableDebug);
	if(GuiElements.isKindle) {
		this.addOption("Exit", this.optionExit);
	}
};
FileMenu.prototype.optionNew=function(){
	SaveManager.new();
};
FileMenu.prototype.optionEnableDebug=function(){
	TitleBar.enableDebug();
};
FileMenu.prototype.optionExit=function(){
	SaveManager.checkPromptSave(function() {
		HtmlServer.sendRequest("tablet/exit");
	});
};
function DebugMenu(button){
	Menu.call(this,button,130);
	this.lastRequest = "";
	this.lastResponse = "";
}
DebugMenu.prototype = Object.create(Menu.prototype);
DebugMenu.prototype.constructor = DebugMenu;
DebugMenu.prototype.loadOptions = function() {
	this.addOption("Enable logging", DebugOptions.enableLogging);
	this.addOption("Load file", this.loadFile);
	this.addOption("Download file", this.downloadFile);
	this.addOption("Hide Debug", TitleBar.hideDebug);
	this.addOption("Version", this.optionVersion);
	this.addOption("Set JS Url", this.optionSetJsUrl);
	this.addOption("Reset JS Url", this.optionResetJsUrl);
	this.addOption("Send request", this.optionSendRequest);
	this.addOption("Log HTTP", this.optionLogHttp);
	this.addOption("HB names", this.optionHBs);
	this.addOption("Allow virtual HBs", this.optionVirtualHBs);
	this.addOption("Clear log", this.optionClearLog);
	//this.addOption("Connect Multiple", HummingbirdManager.showConnectMultipleDialog);
	//this.addOption("HB Debug info", HummingbirdManager.displayDebugInfo);
	//this.addOption("Recount HBs", HummingbirdManager.recountAndDisplayHBs);
	//this.addOption("iOS HBs", HummingbirdManager.displayiOSHBNames);
	this.addOption("Throw error", function(){throw new UserException("test error");});
	this.addOption("Stop error locking", DebugOptions.stopErrorLocking);
};
DebugMenu.prototype.loadFile=function(){
	HtmlServer.showDialog("Load File", "Paste file contents", "", function(cancelled, resp){
		if(!cancelled){
			SaveManager.loadFile(resp);
		}
	});
};
DebugMenu.prototype.downloadFile = function(){
	var xml = XmlWriter.docToText(CodeManager.createXml());
	var url = "data:text/plain," + HtmlServer.encodeHtml(xml);
	window.open(url, '_blank');
};
DebugMenu.prototype.optionNew=function(){
	SaveManager.new();
};
DebugMenu.prototype.optionVersion=function(){
	GuiElements.alert("Version: "+GuiElements.appVersion);
};
DebugMenu.prototype.optionScreenSize=function(){
	HtmlServer.sendRequestWithCallback("tablet/screenSize",function(response){
		GuiElements.alert("Size: "+response);
	});
};
DebugMenu.prototype.optionPixelSize=function(){
	GuiElements.alert(GuiElements.height+" "+GuiElements.width);
};
DebugMenu.prototype.optionZoom=function(){
	HtmlServer.getSetting("zoom",function(response){
		GuiElements.alert("Zoom: "+(response));
	});
};
DebugMenu.prototype.optionHBs=function(){
	HtmlServer.sendRequestWithCallback("hummingbird/names",function(response){
		GuiElements.alert("Names: "+response.split("\n").join(","));
	});
};
DebugMenu.prototype.optionLogHttp=function(){
	HtmlServer.logHttp=true;
};
DebugMenu.prototype.optionVirtualHBs=function(){
	DiscoverDialog.allowVirtualDevices=true;
};
DebugMenu.prototype.optionClearLog=function(){
	GuiElements.alert("");
};
DebugMenu.prototype.optionSetJsUrl=function(){
	HtmlServer.showDialog("Set JS URL", "https://www.example.com/", this.lastRequest, function(cancel, url) {
		if(!cancel && url != ""){
			var request = "setjsurl/" + HtmlServer.encodeHtml(url);
			HtmlServer.sendRequestWithCallback(request);
		}
	}, function(){});
};
DebugMenu.prototype.optionResetJsUrl=function(){
	var request = "resetjsurl";
	HtmlServer.sendRequestWithCallback(request);
};
DebugMenu.prototype.optionSendRequest=function(){
	var message = this.lastResponse;
	if(this.lastResponse == ""){
		message = "Request: http://localhost:22179/[...]"
	}
	var me = this;
	HtmlServer.showDialog("Send request", message, this.lastRequest, function(cancel, request) {
		if(!cancel && (request != "" || me.lastRequest != "")){
			if(request == ""){
				request = me.lastRequest;
			}
			me.lastRequest = request;
			HtmlServer.sendRequestWithCallback(request, function(resp){
				me.lastResponse = "Response: \"" + resp + "\"";
				me.optionSendRequest();
			}, function(){
				me.lastResponse = "Error sending request";
				me.optionSendRequest();
			});
		}
		else{
			me.lastResponse = "";
		}
	}, function(){
		me.lastResponse = "";
	});
};
function ViewMenu(button){
	Menu.call(this,button);
}
ViewMenu.prototype = Object.create(Menu.prototype);
ViewMenu.prototype.constructor = ViewMenu;
ViewMenu.prototype.loadOptions = function() {
	this.addOption("Zoom in", this.optionZoomIn,false);
	this.addOption("Zoom out", this.optionZoomOut,false);
	this.addOption("Reset zoom", this.optionResetZoom,true);
};
ViewMenu.prototype.optionZoomIn=function(){
	GuiElements.zoomMultiple+=GuiElements.zoomAmount;
	GuiElements.zoomMultiple=Math.min(GuiElements.zoomMultiple,GuiElements.maxZoomMult);
	GuiElements.updateZoom();
};
ViewMenu.prototype.optionZoomOut=function(){
	GuiElements.zoomMultiple-=GuiElements.zoomAmount;
	GuiElements.zoomMultiple=Math.max(GuiElements.zoomMultiple,GuiElements.minZoomMult);
	GuiElements.updateZoom();
};
ViewMenu.prototype.optionResetZoom=function(){
	GuiElements.zoomMultiple=1;
	GuiElements.updateZoom();
};


function DeviceMenu(button){
	Menu.call(this,button,DeviceMenu.width);
	this.addAlternateFn(function(){
		DebugOptions.throw("Not implemented"); //TODO: implement
	});
}
DeviceMenu.prototype = Object.create(Menu.prototype);
DeviceMenu.prototype.constructor = ViewMenu;
DeviceMenu.setGraphics=function(){
	DeviceMenu.width=150;
	DeviceMenu.maxDeviceNameChars = 8;
};
DeviceMenu.prototype.loadOptions=function(){
	let connectedClass = null;
	Device.getTypeList().forEach(function(deviceClass){
		if(deviceClass.getManager().getDeviceCount() > 0){
			connectedClass = deviceClass;
		}
	});
	if(connectedClass != null){
		var currentDevice = connectedClass.getManager().getDevice(0);
		this.addOption(currentDevice.name,function(){},false);
		this.addOption("Disconnect " + connectedClass.getDeviceTypeName(false, DeviceMenu.maxDeviceNameChars), function(){
			connectedClass.getManager().removeAllDevices();
		});
	} else {
		Device.getTypeList().forEach(function(deviceClass){
			this.addOption("Connect " + deviceClass.getDeviceTypeName(false, DeviceMenu.maxDeviceNameChars), function(){
				(new DiscoverDialog(deviceClass)).show();
			});
		}, this);
	}
};
DeviceMenu.prototype.previewOpen=function(){
	let connectionCount = 0;
	Device.getTypeList().forEach(function(deviceClass){
		connectionCount += deviceClass.getManager().getDeviceCount();
	});
	return (connectionCount<=1);
};
function BlockContextMenu(block,x,y){
	this.block=block;
	this.x=x;
	this.y=y;
	this.showMenu();
}
BlockContextMenu.setGraphics=function(){
	var BCM=BlockContextMenu;
	BCM.bnMargin=Button.defaultMargin;
	BCM.bgColor=Colors.black;
	BCM.blockShift=20;
};
BlockContextMenu.prototype.showMenu=function(){
	var BCM=BlockContextMenu;
	this.group=GuiElements.create.group(0,0);
	this.menuBnList=new MenuBnList(this.group,0,0,BCM.bnMargin);
	this.menuBnList.isOverlayPart=true;
	this.addOptions();
	this.menuBnList.show();
	this.bubbleOverlay=new BubbleOverlay(BCM.bgColor,BCM.bnMargin,this.group,this);
	this.bubbleOverlay.display(this.x,this.x,this.y,this.y,this.menuBnList.width,this.menuBnList.height);
};
BlockContextMenu.prototype.addOptions=function(){
	if(this.block.stack.isDisplayStack){
		if(this.block.blockTypeName=="B_Variable"){
			var funcRen=function(){
				funcRen.block.renameVar();
				funcRen.BCM.close();
			};
			funcRen.block=this.block;
			funcRen.BCM=this;
			this.menuBnList.addOption("Rename", funcRen);
			var funcDel=function(){
				funcDel.block.deleteVar();
				funcDel.BCM.close();
			};
			funcDel.block=this.block;
			funcDel.BCM=this;
			this.menuBnList.addOption("Delete", funcDel);
		}
		if(this.block.blockTypeName=="B_List"){
			var funcRen=function(){
				funcRen.block.renameLi();
				funcRen.BCM.close();
			};
			funcRen.block=this.block;
			funcRen.BCM=this;
			this.menuBnList.addOption("Rename", funcRen);
			var funcDel=function(){
				funcDel.block.deleteLi();
				funcDel.BCM.close();
			};
			funcDel.block=this.block;
			funcDel.BCM=this;
			this.menuBnList.addOption("Delete", funcDel);
		}
	}
	else {
		var BCM = this;
		var funcDup = function () {
			funcDup.BCM.duplicate();
		};
		funcDup.BCM = this;
		this.menuBnList.addOption("Duplicate", funcDup);
		this.menuBnList.addOption("Delete",function(){
			BCM.block.unsnap().delete();
			BCM.close();
		})
	}
};
BlockContextMenu.prototype.duplicate=function(){
	var BCM=BlockContextMenu;
	var newX=this.block.getAbsX()+BCM.blockShift;
	var newY=this.block.getAbsY()+BCM.blockShift;
	var blockCopy=this.block.duplicate(newX,newY);
	var tab=this.block.stack.tab;
	var copyStack=new BlockStack(blockCopy,tab);
	//copyStack.updateDim();
	this.close();
};
BlockContextMenu.prototype.close=function(){
	this.block=null;
	this.bubbleOverlay.hide();
};
// handles displaying numbers entered using the inputpad
function DisplayNum(initialData){
	this.isNegative=(initialData.getValue()<0);
	var asStringData=initialData.asPositiveString();
	var parts=asStringData.getValue().split(".");
	this.integerPart=parts[0];
	if(this.integerPart==""){
		this.integerPart="0";
	}
	this.decimalPart="";
	this.hasDecimalPoint=(parts.length>1);
	if(this.hasDecimalPoint){
		this.decimalPart=parts[1];
	}
}
DisplayNum.prototype.backspace=function(){
	if(this.hasDecimalPoint&&this.decimalPart!=""){
		var newL=this.decimalPart.length-1;
		this.decimalPart=this.decimalPart.substring(0,newL);
	}
	else if(this.hasDecimalPoint){
		this.hasDecimalPoint=false;
	}
	else if(this.integerPart.length>1){
		var newL=this.integerPart.length-1;
		this.integerPart=this.integerPart.substring(0,newL);
	}
	else if(this.integerPart!="0"){
		this.integerPart="0";
	}
	else if(this.isNegative){
		this.isNegative=false;
	}
}
DisplayNum.prototype.switchSign=function(){
	this.isNegative=!this.isNegative;
}
DisplayNum.prototype.addDecimalPoint=function(){
	if(!this.hasDecimalPoint){
		this.hasDecimalPoint=true;
		this.decimalPart="";
	}
}
DisplayNum.prototype.addDigit=function(digit){ //Digit is a string
	if(this.hasDecimalPoint){
		if(this.decimalPart.length<5){
			this.decimalPart+=digit;
		}
	}
	else if(this.integerPart!="0"){
		if(this.integerPart.length<10){
			this.integerPart+=digit;
		}
	}
	else if(digit!="0"){
		this.integerPart=digit;
	}
}
DisplayNum.prototype.getString=function(){
	var rVal="";
	if(this.isNegative){
		rVal+="-";
	}
	rVal+=this.integerPart;
	if(this.hasDecimalPoint){
		rVal+=".";
		rVal+=this.decimalPart;
	}
	return rVal;
}
DisplayNum.prototype.getData=function(){
	var rVal=parseInt(this.integerPart, 10);
	if(this.hasDecimalPoint&&this.decimalPart.length>0){
		var decPart=parseInt(this.decimalPart, 10);
		decPart/=Math.pow(10,this.decimalPart.length);
		rVal+=decPart;
	}
	if(this.isNegative){
		rVal=0-rVal;
	}
	return new NumData(rVal);
}
function VectorIcon(x,y,pathId,color,height,parent){
	this.x=x;
	this.y=y;
	this.color=color;
	this.height=height;
	this.pathId=pathId;
	this.parent=parent;
	this.pathE=null;
	this.draw();
}
VectorIcon.computeWidth=function(pathId,height){
	var scale=height/pathId.height;
	return scale*pathId.width;
}
VectorIcon.prototype.draw=function(){
	this.scale=this.height/this.pathId.height;
	this.width=this.scale*this.pathId.width;
	this.group=GuiElements.create.group(this.x,this.y,this.parent);
	this.group.setAttributeNS(null,"transform","translate("+this.x+","+this.y+") scale("+this.scale+")");
	this.pathE=GuiElements.create.path(this.group);
	this.pathE.setAttributeNS(null,"d",this.pathId.path);
	this.pathE.setAttributeNS(null,"fill",this.color);
	this.group.appendChild(this.pathE);
}
VectorIcon.prototype.setColor=function(color){
	this.color=color;
	this.pathE.setAttributeNS(null,"fill",this.color);
}
VectorIcon.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	this.group.setAttributeNS(null,"transform","translate("+this.x+","+this.y+") scale("+this.scale+")");
};
/* Deletes the icon and removes the path from its parent group. */
VectorIcon.prototype.remove=function(){
	this.pathE.remove();
};
//Highlights where the current block will go
function Highlighter(){
	Highlighter.path=Highlighter.createPath();
	Highlighter.visible=false;
}
Highlighter.createPath=function(){
	var bG=BlockGraphics.highlight;
	var path=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	path.setAttributeNS(null,"stroke",bG.strokeC);
	path.setAttributeNS(null,"stroke-width",bG.strokeW);
	path.setAttributeNS(null,"fill","none");
	return path;
}
Highlighter.highlight=function(x,y,width,height,type,isSlot,isGlowing){
	var myX = CodeManager.dragAbsToRelX(x);
	var myY = CodeManager.dragAbsToRelX(y);
	var pathD=BlockGraphics.buildPath.highlight(myX, myY, width,height,type,isSlot);
	Highlighter.path.setAttributeNS(null,"d",pathD);
	if(!Highlighter.visible){
		GuiElements.layers.highlight.appendChild(Highlighter.path);
		Highlighter.visible=true;
	}
	var bG=BlockGraphics.highlight;
	if(isGlowing!=null&&isGlowing){
		Highlighter.path.setAttributeNS(null,"stroke",bG.strokeDarkC);
	}
	else{
		Highlighter.path.setAttributeNS(null,"stroke",bG.strokeC);
	}
};
Highlighter.hide=function(){
	if(Highlighter.visible){
		Highlighter.path.remove();
		Highlighter.visible=false;
	}
};
function DisplayBox(){
	var DB=DisplayBox;
	DB.layer=GuiElements.layers.display;
	DB.buildElements();
	DB.visible=false;
}
DisplayBox.setGraphics=function(){
	var DB=DisplayBox;
	DB.bgColor=Colors.white;
	DB.fontColor=Colors.black;
	DB.fontSize=35;
	DB.font="Arial";
	DB.fontWeight="normal";
	DB.charHeight=25;
	DB.screenMargin=60;
	DB.rectH=50;
	
	DB.rectX=DB.screenMargin;
	DB.rectY=GuiElements.height-DB.rectH-DB.screenMargin;
	DB.rectW=GuiElements.width-2*DB.screenMargin;
};
DisplayBox.buildElements=function(){
	var DB=DisplayBox;
	DB.rectE=GuiElements.draw.rect(DB.rectX,DB.rectY,DB.rectW,DB.rectH,DB.bgColor);
	DB.textE=GuiElements.draw.text(0,0,"",DB.fontSize,DB.fontColor,DB.font,DB.fontWeight);
	TouchReceiver.addListenersDisplayBox(DB.rectE);
	TouchReceiver.addListenersDisplayBox(DB.textE);
};
DisplayBox.updateZoom=function(){
	var DB=DisplayBox;
	DB.rectY=GuiElements.height-DB.rectH-DB.screenMargin;
	DB.rectW=GuiElements.width-2*DB.screenMargin;
	var textW=GuiElements.measure.textWidth(DB.textE);
	var textX=DB.rectX+DB.rectW/2-textW/2;
	var textY=DB.rectY+DB.rectH/2+DB.charHeight/2;
	GuiElements.move.text(DB.textE,textX,textY);
	GuiElements.update.rect(DB.rectE,DB.rectX,DB.rectY,DB.rectW,DB.rectH);
};
DisplayBox.displayText=function(text){
	var DB=DisplayBox;
	GuiElements.update.textLimitWidth(DB.textE,text,DB.rectW);
	var textW=GuiElements.measure.textWidth(DB.textE);
	var textX=DB.rectX+DB.rectW/2-textW/2;
	var textY=DB.rectY+DB.rectH/2+DB.charHeight/2;
	GuiElements.move.text(DB.textE,textX,textY);
	DB.show();
};
DisplayBox.show=function(){
	var DB=DisplayBox;
	if(!DB.visible){
		DB.layer.appendChild(DB.rectE);
		DB.layer.appendChild(DB.textE);
		DB.visible=true;
	}
};
DisplayBox.hide=function(){
	var DB=DisplayBox;
	if(DB.visible){
		DB.textE.remove();
		DB.rectE.remove();
		DB.visible=false;
	}
};



/* CodeManager is a static class that controls block execution.
 * It also moves the BlockStack that the user is dragging.
 */
function CodeManager(){
	var move=CodeManager.move; //shorthand
	move.moving=false; //Is there a BlockStack that is currently moving?
	move.stack=null; //Reference to BlockStack that is currently moving.
	move.offsetX=0; //The difference between the BlockStack's x and the touch x.
	move.offsetY=0; //The difference between the BlockStack's y and the touch y.
	move.touchX=0; //The x coord of the user's finger.
	move.touchY=0; //The y coord of the user's finger.
	move.topX=0; //The top-left corner's x coord of the BlockStack being moved.
	move.topY=0; //The top-left corner's y-coord of the BlockStack being moved.
	move.bottomX=0; //The bottom-right corner
	move.bottomY=0;
	move.showTrash = false; //The trash can only shows if the blocks originated from the tabSpace
	//The return type of the BlockStack. (none unless it is a reporter, predicate, etc.)
	move.returnType;

	CodeManager.variableList=new Array();
	CodeManager.listList=new Array();
	CodeManager.broadcastList=new Array(); //A list of broadcast messages in use.
	CodeManager.isRunning=false; //Are at least some Blocks currently executing?
	//Stores information used when determine which slot is closest to the moving stack.
	CodeManager.fit=function(){};
	CodeManager.updateTimer=null; //A timer which tells executing Blocks to update.
	CodeManager.updateInterval=10; //How quickly does the update timer fire (in ms)?
	//Stores the answer to the "ask" block. When the app first opens, the answer is an empty string.
	CodeManager.answer=new StringData("");
	CodeManager.message=new StringData(""); //Stores the broadcast message.
	CodeManager.sound=function(){};
	CodeManager.sound.tempo=60; //Default tempo is 60 bpm for sound blocks.
	CodeManager.sound.volume=50; //Default volume if 50%.
	//Successive prompt dialogs have a time delay to give time for the user to stop the program.
	CodeManager.repeatDialogDelay=500;
	CodeManager.lastDialogDisplayTime=null;
	CodeManager.repeatHBOutDelay=67;
	CodeManager.reservedStackHBoutput=null;
	CodeManager.lastHBOutputSendTime=null;
	CodeManager.timerForSensingBlock=new Date().getTime(); //Initialize the timer to the current time.
}
/* CodeManager.move contains function to start, stop, and update the movement of a BlockStack.
 * These functions are called by the TouchReciever class when the user drags a BlockStack.
 */
CodeManager.move=function(){};
/* Picks up a Block so that it can be moved.  Stores necessary information in CodeManager.move.
 * Transfers the BlockStack into the drag layer above other blocks.
 * @param {Block} block - The block the user dragged.
 * @param {number} x - The x coord of the user's finger.
 * @param {number} y - The y coord of the user's finger.
 */
CodeManager.move.start=function(block,x,y){
	var move=CodeManager.move; //shorthand
	if(!move.moving){ //Only start moving the Block if no other Blocks are moving.
		GuiElements.overlay.close(); //Close any visible overlays.
		move.moving=true; //Record that a Block is now moving.
		/* Disconnect the Block from its current BlockStack to form a new BlockStack 
		containing only the Block and the Blocks below it. */
		var stack=block.unsnap();
		stack.fly(); //Make the new BlockStack fly (moves it into the drag layer).
		move.bottomX=stack.relToAbsX(stack.dim.rx); //Store the BlockStack's dimensions.
		move.bottomY=stack.relToAbsY(stack.dim.rh);
		move.returnType=stack.returnType; //Store the BlockStack's return type.
		move.showTrash = !BlockPalette.IsStackOverPalette(x, y);
		
		//Store other information about how the BlockStack can connect to other Blocks.
		move.bottomOpen=stack.getLastBlock().bottomOpen;
		move.topOpen=stack.firstBlock.topOpen;
		move.returnsValue=stack.firstBlock.returnsValue;
		//move.hasBlockSlot1=stack.firstBlock.hasBlockSlot1;
		//move.hasBlockSlot2=stack.firstBlock.hasBlockSlot2;

		move.touchX=x; //Store coords
		move.touchY=y;
		move.offsetX=stack.getAbsX()-x; //Store offset.
		move.offsetY=stack.getAbsY()-y;
		move.stack=stack; //Store stack.
	}
}
/* Updates the position of the currently moving BlockStack.  
 * Also highlights the slot that fits it best (if any).
 * @param {number} x - The x coord of the user's finger.
 * @param {number} y - The y coord of the user's finger.
 */
CodeManager.move.update=function(x,y){
	var move=CodeManager.move; //shorthand
	if(move.moving){ //Only update if a BlockStack is currently moving.
		move.touchX = x;
		move.touchY = y;
		move.topX = move.offsetX+x;
		move.topY = move.offsetY+y;
		move.bottomX=move.stack.relToAbsX(move.stack.dim.rw);
		move.bottomY=move.stack.relToAbsY(move.stack.dim.rh);
		move.stack.move(move.stack.setAbsX(move.topX),move.stack.setAbsX(move.topY)); //Move the BlockStack to the correct location.
		//If the BlockStack overlaps with the BlockPalette then no slots are highlighted.
		if (BlockPalette.IsStackOverPalette(move.touchX, move.touchY)) {
			Highlighter.hide(); //Hide any existing highlight.
			if(move.showTrash) {
				BlockPalette.ShowTrash();
			}
		} else {
			BlockPalette.HideTrash();
			//The slot which fits it best (if any) will be stored in CodeManager.fit.bestFit.
			CodeManager.findBestFit();
			if(CodeManager.fit.found){
				CodeManager.fit.bestFit.highlight(); //If such a slot exists, highlight it.
			}
			else{
				Highlighter.hide(); //If not, hide any existing highlight.
			}
		}
	}
};
/* Drops the BlockStack that is currently moving and connects it to the Slot/Block that fits it.
 */
CodeManager.move.end=function(){
	var move=CodeManager.move; //shorthand
	var fit=CodeManager.fit; //shorthand
	if(move.moving){ //Only run if a BlockStack is currently moving.
		move.topX = move.offsetX+move.touchX;
		move.topY = move.offsetY+move.touchY;
		move.bottomX=move.stack.relToAbsX(move.stack.dim.rw);
		move.bottomY=move.stack.relToAbsY(move.stack.dim.rh);
		//If the BlockStack overlaps with the BlockPalette, delete it.
		if(BlockPalette.IsStackOverPalette(move.touchX, move.touchY)){
			move.stack.delete();
			if(move.showTrash) {
				SaveManager.markEdited();
			}
		} else {
			//The Block/Slot which fits it best (if any) will be stored in CodeManager.fit.bestFit.
			CodeManager.findBestFit();
			if(fit.found){
				//Snap is onto the Block/Slot that fits it best.
				fit.bestFit.snap(move.stack.firstBlock);
			}
			else{
				//If it is not going to be snapped or deleted, simply drop it onto the current tab.
				move.stack.land();
				move.stack.updateDim(); //Fix! this line of code might not be needed.
			}
			SaveManager.markEdited();
		}
		Highlighter.hide(); //Hide any existing highlight.
		move.moving=false; //There are now no moving BlockStacks.
		BlockPalette.HideTrash();
	}
};
/* Drops the BlockStack where it is without attaching it to anything or deleting it.
 */
CodeManager.move.interrupt=function(){
	var move=CodeManager.move; //shorthand
	if(move.moving) { //Only run if a BlockStack is currently moving.
		move.topX = move.offsetX + move.touchX;
		move.topY = move.offsetY + move.touchY;
		move.stack.land();
		move.stack.updateDim(); //Fix! this line of code might not be needed.
		Highlighter.hide(); //Hide any existing highlight.
		move.moving = false; //There are now no moving BlockStacks.
	}
}
/* Returns a boolean indicating if a point falls within a rectangular region. 
 * Useful for determining which Blocks a moving BlockStack can connect to.
 * @param {number} x1 - The x coord of the point.
 * @param {number} y1 - The y coord of the point.
 * @param {number} yR - The x coord of the top-left corner of the region.
 * @param {number} yY - The y coord of the top-left corner of the region.
 * @param {number} width - The width of the region.
 * @param {number} height - The height of the region.
 * @return {boolean} - Is the point within the region?
 */
CodeManager.move.pInRange=function(x1,y1,xR,yR,width,height){
	//Checks to see if the point is on the correct side of all four sides of the rectangular region.
	return (x1>=xR && x1<=xR+width && y1>=yR && y1<=yR+height);
}
/* Returns a boolean indicating if two rectangular regions overlap.
 * Useful for determining which Slots a moving BlockStack can connect to.
 * @param {number} x1 - The x coord of the top-left corner of the first region.
 * @param {number} y1 - The y coord of the top-left corner of the first region.
 * @param {number} width1 - The width of the first region.
 * @param {number} height1 - The height of the first region.
 * @param {number} x2 - The x coord of the top-left corner of the second region.
 * @param {number} y2 - The y coord of the top-left corner of the second region.
 * @param {number} width2 - The width of the second region.
 * @param {number} height2 - The height of the second region.
 * @return {boolean} - Do the rectangular regions overlap?
 */
CodeManager.move.rInRange=function(x1,y1,width1,height1,x2,y2,width2,height2){
	//These conditions check that there are no vertical or horizontal gaps between the regions.
	//Is the right side of region 1 to the right of the left side of region 2?
	var xBigEnough = x1+width1>=x2;
	//Is the bottom side of region 1 below the top side of region 2?
	var yBigEnough = y1+height1>=y2;
	//Is the left side of region 1 to the left of the right side of region 2?
	var xSmallEnough = x1<=x2+width2;
	//Is the top side of region 1 above the bottom side of region 2?
	var ySmallEnough = y1<=y2+height2;
	//If it passes all 4 checks, the regions overlap.
	return xBigEnough&&yBigEnough&&xSmallEnough&&ySmallEnough;
}
/* Recursively searches for the Block/Slot that best fits the moving BlockStack.
 * All results are stored in CodeManager.fit.  Nothing is returned.
 */
CodeManager.findBestFit=function(){
	var fit=CodeManager.fit; //shorthand
	fit.found=false; //Have any matching slot/block been found?
	fit.bestFit=null; //Slot/Block that is closest to the item?
	fit.dist=0; //How far is the best candidate from the ideal location?
	TabManager.activeTab.findBestFit(); //Begins the recursive calls.
}
/* Recursively updates any Blocks that are currently executing.
 * Stops the update timer if all Blocks are finished.
 */
CodeManager.updateRun=function(){
	var CM=CodeManager;
	var startingReservation=CM.reservedStackHBoutput;
	if(!TabManager.updateRun().isRunning()){ //A recursive call.  Returns true if any Blocks are running.
		CM.stopUpdateTimer(); //If no Blocks are running, stop the update timer.
	}
	var now=new Date().getTime();
	var timeExpired=now-CM.repeatHBOutDelay>=CM.lastHBOutputSendTime;
	if(CM.reservedStackHBoutput!=null&&CM.reservedStackHBoutput==startingReservation&&timeExpired) {
		CM.reservedStackHBoutput = null;
	}
};
/* Recursively stops all Block execution.
 */
CodeManager.stop=function(){
	Device.stopAll(); //Stop any motors and LEDs on the devices
	TabManager.stop(); //Recursive call.
	CodeManager.stopUpdateTimer(); //Stop the update timer.
	DisplayBox.hide(); //Hide any messages being displayed.
	Sounds.stopAllSounds() // Stops all sounds and tones
	                       // Note: Tones are not allowed to be async, so they 
	                       // must be stopped manually
}
/* Stops the update timer.
 */
CodeManager.stopUpdateTimer=function(){
	if(CodeManager.isRunning){ //If the timer is currently running...
		//...Stop the timer.
		CodeManager.updateTimer = window.clearInterval(CodeManager.updateTimer);
		CodeManager.isRunning=false;
	}
}
/* Starts the update timer.  When it fires, the timer will call the CodeManager.updateRun function.
 */
CodeManager.startUpdateTimer=function(){
	if(!CodeManager.isRunning){ //If the timer is not running...
		//...Start the timer.
		CodeManager.updateTimer = self.setInterval(DebugOptions.safeFunc(CodeManager.updateRun), CodeManager.updateInterval);
		CodeManager.isRunning=true;
	}
}
/* Recursively passes on the message that the flag button was tapped.
 * @fix method name.
 */
CodeManager.eventFlagClicked=function(){
	TabManager.eventFlagClicked();
}
/**/
CodeManager.checkDialogDelay=function(){
	var CM=CodeManager;
	var now=new Date().getTime();
	if(CM.lastDialogDisplayTime==null||now-CM.repeatDialogDelay>=CM.lastDialogDisplayTime){
		return true;
	}
	else{
		return false;
	}
}
CodeManager.updateDialogDelay=function(){
	var CM=CodeManager;
	var now=new Date().getTime();
	CM.lastDialogDisplayTime=now;
};
CodeManager.checkHBOutputDelay=function(stack){
	return true;
	var CM=CodeManager;
	var now=new Date().getTime();
	var stackReserved=CM.reservedStackHBoutput!=null&&CM.reservedStackHBoutput!=stack;
	if(CM.lastHBOutputSendTime==null||(now-CM.repeatHBOutDelay>=CM.lastHBOutputSendTime&&!stackReserved)){
		if(CM.reservedStackHBoutput==stack){
			CM.reservedStackHBoutput=null;
		}
		return true;
	}
	else{
		if(CM.reservedStackHBoutput==null){
			CM.reservedStackHBoutput=stack;
		}
		return false;
	}
};
CodeManager.updateHBOutputDelay=function(){
	CodeManager.lastHBOutputSendTime=new Date().getTime();
};
/* @fix Write documentation.
 */
CodeManager.addVariable=function(variable){
	CodeManager.variableList.push(variable);
};
/* @fix Write documentation.
 */
CodeManager.removeVariable=function(variable){
	var index=CodeManager.variableList.indexOf(variable);
	CodeManager.variableList.splice(index,1);
};
/* @fix Write documentation.
 */
CodeManager.newVariable=function(){
	var callbackFn=function(cancelled,result) {
		if(!cancelled&&CodeManager.checkVarName(result)) {
			result=result.trim();
			new Variable(result);
			SaveManager.markEdited();
			BlockPalette.getCategory("variables").refreshGroup();
		}
	};
	HtmlServer.showDialog("Create variable","Enter variable name","",callbackFn);
};
CodeManager.checkVarName=function(name){
	name=name.trim();
	if(name.length>0){
		var variables=CodeManager.variableList;
		for(var i=0;i<variables.length;i++){
			if(variables[i].getName()==name){
				return false;
			}
		}
		return true;
	}
	return false;
};
CodeManager.findVar=function(name){
	var variables=CodeManager.variableList;
	for(var i=0;i<variables.length;i++){
		if(variables[i].getName()==name){
			return variables[i];
		}
	}
	return null;
};
/* @fix Write documentation.
 */
CodeManager.addList=function(list){
	CodeManager.listList.push(list);
};
/* @fix Write documentation.
 */
CodeManager.removeList=function(list){
	var index=CodeManager.listList.indexOf(list);
	CodeManager.listList.splice(index,1);
};
/* @fix Write documentation.
 */
CodeManager.newList=function(){
	var callbackFn=function(cancelled,result) {
		if(!cancelled&&CodeManager.checkListName(result)) {
			result=result.trim();
			new List(result);
			SaveManager.markEdited();
			BlockPalette.getCategory("variables").refreshGroup();
		}
	};
	HtmlServer.showDialog("Create list","Enter list name","",callbackFn);
};
/* @fix Write documentation.
 */
CodeManager.checkListName=function(name){
	name=name.trim();
	if(name.length>0){
		var lists=CodeManager.listList;
		for(var i=0;i<lists.length;i++){
			if(lists[i].getName()==name){
				return false;
			}
		}
		return true;
	}
	return false;
};
CodeManager.findList=function(name){
	var lists=CodeManager.listList;
	for(var i=0;i<lists.length;i++){
		if(lists[i].getName()==name){
			return lists[i];
		}
	}
	return null;
};
/* @fix Write documentation.
 */
CodeManager.newBroadcastMessage=function(slot){
	slot.deselect();
	var callbackFn=function(cancelled,result) {
		if(!cancelled&&result.length>0){
			result=result.trim();
			CodeManager.addBroadcastMessage(result);
			slot.setSelectionData('"'+result+'"',new StringData(result));
		}
	};
	HtmlServer.showDialog("Create broadcast message","Enter message name","",callbackFn);
};
/* @fix Write documentation.
 */
CodeManager.checkBroadcastMessage=function(message){
	var messages=CodeManager.broadcastList;
	for(var i=0;i<messages.length;i++){
		if(messages[i]==message){
			return false;
		}
	}
	return true;
};
/* @fix Write documentation.
 */
CodeManager.addBroadcastMessage=function(message){
	if(CodeManager.checkBroadcastMessage(message)){
		CodeManager.broadcastList.push(message);
	}
};
/* @fix Write documentation.
 */
CodeManager.removeUnusedMessages=function(){
	var messages=CodeManager.broadcastList;
	for(var i=0;i<messages.length;i++){
		if(!TabManager.checkBroadcastMessageAvailable(messages[i])){
			messages.splice(i,1);
		}
	}
};
/* @fix Write documentation.
 */
CodeManager.updateAvailableMessages=function(){
	CodeManager.broadcastList=new Array();
	TabManager.updateAvailableMessages();
};
/* @fix Write documentation.
 */
CodeManager.eventBroadcast=function(message){
	TabManager.eventBroadcast(message);
};
CodeManager.hideDeviceDropDowns=function(deviceClass){
	TabManager.hideDeviceDropDowns(deviceClass);
	BlockPalette.hideDeviceDropDowns(deviceClass);
};
CodeManager.showDeviceDropDowns=function(deviceClass){
	TabManager.showDeviceDropDowns(deviceClass);
	BlockPalette.showDeviceDropDowns(deviceClass);
};
CodeManager.countDevicesInUse=function(deviceClass){
	return TabManager.countDevicesInUse(deviceClass);
};
/* @fix Write documentation.
 */
CodeManager.checkBroadcastRunning=function(message){
	return TabManager.checkBroadcastRunning(message);
};

CodeManager.createXml=function(){
	var CM=CodeManager;
	var xmlDoc = XmlWriter.newDoc("project");
	var project=xmlDoc.getElementsByTagName("project")[0];
	var fileName="project";
	if(SaveManager.named){
		fileName=SaveManager.fileName;
	}
	XmlWriter.setAttribute(project,"name",fileName);
	XmlWriter.setAttribute(project,"appVersion",GuiElements.appVersion);
	XmlWriter.setAttribute(project,"created",new Date().getTime());
	XmlWriter.setAttribute(project,"modified",new Date().getTime());
	var variables=XmlWriter.createElement(xmlDoc,"variables");
	for(var i=0;i<CM.variableList.length;i++){
		variables.appendChild(CM.variableList[i].createXml(xmlDoc));
	}
	project.appendChild(variables);
	var lists=XmlWriter.createElement(xmlDoc,"lists");
	for(i=0;i<CM.listList.length;i++){
		lists.appendChild(CM.listList[i].createXml(xmlDoc));
	}
	project.appendChild(lists);
	project.appendChild(TabManager.createXml(xmlDoc));
	return xmlDoc;
};
CodeManager.importXml=function(projectNode){
	CodeManager.deleteAll();
	var variablesNode=XmlWriter.findSubElement(projectNode,"variables");
	if(variablesNode!=null) {
		var variableNodes=XmlWriter.findSubElements(variablesNode,"variable");
		for (var i = 0; i < variableNodes.length; i++) {
			Variable.importXml(variableNodes[i]);
		}
	}
	var listsNode=XmlWriter.findSubElement(projectNode,"lists");
	if(listsNode!=null) {
		var listNodes = XmlWriter.findSubElements(listsNode, "list");
		for (i = 0; i < listNodes.length; i++) {
			List.importXml(listNodes[i]);
		}
	}
	BlockPalette.getCategory("variables").refreshGroup();
	var tabsNode=XmlWriter.findSubElement(projectNode,"tabs");
	TabManager.importXml(tabsNode);
	DeviceManager.updateSelectableDevices();
};
CodeManager.deleteAll=function(){
	var CM=CodeManager;
	CM.stop();
	TabManager.deleteAll();
	CodeManager();
};
CodeManager.renameVariable=function(variable){
	TabManager.renameVariable(variable);
	BlockPalette.getCategory("variables").refreshGroup();
};
CodeManager.deleteVariable=function(variable){
	TabManager.deleteVariable(variable);
	BlockPalette.getCategory("variables").refreshGroup();
};
CodeManager.renameList=function(list){
	TabManager.renameList(list);
	BlockPalette.getCategory("variables").refreshGroup();
};
CodeManager.deleteList=function(list){
	TabManager.deleteList(list);
	BlockPalette.getCategory("variables").refreshGroup();
};
CodeManager.checkVariableUsed=function(variable){
	return TabManager.checkVariableUsed(variable);
};
CodeManager.checkListUsed=function(list){
	return TabManager.checkListUsed(list);
};
CodeManager.beatsToMs=function(beats){
	var tempo=CodeManager.sound.tempo;
	var res=beats/tempo*60*1000;
	if(isNaN(res)||!isFinite(res)){
		return 0;
	}
	return res;
};
CodeManager.setSoundTempo=function(newTempo){
	if(isFinite(newTempo)&&!isNaN(newTempo)){
		if(newTempo>=500){
			CodeManager.sound.tempo=500;
		}
		else if(newTempo<=20){
			CodeManager.sound.tempo=20;
		}
		else{
			CodeManager.sound.tempo=newTempo;
		}
	}
};
CodeManager.dragAbsToRelX=function(x){
	return x / TabManager.getActiveZoom();
};
CodeManager.dragAbsToRelY=function(y){
	return y / TabManager.getActiveZoom();
};
CodeManager.dragRelToAbsX=function(x){
	return x * TabManager.getActiveZoom();
};
CodeManager.dragRelToAbsY=function(y){
	return y * TabManager.getActiveZoom();
};
function TabManager(){
	var TM=TabManager;
	TM.tabList=new Array();
	TM.activeTab=null;
	TM.createInitialTab();
	TabManager.createTabSpaceBg();
	TM.isRunning=false;
	TM.scrolling=false;
	TM.zooming = false;
}
TabManager.setGraphics=function(){
	var TM=TabManager;
	TM.bg=Colors.black;

	TM.minZoom = 0.35;
	TM.maxZoom = 3;

	TM.tabAreaX=BlockPalette.width;
	TM.tabAreaY=TitleBar.height;
	TM.tabAreaWidth=GuiElements.width-BlockPalette.width;

	/* No longer different from tabArea since tab bar was removed */
	TM.tabSpaceX=BlockPalette.width;
	TM.tabSpaceY=TitleBar.height;
	TM.tabSpaceWidth=GuiElements.width-TM.tabSpaceX;
	TM.tabSpaceHeight=GuiElements.height-TM.tabSpaceY;
	TM.spaceScrollMargin=50;
};
TabManager.createTabSpaceBg=function(){
	var TM=TabManager;
	TM.bgRect=GuiElements.draw.rect(TM.tabSpaceX,TM.tabSpaceY,TM.tabSpaceWidth,TM.tabSpaceHeight,Colors.lightGray);
	TouchReceiver.addListenersTabSpace(TM.bgRect);
	GuiElements.layers.aTabBg.appendChild(TM.bgRect);
};
TabManager.updatePositions=function(){
	/* This might not be needed now that tabs aren't visible */
};
TabManager.addTab=function(tab){
	TabManager.tabList.push(tab);
};
TabManager.removeTab=function(tab){
	var index=TabManager.tabList.indexOf(tab);
	TabManager.stackList.splice(index,1);
};
TabManager.createInitialTab=function(){
	var TM=TabManager;
	var t=new Tab();
	TM.activateTab(TM.tabList[0]);
	TM.updatePositions();
};
TabManager.activateTab=function(tab){
	if(TabManager.activeTab!=null){
		TabManager.activeTab.deactivate();
	}
	tab.activate();
	TabManager.activeTab=tab;
};
TabManager.eventFlagClicked=function(){
	TabManager.passRecursively("eventFlagClicked");
};
TabManager.eventBroadcast=function(message){
	TabManager.passRecursively("eventBroadcast",message);
};
TabManager.checkBroadcastRunning=function(message){
	if(this.isRunning){
		for(var i=0;i<TabManager.tabList.length;i++){
			if(TabManager.tabList[i].checkBroadcastRunning(message)){
				return true;
			}
		}
	}
	return false;
};
TabManager.checkBroadcastMessageAvailable=function(message){
	for(var i=0;i<TabManager.tabList.length;i++){
		if(TabManager.tabList[i].checkBroadcastMessageAvailable(message)){
			return true;
		}
	}
	return false;
};
TabManager.updateAvailableMessages=function(){
	TabManager.passRecursively("updateAvailableMessages");
};
/**
 * @returns {ExecutionStatus}
 */
TabManager.updateRun=function(){	
	if(!this.isRunning){
		return false;
	}
	var rVal=false;
	for(var i=0;i<TabManager.tabList.length;i++){
		rVal = TabManager.tabList[i].updateRun().isRunning() || rVal;
	}
	this.isRunning=rVal;
	if(this.isRunning){
		return new ExecutionStatusRunning();
	} else {
		return new ExecutionStatusDone();
	}
};
TabManager.stop=function(){
	TabManager.passRecursively("stop");
	this.isRunning=false;
}
TabManager.stopAllButStack=function(stack){
	TabManager.passRecursively("stopAllButStack",stack);
};
TabManager.startRun=function(){
	TabManager.isRunning=true;
	CodeManager.startUpdateTimer();
}
TabManager.startScroll=function(x,y){
	var TM=TabManager;
	if(!TM.scrolling){
		TM.scrolling=true;
		TM.activeTab.startScroll(x,y);
	}
};
TabManager.updateScroll=function (x,y){
	var TM=TabManager;
	if(TM.scrolling){
		TM.activeTab.updateScroll(x,y);
	}
};
TabManager.endScroll=function(){
	var TM=TabManager;
	if(TM.scrolling){
		TM.scrolling=false;
		TM.activeTab.endScroll();
	}
};
TabManager.startZooming = function(x1, y1, x2, y2){
	var TM=TabManager;
	if(!TM.zooming){
		TM.zooming = true;
		TM.activeTab.startZooming(x1, y1, x2, y2);
	}
};
TabManager.updateZooming = function(x1, y1, x2, y2){
	var TM=TabManager;
	if(TM.zooming){
		TM.activeTab.updateZooming(x1, y1, x2, y2);
	}
};
TabManager.endZooming = function(){
	var TM=TabManager;
	if(TM.zooming){
		TM.zooming = false;
		TM.activeTab.endZooming();
	}
};
TabManager.createXml=function(xmlDoc){
	var TM=TabManager;
	var tabs=XmlWriter.createElement(xmlDoc,"tabs");
	//XmlWriter.setAttribute(tabs,"active",TM.activeTab.name);
	for(var i=0;i<TM.tabList.length;i++){
		tabs.appendChild(TM.tabList[i].createXml(xmlDoc));
	}
	return tabs;
};
TabManager.importXml=function(tabsNode){
	var TM=TabManager;
	if(tabsNode!=null) {
		var tabNodes = XmlWriter.findSubElements(tabsNode, "tab");
		//var active = XmlWriter.getAttribute(tabsNode, "active");
		for (var i = 0; i < tabNodes.length; i++) {
			Tab.importXml(tabNodes[i]);
		}
	}
	TM.updatePositions();
	if(TM.tabList.length==0){
		TM.createInitialTab();
	}
	else{
		TM.activateTab(TM.tabList[0]);
	}
};
TabManager.deleteAll=function(){
	var TM=TabManager;
	for(var i=0;i<TM.tabList.length;i++){
		TM.tabList[i].delete();
	}
	TM.tabList=new Array();
	TM.activeTab=null;
	TM.isRunning=false;
	TM.scrolling=false;
};
TabManager.renameVariable=function(variable){
	TabManager.passRecursively("renameVariable",variable);
};
TabManager.deleteVariable=function(variable){
	TabManager.passRecursively("deleteVariable",variable);
};
TabManager.renameList=function(list){
	TabManager.passRecursively("renameList",list);
};
TabManager.deleteList=function(list){
	TabManager.passRecursively("deleteList",list);
};
TabManager.checkVariableUsed=function(variable){
	for(var i=0;i<TabManager.tabList.length;i++){
		if(TabManager.tabList[i].checkVariableUsed(variable)){
			return true;
		}
	}
	return false;
};
TabManager.checkListUsed=function(list){
	for(var i=0;i<TabManager.tabList.length;i++){
		if(TabManager.tabList[i].checkListUsed(list)){
			return true;
		}
	}
	return false;
};
TabManager.hideDeviceDropDowns=function(deviceClass){
	TabManager.passRecursively("hideDeviceDropDowns", deviceClass);
};
TabManager.showDeviceDropDowns=function(deviceClass){
	TabManager.passRecursively("showDeviceDropDowns", deviceClass);
};
TabManager.countDevicesInUse=function(deviceClass){
	var largest=1;
	for(var i=0;i<TabManager.tabList.length;i++){
		largest=Math.max(largest,TabManager.tabList[i].countDevicesInUse(deviceClass));
	}
	return largest;
};
TabManager.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	for(var i=0;i<TabManager.tabList.length;i++){
		var currentList=TabManager.tabList[i];
		currentList[functionName].apply(currentList,args);
	}
};
TabManager.updateZoom=function(){
	var TM=TabManager;
	TM.tabAreaWidth=GuiElements.width-BlockPalette.width;
	TM.tabSpaceWidth=GuiElements.width-TM.tabSpaceX;
	TM.tabSpaceHeight=GuiElements.height-TM.tabSpaceY;
	GuiElements.update.rect(TM.bgRect,TM.tabSpaceX,TM.tabSpaceY,TM.tabSpaceWidth,TM.tabSpaceHeight);
	TabManager.passRecursively("updateZoom");
};
TabManager.getActiveZoom = function(){
	if(TabManager.activateTab == null){
		return 1;
	}
	return TabManager.activeTab.getZoom();
};
function Tab(){
	this.mainG=GuiElements.create.group(0,0);
	this.scrollX=0;
	this.scrollY=0;
	this.zoomFactor = 1;
	this.visible=false;
	TabManager.addTab(this);
	this.stackList=new Array();
	this.isRunning=false;
	this.scrolling=false;
	this.zooming = false;
	this.scrollXOffset=50;
	this.scrollYOffset=100;
	this.zoomStartDist=null;
	this.startZoom = null;
	this.updateTransform();
	this.overFlowArr = new OverflowArrows();
	this.dim={};
	this.dim.x1=0;
	this.dim.y1=0;
	this.dim.x2=0;
	this.dim.y2=0;
}
Tab.prototype.activate=function(){
	GuiElements.layers.activeTab.appendChild(this.mainG);
	this.overFlowArr.show();
};
Tab.prototype.addStack=function(stack){
	this.stackList.push(stack);
};
Tab.prototype.removeStack=function(stack){
	var index=this.stackList.indexOf(stack);
	this.stackList.splice(index,1);
};
Tab.prototype.getSprite=function(){
	return this.sprite;
}
Tab.prototype.relToAbsX=function(x){
	return x * this.zoomFactor + this.scrollX;
};
Tab.prototype.relToAbsY=function(y){
	return y * this.zoomFactor + this.scrollY;
};
Tab.prototype.absToRelX=function(x){
	return (x - this.scrollX) / this.zoomFactor;
};
Tab.prototype.absToRelY=function(y){
	return (y - this.scrollY) / this.zoomFactor;
};
Tab.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
Tab.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
Tab.prototype.findBestFit=function(){
	this.passRecursively("findBestFit");
};
Tab.prototype.eventFlagClicked=function(){
	this.passRecursively("eventFlagClicked");
};
Tab.prototype.eventBroadcast=function(message){
	this.passRecursively("eventBroadcast",message);
};
Tab.prototype.checkBroadcastRunning=function(message){
	if(this.isRunning){
		var stacks=this.stackList;
		for(var i=0;i<stacks.length;i++){
			if(stacks[i].checkBroadcastRunning(message)){
				return true;
			}
		}
	}
	return false;
};
Tab.prototype.checkBroadcastMessageAvailable=function(message){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		if(stacks[i].checkBroadcastMessageAvailable(message)){
			return true;
		}
	}
	return false;
};
Tab.prototype.updateAvailableMessages=function(){
	this.passRecursively("updateAvailableMessages");
};
/**
 * @returns {ExecutionStatus}
 */
Tab.prototype.updateRun=function(){
	if(!this.isRunning){
		return false;
	}
	var stacks=this.stackList;
	var rVal=false;
	for(var i=0;i<stacks.length;i++){
		rVal = stacks[i].updateRun().isRunning() || rVal;
	}
	this.isRunning=rVal;
	if(this.isRunning){
		return new ExecutionStatusRunning();
	} else{
		return new ExecutionStatusDone();
	}
};
Tab.prototype.stop=function(){
	this.passRecursively("stop");
	this.isRunning=false;
}
Tab.prototype.stopAllButStack=function(stack){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		if(stacks[i]!=stack) {
			stacks[i].stop();
		}
	}
};
Tab.prototype.startRun=function(){
	this.isRunning=true;
	TabManager.startRun();
}
Tab.prototype.startScroll=function(x,y){
	if(!this.scrolling) {
		this.scrolling = true;
		this.scrollXOffset = this.scrollX - x;
		this.scrollYOffset = this.scrollY - y;
		this.updateTabDim();
	}
};
Tab.prototype.updateScroll=function(x,y){
	if(this.scrolling) {
		this.scrollX=this.scrollXOffset + x;
		this.scrollY=this.scrollYOffset + y;
		GuiElements.move.group(this.mainG,this.scrollX,this.scrollY, this.zoomFactor);
		this.updateArrowsShift();
		/*this.scroll(this.scrollXOffset + x, this.scrollYOffset + y);*/
	}
};
Tab.prototype.scroll=function(x,y) {
	/*
	this.scrollX=x;
	this.scrollY=y;
	GuiElements.move.group(this.mainG,this.scrollX,this.scrollY);
	var dim=this.dim;
	var x1=x+dim.xDiff;
	var y1=y+dim.yDiff;

	var newObjX=this.scrollOneVal(dim.xDiff+this.scrollX,dim.width,x1,TabManager.tabSpaceX,TabManager.tabSpaceWidth);
	var newObjY=this.scrollOneVal(dim.yDiff+this.scrollY,dim.height,y1,TabManager.tabSpaceY,TabManager.tabSpaceHeight);
	this.scrollX=newObjX-dim.xDiff;
	this.scrollY=newObjY-dim.yDiff;
	GuiElements.move.group(this.mainG,this.scrollX,this.scrollY);
	*/
};
Tab.prototype.endScroll=function(){
	this.scrolling = false;
};
Tab.prototype.scrollOneVal=function(objectX,objectW,targetX,containerX,containerW){
	// var minX;
	// var maxX;
	// if(objectW<containerW){
	// 	if(objectX>=containerX&&objectX+objectW<=containerX+containerW){
	// 		return objectX;
	// 	}
	// 	minX=Math.min(containerX,objectX);
	// 	maxX=Math.max(containerX+containerW-objectW,objectX);
	// }
	// else{
	// 	minX=Math.min(containerX+containerW-objectW,objectX);
	// 	maxX=Math.max(containerX,objectX);
	// }
	// var rVal=targetX;
	// rVal=Math.min(rVal,maxX);
	// rVal=Math.max(rVal,minX);
	// return rVal;
};
Tab.prototype.startZooming = function(x1, y1, x2, y2){
	if(!this.zooming) {
		this.zooming = true;
		var x = (x1 + x2) / 2;
		var y = (y1 + y2) / 2;
		this.scrollXOffset = this.scrollX - x;
		this.scrollYOffset = this.scrollY - y;
		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		this.zoomStartDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		this.startZoom = this.zoomFactor;
		this.updateTabDim();
	}
};
Tab.prototype.updateZooming = function(x1, y1, x2, y2){
	if(this.zooming){
		var x = (x1 + x2) / 2;
		var y = (y1 + y2) / 2;
		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		this.zoomFactor = this.startZoom * dist / this.zoomStartDist;
		this.zoomFactor = Math.max(TabManager.minZoom, Math.min(TabManager.maxZoom, this.zoomFactor));
		var zoomRatio = this.zoomFactor / this.startZoom;
		this.scrollX=this.scrollXOffset * zoomRatio + x;
		this.scrollY=this.scrollYOffset * zoomRatio + y;
		this.updateTransform();
		this.updateArrowsShift();
	}
};
Tab.prototype.updateTransform=function(){
	GuiElements.move.group(this.mainG,this.scrollX,this.scrollY, this.zoomFactor);
	GuiElements.update.zoom(GuiElements.layers.drag, this.zoomFactor);
	GuiElements.update.zoom(GuiElements.layers.highlight, this.zoomFactor);
};
Tab.prototype.endZooming = function(){
	this.zooming = false;
};
Tab.prototype.updateTabDim=function(){
	var dim=this.dim;
	dim.width=0;
	dim.height=0;
	dim.x1=null;
	dim.y1=null;
	dim.x2=null;
	dim.y2=null;
	this.passRecursively("updateTabDim");
	if(dim.x1==null){
		dim.x1=0;
		dim.y1=0;
		dim.x2=0;
		dim.y2=0;
	}
};
Tab.prototype.createXml=function(xmlDoc){
	var tab=XmlWriter.createElement(xmlDoc,"tab");
	//XmlWriter.setAttribute(tab,"name",this.name);
	XmlWriter.setAttribute(tab,"x",this.scrollX);
	XmlWriter.setAttribute(tab,"y",this.scrollY);
	XmlWriter.setAttribute(tab,"zoom",this.zoomFactor);
	var stacks=XmlWriter.createElement(xmlDoc,"stacks");
	for(var i=0;i<this.stackList.length;i++){
		stacks.appendChild(this.stackList[i].createXml(xmlDoc));
	}
	tab.appendChild(stacks);
	return tab;
};
Tab.importXml=function(tabNode){
	//var name=XmlWriter.getAttribute(tabNode,"name","Sprite1");
	var x=XmlWriter.getAttribute(tabNode,"x",0,true);
	var y=XmlWriter.getAttribute(tabNode,"y",0,true);
	var zoom = XmlWriter.getAttribute(tabNode, "zoom", 1, true);
	var tab=new Tab();
	tab.scrollX=x;
	tab.scrollY=y;
	tab.zoomFactor = zoom;
	tab.updateTransform();
	var stacksNode=XmlWriter.findSubElement(tabNode,"stacks");
	if(stacksNode!=null){
		var stackNodes=XmlWriter.findSubElements(stacksNode,"stack");
		for(var i=0;i<stackNodes.length;i++){
			BlockStack.importXml(stackNodes[i],tab);
		}
	}
	tab.updateArrows();
	return tab;
};
Tab.prototype.delete=function(){
	this.passRecursively("delete");
	this.mainG.remove();
};
Tab.prototype.renameVariable=function(variable){
	this.passRecursively("renameVariable",variable);
};
Tab.prototype.deleteVariable=function(variable){
	this.passRecursively("deleteVariable",variable);
};
Tab.prototype.renameList=function(list){
	this.passRecursively("renameList",list);
};
Tab.prototype.deleteList=function(list){
	this.passRecursively("deleteList",list);
};
Tab.prototype.checkVariableUsed=function(variable){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		if(stacks[i].checkVariableUsed(variable)){
			return true;
		}
	}
	return false;
};
Tab.prototype.checkListUsed=function(list){
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		if(stacks[i].checkListUsed(list)){
			return true;
		}
	}
	return false;
};
Tab.prototype.hideDeviceDropDowns=function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
};
Tab.prototype.showDeviceDropDowns=function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
};
Tab.prototype.countDevicesInUse=function(deviceClass){
	var largest=1;
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		largest=Math.max(largest,stacks[i].countDevicesInUse(deviceClass));
	}
	return largest;
};
Tab.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	var stacks=this.stackList;
	for(var i=0;i<stacks.length;i++){
		var currentStack=stacks[i];
		var currentL=stacks.length;
		currentStack[functionName].apply(currentStack,args);
		if(currentL!=stacks.length){
			i--;
		}
	}
};
Tab.prototype.getZoom=function(){
	return this.zoomFactor;
};
Tab.prototype.updateZoom=function(){
	this.overFlowArr.updateZoom();
	this.updateArrows();
};
Tab.prototype.updateArrows=function(){
	this.updateTabDim();
	var x1 = this.relToAbsX(this.dim.x1);
	var y1 = this.relToAbsY(this.dim.y1);
	var x2 = this.relToAbsX(this.dim.x2);
	var y2 = this.relToAbsY(this.dim.y2);
	this.overFlowArr.setArrows(x1, x2, y1, y2);
};
Tab.prototype.updateArrowsShift=function(){
	var x1 = this.relToAbsX(this.dim.x1)
	var y1 = this.relToAbsY(this.dim.y1)
	var x2 = this.relToAbsX(this.dim.x2)
	var y2 = this.relToAbsY(this.dim.y2)
	this.overFlowArr.setArrows(x1, x2, y1, y2);
};
/**
 * Created by Tom on 6/17/2017.
 */
function RecordingManager(){
	var RM = RecordingManager;
	RM.recordingStates = {};
	RM.recordingStates.stopped = 0;
	RM.recordingStates.recording = 1;
	RM.recordingStates.paused = 2;
	RM.state = RM.recordingStates.stopped;
	RM.updateTimer = null;
	RM.updateInterval = 200;
	RM.startTime = null;
	RM.pausedTime = 0;
}
RecordingManager.userRenameFile = function(oldFilename, nextAction){
	SaveManager.userRenameFile(true, oldFilename, nextAction);
};
RecordingManager.userDeleteFile=function(filename, nextAction){
	SaveManager.userDeleteFile(true, filename, nextAction);
};
RecordingManager.startRecording=function(){
	var RM = RecordingManager;
	var request = new HttpRequestBuilder("sound/recording/start");
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		if(result == "Started"){
			RM.setState(RM.recordingStates.recording);
			RecordingDialog.startedRecording();
		} else if(result == "Permission denied"){
			let message = "Please grant recording permissions to the BirdBlox app in settings";
			HtmlServer.showAlertDialog("Permission denied", message,"Dismiss");
		} else if(result == "Requesting permission") {

		}
	});
};
RecordingManager.stopRecording=function(){
	var RM = RecordingManager;
	var request = new HttpRequestBuilder("sound/recording/stop");
	var stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), stopRec, stopRec);
};
RecordingManager.pauseRecording=function(){
	var RM = RecordingManager;
	var request = new HttpRequestBuilder("sound/recording/pause");
	var stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	var pauseRec = function(){
		RM.setState(RM.recordingStates.paused);
		RecordingDialog.pausedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), pauseRec, stopRec);
};
RecordingManager.discardRecording = function(){
	var RM = RecordingManager;
	var stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	var message = "Are you sure you would like to delete the current recording?";
	HtmlServer.showChoiceDialog("Delete", message, "Continue recording", "Delete", true, function(result){
		if(result == "2") {
			var request = new HttpRequestBuilder("sound/recording/discard");
			HtmlServer.sendRequestWithCallback(request.toString(), stopRec, stopRec);
		}
	}, stopRec);
};
RecordingManager.resumeRecording = function(){
	var RM = RecordingManager;
	var request = new HttpRequestBuilder("sound/recording/unpause");
	var stopRec = function() {
		RM.setState(RM.recordingStates.stopped);
		RecordingDialog.stoppedRecording();
	};
	var resumeRec = function(){
		RM.setState(RM.recordingStates.recording);
		RecordingDialog.startedRecording();
	};
	HtmlServer.sendRequestWithCallback(request.toString(), resumeRec, stopRec);
};
RecordingManager.listRecordings = function(callbackFn){
	var request = new HttpRequestBuilder("sound/names");
	request.addParam("recording", "true");
	HtmlServer.sendRequestWithCallback(request.toString(), callbackFn);
};
RecordingManager.setState = function(state){
	var RM = RecordingManager;
	var prevState = RM.state;
	RM.state = state;
	var states = RM.recordingStates;



	if(state == states.recording){
		if(RM.updateTimer == null){
			if(prevState == states.stopped) RM.pausedTime = 0;
			RM.startTime = new Date().getTime();
			RM.updateTimer = self.setInterval(RM.updateCounter, RM.updateInterval);
		}
	}
	else if(state == states.paused) {
		if (RM.updateTimer != null) {
			RM.updateTimer = window.clearInterval(RM.updateTimer);
			RM.updateTimer = null;
			RM.pausedTime = RM.getElapsedTime();
		}
	}
	else {
		if (RM.updateTimer != null) {
			RM.updateTimer = window.clearInterval(RM.updateTimer);
			RM.updateTimer = null;
		}
	}
};
RecordingManager.updateCounter = function(){
	var RM = RecordingManager;
	RecordingDialog.updateCounter(RM.getElapsedTime());
};
RecordingManager.getElapsedTime = function(){
	var RM = RecordingManager;
	return new Date().getTime() - RM.startTime + RM.pausedTime;
};
/**
 * Created by Tom on 6/13/2017.
 */

function RowDialog(autoHeight, title, rowCount, extraTop, extraBottom){
	this.autoHeight = autoHeight;
	this.title = title;
	this.rowCount = rowCount;
	this.centeredButtons = [];
	this.extraTopSpace = extraTop;
	this.extraBottomSpace = extraBottom;
	this.visible = false;
	this.hintText = "";
}
RowDialog.setConstants=function(){
	RowDialog.currentDialog=null;

	RowDialog.titleBarColor=Colors.lightGray;
	RowDialog.titleBarFontC=Colors.white;
	RowDialog.bgColor=Colors.black;
	RowDialog.titleBarH=30;
	RowDialog.centeredBnWidth=100;
	RowDialog.bnHeight=MenuBnList.bnHeight;
	RowDialog.bnMargin=5;
	RowDialog.minWidth = 400;
	RowDialog.minHeight = 200;

	RowDialog.fontSize=16;
	RowDialog.font="Arial";
	RowDialog.titleFontWeight="bold";
	RowDialog.centeredfontWeight="bold";
	RowDialog.charHeight=12;
	RowDialog.smallBnWidth = 45;
	RowDialog.iconH = 15;
};
RowDialog.prototype.addCenteredButton = function(text, callbackFn){
	let entry = {};
	entry.text = text;
	entry.callbackFn = callbackFn;
	this.centeredButtons.push(entry);
};

RowDialog.prototype.show = function(){
	if(!this.visible) {
		this.visible = true;
		RowDialog.currentDialog=this;
		this.calcHeights();
		this.calcWidths();
		this.x = GuiElements.width / 2 - this.width / 2;
		this.y = GuiElements.height / 2 - this.height / 2;
		this.group = GuiElements.create.group(this.x, this.y);
		this.bgRect = this.drawBackground();

		this.titleRect = this.createTitleRect();
		this.titleText = this.createTitleLabel(this.title);

		this.rowGroup = this.createContent();
		this.createCenteredBns();
		this.scrollBox = this.createScrollBox(); // could be null
		if (this.scrollBox != null) {
			this.scrollBox.show();
		}

		GuiElements.layers.overlay.appendChild(this.group);

		GuiElements.blockInteraction();
	}
};
RowDialog.prototype.calcHeights = function(){
	var RD = RowDialog;
	let centeredBnHeight = (RD.bnHeight + RD.bnMargin) * this.centeredButtons.length + RD.bnMargin;
	let nonScrollHeight = RD.titleBarH + centeredBnHeight + RD.bnMargin;
	nonScrollHeight += this.extraTopSpace + this.extraBottomSpace;
	let minHeight = Math.max(GuiElements.height / 2, RD.minHeight);
	let ScrollHeight = this.rowCount * (RD.bnMargin + RD.bnHeight) - RD.bnMargin;
	let totalHeight = nonScrollHeight + ScrollHeight;
	if(!this.autoHeight) totalHeight = 0;
	this.height = Math.min(Math.max(minHeight, totalHeight), GuiElements.height);
	this.centeredButtonY = this.height - centeredBnHeight + RD.bnMargin;
	this.innerHeight = ScrollHeight;
	this.scrollBoxHeight = Math.min(this.height - nonScrollHeight, ScrollHeight);
	this.scrollBoxY = RD.bnMargin + RD.titleBarH;
	this.extraTopY = RD.titleBarH;
	this.extraBottomY = this.height - centeredBnHeight - this.extraBottomSpace + RD.bnMargin;
};
RowDialog.prototype.calcWidths=function(){
	var RD = RowDialog;
	let thirdWidth = GuiElements.width / 3;
	this.width = Math.min(GuiElements.width, Math.max(thirdWidth, RD.minWidth));
	this.scrollBoxWidth = this.width - 2 * RD.bnMargin;
	this.scrollBoxX = RD.bnMargin;
	this.centeredButtonX = this.width / 2 - RD.centeredBnWidth / 2;
	this.contentWidth = this.width - RD.bnMargin * 2;
};
RowDialog.prototype.drawBackground = function(){
	let rect = GuiElements.draw.rect(0, 0, this.width, this.height, RowDialog.bgColor);
	this.group.appendChild(rect);
	return rect;
};
RowDialog.prototype.createTitleRect=function(){
	var RD=RowDialog;
	var rect=GuiElements.draw.rect(0,0,this.width,RD.titleBarH,RD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
RowDialog.prototype.createTitleLabel=function(title){
	var RD=RowDialog;
	var textE=GuiElements.draw.text(0,0,title,RD.fontSize,RD.titleBarFontC,RD.font,RD.titleFontWeight);
	var x=this.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=RD.titleBarH/2+RD.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
RowDialog.prototype.createContent = function(){
	var RD = RowDialog;
	let y = 0;
	var rowGroup = GuiElements.create.group(0, 0);
	if(this.rowCount > 0) {
		for (let i = 0; i < this.rowCount; i++) {
			this.createRow(i, y, this.contentWidth, rowGroup);
			y += RD.bnHeight + RD.bnMargin;
		}
	}
	else if(this.hintText != "") {
		this.createHintText();
	}
	return rowGroup;
};
RowDialog.prototype.createRow = function(index, y, width, contentGroup){
	
};
RowDialog.prototype.createCenteredBns = function(){
	var RD = RowDialog;
	let y = this.centeredButtonY;
	this.centeredButtonEs = [];
	for(let i = 0; i < this.centeredButtons.length; i++){
		let bn = this.createCenteredBn(y, this.centeredButtons[i]);
		this.centeredButtonEs.push(bn);
		y += RD.bnHeight + RD.bnMargin;
	}
};
RowDialog.prototype.createCenteredBn = function(y, entry){
	var RD = RowDialog;
	var button = new Button(this.centeredButtonX, y, RD.centeredBnWidth, RD.bnHeight, this.group);
	button.addText(entry.text, null, null, RD.centeredfontWeight);
	button.setCallbackFunction(entry.callbackFn, true);
	return button;
};
RowDialog.prototype.createScrollBox = function(){
	if(this.rowCount == 0) return null;
	let x = this.x + this.scrollBoxX;
	let y = this.y + this.scrollBoxY;
	return new SmoothScrollBox(this.rowGroup, GuiElements.layers.frontScroll, x, y,
		this.scrollBoxWidth, this.scrollBoxHeight, this.scrollBoxWidth, this.innerHeight, false);
};
RowDialog.prototype.createHintText = function(){
	var RD = RowDialog;
	this.hintTextE = GuiElements.draw.text(0, 0, "", RD.fontSize, RD.titleBarFontC, RD.font, RD.fontWeight);
	GuiElements.update.textLimitWidth(this.hintTextE, this.hintText, this.width);
	let textWidth = GuiElements.measure.textWidth(this.hintTextE);
	let x = this.width / 2 - textWidth / 2;
	let y = this.scrollBoxY + RD.charHeight;
	GuiElements.move.text(this.hintTextE, x, y);
	this.group.appendChild(this.hintTextE);
};
RowDialog.prototype.closeDialog = function(){
	if(this.visible) {
		this.visible = false;
		RowDialog.currentDialog = null;
		this.group.remove();
		if (this.scrollBox != null) {
			this.scrollBox.hide();
		}
		this.scrollBox = null;
		GuiElements.unblockInteraction();
	}
};
RowDialog.prototype.getScroll = function(){
	if(this.scrollBox == null) return 0;
	return this.scrollBox.getScrollY();
};
RowDialog.prototype.setScroll = function(y){
	if(this.scrollBox == null) return;
	this.scrollBox.setScrollY(y);
};
RowDialog.prototype.updateZoom = function(){
	if(this.visible) {
		let scroll = this.getScroll();
		this.closeDialog();
		this.show();
		this.setScroll(scroll);
	}
};
RowDialog.updateZoom = function(){
	if(RowDialog.currentDialog != null){
		RowDialog.currentDialog.updateZoom();
	}
};
RowDialog.prototype.reloadRows = function(rowCount){
	this.rowCount = rowCount;
	if(this.visible) {
		this.visible = false;
		let scroll = this.getScroll();
		this.group.remove();
		if (this.scrollBox != null) {
			this.scrollBox.hide();
		}
		this.scrollBox = null;
		this.show();
		this.setScroll(scroll);
	}
};
RowDialog.prototype.isScrolling = function(){
	if(this.scrollBox != null){
		return this.scrollBox.isMoving();
	}
	return false;
};
RowDialog.prototype.addHintText = function(hintText){
	this.hintText = hintText;
};
RowDialog.prototype.getExtraTopY = function(){
	return this.extraTopY;
};
RowDialog.prototype.getExtraBottomY = function(){
	return this.extraBottomY;
};
RowDialog.prototype.getContentWidth = function(){
	return this.contentWidth;
};
RowDialog.prototype.getCenteredButton = function(i){
	return this.centeredButtonEs[i];
};
RowDialog.createMainBn = function(bnWidth, x, y, contentGroup, callbackFn){
	var RD = RowDialog;
	var button = new Button(x, y, bnWidth, RD.bnHeight, contentGroup);
	if(callbackFn != null) {
		button.setCallbackFunction(callbackFn, true);
	}
	button.makeScrollable();
	return button;
};
RowDialog.createMainBnWithText = function(text, bnWidth, x, y, contentGroup, callbackFn){
	var button = RowDialog.createMainBn(bnWidth, x, y, contentGroup, callbackFn);
	button.addText(text);
	return button;
};
RowDialog.createSmallBnWithIcon = function(iconId, x, y, contentGroup, callbackFn){
	var RD = RowDialog;
	var button = new Button(x, y, RD.smallBnWidth, RD.bnHeight, contentGroup);
	button.addIcon(iconId, RD.iconH);
	if(callbackFn != null) {
		button.setCallbackFunction(callbackFn, true);
	}
	button.makeScrollable();
	return button;
};
/**
 * Created by Tom on 6/13/2017.
 */

function OpenDialog(listOfFiles){
	this.files=listOfFiles.split("\n");
	if(listOfFiles == ""){
		this.files = [];
	}
	RowDialog.call(this, true, "Open", this.files.length, 0, 0);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.addHintText("No saved programs");
}
OpenDialog.prototype = Object.create(RowDialog.prototype);
OpenDialog.constructor = OpenDialog;
OpenDialog.setConstants = function(){

};
OpenDialog.prototype.createRow = function(index, y, width, contentGroup){
	var RD = RowDialog;
	let largeBnWidth = width - RD.smallBnWidth * 2 - RD.bnMargin * 2;
	var file = this.files[index];
	this.createFileBn(file, largeBnWidth, 0, y, contentGroup);
	let renameBnX = largeBnWidth + RD.bnMargin;
	this.createRenameBn(file, renameBnX, y, contentGroup);
	let deleteBnX = renameBnX + RD.smallBnWidth + RD.bnMargin;
	this.createDeleteBn(file, deleteBnX, y, contentGroup);
};
OpenDialog.prototype.createFileBn = function(file, bnWidth, x, y, contentGroup){
	RowDialog.createMainBnWithText(file, bnWidth, x, y, contentGroup, function(){
		this.closeDialog();
		SaveManager.userOpenFile(file);
	}.bind(this));
};
OpenDialog.prototype.createDeleteBn = function(file, x, y, contentGroup){
	var me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.trash, x, y, contentGroup, function(){
		SaveManager.userDeleteFile(false, file, function(){
			me.reloadDialog();
		});
	});
};
OpenDialog.prototype.createRenameBn = function(file, x, y, contentGroup){
	var me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.edit, x, y, contentGroup, function(){
		SaveManager.userRenameFile(false, file, function(){
			me.reloadDialog();
		});
	});
};
OpenDialog.prototype.reloadDialog = function(){
	let thisScroll = this.getScroll();
	let me = this;
	HtmlServer.sendRequestWithCallback("data/files",function(response){
		me.closeDialog();
		var openDialog = new OpenDialog(response);
		openDialog.show();
		openDialog.setScroll(thisScroll);
	});
};
OpenDialog.showDialog = function(){
	HtmlServer.sendRequestWithCallback("data/files",function(response){
		var openDialog = new OpenDialog(response);
		openDialog.show();
	});
};
function ConnectOneHBDialog(){
	var COHBD=ConnectOneHBDialog;
	if(COHBD.currentCOHBD!=null){
		COHBD.currentCOHBD.closeDialog();
	}
	COHBD.currentCOHBD=this;
	this.width=COHBD.width;
	this.height=GuiElements.height/2;
	this.x=GuiElements.width/2-this.width/2;
	this.y=GuiElements.height/4;
	this.menuBnList=null;
	this.group=GuiElements.create.group(this.x,this.y);
	this.bgRect=this.makeBgRect();
	//this.menuBnList=this.makeMenuBnList();
	this.cancelBn=this.makeCancelBn();
	this.titleRect=this.createTitleRect();
	this.titleText=this.createTitleLabel();
	GuiElements.layers.dialog.appendChild(this.group);
	GuiElements.blockInteraction();
	var thisCOHBD =this;
	this.updateTimer = self.setInterval(function () { thisCOHBD.discoverHBs() }, COHBD.updateInterval);
	this.discoverHBs();
	this.visible = true;
}
ConnectOneHBDialog.setConstants=function(){
	var COHBD=ConnectOneHBDialog;
	COHBD.currentCOHBD=null;
	COHBD.updateInterval=500;

	COHBD.titleBarColor=Colors.lightGray;
	COHBD.titleBarFontC=Colors.white;
	COHBD.bgColor=Colors.black;
	COHBD.titleBarH=30;
	COHBD.width=300;
	COHBD.cancelBnWidth=100;
	COHBD.cancelBnHeight=MenuBnList.bnHeight;
	COHBD.bnMargin=5;

	COHBD.fontSize=16;
	COHBD.font="Arial";
	COHBD.fontWeight="normal";
	COHBD.charHeight=12;
};
ConnectOneHBDialog.prototype.makeBgRect=function(){
	var COHBD=ConnectOneHBDialog;
	var rectE=GuiElements.draw.rect(0,0,this.width,this.height,COHBD.bgColor);
	this.group.appendChild(rectE);
	return rectE;
};
ConnectOneHBDialog.prototype.makeMenuBnList=function(){
	var bnM=OpenDialog.bnMargin;
	var menuBnList=new MenuBnList(this.group,bnM,bnM+OpenDialog.titleBarH,bnM,OpenDialog.width-2*bnM);
	menuBnList.setMaxHeight(this.calcMaxHeight());
	for(var i=0;i<this.files.length-1;i++){
		this.addBnListOption(this.files[i],menuBnList);
	}
	menuBnList.show();
	return menuBnList;
};
ConnectOneHBDialog.prototype.makeCancelBn=function(){
	var COHBD=ConnectOneHBDialog;
	var width=COHBD.cancelBnWidth;
	var height=COHBD.cancelBnHeight;
	var x=COHBD.width/2-width/2;
	var y=this.height-height-COHBD.bnMargin;
	var cancelBn=new Button(x,y,width,height,this.group);
	cancelBn.addText("Cancel");
	var callbackFn=function(){
		callbackFn.dialog.closeDialog();
	};
	callbackFn.dialog=this;
	cancelBn.setCallbackFunction(callbackFn,true);
	return cancelBn;
};
ConnectOneHBDialog.prototype.createTitleRect=function(){
	var COHBD=ConnectOneHBDialog;
	var rect=GuiElements.draw.rect(0,0,COHBD.width,COHBD.titleBarH,COHBD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
ConnectOneHBDialog.prototype.createTitleLabel=function(){
	var COHBD=ConnectOneHBDialog;
	var textE=GuiElements.draw.text(0,0,"Connect",COHBD.fontSize,COHBD.titleBarFontC,COHBD.font,COHBD.fontWeight);
	var x=COHBD.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=COHBD.titleBarH/2+COHBD.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
ConnectOneHBDialog.prototype.closeDialog=function(){
	this.group.remove();
	this.visible = false;
	if(this.menuBnList != null){
		this.menuBnList.hide();
	}
	this.menuBnList=null;
	GuiElements.unblockInteraction();
	ConnectOneHBDialog.currentCOHBD=null;
	this.updateTimer = window.clearInterval(this.updateTimer);
	HtmlServer.sendRequestWithCallback("hummingbird/stopDiscover");
};
ConnectOneHBDialog.prototype.discoverHBs=function(){
	var thisCOHBD=this;
	HtmlServer.sendRequestWithCallback("hummingbird/discover",function(response){
		var hBString=response;
		if(HummingbirdManager.allowVirtualHBs){
			//response+="\nVirtual HB";
			response=response.trim();
		}
		thisCOHBD.updateHBList(response);
	},function(){
		if(HummingbirdManager.allowVirtualHBs){
			thisCOHBD.updateHBList('[{"id":"Virtual HB1"},{"id":"Virtual HB2"}]');
		}
	});
};
ConnectOneHBDialog.prototype.updateHBList=function(newHBs){
	if(TouchReceiver.touchDown || !this.visible){
		return;
	}
	var hBArray = JSON.parse(newHBs);
	var COHBD=ConnectOneHBDialog;
	var oldScroll=0;
	if(this.menuBnList!=null){
		oldScroll=this.menuBnList.getScroll();
		this.menuBnList.hide();
	}
	var bnM=COHBD.bnMargin;
	//this.menuBnList=new MenuBnList(this.group,bnM,bnM+COHBD.titleBarH,bnM,this.width-bnM*2);
	this.menuBnList=new SmoothMenuBnList(this, this.group,bnM,bnM+COHBD.titleBarH,this.width-bnM*2);
	this.menuBnList.setMaxHeight(this.height-COHBD.titleBarH-COHBD.cancelBnHeight-COHBD.bnMargin*3);
	for(var i=0;i<hBArray.length;i++){
		this.addBnListOption(hBArray[i].name, hBArray[i].id);
	}

	this.menuBnList.show();
	this.menuBnList.setScroll(oldScroll);
};
ConnectOneHBDialog.prototype.addBnListOption=function(hBName, hBId){
	var COHBD=ConnectOneHBDialog;
	this.menuBnList.addOption(hBName,function(){
		COHBD.selectHB(hBName, hBId);
	});
};
ConnectOneHBDialog.selectHB=function(hBName, hBId){
	ConnectOneHBDialog.currentCOHBD.closeDialog();
	HummingbirdManager.connectOneHB(hBName, hBId);
};
ConnectOneHBDialog.prototype.relToAbsX = function(x){
	return x + this.x;
};
ConnectOneHBDialog.prototype.relToAbsY = function(y){
	return y + this.y;
};
/*

OpenDialog.prototype.addBnListOption=function(file,menuBnList){
	var dialog=this;
	menuBnList.addOption(file,function(){dialog.openFile(file)});
};


OpenDialog.prototype.updateGroupPosition=function(){
	var OD=OpenDialog;
	var x=GuiElements.width/2-OD.width/2;
	var y=GuiElements.height/2-this.height/2;
	GuiElements.move.group(this.group,x,y);
};

OpenDialog.prototype.openFile=function(fileName){
	SaveManager.open(fileName);
	this.closeDialog();
};
*/
function ConnectMultipleHBDialog(){
	var CMHBD=ConnectMultipleHBDialog;
	if(CMHBD.currentCOHBD!=null){
		CMHBD.currentCOHBD.closeDialog();
	}
	CMHBD.currentCOHBD=this;
	this.hBList=HummingbirdManager.getConnectedHBs();
	CMHBD.currentDialog=this;
	this.width=CMHBD.width;
	this.height=this.computeHeight();
	this.x=GuiElements.width/2-this.width/2;
	this.y=GuiElements.height/2-this.height/2;
	this.statusLights=[];
	this.group=GuiElements.create.group(this.x,this.y);
	this.bgRect=this.makeBgRect();
	this.titleRect=this.createTitleRect();
	this.titleText=this.createTitleLabel();
	if(this.hBList.length<10) {
		this.plusBn = this.createPlusBn();
	}
	this.doneBn=this.makeDoneBn();
	this.createRows();
	GuiElements.layers.dialog.appendChild(this.group);
	GuiElements.blockInteraction();
	HtmlServer.sendRequestWithCallback("hummingbird/discover");
}
ConnectMultipleHBDialog.setConstants=function(){
	var CMHBD=ConnectMultipleHBDialog;
	CMHBD.currentDialog=null;

	CMHBD.titleBarColor=Colors.lightGray;
	CMHBD.fontColor=Colors.white;
	CMHBD.bgColor=Colors.black;
	CMHBD.titleBarH=30;
	CMHBD.width=300;
	CMHBD.doneBnWidth=100;
	CMHBD.buttonH=30;
	CMHBD.bnM=7;
	CMHBD.smallBnWidth=30;
	CMHBD.statusToBnM=CMHBD.smallBnWidth+CMHBD.bnM-DeviceStatusLight.radius*2;
	CMHBD.editIconH=15;

	CMHBD.fontSize=16;
	CMHBD.font="Arial";
	CMHBD.fontWeight="normal";
	CMHBD.charHeight=12;
	CMHBD.plusFontSize=26;
	CMHBD.plusCharHeight=18;
};
ConnectMultipleHBDialog.prototype.computeHeight=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var count=this.hBList.length;
	if(count==10){
		count--;
	}
	return CMHBD.titleBarH+(count+2)*CMHBD.buttonH+(count+3)*CMHBD.bnM;
};
ConnectMultipleHBDialog.prototype.makeBgRect=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var rectE=GuiElements.draw.rect(0,0,this.width,this.height,CMHBD.bgColor);
	this.group.appendChild(rectE);
	return rectE;
};
ConnectMultipleHBDialog.prototype.makeDoneBn=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var width=CMHBD.doneBnWidth;
	var height=CMHBD.buttonH;
	var x=CMHBD.width/2-width/2;
	var y=this.height-height-CMHBD.bnM;
	var doneBn=new Button(x,y,width,height,this.group);
	doneBn.addText("Done");
	var callbackFn=function(){
		callbackFn.dialog.closeDialog();
	};
	callbackFn.dialog=this;
	doneBn.setCallbackFunction(callbackFn,true);
	return doneBn;
};
ConnectMultipleHBDialog.prototype.createTitleRect=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var rect=GuiElements.draw.rect(0,0,CMHBD.width,CMHBD.titleBarH,CMHBD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
ConnectMultipleHBDialog.prototype.createTitleLabel=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var textE=GuiElements.draw.text(0,0,"Connect Multiple",CMHBD.fontSize,CMHBD.fontColor,CMHBD.font,CMHBD.fontWeight);
	var x=CMHBD.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=CMHBD.titleBarH/2+CMHBD.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
ConnectMultipleHBDialog.prototype.closeDialog=function(){
	this.group.remove();
	GuiElements.unblockInteraction();
	for(var i=0;i<this.statusLights.length;i++){
		this.statusLights[i].remove();
	}
	ConnectMultipleHBDialog.currentCOHBD=null;
	HtmlServer.sendRequestWithCallback("/hummingbird/stopDiscover");
};
ConnectMultipleHBDialog.prototype.createRows=function(){
	var CMHBD=ConnectMultipleHBDialog;
	for(var i=0;i<this.hBList.length;i++){
		this.createRow(i+1,CMHBD.titleBarH+CMHBD.buttonH*i+CMHBD.bnM*(i+1),this.hBList[i]);
	}
};
ConnectMultipleHBDialog.prototype.createRow=function(index,y,hummingbird){
	var CMHBD=ConnectMultipleHBDialog;
	var x=CMHBD.bnM;
	var request="hummingbird/"+HtmlServer.encodeHtml(hummingbird.name)+"/status";
	// TODO: Fix status light to work with multiple devices
	var statusLight=new DeviceStatusLight(x,y+CMHBD.buttonH/2,this.group);
	this.statusLights.push(statusLight);
	x+=DeviceStatusLight.radius*2;
	var textE=GuiElements.draw.text(0,0,index,CMHBD.fontSize,CMHBD.fontColor,CMHBD.font,CMHBD.fontWeight);
	var textW=GuiElements.measure.textWidth(textE);
	var textX=x+CMHBD.statusToBnM/2-textW/2;
	var textY=y+CMHBD.buttonH/2+CMHBD.charHeight/2;
	GuiElements.move.text(textE,textX,textY);
	this.group.appendChild(textE);
	x+=CMHBD.statusToBnM;
	var endX=this.width-CMHBD.bnM-CMHBD.smallBnWidth;
	var xButton=new Button(endX,y,CMHBD.smallBnWidth,CMHBD.buttonH,this.group);
	xButton.addText("X",CMHBD.font,CMHBD.fontSize,CMHBD.fontWeight,CMHBD.fontCharHeight);
	endX-=CMHBD.smallBnWidth+CMHBD.bnM;
	var renButton=new Button(endX,y,CMHBD.smallBnWidth,CMHBD.buttonH,this.group);
	renButton.addIcon(VectorPaths.edit,CMHBD.editIconH);
	endX-=CMHBD.bnM;
	var hBButton=new Button(x,y,endX-x,CMHBD.buttonH,this.group);
	hBButton.addText(hummingbird.name,CMHBD.font,CMHBD.fontSize,CMHBD.fontWeight,CMHBD.fontCharHeight);

	renButton.setCallbackFunction(function(){
		hummingbird.promptRename();
		ConnectMultipleHBDialog.reloadDialog();
	},true);
	xButton.setCallbackFunction(function(){
		hummingbird.disconnect();
		ConnectMultipleHBDialog.reloadDialog();
	},true);
	var overlayX=GuiElements.width/2;
	var overlayUpY=y+this.y;
	var overlayLowY=overlayUpY+CMHBD.buttonH;
	hBButton.setCallbackFunction(function(){
		new HBConnectionList(overlayX,overlayUpY,overlayLowY,hummingbird);
	},true);
};
ConnectMultipleHBDialog.prototype.createPlusBn=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var x=CMHBD.bnM*2+CMHBD.smallBnWidth;
	var y=this.height-CMHBD.buttonH*2-CMHBD.bnM*2;
	var width=this.width-4*CMHBD.bnM-2*CMHBD.smallBnWidth;
	var button=new Button(x,y,width,CMHBD.buttonH,this.group);
	button.addText("+",CMHBD.font,CMHBD.plusFontSize,CMHBD.fontWeight,CMHBD.plusCharHeight);
	var overlayX=GuiElements.width/2;
	var overlayUpY=y+this.y;
	var overlayLowY=overlayUpY+CMHBD.buttonH;
	button.setCallbackFunction(function(){
		new HBConnectionList(overlayX,overlayUpY,overlayLowY,null);
	},true);
	return button;
};
ConnectMultipleHBDialog.reloadDialog=function(){
	new ConnectMultipleHBDialog();
};

/**
 * Created by Tom on 6/16/2017.
 */
function RecordingDialog(listOfRecordings){
	var RecD = RecordingDialog;
	this.recordings=listOfRecordings.split("\n");
	if(listOfRecordings == ""){
		this.recordings = [];
	}
	RowDialog.call(this, true, "Recordings", this.recordings.length, 0, RecordingDialog.extraBottomSpace);
	this.addCenteredButton("Done", this.closeDialog.bind(this));
	this.addHintText("Tap record to start");
	this.state = RecordingManager.recordingStates.stopped;
}
RecordingDialog.prototype = Object.create(RowDialog.prototype);
RecordingDialog.prototype.constructor = RecordingDialog;
RecordingDialog.setConstants = function(){
	var RecD = RecordingDialog;
	RecD.currentDialog = null;
	RecD.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
	RecD.coverRectOpacity = 0.8;
	RecD.coverRectColor = Colors.black;
	RecD.counterFont = "Arial";
	RecD.counterColor = Colors.white;
	RecD.counterFontSize = 60;
	RecD.counterFontWeight = "normal";
	RecD.counterBottomMargin = 50;
	RecD.recordColor = "#f00";
	RecD.recordTextSize = 25;
	RecD.recordTextCharH = 18;
	RecD.recordIconH = RecD.recordTextCharH;
	RecD.iconSidemargin = 10;

};
RecordingDialog.prototype.createRow = function(index, y, width, contentGroup){
	var RD = RowDialog;
	let largeBnWidth = width - RD.smallBnWidth * 2 - RD.bnMargin * 2;
	var recording = this.recordings[index];
	this.createMainBn(recording, largeBnWidth, 0, y, contentGroup);
	let renameBnX = largeBnWidth + RD.bnMargin;
	this.createRenameBn(recording, renameBnX, y, contentGroup);
	let deleteBnX = renameBnX + RD.smallBnWidth + RD.bnMargin;
	this.createDeleteBn(recording, deleteBnX, y, contentGroup);
};
RecordingDialog.prototype.createMainBn = function(recording, bnWidth, x, y, contentGroup){
	var button = RowDialog.createMainBn(bnWidth, x, y, contentGroup);
	button.addSideTextAndIcon(VectorPaths.play, RowDialog.iconH, recording);
};
RecordingDialog.prototype.createDeleteBn = function(file, x, y, contentGroup){
	var me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.trash, x, y, contentGroup, function(){
		RecordingManager.userDeleteFile(file, function(){
			me.reloadDialog();
		});
	});
};
RecordingDialog.prototype.createRenameBn = function(file, x, y, contentGroup){
	var me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.edit, x, y, contentGroup, function(){
		RecordingManager.userRenameFile(file, function(){
			me.reloadDialog();
		});
	});
};
RecordingDialog.prototype.show = function(){
	RowDialog.prototype.show.call(this);
	RecordingDialog.currentDialog = this;
	this.recordButton = this.createRecordButton();
	this.discardButton = this.createDiscardButton();
	this.saveButton = this.createSaveButton();
	this.pauseButton = this.createPauseButton();
	this.resumeRecordingBn = this.createResumeRecordingBn();
	this.goToState(this.state);
};
RecordingDialog.prototype.closeDialog = function(){
	RowDialog.prototype.closeDialog.call(this);
	RecordingDialog.currentDialog = null;
};
RecordingDialog.prototype.createRecordButton = function(){
	var RD = RowDialog;
	var RecD = RecordingDialog;
	let x = RD.bnMargin;
	let y = this.getExtraBottomY();
	var button = new Button(x, y, this.getContentWidth(), RD.bnHeight, this.group);
	button.addCenteredTextAndIcon(VectorPaths.circle, RecD.recordIconH, RecD.iconSidemargin,
		"Record", null, RecD.recordTextSize, null, RecD.recordTextCharH, RecD.recordColor);
	button.setCallbackFunction(function(){
		RecordingManager.startRecording();
	}, true);
	return button;
};
RecordingDialog.prototype.createOneThirdBn = function(buttonPosition, callbackFn){
	var RD = RowDialog;
	let width = (this.getContentWidth() - RD.bnMargin * 2) / 3;
	let x = (RD.bnMargin + width) * buttonPosition + RD.bnMargin;
	let y = this.getExtraBottomY();
	var button = new Button(x, y, width, RD.bnHeight, this.group);
	button.setCallbackFunction(callbackFn, true);
	return button;
};
RecordingDialog.prototype.createDiscardButton = function(){
	var RD = RowDialog;
	var RecD = RecordingDialog;
	let button = this.createOneThirdBn(0, function(){
		RecordingManager.discardRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.trash, RD.iconH, RecD.iconSidemargin, "Discard");
	return button;
};
RecordingDialog.prototype.createSaveButton = function(){
	var RD = RowDialog;
	var RecD = RecordingDialog;
	let button = this.createOneThirdBn(1, function(){
		this.goToState(RecordingManager.recordingStates.stopped);
		RecordingManager.stopRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.square, RD.iconH, RecD.iconSidemargin, "Save");
	return button;
};
RecordingDialog.prototype.createPauseButton = function(){
	var RD = RowDialog;
	var RecD = RecordingDialog;
	let button = this.createOneThirdBn(2, function(){
		this.goToState(RecordingManager.recordingStates.paused);
		RecordingManager.pauseRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.pause, RD.iconH, RecD.iconSidemargin, "Pause");
	return button;
};
RecordingDialog.prototype.createResumeRecordingBn = function(){
	var RD = RowDialog;
	var RecD = RecordingDialog;
	let button = this.createOneThirdBn(2, function(){
		this.goToState(RecordingManager.recordingStates.recording);
		RecordingManager.resumeRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.circle, RD.iconH, RecD.iconSidemargin, "Record");
	return button;
};
RecordingDialog.prototype.drawCoverRect = function(){
	let halfStep = RowDialog.bnMargin / 2;
	let x = this.x + halfStep;
	let y = this.y + this.getExtraTopY() + halfStep;
	let height = this.getExtraBottomY() - this.getExtraTopY() - RowDialog.bnMargin;
	let width = this.width - RowDialog.bnMargin;
	let rect = GuiElements.draw.rect(x, y, width, height, RecordingDialog.coverRectColor);
	GuiElements.update.opacity(rect, RecordingDialog.coverRectOpacity);
	GuiElements.layers.overlayOverlay.appendChild(rect);
	return rect;
};
RecordingDialog.prototype.drawTimeCounter = function(){
	var RD = RecordingDialog;
	let textE = GuiElements.draw.text(0, 0, "0:00", RD.counterFontSize, RD.counterColor, RD.counterFont, RD.counterFontWeight);
	GuiElements.layers.overlayOverlay.appendChild(textE);
	let width = GuiElements.measure.textWidth(textE);
	let height = GuiElements.measure.textHeight(textE);
	let x = this.x + this.width / 2 - width / 2;
	let y = this.getExtraBottomY() - RecordingDialog.counterBottomMargin;
	let span = this.getExtraBottomY() - this.getExtraTopY() - height;
	if(span < 2 * RecordingDialog.counterBottomMargin){
		y = this.getExtraBottomY() - span / 2;
	}
	y += this.y;
	this.counterY = y;
	GuiElements.move.text(textE, x, y);
	return textE;
};
RecordingDialog.showDialog = function(){
	RecordingManager.listRecordings(function(result){
		var recordDialog = new RecordingDialog(result);
		recordDialog.show();
	});
};
RecordingDialog.prototype.goToState = function(state){
	var RecD = RecordingDialog;
	this.state = state;
	var states = RecordingManager.recordingStates;
	if(state == states.stopped){
		this.recordButton.show();
		this.discardButton.hide();
		this.saveButton.hide();
		this.pauseButton.hide();
		this.resumeRecordingBn.hide();
		this.setCounterVisibility(false);
		this.getCenteredButton(0).enable();
	}
	else if(state == states.recording){
		this.recordButton.hide();
		this.discardButton.show();
		this.saveButton.show();
		this.pauseButton.show();
		this.resumeRecordingBn.hide();
		this.setCounterVisibility(true);
		this.getCenteredButton(0).disable();
	}
	else if(state == states.paused){
		this.recordButton.hide();
		this.discardButton.show();
		this.saveButton.show();
		this.pauseButton.hide();
		this.resumeRecordingBn.show();
		this.setCounterVisibility(true);
		this.getCenteredButton(0).disable();
	}
};
RecordingDialog.startedRecording = function(){
	if(RecordingDialog.currentDialog != null){
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.recording);
	}
};
RecordingDialog.stoppedRecording = function(){
	if(RecordingDialog.currentDialog != null){
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.stopped);
		RecordingDialog.currentDialog.reloadDialog();
	}
};
RecordingDialog.pausedRecording = function(){
	if(RecordingDialog.currentDialog != null){
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.paused);
	}
};
RecordingDialog.prototype.reloadDialog = function(){
	let thisScroll = this.getScroll();
	let me = this;
	RecordingManager.listRecordings(function(response){
		me.closeDialog();
		var dialog = new RecordingDialog(response);
		dialog.show();
		dialog.setScroll(thisScroll);
	});
};
RecordingDialog.prototype.setCounterVisibility = function(visible){
	if(visible){
		if (this.coverRect == null) {
			this.coverRect = this.drawCoverRect();
		}
		if (this.counter == null) {
			this.counter = this.drawTimeCounter();
		}
	} else {
		if (this.coverRect != null) {
			this.coverRect.remove();
			this.coverRect = null;
		}
		if (this.counter != null) {
			this.counter.remove();
			this.counter = null;
		}
	}
};
RecordingDialog.prototype.updateCounter = function(time){
	if(this.counter == null) return;
	var totalSeconds = Math.floor(time / 1000);
	var seconds = totalSeconds % 60;
	var totalMinutes = Math.floor(totalSeconds / 60);
	var minutes = totalMinutes % 60;
	var hours = Math.floor(totalMinutes / 60);
	var secondsString = seconds + "";
	if(secondsString.length < 2){
		secondsString = "0" + secondsString;
	}
	var minutesString = minutes + "";
	var totalString = minutesString + ":" + secondsString;
	if(hours > 0) {
		if(minutesString.length < 2) {
			minutesString = "0" + minutesString;
		}
		totalString = hours + ":" + minutesString + ":" + secondsString;
	}
	GuiElements.update.text(this.counter, totalString);
	var width = GuiElements.measure.textWidth(this.counter);
	let counterX = this.x + this.width / 2 - width / 2;
	GuiElements.move.text(this.counter, counterX, this.counterY);
};
RecordingDialog.updateCounter = function(time){
	if(this.currentDialog != null){
		this.currentDialog.updateCounter(time);
	}
};
function HBConnectionList(x,upperY,lowerY,hBToReplace){
	var HBCL=HBConnectionList;
	this.group=GuiElements.create.group(0,0);
	this.menuBnList=null;
	this.bubbleOverlay=new BubbleOverlay(HBCL.bgColor,HBCL.bnMargin,this.group,this);
	this.bubbleOverlay.display(x,x,upperY,lowerY,HBCL.width,HBCL.height);
	var thisHBCL=this;
	this.updateTimer = self.setInterval(function () { thisHBCL.discoverHBs() }, HBCL.updateInterval);
	this.hBToReplace=hBToReplace;
	this.discoverHBs();
}
HBConnectionList.setConstants=function(){
	var HBCL=HBConnectionList;
	HBCL.bnMargin=7;
	HBCL.bgColor="#171717";
	HBCL.updateInterval=ConnectOneHBDialog.updateInterval;
	HBCL.height=150;
	HBCL.width=200;
};
HBConnectionList.prototype.discoverHBs=function(){
	var thisHBCL=this;
	HtmlServer.sendRequestWithCallback("hummingbird/discover",function(response){
		var hBString=response;
		if(HummingbirdManager.allowVirtualHBs){
			response+="\nVirtual HB";
			response=response.trim();
		}
		thisHBCL.updateHBList(response);
	},function(){
		if(HummingbirdManager.allowVirtualHBs){
			thisHBCL.updateHBList('[{"id":"Virtual HB1"},{"id":"Virtual HB2"}]');
		}
	});
};
HBConnectionList.prototype.updateHBList=function(newHBs){
	if(TouchReceiver.touchDown){
		return;
	}
	var HBCL=HBConnectionList;
	var oldScroll=0;
	if(this.menuBnList!=null){
		oldScroll=this.menuBnList.scrollY;
		this.menuBnList.hide();
	}
	this.menuBnList=new MenuBnList(this.group,0,0,HBCL.bnMargin,HBCL.width);
	//this.menuBnList=new SmoothMenuBnList(this, this.group,0,0,HBCL.width);
	this.menuBnList.isOverlayPart=true;
	this.menuBnList.setMaxHeight(HBCL.height);
	var hBArray=newHBs.split("\n");
	if(newHBs==""){
		hBArray=[];
	}
	for(var i=0;i<hBArray.length;i++) {
		this.addBnListOption(hBArray[i]);
	}
	this.menuBnList.show();
	this.menuBnList.scroll(oldScroll);
};
HBConnectionList.prototype.addBnListOption=function(hBName){
	var HBCL=HBConnectionList;
	var hBToReplace=this.hBToReplace;
	var thisHBCL=this;
	this.menuBnList.addOption(hBName,function(){
		thisHBCL.close();
		HummingbirdManager.replaceHBConnection(hBToReplace,hBName,ConnectMultipleHBDialog.reloadDialog);
	});
};
HBConnectionList.prototype.close=function(){
	this.updateTimer=window.clearInterval(this.updateTimer);
	this.bubbleOverlay.hide();
};

/**
 * Created by Tom on 6/14/2017.
 */

function DiscoverDialog(deviceClass){
	let title = "Connect " + deviceClass.getDeviceTypeName(false);
	RowDialog.call(this, false, title, 0, 0, 0);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
	this.deviceClass = deviceClass;
	this.discoveredDevices = [];
	this.timerSet = false;
	this.addHintText(deviceClass.getConnectionInstructions());
}
DiscoverDialog.prototype = Object.create(RowDialog.prototype);
DiscoverDialog.prototype.constructor = DiscoverDialog;
DiscoverDialog.setConstants = function(){
	DiscoverDialog.updateInterval = 500;
	DiscoverDialog.allowVirtualDevices = false;
};
DiscoverDialog.prototype.show = function(){
	var DD = DiscoverDialog;
	RowDialog.prototype.show.call(this);
	if(!this.timerSet) {
		this.timerSet = true;
		this.updateTimer = self.setInterval(this.discoverDevices.bind(this), DD.updateInterval);
	}
};
DiscoverDialog.prototype.discoverDevices = function() {
	var request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/discover");
	var me = this;
	HtmlServer.sendRequestWithCallback(request.toString(), this.updateDeviceList.bind(this), function(){
		if(DiscoverDialog.allowVirtualDevices) {
			let prefix = "Virtual " + me.deviceClass.getDeviceTypeName(true) + " ";
			let obj1 = {};
			let obj2 = {};
			obj1.name = prefix + "1";
			obj2.name = prefix + "2";
			obj1.id = "virtualDevice1";
			obj2.id = "virtualDevice2";
			let arr = [obj1, obj2];
			me.updateDeviceList(JSON.stringify(arr));
		}
	});
};
DiscoverDialog.prototype.updateDeviceList = function(deviceList){
	if(TouchReceiver.touchDown || !this.visible || this.isScrolling()){
		return;
	}
	var json = "[]";
	try{
		json = JSON.parse(deviceList);
	} catch(e) {

	}
	this.discoveredDevices = Device.fromJsonArray(this.deviceClass, json);
	if(DiscoverDialog.allowVirtualDevices){
		let rand = Math.random() * 20 + 20;
		for(let i = 0; i < rand; i++) {
			let name = "Virtual " + this.deviceClass.getDeviceTypeName(true);
			this.discoveredDevices.push(new this.deviceClass(name + i, "virtualDevice"));
		}
	}
	this.reloadRows(this.discoveredDevices.length);
};
DiscoverDialog.prototype.createRow = function(index, y, width, contentGroup){
	var button = new Button(0, y, width, RowDialog.bnHeight, contentGroup);
	button.addText(this.discoveredDevices[index].name);
	var me = this;
	button.setCallbackFunction(function(){
		me.selectDevice(me.discoveredDevices[index]);
	}, true);
	button.makeScrollable();
};
DiscoverDialog.prototype.selectDevice = function(device){
	this.deviceClass.getManager().setOneDevice(device);
	this.closeDialog();
};
DiscoverDialog.prototype.closeDialog = function(){
	RowDialog.prototype.closeDialog.call(this);
	if(this.timerSet) {
		this.timerSet = false;
		this.updateTimer = window.clearInterval(this.updateTimer);
	}
};
function OverflowArrows(){
	var OA = OverflowArrows;
	this.group = GuiElements.create.group(0, 0);
	this.triTop = this.makeTriangle();
	this.triLeft = this.makeTriangle();
	this.triRight = this.makeTriangle();
	this.triBottom = this.makeTriangle();
	this.setArrowPos();
	this.visible = false;
}
OverflowArrows.prototype.makeTriangle=function(){
	var OA = OverflowArrows;
	var tri = GuiElements.create.path();
	GuiElements.update.color(tri, Colors.white);
	GuiElements.update.opacity(tri, OA.opacity);
	GuiElements.makeClickThrough(tri);
	return tri;
};
OverflowArrows.setConstants=function(){
	var OA = OverflowArrows;
	OA.triangleW = 25;
	OA.triangleH = 15;
	OA.margin = 15;
	OA.opacity = 0.5;
};
OverflowArrows.prototype.setArrows=function(left, right, top, bottom){
	if(left == right) {
		this.showIfTrue(this.triLeft, false);
		this.showIfTrue(this.triRight, false);
	}
	else{
		this.showIfTrue(this.triLeft, left < this.left);
		this.showIfTrue(this.triRight, right > this.right);
	}
	if(top == bottom){
		this.showIfTrue(this.triTop, false);
		this.showIfTrue(this.triBottom, false);
	}
	else {
		this.showIfTrue(this.triTop, top < this.top);
		this.showIfTrue(this.triBottom, bottom > this.bottom);
	}
};
OverflowArrows.prototype.showIfTrue=function(tri,shouldShow){
	if(shouldShow){
		this.group.appendChild(tri);
	} else{
		tri.remove();
	}
};
OverflowArrows.prototype.show=function(){
	if(!this.visible) {
		this.visible = true;
		GuiElements.layers.overflowArr.appendChild(this.group);
	}
};
OverflowArrows.prototype.hide=function(){
	if(this.visible){
		this.visible = false;
		this.group.remove();
	}
};
OverflowArrows.prototype.updateZoom=function(){
	this.setArrowPos();
};
OverflowArrows.prototype.setArrowPos=function(){
	var OA = OverflowArrows;
	this.left = BlockPalette.width;
	this.top = TitleBar.height;
	this.right = GuiElements.width;
	this.bottom = GuiElements.height;
	this.midX = (this.left + this.right) / 2;
	this.midY = (this.top + this.bottom) / 2;

	GuiElements.update.triangleFromPoint(this.triTop, this.midX, this.top + OA.margin, OA.triangleW, OA.triangleH, true);
	GuiElements.update.triangleFromPoint(this.triLeft, this.left + OA.margin, this.midY, OA.triangleW, OA.triangleH, false);
	GuiElements.update.triangleFromPoint(this.triRight, this.right - OA.margin, this.midY, OA.triangleW, -OA.triangleH, false);
	GuiElements.update.triangleFromPoint(this.triBottom, this.midX, this.bottom - OA.margin, OA.triangleW, -OA.triangleH, true);
};
/**
 * BlockStack is a class that holds a stack of Blocks.
 * BlockStacks move, execute, and snap the Blocks within them.
 * They pass messages onto their Blocks, which are passed on recursively.
 * Blocks are initially created outside a BlockStacks, but are immediately moved into one.
 * Empty BlockStacks are not allowed because each BlockStack must have a non-null firstBlock property.
 * @constructor
 * @param {Block} firstBlock - The first Block in the BlockStack.
 * The firstBlock is automatically moved along with subsequent Blocks into the BlockStack.
 * @param {Tab} tab - The tab the BlockStack lives within.
 */
function BlockStack(firstBlock,tab){
	tab.addStack(this); //The Tab maintains a list of all its BlockStacks.
	this.firstBlock=firstBlock;
	this.firstBlock.stop(); //Prevents execution.
	this.firstBlock.stopGlow(); //Removes visual indicator of execution.
	this.returnType=firstBlock.returnType; //The BlockStack returns the same type of value as its first Block.
	this.tab=tab;
	this.x = 0;
	this.y = 0;
	var blockX = firstBlock.getAbsX();
	var blockY = firstBlock.getAbsY();
	this.x=this.setAbsX(firstBlock.getAbsX());
	this.y=this.setAbsY(firstBlock.getAbsY());
	this.tabGroup=tab.mainG; //Stores the SVG group element of the Tab it is within.
	this.group=GuiElements.create.group(this.x,this.y,this.tabGroup); //Creates a group for the BlockStack.
	this.firstBlock.changeStack(this); //Moves all Blocks into the BlockStack.
	this.dim=function(){}; //Stores information about the snap bounding box of the BlockStack.
	//this.dim values will be assigned later.
	this.dim.cw=0; //Dimensions of regions command blocks can be attached to.
	this.dim.ch=0;
	this.dim.rw=0; //Dimensions of regions reporter/predicate blocks can be attached to.
	this.dim.rh=0;
	this.dim.cx1=0; //These will be measured relative to the Tab, not the BlockStack.
	this.dim.cy1=0;
	this.dim.rx1=0;
	this.dim.ry1=0;
	this.updateDim(); //Updates the this.dim values, the dimensions of the Blocks, and aligns them.
	this.isRunning=false;
	this.currentBlock=null; //Keeps track of which Block in the BlockStack is currently executing.
	this.isDisplayStack=false;
	this.runningBroadcastMessage=""; //Keeps track of if this stack's execution was started by a broadcast.
	this.move(this.x,this.y);
	this.flying=false; //BlockStacks being moved enter flying mode so they are above other BlockStacks and Tabs.
	this.tab.updateArrows();
}
/* Recursively updates the this.dim values, the dimensions of the Blocks, and and the Blocks' alignment.
 */
BlockStack.prototype.updateDim=function() {
	this.firstBlock.updateDim(); //Recursively updates the dimensions of the Blocks.
	//The first Block is aligned to the top-left corner of the BlockStack.
	this.firstBlock.updateAlign(0,0); //Blocks recursively aligned.
	this.dim.cx1=0; //Clear existing values from bounding boxes.
	this.dim.cy1=0; //During updateStackDim, these values are measured relative to the BlockStack.
	this.dim.cx2=0;
	this.dim.cy2=0;
	this.dim.rx1=0;
	this.dim.ry1=0;
	this.dim.rx2=0;
	this.dim.ry2=0;
	//Recursively each box updates the this.dim boxes to include their own bounding boxes.
	this.firstBlock.updateStackDim();
	//Dimensions of both types of boxes are calculated.
	this.dim.cw=this.dim.cx2-this.dim.cx1;
	this.dim.ch=this.dim.cy2-this.dim.cy1;
	this.dim.rw=this.dim.rx2-this.dim.rx1;
	this.dim.rh=this.dim.ry2-this.dim.ry1;
};
/**
 * Converts a coordinate relative to the inside of the stack to one relative to the screen.
 * @param {number} x - The coord relative to the inside fo the stack.
 * @return {number} - The coord relative to the screen.
 */
BlockStack.prototype.relToAbsX=function(x){
	if(this.flying){
		return CodeManager.dragRelToAbsX(x+this.x);
	}
	else{
		return this.tab.relToAbsX(x+this.x); //In a Tab; return x plus Tab's offset.
	}
};
BlockStack.prototype.relToAbsY=function(y){
	if(this.flying){
		return CodeManager.dragRelToAbsY(y+this.y); //Not in a Tab; scale by dragLayer's scale
	}
	else{
		return this.tab.relToAbsY(y+this.y); //In a Tab; return y plus Tab's offset.
	}
};
/**
 * Converts a coordinate relative to the screen to one relative to the inside of the stack.
 * @param {number} x - The coord relative to the screen.
 * @return {number} - The coord relative to the inside fo the stack.
 */
BlockStack.prototype.absToRelX=function(x){
	if(this.flying){
		return CodeManager.dragAbsToRelX(x)-this.x;
	}
	else{
		return this.tab.absToRelX(x)-this.x; //In a Tab; return x minus Tab's offset.
	}
};
BlockStack.prototype.absToRelY=function(y){
	if(this.flying){
		return CodeManager.dragAbsToRelY(y)-this.y;
	}
	else{
		return this.tab.absToRelY(y)-this.y; //In a Tab; return y minus Tab's offset.
	}
};
/**
 * Returns the x coord of the BlockStack relative to the screen.
 * @return The x coord of the BlockStack relative to the screen.
 */
BlockStack.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
/**
 * Returns the y coord of the BlockStack relative to the screen.
 * @return The y coord of the BlockStack relative to the screen.
 */
BlockStack.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
BlockStack.prototype.setAbsX=function(x){
	return this.x + this.absToRelX(x);
};
BlockStack.prototype.setAbsY=function(y){
	return this.y + this.absToRelY(y);
};
/* Searches the Blocks within this BlockStack to find one which fits the moving BlockStack.
 * Returns no values but stores results on CodeManager.fit.
 */
BlockStack.prototype.findBestFit=function(){
	//Not implemented, check top of block
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	if(move.stack===this){ //If this BlockStack is the one being moved, it can't attach to itself.
		return;
	}
	//Check if the moving BlockStack can attah to the top of this BlockStack.
	if(move.bottomOpen&&this.firstBlock.topOpen){
		this.findBestFitTop();
	}
	//Recursively check if the moving BlockStack can attach to the bottom of any Blocks in this BlockStack.
	if(move.topOpen){
		//Only check recursively if the corner of the moving BlockStack falls within this BlockStack's snap box.
		let absCx=this.relToAbsX(this.dim.cx1);
		let absCy=this.relToAbsY(this.dim.cy1);
		let absW = this.relToAbsX(this.dim.cw) - absCx;
		let absH = this.relToAbsY(this.dim.ch) - absCy;
		if(move.pInRange(move.topX,move.topY,absCx,absCy,absW,absH)){
			this.firstBlock.findBestFit();
		}
	}
	//Recursively check recursively if the moving BlockStack can attach one of this BlockStack's Slots.
	if(move.returnsValue){
		//Only check if the BlockStack's bounding box overlaps with this BlockStack's bounding box.
		let absRx=this.relToAbsX(this.dim.rx1);
		let absRy=this.relToAbsY(this.dim.ry1);
		let absW = this.relToAbsX(this.dim.rw) - absRx;
		let absH = this.relToAbsY(this.dim.rh) - absRy;
		var width = move.bottomX - move.topX;
		var height = move.bottomY - move.topY;
		if(move.rInRange(move.topX,move.topY,width,height,absRx,absRy,absW,absH)){
			this.firstBlock.findBestFit();
		}
	}
};
/**
 * Moves this BlockStack to a new location relative to the Tab. Updates this.x and this.y accordingly.
 * @param {number} x - the x coord to move to.
 * @param {number} y - the y coord to move to.
 */
BlockStack.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y);
};
/**
 * Moves the BlockStack to a certain location on the screen.
 * @param {number} x - The x coord relative to the screen where the BlockStack should move.
 * @param {number} y - The y coord relative to the screen where the BlockStack should move.
 */
BlockStack.prototype.moveAbs=function(x,y){
	var relX=this.absToRelX(x);
	var relY=this.absToRelY(y);
	this.move(relX,relY);
};
/* Recursively stops the execution of the BlockStack and its contents. Removes the glow as well.
 */
BlockStack.prototype.stop=function(){
	if(this.isRunning){
		this.firstBlock.stop();
		this.endRun(); //Removes glow and sets isRunning.
	}
};
/**
 * Updates the execution of the BlockStack and its contents. Returns boolean to indicate if still running.
 * @return {ExecutionStatus}
 */
BlockStack.prototype.updateRun=function(){
	if(this.isRunning){
		//Different procedures are used if the Block returns a value.
		if(this.returnType==Block.returnTypes.none){
			if(this.currentBlock.stack!=this){ //If the current Block has been removed, don't run it.
				this.endRun(); //Stop execution.
				return new ExecutionStatusDone();
			}
			//Update the current Block.
			let execStatus = this.currentBlock.updateRun();
			if(!execStatus.isRunning()){
				//If the block threw a error, display it
				if(execStatus.hasError()){
					this.endRun();
					return new ExecutionStatusDone();
				} else{
					//Otherwise, the next block will run next.
					this.currentBlock=this.currentBlock.nextBlock;
				}
			}
			//If the end of the BlockStack has been reached, end execution.
			if(this.currentBlock!=null){
				return new ExecutionStatusRunning();
			} else{
				this.endRun();
				return new ExecutionStatusDone();
			}
		}
		else{ //Procedure for Blocks that return a value.
			let execStatus = this.currentBlock.updateRun();
			if(execStatus.isRunning()){
				return new ExecutionStatusRunning();
			}
			else if(execStatus.hasError()){
				this.endRun();
				return new ExecutionStatusDone();
			}
			else{
				//When it is done running, display the result.
				this.currentBlock.displayResult(execStatus.getResult());
				this.endRun(); //Execution is done.
				return new ExecutionStatusDone();
			}
		}
	} else{
		return new ExecutionStatusDone();
	}
};
/**
 * Starts execution of the BlockStack starting with the specified Block. Makes BlockStack glow, too.
 * @param {Block} startBlock - (optional) The first Block to execute. By default, this.firstBlock is used.
 */
BlockStack.prototype.startRun=function(startBlock,broadcastMessage){
	if(startBlock==null){
		startBlock=this.firstBlock; //Set parameter to default.
	}
	if(broadcastMessage==null){
		broadcastMessage="";
	}
	this.runningBroadcastMessage=broadcastMessage;
	if(!this.isRunning){ //Only start if not already running.
		this.isRunning=true;
		this.currentBlock=startBlock;
		this.firstBlock.glow();
		this.tab.startRun(); //Starts Tab if it is not already running.
	}
};
/* Ends execution and removes glow. Does not call stop() function on Blocks; assumes they have stopped already.
 */
BlockStack.prototype.endRun=function(){
	this.isRunning=false;
	this.firstBlock.stopGlow();
};
/* Checks if the moving BlockStack can snap on to the top of this BlockStack. Returns nothing.
 * Results are stored in CodeManager.fit.
 * Only called if moving BlockStack returns no value.
 */
BlockStack.prototype.findBestFitTop=function(){
	var snap=BlockGraphics.command.snap; //Get snap bounding box for command Blocks.
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.firstBlock.getAbsX(); //Uses screen coordinates.
	var y=this.firstBlock.getAbsY();
	var height = this.relToAbsY(this.firstBlock.height) - y;
	/* Now the BlockStack will check if the bottom-left corner of the moving BlockStack falls within
	 * the snap bounding box of the first Block in the BlockStack. */
	//Gets the bottom-left corner of the moving BlockStack.
	var moveBottomLeftX=move.topX;
	var moveBottomLeftY=move.bottomY;
	//Gets the snap bounding box of the first Block.
	var snapBLeft=x-snap.left;
	var snapBTop=y-snap.top;
	var snapBWidth=snap.left+snap.right;
	var snapBHeight=snap.top+height+snap.bottom;
	//Checks if the point falls in the box.
	if(move.pInRange(moveBottomLeftX,moveBottomLeftY,snapBLeft,snapBTop,snapBWidth,snapBHeight)){
		var xDist=move.topX-x;
		var yDist=move.bottomY-y;
		var dist=xDist*xDist+yDist*yDist; //Computes the distance.
		if(!fit.found||dist<fit.dist){ //Compares it to existing fit.
			fit.found=true;
			fit.bestFit=this; //Note that in this case the bestFit is set to a BlockStack, not a Block.
			fit.dist=dist; //Saves the fit.
		}
	}
};
/**
 * Recursively attaches the provided Block and its subsequent Blocks to the top of this BlockStack.
 * @param {Block} block - The Block to attach to this BlockStack.
 * @fix - Remove redundant code.
 */
BlockStack.prototype.snap=function(block){ //Fix! remove redundant code.
	if(this.isRunning&&!block.stack.isRunning){ //Fix! documentation
		block.glow();
	}
	else if(!this.isRunning&&block.stack.isRunning){ //Blocks that are added are stopped.
		block.stack.stop();
	}
	else if(this.isRunning&&block.isRunning){ //The added block is stopped, but still glows as part of a running stack.
		block.stop();
	}
	/* Move this BlockStack up by the height of the of the stack the Block belongs to.
	 * This compensates for the amount existing Blocks will be shifted down by the newly-added Blocks. */
	this.move(this.x,this.y-block.stack.dim.rh); //Fix! this.dim clarification
	var topStackBlock=block; //There is a new top Block.
	var bottomStackBlock=block.getLastBlock(); //The last Block in the stack being added.
	var upperBlock=this.firstBlock; //The topmost of the existing Blocks.
	//Fix references between Blocks to glue them together.
	this.firstBlock=topStackBlock;
	topStackBlock.parent=null;
	bottomStackBlock.nextBlock=upperBlock;
	upperBlock.parent=bottomStackBlock;
	//The old BlockStack can now be destroyed.
	var oldG=block.stack.group;
	block.stack.remove();
	block.changeStack(this);
	oldG.remove();
	
	this.updateDim();
};
/* Adds an indicator showing that the moving BlockStack will snap onto the top of this BlockStack if released.
 */
BlockStack.prototype.highlight=function(){
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),0,0,0,false,this.isRunning);
};
/**
 * Shifts this BlockStack by the specified amount.
 * @param {number} x - The amount to shift in the x direction.
 * @param {number} y - The amount to shift in the y direction.
 */
BlockStack.prototype.shiftOver=function(x,y){
	this.move(this.x+x,this.y+y);
};
/**
 * Recursively copies this BlockStack and all its contents to a new BlockStack. Returns the new BlcokStack.
 * @return {BlockStack} - The newly-copied BlockStack.
 */
BlockStack.prototype.duplicate=function(x,y,group){
	//First duplicate the Blocks.
	var firstCopyBlock=this.firstBlock.duplicate(x,y);
	//Then put them in a new BlockStack.
	return new BlockStack(firstCopyBlock,this.tab);
};
/* Returns the Tab this BlockStack belongs to. Used by the Blocks it contains when they need to kow their tab.
 * @return {Tab} - The Tab this BlockStack belongs to.
 */
BlockStack.prototype.getTab=function(){
	return this.tab;
};
/**
 * Returns the Sprite this BlockStack and its Blocks are associated with. Called by this BlockStack's Blocks.
 * Used in Block implementations.
 * @return {Sprite} - The Sprite this BlockStack and its Blocks are associated with.
 */
BlockStack.prototype.getSprite=function(){
	return this.tab.getSprite();
};
/* Moves this BlockStack out of the Tab's group and into the drag layer about other Blocks.
 */
BlockStack.prototype.fly=function(){
	this.group.remove(); //Remove group from Tab (visually only).
	GuiElements.layers.drag.appendChild(this.group); //Add group to drag layer.
	var absX=this.getAbsX(); //Get current location on screen.
	var absY=this.getAbsY();
	this.flying=true; //Record that this BlockStack is flying.
	//Move to ensure that position on screen does not change.
	this.move(CodeManager.dragAbsToRelX(absX), CodeManager.dragAbsToRelY(absY));
	this.tab.updateArrows();
};
/* Moves this BlockStack back into its Tab's group.
 */
BlockStack.prototype.land=function(){
	this.group.remove(); //Remove from drag layer.
	this.tabGroup.appendChild(this.group); //Go back into tab group.
	var absX=this.getAbsX(); //Get current location on screen.
	var absY=this.getAbsY();
	this.flying=false;
	//Move to ensure that position on screen does not change.
	this.move(this.tab.absToRelX(absX),this.tab.absToRelY(absY));
	this.tab.updateArrows();
};
/* Removes the stack from the Tab's list.
 */
BlockStack.prototype.remove=function(){
	this.tab.removeStack(this);
};
/* Stops execution and removes the BlockStack digitally and visually.
 */
BlockStack.prototype.delete=function(){
	this.stop();
	this.group.remove();
	this.remove(); //Remove from Tab's list.
	this.tab.updateArrows();
};
/* Passes message to first Block in BlockStack that the flag was tapped.
 */
BlockStack.prototype.eventFlagClicked=function(){
	if(!this.isRunning){ //Only pass message if not already running.
		this.firstBlock.eventFlagClicked();
	}
};
/* Passes broadcast message to first Block in BlockStack.
 */
BlockStack.prototype.eventBroadcast=function(message){
	this.firstBlock.eventBroadcast(message);
};
/* Checks if a broadcast is still running for the broadcast and wait Block.
 */
BlockStack.prototype.checkBroadcastRunning=function(message){
	if(this.isRunning){
		return this.runningBroadcastMessage==message;
	}
	return false;
};
/* Recursively checks if a given message is still in use by any of the DropSlots.
 */
BlockStack.prototype.checkBroadcastMessageAvailable=function(message){
	return this.firstBlock.checkBroadcastMessageAvailable(message);
};
/* Recursively updates the available broadcast messages.
 */
BlockStack.prototype.updateAvailableMessages=function(){
	this.firstBlock.updateAvailableMessages();
};
/**
 * Recursively returns the last Block in the BlockStack.
 * @return {Block} - The last Block in the BlockStack.
 */
BlockStack.prototype.getLastBlock=function(){
	return this.firstBlock.getLastBlock();
};
/*

 */
BlockStack.prototype.updateTabDim=function(){
	if(this.flying) return;
	var dim=this.tab.dim;
	if(dim.x1==null||this.x<dim.x1){
		dim.x1=this.x;
	}
	if(dim.y1==null||this.y<dim.y1){
		dim.y1=this.y;
	}
	var x2=this.x+this.dim.rw;
	if(dim.x2==null||x2>dim.x2){
		dim.x2=x2;
	}
	var y2=this.y+this.dim.rh;
	if(dim.y2==null||y2>dim.y2){
		dim.y2=y2;
	}
};
/* TODO: Write documentation. */
BlockStack.prototype.createXml=function(xmlDoc){
	var stack=XmlWriter.createElement(xmlDoc,"stack");
	XmlWriter.setAttribute(stack,"x",this.x);
	XmlWriter.setAttribute(stack,"y",this.y);
	var blocks=XmlWriter.createElement(xmlDoc,"blocks");
	this.firstBlock.writeToXml(xmlDoc,blocks);
	stack.appendChild(blocks);
	return stack;
};
/* TODO: Write documentation. */
BlockStack.importXml=function(stackNode,tab){
	var x=XmlWriter.getAttribute(stackNode,"x",0,true);
	var y=XmlWriter.getAttribute(stackNode,"y",0,true);
	var blocksNode=XmlWriter.findSubElement(stackNode,"blocks");
	var blockNodes=XmlWriter.findSubElements(blocksNode,"block");
	if(blockNodes.length>0){
		var firstBlock=null;
		var i=0;
		while(firstBlock==null&&i<blockNodes.length){
			firstBlock=Block.importXml(blockNodes[i]);
			i++;
		}
		if(firstBlock==null){
			return null;
		}
		var stack=new BlockStack(firstBlock,tab);
		stack.move(x,y);
		var previousBlock=firstBlock;
		while(i<blockNodes.length) {
			var newBlock = Block.importXml(blockNodes[i]);
			if (newBlock != null) {
				previousBlock.snap(newBlock);
				previousBlock = newBlock;
			}
			i++;
		}
		stack.updateDim();
	}
	else{
		return null;
	}
};
BlockStack.prototype.renameVariable=function(variable){
	this.passRecursively("renameVariable",variable);
};
BlockStack.prototype.deleteVariable=function(variable){
	this.passRecursively("deleteVariable",variable);
};
BlockStack.prototype.renameList=function(list){
	this.passRecursively("renameList",list);
};
BlockStack.prototype.deleteList=function(list){
	this.passRecursively("deleteList",list);
};
BlockStack.prototype.checkVariableUsed=function(variable){
	return this.firstBlock.checkVariableUsed(variable);
};
BlockStack.prototype.checkListUsed=function(list){
	return this.firstBlock.checkListUsed(list);
};
BlockStack.prototype.hideDeviceDropDowns=function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
	this.updateDim();
};
BlockStack.prototype.showDeviceDropDowns=function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
	this.updateDim();
};
BlockStack.prototype.countDevicesInUse=function(deviceClass){
	return this.firstBlock.countDevicesInUse(deviceClass);
};
BlockStack.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	this.firstBlock[functionName].apply(this.firstBlock,args);
};
BlockStack.prototype.getWidth=function(){
	return this.dim.rw;
};
BlockStack.prototype.getHeight=function(){
	return this.dim.rh;
};
/**
 * Created by Tom on 6/12/2017.
 */

/**
 * Represents a request to be used with HtmlServer
 * @param url {String} - The beginning of the request
 * @constructor
 */
function HttpRequestBuilder(url){
	DebugOptions.validateNonNull(url);
	this.request = url;
	this.hasFirstParam = false;
}
/**
 * Adds a get parameter with the given key and value
 * @param key {String}
 * @param value {String} - The value will be escaped with
 */
HttpRequestBuilder.prototype.addParam = function(key, value){
	if(!this.hasFirstParam){
		this.hasFirstParam = true;
		this.request += "?";
	} else{
		this.request += "&";
	}
	this.request += key;
	this.request += "=";
	this.request += HtmlServer.encodeHtml(value);
};
/**
 * Returns the request to give to HtmlServer
 * @returns {String}
 */
HttpRequestBuilder.prototype.toString = function(){
	return this.request;
};


/* HtmlServer is a static class that will manage HTTP requests.
 * This class is not nearly finished.
 */
function HtmlServer(){
	HtmlServer.port=22179;
	HtmlServer.dialogVisible=false;
	HtmlServer.logHttp=false || DebugOptions.shouldLogHttp();
}
HtmlServer.decodeHtml = function(message){
	return decodeURIComponent(message);
};
HtmlServer.encodeHtml=function(message){
	/*if(message==""){
		return "%20"; //Empty strings can't be used in the URL.
	}*/
	var eVal;
	if (!encodeURIComponent) {
		eVal = escape(message);
		eVal = eVal.replace(/@/g, "%40");
		eVal = eVal.replace(/\//g, "%2F");
		eVal = eVal.replace(/\+/g, "%2B");
		eVal = eVal.replace(/'/g, "%60");
		eVal = eVal.replace(/"/g, "%22");
		eVal = eVal.replace(/`/g, "%27");
		eVal = eVal.replace(/&/g, "%26");
	} else {
		eVal = encodeURIComponent(message);
		eVal = eVal.replace(/~/g, "%7E");
		eVal = eVal.replace(/!/g, "%21");
		eVal = eVal.replace(/\(/g, "%28");
		eVal = eVal.replace(/\)/g, "%29");
		eVal = eVal.replace(/'/g, "%27");
		eVal = eVal.replace(/"/g, "%22");
		eVal = eVal.replace(/`/g, "%27");
		eVal = eVal.replace(/&/g, "%26");
	}
	return eVal; //.replace(/\%20/g, "+");
};
HtmlServer.sendRequestWithCallback=function(request,callbackFn,callbackErr,isPost,postData){
	callbackFn = DebugOptions.safeFunc(callbackFn);
	callbackErr = DebugOptions.safeFunc(callbackErr);
	if(HtmlServer.logHttp&&request.indexOf("totalStatus")<0&&
		request.indexOf("discover")<0&&request.indexOf("status")<0&&request.indexOf("response")<0) {
		GuiElements.alert(HtmlServer.getUrlForRequest(request));
	}
	if(DebugOptions.shouldSkipHtmlRequests()) {
		setTimeout(function () {
			/*if(callbackErr != null) {
				callbackErr();
			}*/
			if(callbackFn != null) {
				callbackFn("Started");
			}
		}, 20);
		return;
	}
	if(isPost == null) {
		isPost=false;
	}
	var requestType="GET";
	if(isPost){
		requestType="POST";
	}
	try {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4) {
				if (200 <= xhttp.status && xhttp.status <= 299) {
					if(callbackFn!=null){
						callbackFn(xhttp.responseText);
					}
				}
				else {
					if(callbackErr!=null){
						callbackErr(xhttp.status);
					}
					//GuiElements.alert("HTML error: "+xhttp.status+" \""+xhttp.responseText+"\"");
				}
			}
		};
		xhttp.open(requestType, HtmlServer.getUrlForRequest(request), true); //Get the names
		if(isPost){
			xhttp.setRequestHeader("Content-type", "text/plain; charset=utf-8");
			xhttp.send(postData);
		}
		else{
			xhttp.send(); //Make the request
		}
	}
	catch(err){
		if(callbackErr!=null){
			callbackErr();
		}
	}
};
HtmlServer.sendRequest=function(request,requestStatus){
	/*
	 setTimeout(function(){
		requestStatus.error = false;
		requestStatus.finished = true;
		requestStatus.result = "7";
	}, 300);
	return;
	*/
	if(requestStatus!=null){
		requestStatus.error=false;
		var callbackFn=function(response){
			callbackFn.requestStatus.finished=true;
			callbackFn.requestStatus.result=response;
		};
		callbackFn.requestStatus=requestStatus;
		var callbackErr=function(){
			callbackErr.requestStatus.finished=true;
			callbackErr.requestStatus.error=true;
		};
		callbackErr.requestStatus=requestStatus;
		HtmlServer.sendRequestWithCallback(request,callbackFn,callbackErr);
	}
	else{
		HtmlServer.sendRequestWithCallback(request);
	}
}
HtmlServer.getHBRequest=function(hBIndex,request,params){
	DebugOptions.validateNonNull(params);
	var res = "hummingbird/";
	res += request;
	res += "?id=" + HtmlServer.encodeHtml(HummingbirdManager.connectedHBs[hBIndex].id);
	res += params;
	return res;
};
HtmlServer.getUrlForRequest=function(request){
	return "http://localhost:"+HtmlServer.port+"/"+request;
}
HtmlServer.showDialog=function(title,question,prefill,callbackFn,callbackErr){
	TouchReceiver.touchInterrupt();
	HtmlServer.dialogVisible=true;
	//GuiElements.alert("Showing...");
	if(TouchReceiver.mouse){ //Kept for debugging on a PC
		var newText=prompt(question);
		HtmlServer.dialogVisible=false;
		callbackFn(newText==null,newText);
	}
	else{
		var HS=HtmlServer;
		var request = "tablet/dialog";
		request+="?title=" + HS.encodeHtml(title);
		request+="&question="+HS.encodeHtml(question);
		request+="&prefill="+HS.encodeHtml(prefill);
		request+="&selectAll=true";
		var onDialogPresented=function(result){
			//GuiElements.alert("dialog presented...");
			HS.getDialogResponse(onDialogPresented.callbackFn,onDialogPresented.callbackErr);
		}
		onDialogPresented.callbackFn=callbackFn;
		onDialogPresented.callbackErr=callbackErr;
		var onDialogFail=function(){
			//GuiElements.alert("dialog failed...");
			HtmlServer.dialogVisible=false;
			if(onDialogFail.callbackErr!=null) {
				onDialogFail.callbackErr();
			}
		}
		onDialogFail.callbackErr=callbackErr;
		HS.sendRequestWithCallback(request,onDialogPresented,onDialogPresented);
	}
}
HtmlServer.getDialogResponse=function(callbackFn,callbackErr){
	var HS=HtmlServer;
	var request = "tablet/dialog_response";
	var onResponseReceived=function(response){
		if(response=="No Response"){
			HS.sendRequestWithCallback(request,onResponseReceived,function(){
				//GuiElements.alert("Error2");
				HtmlServer.dialogVisible=false;
				callbackErr();
			});
			//GuiElements.alert("No resp");
		}
		else if(response=="Cancelled"){
			HtmlServer.dialogVisible=false;
			onResponseReceived.callbackFn(true);
			//GuiElements.alert("Cancelled");
		}
		else{
			HtmlServer.dialogVisible=false;
			var trimmed=response.substring(1,response.length-1);
			onResponseReceived.callbackFn(false,trimmed);
			//GuiElements.alert("Done");
		}
	}
	onResponseReceived.callbackFn=callbackFn;
	onResponseReceived.callbackErr=callbackErr;
	HS.sendRequestWithCallback(request,onResponseReceived,function(){
		HtmlServer.dialogVisible=false;
		if(callbackErr != null) {
			callbackErr();
		}
	});
}
HtmlServer.getFileName=function(callbackFn,callbackErr){
	var HS=HtmlServer;
	var onResponseReceived=function(response){
		if(response=="File has no name."){
			HtmlServer.getFileName(onResponseReceived.callbackFn,onResponseReceived.callbackErr);
		}
		else{
			onResponseReceived.callbackFn(response);
		}
	};
	onResponseReceived.callbackFn=callbackFn;
	onResponseReceived.callbackErr=callbackErr;
	HS.sendRequestWithCallback("filename",onResponseReceived,callbackErr);
};
HtmlServer.showChoiceDialog=function(title,question,option1,option2,swapIfMouse,callbackFn,callbackErr){
	TouchReceiver.touchInterrupt();
	HtmlServer.dialogVisible=true;
	if(TouchReceiver.mouse){ //Kept for debugging on a PC
		var result=confirm(question);
		HtmlServer.dialogVisible=false;
		if(swapIfMouse){
			result=!result;
		}
		if(result){
			callbackFn("1");
		}
		else{
			callbackFn("2");
		}
	}
	else {
		var HS = HtmlServer;
		var request = "tablet/choice";
		request += "?title=" + HS.encodeHtml(title);
		request += "&question=" + HS.encodeHtml(question);
		request += "&button1=" + HS.encodeHtml(option1);
		request += "&button2=" + HS.encodeHtml(option2);
		var onDialogPresented = function (result) {
			HS.getChoiceDialogResponse(onDialogPresented.callbackFn, onDialogPresented.callbackErr);
		};
		onDialogPresented.callbackFn = callbackFn;
		onDialogPresented.callbackErr = callbackErr;
		var onDialogFail = function () {
			HtmlServer.dialogVisible = false;
			if (onDialogFail.callbackErr != null) {
				onDialogFail.callbackErr();
			}
		};
		onDialogFail.callbackErr = callbackErr;
		HS.sendRequestWithCallback(request, onDialogPresented, onDialogFail);
	}
};
HtmlServer.getChoiceDialogResponse=function(callbackFn,callbackErr){
	var HS=HtmlServer;
	var request = "tablet/choice_response";
	var onResponseReceived=function(response){
		if(response=="0"){
			HtmlServer.getChoiceDialogResponse(onResponseReceived.callbackFn,onResponseReceived.callbackErr);
		}
		else{
			HtmlServer.dialogVisible=false;
			onResponseReceived.callbackFn(response);
		}
	};
	onResponseReceived.callbackFn=callbackFn;
	onResponseReceived.callbackErr=callbackErr;
	HS.sendRequestWithCallback(request,onResponseReceived,function(){
		HS.dialogVisible = false;
		if (callbackErr != null) {
			callbackErr();
		}
	});
};
HtmlServer.showAlertDialog=function(title,message,button,callbackFn,callbackErr){
	TouchReceiver.touchInterrupt();
	HtmlServer.dialogVisible=true;
	if(TouchReceiver.mouse){ //Kept for debugging on a PC
		var result=alert(message);
		HtmlServer.dialogVisible=false;
	}
	else {
		var HS = HtmlServer;
		var request = new HttpRequestBuilder("tablet/dialog/alert");
		request.addParam("title", HS.encodeHtml(title));
		request.addParam("message", HS.encodeHtml(message));
		request.addParam("button", HS.encodeHtml(button));
		HS.sendRequestWithCallback(request.toString(), callbackFn, callbackErr);
	}
};

HtmlServer.getSetting=function(key,callbackFn,callbackErr){
	HtmlServer.sendRequestWithCallback("settings/get?key="+HtmlServer.encodeHtml(key),callbackFn,callbackErr);
};
HtmlServer.setSetting=function(key,value){
	var request = "settings/set";
	request += "?key=" + HtmlServer.encodeHtml(key);
	request += "&value=" + HtmlServer.encodeHtml(value);
	HtmlServer.sendRequestWithCallback(request);
};
HtmlServer.sendFinishedLoadingRequest = function(){
	HtmlServer.sendRequestWithCallback("ui/contentLoaded")
};
function XmlWriter(){

}
XmlWriter.setAttribute=function(element,name,value){
	name=XmlWriter.escape(name);
	value=XmlWriter.escape(value);
	element.setAttribute(name,value);
};
XmlWriter.createElement=function(xmlDoc,tagName){
	tagName=XmlWriter.escape(tagName);
	return xmlDoc.createElement(tagName);
};
XmlWriter.createTextNode=function(xmlDoc,data){
	data=XmlWriter.escape(data);
	return xmlDoc.createTextNode(data);
};
XmlWriter.newDoc=function(tagName){
	tagName=XmlWriter.escape(tagName);
	var xmlString = "<"+tagName+"></"+tagName+">";
	var parser = new DOMParser();
	return parser.parseFromString(xmlString, "text/xml");
};
XmlWriter.escape=function(string){
	string=string+"";
	string=string.replace(/&/g, '&amp;');
	string=string.replace(/</g, '&lt;');
	string=string.replace(/>/g, '&gt;');
	string=string.replace(/"/g, '&quot;');
	string=string.replace(/'/g, '&apos;');
	return string;
};
XmlWriter.unEscape=function(string) {
	string = string + "";
	string = string.replace(/&apos;/g, "'");
	string = string.replace(/&quot;/g, '"');
	string = string.replace(/&gt;/g, '>');
	string = string.replace(/&lt;/g, '<');
	string = string.replace(/&amp;/g, '&');
	return string;
};
XmlWriter.downloadDoc=function(xmlDoc,name){
  window.open('data:text/xml,' + HtmlServer.encodeHtml(XmlWriter.docToText(xmlDoc)));
	//var blob = new Blob([XmlWriter.docToText(xmlDoc)], {type: "text/plain;charset=utf-8"});
	//saveAs(blob, name+".xml");
};
XmlWriter.openDocInTab=function(xmlDoc){
	window.open('data:text/xml,' + HtmlServer.encodeHtml(XmlWriter.docToText(xmlDoc)));
};
XmlWriter.openDoc=function(xmlString){
	var parser = new DOMParser();
	return parser.parseFromString(xmlString, "text/xml");
};
XmlWriter.findElement=function(xmlDoc,tagName){
	tagName=XmlWriter.escape(tagName);
	var results=xmlDoc.getElementsByTagName(tagName);
	if(results.length==0){
		return null;
	}
	return results[0];
};
XmlWriter.findSubElements=function(node,tagName){
	if(node==null){
		return [];
	}
	var children=node.childNodes;
	var results=[];
	for(var i=0;i<children.length;i++){
		if(children[i].nodeType==1&&children[i].nodeName==tagName){
			results.push(children[i]);
		}
	}
	return results;
};
XmlWriter.findSubElement=function(node,tagName){
	if(node==null){
		return null;
	}
	var children=node.childNodes;
	for(var i=0;i<children.length;i++){
		if(children[i].nodeType==1&&children[i].nodeName==tagName){
			return children[i];
		}
	}
	return null;
};
XmlWriter.getAttribute=function(element,name,defaultVal,isNum){
	if(isNum==null){
		isNum=false;
	}
	if(defaultVal==null){
		defaultVal=null;
	}
	var val=element.getAttribute(XmlWriter.escape(name));
	if(val==null){
		return defaultVal;
	}
	val=XmlWriter.unEscape(val);
	if(isNum){
		var numData=(new StringData(val)).asNum();
		if(numData.isValid){
			return numData.getValue();
		}
		return defaultVal;
	}
	return val;
};
XmlWriter.getTextNode=function(element,name,defaultVal,isNum){
	if(isNum==null){
		isNum=false;
	}
	if(defaultVal==null){
		defaultVal=null;
	}
	var innerNode=XmlWriter.findSubElement(element,name);
	if(innerNode==null){
		return defaultVal;
	}
	var childNodes=innerNode.childNodes;
	if(childNodes.length>=1&&childNodes[0].nodeType==3){
		var val = childNodes[0].nodeValue;
		if(val==null){
			return defaultVal;
		}
		val=XmlWriter.unEscape(val);
		if(isNum){
			var numData=(new StringData(val)).asNum();
			if(numData.isValid){
				return numData.getValue();
			}
			return defaultVal;
		}
		return val;
	}
	return defaultVal;
};
XmlWriter.docToText=function(xmlDoc){
	var serializer = new XMLSerializer();
	return serializer.serializeToString(xmlDoc);
};
XmlWriter.findNodeByKey = function(nodes, key){
	for(var i = 0; i < nodes.length; i++){
		var nodeKey = XmlWriter.getAttribute(nodes[i], "key", "");
		if(nodeKey == key){
			return nodes[i];
		}
	}
	return null;
};
function SaveManager(){
	SaveManager.invalidCharacters = "\\/:*?<>|.\n\r\0\"";
	SaveManager.invalidCharactersFriendly = "\\/:*?<>|.$";
	SaveManager.newFileName = "new program";
	SaveManager.saving = false;
	SaveManager.fileName = null;
	SaveManager.named = false;

	SaveManager.getCurrentDoc();
}

SaveManager.openBlank = function(nextAction){
	SaveManager.saveCurrentDoc(true);
	SaveManager.loadFile("<project><tabs></tabs></project>");
	if(nextAction != null) nextAction();
};
SaveManager.saveAndName = function(message, nextAction){
	var title = "Enter name";
	if(SaveManager.fileName == null){
		if (nextAction != null) nextAction();
		return;
	}
	SaveManager.forceSave(function () {
		if (SaveManager.named) {
			if (nextAction != null) nextAction();
		}
		else {
			SaveManager.promptRename(false, SaveManager.fileName, title, message, function () {
				SaveManager.named = true;
				if (nextAction != null) nextAction();
			});
		}
	});
};
SaveManager.userOpenFile = function(fileName){
	if(SaveManager.fileName == fileName) {return;}
	SaveManager.saveAndName("Please name this file before opening a different file", function(){
		SaveManager.open(fileName);
	});
};
SaveManager.open=function(fileName, named, nextAction){
	if(named == null){
		named = true;
	}
	var request = new HttpRequestBuilder("data/load");
	request.addParam("filename", fileName);
	HtmlServer.sendRequestWithCallback(request.toString(), function (response) {
		SaveManager.loadFile(response);
		SaveManager.saveCurrentDoc(false, fileName, named);
		if(nextAction != null) nextAction();
	});
};
// Saves a the current file and overwrites if the name exists
SaveManager.forceSave = function(nextAction){
	var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
	var request = new HttpRequestBuilder("data/save");
	request.addParam("filename", SaveManager.fileName);
	HtmlServer.sendRequestWithCallback(request.toString(),nextAction, null,true,xmlDocText);
};
SaveManager.userRename = function(){
	if(SaveManager.fileName == null) return;
	SaveManager.forceSave(function(){
		SaveManager.promptRename(false, SaveManager.fileName, "Rename");
	});
};
SaveManager.userRenameFile = function(isRecording, oldFilename, nextAction){
	SaveManager.promptRename(isRecording, oldFilename, "Rename", null, nextAction);
};
SaveManager.promptRename = function(isRecording, oldFilename, title, message, nextAction){
	SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, oldFilename, nextAction);
};
SaveManager.promptRenameWithDefault = function(isRecording, oldFilename, title, message, defaultName, nextAction){
	if(message == null){
		message = "Enter a file name";
	}
	HtmlServer.showDialog(title,message,defaultName,function(cancelled,response){
		if(!cancelled){
			SaveManager.sanitizeRename(isRecording, oldFilename, title, response.trim(), nextAction);
		}
	});
};
// Checks if a name is legitimate and renames the current file to that name if it is.
SaveManager.sanitizeRename = function(isRecording, oldFilename, title, proposedName, nextAction){
	if(proposedName == ""){
		SaveManager.promptRename(isRecording, oldFilename, title, "Name cannot be blank. Enter a file name.", nextAction);
	} else if(proposedName == oldFilename) {
		if(nextAction != null) nextAction();
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable){
			if(alreadySanitized && alreadyAvailable){
				SaveManager.renameSoft(isRecording, oldFilename, title, availableName, nextAction);
			} else if(!alreadySanitized){
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, availableName, nextAction);
			} else if(!alreadyAvailable){
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptRenameWithDefault(isRecording, oldFilename, title, message, availableName, nextAction);
			}
		}, isRecording);
	}
};
SaveManager.renameSoft = function(isRecording, oldFilename, title, newName, nextAction){
	var request = new HttpRequestBuilder("data/rename");
	request.addParam("oldFilename", oldFilename);
	request.addParam("newFilename", newName);
	request.addParam("options", "soft");
	request.addParam("recording", "" + isRecording);
	HtmlServer.sendRequestWithCallback(request.toString(), function(){
		if(oldFilename == SaveManager.fileName && !isRecording) {
			SaveManager.saveCurrentDoc(false, newName, true);
		}
		if(nextAction != null) nextAction();
	}, function(error){
		if(400 <= error && error < 500) {
			SaveManager.sanitizeRename(isRecording, title, newName, nextAction);
		}
	});
};
SaveManager.userDelete=function(){
	if(SaveManager.fileName == null) return;
	SaveManager.userDeleteFile(false, SaveManager.fileName);
};
SaveManager.userDeleteFile=function(isRecording, filename, nextAction){
	var question = "Are you sure you want to delete \"" + filename + "\"?";
	HtmlServer.showChoiceDialog("Delete", question, "Cancel", "Delete", true, function (response) {
		if(response == "2") {
			SaveManager.delete(isRecording, filename, function(){
				if(filename == SaveManager.fileName) {
					SaveManager.openBlank(nextAction);
				} else{
					if(nextAction != null) nextAction();
				}
			});
		}
	}, null);
};
SaveManager.delete = function(isRecording, filename, nextAction){
	var request = new HttpRequestBuilder("data/delete");
	request.addParam("filename", filename);
	request.addParam("recording", "" + isRecording);
	HtmlServer.sendRequestWithCallback(request.toString(), nextAction);
};
SaveManager.userNew = function(){
	SaveManager.saveAndName("Please name this file before creating a new file", SaveManager.openBlank);
};
/**
 * Issues a getAvailableName request and calls the callback with the results
 * @param filename {String}
 * @param callbackFn {function|undefined} - callbackFn(availableName, alreadySanitized, alreadyAvailable)
 * @param isRecording {boolean}
 */
SaveManager.getAvailableName = function(filename, callbackFn, isRecording){
	if(isRecording == null){
		isRecording = false;
	}
	DebugOptions.validateNonNull(callbackFn);
	var request = new HttpRequestBuilder("data/getAvailableName");
	request.addParam("filename", filename);
	request.addParam("recording", "" + isRecording);
	HtmlServer.sendRequestWithCallback(request.toString(), function(response){
		var json = {};
		try {
			json = JSON.parse(response);
		} catch(e){

		}
		if(json.availableName != null){
			callbackFn(json.availableName, json.alreadySanitized == true, json.alreadyAvailable == true);
		}
	});
};
SaveManager.loadFile=function(xmlString) {
	if (xmlString.length > 0) {
		if (xmlString.charAt(0) == "%") {
			xmlString = decodeURIComponent(xmlString);
			//HtmlServer.showChoiceDialog("file",xmlString,"Done","Done",true);
		}
		var xmlDoc = XmlWriter.openDoc(xmlString);
		var project = XmlWriter.findElement(xmlDoc, "project");
		if (project == null) {
			SaveManager.loadFile("<project><tabs></tabs></project>");
		}
		CodeManager.importXml(project);
	}
};
SaveManager.userDuplicate = function(){
	if(SaveManager.fileName == null) return;
	SaveManager.forceSave(function(){
		SaveManager.promptDuplicate("Enter name for duplicate file");
	});
};
SaveManager.promptDuplicate = function(message){
	SaveManager.getAvailableName(SaveManager.fileName, function(availableName){
		SaveManager.promptDuplicateWithDefault(message, availableName);
	});
};
SaveManager.promptDuplicateWithDefault = function(message, defaultName){
	HtmlServer.showDialog("Duplicate", message, defaultName, function(cancelled, response){
		if(!cancelled){
			SaveManager.sanitizeDuplicate(response.trim());
		}
	});
};
SaveManager.sanitizeDuplicate = function(proposedName){
	if(proposedName == ""){
		SaveManager.promptDuplicate("Name cannot be blank. Enter a file name.");
	} else {
		SaveManager.getAvailableName(proposedName, function(availableName, alreadySanitized, alreadyAvailable){
			if(alreadySanitized && alreadyAvailable){
				SaveManager.duplicate(availableName);
			} else if(!alreadySanitized){
				let message = "The following characters cannot be included in file names: \n";
				message += SaveManager.invalidCharactersFriendly.split("").join(" ");
				SaveManager.promptDuplicateWithDefault(message, availableName);
			} else if(!alreadyAvailable){
				let message = "\"" + proposedName + "\" already exists.  Enter a different name.";
				SaveManager.promptDuplicateWithDefault(message, availableName);
			}
		});
	}
};

SaveManager.duplicate = function(filename){
	var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
	var request = new HttpRequestBuilder("data/save");
	request.addParam("filename", filename);
	request.addParam("options", "soft");
	HtmlServer.sendRequestWithCallback(request.toString(), function(){
		SaveManager.saveCurrentDoc(false, filename, true);
	}, function(error){
		if(400 <= error && error < 500) {
			SaveManager.sanitizeDuplicate(filename);
		}
	}, true, xmlDocText);
};
SaveManager.userExport=function(){
	if(SaveManager.fileName == null) return;
	SaveManager.saveAndName("Please name this file so it can be exported", function(){
		SaveManager.export();
	});
};
SaveManager.export=function(){
	var request = new HttpRequestBuilder("data/export");
	request.addParam("filename", SaveManager.fileName);
	HtmlServer.sendRequestWithCallback(request.toString());
};
SaveManager.saveAsNew = function(){
	SaveManager.saving = true;
	var request = new HttpRequestBuilder("data/save");
	request.addParam("options", "new");
	request.addParam("filename", SaveManager.newFileName);
	var xmlDocText=XmlWriter.docToText(CodeManager.createXml());
	HtmlServer.sendRequestWithCallback(request.toString(), function(availableName){
		SaveManager.saveCurrentDoc(false, availableName, false);
		SaveManager.saving = false;
	}, function(){
		SaveManager.saving = false;
	}, true, xmlDocText);
};
SaveManager.markEdited=function(){
	if(SaveManager.fileName == null && !SaveManager.saving){
		SaveManager.saveAsNew();
	}
};
SaveManager.saveCurrentDoc = function(blank, fileName, named){
	if(blank){
		fileName = null;
		named = false;
		TitleBar.setText("");
	} else {
		TitleBar.setText(fileName);
	}
	SaveManager.fileName = fileName;
	SaveManager.named = named;
	let namedString = SaveManager.named? "true" : "false";
	if(blank) namedString = "blank";
	HtmlServer.setSetting("currentDocNamed", namedString);
	HtmlServer.setSetting("currentDoc", SaveManager.fileName);
};
SaveManager.getCurrentDoc = function(){
	var load = {};
	load.name = false;
	load.named = false;
	load.blank = false;
	load.currentDoc = null;
	load.currentDocNamed = null;
	var checkProgress = function(){
		if(load.name && load.named){
			if(!load.blank) {
				SaveManager.open(load.currentDoc, load.currentDocNamed);
			}
		}
	};
	HtmlServer.getSetting("currentDoc", function(response){
		load.currentDoc = response;
		load.name = true;
		checkProgress();
	});
	HtmlServer.getSetting("currentDocNamed", function(response){
		if(response == "true"){
			load.currentDocNamed = true;
		} else if (response == "false") {
			load.currentDocNamed = false;
		} else if (response == "blank") {
			load.blank = true;
		}
		load.named = true;
		checkProgress();
	});
};



SaveManager.import=function(fileName){
	let name = HtmlServer.decodeHtml(fileName);
	if(SaveManager.fileName == null){
		SaveManager.open(name);
		return;
	}
	SaveManager.forceSave(function () {
		SaveManager.open(name);
	});
};
/*SaveManager.getCurrentDocName = function(callbackFnName, callbackFnNameSet){
	SaveManager.printStatus("getCurrentDocName");
	HtmlServer.getSetting("currentDoc", function(response){
		SaveManager.currentDoc = response;
		SaveManager.fileName = response;
		callbackFnName();
	}, callbackFnName);
	HtmlServer.getSetting("currentDocNamed", function(response){
		SaveManager.currentDocNamed = response;
		callbackFnNameSet();
	}, callbackFnNameSet);
};*/
SaveManager.currentDoc = function(){ //Autosaves
	if(SaveManager.fileName == null) return null;
	var result = {};
	result.data = XmlWriter.docToText(CodeManager.createXml());
	result.filename = SaveManager.fileName;
	return result;
};

/* Block is an abstract class that represents an executable block.
 * Blocks are nearly always contained within BlockStacks or DisplayStacks.
 * Blocks are initially created outside a BlockStacks, but are immediately moved into one.  
 * This is because BlockStacks must always contain at least one Block, so the Block must be created first.
 * @constructor
 * @fix remove the type parameter and use blockShape and instead.
 * @param {number} type - The shape of the Block.  0=Command, 1=Reporter, 2=Predicate, 4=Hat, 5=Loop, 6=DoubleLoop.
 * @param {number} returnType - The type of data the Block returns.  Possible values stored in Block.returnTypes.
 * @param {number} x - The x coord of the Block (relative to the Tab/BlockStack/DisplayStack it is in).
 * @param {number} y - The y coord of the Block.
 * @param {string} category - The Block's category in string form.
 */
function Block(type,returnType,x,y,category){ //Type: 0=Command, 1=Reporter, 2=Predicate Fix! BG
	this.blockTypeName=this.constructor.name; //Keeps track of what type of Block this is.

	this.x=x; //Store coords
	this.y=y;
	this.type=type; //Fix! remove this property
	this.bottomOpen=(type==0||type==4||type==5||type==6); //Can Blocks be attached to the bottom of this Block?
	this.topOpen=(type==0||type==5||type==6); //Can Blocks be attached to the top of this Block?
	this.returnsValue=(returnType!=Block.returnTypes.none); //Does this Block attack to Slots and return a value?
	this.returnType=returnType; //What type of value does this Block return?
	this.hasBlockSlot1=(type==5||type==6); //Is this Block like an if block that has a special BlockSlot?
	this.hasBlockSlot2=(type==6); //Does it have two BlockSlots?
	this.hasHat=(type==4); //Is it a HatBlock?
	
	this.group=GuiElements.create.group(x,y); //Make a group to contain the part of this Block.
	this.parent=null; //A Block's parent is the Block/Slot/BlockSlot that it is attached to.  Currently, it has none.
	this.parts=new Array(); //The parts of a Block include its LabelText, BlockIcons, and Slots.
	this.slots=new Array(); //The slots array just holds the Slots.
	this.running=0; //Running: 0=Not started, 1=Waiting for slots to finish, 2=Running, 3=Completed.
	this.category=category;
	this.isGlowing=false;
	
	this.stack=null; //It has no Stack yet.
	this.path=this.generatePath(); //This path is the main visual part of the Block. It is colored based on category.
	this.height=0; //Will be set later when the Block's dimensions are updated.
	this.width=0;
	this.runMem=function(){}; //serves as a place for the block to store info while running
	if(this.bottomOpen){
		this.nextBlock=null; //Reference to the Block below this one.
	}
	if(this.returnsValue){
		this.resultData=null; //Stores the Data to be passed on to the Slot containing this Block.
	}
	if(this.hasBlockSlot1){
		this.topHeight=0; //The height of just the top of the Block (where the LabelText and Slots are)
		this.blockSlot1=new BlockSlot(this);
	}
	if(this.hasBlockSlot2){
		//The height of the middle part of a DoubleLoopBlock (where the LabelText "else" is on the if/else Block)
		this.midHeight=0;
		this.midLabel=new LabelText(this,this.midLabelText); //The text to appear in the middle section (i.e. "else");
		this.blockSlot2=new BlockSlot(this);
	}
}
/* Sets the possible values for Block.returnTypes.
 */
Block.setConstants=function(){
	Block.returnTypes=function(){};
	Block.returnTypes.none=0; //A command Block always is Block.returnTypes.none.
	Block.returnTypes.num=1;
	Block.returnTypes.string=2;
	Block.returnTypes.bool=3;
	Block.returnTypes.list=4;
};
Block.prototype.relToAbsX=function(x){
	if(this.stack!=null) {
		return this.stack.relToAbsX(x + this.x);
	}
	return x + this.x;
};
Block.prototype.relToAbsY=function(y){
	if(this.stack!=null) {
		return this.stack.relToAbsY(y + this.y);
	}
	return y + this.y;
};
Block.prototype.absToRelX=function(x){
	if(this.stack!=null) {
		return this.stack.absToRelX(x) - this.x;
	}
	return x - this.x;
};
Block.prototype.absToRelY=function(y){
	if(this.stack!=null) {
		return this.stack.absToRelY(y) - this.y;
	}
	return y - this.y;
};
/* Returns the x coord of the Block relative to the screen (not the group it is contained in).
 * @return {number} - The x coord of the Block relative to the screen.
 */
Block.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
/* Returns the y coord of the Block relative to the screen.
 * @return {number} - The y coord of the Block relative to the screen.
 */
Block.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
/* Creates and returns the main SVG path element for the Block.
 * @return {SVG path} - The main SVG path element for the Block.
 */
Block.prototype.generatePath=function(){
	var pathE=BlockGraphics.create.block(this.category,this.group,this.returnsValue);
	TouchReceiver.addListenersChild(pathE,this);
	return pathE;
};
/* Adds a part (LabelText, BlockIcon, or Slot) to the Block.
 * @param {LabelText/BlockIcon/Slot} part - part to add.
 */
Block.prototype.addPart=function(part){
	this.parts.push(part);
	if(part.isSlot){ //Slots are kept track of separately for recursive calls.
		this.slots.push(part);
	}
};
/**
 * Moves the Block and sets its this.x and this.y values.
 * @param {number} x - New x coord.
 * @param {number} y - New y coord.
 */
Block.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	//All parts of the Block are contained within its group to allow for easy movement.
	GuiElements.move.group(this.group,x,y);
};
/**
 * Recursively stops the Block, its Slots, and any subsequent Blocks.
 */
Block.prototype.stop=function(){
	this.running=0; //Stop this Block.
	this.runMem = {}; //Clear memory
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].stop(); //Stop this Block's Slots.
	}
	if(this.blockSlot1!=null){
		this.blockSlot1.stop(); //Stop the BlockSlots.
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.stop();
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		this.nextBlock.stop(); //Stop the next Block.
	}
};
/**
 * Updates this currently executing Block and returns if the Block is still running
 * @return {ExecutionStatus} - Indicates if the Block is still running and should be updated again.
 */
Block.prototype.updateRun=function(){
	//If a Block is told to run and it has not started or believes it is finished (from a previous execution)...
	if(this.running==0||this.running==3){
		for(let i=0;i<this.slots.length;i++){ //...Reset all Slots to prepare for execution
			this.slots[i].stop();
		}
		this.running=1; //Now the Block is ready to run its Slots.
	}
	var myExecStatus; //The value to return.
	if(this.running==1){ //If the Block is currently waiting on its Slots...
		for(let i=0;i<this.slots.length;i++){
			//Check to see if each Slot is done and update the first Slot that isn't done.
			let slotExecStatus = this.slots[i].updateRun();
			if(slotExecStatus.isRunning()){
				return new ExecutionStatusRunning();
			} else if(slotExecStatus.hasError()) {
				this.running = 3;
				return slotExecStatus;
			}
		}
		this.running=2; //If all Slots are done running, the Block itself may now run.
		//This function is overridden by the class of the particular Block.
		//It sets the Block up for execution, and if it is a simple Block, may even complete execution.
		myExecStatus = this.startAction();
	}
	else if(this.running==2){ //If the Block is currently running, update it.
		//This function is also overridden and is called repeatedly until the Block is done running.
		myExecStatus = this.updateAction();
	}
	if(!myExecStatus.isRunning()){ //If the block is done running...
		if(this.running != 0) {
			this.running = 3; //Record that the Block is done, provided that it was started
		}
		this.clearMem(); //Clear its runMem to prevent its computations from leaking into subsequent executions.
	}
	return myExecStatus; //Return a boolean indicating if this Block is done.
};
/**
 * Will be overridden. Is triggered once when the Block is first executed. Contains the Block's actual behavior.
 * @return {ExecutionStatus} - indicating if it has finished.
 */
Block.prototype.startAction=function(){
	return new ExecutionStatusRunning(); //Still running
};
/**
 * Will be overridden. Is triggered repeatedly until the Block is done running. Contains the Block's actual behavior.
 * @return {ExecutionStatus} - The next Block to run or a boolean indicating if it has finished.
 */
Block.prototype.updateAction=function(){
	return new ExecutionStatusRunning(); //Still running //Fix! by default this should be false.
};
/**
 * Once the Block is done executing, this function is used by a Slot to retrieve the Block's result.
 * Only used if Block returns a value.
 * Once the Block returns its value, it is done and can reset its state.
 * @return {Data} - The result of the Block's execution.
 */
Block.prototype.getResultData=function(){
	if(this.running==3){ //Only return data if the Block is done running.
		this.running=0; //Reset the Block's state. Prevents same data from ever being re-returned
		return this.resultData; //Access stored result data and return it.
	}
	return null; //If called when the block is not done running, return null. This should never happen.
};
/**
 * Recursively moves the Block, its Slots, and subsequent Blocks to another stack.
 * @param {BlockStack} stack - The stack the Blocks will be moved to.
 */
Block.prototype.changeStack=function(stack){
	this.stack=stack; //Move this Block to the stack
	this.group.remove(); //Remove this Block's SVG group from that of the old stack.
	stack.group.appendChild(this.group); //Add this Block's SVG group to the new stack.
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].changeStack(stack); //Recursively tell this Block's Slots to move thir children to the new stack.
	}
	if(this.nextBlock!=null){
		this.nextBlock.changeStack(stack); //Tell the next block to move.
	}
	if(this.blockSlot1!=null){
		this.blockSlot1.changeStack(stack); //If this block is a loop/if tell its contents to move.
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.changeStack(stack); //If it has a second BlockSlot, move it too.
	}
};
/**
 * Each BlockStack keeps track of its bounding rectangle.  This function recursively tells the Blocks to update it.
 * Each Block checks to see if it is outside the proposed bounding rectangle and if so adjusts it.
 * This function just handles the recursive part. The actual checks and adjustment are handled by updateStackDimO
 */
Block.prototype.updateStackDim=function(){
	//Slots are updated separately by updateStackDimRI.
	if(this.blockSlot1!=null){
		this.blockSlot1.updateStackDim(); //If this block is a loop/if tell its contents to update.
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.updateStackDim(); //If it has a second BlockSlot, update it too.
	}
	this.updateStackDimRI(); //Update the stack dimensions using information from this Block.
	if(this.nextBlock!=null){
		this.nextBlock.updateStackDim(); //Tell the next block to update.
	}
};
/**
 * Handles more of the recursion for updateStackDim.
 * RI stands for Recursive Inside.  RI functions update slots but not subsequent Blocks or BlockSlots.
 * This allows other functions to avoid unnecessary updates when full recursion is not needed.
 * updateStackDimO handled the actual updates.
 */
Block.prototype.updateStackDimRI=function(){
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].updateStackDim(); //Pass message on to Slots.
	}
	this.updateStackDimO(); //Update this Block.
};
/**
 * Checks to see if the Block is outside the bounding box of its Stack and if so adjusts it.
 * It is called recursively by updateStackDim and updateStackDimRI.
 * The stack has two bounding boxes. Both are used when looking for potential Blocks to snap to.
 * Reporters/predicates can snap to the large r bounding box.
 * Commands can snap to the smaller c bounding box.
 * (the r box is larger because they can be snapped to the middle of other blocks while command blocks can't)
 * The point of stack bounding boxes is that when looking for potential Blocks to snap only those inside a matching
 * stack have to be investigated.
 */
Block.prototype.updateStackDimO=function(){
	var sDim=this.stack.dim; //Loads the stack's dimension data.
	var snap=BlockGraphics.command.snap; //Loads the snap bounding box for command blocks.
	if(this.bottomOpen||this.topOpen){ //Only update the c box if this is a command block //Fix! use !this.returnsValue
		var cx1=this.x-snap.left; //Create bounding rectangle for this particular command Block
		var cy1=this.y-snap.top;
		var cx2=this.x+snap.right;
		var cy2=this.y+this.height+snap.bottom;
		if(cx1<sDim.cx1){ //If the edge of the Block is outside the stack, adjust the stack's dims.
			sDim.cx1=cx1;
		}
		if(cy1<sDim.cy1){
			sDim.cy1=cy1;
		}
		if(cx2>sDim.cx2){
			sDim.cx2=cx2;
		}
		if(cy2>sDim.cy2){
			sDim.cy2=cy2;
		}
	}
	var rx1=this.x; //The r bounding box is just the size of the Block itself.
	var ry1=this.y;
	var rx2=this.x+this.width;
	var ry2=this.y+this.height;
	if(rx1<sDim.rx1){ //If the edge of the Block is outside the stack, adjust the stack's dims.
		sDim.rx1=rx1;
	}
	if(ry1<sDim.ry1){
		sDim.ry1=ry1;
	}
	if(rx2>sDim.rx2){
		sDim.rx2=rx2;
	}
	if(ry2>sDim.ry2){
		sDim.ry2=ry2;
	}
	//The Stacks dimensions now include the Block.
	//Note that the r box is also the visual bounding box of the stack as well as the reporter snap bounding box.
};
/**
 * Recursively adjusts the sizes of all the parts of the Block (Slots, children, labels, etc.)
 * It does not move the parts, however.  That is done later using updateAlign once the sizing is finished.
 */
Block.prototype.updateDim=function(){
	var bG=BlockGraphics.getType(this.type); //Fix! loads dimension data from BlockGraphics.
	if(this.topOpen||this.bottomOpen){ //If this is a command block, then use the BlockGraphics for command blocks.
		bG=BlockGraphics.command; //If the block if a Loop or DoubleLoop, use the CommandBlock dimension instead.
	}
	var width=0;
	width+=bG.hMargin; //The left margin of the Block.
	var height=0;
	for(var i=0;i<this.parts.length;i++){
		this.parts[i].updateDim(); //Tell all parts of the Block to update before using their widths for calculations.
		width+=this.parts[i].width; //Fill the width of the middle of the Block
		if(this.parts[i].height>height){ //The height of the Block is the height of the tallest member.
			height=this.parts[i].height;
		}
		if(i<this.parts.length-1){
			width+=BlockGraphics.block.pMargin; //Add "part margin" between parts of the Block.
		}
	}
	width+=bG.hMargin; //Add the right margin of the Block.
	height+=2*bG.vMargin; //Add the bottom and top margins of the Block.
	if(height<bG.height){ //If the height is less than the min height, fix it.
		height=bG.height;
	}
	if(this.hasBlockSlot1){ //If it has a BlockSlot update that.
		this.topHeight=height; //The topHeight is the height of everything avove the BlockSlot.
		this.blockSlot1.updateDim(); //Update the BlockSlot.
		height+=this.blockSlot1.height; //The total height, however, includes the BlockSlot.
		height+=BlockGraphics.loop.bottomH; //It also includes the bottom part of the loop.
	}
	if(this.hasBlockSlot2){ //If the Block has a second BlockSlot...
		this.midLabel.updateDim(); //Update the label in between the two BlockSlots.
		this.midHeight=this.midLabel.height; //Add the Label's height to the total.
		this.midHeight+=2*bG.vMargin; //The height between the BlockSlots also includes the margin of that area.
		if(this.midHeight<bG.height){ //If it's less than the minimum, adjust it.
			this.midHeight=bG.height;
		}
		height+=this.midHeight; //Add the midHeight to the total.
		this.blockSlot2.updateDim(); //Update the secodn BlockSlot.
		height+=this.blockSlot2.height; //Add its height to the total.
	}
	//If the Block was a loop or DoubleLoop now we are dealing with its actual properties (not those of command)
	bG=BlockGraphics.getType(this.type);
	if(width<bG.width){ //If it is less than the minimum width, adjust it.
		width=bG.width;
	}
	this.resize(width,height); //Resize this Block to the new widths.
	if(this.nextBlock!=null){
		this.nextBlock.updateDim(); //Pass the message to the next Block.
	}
};
/**
 * Recursively adjusts the positioning of all the parts of the Block (Slots, children, labels, etc.)
 * The BlockStack calls this function after the updateDim function, so all sizes are correct.
 * @param {number} x - The x coord this block should have when completed.
 * @param {number} y - The y coord the block should have.
 * @return {number} - The width of the current block, indicating how much the x should shift over.
 * y is measured from the top for all Blocks, x is measured from the left.
 */
Block.prototype.updateAlign=function(x,y){
	var bG=BlockGraphics;
	this.updateAlignRI(x,y); //Update recursively within the block.
	if(this.hasBlockSlot1){ //Then tell all susequent blocks to align.
		this.blockSlot1.updateAlign(this.x+bG.loop.side,this.y+this.topHeight);
	}
	if(this.hasBlockSlot2){
		this.blockSlot2.updateAlign(this.x+bG.loop.side,this.y+this.topHeight+this.blockSlot1.height+this.midHeight);
		this.midLabel.updateAlign(bG.loop.side,this.topHeight+this.blockSlot1.height+this.midHeight/2);
	}
	if(this.nextBlock!=null){
		this.nextBlock.updateAlign(this.x,this.y+this.height);
	}
	return this.width;
};
/**
 * Adjusts the positioning of the Block's internal parts.  Recursively updates their children.
 * @param {number} x - The x coord this block should have when completed.
 * @param {number} y - The y coord the block should have.
 * y is measured from the top for all Blocks, x is measured from the left.
 */
Block.prototype.updateAlignRI=function(x,y){
	this.move(x,y); //Move to the desired location
	var bG=BlockGraphics.getType(this.type);
	var yCoord=this.height/2; //Compute coords for internal parts.
	var xCoord=0;
	if(this.hasBlockSlot1){
		yCoord=this.topHeight/2; //Internal parts measure their y coords from the center of the block.
	}
	if(this.bottomOpen||this.topOpen){
		bG=BlockGraphics.command;
	}
	xCoord+=bG.hMargin;
	for(var i=0;i<this.parts.length;i++){
		xCoord+=this.parts[i].updateAlign(xCoord,yCoord); //As each element is adjusted, shift over by the space used.
		if(i<this.parts.length-1){
			xCoord+=BlockGraphics.block.pMargin;
		}
	}
};
/**
 * Resizes the path of the Block to the specified width and height.  The sizes of its BlockSlots are also considered.
 * @param {number} width - The desired width of the Block.
 * @param {number} height - The desired height of the Block.
 */
Block.prototype.resize=function(width,height){
	var BG=BlockGraphics;
	//First set width and height properties.
	this.width=width;
	this.height=height;
	//Then collect other necessary information.
	var innerHeight1=0;
	var innerHeight2=0;
	var midHeight=0;
	if(this.hasBlockSlot1){
		innerHeight1=this.blockSlot1.height;
	}
	if(this.hasBlockSlot2){
		innerHeight2=this.blockSlot2.height;
		midHeight=this.midHeight;
	}
	//Tell BlockGraphics to change the path description to match the new properties.
	BG.update.path(this.path,0,0,width,height,this.type,false,innerHeight1,innerHeight2,midHeight,this.bottomOpen);
};
/**
 * Recursively searches for the Block with best fits the currently moving BlockStack.
 * Stores information about any matches in CodeManager.fit and uses data from CodeManager.move.
 * A command block attempts to find a connection between its bottom and the moving stack's top.
 * Connections to the top of the stack's findBestFit.
 */
Block.prototype.findBestFit=function(){
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.getAbsX(); //Get coords to compare.
	var y=this.getAbsY();
	var height = this.relToAbsY(this.height) - y;
	var hasMatch = false;

	if(move.returnsValue) { //If a connection between the stack and block are possible...
		var hasMatch = false;
		if(move.returnsValue){ //If the moving stack returns a value, see if it fits in any slots.
			for(var i=0;i<this.slots.length;i++){
				let slotHasMatch = this.slots[i].findBestFit();
				hasMatch = slotHasMatch || hasMatch;
			}
		}
	}
	else if(move.topOpen&&this.bottomOpen) { //If a connection between the stack and block are possible...
		var snap=BlockGraphics.command.snap; //Load snap bounding box
		//see if corner of moving block falls within the snap bounding box.
		var snapBLeft=x-snap.left;
		var snapBTop=y-snap.top;
		var snapBWidth=snap.left+snap.right;
		var snapBHeight=snap.top+height+snap.bottom;
		//Check if point falls in a rectangular range.
		if(move.pInRange(move.topX,move.topY,snapBLeft,snapBTop,snapBWidth,snapBHeight)) {
			var xDist = move.topX - x; //If it does, compute the distance with the distance formula.
			var yDist = move.topY - (y + this.height);
			var dist = xDist * xDist + yDist * yDist; //Technically this is the distance^2.
			if (!fit.found || dist < fit.dist) { //See if this fit is closer than the current best fit.
				fit.found = true; //If so, save it and other helpful infromation.
				fit.bestFit = this;
				fit.dist = dist;
			}
		}
	}
	if(this.hasBlockSlot1){ //Pass the message on recursively.
		this.blockSlot1.findBestFit();
	}
	if(this.hasBlockSlot2){
		this.blockSlot2.findBestFit();
	}
	if(this.nextBlock!=null){
		this.nextBlock.findBestFit();
	}
	return hasMatch;
};
/**
 * Adds an indicator showing that the moving BlockStack will snap onto this Block if released.
 * The indicator is a different color/shape depending on the Block's type and if it is running.
 */
Block.prototype.highlight=function(){
	if(this.bottomOpen){
		Highlighter.highlight(this.getAbsX(),this.relToAbsY(this.height),this.width,this.height,0,false,this.isGlowing);
	}
	else{ //If a block returns a value, the BlockStack can only attach to one of its slots, not the Block itself.
		GuiElements.throwError("Error: attempt to highlight block that has bottomOpen=false");
	}
};
/**
 * Attaches the provided Block (and all subsequent Block's) to the bottom of this Block. Then runs updateDim();
 * @param {Block} block - The first Block in the stack to attach to this Block.
 */
Block.prototype.snap=function(block){ //Fix! documentation
	//If the Block cannot have other blocks below it, any other blocks must now be disconnected.
	var bottomStackBlock=block.getLastBlock(); //The bottom Block in the stack to be inserted.
	if(!bottomStackBlock.bottomOpen&&this.nextBlock!=null){
		var bG=BlockGraphics.command;
		this.nextBlock.unsnap().shiftOver(bG.shiftX,block.stack.getHeight()+bG.shiftY);
	}
	var stack=this.stack;
	if(block.stack!=null) {
		if (stack.isRunning && !block.stack.isRunning) { //Fix! remove duplicate code.
			block.glow();
		}
		else if (!stack.isRunning && block.stack.isRunning) { //Blocks that are added are stopped.
			block.stack.stop();
		}
		else if (stack.isRunning && block.isRunning) { //The added block is stopped, but still glows as part of a running stack.
			block.stop();
		}
	}
	var upperBlock=this; //The Block which will go above the inserted stack.
	var lowerBlock=this.nextBlock;//The Block which will go below the inserted stack. Might be null.
	var topStackBlock=block; //The top Block in the stack to be inserted.

	//The top of where the stack is inserted note which Blocks are above/below them.
	upperBlock.nextBlock=topStackBlock;
	topStackBlock.parent=upperBlock;
	//The bottom of where the stack is inserted does the same.
	bottomStackBlock.nextBlock=lowerBlock;
	if(lowerBlock!=null){ //There might not be a Block below the inserted stack.
		lowerBlock.parent=bottomStackBlock;
	}
	var oldG=null;
	if(block.stack!=null) {
		oldG=block.stack.group; //Get a handle to the old stack's group
		block.stack.remove(); //Remove the old stack.
	}
	if(this.stack!=null) {
		block.changeStack(this.stack); //Move the block over into this stack
	}
	if(oldG!=null) {
		oldG.remove(); //Remove the old stack's group.
	}
	if(this.stack!=null) {
		this.stack.updateDim(); //Update the dimensions now that the movement is complete.
	}
};
/**
 * Disconnects this Block from the Blocks above it and returns the new;y-created BlockStack. Calls updateDim on parent.
 * @return {BlockStack} - A BlockStack containing this Block and all subsequent Blocks.
 */
Block.prototype.unsnap=function(){
	//If this has a parent, then it needs to disconnect and make a new stack.  Otherwise, it returns its current stack.
	if(this.parent!=null){
		if(this.parent.isSlot||this.parent.isBlockSlot){ //Sees if it is attached to a Slot not another Block.
			this.parent.removeChild(); //Leave the Slot.
			this.parent.parent.stack.updateDim(); //Tell the stack the Slot belongs to to update its dimensions.
		}
		else{ //This Block is connected to another Block.
			this.parent.nextBlock=null; //Disconnect from parent Block.
			this.parent.stack.updateDim(); //Tell parent's stack to update dimensions.
		}
		this.parent=null; //Delete reference to parent Block/Slot/BlockSlot.
		//Make a new BlockStack with this Block in current Tab.  Also moves over any subsequent Blocks.
		return new BlockStack(this,this.stack.getTab());
	}
	//If the Block already had no parent, just return this Block's stack.
	return this.stack;
};
/**
 * Recursively finds and returns the last Block in this BlockStack.
 * @return {Block} - The last Block in this BlockStack.
 */
Block.prototype.getLastBlock=function(obj){
	if(this.nextBlock==null){
		return this; //This Block is the last one.
	}
	else{
		return this.nextBlock.getLastBlock(); //Try the next Block.
	}
};
/**
 * Recursively returns the height of this Block and all subsequent Blocks. Used by BlockSlots to determine height.
 * @return {number} - The height of this Block and all subsequent Blocks.
 */
Block.prototype.addHeights=function(){
	if(this.nextBlock!=null){
		return this.height+this.nextBlock.addHeights(); //Return this Block's height plus those below it.
	}
	else{
		return this.height; //This is the last Block. Return its height.
	}
};
/* Returns a copy of this Block, its Slots, subsequent Blocks, and nested Blocks. Uses Recursion.
 * @return {Block} - This Block's copy.
 */
/**
 * Returns a copy of this Block, its Slots, subsequent Blocks, and nested Blocks. Uses Recursion.
 * @param {number} x - The new Block's x coord.
 * @param {number} y - The new Block's y coord.
 * @return {Block} - This Block's copy.
 */
Block.prototype.duplicate = function(x, y){
	var myCopy = null;
	if(this.variable != null){ //Copy variable data if this is a variable Block.
		myCopy = new this.constructor(x, y, this.variable);
	}
	else if(this.list != null){
		myCopy = new this.constructor(x, y, this.list);
	}
	else {
		myCopy = new this.constructor(x, y);
	}
	myCopy.copyFrom(this);
	return myCopy;
};
/**
 * Takes a Block and copy's its slot data and subsequent blocks into this Block.  Used in duplication.
 * @param {Block} block - The block to copy the data from.  Must be of the same type.
 */
Block.prototype.copyFrom = function(block){
	DebugOptions.assert(block.blockTypeName == this.blockTypeName);
	for(var i=0;i<this.slots.length;i++){ //Copy block's slots to this Block.
		this.slots[i].copyFrom(block.slots[i]);
	}
	if(this.blockSlot1!=null){ //Copy the contents of its BlockSlots.
		this.blockSlot1.copyFrom(block.blockSlot1);
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.copyFrom(block.blockSlot2);
	}
	if(block.nextBlock!=null){ //Copy subsequent Blocks.
		this.nextBlock=block.nextBlock.duplicate(0,0);
		this.nextBlock.parent=this;
	}
};

/* Returns an entirely text-based version of the Block for display in dialogs.
 * May exclude a slot and replace if with "___".
 * @param {Slot} slotToExclude - (optional) The Slot to replace with "___".
 * @return {string} - The finished text summary.
 */
Block.prototype.textSummary=function(slotToExclude){
	var summary="";
	for(var i=0;i<this.parts.length;i++){
		if(this.parts[i]==slotToExclude){
			summary+="___"; //Replace slot with underscores.
		}
		else{
			summary+=this.parts[i].textSummary(); //Recursively build text summary from text summary of contents.
		}
		if(i<this.parts.length-1){ //Add space between part descriptions.
			summary+=" ";
		}
	}
	return summary;
};
/* Overridden by subclasses. Alerts Block that the flag was clicked. Most Blocks won't respond to this directly.
 */
Block.prototype.eventFlagClicked=function(){
	
};
/* Overridden by subclasses. Passes broadcast message to Block. */
Block.prototype.eventBroadcast=function(message){

};
/* Overridden by subclasses. Passes broadcast message to Block. */
Block.prototype.checkBroadcastRunning=function(message){
	return false;
};
/* Recursively checks if a given message is still in use by any of the DropSlots. */
Block.prototype.checkBroadcastMessageAvailable=function(message){
	for(var i=0;i<this.slots.length;i++){
		if(this.slots[i].checkBroadcastMessageAvailable(message)){
			return true;
		}
	}
	if(this.blockSlot1!=null){
		if(this.blockSlot1.checkBroadcastMessageAvailable(message)){
			return true;
		}
	}
	if(this.blockSlot2!=null){
		if(this.blockSlot2.checkBroadcastMessageAvailable(message)){
			return true;
		}
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		if(this.nextBlock.checkBroadcastMessageAvailable(message)){
			return true;
		}
	}
	return false;
};
/* Recursively updates the available broadcast messages.
 */
Block.prototype.updateAvailableMessages=function(){
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].updateAvailableMessages();
	}
	if(this.blockSlot1!=null){
		this.blockSlot1.updateAvailableMessages();
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.updateAvailableMessages();
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		this.nextBlock.updateAvailableMessages();
	}
};
/* Deletes the Block's running memory (memory reserved for computations related to execution)
 */
Block.prototype.clearMem=function(){
	this.runMem=new function(){}; //Delete all runMem.
	for(var i=0;i<this.slots.length;i++){ //NOT recursive.
		this.slots[i].clearMem(); //Removes resultData and resets running state to 0.
	}
};
/* Returns the result of the Block's execution.
 * The data is then removed to prevent the result from being returned again.
 */
Block.prototype.getResultData=function(){
	var result=this.resultData;
	this.resultData=null;
	return result;
};
/* Recursively adds a white outline to indicate that the BlockStack is running. */
Block.prototype.glow=function(){
	BlockGraphics.update.glow(this.path);
	this.isGlowing=true; //Used by other classes to determine things like highlight color.
	if(this.blockSlot1!=null){
		this.blockSlot1.glow();
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.glow();
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		this.nextBlock.glow();
	}
};
/* Recursively removes the outline. */
Block.prototype.stopGlow=function(){
	BlockGraphics.update.stroke(this.path,this.category,this.returnsValue);
	this.isGlowing=false;
	if(this.blockSlot1!=null){
		this.blockSlot1.stopGlow();
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.stopGlow();
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		this.nextBlock.stopGlow();
	}
};

Block.prototype.writeToXml=function(xmlDoc,xmlBlocks){
	xmlBlocks.appendChild(this.createXml(xmlDoc));
	if(this.bottomOpen&&this.nextBlock!=null){
		this.nextBlock.writeToXml(xmlDoc,xmlBlocks);
	}
};
Block.prototype.createXml=function(xmlDoc){
	var block=XmlWriter.createElement(xmlDoc,"block");
	XmlWriter.setAttribute(block,"type",this.blockTypeName);
	var slots=XmlWriter.createElement(xmlDoc,"slots");
	XmlWriter.setAttribute(slots,"keyVal","true");
	for(var i=0;i<this.slots.length;i++){
		slots.appendChild(this.slots[i].createXml(xmlDoc));
	}
	block.appendChild(slots);
	if(this.blockSlot1!=null){
		var blockSlots=XmlWriter.createElement(xmlDoc,"blockSlots");
		blockSlots.appendChild(this.blockSlot1.createXml(xmlDoc));
		if(this.blockSlot2!=null){
			blockSlots.appendChild(this.blockSlot2.createXml(xmlDoc));
		}
		block.appendChild(blockSlots);
	}
	return block;
};
Block.importXml=function(blockNode){
	var type=XmlWriter.getAttribute(blockNode,"type");
	var block;
	try {
		if (type.substring(0, 2) == "B_") {
			if(window[type].importXml!=null){
				return window[type].importXml(blockNode);
			}
			else {
				block = new window[type](0, 0);
			}
		}
		else{
			return null;
		}
	}
	catch(e) {
		return null;
	}
	block.copyFromXml(blockNode);
	return block;
};
Block.prototype.importSlotXml = function(slotsNode){
	var keyVal = XmlWriter.getAttribute(slotsNode, "keyVal", "false") == "true";
	var slotNodes=XmlWriter.findSubElements(slotsNode,"slot");
	if(keyVal){
		for(let i=0;i<this.slots.length;i++){
			let key = this.slots[i].getKey();
			let slot = XmlWriter.findNodeByKey(slotNodes, key);
			if(slot != null) {
				this.slots[i].importXml(slot);
			}
		}
	}
	else{
		for(let i=0;i<slotNodes.length&&i<this.slots.length;i++){
			this.slots[i].importXml(slotNodes[i]);
		}
	}
};
Block.prototype.copyFromXml = function(blockNode){
	var slotsNode=XmlWriter.findSubElement(blockNode,"slots");
	this.importSlotXml(slotsNode);
	var blockSlotsNode=XmlWriter.findSubElement(blockNode,"blockSlots");
	var blockSlotNodes=XmlWriter.findSubElements(blockSlotsNode,"blockSlot");
	if(this.blockSlot1!=null&&blockSlotNodes.length>=1){
		this.blockSlot1.importXml(blockSlotNodes[0]);
	}
	if(this.blockSlot2!=null&&blockSlotNodes.length>=2){
		this.blockSlot2.importXml(blockSlotNodes[1]);
	}
};
Block.prototype.renameVariable=function(variable){
	this.passRecursively("renameVariable",variable);
};
Block.prototype.deleteVariable=function(variable){
	this.passRecursively("deleteVariable",variable);
};
Block.prototype.renameList=function(list){
	this.passRecursively("renameList",list);
};
Block.prototype.deleteList=function(list){
	this.passRecursively("deleteList",list);
};
Block.prototype.checkVariableUsed=function(variable){
	for(var i=0;i<this.slots.length;i++){
		if(this.slots[i].checkVariableUsed(variable)){
			return true;
		}
	}
	if(this.blockSlot1!=null){
		if(this.blockSlot1.checkVariableUsed(variable)){
			return true;
		}
	}
	if(this.blockSlot2!=null){
		if(this.blockSlot2.checkVariableUsed(variable)){
			return true;
		}
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		if(this.nextBlock.checkVariableUsed(variable)){
			return true;
		}
	}
	return false;
};
Block.prototype.checkListUsed=function(list){
	for(var i=0;i<this.slots.length;i++){
		if(this.slots[i].checkListUsed(list)){
			return true;
		}
	}
	if(this.blockSlot1!=null){
		if(this.blockSlot1.checkListUsed(list)){
			return true;
		}
	}
	if(this.blockSlot2!=null){
		if(this.blockSlot2.checkListUsed(list)){
			return true;
		}
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		if(this.nextBlock.checkListUsed(list)){
			return true;
		}
	}
	return false;
};
Block.prototype.hideDeviceDropDowns=function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
};
Block.prototype.showDeviceDropDowns=function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
};
Block.prototype.countDevicesInUse=function(deviceClass){
	var largest=1;
	for(var i=0;i<this.slots.length;i++){
		largest=Math.max(largest,this.slots[i].countDevicesInUse(deviceClass));
	}
	if(this.blockSlot1!=null){
		largest=Math.max(largest,this.blockSlot1.countDevicesInUse(deviceClass));
	}
	if(this.blockSlot2!=null){
		largest=Math.max(largest,this.blockSlot2.countDevicesInUse(deviceClass));
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		largest=Math.max(largest,this.nextBlock.countDevicesInUse(deviceClass));
	}
	return largest;
};
Block.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	for(var i=0;i<this.slots.length;i++){
		var currentSlot=this.slots[i];
		currentSlot[functionName].apply(currentSlot,args);
	}
	if(this.blockSlot1!=null){
		this.blockSlot1[functionName].apply(this.blockSlot1,args);
	}
	if(this.blockSlot2!=null){
		this.blockSlot2[functionName].apply(this.blockSlot2,args);
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		this.nextBlock[functionName].apply(this.nextBlock,args);
	}
};
Block.prototype.displayResult = function(data){
	var value = data.asString().getValue();
	this.displayValue(value, false);
};
Block.prototype.displayValue = function(message, error){
	var x=this.getAbsX();
	var y=this.getAbsY();
	var width=this.relToAbsX(this.width) - x;
	var height=this.relToAbsY(this.height) - y;
	GuiElements.displayValue(message,x,y,width,height, error);
};
Block.prototype.displayError = function(message){
	this.displayValue(message, true);
};
Block.setDisplaySuffix = function(Class, suffix){
	Block.setDeviceSuffixFn(Class, function(){
		return suffix;
	});
};
Block.setDeviceSuffixFn = function(Class, suffixFn){
	Class.prototype.displayResult = function(data){
		if(data.isValid) {
			var value = data.asString().getValue();
			this.displayValue(value + " " + suffixFn(), false);
		}
		else{
			this.displayValue(data.asString().getValue(), false);
		}
	};
};
/* Child of Block. The CommandBlock is for Blocks that return no value but have no BlockSlots.
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {boolean} bottomOpen - Can Blocks be attached to the bottom of this Block?
 */
function CommandBlock(x,y,category,bottomOpen){
	Block.call(this,0,Block.returnTypes.none,x,y,category); //Call constructor.
	if(bottomOpen!=null&&bottomOpen==false){ //if bottomOpen is false, change it from the default.
		this.bottomOpen=false;
	}
}
CommandBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
CommandBlock.prototype.constructor = CommandBlock;
/* Child of Block. The CommandBlock is for Blocks that return values other than booleans.
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {number} returnType - (optional) The type of data the Block returns (from Block.returnTypes). Default: num.
 */
function ReporterBlock(x,y,category,returnType){
	if(returnType==null){
		returnType=Block.returnTypes.num; //Return nums by default.
	}
	Block.call(this,1,returnType,x,y,category); //Call constructor.
}
ReporterBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
ReporterBlock.prototype.constructor = ReporterBlock;
/* Child of Block. The CommandBlock is for Blocks that return booleans.
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 */
function PredicateBlock(x,y,category){
	Block.call(this,2,Block.returnTypes.bool,x,y,category); //Call constructor.
}
PredicateBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
PredicateBlock.prototype.constructor = PredicateBlock;

/* Child of Block. The HatBlock is for Blocks like CommandBlock but which have rounded tops which accept no Blocks.
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 */
function HatBlock(x,y,category){
	Block.call(this,4,Block.returnTypes.none,x,y,category); //Call constructor.
}
HatBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
HatBlock.prototype.constructor = HatBlock;
/* Child of Block. The DoubleLoopBlock is for Blocks like CommandBlock but with a space for additional Blocks
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {boolean} bottomOpen - Can Blocks be attached to the bottom of this Block?
 */
function LoopBlock(x,y,category,bottomOpen){
	Block.call(this,5,Block.returnTypes.none,x,y,category); //Call constructor.
	if(bottomOpen!=null&&bottomOpen==false){ //if bottomOpen is false, change it from the default.
		this.bottomOpen=false;
	}
}
LoopBlock.prototype = Object.create(Block.prototype); //Everything else is the same as Block.
LoopBlock.prototype.constructor = LoopBlock;
/* Child of Block. The DoubleLoopBlock is for Blocks like CommandBlock but with two spaces for additional Blocks
 * @constructor
 * @param {number} x - The x coord for the Block.
 * @param {number} y - The y coord for the Block.
 * @param {string} category - The Block's category in string form. Used mainly to color it.
 * @param {boolean} midLabelText - i.e. "Else".  The text to label the second BlockSlot.
 */
function DoubleLoopBlock(x,y,category,midLabelText){
	this.midLabelText=midLabelText; //Is set before constructor so Block is ready to render when constructor runs.
	Block.call(this,6,Block.returnTypes.none,x,y,category);
}
DoubleLoopBlock.prototype = Object.create(Block.prototype);
DoubleLoopBlock.prototype.constructor = DoubleLoopBlock;
/**
 * Slot is an abstract class that represents a space on a Block where data can be entered and Block attached.
 * Every Slot has a parent Block which it relies on heavily.
 * Slots can be edited in different ways, as indicated by their shape.
 * Slots can accept different types of Blocks and can automatically convert Data into a certain type.
 * Block implementations first update their Slots (compute their values) before accessing them.
 * Slots must implement updateDimNR(); moveSlot(x,y); hideSlot(); showSlot(); highlight(); buildSlot();
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of. Slots can't change their parents.
 * @param {number} inputType - [none,num,string,drop] The type of Data which can be directly entered into the Slot.
 * @param {number} snapType - [none,numStrBool,bool,list,any] The type of Blocks which can be attached to the Slot.
 * @param {number} outputType - [any,num,string,bool,list] The type of Data the Slot should convert to before outputting.
 * @param {String} key - The name of the Slot
 */
function Slot(parent,key, inputType,snapType,outputType){
	DebugOptions.validateNonNull(key);
	DebugOptions.assert(key.includes("_"));
	//Store data passed by constructor.
	this.inputType=inputType;
	this.snapType=snapType;
	this.outputType=outputType;
	this.parent=parent; //Parent Block.
	this.hasChild=false; //Nothing is attached yet.
	this.child=null; //Stores attached Block.
	this.width=0; //Will be computed later.
	this.height=0;
	this.x=0;
	this.y=0;
	this.isSlot=true; //All Block parts have this property.
	this.running=0; //Running: 0=Not started 2=Running 3=Completed
	this.resultIsFromChild=false; //The result to return comes from a child Block, not a direct input.
	this.resultData=null; //passed to Block for use in implementation.
	this.key = key;
}
Slot.setConstants=function(){
	//The type of Data which can be directly entered into the Slot.
	Slot.inputTypes=function(){};
	Slot.inputTypes.none=0; //Predicate Slots cannot be directly entered into.
	Slot.inputTypes.num=1; //Edited with numberpad
	Slot.inputTypes.string=2; //Edited with dialog.
	Slot.inputTypes.drop=3; //Edited with dropdown.
	//The type of Blocks which can be attached to the Slot.
	Slot.snapTypes=function(){};
	Slot.snapTypes.none=0; //Nothing can attach (dropdowns often)
	Slot.snapTypes.numStrBool=1; //Blocks with return type num, string, or bool can attach (will be auto cast).
	Slot.snapTypes.bool=2; //Only Blocks that return bool can attach.
	Slot.snapTypes.list=3; //Only Blocks that return lists can attach.
	Slot.snapTypes.any=4; //Any type of Block can attach (used for the = Block).
	//The type of Data the Slot should convert to before outputting. Guarantees the Block gets the type it wants.
	Slot.outputTypes=function(){};
	Slot.outputTypes.any=0; //No conversion will occur.
	Slot.outputTypes.num=1; //Convert to num.
	Slot.outputTypes.string=2; //Convert to string.
	Slot.outputTypes.bool=3; //Convert to bool.
	Slot.outputTypes.list=4; //Convert to list.
};
/* Recursively updates dimensions and those of children. */
Slot.prototype.updateDim=function(){
	if(this.hasChild){
		this.child.updateDim(); //Pass on message.
		this.width=this.child.width; //Width is determined by child if it has one.
		this.height=this.child.height;
	}
	else{
		//Run non recursive (NR) version if it has no child.
		this.updateDimNR(); //Depends on type of Slot. Implemented by subclasses.
	}
};
/* Recursively updates Slot's alignment and alignment of children.
 * @param {number} x - The x coord the Slot should have when completed relative to the Block it is in.
 * @param {number} y - The y coord ths Slot should have measured from the center of the Slot.
 * @return {number} - The width of the Slot, indicating how much the next item should be shifted over.
 * @fix - Measure y from top of Slot to make it consistent with Block.
 */
Slot.prototype.updateAlign=function(x,y){
	if(this.hasChild){
		//The x and y coords the child should have.
		var xCoord=x+this.parent.x; //converts coord from inside this Block's g to outside g
		var yCoord=y+this.parent.y-this.height/2; //Converts y to make it relative to top of Block.
		this.x=x; //Sets this Slot's x.
		this.y=y-this.height/2; //Converts y to make it relative to top of Block.
		return this.child.updateAlign(xCoord,yCoord); //Update child.
		//This Slot itself does not need to change visibly because it is covered by a Block.
	}
	else{
		this.x=x; //Sets this Slot's x.
		this.y=y-this.height/2; //Converts y to make it relative to top of Block.
		this.moveSlot(this.x,this.y); //Implemented by subclasses. Moves all parts of the Slot to new location.
		return this.width;
	}
};
/* Attaches a Block to the Slot.
 * @param {Block} block - The Block to attach.
 * @fix - stop Blocks that are currently running.
 */
Slot.prototype.snap=function(block){
	block.parent=this; //Set the Block's parent.
	if(this.hasChild){ //If the Slot already has a child, detach it and move it out of the way.
		var prevChild=this.child;
		prevChild.unsnap(); //Detach the old Block.
		prevChild.stack.shiftOver(block.stack.dim.rw,block.stack.dim.rh); //Move it over. //Fix! stack.dim
	}
	this.hasChild=true;
	this.child=block; //Set child.
	this.hideSlot(); //Slot graphics are covered and should be hidden.
	if(block.stack!=null) {
		var oldG = block.stack.group; //Old group can be deleted.
		block.stack.remove(); //Fix! use delete() instead.
		block.changeStack(this.parent.stack); //Move Block into this stack.
		oldG.remove();
	}
	if(this.parent.stack!=null) {
		this.parent.stack.updateDim(); //Update parent's dimensions.
	}
};
/* Recursively changes the stack of the Slot's children.
 * @param {BlockStack} stack - The stack to change to.
 */
Slot.prototype.changeStack=function(stack){
	if(this.hasChild){
		this.child.changeStack(stack); //Pass the message.
	}
};
/* Recursively stops the Slot and its children.
 */
Slot.prototype.stop=function(){
	this.clearMem(); //Stop Slot.
	if(this.hasChild){
		this.child.stop(); //Stop children.
	}
};
/**
 * Update's the Slot's execution. Returns if it is still running.
 * @return {ExecutionStatus} - Is the Slot still running or has crashed?
 */
Slot.prototype.updateRun=function(){
	if(this.running==3){ //If the Slot has finished running, no need to update.
		return new ExecutionStatusDone(); //Done running
	}
	if(this.hasChild){
		let childExecStatus = this.child.updateRun();
		if(!childExecStatus.isRunning()){ //Update the child first until it is done.
			if(childExecStatus.hasError()){
				this.running=3;
				return childExecStatus;
			} else{
				this.running=3; //Copy data from child and finish execution.
				this.resultData=this.convertData(childExecStatus.getResult()); //Convert it to the proper type.
				this.resultIsFromChild=true;
				return new ExecutionStatusDone();
			}
		}
		else{
			this.running=2; //Waiting for child to finish.
			return new ExecutionStatusRunning(); //Still running
		}
	}
	else{
		//The result is not from the child, so the getData function will figure out what to do.
		this.running=3;
		this.resultIsFromChild=false;
		return new ExecutionStatusDone(); //Done running
	}
};
/* Overridden by subclasses. Returns the result of the Slot's execution.
 * @return {Data} - The result of the Slot's execution.
 */
Slot.prototype.getData=function(){
	if(this.running==3){ //It should be done running.
		if(this.resultIsFromChild){
			return this.resultData; //Return the result from the child.
		}
	}
	else{
		GuiElements.throwError("Slot.getData() run when Slot.running="+this.running);
	}
	return null; //Return the default value/entered value. Function is overridden to provide one.
};
/* Recursively updates the dimensions of the BlockStack.
 */
Slot.prototype.updateStackDim=function(){
	if(this.hasChild){
		this.child.updateStackDim(); //Pass on message.
	}
};
/* Removes the child and makes the Slot's graphics visible again.
 */
Slot.prototype.removeChild=function(){
	this.hasChild=false;
	this.child=null;
	this.showSlot();
};
/* Checks if the moving BlockStack fits within this Slot. Then recursively passes message on to children.
 * Returns nothing. Results stored in CodeManager.fit.
 */
Slot.prototype.findBestFit=function(){
	var isLeaf = true;
	if(this.hasChild){
		isLeaf = !this.child.findBestFit(); //Pass on the message.
	}
	if(!isLeaf){
		return true;
	}

	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.getAbsX(); //Use coords relative to screen.
	var y=this.getAbsY();
	var myHeight = this.relToAbsY(this.height) - y;
	var myWidth = this.relToAbsX(this.width) - x;
	var typeMatches=this.checkFit(move.returnType); //Is the BlockStack's type compatible with the Slot?
	//Does the bounding box of the BlockStack overlap with the bounding box of the Slot?
	var width = move.bottomX - move.topX;
	var height = move.bottomY - move.topY;
	var locationMatches=move.rInRange(move.topX,move.topY,width,height,x,y,myWidth,myHeight);
	if(typeMatches&&locationMatches){
		var xDist=move.touchX-(x+this.width/2); //Compute the distance.
		var yDist=move.touchY-(y+this.height/2);
		var dist=xDist*xDist+yDist*yDist;
		if(!fit.found||dist<fit.dist){
			fit.found=true; //Store the match.
			fit.bestFit=this;
			fit.dist=dist;
		}
		return true;
	}
	return false;
};
/* Determines if a Block's return type is compatible with this Slot's snap type.
 * @param {number [none,num,string,bool,list]} returnType - The return type of the Block.
 * @return {boolean} - Is the return type compatible with the snap type?
 */
Slot.prototype.checkFit=function(returnType){
	var sT=Slot.snapTypes;
	var rT=Block.returnTypes;
	var snapType=this.snapType;
	if(snapType==sT.none){
		//If the Slot accepts nothing, it isn't compatible.
		return false;
	}
	else if(snapType==sT.any){
		//If the Slot accepts anything, it is compatible.
		return true;
	}
	else if(snapType==sT.numStrBool){
		//Num, string, or bool is compatible.
		return returnType==rT.num||returnType==rT.string||returnType==rT.bool;
	}
	else if(snapType==sT.bool){
		//Only bool is compatible.
		return returnType==rT.bool;
	}
	else if(snapType==sT.list){
		//Only list is compatible.
		return returnType==rT.list;
	}
	else{
		//Should never be called.
		return false;
	}
};
Slot.prototype.relToAbsX=function(x){
	return this.parent.relToAbsX(x+this.x);
};
Slot.prototype.relToAbsY=function(y){
	return this.parent.relToAbsY(y+this.y);
};
Slot.prototype.absToRelX=function(x){
	return this.parent.absToRelX(x)-this.x;
};
Slot.prototype.absToRelY=function(y){
	return this.parent.absToRelY(y)-this.y;
};
/* Returns the x coord of the Slot relative to the screen (not the group it is contained in).
 * @return {number} - The x coord of the Slot relative to the screen.
 */
Slot.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
/* Returns the y coord of the Slot relative to the screen (not the group it is contained in).
 * @return {number} - The y coord of the Slot relative to the screen.
 */
Slot.prototype.getAbsY=function(){//Fix for tabs
	return this.relToAbsY(0);
};
/**
 * Copies data and blocks from a Slot into this Slot
 * @param {Slot} slot - The slot to copy from
 */
Slot.prototype.copyFrom = function(slot){
	if(slot.hasChild){
		this.snap(slot.child.duplicate(0,0));
	}
};
/* Clears the result data of the Slot and resets its running state. Is called by Block's clearMem function.
 */
Slot.prototype.clearMem=function(){
	this.resultData=null;
	this.running=0;
};
/* Converts the provided data to match the Slot's output type and returns it.
 * @param {Data} data - The Data to convert.
 * @return {Data} - The converted Data.
 */
Slot.prototype.convertData=function(data){
	var outType=this.outputType;
	var oT=Slot.outputTypes;
	if(outType==oT.any){
		//If any type will do, just return it.
		return data;
	}
	else if(outType==oT.num){
		//Convert to a num.
		return data.asNum();
	}
	else if(outType==oT.string){
		//Convert to a string.
		return data.asString();
	}
	else if(outType==oT.bool){
		//Convert to a bool.
		return data.asBool();
	}
	else if(outType==oT.list){
		//Convert to a list.
		return data.asList();
	}
	//Should not be called.
	return null;
};
/* Overridden by subclasses. Checks if a given message is still in use by any of the DropSlots. */
Slot.prototype.checkBroadcastMessageAvailable=function(message){
	return false;
};
/* Overridden by subclasses. Updates the available broadcast messages. */
Slot.prototype.updateAvailableMessages=function(){

};
Slot.prototype.renameVariable=function(variable){
	this.passRecursively("renameVariable",variable);
};
Slot.prototype.deleteVariable=function(variable){
	this.passRecursively("deleteVariable",variable);
};
Slot.prototype.renameList=function(list){
	this.passRecursively("renameList",list);
};
Slot.prototype.deleteList=function(list){
	this.passRecursively("deleteList",list);
};
Slot.prototype.hideDeviceDropDowns=function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
};
Slot.prototype.showDeviceDropDowns=function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
};
Slot.prototype.countDevicesInUse=function(deviceClass){
	if(this.hasChild){
		return this.child.countDevicesInUse(deviceClass);
	}
	return 0;
};
Slot.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	if(this.hasChild){
		this.child[functionName].apply(this.child,args);
	}
};
Slot.prototype.checkVariableUsed=function(variable){
	if(this.hasChild){
		return this.child.checkVariableUsed(variable);
	}
	return false;
};
Slot.prototype.checkListUsed=function(list){
	if(this.hasChild){
		return this.child.checkListUsed(list);
	}
	return false;
};
Slot.prototype.createXml=function(xmlDoc){
	var slot=XmlWriter.createElement(xmlDoc,"slot");
	XmlWriter.setAttribute(slot,"type","Slot");
	XmlWriter.setAttribute(slot,"key",this.key);
	if(this.hasChild){
		var child=XmlWriter.createElement(xmlDoc,"child");
		child.appendChild(this.child.createXml(xmlDoc));
		slot.appendChild(child);
	}
	return slot;
};
Slot.prototype.importXml = function(slotNode) {
	//Abstract
};
/* Recursively tells children to glow. No longer used.
 * @fix delete this.
 */
/*
Slot.prototype.glow=function(){
	if(this.hasChild){
		this.child.glow();
	}
};
*/
/* Recursively tells children to stop glowing. No longer used.
 * @fix delete this.
 */
/*
Slot.prototype.stopGlow=function(){
	if(this.hasChild){
		this.child.stopGlow();
	}
};
*/
Slot.prototype.getKey = function(){
	return this.key;
};
Slot.prototype.showSlot = function(){
	//Abstract
};
Slot.prototype.hideSlot = function(){
	//Abstract
};
/* RoundSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a Slot that can be edited with the InputPad's NumPad.
 * It is generally designed for nums, but can snap or output other types.
 * Its input type, however, is always num.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {number [none,numStrBool,bool,list,any} snapType - The type of Blocks which can be attached to the RoundSlot.
 * @param {number [any,num,string,bool,list] outputType - The type of Data the RoundSlot should convert to.
 * @param {number} data - The initial data stored in the Slot. Could be string, num, or selection data.
 * @param {boolean} positive - Determines if the NumPad will have the plus/minus Button disabled.
 * @param {boolean} integer - Determines if the NumPad will have the decimal point Button disabled.
 */
function RoundSlot(parent,key,snapType,outputType,data,positive,integer){
	Slot.call(this,parent,key,Slot.inputTypes.num,snapType,outputType); //Call constructor.
	//Entered data stores the data that has been entered using the InputPad.
	this.enteredData=data; //Set entered data to initial value.
	this.text=this.enteredData.asString().getValue();
	this.positive=positive; //Store other properties.
	this.integer=integer;
	this.buildSlot(); //Create the SVG elements that make up the Slot.
	this.selected=false; //Indicates if the Slot is visually selected for editing.
	//Declare arrays for special options to list above the NumPad (i.e. "last" for "Item _ of Array" blocks)
	this.optionsText=new Array(); //The text of the special option.
	this.optionsData=new Array(); //The Data representing that option (never visible to the user).
	this.dropColumns=1; //The number of columns to show in the drop down.
}
RoundSlot.prototype = Object.create(Slot.prototype);
RoundSlot.prototype.constructor = RoundSlot;
/* Builds the Slot's SVG elements such as its oval, text, and invisible hit box.
 */
RoundSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight; //Used for center alignment.
	this.textW=0; //Will be calculated later.
	this.slotE=this.generateSlot();//Fix! BG
	this.textE=this.generateText(this.text);
	this.hitBoxE=this.generateHitBox(); //Creates an invisible box for receiving touches.
};
/* Moves the Slot's SVG elements to the specified location.
 * @param {number} x - The x coord of the Slot.
 * @param {number} y - The y coord of the Slot.
 */
RoundSlot.prototype.moveSlot=function(x,y){
	var bG=BlockGraphics.getType(1);//Fix! BG
	BlockGraphics.update.path(this.slotE,x,y,this.width,this.height,1,true);//Fix! BG
	var textX=x+bG.slotHMargin; //The text has a left margin in the oval. //Fix! does not center if Slot too small.
	var textY=y+this.textH/2+this.height/2; //The text is centered in the oval.
	BlockGraphics.update.text(this.textE,textX,textY); //Move the text.
	var bGHB=BlockGraphics.hitBox; //Get data about the size of the hit box.
	var hitX=x-bGHB.hMargin; //Compute its x and y coords.
	var hitY=y-bGHB.vMargin;
	var hitW=this.width+bGHB.hMargin*2; //Compute its width and height.
	var hitH=this.height+bGHB.vMargin*2;
	GuiElements.update.rect(this.hitBoxE,hitX,hitY,hitW,hitH); //Move/resize its rectangle.
};
/* Makes the Slot's SVG elements invisible. Used when child is added.
 */
RoundSlot.prototype.hideSlot=function(){
	this.slotE.remove();
	this.textE.remove();
	this.hitBoxE.remove();
};
/* Makes the Slot's SVG elements visible. Used when child is removed.
 */
RoundSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.slotE);
	this.parent.group.appendChild(this.textE);
	this.parent.group.appendChild(this.hitBoxE);
};
/* Generates and returns an SVG text element to display the Slot's value.
 * @param {string} text - The text to add to the element.
 * @return {SVG text} - The finished SVG text element.
 */
RoundSlot.prototype.generateText=function(text){ //Fix BG
	var obj=BlockGraphics.create.valueText(text,this.parent.group);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
/* Generates and returns an SVG path element to be the oval part of the Slot.
 * @return {SVG path} - The finished SVG path element.
 * @fix BlockGraphics number reference.
 */
RoundSlot.prototype.generateSlot=function(){
	var obj=BlockGraphics.create.slot(this.parent.group,1,this.parent.category);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
/* Generates and returns a transparent rectangle which enlarges the touch area of the Slot.
 * @return {SVG rect} - The finished SVG rect element.
 */
RoundSlot.prototype.generateHitBox=function(){
	var obj=BlockGraphics.create.slotHitBox(this.parent.group);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
/* Changes the value text of the Slot. Stores value in this.text. Updates parent's stack dims.
 * @param {string} text - The text to change the visible value to.
 */
RoundSlot.prototype.changeText=function(text){
	this.text=text; //Store value
	GuiElements.update.text(this.textE,text); //Update text.
	if(this.parent.stack!=null) {
		this.parent.stack.updateDim(); //Update dimensions.
	}
};
/* Computes the dimensions of the SVG elements making up the Slot.
 * Only called if has no child.
 */
RoundSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.reporter; //Get dimension data.
	this.textW=GuiElements.measure.textWidth(this.textE); //Measure text element.
	var width=this.textW+2*bG.slotHMargin; //Add space for margins.
	var height=bG.slotHeight; //Has no child, so is just the default height.
	if(width<bG.slotWidth){ //Check if width is less than the minimum.
		width=bG.slotWidth;
	}
	this.width=width; //Save computations.
	this.height=height;
};
/* Adds an indicator showing that the moving BlockStack will snap onto this Slot if released.
 * @fix BlockGraphics
 */
RoundSlot.prototype.highlight=function(){
	var isSlot=!this.hasChild; //Fix! unclear.
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,1,isSlot);
};
/* Prepares the Slot for editing using the InputPad. Selects the Slot and shows the NumPad.
 * @fix allow InputPad to be next to Slot.
 */
RoundSlot.prototype.edit=function(){
	if(!this.selected){
		var x1 = this.getAbsX();
		var x2 = this.relToAbsX(this.width); //Get coords relative to the screen.
		var y1 = this.getAbsY();
		var y2 = this.relToAbsY(this.height);
		this.select(); //Change appearance to reflect editing.
		InputPad.resetPad(this.dropColumns); //Prepare the InputPad for editing with the correct number of columns.
		for(var i=0;i<this.optionsText.length;i++){ //Add special options to the inputPad (if any).
			InputPad.addOption(this.optionsText[i],this.optionsData[i]);
		}
		//Show the NumPad at the proper location.
		InputPad.showNumPad(this,x1, x2, y1, y2,this.positive,this.integer);
	}
};
/* Shows a dialog to allow text to be entered into the Slot. Uses a callback function with enteredData and changeText.
 * Only used for special RoundSlots.
 */
RoundSlot.prototype.editText=function(){
	//Builds a text-based representation of the Block with "___" in place of this Slot.
	var question=this.parent.textSummary(this);
	//Get the current value for the hint text.
	var currentVal=this.enteredData.getValue();
	//The callback function changes the text.
	var callbackFn=function(cancelled,response){
		if(!cancelled){
			callbackFn.slot.enteredData=new StringData(response);
			callbackFn.slot.changeText(response);
		}
		//callbackFn.slot.deselect();
	};
	callbackFn.slot=this;
	//The error function cancels any change.
	var callbackErr=function(){

	};
	callbackErr.slot=this;
	HtmlServer.showDialog("Edit text",question,currentVal,callbackFn,callbackErr);
	//Visually deselect the Slot.
	callbackFn.slot.deselect();
};
/* Updates the enteredData value and value text of the Slot to match what has been entered on the InputPad.
 * @param {string} visibleText - What the value text should become.
 * @param {Data} data - What the enteredData should be set to.
 */
RoundSlot.prototype.updateEdit=function(visibleText,data){
	if(this.selected){ //Only can edit if the Slot is selected.
		this.enteredData=data;
		this.changeText(visibleText);
	}
	else{
		GuiElements.throwError("Attempt to call updateEdit on Slot that is not selected.");
	}
};
/* Saves the Data from the InputPad to the Slot, updates the text, and deselects the Slot.
 * @param {Data} data - The Data to save to the Slot.
 */
RoundSlot.prototype.saveNumData=function(data){
	if(this.selected){ //Only can edit if the Slot is selected.
		this.enteredData=data; //Save data.
		this.changeText(data.asString().getValue()); //Display data.
		this.deselect();
	}
	else{
		throw new UserException("Attempt to call updateEdit on Slot that is not selected.");
	}
};
/**
 * Copies data and blocks from a Slot into this Slot
 * @param {RoundSlot} slot - The slot to copy from
 */
RoundSlot.prototype.copyFrom=function(slot){
	var data = slot.enteredData;
	this.enteredData = data;
	this.changeText(data.asString().getValue());
	if(slot.hasChild){
		this.snap(slot.child.duplicate(0,0));
	}
};
/* Selects the Slot for editing and changes its appearance.
 */
RoundSlot.prototype.select=function(){
	this.selected=true;
	GuiElements.update.color(this.slotE,BlockGraphics.reporter.slotSelectedFill);
	GuiElements.update.color(this.textE,BlockGraphics.valueText.selectedFill);
};
/* Deselects the Slot after editing and changes its appearance.
 */
RoundSlot.prototype.deselect=function(){
	this.selected=false;
	GuiElements.update.color(this.slotE,BlockGraphics.reporter.slotFill);
	GuiElements.update.color(this.textE,BlockGraphics.valueText.fill);
};
/* Returns a text-based version of the Slot for display in dialogs.
 * @return {string} - The text-based summary of the Slot.
 */
RoundSlot.prototype.textSummary=function(){
	//Curved parentheses are used because it is a RoundSlot.
	if(this.hasChild){ //If it has a child, just use an ellipsis.
		return "(...)";
	}
	else{ //Otherwise, print the value.
		return "("+this.enteredData.asString().getValue()+")";
	}
};
/* Returns the result of the RoundSlot's execution for use by its parent Block.
 * @return {Data} - The result of the RoundSlot's execution.
 */
RoundSlot.prototype.getData=function(){
	if(this.running==3){
		//If the Slot finished executing, resultIsFromChild determines where to read the result from.
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return this.enteredData;
		}
	}
	if(this.hasChild){
		//If it isn't done executing and has a child, throw an error.
		GuiElements.throwError("RoundSlot.getData() run with child when running="+this.running);
		return null;
	}
	else{
		//If it has no child, data can be read at any time.
		return this.enteredData;
	}
};
/* Adds a special option to the Slot which will be provided on the NumPad.
 * @param {string} displayText - The text the option will be displayed as.
 * @param {Data} data - The Data which will be stored in the Slot if the option is selected.
 */
RoundSlot.prototype.addOption=function(displayText,data){
	this.optionsText.push(displayText);
	this.optionsData.push(data);
};
/* Saves non-numeric SelectionData into the RoundSlot. Changes the value text and deselects the Slot as well.
 * Only used if a special option has non-numeric Data in it.
 * @param {string} text - The value text to display.
 * @param {SelectionData} data - The Data to store.
 */
RoundSlot.prototype.setSelectionData=function(text,data){
	this.enteredData=data;
	this.changeText(text);
	if(this.selected){
		this.deselect();
	}
};
/* Makes the value text gray to indicate that any key will delete it. */
RoundSlot.prototype.grayOutValue=function(){
	GuiElements.update.color(this.textE,BlockGraphics.valueText.grayedFill);
};
/* Makes the value text the default edit color again. */
RoundSlot.prototype.ungrayValue=function(){
	GuiElements.update.color(this.textE,BlockGraphics.valueText.selectedFill);
};

RoundSlot.prototype.createXml=function(xmlDoc){
	var slot = Slot.prototype.createXml.call(this, xmlDoc);
	XmlWriter.setAttribute(slot,"type","RoundSlot");
	var enteredData=XmlWriter.createElement(xmlDoc,"enteredData");
	enteredData.appendChild(this.enteredData.createXml(xmlDoc));
	slot.appendChild(enteredData);
	XmlWriter.setAttribute(slot,"text",this.text);
	return slot;
};
RoundSlot.prototype.importXml=function(slotNode){
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="RoundSlot"){
		return this;
	}
	var enteredDataNode=XmlWriter.findSubElement(slotNode,"enteredData");
	var dataNode=XmlWriter.findSubElement(enteredDataNode,"data");
	if(dataNode!=null){
		var data=Data.importXml(dataNode);
		if(data!=null){
			this.enteredData=data;
			var text=XmlWriter.getAttribute(slotNode,"text",data.asString().getValue());
			this.changeText(text);
		}
	}
	var childNode=XmlWriter.findSubElement(slotNode,"child");
	var blockNode=XmlWriter.findSubElement(childNode,"block");
	if(blockNode!=null) {
		var childBlock = Block.importXml(blockNode);
		if (childBlock != null) {
			this.snap(childBlock);
		}
	}
	return this;
};
/* RectSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a Slot that can be edited with a dialog.
 * It is generally designed to hold a string and its input type is always string.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {number [none,numStrBool,bool,list,any} snapType - The type of Blocks which can be attached to the RoundSlot.
 * @param {number [any,num,string,bool,list] outputType - The type of Data the RoundSlot should convert to.
 * @param {string} value - The initial string stored in the Slot.
 */
function RectSlot(parent,key,snapType,outputType,value){
	Slot.call(this,parent,key,Slot.inputTypes.string,snapType,outputType); //Call constructor.
	this.enteredData=new StringData(value); //Set entered data to initial value.
	this.buildSlot(); //Create the SVG elements that make up the Slot.
}
RectSlot.prototype = Object.create(Slot.prototype);
RectSlot.prototype.constructor = RectSlot;
/* Builds the Slot's SVG elements such as its rectangle, text, and invisible hit box.
 */
RectSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight; //Used for centering.
	this.textW=0; //Will be calculated later.
	this.slotE=this.generateSlot();
	this.textE=this.generateText(this.enteredData.getValue());
	this.hitBoxE=this.generateHitBox(); //Creates an invisible box for receiving touches.
};
/* Moves the Slot's SVG elements to the specified location.
 * @param {number} x - The x coord of the Slot.
 * @param {number} y - The y coord of the Slot.
 * @fix moving hitbox is redundant with RoundSlot.
 */
RectSlot.prototype.moveSlot=function(x,y){
	BlockGraphics.update.path(this.slotE,x,y,this.width,this.height,3,true);//Fix! BG
	var textX=x+this.width/2-this.textW/2; //Centers the text horizontally.
	var textY=y+this.textH/2+this.height/2; //Centers the text vertically
	BlockGraphics.update.text(this.textE,textX,textY); //Move the text.
	var bGHB=BlockGraphics.hitBox; //Get data about the size of the hit box.
	var hitX=x-bGHB.hMargin; //Compute its x and y coords.
	var hitY=y-bGHB.vMargin;
	var hitW=this.width+bGHB.hMargin*2; //Compute its width and height.
	var hitH=this.height+bGHB.vMargin*2;
	GuiElements.update.rect(this.hitBoxE,hitX,hitY,hitW,hitH); //Move/resize its rectangle.
};
/* Makes the Slot's SVG elements invisible. Used when child is added.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.hideSlot=function(){
	this.slotE.remove();
	this.textE.remove();
	this.hitBoxE.remove();
};
/* Makes the Slot's SVG elements visible. Used when child is removed.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.slotE);
	this.parent.group.appendChild(this.textE);
	this.parent.group.appendChild(this.hitBoxE);
};
/* Generates and returns an SVG text element to display the Slot's value.
 * @param {string} text - The text to add to the element.
 * @return {SVG text} - The finished SVG text element.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.generateText=function(text){ //Fix BG
	var obj=BlockGraphics.create.valueText(text,this.parent.group);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
/* Generates and returns an SVG path element to be the rectangle part of the Slot.
 * @return {SVG path} - The finished SVG path element.
 * @fix BlockGraphics number reference.
 */
RectSlot.prototype.generateSlot=function(){//Fix BG
	var obj=BlockGraphics.create.slot(this.parent.group,3,this.parent.category);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
};
/* Generates and returns a transparent rectangle which enlarges the touch area of the Slot.
 * @return {SVG rect} - The finished SVG rect element.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.generateHitBox=function(){
	var obj=BlockGraphics.create.slotHitBox(this.parent.group);
	TouchReceiver.addListenersSlot(obj,this); //Adds event listeners.
	return obj;
};
/* Changes the value text of the Slot. Updates parent's stack dims.
 * @param {string} text - The text to change the visible value to.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.changeText=function(text){
	GuiElements.update.text(this.textE,text); //Update text.
	if(this.parent.stack!=null) {
		this.parent.stack.updateDim(); //Update dimensions.
	}
};
/* Computes the dimensions of the SVG elements making up the Slot.
 * Only called if has no child.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.string; //Get dimension data.
	this.textW=GuiElements.measure.textWidth(this.textE); //Measure text element.
	var width=this.textW+2*bG.slotHMargin; //Add space for margins.
	var height=bG.slotHeight; //Has no child, so is just the default height.
	if(width<bG.slotWidth){ //Check if width is less than the minimum.
		width=bG.slotWidth;
	}
	this.width=width; //Save computations.
	this.height=height;
};
/* Adds an indicator showing that the moving BlockStack will snap onto this Slot if released.
 * @fix BlockGraphics
 */
RectSlot.prototype.highlight=function(){//Fix BG
	var isSlot=!this.hasChild; //Fix! unclear.
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
};
/* Opens a dialog to edit this Slot.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.edit=function(){
	//Builds a text-based representation of the Block with "___" in place of this Slot.
	var question=this.parent.textSummary(this);
	//Get the current value for the hint text.
	var currentVal=this.enteredData.getValue();
	//The callback function changes the text.
	var callbackFn=function(cancelled,response){
		if(!cancelled){
			callbackFn.slot.enteredData=new StringData(response);
			callbackFn.slot.changeText(response);
			SaveManager.markEdited();
		}
	};
	callbackFn.slot=this;
	//Show the dialog.
	HtmlServer.showDialog("Edit text",question,currentVal,callbackFn);
};
/**
 * Copies data and blocks from a Slot into this Slot
 * @param {RectSlot} slot - The slot to copy from
 */
RectSlot.prototype.copyFrom=function(slot){
	var data = slot.enteredData;
	this.enteredData = data;
	this.changeText(data.asString().getValue());
	if(slot.hasChild){
		this.snap(slot.child.duplicate(0,0));
	}
};
/* Returns a text-based version of the Slot for display in dialogs.
 * @return {string} - The text-based summary of the Slot.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.textSummary=function(){
	//Square brackets are used because it is a RectSlot.
	if(this.hasChild){ //If it has a child, just use an ellipsis.
		return "[...]";
	}
	else{ //Otherwise, print the value.
		return "["+this.enteredData.getValue()+"]";
	}
};
/* Returns the result of the RoundSlot's execution for use by its parent Block.
 * @return {Data} - The result of the RectSlot's execution.
 * @fix redundant with RoundSlot.
 */
RectSlot.prototype.getData=function(){
	if(this.running==3){
		//If the Slot finished executing, resultIsFromChild determines where to read the result from.
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return this.enteredData;
		}
	}
	if(this.hasChild){
		//If it isn't done executing and has a child, throw an error.
		GuiElements.throwError("RectSlot.getData() run with child when running="+this.running);
		return null;
	}
	else{
		//If it has no child, data can be read at any time.
		return this.enteredData;
	}
};

RectSlot.prototype.createXml=function(xmlDoc){
	var slot = Slot.prototype.createXml.call(this, xmlDoc);
	XmlWriter.setAttribute(slot,"type","RectSlot");
	var enteredData=XmlWriter.createElement(xmlDoc,"enteredData");
	enteredData.appendChild(this.enteredData.createXml(xmlDoc));
	slot.appendChild(enteredData);
	if(this.hasChild){
		var child=XmlWriter.createElement(xmlDoc,"child");
		child.appendChild(this.child.createXml(xmlDoc));
		slot.appendChild(child);
	}
	return slot;
};
RectSlot.prototype.importXml=function(slotNode){
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="RectSlot"){
		return this;
	}
	var enteredDataNode=XmlWriter.findSubElement(slotNode,"enteredData");
	var dataNode=XmlWriter.findSubElement(enteredDataNode,"data");
	if(dataNode!=null){
		var data=Data.importXml(dataNode);
		if(data!=null){
			this.enteredData=data;
			var text=data.asString().getValue();
			this.changeText(text);
		}
	}
	var childNode=XmlWriter.findSubElement(slotNode,"child");
	var blockNode=XmlWriter.findSubElement(childNode,"block");
	if(blockNode!=null) {
		var childBlock = Block.importXml(blockNode);
		if (childBlock != null) {
			this.snap(childBlock);
		}
	}
	return this;
};
/* HexSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a hexagonal Slot that can hold Blocks but not be edited via InputPad or dialog.
 * Its input type and output type is always bool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {number [none,numStrBool,bool,list,any} snapType - The type of Blocks which can be attached to the RoundSlot.
 */
function HexSlot(parent,key,snapType){
	Slot.call(this,parent,key,Slot.inputTypes.bool,snapType,Slot.outputTypes.bool); //Call constructor.
	this.buildSlot(); //Create the SVG elements that make up the Slot.
}
HexSlot.prototype = Object.create(Slot.prototype);
HexSlot.prototype.constructor = HexSlot;
/* Builds the Slot's SVG path.
 */
HexSlot.prototype.buildSlot=function(){
	this.slotE=this.generateSlot();
};
/* Moves the Slot's SVG elements to the specified location.
 * @param {number} x - The x coord of the Slot.
 * @param {number} y - The y coord of the Slot.
 */
HexSlot.prototype.moveSlot=function(x,y){
	BlockGraphics.update.path(this.slotE,x,y,this.width,this.height,2,true);//Fix! BG
};
/* Makes the Slot's SVG elements invisible. Used when child is added.
 */
HexSlot.prototype.hideSlot=function(){
	this.slotE.remove();
};
/* Makes the Slot's SVG elements visible. Used when child is removed.
 */
HexSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.slotE);
};
/* Generates and returns an SVG path element to be the hexagon part of the Slot.
 * @return {SVG path} - The finished SVG path element.
 * @fix BlockGraphics number reference.
 */
HexSlot.prototype.generateSlot=function(){
	var obj=BlockGraphics.create.slot(this.parent.group,2,this.parent.category);
	TouchReceiver.addListenersChild(obj,this.parent); //Adds event listeners.
	return obj;
};
/* Computes the dimensions of the SVG elements making up the Slot.
 * Only called if has no child.
 */
HexSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.predicate;
	this.width=bG.slotWidth; //Has no child or value, so just use defaults.
	this.height=bG.slotHeight
};
/* Adds an indicator showing that the moving BlockStack will snap onto this Slot if released.
 * @fix BlockGraphics
 */
HexSlot.prototype.highlight=function(){
	var isSlot=!this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,2,isSlot);
};
/* Returns a text-based version of the Slot for display in dialogs.
 * @return {string} - The text-based summary of the Slot.
 */
HexSlot.prototype.textSummary=function(){
	//Angle brackets are used because it is a HexSlot.
	if(this.hasChild){ //If it has a child, just use an ellipsis.
		return "<...>";
	}
	else{ //Otherwise, it is empty.
		return "<>";
	}
};
/* Returns the result of the HexSlot's execution for use by its parent Block.
 * @return {Data} - The result of the HexSlot's execution.
 */
HexSlot.prototype.getData=function(){
	if(this.running==3){ //The Slot must have finished executing.
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return new BoolData(false,false); //The Slot is empty. Return default value of false.
		}
	}
	GuiElements.throwError("Called HexSlot.getData() when running="+this.running);
	return null;
};

HexSlot.prototype.createXml=function(xmlDoc){
	var slot = Slot.prototype.createXml.call(this, xmlDoc);
	XmlWriter.setAttribute(slot,"type","HexSlot");
	return slot;
};
HexSlot.prototype.importXml=function(slotNode){
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="HexSlot"){
		return this;
	}
	var childNode=XmlWriter.findSubElement(slotNode,"child");
	var blockNode=XmlWriter.findSubElement(childNode,"block");
	if(blockNode!=null) {
		var childBlock = Block.importXml(blockNode);
		if (childBlock != null) {
			this.snap(childBlock);
		}
	}
	return this;
};
function DropSlot(parent,key,snapType){
	if(snapType==null){
		snapType=Slot.snapTypes.none;
	}
	Slot.call(this,parent,key,Slot.inputTypes.drop,snapType,Slot.outputTypes.any);
	this.enteredData=null;
	this.text="";
	this.buildSlot();
	this.selected=false;
	this.optionsText=new Array();
	this.optionsData=new Array();
	this.dropColumns=1; //The number of columns to show in the drop down.
	this.slotVisible=true;
}
DropSlot.prototype = Object.create(Slot.prototype);
DropSlot.prototype.constructor = DropSlot;
DropSlot.prototype.addOption=function(displayText,data){
	this.optionsText.push(displayText);
	this.optionsData.push(data);
}
DropSlot.prototype.populateList=function(){//overrided by subclasses
	
}
DropSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight;
	this.textW=0;
	this.bgE=this.generateBg();
	this.triE=this.generateTri();
	this.textE=this.generateText();
	this.hitBoxE=this.generateHitBox();
}
DropSlot.prototype.generateBg=function(){
	var bG=BlockGraphics.dropSlot;
	var bgE=GuiElements.create.rect(this.parent.group);
	GuiElements.update.color(bgE,bG.bg);
	GuiElements.update.opacity(bgE,bG.bgOpacity);
	TouchReceiver.addListenersSlot(bgE,this);
	return bgE;
}
DropSlot.prototype.generateTri=function(){
	var bG=BlockGraphics.dropSlot;
	var triE=GuiElements.create.path(this.parent.group);
	GuiElements.update.color(triE,bG.triFill);
	TouchReceiver.addListenersSlot(triE,this);
	return triE;
}
DropSlot.prototype.generateText=function(){ //Fix BG
	var bG=BlockGraphics.dropSlot;
	var obj=BlockGraphics.create.valueText("",this.parent.group);
	GuiElements.update.color(obj,bG.textFill);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
}
DropSlot.prototype.generateHitBox=function(){
	var obj=BlockGraphics.create.slotHitBox(this.parent.group);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
};
DropSlot.prototype.moveSlot=function(x,y){
	var bG=BlockGraphics.dropSlot;
	GuiElements.update.rect(this.bgE,x,y,this.width,this.height);
	var textX=x+bG.slotHMargin;
	var textY=y+this.textH/2+this.height/2;
	BlockGraphics.update.text(this.textE,textX,textY);
	var triX=x+this.width-bG.slotHMargin-bG.triW;
	var triY=y+this.height/2-bG.triH/2;
	GuiElements.update.triangle(this.triE,triX,triY,bG.triW,0-bG.triH);
	var bGHB=BlockGraphics.hitBox;
	var hitX=x-bGHB.hMargin;
	var hitY=y-bGHB.vMargin;
	var hitW=this.width+bGHB.hMargin*2;
	var hitH=this.height+bGHB.vMargin*2;
	GuiElements.update.rect(this.hitBoxE,hitX,hitY,hitW,hitH);
}
DropSlot.prototype.hideSlot=function(){
	if(this.slotVisible) {
		this.slotVisible=false;
		this.bgE.remove();
		this.textE.remove();
		this.triE.remove();
		this.hitBoxE.remove();
	}
}
DropSlot.prototype.showSlot=function(){
	if(!this.slotVisible) {
		this.slotVisible=true;
		this.parent.group.appendChild(this.bgE);
		this.parent.group.appendChild(this.triE);
		this.parent.group.appendChild(this.textE);
		this.parent.group.appendChild(this.hitBoxE);
	}
}
DropSlot.prototype.changeText=function(text){
	this.text=text;
	GuiElements.update.text(this.textE,text);
	if(this.parent.stack!=null){
		this.parent.stack.updateDim();
	}
}
DropSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.dropSlot;
	this.textW=GuiElements.measure.textWidth(this.textE);
	var width=this.textW+3*bG.slotHMargin+bG.triW;
	var height=bG.slotHeight;
	if(width<bG.slotWidth){
		width=bG.slotWidth;
	}
	this.width=width;
	this.height=height;
}
DropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new DropSlot(parentCopy,this.snapType);
	for(var i=0;i<this.optionsText.length;i++){
		myCopy.addOption(this.optionsText[i],this.optionsData[i]);
	}
	if(this.hasChild){
		myCopy.snap(this.child.duplicate(0,0));
	}
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	myCopy.dropColumns=this.dropColumns;
	return myCopy;
}
/**
 * Copies data and blocks from a Slot into this Slot
 * @param {DropSlot} slot - The slot to copy from
 */
DropSlot.prototype.copyFrom=function(slot){
	this.enteredData = slot.enteredData;
	this.changeText(slot.text);
	if(slot.hasChild){
		this.snap(slot.child.duplicate(0,0));
	}
};
DropSlot.prototype.highlight=function(){//Fix BG
	var isSlot=!this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
};
DropSlot.prototype.edit=function(previewFn){
	if(previewFn == null){
		previewFn = null;
	}
	if(!this.selected){
		var x1 = this.getAbsX();
		var x2 = this.relToAbsX(this.width); //Get coords relative to the screen.
		var y1 = this.getAbsY();
		var y2 = this.relToAbsY(this.height);
		this.select();
		InputPad.resetPad(this.dropColumns);
		this.populateList(); //Loads any dynamic options.
		for(var i=0;i<this.optionsText.length;i++){
			InputPad.addOption(this.optionsText[i],this.optionsData[i]);
		}
		InputPad.showDropdown(this,x1, x2, y1, y2, null, previewFn);
	}
};
/* Shows a dialog to allow text to be entered into the Slot. Uses a callback function with enteredData and changeText.
 * Only used for special DropSlots.
 */
DropSlot.prototype.editText=function(){
	//Builds a text-based representation of the Block with "___" in place of this Slot.
	var question=this.parent.textSummary(this);
	//Get the current value for the hint text.
	var currentVal=this.enteredData.getValue();
	//The callback function changes the text.
	var callbackFn=function(cancelled,response){
		if(!cancelled){
			callbackFn.slot.enteredData=new StringData(response);
			callbackFn.slot.changeText(response);
		}
		//callbackFn.slot.deselect();
	};
	callbackFn.slot=this;
	//The error function cancels any change.
	var callbackErr=function(){

	};
	callbackErr.slot=this;
	HtmlServer.showDialog("Edit text",question,currentVal,callbackFn,callbackErr);
	//Visually deselect the Slot.
	callbackFn.slot.deselect();
};
DropSlot.prototype.select=function(){
	var bG=BlockGraphics.dropSlot;
	this.selected=true;
	GuiElements.update.color(this.bgE,bG.selectedBg);
	GuiElements.update.opacity(this.bgE,bG.selectedBgOpacity);
	GuiElements.update.color(this.triE,bG.selectedTriFill);
};
DropSlot.prototype.deselect=function(){
	var bG=BlockGraphics.dropSlot;
	this.selected=false;
	GuiElements.update.color(this.bgE,bG.bg);
	GuiElements.update.opacity(this.bgE,bG.bgOpacity);
	GuiElements.update.color(this.triE,bG.triFill);
};
DropSlot.prototype.textSummary=function(){
	if(this.hasChild){
		return "[...]";
	}
	else{
		if(this.enteredData==null){
			return "[ ]";
		}
		return "["+this.enteredData.asString().getValue()+"]";
	}
};
DropSlot.prototype.setSelectionData=function(text,data){
	this.enteredData=data;
	this.changeText(text);
	if(this.selected){
		this.deselect();
	}
};
/* Saves the Data from the InputPad to the Slot, updates the text, and deselects the Slot.
 * @param {Data} data - The Data to save to the Slot.
 */
DropSlot.prototype.saveNumData=function(data){
	this.setSelectionData(data.asString().getValue(), data);
};
DropSlot.prototype.getData=function(){
	if(this.running==3){
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return this.enteredData;
		}
	}
	if(this.hasChild){
		return null;
	}
	else{
		return this.enteredData;
	}
}
DropSlot.prototype.clearOptions=function(){
	this.optionsText=new Array();
	this.optionsData=new Array();
}

DropSlot.prototype.createXml=function(xmlDoc){
	var slot = Slot.prototype.createXml.call(this, xmlDoc);
	XmlWriter.setAttribute(slot,"type","DropSlot");
	XmlWriter.setAttribute(slot,"text",this.text);
	if(this.enteredData!=null){
		var enteredData=XmlWriter.createElement(xmlDoc,"enteredData");
		enteredData.appendChild(this.enteredData.createXml(xmlDoc));
		slot.appendChild(enteredData);
	}
	return slot;
};
DropSlot.prototype.importXml=function(slotNode){
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="DropSlot"){
		return this;
	}
	var enteredDataNode=XmlWriter.findSubElement(slotNode,"enteredData");
	var dataNode=XmlWriter.findSubElement(enteredDataNode,"data");
	if(dataNode!=null){
		var data=Data.importXml(dataNode);
		if(data!=null){
			this.enteredData=data;
			var text=XmlWriter.getAttribute(slotNode,"text",data.asString().getValue());
			this.changeText(text);
		}
	}
	var childNode=XmlWriter.findSubElement(slotNode,"child");
	var blockNode=XmlWriter.findSubElement(childNode,"block");
	if(blockNode!=null) {
		var childBlock = Block.importXml(blockNode);
		if (childBlock != null) {
			this.snap(childBlock);
		}
	}
	return this;
};
DropSlot.prototype.updateEdit=function(visibleText,data){
	if(this.selected){ //Only can edit if the Slot is selected.
		this.enteredData=data;
		this.changeText(visibleText);
	}
	else{
		throw new UserException("Attempt to call updateEdit on Slot that is not selected.");
	}
};
//@fix Write documentation.

function SoundDropSlot(parent,key){
	DropSlot.call(this,parent,key);
}
SoundDropSlot.prototype = Object.create(DropSlot.prototype);
SoundDropSlot.prototype.constructor = SoundDropSlot;

SoundDropSlot.prototype.populateList=function(){
	this.clearOptions();
	for(var i=0;i<Sounds.getSoundCount();i++){
		var currentSound=Sounds.getSoundName(i);
		this.addOption(currentSound,new SelectionData(currentSound));
	}
};
SoundDropSlot.prototype.edit=function(){
	var me = this;
	DropSlot.prototype.edit.call(this, function(){
		if(me.enteredData != null) {
			var soundName = me.enteredData.getValue();
			HtmlServer.sendRequestWithCallback("sound/stop", function(){
				if(Sounds.checkNameIsValid(soundName)){
					var request = "sound/play?filename="+soundName;
					HtmlServer.sendRequestWithCallback(request);
					GuiElements.alert("sent: " + request);
				}
				else{
					GuiElements.alert("Bad sound: " + soundName);
				}
			});
		}
		else{
			GuiElements.alert("No data");
		}
	});
};
SoundDropSlot.prototype.deselect=function(){
	DropSlot.prototype.deselect.call(this);
	HtmlServer.sendRequestWithCallback("sound/stop");
};
/* NumSlot is a subclass of RoundSlot.
 * It creates a RoundSlot optimized for use with numbers.
 * It automatically converts any results into NumData and has a snapType of numStrBool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {number} value - The initial number stored in the Slot.
 * @param {boolean} positive - (optional) Determines if the NumPad will have the plus/minus Button disabled.
 * @param {boolean} integer - (optional) Determines if the NumPad will have the decimal point Button disabled.
 */
function NumSlot(parent,key,value,positive,integer){
	if(positive==null){ //Optional parameters are false by default.
		positive=false;
	}
	if(integer==null){
		integer=false;
	}
	//Make RoundSlot.
	RoundSlot.call(this,parent,key,Slot.snapTypes.numStrBool,Slot.outputTypes.num,new NumData(value),positive,integer);
}
NumSlot.prototype = Object.create(RoundSlot.prototype);
NumSlot.prototype.constructor = NumSlot;
/* StringSlot is a subclass of RectSlot.
 * It creates a RectSlot optimized for use with strings.
 * It automatically converts any results into StringData and has a snapType of numStrBool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {string} value - The initial string stored in the Slot.
 */
function StringSlot(parent,key,value){
	//Make RectSlot.
	RectSlot.call(this,parent,key,Slot.snapTypes.numStrBool,Slot.outputTypes.string,value);
}
StringSlot.prototype = Object.create(RectSlot.prototype);
StringSlot.prototype.constructor = StringSlot;
/* BoolSlot is a subclass of HexSlot.
 * It creates a RectSlot optimized for use with booleans.
 * It has a snapType of bool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 */
function BoolSlot(parent,key){
	//Make HexSlot.
	HexSlot.call(this,parent,key,Slot.snapTypes.bool);
}
BoolSlot.prototype = Object.create(HexSlot.prototype);
BoolSlot.prototype.constructor = BoolSlot;
//@fix Write documentation.

function VarDropSlot(key, parent){
	DropSlot.call(this,key, parent,Slot.snapTypes.none);
	var variables=CodeManager.variableList;
	if(variables.length>0){
		var lastVar=variables[variables.length-1];
		this.setSelectionData(lastVar.getName(),new SelectionData(lastVar));
	}
}
VarDropSlot.prototype = Object.create(DropSlot.prototype);
VarDropSlot.prototype.constructor = VarDropSlot;
VarDropSlot.prototype.populateList=function(){
	this.clearOptions();
	var variables=CodeManager.variableList;
	for(var i=0;i<variables.length;i++){
		var currentVar=variables[i];
		this.addOption(currentVar.getName(),new SelectionData(currentVar));
	}
};
VarDropSlot.prototype.importXml=function(slotNode){
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="DropSlot"){
		return this;
	}
	var enteredDataNode=XmlWriter.findSubElement(slotNode,"enteredData");
	var dataNode=XmlWriter.findSubElement(enteredDataNode,"data");
	if(dataNode!=null){
		var data=Data.importXml(dataNode);
		if(data!=null){
			var variable=CodeManager.findVar(data.getValue());
			if(variable!=null) {
				this.setSelectionData(variable.getName(), new SelectionData(variable));
			}
		}
	}
	return this;
};
VarDropSlot.prototype.renameVariable=function(variable){
	if(this.enteredData!=null&&this.enteredData.getValue()==variable){
		this.changeText(variable.getName());
	}
};
VarDropSlot.prototype.deleteVariable=function(variable){
	if(this.enteredData!=null&&this.enteredData.getValue()==variable){
		this.setSelectionData("",null);
	}
};
VarDropSlot.prototype.checkVariableUsed=function(variable){
	if(this.enteredData!=null&&this.enteredData.getValue()==variable){
		return true;
	}
	return false;
};
//@fix Write documentation.

function ListDropSlot(parent,key,snapType){
	if(snapType==null){
		snapType=Slot.snapTypes.none
	}
	DropSlot.call(this,parent,key,snapType);
	var lists=CodeManager.listList;
	if(lists.length>0){
		var lastList=lists[lists.length-1];
		this.setSelectionData(lastList.getName(),new SelectionData(lastList));
	}
}
ListDropSlot.prototype = Object.create(DropSlot.prototype);
ListDropSlot.prototype.constructor = ListDropSlot;
ListDropSlot.prototype.populateList=function(){
	this.clearOptions();
	var lists=CodeManager.listList;
	for(var i=0;i<lists.length;i++){
		var currentList=lists[i];
		this.addOption(currentList.getName(),new SelectionData(currentList));
	}
};
ListDropSlot.prototype.importXml=function(slotNode){
	this.setSelectionData("",null);
	var type=XmlWriter.getAttribute(slotNode,"type");
	if(type!="DropSlot"){
		return this;
	}
	var enteredDataNode=XmlWriter.findSubElement(slotNode,"enteredData");
	var dataNode=XmlWriter.findSubElement(enteredDataNode,"data");
	if(dataNode!=null){
		var data=Data.importXml(dataNode);
		if(data!=null){
			var list=CodeManager.findList(data.getValue());
			if(list!=null) {
				this.setSelectionData(list.getName(), new SelectionData(list));
			}
		}
	}
	var childNode=XmlWriter.findSubElement(slotNode,"child");
	var blockNode=XmlWriter.findSubElement(childNode,"block");
	if(blockNode!=null) {
		var childBlock = Block.importXml(blockNode);
		if (childBlock != null) {
			this.snap(childBlock);
		}
	}
	return this;
};
ListDropSlot.prototype.renameList=function(list){
	if(this.enteredData!=null&&this.enteredData.getValue()==list){
		this.changeText(list.getName());
	}
	this.passRecursively("renameList",list);
};
ListDropSlot.prototype.deleteList=function(list){
	if(this.enteredData!=null&&this.enteredData.getValue()==list){
		this.setSelectionData("",null);
	}
	this.passRecursively("deleteList",list);
};
ListDropSlot.prototype.checkListUsed=function(list){
	if(this.hasChild){
		return DropSlot.prototype.checkListUsed.call(this,list);
	}
	else if(this.enteredData!=null&&this.enteredData.getValue()==list){
		return true;
	}
	return false;
};


function PortSlot(parent, key, maxPorts) {
	DropSlot.call(this, parent, key, Slot.snapTypes.none);
	this.maxPorts = maxPorts;
	this.setSelectionData();
    for(let portNum = 1; portNum <= this.maxPorts; portNum++) {
        this.addOption("port " + portNum.toString(), new NumData(portNum));
    }
    this.setSelectionData("1",new NumData(1));
}
PortSlot.prototype = Object.create(DropSlot.prototype);
PortSlot.prototype.constructor = PortSlot;
//@fix Write documentation.

function BroadcastDropSlot(parent,key,isHatBlock){
	if(isHatBlock==null){
		isHatBlock=false;
	}
	var snapType=Slot.snapTypes.numStrBool;
	if(isHatBlock){
		snapType=Slot.snapTypes.none;
	}
	this.isHatBlock=isHatBlock;
	DropSlot.call(this,parent,key,snapType);
}
BroadcastDropSlot.prototype = Object.create(DropSlot.prototype);
BroadcastDropSlot.prototype.constructor = BroadcastDropSlot;
BroadcastDropSlot.prototype.populateList=function(){
	this.clearOptions();
	CodeManager.updateAvailableMessages();
	if(this.isHatBlock){
		this.addOption("any message",new SelectionData("any_message"));
	}
	var messages=CodeManager.broadcastList;
	for(var i=0;i<messages.length;i++){
		var currentMessage=messages[i];
		this.addOption('"'+currentMessage+'"',new StringData(currentMessage));
	}
	this.addOption("new",new SelectionData("new_message"));
};
BroadcastDropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new BroadcastDropSlot(parentCopy,this.isHatBlock);
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};
BroadcastDropSlot.prototype.checkBroadcastMessageAvailable=function(message){
	if(this.enteredData!=null&&this.enteredData.type==Data.types.string){
		return message==this.enteredData.getValue();
	}
	return false;
};
BroadcastDropSlot.prototype.updateAvailableMessages=function(){
	if(this.enteredData!=null&&this.enteredData.type==Data.types.string){
		CodeManager.addBroadcastMessage(this.enteredData.getValue());
	}
};
function DeviceDropSlot(parent, key, deviceClass, shortText) {
	if (shortText == null) {
		shortText = false;
	}
	this.shortText = shortText;
	DropSlot.call(this, parent, key, Slot.snapTypes.none);
	this.prefixText = deviceClass.getDeviceTypeName(shortText) + " ";
	this.deviceClass = deviceClass;
	this.labelText = new LabelText(this.parent, this.prefixText.trim());
	this.labelMode = false;
	this.setSelectionData(this.prefixText + 1, new SelectionData(0));

	if (deviceClass.getManager().getSelectableDeviceCount() <= 1) {
		this.switchToLabel();
	} else {
		this.labelText.hide();
	}
}

DeviceDropSlot.prototype = Object.create(DropSlot.prototype);
DeviceDropSlot.prototype.constructor = DeviceDropSlot;
DeviceDropSlot.prototype.populateList = function() {
	this.clearOptions();
	var deviceCount = this.deviceClass.getManager().getSelectableDeviceCount();
	for (var i = 0; i < deviceCount; i++) {
		this.addOption(this.prefixText + (i + 1), new SelectionData(i)); //We'll store a 0-indexed value but display it +1.
	}
};

DeviceDropSlot.prototype.duplicate = function(parentCopy) {
	var myCopy = new DeviceDropSlot(parentCopy, this.deviceClass, this.shortText);
	myCopy.enteredData = this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};

DeviceDropSlot.prototype.switchToLabel = function() {
	if (!this.labelMode) {
		this.labelMode = true;
		this.setSelectionData(this.prefixText + 1, new SelectionData(0));
		this.labelText.show();
		this.hideSlot();
	}
};

DeviceDropSlot.prototype.switchToSlot = function() {
	if (this.labelMode) {
		this.labelMode = false;
		this.labelText.hide();
		this.showSlot();
	}
};

DeviceDropSlot.prototype.updateAlign = function(x, y) {
	if (this.labelMode) {
		return LabelText.prototype.updateAlign.call(this.labelText, x, y);
	} else {
		return DropSlot.prototype.updateAlign.call(this, x, y);
	}
};

DeviceDropSlot.prototype.updateDim = function() {
	if (this.labelMode) {
		LabelText.prototype.updateDim.call(this.labelText);
		this.width = this.labelText.width;
	} else {
		DropSlot.prototype.updateDim.call(this);
	}
};

DeviceDropSlot.prototype.hideDeviceDropDowns = function(deviceClass) {
	if(this.deviceClass == deviceClass) {
		this.switchToLabel();
	}
};

DeviceDropSlot.prototype.showDeviceDropDowns = function(deviceClass) {
	if(this.deviceClass == deviceClass) {
		this.switchToSlot();
	}
};

DeviceDropSlot.prototype.countDevicesInUse = function(deviceClass) {
	if (this.deviceClass == deviceClass && this.getData() != null) {
		return this.getData().getValue() + 1;
	} else {
		return 1;
	}
};

DeviceDropSlot.prototype.importXml = function(slotNode) {
	DropSlot.prototype.importXml.call(this, slotNode);
	this.enteredData = new SelectionData(parseInt(this.enteredData.getValue()));
	if (this.enteredData.getValue() < 0) {
		this.setSelectionData(this.prefixText + 1, new SelectionData(0));
	}
};
function BlockSlot(parent){
	this.child=null;
	//this.width=0;
	this.height=0;
	this.x=0;
	this.y=0;
	this.parent=parent;
	this.isBlockSlot=true;
	this.hasChild=false;
	this.isRunning=false;
	this.currentBlock=null;
}
BlockSlot.prototype.getAbsX=function(){
	return this.parent.stack.relToAbsX(this.x);
};
BlockSlot.prototype.getAbsY=function(){
	return this.parent.stack.relToAbsY(this.y);
};
BlockSlot.prototype.updateDim=function(){
	var bG=BlockGraphics.getType(this.type);
	if(this.hasChild){
		this.child.updateDim();
		this.height=this.child.addHeights();
	}
	else{
		//this.width=0;
		this.height=BlockGraphics.loop.bottomH;
	}
}
BlockSlot.prototype.updateAlign=function(x,y){
	this.x=x;
	this.y=y;
	if(this.hasChild){
		this.child.updateAlign(x,y);
	}
}
BlockSlot.prototype.snap=function(block){
	if(!block.getLastBlock().bottomOpen&&this.child!=null){
		var BG=BlockGraphics.command;
		this.child.unsnap().shiftOver(BG.shiftX,block.stack.getHeight()+BG.shiftY);
	}
	var stack=this.parent.stack;
	if(stack!=null&&block.stack!=null) {
		if (stack.isRunning && !block.stack.isRunning) {
			block.glow();
		}
		else if (!stack.isRunning && block.stack.isRunning) { //Blocks that are added are stopped.
			block.stack.stop();
		}
		else if (stack.isRunning && block.isRunning) { //The added block is stopped, but still glows as part of a running stack.
			block.stop();
		}
	}
	block.parent=this;
	if(this.hasChild){
		var lastBlock=block.getLastBlock();
		var prevChild=this.child;
		lastBlock.nextBlock=prevChild;
		prevChild.parent=lastBlock;
	}
	this.hasChild=true;
	this.child=block;
	if(block.stack!=null) {
		var oldG = block.stack.group;
		block.stack.remove();
		block.changeStack(this.parent.stack);
		oldG.remove();
	}
	if(stack!=null) {
		this.parent.stack.updateDim();
	}
}
BlockSlot.prototype.changeStack=function(stack){
	if(this.hasChild){
		this.child.changeStack(stack);
	}
}
BlockSlot.prototype.updateStackDim=function(stack){
	if(this.hasChild){
		this.child.updateStackDim(stack);
	}
}
BlockSlot.prototype.removeChild=function(){
	this.hasChild=false;
	this.child=null;
}
BlockSlot.prototype.findBestFit=function(){
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.getAbsX();
	var y=this.getAbsY();
	if(move.topOpen){
		var snap=BlockGraphics.command.snap;
		if(move.pInRange(move.topX,move.topY,x-snap.left,y-snap.top,snap.left+snap.right,snap.top+snap.bottom)){
			var xDist=move.topX-x;
			var yDist=move.topY-y;
			var dist=xDist*xDist+yDist*yDist;
			if(!fit.found||dist<fit.dist){
				fit.found=true;
				fit.bestFit=this;
				fit.dist=dist;
			}
		}
	}
	if(this.hasChild){
		this.child.findBestFit();
	}
}
BlockSlot.prototype.highlight=function(){
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),0,0,0,false,this.parent.isGlowing);
};
BlockSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new BlockSlot(parentCopy);
	if(this.hasChild){
		myCopy.snap(this.child.duplicate(0,0));
	}
	return myCopy;
};
BlockSlot.prototype.copyFrom=function(blockSlot){
	if(blockSlot.hasChild){
		this.snap(blockSlot.child.duplicate(0,0));
	}
};
BlockSlot.prototype.startRun=function(){
	if(!this.isRunning&&this.hasChild){
		this.isRunning=true;
		this.currentBlock=this.child;
	}
}
BlockSlot.prototype.stop=function(){
	if(this.isRunning&&this.hasChild){
		this.child.stop();
	}
	this.isRunning=false;
};
BlockSlot.prototype.updateRun=function(){
	if(this.isRunning){
		if(this.currentBlock.stack!=this.parent.stack){ //If the current Block has been removed, don't run it.
			this.isRunning=false;
			return new ExecutionStatusDone();
		}
		let execStatus = this.currentBlock.updateRun();
		if(!execStatus.isRunning()){
			if(execStatus.hasError()){
				this.isRunning=false;
				return execStatus;
			} else {
				this.currentBlock = this.currentBlock.nextBlock;
			}
		}
		if(this.currentBlock!=null){
			return new ExecutionStatusRunning();
		} else{
			this.isRunning = false;
			return new ExecutionStatusDone();
		}
	} else{
		return new ExecutionStatusDone();
	}
};
BlockSlot.prototype.glow=function(){
	if(this.hasChild){
		this.child.glow();
	}
};
BlockSlot.prototype.stopGlow=function(){
	if(this.hasChild){
		this.child.stopGlow();
	}
};
/* Recursively checks if a given message is still in use by any of the DropSlots. */
BlockSlot.prototype.checkBroadcastMessageAvailable=function(message){
	if(this.hasChild){
		return this.child.checkBroadcastMessageAvailable(message);
	}
	return false;
};
/* Recursively updates the available broadcast messages.
 */
BlockSlot.prototype.updateAvailableMessages=function(){
	if(this.hasChild){
		this.child.updateAvailableMessages();
	}
};

BlockSlot.prototype.createXml=function(xmlDoc){
	var blockSlot=XmlWriter.createElement(xmlDoc,"blockSlot");
	if(this.hasChild){
		var blocks=XmlWriter.createElement(xmlDoc,"blocks");
		this.child.writeToXml(xmlDoc,blocks);
		blockSlot.appendChild(blocks);
	}
	return blockSlot;
};
BlockSlot.prototype.importXml=function(blockSlotNode){
	var blocksNode=XmlWriter.findSubElement(blockSlotNode,"blocks");
	var blockNodes=XmlWriter.findSubElements(blocksNode,"block");
	if(blockNodes.length>0){
		var firstBlock=null;
		var i=0;
		while(firstBlock==null&&i<blockNodes.length){
			firstBlock=Block.importXml(blockNodes[i]);
			i++;
		}
		if(firstBlock==null){
			return;
		}
		this.snap(firstBlock);
		var previousBlock=firstBlock;
		while(i<blockNodes.length) {
			var newBlock = Block.importXml(blockNodes[i]);
			if (newBlock != null) {
				previousBlock.snap(newBlock);
				previousBlock = newBlock;
			}
			i++;
		}
	}
};
BlockSlot.prototype.renameVariable=function(variable){
	this.passRecursively("renameVariable",variable);
};
BlockSlot.prototype.deleteVariable=function(variable){
	this.passRecursively("deleteVariable",variable);
};
BlockSlot.prototype.renameList=function(list){
	this.passRecursively("renameList",list);
};
BlockSlot.prototype.deleteList=function(list){
	this.passRecursively("deleteList",list);
};
BlockSlot.prototype.checkVariableUsed=function(variable){
	if(this.hasChild){
		return this.child.checkVariableUsed(variable);
	}
	return false;
};
BlockSlot.prototype.checkListUsed=function(list){
	if(this.hasChild){
		return this.child.checkListUsed(list);
	}
	return false;
};
BlockSlot.prototype.hideDeviceDropDowns=function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
};
BlockSlot.prototype.showDeviceDropDowns=function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
};
BlockSlot.prototype.countDevicesInUse=function(deviceClass){
	if(this.hasChild){
		return this.child.countDevicesInUse(deviceClass);
	}
	return 0;
};
BlockSlot.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	if(this.hasChild){
		this.child[functionName].apply(this.child,args);
	}
};
//Displays text on a block.  For example, the say for secs block has 3 LabelText objects: "say", "for", "secs".

function LabelText(parent,text){
	DebugOptions.validateNonNull(parent, text);
	this.text=text;
	this.width=0;
	this.height=BlockGraphics.labelText.charHeight;
	this.x=0;
	this.y=0;
	this.parent=parent;
	this.textE=this.generateText(text);
	this.isSlot=false;
	this.visible=true;
}
LabelText.prototype.updateAlign=function(x,y){
	this.move(x,y+this.height/2);
	return this.width;
};
LabelText.prototype.updateDim=function(){
	if(this.width==0){
		GuiElements.layers.temp.appendChild(this.textE);
		this.width=GuiElements.measure.textWidth(this.textE);
		this.textE.remove();
		this.parent.group.appendChild(this.textE);
	}
};
LabelText.prototype.generateText=function(text){
	var obj=BlockGraphics.create.labelText(text,this.parent.group);
	TouchReceiver.addListenersChild(obj,this.parent);
	return obj;
};
LabelText.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	BlockGraphics.update.text(this.textE,x,y);
};
LabelText.prototype.duplicate=function(parentCopy){
	return new LabelText(parentCopy,this.text);
};
LabelText.prototype.textSummary=function(){
	return this.text;
};
LabelText.prototype.show=function(){
	if(!this.visible){
		this.parent.group.appendChild(this.textE);
		this.visible=true;
	}
};
LabelText.prototype.hide=function(){
	if(this.visible){
		this.textE.remove();
		this.visible=false;
	}
};
LabelText.prototype.remove=function(){
	this.textE.remove();
};
function BlockIcon(parent,pathId,color,altText,height){
	this.pathId=pathId;
	this.color=color;
	this.altText=altText;
	this.width=VectorIcon.computeWidth(pathId,height);
	this.height=height;
	this.x=0;
	this.y=0;
	this.parent=parent;
	this.icon=new VectorIcon(0,0,pathId,color,height,this.parent.group);
	TouchReceiver.addListenersChild(this.icon.pathE,this.parent);
	this.isSlot=false;
}
BlockIcon.prototype.updateAlign=function(x,y){
	this.move(x,y-this.height/2);
	return this.width;
}
BlockIcon.prototype.updateDim=function(){
	
}
BlockIcon.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	this.icon.move(x,y);
}
BlockIcon.prototype.duplicate=function(parentCopy){
	return new BlockIcon(parentCopy,this.pathId,this.color,this.altText,this.height);
}
BlockIcon.prototype.textSummary=function(){
	return this.altText;
}
/**
 * Created by Tom on 6/14/2017.
 */
function B_DeviceWithPortsSensorBase(x, y, deviceClass, sensorType, displayName, numberOfPorts){
	ReporterBlock.call(this,x,y,deviceClass.getDeviceTypeId());
	this.deviceClass = deviceClass;
	this.sensorType = sensorType;
	this.displayName = displayName;
	this.numberOfPorts = numberOfPorts;
	this.addPart(new DeviceDropSlot(this,"DDS_1", deviceClass));
	this.addPart(new LabelText(this,displayName));
	this.addPart(new PortSlot(this,"PortS_1", numberOfPorts)); //Four sensor ports.
}
B_DeviceWithPortsSensorBase.prototype = Object.create(ReporterBlock.prototype);
B_DeviceWithPortsSensorBase.prototype.constructor = B_DeviceWithPortsSensorBase;
/* Generic Hummingbird input functions. */
B_DeviceWithPortsSensorBase.prototype.startAction=function(){
	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	let port = this.slots[1].getData().getValue();
	if (port != null && port > 0 && port <= this.numberOfPorts) {
		mem.requestStatus = {};
		mem.requestStatus.finished = false;
		mem.requestStatus.error = false;
		mem.requestStatus.result = null;
		device.readSensor(mem.requestStatus, this.sensorType, port);
		return new ExecutionStatusRunning();
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};
B_DeviceWithPortsSensorBase.prototype.updateAction=function(){
	var status = this.runMem.requestStatus;
	if (status.finished) {
		if(status.error){
			this.displayError(this.deviceClass.getNotConnectedMessage());
			return new ExecutionStatusError();
		} else {
			var result = new StringData(status.result);
			if(result.isNumber()){
				return new ExecutionStatusResult(result.asNum());
			}
			else{
				return new ExecutionStatusResult(new NumData(0, false));
			}
		}
	}
	return new ExecutionStatusRunning(); // Still running
};




function B_DeviceWithPortsOutputBase(x, y, deviceClass, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal){
	CommandBlock.call(this,x,y,deviceClass.getDeviceTypeId());
	this.deviceClass = deviceClass;
	this.outputType = outputType;
	this.displayName = displayName;
	this.numberOfPorts = numberOfPorts;
	this.minVal = minVal;
	this.maxVal = maxVal;
	this.positive = minVal >= 0;
	this.valueKey = valueKey;
	this.addPart(new DeviceDropSlot(this,"DDS_1", deviceClass));
	this.addPart(new LabelText(this,displayName));
	this.addPart(new PortSlot(this,"PortS_1", numberOfPorts)); //Four sensor ports.
	this.addPart(new NumSlot(this,"NumS_out", 0, this.positive, true)); //integer
}
B_DeviceWithPortsOutputBase.prototype = Object.create(CommandBlock.prototype);
B_DeviceWithPortsOutputBase.prototype.constructor = B_DeviceWithPortsOutputBase;
B_DeviceWithPortsOutputBase.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	let port = this.slots[1].getData().getValue();
	let value = this.slots[2].getData().getValueInR(this.minVal, this.maxVal, this.positive, true); // [0,180]
	if (port != null && port > 0 && port <= this.numberOfPorts) {
		mem.requestStatus = {};
		mem.requestStatus.finished = false;
		mem.requestStatus.error = false;
		mem.requestStatus.result = null;
		device.setOutput(mem.requestStatus, this.outputType, port, value, this.valueKey);
		return new ExecutionStatusRunning();
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};
B_DeviceWithPortsOutputBase.prototype.updateAction = function() {
	if(this.runMem.requestStatus.finished){
		if(this.runMem.requestStatus.error){
			this.displayError(this.deviceClass.getNotConnectedMessage());
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone();
	}
	else{
		return new ExecutionStatusRunning();
	}
};




function B_DeviceWithPortsTriLed(x, y, deviceClass, numberOfPorts) {
	CommandBlock.call(this, x, y, deviceClass.getDeviceTypeId());
	this.deviceClass = deviceClass;
	this.numberOfPorts = numberOfPorts;
	this.addPart(new DeviceDropSlot(this,"DDS_1", deviceClass, true));
	this.addPart(new LabelText(this, "TRI-LED"));
	this.addPart(new PortSlot(this,"PortS_1", numberOfPorts)); //Positive integer.
	this.addPart(new LabelText(this, "R"));
	this.addPart(new NumSlot(this,"NumS_r", 0, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "G"));
	this.addPart(new NumSlot(this,"NumS_g", 0, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "B"));
	this.addPart(new NumSlot(this,"NumS_b", 0, true, true)); //Positive integer.
}
B_DeviceWithPortsTriLed.prototype = Object.create(CommandBlock.prototype);
B_DeviceWithPortsTriLed.prototype.constructor = B_DeviceWithPortsTriLed;
B_DeviceWithPortsTriLed.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = this.deviceClass.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(this.deviceClass.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let mem = this.runMem;
	mem.requestStatus = {};
	let port = this.slots[1].getData().getValue(); // Positive integer.
	let valueR = this.slots[2].getData().getValueInR(0, 100, true, true); //Positive integer.
	let valueG = this.slots[3].getData().getValueInR(0, 100, true, true); //Positive integer.
	let valueB = this.slots[4].getData().getValueInR(0, 100, true, true); //Positive integer.
	if (port != null && port > 0 && port <= this.numberOfPorts) {
		device.setTriLed(mem.requestStatus, port, valueR, valueG, valueB);
		return new ExecutionStatusRunning();
	} else {
		this.displayError("Invalid port number");
		return new ExecutionStatusError(); // Invalid port, exit early
	}
};
/* Waits for the request to finish. */
B_DeviceWithPortsTriLed.prototype.updateAction = function() {
	if(this.runMem.requestStatus.finished){
		if(this.runMem.requestStatus.error){
			this.displayError(this.deviceClass.getNotConnectedMessage());
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone();
	}
	else{
		return new ExecutionStatusRunning();
	}
};
/* This file contains the implementations for Blocks in the hummingbird category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 * Most relay on the HummingbirdManager to remove redundant code.
 */

function B_HummingbirdOutputBase(x, y, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal) {
	B_DeviceWithPortsOutputBase.call(this, x, y, DeviceHummingbird, outputType, displayName, numberOfPorts, valueKey, minVal, maxVal);
}
B_HummingbirdOutputBase.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_HummingbirdOutputBase.prototype.constructor = B_HummingbirdOutputBase;



function B_HBServo(x,y){
	B_HummingbirdOutputBase.call(this, x, y, "servo", "Servo", 4, "angle", 0, 180);
}
B_HBServo.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBServo.prototype.constructor = B_HBServo;


function B_HBMotor(x,y){
	B_HummingbirdOutputBase.call(this, x, y, "motor", "Motor", 2, "speed", 0, 180);
}
B_HBMotor.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBMotor.prototype.constructor = B_HBMotor;



function B_HBVibration(x,y){
	B_HummingbirdOutputBase.call(this, x, y, "vibration", "Vibration", 2, "intensity", 0, 180);
}
B_HBVibration.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBVibration.prototype.constructor = B_HBVibration;



function B_HBLed(x,y){
	B_HummingbirdOutputBase.call(this, x, y, "led", "LED", 4, "intensity", 0, 180);
}
B_HBLed.prototype = Object.create(B_HummingbirdOutputBase.prototype);
B_HBLed.prototype.constructor = B_HBLed;



function B_HummingbirdSensorBase(x, y, sensorType, displayName) {
	B_DeviceWithPortsSensorBase.call(this, x,y, DeviceHummingbird, sensorType, displayName, 4);
}
B_HummingbirdSensorBase.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_HummingbirdSensorBase.prototype.constructor = B_HummingbirdSensorBase;


function B_HBLight(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "sensor", "Light");
}
B_HBLight.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBLight.prototype.constructor = B_HBLight;


function B_HBTempC(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "temperature", "Temperature C");
}
B_HBTempC.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBTempC.prototype.constructor = B_HBTempC;
Block.setDisplaySuffix(B_HBTempC, String.fromCharCode(176) + "C");


function B_HBDistCM(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "distance", "Distance CM");
}
B_HBDistCM.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBDistCM.prototype.constructor = B_HBDistCM;
Block.setDisplaySuffix(B_HBDistCM, "cm");



function B_HBKnob(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "sensor", "Knob");
}
B_HBKnob.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBKnob.prototype.constructor = B_HBKnob;


function B_HBSound(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "sound", "Sound");
}
B_HBSound.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBSound.prototype.constructor = B_HBSound;


///// <Special> /////


function B_HBTriLed(x,y){
	B_DeviceWithPortsTriLed.call(this,x,y, DeviceHummingbird, 2);
}
B_HBTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_HBTriLed.prototype.constructor = B_HBTriLed;


function B_HBTempF(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "temperature", "Temperature F");
}
B_HBTempF.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBTempF.prototype.constructor = B_HBTempF;
B_HBTempF.prototype.updateAction=function(){
	var status = B_DeviceWithPortsSensorBase.prototype.updateAction.call(this);
	if(status.hasError() || status.isRunning()){
		return status;
	} else {
		let resultC = status.getResult();
		if(resultC != null && resultC.isValid) {
			let result=new NumData(Math.round(resultC.getValue()*1.8+32));
			return new ExecutionStatusResult(result);
		} else {
			return status;
		}
	}
};
Block.setDisplaySuffix(B_HBTempF, String.fromCharCode(176) + "F");


function B_HBDistInch(x,y){
	B_HummingbirdSensorBase.call(this,x,y, "distance", "Distance Inch");
}
B_HBDistInch.prototype = Object.create(B_HummingbirdSensorBase.prototype);
B_HBDistInch.prototype.constructor = B_HBDistInch;
B_HBDistInch.prototype.updateAction=function(){
	var status = B_DeviceWithPortsSensorBase.prototype.updateAction.call(this);
	if(status.hasError() || status.isRunning()){
		return status;
	} else {
		let resultMm = status.getResult();
		if(resultMm != null && resultMm.isValid) {
			let result=new NumData((resultMm.getValue()/2.54).toFixed(1)*1);
			return new ExecutionStatusResult(result);
		} else {
			return status;
		}
	}
};
Block.setDisplaySuffix(B_HBDistInch, "inches");

/* Output Blocks */
function B_FlutterServo(x, y) {
	B_DeviceWithPortsOutputBase.call(this, x,y, DeviceFlutter, "servo", "Servo", 3, "angle", 0, 180);
}
B_FlutterServo.prototype = Object.create(B_DeviceWithPortsOutputBase.prototype);
B_FlutterServo.prototype.constructor = B_FlutterServo;


function B_FlutterTriLed(x,y){
	B_DeviceWithPortsTriLed.call(this,x,y, DeviceFlutter, 3);
}
B_FlutterTriLed.prototype = Object.create(B_DeviceWithPortsTriLed.prototype);
B_FlutterTriLed.prototype.constructor = B_FlutterTriLed;


function B_FlutterBuzzer(x, y) {
	CommandBlock.call(this, x, y, "flutter");
	this.addPart(new DeviceDropSlot(this,"DDS_1", DeviceFlutter, true));
	this.addPart(new LabelText(this, "Buzzer"));
	this.addPart(new LabelText(this, "Volume"));
	this.addPart(new NumSlot(this,"NumS_vol", 20, true, true)); //Positive integer.
	this.addPart(new LabelText(this, "Frequency"));
	this.addPart(new NumSlot(this,"NumS_freq", 10000, true, true)); //Positive integer.
}
B_FlutterBuzzer.prototype = Object.create(CommandBlock.prototype);
B_FlutterBuzzer.prototype.constructor = B_FlutterBuzzer;
/* Generic flutter single output functions. */
B_FlutterBuzzer.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = DeviceFlutter.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(DeviceFlutter.getNotConnectedMessage());
		return new ExecutionStatusError(); // Flutter was invalid, exit early
	}
	let volume = this.slots[1].getData().getValueInR(0, 100, true, true);
	let frequency = this.slots[2].getData().getValueInR(0, 20000, true, true);
	this.runMem.requestStatus = {};
	device.setBuzzer(this.runMem.requestStatus, volume, frequency);
	return new ExecutionStatusRunning();
};
B_FlutterBuzzer.prototype.updateAction = function() {
	if(this.runMem.requestStatus.finished){
		if(this.runMem.requestStatus.error){
			this.displayError(DeviceFlutter.getNotConnectedMessage());
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone();
	}
	else{
		return new ExecutionStatusRunning();
	}
};




/* Input Blocks */
function B_FlutterSensorBase(x, y, sensorType, displayName) {
	B_DeviceWithPortsSensorBase.call(this, x,y, DeviceFlutter, sensorType, displayName, 3);
}
B_FlutterSensorBase.prototype = Object.create(B_DeviceWithPortsSensorBase.prototype);
B_FlutterSensorBase.constructor = B_FlutterSensorBase;

function B_FlutterLight(x, y) {
	B_FlutterSensorBase.call(this, x, y, "light", "Light");
}
B_FlutterLight.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterLight.prototype.constructor = B_FlutterLight;

function B_FlutterTempC(x, y) {
	B_FlutterSensorBase.call(this, x, y, "temperature", "Temperature C");
}
B_FlutterTempC.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterTempC.prototype.constructor = B_FlutterTempC;
Block.setDisplaySuffix(B_FlutterTempC, String.fromCharCode(176) + "C");



function B_FlutterDistCM(x, y) {
	B_FlutterSensorBase.call(this, x, y, "distance", "Distance CM");
}
B_FlutterDistCM.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterDistCM.prototype.constructor = B_FlutterDistCM;
Block.setDisplaySuffix(B_FlutterDistCM, "cm");


function B_FlutterKnob(x, y) {
	B_FlutterSensorBase.call(this, x, y, "sensor", "Knob");
}
B_FlutterKnob.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterKnob.prototype.constructor = B_FlutterKnob;


function B_FlutterSoil(x, y) {
	B_FlutterSensorBase.call(this, x, y, "soil", "Soil Moisture");
}
B_FlutterSoil.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterSoil.prototype.constructor = B_FlutterSoil;


function B_FlutterSound(x, y) {
	B_FlutterSensorBase.call(this, x, y, "sound", "Sound");
}
B_FlutterSound.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterSound.prototype.constructor = B_FlutterSound;


function B_FlutterTempF(x, y) {
	B_FlutterSensorBase.call(this, x, y, "temperature", "Temperature F");
}
B_FlutterTempF.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterTempF.prototype.constructor = B_FlutterTempF;
/* Waits for the request to finish then converts C to F. */
B_FlutterTempF.prototype.updateAction=function(){
	var status = B_FlutterSensorBase.prototype.updateAction.call(this);
	if(status.hasError() || status.isRunning()){
		return status;
	} else {
		let resultC = status.getResult();
		if(resultC != null && resultC.isValid) {
			let result=new NumData(Math.round(resultC.getValue()*1.8+32));
			return new ExecutionStatusResult(result);
		} else {
			return status;
		}
	}
};
Block.setDisplaySuffix(B_HBTempF, String.fromCharCode(176) + "F");

Block.setDisplaySuffix(B_FlutterTempF, String.fromCharCode(176) + "F");


function B_FlutterDistInch(x, y) {
	B_FlutterSensorBase.call(this, x, y, "distance", "Distance Inch");
}
B_FlutterDistInch.prototype = Object.create(B_FlutterSensorBase.prototype);
B_FlutterDistInch.prototype.constructor = B_FlutterDistInch;
/* Waits for the request to finish then converts cm to in. */
B_HBDistInch.prototype.updateAction=function(){
	var status = B_FlutterSensorBase.prototype.updateAction.call(this);
	if(status.hasError() || status.isRunning()){
		return status;
	} else {
		let resultMm = status.getResult();
		if(resultMm != null && resultMm.isValid) {
			let result=new NumData((resultMm.getValue()/2.54).toFixed(1)*1);
			return new ExecutionStatusResult(result);
		} else {
			return status;
		}
	}
};

Block.setDisplaySuffix(B_FlutterDistInch, "inches");

/* This file contains the implementations for Blocks in the control category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */



function B_WhenFlagTapped(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when"));
	this.addPart(new BlockIcon(this,VectorPaths.flag,TitleBar.flagFill,"flag",15));
	this.addPart(new LabelText(this,"tapped"));
}
B_WhenFlagTapped.prototype = Object.create(HatBlock.prototype);
B_WhenFlagTapped.prototype.constructor = B_WhenFlagTapped;
/* Triggers stack to start running. */
B_WhenFlagTapped.prototype.eventFlagClicked=function(){
	this.stack.startRun();
};
/* Does nothing. */
B_WhenFlagTapped.prototype.startAction=function(){
	return new ExecutionStatusDone(); //Done running. This Block does nothing except respond to an event.
};



function B_WhenIReceive(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when I receive"));
	this.addPart(new BroadcastDropSlot(this,"BDS_msg",true));
}
B_WhenIReceive.prototype = Object.create(HatBlock.prototype);
B_WhenIReceive.prototype.constructor = B_WhenIReceive;
B_WhenIReceive.prototype.eventBroadcast=function(message){
	var myMessage=this.slots[0].getData();
	if(myMessage!=null){
		var myMessageStr=myMessage.getValue();
		if(myMessageStr=="any_message"||myMessageStr==message){
			this.stack.stop();
			this.stack.startRun(null,message);
		}
	}
};
/* Does nothing. */
B_WhenIReceive.prototype.startAction=function(){
	return new ExecutionStatusDone(); //Done running. This Block does nothing except respond to an event.
};



function B_Wait(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"wait"));
	this.addPart(new NumSlot(this,"NumS_dur",1,true)); //Must be positive.
	this.addPart(new LabelText(this,"secs"));
}
B_Wait.prototype = Object.create(CommandBlock.prototype);
B_Wait.prototype.constructor = B_Wait;
/* Records current time. */
B_Wait.prototype.startAction=function(){
	var mem=this.runMem;
	mem.startTime=new Date().getTime();
	mem.delayTime=this.slots[0].getData().getValueWithC(true)*1000;
	return new ExecutionStatusRunning(); //Still running
};
/* Waits until current time exceeds stored time plus delay. */
B_Wait.prototype.updateAction=function(){
	var mem=this.runMem;
	if(new Date().getTime()>=mem.startTime+mem.delayTime){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_WaitUntil(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"wait until"));
	this.addPart(new BoolSlot(this,"BoolS_cond"));
}
B_WaitUntil.prototype = Object.create(CommandBlock.prototype);
B_WaitUntil.prototype.constructor = B_WaitUntil;
/* Checks condition. If true, stops running; if false, resets Block to check again. */
B_WaitUntil.prototype.startAction=function(){
	var stopWaiting=this.slots[0].getData().getValue();
	if(stopWaiting){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		this.running=0; //startAction will be run next time, giving Slots ability to recalculate.
		this.clearMem(); //runMem and previous values of Slots will be removed.
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_Forever(x,y){
	LoopBlock.call(this,x,y,"control",false); //Bottom is not open.
	this.addPart(new LabelText(this,"repeat forever"));
}
B_Forever.prototype = Object.create(LoopBlock.prototype);
B_Forever.prototype.constructor = B_Forever;
/* Begins executing contents. */
B_Forever.prototype.startAction=function(){
	this.blockSlot1.startRun();
	return new ExecutionStatusRunning(); //Still running
};
/* Continues executing contents. If contents are done, runs them again. */
B_Forever.prototype.updateAction=function(){
	let blockSlotStatus = this.blockSlot1.updateRun();
	if(!blockSlotStatus.isRunning()) {
		if(blockSlotStatus.hasError()){
			return blockSlotStatus;
		} else{
			this.blockSlot1.startRun();
		}
	}
	return new ExecutionStatusRunning(); //Still running. Never stops.
};



function B_Repeat(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"repeat"));
	this.addPart(new NumSlot(this,"NumS_count",10,true,true)); //Positive integer.
}
B_Repeat.prototype = Object.create(LoopBlock.prototype);
B_Repeat.prototype.constructor = B_Repeat;
/* Prepares counter and begins executing contents. */
B_Repeat.prototype.startAction=function(){
	var mem=this.runMem;
	mem.timesD=this.slots[0].getData();
	mem.times=mem.timesD.getValueWithC(true,true);
	mem.count=0;
	if(mem.times>0&&mem.timesD.isValid) {
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
	else{
		return new ExecutionStatusDone();
	}
};
/* Update contents. When they finish, increment counter and possibly run them again. */
B_Repeat.prototype.updateAction=function(){
	let blockSlotStatus = this.blockSlot1.updateRun();
	if(!blockSlotStatus.isRunning()){
		if(blockSlotStatus.hasError()){
			return blockSlotStatus;
		} else {
			var mem = this.runMem;
			mem.count++;
			if (mem.count >= mem.times) {
				return new ExecutionStatusDone(); //Done running
			}
			else {
				this.blockSlot1.startRun();
			}
		}
	}
	return new ExecutionStatusRunning(); //Still running
};



function B_RepeatUntil(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"repeat until"));
	this.addPart(new BoolSlot(this,"BoolS_cond"));
}
B_RepeatUntil.prototype = Object.create(LoopBlock.prototype);
B_RepeatUntil.prototype.constructor = B_RepeatUntil;
/* Checks condition and either stops running or executes contents. */
B_RepeatUntil.prototype.startAction=function(){
	var stopRepeating=this.slots[0].getData().getValue();
	if(stopRepeating){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
};
/* Updates contents until completed. Then resets Block to condition can be checked again. */
B_RepeatUntil.prototype.updateAction=function(){
	let blockSlotStatus = this.blockSlot1.updateRun();
	if(!blockSlotStatus.isRunning()){
		if(blockSlotStatus.hasError()){
			return blockSlotStatus;
		} else {
			this.running=0; //startAction will be run next time, giving Slots ability to recalculate.
			this.clearMem(); //runMem and previous values of Slots will be removed.
		}
	}
	return new ExecutionStatusRunning(); //Still running
};



function B_If(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"if"));
	this.addPart(new BoolSlot(this,"BoolS_cond"));
}
B_If.prototype = Object.create(LoopBlock.prototype);
B_If.prototype.constructor = B_If;
/* Either stops running or executes contents. */
B_If.prototype.startAction=function(){
	var check=this.slots[0].getData().getValue();
	if(check){
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
	else{
		return new ExecutionStatusDone(); //Done running
	}
};
/* Continues executing contents until completed. */
B_If.prototype.updateAction=function(){
	return this.blockSlot1.updateRun();
};



function B_IfElse(x,y){
	DoubleLoopBlock.call(this,x,y,"control","else");
	this.addPart(new LabelText(this,"if"));
	this.addPart(new BoolSlot(this,"BoolS_cond"));
}
B_IfElse.prototype = Object.create(DoubleLoopBlock.prototype);
B_IfElse.prototype.constructor = B_IfElse;
/* Starts executing one of two BlockSlots. */
B_IfElse.prototype.startAction=function(){
	this.runMem.check=this.slots[0].getData().getValue();
	if(this.runMem.check){
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
	else{
		this.blockSlot2.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
};
/* Continues executing one of two BlockSlots until completion. */
B_IfElse.prototype.updateAction=function(){
	if(this.runMem.check){
		return this.blockSlot1.updateRun();
	}
	else{
		return this.blockSlot2.updateRun();
	}
};




function B_Broadcast(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"broadcast"));
	this.addPart(new BroadcastDropSlot(this,"BDS_msg",false));
}
B_Broadcast.prototype = Object.create(CommandBlock.prototype);
B_Broadcast.prototype.constructor = B_Broadcast;
/* Broadcast the message if one has been selected. */
B_Broadcast.prototype.startAction=function(){
	var message=this.slots[0].getData();
	if(message!=null){
		CodeManager.message=new StringData(message.getValue());
		CodeManager.eventBroadcast(message.getValue());
	}
	return new ExecutionStatusRunning();
};
B_Broadcast.prototype.updateAction=function(){
	return new ExecutionStatusDone();
};

function B_BroadcastAndWait(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"broadcast"));
	this.addPart(new BroadcastDropSlot(this,"BDS_msg",false));
	this.addPart(new LabelText(this,"and wait"));
}
B_BroadcastAndWait.prototype = Object.create(CommandBlock.prototype);
B_BroadcastAndWait.prototype.constructor = B_BroadcastAndWait;
B_BroadcastAndWait.prototype.startAction=function(){
	var message=this.slots[0].getData();
	if(message!=null){
		this.runMem.message=message.getValue();
		CodeManager.message=new StringData(this.runMem.message);
		CodeManager.eventBroadcast(this.runMem.message);
	}
	return new ExecutionStatusRunning();
};
B_BroadcastAndWait.prototype.updateAction=function(){
	if(CodeManager.checkBroadcastRunning(this.runMem.message)){
		return new ExecutionStatusRunning();
	} else{
		return new ExecutionStatusDone();
	}
};

function B_Message(x,y){
	ReporterBlock.call(this,x,y,"control",Block.returnTypes.string);
	this.addPart(new LabelText(this,"message"));
}
B_Message.prototype = Object.create(ReporterBlock.prototype);
B_Message.prototype.constructor = B_Message;
B_Message.prototype.startAction=function(){
	return new ExecutionStatusResult(CodeManager.message);
};



function B_Stop(x,y){//No bottom slot
	CommandBlock.call(this,x,y,"control",true);
	this.addPart(new LabelText(this,"stop"));
	var dS=new DropSlot(this,"DS_act",Slot.snapTypes.none);
	dS.addOption("all",new SelectionData("all"));
	dS.addOption("this script",new SelectionData("this_script"));
	//dS.addOption("this block",new SelectionData("this_block"));
	dS.addOption("all but this script",new SelectionData("all_but_this_script"));
	//dS.addOption("other scripts in sprite",new SelectionData("other_scripts_in_sprite"));
	dS.setSelectionData("all",new SelectionData("all"));
	this.addPart(dS);
}
B_Stop.prototype = Object.create(CommandBlock.prototype);
B_Stop.prototype.constructor = B_Stop;
B_Stop.prototype.startAction=function(){
	var selection=this.slots[0].getData().getValue();
	if(selection=="all"){
		CodeManager.stop();
	}
	else if(selection=="this_script"){
		this.stack.stop();
	}
	else if(selection=="all_but_this_script"){
		TabManager.stopAllButStack(this.stack);
	}
	return new ExecutionStatusDone();
};




///// <Not implemented> /////
function B_WhenIAmTapped(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when I am"));
	var dS=new DropSlot(this,"DS_act",null,Slot.snapTypes.bool);
	dS.addOption("tapped",new SelectionData("tapped"));
	dS.addOption("pressed",new SelectionData("pressed"));
	dS.addOption("released",new SelectionData("released"));
	this.addPart(dS);
}
B_WhenIAmTapped.prototype = Object.create(HatBlock.prototype);
B_WhenIAmTapped.prototype.constructor = B_WhenIAmTapped;




/* This file contains the implementations for Blocks in the sensing category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 * Many of these will use the this.stack.getSprite() method, which is not done yet.
 */

function B_Ask(x,y){
	CommandBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"ask"));
	this.addPart(new StringSlot(this,"StrS_msg","what's your name?"));
	this.addPart(new LabelText(this,"and wait"));
}
B_Ask.prototype = Object.create(CommandBlock.prototype);
B_Ask.prototype.constructor = B_Ask;
/* Show a dialog with the question unless another dialog is already visible or has been displayed recently. */
B_Ask.prototype.startAction=function(){
	var mem=this.runMem;
	mem.question=this.slots[0].getData().getValue(); //Form the question
	mem.questionDisplayed=false; //Has the dialog request been issued yet?
	if(HtmlServer.dialogVisible){ //If there is already a dialog, we will wait until it is closed.
		mem.waitingForDialog=true; //We are waiting.
	}
	else{
		mem.waitingForDialog=false; //We are not waiting for a dialog to disappear.
		//There is a delay between repeated dialogs to give the user time to stop the program.
		if(CodeManager.checkDialogDelay()) { //Check if we can show the dialog or should delay.
			this.showQuestion(); //Show the dialog.
		}
	}
	return new ExecutionStatusRunning();
};
/* Waits until the dialog has been displayed and completed. */
B_Ask.prototype.updateAction=function(){
	var mem=this.runMem;
	if(mem.waitingForDialog){ //If we are waiting for a dialog to close...
		if(!HtmlServer.dialogVisible){ //...And the dialog is closed...
			mem.waitingForDialog=false; //...Then we can stop waiting.
		}
		return new ExecutionStatusRunning(); //Still running.
	}
	else if(!mem.questionDisplayed){ //If the question has not yet been displayed...
		if(CodeManager.checkDialogDelay()) { //Check if we can show the dialog or should delay.
			if(HtmlServer.dialogVisible){ //Make sure there still isn't a dialog visible.
				mem.waitingForDialog=true;
			}
			else{
				this.showQuestion(); //Display the question.
			}
		}
		return new ExecutionStatusRunning(); //Still running.
	}
	else{
		if(mem.finished==true){ //Question has been answered.
			CodeManager.updateDialogDelay(); //Tell CodeManager to reset the dialog delay clock.
			return new ExecutionStatusDone(); //Done running
		}
		else{ //Waiting on answer from user.
			return new ExecutionStatusRunning(); //Still running
		}
	}
};
B_Ask.prototype.showQuestion=function(){
	var mem=this.runMem;
	mem.finished=false; //Will be changed once answered.
	var callbackFn=function(cancelled,response){
		if(cancelled){
			CodeManager.answer = new StringData("", true); //"" is the default answer.
		}
		else{
			CodeManager.answer = new StringData(response, true); //Store the user's anser in the CodeManager.
		}
		callbackFn.mem.finished=true; //Done waiting.
	};
	callbackFn.mem=mem;
	var callbackErr=function(){ //If an error occurs...
		CodeManager.answer = new StringData("", true); //"" is the default answer.
		callbackErr.mem.finished=true; //Done waiting.
	};
	callbackErr.mem=mem;
	HtmlServer.showDialog("Question",mem.question,"",callbackFn,callbackErr); //Make the request.
	mem.questionDisplayed=true; //Prevents displaying twice.
};




function B_Answer(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.string);
	this.addPart(new LabelText(this,"answer"));
}
B_Answer.prototype = Object.create(ReporterBlock.prototype);
/* Result is whatever is stored in CodeManager. */
B_Answer.prototype.constructor = B_Answer;
B_Answer.prototype.startAction=function(){
	return new ExecutionStatusResult(CodeManager.answer);
};

function B_ResetTimer(x,y){
	CommandBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"reset timer"));
}
B_ResetTimer.prototype = Object.create(CommandBlock.prototype);
B_ResetTimer.prototype.constructor = B_ResetTimer;
B_ResetTimer.prototype.startAction=function(){
	CodeManager.timerForSensingBlock=new Date().getTime();
	return new ExecutionStatusDone();
};

function B_Timer(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"timer"));
}
B_Timer.prototype = Object.create(ReporterBlock.prototype);
B_Timer.prototype.constructor = B_Timer;
B_Timer.prototype.startAction=function(){
	var now=new Date().getTime();
	var start=CodeManager.timerForSensingBlock;
	return new ExecutionStatusResult(new NumData(Math.round((now-start)/100)/10));
};
Block.setDisplaySuffix(B_Timer, "s");

function B_CurrentTime(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"current"));
	var dS=new DropSlot(this,"DS_interval",null,Slot.snapTypes.bool);
	dS.addOption("year",new SelectionData("year"));
	dS.addOption("month",new SelectionData("month"));
	dS.addOption("date",new SelectionData("date"));
	dS.addOption("day of the week",new SelectionData("day of the week"));
	dS.addOption("hour",new SelectionData("hour"));
	dS.addOption("minute",new SelectionData("minute"));
	dS.addOption("second",new SelectionData("second"));
	dS.addOption("time in milliseconds",new SelectionData("time in milliseconds"));
	dS.setSelectionData("date",new SelectionData("date"));
	this.addPart(dS);
}
B_CurrentTime.prototype = Object.create(ReporterBlock.prototype);
B_CurrentTime.prototype.constructor = B_CurrentTime;
B_CurrentTime.prototype.startAction=function(){
	var unitD=this.slots[0].getData();
	if(unitD==null){
		return new ExecutionStatusResult(new NumData(0,false));
	}
	var unit=unitD.getValue();
	if(unit=="year"){
		return new ExecutionStatusResult(new NumData(new Date().getFullYear()));
	}
	else if(unit=="month"){
		return new ExecutionStatusResult(new NumData(new Date().getMonth()+1));
	}
	else if(unit=="date"){
		return new ExecutionStatusResult(new NumData(new Date().getDate()));
	}
	else if(unit=="day of the week"){
		return new ExecutionStatusResult(new NumData(new Date().getDay()+1));
	}
	else if(unit=="hour"){
		return new ExecutionStatusResult(new NumData(new Date().getHours()));
	}
	else if(unit=="minute"){
		return new ExecutionStatusResult(new NumData(new Date().getMinutes()));
	}
	else if(unit=="second"){
		return new ExecutionStatusResult(new NumData(new Date().getSeconds()));
	}
	else if(unit=="time in milliseconds"){
		return new ExecutionStatusResult(new NumData(new Date().getTime()));
	}
	return new ExecutionStatusResult(new NumData(0, false));
};
/* This file contains the implementations for Blocks in the operators category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */

function B_Add(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,"NumS_1",0));
	this.addPart(new LabelText(this,"+"));
	this.addPart(new NumSlot(this,"NumS_2",0));
}
B_Add.prototype = Object.create(ReporterBlock.prototype);
B_Add.prototype.constructor = B_Add;
/* Sets the result to the sum of the Slots. Result is valid only if both inputs are. */
B_Add.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()+data2.getValue();
	return new ExecutionStatusResult(new NumData(val,isValid));
};



function B_Subtract(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,"NumS_1",0));
	this.addPart(new LabelText(this,String.fromCharCode(8211)));
	this.addPart(new NumSlot(this,"NumS_2",0));
}
B_Subtract.prototype = Object.create(ReporterBlock.prototype);
B_Subtract.prototype.constructor = B_Subtract;
/* Sets the result to the difference between the Slots. Result is valid only if both inputs are. */
B_Subtract.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()-data2.getValue();
	return new ExecutionStatusResult(new NumData(val,isValid));
};



function B_Multiply(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,"NumS_1",0));
	this.addPart(new LabelText(this,"*"));
	this.addPart(new NumSlot(this,"NumS_2",0));
}
B_Multiply.prototype = Object.create(ReporterBlock.prototype);
B_Multiply.prototype.constructor = B_Multiply;
/* Sets the result to the product of the Slots. Result is valid only if both inputs are. */
B_Multiply.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()*data2.getValue();
	return new ExecutionStatusResult(new NumData(val,isValid));
};



function B_Divide(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,"NumS_1",0));
	this.addPart(new LabelText(this,"/"));
	this.addPart(new NumSlot(this,"NumS_2",1));
}
B_Divide.prototype = Object.create(ReporterBlock.prototype);
B_Divide.prototype.constructor = B_Divide;
/* Sets the result to the quotient of the Slots. Result is valid only if both inputs are and Slot2!=0. */
B_Divide.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val1=data1.getValue();
	var val2=data2.getValue();
	var val=val1/val2;
	if(val2==0){
		val=0; //Return invalid 0 if told to divide by 0.
		isValid=false;
	}
	return new ExecutionStatusResult(new NumData(val,isValid));
};



function B_Mod(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,"NumS_1",17));
	this.addPart(new LabelText(this,"mod"));
	this.addPart(new NumSlot(this,"NumS_2",10));
}
B_Mod.prototype = Object.create(ReporterBlock.prototype);
B_Mod.prototype.constructor = B_Mod;
/* Sets the result to the first Slot mod the second Slot. Valid if Slots are valid and second isn't 0. */
B_Mod.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val1=data1.getValue();
	var val2=data2.getValue();
	var result=((val1%val2)+val2)%val2;
	if(val2==0){
		result=0;
		isValid=false;
	}
	return new ExecutionStatusResult(new NumData(result,isValid));
};



function B_Round(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"round"));
	this.addPart(new NumSlot(this,"NumS_1",0.5));
}
B_Round.prototype = Object.create(ReporterBlock.prototype);
B_Round.prototype.constructor = B_Round;
/* Sets the result to the rounded value of the Slot. Is valid only if Slot is. */
B_Round.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var isValid=data1.isValid;
	var val=data1.getValueWithC(false,true); //Integer
	return new ExecutionStatusResult(new NumData(val,isValid));
};



function B_PickRandom(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"pick random"));
	this.addPart(new NumSlot(this,"NumS_min",1));
	this.addPart(new LabelText(this,"to"));
	this.addPart(new NumSlot(this,"NumS_max",10));
}
/* Picks a random integer if both Slots are integers. Otherwise it selects a random float. Is valid if both are. */
B_PickRandom.prototype = Object.create(ReporterBlock.prototype);
B_PickRandom.prototype.constructor = B_PickRandom;
B_PickRandom.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val1=data1.getValue();
	var val2=data2.getValue();
	var integer = (val1===(val1|0)&&val2===(val2|0));
	var rVal;
	var min=val1;
	var max=val2;
	if(min>max){
		min=val2;
		max=val1;
	}
	if(integer){
		rVal = Math.floor(Math.random() * (max - min + 1)) + min;
	}
	else{
		rVal = Math.random() * (max - min) + min;
	}
	return new ExecutionStatusResult(new NumData(rVal,isValid));
};



function B_LessThan(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,"NumS_1",0));
	this.addPart(new LabelText(this,"<"));
	this.addPart(new NumSlot(this,"NumS_2",0));
}
B_LessThan.prototype = Object.create(PredicateBlock.prototype);
B_LessThan.prototype.constructor = B_LessThan;
/* Result is a valid boolean indicating is Slot1<Slot2. */
B_LessThan.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new BoolData(val1<val2));
};



function B_EqualTo(x,y){//needs to work with strings
	PredicateBlock.call(this,x,y,"operators");
	var rS=new RoundSlot(this,"RndS_item1",Slot.snapTypes.any,Slot.outputTypes.any,new NumData(0));
	rS.addOption("Enter text",new SelectionData("enter_text"));
	var rS2=new RoundSlot(this,"RndS_item2",Slot.snapTypes.any,Slot.outputTypes.any,new NumData(0));
	rS2.addOption("Enter text",new SelectionData("enter_text"));

	this.addPart(rS);
	this.addPart(new LabelText(this,"="));
	this.addPart(rS2);
}
B_EqualTo.prototype = Object.create(PredicateBlock.prototype);
B_EqualTo.prototype.constructor = B_EqualTo;
/* Compares data of any type to determine equality. Result is always valid. */
B_EqualTo.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	return new ExecutionStatusResult(new BoolData(Data.checkEquality(data1,data2)));
};



function B_GreaterThan(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,"NumS_1",0));
	this.addPart(new LabelText(this,">"));
	this.addPart(new NumSlot(this,"NumS_2",0));
}
B_GreaterThan.prototype = Object.create(PredicateBlock.prototype);
B_GreaterThan.prototype.constructor = B_GreaterThan;
/* Result is a valid boolean indicating is Slot1>Slot2. */
B_GreaterThan.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new BoolData(val1>val2));
};



function B_And(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new BoolSlot(this,"BoolS_1"));
	this.addPart(new LabelText(this,"and"));
	this.addPart(new BoolSlot(this,"BoolS_2"));
}
B_And.prototype = Object.create(PredicateBlock.prototype);
B_And.prototype.constructor = B_And;
/* Result is true if both are true. Always valid. */
B_And.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new BoolData(val1&&val2));
};



function B_Or(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new BoolSlot(this,"BoolS_1"));
	this.addPart(new LabelText(this,"or"));
	this.addPart(new BoolSlot(this,"BoolS_2"));
}
B_Or.prototype = Object.create(PredicateBlock.prototype);
B_Or.prototype.constructor = B_Or;
/* Result is true if either is true. Always valid. */
B_Or.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new BoolData(val1||val2));
};



function B_Not(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"not"));
	this.addPart(new BoolSlot(this,"BoolS_1"));
}
B_Not.prototype = Object.create(PredicateBlock.prototype);
B_Not.prototype.constructor = B_Not;
/* Result is true if Slot is false. Always valid. */
B_Not.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	return new ExecutionStatusResult(new BoolData(!val1));
};



function B_True(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"true"));
}
B_True.prototype = Object.create(PredicateBlock.prototype);
B_True.prototype.constructor = B_True;
/* Result is true. */
B_True.prototype.startAction=function(){
	return new ExecutionStatusResult(new BoolData(true));
};



function B_False(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"false"));
}
B_False.prototype = Object.create(PredicateBlock.prototype);
B_False.prototype.constructor = B_False;
/* Result is false. */
B_False.prototype.startAction=function(){
	return new ExecutionStatusResult(new BoolData(false));
};



function B_LetterOf(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"letter"));
	this.addPart(new NumSlot(this,"NumS_idx",1,true,true));
	this.addPart(new LabelText(this,"of"));
	this.addPart(new StringSlot(this,"StrS_text","world"));
}
B_LetterOf.prototype = Object.create(ReporterBlock.prototype);
B_LetterOf.prototype.constructor = B_LetterOf;
/* Result is nth letter of word. Makes n and integer in range. Always valid. */
B_LetterOf.prototype.startAction=function(){
	var word=this.slots[1].getData().getValue();
	var index=this.slots[0].getData().getValueInR(1,word.length,true,true);
	if(word.length>0) {
		return new ExecutionStatusResult(StringData(word.substring(index - 1, index)));
	}
	else{
		return new ExecutionStatusResult(StringData("")); //Letter of empty string is empty string.
	}
};



function B_LengthOf(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"length of"));
	this.addPart(new StringSlot(this,"StrS_text","world"));
}
B_LengthOf.prototype = Object.create(ReporterBlock.prototype);
B_LengthOf.prototype.constructor = B_LengthOf;
/* Result is length of word. Always valid. */
B_LengthOf.prototype.startAction=function(){
	var word=this.slots[0].getData().getValue();
	return new ExecutionStatusResult(new NumData(word.length));
};



function B_join(x,y){
	ReporterBlock.call(this,x,y,"operators",Block.returnTypes.string);
	this.addPart(new LabelText(this,"join"));
	this.addPart(new StringSlot(this,"StrS_1","hello "));
	this.addPart(new LabelText(this,"and"));
	this.addPart(new StringSlot(this,"StrS_2","world"));
}
B_join.prototype = Object.create(ReporterBlock.prototype);
B_join.prototype.constructor = B_join;
/* Result is Slots concatenated. Always valid. */
B_join.prototype.startAction=function(){
	var word1=this.slots[0].getData().getValue();
	var word2=this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new StringData(word1+word2));
};



function B_Split(x,y){
	ReporterBlock.call(this,x,y,"operators",Block.returnTypes.list);
	this.addPart(new LabelText(this,"split"));
	this.addPart(new StringSlot(this,"StrS_1","hello world"));
	this.addPart(new LabelText(this,"by"));
	var dS=new DropSlot(this,"DS_separator",Slot.snapTypes.numStrBool);
	dS.addOption("Enter text",new SelectionData("enter_text"));
	dS.addOption("letter",new SelectionData("letter"));
	dS.addOption("whitespace",new SelectionData("whitespace"));
	dS.setSelectionData("whitespace",new SelectionData("whitespace"));
	this.addPart(dS);
}
B_Split.prototype = Object.create(ReporterBlock.prototype);
B_Split.prototype.constructor = B_Split;
/* Returns a list made from splitting the string by the provided character. */
B_Split.prototype.startAction=function(){
	var string1=this.slots[0].getData().getValue();
	var splitD=this.slots[1].getData();
	var resultArray;
	if(splitD.type==Data.types.string){
		var splitStr=splitD.getValue();
		resultArray=string1.split(splitStr);
	}
	else if(splitD.type==Data.types.selection){
		var selection=splitD.getValue();
		if(selection=="letter"){
			resultArray=string1.split("");
		}
		else if(selection=="whitespace"){
			resultArray=string1.split(/\s+/);
		}
	}
	else{
		resultArray=[];
	}
	var dataArray=new Array(resultArray.length);
	for(var i=0;i<resultArray.length;i++){
		dataArray[i]=new StringData(resultArray[i]);
	}
	return new ExecutionStatusResult(new ListData(dataArray));
};



function B_IsAType(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"is"));
	this.addPart(new RectSlot(this,"RectS_item",Slot.snapTypes.any,Slot.outputTypes.any,"5"));
	this.addPart(new LabelText(this,"a"));
	var dS=new DropSlot(this,"DS_type",Slot.snapTypes.none);
	dS.addOption("number",new SelectionData("number"));
	dS.addOption("text",new SelectionData("text"));
	dS.addOption("boolean",new SelectionData("boolean"));
	dS.addOption("list",new SelectionData("list"));
	dS.addOption("invalid number",new SelectionData("invalid_num"));
	dS.setSelectionData("number",new SelectionData("number"));
	this.addPart(dS);
	this.addPart(new LabelText(this,"?"));
}
B_IsAType.prototype = Object.create(PredicateBlock.prototype);
B_IsAType.prototype.constructor = B_IsAType;
/* Result is Slots concatenated. Always valid. */
B_IsAType.prototype.startAction=function(){
	var data=this.slots[0].getData();
	var selectionD=this.slots[1].getData();
	var selection=selectionD.getValue();
	if(selectionD.type==Data.types.string){
		if(selection=="invalid number"){
			selection="invalid_num";
		}
	}
	var types=Data.types;
	if(selection=="number"){
		if(data.type==types.num&&data.isValid){
			return new ExecutionStatusResult(new BoolData(true));
		}
		else if(data.type==types.string&&data.isNumber()){
			return new ExecutionStatusResult(new BoolData(true));
		}
		else{
			return new ExecutionStatusResult(new BoolData(false));
		}
	}
	else if(selection=="text"){
		return new ExecutionStatusResult(new BoolData(data.type==types.string&&!data.isNumber()));
	}
	else if(selection=="boolean"){
		return new ExecutionStatusResult(new BoolData(data.type==types.bool));
	}
	else if(selection=="list"){
		return new ExecutionStatusResult(new BoolData(data.type==types.list));
	}
	else if(selection=="invalid_num"){
		if(data.type==types.num&&!data.isValid){
			return new ExecutionStatusResult(new BoolData(true));
		}
		else if(data.type==types.string&&data.getValue()==(new NumData(0/0).asString().getValue())){
			return new ExecutionStatusResult(new BoolData(true));
		}
		else{
			return new ExecutionStatusResult(new BoolData(false));
		}
	}
	else{
		return new ExecutionStatusResult(new BoolData(false));
	}
};



function B_mathOfNumber(x,y){
	ReporterBlock.call(this,x,y,"operators");
	var dS=new DropSlot(this,"DS_operation",null,Slot.snapTypes.bool);
	dS.addOption("sin",new SelectionData("sin"));
	dS.addOption("cos",new SelectionData("cos"));
	dS.addOption("tan",new SelectionData("tan"));

	dS.addOption("asin",new SelectionData("asin"));
	dS.addOption("acos",new SelectionData("acos"));
	dS.addOption("atan",new SelectionData("atan"));

	dS.addOption("ln",new SelectionData("ln"));
	dS.addOption("e^",new SelectionData("e^"));
	dS.addOption("ceiling",new SelectionData("ceiling"));

	dS.addOption("log",new SelectionData("log"));
	dS.addOption("10^",new SelectionData("10^"));
	dS.addOption("floor",new SelectionData("floor"));

	dS.addOption("abs",new SelectionData("abs"));
	dS.addOption("sqrt",new SelectionData("sqrt"));

	dS.dropColumns=3;
	dS.setSelectionData("sqrt",new SelectionData("sqrt"));
	this.addPart(dS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new NumSlot(this,"NumS_val",10));
}
B_mathOfNumber.prototype = Object.create(ReporterBlock.prototype);
B_mathOfNumber.prototype.constructor = B_mathOfNumber;
B_mathOfNumber.prototype.startAction=function(){
	var operator=this.slots[0].getData().getValue();
	var data=this.slots[1].getData();
	var value=data.getValue();
	var isValid=data.isValid;
	if(operator=="sin"){
		value=Math.sin(value/180*Math.PI);
	}
	else if(operator=="cos"){
		value=Math.cos(value/180*Math.PI);
	}
	else if(operator=="tan"){
		value=Math.tan(value/180*Math.PI);
		if(Math.abs(value)>1000000000){
			value=1/0;
		}
	}
	else if(operator=="asin"){
		value=Math.asin(value)/Math.PI*180;
	}
	else if(operator=="acos"){
		value=Math.acos(value)/Math.PI*180;
	}
	else if(operator=="atan"){
		value=Math.atan(value)/Math.PI*180;
	}
	else if(operator=="ln"){
		value=Math.log(value);
	}
	else if(operator=="log") {
		try {
			value = Math.log10(value);
		}
		catch(e){
			value=Math.log(10) / Math.log(value);
		}
	}
	else if(operator=="e^"){
		value=Math.exp(value);
	}
	else if(operator=="10^"){
		value=Math.pow(10,value);
	}
	else if(operator=="ceiling"){
		value=Math.ceil(value);
	}
	else if(operator=="floor"){
		value=Math.floor(value);
	}
	else if(operator=="abs"){
		value=Math.abs(value);
	}
	else if(operator=="sqrt"){
		value=Math.sqrt(value);
	}
	if(!isFinite(value)||isNaN(value)){
		value=0;
		isValid=false;
	}
	return new ExecutionStatusResult(new NumData(value,isValid));
};
/* This file contains the implementations for Blocks in the tablet category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */

function B_DeviceShaken(x,y){
	PredicateBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"Device Shaken"));
}
B_DeviceShaken.prototype = Object.create(PredicateBlock.prototype);
B_DeviceShaken.prototype.constructor = B_DeviceShaken;
/* Make the request. */
B_DeviceShaken.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/shake";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
/* Wait for the request to finish. */
B_DeviceShaken.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			return new ExecutionStatusResult(new BoolData(status.result=="1",true));
		}
		else{
			return new ExecutionStatusResult(new BoolData(false,false)); //false is default.
		}
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_DeviceSSID(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.string);
	this.addPart(new LabelText(this,"Device SSID"));
}
B_DeviceSSID.prototype = Object.create(ReporterBlock.prototype);
B_DeviceSSID.prototype.constructor = B_DeviceSSID;
/* Make the request. */
B_DeviceSSID.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/ssid";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
/* Wait for the request to finish. */
B_DeviceSSID.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			return new ExecutionStatusResult(new StringData(status.result,true));
		}
		else{
			return new ExecutionStatusResult(new StringData("",false)); //"" is default.
		}
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_DevicePressure(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"Device Pressure"));
}
B_DevicePressure.prototype = Object.create(ReporterBlock.prototype);
B_DevicePressure.prototype.constructor = B_DevicePressure;
/* Make the request. */
B_DevicePressure.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/pressure";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
/* Wait for the request to finish. */
B_DevicePressure.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result=parseFloat(status.result);
			return new ExecutionStatusResult(new NumData(result,true));
		}
		else{
			return new ExecutionStatusResult(new NumData(0,false)); //0 is default.
		}
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};
Block.setDisplaySuffix(B_DevicePressure, "kPa");


function B_DeviceRelativeAltitude(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"Device Relative Altitude"));
}
B_DeviceRelativeAltitude.prototype = Object.create(ReporterBlock.prototype);
B_DeviceRelativeAltitude.prototype.constructor = B_DeviceRelativeAltitude;
/* Make the request. */
B_DeviceRelativeAltitude.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/altitude";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
/* Wait for the request to finish. */
B_DeviceRelativeAltitude.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result=parseFloat(status.result);
			return new ExecutionStatusResult(new NumData(result,true));
		}
		else{
			return new ExecutionStatusResult(new NumData(0,false)); //0 is default.
		}
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};
Block.setDisplaySuffix(B_DeviceRelativeAltitude, "m");



function B_DeviceOrientation(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.string);
	this.addPart(new LabelText(this,"Device Orientation"));
}
B_DeviceOrientation.prototype = Object.create(ReporterBlock.prototype);
B_DeviceOrientation.prototype.constructor = B_DeviceOrientation;
/* Make the request. */
B_DeviceOrientation.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/orientation";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
/* Wait for the request to finish. */
B_DeviceOrientation.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			return new ExecutionStatusResult(new StringData(status.result,true));
		}
		else{
			return new ExecutionStatusResult(new StringData("",false)); //"" is default.
		}
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_DeviceAcceleration(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.num);
	this.addPart(new LabelText(this,"Device"));
	var dS=new DropSlot(this,"DS_axis");
	dS.addOption("X",new SelectionData(0));
	dS.addOption("Y",new SelectionData(1));
	dS.addOption("Z",new SelectionData(2));
	dS.addOption("Total",new SelectionData("total"));
	dS.setSelectionData("X",new SelectionData(0));
	this.addPart(dS);
	this.addPart(new LabelText(this,"Acceleration"));
}
B_DeviceAcceleration.prototype = Object.create(ReporterBlock.prototype);
B_DeviceAcceleration.prototype.constructor = B_DeviceAcceleration;
/* Make the request. */
B_DeviceAcceleration.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/acceleration";
	mem.requestStatus=function(){};
	mem.axis=this.slots[0].getData().getValue();
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
/* Wait for the request to finish. Then get the correct axis. */
B_DeviceAcceleration.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var parts = status.result.split(" ");
			var result;
			if(mem.axis == "total") {
				let x = parseFloat(parts[0]);
				let y = parseFloat(parts[1]);
				let z = parseFloat(parts[2]);
				result = Math.sqrt(x*x + y*y + z*z);
			} else {
				result = parseFloat(parts[mem.axis]);
			}
			return new ExecutionStatusResult(new NumData(result,true));
		}
		else{
			return new ExecutionStatusResult(new NumData(0,false)); //0 is default.
		}
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};
Block.setDisplaySuffix(B_DeviceAcceleration, "m/s" + String.fromCharCode(178));


function B_DeviceLocation(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.num);
	this.addPart(new LabelText(this,"Device"));
	var dS=new DropSlot(this,"DS_dir");
	dS.addOption("Latitude",new SelectionData(0));
	dS.addOption("Longitude",new SelectionData(1));
	dS.setSelectionData("Latitude",new SelectionData(0));
	this.addPart(dS);
}
B_DeviceLocation.prototype = Object.create(ReporterBlock.prototype);
B_DeviceLocation.prototype.constructor = B_DeviceLocation;
/* Make the request. */
B_DeviceLocation.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "tablet/location";
	mem.requestStatus=function(){};
	mem.axis=this.slots[0].getData().getValue();
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
/* Wait for the request to finish. Then get the correct axis. */
B_DeviceLocation.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		if(status.error==false){
			var result = status.result.split(" ")[mem.axis];
			return new ExecutionStatusResult(new NumData(parseFloat(result),true));
		}
		else{
			return new ExecutionStatusResult(new NumData(0,false)); //0 is default.
		}
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};
/////////////////


function B_Display(x,y){
	CommandBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"Display"));
	this.addPart(new StringSlot(this,"StrS_msg","hello"));
}
B_Display.prototype = Object.create(CommandBlock.prototype);
B_Display.prototype.constructor = B_Display;
B_Display.prototype.startAction=function(){
	var message=this.slots[0].getData().getValue();
	DisplayBox.displayText(message);
	return new ExecutionStatusDone(); //Done running
};







//@fix Write documentation.
function B_PlaySound(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"play sound"));
	var dS=new SoundDropSlot(this,"SDS_1");
	for(var i=0;i<Sounds.getSoundCount();i++){
		dS.addOption(Sounds.getSoundName(i),new SelectionData(Sounds.getSoundName(i)));
	}
	this.addPart(dS);
}
B_PlaySound.prototype = Object.create(CommandBlock.prototype);
B_PlaySound.prototype.constructor = B_PlaySound;
B_PlaySound.prototype.startAction=function(){
	var soundData=this.slots[0].getData();
	if(soundData==null){
		return new ExecutionStatusDone();
	}
	var soundName=soundData.getValue();
	if(Sounds.checkNameIsValid(soundName)){
		var mem=this.runMem;
		mem.request = "sound/play?filename="+soundName;
		mem.requestStatus=function(){};
		HtmlServer.sendRequest(mem.request,mem.requestStatus);
		return new ExecutionStatusRunning(); //Still running
	}
	return new ExecutionStatusDone();
};
/* Wait for the request to finish. */
B_PlaySound.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};

function B_PlaySoundUntilDone(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"play sound until done"));
	var dS=new SoundDropSlot(this,"SDS_1");
	for(var i=0;i<Sounds.getSoundCount();i++){
		dS.addOption(Sounds.getSoundName(i),new SelectionData(Sounds.getSoundName(i)));
	}
	this.addPart(dS);
}
B_PlaySoundUntilDone.prototype = Object.create(CommandBlock.prototype);
B_PlaySoundUntilDone.prototype.constructor = B_PlaySoundUntilDone;
B_PlaySoundUntilDone.prototype.startAction=function(){
	var soundData=this.slots[0].getData();
	if(soundData==null){
		return new ExecutionStatusDone();
	}
	var soundName=soundData.getValue();
	var soundIndex=Sounds.indexFromName(soundName);
	if(soundIndex>=0){
		var mem=this.runMem;
		mem.soundDuration=Sounds.getSoundDuration(soundIndex);
        mem.timerStarted=false;
		mem.request = "sound/play?filename="+soundName;
		mem.cancel=false;
		mem.requestStatus=function(){};
		HtmlServer.sendRequest(mem.request,mem.requestStatus);
		return new ExecutionStatusRunning(); //Still running
	}
	return new ExecutionStatusDone();
};
/* Wait for the request to finish. */
B_PlaySoundUntilDone.prototype.updateAction=function(){
	var mem=this.runMem;
	if(mem.cancel){
		return new ExecutionStatusDone();
	}
	if(!mem.timerStarted){
		var status=mem.requestStatus;
		if(status.finished==true){
			mem.startTime=new Date().getTime();
			mem.timerStarted=true;
		}
		else{
			return new ExecutionStatusRunning(); //Still running
		}
	}
	if(new Date().getTime() >= (mem.startTime+mem.soundDuration)){
        return new ExecutionStatusDone(); //Done running
	}
	else{
        return new ExecutionStatusRunning(); //Still running
	}
};
B_PlaySoundUntilDone.prototype.stopAllSounds=function(){
	if(this.runMem!=null) {
		this.runMem.cancel = true;
	}
};


function B_StopAllSounds(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"stop all sounds"));
}
B_StopAllSounds.prototype = Object.create(CommandBlock.prototype);
B_StopAllSounds.prototype.constructor = B_StopAllSounds;
B_StopAllSounds.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "sound/stop";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
B_StopAllSounds.prototype.updateAction=function(){
	return !this.runMem.requestStatus.finished;
};


function B_RestForBeats(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"rest for"));
	this.addPart(new NumSlot(this,"NumS_dur",0.2,true)); //Positive
	this.addPart(new LabelText(this,"beats"));
}
B_RestForBeats.prototype = Object.create(CommandBlock.prototype);
B_RestForBeats.prototype.constructor = B_RestForBeats;
B_RestForBeats.prototype.startAction=function(){
	var mem=this.runMem;
	mem.startTime=new Date().getTime();
	var beats=this.slots[0].getData().getValueWithC(true); //Positive
	mem.delayTime=CodeManager.beatsToMs(beats);
	return new ExecutionStatusRunning(); //Still running
};
B_RestForBeats.prototype.updateAction=function(){
	var mem=this.runMem;
	if(new Date().getTime()>=mem.startTime+mem.delayTime){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};


function B_PlayNoteForBeats(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"play note"));
	this.addPart(new NumSlot(this,"NumS_note",60,true,true)); //Positive integer
	this.addPart(new LabelText(this,"for"));
	this.addPart(new NumSlot(this,"NumS_dur",1,true)); //Positive
	this.addPart(new LabelText(this,"beats"));
}
B_PlayNoteForBeats.prototype = Object.create(CommandBlock.prototype);
B_PlayNoteForBeats.prototype.constructor = B_PlayNoteForBeats;
B_PlayNoteForBeats.prototype.startAction=function(){
	var mem=this.runMem;
	var note=this.slots[0].getData().getValueWithC(true,true);
	var beats=this.slots[1].getData().getValueWithC(true); //Positive
	mem.soundDuration=CodeManager.beatsToMs(beats);
	mem.request = "sound/note?note="+note+"&duration="+mem.soundDuration;
	mem.timerStarted=false;
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
B_PlayNoteForBeats.prototype.updateAction=function(){
	var mem=this.runMem;
	if(!mem.timerStarted){
		var status=mem.requestStatus;
		if(status.finished==true){
			mem.startTime=new Date().getTime();
			mem.timerStarted=true;
		}
		else{
			return new ExecutionStatusRunning(); //Still running
		}
	}
	if(new Date().getTime()>=mem.startTime+mem.soundDuration){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};

function B_ChangeTempoBy(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"change tempo by"));
	this.addPart(new NumSlot(this,"NumS_amt",20));
}
B_ChangeTempoBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeTempoBy.prototype.constructor = B_ChangeTempoBy;
B_ChangeTempoBy.prototype.startAction=function(){
	var slotData=this.slots[0].getData();
	if(slotData.isValid) {
		var newTempo = CodeManager.sound.tempo +slotData.getValue();
		CodeManager.setSoundTempo(newTempo);
	}
	return new ExecutionStatusDone();
};

function B_SetTempoTo(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"set tempo to"));
	this.addPart(new NumSlot(this,"NumS_tempo",60,true)); //Positive
	this.addPart(new LabelText(this,"bpm"));
}
B_SetTempoTo.prototype = Object.create(CommandBlock.prototype);
B_SetTempoTo.prototype.constructor = B_SetTempoTo;
B_SetTempoTo.prototype.startAction=function(){
	var slotData=this.slots[0].getData();
	if(slotData.isValid) {
		var newTempo = slotData.getValue();
		CodeManager.setSoundTempo(newTempo);
	}
	return new ExecutionStatusDone();
};

function B_Tempo(x,y){
	ReporterBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"tempo"));
}
B_Tempo.prototype = Object.create(ReporterBlock.prototype);
B_Tempo.prototype.constructor = B_Tempo;
B_Tempo.prototype.startAction=function(){
	return new ExecutionStatusResult(new NumData(CodeManager.sound.tempo));
};

//@fix Write documentation.

function B_Variable(x,y,variable){
	ReporterBlock.call(this,x,y,"variables",Block.returnTypes.string);
	if (variable != null) {
		this.variable=variable;
		this.addPart(new LabelText(this,this.variable.getName()));
	}
}
B_Variable.prototype = Object.create(ReporterBlock.prototype);
B_Variable.prototype.constructor = B_Variable;
B_Variable.prototype.startAction=function(){
	return new ExecutionStatusResult(this.variable.getData());
};
B_Variable.prototype.createXml=function(xmlDoc){
	var block=XmlWriter.createElement(xmlDoc,"block");
	XmlWriter.setAttribute(block,"type",this.blockTypeName);
	XmlWriter.setAttribute(block,"variable",this.variable.getName());
	return block;
};
B_Variable.prototype.setVar=function(variable){
	if (variable != null) {
		this.variable=variable;
		this.addPart(new LabelText(this,this.variable.getName()));
	}
}
B_Variable.prototype.renameVar=function(){
	this.variable.rename();	
};
B_Variable.prototype.deleteVar=function(){
	this.variable.delete();
};
B_Variable.prototype.renameVariable=function(variable){
	if(variable==this.variable){
		this.parts[0].remove();
		this.parts[0]=new LabelText(this,this.variable.getName());
		if(this.stack!=null){
			this.stack.updateDim();
		}
	}
};
B_Variable.prototype.deleteVariable=function(variable){
	if(variable==this.variable){
		this.unsnap().delete();
	}
};
B_Variable.prototype.checkVariableUsed=function(variable){
	if(variable==this.variable){
		return new ExecutionStatusRunning();
	}
	return new ExecutionStatusDone();
};
B_Variable.importXml=function(blockNode){
	var variableName=XmlWriter.getAttribute(blockNode,"variable");
	var variable=CodeManager.findVar(variableName);
	if(variable!=null){
		return new B_Variable(0,0,variable);
	}
	return null;
};




function B_SetTo(x,y){
	CommandBlock.call(this,x,y,"variables");
	this.addPart(new LabelText(this,"set"));
	this.addPart(new VarDropSlot(this,"VDS_1"));
	this.addPart(new LabelText(this,"to"));
	var rS=new RoundSlot(this,"RndS_val",Slot.snapTypes.numStrBool,Slot.outputTypes.any,new NumData(0));
	rS.addOption("Enter text",new SelectionData("enter_text"));
	this.addPart(rS);
}
B_SetTo.prototype = Object.create(CommandBlock.prototype);
B_SetTo.prototype.constructor = B_SetTo;
B_SetTo.prototype.startAction=function(){
	var variableD=this.slots[0].getData();
	var data=this.slots[1].getData();
	var type=data.type;
	var types=Data.types;
	if(type==types.bool||type==types.num||type==types.string) {
		if (variableD != null && variableD.type == Data.types.selection) {
			var variable = variableD.getValue();
			variable.setData(data);
		}
	}
	return new ExecutionStatusDone();
};



function B_ChangeBy(x,y){
	CommandBlock.call(this,x,y,"variables");
	this.addPart(new LabelText(this,"change"));
	this.addPart(new VarDropSlot(this,"VDS_1"));
	this.addPart(new LabelText(this,"by"));
	this.addPart(new NumSlot(this,"NumS_val",1));
}
B_ChangeBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeBy.prototype.constructor = B_ChangeBy;
B_ChangeBy.prototype.startAction=function(){
	var variableD=this.slots[0].getData();
	var incrementD=this.slots[1].getData();
	if(variableD != null && variableD.type == Data.types.selection){
		var variable=variableD.getValue();
		var currentD=variable.getData().asNum();
		var newV=incrementD.getValue()+currentD.getValue();
		var isValid=currentD.isValid&&incrementD.isValid;
		var newD=new NumData(newV,isValid);
		variable.setData(newD);
	}
	return new ExecutionStatusDone();
};


//Done
function B_List(x,y,list){
	ReporterBlock.call(this,x,y,"lists",Block.returnTypes.string);
	if (list != null) {
		this.list=list;
		this.addPart(new LabelText(this,this.list.getName()));
	}
}
B_List.prototype = Object.create(ReporterBlock.prototype);
B_List.prototype.constructor = B_List;
B_List.prototype.startAction=function(){
	return new ExecutionStatusResult(this.list.getData().asString());
};
B_List.prototype.createXml=function(xmlDoc){
	var block=XmlWriter.createElement(xmlDoc,"block");
	XmlWriter.setAttribute(block,"type",this.blockTypeName);
	XmlWriter.setAttribute(block,"list",this.list.getName());
	return block;
};
B_List.prototype.setList=function(list){
	if (list != null) {
		this.list=list;
		this.addPart(new LabelText(this,this.list.getName()));
	}
}
B_List.importXml=function(blockNode){
	var listName=XmlWriter.getAttribute(blockNode,"list");
	var list=CodeManager.findList(listName);
	if(list!=null){
		return new B_List(0,0,list);
	}
	return null;
};
B_List.prototype.renameLi=function(){
	this.list.rename();
};
B_List.prototype.deleteLi=function(){
	this.list.delete();
};
B_List.prototype.renameList=function(list){
	if(list==this.list){
		this.parts[0].remove();
		this.parts[0]=new LabelText(this,this.list.getName());
		if(this.stack!=null){
			this.stack.updateDim();
		}
	}
};
B_List.prototype.deleteList=function(list){
	if(list==this.list){
		this.unsnap().delete();
	}
};
B_List.prototype.checkListUsed=function(list){
	if(list==this.list){
		return new ExecutionStatusRunning();
	}
	return new ExecutionStatusDone();
};


//Done
function B_AddToList(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"add"));
	this.addPart(new RectSlot(this,"RectS_item",Slot.snapTypes.numStrBool,Slot.outputTypes.any,"thing"));
	this.addPart(new LabelText(this,"to"));
	this.addPart(new ListDropSlot(this,"LDS_1"));
}
B_AddToList.prototype = Object.create(CommandBlock.prototype);
B_AddToList.prototype.constructor = B_AddToList;
B_AddToList.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	if(listD!=null&&listD.type == Data.types.selection){
		var list=listD.getValue();
		var array=list.getData().getValue();
		var itemD=this.slots[0].getData();
		if(itemD.isValid){
			array.push(itemD);
		}
		else{
			array.push(itemD.asString());
		}
	}
	return new ExecutionStatusDone();
};


//Done
function B_DeleteItemOfList(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"delete"));
	var nS=new NumSlot(this,"NumS_idx",1,true,true);
	nS.addOption("last",new SelectionData("last"));
	nS.addOption("random",new SelectionData("random"));
	nS.addOption("all",new SelectionData("all"));
	this.addPart(nS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new ListDropSlot(this,"LDS_1"));
}
B_DeleteItemOfList.prototype = Object.create(CommandBlock.prototype);
B_DeleteItemOfList.prototype.constructor = B_DeleteItemOfList;
B_DeleteItemOfList.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	if(listD!=null&&listD.type == Data.types.selection){
		var indexD=this.slots[0].getData();
		var list=listD.getValue();
		var listData=list.getData();
		var array=listData.getValue();
		if(indexD.type==Data.types.selection&&indexD.getValue()=="all"){
			list.setData(new ListData());
		}
		else {
			var index = listData.getIndex(indexD);
			if (index != null) {
				array.splice(index, 1);
			}
		}
	}
	return new ExecutionStatusDone();
};


//Done
function B_InsertItemAtOfList(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"insert"));
	this.addPart(new RectSlot(this,"RectS_item",Slot.snapTypes.numStrBool,Slot.outputTypes.any,"thing"));
	this.addPart(new LabelText(this,"at"));
	var nS=new NumSlot(this,"NumS_idx",1,true,true);
	nS.addOption("last",new SelectionData("last"));
	nS.addOption("random",new SelectionData("random"));
	this.addPart(nS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new ListDropSlot(this,"LDS_1"));
}
B_InsertItemAtOfList.prototype = Object.create(CommandBlock.prototype);
B_InsertItemAtOfList.prototype.constructor = B_InsertItemAtOfList;
B_InsertItemAtOfList.prototype.startAction=function(){
	var listD=this.slots[2].getData();
	if(listD!=null&&listD.type == Data.types.selection){
		var indexD=this.slots[1].getData();
		var list=listD.getValue();
		var listData=list.getData();
		var array=listData.getValue();
		var itemD=this.slots[0].getData();
		var index=listData.getIndex(indexD);
		if(index==null||indexD.getValue()>array.length){
			if(indexD.type==Data.types.num&&indexD.getValue()>array.length){
				if(itemD.isValid){
					array.push(itemD);
				}
				else{
					array.push(itemD.asString());
				}
			}
			return new ExecutionStatusDone();
		}
		if(itemD.isValid){
			array.splice(index, 0, itemD);
		}
		else{
			array.splice(index, 0, itemD.asString());
		}
	}
	return new ExecutionStatusDone();
};


//Done
function B_ReplaceItemOfListWith(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"replace item"));
	var nS=new NumSlot(this,"NumS_idx",1,true,true);
	nS.addOption("last",new SelectionData("last"));
	nS.addOption("random",new SelectionData("random"));
	this.addPart(nS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new ListDropSlot(this,"LDS_1"));
	this.addPart(new LabelText(this,"with"));
	this.addPart(new RectSlot(this,"RectS_item",Slot.snapTypes.numStrBool,Slot.outputTypes.any,"thing"));
}
B_ReplaceItemOfListWith.prototype = Object.create(CommandBlock.prototype);
B_ReplaceItemOfListWith.prototype.constructor = B_ReplaceItemOfListWith;
B_ReplaceItemOfListWith.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	if(listD!=null&&listD.type == Data.types.selection){
		var indexD=this.slots[0].getData();
		var list=listD.getValue();
		var listData=list.getData();
		var array=listData.getValue();
		var itemD=this.slots[2].getData();
		var index=listData.getIndex(indexD);
		if(index==null){
			return new ExecutionStatusDone();
		}
		if(itemD.isValid){
			array[index]=itemD;
		}
		else{
			array[index]=itemD.asString();
		}
	}
	return new ExecutionStatusDone();
};



function B_CopyListToList(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"copy"));
	this.addPart(new ListDropSlot(this,"LDS_from",Slot.snapTypes.list));
	this.addPart(new LabelText(this,"to"));
	this.addPart(new ListDropSlot(this,"LDS_to"));
}
B_CopyListToList.prototype = Object.create(CommandBlock.prototype);
B_CopyListToList.prototype.constructor = B_CopyListToList;
B_CopyListToList.prototype.startAction=function(){
	var listD1=this.slots[0].getData();
	var listD2=this.slots[1].getData();
	if(listD1!=null&&listD2!=null){
		var listDataToCopy;
		if(listD1.type==Data.types.selection){
			listDataToCopy=listD1.getValue().getData();
		}
		else if(listD1.type==Data.types.list){
			listDataToCopy=listD1;
		}
		else{
			return new ExecutionStatusDone();
		}
		if(listD2.type==Data.types.selection){
			var listToCopyTo=listD2.getValue();
			listToCopyTo.setData(listDataToCopy.duplicate());
		}
	}
	return new ExecutionStatusDone();
};



//Done
function B_ItemOfList(x,y){
	ReporterBlock.call(this,x,y,"lists",Block.returnTypes.string);
	this.addPart(new LabelText(this,"item"));
	var nS=new NumSlot(this,"NumS_idx",1,true,true);
	nS.addOption("last",new SelectionData("last"));
	nS.addOption("random",new SelectionData("random"));
	this.addPart(nS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new ListDropSlot(this,"LDS_1",Slot.snapTypes.list));
}
B_ItemOfList.prototype = Object.create(ReporterBlock.prototype);
B_ItemOfList.prototype.constructor = B_ItemOfList;
B_ItemOfList.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	var indexD;
	if(listD!=null&&listD.type == Data.types.selection) {
		indexD = this.slots[0].getData();
		var list = listD.getValue();
		var listData=list.getData();
		return new ExecutionStatusResult(this.getItemOfList(listData,indexD));
	}
	else if(listD!=null&&listD.type == Data.types.list){
		indexD = this.slots[0].getData();
		return new ExecutionStatusResult(this.getItemOfList(listD,indexD));
	}
	else {
		return new ExecutionStatusResult(new StringData("", false));
	}
};
B_ItemOfList.prototype.getItemOfList=function(listData,indexD){
	var array = listData.getValue();
	var index=listData.getIndex(indexD);
	if(index==null){
		return new StringData("", false);
	}
	else {
		return array[index];
	}
};


//Done
function B_LengthOfList(x,y){
	ReporterBlock.call(this,x,y,"lists",Block.returnTypes.num);
	this.addPart(new LabelText(this,"length of"));
	this.addPart(new ListDropSlot(this,"LDS_1",Slot.snapTypes.list));
}
B_LengthOfList.prototype = Object.create(ReporterBlock.prototype);
B_LengthOfList.prototype.constructor = B_LengthOfList;
B_LengthOfList.prototype.startAction=function(){
	var listD=this.slots[0].getData();
	if(listD!=null&&listD.type == Data.types.selection) {
		var list = listD.getValue();
		var array = list.getData().getValue();
		return new ExecutionStatusResult(new NumData(array.length));
	}
	else if(listD!=null&&listD.type == Data.types.list){
		return new ExecutionStatusResult(new NumData(listD.getValue().length));
	}
	else {
		return new ExecutionStatusResult(new NumData(0,false));
	}
};


//Done
function B_ListContainsItem(x,y){
	PredicateBlock.call(this,x,y,"lists");
	this.addPart(new ListDropSlot(this,"LDS_1",Slot.snapTypes.list));
	this.addPart(new LabelText(this,"contains"));
	this.addPart(new RectSlot(this,"RectS_item",Slot.snapTypes.numStrBool,Slot.outputTypes.any,"thing"));
}
B_ListContainsItem.prototype = Object.create(PredicateBlock.prototype);
B_ListContainsItem.prototype.constructor = B_ListContainsItem;
B_ListContainsItem.prototype.startAction=function(){
	var listD=this.slots[0].getData();
	var itemD;
	if(listD!=null&&listD.type == Data.types.selection) {
		var list = listD.getValue();
		var listData=list.getData();
		itemD=this.slots[1].getData();
		return new ExecutionStatusResult(this.checkListContainsItem(listData,itemD));
	}
	else if(listD!=null&&listD.type == Data.types.list){
		itemD=this.slots[1].getData();
		return new ExecutionStatusResult(this.checkListContainsItem(listD,itemD));
	}
	else {
		return new ExecutionStatusResult(new BoolData(false,true));
	}
};
B_ListContainsItem.prototype.checkListContainsItem=function(listData,itemD){
	var array = listData.getValue();
	for(var i=0;i<array.length;i++){
		if(Data.checkEquality(itemD,array[i])){
			return new BoolData(true,true);
		}
	}
	return new BoolData(false,true);
};
function Test(){
	var stack1;
	stack1=new BlockStack(new b_whenFlagTapped(20,45));
	stack1=new BlockStack(new b_Repeat(20,105));
	stack1=new BlockStack(new b_IfElse(20,165));
	stack1=new BlockStack(new b_HummingbirdLed(20,225));
	stack1=new BlockStack(new b_HummingbirdTriLed(20,285));
	stack1=new BlockStack(new b_SayThis(20,345));
	stack1=new BlockStack(new b_Wait(20,405));
	stack1=new BlockStack(new b_WaitUntil(20,465));
	stack1=new BlockStack(new b_HummingbirdLight(20,525));
	stack1=new BlockStack(new b_HBTempC(20,585));
	
	stack1=new BlockStack(new b_SayForSecs(320,45));
	stack1=new BlockStack(new b_Say(320,75));
	stack1=new BlockStack(new b_ThinkForSecs(320,105));
	stack1=new BlockStack(new b_Think(320,135));
	stack1=new BlockStack(new b_ChangeSizeBy(320,165));
	stack1=new BlockStack(new b_SetSizeTo(320,195));
	stack1=new BlockStack(new b_Size(320,230));
	stack1=new BlockStack(new b_Show(320,255));
	stack1=new BlockStack(new b_Hide(320,285));
	stack1=new BlockStack(new b_GoToFront(320,315));
	stack1=new BlockStack(new b_GoBackLayers(320,345));
	stack1=new BlockStack(new b_HummingbirdLed(320,385));
	stack1=new BlockStack(new b_HummingbirdMotor(320,500));
	
	
	stack1=new BlockStack(new b_DeviceOrientation(620,45));
	stack1=new BlockStack(new b_Add(620,105));
	stack1=new BlockStack(new b_Subtract(620,165));
	stack1=new BlockStack(new b_Multiply(620,225));
	stack1=new BlockStack(new b_Divide(620,285));
	stack1=new BlockStack(new b_Round(620,345));
	stack1=new BlockStack(new b_PickRandom(620,405));
	stack1=new BlockStack(new b_LessThan(620,465));
	stack1=new BlockStack(new b_EqualTo(620,525));
	stack1=new BlockStack(new b_GreaterThan(620,585));
	
	stack1=new BlockStack(new b_And(920,45));
	stack1=new BlockStack(new b_Or(920,105));
	stack1=new BlockStack(new b_Not(920,165));
	stack1=new BlockStack(new b_True(920,225));
	stack1=new BlockStack(new b_False(920,285));
	stack1=new BlockStack(new b_LetterOf(920,345));
	stack1=new BlockStack(new b_LengthOf(920,405));
	stack1=new BlockStack(new b_LessThan(920,465));
	stack1=new BlockStack(new b_EqualTo(920,525));
	stack1=new BlockStack(new b_GreaterThan(920,585));
}
