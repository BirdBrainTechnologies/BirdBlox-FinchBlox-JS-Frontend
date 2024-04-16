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
	const tabIconY = tabY + (tabH - tabIconH)/2
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
	function tabIcon(path, color) {
		const w = VectorIcon.computeWidth(path, tabIconH)
		const x = tab2X + (tabW - w)/2
		const icon = new VectorIcon(x, tabIconY, path, color, tabIconH, null)
		icon.group.remove()
		return icon
	}
	this.createFileIcon = tabIcon(VectorPaths.bdCreateFilePage, this.iconColor)
	this.saveProgramIcon = tabIcon(VectorPaths.bdSaveProgramStar, this.iconColor)
	this.savedFilesIcon = tabIcon(VectorPaths.bdSavedFiles, this.iconColor)
	
	

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
			LevelManager.loadLevelSavePoint();
			this.close()
		}
	}.bind(this), true)
	createFileBn.markAsOverlayPart(this)
	const createFileBnIcon = new VectorIcon(this.bnIconM, this.bnIconY, VP.bdCreateFilePage, this.iconColor, this.bnIconH, createFileBn.group)
	TouchReceiver.addListenersBN(createFileBnIcon.pathE, createFileBn)
	const createFileBnAdd = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdAdd, this.iconColor, this.bnIcon2H, createFileBn.group)
	GuiElements.update.stroke(createFileBnAdd.pathE, this.iconColor, 3)
	TouchReceiver.addListenersBN(createFileBnAdd.pathE, createFileBn)

	const saveProgramBn = new Button(0, this.bnH + this.bnM, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
	saveProgramBn.setCallbackFunction(this.displaySaveProgramMenu.bind(this), true)
	saveProgramBn.markAsOverlayPart(this)
	const saveProgramBnIcon = new VectorIcon(this.bnIconM, this.bnIconY, VP.bdSaveProgramStar, this.iconColor, this.bnIconH, saveProgramBn.group)
	TouchReceiver.addListenersBN(saveProgramBnIcon.pathE, saveProgramBn)
	const saveProgramBnAdd = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdAdd, this.iconColor, this.bnIcon2H, saveProgramBn.group)
	GuiElements.update.stroke(saveProgramBnAdd.pathE, this.iconColor, 3)
	TouchReceiver.addListenersBN(saveProgramBnAdd.pathE, saveProgramBn)

	const savedFilesBn = new Button(0, (this.bnH + this.bnM)*2, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
	savedFilesBn.setCallbackFunction(this.displaySavedFilesMenu.bind(this), true)
	savedFilesBn.markAsOverlayPart(this)
	const savedFilesBnIcon = new VectorIcon(this.bnIconM, this.bnIconY, VP.bdSavedFiles, this.iconColor, this.bnIconH, savedFilesBn.group)
	TouchReceiver.addListenersBN(savedFilesBnIcon.pathE, saveProgramBn)
	const savedFilesBnOpen = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdOpen, this.iconColor, this.bnIcon2H, savedFilesBn.group)
	TouchReceiver.addListenersBN(savedFilesBnOpen.pathE, saveProgramBn)

}

HLFileDrawer.prototype.displayCreateFileMenu = function() {
	const VP = VectorPaths
	this.resetTab(2)

	this.group.appendChild(this.createFileIcon.group)

	const saveProgramBn = new Button(0, 0, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
	saveProgramBn.setCallbackFunction(function() { this.displaySaveProgramMenu(true) }.bind(this), true)
	saveProgramBn.markAsOverlayPart(this)
	const saveProgramBnIcon = new VectorIcon(this.bnIconM, this.bnIconY, VP.bdSaveProgramStar, this.iconColor, this.bnIconH, saveProgramBn.group)
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
	GuiElements.update.stroke(trashBnOpen.pathE, this.iconColor, 3)
	TouchReceiver.addListenersBN(trashBnOpen.pathE, trashBn)
}

HLFileDrawer.prototype.displaySaveProgramMenu = function(shouldCreateFile) {
	this.resetTab(2)

	this.group.appendChild(this.saveProgramIcon.group)
}

HLFileDrawer.prototype.displayTrashMenu = function() {
	this.resetTab(2)


}

HLFileDrawer.prototype.displaySavedFilesMenu = function() {
	this.resetTab(2)

	this.group.appendChild(this.savedFilesIcon.group)
}

