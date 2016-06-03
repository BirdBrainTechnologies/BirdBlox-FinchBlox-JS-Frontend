/* CodeManager is a static class that controls block execution.  It also moves the BlockStack that the user is dragging.
 */
function CodeManager(){
	var move=CodeManager.move; //shorthand
	move.moving=false; //Is there a BlockStack that is currently moving?
	move.stack=null; //Reference to BlockStack that is currently moving.
	move.offsetX=0; //The difference between the BlockStack's x and the touch x.
	move.offsetY=0; //The difference between the BlockStack's y and the touch y.
	move.touchX=0; //The x coord of the user's finger.
	move.touchY=0; //The y coord of the user's finger.
	move.topX=0; //The top-left corner's x coord of the BlockStack being moved.
	move.topY=0; //The top-left corner's y-coord of the BlockStack being moved.
	move.height=0; //The height of the BlockStack (used to determine overlap with slots).
	move.width=0; //The width of the BlockStack.
	move.returnType; //The return type of the BlockStack. (none unless it is a reporter, predicate, etc.)
	
	CodeManager.isRunning=false; //Are at least some Blocks currently executing?
	CodeManager.fit=function(){} //A function which stores information used when determine which slot is closest to the moving stack.
	CodeManager.updateTimer=null; //A timer which tells executing Blocks to update.
	CodeManager.updateInterval=10; //How quickly does the update timer fire (in ms)?
	CodeManager.answer=new StringData(""); //Stores the answer to the "ask" block.  When the app first opens, the answer is an empty string.
}
/* CodeManager.move contains function to start, stop, and update the movement of the current BlockStack.  These functions are called by the TouchReciever class when the user drags a BlockStack. */
CodeManager.move=function(){};
/* Picks up a Block so that it can be moved.  Stores necessary information in CodeManager.move.  Transfers the BlockStack into the drag layer above other blocks.
 * @param {Block} block - The block the user dragged.  It must be disconnected from its current BlockStack so it can move freely.
 * @param {number} x - The x coord of the user's finger.
 * @param {number} y - The y coord of the user's finger.
 */
CodeManager.move.start=function(block,x,y){
	var move=CodeManager.move; //shorthand
	if(!move.moving){ //Only start moving the Block if no other Blocks are moving.
		move.moving=true; //Record that a Block is now moving.
		var stack=block.unsnap(); //Disconnect the Block from its current BlockStack to form a new BlockStack containing only the Block and the Blocks below it.
		stack.fly(); //Make the new BlockStack fly (moves it the the drag layer above other BlockStacks).
		move.height=stack.dim.rh; //Store the BlockStack's dimensions.
		move.width=stack.dim.rw;
		move.returnType=stack.returnType; //Store the BlockStack's return type.
		
		move.bottomOpen=stack.firstBlock.bottomOpen; //Store other information about how the BlockStack can connect to other Blocks.
		move.topOpen=stack.firstBlock.topOpen;
		move.returnsValue=stack.firstBlock.returnsValue;
		//move.hasBlockSlot1=stack.firstBlock.hasBlockSlot1;
		//move.hasBlockSlot2=stack.firstBlock.hasBlockSlot2;
		
		move.offsetX=stack.getAbsX()-x; //Store offset.
		move.offsetY=stack.getAbsY()-y;
		move.stack=stack; //Store stack.
	}
}
/* Updates the position of the currently moving BlockStack.  Also highlights the slot that fits it best (if any).
 * @param {number} x - The x coord of the user's finger.
 * @param {number} y - The y coord of the user's finger.
 */
CodeManager.move.update=function(x,y){
	var move=CodeManager.move; //shorthand
	if(move.moving){ //Only update if a BlockStack is currently moving.
		move.touchX=x;
		move.touchY=y;
		move.topX=move.offsetX+move.touchX;
		move.topY=move.offsetY+move.touchY;
		move.stack.move(move.topX,move.topY); //Move the BlockStack to the correct location.
		if(BlockPalette.IsStackOverPalette()){ //If the BlockStack overlaps with the BlockPalette, it is ready to be deleted so no slots are highlighted.
			Highlighter.hide(); //Hide any existing highlight.
		}
		else{
			CodeManager.findBestFit(); //The slot which fits it best (if any) will be stored in CodeManager.fit.bestFit.
			if(CodeManager.fit.found){
				CodeManager.fit.bestFit.highlight(); //If such a slot exists, highlight it.
			}
			else{
				Highlighter.hide(); //If not, hide any existing highlight.
			}
		}
	}
}
/* Drops the BlockStack that is currently moving and connects it to the Slot/Block that fits it best (if any).
 */
CodeManager.move.end=function(){
	var move=CodeManager.move; //shorthand
	var fit=CodeManager.fit; //shorthand
	if(move.moving){ //Only run if a BlockStack is currently moving.
		move.topX=move.offsetX+move.touchX;
		move.topY=move.offsetY+move.touchY;
		if(BlockPalette.IsStackOverPalette()){ //If the BlockStack overlaps with the BlockPalette, delete it.
			move.stack.delete();
		}
		else{
			CodeManager.findBestFit(); //The Block/Slot which fits it best (if any) will be stored in CodeManager.fit.bestFit.
			if(fit.found){
				fit.bestFit.snap(move.stack.firstBlock); //Snap is onto the Block/Slot that fits it best.
			}
			else{
				move.stack.land(); //If it is not going to be snapped or deleted, simply drop it onto the current tab.
				move.stack.updateDim(); //Fix! this line of code might not be needed.
			}
		}
		Highlighter.hide(); //Hide any existing highlight.
		move.moving=false; //There are now no moving BlockStacks.
	}
}
/* Returns a boolean indicating if a point falls within a rectangular region. Useful for determining which Blocks a moving BlockStack can connect to.
 * @param {number} x1 - The x coord of the point.
 * @param {number} y1 - The y coord of the point.
 * @param {number} yR - The x coord of the top-left corner of the region.
 * @param {number} yY - The y coord of the top-left corner of the region.
 * @param {number} width - The width of the region.
 * @param {number} height - The height of the region.
 * @return {boolean} - Is the point within the region?
 */
CodeManager.move.pInRange=function(x1,y1,xR,yR,width,height){
	return (x1>=xR && x1<=xR+width && y1>=yR && y1<=yR+height); //Checks to see if the point is on the correct side of all four sides of the rectangular region.
}
/* Returns a boolean indicating if two rectangular regions overlap. Useful for determining which Slots a moving BlockStack can connect to.
 * @param {number} x1 - The x coord of the top-left corner of the first region.
 * @param {number} y1 - The y coord of the top-left corner of the first region.
 * @param {number} width1 - The width of the first region.
 * @param {number} height1 - The height of the first region.
 * @param {number} x2 - The x coord of the top-left corner of the second region.
 * @param {number} y2 - The y coord of the top-left corner of the second region.
 * @param {number} width2 - The width of the second region.
 * @param {number} height2 - The height of the second region.
 * @return {boolean} - Do the rectangular regions overlap?
 */
CodeManager.move.rInRange=function(x1,y1,width1,height1,x2,y2,width2,height2){
	//These conditions check that there are no vertical or horizontal gaps between the regions.  If any exist, they don't overlap.
	var xBigEnough = x1+width1>=x2; //Is the right side of region 1 to the right of the left side of region 2?
	var yBigEnough = y1+height1>=y2; //Is the bottom side of region 1 below the top side of region 2?
	var xSmallEnough = x1<=x2+width2; //Is the left side of region 1 to the left of the right side of region 2?
	var ySmallEnough = y1<=y2+height2; //Is the top side of region 1 above the bottom side of region 2?
	return xBigEnough&&yBigEnough&&xSmallEnough&&ySmallEnough; //If it passes all 4 checks, the regions overlap.
}
/* Recursively searches for the Block/Slot that best fits the moving BlockStack.  All results are stored in CodeManager.fit.  Nothing is returned.
 */
CodeManager.findBestFit=function(){
	var fit=CodeManager.fit; //shorthand
	fit.found=false; //Have any matching slot/block been found?
	fit.bestFit=null; //Slot/Block that is closest to the item?
	fit.dist=0; //How far is the best candidate from the ideal location?
	TabManager.activeTab.findBestFit(); //Begins the recursive calls.
}
/* Recursively updates any Blocks that are currently executing.  Stops the update timer if all Blocks are finished.
 */
CodeManager.updateRun=function(){
	if(!TabManager.updateRun()){ //A recursive call.  Returns true if any Blocks are running.
		CodeManager.stopUpdateTimer(); //If no Blocks are running, stop the update timer.
	}
}
/* Recursively stops all Block execution.
 */
CodeManager.stop=function(){
	TabManager.stop(); //Recursive call.
	CodeManager.stopUpdateTimer(); //Stop the update timer.
}
/* Stops the update timer.
 */
CodeManager.stopUpdateTimer=function(){
	if(CodeManager.isRunning){ //If the timer is currently running...
		CodeManager.updateTimer = window.clearInterval(CodeManager.updateTimer); //...Stop the timer.
		CodeManager.isRunning=false;
	}
}
/* Starts the update timer.  When it fires, the timer will call the CodeManager.updateRun function.
 */
CodeManager.startUpdateTimer=function(){
	if(!CodeManager.isRunning){ //If the timer is not running...
		CodeManager.updateTimer = self.setInterval(function () { CodeManager.updateRun() }, CodeManager.updateInterval); //...Start the timer.
		CodeManager.isRunning=true;
	}
}
/* Recursively passes on the message that the flag button was tapped.
 * @fix method name.
 */
CodeManager.eventFlagClicked=function(){
	TabManager.eventFlagClicked();
}