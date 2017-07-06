/**
 * Created by Tom on 7/6/2017.
 */
function SoundInputPad(x1, x2, y1, y2, isRecording){
	InputSystem.call(this);
	this.widgets = [];
	const coords = this.coords = {};
	coords.x1 = x1;
	coords.x2 = x2;
	coords.y1 = y1;
	coords.y2 = y2;
	this.isRecording = isRecording;
}
SoundInputPad.prototype = Object.create(InputSystem.prototype);
SoundInputPad.prototype.constructor = InputSystem;
SoundInputPad.setConstants = function(){
	const SIP = SoundInputPad;
	SIP.margin = NewInputPad.margin;
	SIP.rowHeight = SmoothMenuBnList.bnHeight;
	SIP.width = 280;
	SIP.playBnWidth = RowDialog.smallBnWidth;
	SIP.mainBnWidth = SIP.width - SIP.playBnWidth - SIP.margin;
	SIP.iconH = RowDialog.iconH;
	SIP.background = Colors.black;
};
SoundInputPad.prototype.show = function(slotShape, updateFn, finishFn, data) {
	InputSystem.prototype.show.call(this, slotShape, updateFn, finishFn, data);
	const SIP = SoundInputPad;
	this.group = GuiElements.create.group(0, 0);
	this.updateDim();
	const bubbleGroup = GuiElements.create.group(0, 0);
	const type = Overlay.types.inputPad;
	const layer = GuiElements.layers.inputPad;
	this.bubbleOverlay = new BubbleOverlay(type, SIP.background, SIP.margin, bubbleGroup, this, SIP.margin, layer);
	const coords = this.coords;
	this.bubbleOverlay.display(coords.x1, coords.x2, coords.y1, coords.y2, this.width, this.height);
	const absX = this.bubbleOverlay.relToAbsX(0);
	const absY = this.bubbleOverlay.relToAbsY(0);
	this.createRows();
	const scrollLayer = GuiElements.layers.frontScroll;
	this.smoothScrollBox = new SmoothScrollBox(this.group, scrollLayer, absX, absY, this.width, this.height, this.width, this.innerHeight, this.bubbleOverlay);
	this.smoothScrollBox.show();
};
SoundInputPad.prototype.updateDim = function(){
	const SIP = SoundInputPad;
	const maxHeight = GuiElements.height - SIP.margin * 2;
	const soundCount = Sound.getSoundList(this.isRecording).length;
	let desiredHeight = (SIP.rowHeight + SIP.margin) * soundCount - SIP.margin;
	desiredHeight = Math.max(0, desiredHeight);
	this.height = Math.min(desiredHeight, maxHeight);
	this.innerHeight = desiredHeight;
	this.width = SIP.width;
};
SoundInputPad.prototype.createRows = function(){
	const SIP = SoundInputPad;
	let y = 0;
	Sound.getSoundList(this.isRecording).forEach(function(sound){
		this.createRow(sound, y);
		y += SIP.margin + SIP.rowHeight;
	}.bind(this));
};
SoundInputPad.prototype.createRow = function(sound, y){
	const SIP = SoundInputPad;
	this.createMainBn(sound, 0, y, SIP.mainBnWidth);
	this.createPlayBn(sound, SIP.margin + SIP.mainBnWidth, y, SIP.playBnWidth);
};
SoundInputPad.prototype.createMainBn = function(sound, x, y, width) {
	const SIP = SoundInputPad;
	const button = new Button(x, y, width, SIP.rowHeight, this.group);
	button.addText(sound.name);
	button.markAsOverlayPart(this.bubbleOverlay);
	button.setCallbackFunction(function(){
		this.currentData = new SelectionData(sound.name, sound.id);
		this.close();
	}.bind(this), true);
	button.makeScrollable();
};
SoundInputPad.prototype.createPlayBn = function(sound, x, y, width) {
	const SIP = SoundInputPad;
	const button = new Button(x, y, width, SIP.rowHeight, this.group);
	const mem = {};
	mem.playing = false;
	button.addIcon(VectorPaths.play, SIP.iconH);
	button.markAsOverlayPart(this.bubbleOverlay);
	const stoppedPlaying = function(){
		mem.playing = false;
		button.addIcon(VectorPaths.play, SIP.iconH);
	};
	button.setCallbackFunction(function(){
		if(mem.playing) {
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
SoundInputPad.prototype.close = function(){
	if(this.closed) return;
	InputSystem.prototype.close.call(this);
	this.smoothScrollBox.hide();
	this.bubbleOverlay.close();
	Sound.stopAllSounds();
};