/**
 * A hand indicating an action the user should take.
 * 
 * @param {number} x - x coordinate to point to
 * @param {number} y - y coordinate to point to
 * @param {Element} parent - the element to highlight (must be part of title bar)
 * @param {Block} block - block to hightlight
 */

function HelpingHand(parent, block) {
	this.x = parent.x + parent.width/2
	this.y = parent.y + parent.height + 10
	this.parentGroup = parent.group
	this.parentLayer = GuiElements.layers.titlebar
	this.block = block
	this.offset = 0

	//console.log("HelpingHand: ")
	//console.log(this)
	this.show()
	this.animate()

	setTimeout(function() { this.close() }.bind(this), 2000)
}

HelpingHand.prototype.show = function() {
	let pathId = VectorPaths.bsHandIndexFill//VectorPaths.bsHandIndex//VectorPaths.faHandPointer
	let height = 90
	let width = VectorIcon.computeWidth(pathId, height)
	this.group = GuiElements.create.group(this.x,this.y)
	const pointer = new VectorIcon(0, 0, pathId, Colors.finchGreen, height, this.group)
	GuiElements.update.stroke(pointer.pathE, Colors.fbDarkGreen, 0.5)


	this.highlightG = GuiElements.create.group(0, 0, GuiElements.layers.overlay);
	if (this.block != null) {
		const zf = TabManager.activeTab.zoomFactor;
		GuiElements.update.zoom(this.highlightG, zf);
		this.highlightG.appendChild(this.block.group);
		//this.layerG.appendChild(this.block.group);

		let absX = this.block.stack.relToAbsX(this.block.x);
		let absY = this.block.stack.relToAbsY(this.block.y);
		GuiElements.move.group(this.block.group, absX / zf, absY / zf);
    } else if (this.parentGroup != null) {
    	this.highlightG.appendChild(this.parentGroup);
    }


	GuiElements.layers.overlay.appendChild(this.group);
	GuiElements.blockInteraction();
}

HelpingHand.prototype.animate = function() {
	let timer = setInterval(function(){
		this.offset += 1
		GuiElements.move.group(this.group, this.x, this.y - this.offset)
	}.bind(this), 25)
	setTimeout(function() { clearInterval(timer) }, 500)

	//get the length of a side of a square given the hypotenuse
	let dl = function (h) {
		return Math.sqrt( (h*h)/2 )
	}

	let interval = 10 //time between animation frames
	let frames = 10
	let start = 1000 //time after function call to start this animation
	let lineL = 5
	let s = dl(lineL)
	let l1 = GuiElements.draw.line(25-lineL, 10, 25, 10, Colors.white, 5)
	let l2 = GuiElements.draw.line(31-s, 5-s, 31, 5, Colors.white, 5)
	let l3 = GuiElements.draw.line(38, -lineL, 38, 0, Colors.white, 5)
	let l4 = GuiElements.draw.line(45+s, 5-s, 45, 5, Colors.white, 5)
	let l5 = GuiElements.draw.line(51+lineL, 10, 51, 10, Colors.white, 5)
	setTimeout(function() { 
		this.group.appendChild(l1) 
		this.group.appendChild(l2)
		this.group.appendChild(l3)
		this.group.appendChild(l4)
		this.group.appendChild(l5) 
	}.bind(this), start)

	setTimeout(function() {
		let t2 = setInterval(function() {
			lineL += 1
			s = dl(lineL)

			l1.setAttributeNS(null, "x1", 25-lineL)
			l2.setAttributeNS(null, "x1", 31-s)
			l2.setAttributeNS(null, "y1", 5-s)
			l3.setAttributeNS(null, "y1", -lineL)
			l4.setAttributeNS(null, "x1", 45+s)
			l4.setAttributeNS(null, "y1", 5-s)
			l5.setAttributeNS(null, "x1", 51+lineL)
		}, interval)
		setTimeout(function() { clearInterval(t2) }, frames*interval)
	}, start)

	setTimeout(function() {
		let t3 = setInterval(function() {
			lineL -= 1
			s = dl(lineL)

			l1.setAttributeNS(null, "x2", 10+lineL)
			l2.setAttributeNS(null, "x2", 20.4+s)
			l2.setAttributeNS(null, "y2", -5.6+s)
			l3.setAttributeNS(null, "y2", -15+lineL)
			l4.setAttributeNS(null, "x2", 55.6-s)
			l4.setAttributeNS(null, "y2", -5.6+s)
			l5.setAttributeNS(null, "x2", 66-lineL)
		}, interval)
		setTimeout(function() { clearInterval(t3) }, frames*interval)
	}, start + frames*interval)
	
	setTimeout(function() {
		l1.remove()
		l2.remove()
		l3.remove()
		l4.remove()
		l5.remove()
	}.bind(this), start + 2*frames*interval)
	
}

HelpingHand.prototype.close = function() {
	if (this.block != null) {
		this.block.group.remove();
		this.block.stack.group.appendChild(this.block.group);
		GuiElements.move.group(this.block.group, this.block.x, this.block.y);
	} else if (this.parentGroup != null) {
		this.parentLayer.appendChild(this.parentGroup);
	}

	this.group.remove();

	GuiElements.unblockInteraction();
}