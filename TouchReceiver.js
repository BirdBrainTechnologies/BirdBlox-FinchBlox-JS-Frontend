"use strict";

/**
 * TouchReceiver is a static class that handles all touch events.
 * It adds touch event handlers and keeps track of what types of objects are being touched/dragged.
 */
function TouchReceiver() {
	const TR = TouchReceiver;   // shorthand
	TR.mouse = DebugOptions.shouldUseMouseMode();   // Use true when debugging on a desktop.
	TR.longTouchInterval = 700;   // The number of ms before a touch is considered a long touch.
	TR.fixScrollingInterval = 100;   // Duration between firing fix scroll timer
	TR.blocksMoving = false;   // No BlockStacks are currently moving.
	TR.targetType = "none";   // Stores the type of object being interacted with.
	TR.touchDown = false;   // Is a finger currently on the screen?
	TR.longTouch = false;   // Has the event already been handled by a long touch event?
	TR.target = null;   // The object being interacted with.
	TR.startX = 0;   // The x coord of the initial touch.
	TR.startY = 0;   // The y coord of the initial touch.
	TR.startX2 = 0;   // The x coord of the second touch.
	TR.startY2 = 0;   // The y coord of the second touch.
	TR.longTouchTimer = null;   // Triggers long touch events.
	TR.timerRunning = false;   // Indicates if the long touch timer is running.
	TR.zooming = false;   // There are not two touches on the screen.
	TR.dragging = false;   // Whether the user is dragging their finger
	TR.moveThreshold = 10;   // The minimum threshold before we consider the user to be dragging the screen
	TR.interactionEnabeled = true;   // Whether touches should be responded to
	TR.interactionTimeOut = null;
	let handlerMove = "touchmove";   // Handlers are different for touchscreens and mice.
	let handlerUp = "touchend";
	let handlerDown = "touchstart";
	if (TR.mouse) {
		handlerMove = "mousemove";
		handlerUp = "mouseup";
		handlerDown = "mousedown";
	}
	TR.handlerMove = handlerMove;
	TR.handlerUp = handlerUp;
	TR.handlerDown = handlerDown;
	// Add event handlers for handlerMove and handlerUp events to the whole document.
	TR.addListeners();
	// TR.test=true;
}
/**
 * Adds event handlers for handlerMove and handlerUp events to the whole document.
 */
TouchReceiver.addListeners = function() {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(document.body, TR.handlerMove, TouchReceiver.handleMove, false);
	TR.addEventListenerSafe(document.body, TR.handlerUp, TouchReceiver.handleUp, false);
	TR.addEventListenerSafe(document.body, TR.handlerDown, TouchReceiver.handleDocumentDown, false);
};

/**
 * Handles movement events and prevents drag gestures from scrolling document.
 * @param {event} event - passed event arguments.
 */
TouchReceiver.handleMove = function(event) {
	TouchReceiver.touchmove(event);   // Deal with movement.
};

/**
 * Handles end of touch events
 * @param {event} event - passed event arguments.
 */
TouchReceiver.handleUp = function(event) {
	TouchReceiver.touchend(event);
};

/**
 * Handles new touch events
 * @param {event} event
 */
TouchReceiver.handleDocumentDown = function(event) {
	if (TouchReceiver.touchstart(event)) {
		Overlay.closeOverlays();   // Close any visible overlays.
	}
};

/**
 * Ignores interaction from the user until enableInteraction is called or the timeout expires
 * @param {number} timeOut
 */
TouchReceiver.disableInteraction = function(timeOut) {
	const TR = TouchReceiver;
	TR.interactionEnabeled = false;
	TR.interactionTimeOut = window.setTimeout(function() {
		TouchReceiver.enableInteraction();
	}, timeOut);
};

/**
 * Re-enables interaction
 */
TouchReceiver.enableInteraction = function() {
	const TR = TouchReceiver;
	TR.interactionEnabeled = true;
	if (TR.interactionTimeOut != null) {
		window.clearTimeout(TR.interactionTimeOut);
		TR.interactionTimeOut = null;
	}
};

/**
 * Returns the touch x coord from the event arguments
 * @param {event} e - passed event arguments.
 * @return {number} - x coord.
 */
TouchReceiver.getX = function(e) {
	if (TouchReceiver.mouse) {   // Depends on if a desktop or touchscreen is being used.
		var x = e.clientX / GuiElements.zoomFactor;
	} else {
		var x = e.touches[0].pageX / GuiElements.zoomFactor;
	}

	//For rtl languages, the interface is flipped along the horizontal axis. This
	// puts the touch coordinate into the correct corrdinate system.
	if (Language.isRTL) { x = GuiElements.width - x; }

	return x;
};

/**
 * Returns the touch y coord from the event arguments
 * @param {event} e - passed event arguments.
 * @return {number} - y coord.
 */
TouchReceiver.getY = function(e) {
	if (TouchReceiver.mouse) {   // Depends on if a desktop or touchscreen is being used.
		return e.clientY / GuiElements.zoomFactor;
	}
	return e.touches[0].pageY / GuiElements.zoomFactor;
};

/**
 * Returns the touch x coord at the specified index
 * @param {event} e
 * @param {number} i
 * @return {number}
 */
TouchReceiver.getTouchX = function(e, i) {
	var x = e.touches[i].pageX / GuiElements.zoomFactor;

	//For rtl languages, the interface is flipped along the horizontal axis. This
	// puts the touch coordinate into the correct corrdinate system.
	if (Language.isRTL) { x = GuiElements.width - x; }

	return x;
};

/**
 * Returns the touch y coord at the specified index
 * @param {event} e
 * @param {number} i
 * @return {number}
 */
TouchReceiver.getTouchY = function(e, i) {
	return e.touches[i].pageY / GuiElements.zoomFactor;
};

/**
 * Handles new touch events.  Does not know which element was touched, the information is filled in by the calling
 * function.  Returns whether the touch is started
 * @param {event} e - passed event arguments.
 * @param {boolean=true} [preventD] - Whether preventDefault should be called. Should not be called on scrollable items
 * @return {boolean} - returns true iff !TR.touchDown
 */
TouchReceiver.touchstart = function(e, preventD) {
	const TR = TouchReceiver;
	if (!TR.interactionEnabeled) {
		e.preventDefault();
		return false;
	}
	if (preventD == null) {
		preventD = true;
	}
	if (preventD) {
		// GuiElements.alert("Prevented 1");
		e.preventDefault();   // Stops 300 ms delay events
	}
	// e.stopPropagation();
	const startTouch = !TR.touchDown;
	if (startTouch) {   // prevents multitouch issues.
		TR.stopLongTouchTimer();
		TR.dragging = false;
		TR.touchDown = true;
		TR.targetType = "none";   // Does not know the target of the touch.
		TR.target = null;
		TR.longTouch = false;
		TR.startX = TR.getX(e);
		TR.startY = TR.getY(e);
	}
	return startTouch;
};

/**
 * Checks if the application should start zooming.  Only called in response to a new touch on the canvas
 * @param {event} e
 */
TouchReceiver.checkStartZoom = function(e) {
	const TR = TouchReceiver;   // shorthand
	if (!TR.zooming && !TR.mouse && e.touches.length >= 2) {
		// There must be 2 touches in touch mode and not already be zooming
		// We know the current touch is on the canvas
		if ((!TR.dragging && TR.targetIsInTabSpace()) || TabManager.scrolling) {
			// If the previous touch started on the canvas and we aren't dragging, we start to zoom.
			// If the tab is scrolling and a new touch is on the canvas, we start scrolling.
			TR.dragging = true;
			if (TabManager.scrolling) {
				TabManager.endScroll();
				// First we stop dragging the canvas
			}
			// Now we get the data to start zooming
			TR.zooming = true;
			TR.startX = TR.getTouchX(e, 0);
			TR.startY = TR.getTouchY(e, 0);
			TR.startX2 = TR.getTouchX(e, 1);
			TR.startY2 = TR.getTouchY(e, 1);
			TabManager.startZooming(TR.startX, TR.startY, TR.startX2, TR.startY2);
		}
	}
};

/**
 * Returns whether the current touch is in the canvas
 * @return {boolean}
 */
TouchReceiver.targetIsInTabSpace = function() {
	const TR = TouchReceiver;
	if (TR.targetType === "tabSpace") {
		return true;
	} else if (TR.targetType === "block") {
		return true;
	} else if (TR.targetType === "slot") {
		// Have to make sure it isn't a slot on the BlockPalette
		return !TR.target.parent.stack.isDisplayStack;
	}
	return false;
};

/**
 * Handles new touch events for Blocks.  Stores the target Block.
 * @param {Block} target - The Block that was touched.
 * @param {event} e - passed event arguments.
 * @fix rename to touchStartBlock.
 */
TouchReceiver.touchStartBlock = function(target, e) {
	const TR = TouchReceiver;
	if (!target.stack.isDisplayStack) {
		TR.checkStartZoom(e);
	}
	if (TR.touchstart(e)) {
		Overlay.closeOverlays();   // Close any visible overlays.
		if (target.stack.isDisplayStack) {   // Determine what type of stack the Block is a member of.
			TR.targetType = "displayStack";
			TR.setLongTouchTimer();
		} else {
			TR.targetType = "block";
			TR.setLongTouchTimer();
		}
		TouchReceiver.target = target;   // Store target Block.
	}
};
/**
 * Handles new touch events for Slots.  Stores the target Slot.
 * @param {Slot} slot - The Slot that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartSlot = function(slot, e) {
	const TR = TouchReceiver;
	if (!slot.parent.stack.isDisplayStack) {
		TR.checkStartZoom(e);
	}
	if (TR.touchstart(e)) {
		if (!slot.isEditable() || slot.isEditing() !== true) {
			Overlay.closeOverlays();   // Close any visible overlays.
		}
		TR.targetType = "slot";
		TouchReceiver.target = slot;   // Store target Slot.
		TR.setLongTouchTimer();
	}
};
/**
 * Handles new touch events for CategoryBNs.  Stores the target CategoryBN.
 * @param {Category} target - The Category of the CategoryBN that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartCatBN = function(target, e) {
	const TR = TouchReceiver;
	if (TR.touchstart(e)) {
		Overlay.closeOverlays();   // Close any visible overlays.
		TR.targetType = "category";
		target.select();   // Makes the button light up and the category become visible.
		Overlay.closeOverlays();   // Close any visible overlays.
	}
};
/**
 * Handles new touch events for Buttons.  Stores the target Button.
 * @param {Button} target - The Button that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartBN = function(target, e) {
	const TR = TouchReceiver;
	const shouldPreventDefault = !target.scrollable && target.menuBnList == null;
	if (!shouldPreventDefault) {
		e.stopPropagation();   // Prevent other calls from preventing default
	}
	if (TR.touchstart(e, shouldPreventDefault)) {
		Overlay.closeOverlaysExcept(target.partOfOverlay);
		TR.setLongTouchTimer();
		TR.targetType = "button";
		TR.target = target;
		target.press();   // Changes the button's appearance and may trigger an action.
	}
};
/**
 * @param {SmoothScrollBox} target
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartScrollBox = function(target, e) {
	const TR = TouchReceiver;
	if (TR.touchstart(e, false)) {
		Overlay.closeOverlaysExcept(target.partOfOverlay);
		TR.targetType = "scrollBox";
		TR.target = target;
		e.stopPropagation();
	}
};
/**
 * @param {SliderWidget} target
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartSlider = function(target, e) {
	const TR = TouchReceiver;
	if (TR.touchstart(e, false)) {
		TR.targetType = "slider";
		TR.target = target;
		e.stopPropagation();
	}
};
/**
 * @param {event} e
 */
TouchReceiver.touchStartTabSpace = function(e) {
	const TR = TouchReceiver;
	TR.checkStartZoom(e);
	if (TR.touchstart(e)) {
		Overlay.closeOverlays();   // Close any visible overlays.
		TR.targetType = "tabSpace";
		TR.target = null;
	}
};
/**
 * @param {event} e
 */
TouchReceiver.touchStartDisplayBox = function(e) {
	const TR = TouchReceiver;
	if (TR.touchstart(e)) {
		Overlay.closeOverlays();   // Close any visible overlays.
		TR.targetType = "displayBox";
		TR.target = null;
		DisplayBoxManager.hide();   // Close all overlays
		// Avoids a bug where the touchEnd handler is never called if the object the user touched is removed
		TR.touchDown = false;
		e.stopPropagation();
	}
};
/**
 * @param {event} e
 */
TouchReceiver.touchStartOverlayPart = function(e) {
	const TR = TouchReceiver;
	if (TR.touchstart(e)) {

	}
};
/**
 * @param {SmoothMenuBnList} target
 * @param e
 */
TouchReceiver.touchStartSmoothMenuBnList = function(target, e) {
	const TR = TouchReceiver;
	if (TR.touchstart(e, false)) {
		Overlay.closeOverlaysExcept(target.partOfOverlay);
		TR.targetType = "smoothMenuBnList";
		TouchReceiver.target = target;   // Store target.
		e.stopPropagation();
	}
};
/**
 * @param {TabRow} tabRow
 * @param {number} index - The index of the tab that was tapped
 * @param e
 */
TouchReceiver.touchStartTabRow = function(tabRow, index, e) {
	const TR = TouchReceiver;
	if (TR.touchstart(e)) {
		Overlay.closeOverlaysExcept(tabRow.partOfOverlay);
		TR.targetType = "tabrow";
		tabRow.selectTab(index);
	}
};
/**
 * @param {CollapsibleItem} collapsibleItem
 * @param e
 */
TouchReceiver.touchStartCollapsibleItem = function(collapsibleItem, e) {
	const TR = TouchReceiver;
	if (TR.touchstart(e, false)) {
		Overlay.closeOverlays();
		TR.targetType = "collapsibleItem";
		TR.target = collapsibleItem;
		e.stopPropagation();
	}
};

TouchReceiver.touchStartDialogBlock = function(e) {
	GuiElements.removeVideos();
	if (SaveManager.fileName == null && !FinchBlox)  {
		if (OpenDialog.lastOpenFile != null) {
			SaveManager.userOpenFile(OpenDialog.lastOpenFile);
			OpenDialog.lastOpenFile = null;
			RowDialog.currentDialog.closeDialog();
		} else {
			SaveManager.getAvailableName(SaveManager.newProgName, function(availableName, alreadySanitized, alreadyAvailable) {
				SaveManager.newSoft(availableName, RowDialog.currentDialog.closeDialog());
			});
		}
	} else {
    if (RowDialog.currentDialog != null) {
      RowDialog.currentDialog.closeDialog();
    }
	}
}

/**
 * Handles touch movement events.  Tells stacks, Blocks, Buttons, etc. how to respond.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchmove = function(e) {
	const TR = TouchReceiver;
	let shouldPreventDefault = true;   // Don't prevent default if the target scrolls
	if (!TR.interactionEnabeled) {
		e.preventDefault();
		return;
	}
	// We start dragging when the touch moves outside the threshold
	if (TR.touchDown && (TR.hasMovedOutsideThreshold(e) || TR.dragging)) {
		TR.dragging = true;
		TR.stopLongTouchTimer();
		if (TR.longTouch) {
			Overlay.closeOverlays();
			TR.longTouch = false;
		}
		if (TR.zooming) {
			// If we are currently zooming, we update the zoom.
			if (e.touches.length < 2) {
				TR.touchend(e);
			} else {
				const x1 = TR.getTouchX(e, 0);
				const y1 = TR.getTouchY(e, 0);
				const x2 = TR.getTouchX(e, 1);
				const y2 = TR.getTouchY(e, 1);
				TabManager.updateZooming(x1, y1, x2, y2);
			}
		} else {
			// If the user drags a Slot, the block they are dragging should become the target.
			if (TR.targetType === "slot") {
				TR.target = TR.target.parent;   // Now the user is dragging a block.
				if (TR.target.stack.isDisplayStack) {
					TR.targetType = "displayStack";
				} else {
					TR.targetType = "block";
				}
			}
			/* If the user drags a Block that is in a DisplayStack,
			 the DisplayStack copies to a new BlockStack, which can be dragged. */
			if (TR.targetType === "displayStack") {
	        const x = TR.target.stack.getAbsX();
          const y = TR.target.stack.getAbsY();
          // The first block of the duplicated BlockStack is the new target.
          TR.target = TR.target.stack.duplicate(x, y).firstBlock;
          TR.targetType = "block";
			}
			/* If the user drags a Block that is a member of a BlockStack,
			 then the BlockStack should move. */
			if (TR.targetType === "block") {
				// If the CodeManager has not started the movement, this must be done first.
				let x = TR.getX(e);
				let y = TR.getY(e);
				if (TR.blocksMoving) {
					// The CodeManager handles moving BlockStacks.
					CodeManager.move.update(x, y);
				} else {
					CodeManager.move.start(TR.target, x, y);
					TR.blocksMoving = true;
				}
			}
      // Drag the slider of the slider widget
      if (TR.targetType === "slider") {
        TR.target.drag(TR.getX(e));
      }
			// If the user drags the palette, it should scroll.
			if (TR.targetType === "scrollBox") {
				shouldPreventDefault = false;
			}
			// If the user drags the tab space, it should scroll.
			if (TR.targetType === "tabSpace") {
				if (!TabManager.scrolling) {
					TabManager.startScroll(TR.getX(e), TR.getY(e));
				} else {
					TabManager.updateScroll(TR.getX(e), TR.getY(e));
				}
			}
			// If the user drags a button and it has a menuBnList, it should scroll it.
			if (TR.targetType === "button") {
				TR.target.interrupt();
				if (TR.target.scrollable) {
					TR.targetType = "smoothMenuBnList";
					TR.target.interrupt();
					TR.target = null;
				}
			}
			// If the user drags a smoothMenuBnList, it should scroll.
			if (TR.targetType === "smoothMenuBnList") {
				shouldPreventDefault = false;
			}
			// If the user drags a collapsibleItem, it should scroll
			if (TR.targetType === "collapsibleItem") {
				shouldPreventDefault = false;
				TR.targetType = "scrollBox";
				TR.target = null;
			}
		}
	}
	shouldPreventDefault &= TR.targetType !== "smoothMenuBnList";
	shouldPreventDefault &= TR.targetType !== "button" || !TR.target.scrollable;
	shouldPreventDefault &= TR.targetType !== "scrollBox";
	shouldPreventDefault &= TR.targetType !== "collapsibleItem";
	if (shouldPreventDefault) {
		// GuiElements.alert("Prevented 2 t:" + TR.targetType + "!");
		e.preventDefault();
	}
};

/**
 * Returns whether the touch has moved outside the threshold and should be considered a drag
 * @param {event} e
 * @return {boolean}
 */
TouchReceiver.hasMovedOutsideThreshold = function(e) {
	const TR = TouchReceiver;
	if (!TR.touchDown) return false;
	const distX = TR.startX - TR.getX(e);
	const distY = TR.startY - TR.getY(e);
	return (distX * distX + distY * distY >= TR.moveThreshold * TR.moveThreshold);
};

/**
 * Handles touch end events.  Tells stacks, Blocks, Buttons, etc. how to respond.
 * @param {event} e - passed event arguments.
 * @fix DateTime is no longer necessary to prevent repeat events.
 */
TouchReceiver.touchend = function(e) {
	const TR = TouchReceiver;
	let shouldPreventDefault = true;
	if (TR.zooming) {
		if (e.touches.length === 0) {
			TabManager.endZooming();
			TR.zooming = false;
			TR.touchDown = false;
		} else if (e.touches.length === 1) {
			// Switch from zooming to panning
			TabManager.endZooming();
			TR.zooming = false;
			TR.targetType = "tabSpace";
			TR.target = null;
			TabManager.startScroll(TR.getX(e), TR.getY(e));
		} else if (e.touches.length > 1) {
			// No action necessary
		}
	} else if (TR.touchDown && !TR.longTouch) {   // Prevents multitouch problems.
		TR.touchDown = false;
		TR.dragging = false;
		if (TR.targetType === "block") {
			if (TR.blocksMoving) {   // If a stack is moving, tell the CodeManager to end the movement.
				CodeManager.move.end();
				TR.blocksMoving = false;
			} else {   // The stack was tapped, so it should run.
				TR.target.stack.startRun();
			}
		} else if (TR.targetType === "button") {
			TR.target.release();   // Pass message on to button.
		} else if (TR.targetType === "slot") {
			// If a Slot is pressed and released without dragging, it is time to edit its value.
			TR.target.onTap();
		} else if (TR.targetType === "scrollBox") {
			shouldPreventDefault = false;
		} else if (TR.targetType === "tabSpace") {
			TabManager.endScroll();
		} else if (TR.targetType === "smoothMenuBnList") {
			shouldPreventDefault = false;
		} else if (TR.targetType === "collapsibleItem") {
			TR.target.toggle();
		} else if (TR.targetType == "displayStack") {
      TR.target.stack.startRun();
      /*
		    // tapping a block in the display stack runs the block once
        let execStatus = TR.target.updateRun();
				if (!execStatus.isRunning) {
            // start the execution of a block
            TR.target.startAction();
				}

        setTimeout(function(){
            // wait for the response before trying to fetch the response and display the result
						execStatus = TR.target.updateRun();
            TR.target.displayResult(execStatus.getResult());
        }, 100);*/
		}
	} else {
		TR.touchDown = false;
	}
	if (shouldPreventDefault) {
		// GuiElements.alert("Prevented 3");
		e.preventDefault();
	}
};

/**
 * Called when a user's interaction with the screen should be interrupted due to a dialog, etc.
 * Blocks that are moving should stop moving, but actions should not be triggered.
 */
TouchReceiver.touchInterrupt = function() {
	const TR = TouchReceiver;
	const touchWasDown = TR.touchDown;
	TR.touchDown = false;
	if (touchWasDown && !TR.longTouch) {   // Only interrupt if there is a finger on the screen.
		TR.touchDown = false;
		if (TR.targetType === "block") {
			if (TR.blocksMoving) {   // If a stack is moving, tell the CodeManager to end the movement.
				CodeManager.move.interrupt();
				TR.blocksMoving = false;
			}
		} else if (TR.targetType === "button") {
			TR.target.interrupt();   // Remove the highlight without triggering the action.
		} else if (TR.targetType === "tabSpace") {
			TabManager.endScroll();
		}
	}
};

/**
 * Triggered when the longTouchTimer tics.  Potentially shows a context menu
 */
TouchReceiver.touchLong = function() {
	const TR = TouchReceiver;
	TR.stopLongTouchTimer();
	if (TR.touchDown && !TR.zooming) {
		if (TR.targetType === "slot") {
			TR.target = TR.target.parent;   // Now the user is holding a block.
			if (TR.target.stack.isDisplayStack) {
				TR.targetType = "displayStack";
			} else {
				TR.targetType = "block";
			}
		}
		if (TR.targetType === "displayStack") {
			// Show the menu for variables
			if (TR.target.blockTypeName === "B_Variable" || TR.target.blockTypeName === "B_List") {
				TR.longTouch = true;
				new BlockContextMenu(TR.target, TR.startX, TR.startY);
			}
		}
		if (TR.targetType === "block") {
			TR.longTouch = true;
			new BlockContextMenu(TR.target, TR.startX, TR.startY);
		}
		if (TR.targetType === "button") {
			TR.target.longTouch();
		}
	}
};

/**
 * Starts the longTouchTimer
 */
TouchReceiver.setLongTouchTimer = function() {
	const TR = TouchReceiver;
	TR.stopLongTouchTimer();
	TR.longTouchTimer = self.setInterval(function() {
		TouchReceiver.touchLong();
	}, TR.longTouchInterval);
	TR.timerRunning = true;
};

/**
 * Stops the longTouchTimer
 */
TouchReceiver.stopLongTouchTimer = function() {
	const TR = TouchReceiver;
	if (TR.timerRunning) {
		TR.longTouchTimer = window.clearInterval(this.longTouchTimer);
		TR.timerRunning = false;
	}
};

/**
 * Adds handlerDown listeners to the parts of a CategoryBN.
 * @param {Element} element - The part of the CategoryBN the listeners are being applied to.
 * @param {Category} category - The category of the CategoryBN.
 */
TouchReceiver.addListenersCat = function(element, category) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		// When it is touched, the SVG element will tell the TouchReceiver its Category.
		TouchReceiver.touchStartCatBN(category, e);
	}, false);
};
/**
 * Adds handlerDown listeners to the parts of a Block.
 * @param {Element} element - The part of the Block the listeners are being applied to.
 * @param {Block} parent - The Block the SVG element belongs to.
 */
TouchReceiver.addListenersChild = function(element, parent) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		// When it is touched, the SVG element will tell the TouchReceiver its Block.
		TouchReceiver.touchStartBlock(parent, e);
	}, false);
};
/**
 * Adds handlerDown listeners to the parts of a Slot.
 * @param {Element} element - The part of the Slot the listeners are being applied to.
 * @param {Slot} slot - The Slot the SVG element belongs to.
 */
TouchReceiver.addListenersSlot = function(element, slot) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		// When it is touched, the SVG element will tell the TouchReceiver its Slot.
		TouchReceiver.touchStartSlot(slot, e);
	}, false);
};
/**
 * Adds handlerDown listeners to the parts of a Button.
 * @param {Element} element - The part of the Button the listeners are being applied to.
 * @param {Button} parent - The Button the SVG element belongs to.
 */
TouchReceiver.addListenersBN = function(element, parent) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		// When it is touched, the SVG element will tell the TouchReceiver its Button.
		TouchReceiver.touchStartBN(parent, e);
	}, false);
};
/**
 * @param {Element} element
 * @param {SmoothScrollBox} parent
 */
TouchReceiver.addListenersScrollBox = function(element, parent) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		// When it is touched, the SVG element will tell the TouchReceiver.
		TouchReceiver.touchStartScrollBox(parent, e);
	}, false);
};
/**
 * @param {Element} element
 * @param {SliderWidget} parent
 */
TouchReceiver.addListenersSlider = function(element, parent) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		// When it is touched, the SVG element will tell the TouchReceiver.
		TouchReceiver.touchStartSlider(parent, e);
	}, false);
};
/**
 * Adds handlerDown listeners to the background space in the Tab where blocks go. Used for scrolling.
 * @param {Element} element
 */
TouchReceiver.addListenersTabSpace = function(element) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		// When it is touched, the SVG element will tell the TabManager.
		TouchReceiver.touchStartTabSpace(e);
	}, false);
};
/**
 * Adds handlerDown listeners to the parts of the displayBox.
 * @param {Element} element - The part of the displayBox the listeners are being applied to.
 */
TouchReceiver.addListenersDisplayBox = function(element) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		// When it is touched, the SVG element will tell the TouchReceiver.
		TouchReceiver.touchStartDisplayBox(e);
	}, false);
};
/**
 * @param {Element} element
 * @param {TabRow} tabRow
 * @param {number} index
 */
TouchReceiver.addListenersTabRow = function(element, tabRow, index) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		TouchReceiver.touchStartTabRow(tabRow, index, e);
		TR.touchDown = false;
		e.stopPropagation();
	}, false);
};
/**
 * Adds handlerDown listeners to the parts of any overlay that do not already have handlers.
 * @param {Element} element - The part the listeners are being applied to.
 */
TouchReceiver.addListenersOverlayPart = function(element) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		TouchReceiver.touchStartOverlayPart(e);
	}, false);
};
/**
 * @param {Element} element
 * @param {SmoothMenuBnList} parent
 */
TouchReceiver.addListenersSmoothMenuBnListScrollRect = function(element, parent) {
	const TR = TouchReceiver;
	element.parent = parent;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		TouchReceiver.touchStartSmoothMenuBnList(this.parent, e);
	}, false);
};
/**
 * @param {Element} element
 * @param {CollapsibleItem} item
 */
TouchReceiver.addListenersCollapsibleItem = function(element, item) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerDown, function(e) {
		TouchReceiver.touchStartCollapsibleItem(item, e);
	}, false);
};
/**
 * @param {Element} element
 */
TouchReceiver.addListenersDialogBlock = function(element) {
	const TR = TouchReceiver;
	TR.addEventListenerSafe(element, TR.handlerUp, function(e) {
		TouchReceiver.touchStartDialogBlock(e);
	}, false);
};

/**
 * Makes the element call the function when the right type of listener is triggered.  The function is made safe by
 * DebugOptions so errors can be caught
 * @param {Element} element - The element to add the listeners to
 * @param {string} type - The listener to add
 * @param {function} func - The function to call when the listener is triggered
 */
TouchReceiver.addEventListenerSafe = function(element, type, func) {
	element.addEventListener(type, DebugOptions.safeFunc(func), false);
};

/**
 * Creates a timer that deals with a bug in iOS that occurs if the user tries to scroll an object that is already
 * at its maximum or minimum position.  The timer regularly checks the scroll and moves it 1 pixel if it is at either
 * extreme
 * @param {Element} div - The div to fix
 * @param {object|null} [statusObj] - An object with boolean field .still which is updates to indicate whether
 *                                    the div has stopped scrolling
 * @return {number|null} - The id of the timer or null
 */
TouchReceiver.createScrollFixTimer = function(div, statusObj) {
	// If the timer isn't necessary and there is no status object, there is no reason to make the timer
	if (!GuiElements.isIos && statusObj == null) return null;
	const mem = {};
	// Used to detect scrolling
	mem.lastY = null;
	mem.lastX = null;
	const fixScroll = function() {
		const stillY = mem.lastY == null || mem.lastY === div.scrollTop;
		const stillX = mem.lastX == null || mem.lastX === div.scrollLeft;
		const still = stillX && stillY;

		// Update status object
		if (statusObj != null) statusObj.still = still;
		// Do no more if we don't have to
		if (!GuiElements.isIos) return;

		mem.lastY = div.scrollTop;
		mem.lastX = div.scrollLeft;

		const height = parseInt(window.getComputedStyle(div).getPropertyValue('height'), 10);
		// Don't do the fix until the div stops moving
		if (TouchReceiver.touchDown || !still) return;
		// The div can't move so it doesn't matter
		if (div.scrollHeight === height) return;
		if (div.scrollTop <= 0) {
			// The div is at the top; move it down
			div.scrollTop = 1;
		} else if (div.scrollHeight - height - 1 <= div.scrollTop && div.scrollTop > 2) {
			// The div is at the bottom and is tall enough that moving up won't move it to the top.  Move it up.
			div.scrollTop = div.scrollHeight - height - 2;
		}
	};
	TouchReceiver.setInitialScrollFix(div);
	return self.setInterval(fixScroll, TouchReceiver.fixScrollingInterval);
};

/**
 * Gives the div an initial bump away from the top. If called when the div is created, prevents the div from jumping
 * visually
 * @param {Element} div
 */
TouchReceiver.setInitialScrollFix = function(div) {
	if (!GuiElements.isIos) return;
	if (div.scrollTop <= 0) {
		div.scrollTop = 1;
	}
};
