/**
 * Created by Tom on 7/4/2017.
 */
function DropSlot(parent, key, inputType, snapType, data, nullable){
	if(inputType == null){
		inputType = EditableSlot.inputTypes.select;
	}
	if(snapType == null){
		snapType = Slot.snapTypes.none;
	}
	if(data == null) {
		DebugOptions.assert(nullable !== true);
		nullable = false;
		data = SelectionData.empty();
	} else if(nullable == null){
		nullable = false;
	}
	EditableSlot.call(this, parent, key, inputType, snapType, Slot.outputTypes.any, data);
	this.slotShape = new DropSlotShape(this, data.asString().getValue());
	this.slotShape.show();
	this.optionsList = [];
	this.nullable = nullable;
}
DropSlot.prototype = Object.create(EditableSlot.prototype);
DropSlot.prototype.constructor = DropSlot;
DropSlot.prototype.highlight = function(){ //TODO: fix BlockGraphics
	const isSlot = !this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
};
DropSlot.prototype.formatTextSummary = function(textSummary) {
	return "[" + textSummary + "]";
};
DropSlot.prototype.addEnterText = function(displayText){
	const option = {};
	option.displayText = displayText;
	option.isAction = true;
	this.optionsList.push(option);
};
DropSlot.prototype.addOption = function(data, displayText) {
	if(displayText == null){
		displayText = null;
	}
	const option = {};
	option.displayText = displayText;
	option.data = data;
	option.isAction = false;
	this.optionsList.push(option);
};
DropSlot.prototype.populatePad = function(selectPad){
	this.optionsList.forEach(function(option){
		if(option.isAction) {
			selectPad.addAction(option.displayText, function(callbackFn){
				const inputDialog = new InputDialog(this.parent.textSummary(this), true);
				inputDialog.show(this.slotShape, function(){}, function(data, cancelled){
					callbackFn(data, !cancelled);
				}, this.enteredData);
			}.bind(this)); //TODO: clean up edit text options
		} else {
			selectPad.addOption(option.data, option.displayText);
		}
	});
};
DropSlot.prototype.createInputSystem = function(){
	const x1 = this.getAbsX();
	const y1 = this.getAbsY();
	const x2 = this.relToAbsX(this.width);
	const y2 = this.relToAbsY(this.height);
	const inputPad = new NewInputPad(x1, x2, y1, y2); //TODO: Perhapse check if this.optionsList.length > 0

	const selectPad = new InputWidget.SelectPad();
	this.populatePad(selectPad);
	inputPad.addWidget(selectPad);

	return inputPad;
};
DropSlot.prototype.selectionDataFromValue = function(value){
	for(let i = 0; i < this.optionsList.length; i++) {
		const option = this.optionsList[i];
		if(option.data.getValue() === value) {
			return option.data;
		}
	}
};
DropSlot.prototype.sanitizeNonSelectionData = function(data){
	return data;
};
DropSlot.prototype.sanitizeData = function(data){
	data = EditableSlot.prototype.sanitizeData.call(this, data);
	if(data.isSelection()) {
		const value = data.getValue();
		if(value === "" && this.nullable) {
			return SelectionData.empty();
		}
		return this.selectionDataFromValue(value);
	}
	return this.sanitizeNonSelectionData(data);
};