/**
 * Created by Tom on 7/3/2017.
 */
InputWidget.Label = function(text){
	this.text = text;
};
InputWidget.Label.prototype = Object.create(InputWidget.prototype);
InputWidget.Label.prototype.constructor = InputWidget.Label;
InputWidget.Label.setConstants = function(){
	const L = InputWidget.Label;
	L.fontSize=16; //TODO: Get rid of font redundancy
	L.font="Arial";
	L.fontWeight="bold";
	L.charHeight=12;
	L.color = Colors.white;
};
InputWidget.Label.prototype.show = function(x, y, parentGroup){
	const L = InputWidget.Label;
	this.textE = GuiElements.draw.text(x, y, "", L.fontSize, L.color, L.font, L.fontWeight);
	GuiElements.update.textLimitWidth(this.textE, this.text, NewInputPad.width);
	const textW = GuiElements.measure.textWidth(this.textE);
	const textX = NewInputPad.width / 2 - textW / 2;
	GuiElements.move.text(this.textE, textX, y + L.charHeight);
	parentGroup.appendChild(this.textE);
};
InputWidget.Label.prototype.updateDim = function(){
	const L = InputWidget.Label;
	this.height = L.charHeight;
	this.width = L.maxWidth;
};