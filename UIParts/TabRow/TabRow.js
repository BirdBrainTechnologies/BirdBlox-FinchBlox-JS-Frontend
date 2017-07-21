/**
 * Created by Tom on 6/18/2017.
 */
function TabRow(x, y, width, height, parent, initialTab){
	if(initialTab == null){
		initialTab = null;
	}
	this.tabList = [];
	this.x = x;
	this.y = y;
	this.parent = parent;
	this.width = width;
	this.height = height;
	this.callbackFn = null;
	this.initalTab = initialTab;
	this.selectedTab = initialTab;
	this.partOfOverlay = null;
}
TabRow.setConstants = function(){
	const TR = TabRow;
	TR.slantW = 5;
	TR.deselectedColor = Colors.darkGray;
	TR.selectedColor = Colors.black;
	TR.foregroundColor = Colors.white;

	TR.font = Font.uiFont(16).bold();

	TR.closeHeight = 30;
	TR.closeMargin = 9;
};
TabRow.prototype.show = function(){
	this.group = GuiElements.create.group(this.x, this.y, this.parent);
	this.createTabs();
	if(this.selectedTab != null) {
		this.visuallySelectTab(this.selectedTab);
	}
};
TabRow.prototype.addTab = function(text, id, closeFn){
	let entry = {};
	entry.text = text;
	entry.id = id;
	entry.closeFn = closeFn;
	this.tabList.push(entry);
};
TabRow.prototype.createTabs = function(){
	let tabCount = this.tabList.length;
	let tabWidth = this.width / tabCount;
	this.tabEList = [];
	this.tabList.forEach(function(entry, index){
		const tabX = index * tabWidth;
		const hasClose = entry.closeFn != null;
		this.tabEList.push(this.createTab(index, entry.text, tabWidth, tabX, hasClose));
		if (hasClose) {
			this.createClose(tabWidth, tabX, entry.closeFn);
		}
	}.bind(this));
};
TabRow.prototype.createTab = function(index, text, width, x, hasClose){
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
TabRow.prototype.createClose = function(tabX, tabW, closeFn) {
	const TR = TabRow;
	const cx = tabX + tabW - TR.closeMargin - TR.closeHeight / 2;
	const cy = this.height / 2;
	const closeBn = new CloseButton(cx, cy, TR.closeHeight, closeFn, this.group);
};
TabRow.prototype.selectTab = function(index){
	if(index !== this.selectTab) {
		this.selectedTab = index;
		this.visuallySelectTab(index);
		if (this.callbackFn != null) this.callbackFn(this.tabList[index].id);
	}
};
TabRow.prototype.visuallySelectTab = function(index){
	let TR = TabRow;
	let tabE = this.tabEList[index];
	GuiElements.update.color(tabE, TR.selectedColor);
};
TabRow.prototype.setCallbackFunction = function(callback){
	this.callbackFn = callback;
};
TabRow.prototype.markAsOverlayPart = function(overlay){
	this.partOfOverlay = overlay;
};