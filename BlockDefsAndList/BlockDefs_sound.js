function B_PlaySoundOrRecording(x, y, label, isRecording, waitUntilDone) {
	CommandBlock.call(this,x,y,"sound");
	this.isRecording = isRecording;
	this.waitUntilDone = waitUntilDone;
	this.addPart(new LabelText(this, label));
	let dS=new SoundDropSlot(this,"SDS_1", isRecording);
	this.addPart(dS);
}
B_PlaySoundOrRecording.prototype = Object.create(CommandBlock.prototype);
B_PlaySoundOrRecording.prototype.constructor = B_PlaySoundOrRecording;
B_PlaySoundOrRecording.prototype.startAction=function(){
	let soundData=this.slots[0].getData();
	if(soundData == null){
		return new ExecutionStatusDone();
	}
	let soundId=soundData.getValue();
	let status = {};
	this.runMem.playStatus = status;
	status.donePlaying = false;
	status.requestSent = false;
	Sound.play(soundId, this.isRecording, status);
	return new ExecutionStatusRunning(); //Still running
};
/* Wait for the request to finish. */
B_PlaySoundOrRecording.prototype.updateAction=function(){
	let mem=this.runMem;
	let status=mem.playStatus;
	let done = (status.requestSent && !this.waitUntilDone) || (status.donePlaying && this.waitUntilDone);
	if(done){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};


function B_PlaySound(x,y){
	B_PlaySoundOrRecording.call(this,x,y,"play sound", false, false);
}
B_PlaySound.prototype = Object.create(B_PlaySoundOrRecording.prototype);
B_PlaySound.prototype.constructor = B_PlaySound;

function B_PlaySoundUntilDone(x,y){
	B_PlaySoundOrRecording.call(this,x,y,"play sound until done", false, true);
}
B_PlaySoundUntilDone.prototype = Object.create(B_PlaySoundOrRecording.prototype);
B_PlaySoundUntilDone.prototype.constructor = B_PlaySoundUntilDone;

function B_PlayRecording(x,y){
	B_PlaySoundOrRecording.call(this,x,y,"play recording", true, false);
}
B_PlayRecording.prototype = Object.create(B_PlaySoundOrRecording.prototype);
B_PlayRecording.prototype.constructor = B_PlayRecording;

function B_PlayRecordingUntilDone(x,y){
	B_PlaySoundOrRecording.call(this,x,y,"play recording until done", true, true);
}
B_PlayRecordingUntilDone.prototype = Object.create(B_PlaySoundOrRecording.prototype);
B_PlayRecordingUntilDone.prototype.constructor = B_PlayRecordingUntilDone;



function B_StopAllSounds(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"stop all sounds"));
}
B_StopAllSounds.prototype = Object.create(CommandBlock.prototype);
B_StopAllSounds.prototype.constructor = B_StopAllSounds;
B_StopAllSounds.prototype.startAction=function(){
	var mem=this.runMem;
	mem.requestStatus = {};
	Sound.stopAllSounds(mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
B_StopAllSounds.prototype.updateAction=function(){
	if(this.runMem.requestStatus.finished){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_RestForBeats(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"rest for"));
	this.addPart(new NumSlot(this,"NumS_dur",0.2,true)); //Positive
	this.addPart(new LabelText(this,"beats"));
}
B_RestForBeats.prototype = Object.create(CommandBlock.prototype);
B_RestForBeats.prototype.constructor = B_RestForBeats;
B_RestForBeats.prototype.startAction=function(){
	var mem=this.runMem;
	mem.startTime=new Date().getTime();
	var beats=this.slots[0].getData().getValueWithC(true); //Positive
	mem.delayTime=CodeManager.beatsToMs(beats);
	return new ExecutionStatusRunning(); //Still running
};
B_RestForBeats.prototype.updateAction=function(){
	var mem=this.runMem;
	if(new Date().getTime()>=mem.startTime+mem.delayTime){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};


function B_PlayNoteForBeats(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"play note"));
	this.addPart(new NumSlot(this,"NumS_note",60,true,true)); //Positive integer
	this.addPart(new LabelText(this,"for"));
	this.addPart(new NumSlot(this,"NumS_dur",1,true)); //Positive
	this.addPart(new LabelText(this,"beats"));
}
B_PlayNoteForBeats.prototype = Object.create(CommandBlock.prototype);
B_PlayNoteForBeats.prototype.constructor = B_PlayNoteForBeats;
B_PlayNoteForBeats.prototype.startAction=function(){
	var mem=this.runMem;
	var note=this.slots[0].getData().getValueWithC(true,true);
	var beats=this.slots[1].getData().getValueWithC(true); //Positive
	mem.soundDuration=CodeManager.beatsToMs(beats);
	mem.request = "sound/note?note="+note+"&duration="+mem.soundDuration;
	mem.timerStarted=false;
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
B_PlayNoteForBeats.prototype.updateAction=function(){
	var mem=this.runMem;
	if(!mem.timerStarted){
		var status=mem.requestStatus;
		if(status.finished==true){
			mem.startTime=new Date().getTime();
			mem.timerStarted=true;
		}
		else{
			return new ExecutionStatusRunning(); //Still running
		}
	}
	if(new Date().getTime()>=mem.startTime+mem.soundDuration){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};

function B_ChangeTempoBy(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"change tempo by"));
	this.addPart(new NumSlot(this,"NumS_amt",20));
}
B_ChangeTempoBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeTempoBy.prototype.constructor = B_ChangeTempoBy;
B_ChangeTempoBy.prototype.startAction=function(){
	var slotData=this.slots[0].getData();
	if(slotData.isValid) {
		var newTempo = CodeManager.sound.tempo +slotData.getValue();
		CodeManager.setSoundTempo(newTempo);
	}
	return new ExecutionStatusDone();
};

function B_SetTempoTo(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"set tempo to"));
	const nS = new NumSlot(this,"NumS_tempo",60,true); //Positive
	nS.addLimits(20, 500, null);
	this.addPart(nS);
	this.addPart(new LabelText(this,"bpm"));
}
B_SetTempoTo.prototype = Object.create(CommandBlock.prototype);
B_SetTempoTo.prototype.constructor = B_SetTempoTo;
B_SetTempoTo.prototype.startAction=function(){
	var slotData=this.slots[0].getData();
	if(slotData.isValid) {
		var newTempo = slotData.getValue();
		CodeManager.setSoundTempo(newTempo);
	}
	return new ExecutionStatusDone();
};

function B_Tempo(x,y){
	ReporterBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"tempo"));
}
B_Tempo.prototype = Object.create(ReporterBlock.prototype);
B_Tempo.prototype.constructor = B_Tempo;
B_Tempo.prototype.startAction=function(){
	return new ExecutionStatusResult(new NumData(CodeManager.sound.tempo));
};
