/**
 * Created by Tom on 7/3/2017.
 */
function NewInputPad(x1, x2, y1, y2){
	InputSystem.call(this);
	this.widgets = [];
	const coords = this.coords = {};
	coords.x1 = x1;
	coords.x2 = x2;
	coords.y1 = y1;
	coords.y2 = y2;
}
NewInputPad.prototype = Object.create(InputSystem.prototype);
NewInputPad.prototype.constructor = NewInputPad;
NewInputPad.setConstants = function(){
	const IP = NewInputPad;
	IP.background = Colors.black;
	IP.margin = Button.defaultMargin;
	IP.width = 160;
	IP.maxHeight = GuiElements.height - 2 * IP.margin;
	IP.innerWidth = NewInputPad.width - NewInputPad.margin * 2;
};
NewInputPad.prototype.addWidget = function(widget){
	this.widgets.push(widget);
};
NewInputPad.prototype.show = function(slotShape, updateFn, finishFn, data){
	InputSystem.prototype.show.call(this, slotShape, updateFn, finishFn, data);
	const IP = NewInputPad;
	this.group = GuiElements.create.group(0, 0);
	this.updateDim();
	const type = Overlay.types.inputPad;
	const layer = GuiElements.layers.inputPad;
	const coords = this.coords;
	this.bubbleOverlay = new BubbleOverlay(type, IP.background, IP.margin, this.group, this, IP.margin, layer);
	this.showWidgets();
	this.bubbleOverlay.display(coords.x1, coords.x2, coords.y1, coords.y2, this.width, this.height);
};
NewInputPad.prototype.updateDim = function(){
	const IP = NewInputPad;
	let height = 0;
	this.widgets.forEach(function(widget){
		if(widget.fixedHeight()){
			widget.updateDim();
			height += widget.height;
		}
		height += IP.margin;
	});
	height -= IP.margin;
	height = Math.max(height, 0);
	let allocH = (IP.maxHeight - height);
	this.widgets.forEach(function(widget){
		if(!widget.fixedHeight()){
			widget.setMaxHeight(allocH);
			widget.updateDim();
			height += widget.height;
		}
	});
	this.height = height;
	this.width = IP.width;
};
NewInputPad.prototype.showWidgets = function(){
	const IP = NewInputPad;
	let y = 0;
	for(let i = 0; i < this.widgets.length; i++) {
		this.widgets[i].show(0, y, this.slotShape, this.updateEdit.bind(this), this.finishEdit.bind(this));
		y += this.widgets[i].height + IP.margin;
	}
};
NewInputPad.prototype.close = function(){
	InputSystem.prototype.close.call(this);
	this.widgets.forEach(function(widget){
		widget.close();
	});
};
NewInputPad.prototype.updateEdit = function(newData){
	this.updateFn(newData);
	this.currentData = newData;
	SaveManager.markEdited();
};
NewInputPad.prototype.finishEdit = function(){
	this.close();
};