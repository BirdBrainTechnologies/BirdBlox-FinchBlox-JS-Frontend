"use strict";

function DiscoverDialog(){
	let Class = DiscoverDialog;
	this.width = Class.width;
	this.height = GuiElements.height/2;
	this.x = GuiElements.width/2-this.width/2;
	this.y = GuiElements.height/4;
	this.menuBnList = null;
}
/**
 * Creates a discover dialog and shows it. Only allows one dialog to be shown at
 * one time.
 */
DiscoverDialog.show = function(deviceManagerClass) {
	let Class = DiscoverDialog;

	// Close dialog if it exists
	if (Class.instance != null) {
		Class.instance.closeDialog();
	}
	Class.deviceManagerClass = deviceManagerClass;
	Class.instance = new DiscoverDialog();
	Class.instance.showDialog();
};

DiscoverDialog.selectDevice = function(deviceName){
	DiscoverDialog.instance.closeDialog();
	DiscoverDialog.deviceManagerClass.ConnectDevice(deviceName);
};

DiscoverDialog.setConstants = function(){
	let Class = DiscoverDialog;
	Class.instance = null;
	Class.updateInterval = 500;

	Class.titleBarColor = Colors.lightGray;
	Class.titleBarFontC = Colors.white;
	Class.bgColor = Colors.black;
	Class.titleBarH = 30;
	Class.width = 300;
	Class.cancelBnWidth = 100;
	Class.cancelBnHeight = MenuBnList.bnHeight;
	Class.bnMargin = 5;
	Class.instrTextMargin = 5;

	Class.fontSize = 16;
	Class.font = "Arial";
	Class.fontWeight = "normal";
	Class.charHeight = 12;
};

DiscoverDialog.prototype.showDialog = function() {
	let Class = DiscoverDialog;
	// Creates svg elements
	this.group = GuiElements.create.group(this.x,this.y);
	this.bgRect = this.makeBgRect();
	this.cancelBn = this.makeCancelBn();
	this.titleRect = this.createTitleRect();
	this.titleText = this.createTitleLabel();
	var connectionInstr = Class.deviceManagerClass.getConnectionInstructions();
	this.menuBnListY = Class.titleBarH + Class.bnMargin;
	if(connectionInstr != null) {
		this.instrText = this.createInstructionText(connectionInstr);
		this.menuBnListY = Class.titleBarH+Class.charHeight + Class.instrTextMargin + Class.bnMargin;
	}
	GuiElements.layers.dialog.appendChild(this.group);
	GuiElements.blockInteraction();
	this.updateTimer = self.setInterval(this.discoverDevices.bind(this), Class.updateInterval);
	this.discoverDevices();
};

DiscoverDialog.prototype.closeDialog = function(){
	HtmlServer.sendRequestWithCallback("/flutter/stopDiscover");
	this.group.remove();
	this.menuBnList=null;
	GuiElements.unblockInteraction();
	DiscoverDialog.instance = null;
	this.updateTimer = window.clearInterval(this.updateTimer);
};

DiscoverDialog.prototype.discoverDevices = function() {
	DiscoverDialog.deviceManagerClass.DiscoverDevices(this.updateDeviceList.bind(this), this.updateDeviceList.bind(this));
};

DiscoverDialog.prototype.updateDeviceList = function(deviceList){
	deviceList = "hello\nworld\nhi\nthere";
	if(TouchReceiver.touchDown){
		return;
	}
	let Class = DiscoverDialog;
	let deviceArr = [];
	if (deviceList != "") {
		deviceArr = deviceList.split("\n");
	}

	let oldScrollY = 0;
	if(this.menuBnList != null){
		oldScrollY = this.menuBnList.scrollY;
		this.menuBnList.hide();
	}
	let bnM = Class.bnMargin;
	this.menuBnList=new MenuBnList(this.group, bnM, this.menuBnListY, bnM, this.width-bnM*2);
	this.menuBnList.setMaxHeight(this.height-this.menuBnListY-Class.cancelBnHeight-Class.bnMargin*2);
	for(let i=0; i<deviceArr.length; i++){
		this.addBnListOption(deviceArr[i]);
	}
	this.menuBnList.show();
	this.menuBnList.scroll(oldScrollY);
};

/* UI Creation */

DiscoverDialog.prototype.addBnListOption=function(hBName){
	let Class = DiscoverDialog;
	this.menuBnList.addOption(hBName,function(){
		Class.selectDevice(hBName);
	});
};
DiscoverDialog.prototype.makeBgRect=function(){
	var COHBD=DiscoverDialog;
	var rectE=GuiElements.draw.rect(0,0,this.width,this.height,COHBD.bgColor);
	this.group.appendChild(rectE);
	return rectE;
};
DiscoverDialog.prototype.makeCancelBn=function(){
	var COHBD=DiscoverDialog;
	var width=COHBD.cancelBnWidth;
	var height=COHBD.cancelBnHeight;
	var x=COHBD.width/2-width/2;
	var y=this.height-height-COHBD.bnMargin;
	var cancelBn=new Button(x,y,width,height,this.group);
	cancelBn.addText("Cancel");
	var callbackFn=function(){
		callbackFn.dialog.closeDialog();
	};
	callbackFn.dialog=this;
	cancelBn.setCallbackFunction(callbackFn,true);
	return cancelBn;
};
DiscoverDialog.prototype.createTitleRect=function(){
	var COHBD=DiscoverDialog;
	var rect=GuiElements.draw.rect(0,0,COHBD.width,COHBD.titleBarH,COHBD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
DiscoverDialog.prototype.createTitleLabel=function(){
	var Class=DiscoverDialog;
	var text = "Connect " + Class.deviceManagerClass.GetDeviceName();
	var textE=GuiElements.draw.text(0,0,text,Class.fontSize,Class.titleBarFontC,Class.font,Class.fontWeight);
	var x=Class.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=Class.titleBarH/2+Class.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
DiscoverDialog.prototype.createInstructionText=function(text){
	var Class=DiscoverDialog;
	var textE = GuiElements.draw.text(0,0,text,Class.fontSize,Class.titleBarFontC,Class.font,Class.fontWeight);
	var x=Class.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=Class.titleBarH+Class.charHeight + Class.instrTextMargin;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
