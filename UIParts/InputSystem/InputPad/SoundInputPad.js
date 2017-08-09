/**
 * An InputSystem used for selecting a Sound from a list.  Provides buttons to preview sounds before selecting them.
 * @param {number} x1
 * @param {number} x2
 * @param {number} y1
 * @param {number} y2
 * @param {boolean} isRecording - Whether recordings rather than effects should be selected from
 * @constructor
 */
function SoundInputPad(x1, x2, y1, y2, isRecording) {
	InputSystem.call(this);
	const coords = this.coords = {};
	coords.x1 = x1;
	coords.x2 = x2;
	coords.y1 = y1;
	coords.y2 = y2;
	this.isRecording = isRecording;
}
SoundInputPad.prototype = Object.create(InputSystem.prototype);
SoundInputPad.prototype.constructor = InputSystem;

SoundInputPad.setConstants = function() {
	const SIP = SoundInputPad;
	SIP.margin = InputPad.margin;
	SIP.rowHeight = SmoothMenuBnList.bnHeight;
	SIP.width = 300;
	SIP.playBnWidth = RowDialog.smallBnWidth;
	SIP.mainBnWidth = SIP.width - SIP.playBnWidth - SIP.margin;
	SIP.iconH = RowDialog.iconH;
	SIP.background = Colors.black;
};

/**
 * @inheritDoc
 * @param {EditableSlotShape} slotShape
 * @param {function} updateFn
 * @param {function} finishFn
 * @param {Data} data
 */
SoundInputPad.prototype.show = function(slotShape, updateFn, finishFn, data) {
	InputSystem.prototype.show.call(this, slotShape, updateFn, finishFn, data);
	const SIP = SoundInputPad;

	// Make a group for everything
	this.group = GuiElements.create.group(0, 0);

	// Compute dimensions
	this.updateDim();

	// Create the BubbleOverlay for this pad
	const bubbleGroup = GuiElements.create.group(0, 0);
	const type = Overlay.types.inputPad;
	const layer = GuiElements.layers.inputPad;
	this.bubbleOverlay = new BubbleOverlay(type, SIP.background, SIP.margin, bubbleGroup, this, layer);
	const coords = this.coords;
	this.bubbleOverlay.display(coords.x1, coords.x2, coords.y1, coords.y2, this.width, this.height);

	// Get the coords of the pad
	const absX = this.bubbleOverlay.relToAbsX(0);
	const absY = this.bubbleOverlay.relToAbsY(0);

	// Generate content
	this.createRows();

	// Put it all in a scrollBox
	const scrollLayer = GuiElements.layers.frontScroll;
	this.smoothScrollBox = new SmoothScrollBox(this.group, scrollLayer, absX, absY, this.width, this.height, this.width,
		this.innerHeight, this.bubbleOverlay);
	this.smoothScrollBox.show();
};

/**
 * Computes the dimensions of the pad, incorporating the screen height and number of entries
 */
SoundInputPad.prototype.updateDim = function() {
	const SIP = SoundInputPad;
	const maxHeight = GuiElements.height - SIP.margin * 2;
	// The number of recordings is retrieved from a cache
	const soundCount = Sound.getSoundList(this.isRecording).length;
	let desiredHeight = (SIP.rowHeight + SIP.margin) * soundCount - SIP.margin;
	if (this.isRecording) {
		desiredHeight += SIP.margin + SIP.rowHeight;
	}
	desiredHeight = Math.max(0, desiredHeight);
	this.height = Math.min(desiredHeight, maxHeight);
	this.innerHeight = desiredHeight;
	this.width = SIP.width;
};

/**
 * Creates the content of the SoundInputPad
 */
SoundInputPad.prototype.createRows = function() {
	const SIP = SoundInputPad;
	let y = 0;
	Sound.getSoundList(this.isRecording).forEach(function(sound) {
		this.createRow(sound, y);
		y += SIP.margin + SIP.rowHeight;
	}.bind(this));
	if (this.isRecording) {
		this.createRecordBn(0, y, SIP.width);
	}
};

/**
 * Creates the row for the provided Sound
 * @param {Sound} sound
 * @param {number} y
 */
SoundInputPad.prototype.createRow = function(sound, y) {
	const SIP = SoundInputPad;
	this.createMainBn(sound, 0, y, SIP.mainBnWidth, SIP.rowHeight, this.group);
	this.createPlayBn(sound, SIP.margin + SIP.mainBnWidth, y, SIP.playBnWidth);
};

/**
 * Creates a "Record sounds" option included at the end of recording SoundInputPads
 * @param {number} x
 * @param {number} y
 * @param {number} width
 */
SoundInputPad.prototype.createRecordBn = function(x, y, width) {
	const SIP = SoundInputPad;
	const button = new Button(x, y, width, SIP.rowHeight, this.group);
	button.addText("Record sounds");
	button.markAsOverlayPart(this.bubbleOverlay);
	button.setCallbackFunction(function() {
		RecordingDialog.showDialog();
		this.close();
	}.bind(this), true);
	button.makeScrollable();
};

/**
 * Creates the main button for the Sound, which selects the sound from the list
 * @param {Sound} sound
 * @param {number} x
 * @param {number} y
 * @param {number} width
 */
SoundInputPad.prototype.createMainBn = function(sound, x, y, width) {
	const SIP = SoundInputPad;
	const button = new Button(x, y, width, SIP.rowHeight, this.group);
	button.addText(sound.name);
	button.markAsOverlayPart(this.bubbleOverlay);
	button.setCallbackFunction(function() {
		this.currentData = new SelectionData(sound.name, sound.id);
		this.close();
	}.bind(this), true);
	button.makeScrollable();
};

/**
 * Creates a play/stop button for previewing a sound
 * @param {Sound} sound
 * @param {number} x
 * @param {number} y
 * @param {number} width
 */
SoundInputPad.prototype.createPlayBn = function(sound, x, y, width) {
	const SIP = SoundInputPad;
	const button = new Button(x, y, width, SIP.rowHeight, this.group);
	// Store the state of the Button
	const mem = {};
	mem.playing = false;
	button.addIcon(VectorPaths.play, SIP.iconH);
	button.markAsOverlayPart(this.bubbleOverlay);
	const stoppedPlaying = function() {
		mem.playing = false;
		button.addIcon(VectorPaths.play, SIP.iconH);
	};
	button.setCallbackFunction(function() {
		// When tapped, the state of the button determines is sounds should be stopped or played
		if (mem.playing) {
			stoppedPlaying();
			Sound.stopAllSounds();
		} else {
			mem.playing = true;
			button.addIcon(VectorPaths.square, SIP.iconH);
			Sound.playAndStopPrev(sound.id, this.isRecording, null, stoppedPlaying, stoppedPlaying);
		}
	}.bind(this), true);
	button.makeScrollable();
};

/**
 * Closes the SoundInputPad.
 * @inheritDoc
 */
SoundInputPad.prototype.close = function() {
	if (this.closed) return;
	InputSystem.prototype.close.call(this);
	this.smoothScrollBox.hide();
	this.bubbleOverlay.close();
	Sound.stopAllSounds();
};