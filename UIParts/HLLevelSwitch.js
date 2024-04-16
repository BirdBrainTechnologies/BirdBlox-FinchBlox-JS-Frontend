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
  	const text1X = (2*cr - GuiElements.measure.stringWidth("1", font))/2
  	const text2X = this.w - 1.5*m - 2*cr + (2*cr - GuiElements.measure.stringWidth("2", font))/2 
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
  }

HLLevelSwitch.prototype.press = function() {

	const duration = 0.5
	let tB = this.text1 
	let tW = this.text2
	let x = this.dcx
	let level = (LevelManager.currentLevel == 1) ? 2 : 1
	if (level == 1) {
		tB = this.text2
		tW = this.text1
		x = -this.dcx
	}

	setTimeout(function() {
		LevelManager.setLevel(level); //will call setSwitch
		LevelManager.loadLevelSavePoint();
	}.bind(this), 475)


	this.animations[0] = GuiElements.animate.updateColor(tB, Colors.white, duration)
	this.animations[1] = GuiElements.animate.updateColor(tW, this.textColor, duration)
	this.animations[2] = GuiElements.animate.move(this.circleE, x, 0, duration)
	
}

HLLevelSwitch.prototype.setSwitch = function(level) {


	for (let i = 0; i < this.animations.length; i++) {
		this.animations[i].remove()
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