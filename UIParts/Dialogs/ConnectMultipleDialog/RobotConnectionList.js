/**
 * Provides a list of Robots of a certain type to connect to in a BubbleOverlay.  Updates as new robots are found.
 * The list might be associated with a specific slot of the ConnectMultipleDialog, in which case it will not list
 * the robot that is currently in that slot and will allow robots in different slots to be selected to swap places
 * with them.
 * @param {number} x - The x coord of the point of the bubble
 * @param {number} upperY - The y coord if the bubble points up
 * @param {number} lowerY - The y coord if the bubble points down
 * @param {number|null} [index] - The index of slot this list is associated with, or null if N/A
 * @param deviceClass - Subclass of Device to scan for
 * @constructor
 */
function RobotConnectionList(x, upperY, lowerY, index) {
	if (index == null) {
		index = null;
	}
	this.x = x;
	this.upperY = upperY;
	this.lowerY = lowerY;
	this.index = index;
	this.deviceClass = DeviceHummingbirdBit;
	this.visible = false;

	/* Sometimes the list is told to update its entries but can't since it is currently being scrolled.  In that case,
	 * marks a pending update and starts a timer which keeps trying to update until it succeeds */
	this.updatePending = false;
	this.updateTimer = new Timer(1000, this.checkPendingUpdate.bind(this));
}

RobotConnectionList.setConstants = function() {
	let RCL = RobotConnectionList;
	RCL.bnMargin = 5;
	RCL.bgColor = Colors.lightGray;
	RCL.updateInterval = DiscoverDialog.updateInterval;
	RCL.height = 150;
	RCL.width = 200;
};

/**
 * Makes the list visible with whatever devices have been detected so far (according to the cache in DeviceManager)
 */
RobotConnectionList.prototype.show = function() {
	this.showWithList(this.deviceClass.getManager().getDiscoverCache());
};

/**
 * Shows the RobotConnectionList with entries for the robots on the provided JSON-encoded list
 * @param {string} list - A JSON-encoded list of robots as a string
 */
RobotConnectionList.prototype.showWithList = function(list) {
	let RCL = RobotConnectionList;
	this.visible = true;
	this.group = GuiElements.create.group(0, 0);
	this.menuBnList = null;
	let layer = GuiElements.layers.overlayOverlay;
	let overlayType = Overlay.types.connectionList;
	this.bubbleOverlay = new BubbleOverlay(overlayType, RCL.bgColor, RCL.bnMargin, this.group, this, layer);
	this.bubbleOverlay.display(this.x, this.x, this.upperY, this.lowerY, RCL.width, RCL.height);
	this.deviceClass.getManager().registerDiscoverCallback(this.updateRobotList.bind(this));
	this.updateRobotList(list);
};

/**
 * Checks if the list needs to be updated and tries if it does
 */
RobotConnectionList.prototype.checkPendingUpdate = function() {
	if (this.updatePending) {
		this.updateRobotList(this.deviceClass.getManager().getDiscoverCache());
	}
};

/**
 * Updates the RobotConnectionList to contain the robots in the provided list
 * @param {string} jsonArray - A JSON-encoded array of robots as a string
 */
RobotConnectionList.prototype.updateRobotList = function(jsonArray) {
	const RCL = RobotConnectionList;
	let isScrolling = this.menuBnList != null && this.menuBnList.isScrolling();
	if (TouchReceiver.touchDown || !this.visible || isScrolling) {
		// Can't update, mark update pending and return
		this.updatePending = true;
		this.updateTimer.start();
		return;
	}
	// We're updating, so the pending update is cleared
	this.updatePending = false;
	this.updateTimer.stop();
	/* We include connected devices if this list is associated with a slot of the ConnectMultipleDialog to allow
	 * Robots to swap places. */
	const includeConnected = this.index !== null;
	const robotArray = this.deviceClass.getManager().fromJsonArrayString(jsonArray, includeConnected, this.index);

	// We perform the update and try to keep the scrolling the same
	let oldScroll = null;
	if (this.menuBnList != null) {
		oldScroll = this.menuBnList.getScroll();
		this.menuBnList.hide();
	}
	let layer = GuiElements.layers.overlayOverlayScroll;
	this.menuBnList = new SmoothMenuBnList(this, this.group, 0, 0, RCL.width, layer);
	this.menuBnList.markAsOverlayPart(this.bubbleOverlay);
	this.menuBnList.setMaxHeight(RCL.height);
	for (let i = 0; i < robotArray.length; i++) {
		this.addBnListOption(robotArray[i]);
	}
	this.menuBnList.show();
	if (oldScroll != null) {
		this.menuBnList.setScroll(oldScroll);
	}
};

/**
 * Adds an option to the menuBnList for the provided robot
 * @param {Device} robot
 */
RobotConnectionList.prototype.addBnListOption = function(robot) {
	let me = this;
	var words = robot.name.split(" ");
    	var newName = "";
        for (var i = 0; i < words.length; i++) {
            newName += words[i][0];
        };
	this.menuBnList.addOption(newName + " - " + robot.name, function() {
		me.close();
		if (me.index == null) {
		    me.deviceClass = DeviceManager.getDeviceClass(robot);

			me.deviceClass.getManager().appendDevice(robot);
		} else {
			me.deviceClass.getManager().setOrSwapDevice(me.index, robot);
		}
	});
};

/**
 * Closes the list
 */
RobotConnectionList.prototype.close = function() {
	this.bubbleOverlay.hide();
	this.visible = false;
	this.updateTimer.stop();
	if (this.menuBnList != null) this.menuBnList.hide();
};

/* Convert between relative and absolute coordinates */
RobotConnectionList.prototype.relToAbsX = function(x) {
	if (!this.visible) return x;
	return this.bubbleOverlay.relToAbsX(x);
};
RobotConnectionList.prototype.relToAbsY = function(y) {
	if (!this.visible) return y;
	return this.bubbleOverlay.relToAbsY(y);
};