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
	return true;
};
/* Waits until the dialog has been displayed and completed. */
B_Ask.prototype.updateAction=function(){
	var mem=this.runMem;
	if(mem.waitingForDialog){ //If we are waiting for a dialog to close...
		if(!HtmlServer.dialogVisible){ //...And the dialog is closed...
			mem.waitingForDialog=false; //...Then we can stop waiting.
		}
		return true; //Still running.
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
		return true; //Still running.
	}
	else{
		if(mem.finished==true){ //Question has been answered.
			CodeManager.updateDialogDelay(); //Tell CodeManager to reset the dialog delay clock.
			return false; //Done running
		}
		else{ //Waiting on answer from user.
			return true; //Still running
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
	this.resultData=CodeManager.answer;
	return false; //Done running
};

function B_ResetTimer(x,y){
	CommandBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"reset timer"));
}
B_ResetTimer.prototype = Object.create(CommandBlock.prototype);
B_ResetTimer.prototype.constructor = B_ResetTimer;
B_ResetTimer.prototype.startAction=function(){
	CodeManager.timerForSensingBlock=new Date().getTime();
	return false;
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
	this.resultData=new NumData(Math.round((now-start)/100)/10);
	return false;
};

function B_CurrentTime(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"current"));
	var dS=new DropSlot(this,"DS_interval",null,Slot.snapTypes.bool);
	dS.addOption("year",new SelectionData("year"));
	dS.addOption("month",new SelectionData("month"));
	dS.addOption("date",new SelectionData("date"));
	dS.addOption("day of the week",new SelectionData("day of the week"));
	dS.addOption("hour",new SelectionData("hour"));
	dS.addOption("minute",new SelectionData("minute"));
	dS.addOption("second",new SelectionData("second"));
	dS.addOption("time in milliseconds",new SelectionData("time in milliseconds"));
	dS.setSelectionData("date",new SelectionData("date"));
	this.addPart(dS);
}
B_CurrentTime.prototype = Object.create(ReporterBlock.prototype);
B_CurrentTime.prototype.constructor = B_CurrentTime;
B_CurrentTime.prototype.startAction=function(){
	var unitD=this.slots[0].getData();
	if(unitD==null){
		this.resultData=new NumData(0,false);
		return false;
	}
	var unit=unitD.getValue();
	if(unit=="year"){
		this.resultData=new NumData(new Date().getFullYear());
	}
	else if(unit=="month"){
		this.resultData=new NumData(new Date().getMonth()+1);
	}
	else if(unit=="date"){
		this.resultData=new NumData(new Date().getDate());
	}
	else if(unit=="day of the week"){
		this.resultData=new NumData(new Date().getDay()+1);
	}
	else if(unit=="hour"){
		this.resultData=new NumData(new Date().getHours());
	}
	else if(unit=="minute"){
		this.resultData=new NumData(new Date().getMinutes());
	}
	else if(unit=="second"){
		this.resultData=new NumData(new Date().getSeconds());
	}
	else if(unit=="time in milliseconds"){
		this.resultData=new NumData(new Date().getTime());
	}
	return false;
};


///////////

function B_Touching(x,y){
	PredicateBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"touching?"));
}
B_Touching.prototype = Object.create(PredicateBlock.prototype);
B_Touching.prototype.constructor = B_Touching;



function B_TouchX(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"touch x"));
}
B_TouchX.prototype = Object.create(ReporterBlock.prototype);
B_TouchX.prototype.constructor = B_TouchX;

function B_TouchY(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"touch y"));
}
B_TouchY.prototype = Object.create(ReporterBlock.prototype);
B_TouchY.prototype.constructor = B_TouchY;

function B_DistanceTo(x,y){
	ReporterBlock.call(this,x,y,"tablet");
	this.addPart(new LabelText(this,"distance to"));
}
B_DistanceTo.prototype = Object.create(ReporterBlock.prototype);
B_DistanceTo.prototype.constructor = B_DistanceTo;
