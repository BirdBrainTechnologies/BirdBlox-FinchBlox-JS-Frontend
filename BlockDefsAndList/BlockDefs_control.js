/* This file contains the implementations for Blocks in the control category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */
function B_WhenFlagTapped(x, y) {

	if (FinchBlox){
		HatBlock.call(this, x, y, "control_3");
		this.addPart(new BlockIcon(this, VectorPaths.faFlag, Colors.flagGreen, "flag", 35));
		this.isStartBlock = true;
	} else {
		HatBlock.call(this, x, y, "control");
		// Add flag icon with height 15
		this.addPart(new BlockIcon(this, VectorPaths.flag, TitleBar.flagFill, "flag", 15));
		this.parseTranslation(Language.getStr("block_when_flag_tapped"));
	}
}
B_WhenFlagTapped.prototype = Object.create(HatBlock.prototype);
B_WhenFlagTapped.prototype.constructor = B_WhenFlagTapped;
/* Triggers stack to start running. */
B_WhenFlagTapped.prototype.eventFlagClicked = function() {
	this.stack.startRun();
};
/* Does nothing */
B_WhenFlagTapped.prototype.startAction = function() {
	return new ExecutionStatusDone();
};



function B_WhenIReceive(x, y) {
	HatBlock.call(this, x, y, "control");
	// Creates a BroadcastDropSlot that does nt allow snapping
	this.addPart(new BroadcastDropSlot(this, "BDS_msg", true));
	this.parseTranslation(Language.getStr("block_when_I_receive"));
}
B_WhenIReceive.prototype = Object.create(HatBlock.prototype);
B_WhenIReceive.prototype.constructor = B_WhenIReceive;
B_WhenIReceive.prototype.eventBroadcast = function(message) {
	// Get data from Slot (returns instantly since snapping is not allowed)
	const data = this.slots[0].getDataNotFromChild();
	let shouldRun = false;
	if (data.isSelection()) {
		const selection = data.getValue();
		if(selection === "any_message") {
			shouldRun = true;
		}
	} else if (data.asString().getValue() === message) {
		shouldRun = true;
	}
	if (shouldRun) {
		this.stack.stop();
		this.stack.startRun(null, message);
	}
};
/* Does nothing */
B_WhenIReceive.prototype.startAction = function() {
	return new ExecutionStatusDone();
};



function B_Wait(x, y) {

	if (FinchBlox) {
		CommandBlock.call(this, x, y, "control_3");
		const blockIcon = new BlockIcon(this, VectorPaths.faClockSolid, Colors.white, "clock", 35);
		blockIcon.isEndOfLine = true;
		this.addPart(blockIcon);
		this.timeSelection = 3;
		this.timeBN = new BlockButton(this);
		this.timeBN.addSlider("time", this.timeSelection, [1, 2, 3, 4, 5]);
		this.addPart(this.timeBN);
	} else {
		// Derived from CommandBlock
		// Category ("control") determines colors
		CommandBlock.call(this, x, y, "control");
		// Build Block out of things found in the BlockParts folder
		this.addPart(new NumSlot(this, "NumS_dur", 1, true)); // Must be positive.
		this.parseTranslation(Language.getStr("block_wait"));
	}
}
B_Wait.prototype = Object.create(CommandBlock.prototype);
B_Wait.prototype.constructor = B_Wait;
/* Records current time. */
B_Wait.prototype.startAction = function() {
	// Each Block has runMem to store information for that execution
	const mem = this.runMem;
	mem.startTime = new Date().getTime();
	if (FinchBlox) {
		mem.delayTime = this.timeSelection * 1000;
	} else {
		// Extract a positive value from first slot
		mem.delayTime = this.slots[0].getData().getValueWithC(true) * 1000;
	}
	return new ExecutionStatusRunning(); //Still running
};
/* Waits until current time exceeds stored time plus delay. */
B_Wait.prototype.updateAction = function() {
	const mem = this.runMem;
	if (new Date().getTime() >= mem.startTime + mem.delayTime) {
		return new ExecutionStatusDone(); //Done running
	} else {
		return new ExecutionStatusRunning(); //Still running
	}
};
B_Wait.prototype.updateValues = function() {
	if (this.timeBN != null) {
		this.timeSelection = this.timeBN.value;
	}
}


function B_WaitUntil(x, y) {
	CommandBlock.call(this, x, y, "control");
	this.addPart(new BoolSlot(this, "BoolS_cond"));
	this.parseTranslation(Language.getStr("block_wait_until"));
}
B_WaitUntil.prototype = Object.create(CommandBlock.prototype);
B_WaitUntil.prototype.constructor = B_WaitUntil;
/* Checks condition. If true, stops running; if false, resets Block to check again. */
B_WaitUntil.prototype.startAction = function() {
	const stopWaiting = this.slots[0].getData().getValue();
	if (stopWaiting) {
		return new ExecutionStatusDone(); //Done running
	} else {
		this.running = 0; //startAction will be run next time, giving Slots ability to recalculate.
		this.clearMem(); //runMem and previous values of Slots will be removed.
		return new ExecutionStatusRunning(); //Still running
	}
};



function B_Forever(x, y) {
	let category = "control";
	if (FinchBlox) { category = "control_3"; }
	LoopBlock.call(this, x, y, category, false); //Bottom is not open.
	if (FinchBlox) {
		this.addPart(new BlockIcon(this, VectorPaths.faUndoAlt, Colors.white, "repeat", 40));
	} else {
		this.addPart(new LabelText(this, Language.getStr("block_repeat_forever")));
	}
}
B_Forever.prototype = Object.create(LoopBlock.prototype);
B_Forever.prototype.constructor = B_Forever;
/* Begins executing contents. */
B_Forever.prototype.startAction = function() {
	this.blockSlot1.startRun();
	return new ExecutionStatusRunning(); //Still running
};
/* Continues executing contents. If contents are done, runs them again. */
B_Forever.prototype.updateAction = function() {
	let blockSlotStatus = this.blockSlot1.updateRun();
	if (!blockSlotStatus.isRunning()) {
		if (blockSlotStatus.hasError()) {
			return blockSlotStatus;
		} else {
			this.blockSlot1.startRun();
		}
	}
	return new ExecutionStatusRunning(); //Still running. Never stops.
};



function B_Repeat(x, y) {
	let category = "control";
	if (FinchBlox) { category = "control_3"; }
	LoopBlock.call(this, x, y, category);
	this.addPart(new NumSlot(this, "NumS_count", 10, true, true)); //Positive integer.
	this.parseTranslation(Language.getStr("block_repeat"));
}
B_Repeat.prototype = Object.create(LoopBlock.prototype);
B_Repeat.prototype.constructor = B_Repeat;
/* Prepares counter and begins executing contents. */
B_Repeat.prototype.startAction = function() {
	const mem = this.runMem;
	mem.timesD = this.slots[0].getData();
	mem.times = mem.timesD.getValueWithC(true, true);
	mem.count = 0;
	if (mem.times > 0 && mem.timesD.isValid) {
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	} else {
		return new ExecutionStatusDone();
	}
};
/* Update contents. When they finish, increment counter and possibly run them again. */
B_Repeat.prototype.updateAction = function() {
	let blockSlotStatus = this.blockSlot1.updateRun();
	if (!blockSlotStatus.isRunning()) {
		if (blockSlotStatus.hasError()) {
			return blockSlotStatus;
		} else {
			const mem = this.runMem;
			mem.count++;
			if (mem.count >= mem.times) {
				return new ExecutionStatusDone(); //Done running
			} else {
				this.blockSlot1.startRun();
			}
		}
	}
	return new ExecutionStatusRunning(); //Still running
};



function B_RepeatUntil(x, y) {
	LoopBlock.call(this, x, y, "control");
	this.addPart(new BoolSlot(this, "BoolS_cond"));
	this.parseTranslation(Language.getStr("block_repeat_until"));
}
B_RepeatUntil.prototype = Object.create(LoopBlock.prototype);
B_RepeatUntil.prototype.constructor = B_RepeatUntil;
/* Checks condition and either stops running or executes contents. */
B_RepeatUntil.prototype.startAction = function() {
	const stopRepeating = this.slots[0].getData().getValue();
	if (stopRepeating) {
		return new ExecutionStatusDone(); //Done running
	} else {
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
};
/* Updates contents until completed. Then resets Block to condition can be checked again. */
B_RepeatUntil.prototype.updateAction = function() {
	let blockSlotStatus = this.blockSlot1.updateRun();
	if (!blockSlotStatus.isRunning()) {
		if (blockSlotStatus.hasError()) {
			return blockSlotStatus;
		} else {
			this.running = 0; //startAction will be run next time, giving Slots ability to recalculate.
			this.clearMem(); //runMem and previous values of Slots will be removed.
		}
	}
	return new ExecutionStatusRunning(); //Still running
};



function B_If(x, y) {
	LoopBlock.call(this, x, y, "control");
	this.addPart(new BoolSlot(this, "BoolS_cond"));
	this.parseTranslation(Language.getStr("block_if"));
}
B_If.prototype = Object.create(LoopBlock.prototype);
B_If.prototype.constructor = B_If;
/* Either stops running or executes contents. */
B_If.prototype.startAction = function() {
	const check = this.slots[0].getData().getValue();
	if (check) {
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	} else {
		return new ExecutionStatusDone(); //Done running
	}
};
/* Continues executing contents until completed. */
B_If.prototype.updateAction = function() {
	return this.blockSlot1.updateRun();
};



function B_IfElse(x, y) {
	DoubleLoopBlock.call(this, x, y, "control", Language.getStr("else"));
	this.addPart(new BoolSlot(this, "BoolS_cond"));
	this.parseTranslation(Language.getStr("block_if_else"));
}
B_IfElse.prototype = Object.create(DoubleLoopBlock.prototype);
B_IfElse.prototype.constructor = B_IfElse;
/* Starts executing one of two BlockSlots. */
B_IfElse.prototype.startAction = function() {
	this.runMem.check = this.slots[0].getData().getValue();
	if (this.runMem.check) {
		this.blockSlot1.startRun();
		return new ExecutionStatusRunning(); //Still running
	} else {
		this.blockSlot2.startRun();
		return new ExecutionStatusRunning(); //Still running
	}
};
/* Continues executing one of two BlockSlots until completion. */
B_IfElse.prototype.updateAction = function() {
	if (this.runMem.check) {
		return this.blockSlot1.updateRun();
	} else {
		return this.blockSlot2.updateRun();
	}
};



function B_Broadcast(x, y) {
	CommandBlock.call(this, x, y, "control");
	this.addPart(new BroadcastDropSlot(this, "BDS_msg", false));
	this.parseTranslation(Language.getStr("block_broadcast"));
}
B_Broadcast.prototype = Object.create(CommandBlock.prototype);
B_Broadcast.prototype.constructor = B_Broadcast;
/* Broadcast the message if one has been selected. */
B_Broadcast.prototype.startAction = function() {
	this.runMem.finished = false;
	const message = this.runMem.message = this.slots[0].getData().asString().getValue();
	if (message === "") {
		return new ExecutionStatusDone();
	}
	// Broadcasts are throttled if too many unanswered commands are present
	if (CodeManager.checkBroadcastDelay()) {
		CodeManager.message = new StringData(message);
		CodeManager.eventBroadcast(message);
		this.runMem.finished = true;
	}
	return new ExecutionStatusRunning();
};
/* Broadcasts if the briadcast hasn't been sent yet */
B_Broadcast.prototype.updateAction = function() {
	if (this.runMem.finished) {
		return new ExecutionStatusDone();
	}
	const message = this.runMem.message;
	if (CodeManager.checkBroadcastDelay()) {
		CodeManager.message = new StringData(message);
		CodeManager.eventBroadcast(message);
		this.runMem.finished = true;
	}
	return new ExecutionStatusRunning();
};



function B_BroadcastAndWait(x, y) {
	CommandBlock.call(this, x, y, "control");
	this.addPart(new BroadcastDropSlot(this, "BDS_msg", false));
	this.parseTranslation(Language.getStr("block_broadcast_and_wait"));
}
B_BroadcastAndWait.prototype = Object.create(CommandBlock.prototype);
B_BroadcastAndWait.prototype.constructor = B_BroadcastAndWait;
/* Broadcasts the message */
B_BroadcastAndWait.prototype.startAction = function() {
	const message = this.slots[0].getData().asString().getValue();
	if (message !== "") {
		this.runMem.message = message;
		CodeManager.message = new StringData(message);
		CodeManager.eventBroadcast(message);
	}
	return new ExecutionStatusRunning();
};
/* Checks if the broadcast is still running */
B_BroadcastAndWait.prototype.updateAction = function() {
	if (CodeManager.checkBroadcastRunning(this.runMem.message)) {
		return new ExecutionStatusRunning();
	} else {
		return new ExecutionStatusDone();
	}
};



function B_Message(x, y) {
	ReporterBlock.call(this, x, y, "control", Block.returnTypes.string);
	this.addPart(new LabelText(this, Language.getStr("block_message")));
}
B_Message.prototype = Object.create(ReporterBlock.prototype);
B_Message.prototype.constructor = B_Message;
/* Returns the last broadcast message */
B_Message.prototype.startAction = function() {
	return new ExecutionStatusResult(CodeManager.message);
};



function B_Stop(x, y) {
	CommandBlock.call(this, x, y, "control", true);
	const dS = new DropSlot(this, "DS_act", null, null, new SelectionData(Language.getStr("all"), "all"));
	dS.addOption(new SelectionData(Language.getStr("all"), "all"));
	dS.addOption(new SelectionData(Language.getStr("this_script"), "this_script"));
	//dS.addOption(new SelectionData("this block", "this_block"));
	dS.addOption(new SelectionData(Language.getStr("all_but_this_script"), "all_but_this_script"));
	//dS.addOption(new SelectionData("other scripts in sprite", "other_scripts_in_sprite"));
	this.addPart(dS);
	this.parseTranslation(Language.getStr("block_stop"));
}
B_Stop.prototype = Object.create(CommandBlock.prototype);
B_Stop.prototype.constructor = B_Stop;
/* Stops whatever is selected */
B_Stop.prototype.startAction = function() {
	const selection = this.slots[0].getData().getValue();
	if (selection === "all") {
		CodeManager.stop();
	} else if (selection === "this_script") {
		this.stack.stop();
	} else if (selection === "all_but_this_script") {
		TabManager.stopAllButStack(this.stack);
	}
	return new ExecutionStatusDone();
};



function B_When(x, y) {
	HatBlock.call(this, x, y, "control", true);
	this.addPart(new BoolSlot(this, "BoolS_cond"));
	this.parseTranslation(Language.getStr("block_when"));
}
B_When.prototype = Object.create(HatBlock.prototype);
B_When.prototype.constructor = B_When;
// The flag should trigger this block as well
B_When.prototype.eventFlagClicked = function() {
	this.stack.startRun();
}
/* Checks condition. If true, stops running; if false, resets Block to check again. */
B_When.prototype.startAction = function() {
	const stopWaiting = this.slots[0].getData().getValue();
	if (stopWaiting) {
		return new ExecutionStatusDone(); //Done running
	} else {
		this.running = 0; //startAction will be run next time, giving Slots ability to recalculate.
		this.clearMem(); //runMem and previous values of Slots will be removed.
		return new ExecutionStatusRunning(); //Still running
	}
};

//FinchBlox only
function B_StartWhenDark(x, y) {
	HatBlock.call(this, x, y, "control_3");
	const blockIcon = new BlockIcon(this, VectorPaths.mjSun, Colors.fbDarkGreen, "sun", 25);
	blockIcon.icon.setRotation(-8);
	//blockIcon.icon.negate(Colors.flagGreen);
	blockIcon.negate(Colors.flagGreen);
	blockIcon.isEndOfLine = true;
	blockIcon.addSecondIcon(VectorPaths.faFlag, Colors.flagGreen, true);
	this.addPart(blockIcon);
	//const icon2 = new BlockIcon(this, VectorPaths.faFlag, Colors.flagGreen, "flag", 30)
}
B_StartWhenDark.prototype = Object.create(HatBlock.prototype);
B_StartWhenDark.prototype.constructor = B_StartWhenDark;

/* Triggers stack to start running. */
B_StartWhenDark.prototype.eventFlagClicked = function() {
	this.stack.startRun();
};
/* Does nothing */
B_StartWhenDark.prototype.startAction = function() {
	return new ExecutionStatusDone();
	//return new ExecutionStatusRunning();
};
