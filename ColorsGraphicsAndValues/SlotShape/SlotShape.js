/**
 * Controls the visual aspects of a Slot.
 * Abstract class, subclasses correspond to different types of Slots.
 * @param {Slot} slot - The Slot this SlotShape is a part of.  Used for retrieving category information, etc.
 * @constructor
 */
function SlotShape(slot) {
  this.slot = slot;

  // SlotShapes are only shown when no Blocks are connected to the Slot
  this.visible = false;

  // The graphics for the shape are created when show() or buildSlot() is called
  this.built = false;

  // Some slots appear different if the Block that are attached to is inactive (gray)
  this.active = true;
}

/**
 * SlotShape has no constants yet
 */
SlotShape.setConstants = function() {

};

/**
 * Builds the slot and makes it visible
 */
SlotShape.prototype.show = function() {
  if (this.visible) return;
  this.visible = true;
  if (!this.built) this.buildSlot();
  this.slot.parent.group.appendChild(this.group);
  this.updateDim();
  this.updateAlign();
};

/**
 * Hides the slot
 */
SlotShape.prototype.hide = function() {
  if (!this.visible) return;
  this.visible = false;
  this.group.remove();
};

/**
 * Creates the Slot's graphics
 */
SlotShape.prototype.buildSlot = function() {
  if (this.built) return;
  this.built = true;
  this.group = GuiElements.create.group(0, 0);
  // Overridden by subclasses
};

/**
 * Moves the SlotShape to the coords (relative to the Block)
 * @param {number} x
 * @param {number} y
 */
SlotShape.prototype.move = function(x, y) {
  DebugOptions.validateNumbers(x, y);
  GuiElements.move.group(this.group, x, y);
};

/**
 * Computes the SlotShape's width and height properties
 */
SlotShape.prototype.updateDim = function() {
  DebugOptions.markAbstract();
};

/**
 * Moves the SlotShapes sub-parts to line up properly
 */
SlotShape.prototype.updateAlign = function() {
  DebugOptions.markAbstract();
};

/**
 * Makes the SlotShape appear active
 */
SlotShape.prototype.makeActive = function() {
  if (!this.active) {
    this.active = true;
  }
  // Subclasses may change appearance
};

/**
 * Makes the SlotShape appear inactive
 */
SlotShape.prototype.makeInactive = function() {
  if (this.active) {
    this.active = false;
  }
  // Subclasses may change appearance
};

/**
 * Sets the SlotShape to appear active/inactive
 * @param {boolean} active
 */
SlotShape.prototype.setActive = function(active) {
  if (active) {
    this.makeActive();
  } else {
    this.makeInactive();
  }
};
