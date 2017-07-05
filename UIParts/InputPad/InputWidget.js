/**
 * Created by Tom on 7/3/2017.
 */
function InputWidget(){
	DebugOptions.markAbstract();
}
InputWidget.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data){
	this.x = x;
	this.y = y;
	this.slotShape = slotShape;
	this.updateFn = updateFn;
	this.finishFn = finishFn;
	this.overlay = overlay;
};
InputWidget.prototype.updateDim = function(){
	DebugOptions.markAbstract();
};
InputWidget.prototype.close = function(){

};
InputWidget.prototype.fixedHeight = function(){
	return true;
};
InputWidget.prototype.setMaxHeight = function(height){

};