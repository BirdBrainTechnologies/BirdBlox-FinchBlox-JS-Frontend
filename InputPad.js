function InputPad(){
	InputPad.buildPad();
}
InputPad.setGraphics=function(){
	InputPad.buttonW=50;
	InputPad.buttonH=40;
	InputPad.buttonMargin=8;
	InputPad.triangleW=15;
	InputPad.triangleH=7;
	InputPad.fontSize=34;
	InputPad.font="Arial";
	InputPad.fontWeight="bold";
	InputPad.bg=Colors.black;
	InputPad.charHeight=25;
	InputPad.plusMinusH=22;
	InputPad.bsBnH=25;
	InputPad.okBnH=InputPad.bsBnH;
	
	InputPad.width=InputPad.buttonW*3+InputPad.buttonMargin*4;
	InputPad.height=InputPad.buttonH*5+InputPad.buttonMargin*6;
	InputPad.longBnW=(InputPad.width-InputPad.buttonMargin*3)/2;
	InputPad.triOffset=(InputPad.width-InputPad.triangleW)/2;
	InputPad.halfOffset=InputPad.width/2;
	InputPad.tallH=InputPad.height+InputPad.triangleH;
}
InputPad.buildPad=function(){//456,267
	InputPad.group=GuiElements.create.group(456,267);
	InputPad.visible=false;
	InputPad.makeBg();
	InputPad.bnGroup=GuiElements.create.group(0,0,InputPad.group);
	InputPad.makeBns();
}
InputPad.makeBg=function(){
	var IP=InputPad;
	IP.bgGroup=GuiElements.create.group(0,0,IP.group);
	IP.bgRect=GuiElements.draw.rect(0,0,IP.width,IP.height,IP.bg);
	IP.triangle=GuiElements.draw.triangle(IP.triOffset,0,IP.triangleW,IP.triangleH,IP.bg);
	IP.bgGroup.appendChild(IP.bgRect);
	IP.bgGroup.appendChild(IP.triangle);
}
InputPad.makeBns=function(){
	var IP=InputPad;
	IP.bnGroup=GuiElements.create.group(0,0,IP.group);
	var currentNum;
	var xPos=0;
	var yPos=0;
	for(var i=0;i<3;i++){
		yPos+=IP.buttonMargin;
		xPos=0;
		for(var j=0;j<3;j++){
			xPos+=IP.buttonMargin;
			currentNum=7-i*3+j;
			InputPad.makeNumBn(xPos,yPos,currentNum);
			xPos+=IP.buttonW;
		}
		yPos+=IP.buttonH;
	}
	InputPad.makeNumBn(IP.buttonMargin*2+IP.buttonW,IP.buttonMargin*4+IP.buttonH*3,0);
	InputPad.makePlusMinusBn(IP.buttonMargin,IP.buttonMargin*4+IP.buttonH*3);
	InputPad.makeDecimalBn(IP.buttonMargin*3+IP.buttonW*2,IP.buttonMargin*4+IP.buttonH*3);
	InputPad.makeBsBn(IP.buttonMargin,IP.buttonMargin*5+IP.buttonH*4);
	InputPad.makeOkBn(IP.buttonMargin*2+IP.longBnW,IP.buttonMargin*5+IP.buttonH*4);
}
InputPad.makeNumBn=function(x,y,num){
	var IP=InputPad;
	var button=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	button.addText(num,IP.font,IP.fontSize,IP.fontWeight,IP.charHeight);
	button.setCallbackFunction(function(){InputPad.numPressed(num)},false);
}
InputPad.makePlusMinusBn=function(x,y){
	var IP=InputPad;
	IP.plusMinusBn=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	IP.plusMinusBn.addText(String.fromCharCode(177),IP.font,IP.fontSize,IP.fontWeight,IP.plusMinusH);
	IP.plusMinusBn.setCallbackFunction(InputPad.plusMinusPressed,false);
}
InputPad.makeDecimalBn=function(x,y){
	var IP=InputPad;
	IP.decimalBn=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	IP.decimalBn.addText(".",IP.font,IP.fontSize,IP.fontWeight,IP.charHeight);
	IP.decimalBn.setCallbackFunction(InputPad.decimalPressed,false);
}
InputPad.makeBsBn=function(x,y){
	var IP=InputPad;
	var button=new Button(x,y,IP.longBnW,IP.buttonH,IP.bnGroup);
	button.addIcon(VectorPaths.backspace,IP.bsBnH);
	button.setCallbackFunction(InputPad.bsPressed,false);
}
InputPad.makeOkBn=function(x,y){
	var IP=InputPad;
	var button=new Button(x,y,IP.longBnW,IP.buttonH,IP.bnGroup);
	button.addIcon(VectorPaths.checkmark,IP.okBnH);
	button.setCallbackFunction(InputPad.okPressed,true);
}
InputPad.numPressed=function(num){
	InputPad.displayNum.addDigit(num+"");
	InputPad.updateSlot();
}
InputPad.plusMinusPressed=function(){
	InputPad.displayNum.switchSign();
	InputPad.updateSlot();
}
InputPad.decimalPressed=function(){
	InputPad.displayNum.addDecimalPoint();
	InputPad.updateSlot();
}
InputPad.bsPressed=function(){
	InputPad.displayNum.backspace();
	InputPad.updateSlot();
}
InputPad.okPressed=function(){
	InputPad.close();
}
InputPad.showNumPad=function(slot,x,upperY,lowerY,positive,integer){
	var IP=InputPad;
	if(IP.visible){
		IP.close();
	}
	GuiElements.layers.inputPad.appendChild(IP.group);
	IP.visible=true;
	IP.slot=slot;
	IP.displayNum=new DisplayNum(slot.getData());
	if(positive){
		IP.plusMinusBn.disable();
	}
	else{
		IP.plusMinusBn.enable();
	}
	if(integer){
		IP.decimalBn.disable();
	}
	else{
		IP.decimalBn.enable();
	}
	InputPad.move(x,upperY,lowerY);
	InputPad.updateSlot();
}
InputPad.move=function(x,upperY,lowerY){
	var IP=InputPad;
	arrowDown=(lowerY+this.tallH>GuiElements.height);
	var yCoord=lowerY+IP.triangleH;
	var xCoord=x-IP.halfOffset;
	var arrowDir=1;
	var arrowX=IP.triOffset;
	var arrowY=0;
	if(arrowDown){
		arrowDir=-1;
		yCoord=upperY-IP.tallH;
		arrowY=IP.height;
	}
	if(xCoord<0){
		arrowX+=xCoord;
		xCoord=0;
	}
	if(xCoord+this.width>GuiElements.width){
		arrowX=IP.width+x-GuiElements.width-IP.triangleW
		xCoord=GuiElements.width-this.width;
	}
	GuiElements.move.group(IP.group,xCoord,yCoord);
	GuiElements.update.triangle(IP.triangle,arrowX,arrowY,IP.triangleW,IP.triangleH*arrowDir);
}
InputPad.updateSlot=function(){
	InputPad.slot.updateEdit(this.displayNum.getString(),this.displayNum.getData());
}
InputPad.close=function(){
	InputPad.slot.saveEdit(this.displayNum.getData());
	InputPad.group.remove();
	InputPad.visible=false;
}