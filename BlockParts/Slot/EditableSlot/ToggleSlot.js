/**
 * ToggleSlot is a subclass of BoolSlot. Though not a subclass of EditableSlot,
 * it is editable in that you can toggle the boolean value.
 *
 * @constructor
 * @param {Block} parent
 * @param {string} key
 */
function ToggleSlot(parent, key, data) {
  //Make BoolSlot.
  BoolSlot.call(this, parent, key);

  this.isTrue = new BoolData(data);
  if (this.isTrue.getValue()) {
    this.slotShape.slotE.setAttributeNS(null, "fill", Colors.red);
  }
}
ToggleSlot.prototype = Object.create(BoolSlot.prototype);
ToggleSlot.prototype.constructor = ToggleSlot;

ToggleSlot.prototype.setVal = function(valToSet) {
  this.isTrue = new BoolData(valToSet);
  if (this.isTrue.getValue()) {
    this.slotShape.slotE.setAttributeNS(null, "fill", Colors.red);
  } else {
    BlockGraphics.update.hexSlotGradient(this.slotShape.slotE, this.parent.category, this.slotShape.active);
  }
}

ToggleSlot.prototype.onTap = function() {
  this.setVal(!this.isTrue.getValue())
}

ToggleSlot.prototype.getDataNotFromChild = function() {
  //return new BoolData(this.isTrue, true); //The Slot is empty. Return stored value
  return this.isTrue;
};

ToggleSlot.prototype.makeActive = function() {
  Slot.prototype.makeActive.call(this);
  if (this.isTrue.getValue()) {
    this.slotShape.slotE.setAttributeNS(null, "fill", Colors.red);
  }
}

ToggleSlot.prototype.makeInactive = function() {
  Slot.prototype.makeInactive.call(this);
  if (this.isTrue.getValue()) {
    this.slotShape.slotE.setAttributeNS(null, "fill", Colors.red);
  }
}
/**
 * Converts the Slot and its children into XML, storing the value in the isTrue as well
 * @inheritDoc
 * @param {Document} xmlDoc
 * @return {Node}
 */
ToggleSlot.prototype.createXml = function(xmlDoc) {
  let slot = Slot.prototype.createXml.call(this, xmlDoc);
  let isTrue = XmlWriter.createElement(xmlDoc, "isTrue");
  isTrue.appendChild(this.isTrue.createXml(xmlDoc));
  slot.appendChild(isTrue);
  return slot;
};

/**
 * @inheritDoc
 * @param {Node} slotNode
 * @return {ToggleSlot}
 */
ToggleSlot.prototype.importXml = function(slotNode) {
  Slot.prototype.importXml.call(this, slotNode);
  const isTrueNode = XmlWriter.findSubElement(slotNode, "isTrue");
  const dataNode = XmlWriter.findSubElement(isTrueNode, "data");
  if (dataNode != null) {
    const data = Data.importXml(dataNode);
    if (data != null) {
      this.setVal(data.getValue());
    }
  }
  return this;
};

/**
 * @inheritDoc
 * @param {ToggleSlot} slot
 */
ToggleSlot.prototype.copyFrom = function(slot) {
  Slot.prototype.copyFrom.call(this, slot);
  this.setVal(slot.isTrue.getValue());
};
