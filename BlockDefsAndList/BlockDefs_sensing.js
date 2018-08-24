/* This file contains the implementations for sensing Blocks, which have been moved to the tablet category
 * TODO: merge with tablet
 */



/* TODO: make sure dialogs don't show while a save dialog is up */
function B_Ask(x, y) {
	CommandBlock.call(this, x, y, "tablet");
	this.addPart(new LabelText(this, Language.getStr("ask")));
	this.addPart(new StringSlot(this, "StrS_msg", "what's your name?"));
	this.addPart(new LabelText(this, Language.getStr("and_wait")));
}
B_Ask.prototype = Object.create(CommandBlock.prototype);
B_Ask.prototype.constructor = B_Ask;
/* Show a dialog with the question unless another dialog is already visible or has been displayed recently. */
B_Ask.prototype.startAction = function() {
	const mem = this.runMem;
	mem.question = this.slots[0].getData().getValue();
	mem.questionDisplayed = false;
	// There is a delay between repeated dialogs to give the user time to stop the program.
	// Check if we can show the dialog or should delay.
	if (DialogManager.checkDialogDelay()) {
		this.showQuestion();
	}
	return new ExecutionStatusRunning();
};
/* Waits until the dialog has been displayed and completed. */
B_Ask.prototype.updateAction = function() {
	const mem = this.runMem;
	if (!mem.questionDisplayed) {   // If the question has not yet been displayed...
		if (DialogManager.checkDialogDelay()) {   // Check if we can show the dialog or should delay.
			this.showQuestion();   // Display the question.
		}
		return new ExecutionStatusRunning();   // Still running.
	} else {
		if (mem.finished === true) {   // Question has been answered.
			return new ExecutionStatusDone();   // Done running
		} else {   // Waiting on answer from user.
			return new ExecutionStatusRunning();   // Still running
		}
	}
};
/* Sends the request to show the dialog */
B_Ask.prototype.showQuestion = function() {
	const mem = this.runMem;
	mem.finished = false;   // Will be changed once answered.
	const callbackFn = function(cancelled, response) {
		if (cancelled) {
			CodeManager.answer = new StringData("", true);   //"" is the default answer.
		} else {
			CodeManager.answer = new StringData(response, true);   // Store the user's answer in the CodeManager.
		}
		mem.finished = true;   // Done waiting.
	};
	const callbackErr = function() {   // If an error occurs...
		CodeManager.answer = new StringData("", true);   //"" is the default answer.
		mem.finished = true;   // Done waiting.
	};
	DialogManager.showPromptDialog("Question", mem.question, "", true, callbackFn, callbackErr);   // Make the request.
	mem.questionDisplayed = true;   // Prevents displaying twice.
};



function B_Answer(x, y) {
	ReporterBlock.call(this, x, y, "tablet", Block.returnTypes.string);
	this.addPart(new LabelText(this, Language.getStr("answer")));
}
B_Answer.prototype = Object.create(ReporterBlock.prototype);
/* Result is whatever is stored in CodeManager. */
B_Answer.prototype.constructor = B_Answer;
B_Answer.prototype.startAction = function() {
	return new ExecutionStatusResult(CodeManager.answer);
};



function B_ResetTimer(x, y) {
	CommandBlock.call(this, x, y, "tablet");
	this.addPart(new LabelText(this, Language.getStr("reset_timer")));
}
B_ResetTimer.prototype = Object.create(CommandBlock.prototype);
B_ResetTimer.prototype.constructor = B_ResetTimer;
/* Reset the timer in CodeManager */
B_ResetTimer.prototype.startAction = function() {
	CodeManager.timerForSensingBlock = new Date().getTime();
	return new ExecutionStatusDone();
};



function B_Timer(x, y) {
	ReporterBlock.call(this, x, y, "tablet");
	this.addPart(new LabelText(this,  Language.getStr("timer")));
}
B_Timer.prototype = Object.create(ReporterBlock.prototype);
B_Timer.prototype.constructor = B_Timer;
/* Get the time and convert it to seconds */
B_Timer.prototype.startAction = function() {
	const now = new Date().getTime();
	const start = CodeManager.timerForSensingBlock;
	/* Round to 1 decimal */
	return new ExecutionStatusResult(new NumData((now - start) / 1000));
};
Block.setDisplaySuffix(B_Timer, "s");



function B_CurrentTime(x, y) {
	ReporterBlock.call(this, x, y, "tablet");
	this.addPart(new LabelText(this, Language.getStr("current")));
	const dS = new DropSlot(this, "DS_interval", null, null, new SelectionData(Language.getStr("date"), "date"));
	dS.addOption(new SelectionData(Language.getStr("year"), "year"));
	dS.addOption(new SelectionData(Language.getStr("month"), "month"));
	dS.addOption(new SelectionData(Language.getStr("date"), "date"));
	dS.addOption(new SelectionData(Language.getStr("day_of_the_week"), "day of the week"));
	dS.addOption(new SelectionData(Language.getStr("hour"), "hour"));
	dS.addOption(new SelectionData(Language.getStr("minute"), "minute"));
	dS.addOption(new SelectionData(Language.getStr("second"), "second"));
	dS.addOption(new SelectionData(Language.getStr("time_in_milliseconds"), "time in milliseconds"));
	this.addPart(dS);
}
B_CurrentTime.prototype = Object.create(ReporterBlock.prototype);
B_CurrentTime.prototype.constructor = B_CurrentTime;
/* Returns the current time in the desired units */
B_CurrentTime.prototype.startAction = function() {
	const unitD = this.slots[0].getData();
	if (unitD == null) {
		return new ExecutionStatusResult(new NumData(0, false));
	}
	const unit = unitD.getValue();
	if (unit === "year") {
		return new ExecutionStatusResult(new NumData(new Date().getFullYear()));
	} else if (unit === "month") {
		return new ExecutionStatusResult(new NumData(new Date().getMonth() + 1));
	} else if (unit === "date") {
		return new ExecutionStatusResult(new NumData(new Date().getDate()));
	} else if (unit === "day of the week") {
		return new ExecutionStatusResult(new NumData(new Date().getDay() + 1));
	} else if (unit === "hour") {
		return new ExecutionStatusResult(new NumData(new Date().getHours()));
	} else if (unit === "minute") {
		return new ExecutionStatusResult(new NumData(new Date().getMinutes()));
	} else if (unit === "second") {
		return new ExecutionStatusResult(new NumData(new Date().getSeconds()));
	} else if (unit === "time in milliseconds") {
		return new ExecutionStatusResult(new NumData(new Date().getTime()));
	}
	return new ExecutionStatusResult(new NumData(0, false));
};



function B_Display(x, y) {
	CommandBlock.call(this, x, y, "tablet");
	this.addPart(new LabelText(this, Language.getStr("Display")));
	this.addPart(new StringSlot(this, "StrS_msg", "Hello"));
	this.addPart(new LabelText(this, Language.getStr("at")));
	const dS = new DropSlot(this, "DS_pos", null, null, new SelectionData(Language.getStr("Position") +" 3", "position3"));
	dS.addOption(new SelectionData(Language.getStr("Position") +" 1", "position1"));
	dS.addOption(new SelectionData(Language.getStr("Position") +" 2", "position2"));
	dS.addOption(new SelectionData(Language.getStr("Position") +" 3", "position3"));
	this.addPart(dS);
}
B_Display.prototype = Object.create(CommandBlock.prototype);
B_Display.prototype.constructor = B_Display;
/* Displays the value on the screen */
B_Display.prototype.startAction = function() {
	const message = this.slots[0].getData().getValue();
	const position = this.slots[1].getData().getValue();
	DisplayBoxManager.displayText(message, position);
	return new ExecutionStatusDone(); // Done running
};