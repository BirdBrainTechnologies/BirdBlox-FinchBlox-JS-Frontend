/* BlockStack is a class that holds a stack of Blocks.
 * BlockStacks move, execute, and snap the Blocks within them.
 * They pass messages onto their Blocks, which are passed on recursively.
 * Blocks are initially created outside a BlockStacks, but are immediately moved into one.
 * Empty BlockStacks are not allowed because each BlockStack must have a non-null firstBlock property.
 * @constructor
 * @param {firstBlock} Block - The first Block in the BlockStack.
 * The firstBlock is automatically moved along with subsequent Blocks into the BlockStack.
 * @param {Tab} tab - The tab the BlockStack lives within.
 */
function BlockStack(firstBlock,tab){
	tab.addStack(this); //The Tab maintains a list of all its BlockStacks.
	this.firstBlock=firstBlock;
	this.firstBlock.stop(); //Prevents execution.
	this.firstBlock.stopGlow(); //Removes visual indicator of execution.
	this.returnType=firstBlock.returnType; //The BlockStack returns the same type of value as its first Block.
	this.tab=tab;
	this.x=this.tab.absToRelX(firstBlock.getAbsX());
	this.y=this.tab.absToRelY(firstBlock.getAbsY());
	this.tabGroup=tab.mainG; //Stores the SVG group element of the Tab it is within.
	this.group=GuiElements.create.group(this.x,this.y,this.tabGroup); //Creates a group for the BlockStack.
	this.firstBlock.changeStack(this); //Moves all Blocks into the BlockStack.
	this.dim=function(){}; //Stores information about the snap bounding box of the BlockStack.
	//this.dim values will be assigned later.
	this.dim.cw=0; //Dimensions of regions command blocks can be attached to.
	this.dim.ch=0;
	this.dim.rw=0; //Dimensions of regions reporter/predicate blocks can be attached to.
	this.dim.rh=0;
	this.dim.cx1=0; //These will be measured relative to the Tab, not the BlockStack.
	this.dim.cy1=0;
	this.dim.rx1=0;
	this.dim.ry1=0;
	this.updateDim(); //Updates the this.dim values, the dimensions of the Blocks, and aligns them.
	this.isRunning=false;
	this.currentBlock=null; //Keeps track of which Block in the BlockStack is currently executing.
	this.isDisplayStack=false;
	this.runningBroadcastMessage=""; //Keeps track of if this stack's execution was started by a broadcast.
	this.move(this.x,this.y);
	this.flying=false; //BlockStacks being moved enter flying mode so they are above other BlockStacks and Tabs.
}
/* Recursively updates the this.dim values, the dimensions of the Blocks, and and the Blocks' alignment.
 */
BlockStack.prototype.updateDim=function() {
	this.firstBlock.updateDim(); //Recursively updates the dimensions of the Blocks.
	//The first Block is aligned to the top-left corner of the BlockStack.
	this.firstBlock.updateAlign(0,0); //Blocks recursively aligned.
	this.dim.cx1=0; //Clear existing values from bounding boxes.
	this.dim.cy1=0; //During updateStackDim, these values are measured relative to the BlockStack.
	this.dim.cx2=0;
	this.dim.cy2=0;
	this.dim.rx1=0;
	this.dim.ry1=0;
	this.dim.rx2=0;
	this.dim.ry2=0;
	//Recursively each box updates the this.dim boxes to include their own bounding boxes.
	this.firstBlock.updateStackDim();
	//Dimensions of both types of boxes are calculated.
	this.dim.cw=this.dim.cx2-this.dim.cx1;
	this.dim.ch=this.dim.cy2-this.dim.cy1;
	this.dim.rw=this.dim.rx2-this.dim.rx1;
	this.dim.rh=this.dim.ry2-this.dim.ry1;
};
/* Converts a coordinate relative to the inside of the stack to one relative to the screen.
 * @param {number} x - The coord relative to the inside fo the stack.
 * @return {number} - The coord relative to the screen.
 */
BlockStack.prototype.relToAbsX=function(x){
	if(this.flying){
		return x+this.x; //Not in a Tab; return just the x.
	}
	else{
		return x+this.x+this.tab.getAbsX(); //In a Tab; return x plus Tab's offset.
	}
};
BlockStack.prototype.relToAbsY=function(y){
	if(this.flying){
		return y+this.y; //Not in a Tab; return just the y.
	}
	else{
		return y+this.y+this.tab.getAbsY(); //In a Tab; return y plus Tab's offset.
	}
};
/* Converts a coordinate relative to the screen to one relative to the inside of the stack.
 * @param {number} x - The coord relative to the screen.
 * @return {number} - The coord relative to the inside fo the stack.
 */
BlockStack.prototype.absToRelX=function(x){
	if(this.flying){
		return x-this.x; //Not in a Tab; return just the x.
	}
	else{
		return x-this.x-this.tab.getAbsX(); //In a Tab; return x minus Tab's offset.
	}
};
BlockStack.prototype.absToRelY=function(y){
	if(this.flying){
		return y-this.y; //Not in a Tab; return just the y.
	}
	else{
		return y-this.y-this.tab.getAbsY(); //In a Tab; return y minus Tab's offset.
	}
};
/* Returns the x coord of the BlockStack relative to the screen.
 * @return The x coord of the BlockStack relative to the screen.
 */
BlockStack.prototype.getAbsX=function(){
	return this.relToAbsX(0);
};
/* Returns the y coord of the BlockStack relative to the screen.
 * @return The y coord of the BlockStack relative to the screen.
 */
BlockStack.prototype.getAbsY=function(){
	return this.relToAbsY(0);
};
/* Searches the Blocks within this BlockStack to find one which fits the moving BlockStack.
 * Returns no values but stores results on CodeManager.fit.
 */
BlockStack.prototype.findBestFit=function(){
	//Not implemented, check top of block
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	if(move.stack===this){ //If this BlockStack is the one being moved, it can't attach to itself.
		return;
	}
	//Check if the moving BlockStack can attah to the top of this BlockStack.
	if(move.bottomOpen&&this.firstBlock.topOpen){
		this.findBestFitTop();
	}
	//Recursively check if the moving BlockStack can attach to the bottom of any Blocks in this BlockStack.
	if(move.topOpen){
		//Only check recursively if the corner of the moving BlockStack falls within this BlockStack's snap box.
		var absCx=this.relToAbsX(this.dim.cx1);
		var absCy=this.relToAbsY(this.dim.cy1);
		if(move.pInRange(move.topX,move.topY,absCx,absCy,this.dim.cw,this.dim.ch)){
			this.firstBlock.findBestFit();
		}
	}
	//Recursively check recursively if the moving BlockStack can attach one of this BlockStack's Slots.
	if(move.returnsValue){
		//Only check if the BlockStack's bounding box overlaps with this BlockStack's bounding box.
		var absRx=this.relToAbsX(this.dim.rx1);
		var absRy=this.relToAbsY(this.dim.ry1);
		if(move.rInRange(move.topX,move.topY,move.width,move.height,absRx,absRy,this.dim.rw,this.dim.rh)){
			this.firstBlock.findBestFit();
		}
	}
};
/* Moves this BlockStack to a new location relative to the Tab. Updates this.x and this.y accordingly.
 * @param {number} x - the x coord to move to.
 * @param {number} y - the y coord to move to.
 */
BlockStack.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y);
};
/* Moves the BlockStack to a certain location on the screen.
 * @param {number} x - The x coord relative to the screen where the BlockStack should move.
 * @param {number} y - The y coord relative to the screen where the BlockStack should move.
 */
BlockStack.prototype.moveAbs=function(x,y){
	var relX=this.absToRelX(x);
	var relY=this.absToRelY(y);
	this.move(relX,relY);
};
/* Recursively stops the execution of the BlockStack and its contents. Removes the glow as well.
 */
BlockStack.prototype.stop=function(){
	if(this.isRunning){
		this.firstBlock.stop();
		this.endRun(); //Removes glow and sets isRunning.
	}
};
/* Updates the execution of the BlockStack and its contents. Returns boolean to indicate if still running.
 * @return {boolean} - Indicates if the BlockStack is currently running and still requires updating.
 */
BlockStack.prototype.updateRun=function(){
	if(this.isRunning){
		//Different procedures are used if the Block returns a value.
		if(this.returnType==Block.returnTypes.none){
			if(this.currentBlock.stack!=this){ //If the current Block has been removed, don't run it.
				this.endRun(); //Stop execution.
				return this.isRunning;
			}
			//Update the current Block. If it is done running, then next time update the next Block.
			if(!this.currentBlock.updateRun()){
				this.currentBlock=this.currentBlock.nextBlock;
			}
			//If the end of the BlockStack has been reached, end execution.
			if(this.currentBlock==null){
				this.endRun();
			}
		}
		else{ //Procedure for Blocks that return a value.
			if(!this.currentBlock.updateRun()){
				//When it is done running, display the result.
				var value=this.currentBlock.getResultData().asString().getValue();
				var x=this.currentBlock.getAbsX();
				var y=this.currentBlock.getAbsY();
				var width=this.currentBlock.width;
				var height=this.currentBlock.height;
				GuiElements.displayValue(value,x,y,width,height);
				this.endRun(); //Execution is done.
			}
		}
	}
	return this.isRunning;
};
/* Starts execution of the BlockStack starting with the specified Block. Makes BlockStack glow, too.
 * @param {Block} startBlock - (optional) The first Block to execute. By default, this.firstBlock is used.
 */
BlockStack.prototype.startRun=function(startBlock,broadcastMessage){
	if(startBlock==null){
		startBlock=this.firstBlock; //Set parameter to default.
	}
	if(broadcastMessage==null){
		broadcastMessage="";
	}
	this.runningBroadcastMessage=broadcastMessage;
	if(!this.isRunning){ //Only start if not already running.
		this.isRunning=true;
		this.currentBlock=startBlock;
		this.firstBlock.glow();
		this.tab.startRun(); //Starts Tab if it is not already running.
	}
};
/* Ends execution and removes glow. Does not call stop() function on Blocks; assumes they have stopped already.
 */
BlockStack.prototype.endRun=function(){
	this.isRunning=false;
	this.firstBlock.stopGlow();
};
/* Checks if the moving BlockStack can snap on to the top of this BlockStack. Returns nothing.
 * Results are stored in CodeManager.fit.
 * Only called if moving BlockStack returns no value.
 */
BlockStack.prototype.findBestFitTop=function(){
	var snap=BlockGraphics.command.snap; //Get snap bounding box for command Blocks.
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.firstBlock.getAbsX(); //Uses screen coordinates.
	var y=this.firstBlock.getAbsY();
	/* Now the BlockStack will check if the bottom-left corner of the moving BlockStack falls within
	 * the snap bounding box of the first Block in the BlockStack. */
	//Gets the bottom-left corner of the moving BlockStack.
	var moveBottomLeftX=move.topX;
	var moveBottomLeftY=move.topY+move.height;
	//Gets the snap bounding box of the first Block.
	var snapBLeft=x-snap.left;
	var snapBTop=y-snap.top;
	var snapBWidth=snap.left+snap.right;
	var snapBHeight=snap.top+this.firstBlock.height+snap.bottom;
	//Checks if the point falls in the box.
	if(move.pInRange(moveBottomLeftX,moveBottomLeftY,snapBLeft,snapBTop,snapBWidth,snapBHeight)){
		var xDist=move.topX-x;
		var yDist=(move.topY+move.height)-y;
		var dist=xDist*xDist+yDist*yDist; //Computes the distance.
		if(!fit.found||dist<fit.dist){ //Compares it to existing fit.
			fit.found=true;
			fit.bestFit=this; //Note that in this case the bestFit is set to a BlockStack, not a Block.
			fit.dist=dist; //Saves the fit.
		}
	}
};
/* Recursively attaches the provided Block and its subsequent Blocks to the top of this BlockStack.
 * @param {Block} block - The Block to attach to this BlockStack.
 * @fix - Remove redundant code.
 */
BlockStack.prototype.snap=function(block){ //Fix! remove redundant code.
	if(this.isRunning&&!block.stack.isRunning){ //Fix! documentation
		block.glow();
	}
	else if(!this.isRunning&&block.stack.isRunning){ //Blocks that are added are stopped.
		block.stack.stop();
	}
	else if(this.isRunning&&block.isRunning){ //The added block is stopped, but still glows as part of a running stack.
		block.stop();
	}
	/* Move this BlockStack up by the height of the of the stack the Block belongs to.
	 * This compensates for the amount existing Blocks will be shifted down by the newly-added Blocks. */
	this.move(this.x,this.y-block.stack.dim.rh); //Fix! this.dim clarification
	var topStackBlock=block; //There is a new top Block.
	var bottomStackBlock=block.getLastBlock(); //The last Block in the stack being added.
	var upperBlock=this.firstBlock; //The topmost of the existing Blocks.
	//Fix references between Blocks to glue them together.
	this.firstBlock=topStackBlock;
	topStackBlock.parent=null;
	bottomStackBlock.nextBlock=upperBlock;
	upperBlock.parent=bottomStackBlock;
	//The old BlockStack can now be destroyed.
	var oldG=block.stack.group;
	block.stack.remove();
	block.changeStack(this);
	oldG.remove();
	
	this.updateDim();
};
/* Adds an indicator showing that the moving BlockStack will snap onto the top of this BlockStack if released.
 */
BlockStack.prototype.highlight=function(){
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),0,0,0,false,this.isRunning);
};
/* Shifts this BlockStack by the specified amount.
 * @param {number} x - The amount to shift in the x direction.
 * @param {number} y - The amount to shift in the y direction.
 */
BlockStack.prototype.shiftOver=function(x,y){
	this.move(this.x+x,this.y+y);
};
/* Recursively copies this BlockStack and all its contents to a new BlockStack. Returns the new BlcokStack.
 * @return {BlockStack} - The newly-copied BlockStack.
 */
BlockStack.prototype.duplicate=function(x,y,group){
	//First duplicate the Blocks.
	var firstCopyBlock=this.firstBlock.duplicate(x,y);
	//Then put them in a new BlockStack.
	return new BlockStack(firstCopyBlock,this.tab);
};
/* Returns the Tab this BlockStack belongs to. Used by the Blocks it contains when they need to kow their tab.
 * @return {Tab} - The Tab this BlockStack belongs to.
 */
BlockStack.prototype.getTab=function(){
	return this.tab;
};
/* Returns the Sprite this BlockStack and its Blocks are associated with. Called by this BlockStack's Blocks.
 * Used in Block implementations.
 * @return {Sprite} - The Sprite this BlockStack and its Blocks are associated with.
 */
BlockStack.prototype.getSprite=function(){
	return this.tab.getSprite();
};
/* Moves this BlockStack out of the Tab's group and into the drag layer about other Blocks.
 */
BlockStack.prototype.fly=function(){
	this.group.remove(); //Remove group from Tab (visually only).
	GuiElements.layers.drag.appendChild(this.group); //Add group to drag layer.
	var absX=this.getAbsX(); //Get current location on screen.
	var absY=this.getAbsY();
	this.flying=true; //Record that this BlockStack is flying.
	//Move to ensure that position on screen does not change.
	this.move(absX,absY);
};
/* Moves this BlockStack back into its Tab's group.
 */
BlockStack.prototype.land=function(){
	this.group.remove(); //Remove from drag layer.
	this.tabGroup.appendChild(this.group); //Go back into tab group.
	var absX=this.getAbsX(); //Get current location on screen.
	var absY=this.getAbsY();
	this.flying=false;
	//Move to ensure that position on screen does not change.
	this.move(this.tab.absToRelX(absX),this.tab.absToRelY(absY));
};
/* Removes the stack from the Tab's list.
 */
BlockStack.prototype.remove=function(){
	this.tab.removeStack(this);
};
/* Stops execution and removes the BlockStack digitally and visually.
 */
BlockStack.prototype.delete=function(){
	this.stop();
	this.group.remove();
	this.remove(); //Remove from Tab's list.
};
/* Passes message to first Block in BlockStack that the flag was tapped.
 */
BlockStack.prototype.eventFlagClicked=function(){
	if(!this.isRunning){ //Only pass message if not already running.
		this.firstBlock.eventFlagClicked();
	}
};
/* Passes broadcast message to first Block in BlockStack.
 */
BlockStack.prototype.eventBroadcast=function(message){
	this.firstBlock.eventBroadcast(message);
};
/* Checks if a broadcast is still running for the broadcast and wait Block.
 */
BlockStack.prototype.checkBroadcastRunning=function(message){
	if(this.isRunning){
		return this.runningBroadcastMessage==message;
	}
	return false;
};
/* Recursively checks if a given message is still in use by any of the DropSlots.
 */
BlockStack.prototype.checkBroadcastMessageAvailable=function(message){
	return this.firstBlock.checkBroadcastMessageAvailable(message);
};
/* Recursively updates the available broadcast messages.
 */
BlockStack.prototype.updateAvailableMessages=function(){
	this.firstBlock.updateAvailableMessages();
};
/* Recursively returns the last Block in the BlockStack.
 * @return {Block} - The last Block in the BlockStack.
 */
BlockStack.prototype.getLastBlock=function(){
	return this.firstBlock.getLastBlock();
};
/*

 */
BlockStack.prototype.updateTabDim=function(){
	var dim=this.tab.dim;
	if(dim.x1==null||this.x<dim.x1){
		dim.x1=this.x;
	}
	if(dim.y1==null||this.y<dim.y1){
		dim.y1=this.y;
	}
	var x2=this.x+this.dim.rw;
	if(dim.x2==null||x2>dim.x2){
		dim.x2=x2;
	}
	var y2=this.y+this.dim.rh;
	if(dim.y2==null||y2>dim.y2){
		dim.y2=y2;
	}
};
/* @fix Write documentation. */
BlockStack.prototype.createXml=function(xmlDoc){
	var stack=XmlWriter.createElement(xmlDoc,"stack");
	XmlWriter.setAttribute(stack,"x",this.x);
	XmlWriter.setAttribute(stack,"y",this.y);
	var blocks=XmlWriter.createElement(xmlDoc,"blocks");
	this.firstBlock.writeToXml(xmlDoc,blocks);
	stack.appendChild(blocks);
	return stack;
};
/* @fix Write documentation. */
BlockStack.importXml=function(stackNode,tab){
	var x=XmlWriter.getAttribute(stackNode,"x",0,true);
	var y=XmlWriter.getAttribute(stackNode,"y",0,true);
	var blocksNode=XmlWriter.findSubElement(stackNode,"blocks");
	var blockNodes=XmlWriter.findSubElements(blocksNode,"block");
	if(blockNodes.length>0){
		var firstBlock=null;
		var i=0;
		while(firstBlock==null&&i<blockNodes.length){
			firstBlock=Block.importXml(blockNodes[i]);
			i++;
		}
		if(firstBlock==null){
			return null;
		}
		var stack=new BlockStack(firstBlock,tab);
		stack.move(x,y);
		var previousBlock=firstBlock;
		while(i<blockNodes.length) {
			var newBlock = Block.importXml(blockNodes[i]);
			if (newBlock != null) {
				previousBlock.snap(newBlock);
				previousBlock = newBlock;
			}
			i++;
		}
		stack.updateDim();
	}
	else{
		return null;
	}
};