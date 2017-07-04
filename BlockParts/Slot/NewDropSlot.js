/**
 * Created by Tom on 7/4/2017.
 */
function NewDropSlot(parent, key, inputType, snapType, data, nullable){
	if(inputType == null){
		inputType = EditableSlot.inputTypes.select;
	}
	if(snapType == null){
		snapType = Slot.snapTypes.none;
	}
	if(data == null) {
		DebugOptions.assert(nullable);
		data = SelectionData.empty();
	} else if(nullable == null){
		nullable = false;
	}
	EditableSlot.call(this, parent, key, inputType, snapType, Slot.outputTypes.any, data);
	this.slotShape = new DropSlotShape(this, "");
	this.slotShape.show();
	this.optionsList = [];
	this.nullable = nullable;
}
NewDropSlot.prototype = Object.create(EditableSlot.prototype);
NewDropSlot.prototype.constructor = NewDropSlot;
NewDropSlot.prototype.highlight = function(){ //TODO: fix BlockGraphics
	const isSlot = !this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
};
NewDropSlot.prototype.formatTextSummary = function(textSummary) {
	return "[" + textSummary + "]";
};
NewDropSlot.prototype.addEnterText = function(displayText){
	const option = {};
	option.displayText = displayText;
	option.isAction = true;
	this.optionsList.push(option);
};
NewDropSlot.prototype.addOption = function(data, displayText) {
	if(displayText == null){
		displayText = null;
	}
	const option = {};
	option.displayText = displayText;
	option.data = data;
	option.isAction = false;
	this.optionsList.push(option);
};
NewDropSlot.prototype.populatePad = function(selectPad){
	this.additionalOptions.forEach(function(option){
		if(option.isAction) {
			selectPad.addAction(option.displayText, function(callbackFn){
				const inputDialog = new InputDialog(this.textSummary(), true);
				inputDialog.show(this.slotShape, function(){}, function(data, cancelled){
					callbackFn(data, !cancelled);
				}, this.enteredData);
			}.bind(this)); //TODO: clean up edit text options
		} else {
			selectPad.addOption(option.data, option.displayText);
		}
	});
};
NewDropSlot.prototype.createInputSystem = function(){
	const x1 = this.getAbsX();
	const y1 = this.getAbsY();
	const x2 = this.relToAbsX(this.width);
	const y2 = this.relToAbsY(this.height);
	const inputPad = new NewInputPad(x1, x2, y1, y2);
	if(this.additionalOptions.length > 0) {
		const selectPad = new InputWidget.SelectPad();
		this.populatePad(selectPad);
		inputPad.addWidget(selectPad);
	}
	return inputPad;
};
NewDropSlot.prototype.selectionDataFromValue = function(value){
	this.optionsList.forEach(function(option){
		if(option.data.getValue() === value) {
			return option.data;
		}
	});
	return null;
};
NewDropSlot.prototype.sanitizeNonSelectionData = function(data){
	return data;
};
NewDropSlot.prototype.sanitizeData = function(data){
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