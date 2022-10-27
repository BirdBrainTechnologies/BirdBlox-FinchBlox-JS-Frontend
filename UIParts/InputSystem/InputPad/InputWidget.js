/**
 * A pad of an InputPad which can edit the Dat stored in the Slot.  InputWidget is an abstract class and each Widget
 * is responsible for drawing its own graphics and controlling the data in the Slot being edited.  The Widget is only
 * built when show() is called.
 * @constructor
 */
function InputWidget() {
  DebugOptions.markAbstract();
}

/**
 * Builds and displays the InputWidget, providing functions to call to update the Slot being edited
 * @param {number} x - The x coord where the InputWidget should appear
 * @param {number} y - The y coord where the InputWidget should appear
 * @param {Element} parentGroup - The SVG group the elements of the widget should be added to
 * @param {BubbleOverlay} overlay - The overlay of the InputPad containing the widget. Used for getting relToAbs coords
 * @param {EditableSlotShape} slotShape - The SlotShape of the Slot being edited
 * @param {function} updateFn - type (Data, string) -> (), to call to update the Data of the InputPad
 * @param {function} finishFn - type (Data) -> (), to call to finish editing the Slot
 * @param {Data} data - The initial Data stored in the Slot
 */
InputWidget.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
  this.x = x;
  this.y = y;
  this.slotShape = slotShape;
  this.updateFn = updateFn;
  this.finishFn = finishFn;
  this.overlay = overlay;
};

/**
 * Called by the InputPad to compute the size of the Widget.  Results stored in this.width and this.height
 */
InputWidget.prototype.updateDim = function() {
  DebugOptions.markAbstract();
};

/**
 * Hides the InputWidget and performs and cleanup needed
 */
InputWidget.prototype.close = function() {

};

/**
 * Returns whether this InputWidget is a fixed height (rather than adjusting based on content and available space)
 * @return {boolean}
 */
InputWidget.prototype.fixedHeight = function() {
  return true;
};

/**
 * Used to assign a maximum height to an adjustable-height widget
 * @param {number} height
 */
InputWidget.prototype.setMaxHeight = function(height) {

};
