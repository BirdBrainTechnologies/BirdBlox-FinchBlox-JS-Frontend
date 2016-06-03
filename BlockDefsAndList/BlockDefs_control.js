function b_WhenFlagTapped(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when"));
	this.addPart(new BlockIcon(this,VectorPaths.flag,TitleBar.flagFill,"flag",15));
	this.addPart(new LabelText(this,"tapped"));
}
b_WhenFlagTapped.prototype = Object.create(HatBlock.prototype);
b_WhenFlagTapped.prototype.constructor = b_WhenFlagTapped;
b_WhenFlagTapped.prototype.eventFlagClicked=function(){
	this.stack.startRun();
}
b_WhenFlagTapped.prototype.startAction=function(){
	return this.nextBlock;
}



function b_Wait(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"wait"));
	this.addPart(new NumSlot(this,1,true));
	this.addPart(new LabelText(this,"secs"));
}
b_Wait.prototype = Object.create(CommandBlock.prototype);
b_Wait.prototype.constructor = b_Wait;
b_Wait.prototype.startAction=function(){
	var mem=this.runMem;
	mem.startTime=new Date().getTime();
	mem.delayTime=this.slots[0].getData().getValueWithC(true)*1000;
	if(!(mem.delayTime>0)){
		mem.delayTime=0;
	}
	return this;
}
b_Wait.prototype.updateAction=function(){
	var mem=this.runMem;
	if(new Date().getTime()-mem.delayTime>=mem.startTime){
		return this.nextBlock;
	}
	else{
		return this;
	}
}



function b_WaitUntil(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"wait until"));
	this.addPart(new BoolSlot(this));
}
b_WaitUntil.prototype = Object.create(CommandBlock.prototype);
b_WaitUntil.prototype.constructor = b_WaitUntil;
b_WaitUntil.prototype.startAction=function(){
	var stopWaiting=this.slots[0].getData().getValue();
	if(stopWaiting){
		return this.nextBlock;
	}
	else{
		this.running=0;
		this.clearMem();
		return this;
	}
}



function b_Forever(x,y){//Remove bottom slot
	LoopBlock.call(this,x,y,"control",false);
	this.addPart(new LabelText(this,"forever"));
}
b_Forever.prototype = Object.create(LoopBlock.prototype);
b_Forever.prototype.constructor = b_Forever;
b_Forever.prototype.startAction=function(){
	this.blockSlot1.startRun();
	return this;
}
b_Forever.prototype.updateAction=function(){
	if(!this.blockSlot1.updateRun()){
		this.blockSlot1.startRun();
	}
	return this;
}



function b_Repeat(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"repeat"));
	this.addPart(new NumSlot(this,10,true,true));
}
b_Repeat.prototype = Object.create(LoopBlock.prototype);
b_Repeat.prototype.constructor = b_Repeat;
b_Repeat.prototype.startAction=function(){
	var mem=this.runMem;
	mem.times=this.slots[0].getData().getValueWithC(true,true);
	mem.count=0;
	this.blockSlot1.startRun();
	return this;
}
b_Repeat.prototype.updateAction=function(){
	if(!this.blockSlot1.updateRun()){
		var mem=this.runMem;
		mem.count++;
		if(mem.count>=mem.times){
			return this.nextBlock;
		}
		else{
			this.blockSlot1.startRun();
		}
	}
	return this;
}



function b_RepeatUntil(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"repeat until"));
	this.addPart(new BoolSlot(this));
}
b_RepeatUntil.prototype = Object.create(LoopBlock.prototype);
b_RepeatUntil.prototype.constructor = b_RepeatUntil;
b_RepeatUntil.prototype.startAction=function(){
	var stopRepeating=this.slots[0].getData().getValue();
	if(stopRepeating){
		return this.nextBlock;
	}
	else{
		this.blockSlot1.startRun();
		return this;
	}
}
b_RepeatUntil.prototype.updateAction=function(){
	if(!this.blockSlot1.updateRun()){
		this.running=0;
	}
	return this;
}



function b_If(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"if"));
	this.addPart(new BoolSlot(this));
}
b_If.prototype = Object.create(LoopBlock.prototype);
b_If.prototype.constructor = b_If;
b_If.prototype.startAction=function(){
	var check=this.slots[0].getData().getValue();
	if(check){
		this.blockSlot1.startRun();
		return this;
	}
	else{
		return this.nextBlock;
	}
}
b_If.prototype.updateAction=function(){
	if(!this.blockSlot1.updateRun()){
		return this.nextBlock;
	}
	return this;
}



function b_IfElse(x,y){
	DoubleLoopBlock.call(this,x,y,"control","else");
	this.addPart(new LabelText(this,"if"));
	this.addPart(new BoolSlot(this));
}
b_IfElse.prototype = Object.create(DoubleLoopBlock.prototype);
b_IfElse.prototype.constructor = b_IfElse;
b_IfElse.prototype.startAction=function(){
	this.runMem.check=this.slots[0].getData().getValue();
	if(this.runMem.check){
		this.blockSlot1.startRun();
		return this;
	}
	else{
		this.blockSlot2.startRun();
		return this;
	}
}
b_IfElse.prototype.updateAction=function(){
	if(this.runMem.check){
		if(!this.blockSlot1.updateRun()){
			return this.nextBlock;
		}
	}
	else{
		if(!this.blockSlot2.updateRun()){
			return this.nextBlock;
		}
	}
	return this;
}
///////////
function b_WhenIAmTapped(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when I am"));
	var dS=new DropSlot(this,null,Slot.snapTypes.bool);
	dS.addOption("tapped",new SelectionData("tapped"));
	dS.addOption("pressed",new SelectionData("pressed"));
	dS.addOption("released",new SelectionData("released"));
	this.addPart(dS);
}
b_WhenIAmTapped.prototype = Object.create(HatBlock.prototype);
b_WhenIAmTapped.prototype.constructor = b_WhenIAmTapped;

function b_WhenIReceive(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when I receive"));
}
b_WhenIReceive.prototype = Object.create(HatBlock.prototype);
b_WhenIReceive.prototype.constructor = b_WhenIReceive;

function b_Broadcast(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"broadcast"));
}
b_Broadcast.prototype = Object.create(CommandBlock.prototype);
b_Broadcast.prototype.constructor = b_Broadcast;

function b_BroadcastAndWait(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"broadcast"));
	this.addPart(new LabelText(this,"and wait"));
}
b_BroadcastAndWait.prototype = Object.create(CommandBlock.prototype);
b_BroadcastAndWait.prototype.constructor = b_BroadcastAndWait;

function b_Message(x,y){
	ReporterBlock.call(this,x,y,"control",Block.returnTypes.string);
	this.addPart(new LabelText(this,"message"));
}
b_Message.prototype = Object.create(ReporterBlock.prototype);
b_Message.prototype.constructor = b_Message;









function b_StopAll(x,y){//No bottom slot
	CommandBlock.call(this,x,y,"control",false);
	this.addPart(new LabelText(this,"stop"));
}
b_StopAll.prototype = Object.create(CommandBlock.prototype);
b_StopAll.prototype.constructor = b_StopAll;

function b_StopAllBut(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"stop"));
}
b_StopAllBut.prototype = Object.create(CommandBlock.prototype);
b_StopAllBut.prototype.constructor = b_StopAllBut;