//TODO:
// - Saving
// - Draggable to another block or the canvas
// - Multi line, position to avoid other blocks.

/**
 *
 */
function Comment() {
  //this.id = Comment.count;
  //Comment.count++;
  this.parent = null //The block this comment is attached to
  //this.draggable = true;
  //this.dragging = false;
  this.edited = false;
  this.x = 0
  this.y = 0
  this.lastX = 0 //last non-flying location
  this.lastY = 0
  this.width = 200
  this.height = Comment.font.charHeight + 2*Comment.margin
  this.group = GuiElements.create.group(0, 0);
  this.flying = false;
  this.tab = null;

  this.bgRect = GuiElements.draw.rect(this.x, this.y, this.width, this.height, Comment.bgColor, Comment.cornerRadius, Comment.cornerRadius);
  GuiElements.update.stroke(this.bgRect, Comment.outlineColor, Comment.outlineWidth)
  TouchReceiver.addListenersComment(this.bgRect, this);
  this.group.appendChild(this.bgRect);

  const textY = Comment.margin; //Comment.font.charHeight/2 + Comment.margin;
  const textX = Comment.margin;
  const textW = this.width - 2*Comment.margin;
  const textH = this.height - 2*Comment.margin;
  this.editableText = GuiElements.create.editableText(Comment.font, Comment.textColor, textX, textY, textW, textH, this.group, this)

  TouchReceiver.addListenersComment(this.editableText, this);

  this.editableText.textContent = Language.getStr("Add_Comment_Here")
}

Comment.setGlobals = function() {
  Comment.bgColor = Colors.lightYellow
  Comment.outlineColor = Colors.white //Colors.controlYellow
  Comment.outlineWidth = 2
  Comment.textColor = Colors.black
  Comment.font = Font.uiFont(11)
  Comment.cornerRadius = 3
  Comment.margin = 10
  Comment.lineHeight = 2 //Height of line connecting comment to block.

  Comment.currentlyEditing = null //Store reference to comment that is being edited
  Comment.count = 0;
}

Comment.writeToXml = function(xmlDoc) {

}

Comment.importXml = function(commentNode, tab) {
  const comment = new Comment()
  comment.x = XmlWriter.getAttribute(commentNode, "x", 0, true);
	comment.y = XmlWriter.getAttribute(commentNode, "y", 0, true);
  //comment.id = XmlWriter.getAttribute(commentNode, "id", 0, true);
  comment.editableText.textContent = XmlWriter.getAttribute(commentNode, "text", "", false);
  comment.edited = true

  const parentID = XmlWriter.getAttribute(commentNode, "id", 0, true);
  //const hasParent = XmlWriter.getAttribute(commentNode, "hasParent", 0, false);
  //console.log("importing xml: " + comment.x + ", " + comment.y + ", " + comment.id + ", " + comment.editableText.textContent + ", " + hasParent)
  console.log("importing xml: " + comment.x + ", " + comment.y + ", " + parentID + ", " + comment.editableText.textContent)
  if (parentID > -1) {
    const request = {}
    request.id = parentID
    request.block = null
    tab.findBlockByID(request)

    if (request.block != null) {
      comment.updateParent(request.block)
    } else {
      console.error("This comment should have a parent (" + parentID + "), but it wasn't found")
    }
  } else {
    comment.tab = tab
    comment.tab.mainG.appendChild(comment.group)
    comment.updateParent()
  }
}

Comment.prototype.updateParent = function(newParent) {

  if (this.parent != null) {
    //this.parent.commentID = null;
    this.group.remove()
    if (this.line != null) {
      this.line.remove()
      this.line = null
    }

    if (newParent == null) { //moving from a block to the tab
      //this.x = this.parent.stack.x + this.x
      //this.y = this.parent.stack.y + this.y
      this.tab.mainG.appendChild(this.group)
    }
  }

  this.parent = newParent;

  if (newParent != null) {
    //this.parent.commentID = this.id;
    const newTab = newParent.stack.getTab()
    if (this.tab != null && this.tab != newTab) {
      const index = this.tab.commentList.indexOf(this)
      this.tab.commentList.splice(index, 1)
      console.log("adding the comment to a new tab")
      this.tab = newTab
      this.tab.commentList.push(this)
    } else if (this.tab == null) {
      this.tab = newTab
    }
    this.x = this.parent.width + 2*Comment.margin
    this.y = 0
    this.parent.group.appendChild(this.group)

    this.lineX = this.parent.width
    this.lineY = this.parent.height / 2
    this.line = GuiElements.draw.rect(this.lineX, this.lineY, 2*Comment.margin, Comment.lineHeight, Comment.outlineColor)
    this.parent.group.appendChild(this.line);
  }

  this.update()
}

Comment.prototype.editText = function() {
  //Remove the default text
  if (!this.edited) {
    this.editableText.textContent = ""
    this.edited = true
  }

  Comment.currentlyEditing = this;
  this.editableText.focus();
}

Comment.prototype.update = function() {
  const height = this.editableText.offsetHeight

  if (height != this.height - 2*Comment.margin) {
    this.height = height + 2*Comment.margin
    GuiElements.update.rect(this.bgRect, 0, 0, this.width, this.height)
    this.editableText.parentNode.setAttribute('height', height);
  }

  if (this.parent != null && !this.flying) {
    let maxWidth = this.parent.width
    let totalHeight = this.parent.height
    let nextBlock = this.parent.nextBlock
    if (this.parent.parent != null && this.parent.parent.isSlot) {
      nextBlock = this.parent.parent.parent.nextBlock
    }
    if (this.height > this.parent.height) {
      while (nextBlock != null && totalHeight < this.height) {
        maxWidth = Math.max(maxWidth, nextBlock.width)
        totalHeight = totalHeight + nextBlock.height
        nextBlock = nextBlock.nextBlock
      }
    }
    this.x = maxWidth + 2*Comment.margin
    this.y = 0
    const lineWidth = 2*Comment.margin + maxWidth - this.parent.width
    GuiElements.update.rect(this.line, this.lineX, this.lineY, lineWidth, Comment.lineHeight)
  }

  GuiElements.move.group(this.group, this.x, this.y)
  if (!this.flying) {
    this.lastX = this.x
    this.lastY = this.y
  }
}

Comment.prototype.move = function(x, y) {
  this.x = x;
  this.y = y;
  this.update()
}

Comment.prototype.delete = function() {
  if (this.parent != null) { this.updateParent() }
  this.group.remove();
  if (this.line != null) { this.line.remove() }

  const index = this.tab.commentList.indexOf(this)
  this.tab.commentList.splice(index, 1)
}

/**
 * Moves this Comment out of the Tab's group and into the drag layer about other Blocks.
 */
Comment.prototype.fly = function() {
  //Disconnect from current parent if there is one
  //if (this.parent != null) { this.updateParent() }
  if (this.parent != null) {
    this.x = this.parent.stack.x + this.parent.x + this.x
    this.y = this.parent.stack.y + this.parent.y + this.y
    if (this.line != null) { this.line.remove() }
  }
  // Remove group from Tab (visually only).
	this.group.remove();
	// Add group to drag layer.
	GuiElements.layers.drag.appendChild(this.group);
	// Get current location on screen.
	const absX = this.getAbsX();
	const absY = this.getAbsY();
	// Record that this BlockStack is flying.
	this.flying = true;
	// Move to ensure that position on screen does not change.
	this.move(CodeManager.dragAbsToRelX(absX), CodeManager.dragAbsToRelY(absY));
	//this.tab.updateArrows();
}

Comment.prototype.land = function() {
  this.group.remove(); // Remove from drag layer.
	this.tab.mainG.appendChild(this.group); // Go back into tab group.
	const absX = this.getAbsX(); // Get current location on screen.
	const absY = this.getAbsY();
	this.flying = false;
	// Update coordinates to ensure that position on screen does not change.
	// Actual move will take place after new parent is determined.
  this.x = this.tab.absToRelX(absX)
  this.y = this.tab.absToRelY(absY)
  //this.tab.updateArrows();
}

/**
 * Returns the x coord of the Comment relative to the screen.
 * @return {number} The x coord of the Comment relative to the screen.
 */
Comment.prototype.getAbsX = function() {
	return this.relToAbsX(0);
};
/**
 * Returns the y coord of the Comment relative to the screen.
 * @return {number} The y coord of the Comment relative to the screen.
 */
Comment.prototype.getAbsY = function() {
	return this.relToAbsY(0);
};
/**
 * Converts a coordinate relative to the Comment to one relative to the screen.
 * @param {number} x - The coord relative to the Comment.
 * @return {number} - The coord relative to the screen.
 */
Comment.prototype.relToAbsX = function(x) {
	if (this.flying) {
		return CodeManager.dragRelToAbsX(x + this.x);
	} else {
		return this.tab.relToAbsX(x + this.x); // In a Tab; return x plus Tab's offset.
	}
};

/**
 * @param {number} y
 * @return {number}
 */
Comment.prototype.relToAbsY = function(y) {
	if (this.flying) {
		return CodeManager.dragRelToAbsY(y + this.y); // Not in a Tab; scale by dragLayer's scale
	} else {
		return this.tab.relToAbsY(y + this.y); // In a Tab; return y plus Tab's offset.
	}
};

/**
 * Writes this Comment to XML (non recursive)
 * @param {Document} xmlDoc - The document to write to
 * @return {Node}
 */
Comment.prototype.createXml = function(xmlDoc) {
  const commentData = XmlWriter.createElement(xmlDoc, "comment");
	XmlWriter.setAttribute(commentData, "x", this.lastX);
	XmlWriter.setAttribute(commentData, "y", this.lastY);
  XmlWriter.setAttribute(commentData, "text", this.editableText.textContent);
  XmlWriter.setAttribute(commentData, "id", this.parent != null ? this.parent.id : -1);
  XmlWriter.setAttribute(commentData, "hasParent", (this.parent != null));
  console.log(commentData)
	return commentData;
}
