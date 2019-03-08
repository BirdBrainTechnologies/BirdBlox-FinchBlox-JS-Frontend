/**
 * This file contains the implementations for the blocks specific to the FinchBlox
 * color category.
 */

 function B_FBColor(x, y, level) {
   this.level = level;
   CommandBlock.call(this,x,y,"color_"+level);

   let blockIcon = new BlockIcon(this, VectorPaths.faLightbulb, Colors.white, "finchColor", 30);
   blockIcon.isEndOfLine = true;
   this.addPart(blockIcon);
 }
 B_FBColor.prototype = Object.create(CommandBlock.prototype);
 B_FBColor.prototype.constructor = B_FBColor;

 B_FBColor.prototype.startAction = function () {
   const mem = this.runMem;
   mem.timerStarted = false;
   mem.duration = 1000;
   mem.requestStatus = {};
   mem.requestStatus.finished = true; //change when sending actual request
   mem.requestStatus.error = false;
   mem.requestStatus.result = null;
   return new ExecutionStatusRunning();
 }
 B_FBColor.prototype.updateAction = function () {
   const mem = this.runMem;
   if (!mem.timerStarted) {
       const status = mem.requestStatus;
       if (status.finished === true) {
           mem.startTime = new Date().getTime();
           mem.timerStarted = true;
       } else {
           return new ExecutionStatusRunning(); // Still running
       }
   }
   if (new Date().getTime() >= mem.startTime + mem.duration) {
       return new ExecutionStatusDone(); // Done running
   } else {
       return new ExecutionStatusRunning(); // Still running
   }
 }

 function B_FBColorL1(x, y) {
   B_FBColor.call(this, x, y, 1);
 }
 B_FBColorL1.prototype = Object.create(B_FBColor.prototype);
 B_FBColorL1.prototype.constructor = B_FBColorL1;

 function B_FBColorL2(x, y) {
   B_FBColor.call(this, x, y, 2);
 }
 B_FBColorL2.prototype = Object.create(B_FBColor.prototype);
 B_FBColorL2.prototype.constructor = B_FBColorL2;

 function B_FBColorL3(x, y) {
   B_FBColor.call(this, x, y, 3);
 }
 B_FBColorL3.prototype = Object.create(B_FBColor.prototype);
 B_FBColorL3.prototype.constructor = B_FBColorL3;
