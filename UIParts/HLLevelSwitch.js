/**
 * Switch for changing levels in Hatchling
 * 
 */
function HLLevelSwitch(x, y) {
	const TB = TitleBar;
  	const TBLayer = GuiElements.layers.titlebar;
  	this.x = x
  	this.y = y
  	this.w = 65
  	this.color = Colors.ballyBrandBlue
  	this.textColor = Colors.ballyBrandBlueDark
  	const iconPath = VectorPaths.bdLevels
  	const iconH = 19
  	const iconW = VectorIcon.computeWidth(iconPath, iconH)
  	const iconX = (this.w - iconW)/2
  	const r = 17
  	const m = 3
  	const cr = r - m
  	const cx = m + cr 
  	this.cx1 = cx
  	this.dcx = this.w - 2*m - 2*cr //this.w - m - 2*cr 
  	this.cx2 = this.w - m - cr
  	const cy = iconH + 2.5*m + cr
  	const font = Font.uiFont(22)
  	const text1X = 0.25*m + (2*cr - GuiElements.measure.stringWidth("1", font))/2
  	const text2X = this.w - 1.25*m - 2*cr + (2*cr - GuiElements.measure.stringWidth("2", font))/2 
  	const textY = iconH + 2.5*m + ((2*cr + font.charHeight) / 2)

  	this.group = GuiElements.create.group(this.x, this.y, TBLayer)

  	const steps = new VectorIcon(iconX, 0, iconPath, this.color, iconH, this.group, null, null)

	const switchBg = GuiElements.draw.rect(0, (iconH + 1.5*m), this.w, 2*r, this.color, r, r);
  	this.group.appendChild(switchBg);

  	this.circleE = GuiElements.draw.circle(cx, cy, cr, Colors.white, this.group)

  	this.text1 = GuiElements.draw.text(text1X, textY, "1", font, this.textColor)
  	this.group.appendChild(this.text1)
  	this.text2 = GuiElements.draw.text(text2X, textY, "2", font, Colors.white)
  	this.group.appendChild(this.text2)

  	TouchReceiver.addListenersBN(switchBg, this)
  	TouchReceiver.addListenersBN(this.circleE, this)
  	TouchReceiver.addListenersBN(this.text1, this)
  	TouchReceiver.addListenersBN(this.text2, this)

  	this.animations = []

  	console.log("*** new level switch. current level is " + LevelManager.currentLevel)
  	this.setSwitch(LevelManager.currentLevel) //Necessary when the window is resized
  }

HLLevelSwitch.prototype.press = function() {
	console.log("*** press level switch")

	this.oldTab = TabManager.activeTab
	this.oldTab.dontDelete = true
	const duration = 1//0.5
	let tB = this.text1 
	let tW = this.text2
	let x = this.dcx
	let level = (LevelManager.currentLevel == 1) ? 2 : 1
	if (level == 1) {
		tB = this.text2
		tW = this.text1
		x = -this.dcx
	}
	this.animationInProgress = true


	console.log("*** about to create level switch tempG")
	//Create a temporary group to hold both old and new programs. This allows for the animation of switching files.
	this.tempG = GuiElements.create.group(0, 0, GuiElements.layers.activeTab)

	//Add the current tab
	const otX = this.oldTab.absToRelX(0) //-this.oldTab.scrollX
	const otY = this.oldTab.absToRelY(0) //-this.oldTab.scrollY
	const otW = GuiElements.width / this.oldTab.zoomFactor
	const otH = GuiElements.height / this.oldTab.zoomFactor
	const clipPathOldTab = GuiElements.clip(otX, otY, otW, otH, this.oldTab.mainG)
	this.tempG.appendChild(this.oldTab.mainG)

	LevelManager.setLevel(level); //will call setSwitch
	LevelManager.loadLevelSavePoint();

	//Add the new tab off screen
	/*const newTabX = (level == 1) ? GuiElements.width : -GuiElements.width 
	const clipPathNewTab = GuiElements.clip(0, 0, GuiElements.width, GuiElements.height, TabManager.activeTab.mainG)
	GuiElements.move.group(TabManager.activeTab.mainG, newTabX, 0)
	this.tempG.appendChild(TabManager.activeTab.mainG)*/
	
	const oldTabX = (level == 1) ? -GuiElements.width : GuiElements.width
    
    const rect = GuiElements.draw.rect(0, 0, GuiElements.width, GuiElements.height, "none")
    GuiElements.update.stroke(rect, Colors.ballyGray, 1)
    this.tempG.appendChild(rect)

    console.log("*** adding animations")
	this.animations[0] = GuiElements.animate.updateColor(tB, Colors.white, duration)
	this.animations[1] = GuiElements.animate.updateColor(tW, this.textColor, duration)
	this.animations[2] = GuiElements.animate.move(this.circleE, x, 0, duration, false, this.circleE.getAttribute("x"))
	this.animations[3] = GuiElements.animate.move(this.tempG, oldTabX, 0, duration, true)

	
	setTimeout(function() {
		this.animationInProgress = false
	}.bind(this), duration*1000)

}

HLLevelSwitch.prototype.setSwitch = function(level) {

	if (this.animationInProgress) {
		setTimeout(function() {
			this.setSwitch(level)
		}.bind(this), 50)
		return
	}


	for (let i = 0; i < this.animations.length; i++) {
		this.animations[i].remove()
	}

	if (this.oldTab != null) {
		this.oldTab.dontDelete = false
		this.oldTab.delete()
	}
	
	console.log("*** HLLevelSwitch setSwitch - about to delete tempG")
	if (this.tempG != null) {
		this.tempG.remove()
		this.tempG = null
	}

	if (TabManager.activeTab != null) {
		TabManager.activeTab.mainG.removeAttributeNS(null, "clip-path")
		GuiElements.move.group(TabManager.activeTab.mainG, 0, 0)
		GuiElements.layers.activeTab.appendChild(TabManager.activeTab.mainG)
	}
	

	switch(level){
	case 1:
		GuiElements.update.color(this.text2, Colors.white)
		GuiElements.update.color(this.text1, this.textColor)
		this.circleE.setAttributeNS(null, "cx", this.cx1)
		break;
	case 2:
		GuiElements.update.color(this.text1, Colors.white)
		GuiElements.update.color(this.text2, this.textColor)
		this.circleE.setAttributeNS(null, "cx", this.cx2)
		break;
	default:
		console.error("Level Switch does not support level " + level)
	}
}

HLLevelSwitch.prototype.release = function() {

}

HLLevelSwitch.prototype.interrupt = function() {
	//Called when switching levels
}

HLLevelSwitch.prototype.addText = function() {
	//Called when switching levels
}

HLLevelSwitch.prototype.remove = function() {
	this.group.remove()
}