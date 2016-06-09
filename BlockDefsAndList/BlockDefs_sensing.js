function b_Ask(x,y){
	CommandBlock.call(this,x,y,"sensing");
	this.addPart(new LabelText(this,"ask"));
	this.addPart(new StringSlot(this,"what's your name?"));
	this.addPart(new LabelText(this,"and wait"));
}
b_Ask.prototype = Object.create(CommandBlock.prototype);
b_Ask.prototype.constructor = b_Ask;
b_Ask.prototype.startAction=function(){
	var question=this.slots[0].getData().getValue();
	var answer=prompt(question);
	TouchReceiver.touchend();
	CodeManager.answer=new StringData(answer);
	return false; //Done running
}



function b_Answer(x,y){
	ReporterBlock.call(this,x,y,"sensing",Block.returnTypes.string);
	this.addPart(new LabelText(this,"answer"));
}
b_Answer.prototype = Object.create(ReporterBlock.prototype);
b_Answer.prototype.constructor = b_Answer;
b_Answer.prototype.startAction=function(){
	this.resultData=CodeManager.answer;
	return false; //Done running
}





///////////

function b_Touching(x,y){
	PredicateBlock.call(this,x,y,"sensing");
	this.addPart(new LabelText(this,"touching?"));
}
b_Touching.prototype = Object.create(PredicateBlock.prototype);
b_Touching.prototype.constructor = b_Touching;



function b_TouchX(x,y){
	ReporterBlock.call(this,x,y,"sensing");
	this.addPart(new LabelText(this,"touch x"));
}
b_TouchX.prototype = Object.create(ReporterBlock.prototype);
b_TouchX.prototype.constructor = b_TouchX;

function b_TouchY(x,y){
	ReporterBlock.call(this,x,y,"sensing");
	this.addPart(new LabelText(this,"touch y"));
}
b_TouchY.prototype = Object.create(ReporterBlock.prototype);
b_TouchY.prototype.constructor = b_TouchY;

function b_DistanceTo(x,y){
	ReporterBlock.call(this,x,y,"sensing");
	this.addPart(new LabelText(this,"distance to"));
}
b_DistanceTo.prototype = Object.create(ReporterBlock.prototype);
b_DistanceTo.prototype.constructor = b_DistanceTo;

function b_ResetTimer(x,y){
	CommandBlock.call(this,x,y,"sensing");
	this.addPart(new LabelText(this,"reset timer"));
}
b_ResetTimer.prototype = Object.create(CommandBlock.prototype);
b_ResetTimer.prototype.constructor = b_ResetTimer;

function b_Timer(x,y){
	ReporterBlock.call(this,x,y,"sensing");
	this.addPart(new LabelText(this,"timer"));
}
b_Timer.prototype = Object.create(ReporterBlock.prototype);
b_Timer.prototype.constructor = b_Timer;

function b_CurrentTime(x,y){
	ReporterBlock.call(this,x,y,"sensing");
	this.addPart(new LabelText(this,"current"));
	var dS=new DropSlot(this,null,Slot.snapTypes.bool);
	dS.addOption("year",new SelectionData("year"));
	dS.addOption("month",new SelectionData("month"));
	dS.addOption("date",new SelectionData("date"));
	dS.addOption("day of the week",new SelectionData("day of the week"));
	dS.addOption("hour",new SelectionData("hour"));
	dS.addOption("minute",new SelectionData("minute"));
	dS.addOption("second",new SelectionData("second"));
	dS.addOption("time in milliseconds",new SelectionData("time in milliseconds"));
	this.addPart(dS);
}
b_CurrentTime.prototype = Object.create(ReporterBlock.prototype);
b_CurrentTime.prototype.constructor = b_CurrentTime;