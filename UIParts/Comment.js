//TODO:
// - Saving
// - Draggable to another block or the canvas
// - Multi line, position to avoid other blocks.

/**
 *
 */
function Comment() {
  this.parent = null //The block this comment is attached to
  //this.text = null
  this.draggable = true;
  this.dragging = false;
  this.edited = false;
  this.x = 0
  this.y = 0
  this.width = 200
  this.height = Comment.font.charHeight + 2*Comment.margin
  this.group = GuiElements.create.group(0, 0);

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

  Comment.isEditingText = false
}

Comment.prototype.updateParent = function(newParent) {

  //moving from a block to the canvas
  if (newParent == null && this.parent != null) {
    const tab = this.parent.stack.getTab();
    tab.mainG.appendChild(this.group)
    if (this.line != null) {
      this.line.remove()
      this.line = null
    }
  }

  this.parent = newParent;

  if (newParent != null) {
    this.x = this.parent.width + 2*Comment.margin
    this.y = 0
    this.parent.group.appendChild(this.group)

    this.lineX = this.parent.width
    this.lineY = this.parent.height / 2
    this.line = GuiElements.draw.rect(this.lineX, this.lineY, 2*Comment.margin, Comment.lineHeight, Comment.outlineColor)
    this.parent.group.appendChild(this.line);
  }

  GuiElements.move.group(this.group, this.x, this.y)

  this.update()
}

Comment.prototype.editText = function() {
  //Remove the default text
  if (!this.edited) {
    this.editableText.textContent = ""
    this.edited = true
  }

  Comment.isEditingText = true;
  this.editableText.focus();
}

Comment.prototype.update = function() {
  console.log("comment update " + this.height )
  const height = this.editableText.offsetHeight

  if (height != this.height - 2*Comment.margin) {
    this.height = height + 2*Comment.margin
    console.log("updating height to " + this.height)
    GuiElements.update.rect(this.bgRect, 0, 0, this.width, this.height)

    this.editableText.parentNode.setAttribute('height', height);
  }

  if (this.parent != null && this.height > this.parent.height) {
    let maxWidth = this.parent.width
    let totalHeight = this.parent.height
    let nextBlock = this.parent.nextBlock
    while (nextBlock != null && totalHeight < this.height) {
      maxWidth = Math.max(maxWidth, nextBlock.width)
      totalHeight = totalHeight + nextBlock.height
      nextBlock = nextBlock.nextBlock
    }

    this.x = maxWidth + 2*Comment.margin
    this.y = 0
    const lineWidth = 2*Comment.margin + maxWidth - this.parent.width
    GuiElements.move.group(this.group, this.x, this.y)
    GuiElements.update.rect(this.line, this.lineX, this.lineY, lineWidth, Comment.lineHeight)
  }
}

Comment.prototype.drag = function(x, y) {
  console.log("drag " + x + " " + y)
  this.x = x;
  this.y = y;
  this.updateParent()
}

Comment.prototype.delete = function() {
  if (this.textE) { this.textE.remove(); }
  this.bgRect.remove();
  this.line.remove();
}
