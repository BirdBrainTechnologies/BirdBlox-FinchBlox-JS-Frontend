/**
 * Display options as a series of buttons
 *
 */
InputWidget.Buttons = function(type, valueDictionary, startVal, iconPath, iconColor, bgColor, index) {
	this.type = type
	this.valueDictionary = valueDictionary
	this.value = startVal
	this.iconPath = iconPath
	this.iconColor = iconColor
	this.bgColor = bgColor
	this.index = index
	this.useIcons = Object.values(valueDictionary)[0].length != 1

	this.buttons = {}


	//TODO: Make a constants function?
	this.width = InputPad.width 
	this.height = this.width * 1/3
	this.hMargin = 20 
	this.bnH = this.height * 1/5
	this.font = Font.secondaryUiFont(18)
}
InputWidget.Buttons.prototype = Object.create(InputWidget.prototype)
InputWidget.Buttons.prototype.constructor = InputWidget.Buttons 


InputWidget.Buttons.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
	InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);

	this.parentGroup = parentGroup;
	this.group = GuiElements.create.group(x, y, parentGroup);
	this.bgRect = GuiElements.draw.rect(0, 0, this.width, this.height, "none");

	this.group.appendChild(this.bgRect);

	this.value = data[this.index];


	//Add top icon 
	const iconH = 80
	const iconW = VectorIcon.computeWidth(this.iconPath, iconH)
	const iconX = (this.width - iconW)/2
	const icon = new VectorIcon(iconX, 0, this.iconPath, this.iconColor, iconH, this.group)


	//Add a button and preview for each option 
	const bnY = this.height * 2/5
	const keys = Object.keys(this.valueDictionary)
	let bnX = this.hMargin
	const bnMargin = (1/4) * (this.width - 2*this.hMargin)/(keys.length - 1)
	const bnW = (this.width - 2*this.hMargin - bnMargin * (keys.length - 1))/keys.length
	const previewY = bnY + this.bnH + bnMargin*3/4
	for (var i = 0; i < keys.length; i++) {
		//option button
		const bn = new Button(bnX, bnY, bnW, this.bnH, this.group, this.bgColor, 3, 3, this.iconColor)
		bn.markAsOverlayPart(this.overlay)
		const val = keys[i]
		bn.setCallbackFunction(function() {
			this.value = val
			this.updateFn(this.value, this.index)
			this.updateBns()
		}.bind(this), true)
		this.buttons[val] = bn

		//led array option preview
		if (this.type == "ledArray") {
			const preview = GuiElements.draw.ledArray(this.group, val, bnW/7);
			GuiElements.move.group(preview.group, bnX, previewY)
		}

      	//set x for next option
		bnX += bnW + bnMargin
	}

	this.updateBns()
}

/**
 * Marks the currently selected button
 */
InputWidget.Buttons.prototype.updateBns = function() {
	const bnVals = Object.keys(this.buttons)
	for (var i = 0; i < bnVals.length; i++) {
		const val = bnVals[i]
		const button = this.buttons[val]
		const option = this.valueDictionary[val]
		let bgColor = this.bgColor
		let iconColor = this.iconColor

		if (val == this.value) {
			bgColor = this.iconColor
			iconColor = this.bgColor
		}

		button.updateBgColor(bgColor)

		if (option != null) {
			if (this.useIcons) {
				button.addColorIcon(VectorPaths[option], this.bnH/2, iconColor)
			} else {
				button.addText(option, this.font, iconColor)
			}
		}

	}

}

InputWidget.Buttons.prototype.updateDim = function(x, y) {
	//TODO: anything to update here?
}