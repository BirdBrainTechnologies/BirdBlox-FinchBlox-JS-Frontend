/**
 * Created by Tom on 7/3/2017.
 */
InputWidget.NumPad = function(positive, integer){
	this.positive = positive;
	this.integer = integer;
};
InputWidget.NumPad.prototype = Object.create(InputWidget);
InputWidget.NumPad.prototype.constructor = InputWidget.NumPad;
InputWidget.NumPad.setConstants = function(){
	const NP = InputWidget.NumPad;
	NP.bnMargin = NewInputPad.margin;
	NP.bnWidth = (NewInputPad.width - NP.bnMargin * 2) / 3;
	NP.bnHeight = 40;
	NP.fontSize=34;
	NP.font="Arial";
	NP.fontWeight="bold";
	NP.charHeight=25;
	NP.plusMinusH=22;
	NP.bsIconH=25;
	NP.okIconH=NP.bsIconH;
};
InputWidget.NumPad.prototype.show = function(x, y, slotShape, updateFn, finishFn, data){
	InputWidget.prototype.call(this, x, y, slotShape, updateFn, finishFn, data);
	this.group = GuiElements.create.group(x, y);
	this.displayNum = new DisplayNum(data);
	this.makeBns();
};
InputWidget.NumPad.prototype.updateDim = function(x, y){
	const NP = InputWidget.NumPad;
	this.height = NP.bnHeight*5 + NP.buttonM*4;
	this.width = NewInputPad.width;
};

InputWidget.NumPad.prototype.makeBns = function(){
	const NP = InputWidget.NumPad;
	let currentNum;
	let xPos=0;
	let yPos=0;
	for(let i=0;i<3;i++){
		xPos=0;
		for(let j=0;j<3;j++){
			currentNum=7-i*3+j;
			NP.makeNumBn(xPos,yPos,currentNum);
			xPos+=NP.bnMargin;
			xPos+=NP.bnWidth;
		}
		yPos+=NP.bnMargin;
		yPos+=NP.bnHeight;
	}
	NP.makeNumBn(NP.bnMargin+NP.bnWidth,NP.bnMargin*3+NP.bnHeight*3,0);
	NP.makePlusMinusBn(0,NP.bnMargin*3+NP.bnHeight*3);
	NP.makeDecimalBn(NP.bnMargin*2+NP.bnWidth*2,NP.bnMargin*3+NP.bnHeight*3);
	NP.makeBsBn(0,NP.bnMargin*4+NP.bnHeight*4);
	NP.makeOkBn(NP.bnMargin+NP.longBnW,NP.bnMargin*4+NP.bnHeight*4);
};
InputWidget.NumPad.prototype.makeTextButton = function(x, y, text, callbackFn){
	const NP = InputWidget.NumPad;
	let button=new Button(x,y,NP.bnWidth,NP.bnHeight,this.group);
	button.addText(text,NP.font,NP.fontSize,NP.fontWeight,NP.charHeight);
	button.setCallbackFunction(callbackFn,false);
	button.markAsOverlayPart(NP.bubbleOverlay);
	return button;
};
InputWidget.NumPad.prototype.makeNumBn=function(x,y,num){
	return this.makeTextButton(x, y, num + "", function(){this.numPressed(num)});
};
InputWidget.NumPad.prototype.makePlusMinusBn=function(x,y){
	return this.makeTextButton(x, y, String.fromCharCode(177), this.plusMinusPressed.bind(this));
};
InputWidget.NumPad.prototype.makeDecimalBn=function(x,y){
	return this.makeTextButton(x, y, ".", this.decimalPressed.bind(this));
};
InputWidget.NumPad.prototype.makeBsBn=function(x,y){
	const NP = InputWidget.NumPad;
	let button=new Button(x,y,NP.longBnW,NP.bnHeight,this.group);
	button.addIcon(VectorPaths.backspace,NP.bsBnH);
	button.setCallbackFunction(NP.bsPressed,false);
	button.setCallbackFunction(NP.bsReleased,true);
	button.markAsOverlayPart(NP.bubbleOverlay);
	return button;
};
InputWidget.NumPad.prototype.makeOkBn=function(x,y){
	const NP = InputWidget.NumPad;
	let button=new Button(x,y,NP.longBnW,NP.bnHeight,this.group);
	button.addIcon(VectorPaths.checkmark,NP.okBnH);
	button.setCallbackFunction(NP.okPressed,true);
	button.markAsOverlayPart(NP.bubbleOverlay);
	return button;
};



InputWidget.NumPad.prototype.numPressed=function(num){
	this.removeUndo();
	this.deleteIfGray();
	this.displayNum.addDigit(num+"");
	this.sendUpdate();
};
InputWidget.NumPad.prototype.plusMinusPressed=function(){
	this.removeUndo();
	this.deleteIfGray();
	this.displayNum.switchSign();
	this.sendUpdate();
};
InputWidget.NumPad.prototype.decimalPressed=function(){
	this.removeUndo();
	this.deleteIfGray();
	this.displayNum.addDecimalPoint();
	this.sendUpdate();
};
InputWidget.NumPad.prototype.deleteIfGray=function(){
	if(this.slotShape.isGray){
		this.showUndo();
		this.displayNum=new DisplayNum(new NumData(0));
		this.sendUpdate();
	}
};
InputWidget.NumPad.prototype.showUndo=function(){
	let IP=InputPad;
	if(!this.undoAvailable) {
		this.undoAvailable = true;
		this.undoData = this.displayNum.getData();
		this.updateBsIcon();
	}
};
InputWidget.NumPad.prototype.removeUndo=function(){
	this.removeUndoDelayed();
	this.updateBsIcon();
};
InputWidget.NumPad.prototype.removeUndoDelayed=function(){
	if(this.undoAvailable) {
		this.undoAvailable = false;
		this.undoData = null;
	}
};
InputWidget.NumPad.prototype.updateBsIcon=function(){
	const NP = InputWidget.NumPad;
	if(this.undoAvailable !== this.undoVisible) {
		if(this.undoAvailable){
			this.bsButton.addIcon(VectorPaths.undo, NP.bsIconH);
			this.undoVisible = true;
		}
		else{
			this.bsButton.addIcon(VectorPaths.backspace, NP.bsIconH);
			this.undoVisible = false;
		}
	}
};
InputWidget.NumPad.prototype.undo=function(){
	const NP = InputWidget.NumPad;
	if(this.undoAvailable) {
		this.displayNum = new DisplayNum(this.undoData);
		this.removeUndoDelayed();
		this.slotShape.grayOutValue();
		this.sendUpdate();
	}
};
InputWidget.NumPad.prototype.bsReleased=function(){
	this.updateBsIcon();
};
InputWidget.NumPad.prototype.bsPressed=function(){
	if(this.undoAvailable){
		this.undo();
	}
	else {
		this.removeUndoDelayed();
		this.slotShape.unGrayOutValue();
		this.displayNum.backspace();
		this.sendUpdate();
	}
};
InputWidget.NumPad.prototype.okPressed=function(){
	this.finishFn(this.displayNum.getData());
};
InputWidget.NumPad.prototype.sendUpdate = function(){
	this.updateFn(ths.displayNum.getData());
};