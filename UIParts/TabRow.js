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
	this.isOverlayPart = false;
}
TabRow.setConstants = function(){
	const TR = TabRow;
	TR.slantW = 5;
	TR.deselectedColor = Colors.darkGray;
	TR.selectedColor = Colors.black;
	TR.foregroundColor = Colors.white;

	TR.fontSize=16;
	TR.font="Arial";
	TR.fontWeight="bold";
	TR.charHeight=12;
};
TabRow.prototype.show = function(){
	this.group = GuiElements.create.group(this.x, this.y, this.parent);
	this.createTabs();
	if(this.selectedTab != null) {
		this.visuallySelectTab(this.selectedTab);
	}
};
TabRow.prototype.addTab = function(text, id){
	let entry = {};
	entry.text = text;
	entry.id = id;
	this.tabList.push(entry);
};
TabRow.prototype.createTabs = function(){
	let tabCount = this.tabList.length;
	let tabWidth = this.width / tabCount;
	this.tabEList = [];
	this.tabList.forEach(function(entry, index){
		this.tabEList.push(this.createTab(index, entry.text, tabWidth, index * tabWidth));
	}.bind(this));
};
TabRow.prototype.createTab = function(index, text, width, x){
	let TR = TabRow;
	let tabE = GuiElements.draw.trapezoid(x, 0, width, this.height, TR.slantW, TR.deselectedColor);
	this.group.appendChild(tabE);
	let textE = GuiElements.draw.text(0, 0, "", TR.fontSize, TR.foregroundColor, TR.font, TR.fontWeight);
	GuiElements.update.textLimitWidth(textE, text, width);
	let textW = GuiElements.measure.textWidth(textE);
	let textX = x + (width - textW) / 2;
	let textY = (this.height + TR.charHeight) / 2;
	GuiElements.move.text(textE, textX, textY);
	TouchReceiver.addListenersTabRow(textE, this, index);
	TouchReceiver.addListenersTabRow(tabE, this, index);
	this.group.appendChild(textE);
	return tabE;
};
TabRow.prototype.selectTab = function(index){
	if(index !== this.selectTab) {
		this.selectTab = index;
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
TabRow.prototype.markAsOverlayPart = function(){
	this.isOverlayPart = true;
};