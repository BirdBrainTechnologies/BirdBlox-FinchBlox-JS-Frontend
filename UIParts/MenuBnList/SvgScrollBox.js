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
	this.group.appendChild(this.contentGroup)
	GuiElements.clip(0, 0, width, height, this.group)

	this.contentX = 0
	this.contentY = 0

	this.barW = 5
	const color = Colors.ballyGray
	if (innerHeight > height) {
		const barX = this.width - this.barW
		this.verticalBarY = this.barW/2 //make room for line cap
		this.verticalBarH = height*2/5
		const y2 = this.verticalBarY + this.verticalBarH
		this.verticalScrollBar = GuiElements.draw.line(barX, this.verticalBarY, barX, y2, color, this.barW, true)
		TouchReceiver.addListenersScrollBar(this.verticalScrollBar, this, false)
		this.group.appendChild(this.verticalScrollBar)
	}
	if (innerWidth > width) {
		const barY = this.height - this.barW
		this.horizontalBarX = this.barW/2 //make room for line cap
		this.horizontalBarW = width*2/5
		const x2 = this.horizontalBarX + this.horizontalBarW
		this.horizontalScrollBar = GuiElements.draw.line(this.horizontalBarX, barY, x2, barY, color, this.barW, true)
		TouchReceiver.addListenersScrollBar(this.horizontalScrollBar, this, true)
		this.group.appendChild(this.horizontalScrollBar)
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
		const barX = this.horizontalBarX + x - this.scrollStartX
		if (barX > this.barW/2 && barX < (this.width - this.horizontalBarW - this.barW/2)) {

			const overflow = this.innerWidth - this.width
			const barSpace = this.width - this.horizontalBarW - this.barW
			const scale = overflow/barSpace
			const barDist = x - this.scrollStartX
			const contentDist = -barDist * scale

			this.horizontalBarX = barX
			this.horizontalScrollBar.setAttributeNS(null, "x1", this.horizontalBarX)
			this.horizontalScrollBar.setAttributeNS(null, "x2", this.horizontalBarX + this.horizontalBarW)
			this.scrollStartX = x

			this.contentX += contentDist
			GuiElements.move.group(this.contentGroup, this.contentX, this.contentY)
		}
	}

	if (this.scrollStartY != null) {
		const barY = this.verticalBarY + y - this.scrollStartY
		if (barY > this.barW/2 && barY < (this.height - this.verticalBarH - this.barW/2)) {

			const overflow = this.innerHeight - this.height
			const barSpace = this.height - this.verticalBarH - this.barW
			const scale = overflow/barSpace
			const barDist = y - this.scrollStartY
			const contentDist = -barDist * scale

			this.verticalBarY = barY
			this.verticalScrollBar.setAttributeNS(null, "y1", this.verticalBarY)
			this.verticalScrollBar.setAttributeNS(null, "y2", this.verticalBarY + this.verticalBarH)
			this.scrollStartY = y

			this.contentY += contentDist
			GuiElements.move.group(this.contentGroup, this.contentX, this.contentY)			

		}
		
	}

}
SvgScrollBox.prototype.scrollEnd = function() {
	this.scrollStartX = null 
	this.scrollStartY = null
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