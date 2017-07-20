/**
 * Created by Tom on 6/18/2017.
 */
function ConnectMultipleDialog(deviceClass){
	let CMD = ConnectMultipleDialog;
	CMD.lastClass = deviceClass;
	let title = "Connect Multiple";
	this.deviceClass = deviceClass;
	let count = deviceClass.getManager().getDeviceCount();
	RowDialog.call(this, false, title, count, CMD.tabRowHeight, CMD.extraBottomSpace, CMD.tabRowHeight - 1);
	this.addCenteredButton("Done", this.closeDialog.bind(this));
	this.addHintText("Tap \"+\" to connect");
}
ConnectMultipleDialog.prototype = Object.create(RowDialog.prototype);
ConnectMultipleDialog.prototype.constructor = ConnectMultipleDialog;
ConnectMultipleDialog.setConstants = function(){
	let CMD = ConnectMultipleDialog;
	CMD.currentDialog = null;

	CMD.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
	CMD.tabRowHeight = RowDialog.titleBarH;
	CMD.numberWidth = 35;
	CMD.plusFont = Font.uiFont(26);

	CMD.numberFont = Font.uiFont(16);
	CMD.numberColor = Colors.white;
};
ConnectMultipleDialog.prototype.createRow = function(index, y, width, contentGroup){
	let CMD = ConnectMultipleDialog;
	let statusX = 0;
	let numberX = statusX + DeviceStatusLight.radius * 2;
	let mainBnX = numberX + CMD.numberWidth;
	let mainBnWidth = width - (RowDialog.smallBnWidth + RowDialog.bnMargin) * 2 - mainBnX;
	let infoBnX = mainBnX + RowDialog.bnMargin + mainBnWidth;
	let removeBnX = infoBnX + RowDialog.bnMargin + RowDialog.smallBnWidth;


	let robot = this.deviceClass.getManager().getDevice(index);
	this.createStatusLight(robot, statusX, y, contentGroup);
	this.createNumberText(index, numberX, y, contentGroup);
	this.createMainBn(robot, index, mainBnWidth, mainBnX, y, contentGroup);
	this.createInfoBn(robot, index, infoBnX, y, contentGroup);
	this.createRemoveBn(robot, index, removeBnX, y, contentGroup);
};
ConnectMultipleDialog.prototype.createStatusLight = function(robot, x, y, contentGroup){
	return new DeviceStatusLight(x,y+RowDialog.bnHeight/2,contentGroup,robot);
};
ConnectMultipleDialog.prototype.createNumberText = function(index, x, y, contentGroup){
	let CMD = ConnectMultipleDialog;
	let textE = GuiElements.draw.text(0, 0, (index + 1) + "", CMD.numberFont, CMD.numberColor);
	let textW = GuiElements.measure.textWidth(textE);
	let textX = x + (CMD.numberWidth - textW) / 2;
	let textY = y + (RowDialog.bnHeight + CMD.numberFont.charHeight) / 2;
	GuiElements.move.text(textE, textX, textY);
	contentGroup.appendChild(textE);
	return textE;
};
ConnectMultipleDialog.prototype.createMainBn = function(robot, index, bnWidth, x, y, contentGroup){
	let connectionX = this.x + this.width / 2;
	return RowDialog.createMainBnWithText(robot.name, bnWidth, x, y, contentGroup, function(){
		let upperY = this.contentRelToAbsY(y);
		let lowerY = this.contentRelToAbsY(y + RowDialog.bnHeight);
		(new RobotConnectionList(connectionX, upperY, lowerY, index, this.deviceClass)).show();
	}.bind(this));
};
ConnectMultipleDialog.prototype.createRemoveBn = function(robot, index, x, y, contentGroup){
	let button = RowDialog.createSmallBn(x, y, contentGroup);
	button.addText("X");
	button.setCallbackFunction(function(){
		this.deviceClass.getManager().removeDevice(index);
	}.bind(this), true);
	return button;
};
ConnectMultipleDialog.prototype.createInfoBn = function(robot, index, x, y, contentGroup){
	let button = RowDialog.createSmallBn(x, y, contentGroup, robot.showFirmwareInfo.bind(robot));

	const statuses = Device.firmwareStatuses;
	function updateStatus(firmwareStatus) {
		if(firmwareStatus === statuses.old) {
			button.addColorIcon(VectorPaths.warning, RowDialog.iconH, DeviceStatusLight.yellowColor);
		} else if(firmwareStatus === statuses.incompatible) {
			button.addColorIcon(VectorPaths.warning, RowDialog.iconH, DeviceStatusLight.redColor);
		} else {
			button.addIcon(VectorPaths.info, RowDialog.iconH);
		}
	}
	updateStatus(robot.getFirmwareStatus());
	robot.setFirmwareStatusListener(updateStatus);

	return button;
};
ConnectMultipleDialog.prototype.show = function(){
	let CMD = ConnectMultipleDialog;
	CMD.currentDialog = this;
	RowDialog.prototype.show.call(this);
	this.createConnectBn();
	this.createTabRow();
	this.deviceClass.getManager().discover();
};
ConnectMultipleDialog.prototype.createConnectBn = function(){
	let CMD = ConnectMultipleDialog;
	let bnWidth = this.getContentWidth() - RowDialog.smallBnWidth - DeviceStatusLight.radius * 2 - CMD.numberWidth;
	let x = (this.width - bnWidth) / 2;
	let y = this.getExtraBottomY();
	let button=new Button(x,y,bnWidth,RowDialog.bnHeight, this.group);
	button.addText("+", CMD.plusFont);
	let upperY = y + this.y;
	let lowerY = upperY + RowDialog.bnHeight;
	let connectionX = this.x + this.width / 2;
	button.setCallbackFunction(function(){
		(new RobotConnectionList(connectionX, upperY, lowerY, null, this.deviceClass)).show();
	}.bind(this), true);
	return button;
};
ConnectMultipleDialog.prototype.createTabRow = function(){
	let CMD = ConnectMultipleDialog;
	let selectedIndex = Device.getTypeList().indexOf(this.deviceClass);
	let y = this.getExtraTopY();
	let tabRow = new TabRow(0, y, this.width, CMD.tabRowHeight, this.group, selectedIndex);
	Device.getTypeList().forEach(function(deviceClass){
		tabRow.addTab(deviceClass.getDeviceTypeName(false), deviceClass);
	});
	tabRow.setCallbackFunction(this.reloadDialog.bind(this));
	tabRow.show();
	return tabRow;
};
ConnectMultipleDialog.prototype.reloadDialog = function(deviceClass){
	const test = ConnectMultipleDialog.currentDialog;
	if(deviceClass == null){
		deviceClass = this.deviceClass;
	}
	if(deviceClass !== this.deviceClass){
		this.deviceClass.getManager().stopDiscover();
	}
	let thisScroll = this.getScroll();
	let me = this;
	me.hide();
	let dialog = new ConnectMultipleDialog(deviceClass);
	dialog.show();
	if(deviceClass === this.deviceClass) {
		dialog.setScroll(thisScroll);
	}
};
ConnectMultipleDialog.prototype.closeDialog = function(){
	let CMD = ConnectMultipleDialog;
	RowDialog.prototype.closeDialog.call(this);
	CMD.currentDialog = null;
	this.deviceClass.getManager().stopDiscover();
};
ConnectMultipleDialog.reloadDialog = function(){
	let CMD = ConnectMultipleDialog;
	if(CMD.currentDialog != null){
		CMD.currentDialog.reloadDialog();
	}
};
ConnectMultipleDialog.showDialog = function(){
	let CMD = ConnectMultipleDialog;
	if(CMD.lastClass == null) {
		CMD.lastClass = Device.getTypeList()[0];
	}
	(new ConnectMultipleDialog(CMD.lastClass)).show();
};