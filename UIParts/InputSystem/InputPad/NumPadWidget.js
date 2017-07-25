InputWidget.NumPad = function(positive, integer){
	this.positive = positive;
	this.integer = integer;
};
InputWidget.NumPad.prototype = Object.create(InputWidget.prototype);
InputWidget.NumPad.prototype.constructor = InputWidget.NumPad;
InputWidget.NumPad.setConstants = function(){
	const NP = InputWidget.NumPad;
	NP.bnMargin = InputPad.margin;
	NP.bnWidth = (InputPad.width - NP.bnMargin * 2) / 3;
	NP.bnHeight = 40;
	NP.longBnW = (InputPad.width - NP.bnMargin) / 2;
	NP.font=Font.uiFont(34).bold();
	NP.plusMinusH=22;
	NP.bsIconH=25;
	NP.okIconH=NP.bsIconH;
};
InputWidget.NumPad.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data){
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);
	this.group = GuiElements.create.group(x, y, parentGroup);
	this.displayNum = new DisplayNum(data);
	this.makeBns();
	this.grayOutUnlessZero();
};
InputWidget.NumPad.prototype.updateDim = function(x, y){
	const NP = InputWidget.NumPad;
	this.height = NP.bnHeight*5 + NP.bnMargin*4;
	this.width = InputPad.width;
};

InputWidget.NumPad.prototype.grayOutUnlessZero = function(){
	const data = this.displayNum.getData();
	if(this.displayNum.isNum || data.getValue() !== 0) {
		this.slotShape.grayOutValue();
	}
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
			this.makeNumBn(xPos,yPos,currentNum);
			xPos+=NP.bnMargin;
			xPos+=NP.bnWidth;
		}
		yPos+=NP.bnMargin;
		yPos+=NP.bnHeight;
	}
	this.makeNumBn(NP.bnMargin+NP.bnWidth,NP.bnMargin*3+NP.bnHeight*3,0);
	this.makePlusMinusBn(0,NP.bnMargin*3+NP.bnHeight*3);
	this.makeDecimalBn(NP.bnMargin*2+NP.bnWidth*2,NP.bnMargin*3+NP.bnHeight*3);
	this.bsButton = this.makeBsBn(0,NP.bnMargin*4+NP.bnHeight*4);
	this.okButton = this.makeOkBn(NP.bnMargin+NP.longBnW,NP.bnMargin*4+NP.bnHeight*4);
};
InputWidget.NumPad.prototype.makeTextButton = function(x, y, text, callbackFn){
	const NP = InputWidget.NumPad;
	let button=new Button(x,y,NP.bnWidth,NP.bnHeight,this.group);
	button.addText(text,NP.font);
	button.setCallbackFunction(callbackFn,false);
	button.markAsOverlayPart(this.overlay);
	return button;
};
InputWidget.NumPad.prototype.makeNumBn=function(x,y,num){
	return this.makeTextButton(x, y, num + "", function(){this.numPressed(num)}.bind(this));
};
InputWidget.NumPad.prototype.makePlusMinusBn=function(x,y){
	let button = this.makeTextButton(x, y, String.fromCharCode(177), this.plusMinusPressed.bind(this));
	if(this.positive) button.disable();
	return button;
};
InputWidget.NumPad.prototype.makeDecimalBn=function(x,y){
	let button = this.makeTextButton(x, y, ".", this.decimalPressed.bind(this));
	if(this.integer) button.disable();
	return button;
};
InputWidget.NumPad.prototype.makeBsBn=function(x,y){
	const NP = InputWidget.NumPad;
	let button=new Button(x,y,NP.longBnW,NP.bnHeight,this.group);
	button.addIcon(VectorPaths.backspace,NP.bsIconH);
	button.setCallbackFunction(this.bsPressed.bind(this),false);
	button.setCallbackFunction(this.bsReleased.bind(this),true);
	button.markAsOverlayPart(this.overlay);
	return button;
};
InputWidget.NumPad.prototype.makeOkBn=function(x,y){
	const NP = InputWidget.NumPad;
	let button=new Button(x,y,NP.longBnW,NP.bnHeight,this.group);
	button.addIcon(VectorPaths.checkmark,NP.okIconH);
	button.setCallbackFunction(this.okPressed.bind(this),true);
	button.markAsOverlayPart(this.overlay);
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
		this.slotShape.unGrayOutValue();
		this.sendUpdate();
	}
};
InputWidget.NumPad.prototype.showUndo=function(){
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
		if(!this.displayNum.isNum) {
			this.displayNum = new DisplayNum(new NumData(0));
		}
		this.displayNum.backspace();
		this.sendUpdate();
	}
};
InputWidget.NumPad.prototype.okPressed=function(){
	this.finishFn(this.displayNum.getData());
};
InputWidget.NumPad.prototype.sendUpdate = function(){
	this.updateFn(this.displayNum.getData(), this.displayNum.getString());
};