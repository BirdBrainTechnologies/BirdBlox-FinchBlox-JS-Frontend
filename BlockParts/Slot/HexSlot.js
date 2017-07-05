/**
 * HexSlot is a subclass of Slot. Unlike Slot, it can actually be instantiated.
 * It creates a hexagonal Slot that can hold Blocks but not be edited via InputPad or dialog.
 * Its input type and output type is always bool.
 * @constructor
 * @param {Block} parent - The Block this Slot is a part of.
 * @param {string} key - The name of the Slot. Used for reading and writing save files.
 * @param {number} snapType - [none,numStrBool,bool,list,any] The type of Blocks which can be attached to the RoundSlot.
 */
function HexSlot(parent,key,snapType){
	Slot.call(this, parent, key, snapType, Slot.outputTypes.bool); //Call constructor.
	this.slotShape = new HexSlotShape(this);
	this.slotShape.show();
}
HexSlot.prototype = Object.create(Slot.prototype);
HexSlot.prototype.constructor = HexSlot;

/**
 * @inheritDoc
 * TODO: fix BlockGraphics
 */
HexSlot.prototype.highlight=function(){
	const slotGraphicShowing = !this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,2,slotGraphicShowing);
};

/**
 * @inheritDoc
 * @return {string}
 */
HexSlot.prototype.textSummary=function(){
	//Angle brackets are used because it is a HexSlot.
	if(this.hasChild){ //If it has a child, just use an ellipsis.
		return "<...>";
	}
	else{ //Otherwise, it is empty.
		return "<>";
	}
};

/**
 * @inheritDoc
 * @return {Data}
 */
HexSlot.prototype.getDataNotFromChild=function(){
	return new BoolData(false,false); //The Slot is empty. Return default value of false.
};

/**
 * @inheritDoc
 * @param {Document} xmlDoc
 * @returns {Document}
 */
HexSlot.prototype.createXml=function(xmlDoc){
	const slot = Slot.prototype.createXml.call(this, xmlDoc);
	XmlWriter.setAttribute(slot,"type","HexSlot");
	return slot;
};

/**
 * @inheritDoc
 * @param {Document} slotNode
 * @return {HexSlot}
 */
HexSlot.prototype.importXml=function(slotNode){
	const type = XmlWriter.getAttribute(slotNode, "type");
	// The save file appears to have the wrong type of Slot. The data is left at default value.
	// TODO: Remove this check and just validate the data.
	if(type !== "HexSlot"){
		return this;
	}
	// Get the nodes for this Slot's child.
	const childNode = XmlWriter.findSubElement(slotNode, "child");
	const blockNode = XmlWriter.findSubElement(childNode, "block");
	if(blockNode != null) {
		// Import the Block from the save file
		const childBlock = Block.importXml(blockNode);
		// If import succeeds, connect the Block
		if (childBlock != null) {
			this.snap(childBlock);
		}
	}
	// Return a reference to this Slot.
	return this;
};