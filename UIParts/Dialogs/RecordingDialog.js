/**
 * A dialog for creating and managing recordings.  RecordingDialogs interact with the RecordingManager for making
 * recordings, the Sound class for playing recordings, and SaveManager for renaming and deleting recordings
 * @param {Array<Sound>} listOfRecordings - The list of recordings for the open file
 * @constructor
 */
function RecordingDialog(listOfRecordings) {
	const RecD = RecordingDialog;
	// Create an array of ids
	this.recordings = listOfRecordings.map(function(x) {
		return x.id;
	});
	// Extra space at the bottom is needed for the recording controls
	RowDialog.call(this, true, "Recordings", this.recordings.length, 0, RecordingDialog.extraBottomSpace);
	this.addCenteredButton("Done", this.closeDialog.bind(this));
	this.addHintText("Tap record to start");
	/** @type {RecordingManager.recordingStates} - Whether the dialog is currently recording */
	this.state = RecordingManager.state;
}
RecordingDialog.prototype = Object.create(RowDialog.prototype);
RecordingDialog.prototype.constructor = RecordingDialog;

RecordingDialog.setConstants = function() {
	let RecD = RecordingDialog;
	RecD.currentDialog = null;
	RecD.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
	RecD.coverRectOpacity = 0.8;
	RecD.coverRectColor = Colors.black;
	RecD.counterColor = Colors.white;
	RecD.counterFont = Font.uiFont(60);
	RecD.remainingFont = Font.uiFont(16);
	RecD.remainingMargin = 10;
	RecD.counterBottomMargin = 50;
	RecD.recordColor = "#f00";
	RecD.recordFont = Font.uiFont(25);
	RecD.recordIconH = RecD.recordFont.charHeight;
	RecD.iconSidemargin = 10;
	RecD.recordingLimit = 5 * 60 * 1000;   // The maximum number of ms in a recording
	RecD.remainingThreshold = 5 * 60 * 1000;   // The remaining time is displayed when less than this many ms are left.
};

/**
 * @inheritDoc
 * @param {number} index
 * @param {number} y
 * @param {number} width
 * @param {Element} contentGroup
 */
RecordingDialog.prototype.createRow = function(index, y, width, contentGroup) {
	let RD = RowDialog;
	let largeBnWidth = width - RD.smallBnWidth * 2 - RD.bnMargin * 2;
	let recording = this.recordings[index];
	this.createMainBn(recording, largeBnWidth, 0, y, contentGroup);
	let renameBnX = largeBnWidth + RD.bnMargin;
	this.createRenameBn(recording, renameBnX, y, contentGroup);
	let deleteBnX = renameBnX + RD.smallBnWidth + RD.bnMargin;
	this.createDeleteBn(recording, deleteBnX, y, contentGroup);
};

/**
 * Creates the button for each recording that plays the recording when tapped
 * @param {Sound} recording
 * @param {number} bnWidth
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
RecordingDialog.prototype.createMainBn = function(recording, bnWidth, x, y, contentGroup) {
	let button = RowDialog.createMainBn(bnWidth, x, y, contentGroup);
	// Track whether the button is currently playing the recording
	const state = {};
	state.playing = false;
	let me = this;
	let showPlay = function() {
		button.addSideTextAndIcon(VectorPaths.play, RowDialog.iconH, recording);
	};
	let showStop = function() {
		button.addSideTextAndIcon(VectorPaths.square, RowDialog.iconH, recording);
	};
	// When the button is tapped...
	button.setCallbackFunction(function() {
		// Check the state...
		if (state.playing) {
			// Stop the sound
			Sound.stopAllSounds();
		} else {
			// Start the sound
			Sound.playAndStopPrev(recording, true, function() {
				state.playing = true;
				showStop();
			}, null, function() {
				// When the sound stops, change the icon and state
				if (me.visible) {
					state.playing = false;
					showPlay();
				}
			});
		}
	}, true);
	// Start with the play icon
	showPlay();
};

/**
 * Create the button for deleting recordings
 * @param {string} file - The name of the recording to delete
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
RecordingDialog.prototype.createDeleteBn = function(file, x, y, contentGroup) {
	let me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.trash, x, y, contentGroup, function() {
		RecordingManager.userDeleteFile(file, function() {
			me.reloadDialog();
		});
	});
};

/**
 * Create te button for renaming recordings
 * @param {string} file - The name of the recording to rename
 * @param {number} x
 * @param {number} y
 * @param {Element} contentGroup
 */
RecordingDialog.prototype.createRenameBn = function(file, x, y, contentGroup) {
	let me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.edit, x, y, contentGroup, function() {
		RecordingManager.userRenameFile(file, function() {
			me.reloadDialog();
		});
	});
};

/**
 * @inheritDoc
 */
RecordingDialog.prototype.show = function() {
	// Create the rows, title bar, etc.
	RowDialog.prototype.show.call(this);
	RecordingDialog.currentDialog = this;
	// Create the controls at the bottom.  These buttons are all hidden when created.
	this.recordButton = this.createRecordButton();
	this.discardButton = this.createDiscardButton();
	this.saveButton = this.createSaveButton();
	this.pauseButton = this.createPauseButton();
	this.resumeRecordingBn = this.createResumeRecordingBn();
	// Show the controls that correspond to the current state
	this.goToState(this.state);
};

/**
 * @inheritDoc
 */
RecordingDialog.prototype.hide = function() {
	RowDialog.prototype.hide.call(this);
	this.setCounterVisibility(false);
};

/**
 * @inheritDoc
 */
RecordingDialog.prototype.closeDialog = function() {
	RowDialog.prototype.closeDialog.call(this);
	RecordingDialog.currentDialog = null;
	Sound.stopAllSounds();
};

/**
 * Create the control for recording sounds
 * @return {Button}
 */
RecordingDialog.prototype.createRecordButton = function() {
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let x = RD.bnMargin;
	// gets the location of additional content
	let y = this.getExtraBottomY();
	let button = new Button(x, y, this.getContentWidth(), RD.bnHeight, this.group);
	// The button has slightly larger text in red with a circle icon next to it (centered)
	button.addCenteredTextAndIcon(VectorPaths.circle, RecD.recordIconH, RecD.iconSidemargin,
		"Record", RecD.recordFont, RecD.recordColor);
	button.setCallbackFunction(function() {
		RecordingManager.startRecording();
	}, true);
	return button;
};

/**
 * Create a control that is 1/3 the width of the record button
 * @param {number} buttonPosition - [0, 1, 2], whether the button is in the first, second, or third position
 * @param {function} callbackFn - Called on tap
 * @return {Button}
 */
RecordingDialog.prototype.createOneThirdBn = function(buttonPosition, callbackFn) {
	let RD = RowDialog;
	let width = (this.getContentWidth() - RD.bnMargin * 2) / 3;
	let x = (RD.bnMargin + width) * buttonPosition + RD.bnMargin;
	let y = this.getExtraBottomY();
	let button = new Button(x, y, width, RD.bnHeight, this.group);
	button.setCallbackFunction(callbackFn, true);
	return button;
};

/**
 * Creates the button for discarding the current recording
 * @return {Button}
 */
RecordingDialog.prototype.createDiscardButton = function() {
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let button = this.createOneThirdBn(0, function() {
		RecordingManager.discardRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.trash, RD.iconH, RecD.iconSidemargin, "Discard");
	return button;
};

/**
 * Creates the button for saving (stopping) the current recording
 * @return {Button}
 */
RecordingDialog.prototype.createSaveButton = function() {
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let button = this.createOneThirdBn(1, function() {
		this.goToState(RecordingManager.recordingStates.stopped);
		RecordingManager.stopRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.square, RD.iconH, RecD.iconSidemargin, "Stop");
	return button;
};

/**
 * Creates the button for pausing the current recording
 * @return {Button}
 */
RecordingDialog.prototype.createPauseButton = function() {
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let button = this.createOneThirdBn(2, function() {
		this.goToState(RecordingManager.recordingStates.paused);
		RecordingManager.pauseRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.pause, RD.iconH, RecD.iconSidemargin, "Pause");
	return button;
};

/**
 * Creates the button to unpause recording
 * @return {Button}
 */
RecordingDialog.prototype.createResumeRecordingBn = function() {
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let button = this.createOneThirdBn(2, function() {
		this.goToState(RecordingManager.recordingStates.recording);
		RecordingManager.resumeRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.circle, RD.iconH, RecD.iconSidemargin, "Record");
	return button;
};

/**
 * Draws the dark rectangle to cover the dialog while recording
 * @return {Element}
 */
RecordingDialog.prototype.drawCoverRect = function() {
	let halfStep = RowDialog.bnMargin / 2;
	let x = this.x + halfStep;
	let y = this.y + this.getExtraTopY() + halfStep;
	let height = this.getExtraBottomY() - this.getExtraTopY() - RowDialog.bnMargin;
	let width = this.width - RowDialog.bnMargin;
	let rect = GuiElements.draw.rect(x, y, width, height, RecordingDialog.coverRectColor);
	GuiElements.update.opacity(rect, RecordingDialog.coverRectOpacity);
	GuiElements.layers.overlayOverlay.appendChild(rect);
	return rect;
};

/**
 * Draws the recording elapsed timer counter with "0:00" as the string
 * @return {Element} - An SVG text element
 */
RecordingDialog.prototype.drawTimeCounter = function() {
	let RD = RecordingDialog;

	let textE = GuiElements.draw.text(0, 0, "0:00", RD.counterFont, RD.counterColor);
	GuiElements.layers.overlayOverlay.appendChild(textE);
	let width = GuiElements.measure.textWidth(textE);
	let height = GuiElements.measure.textHeight(textE);
	let x = this.x + this.width / 2 - width / 2;
	let y = this.getExtraBottomY() - RecordingDialog.counterBottomMargin;
	let span = this.getExtraBottomY() - this.getExtraTopY() - height;
	if (span < 2 * RecordingDialog.counterBottomMargin) {
		y = this.getExtraBottomY() - span / 2;
	}
	y += this.y;
	this.counterY = y;
	GuiElements.move.text(textE, x, y);
	this.counter =  textE;

	let remainingY = y + RD.remainingFont.charHeight + RD.remainingMargin;
	let remainingWidth = GuiElements.measure.stringWidth("0:00 Remaining", RD.remainingFont);
	let remainingX = this.x + (this.width - remainingWidth) / 2;
	this.remainingY = remainingY;
	this.remaingingText = GuiElements.draw.text(remainingX, remainingY, "", RD.remainingFont, RD.counterColor);
	GuiElements.layers.overlayOverlay.appendChild(this.remaingingText);
};

/**
 * Creates and shows a RecordingDialog after retrieving a list of recordings from the frontend
 */
RecordingDialog.showDialog = function() {
	RecordingManager.listRecordings(function(result) {
		let recordDialog = new RecordingDialog(result);
		recordDialog.show();
	});
};

/**
 * shows/hides parts of the dialog according to the recording state provided.
 * @param {RecordingManager.recordingStates} state - The state this RecordingDialog should enter
 */
RecordingDialog.prototype.goToState = function(state) {
	let RecD = RecordingDialog;
	this.state = state;
	let states = RecordingManager.recordingStates;
	if (state === states.stopped) {
		this.recordButton.show();
		this.discardButton.hide();
		this.saveButton.hide();
		this.pauseButton.hide();
		this.resumeRecordingBn.hide();
		this.setCounterVisibility(false);
		this.getCenteredButton(0).enable();
	} else if (state === states.recording) {
		this.recordButton.hide();
		this.discardButton.show();
		this.saveButton.show();
		this.pauseButton.show();
		this.resumeRecordingBn.hide();
		this.setCounterVisibility(true);
		this.getCenteredButton(0).disable();
	} else if (state === states.paused) {
		this.recordButton.hide();
		this.discardButton.show();
		this.saveButton.show();
		this.pauseButton.hide();
		this.resumeRecordingBn.show();
		this.setCounterVisibility(true);
		this.getCenteredButton(0).disable();
	}
};

/**
 * Notifies the current RecordingDialog (if any) that recording has started
 */
RecordingDialog.startedRecording = function() {
	if (RecordingDialog.currentDialog != null) {
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.recording);
	}
};

/**
 * Notifies the current RecordingDialog (if any) that recording has stopped
 */
RecordingDialog.stoppedRecording = function() {
	if (RecordingDialog.currentDialog != null) {
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.stopped);
		RecordingDialog.currentDialog.reloadDialog();
	}
};

/**
 * Notifies the current RecordingDialog (if any) that recording has paused
 */
RecordingDialog.pausedRecording = function() {
	if (RecordingDialog.currentDialog != null) {
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.paused);
	}
};

/**
 * Re-retrieves the list of names from the backend and reloads the dialog with it
 * @inheritDoc
 */
RecordingDialog.prototype.reloadDialog = function() {
	let thisScroll = this.getScroll();
	let me = this;
	RecordingManager.listRecordings(function(response) {
		me.closeDialog();
		let dialog = new RecordingDialog(response);
		dialog.show();
		dialog.setScroll(thisScroll);
	});
};

/**
 * Shows/hides the counter and coverRect
 * @param {boolean} visible - Whether the counter and background behind it should be visible
 */
RecordingDialog.prototype.setCounterVisibility = function(visible) {
	if (visible) {
		if (this.coverRect == null) {
			this.coverRect = this.drawCoverRect();
		}
		if (this.counter == null) {
			this.drawTimeCounter();
		}
	} else {
		if (this.coverRect != null) {
			this.coverRect.remove();
			this.coverRect = null;
		}
		if (this.counter != null) {
			this.counter.remove();
			this.counter = null;
			this.remaingingText.remove();
			this.remaingingText = null;
		}
	}
};

/**
 * Sets the text of the counter according to the provided time.  Formats the time into hh:mm:ss or mm:ss
 * @param {number} time - elapsed time in ms
 */

RecordingDialog.prototype.timeToString = function(time) {
	if (this.counter == null) return;
	let totalSeconds = Math.floor(time / 1000);
	let seconds = totalSeconds % 60;
	let totalMinutes = Math.floor(totalSeconds / 60);
	let minutes = totalMinutes % 60;
	let hours = Math.floor(totalMinutes / 60);
	let secondsString = seconds + "";
	if (secondsString.length < 2) {
		secondsString = "0" + secondsString;
	}
	let minutesString = minutes + "";
	let totalString = minutesString + ":" + secondsString;
	if (hours > 0) {
		if (minutesString.length < 2) {
			minutesString = "0" + minutesString;
		}
		totalString = hours + ":" + minutesString + ":" + secondsString;
	}
	return totalString;
};
RecordingDialog.prototype.updateCounter = function(time) {
	const RD = RecordingDialog;
	if (this.counter == null) return;
	const totalString = this.timeToString(time);
	GuiElements.update.text(this.counter, totalString);
	let width = GuiElements.measure.textWidth(this.counter);
	let counterX = this.x + this.width / 2 - width / 2;
	GuiElements.move.text(this.counter, counterX, this.counterY);

	const remainingMs = Math.max(0, RD.recordingLimit - time + 999);
	if (remainingMs < RD.remainingThreshold) {
		const remainingString = this.timeToString(remainingMs) + " remaining";
		GuiElements.update.text(this.remaingingText, remainingString);
		let remainingWidth = GuiElements.measure.textWidth(this.remaingingText);
		let remainingX = this.x + this.width / 2 - remainingWidth / 2;
		GuiElements.move.text(this.remaingingText, remainingX, this.remainingY);
	}
};

/**
 * Updates the counter of the current RecordingDialog.  Called by the RecordingManager
 * @param time
 */
RecordingDialog.updateCounter = function(time) {
	if (this.currentDialog != null) {
		this.currentDialog.updateCounter(time);
	}
};

RecordingDialog.recordingsChanged = function() {
	if (RecordingDialog.currentDialog != null) {
		RecordingDialog.currentDialog.reloadDialog();
	}
}

RecordingDialog.alertNotInProject = function() {
	let message = "Please open a project before recording";
	DialogManager.showAlertDialog("No project open", message, "OK");
};