/**
 * Similar to ToggleSlot, this block part allows the user to select a boolean value.
 * Treated as a slot for saving purposes
 */
function Toggle(parent, key, data) {
	this.x = 0;
	this.y = 0;
	this.parent = parent;
	this.parent.hasToggles = true
	this.isToggle = true
	this.key = key 

	//Toggle size is fixed
	this.r = 12
	this.width = 2*this.r
	this.height = 2*this.r

	this.colorOff = Colors.ballyGrayDark
	this.colorOn = Colors.white

	this.isTrue = data

	let color = this.isTrue ? this.colorOn : this.colorOff
	this.element = GuiElements.draw.circle(0, 0, this.r, color, this.parent.group)

	//TODO: Maybe add to TouchReceiver?
	const TR = TouchReceiver;
	TR.addEventListenerSafe(this.element, TR.handlerUp, function(e) {
	    this.toggle()
	}.bind(this), false);
}
Toggle.prototype = Object.create(BlockPart.prototype)
Toggle.prototype.constructor = Toggle


Toggle.prototype.toggle = function() {
	this.setValue(!this.isTrue)
}


Toggle.prototype.setValue = function(value) {
	this.isTrue = value
	GuiElements.update.color(this.element, (value ? this.colorOn : this.colorOff))
}

Toggle.prototype.getData = function() {
	return new BoolData(this.isTrue)
}

/**
 * Move the part to the specified location and returns where the next part should be.
 * Called by the Block any time it has changed size/shape
 * @param {number} x - The x coord the part should have relative to the Block it is in
 * @param {number} y - The y coord ths part should have measured from the center of the part
 * @return {number} - The width of the part, indicating how much the next item in the Block should be shifted over.
 */
Toggle.prototype.updateAlign = function(x, y) {
  this.x = x 
  this.y = y 
  GuiElements.move.circle(this.element, this.x + this.r, this.y)
  return this.width;
};

/**
 * Toggle is a constant size.
 */
Toggle.prototype.updateDim = function() {

};

/**
 * Creates a text representation of the part
 * @return {string}
 */
Toggle.prototype.textSummary = function() {
  return this.isTrue.toString()
};

/**
 * Makes the part appear active
 */
Toggle.prototype.makeActive = function() {

};

/**
 * Makes the part appear inactive
 */
Toggle.prototype.makeInactive = function() {

};

Toggle.prototype.createXml = function(xmlDoc) {
	const toggleXml = XmlWriter.createElement(xmlDoc, "toggle");
	XmlWriter.setAttribute(toggleXml, "key", this.key);
	XmlWriter.setAttribute(toggleXml, "value", this.isTrue.toString());
	return toggleXml
}


Toggle.prototype.importXml = function(toggleNode) {
	let value = XmlWriter.getAttribute(toggleNode, "value") == "true"
	this.setValue(value)
}

Toggle.prototype.getKey = function() {
	return this.key
}

