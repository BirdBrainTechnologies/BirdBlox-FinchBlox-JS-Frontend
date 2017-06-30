/**
 * Created by Tom on 6/29/2017.
 */
function SlotShape(slot){
	this.slot = slot;
	this.visible = false;
	this.built = false;
}
SlotShape.setConstants = function(){

};
SlotShape.prototype.show = function(){
	if(this.visible) return;
	this.visible = true;
	if(!this.built) this.buildSlot();
	this.slot.parent.group.appendChild(this.group);
	this.updateDim();
	this.updateAlign();
};
SlotShape.prototype.hide = function(){
	if(!this.visible) return;
	this.visible = false;
	this.group.remove();
};
SlotShape.prototype.buildSlot = function(){
	if(this.built) return;
	this.built = true;
	this.group = GuiElements.create.group(0, 0);
};
SlotShape.prototype.move = function(x, y){
	GuiElements.move.group(this.group, x, y);
};
SlotShape.prototype.updateDim = function(){
	DebugOptions.markAbstract();
};
SlotShape.prototype.updateAlign = function(){
	DebugOptions.markAbstract();
};
