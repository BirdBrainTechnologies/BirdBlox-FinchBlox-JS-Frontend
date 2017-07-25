/**
 * Created by Tom on 7/3/2017.
 */
InputWidget.SelectPad = function(){
	this.optionsList = [];
	this.maxHeight = null;
};
InputWidget.SelectPad.prototype = Object.create(InputWidget);
InputWidget.SelectPad.constructor = InputWidget.SelectPad;
InputWidget.SelectPad.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data){
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);
	const layer = GuiElements.layers.frontScroll;
	this.menuBnList = new SmoothMenuBnList(this, parentGroup, x, y, InputPad.width, layer);
	this.optionsList.forEach(function(option){
		this.menuBnList.addOption(option.text, option.callbackFn);
	}.bind(this));
	DebugOptions.assert(this.maxHeight != null);
	this.menuBnList.markAsOverlayPart(overlay);
	this.menuBnList.setMaxHeight(this.maxHeight);
	this.menuBnList.show();
};
InputWidget.SelectPad.prototype.updateDim = function(){
	DebugOptions.assert(this.maxHeight !== null);
	this.height = SmoothMenuBnList.previewHeight(this.optionsList.length, this.maxHeight);
	this.width = InputPad.innerWidth;
};
InputWidget.SelectPad.prototype.fixedHeight = function(){
	return false;
};
InputWidget.SelectPad.prototype.setMaxHeight = function(height){
	this.maxHeight = height;
};
InputWidget.SelectPad.prototype.addOption = function(data, text) {
	if(text == null){
		text = data.asString().getValue();
	}
	const option = {};
	option.text = text;
	const me = this;
	option.callbackFn = function(){
		me.finishFn(data);
	};
	this.optionsList.push(option);
};
InputWidget.SelectPad.prototype.addAction = function(text, callbackFn){
	const option = {};
	option.text = text;
	const me = this;
	option.callbackFn = function(){
		callbackFn(me.actionCallback.bind(me));
	};
	this.optionsList.push(option);
};
InputWidget.SelectPad.prototype.actionCallback = function(data, shouldClose){
	if(data != null){
		this.updateFn(data);
	}
	if(shouldClose){
		this.finishFn();
	}
};
InputWidget.SelectPad.prototype.isEmpty = function(){
	return this.optionsList.length === 0;
};
InputWidget.SelectPad.prototype.close = function(){
	this.menuBnList.hide();
};
InputWidget.SelectPad.prototype.relToAbsX = function(x){
	return this.overlay.relToAbsX(this.x);
};
InputWidget.SelectPad.prototype.relToAbsY = function(y){
	return this.overlay.relToAbsY(this.y);
};
InputWidget.SelectPad.prototype.getAbsX = function(){
	return this.relToAbsX(0);
};
InputWidget.SelectPad.prototype.getAbsY = function(){
	return this.relToAbsY(0);
};