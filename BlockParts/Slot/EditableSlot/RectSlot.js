/**
 * Created by Tom on 7/3/2017.
 */
function RectSlot(parent, key, snapType, outputType, data){
	EditableSlot.call(this, parent, key, EditableSlot.inputTypes.string, snapType, outputType, data);
	this.slotShape = new RectSlotShape(this, data.asString().getValue());
	this.slotShape.show();
}
RectSlot.prototype = Object.create(EditableSlot.prototype);
RectSlot.prototype.constructor = RectSlot;
RectSlot.prototype.highlight = function(){ //TODO: Fix BlockGraphics
	let isSlot = !this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
};
RectSlot.prototype.formatTextSummary = function(textSummary) {
	return "[" + textSummary + "]";
};
RectSlot.prototype.createInputSystem = function(){
	return new InputDialog(this.parent.textSummary(this), true);
};