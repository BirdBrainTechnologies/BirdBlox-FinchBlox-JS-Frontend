/**
 * Created by Tom on 7/3/2017.
 */
function InputSystem(){
	this.visible = false;
	this.closed = false;
}
InputSystem.prototype.show = function(slotShape, updateFn, finishFn, data){
	DebugOptions.assert(!this.visible);
	DebugOptions.assert(!this.closed);
	this.visible = true;
	this.slotShape = slotShape;
	this.slotUpdateFn = updateFn;
	this.slotFinishFn = finishFn;
	this.currentData = data;
};
InputSystem.prototype.close = function(){
	this.closed = true;
	this.visible = false;
	this.slotFinishFn(this.currentData);
};