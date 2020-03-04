/**
 * Represents a set of items that can be collapsed/expanded and each contain Blocks.  Meant for use in the BlockPalette
 * @param {number} y - The y coordinate the set should appear at
 * @param {Array<object>} nameIdList - An array of entries, each containing a field for name and id
 * @param {Category} category - The Category this set is a part of
 * @param {Element} group - The SVG group element this set should be added to
 * @constructor
 */
function CollapsibleSet(y, nameIdList, category, group) {
	this.y = y;
	this.category = category;
	this.group = group;
	// Create a collapsibleItem for each entry of the nameIdList
	this.collapsibleItems = [];
	nameIdList.forEach(function(entry){
		this.collapsibleItems.push(new CollapsibleItem(entry.name, entry.id, this, group));
	}.bind(this));
	// Stack the collapsibleItems appropriately
	this.updateDimAlign();
}

CollapsibleSet.setConstants = function(){
	const CS = CollapsibleSet;
	CS.itemMargin = 0;
};

/**
 * Retrieves the CollapsibleItem at the specified index
 * @param {number} index
 * @return {CollapsibleItem}
 */
CollapsibleSet.prototype.getItem = function(index) {
	return this.collapsibleItems[index];
};

/**
 * Finds the index of a CollapsibleItem by id.  Throws an error if the item is not found
 * @param {string} id
 * @return {number}
 */
CollapsibleSet.prototype.findItem = function(id) {
	const items = this.collapsibleItems;
	for(let i = 0; i < items.length; i++) {
		if(items[i].id === id) {
			return i;
		}
	}
	DebugOptions.throw("Collapsible item not found.");
};

/**
 * Expands the collapsible item at the specified index, then updates the dimensions
 * @param {number} index
 */
CollapsibleSet.prototype.expand = function(index) {
	this.collapsibleItems[index].expand();
	this.updateDimAlign();
};

/**
 * Collapses the collapsible item at the specified index, then updates the dimensions
 * @param {number} index
 */
CollapsibleSet.prototype.collapse = function(index) {
	this.collapsibleItems[index].collapse();
	this.updateDimAlign();
};

/**
 * Updates the dimensions and alignment of the CollapsibleSet and notifies its Category to update dimensions
 */
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

/**
 * Computes and stores the width of the CollapsibleSet and alerts its Category that the width may have changed
 * Triggered when a block inside changes width
 */
CollapsibleSet.prototype.updateWidth = function() {
	let width = 0;
	this.collapsibleItems.forEach(function(item) {
		width = Math.max(width, item.getWidth());
	});
	this.width = width;
	this.category.updateWidth();
};

/**
 * Removes the CollapsibleSet from the SVG
 */
CollapsibleSet.prototype.remove = function() {
	this.collapsibleItems.forEach(function(item){
		item.remove();
	});
};

/**
 * Stop all executing blocks in the set
 */
CollapsibleSet.prototype.stop = function() {
	this.passRecursively("passRecursively", "stop");
}

/**
 * Passes a suggested expand/collapse message to all CollapsibleItems
 * @param {string} id
 * @param {boolean} collapsed
 */
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
