/* Implementations of sound Blocks */



/**
 * Template used to make 4 sound playing Blocks
 * @param {number} x
 * @param {number} y
 * @param {string} label - The text to display on the Block
 * @param {boolean} isRecording - Whether the Block should display recordings or sounds in the SoundDropSlot
 * @param {boolean} waitUntilDone - Whether the Block should wait until the sound is done playing to advance
 * @constructor
 */
function B_PlaySoundOrRecording(x, y, label, isRecording, waitUntilDone) {
	CommandBlock.call(this, x, y, "sound");
	this.isRecording = isRecording;
	this.waitUntilDone = waitUntilDone;
	let dS = new SoundDropSlot(this, "SDS_1", isRecording);
	this.addPart(dS);
	this.parseTranslation(label);
}
B_PlaySoundOrRecording.prototype = Object.create(CommandBlock.prototype);
B_PlaySoundOrRecording.prototype.constructor = B_PlaySoundOrRecording;
/* Makes request using Sound class */
B_PlaySoundOrRecording.prototype.startAction = function() {
	let soundData = this.slots[0].getData();
	if (soundData.isEmpty()) {
		return new ExecutionStatusDone();
	}
	let soundId = soundData.getValue();
	let status = {};
	this.runMem.playStatus = status;
	status.donePlaying = false;
	status.requestSent = false;
	Sound.play(soundId, this.isRecording, status);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for the request to finish. */
B_PlaySoundOrRecording.prototype.updateAction = function() {
	let mem = this.runMem;
	let status = mem.playStatus;
	let done = (status.requestSent && !this.waitUntilDone) || (status.donePlaying && this.waitUntilDone);
	if (done) {
		if (status.error) {
			this.displayError("Sound not found");
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone(); // Done running
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};



function B_PlaySound(x, y) {
	B_PlaySoundOrRecording.call(this, x, y, Language.getStr("block_play_sound"), false, false);
}
B_PlaySound.prototype = Object.create(B_PlaySoundOrRecording.prototype);
B_PlaySound.prototype.constructor = B_PlaySound;



function B_PlaySoundUntilDone(x, y) {
	B_PlaySoundOrRecording.call(this, x, y, Language.getStr("block_play_sound_until_done"), false, true);
}
B_PlaySoundUntilDone.prototype = Object.create(B_PlaySoundOrRecording.prototype);
B_PlaySoundUntilDone.prototype.constructor = B_PlaySoundUntilDone;



function B_PlayRecording(x, y) {
	B_PlaySoundOrRecording.call(this, x, y, Language.getStr("block_play_recording"), true, false);
}
B_PlayRecording.prototype = Object.create(B_PlaySoundOrRecording.prototype);
B_PlayRecording.prototype.constructor = B_PlayRecording;



function B_PlayRecordingUntilDone(x, y) {
	B_PlaySoundOrRecording.call(this, x, y, Language.getStr("block_play_recording_until_done"), true, true);
}
B_PlayRecordingUntilDone.prototype = Object.create(B_PlaySoundOrRecording.prototype);
B_PlayRecordingUntilDone.prototype.constructor = B_PlayRecordingUntilDone;



function B_StopAllSounds(x, y) {
	CommandBlock.call(this, x, y, "sound");
	this.addPart(new LabelText(this, Language.getStr("block_stop_all_sounds")));
}
B_StopAllSounds.prototype = Object.create(CommandBlock.prototype);
B_StopAllSounds.prototype.constructor = B_StopAllSounds;
/* Send request */
B_StopAllSounds.prototype.startAction = function() {
	const mem = this.runMem;
	mem.requestStatus = {};
	Sound.stopAllSounds(mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait for request to be sent */
B_StopAllSounds.prototype.updateAction = function() {
	if (this.runMem.requestStatus.finished) {
		return new ExecutionStatusDone(); // Done running
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};



function B_RestForBeats(x, y) {
	CommandBlock.call(this, x, y, "sound");
	this.addPart(new NumSlot(this, "NumS_dur", 0.2, true)); // Positive
	this.parseTranslation(Language.getStr("block_rest_for"));
}
B_RestForBeats.prototype = Object.create(CommandBlock.prototype);
B_RestForBeats.prototype.constructor = B_RestForBeats;
/* Store the current time */
B_RestForBeats.prototype.startAction = function() {
	const mem = this.runMem;
	mem.startTime = new Date().getTime();
	const beats = this.slots[0].getData().getValueWithC(true); // Positive
	mem.delayTime = CodeManager.beatsToMs(beats);
	return new ExecutionStatusRunning(); // Still running
};
/* Wait until the time is up */
B_RestForBeats.prototype.updateAction = function() {
	const mem = this.runMem;
	if (new Date().getTime() >= mem.startTime + mem.delayTime) {
		return new ExecutionStatusDone(); // Done running
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};



function B_PlayNoteForBeats(x, y) {
	CommandBlock.call(this, x, y, "sound");
	this.addPart(new NumSlot(this, "NumS_note", 60, true, true)); // Positive integer
	this.addPart(new NumSlot(this, "NumS_dur", 1, true)); // Positive
	this.parseTranslation(Language.getStr("block_Play_Note"));
}
B_PlayNoteForBeats.prototype = Object.create(CommandBlock.prototype);
B_PlayNoteForBeats.prototype.constructor = B_PlayNoteForBeats;
/* Send request */
B_PlayNoteForBeats.prototype.startAction = function() {
	const mem = this.runMem;
	const note = this.slots[0].getData().getValueWithC(true, true);
	const beats = this.slots[1].getData().getValueWithC(true); // Positive
	mem.soundDuration = CodeManager.beatsToMs(beats);
	mem.request = "sound/note?note=" + note + "&duration=" + mem.soundDuration;
	mem.timerStarted = false;
	mem.requestStatus = function() {};
	HtmlServer.sendRequest(mem.request, mem.requestStatus);
	return new ExecutionStatusRunning(); // Still running
};
/* When the request is sent, start a timer then wait for the timer to expire */
B_PlayNoteForBeats.prototype.updateAction = function() {
	const mem = this.runMem;
	if (!mem.timerStarted) {
		const status = mem.requestStatus;
		if (status.finished === true) {
			mem.startTime = new Date().getTime();
			mem.timerStarted = true;
		} else {
			return new ExecutionStatusRunning(); // Still running
		}
	}
	if (new Date().getTime() >= mem.startTime + mem.soundDuration) {
		return new ExecutionStatusDone(); // Done running
	} else {
		return new ExecutionStatusRunning(); // Still running
	}
};



function B_ChangeTempoBy(x, y) {
	CommandBlock.call(this, x, y, "sound");
	this.addPart(new NumSlot(this, "NumS_amt", 20));
	this.parseTranslation(Language.getStr("block_change_tempo_by"));
}
B_ChangeTempoBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeTempoBy.prototype.constructor = B_ChangeTempoBy;
/* Changes the tempo stored in CodeManager */
B_ChangeTempoBy.prototype.startAction = function() {
	const slotData = this.slots[0].getData();
	if (slotData.isValid) {
		const newTempo = CodeManager.sound.tempo + slotData.getValue();
		CodeManager.setSoundTempo(newTempo);
	}
	return new ExecutionStatusDone();
};



function B_SetTempoTo(x, y) {
	CommandBlock.call(this, x, y, "sound");
	const nS = new NumSlot(this, "NumS_tempo", 60, true); // Positive
	nS.addLimits(20, 500, null);
	this.addPart(nS);
	this.parseTranslation(Language.getStr("block_set_tempo_to"));
}
B_SetTempoTo.prototype = Object.create(CommandBlock.prototype);
B_SetTempoTo.prototype.constructor = B_SetTempoTo;
/* Sets the tempo stored in CodeManager */
B_SetTempoTo.prototype.startAction = function() {
	const slotData = this.slots[0].getData();
	if (slotData.isValid) {
		const newTempo = slotData.getValue();
		CodeManager.setSoundTempo(newTempo);
	}
	return new ExecutionStatusDone();
};



function B_Tempo(x, y) {
	ReporterBlock.call(this, x, y, "sound");
	this.addPart(new LabelText(this, Language.getStr("block_tempo")));
}
B_Tempo.prototype = Object.create(ReporterBlock.prototype);
B_Tempo.prototype.constructor = B_Tempo;
/* Retrieve the tempo */
B_Tempo.prototype.startAction = function() {
	return new ExecutionStatusResult(new NumData(CodeManager.sound.tempo));
};
