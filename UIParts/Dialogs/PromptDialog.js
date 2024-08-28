/**
 * Dialog that allows the user to enter some text
 */

function PromptDialog(title, question, defaultText, shouldPrefill, callbackFn) {
	this.title = title
	this.question = question
	this.defaultText = defaultText
	this.shouldPrefill = shouldPrefill //TODO: make hint text when necessary
	this.callbackFn = callbackFn

	this.bgColor = HatchPlus ? Colors.ballyGrayLight : RowDialog.titleBarColor
	this.outlineC = HatchPlus ? Colors.ballyGray : RowDialog.titleBarColor

	this.width = 300
	this.height = 200
	this.x = GuiElements.width / 2 - this.width / 2;
    this.y = GuiElements.height / 2 - this.height / 2;
	this.visible = false
}

PromptDialog.prototype.show = function() {
	const RD = RowDialog
	if (!this.visible) {
		this.visible = true

		const margin = 20

		this.group = GuiElements.create.group(this.x, this.y)
		this.bgRect = GuiElements.draw.rect(0, 0, this.width, this.height, this.bgColor, RD.cornerR, RD.cornerR)
		GuiElements.update.stroke(this.bgRect, this.outlineC, 3)
		this.group.append(this.bgRect)

		let titleTextE = GuiElements.draw.text(0, 0, this.title, RD.titleBarFont, RD.titleBarFontC)
		let titleX = this.width / 2 - GuiElements.measure.textWidth(titleTextE) / 2;
		let titleY = margin + RD.titleBarFont.charHeight / 2;
		GuiElements.move.text(titleTextE, titleX, titleY);
  		this.group.appendChild(titleTextE);

  		let qTextE = GuiElements.draw.text(0, 0, this.question, RD.hintTextFont, RD.titleBarFontC)
		let qX = this.width / 2 - GuiElements.measure.textWidth(qTextE) / 2;
		let qY = titleY + margin + RD.hintTextFont.charHeight / 2;
		GuiElements.move.text(qTextE, qX, qY);
  		this.group.appendChild(qTextE);

  		const font = RD.hintTextFont;
		const textColor = HatchPlus ? RD.titleBarFontC : RD.titleBarColor
		const textY = qY + margin + font.charHeight/2; //this.height/2 + font.charHeight / 2; 
		const textX = this.width/10
		const textW = this.width*4/5
		const textH = this.height/3
		this.charCount = 0;

		const etbg = GuiElements.draw.rect(textX, textY, textW, textH, Colors.white)
		this.group.append(etbg)
		this.editableText = GuiElements.create.editableText(font, textColor, textX, textY, textW, textH, this.group)
		if (this.defaultText != null) {
			this.editableText.textContent = this.defaultText;
		}
		TouchReceiver.addListenersEditText(this.editableText, this);

		const confirmPathId = HatchPlus ? VectorPaths.bdConnected : VectorPaths.checkmark
		const cancelPathId = HatchPlus ? VectorPaths.bdClose : VectorPaths.letterX
		const bnH = RD.bnHeight*2/3
		const bnW = bnH
		const bnM = 10
		const bnY = this.height - bnH - bnM
		const confirmX = this.width - bnW - bnM
		const cancelX = confirmX - bnW - bnM
		const bnColor = HatchPlus ? Button.bg : RD.bgColor
		const iconH = bnH*3/4
		const confirmBn = new Button(confirmX, bnY, bnW, bnH, this.group, bnColor)
		confirmBn.addIcon(confirmPathId, iconH)
		confirmBn.setCallbackFunction(function(){ this.confirm() }.bind(this), true)
		const cancelBn = new Button(cancelX, bnY, bnW, bnH, this.group, bnColor)
		cancelBn.addIcon(cancelPathId, iconH)
		cancelBn.setCallbackFunction(function(){ this.cancel() }.bind(this), true)

		GuiElements.layers.overlayOverlay.appendChild(this.group);
		FBPopup.currentPopup = this //TODO: Make a more general variable to use for this purpose
		this.editText();
	}
}

PromptDialog.prototype.editText = function() {
	this.editableText.focus();
}

PromptDialog.prototype.confirm = function() {
	console.log("confirm")
	let text = this.editableText.textContent

	this.close()
  	if (text != null && text != "") {
  		this.callbackFn(false, text)
  	} else {
  		this.callbackFn(true, "")
  	}
}

PromptDialog.prototype.cancel = function() {
	console.log("cancel")
	this.close()
	this.callbackFn(true, "")
}

PromptDialog.prototype.close = function() {
	if (this.visible) {
		this.visible = false
		DialogManager.dialogVisible = false
		this.group.remove()
		FBPopup.currentPopup = null
	}
}