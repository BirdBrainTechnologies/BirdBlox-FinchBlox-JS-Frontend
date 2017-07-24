/**
 * Manages three DisplayBoxes on the bottom of the screen.  DisplayBoxes are triggered by the display block and
 * which box is shown depends on the position parameter of the block
 * @constructor
 */
function DisplayBoxManager(){
	const DBM = DisplayBoxManager;
	DBM.boxes = [];
	// Create 3 boxes
	for(let i = 0; i < 3; i++) {
		DBM.boxes[i] = new DisplayBox(i);
	}
	// Build each box
	DBM.build();
}

/**
 * Builds all the Manager's boxes
 */
DisplayBoxManager.build = function(){
	const DBM = DisplayBoxManager;
	DBM.boxes.forEach(function(box){
		box.build();
	});
};

/**
 * Makes the specified DisplayBox display the message
 * @param {string} message - The message to display
 * @param {string} positionString - "position#", The position of the box, as a string
 */
DisplayBoxManager.displayText = function(message, positionString) {
	const DBM = DisplayBoxManager;
	if(positionString === "position1") {
		DBM.boxes[0].displayText(message);
	} else if(positionString === "position2") {
		DBM.boxes[1].displayText(message);
	} else if(positionString === "position3") {
		DBM.boxes[2].displayText(message);
	} else {
		// Invalid data stored in slot
		DebugOptions.assert(false);
	}
};

/**
 * Hides all DisplayBoxes (when one is tapped)
 */
DisplayBoxManager.hide = function(){
	const DBM = DisplayBoxManager;
	DBM.boxes.forEach(function(box){
		box.hide();
	});
};

/**
 * Resizes all DisplayBoxes
 */
DisplayBoxManager.updateZoom = function(){
	DisplayBox.updateZoom();
	DisplayBoxManager.boxes.forEach(function(box){
		box.updateZoom();
	})
};