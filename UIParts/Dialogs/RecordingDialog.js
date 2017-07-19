/**
 * Created by Tom on 6/16/2017.
 */
function RecordingDialog(listOfRecordings){
	let RecD = RecordingDialog;
	this.recordings=listOfRecordings.map(function(x){
		return x.id;
	});
	RowDialog.call(this, true, "Recordings", this.recordings.length, 0, RecordingDialog.extraBottomSpace);
	this.addCenteredButton("Done", this.closeDialog.bind(this));
	this.addHintText("Tap record to start");
	this.state = RecordingManager.recordingStates.stopped;
}
RecordingDialog.prototype = Object.create(RowDialog.prototype);
RecordingDialog.prototype.constructor = RecordingDialog;
RecordingDialog.setConstants = function(){
	let RecD = RecordingDialog;
	RecD.currentDialog = null;
	RecD.extraBottomSpace = RowDialog.bnHeight + RowDialog.bnMargin;
	RecD.coverRectOpacity = 0.8;
	RecD.coverRectColor = Colors.black;
	RecD.counterFont = "Arial";
	RecD.counterColor = Colors.white;
	RecD.counterFontSize = 60;
	RecD.counterFontWeight = "normal";
	RecD.counterBottomMargin = 50;
	RecD.recordColor = "#f00";
	RecD.recordTextSize = 25;
	RecD.recordTextCharH = 18;
	RecD.recordIconH = RecD.recordTextCharH;
	RecD.iconSidemargin = 10;

};
RecordingDialog.prototype.createRow = function(index, y, width, contentGroup){
	let RD = RowDialog;
	let largeBnWidth = width - RD.smallBnWidth * 2 - RD.bnMargin * 2;
	let recording = this.recordings[index];
	this.createMainBn(recording, largeBnWidth, 0, y, contentGroup);
	let renameBnX = largeBnWidth + RD.bnMargin;
	this.createRenameBn(recording, renameBnX, y, contentGroup);
	let deleteBnX = renameBnX + RD.smallBnWidth + RD.bnMargin;
	this.createDeleteBn(recording, deleteBnX, y, contentGroup);
};
RecordingDialog.prototype.createMainBn = function(recording, bnWidth, x, y, contentGroup){
	let button = RowDialog.createMainBn(bnWidth, x, y, contentGroup);
	let state = {};
	state.playing = false;
	let me = this;
	let showPlay = function(){
		button.addSideTextAndIcon(VectorPaths.play, RowDialog.iconH, recording);
	};
	let showStop = function(){
		button.addSideTextAndIcon(VectorPaths.square, RowDialog.iconH, recording);
	};
	button.setCallbackFunction(function(){
		if(state.playing){
			Sound.stopAllSounds();
		} else {
			Sound.playAndStopPrev(recording, true, function(){
				state.playing = true;
				showStop();
			}, null, function(){
				if(me.visible) {
					state.playing = false;
					showPlay();
				}
			});
		}
	}, true);
	showPlay();
};
RecordingDialog.prototype.createDeleteBn = function(file, x, y, contentGroup){
	let me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.trash, x, y, contentGroup, function(){
		RecordingManager.userDeleteFile(file, function(){
			me.reloadDialog();
		});
	});
};
RecordingDialog.prototype.createRenameBn = function(file, x, y, contentGroup){
	let me = this;
	RowDialog.createSmallBnWithIcon(VectorPaths.edit, x, y, contentGroup, function(){
		RecordingManager.userRenameFile(file, function(){
			me.reloadDialog();
		});
	});
};
RecordingDialog.prototype.show = function(){
	RowDialog.prototype.show.call(this);
	RecordingDialog.currentDialog = this;
	this.recordButton = this.createRecordButton();
	this.discardButton = this.createDiscardButton();
	this.saveButton = this.createSaveButton();
	this.pauseButton = this.createPauseButton();
	this.resumeRecordingBn = this.createResumeRecordingBn();
	this.goToState(this.state);
};
RecordingDialog.prototype.hide = function(){
	RowDialog.prototype.hide.call(this);
	this.setCounterVisibility(false);
};
RecordingDialog.prototype.closeDialog = function(){
	RowDialog.prototype.closeDialog.call(this);
	RecordingDialog.currentDialog = null;
	Sound.stopAllSounds();
};
RecordingDialog.prototype.createRecordButton = function(){
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let x = RD.bnMargin;
	let y = this.getExtraBottomY();
	let button = new Button(x, y, this.getContentWidth(), RD.bnHeight, this.group);
	button.addCenteredTextAndIcon(VectorPaths.circle, RecD.recordIconH, RecD.iconSidemargin,
		"Record", null, RecD.recordTextSize, null, RecD.recordTextCharH, RecD.recordColor);
	button.setCallbackFunction(function(){
		RecordingManager.startRecording();
	}, true);
	return button;
};
RecordingDialog.prototype.createOneThirdBn = function(buttonPosition, callbackFn){
	let RD = RowDialog;
	let width = (this.getContentWidth() - RD.bnMargin * 2) / 3;
	let x = (RD.bnMargin + width) * buttonPosition + RD.bnMargin;
	let y = this.getExtraBottomY();
	let button = new Button(x, y, width, RD.bnHeight, this.group);
	button.setCallbackFunction(callbackFn, true);
	return button;
};
RecordingDialog.prototype.createDiscardButton = function(){
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let button = this.createOneThirdBn(0, function(){
		RecordingManager.discardRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.trash, RD.iconH, RecD.iconSidemargin, "Discard");
	return button;
};
RecordingDialog.prototype.createSaveButton = function(){
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let button = this.createOneThirdBn(1, function(){
		this.goToState(RecordingManager.recordingStates.stopped);
		RecordingManager.stopRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.square, RD.iconH, RecD.iconSidemargin, "Save");
	return button;
};
RecordingDialog.prototype.createPauseButton = function(){
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let button = this.createOneThirdBn(2, function(){
		this.goToState(RecordingManager.recordingStates.paused);
		RecordingManager.pauseRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.pause, RD.iconH, RecD.iconSidemargin, "Pause");
	return button;
};
RecordingDialog.prototype.createResumeRecordingBn = function(){
	let RD = RowDialog;
	let RecD = RecordingDialog;
	let button = this.createOneThirdBn(2, function(){
		this.goToState(RecordingManager.recordingStates.recording);
		RecordingManager.resumeRecording();
	}.bind(this));
	button.addCenteredTextAndIcon(VectorPaths.circle, RD.iconH, RecD.iconSidemargin, "Record");
	return button;
};
RecordingDialog.prototype.drawCoverRect = function(){
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
RecordingDialog.prototype.drawTimeCounter = function(){
	let RD = RecordingDialog;
	let textE = GuiElements.draw.text(0, 0, "0:00", RD.counterFontSize, RD.counterColor, RD.counterFont, RD.counterFontWeight);
	GuiElements.layers.overlayOverlay.appendChild(textE);
	let width = GuiElements.measure.textWidth(textE);
	let height = GuiElements.measure.textHeight(textE);
	let x = this.x + this.width / 2 - width / 2;
	let y = this.getExtraBottomY() - RecordingDialog.counterBottomMargin;
	let span = this.getExtraBottomY() - this.getExtraTopY() - height;
	if(span < 2 * RecordingDialog.counterBottomMargin){
		y = this.getExtraBottomY() - span / 2;
	}
	y += this.y;
	this.counterY = y;
	GuiElements.move.text(textE, x, y);
	return textE;
};
RecordingDialog.showDialog = function(){
	RecordingManager.listRecordings(function(result){
		let recordDialog = new RecordingDialog(result);
		recordDialog.show();
	});
};
RecordingDialog.prototype.goToState = function(state){
	let RecD = RecordingDialog;
	this.state = state;
	let states = RecordingManager.recordingStates;
	if(state === states.stopped){
		this.recordButton.show();
		this.discardButton.hide();
		this.saveButton.hide();
		this.pauseButton.hide();
		this.resumeRecordingBn.hide();
		this.setCounterVisibility(false);
		this.getCenteredButton(0).enable();
	}
	else if(state === states.recording){
		this.recordButton.hide();
		this.discardButton.show();
		this.saveButton.show();
		this.pauseButton.show();
		this.resumeRecordingBn.hide();
		this.setCounterVisibility(true);
		this.getCenteredButton(0).disable();
	}
	else if(state === states.paused){
		this.recordButton.hide();
		this.discardButton.show();
		this.saveButton.show();
		this.pauseButton.hide();
		this.resumeRecordingBn.show();
		this.setCounterVisibility(true);
		this.getCenteredButton(0).disable();
	}
};
RecordingDialog.startedRecording = function(){
	if(RecordingDialog.currentDialog != null){
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.recording);
	}
};
RecordingDialog.stoppedRecording = function(){
	if(RecordingDialog.currentDialog != null){
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.stopped);
		RecordingDialog.currentDialog.reloadDialog();
	}
};
RecordingDialog.pausedRecording = function(){
	if(RecordingDialog.currentDialog != null){
		RecordingDialog.currentDialog.goToState(RecordingManager.recordingStates.paused);
	}
};
RecordingDialog.prototype.reloadDialog = function(){
	let thisScroll = this.getScroll();
	let me = this;
	RecordingManager.listRecordings(function(response){
		me.closeDialog();
		let dialog = new RecordingDialog(response);
		dialog.show();
		dialog.setScroll(thisScroll);
	});
};
RecordingDialog.prototype.setCounterVisibility = function(visible){
	if(visible){
		if (this.coverRect == null) {
			this.coverRect = this.drawCoverRect();
		}
		if (this.counter == null) {
			this.counter = this.drawTimeCounter();
		}
	} else {
		if (this.coverRect != null) {
			this.coverRect.remove();
			this.coverRect = null;
		}
		if (this.counter != null) {
			this.counter.remove();
			this.counter = null;
		}
	}
};
RecordingDialog.prototype.updateCounter = function(time){
	if(this.counter == null) return;
	let totalSeconds = Math.floor(time / 1000);
	let seconds = totalSeconds % 60;
	let totalMinutes = Math.floor(totalSeconds / 60);
	let minutes = totalMinutes % 60;
	let hours = Math.floor(totalMinutes / 60);
	let secondsString = seconds + "";
	if(secondsString.length < 2){
		secondsString = "0" + secondsString;
	}
	let minutesString = minutes + "";
	let totalString = minutesString + ":" + secondsString;
	if(hours > 0) {
		if(minutesString.length < 2) {
			minutesString = "0" + minutesString;
		}
		totalString = hours + ":" + minutesString + ":" + secondsString;
	}
	GuiElements.update.text(this.counter, totalString);
	let width = GuiElements.measure.textWidth(this.counter);
	let counterX = this.x + this.width / 2 - width / 2;
	GuiElements.move.text(this.counter, counterX, this.counterY);
};
RecordingDialog.updateCounter = function(time){
	if(this.currentDialog != null){
		this.currentDialog.updateCounter(time);
	}
};