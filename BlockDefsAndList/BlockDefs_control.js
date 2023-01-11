/* This file contains the implementations for Blocks in the control category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */
function B_WhenFlagTapped(x, y) {

  if (FinchBlox) {
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
    if (selection === "any_message") {
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
    this.timeSelection = 30;
    this.timeBN = new BlockButton(this);
    this.timeBN.addSlider("time", this.timeSelection, [1, 10, 20, 30, 40, 50]);
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
    mem.delayTime = this.timeSelection * 100;
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
    this.timeSelection = this.timeBN.values[0];
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
  if (FinchBlox) {
    category = "control_3";
  }
  LoopBlock.call(this, x, y, category, false); //Bottom is not open.
  if (FinchBlox) {
    this.addPart(new BlockIcon(this, VectorPaths.faSyncAlt, Colors.white, "repeat", 30));
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
  if (FinchBlox) {
    category = "control_3";
  }
  LoopBlock.call(this, x, y, category);

  if (FinchBlox) {
    this.countSelection = 10;
    this.blockIcon = new BlockIcon(this, VectorPaths.faSyncAlt, Colors.white, "repeat", 30);
    this.blockIcon.isEndOfLine = true;
    this.addPart(this.blockIcon);
    this.countBN = new BlockButton(this);
    this.countBN.addSlider("count", this.countSelection, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    this.addPart(this.countBN);
    this.updateValues();
  } else {
    this.addPart(new NumSlot(this, "NumS_count", 10, true, true)); //Positive integer.
    this.parseTranslation(Language.getStr("block_repeat"));
  }
}
B_Repeat.prototype = Object.create(LoopBlock.prototype);
B_Repeat.prototype.constructor = B_Repeat;
/* Prepares counter and begins executing contents. */
B_Repeat.prototype.startAction = function() {
  const mem = this.runMem;
  if (FinchBlox) {
    mem.times = this.countSelection;
  } else {
    mem.timesD = this.slots[0].getData();
    mem.times = mem.timesD.getValueWithC(true, true);
  }
  mem.count = 0;
  if (mem.times > 0 && (FinchBlox || mem.timesD.isValid)) {
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
B_Repeat.prototype.updateValues = function() {
  if (this.countBN != null) {
    this.countSelection = this.countBN.values[0];
    this.blockIcon.addText(this.countSelection, 30, 28);
  }
}



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

function B_WhenKeyPressed(x, y) {
  HatBlock.call(this, x, y, "control", true);
  const dS = new DropSlot(this, "DS_key", null, null, new SelectionData(Language.getStr("space"), "Space,32"));
  dS.addOption(new SelectionData("0", "Digit0,48"));
  dS.addOption(new SelectionData("1", "Digit1,49"));
  dS.addOption(new SelectionData("2", "Digit2,50"));
  dS.addOption(new SelectionData("3", "Digit3,51"));
  dS.addOption(new SelectionData("4", "Digit4,52"));
  dS.addOption(new SelectionData("5", "Digit5,53"));
  dS.addOption(new SelectionData("6", "Digit6,54"));
  dS.addOption(new SelectionData("7", "Digit7,55"));
  dS.addOption(new SelectionData("8", "Digit8,56"));
  dS.addOption(new SelectionData("9", "Digit9,57"));
  dS.addOption(new SelectionData(Language.getStr("any_key"), "any_key"));
  dS.addOption(new SelectionData("↑", "ArrowUp,38"));
  dS.addOption(new SelectionData("↓", "ArrowDown,40"));
  dS.addOption(new SelectionData("→", " ArrowRight,39"));
  dS.addOption(new SelectionData("←", "ArrowLeft,37"));
  dS.addOption(new SelectionData(Language.getStr("space"), "Space,32"));
  dS.addOption(new SelectionData("+", "Equal,187"));
  dS.addOption(new SelectionData("-", "Minus,189"));
  dS.addOption(new SelectionData("a", "KeyA,65"));
  dS.addOption(new SelectionData("b", "KeyB,66"));
  dS.addOption(new SelectionData("c", "KeyC,67"));
  dS.addOption(new SelectionData("d", "KeyD,68"));
  dS.addOption(new SelectionData("e", "KeyE,69"));
  dS.addOption(new SelectionData("f", "KeyF,70"));
  dS.addOption(new SelectionData("g", "KeyG,71"));
  dS.addOption(new SelectionData("h", "KeyH,72"));
  dS.addOption(new SelectionData("i", "KeyI,73"));
  dS.addOption(new SelectionData("j", "KeyJ,74"));
  dS.addOption(new SelectionData("k", "KeyK,75"));
  dS.addOption(new SelectionData("l", "KeyL,76"));
  dS.addOption(new SelectionData("m", "KeyM,77"));
  dS.addOption(new SelectionData("n", "KeyN,78"));
  dS.addOption(new SelectionData("o", "KeyO,79"));
  dS.addOption(new SelectionData("p", "KeyP,80"));
  dS.addOption(new SelectionData("q", "KeyQ,81"));
  dS.addOption(new SelectionData("r", "KeyR,82"));
  dS.addOption(new SelectionData("s", "KeyS,83"));
  dS.addOption(new SelectionData("t", "KeyT,84"));
  dS.addOption(new SelectionData("u", "KeyU,85"));
  dS.addOption(new SelectionData("v", "KeyV,86"));
  dS.addOption(new SelectionData("w", "KeyW,87"));
  dS.addOption(new SelectionData("x", "KeyX,88"));
  dS.addOption(new SelectionData("y", "KeyY,89"));
  dS.addOption(new SelectionData("z", "KeyZ,90"));

  this.addPart(dS);
  this.parseTranslation(Language.getStr("block_when_key_pressed"));

  this.selectedKeyPressed = false;

  document.body.addEventListener("keydown", function(event) {
    if (!this.running) {
      return;
    }
    console.log("keydown " + event.code + "," + event.keyCode);
    const currentSelection = this.slots[0].getData().getValue().split(",");
    console.log("current selection = " + currentSelection[0] + ", " + currentSelection[1]);
    //Use of keyCode is depricated, but necessary for old iPads at least
    if (event.code == currentSelection[0] || event.keyCode == currentSelection[1] || currentSelection[0] == "any_key") {
      this.selectedKeyPressed = true;
    }
  }.bind(this), true)
}
B_WhenKeyPressed.prototype = Object.create(HatBlock.prototype);
B_WhenKeyPressed.prototype.constructor = B_WhenKeyPressed;
// The flag should trigger this block as well
B_WhenKeyPressed.prototype.eventFlagClicked = function() {
  this.stack.startRun();
}
B_WhenKeyPressed.prototype.startAction = function() {
  this.selectedKeyPressed = false;
  return new ExecutionStatusRunning();
};
B_WhenKeyPressed.prototype.updateAction = function() {
  if (this.selectedKeyPressed) {
    return new ExecutionStatusDone();
  } else {
    return new ExecutionStatusRunning();
  }
}

//FinchBlox and Hatchling only
function B_FBStartWhen(x, y, sensor) {
  this.sensor = sensor
  let category = Hatchling ? "sensor_3" : "control_3"
  HatBlock.call(this, x, y, category, true);
}
B_FBStartWhen.prototype = Object.create(HatBlock.prototype);
B_FBStartWhen.prototype.constructor = B_FBStartWhen;
/* Triggers stack to start running. */
B_FBStartWhen.prototype.eventFlagClicked = function() {
  this.stack.startRun();
};
B_FBStartWhen.prototype.startAction = function() {

  this.blankRequestStatus = {};
  this.blankRequestStatus.finished = false;
  this.blankRequestStatus.error = false;
  this.blankRequestStatus.result = null;
  this.blankRequestStatus.requestSent = false;

  this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);

  return new ExecutionStatusRunning();
};
B_FBStartWhen.prototype.updateAction = function() {
  const status = this.runMem.requestStatus;
  if (status.requestSent) {
    if (status.finished) {
      if (!status.error) {
        const result = new StringData(status.result);
        const num = (result.asNum().getValue());
        if ((this.sensor == "clap" && num > 50) ||
          (this.sensor == "dark" && num < 5)) {
          return new ExecutionStatusDone();
        }
      }
      //If there's an error or if the condition hasn't been met, start over.
      this.runMem.requestStatus = Object.assign({}, this.blankRequestStatus);
    }
  } else {
    let device = DeviceFinch.getManager().getDevice(0);
    if (Hatchling) { device = DeviceHatchling.getManager().getDevice(0) }
    if (device != null) {
      if (this.sensor == "clap") {
        if (device.hasV2Microbit) {
          device.readSensor(status, "V2sound");
        } else {
          return new ExecutionStatusRunning();
        }
      } else if (this.sensor == "distance" && Hatchling) {
        device.readSensor(status, "distance", this.port);
      } else {
        device.readSensor(status, "light", "left");
      }
      status.requestSent = true;
    }
  }
  return new ExecutionStatusRunning();
}

function B_StartWhenDark(x, y) {
  B_FBStartWhen.call(this, x, y, "dark")

  if (Hatchling) {
    const blockIcon = new BlockIcon(this, VectorPaths.mjSun, Colors.white, "sun", 30);
    blockIcon.icon.setRotation(-8);
    blockIcon.negate(Colors.fbDarkGreen);
    blockIcon.isEndOfLine = true;
    this.addPart(blockIcon);
  } else {
    const blockIcon = new BlockIcon(this, VectorPaths.mjSun, Colors.fbDarkGreen, "sun", 25);
    blockIcon.icon.setRotation(-8);
    //blockIcon.icon.negate(Colors.flagGreen);
    blockIcon.negate(Colors.flagGreen);
    blockIcon.isEndOfLine = true;
    blockIcon.addSecondIcon(VectorPaths.faFlag, Colors.flagGreen, true);
    this.addPart(blockIcon);
    //const icon2 = new BlockIcon(this, VectorPaths.faFlag, Colors.flagGreen, "flag", 30)
  }
}
B_StartWhenDark.prototype = Object.create(B_FBStartWhen.prototype);
B_StartWhenDark.prototype.constructor = B_StartWhenDark;

function B_StartWhenClap(x, y) {
  B_FBStartWhen.call(this, x, y, "clap")

  if (Hatchling) {
    const blockIcon = new BlockIcon(this, VectorPaths.clap, Colors.white, "clap", 35);
    blockIcon.isEndOfLine = true;
    this.addPart(blockIcon);
  } else {
    const blockIcon = new BlockIcon(this, VectorPaths.clap, Colors.fbDarkGreen, "clap", 30);
    blockIcon.isEndOfLine = true;
    blockIcon.addSecondIcon(VectorPaths.faFlag, Colors.flagGreen, true, 25, -5);
    this.addPart(blockIcon);
  }
}
B_StartWhenClap.prototype = Object.create(B_FBStartWhen.prototype);
B_StartWhenClap.prototype.constructor = B_StartWhenClap;

B_StartWhenClap.prototype.checkActive = function() {
  let device = DeviceFinch.getManager().getDevice(0);
  const active = (device == null || !(device.hasV2Microbit === false))
  //console.log("when clap check active " + active + " with " + device)
  return active
};

//Hatchling only
function B_StartWhenDistance(x, y) {
  this.defaultDistance = 10;
  this.distance = this.defaultDistance
  B_FBStartWhen.call(this, x, y, "distance")

  HL_Utils.addHLButton(this)

  const blockIcon = new BlockIcon(this, VectorPaths.language, Colors.white, "dist", 35);
  blockIcon.isEndOfLine = true;
  this.addPart(blockIcon);

  this.distanceBN = new BlockButton(this);
  this.distanceBN.addSlider("distance", this.defaultDistance, [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  this.addPart(this.distanceBN);
}
B_StartWhenDistance.prototype = Object.create(B_FBStartWhen.prototype);
B_StartWhenDistance.prototype.constructor = B_StartWhenDistance;

B_StartWhenDistance.prototype.updateValues = function() {
  HL_Utils.updatePort(this)
  if (this.distanceBN != null) {
    this.distance = this.distanceBN.values[0]
  }
}
B_StartWhenDistance.prototype.checkActive = function() {
  return HL_Utils.checkActive(this)
}
