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
  	this.dcx = this.w - m - 2*cr 
  	this.cx2 = this.w - m - cr
  	const cy = iconH + 2.5*m + cr
  	this.cy = cy
  	const font = Font.uiFont(22)
  	const text1X = 0.5*m + (2*cr - GuiElements.measure.stringWidth("1", font))/2
  	const text2X = this.w - m - 2*cr + (2*cr - GuiElements.measure.stringWidth("2", font))/2 
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

  	this.setSwitch(LevelManager.currentLevel) //when you reload the window, it will remember the level
}

HLLevelSwitch.prototype.press = function() {
	const dur = "0.5s"

	let blueToWhite = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
	blueToWhite.setAttributeNS(null, "attributeName", "fill");
    blueToWhite.setAttributeNS(null, "to", Colors.white);
	blueToWhite.setAttributeNS(null, "dur", dur);
	blueToWhite.setAttributeNS(null, "repeatCount", "1");

	let whiteToBlue = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
	whiteToBlue.setAttributeNS(null, "attributeName", "fill");
    whiteToBlue.setAttributeNS(null, "to", this.textColor);
	whiteToBlue.setAttributeNS(null, "dur", dur);
	whiteToBlue.setAttributeNS(null, "repeatCount", "1");

	let animate = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
	animate.setAttributeNS(null, "attributeName", "transform");
	//animate.setAttributeNS(null, "from", "0 0");
	animate.setAttributeNS(null, "to", this.dcx + " 0") //+ this.cy);
	//animate.setAttributeNS(null, "begin", "0s");
	animate.setAttributeNS(null, "dur", dur);
	animate.setAttributeNS(null, "repeatCount", "1");


	let tB = this.text1 
	let tW = this.text2
	let finalCx = this.cx2
	let level = (LevelManager.currentLevel == 1) ? 2 : 1
	if (level == 1) {
		tB = this.text2
		tW = this.text1
		animate.setAttributeNS(null, "to", -this.dcx + " 0")
		finalCx = this.cx1
	}

	tB.appendChild(blueToWhite)
	blueToWhite.beginElement()

	tW.appendChild(whiteToBlue)
	whiteToBlue.beginElement()

	this.circleE.appendChild(animate)
	animate.beginElement()

	setTimeout(function() {
		LevelManager.setLevel(level); //will call setSwitch
		LevelManager.loadLevelSavePoint();
	}.bind(this), 475)
	
}

HLLevelSwitch.prototype.setSwitch = function(level) {
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