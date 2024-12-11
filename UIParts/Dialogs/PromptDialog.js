/**
 * Dialog that allows the user to enter some text
 */

function PromptDialog(title, question, defaultText, shouldPrefill, callbackFn) {
	this.title = title
	this.question = question
	this.defaultText = defaultText
	this.shouldPrefill = shouldPrefill //TODO: make hint text when necessary
	this.callbackFn = callbackFn

	this.bgColor = HatchPlus ? Colors.ballyBrandBlue : RowDialog.titleBarColor
	this.outlineC = HatchPlus ? Colors.ballyGray : RowDialog.titleBarColor
	this.titleFont = HatchPlus ? Font.uiFont(20) : RD.titleBarFont
	this.questionFont = HatchPlus ? Font.secondaryUiFont(16) : RD.hintTextFont
	this.textColor = HatchPlus ? Colors.ballyGrayLight : RD.titleBarFontC

	this.width = 350//300
	this.height = 200
	this.x = GuiElements.width / 2 - this.width / 2;
    this.y = GuiElements.height / 2 - this.height / 2;
	this.visible = false

	this.options = []
}

PromptDialog.prototype.addOption = function(option) {
	this.options.push(option)
}

PromptDialog.prototype.show = function() {
	const RD = RowDialog
	if (!this.visible) {
		this.visible = true

		if (RD.currentDialog != null) { RD.currentDialog.makeInvisible() }

		const margin = 20

		this.group = GuiElements.create.group(this.x, this.y)
		this.bgRect = GuiElements.draw.rect(0, 0, this.width, this.height, this.bgColor, RD.cornerR, RD.cornerR)
		GuiElements.update.stroke(this.bgRect, this.outlineC, 3)
		this.group.append(this.bgRect)

		let titleTextE = GuiElements.draw.text(0, 0, this.title, this.titleFont, this.textColor)
		let titleX = this.width / 2 - GuiElements.measure.textWidth(titleTextE) / 2;
		let titleY = margin + this.titleFont.charHeight / 2;
		GuiElements.move.text(titleTextE, titleX, titleY);
  		this.group.appendChild(titleTextE);

  		let qTextE = GuiElements.draw.text(0, 0, this.question, this.questionFont, this.textColor)
		let qX = this.width / 2 - GuiElements.measure.textWidth(qTextE) / 2;
		let qY = titleY + margin + this.questionFont.charHeight / 2;
		GuiElements.move.text(qTextE, qX, qY);
		this.group.appendChild(qTextE);
  		


		const bnH = RD.bnHeight*2/3
		let bnW = bnH
		const bnM = 10
		const bnY = this.height - bnH - bnM
		const bnColor = HatchPlus ? Button.bg : RD.bgColor
		if (this.options.length == 0) { //The user is being prompted for text input
			
			const font = RD.hintTextFont;
			const textColor = HatchPlus ? Colors.ballyBrandBlueDark : RD.titleBarColor
			const textY = qY + margin + font.charHeight/2; //this.height/2 + font.charHeight / 2; 
			const textX = this.width/10
			const textW = this.width*4/5
			const textH = this.height/3
			this.charCount = 0;

			const etbg = GuiElements.draw.rect(textX, textY, textW, textH, Colors.white)
			this.group.append(etbg)
			const etY = textY + margin
			const etH = textH - 2*margin
			this.editableText = GuiElements.create.editableText(font, textColor, textX, textY, textW, textH, this.group)
			if (this.defaultText != null) {
				this.editableText.textContent = this.defaultText;
			}
			TouchReceiver.addListenersEditText(this.editableText, this);


			const confirmPathId = HatchPlus ? VectorPaths.bdConnected : VectorPaths.checkmark
			const cancelPathId = HatchPlus ? VectorPaths.bdClose : VectorPaths.letterX
			const confirmX = this.width - bnW - bnM
			const cancelX = confirmX - bnW - bnM
			const iconH = bnH*3/4
			const confirmBn = new Button(confirmX, bnY, bnW, bnH, this.group, bnColor)
			confirmBn.addIcon(confirmPathId, iconH)
			if (HatchPlus) { GuiElements.update.stroke(confirmBn.icon.pathE, Button.foreground, 2) }
			confirmBn.setCallbackFunction(function(){ this.confirm() }.bind(this), true)
			confirmBn.setCloseOverlays(false)
			const cancelBn = new Button(cancelX, bnY, bnW, bnH, this.group, bnColor)
			cancelBn.addIcon(cancelPathId, iconH)
			cancelBn.setCallbackFunction(function(){ this.cancel() }.bind(this), true)
			cancelBn.setCloseOverlays(false)
		} else {
			
			let bnX = this.width
			for (let i = 0; i < this.options.length; i++) {

				bnW = GuiElements.measure.stringWidth(this.options[i], Button.defaultFont) + 2*Button.defaultMargin
				bnX -= bnW + bnM

				const bn = new Button(bnX, bnY, bnW, bnH, this.group, bnColor)
				bn.addText(this.options[i])
				bn.setCallbackFunction(function() { 
					this.callbackFn(String(i+1)) 
					this.close()
				}.bind(this))
				bn.setCloseOverlays(false)

				console.log(this.callbackFn)				
			}
		}

		GuiElements.layers.overlayOverlay.appendChild(this.group);
		FBPopup.currentPopup = this //TODO: Make a more general variable to use for this purpose
		this.editText();
	}
}

PromptDialog.prototype.editText = function() {
	if (this.editableText == null) { return }
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

		if (RowDialog.currentDialog != null) { RowDialog.currentDialog.makeVisible() }
	}
}