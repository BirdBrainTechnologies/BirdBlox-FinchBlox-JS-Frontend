//@fix Write documentation.
function B_PlaySound(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"play sound"));
	var dS=new SoundDropSlot(this,"SDS_1");
	for(var i=0;i<Sounds.getSoundCount();i++){
		dS.addOption(Sounds.getSoundName(i),new SelectionData(Sounds.getSoundName(i)));
	}
	this.addPart(dS);
}
B_PlaySound.prototype = Object.create(CommandBlock.prototype);
B_PlaySound.prototype.constructor = B_PlaySound;
B_PlaySound.prototype.startAction=function(){
	var soundData=this.slots[0].getData();
	if(soundData==null){
		return new ExecutionStatusDone();
	}
	var soundName=soundData.getValue();
	if(Sounds.checkNameIsValid(soundName)){
		var mem=this.runMem;
		mem.request = "sound/play/"+soundName;
		mem.requestStatus=function(){};
		HtmlServer.sendRequest(mem.request,mem.requestStatus);
		return new ExecutionStatusRunning(); //Still running
	}
	return new ExecutionStatusDone();
};
/* Wait for the request to finish. */
B_PlaySound.prototype.updateAction=function(){
	var mem=this.runMem;
	var status=mem.requestStatus;
	if(status.finished==true){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};

function B_PlaySoundUntilDone(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"play sound until done"));
	var dS=new SoundDropSlot(this,"SDS_1");
	for(var i=0;i<Sounds.getSoundCount();i++){
		dS.addOption(Sounds.getSoundName(i),new SelectionData(Sounds.getSoundName(i)));
	}
	this.addPart(dS);
}
B_PlaySoundUntilDone.prototype = Object.create(CommandBlock.prototype);
B_PlaySoundUntilDone.prototype.constructor = B_PlaySoundUntilDone;
B_PlaySoundUntilDone.prototype.startAction=function(){
	var soundData=this.slots[0].getData();
	if(soundData==null){
		return new ExecutionStatusDone();
	}
	var soundName=soundData.getValue();
	var soundIndex=Sounds.indexFromName(soundName);
	if(soundIndex>=0){
		var mem=this.runMem;
		mem.soundDuration=Sounds.getSoundDuration(soundIndex);
        mem.timerStarted=false;
		mem.request = "sound/play/"+soundName;
		mem.cancel=false;
		mem.requestStatus=function(){};
		HtmlServer.sendRequest(mem.request,mem.requestStatus);
		return new ExecutionStatusRunning(); //Still running
	}
	return new ExecutionStatusDone();
};
/* Wait for the request to finish. */
B_PlaySoundUntilDone.prototype.updateAction=function(){
	var mem=this.runMem;
	if(mem.cancel){
		return new ExecutionStatusDone();
	}
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
	if(new Date().getTime() >= (mem.startTime+mem.soundDuration)){
        return new ExecutionStatusDone(); //Done running
	}
	else{
        return new ExecutionStatusRunning(); //Still running
	}
};
B_PlaySoundUntilDone.prototype.stopAllSounds=function(){
	if(this.runMem!=null) {
		this.runMem.cancel = true;
	}
};


function B_StopAllSounds(x,y){
	CommandBlock.call(this,x,y,"sound");
	this.addPart(new LabelText(this,"stop all sounds"));
}
B_StopAllSounds.prototype = Object.create(CommandBlock.prototype);
B_StopAllSounds.prototype.constructor = B_StopAllSounds;
B_StopAllSounds.prototype.startAction=function(){
	var mem=this.runMem;
	mem.request = "sound/stop";
	mem.requestStatus=function(){};
	HtmlServer.sendRequest(mem.request,mem.requestStatus);
	return new ExecutionStatusRunning(); //Still running
};
B_StopAllSounds.prototype.updateAction=function(){
	return !this.runMem.requestStatus.finished;
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
	mem.request = "sound/note/"+note+"/"+mem.soundDuration;
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
	this.addPart(new NumSlot(this,"NumS_tempo",60,true)); //Positive
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
