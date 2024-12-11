
/**
 * Used for entering text into Slots.  
 * @param {string} text - text currently in the slot
 * @constructor
 */
InputWidget.TextWidget = function(text) {
	this.currentText = text 
	this.height = 200
	this.width = InputPad.width;
	this.bnH = InputWidget.NumPad.bnHeight
	this.bnM = InputWidget.NumPad.bnMargin
}
InputWidget.TextWidget.prototype = Object.create(InputWidget.prototype);
InputWidget.TextWidget.prototype.constructor = InputWidget.TextWidget;

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 * @param {Element} parentGroup
 * @param {BubbleOverlay} overlay
 * @param {EditableSlotShape} slotShape
 * @param {function} updateFn
 * @param {function} finishFn
 * @param {Data} data
 */
InputWidget.TextWidget.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
  InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);
  this.group = GuiElements.create.group(x, y, parentGroup);
  this.originalData = data

  let font = Font.uiFont(16)
  let color = Colors.ballyBrandBlueDark
  let tW = InputPad.width
  let tH = this.height - this.bnM - this.bnH
  const etbg = GuiElements.draw.rect(0, 0, tW, tH, Colors.white, Button.defaultR, Button.defaultR)
  this.group.append(etbg)
  let etxy = this.bnM/2
  let etW = tW - this.bnM 
  let etH = tH - this.bnM
  this.editableText = GuiElements.create.editableText(font, color, etxy, etxy, etW, etH, this.group, this)
  this.editableText.textContent = this.originalData.getValue()
  TouchReceiver.addListenersEditText(this.editableText, this);

  let bnY = tH + this.bnM
  let bnW = (this.width - this.bnM)/2
  let iH = 45
  let cancelBn = new Button(0, bnY, bnW, this.bnH, this.group);
  cancelBn.addIcon(VectorPaths.bdClose, iH)
  cancelBn.setCallbackFunction(this.cancel.bind(this), true);
  cancelBn.markAsOverlayPart(this.overlay);

  let okBn = new Button(bnW+this.bnM, bnY, bnW, this.bnH, this.group);
  okBn.addIcon(VectorPaths.bdConnected, iH)
  GuiElements.update.stroke(okBn.icon.pathE, Colors.ballyBrandBlue, 3)
  okBn.setCallbackFunction(this.confirm.bind(this), true);
  okBn.markAsOverlayPart(this.overlay);

  this.editText()
}

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 */
InputWidget.TextWidget.prototype.updateDim = function(x, y) {
  
};

InputWidget.TextWidget.prototype.update = function() {
	this.updateFn(new StringData(this.editableText.textContent))
}

InputWidget.TextWidget.prototype.editText = function() {
	this.editableText.focus()
}


InputWidget.TextWidget.prototype.cancel = function() {
	this.finishFn(this.originalData);
}

InputWidget.TextWidget.prototype.confirm = function() {
	this.finishFn(new StringData(this.editableText.textContent));
}