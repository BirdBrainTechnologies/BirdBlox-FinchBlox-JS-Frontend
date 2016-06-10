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
	
	InputPad.BnAreaW=InputPad.buttonW*3+InputPad.buttonMargin*4;
	InputPad.BnAreaH=InputPad.buttonH*5+InputPad.buttonMargin*6;
	InputPad.width=InputPad.BnAreaW;
	InputPad.height=InputPad.BnAreaH;
	
	InputPad.longBnW=(InputPad.width-InputPad.buttonMargin*3)/2;
	InputPad.triOffset=(InputPad.width-InputPad.triangleW)/2;
	InputPad.halfOffset=InputPad.width/2;
	InputPad.tallH=InputPad.height+InputPad.triangleH;
	InputPad.usingNumberPad=false;
	InputPad.dataIsNumeric=false;
	InputPad.nonNumericData=null;
	InputPad.nonNumericText=null;
};
InputPad.buildPad=function(){//456,267
	var IP=InputPad;
	IP.group=GuiElements.create.group(456,267);
	IP.visible=false;
	IP.makeBg();
	IP.bnGroup=GuiElements.create.group(0,0);
	IP.makeBns();
	IP.menuBnList=new MenuBnList(IP.group,IP.buttonMargin,IP.buttonMargin,IP.buttonMargin);
};
InputPad.makeBg=function(){
	var IP=InputPad;
	IP.bgGroup=GuiElements.create.group(0,0,IP.group);
	IP.bgRect=GuiElements.draw.rect(0,0,IP.width,IP.height,IP.bg);
	IP.triangle=GuiElements.draw.triangle(IP.triOffset,0,IP.triangleW,IP.triangleH,IP.bg);
	IP.bgGroup.appendChild(IP.bgRect);
	IP.bgGroup.appendChild(IP.triangle);
};
InputPad.resetPad=function(){//removes any options which may have been added to the pad
	var IP=InputPad;
	if(IP.visible){
		IP.close();
	}
	IP.menuBnList=new MenuBnList(IP.group,IP.buttonMargin,IP.buttonMargin,IP.buttonMargin);
};
InputPad.addOption=function(text,data){
	var dataFunction=function(){InputPad.menuBnSelected(text,data)};
	InputPad.menuBnList.addOption(text,dataFunction);
};
InputPad.menuBnSelected=function(text,data){
	var IP=InputPad;
	if(data.type==Data.types.num){
		IP.displayNum=new DisplayNum(data);
		IP.dataIsNumeric=true;
		InputPad.close();
	}
	else if(data.type==Data.types.selection&&data.getValue()=="enter_text"){
		IP.isEditTextCommand=true;
	}
	else{
		IP.dataIsNumeric=false;
		IP.nonNumericText=text;
		IP.nonNumericData=data;
	}
	IP.close();
};
InputPad.makeBns=function(){
	var IP=InputPad;
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
};
InputPad.makeNumBn=function(x,y,num){
	var IP=InputPad;
	var button=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	button.addText(num,IP.font,IP.fontSize,IP.fontWeight,IP.charHeight);
	button.setCallbackFunction(function(){InputPad.numPressed(num)},false);
};
InputPad.makePlusMinusBn=function(x,y){
	var IP=InputPad;
	IP.plusMinusBn=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	IP.plusMinusBn.addText(String.fromCharCode(177),IP.font,IP.fontSize,IP.fontWeight,IP.plusMinusH);
	IP.plusMinusBn.setCallbackFunction(InputPad.plusMinusPressed,false);
};
InputPad.makeDecimalBn=function(x,y){
	var IP=InputPad;
	IP.decimalBn=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	IP.decimalBn.addText(".",IP.font,IP.fontSize,IP.fontWeight,IP.charHeight);
	IP.decimalBn.setCallbackFunction(InputPad.decimalPressed,false);
};
InputPad.makeBsBn=function(x,y){
	var IP=InputPad;
	var button=new Button(x,y,IP.longBnW,IP.buttonH,IP.bnGroup);
	button.addIcon(VectorPaths.backspace,IP.bsBnH);
	button.setCallbackFunction(InputPad.bsPressed,false);
};
InputPad.makeOkBn=function(x,y){
	var IP=InputPad;
	var button=new Button(x,y,IP.longBnW,IP.buttonH,IP.bnGroup);
	button.addIcon(VectorPaths.checkmark,IP.okBnH);
	button.setCallbackFunction(InputPad.okPressed,true);
};
InputPad.numPressed=function(num){
	InputPad.displayNum.addDigit(num+"");
	InputPad.updateSlot();
};
InputPad.plusMinusPressed=function(){
	InputPad.displayNum.switchSign();
	InputPad.updateSlot();
};
InputPad.decimalPressed=function(){
	InputPad.displayNum.addDecimalPoint();
	InputPad.updateSlot();
};
InputPad.bsPressed=function(){
	InputPad.displayNum.backspace();
	InputPad.updateSlot();
};
InputPad.okPressed=function(){
	InputPad.close();
};
InputPad.showDropdown=function(slot,x,upperY,lowerY,menuWidth){
	var IP=InputPad;
	IP.visible=true;
	IP.usingNumberPad=false;
	IP.isEditTextCommand=false;
	IP.slot=slot;
	IP.dataIsNumeric=false;
	IP.nonNumericData=IP.slot.enteredData;
	IP.nonNumericText=IP.slot.text;
	this.menuBnList.generateBns();
	this.width=this.menuBnList.width+2*IP.buttonMargin;
	this.height=this.menuBnList.height+2*IP.buttonMargin;
	IP.tallH=IP.height+IP.triangleH;
	IP.move(x,upperY,lowerY);
	GuiElements.layers.inputPad.appendChild(IP.group);
};
InputPad.showNumPad=function(slot,x,upperY,lowerY,positive,integer){
	var IP=InputPad;
	IP.usingNumberPad=true;
	IP.isEditTextCommand=false;
	IP.width=InputPad.BnAreaW;
	IP.height=InputPad.BnAreaH;
	IP.tallH=IP.height+IP.triangleH;
	if(!IP.menuBnList.isEmpty()){
		IP.menuBnList.width=IP.buttonW*3+IP.buttonMargin*2;
		this.menuBnList.generateBns();
		this.height+=this.menuBnList.height+IP.buttonMargin;
		IP.tallH+=this.menuBnList.height+IP.buttonMargin;
		GuiElements.move.group(IP.bnGroup,0,this.menuBnList.height+IP.buttonMargin);
	}
	else{
		GuiElements.move.group(IP.bnGroup,0,0);
	}
	var IP=InputPad;
	GuiElements.layers.inputPad.appendChild(IP.group);
	IP.group.appendChild(IP.bnGroup);
	IP.visible=true;
	IP.slot=slot;
	if(slot.getData().type==Data.types.num){
		IP.displayNum=new DisplayNum(slot.getData());
		IP.dataIsNumeric=true;
	}
	else{
		IP.dataIsNumeric=false;
		IP.nonNumericData=slot.getData();
		IP.nonNumericText=IP.slot.text;
		IP.displayNum=new DisplayNum(new NumData(0));
	}
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
};
InputPad.move=function(x,upperY,lowerY){
	var IP=InputPad;
	IP.triOffset=(InputPad.width-InputPad.triangleW)/2;
	IP.halfOffset=InputPad.width/2;
	
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
		arrowX=IP.width+x-GuiElements.width-IP.triangleW/2;
		xCoord=GuiElements.width-this.width;
	}
	GuiElements.move.group(IP.group,xCoord,yCoord);
	GuiElements.update.triangle(IP.triangle,arrowX,arrowY,IP.triangleW,IP.triangleH*arrowDir);
	GuiElements.update.rect(IP.bgRect,0,0,this.width,this.height);
	this.menuBnList.move(IP.buttonMargin,IP.buttonMargin);
	this.menuBnList.show();
};
InputPad.updateSlot=function(){
	if(InputPad.usingNumberPad){
		InputPad.slot.updateEdit(this.displayNum.getString(),this.displayNum.getData());
		InputPad.dataIsNumeric=true;
	}
};
InputPad.close=function(){
	var IP=InputPad;
	if(IP.isEditTextCommand){
		IP.slot.editText();
	}
	else if(InputPad.dataIsNumeric){
		IP.slot.saveNumData(this.displayNum.getData());
	}
	else{
		IP.slot.setSelectionData(IP.nonNumericText,IP.nonNumericData);
	}
	IP.group.remove();
	IP.visible=false;
	IP.menuBnList.hide();
	IP.bnGroup.remove();
};