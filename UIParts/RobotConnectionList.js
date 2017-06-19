/**
 * Created by Tom on 6/19/2017.
 */
function RobotConnectionList(x,upperY,lowerY,index,deviceClass){
	if(index == null){
		index = null;
	}
	this.x = x;
	this.upperY = upperY;
	this.lowerY = lowerY;
	this.index = index;
	this.deviceClass = deviceClass;
	this.visible = false;
}
RobotConnectionList.setConstants = function(){
	let RCL=RobotConnectionList;
	RCL.bnMargin = 5;
	RCL.bgColor="#171717";
	RCL.updateInterval=DiscoverDialog.updateInterval;
	RCL.height=150;
	RCL.width=200;
};
RobotConnectionList.prototype.show = function(){
	let RCL = RobotConnectionList;
	this.visible = true;
	this.group=GuiElements.create.group(0,0);
	this.menuBnList = null;
	let layer = GuiElements.layers.overlayOverlay;
	this.bubbleOverlay=new BubbleOverlay(RCL.bgColor,RCL.bnMargin,this.group,this,null,layer);
	this.bubbleOverlay.display(this.x,this.x,this.upperY,this.lowerY,RCL.width,RCL.height);
	this.updateTimer = self.setInterval(this.discoverRobots.bind(this), RCL.updateInterval);
	this.discoverRobots();
};
RobotConnectionList.prototype.discoverRobots=function(){
	let me = this;
	HtmlServer.sendRequestWithCallback("hummingbird/discover",function(response){
		me.updateRobotList(response);
	},function(){
		if(DiscoverDialog.allowVirtualDevices){
			me.updateRobotList('[{"id":"Virtual HB1"},{"id":"Virtual HB2"}]');
		}
	});
};
RobotConnectionList.prototype.updateRobotList=function(newRobots){
	const RCL = RobotConnectionList;
	let isScrolling = this.menuBnList != null && this.menuBnList.isScrolling();
	if(TouchReceiver.touchDown || !this.visible || isScrolling){
		return;
	}
	let robotArray = Device.fromJsonArrayString(this.deviceClass, newRobots);
	let oldScroll=0;
	if(this.menuBnList!=null){
		oldScroll=this.menuBnList.getScroll();
		this.menuBnList.hide();
	}
	let layer = GuiElements.layers.overlayOverlayScroll;
	this.menuBnList=new SmoothMenuBnList(this,this.group,0,0,RCL.width,layer);
	this.menuBnList.markAsOverlayPart();
	this.menuBnList.setMaxHeight(RCL.height);
	for(let i=0; i < robotArray.length;i++) {
		this.addBnListOption(robotArray[i]);
	}
	this.menuBnList.show();
	this.menuBnList.setScroll(oldScroll);
};
RobotConnectionList.prototype.addBnListOption=function(robot){
	let me = this;
	this.menuBnList.addOption(robot.name,function(){
		me.close();
		if(me.index == null){
			me.deviceClass.getManager().appendDevice(robot);
		} else {
			me.deviceClass.getManager().setDevice(me.index, robot);
		}
	});
};
RobotConnectionList.prototype.close=function(){
	this.updateTimer=window.clearInterval(this.updateTimer);
	this.bubbleOverlay.hide();
	this.visible = false;
	if(this.menuBnList != null) this.menuBnList.hide();
};
RobotConnectionList.prototype.relToAbsX = function(x){
	if(!this.visible) return x;
	return this.bubbleOverlay.relToAbsX(x);
};
RobotConnectionList.prototype.relToAbsY = function(y){
	if(!this.visible) return y;
	return this.bubbleOverlay.relToAbsY(y);
};