/**
 * Create a scroll box similar to SmoothScrollBox, except that this one is made entirely 
 * from svg elements. 
 * @param {Element} contentGroup - The group that should be within the scrollBox
 * @param {Element} parentGroup - Group to add this scroll box to
 * @param {number} x - The x coord for the scroll box
 * @param {number} y - The y coord for the scroll box
 * @param {number} width - The width the scroll box should have
 * @param {number} height - The height the scroll box should have
 * @param {number} innerWidth - The width of the content within the scroll box.  If larger, the scroll box will scroll
 * @param {number} innerHeight - The height of the content within the scroll box.  If larger, the scroll box will scroll
 * @param {Overlay|null} [partOfOverlay=null] - The Overlay this SvgScrollBox is a part of, or null if N/A
 */
function SvgScrollBox(contentGroup, parentGroup, x, y, width, height, innerWidth, innerHeight, overlay) {
	this.contentGroup = contentGroup
	this.parentGroup = parentGroup
	this.width = width
	this.height = height
	this.innerWidth = innerWidth
	this.innerHeight = innerHeight
	this.partOfOverlay = overlay

	this.visible = true
	this.group = GuiElements.create.group(x, y, this.parentGroup)
	const bgRect = GuiElements.draw.rect(0, 0, width, height, Colors.ballyGrayLight)
	this.group.appendChild(bgRect) //necessary to capture touch/wheel events
	this.group.appendChild(this.contentGroup)
	GuiElements.clip(0, 0, width, height, this.group)

	this.contentX = 0
	this.contentY = 0

	this.barW = 5
	const color = Colors.ballyGray
	const minScale = 1/5
	const maxScale = 4/5
	if (innerHeight > height) {
		const percentOver = (innerHeight - height)/height
		const scale = Math.max(minScale, Math.min(maxScale, (100 - percentOver)))
		const barX = this.width - this.barW
		this.verticalBarY = this.barW/2 //make room for line cap
		this.verticalBarH = height*scale //2/5
		const y2 = this.verticalBarY + this.verticalBarH
		this.verticalScrollBar = GuiElements.draw.line(barX, this.verticalBarY, barX, y2, color, this.barW, true)
		TouchReceiver.addListenersScrollBar(this.verticalScrollBar, this, false)
		this.group.appendChild(this.verticalScrollBar)
	}
	if (innerWidth > width) {
		const percentOver = (innerWidth - width)/width
		const scale = Math.max(minScale, Math.min(maxScale, (100 - percentOver)))
		const barY = this.height - this.barW
		this.horizontalBarX = this.barW/2 //make room for line cap
		this.horizontalBarW = width*scale //2/5
		const x2 = this.horizontalBarX + this.horizontalBarW
		this.horizontalScrollBar = GuiElements.draw.line(this.horizontalBarX, barY, x2, barY, color, this.barW, true)
		TouchReceiver.addListenersScrollBar(this.horizontalScrollBar, this, true)
		this.group.appendChild(this.horizontalScrollBar)
	}

	this.hScale = (this.innerWidth - this.width)/(this.width - this.horizontalBarW - this.barW)

	this.vScale = (this.innerHeight - this.height)/(this.height - this.verticalBarH - this.barW)

	console.log("*** adding addListenersSvgScrollBox " + this.verticalBarY)
	TouchReceiver.addListenersSvgScrollBox(this.group, this)
}

SvgScrollBox.prototype.moveHorizontal = function(dx) {
	if (this.horizontalScrollBar == null) { return false }

	const barX = this.horizontalBarX + dx 
	const canMove = ( (barX > this.barW/2) && (barX < (this.width - this.horizontalBarW - this.barW/2)) ) 

	if (canMove) {
		this.horizontalBarX += dx
		this.contentX += -dx * this.hScale 
		this.update()
		return true
	} else {
		return false
	}
}
SvgScrollBox.prototype.moveVertical = function(dy) {
	if (this.verticalScrollBar == null) { return false }

	const barY = this.verticalBarY + dy
	const canMove = ( (barY > this.barW/2) && (barY < (this.height - this.verticalBarH - this.barW/2)) )

	if (canMove) {
		this.verticalBarY += dy
		this.contentY += -dy * this.vScale
		this.update()
		return true
	} else {
		return false
	}
}

SvgScrollBox.prototype.scrollStart = function(horizontal, x, y) {
	if (horizontal) {
		this.scrollStartX = x
	} else {
		this.scrollStartY = y
	}
	
}
SvgScrollBox.prototype.updateScroll = function(x, y) {
	if (this.scrollStartX != null) {
		const dx = x - this.scrollStartX
		if (this.moveHorizontal(dx)) {
			this.scrollStartX = x
		}
	}

	if (this.scrollStartY != null) {
		const dy = y - this.scrollStartY
		if (this.moveVertical(dy)) {
			this.scrollStartY = y
		}
	}
}
SvgScrollBox.prototype.scrollEnd = function() {
	this.scrollStartX = null 
	this.scrollStartY = null
}

SvgScrollBox.prototype.wheelScroll = function(e) {
	e.stopPropagation() //Need this?
	const scroll = (e.deltaY < 0) ? 10 : -10
	this.moveVertical(scroll)
}

SvgScrollBox.prototype.startDrag = function(x, y) {
	this.isDragging = true 
	this.dragStartX = x 
	this.dragStartY = y
}

SvgScrollBox.prototype.updateDrag = function(x, y) {
	if (!this.isDragging) { return }

	const dx = (this.dragStartX - x)/this.hScale
	const dy = (this.dragStartY - y)/this.vScale 

	if (this.moveHorizontal(dx)) {
		this.dragStartX = x 
	}
	if (this.moveVertical(dy)) {
		this.dragStartY = y
	}
}

SvgScrollBox.prototype.stopDrag = function() {
	this.isDragging = false
	this.dragStartX = null
	this.dragStartY = null
}

SvgScrollBox.prototype.update = function() {
	GuiElements.move.group(this.contentGroup, this.contentX, this.contentY)

	if (this.horizontalScrollBar != null) {
		this.horizontalScrollBar.setAttributeNS(null, "x1", this.horizontalBarX)
		this.horizontalScrollBar.setAttributeNS(null, "x2", this.horizontalBarX + this.horizontalBarW)
	}
	if (this.verticalScrollBar != null) {
		this.verticalScrollBar.setAttributeNS(null, "y1", this.verticalBarY)
		this.verticalScrollBar.setAttributeNS(null, "y2", this.verticalBarY + this.verticalBarH)
	}	
}

SvgScrollBox.prototype.show = function() {
	if (!this.visible) {
		this.visible = true
		this.parentGroup.appendChild(this.group)
	}
}

SvgScrollBox.prototype.hide = function() {
	if (this.visible) {
		this.visible = false
		this.parentGroup.removeChild(this.group)
	}
}