/**
 * Completely unrelated to the TabManager and Tab classes.  The TabRow provides UI for a row of tabs, which when
 * when selected call a callback function.  They are used in the ConnectMultipleDialog and OpenDialog.  A TabRow
 * is created through the constructor and Tabs are added with addTab.  show() causes the tabs to be built
 * @param {number} x - The x coord of where the TabRow should be drawn
 * @param {number} y - The y coord of where the TabRow should be drawn
 * @param {number} width - The width of the space available to the TabRow
 * @param {number} height - The height of the space available to the TabRow
 * @param {Element} parent - The group the RabRow should add itself to
 * @param {number|null} [initialTab] - The index of the tab to select first.  If null, no tab will appear selected
 * @constructor
 */
function TabRow(x, y, width, height, parent, initialTab) {
	if (initialTab == null) {
		initialTab = null;
	}
	this.tabList = [];
	this.x = x;
	this.y = y;
	this.parent = parent;
	this.width = width;
	this.height = height;
	this.callbackFn = null;
	this.selectedTab = initialTab;
	this.partOfOverlay = null;
}

TabRow.setConstants = function() {
	const TR = TabRow;
	TR.slantW = 5;
	TR.deselectedColor = Colors.darkGray;
	TR.selectedColor = Colors.black;
	TR.foregroundColor = Colors.white;

	TR.font = Font.uiFont(16).bold();

	TR.closeHeight = 30;
	TR.closeMargin = 9;
};

/**
 * Builds the tabs and shows the UI
 */
TabRow.prototype.show = function() {
	this.group = GuiElements.create.group(this.x, this.y, this.parent);
	this.createTabs();
	if (this.selectedTab != null) {
		this.visuallySelectTab(this.selectedTab);
	}
};

/**
 * Adds a tab to the list of tabs to be built
 * @param {string} text - The label to put on the tab
 * @param {*} id - The id of the tab.  Sent to the callback function when a tab is selected
 * @param {function|null} [closeFn] - The function to call when this tab is closed.  If provided, a close button will
 *                                    be drawn on the Tab
 */
TabRow.prototype.addTab = function(text, id, closeFn) {
	let entry = {};
	entry.text = text;
	entry.id = id;
	entry.closeFn = closeFn;
	this.tabList.push(entry);
};

/**
 * Renders the tabs and close buttons according to the labList
 */
TabRow.prototype.createTabs = function() {
	let tabCount = this.tabList.length;
	let tabWidth = this.width / tabCount;
	this.tabEList = [];
	this.tabList.forEach(function(entry, index) {
		const tabX = index * tabWidth;
		const hasClose = entry.closeFn != null;
		this.tabEList.push(this.createTab(index, entry.text, tabWidth, tabX, hasClose));
		if (hasClose) {
			this.createClose(tabWidth, tabX, entry.closeFn);
		}
	}.bind(this));
};

/**
 * Creates a tab with the specified label and width
 * @param {number} index - The index of the tab, used to add the correct listeners to the tab
 * @param {string} text - The text to place on the top of the tab
 * @param {number} width - The width of the tab
 * @param {number} x - The x coord of the tab
 * @param {boolean} hasClose - Whether space should be reserved for a close button
 */
TabRow.prototype.createTab = function(index, text, width, x, hasClose) {
	const TR = TabRow;

	let textMaxWidth = width - 2 * TR.slantW;
	const closeSpace = 2 * TR.closeMargin + TR.closeHeight;
	if (hasClose) {
		textMaxWidth = width - closeSpace - TR.slantW;
	}
	let tabE = GuiElements.draw.trapezoid(x, 0, width, this.height, TR.slantW, TR.deselectedColor);
	this.group.appendChild(tabE);
	let textE = GuiElements.draw.text(0, 0, "", TR.font, TR.foregroundColor);
	GuiElements.update.textLimitWidth(textE, text, textMaxWidth);

	let textW = GuiElements.measure.textWidth(textE);
	let textX = x + (width - textW) / 2;
	if (hasClose) {
		textX = Math.min(textX, x + width - textW - closeSpace);
	}
	let textY = (this.height + TR.font.charHeight) / 2;
	GuiElements.move.text(textE, textX, textY);

	TouchReceiver.addListenersTabRow(textE, this, index);
	TouchReceiver.addListenersTabRow(tabE, this, index);
	this.group.appendChild(textE);
	return tabE;
};

/**
 * Creates a button to close the tab
 * @param {number} tabX - The x coord of the tab
 * @param {number} tabW - The width of the tab
 * @param {function} closeFn - The function to call when the close button is tapped
 */
TabRow.prototype.createClose = function(tabX, tabW, closeFn) {
	const TR = TabRow;
	const cx = tabX + tabW - TR.closeMargin - TR.closeHeight / 2;
	const cy = this.height / 2;
	const closeBn = new CloseButton(cx, cy, TR.closeHeight, closeFn, this.group);
};

/**
 * Makes the tab appear selected and calls the callbackFn with the id of the selected tab.
 * @param index
 */
TabRow.prototype.selectTab = function(index) {
	if (index !== this.selectTab) {
		this.selectedTab = index;
		this.visuallySelectTab(index);   // TODO: make this also deselect the selected tab
		if (this.callbackFn != null) this.callbackFn(this.tabList[index].id);
	}
};

/**
 * Makes a tab appear selected
 * @param {number} index - The tab to select
 */
TabRow.prototype.visuallySelectTab = function(index) {
	let TR = TabRow;
	let tabE = this.tabEList[index];
	GuiElements.update.color(tabE, TR.selectedColor);
};

/**
 * Registers a callback function for when tabs are selected.  The function will be called with the id of the selected
 * tab
 * @param {function} callback - type (type of id) -> ()
 */
TabRow.prototype.setCallbackFunction = function(callback) {
	this.callbackFn = callback;
};

/**
 * Notes that the TabRow is a member of the provided overlay and shouldn't close it.
 * @param {Overlay} overlay
 */
TabRow.prototype.markAsOverlayPart = function(overlay) {
	this.partOfOverlay = overlay;
};