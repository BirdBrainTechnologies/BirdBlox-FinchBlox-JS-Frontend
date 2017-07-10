/**
 * Created by Tom on 7/3/2017.
 */
function RoundSlot(parent, key, inputType, snapType, outputType, data, positive, integer){
	EditableSlot.call(this, parent, key, inputType, snapType, outputType, data);
	this.slotShape = new RoundSlotShape(this, data.asString().getValue());
	this.slotShape.show();
	this.optionsList = [];
	this.positive = positive;
	this.integer = integer;
	this.labelText = "";
}
RoundSlot.prototype = Object.create(EditableSlot.prototype);
RoundSlot.prototype.constructor = RoundSlot;
RoundSlot.prototype.highlight=function(){
	const isSlot = !this.hasChild; //TODO: Fix! unclear.
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,1,isSlot);
};
RoundSlot.prototype.formatTextSummary = function(textSummary) {
	return "(" + textSummary + ")";
};
RoundSlot.prototype.addOption = function(data, displayText) {
	if(displayText == null){
		displayText = null;
	}
	const option = {};
	option.displayText = displayText;
	option.data = data;
	this.optionsList.push(option);
};
RoundSlot.prototype.populatePad = function(selectPad){
	this.optionsList.forEach(function(option){
		selectPad.addOption(option.data, option.displayText);
	});
};
RoundSlot.prototype.createInputSystem = function(){
	const x1 = this.getAbsX();
	const y1 = this.getAbsY();
	const x2 = this.relToAbsX(this.width);
	const y2 = this.relToAbsY(this.height);
	const inputPad = new NewInputPad(x1, x2, y1, y2);

	if(this.labelText !== "") {
		inputPad.addWidget(new InputWidget.Label(this.labelText));
	}

	const selectPad = new InputWidget.SelectPad();
	this.populatePad(selectPad);
	if(!selectPad.isEmpty()) {
		inputPad.addWidget(selectPad);
	}

	inputPad.addWidget(new InputWidget.NumPad(this.positive, this.integer));
	return inputPad;
};
RoundSlot.prototype.selectionDataFromValue = function(value){
	for(let i = 0; i < this.optionsList.length; i++) {
		const option = this.optionsList[i];
		if(option.data.getValue() === value) {
			return option.data;
		}
	}
	return null;
};
RoundSlot.prototype.sanitizeData = function(data){
	data = EditableSlot.prototype.sanitizeData.call(this, data);
	if(data == null) return null;
	if(data.isSelection()) {
		const value = data.getValue();
		return this.selectionDataFromValue(value);
	}
	return data;
};
RoundSlot.prototype.addLabelText = function(text){
	this.labelText = text;
};
RoundSlot.prototype.dataToString = function(data){
	let result = EditableSlot.prototype.dataToString.call(this, data);
	if(data.type === Data.types.string) {
		result = "\"" +result + "\"";
	}
	return result;
};