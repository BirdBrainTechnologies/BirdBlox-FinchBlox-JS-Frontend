/**
 * Created by Tom on 7/3/2017.
 */
function NewRoundSlot(parent, key, inputType, snapType, outputType, data, positive, integer){
	EditableSlot.call(this, parent, key, inputType, snapType, outputType, data);
	this.slotShape = new RoundSlotShape(this, data.asString().getValue());
	this.slotShape.show();
	this.additionalOptions = [];
	this.positive = positive;
	this.integer = integer;
}
NewRoundSlot.prototype = Object.create(EditableSlot.prototype);
NewRoundSlot.prototype.constructor = NewRoundSlot;
NewRoundSlot.prototype.highlight=function(){
	const isSlot = !this.hasChild; //TODO: Fix! unclear.
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,1,isSlot);
};
NewRoundSlot.prototype.formatTextSummary = function(textSummary) {
	return "(" + textSummary + ")";
};
NewRoundSlot.prototype.addOption = function(data, displayText) {
	if(displayText == null){
		displayText = null;
	}
	const option = {};
	option.displayText = displayText;
	option.data = data;
	this.additionalOptions.push(option);
};
NewRoundSlot.prototype.createInputSystem = function(){
	const x1 = this.getAbsX();
	const y1 = this.getAbsY();
	const x2 = this.relToAbsX(this.width);
	const y2 = this.relToAbsY(this.height);
	const inputPad = new NewInputPad(x1, x2, y1, y2);
	if(this.additionalOptions.length > 0) {
		const selectPad = new InputWidget.SelectPad();
		this.additionalOptions.forEach(function(option){
			selectPad.addOption(option.data, option.displayText);
		});
		inputPad.addWidget(selectPad);
	}
	inputPad.addWidget(new InputWidget.NumPad(this.positive, this.integer));
	return inputPad;
};
NewRoundSlot.prototype.selectionDataFromValue = function(value){
	this.optionsList.forEach(function(option){
		if(option.data.getValue() === value) {
			return option.data;
		}
	});
	return null;
};
NewRoundSlot.prototype.sanitizeData = function(data){
	data = EditableSlot.prototype.sanitizeData.call(this, data);
	if(data.isSelection()) {
		const value = data.getValue();
		return this.selectionDataFromValue(value);
	}
	return data;
};