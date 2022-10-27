"use strict";

/**
 * CommentMoveManager is a class that moves the Comment that the user is dragging
 * CommentMoveManager contains function to start, stop, and update the movement of a Comment.
 * These functions are called by the TouchReceiver class when the user drags a Comment.
 * Initializer - Picks up a Comment so that it can be moved.  Stores necessary information in CommentMoveManager.move.
 * Transfers the Comment into the drag layer above other blocks.
 * @param {Comment} comment - The Comment the user dragged.
 * @param {number} x - The x coord of the user's finger.
 * @param {number} y - The y coord of the user's finger.
 */
function CommentMoveManager(comment, x, y) {
  const move = {}

  Overlay.closeOverlays(); // Close any visible overlays.

  comment.fly(); // Make the Comment fly (disconnects from current block and moves it into the drag layer).
  //move.bottomX = comment.relToAbsX(comment.width);   // Store the Comment's dimensions.
  //move.bottomY = comment.relToAbsY(comment.height);

  move.touchX = x; // Store coords
  move.touchY = y;
  move.offsetX = comment.getAbsX() - x; // Store offset.
  move.offsetY = comment.getAbsY() - y;
  move.comment = comment;

  move.topX = 0; // The top-left corner's x coord of the Comment being moved.
  move.topY = 0; // The top-left corner's y-coord of the Comment being moved.
  this.move = move;
  // Stores information used when determine which slot is closest to the moving stack.
  this.fit = {};
}

/**
 * Updates the position of the currently moving Comment.
 * Also highlights the block that fits it best (if any).
 * @param {number} x - The x coord of the user's finger.
 * @param {number} y - The y coord of the user's finger.
 */
CommentMoveManager.prototype.update = function(x, y) {
  const move = this.move; // shorthand

  move.touchX = x;
  move.touchY = y;
  move.topX = move.offsetX + x;
  move.topY = move.offsetY + y;
  //move.bottomX = move.comment.relToAbsX(move.comment.width);
  //move.bottomY = move.comment.relToAbsY(move.comment.height);
  // Move the Comment to the correct location.
  move.comment.move(CodeManager.dragAbsToRelX(move.topX), CodeManager.dragAbsToRelY(move.topY));
  // If the Comment overlaps with the BlockPalette then no slots are highlighted.
  var wouldDelete = BlockPalette.isStackOverPalette(move.touchX, move.touchY);
  if (wouldDelete) {
    Highlighter.hide(); // Hide any existing highlight.
    BlockPalette.showTrash();
  } else {
    BlockPalette.hideTrash();
    // The Block which fits it best (if any) will be stored in this.fit.bestFit.
    this.findBestFit();
    if (this.fit.found && (this.fit.bestFit.comment == null || this.fit.bestFit.comment == this.move.comment)) {
      this.fit.bestFit.highlight(true); // If such a Block exists, highlight it.
    } else {
      Highlighter.hide(); // If not, hide any existing highlight.
    }
  }

};

/**
 * Drops the Comment that is currently moving and connects it to the Block that fits it.
 */
CommentMoveManager.prototype.end = function() {
  const move = this.move; // shorthand
  const fit = this.fit; // shorthand

  move.topX = move.offsetX + move.touchX;
  move.topY = move.offsetY + move.touchY;
  //move.bottomX = move.comment.relToAbsX(move.comment.width);
  //move.bottomY = move.comment.relToAbsY(move.comment.height);
  // If the BlockStack overlaps with the BlockPalette, delete it.
  var shouldDelete = BlockPalette.isStackOverPalette(move.touchX, move.touchY);
  if (shouldDelete) {
    UndoManager.deleteComment(move.comment);
  } else {
    // The Block which fits it best (if any) will be stored in this.fit.bestFit.
    this.findBestFit();
    move.comment.land();
    if (fit.found) {
      move.comment.updateParent(fit.bestFit)
      Sound.playSnap();
    } else {
      move.comment.updateParent()
    }
  }
  SaveManager.markEdited();
  Highlighter.hide(); // Hide any existing highlight.
  BlockPalette.hideTrash();
};

/**
 * Drops the Comment where it is without attaching it to anything or deleting it.
 */
CommentMoveManager.prototype.interrupt = function() {
  const move = this.move; // shorthand

  move.topX = move.offsetX + move.touchX;
  move.topY = move.offsetY + move.touchY;
  move.stack.land();
  move.stack.updateDim(); // Fix! this line of code might not be needed.
  Highlighter.hide(); // Hide any existing highlight.

};

/**
 * Recursively searches for the Block that best fits the moving Comment.
 * All results are stored in CommentMoveManager.fit.  Nothing is returned.
 */
CommentMoveManager.prototype.findBestFit = function() {
  const fit = this.fit; // shorthand
  fit.found = false; // Have any matching slot/block been found?
  fit.bestFit = null; // Slot/Block that is closest to the item?
  fit.dist = 0; // How far is the best candidate from the ideal location?
  TabManager.activeTab.findBestFit(this); // Begins the recursive calls.
};
