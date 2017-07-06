/**
 * Created by Tom on 7/3/2017.
 */
function InputSystem(){
	this.visible = false;
	this.closed = false;
	this.cancelled = false; //TODO: remove this?
}
InputSystem.prototype.show = function(slotShape, updateFn, finishFn, data){
	DebugOptions.assert(!this.visible);
	DebugOptions.assert(!this.closed);
	this.visible = true;
	this.slotShape = slotShape;
	this.updateFn = updateFn;
	this.finishFn = finishFn;
	this.currentData = data;
};
InputSystem.prototype.close = function(){
	if(this.closed) return;
	this.closed = true;
	this.visible = false;
	this.finishFn(this.currentData, this.cancelled);
};