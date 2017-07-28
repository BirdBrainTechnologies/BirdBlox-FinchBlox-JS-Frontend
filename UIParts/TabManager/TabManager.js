/**
 * When BirdBlox was created, we initially were going to have tabs on the main canvas for different sprites.
 * All messages to blocks are passed from TabManager > Tab > BlockStack > Block > Slot > etc.
 * We decided not to have tabs, so there's just one tab, which is generated and controlled by the TabManager.
 *
 * The TabManager's main job is passing messages to the active tab
 */
function TabManager() {
	const TM = TabManager;
	TM.tabList = [];
	TM.activeTab = null;
	TM.createInitialTab();
	TabManager.createTabSpaceBg();
	TM.isRunning = false;
	TM.scrolling = false;
	TM.zooming = false;
}

TabManager.setGraphics = function() {
	const TM = TabManager;
	TM.bg = Colors.black;

	TM.minZoom = 0.35;
	TM.maxZoom = 3;

	TM.tabAreaX = BlockPalette.width;
	if (GuiElements.smallMode) {
		TM.tabAreaX = 0;
	}
	TM.tabAreaY = TitleBar.height;
	TM.tabAreaWidth = GuiElements.width - TM.tabAreaXh;

	/* No longer different from tabArea since tab bar was removed */
	TM.tabSpaceX = TM.tabAreaX;
	TM.tabSpaceY = TitleBar.height;
	TM.tabSpaceWidth = GuiElements.width - TM.tabSpaceX;
	TM.tabSpaceHeight = GuiElements.height - TM.tabSpaceY;
	TM.spaceScrollMargin = 50;
	TM.undoDeleteMarginBase = 40;
	TM.undoDeleteMarginRand = 40;
};

/**
 * Creates the rectangle for the canvas
 */
TabManager.createTabSpaceBg = function() {
	const TM = TabManager;
	TM.bgRect = GuiElements.draw.rect(TM.tabSpaceX, TM.tabSpaceY, TM.tabSpaceWidth, TM.tabSpaceHeight, Colors.lightGray);
	TouchReceiver.addListenersTabSpace(TM.bgRect);
	GuiElements.layers.aTabBg.appendChild(TM.bgRect);
};

/**
 * Adds a Tab to the list (called in Tab constructor)
 * @param {Tab} tab
 */
TabManager.addTab = function(tab) {
	TabManager.tabList.push(tab);
};

/**
 * Removes a tab from the list
 * @param {Tab} tab
 */
TabManager.removeTab = function(tab) {
	const index = TabManager.tabList.indexOf(tab);
	TabManager.stackList.splice(index, 1);
};

/**
 * Creates a tab to be the initial Tab
 */
TabManager.createInitialTab = function() {
	const TM = TabManager;
	const t = new Tab();
	TM.activateTab(TM.tabList[0]);
};

/**
 * Sets a tab as the active Tab
 * @param {Tab} tab
 */
TabManager.activateTab = function(tab) {
	tab.activate();
	TabManager.activeTab = tab;
};

/**
 * Tells each Tab to update execution
 * @return {ExecutionStatus} - Whether the tab is currently running
 */
TabManager.updateRun = function() {
	if (!this.isRunning) {
		return new ExecutionStatusDone();
	}
	let rVal = false;
	for (let i = 0; i < TabManager.tabList.length; i++) {
		rVal = TabManager.tabList[i].updateRun().isRunning() || rVal;
	}
	this.isRunning = rVal;
	if (this.isRunning) {
		return new ExecutionStatusRunning();
	} else {
		return new ExecutionStatusDone();
	}
};

/**
 * Stops execution in the tab
 */
TabManager.stop = function() {
	TabManager.passRecursively("stop");
	this.isRunning = false;
};

/**
 * Tells the tab to stop execution everywhere except one stack
 * @param {BlockStack} stack
 */
TabManager.stopAllButStack = function(stack) {
	TabManager.passRecursively("stopAllButStack", stack);
};

/**
 * Passes message up from Tab to start execution
 */
TabManager.startRun = function() {
	TabManager.isRunning = true;
	CodeManager.startUpdateTimer();
};

/* The TabManager tracks information about scrolling before passing messages to the tab.  This way the TouchReceiver
 * can send messages straight to the TabManager instead of trying to find the active Tab */
/**
 * Passes message to Tab
 * @param {number} x
 * @param {number} y
 */
TabManager.startScroll = function(x, y) {
	const TM = TabManager;
	if (!TM.scrolling) {
		TM.scrolling = true;
		TM.activeTab.startScroll(x, y);
	}
};
/**
 * Passes message to Tab
 * @param {number} x
 * @param {number} y
 */
TabManager.updateScroll = function(x, y) {
	const TM = TabManager;
	if (TM.scrolling) {
		TM.activeTab.updateScroll(x, y);
	}
};
/**
 * Passes message to Tab
 */
TabManager.endScroll = function() {
	const TM = TabManager;
	if (TM.scrolling) {
		TM.scrolling = false;
		TM.activeTab.endScroll();
	}
};
/**
 * Passes message to Tab
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
TabManager.startZooming = function(x1, y1, x2, y2) {
	const TM = TabManager;
	if (!TM.zooming) {
		TM.zooming = true;
		TM.activeTab.startZooming(x1, y1, x2, y2);
	}
};
/**
 * Passes message to Tab
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
TabManager.updateZooming = function(x1, y1, x2, y2) {
	const TM = TabManager;
	if (TM.zooming) {
		TM.activeTab.updateZooming(x1, y1, x2, y2);
	}
};
/**
 * Passes message to Tab
 */
TabManager.endZooming = function() {
	const TM = TabManager;
	if (TM.zooming) {
		TM.zooming = false;
		TM.activeTab.endZooming();
	}
};

/**
 * Tells tab to restore a deleted stack from XML data
 * @param {Node} stackNode - The node to get the data from
 * @return {boolean} - Whether the data was valid
 */
TabManager.undoDelete = function(stackNode) {
	return TabManager.activeTab.undoDelete(stackNode);
};

/**
 * Generates XML for the all the Tabs
 * @param {Document} xmlDoc - The document to write to
 * @return {Node} - The XML node containing the data
 */
TabManager.createXml = function(xmlDoc) {
	const TM = TabManager;
	const tabs = XmlWriter.createElement(xmlDoc, "tabs");
	for (let i = 0; i < TM.tabList.length; i++) {
		tabs.appendChild(TM.tabList[i].createXml(xmlDoc));
	}
	return tabs;
};

/**
 * Imports the Tab data from the XML
 * @param {Node} tabsNode - The XML node containing information about the Tabs
 */
TabManager.importXml = function(tabsNode) {
	const TM = TabManager;
	if (tabsNode != null) {
		const tabNodes = XmlWriter.findSubElements(tabsNode, "tab");
		for (let i = 0; i < tabNodes.length; i++) {
			Tab.importXml(tabNodes[i]);
		}
	}
	if (TM.tabList.length === 0) {
		TM.createInitialTab();
	} else {
		TM.activateTab(TM.tabList[0]);
	}
};

/**
 * Clears and removes all tabs
 */
TabManager.deleteAll = function() {
	const TM = TabManager;
	for (let i = 0; i < TM.tabList.length; i++) {
		TM.tabList[i].delete();
	}
	TM.tabList = [];
	TM.activeTab = null;
	TM.isRunning = false;
	TM.scrolling = false;
};

/* Messages passed directly to tabs */
TabManager.eventFlagClicked = function() {
	TabManager.passRecursively("eventFlagClicked");
};
/**
 * @param {string} message
 */
TabManager.eventBroadcast = function(message) {
	TabManager.passRecursively("eventBroadcast", message);
};
TabManager.updateAvailableMessages = function() {
	TabManager.passRecursively("updateAvailableMessages");
};
/**
 * @param {Variable} variable
 */
TabManager.renameVariable = function(variable) {
	TabManager.passRecursively("renameVariable", variable);
};
/**
 * @param {Variable} variable
 */
TabManager.deleteVariable = function(variable) {
	TabManager.passRecursively("deleteVariable", variable);
};
/**
 * @param {List} list
 */
TabManager.renameList = function(list) {
	TabManager.passRecursively("renameList", list);
};
/**
 * @param {List} list
 */
TabManager.deleteList = function(list) {
	TabManager.passRecursively("deleteList", list);
};

/* Recursive functions that return true if any tab returns true */
/**
 * @param {string} message
 * @return {boolean}
 */
TabManager.checkBroadcastRunning = function(message) {
	if (this.isRunning) {
		for (let i = 0; i < TabManager.tabList.length; i++) {
			if (TabManager.tabList[i].checkBroadcastRunning(message)) {
				return true;
			}
		}
	}
	return false;
};
/**
 * @param {Variable} variable
 * @return {boolean}
 */
TabManager.checkVariableUsed = function(variable) {
	for (let i = 0; i < TabManager.tabList.length; i++) {
		if (TabManager.tabList[i].checkVariableUsed(variable)) {
			return true;
		}
	}
	return false;
};
/**
 * @param {List} list
 * @return {boolean}
 */
TabManager.checkListUsed = function(list) {
	for (let i = 0; i < TabManager.tabList.length; i++) {
		if (TabManager.tabList[i].checkListUsed(list)) {
			return true;
		}
	}
	return false;
};

/**
 * Returns the maximum selected value of all the DeviceDropSlots for a certain type of device
 * @param deviceClass - Subclass of device
 * @return {number}
 */
TabManager.countDevicesInUse = function(deviceClass) {
	let largest = 0;
	for (let i = 0; i < TabManager.tabList.length; i++) {
		largest = Math.max(largest, TabManager.tabList[i].countDevicesInUse(deviceClass));
	}
	return largest;
};

/**
 * Passes a message down to the Blocks/Slots in the TabManager
 * @param {string} message - The message to send.  Probably a function in the target object
 */
TabManager.passRecursivelyDown = function(message) {
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	TabManager.passRecursively.apply(TabManager, arguments);
};

/**
 * Calls the function on all Tabs in this TabManager
 * @param {function} functionName - The name of the function to call
 */
TabManager.passRecursively = function(functionName) {
	const args = Array.prototype.slice.call(arguments, 1);
	for (let i = 0; i < TabManager.tabList.length; i++) {
		const currentList = TabManager.tabList[i];
		currentList[functionName].apply(currentList, args);
	}
};

/**
 * Updates the background rectangle and tells children to update dimensions
 */
TabManager.updateZoom = function() {
	const TM = TabManager;
	TM.setGraphics();
	GuiElements.update.rect(TM.bgRect, TM.tabSpaceX, TM.tabSpaceY, TM.tabSpaceWidth, TM.tabSpaceHeight);
	TabManager.passRecursively("updateZoom");
};

/**
 * Gets the zoom level of the active tab
 * @return {number}
 */
TabManager.getActiveZoom = function() {
	if (TabManager.activeTab == null) {
		return 1;
	}
	return TabManager.activeTab.getZoom();
};