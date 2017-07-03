/**
 * Created by Tom on 7/3/2017.
 */
function NewRectSlot(parent, key, snapType, outputType, data){
	EditableSlot.call(this, parent, key, Slot.inputTypes.string, snapType, outputType, data);
	this.slotShape = new RectSlotShape(this, data.asString().getValue());
	this.slotShape.show();
}
NewRectSlot.prototype.highlight = function(){ //TODO: Fix BlockGraphics
	let isSlot = !this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
};
NewRectSlot.prototype.formatTextSummary = function(textSummary) {
	return "[" + textSummary + "]";
};
NewRectSlot.prototype.createInputSystem = function(){
	return new InputDialog(this.parent.textSummary(this));
};