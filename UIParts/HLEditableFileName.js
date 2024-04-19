function HLEditableFileName(x, y, w, group) {
	this.font = Font.uiFont(12)
	this.color = Colors.ballyBrandBlueDark
	this.defaultText = "NEW"
	this.width = w
	this.height = this.font.charHeight * 2
	this.iconH = this.font.charHeight * 2 //these icons are square: width=height
	this.iconY = (this.height - this.iconH)/2
	this.iconM = 5
	this.isEditing = false
	
	this.group = GuiElements.create.group(x, y, group)

	const etX = this.iconH + this.iconM
	this.editableText = GuiElements.create.editableText(this.font, this.color, etX, 0, w - etX, this.height, this.group)
	this.editableText.addEventListener("keyup", function(event) {
		this.positionIcon()
	}.bind(this))
	this.editableText.addEventListener('blur', function() {
		this.isEditing = false
		const txt = this.editableText.textContent
		const LM = LevelManager
		const rename = SaveManager.fileName != LM.savePointFileNames[LM.currentLevel]
		const displayname = SaveManager.fileName.slice(0, -2)
		console.log("use editableText to rename " + displayname + " to " + txt)
		if (txt == this.defaultText || txt == "") { 
			//Cannot rename a file to the default text or empty string. Set back to current.
			this.updateFileName()
		} else {
			LM.saveAs(this.editableText.textContent, rename) 
		}
		
	}.bind(this))
	TouchReceiver.addListenersEditableFN(this.editableText, this);

	this.updateFileName()
}

HLEditableFileName.prototype.updateIcon = function() {
	if (this.icon != null) {
		this.icon.remove()
	}

	const fileSaved = (SaveManager.fileName != LevelManager.savePointFileNames[LevelManager.currentLevel])
	let iconP = VectorPaths.bdStarOutlined
	let fill = "none"
	if (fileSaved) {
		iconP = VectorPaths.bdSaveProgramStar
		fill = this.color
	}

	this.icon = new VectorIcon(0, 0, iconP, fill, this.iconH, this.group)

	if (!fileSaved) {
		GuiElements.update.stroke(this.icon.pathE, this.color, 3)
	}

	this.positionIcon()
}

HLEditableFileName.prototype.positionIcon = function() {
	if (this.icon == null) { return }

	//const textW = GuiElements.measure.textWidth(this.editableText)
	const textW = GuiElements.measure.stringWidth(this.editableText.textContent, this.font)
	const x = (this.width - textW - this.iconH - this.iconM)/2


	this.icon.move(x, this.iconY)

}

HLEditableFileName.prototype.editText = function() {
	if (this.editableText.textContent == this.defaultText) {
		this.editableText.textContent = ""
	}
	this.isEditing = true
	this.editableText.focus()
}

HLEditableFileName.prototype.updateFileName = function() {
	let displayname = this.defaultText
	if ((SaveManager.fileName != null) && 
		(SaveManager.fileName != LevelManager.savePointFileNames[LevelManager.currentLevel])) {
		displayname = SaveManager.fileName.slice(0, -2)
	} 

	this.editableText.textContent = displayname

	this.updateIcon()
}

HLEditableFileName.prototype.remove = function() {
	this.group.remove()
}

