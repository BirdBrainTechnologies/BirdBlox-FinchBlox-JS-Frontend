/**
 * Created by Tom on 7/3/2017.
 */
function NewRoundSlot(parent, key, inputType, snapType, outputType, data, positive, integer){
	//TODO: remove positive integer?
	EditableSlot.call(this, parent, key, inputType, snapType, outputType, data);
	this.slotShape = new RoundSlotShape(this, data.asString().getValue());
	this.slotShape.show();
	this.additionalOptions = [];
}
NewRoundSlot.prototype.highlight=function(){
	const isSlot = !this.hasChild; //TODO: Fix! unclear.
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,1,isSlot);
};
NewRoundSlot.prototype.formatTextSummary = function(textSummary) {
	return "(" + textSummary + ")";
};
NewRoundSlot.addOption = function(displayText, data) {
	const option = {};
	option.displayText = displayText;
	option.data = data;
	this.additionalOptions.push(option);
};
NewRectSlot.createInputSystem = function(){
	const inputPad = new New
};