/**
 * ToggleSlot is a subclass of BoolSlot. Though not a subclass of EditableSlot,
 * it is editable in that you can toggle the boolean value.
 *
 * @constructor
 * @param {Block} parent
 * @param {string} key
 */
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
