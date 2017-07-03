/**
 * Created by Tom on 6/30/2017.
 */
function EditableSlot(parent, key, inputType, snapType, outputType, data){
	Slot.call(this, parent, key, snapType, outputType);
	this.inputType = inputType;
	this.enteredData = data;
	this.editing = false;
	//TODO: perhaps build the slot here?
}
EditableSlot.prototype = Object.create(Slot.prototype);
EditableSlot.prototype.constructor = EditableSlot;
EditableSlot.setConstants = function(){
	/* The type of Data which can be directly entered into the Slot. */
	EditableSlot.inputTypes = {};
	EditableSlot.inputTypes.any = 0;
	EditableSlot.inputTypes.num = 1;
	EditableSlot.inputTypes.string = 2;
	EditableSlot.inputTypes.select = 3;
};
EditableSlot.prototype.changeText = function(text, updateDim){
	this.slotShape.changeText(text);
	if(updateDim && this.parent.stack!=null) {
		this.parent.stack.updateDim(); //Update dimensions.
	}
};
EditableSlot.prototype.edit = function(){
	DebugOptions.assert(!this.hasChild);
	if(!this.editing){
		this.editing = true;
		this.slotShape.select();
		const inputSys = this.createInputSystem();
		inputSys.show(this.slotShape, this.updateEdit.bind(this), this.finishEdit.bind(this));
	}
};
EditableSlot.prototype.createInputSystem = function(){
	DebugOptions.markAbstract();
};
EditableSlot.prototype.updateEdit = function(visibleText, data){
	DebugOptions.assert(this.editing);
	this.enteredData = data;
	this.changeText(visibleText, true);
};
EditableSlot.prototype.finishEdit = function(data){
	DebugOptions.assert(this.editing);
	if(this.editing) {
		this.setData(data, false, true);
		this.slotShape.deselect();
		this.editing = false;
	}
};
EditableSlot.prototype.setData = function(data, sanitize, updateDim){
	if(sanitize){
		data = this.sanitizeData(data);
	}
	if(data == null) return;
	this.enteredData = data;
	this.changeText(this.enteredData.asString().getValue(), updateDim);
};
EditableSlot.prototype.sanitizeData = function(data) {
	const inputTypes = EditableSlot.inputTypes;
	if(this.inputType === inputTypes.string) {
		data = data.asString();
	}
	else if(this.inputType === inputTypes.num) {
		data = data.asNum();
	}
	else if(this.inputType === inputTypes.select) {
		data = data.asSelection();
	}
	if(data.isValid) {
		return data;
	}
	return null;
};
EditableSlot.prototype.textSummary = function(){
	let result = "...";
	if(!this.hasChild){ //If it has a child, just use an ellipsis.
		result = this.enteredData.asString().getValue();
	}
	return this.formatTextSummary(result);
};
EditableSlot.prototype.formatTextSummary = function(textSummary){
	DebugOptions.markAbstract();
};
EditableSlot.prototype.getDataNotFromChild = function(){
	return this.enteredData;
};
EditableSlot.prototype.createXml = function(xmlDoc){
	let slot = Slot.prototype.createXml.call(this, xmlDoc);
	let enteredData = XmlWriter.createElement(xmlDoc, "enteredData");
	enteredData.appendChild(this.enteredData.createXml(xmlDoc));
	slot.appendChild(enteredData);
	return slot;
};
EditableSlot.prototype.importXml=function(slotNode){
	Slot.prototype.importXml.call(this, slotNode);
	const enteredDataNode = XmlWriter.findSubElement(slotNode, "enteredData");
	const dataNode = XmlWriter.findSubElement(enteredDataNode, "data");
	if(dataNode != null){
		const data = Data.importXml(dataNode);
		if(data != null){
			this.setData(data, true, false);
		}
	}
	return this;
};
/**
 * @param {EditableSlot} slot
 */
EditableSlot.prototype.copyFrom = function(slot){
	Slot.prototype.copyFrom.call(this, slot);
	this.setData(slot.enteredData, false, false);
};