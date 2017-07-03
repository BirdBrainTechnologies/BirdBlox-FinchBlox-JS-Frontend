/**
 * Created by Tom on 7/3/2017.
 */
function InputWidget(){
	DebugOptions.markAbstract();
}
InputWidget.prototype.show = function(x, y, slotShape, updateFn, finishFn, data){
	this.slotShape = slotShape;
	this.updateFn = updateFn;
	this.finishFn = finishFn;
};
InputWidget.prototype.updateDim = function(){
	DebugOptions.markAbstract();
};
InputWidget.prototype.close = function(){

};
InputWidget.prototype.fixedHeight = function(){
	return true;
};