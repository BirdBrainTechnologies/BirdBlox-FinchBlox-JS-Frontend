/**
 * Created by Tom on 6/23/2017.
 */
function ShowHideButton(x, y, width, height, parent, iconH){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.parent = parent;
	this.iconH = iconH * 0.75;
	this.showFn = null;
	this.hideFn = null;
}
ShowHideButton.prototype.build = function(isShowing){
	this.showBn = new Button(this.x, this.y, this.width, this.height, this.parent);
	this.showBn.addIcon(VectorPaths.show, this.iconH);
	this.hideBn = new Button(this.x, this.y, this.width, this.height, this.parent);
	this.hideBn.addIcon(VectorPaths.hide, this.iconH);

	this.showBn.setCallbackFunction(this.showFn, false);
	this.hideBn.setCallbackFunction(this.hideFn, false);

	let toggle1 = function(){
		this.showBn.hide();
		this.hideBn.show();
	}.bind(this);
	this.showBn.setCallbackFunction(toggle1, true);
	this.showBn.interrupt=function(){
		if(this.enabled&&this.pressed){
			this.pressed=false;
			this.setColor(false);
			toggle1();
		}
	};
	let toggle2 = function(){
		this.showBn.show();
		this.hideBn.hide();
	}.bind(this);
	this.hideBn.setCallbackFunction(toggle2, true);
	this.hideBn.interrupt=function(){
		if(this.enabled&&this.pressed){
			this.pressed=false;
			this.setColor(false);
			toggle2();
		}
	};

	if(isShowing){
		this.showBn.hide();
	} else{
		this.hideBn.hide();
	}
};
ShowHideButton.prototype.setCallbackFunctions = function(showFn, hideFn){
	this.showFn = showFn;
	this.hideFn = hideFn;
};
ShowHideButton.prototype.remove = function(){
	this.showBn.remove();
	this.hideBn.remove();
};