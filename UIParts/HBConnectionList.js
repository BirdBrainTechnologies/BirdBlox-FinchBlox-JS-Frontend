function HBConnectionList(x,upperY,lowerY,hBToReplace){
	var HBCL=HBConnectionList;
	this.group=GuiElements.create.group(0,0);
	this.menuBnList=null;
	this.bubbleOverlay=new BubbleOverlay(HBCL.bgColor,HBCL.bnMargin,this.group,this);
	this.bubbleOverlay.display(x,upperY,lowerY,HBCL.width,HBCL.height);
	var thisHBCL=this;
	this.updateTimer = self.setInterval(function () { thisHBCL.discoverHBs() }, HBCL.updateInterval);
	this.hBToReplace=hBToReplace;
	this.discoverHBs();
}
HBConnectionList.setConstants=function(){
	var HBCL=HBConnectionList;
	HBCL.bnMargin=7;
	HBCL.bgColor="#171717";
	HBCL.updateInterval=ConnectOneHBDialog.updateInterval;
	HBCL.height=150;
	HBCL.width=200;
};
HBConnectionList.prototype.discoverHBs=function(){
	var thisHBCL=this;
	HtmlServer.sendRequestWithCallback("hummingbird/discover",function(response){
		thisHBCL.updateHBList(response);
	});
};
HBConnectionList.prototype.updateHBList=function(newHBs){
	if(TouchReceiver.touchDown){
		return;
	}
	var HBCL=HBConnectionList;
	var oldScroll=0;
	if(this.menuBnList!=null){
		oldScroll=this.menuBnList.scrollY;
		this.menuBnList.hide();
	}
	this.menuBnList=new MenuBnList(this.group,0,0,HBCL.bnMargin,HBCL.width);
	this.menuBnList.isOverlayPart=true;
	this.menuBnList.setMaxHeight(HBCL.height);
	var hBArray=newHBs.split("\n");
	if(newHBs==""){
		hBArray=[];
	}
	for(var i=0;i<hBArray.length;i++) {
		this.addBnListOption(hBArray[i]);
	}
	this.menuBnList.show();
	this.menuBnList.scroll(oldScroll);
};
HBConnectionList.prototype.addBnListOption=function(hBName){
	var HBCL=HBConnectionList;
	var hBToReplace=this.hBToReplace;
	var thisHBCL=this;
	this.menuBnList.addOption(hBName,function(){
		thisHBCL.close();
		HummingbirdManager.replaceHBConnection(hBToReplace,hBName,ConnectMultipleHBDialog.reloadDialog);
	});
};
HBConnectionList.prototype.close=function(){
	this.updateTimer=window.clearInterval(this.updateTimer);
	this.bubbleOverlay.hide();
};