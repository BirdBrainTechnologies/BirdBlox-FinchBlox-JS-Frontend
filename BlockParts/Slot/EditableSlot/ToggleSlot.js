/**
 * ToggleSlot is a subclass of BoolSlot. Though not a subclass of EditableSlot,
 * it is editable in that you can toggle the boolean value.
 *
 * @constructor
 * @param {Block} parent
 * @param {string} key
 */
 //TODO: make this a subclass of EditableSlot?
 function ToggleSlot(parent,key){
 	//Make BoolSlot.
 	BoolSlot.call(this,parent,key);

  this.isTrue = false
 }
 ToggleSlot.prototype = Object.create(BoolSlot.prototype);
 ToggleSlot.prototype.constructor = ToggleSlot;

 ToggleSlot.prototype.onTap = function() {
   this.isTrue = !this.isTrue
   if (this.isTrue) {
     this.slotShape.slotE.setAttributeNS(null, "fill", Colors.red);
   } else {
     BlockGraphics.update.hexSlotGradient(this.slotShape.slotE, this.parent.category, this.slotShape.active);
   }
 }

 ToggleSlot.prototype.getDataNotFromChild = function() {
 	return new BoolData(this.isTrue, true); //The Slot is empty. Return stored value
 };

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
