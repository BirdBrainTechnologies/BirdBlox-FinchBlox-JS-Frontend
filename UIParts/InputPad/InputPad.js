function InputPad(){
	InputPad.buildPad();
}
InputPad.setGraphics=function(){
	InputPad.buttonW=50;
	InputPad.buttonH=40;
	InputPad.buttonMargin=8;
	/*InputPad.triangleW=15;
	InputPad.triangleH=7;*/
	InputPad.fontSize=34;
	InputPad.font="Arial";
	InputPad.fontWeight="bold";
	InputPad.bg=Colors.black;
	InputPad.charHeight=25;
	InputPad.plusMinusH=22;
	InputPad.bsBnH=25;
	InputPad.okBnH=InputPad.bsBnH;
	
	InputPad.BnAreaW=InputPad.buttonW*3+InputPad.buttonMargin*2;
	InputPad.BnAreaH=InputPad.buttonH*5+InputPad.buttonMargin*4;
	InputPad.width=InputPad.BnAreaW;
	InputPad.height=InputPad.BnAreaH;
	
	InputPad.longBnW=(InputPad.width-InputPad.buttonMargin)/2;
	InputPad.triOffset=(InputPad.width-InputPad.triangleW)/2;
	InputPad.halfOffset=InputPad.width/2;
	/*InputPad.tallH=InputPad.height+InputPad.triangleH;*/
	
	InputPad.usingNumberPad=false;
	InputPad.dataIsNumeric=false;
	InputPad.nonNumericData=null;
	InputPad.nonNumericText=null;
	InputPad.displayNum=null;
	InputPad.undoAvailable=false;
	InputPad.undoVisible=false;
	InputPad.undoData=function(){};
	InputPad.undoData.dataIsNumeric=false;
	InputPad.undoData.data=null;
	InputPad.undoData.text=null;
	InputPad.valueGrayed=true;
};
InputPad.buildPad=function(){
	var IP=InputPad;
	IP.group=GuiElements.create.group(0,0);
	IP.visible=false;
	/*IP.makeBg();*/
	IP.bubbleOverlay=new BubbleOverlay(IP.bg,IP.buttonMargin,IP.group,IP);
	IP.bnGroup=GuiElements.create.group(0,0);
	IP.makeBns();
	IP.menuBnList=new MenuBnList(IP.group,0,0,IP.buttonMargin);
	IP.menuBnList.isOverlayPart=true;
};
/*InputPad.makeBg=function(){
	var IP=InputPad;
	IP.bgGroup=GuiElements.create.group(0,0,IP.group);
	IP.bgRect=GuiElements.draw.rect(0,0,IP.width,IP.height,IP.bg);
	IP.triangle=GuiElements.draw.triangle(IP.triOffset,0,IP.triangleW,IP.triangleH,IP.bg);
	IP.bgGroup.appendChild(IP.bgRect);
	IP.bgGroup.appendChild(IP.triangle);
};*/
InputPad.resetPad=function(columns){//removes any options which may have been added to the pad
	var IP=InputPad;
	IP.close();
	IP.menuBnList=new MenuBnList(IP.group,0,0,IP.buttonMargin,null,columns);
	IP.menuBnList.isOverlayPart=true;
};
InputPad.addOption=function(text,data){
	var dataFunction=function(){InputPad.menuBnSelected(text,data)};
	InputPad.menuBnList.addOption(text,dataFunction);
};
InputPad.numPressed=function(num){
	var IP=InputPad;
	IP.removeUndo();
	IP.deleteIfGray();
	IP.displayNum.addDigit(num+"");
	SaveManager.markEdited();
	IP.updateSlot();
	IP.dataIsNumeric=true;
};
InputPad.plusMinusPressed=function(){
	var IP=InputPad;
	IP.removeUndo();
	IP.deleteIfGray();
	IP.displayNum.switchSign();
	SaveManager.markEdited();
	IP.updateSlot();
};
InputPad.decimalPressed=function(){
	var IP=InputPad;
	IP.removeUndo();
	IP.deleteIfGray();
	IP.displayNum.addDecimalPoint();
	SaveManager.markEdited();
	IP.updateSlot();
};
InputPad.deleteIfGray=function(){
	var IP=InputPad;
	if(IP.valueGrayed){
		IP.showUndo();
		IP.dataIsNumeric=true;
		IP.displayNum=new DisplayNum(new NumData(0));
		IP.updateSlot();
		IP.ungray();
	}
};
InputPad.ungray=function(){
	var IP=InputPad;
	if(IP.valueGrayed) {
		IP.slot.ungrayValue();
		IP.valueGrayed=false;
	}
};
InputPad.grayOutValue=function(){
	var IP=InputPad;
	IP.slot.grayOutValue();
	IP.valueGrayed=true;
};
InputPad.showUndo=function(){
	var IP=InputPad;
	if(!IP.undoAvailable) {
		IP.undoAvailable = true;
		IP.undoData.dataIsNumeric = IP.dataIsNumeric;
		if (IP.dataIsNumeric) {
			IP.undoData.data = IP.displayNum.getData();
		}
		else {
			IP.undoData.data = IP.nonNumericData;
			IP.undoData.text = IP.nonNumericText;
		}
		IP.updateBsIcon();
	}
};
InputPad.removeUndo=function(){
	var IP=InputPad;
	IP.removeUndoDelayed();
	IP.updateBsIcon();
};
InputPad.removeUndoDelayed=function(){
	var IP=InputPad;
	if(IP.undoAvailable) {
		IP.undoAvailable = false;
		IP.undoData.data = null;
		IP.undoData.text = null;
	}
};
InputPad.updateBsIcon=function(){
	var IP=InputPad;
	if(IP.undoAvailable!=IP.undoVisible) {
		if(IP.undoAvailable){
			IP.bsButton.addIcon(VectorPaths.undo,IP.bsBnH);
			IP.undoVisible=true;
		}
		else{
			IP.bsButton.addIcon(VectorPaths.backspace,IP.bsBnH);
			IP.undoVisible=false;
		}
	}
};
InputPad.undo=function(){
	var IP=InputPad;
	if(IP.undoAvailable) {
		IP.dataIsNumeric=IP.undoData.dataIsNumeric;
		if(IP.dataIsNumeric){
			IP.displayNum=new DisplayNum(IP.undoData.data);
		}
		else{
			IP.nonNumericData=IP.undoData.data;
			IP.nonNumericText=IP.undoData.text;
		}
		IP.removeUndoDelayed();
		IP.updateSlot();
		IP.grayOutValue();
	}
};
InputPad.bsReleased=function(){
	InputPad.updateBsIcon();
};
InputPad.bsPressed=function(){
	var IP=InputPad;
	if(IP.undoAvailable){
		IP.undo();
	}
	else {
		IP.removeUndoDelayed();
		IP.ungray();
		if(IP.dataIsNumeric) {
			IP.displayNum.backspace();
		}
		else{
			IP.dataIsNumeric=true;
			IP.displayNum=new DisplayNum(new NumData(0));
		}
		IP.updateSlot();
	}
	SaveManager.markEdited();
};
InputPad.okPressed=function(){
	InputPad.close();
};
InputPad.showDropdown=function(slot,x,upperY,lowerY,menuWidth){
	var IP=InputPad;
	IP.visible=true;
	IP.usingNumberPad=false;
	IP.specialCommand="";
	IP.slot=slot;
	IP.dataIsNumeric=false;
	IP.nonNumericData=IP.slot.enteredData;
	IP.nonNumericText=IP.slot.text;
	var Vmargins=IP.bubbleOverlay.getVPadding();
	IP.menuBnList.setMaxHeight(Math.max(upperY-Vmargins,GuiElements.height-lowerY-Vmargins));
	IP.menuBnList.generateBns();
	IP.width=IP.menuBnList.width;//+2*IP.buttonMargin;
	IP.height=IP.menuBnList.height;//+2*IP.buttonMargin;
	//IP.menuBnList.move(0,0);
	IP.menuBnList.show();
	IP.bubbleOverlay.display(x,upperY,lowerY,IP.width,IP.height);
	/*IP.tallH=IP.height+IP.triangleH;
	IP.move(x,upperY,lowerY);
	GuiElements.layers.inputPad.appendChild(IP.group);*/
};
InputPad.showNumPad=function(slot,x,upperY,lowerY,positive,integer){
	var IP=InputPad;
	IP.usingNumberPad=true;
	IP.specialCommand="";
	IP.width=InputPad.BnAreaW;
	IP.height=InputPad.BnAreaH;
	/*IP.tallH=IP.height+IP.triangleH;*/
	IP.undoAvailable=false;
	IP.valueGrayed=false;
	if(!IP.menuBnList.isEmpty()){
		IP.menuBnList.width=IP.buttonW*3+IP.buttonMargin*2;
		IP.menuBnList.generateBns();
		IP.height+=IP.menuBnList.height+IP.buttonMargin;
		/*IP.tallH+=IP.menuBnList.height+IP.buttonMargin;*/
		GuiElements.move.group(IP.bnGroup,0,IP.menuBnList.height+IP.buttonMargin);
		//IP.menuBnList.move(0,0);
		IP.menuBnList.show();
	}
	else{
		GuiElements.move.group(IP.bnGroup,0,0);
	}
	var IP=InputPad;
	/*GuiElements.layers.inputPad.appendChild(IP.group);*/
	IP.group.appendChild(IP.bnGroup);
	IP.visible=true;
	IP.slot=slot;
	if(slot.getData().type==Data.types.num){
		var numData=slot.getData();
		if(numData.getValue()==0){
			IP.displayNum=new DisplayNum(new NumData(0));
		}
		else{
			IP.displayNum=new DisplayNum(numData);
			IP.grayOutValue();
		}
		IP.dataIsNumeric=true;
	}
	else{
		IP.dataIsNumeric=false;
		IP.nonNumericData=slot.getData();
		IP.nonNumericText=IP.slot.text;
		IP.grayOutValue();
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
	IP.bubbleOverlay.display(x,upperY,lowerY,IP.width,IP.height);
	/*InputPad.move(x,upperY,lowerY);*/
};
/*InputPad.move=function(x,upperY,lowerY){
	var IP=InputPad;
	IP.triOffset=(InputPad.width-InputPad.triangleW)/2;
	IP.halfOffset=InputPad.width/2;
	
	var arrowDown=(lowerY+IP.tallH>GuiElements.height);
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
	if(xCoord+IP.width>GuiElements.width){
		arrowX=IP.width+x-GuiElements.width-IP.triangleW/2;
		xCoord=GuiElements.width-IP.width;
	}
	GuiElements.move.group(IP.group,xCoord,yCoord);
	GuiElements.update.triangle(IP.triangle,arrowX,arrowY,IP.triangleW,IP.triangleH*arrowDir);
	GuiElements.update.rect(IP.bgRect,0,0,IP.width,IP.height);
 	IP.menuBnList.move(IP.buttonMargin,IP.buttonMargin);
 	IP.menuBnList.show();
};*/
InputPad.updateSlot=function(){
	var IP=InputPad;
	if(IP.dataIsNumeric){
		IP.slot.updateEdit(IP.displayNum.getString(),IP.displayNum.getData());
	}
	else{
		IP.slot.updateEdit(IP.nonNumericText,IP.nonNumericData);
	}
};
InputPad.close=function(){
	var IP = InputPad;
	if(IP.visible) {
		if (IP.specialCommand=="enter_text") {
			IP.slot.editText();
		}
		else if (IP.specialCommand=="new_message") {
			CodeManager.newBroadcastMessage(IP.slot);
		}
		else if (InputPad.dataIsNumeric) {
			IP.slot.saveNumData(IP.displayNum.getData());
		}
		else {
			IP.slot.setSelectionData(IP.nonNumericText, IP.nonNumericData);
		}
		/*IP.group.remove();*/
		IP.bubbleOverlay.hide();
		IP.visible = false;
		IP.menuBnList.hide();
		IP.bnGroup.remove();
		IP.removeUndo();
	}
};
InputPad.menuBnSelected=function(text,data){
	var IP=InputPad;
	if(data.type==Data.types.num){
		IP.displayNum=new DisplayNum(data);
		IP.dataIsNumeric=true;
	}
	else if(data.type==Data.types.selection&&data.getValue()=="enter_text"){
		IP.specialCommand="enter_text";
	}
	else if(data.type==Data.types.selection&&data.getValue()=="new_message"){
		IP.specialCommand="new_message";
	}
	else{
		IP.dataIsNumeric=false;
		IP.nonNumericText=text;
		IP.nonNumericData=data;
	}
	SaveManager.markEdited();
	IP.close();
};

InputPad.makeBns=function(){
	var IP=InputPad;
	var currentNum;
	var xPos=0;
	var yPos=0;
	for(var i=0;i<3;i++){
		xPos=0;
		for(var j=0;j<3;j++){
			currentNum=7-i*3+j;
			InputPad.makeNumBn(xPos,yPos,currentNum);
			xPos+=IP.buttonMargin;
			xPos+=IP.buttonW;
		}
		yPos+=IP.buttonMargin;
		yPos+=IP.buttonH;
	}
	InputPad.makeNumBn(IP.buttonMargin+IP.buttonW,IP.buttonMargin*3+IP.buttonH*3,0);
	InputPad.makePlusMinusBn(0,IP.buttonMargin*3+IP.buttonH*3);
	InputPad.makeDecimalBn(IP.buttonMargin*2+IP.buttonW*2,IP.buttonMargin*3+IP.buttonH*3);
	InputPad.makeBsBn(0,IP.buttonMargin*4+IP.buttonH*4);
	InputPad.makeOkBn(IP.buttonMargin+IP.longBnW,IP.buttonMargin*4+IP.buttonH*4);
};
InputPad.makeNumBn=function(x,y,num){
	var IP=InputPad;
	var button=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	button.addText(num,IP.font,IP.fontSize,IP.fontWeight,IP.charHeight);
	button.setCallbackFunction(function(){InputPad.numPressed(num)},false);
	button.isOverlayPart=true;
};
InputPad.makePlusMinusBn=function(x,y){
	var IP=InputPad;
	IP.plusMinusBn=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	IP.plusMinusBn.addText(String.fromCharCode(177),IP.font,IP.fontSize,IP.fontWeight,IP.plusMinusH);
	IP.plusMinusBn.setCallbackFunction(InputPad.plusMinusPressed,false);
	IP.plusMinusBn.isOverlayPart=true;
};
InputPad.makeDecimalBn=function(x,y){
	var IP=InputPad;
	IP.decimalBn=new Button(x,y,IP.buttonW,IP.buttonH,IP.bnGroup);
	IP.decimalBn.addText(".",IP.font,IP.fontSize,IP.fontWeight,IP.charHeight);
	IP.decimalBn.setCallbackFunction(InputPad.decimalPressed,false);
	IP.decimalBn.isOverlayPart=true;
};
InputPad.makeBsBn=function(x,y){
	var IP=InputPad;
	IP.bsButton=new Button(x,y,IP.longBnW,IP.buttonH,IP.bnGroup);
	IP.bsButton.addIcon(VectorPaths.backspace,IP.bsBnH);
	IP.bsButton.setCallbackFunction(InputPad.bsPressed,false);
	IP.bsButton.setCallbackFunction(InputPad.bsReleased,true);
	IP.bsButton.isOverlayPart=true;
};
InputPad.makeOkBn=function(x,y){
	var IP=InputPad;
	var button=new Button(x,y,IP.longBnW,IP.buttonH,IP.bnGroup);
	button.addIcon(VectorPaths.checkmark,IP.okBnH);
	button.setCallbackFunction(InputPad.okPressed,true);
	button.isOverlayPart=true;
};