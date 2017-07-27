"use strict";

/**
 * CodeManager is a static class that controls block execution. It also moves the BlockStack that the user is dragging,
 * keeps track of variables/lists, and passes messages to Blocks/Stacks/Slots/Tabs
 */
function CodeManager() {
	const move = CodeManager.move;   // shorthand
	move.moving = false;   // Is there a BlockStack that is currently moving?
	move.stack = null;   // Reference to BlockStack that is currently moving.
	move.offsetX = 0;   // The difference between the BlockStack's x and the touch x.
	move.offsetY = 0;   // The difference between the BlockStack's y and the touch y.
	move.touchX = 0;   // The x coord of the user's finger.
	move.touchY = 0;   // The y coord of the user's finger.
	move.topX = 0;   // The top-left corner's x coord of the BlockStack being moved.
	move.topY = 0;   // The top-left corner's y-coord of the BlockStack being moved.
	move.bottomX = 0;   // The bottom-right corner
	move.bottomY = 0;
	move.startedFromPalette = false;   // Whether the block being dragged originated from the BLockPalette
	// The return type of the BlockStack. (none unless it is a reporter, predicate, etc.)
	move.returnType = null;
	// Stores information used when determine which slot is closest to the moving stack.
	CodeManager.fit = {};

	CodeManager.variableList = [];   // A list of all the variables the user has created
	CodeManager.listList = [];   // A list of all the lists the user has created
	CodeManager.broadcastList = [];   // A list of broadcast messages in use.

	CodeManager.isRunning = false;   // Are at least some Blocks currently executing?

	CodeManager.updateTimer = null;   // A timer which tells executing Blocks to update.
	CodeManager.updateInterval = 10;   // How quickly does the update timer fire (in ms)?

	// Stores the answer to the "ask" block. When the app first opens, the answer is an empty string.
	CodeManager.answer = new StringData("");
	CodeManager.message = new StringData("");   // Stores the broadcast message.

	CodeManager.sound = {};   // Store data for sound playback
	CodeManager.sound.tempo = 60;   // Default tempo is 60 bpm for sound blocks.
	CodeManager.sound.volume = 50;   // Default volume if 50%.

	CodeManager.timerForSensingBlock = new Date().getTime();   // Initialize the timer to the current time.

	// Track creation and modified times for the current file
	// TODO: move this into SaveManager
	CodeManager.modifiedTime = new Date().getTime();
	CodeManager.createdTime = new Date().getTime();
}

/* CodeManager.move contains function to start, stop, and update the movement of a BlockStack.
 * These functions are called by the TouchReceiver class when the user drags a BlockStack. */
CodeManager.move = {};

/**
 * Picks up a Block so that it can be moved.  Stores necessary information in CodeManager.move.
 * Transfers the BlockStack into the drag layer above other blocks.
 * @param {Block} block - The block the user dragged.
 * @param {number} x - The x coord of the user's finger.
 * @param {number} y - The y coord of the user's finger.
 */
CodeManager.move.start = function(block, x, y) {
	const move = CodeManager.move;   // shorthand
	if (!move.moving) {   // Only start moving the Block if no other Blocks are moving.
		Overlay.closeOverlays();   // Close any visible overlays.
		move.moving = true;   // Record that a Block is now moving.
		/* Disconnect the Block from its current BlockStack to form a new BlockStack 
		containing only the Block and the Blocks below it. */
		const stack = block.unsnap();
		stack.fly();   // Make the new BlockStack fly (moves it into the drag layer).
		move.bottomX = stack.relToAbsX(stack.dim.rw);   // Store the BlockStack's dimensions.
		move.bottomY = stack.relToAbsY(stack.dim.rh);
		move.returnType = stack.returnType;   // Store the BlockStack's return type.
		move.startedFromPalette = BlockPalette.isStackOverPalette(x, y);

		// Store other information about how the BlockStack can connect to other Blocks.
		move.bottomOpen = stack.getLastBlock().bottomOpen;
		move.topOpen = stack.firstBlock.topOpen;
		move.returnsValue = stack.firstBlock.returnsValue;

		move.touchX = x;   // Store coords
		move.touchY = y;
		move.offsetX = stack.getAbsX() - x;   // Store offset.
		move.offsetY = stack.getAbsY() - y;
		move.stack = stack;   // Store stack.
	}
};

/**
 * Updates the position of the currently moving BlockStack.
 * Also highlights the slot that fits it best (if any).
 * @param {number} x - The x coord of the user's finger.
 * @param {number} y - The y coord of the user's finger.
 */
CodeManager.move.update = function(x, y) {
	const move = CodeManager.move;   // shorthand
	if (move.moving) {   // Only update if a BlockStack is currently moving.
		move.touchX = x;
		move.touchY = y;
		move.topX = move.offsetX + x;
		move.topY = move.offsetY + y;
		move.bottomX = move.stack.relToAbsX(move.stack.dim.rw);
		move.bottomY = move.stack.relToAbsY(move.stack.dim.rh);
		// Move the BlockStack to the correct location.
		move.stack.move(CodeManager.dragAbsToRelX(move.topX), CodeManager.dragAbsToRelY(move.topY));
		// If the BlockStack overlaps with the BlockPalette then no slots are highlighted.
		if (BlockPalette.isStackOverPalette(move.touchX, move.touchY)) {
			Highlighter.hide();   // Hide any existing highlight.
			if (!move.startedFromPalette) {
				BlockPalette.showTrash();
			}
		} else {
			BlockPalette.hideTrash();
			// The slot which fits it best (if any) will be stored in CodeManager.fit.bestFit.
			CodeManager.findBestFit();
			if (CodeManager.fit.found) {
				CodeManager.fit.bestFit.highlight();   // If such a slot exists, highlight it.
			} else {
				Highlighter.hide();   // If not, hide any existing highlight.
			}
		}
	}
};

/**
 * Drops the BlockStack that is currently moving and connects it to the Slot/Block that fits it.
 */
CodeManager.move.end = function() {
	const move = CodeManager.move;   // shorthand
	const fit = CodeManager.fit;   // shorthand
	if (move.moving) {   // Only run if a BlockStack is currently moving.
		move.topX = move.offsetX + move.touchX;
		move.topY = move.offsetY + move.touchY;
		move.bottomX = move.stack.relToAbsX(move.stack.dim.rw);
		move.bottomY = move.stack.relToAbsY(move.stack.dim.rh);
		// If the BlockStack overlaps with the BlockPalette, delete it.
		if (BlockPalette.isStackOverPalette(move.touchX, move.touchY)) {
			if (move.startedFromPalette) {
				move.stack.remove();
			} else {
				UndoManager.deleteStack(move.stack);
				SaveManager.markEdited();
			}
		} else {
			// The Block/Slot which fits it best (if any) will be stored in CodeManager.fit.bestFit.
			CodeManager.findBestFit();
			if (fit.found) {
				// Snap is onto the Block/Slot that fits it best.
				fit.bestFit.snap(move.stack.firstBlock);
				Sound.playSnap();
			} else {
				// If it is not going to be snapped or deleted, simply drop it onto the current tab.
				move.stack.land();
				move.stack.updateDim();   // Fix! this line of code might not be needed.
			}
			SaveManager.markEdited();
		}
		Highlighter.hide();   // Hide any existing highlight.
		move.moving = false;   // There are now no moving BlockStacks.
		BlockPalette.hideTrash();
	}
};

/**
 * Drops the BlockStack where it is without attaching it to anything or deleting it.
 */
CodeManager.move.interrupt = function() {
	const move = CodeManager.move;   // shorthand
	if (move.moving) {   // Only run if a BlockStack is currently moving.
		move.topX = move.offsetX + move.touchX;
		move.topY = move.offsetY + move.touchY;
		move.stack.land();
		move.stack.updateDim();   // Fix! this line of code might not be needed.
		Highlighter.hide();   // Hide any existing highlight.
		move.moving = false;   // There are now no moving BlockStacks.
	}
};

/**
 * Returns a boolean indicating if a point falls within a rectangular region.
 * Useful for determining which Blocks a moving BlockStack can connect to.
 * @param {number} x1 - The x coord of the point.
 * @param {number} y1 - The y coord of the point.
 * @param {number} xR - The x coord of the top-left corner of the region.
 * @param {number} yR - The y coord of the top-left corner of the region.
 * @param {number} width - The width of the region.
 * @param {number} height - The height of the region.
 * @return {boolean} - Is the point within the region?
 */
CodeManager.move.pInRange = function(x1, y1, xR, yR, width, height) {
	// Checks to see if the point is on the correct side of all four sides of the rectangular region.
	return (x1 >= xR && x1 <= xR + width && y1 >= yR && y1 <= yR + height);
};

/**
 * Returns a boolean indicating if two rectangular regions overlap.
 * Useful for determining which Slots a moving BlockStack can connect to.
 * @param {number} x1 - The x coord of the top-left corner of the first region.
 * @param {number} y1 - The y coord of the top-left corner of the first region.
 * @param {number} width1 - The width of the first region.
 * @param {number} height1 - The height of the first region.
 * @param {number} x2 - The x coord of the top-left corner of the second region.
 * @param {number} y2 - The y coord of the top-left corner of the second region.
 * @param {number} width2 - The width of the second region.
 * @param {number} height2 - The height of the second region.
 * @return {boolean} - Do the rectangular regions overlap?
 */
CodeManager.move.rInRange = function(x1, y1, width1, height1, x2, y2, width2, height2) {
	// These conditions check that there are no vertical or horizontal gaps between the regions.
	// Is the right side of region 1 to the right of the left side of region 2?
	const xBigEnough = x1 + width1 >= x2;
	// Is the bottom side of region 1 below the top side of region 2?
	const yBigEnough = y1 + height1 >= y2;
	// Is the left side of region 1 to the left of the right side of region 2?
	const xSmallEnough = x1 <= x2 + width2;
	// Is the top side of region 1 above the bottom side of region 2?
	const ySmallEnough = y1 <= y2 + height2;
	// If it passes all 4 checks, the regions overlap.
	return xBigEnough && yBigEnough && xSmallEnough && ySmallEnough;
};

/**
 * Recursively searches for the Block/Slot that best fits the moving BlockStack.
 * All results are stored in CodeManager.fit.  Nothing is returned.
 */
CodeManager.findBestFit = function() {
	const fit = CodeManager.fit;   // shorthand
	fit.found = false;   // Have any matching slot/block been found?
	fit.bestFit = null;   // Slot/Block that is closest to the item?
	fit.dist = 0;   // How far is the best candidate from the ideal location?
	TabManager.activeTab.findBestFit();   // Begins the recursive calls.
};

/**
 * Recursively updates any Blocks that are currently executing.
 * Stops the update timer if all Blocks are finished.
 */
CodeManager.updateRun = function() {
	const CM = CodeManager;
	if (!TabManager.updateRun().isRunning()) {   // A recursive call.  Returns true if any Blocks are running.
		CM.stopUpdateTimer();   // If no Blocks are running, stop the update timer.
	}
};

/**
 * Recursively stops all Block execution.
 */
CodeManager.stop = function() {
	Device.stopAll();   // Stop any motors and LEDs on the devices
	TabManager.stop();   // Recursive call.
	CodeManager.stopUpdateTimer();   // Stop the update timer.
	DisplayBoxManager.hide();   // Hide any messages being displayed.
	Sound.stopAllSounds() // Stops all sounds and tones
	// Note: Tones are not allowed to be async, so they 
	// must be stopped manually
};

/**
 * Stops the update timer for block execution
 */
CodeManager.stopUpdateTimer = function() {
	if (CodeManager.isRunning) {   // If the timer is currently running...
		//...Stop the timer.
		CodeManager.updateTimer = window.clearInterval(CodeManager.updateTimer);
		CodeManager.isRunning = false;
	}
};

/**
 * Starts the update timer.  When it fires, the timer will call the CodeManager.updateRun function.
 */
CodeManager.startUpdateTimer = function() {
	if (!CodeManager.isRunning) {   // If the timer is not running...
		//...Start the timer.
		CodeManager.updateTimer = self.setInterval(DebugOptions.safeFunc(CodeManager.updateRun), CodeManager.updateInterval);
		CodeManager.isRunning = true;
	}
};

/**
 * Recursively passes on the message that the flag button was tapped.
 */
CodeManager.eventFlagClicked = function() {
	TabManager.eventFlagClicked();
};

/**
 * Adds the Variable to CodeManager's list of variables
 * @param {Variable} variable
 */
CodeManager.addVariable = function(variable) {
	CodeManager.variableList.push(variable);
};

/**
 * Removes the Variable from CodeManager's list of variables
 * @param {Variable} variable
 */
CodeManager.removeVariable = function(variable) {
	const index = CodeManager.variableList.indexOf(variable);
	CodeManager.variableList.splice(index, 1);
};

/**
 * Requests the user to name a variable and then creates it
 * @param {function} [callbackCreate] - type (Variable) -> (), called if the user completes variable creation
 * @param {function} [callbackCancel] - type () -> (), called if the user cancels variable creation
 */
CodeManager.newVariable = function(callbackCreate, callbackCancel) {
	DialogManager.showPromptDialog("Create variable", "Enter variable name", "", true, function(cancelled, result) {
		if (!cancelled && CodeManager.checkVarName(result)) {
			result = result.trim();
			const variable = new Variable(result);
			SaveManager.markEdited();
			BlockPalette.getCategory("variables").refreshGroup();
			if (callbackCreate != null) callbackCreate(variable);
		} else {
			if (callbackCancel != null) callbackCancel();
		}
	});
};

/**
 * Checks if the name is a valid name for a new variable
 * @param {string} name
 * @return {boolean} - false if the name is empty or already in use
 */
CodeManager.checkVarName = function(name) {
	name = name.trim();
	if (name.length > 0) {
		const variables = CodeManager.variableList;
		for (let i = 0; i < variables.length; i++) {
			if (variables[i].getName() === name) {
				return false;
			}
		}
		return true;
	}
	return false;
};

/**
 * Finds a variable by name
 * @param {string} name - The name of the variable to find
 * @return {Variable|null} - The variable or null if it can't be found
 */
CodeManager.findVar = function(name) {
	const variables = CodeManager.variableList;
	for (let i = 0; i < variables.length; i++) {
		if (variables[i].getName() === name) {
			return variables[i];
		}
	}
	return null;
};

/**
 * Adds the List to the list of Lists
 * @param {List} list
 */
CodeManager.addList = function(list) {
	CodeManager.listList.push(list);
};

/**
 * Removes the list from the list of Lists
 * @param {List} list
 */
CodeManager.removeList = function(list) {
	const index = CodeManager.listList.indexOf(list);
	CodeManager.listList.splice(index, 1);
};

/**
 * Prompts the user to create a new list
 * @param {function} callbackCreate - type (List) -> (), called if the user completes list creation
 * @param {function} callbackCancel - type () -> (), called if the user cancels list creation
 */
CodeManager.newList = function(callbackCreate, callbackCancel) {
	DialogManager.showPromptDialog("Create list", "Enter list name", "", true, function(cancelled, result) {
		if (!cancelled && CodeManager.checkListName(result)) {
			result = result.trim();
			const list = new List(result);
			SaveManager.markEdited();
			BlockPalette.getCategory("variables").refreshGroup();
			if (callbackCreate != null) callbackCreate(list);
		} else {
			if (callbackCancel != null) callbackCancel();
		}
	});
};

/**
 * Checks if a name is valid for a new List
 * @param {string} name
 * @return {boolean} - false if the name is empty or in use
 */
CodeManager.checkListName = function(name) {
	name = name.trim();
	if (name.length > 0) {
		const lists = CodeManager.listList;
		for (let i = 0; i < lists.length; i++) {
			if (lists[i].getName() === name) {
				return false;
			}
		}
		return true;
	}
	return false;
};

/**
 * Finds a List by name
 * @param {string} name
 * @return {List|null} - The List or null if it can't be found
 */
CodeManager.findList = function(name) {
	const lists = CodeManager.listList;
	for (let i = 0; i < lists.length; i++) {
		if (lists[i].getName() === name) {
			return lists[i];
		}
	}
	return null;
};

/**
 * Checks if the message is original
 * @param {string} message - The message to test
 * @return {boolean} - false if that message is already a message in CodeManager.broadcastList
 * TODO: Just use a set instead of a list for CodeManager.broadcastList
 */
CodeManager.checkBroadcastMessage = function(message) {
	const messages = CodeManager.broadcastList;
	for (let i = 0; i < messages.length; i++) {
		if (messages[i] === message) {
			return false;
		}
	}
	return true;
};

/**
 * Adds a message to the list of messages if it has not already been added
 * @param {string} message
 */
CodeManager.addBroadcastMessage = function(message) {
	if (CodeManager.checkBroadcastMessage(message)) {
		CodeManager.broadcastList.push(message);
	}
};

/**
 * Recursively tells children to populate the broadcastList
 */
CodeManager.updateAvailableMessages = function() {
	CodeManager.broadcastList = [];
	TabManager.updateAvailableMessages();
};

/**
 * Recursively tells Blocks that a certain message has been broadcast
 * @param {string} message
 */
CodeManager.eventBroadcast = function(message) {
	TabManager.eventBroadcast(message);
};

/**
 * Tells DeviceDropSlots or a certain type to hide their drop downs and just use labels
 * @param deviceClass - subclass of Device, type of slots affected
 */
CodeManager.hideDeviceDropDowns = function(deviceClass) {
	CodeManager.passRecursivelyDown("hideDeviceDropDowns", true, deviceClass);
};

/**
 * Tells DeviceDropSlots or a certain type to show their drop downs
 * @param deviceClass - subclass of Device, type of slots affected
 */
CodeManager.showDeviceDropDowns = function(deviceClass) {
	CodeManager.passRecursivelyDown("showDeviceDropDowns", true, deviceClass);
};

/**
 * Recursively funds the largest selected value of any DeviceDropSlot of a certain type
 * @param deviceClass - subclass of Device, type of slots affected
 * @return {number}
 */
CodeManager.countDevicesInUse = function(deviceClass) {
	return TabManager.countDevicesInUse(deviceClass);
};

/**
 * Recursively checks if a certain broadcast message is still running.
 * @param {string} message
 * @return {boolean}
 */
CodeManager.checkBroadcastRunning = function(message) {
	return TabManager.checkBroadcastRunning(message);
};

/**
 * Recursively tells Blocks to become active/inactive based on the sensors that are available
 */
CodeManager.updateAvailableSensors = function() {
	TabManager.passRecursivelyDown("updateAvailableSensors");
	BlockPalette.passRecursivelyDown("updateAvailableSensors");
};

/**
 * Recursively tells Blocks to become active/inactive based on the devices that are connected
 */
CodeManager.updateConnectionStatus = function() {
	CodeManager.passRecursivelyDown("updateConnectionStatus", true);
};

/**
 * Tells children to keep passing message down to Slots/Blocks
 * @param {string} message
 * @param {boolean} includePalette - Whether Blocks in the palette should also get the message
 */
CodeManager.passRecursivelyDown = function(message, includePalette) {
	let args = [message].concat(Array.prototype.splice.call(arguments, 2));
	TabManager.passRecursivelyDown.apply(TabManager, args);
	if (includePalette) {
		BlockPalette.passRecursivelyDown.apply(BlockPalette, args);
	}
};

/**
 * Exports the project to XML
 * @return {Document} - The completed XML document
 */
CodeManager.createXml = function() {
	const CM = CodeManager;
	const xmlDoc = XmlWriter.newDoc("project");
	const project = xmlDoc.getElementsByTagName("project")[0];
	let fileName = "project";
	if (SaveManager.fileName != null) {
		fileName = SaveManager.fileName;
	}
	XmlWriter.setAttribute(project, "name", fileName);
	XmlWriter.setAttribute(project, "appVersion", GuiElements.appVersion);
	XmlWriter.setAttribute(project, "created", CodeManager.createdTime);
	XmlWriter.setAttribute(project, "modified", CodeManager.modifiedTime);
	const variables = XmlWriter.createElement(xmlDoc, "variables");
	for (let i = 0; i < CM.variableList.length; i++) {
		variables.appendChild(CM.variableList[i].createXml(xmlDoc));
	}
	project.appendChild(variables);
	const lists = XmlWriter.createElement(xmlDoc, "lists");
	for (let i = 0; i < CM.listList.length; i++) {
		lists.appendChild(CM.listList[i].createXml(xmlDoc));
	}
	project.appendChild(lists);
	project.appendChild(TabManager.createXml(xmlDoc));
	return xmlDoc;
};

/**
 * Loads the project from XML
 * @param projectNode
 */
CodeManager.importXml = function(projectNode) {
	CodeManager.deleteAll();
	Sound.changeFile();
	CodeManager.modifiedTime = XmlWriter.getAttribute(projectNode, "modified", new Date().getTime(), true);
	CodeManager.createdTime = XmlWriter.getAttribute(projectNode, "created", new Date().getTime(), true);
	const variablesNode = XmlWriter.findSubElement(projectNode, "variables");
	if (variablesNode != null) {
		const variableNodes = XmlWriter.findSubElements(variablesNode, "variable");
		for (let i = 0; i < variableNodes.length; i++) {
			Variable.importXml(variableNodes[i]);
		}
	}
	const listsNode = XmlWriter.findSubElement(projectNode, "lists");
	if (listsNode != null) {
		const listNodes = XmlWriter.findSubElements(listsNode, "list");
		for (let i = 0; i < listNodes.length; i++) {
			List.importXml(listNodes[i]);
		}
	}
	BlockPalette.getCategory("variables").refreshGroup();
	const tabsNode = XmlWriter.findSubElement(projectNode, "tabs");
	TabManager.importXml(tabsNode);
	BlockPalette.refresh();
	DeviceManager.updateSelectableDevices();
	TitleBar.setText(SaveManager.fileName);
	UndoManager.clearUndos();
	TouchReceiver.enableInteraction();
};

/**
 * Updates the modified time of the document
 */
CodeManager.updateModified = function() {
	CodeManager.modifiedTime = new Date().getTime();
};

/**
 * Deletes all tabs, stacks, and Blocks so a new project can be loaded
 */
CodeManager.deleteAll = function() {
	const CM = CodeManager;
	CM.stop();
	TabManager.deleteAll();
	CodeManager();
};

/**
 * Tells Blocks that a variable's name has changed
 * @param {Variable} variable
 */
CodeManager.renameVariable = function(variable) {
	TabManager.renameVariable(variable);
	BlockPalette.getCategory("variables").refreshGroup();
};

/**
 * Tells Blocks that a variable has been deleted
 * @param {Variable} variable
 */
CodeManager.deleteVariable = function(variable) {
	TabManager.deleteVariable(variable);
	BlockPalette.getCategory("variables").refreshGroup();
};

/**
 * Tells Blocks that a List has been renamed
 * @param {List} list
 */
CodeManager.renameList = function(list) {
	TabManager.renameList(list);
	BlockPalette.getCategory("variables").refreshGroup();
};

/**
 * Tells Blocks that a List has been deleted
 * @param {List} list
 */
CodeManager.deleteList = function(list) {
	TabManager.deleteList(list);
	BlockPalette.getCategory("variables").refreshGroup();
};

/**
 * Recursively checks if a variable is ever used. Determines whether a prompt will be shown if the user tries
 * to delete it.
 * @param {Variable} variable
 * @return {boolean}
 */
CodeManager.checkVariableUsed = function(variable) {
	return TabManager.checkVariableUsed(variable);
};

/**
 * Recursively checks if a list is ever used.
 * @param {List} list
 * @return {boolean}
 */
CodeManager.checkListUsed = function(list) {
	return TabManager.checkListUsed(list);
};

/**
 * Converts beats to milliseconds using the current tempo
 * @param {number} beats
 * @return {number}
 */
CodeManager.beatsToMs = function(beats) {
	const tempo = CodeManager.sound.tempo;
	const res = beats / tempo * 60 * 1000;
	if (isNaN(res) || !isFinite(res)) {
		return 0;
	}
	return res;
};

/**
 * Sets the tempo, if it is valid.
 * @param {number} newTempo
 */
CodeManager.setSoundTempo = function(newTempo) {
	if (isFinite(newTempo) && !isNaN(newTempo)) {
		if (newTempo >= 500) {
			CodeManager.sound.tempo = 500;
		} else if (newTempo <= 20) {
			CodeManager.sound.tempo = 20;
		} else {
			CodeManager.sound.tempo = newTempo;
		}
	}
};

/* Convert between absolute and relative coords in the drag layer.  Used by moving BlockStacks to determine positions */
/**
 * @param {number} x
 * @return {number}
 */
CodeManager.dragAbsToRelX = function(x) {
	return x / TabManager.getActiveZoom();
};
/**
 * @param {number} y
 * @return {number}
 */
CodeManager.dragAbsToRelY = function(y) {
	return y / TabManager.getActiveZoom();
};
/**
 * @param {number} x
 * @return {number}
 */
CodeManager.dragRelToAbsX = function(x) {
	return x * TabManager.getActiveZoom();
};
/**
 * @param {number} y
 * @return {number}
 */
CodeManager.dragRelToAbsY = function(y) {
	return y * TabManager.getActiveZoom();
};

/**
 * Recursively tells Blocks that a recording's name has changed
 * @param {string} oldName
 * @param {string} newName
 */
CodeManager.renameRecording = function(oldName, newName) {
	CodeManager.passRecursivelyDown("renameRecording", true, oldName, newName);
};

/**
 * Recursively tells Blocks that a recording has been deleted
 * @param {string} recording
 */
CodeManager.deleteRecording = function(recording) {
	CodeManager.passRecursivelyDown("deleteRecording", true, recording);
};

/**
 * Shows "Loading..." in the TitleBar and blocks interaction for 1 sec or until the file loads
 * @param message
 */
CodeManager.markLoading = function(message) {
	TitleBar.setText(message);
	TouchReceiver.disableInteraction(1000);
};

/**
 * Undoes markLoading, by restoring the filename and enabling interaction
 */
CodeManager.cancelLoading = function() {
	TitleBar.setText(SaveManager.fileName);
	TouchReceiver.enableInteraction();
};