/**
 * Hatchling only class for the file drawer that slides out when the file 
 * button in the title bar is pressed.
 */
function HLFileDrawer() {
	//Constants
	this.vMargin = 10
	this.bgColor = Colors.ballyBrandBlueDark 
	this.menuColor = Colors.ballyGrayLight
	this.iconColor = Colors.ballyBrandBlue
	this.iconColor2 = Colors.ballyBrandBlueLight
	this.textColor = Colors.ballyBrandBlueDark
	this.visible = false
	this.slideDuration = 0.33

	
	

	Overlay.call(this, Overlay.types.menu)
}
HLFileDrawer.prototype = Object.create(Overlay.prototype);
HLFileDrawer.prototype.constructor = HLFileDrawer;


HLFileDrawer.prototype.open = function() {
	if (this.visible) { return }

	this.visible = true
	Overlay.addOverlay(this)
	GuiElements.blockInteraction(true);
	
	//Basic measurements
	this.height = GuiElements.height - 2*this.vMargin
	this.width = GuiElements.width/2
	this.x = GuiElements.width*2/3
	this.menuW = GuiElements.width/3
	const r = 15 //rectangle corner radius

	//Menu button measurements
	const menuBnX = 2*r
	this.bnH = GuiElements.height/6
	this.bnW = this.menuW - 2*menuBnX
	this.bnR = 15
	this.bnM = 15 //margin between buttons
	this.bnIconM = 20 //margin inside button 
	this.bnIconH = this.bnH * 3/5
	this.bnIconY = (this.bnH - this.bnIconH)/2
	this.bnIcon2H = this.bnH * 2/5
	this.bnIcon2X = this.bnW - this.bnIcon2H - this.bnIconM
	this.bnIcon2Y = (this.bnH - this.bnIcon2H)/2


	this.group = GuiElements.create.group(GuiElements.width, 0, GuiElements.layers.overlay)

	this.bgRect = GuiElements.draw.rect(0, this.vMargin, this.width, this.height, this.bgColor, r, r)
	this.group.appendChild(this.bgRect)

	//Add close button. Clicking outside the overlay will also close it.
	const bnW = 30
	const bnM = 10
	const bnX = this.menuW - bnW - bnM
	const bnY = this.vMargin + bnM
	const closeBn = new Button(bnX, bnY, bnW, bnW, this.group, this.bgColor)
	closeBn.addColorIcon(VectorPaths.bdClose, bnW, this.iconColor2)
	closeBn.setCallbackFunction(this.close.bind(this), true)
	closeBn.markAsOverlayPart(this)



	//Add menu space and initial file menu
	const menuOutlineW = 2
	const menuOffset = 60
	const menuY = this.vMargin + menuOffset
	const menuH = this.height - menuOffset - menuOutlineW
	const menuR = r * 2/3
	this.menuTopRect = GuiElements.draw.rect(menuOutlineW, menuY, this.menuW - menuOutlineW, menuH - r, this.menuColor, menuR, menuR)
	this.group.appendChild(this.menuTopRect)
	const bottomY = GuiElements.height - this.vMargin - menuOutlineW - 3*r
	const bottomH = 3*r
	this.menuBottomRect = GuiElements.draw.rect(menuOutlineW, bottomY, this.width, bottomH, this.menuColor, r, r)
	this.group.appendChild(this.menuBottomRect)


	//Add tabs
	const tabW = GuiElements.width/10.5
	const tabH = tabW*0.65
	const tabR = r/2
	const tab1X = tabR*5
	const tab2X = tab1X + tabW + menuOutlineW
	const tabY = menuY - tabH
	const tabIconH = tabH * 2/3
	this.tab1 = GuiElements.draw.tab(tab1X, tabY, tabW, tabH, this.menuColor, tabR)

	this.group.appendChild(this.tab1)
	this.tab2 = GuiElements.draw.tab(tab2X, tabY, tabW, tabH, this.menuColor, tabR)
	this.group.appendChild(this.tab2)
	GuiElements.update.opacity(this.tab2, 0)

	//Add file tab button
	this.fileTabBn = new Button(tab1X, tabY, tabW, tabH, this.group, this.menuColor, tabR, tabR)
	this.fileTabBn.addColorIcon(VectorPaths.bdFile, tabIconH, this.iconColor)
	this.fileTabBn.setCallbackFunction(this.displayMainMenu.bind(this), true)
	this.fileTabBn.disable(true)
	this.fileTabBn.markAsOverlayPart(this)

	//Add tab 2 icons
	function tabIcon(path, color, h) {
		const w = VectorIcon.computeWidth(path, h)
		const x = tab2X + (tabW - w)/2
		const y = tabY + (tabH - h)/2
		const icon = new VectorIcon(x, y, path, color, h, null)
		icon.group.remove()
		return icon
	}
	this.createFileIcon = tabIcon(VectorPaths.bdCreateFilePage, this.iconColor, tabIconH)
	this.saveProgramIcon = tabIcon(VectorPaths.bdSaveProgramStar, this.iconColor, tabIconH * 3/2)
	this.savedFilesIcon = tabIcon(VectorPaths.bdSavedFiles, this.iconColor, tabIconH)
	
	

	//Add buttons for file menu
	this.menuGroup = GuiElements.create.group(menuBnX, menuY + tabH, this.group)
	this.displayMainMenu()


	//Slide the drawer into view
	GuiElements.animate.move(this.group, this.x, 0, this.slideDuration)

}

HLFileDrawer.prototype.close = function() {
	if (!this.visible) { return }

	this.visible = false

	//Must wait until the animation is complete to remove the overlay
	setTimeout(function() {
		this.group.remove()
		Overlay.removeOverlay(this)
		GuiElements.unblockInteraction();
	}.bind(this), this.slideDuration*1000)

	GuiElements.animate.move(this.group, GuiElements.width, 0, this.slideDuration)
}

HLFileDrawer.prototype.resetTab = function(tab) {
	if (this.menuContainer != null) {
		this.menuContainer.remove()
	}
	this.menuContainer = GuiElements.create.group(0, 0, this.menuGroup)

	this.editableText = null

	switch(tab) {
	case 1:
		GuiElements.update.opacity(this.tab1, 1)
		GuiElements.update.opacity(this.tab2, 0)
		this.fileTabBn.disable(true)
		this.fileTabBn.updateBgColor(this.menuColor, null, this.iconColor)
		this.createFileIcon.group.remove()
		this.saveProgramIcon.group.remove()
		this.savedFilesIcon.group.remove()
		break;
	case 2:
		GuiElements.update.opacity(this.tab1, 0)
		GuiElements.update.opacity(this.tab2, 1)
		this.fileTabBn.enable()
		this.fileTabBn.updateBgColor(this.bgColor, null, this.iconColor2)
		break;
	default:
		console.error("HLFileDrawer tab " + tab + " not implemented.")
	}
}

HLFileDrawer.prototype.displayMainMenu = function() {
	const VP = VectorPaths
	this.resetTab(1)

	const createFileBn = new Button(0, 0, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
	createFileBn.setCallbackFunction(function() {
		const stackList = TabManager.activeTab.stackList
		if (SaveManager.fileName != undefined && 
			SaveManager.fileName == LevelManager.savePointFileNames[LevelManager.currentLevel] &&
			(stackList.length > 1 || !(stackList.length != 0 &&
        	stackList[0].firstBlock.isStartBlock && 
        	stackList[0].firstBlock.nextBlock == null))) {
			this.displayCreateFileMenu()
		} else {
			if (SaveManager.fileName != LevelManager.savePointFileNames[LevelManager.currentLevel]) {
				LevelManager.loadLevelSavePoint();
			}
			this.close()
		}
	}.bind(this), true)
	createFileBn.markAsOverlayPart(this)
	const createFileBnIcon = new VectorIcon(this.bnIconM, this.bnIconY, VP.bdCreateFilePage, this.iconColor, this.bnIconH, createFileBn.group)
	TouchReceiver.addListenersBN(createFileBnIcon.pathE, createFileBn)
	const createFileBnAdd = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdAdd, this.iconColor, this.bnIcon2H, createFileBn.group)
	GuiElements.update.stroke(createFileBnAdd.pathE, this.iconColor, 3)
	TouchReceiver.addListenersBN(createFileBnAdd.pathE, createFileBn)

	let y = this.bnH + this.bnM
	if (SaveManager.fileName == LevelManager.savePointFileNames[LevelManager.currentLevel]) {
		const saveProgramBn = new Button(0, y, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
		saveProgramBn.setCallbackFunction(this.displaySaveProgramMenu.bind(this), true)
		saveProgramBn.markAsOverlayPart(this)
		const saveProgramBnIcon = new VectorIcon(this.bnIconM - this.bnIconH/8, this.bnIconY - this.bnIconH/8, VP.bdSaveProgramStar, this.iconColor, this.bnIconH*5/4, saveProgramBn.group)
		TouchReceiver.addListenersBN(saveProgramBnIcon.pathE, saveProgramBn)
		const saveProgramBnAdd = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdAdd, this.iconColor, this.bnIcon2H, saveProgramBn.group)
		GuiElements.update.stroke(saveProgramBnAdd.pathE, this.iconColor, 3)
		TouchReceiver.addListenersBN(saveProgramBnAdd.pathE, saveProgramBn)
		y += this.bnH + this.bnM
	}

	const savedFilesBn = new Button(0, y, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
	savedFilesBn.setCallbackFunction(this.displaySavedFilesMenu.bind(this), true)
	savedFilesBn.markAsOverlayPart(this)
	const savedFilesBnIcon = new VectorIcon(this.bnIconM, this.bnIconY, VP.bdSavedFiles, this.iconColor, this.bnIconH, savedFilesBn.group)
	TouchReceiver.addListenersBN(savedFilesBnIcon.pathE, savedFilesBn)
	const savedFilesBnOpen = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdOpen, this.iconColor, this.bnIcon2H, savedFilesBn.group)
	TouchReceiver.addListenersBN(savedFilesBnOpen.pathE, savedFilesBn)

}

HLFileDrawer.prototype.displayCreateFileMenu = function() {
	const VP = VectorPaths
	this.resetTab(2)

	this.group.appendChild(this.createFileIcon.group)

	const saveProgramBn = new Button(0, 0, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
	saveProgramBn.setCallbackFunction(function() { this.displaySaveProgramMenu(true) }.bind(this), true)
	saveProgramBn.markAsOverlayPart(this)
	const saveProgramBnIcon = new VectorIcon(this.bnIconM - this.bnIconH/8, this.bnIconY - this.bnIconH/8, VP.bdSaveProgramStar, this.iconColor, this.bnIconH*5/4, saveProgramBn.group)
	TouchReceiver.addListenersBN(saveProgramBnIcon.pathE, saveProgramBn)
	const saveProgramBnAdd = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdAdd, this.iconColor, this.bnIcon2H, saveProgramBn.group)
	GuiElements.update.stroke(saveProgramBnAdd.pathE, this.iconColor, 3)
	TouchReceiver.addListenersBN(saveProgramBnAdd.pathE, saveProgramBn)

	const trashBn = new Button(0, this.bnH + this.bnM, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
	trashBn.setCallbackFunction(this.displayTrashMenu.bind(this), true)
	trashBn.markAsOverlayPart(this)
	const trashBnIcon = new VectorIcon(this.bnIconM, this.bnIconY, VP.bdTrash, this.iconColor, this.bnIconH, trashBn.group)
	TouchReceiver.addListenersBN(trashBnIcon.pathE, trashBn)
	const trashBnOpen = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdOpen, this.iconColor, this.bnIcon2H, trashBn.group)
	TouchReceiver.addListenersBN(trashBnOpen.pathE, trashBn)
}

HLFileDrawer.prototype.displaySaveProgramMenu = function(shouldCreateFile) {
	const VP = VectorPaths
	this.resetTab(2)
	
	let y = 0
	if (shouldCreateFile) {
		//Add the star at the top if this is in the create file tab
		const iconP = VP.bdSaveProgramStar
		const iconH = this.bnH * 4/5
		const iconW = VectorIcon.computeWidth(iconP, iconH)
		const iconX = (this.bnW - iconW)/2
		const spsIcon = new VectorIcon(iconX, y, iconP, this.iconColor, iconH, this.menuContainer)

		y += iconH + 10
	} else {
		//Add the star on the tab if it is its own menu
		this.group.appendChild(this.saveProgramIcon.group)
	}

	//Make the editable text box
	const bgRect = GuiElements.draw.rect(0, y, this.bnW, this.bnH, Colors.white, this.bnR/2, this.bnR/2)
	GuiElements.update.stroke(bgRect, Colors.ballyGray, 1)
	this.menuContainer.appendChild(bgRect)
	const font = Font.uiFont(16)
	this.editableText = GuiElements.create.editableText(font, this.textColor, 0, y + 10, this.bnW, this.bnH - 20, this.menuContainer)
  	if (this.currentName != null) {
    	this.editableText.textContent = this.currentName;
  	}

  	TouchReceiver.addListenersEditText(this.editableText, this);

	y += this.bnH + 20

	this.addConfirmCancelBns(y, function() {
		const LM = LevelManager
		if (this.editableText == null ||
			this.editableText.textContent == null ||
		    this.editableText.textContent == "") {
		    //console.log("confirm button pressed without a name");
		    return;
		}

		let fileName = this.editableText.textContent

		if (fileName == SaveManager.fileName) {
		    //console.log("confirm button pressed without changing the name.")
		    return;
		}

		//console.log("Name file " + fileName);
		LM.saveAs(fileName, (SaveManager.fileName != LM.savePointFileNames[LM.currentLevel]));

		this.displaySuccess()
	
	}.bind(this))

	this.editText()
}

HLFileDrawer.prototype.displayTrashMenu = function() {
	this.resetTab(2)

	//Add the trash icon
	const iconP = VectorPaths.bdTrash
	const iconH = 100
	const iconW = VectorIcon.computeWidth(iconP, iconH)
	const iconX = (this.bnW - iconW)/2
	const trashIcon = new VectorIcon(iconX, 0, iconP, this.iconColor, iconH, this.menuContainer)

	//Buttons
	this.addConfirmCancelBns(iconH + 40, function() {
		LevelManager.userDeleteFile(SaveManager.fileName)
		LevelManager.loadLevelSavePoint()
		this.displaySuccess()
	}.bind(this))


}

HLFileDrawer.prototype.displaySavedFilesMenu = function() {
	this.resetTab(2)

	this.group.appendChild(this.savedFilesIcon.group)
}

HLFileDrawer.prototype.displaySuccess = function() {
	this.resetTab(2)

	const m = this.bnW/6
	const h = this.bnW - 2*m 
	const r = h/2
	const center = m + r 
	const circle = GuiElements.draw.circle(center, center, r, Colors.white, this.menuContainer)
	const icon = new VectorIcon(m, m, VectorPaths.bdCheck, Colors.ballyGreen, h, this.menuContainer)
}

HLFileDrawer.prototype.editText = function() {
	if (this.editableText == null) { return }

	FBPopup.isEditingText = true; //TODO!
	this.editableText.focus();

}

HLFileDrawer.prototype.addConfirmCancelBns = function(y, callback) {
	const VP = VectorPaths
	const m = 10
	const w = (this.bnW - m)/2
	const h = this.bnH * 2/3
	const iH = h * 4/5
	const cancelBn = new Button(0, y, w, h, this.menuContainer, Colors.ballyRed, this.bnR, this.bnR)
	cancelBn.addColorIcon(VP.bdClose, iH, Colors.ballyRedLight)
	cancelBn.markAsOverlayPart(this)
	cancelBn.setCallbackFunction(this.displayMainMenu.bind(this), true)
	const confirmBn = new Button(w + m, y, w, h, this.menuContainer, Colors.ballyGreen, this.bnR, this.bnR)
	confirmBn.addColorIcon(VP.bdConnected, iH, Colors.ballyGreenLight)
	GuiElements.update.stroke(confirmBn.icon.pathE, Colors.ballyGreenLight, 3)
	confirmBn.markAsOverlayPart(this)
	confirmBn.setCallbackFunction(callback, true)
}
