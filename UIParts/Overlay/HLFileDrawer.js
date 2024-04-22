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
	this.isExtended = false
	
	

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
	const menuBnX = this.menuW/12
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
	this.closeBnX = this.menuW - bnW - bnM
	this.closeBnY = this.vMargin + bnM
	this.closeBn = new Button(this.closeBnX, this.closeBnY, bnW, bnW, this.group, this.bgColor)
	this.closeBn.addColorIcon(VectorPaths.bdClose, bnW, this.iconColor2)
	this.closeBn.setCallbackFunction(this.close.bind(this), true)
	this.closeBn.markAsOverlayPart(this)



	//Add menu space and initial file menu
	this.menuOutlineW = 2
	const menuOffset = 60
	this.menuX = this.menuOutlineW
	this.menuY = this.vMargin + menuOffset
	this.menuH = this.height - menuOffset - this.menuOutlineW
	const menuR = r * 2/3
	this.menuTopRect = GuiElements.draw.rect(this.menuX, this.menuY, this.menuW - this.menuOutlineW, this.menuH - r, this.menuColor, menuR, menuR)
	this.group.appendChild(this.menuTopRect)
	const bottomY = GuiElements.height - this.vMargin - this.menuOutlineW - 3*r
	const bottomH = 3*r
	this.menuBottomRect = GuiElements.draw.rect(this.menuOutlineW, bottomY, this.width, bottomH, this.menuColor, r, r)
	this.group.appendChild(this.menuBottomRect)
	this.menuBonus = this.menuW*1/3

	//Measurements needed for the extra-wide menu
	this.menuW2 = this.menuW + this.menuBonus
	this.closeBnX2 = this.menuW2 - bnW - bnM


	//Add tabs
	const tabW = GuiElements.width/10.5
	const tabH = tabW*0.65
	const tabR = r/2
	const tab1X = tabR*5
	const tab2X = tab1X + tabW + this.menuOutlineW
	const tabY = this.menuY - tabH
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
	this.menuGroupX = menuBnX 
	this.menuGroupY = this.menuY + tabH
	this.menuGroup = GuiElements.create.group(this.menuGroupX, this.menuGroupY, this.group)
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

HLFileDrawer.prototype.resetTab = function(tab, extend, embed) {

	if (embed) {
		if (this.insetGroup != null) {
			this.insetGroup.remove()
		}
		const m = (this.menuW2 - this.bnW)/2 - this.menuW/20
		const y = RowDialog.bnHeight + RowDialog.bnMargin + m
		this.insetGroup = GuiElements.create.group(m, y, this.menuContainer)
		return
	}

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

	if (this.scrollBox != null) {
		this.scrollBox.hide();
		this.scrollFO.remove()
	}


	//Extend or shorten the drawer, but only if needed.
	if ( (extend && this.isExtended) || (!extend && !this.isExtended) ) {
		return
	}

	if (extend) {
		this.isExtended = true
		GuiElements.update.rect(this.menuTopRect, this.menuX, this.menuY, this.menuW2 - this.menuOutlineW, this.menuH - 15)
		this.closeBn.move(this.closeBnX2, this.closeBnY)
		GuiElements.animate.move(this.group, this.x - this.menuBonus, 0, this.slideDuration)

	} else {
		this.isExtended = false
		GuiElements.animate.move(this.group, this.x, 0, this.slideDuration)
		setTimeout(function() {
			GuiElements.update.rect(this.menuTopRect, this.menuX, this.menuY, this.menuW - this.menuOutlineW, this.menuH - 15)
			this.closeBn.move(this.closeBnX, this.closeBnY)
		}.bind(this), this.slideDuration*1000)
	}

}

HLFileDrawer.prototype.displayMainMenu = function() {
	const VP = VectorPaths
	this.resetTab(1)

	const createFileBn = new Button(0, 0, this.bnW, this.bnH, this.menuContainer, Colors.white, this.bnR, this.bnR, this.iconColor)
	createFileBn.setCallbackFunction(function() {
		if (LevelManager.currentFileIsUnsaved()) {
			this.displaySaveOrDeleteMenu()
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

HLFileDrawer.prototype.displaySaveOrDeleteMenu = function(embed) {
	const VP = VectorPaths

	this.resetTab(2, null, embed)
	if (!embed) {
		this.group.appendChild(this.createFileIcon.group)
	}
	const group = embed ? this.insetGroup : this.menuContainer
	
	const saveProgramBn = new Button(0, 0, this.bnW, this.bnH, group, Colors.white, this.bnR, this.bnR, this.iconColor)
	saveProgramBn.setCallbackFunction(function() { 
		this.displaySaveProgramMenu(!embed, embed) 
	}.bind(this), true)
	saveProgramBn.markAsOverlayPart(this)
	const saveProgramBnIcon = new VectorIcon(this.bnIconM - this.bnIconH/8, this.bnIconY - this.bnIconH/8, VP.bdSaveProgramStar, this.iconColor, this.bnIconH*5/4, saveProgramBn.group)
	TouchReceiver.addListenersBN(saveProgramBnIcon.pathE, saveProgramBn)
	const saveProgramBnAdd = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdAdd, this.iconColor, this.bnIcon2H, saveProgramBn.group)
	GuiElements.update.stroke(saveProgramBnAdd.pathE, this.iconColor, 3)
	TouchReceiver.addListenersBN(saveProgramBnAdd.pathE, saveProgramBn)

	const trashBn = new Button(0, this.bnH + this.bnM, this.bnW, this.bnH, group, Colors.white, this.bnR, this.bnR, this.iconColor)
	trashBn.setCallbackFunction(function() {
		this.displayTrashMenu(embed)
	}.bind(this), true)
	trashBn.markAsOverlayPart(this)
	const trashBnIcon = new VectorIcon(this.bnIconM, this.bnIconY, VP.bdTrash, this.iconColor, this.bnIconH, trashBn.group)
	TouchReceiver.addListenersBN(trashBnIcon.pathE, trashBn)
	const trashBnOpen = new VectorIcon(this.bnIcon2X, this.bnIcon2Y, VP.bdOpen, this.iconColor, this.bnIcon2H, trashBn.group)
	TouchReceiver.addListenersBN(trashBnOpen.pathE, trashBn)
}

HLFileDrawer.prototype.displaySaveProgramMenu = function(shouldCreateFile, embed) {
	const VP = VectorPaths

	this.resetTab(2, null, embed)

	const group = embed ? this.insetGroup : this.menuContainer
	
	let y = 0
	if (shouldCreateFile) {
		//Add the star at the top if this is in the create file tab
		const iconP = VP.bdSaveProgramStar
		const iconH = this.bnH * 4/5
		const iconW = VectorIcon.computeWidth(iconP, iconH)
		const iconX = (this.bnW - iconW)/2
		const spsIcon = new VectorIcon(iconX, y, iconP, this.iconColor, iconH, group)

		y += iconH + 10
	} else if (!embed) {
		//Add the star on the tab if it is its own menu
		this.group.appendChild(this.saveProgramIcon.group)
	}

	//Make the editable text box
	const bgRect = GuiElements.draw.rect(0, y, this.bnW, this.bnH, Colors.white, this.bnR/2, this.bnR/2)
	GuiElements.update.stroke(bgRect, Colors.ballyGray, 1)
	group.appendChild(bgRect)
	const font = Font.uiFont(16)
	this.editableText = GuiElements.create.editableText(font, this.textColor, 0, y + 10, this.bnW, this.bnH - 20, group)
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

		this.displaySuccess(embed)
	
	}.bind(this), function() {
		if (embed) {
			this.displaySaveOrDeleteMenu(embed)
		} else if (shouldCreateFile) {
			this.displaySaveOrDeleteMenu()
		} else {
			this.displayMainMenu()
		}
	}.bind(this), embed)

	this.editText()
}

HLFileDrawer.prototype.displayTrashMenu = function(embed) {

	this.resetTab(2, null, embed)
	
	const group = embed ? this.insetGroup : this.menuContainer

	//Add the trash icon
	const iconP = VectorPaths.bdTrash
	const iconH = 100
	const iconW = VectorIcon.computeWidth(iconP, iconH)
	const iconX = (this.bnW - iconW)/2
	const trashIcon = new VectorIcon(iconX, 0, iconP, this.iconColor, iconH, group)

	//Buttons
	this.addConfirmCancelBns(iconH + 40, function() {
		LevelManager.userDeleteFile(SaveManager.fileName)
		LevelManager.loadLevelSavePoint()
		this.displaySuccess(embed)
	}.bind(this), function() {
		this.displaySaveOrDeleteMenu(embed)
	}.bind(this), embed)


}

HLFileDrawer.prototype.displaySavedFilesMenu = function() {
	this.resetTab(2, true)

	this.group.appendChild(this.savedFilesIcon.group)

	//this.updateDrawer(true)


	//Get the list of files to display and determine how much space that will take
	const list = []
	for (let i = 0; i < LevelManager.filesSavedLocally.length; i++) {
	  const file = LevelManager.filesSavedLocally[i];
	  const suffix = file.slice(-2);
	  switch (suffix) {
	    case LevelManager.fileLevelSuffixes[1]:
	    case LevelManager.fileLevelSuffixes[2]:
	    case LevelManager.fileLevelSuffixes[3]:
	      list.push(file);
	  }
	}
	this.fileList = FileList.getSortedList(list);
	this.rowCount = this.fileList.length;


	const bnM = 10 
	this.fileBnH = 50
	const scrollHeight = this.rowCount*(RowDialog.bnHeight + RowDialog.bnMargin)//this.rowCount*(bnM + this.fileBnH)

	//Calculations for the scrollbox
	const availableHeight = this.menuH - this.menuW/6
	this.contentWidth = this.menuW2 - this.menuW/10
	this.hintText = "";
	console.log("*** contentWidth " + this.contentWidth)

	//const scrollBoxX = GuiElements.width - this.menuW2 + this.menuW/24 //GuiElements.width - this.menuW + this.menuGroupX
	//const scrollBoxX2 = GuiElements.width - this.menuW2 + this.menuGroupX
	//const scrollBoxY = this.menuY + this.menuW/12
	const scrollBoxX = this.menuW/20
	const scrollBoxY = this.menuY + this.menuW/12
	const scrollBoxWidth = this.contentWidth + 10; //Add space for scroll bar
	const scrollBoxHeight = Math.min(availableHeight, scrollHeight);
	//console.log("making content. sx=" + scrollBoxX + " sy=" + scrollBoxY + " this.y=" + this.y + " sh=" + scrollHeight + " ah=" + availableHeight + " sbh=" + scrollBoxHeight + " rc=" + this.rowCount + " bnh=" + RD.bnHeight);
	//Create the rows to display and the scrollbox to contain them
	if (this.rowCount != 0) {
	  //embed the scroll box in a foreign object so it can slide in with the menu
	  this.scrollFO = document.createElementNS('http://www.w3.org/2000/svg', "foreignObject");
	  this.scrollFO.setAttribute('width', scrollBoxWidth);
	  this.scrollFO.setAttribute('height', scrollBoxHeight);
	  this.scrollFO.setAttribute("x", scrollBoxX);
	  this.scrollFO.setAttribute("y", scrollBoxY);
	  this.group.appendChild(this.scrollFO)

	  const scrollDiv = document.createElement('div');
	  //scrollDiv.setAttribute('class', "divLayer")
	  scrollDiv.classList.add("divLayer")
	  scrollDiv.classList.add("hatchlingScroll")
	  this.scrollFO.appendChild(scrollDiv)

	  const rowGroup = RowDialog.prototype.createContent.call(this);
	  this.scrollBox = new SmoothScrollBox(rowGroup, scrollDiv,
	    0, 0, scrollBoxWidth, scrollBoxHeight, scrollBoxWidth, scrollHeight, this);

	  this.scrollBox.show();
	}
	
}
/**
 * Create one row to display one filename in the saved files menu
 */
HLFileDrawer.prototype.createRow = function(index, y, width, contentGroup, embed) {
	const VP = VectorPaths
	const fileName = this.fileList[index]
	const displayName = fileName.slice(0, -2)
	const level = fileName.slice(-1)
	const isOpen = fileName == SaveManager.fileName
	console.log("*** createRow width=" + width)

	const bgColor = (isOpen || embed) ? Colors.ballyBrandBlueLight : Colors.white
	const outlineColor = (isOpen || embed) ? Colors.ballyBrandBlue : null
	const button = new Button(0, y, width, this.fileBnH, contentGroup, bgColor, 10, 10, outlineColor);
	button.setCallbackFunction(function() {
		if (LevelManager.currentFileIsUnsaved()) {
			this.displayEmbededSaveOrDeleteMenu(fileName)
		} else {
			LevelManager.openFile(fileName)
			this.close()
		}
	}.bind(this), true)
	button.markAsOverlayPart(this)
	if (embed) { button.disable(true) }

	//Star
	const m = 5
	const starH = 20
	const starY = (this.fileBnH - starH)/2
	const starX = m
	const star = new VectorIcon(starX, starY, VP.bdSaveProgramStar, this.textColor, starH, button.group)
	TouchReceiver.addListenersBN(star.pathE, button)

	//File name 
	const font = Font.uiFont(12)
	const textX = starX + starH + m
	const textY = (this.fileBnH + font.charHeight)/2
	const textE = GuiElements.draw.text(textX, textY, displayName, font, this.textColor)
	const textW = GuiElements.measure.textWidth(textE)
	button.group.appendChild(textE)
	TouchReceiver.addListenersBN(textE, button)

	//Level indicator
	const liH = 18
	const liX = textX + textW + 2*m 
	const liY = (this.fileBnH - liH)/2
	const liRect = GuiElements.draw.rect(liX, liY, liH, liH, this.textColor, 2, 2)
	button.group.appendChild(liRect)
	TouchReceiver.addListenersBN(liRect, button)
	const levelFont = Font.uiFont(14)
	const liTextW = GuiElements.measure.stringWidth(level, levelFont)
	const liTextX = liX + (liH - liTextW)/2
	const liTextY = (this.fileBnH + levelFont.charHeight)/2
	const liTextE = GuiElements.draw.text(liTextX, liTextY, level, levelFont, Colors.white)
	button.group.appendChild(liTextE)
	TouchReceiver.addListenersBN(liTextE, button)


	//Arrow 
	const m2 = 8
	const arrowH = 30
	const arrowX = width - m2 - arrowH
	const arrowY = (this.fileBnH - arrowH)/2
	const arrow = new VectorIcon(arrowX, arrowY, VP.bdOpen, this.iconColor, arrowH, button.group)
	TouchReceiver.addListenersBN(arrow.pathE, button)

	//Trash
	const trashH = arrowH
	const trashX = arrowX - m2 - trashH
	const trashY = (this.fileBnH - trashH)/2
	const trash = new Button(trashX, trashY, trashH, trashH, button.group, Colors.white, trashH/2, trashH/2)
	trash.addColorIcon(VP.bdDelete, trashH, Colors.ballyRed)
	trash.setCallbackFunction(function() {
		LevelManager.userDeleteFile(fileName)
		if (fileName == SaveManager.fileName) {
			LevelManager.loadLevelSavePoint()
		}
		this.displaySavedFilesMenu()
	}.bind(this), true)
	trash.markAsOverlayPart(this)
	if (embed) { trash.disable(true) }



}

HLFileDrawer.prototype.displayEmbededSaveOrDeleteMenu = function(fileName) {
	this.resetTab(2, true)

	this.menuContainer = GuiElements.create.group(this.menuW/20, this.menuY + this.menuW/12, this.group)
	const w = this.contentWidth
	const h = this.menuH - this.menuW/3 - RowDialog.bnHeight - RowDialog.bnMargin

	this.createRow(this.fileList.indexOf(fileName), 0, w, this.menuContainer, true)

	const insetRect = GuiElements.draw.rect(0, (RowDialog.bnHeight + RowDialog.bnMargin), w, h, Colors.white, 10, 10)
	GuiElements.update.stroke(insetRect, Colors.ballyGray, 3)
	this.menuContainer.appendChild(insetRect)

	this.displaySaveOrDeleteMenu(true)
}

HLFileDrawer.prototype.displaySuccess = function(embed) {

	this.resetTab(2, null, embed)

	const group = embed ? this.insetGroup : this.menuContainer

	const m = this.bnW/6
	const h = this.bnW - 2*m 
	const r = h/2
	const center = m + r 
	const circle = GuiElements.draw.circle(center, center, r, Colors.white, group)
	const icon = new VectorIcon(m, m, VectorPaths.bdCheck, Colors.ballyGreen, h, group)
}

HLFileDrawer.prototype.editText = function() {
	if (this.editableText == null) { return }

	FBPopup.isEditingText = true; //TODO!
	this.editableText.focus();

}

HLFileDrawer.prototype.addConfirmCancelBns = function(y, confirmCallback, cancelCallback, embed) {
	const group = embed ? this.insetGroup : this.menuContainer
	const VP = VectorPaths
	const m = 10
	const w = (this.bnW - m)/2
	const h = this.bnH * 2/3
	const iH = h * 4/5
	const cancelBn = new Button(0, y, w, h, group, Colors.ballyRed, this.bnR, this.bnR)
	cancelBn.addColorIcon(VP.bdClose, iH, Colors.ballyRedLight)
	cancelBn.markAsOverlayPart(this)
	cancelBn.setCallbackFunction(cancelCallback, true)
	const confirmBn = new Button(w + m, y, w, h, group, Colors.ballyGreen, this.bnR, this.bnR)
	confirmBn.addColorIcon(VP.bdConnected, iH, Colors.ballyGreenLight)
	GuiElements.update.stroke(confirmBn.icon.pathE, Colors.ballyGreenLight, 3)
	confirmBn.markAsOverlayPart(this)
	confirmBn.setCallbackFunction(confirmCallback, true)
}
