/**
 * Created by Tom on 7/3/2017.
 */
InputWidget.SelectPad = function(){
	this.optionsList = [];
	this.maxHeight = null;
};
InputWidget.SelectPad.prototype = Object.create(InputWidget);
InputWidget.SelectPad.constructor = InputWidget.SelectPad;
InputWidget.SelectPad.prototype.show = function(x, y, slotShape, updateFn, finishFn, data){
	this.group = GuiElements.create.group(x, y);
	const layer = GuiElements.layers.frontScroll;
	this.menuBnList = new SmoothMenuBnList(this, this.group, 0, 0, NewInputPad.innerWidth, layer);
	this.optionsList.forEach(function(option){
		this.menuBnList.addOption(option.text, option.callbackFn);
	}.bind(this));
	DebugOptions.assert(this.maxHeight != null);
	this.menuBnList.setMaxHeight(this.maxHeight);
};
InputWidget.SelectPad.prototype.updateDim = function(){
	this.height = this.menuBnList.previewHeight();
	this.width = NewInputPad.innerWidth;
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
		me.updateFn(data);
		me.finishFn();
	};
	this.optionsList.push(option);
};
InputWidget.SelectPad.prototype.addAction = function(text, callbackFn){
	const option = {};
	option.text = text;
	const me = this;
	option.callbackFn = function(){
		callbackFn(me.actionCallback);
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
InputWidget.SelectPad.prototype.close = function(){
	this.menuBnList.hide();
};