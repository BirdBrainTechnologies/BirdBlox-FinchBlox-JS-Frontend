/* This file contains the implementations for Blocks in the control category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */



function B_WhenFlagTapped(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when"));
	this.addPart(new BlockIcon(this,VectorPaths.flag,TitleBar.flagFill,"flag",15));
	this.addPart(new LabelText(this,"tapped"));
}
B_WhenFlagTapped.prototype = Object.create(HatBlock.prototype);
B_WhenFlagTapped.prototype.constructor = B_WhenFlagTapped;
/* Triggers stack to start running. */
B_WhenFlagTapped.prototype.eventFlagClicked=function(){
	this.stack.startRun();
};
/* Does nothing. */
B_WhenFlagTapped.prototype.startAction=function(){
	return new ExecutionStatusDone(); //Done running. This Block does nothing except respond to an event.
};



function B_WhenIReceive(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when I receive"));
	this.addPart(new BroadcastDropSlot(this,"BDS_msg",true));
}
B_WhenIReceive.prototype = Object.create(HatBlock.prototype);
B_WhenIReceive.prototype.constructor = B_WhenIReceive;
B_WhenIReceive.prototype.eventBroadcast=function(message){
	var myMessage=this.slots[0].getData();
	if(myMessage!=null){
		var myMessageStr=myMessage.getValue();
		if(myMessageStr=="any_message"||myMessageStr==message){
			this.stack.stop();
			this.stack.startRun(null,message);
		}
	}
};
/* Does nothing. */
B_WhenIReceive.prototype.startAction=function(){
	return new ExecutionStatusDone(); //Done running. This Block does nothing except respond to an event.
};



function B_Wait(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"wait"));
	this.addPart(new NumSlot(this,"NumS_dur",1,true)); //Must be positive.
	this.addPart(new LabelText(this,"secs"));
}
B_Wait.prototype = Object.create(CommandBlock.prototype);
B_Wait.prototype.constructor = B_Wait;
/* Records current time. */
B_Wait.prototype.startAction=function(){
	var mem=this.runMem;
	mem.startTime=new Date().getTime();
	mem.delayTime=this.slots[0].getData().getValueWithC(true)*1000;
	return new ExecutionStatusRunning(); //Still running
};
/* Waits until current time exceeds stored time plus delay. */
B_Wait.prototype.updateAction=function(){
	var mem=this.runMem;
	if(new Date().getTime()>=mem.startTime+mem.delayTime){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_WaitUntil(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"wait until"));
	this.addPart(new BoolSlot(this,"BoolS_cond"));
}
B_WaitUntil.prototype = Object.create(CommandBlock.prototype);
B_WaitUntil.prototype.constructor = B_WaitUntil;
/* Checks condition. If true, stops running; if false, resets Block to check again. */
B_WaitUntil.prototype.startAction=function(){
	var stopWaiting=this.slots[0].getData().getValue();
	if(stopWaiting){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		this.running=0; //startAction will be run next time, giving Slots ability to recalculate.
		this.clearMem(); //runMem and previous values of Slots will be removed.
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_Forever(x,y){
	LoopBlock.call(this,x,y,"control",false); //Bottom is not open.
	this.addPart(new LabelText(this,"repeat forever"));
}
B_Forever.prototype = Object.create(LoopBlock.prototype);
B_Forever.prototype.constructor = B_Forever;
/* Begins executing contents. */
B_Forever.prototype.startAction=function(){
	this.blockSlot1.startRun();
	return new ExecutionStatusRunning(); //Still running
};
/* Continues executing contents. If contents are done, runs them again. */
B_Forever.prototype.updateAction=function(){
	let blockSlotStatus = this.blockSlot1.updateRun();
	if(!blockSlotStatus.isRunning()) {
		if(blockSlotStatus.hasError()){
			return blockSlotStatus;
		} else{
			this.blockSlot1.startRun();
		}
	}
	return new ExecutionStatusRunning(); //Still running. Never stops.
};



function B_Repeat(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"repeat"));
	this.addPart(new NumSlot(this,"NumS_count",10,true,true)); //Positive integer.
}
B_Repeat.prototype = Object.create(LoopBlock.prototype);
B_Repeat.prototype.constructor = B_Repeat;
/* Prepares counter and begins executing contents. */
B_Repeat.prototype.startAction=function(){
	var mem=this.runMem;
	mem.timesD=this.slots[0].getData();
	mem.times=mem.timesD.getValueWithC(true,true);
	mem.count=0;
	if(mem.times>0&&mem.timesD.isValid) {
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
	else{
		return new ExecutionStatusDone();
	}
};
/* Update contents. When they finish, increment counter and possibly run them again. */
B_Repeat.prototype.updateAction=function(){
	let blockSlotStatus = this.blockSlot1.updateRun();
	if(!blockSlotStatus.isRunning()){
		if(blockSlotStatus.hasError()){
			return blockSlotStatus;
		} else {
			var mem = this.runMem;
			mem.count++;
			if (mem.count >= mem.times) {
				return new ExecutionStatusDone(); //Done running
			}
			else {
				this.blockSlot1.startRun();
			}
		}
	}
	return new ExecutionStatusRunning(); //Still running
};



function B_RepeatUntil(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"repeat until"));
	this.addPart(new BoolSlot(this,"BoolS_cond"));
}
B_RepeatUntil.prototype = Object.create(LoopBlock.prototype);
B_RepeatUntil.prototype.constructor = B_RepeatUntil;
/* Checks condition and either stops running or executes contents. */
B_RepeatUntil.prototype.startAction=function(){
	var stopRepeating=this.slots[0].getData().getValue();
	if(stopRepeating){
		return new ExecutionStatusDone(); //Done running
	}
	else{
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
};
/* Updates contents until completed. Then resets Block to condition can be checked again. */
B_RepeatUntil.prototype.updateAction=function(){
	let blockSlotStatus = this.blockSlot1.updateRun();
	if(!blockSlotStatus.isRunning()){
		if(blockSlotStatus.hasError()){
			return blockSlotStatus;
		} else {
			this.running=0; //startAction will be run next time, giving Slots ability to recalculate.
			this.clearMem(); //runMem and previous values of Slots will be removed.
		}
	}
	return new ExecutionStatusRunning(); //Still running
};



function B_If(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"if"));
	this.addPart(new BoolSlot(this,"BoolS_cond"));
}
B_If.prototype = Object.create(LoopBlock.prototype);
B_If.prototype.constructor = B_If;
/* Either stops running or executes contents. */
B_If.prototype.startAction=function(){
	var check=this.slots[0].getData().getValue();
	if(check){
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
	else{
		return new ExecutionStatusDone(); //Done running
	}
};
/* Continues executing contents until completed. */
B_If.prototype.updateAction=function(){
	return this.blockSlot1.updateRun();
};



function B_IfElse(x,y){
	DoubleLoopBlock.call(this,x,y,"control","else");
	this.addPart(new LabelText(this,"if"));
	this.addPart(new BoolSlot(this,"BoolS_cond"));
}
B_IfElse.prototype = Object.create(DoubleLoopBlock.prototype);
B_IfElse.prototype.constructor = B_IfElse;
/* Starts executing one of two BlockSlots. */
B_IfElse.prototype.startAction=function(){
	this.runMem.check=this.slots[0].getData().getValue();
	if(this.runMem.check){
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
	else{
		this.blockSlot2.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
};
/* Continues executing one of two BlockSlots until completion. */
B_IfElse.prototype.updateAction=function(){
	if(this.runMem.check){
		return this.blockSlot1.updateRun();
	}
	else{
		return this.blockSlot2.updateRun();
	}
};




function B_Broadcast(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"broadcast"));
	this.addPart(new BroadcastDropSlot(this,"BDS_msg",false));
}
B_Broadcast.prototype = Object.create(CommandBlock.prototype);
B_Broadcast.prototype.constructor = B_Broadcast;
/* Broadcast the message if one has been selected. */
B_Broadcast.prototype.startAction=function(){
	var message=this.slots[0].getData();
	if(message!=null){
		CodeManager.message=new StringData(message.getValue());
		CodeManager.eventBroadcast(message.getValue());
	}
	return new ExecutionStatusRunning();
};
B_Broadcast.prototype.updateAction=function(){
	return new ExecutionStatusDone();
};

function B_BroadcastAndWait(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"broadcast"));
	this.addPart(new BroadcastDropSlot(this,"BDS_msg",false));
	this.addPart(new LabelText(this,"and wait"));
}
B_BroadcastAndWait.prototype = Object.create(CommandBlock.prototype);
B_BroadcastAndWait.prototype.constructor = B_BroadcastAndWait;
B_BroadcastAndWait.prototype.startAction=function(){
	var message=this.slots[0].getData();
	if(message!=null){
		this.runMem.message=message.getValue();
		CodeManager.message=new StringData(this.runMem.message);
		CodeManager.eventBroadcast(this.runMem.message);
	}
	return new ExecutionStatusRunning();
};
B_BroadcastAndWait.prototype.updateAction=function(){
	if(CodeManager.checkBroadcastRunning(this.runMem.message)){
		return new ExecutionStatusRunning();
	} else{
		return new ExecutionStatusDone();
	}
};

function B_Message(x,y){
	ReporterBlock.call(this,x,y,"control",Block.returnTypes.string);
	this.addPart(new LabelText(this,"message"));
}
B_Message.prototype = Object.create(ReporterBlock.prototype);
B_Message.prototype.constructor = B_Message;
B_Message.prototype.startAction=function(){
	return new ExecutionStatusResult(CodeManager.message);
};



function B_Stop(x,y){//No bottom slot
	CommandBlock.call(this,x,y,"control",true);
	this.addPart(new LabelText(this,"stop"));
	var dS=new DropSlot(this,"DS_act",Slot.snapTypes.none);
	dS.addOption("all",new SelectionData("all"));
	dS.addOption("this script",new SelectionData("this_script"));
	//dS.addOption("this block",new SelectionData("this_block"));
	dS.addOption("all but this script",new SelectionData("all_but_this_script"));
	//dS.addOption("other scripts in sprite",new SelectionData("other_scripts_in_sprite"));
	dS.setSelectionData("all",new SelectionData("all"));
	this.addPart(dS);
}
B_Stop.prototype = Object.create(CommandBlock.prototype);
B_Stop.prototype.constructor = B_Stop;
B_Stop.prototype.startAction=function(){
	var selection=this.slots[0].getData().getValue();
	if(selection=="all"){
		CodeManager.stop();
	}
	else if(selection=="this_script"){
		this.stack.stop();
	}
	else if(selection=="all_but_this_script"){
		TabManager.stopAllButStack(this.stack);
	}
	return new ExecutionStatusDone();
};




///// <Not implemented> /////
function B_WhenIAmTapped(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when I am"));
	var dS=new DropSlot(this,"DS_act",null,Slot.snapTypes.bool);
	dS.addOption("tapped",new SelectionData("tapped"));
	dS.addOption("pressed",new SelectionData("pressed"));
	dS.addOption("released",new SelectionData("released"));
	this.addPart(dS);
}
B_WhenIAmTapped.prototype = Object.create(HatBlock.prototype);
B_WhenIAmTapped.prototype.constructor = B_WhenIAmTapped;



