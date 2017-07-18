/**
 * Created by Tom on 7/17/2017.
 */
function CollapsibleSet(y, nameIdList, category, group) {
	this.y = y;
	this.category = category;
	this.group = group;
	this.collapsibleItems = [];
	nameIdList.forEach(function(entry){
		this.collapsibleItems.push(new CollapsibleItem(entry.name, entry.id, this, group));
	}.bind(this));
	this.updateDimAlign();
}
CollapsibleSet.setConstants = function(){
	const CS = CollapsibleSet;
	CS.itemMargin = 0;
};
CollapsibleSet.prototype.getItemList = function(){
	return this.collapsibleItems;
};
CollapsibleSet.prototype.getItem = function(index) {
	return this.collapsibleItems[index];
};
CollapsibleSet.prototype.findItem = function(id) {
	const items = this.collapsibleItems;
	for(let i = 0; i < items.length; i++) {
		if(items[i].id === id) {
			return i;
		}
	}
	DebugOptions.throw("Collapsible item not found.");
};
CollapsibleSet.prototype.expand = function(index) {
	this.collapsibleItems[index].expand();
	this.updateDimAlign();
};
CollapsibleSet.prototype.collapse = function(index) {
	this.collapsibleItems[index].collapse();
	this.updateDimAlign();
};
CollapsibleSet.prototype.updateDimAlign = function() {
	const CS = CollapsibleSet;
	let currentY = this.y;
	let width = 0;
	this.collapsibleItems.forEach(function(item) {
		currentY += item.updateDimAlign(currentY);
		currentY += CS.itemMargin;
		width = Math.max(width, item.getWidth());
	});
	currentY -= CS.itemMargin;
	this.height = currentY;
	this.width = width;
	this.category.updateDimSet();
};
CollapsibleSet.prototype.updateWidth = function() {
	let width = 0;
	this.collapsibleItems.forEach(function(item) {
		width = Math.max(width, item.getWidth());
	});
	this.width = width;
	this.category.updateWidth();
};
CollapsibleSet.prototype.remove = function() {
	this.collapsibleItems.forEach(function(item){
		item.remove();
	});
};

CollapsibleSet.prototype.setSuggestedCollapse = function(id, collapsed) {
	this.passRecursively("setSuggestedCollapse", id, collapsed);
};
CollapsibleSet.prototype.passRecursivelyDown = function(message){
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	this.passRecursively.apply(this, arguments);
};
CollapsibleSet.prototype.passRecursively = function(functionName){
	const args = Array.prototype.slice.call(arguments, 1);
	this.collapsibleItems.forEach(function(item){
		item[functionName].apply(item,args);
	});
};