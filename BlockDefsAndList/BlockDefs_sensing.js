/* This file contains the implementations for Blocks in the sensing category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 * Many of these will use the this.stack.getSprite() method, which is not done yet.
 */

function B_Ask(x,y){
	CommandBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"ask"));
	this.addPart(new StringSlot(this,"StrS_msg","what's your name?"));
	this.addPart(new LabelText(this,"and wait"));
}
B_Ask.prototype = Object.create(CommandBlock.prototype);
B_Ask.prototype.constructor = B_Ask;
/* Show a dialog with the question unless another dialog is already visible or has been displayed recently. */
B_Ask.prototype.startAction=function(){
	var mem=this.runMem;
	mem.question=this.slots[0].getData().getValue(); //Form the question
	mem.questionDisplayed=false; //Has the dialog request been issued yet?
	if(HtmlServer.dialogVisible){ //If there is already a dialog, we will wait until it is closed.
		mem.waitingForDialog=true; //We are waiting.
	}
	else{
		mem.waitingForDialog=false; //We are not waiting for a dialog to disappear.
		//There is a delay between repeated dialogs to give the user time to stop the program.
		if(CodeManager.checkDialogDelay()) { //Check if we can show the dialog or should delay.
			this.showQuestion(); //Show the dialog.
		}
	}
	return new ExecutionStatusRunning();
};
/* Waits until the dialog has been displayed and completed. */
B_Ask.prototype.updateAction=function(){
	var mem=this.runMem;
	if(mem.waitingForDialog){ //If we are waiting for a dialog to close...
		if(!HtmlServer.dialogVisible){ //...And the dialog is closed...
			mem.waitingForDialog=false; //...Then we can stop waiting.
		}
		return new ExecutionStatusRunning(); //Still running.
	}
	else if(!mem.questionDisplayed){ //If the question has not yet been displayed...
		if(CodeManager.checkDialogDelay()) { //Check if we can show the dialog or should delay.
			if(HtmlServer.dialogVisible){ //Make sure there still isn't a dialog visible.
				mem.waitingForDialog=true;
			}
			else{
				this.showQuestion(); //Display the question.
			}
		}
		return new ExecutionStatusRunning(); //Still running.
	}
	else{
		if(mem.finished==true){ //Question has been answered.
			CodeManager.updateDialogDelay(); //Tell CodeManager to reset the dialog delay clock.
			return new ExecutionStatusDone(); //Done running
		}
		else{ //Waiting on answer from user.
			return new ExecutionStatusRunning(); //Still running
		}
	}
};
B_Ask.prototype.showQuestion=function(){
	var mem=this.runMem;
	mem.finished=false; //Will be changed once answered.
	var callbackFn=function(cancelled,response){
		if(cancelled){
			CodeManager.answer = new StringData("", true); //"" is the default answer.
		}
		else{
			CodeManager.answer = new StringData(response, true); //Store the user's anser in the CodeManager.
		}
		callbackFn.mem.finished=true; //Done waiting.
	};
	callbackFn.mem=mem;
	var callbackErr=function(){ //If an error occurs...
		CodeManager.answer = new StringData("", true); //"" is the default answer.
		callbackErr.mem.finished=true; //Done waiting.
	};
	callbackErr.mem=mem;
	HtmlServer.showDialog("Question",mem.question,"",callbackFn,callbackErr); //Make the request.
	mem.questionDisplayed=true; //Prevents displaying twice.
};




function B_Answer(x,y){
	ReporterBlock.call(this,x,y,"tablet",Block.returnTypes.string);
	this.addPart(new LabelText(this,"answer"));
}
B_Answer.prototype = Object.create(ReporterBlock.prototype);
/* Result is whatever is stored in CodeManager. */
B_Answer.prototype.constructor = B_Answer;
B_Answer.prototype.startAction=function(){
	return new ExecutionStatusResult(CodeManager.answer);
};

function B_ResetTimer(x,y){
	CommandBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"reset timer"));
}
B_ResetTimer.prototype = Object.create(CommandBlock.prototype);
B_ResetTimer.prototype.constructor = B_ResetTimer;
B_ResetTimer.prototype.startAction=function(){
	CodeManager.timerForSensingBlock=new Date().getTime();
	return new ExecutionStatusDone();
};

function B_Timer(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"timer"));
}
B_Timer.prototype = Object.create(ReporterBlock.prototype);
B_Timer.prototype.constructor = B_Timer;
B_Timer.prototype.startAction=function(){
	var now=new Date().getTime();
	var start=CodeManager.timerForSensingBlock;
	return new ExecutionStatusResult(new NumData(Math.round((now-start)/100)/10));
};
Block.setDisplaySuffix(B_Timer, "s");

function B_CurrentTime(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"current"));
	var dS=new DropSlot(this,"DS_interval",null,Slot.snapTypes.bool);
	dS.addOption(new SelectionData("year", "year"));
	dS.addOption(new SelectionData("month", "month"));
	dS.addOption(new SelectionData("date", "date"));
	dS.addOption(new SelectionData("day of the week", "day of the week"));
	dS.addOption(new SelectionData("hour", "hour"));
	dS.addOption(new SelectionData("minute", "minute"));
	dS.addOption(new SelectionData("second", "second"));
	dS.addOption(new SelectionData("time in milliseconds", "time in milliseconds"));
	dS.setSelectionData(new SelectionData("date", "date"));
	this.addPart(dS);
}
B_CurrentTime.prototype = Object.create(ReporterBlock.prototype);
B_CurrentTime.prototype.constructor = B_CurrentTime;
B_CurrentTime.prototype.startAction=function(){
	var unitD=this.slots[0].getData();
	if(unitD==null){
		return new ExecutionStatusResult(new NumData(0,false));
	}
	var unit=unitD.getValue();
	if(unit=="year"){
		return new ExecutionStatusResult(new NumData(new Date().getFullYear()));
	}
	else if(unit=="month"){
		return new ExecutionStatusResult(new NumData(new Date().getMonth()+1));
	}
	else if(unit=="date"){
		return new ExecutionStatusResult(new NumData(new Date().getDate()));
	}
	else if(unit=="day of the week"){
		return new ExecutionStatusResult(new NumData(new Date().getDay()+1));
	}
	else if(unit=="hour"){
		return new ExecutionStatusResult(new NumData(new Date().getHours()));
	}
	else if(unit=="minute"){
		return new ExecutionStatusResult(new NumData(new Date().getMinutes()));
	}
	else if(unit=="second"){
		return new ExecutionStatusResult(new NumData(new Date().getSeconds()));
	}
	else if(unit=="time in milliseconds"){
		return new ExecutionStatusResult(new NumData(new Date().getTime()));
	}
	return new ExecutionStatusResult(new NumData(0, false));
};