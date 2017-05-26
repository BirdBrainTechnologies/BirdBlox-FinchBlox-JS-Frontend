function ConnectMultipleHBDialog(){
	var CMHBD=ConnectMultipleHBDialog;
	if(CMHBD.currentCOHBD!=null){
		CMHBD.currentCOHBD.closeDialog();
	}
	CMHBD.currentCOHBD=this;
	this.hBList=HummingbirdManager.getConnectedHBs();
	CMHBD.currentDialog=this;
	this.width=CMHBD.width;
	this.height=this.computeHeight();
	this.x=GuiElements.width/2-this.width/2;
	this.y=GuiElements.height/2-this.height/2;
	this.statusLights=[];
	this.group=GuiElements.create.group(this.x,this.y);
	this.bgRect=this.makeBgRect();
	this.titleRect=this.createTitleRect();
	this.titleText=this.createTitleLabel();
	if(this.hBList.length<10) {
		this.plusBn = this.createPlusBn();
	}
	this.doneBn=this.makeDoneBn();
	this.createRows();
	GuiElements.layers.dialog.appendChild(this.group);
	GuiElements.blockInteraction();
	HtmlServer.sendRequestWithCallback("hummingbird/discover");
}
ConnectMultipleHBDialog.setConstants=function(){
	var CMHBD=ConnectMultipleHBDialog;
	CMHBD.currentDialog=null;

	CMHBD.titleBarColor=Colors.lightGray;
	CMHBD.fontColor=Colors.white;
	CMHBD.bgColor=Colors.black;
	CMHBD.titleBarH=30;
	CMHBD.width=300;
	CMHBD.doneBnWidth=100;
	CMHBD.buttonH=30;
	CMHBD.bnM=7;
	CMHBD.smallBnWidth=30;
	CMHBD.statusToBnM=CMHBD.smallBnWidth+CMHBD.bnM-DeviceStatusLight.radius*2;
	CMHBD.editIconH=15;

	CMHBD.fontSize=16;
	CMHBD.font="Arial";
	CMHBD.fontWeight="normal";
	CMHBD.charHeight=12;
	CMHBD.plusFontSize=26;
	CMHBD.plusCharHeight=18;
};
ConnectMultipleHBDialog.prototype.computeHeight=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var count=this.hBList.length;
	if(count==10){
		count--;
	}
	return CMHBD.titleBarH+(count+2)*CMHBD.buttonH+(count+3)*CMHBD.bnM;
};
ConnectMultipleHBDialog.prototype.makeBgRect=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var rectE=GuiElements.draw.rect(0,0,this.width,this.height,CMHBD.bgColor);
	this.group.appendChild(rectE);
	return rectE;
};
ConnectMultipleHBDialog.prototype.makeDoneBn=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var width=CMHBD.doneBnWidth;
	var height=CMHBD.buttonH;
	var x=CMHBD.width/2-width/2;
	var y=this.height-height-CMHBD.bnM;
	var doneBn=new Button(x,y,width,height,this.group);
	doneBn.addText("Done");
	var callbackFn=function(){
		callbackFn.dialog.closeDialog();
	};
	callbackFn.dialog=this;
	doneBn.setCallbackFunction(callbackFn,true);
	return doneBn;
};
ConnectMultipleHBDialog.prototype.createTitleRect=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var rect=GuiElements.draw.rect(0,0,CMHBD.width,CMHBD.titleBarH,CMHBD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
ConnectMultipleHBDialog.prototype.createTitleLabel=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var textE=GuiElements.draw.text(0,0,"Connect Multiple",CMHBD.fontSize,CMHBD.fontColor,CMHBD.font,CMHBD.fontWeight);
	var x=CMHBD.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=CMHBD.titleBarH/2+CMHBD.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
ConnectMultipleHBDialog.prototype.closeDialog=function(){
	this.group.remove();
	GuiElements.unblockInteraction();
	for(var i=0;i<this.statusLights.length;i++){
		this.statusLights[i].remove();
	}
	ConnectMultipleHBDialog.currentCOHBD=null;
	HtmlServer.sendRequestWithCallback("/hummingbird/stopDiscover");
};
ConnectMultipleHBDialog.prototype.createRows=function(){
	var CMHBD=ConnectMultipleHBDialog;
	for(var i=0;i<this.hBList.length;i++){
		this.createRow(i+1,CMHBD.titleBarH+CMHBD.buttonH*i+CMHBD.bnM*(i+1),this.hBList[i]);
	}
};
ConnectMultipleHBDialog.prototype.createRow=function(index,y,hummingbird){
	var CMHBD=ConnectMultipleHBDialog;
	var x=CMHBD.bnM;
	var request="hummingbird/"+HtmlServer.encodeHtml(hummingbird.name)+"/status";
	// TODO: Fix status light to work with multiple devices
	var statusLight=new DeviceStatusLight(x,y+CMHBD.buttonH/2,this.group);
	this.statusLights.push(statusLight);
	x+=DeviceStatusLight.radius*2;
	var textE=GuiElements.draw.text(0,0,index,CMHBD.fontSize,CMHBD.fontColor,CMHBD.font,CMHBD.fontWeight);
	var textW=GuiElements.measure.textWidth(textE);
	var textX=x+CMHBD.statusToBnM/2-textW/2;
	var textY=y+CMHBD.buttonH/2+CMHBD.charHeight/2;
	GuiElements.move.text(textE,textX,textY);
	this.group.appendChild(textE);
	x+=CMHBD.statusToBnM;
	var endX=this.width-CMHBD.bnM-CMHBD.smallBnWidth;
	var xButton=new Button(endX,y,CMHBD.smallBnWidth,CMHBD.buttonH,this.group);
	xButton.addText("X",CMHBD.font,CMHBD.fontSize,CMHBD.fontWeight,CMHBD.fontCharHeight);
	endX-=CMHBD.smallBnWidth+CMHBD.bnM;
	var renButton=new Button(endX,y,CMHBD.smallBnWidth,CMHBD.buttonH,this.group);
	renButton.addIcon(VectorPaths.edit,CMHBD.editIconH);
	endX-=CMHBD.bnM;
	var hBButton=new Button(x,y,endX-x,CMHBD.buttonH,this.group);
	hBButton.addText(hummingbird.name,CMHBD.font,CMHBD.fontSize,CMHBD.fontWeight,CMHBD.fontCharHeight);

	renButton.setCallbackFunction(function(){
		hummingbird.promptRename();
		ConnectMultipleHBDialog.reloadDialog();
	},true);
	xButton.setCallbackFunction(function(){
		hummingbird.disconnect();
		ConnectMultipleHBDialog.reloadDialog();
	},true);
	var overlayX=GuiElements.width/2;
	var overlayUpY=y+this.y;
	var overlayLowY=overlayUpY+CMHBD.buttonH;
	hBButton.setCallbackFunction(function(){
		new HBConnectionList(overlayX,overlayUpY,overlayLowY,hummingbird);
	},true);
};
ConnectMultipleHBDialog.prototype.createPlusBn=function(){
	var CMHBD=ConnectMultipleHBDialog;
	var x=CMHBD.bnM*2+CMHBD.smallBnWidth;
	var y=this.height-CMHBD.buttonH*2-CMHBD.bnM*2;
	var width=this.width-4*CMHBD.bnM-2*CMHBD.smallBnWidth;
	var button=new Button(x,y,width,CMHBD.buttonH,this.group);
	button.addText("+",CMHBD.font,CMHBD.plusFontSize,CMHBD.fontWeight,CMHBD.plusCharHeight);
	var overlayX=GuiElements.width/2;
	var overlayUpY=y+this.y;
	var overlayLowY=overlayUpY+CMHBD.buttonH;
	button.setCallbackFunction(function(){
		new HBConnectionList(overlayX,overlayUpY,overlayLowY,null);
	},true);
	return button;
};
ConnectMultipleHBDialog.reloadDialog=function(){
	new ConnectMultipleHBDialog();
};
