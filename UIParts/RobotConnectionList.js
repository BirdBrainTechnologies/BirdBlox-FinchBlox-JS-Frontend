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
	if(index != null){
		this.robotId = this.deviceClass.getManager().getDevice(index);
	}
	this.updatePending = false;
	this.updateTimer = new Timer(1000, this.checkPendingUpdate.bind(this));
}
RobotConnectionList.setConstants = function(){
	let RCL=RobotConnectionList;
	RCL.bnMargin = 5;
	RCL.bgColor=Colors.lightGray; //"#171717";
	RCL.updateInterval=DiscoverDialog.updateInterval;
	RCL.height=150;
	RCL.width=200;
};
RobotConnectionList.prototype.show = function(){
	this.showWithList(this.deviceClass.getManager().getDiscoverCache());
};
RobotConnectionList.prototype.showWithList = function(list){
	let RCL = RobotConnectionList;
	this.visible = true;
	this.group=GuiElements.create.group(0,0);
	this.menuBnList = null;
	let layer = GuiElements.layers.overlayOverlay;
	let overlayType = Overlay.types.connectionList;
	this.bubbleOverlay=new BubbleOverlay(overlayType, RCL.bgColor,RCL.bnMargin,this.group,this,layer);
	this.bubbleOverlay.display(this.x,this.x,this.upperY,this.lowerY,RCL.width,RCL.height);
	this.deviceClass.getManager().registerDiscoverCallback(this.updateRobotList.bind(this));
	this.updateRobotList(list);
};
RobotConnectionList.prototype.checkPendingUpdate = function(){
	if(this.updatePending){
		this.updateRobotList(this.deviceClass.getManager().getDiscoverCache());
	}
};
RobotConnectionList.prototype.updateRobotList=function(robotArray){
	const RCL = RobotConnectionList;
	let isScrolling = this.menuBnList != null && this.menuBnList.isScrolling();
	if(TouchReceiver.touchDown || !this.visible || isScrolling){
		this.updatePending = true;
		this.updateTimer.start();
		return;
	}
	this.updatePending = false;
	this.updateTimer.stop();
	const includeConnected = this.index !== null;
	robotArray = this.deviceClass.getManager().fromJsonArrayString(robotArray, includeConnected, this.index);
	let oldScroll=null;
	if(this.menuBnList!=null){
		oldScroll=this.menuBnList.getScroll();
		this.menuBnList.hide();
	}
	let layer = GuiElements.layers.overlayOverlayScroll;
	this.menuBnList=new SmoothMenuBnList(this,this.group,0,0,RCL.width,layer);
	this.menuBnList.markAsOverlayPart(this.bubbleOverlay);
	this.menuBnList.setMaxHeight(RCL.height);
	for(let i=0; i < robotArray.length;i++) {
		this.addBnListOption(robotArray[i]);
	}
	this.menuBnList.show();
	if(oldScroll != null) {
		this.menuBnList.setScroll(oldScroll);
	}
};
RobotConnectionList.prototype.addBnListOption=function(robot){
	let me = this;
	this.menuBnList.addOption(robot.name,function(){
		me.close();
		if(me.index == null){
			me.deviceClass.getManager().appendDevice(robot);
		} else {
			me.deviceClass.getManager().setOrSwapDevice(me.index, robot);
		}
	});
};
RobotConnectionList.prototype.close=function(){
	this.bubbleOverlay.hide();
	this.visible = false;
	this.updateTimer.stop();
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