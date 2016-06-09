/* Block is an abstract class that represents an executable block.  Blocks are nearly always contained within BlockStacks or DisplayStacks.
 * Blocks are initially created outside a BlockStacks, but are immediately moved into one.  This is because BlockStacks must always contain at least one Block, so the Block must be created first.
 * @constructor
 * @fix remove the type parameter and use blockShape and instead.
 * @param {number} type - The shape of the Block.  0=Command, 1=Reporter, 2=Predicate, 4=Hat, 5=Loop, 6=DoubleLoop.
 * @param {number} returnType - The type of data the Block returns.  Possible values stored in Block.returnTypes.
 * @param {number} x - The x coord of the Block (relative to the Tab/BlockStack/DisplayStack it is in).
 * @param {number} y - The y coord of the Block.
 * @param {string} category - The Block's category in string form.
 */
function Block(type,returnType,x,y,category){ //Type: 0=Command, 1=Reporter, 2=Predicate Fix! BG
	this.x=x; //Store coords
	this.y=y;
	this.type=type; //Fix! remove this property
	this.bottomOpen=(type==0||type==4||type==5||type==6); //Can Blocks be attached to the bottom of this Block?
	this.topOpen=(type==0||type==5||type==6); //Can Blocks be attached to the top of this Block?
	this.returnsValue=(returnType!=Block.returnTypes.none); //Does this Block attack to Slots and return a value?
	this.returnType=returnType; //What type of value does this Block return?
	this.hasBlockSlot1=(type==5||type==6); //Is this Block like an if block that has a special BlockSlot?
	this.hasBlockSlot2=(type==6); //Does it have two BlockSlots?
	this.hasHat=(type==4); //Is it a HatBlock?
	
	this.group=GuiElements.create.group(x,y); //Make a group to contain the part of this Block.
	this.parent=null; //A Block's parent is the Block/Slot/BlockSlot that it is attached to.  Currently, it has none.
	this.parts=new Array(); //The parts of a Block include its LabelText, BlockIcons, and Slots.
	this.slots=new Array(); //The slots array just holds the Slots.
	this.running=0; //Running: 0=Not started, 1=Waiting for slots to finish, 2=Running, 3=Completed.
	this.category=category;
	
	this.stack=null; //It has no Stack yet.
	this.path=this.generatePath(); //This path is the main visual part of the Block.  It is colored according to its category.
	this.height=0; //Will be set later when the Block's dimensions are updated.
	this.width=0;
	this.runMem=function(){}; //serves as a place for the block to store info while running
	if(this.bottomOpen){
		this.nextBlock=null; //Reference to the Block below this one.
	}
	if(this.returnsValue){
		this.resultData=null; //Stores the Data to be passed on to the Slot containing this Block.
	}
	if(this.hasBlockSlot1){
		this.topHeight=0; //The height of just the top of the Block (where the LabelText and Slots are)
		this.blockSlot1=new BlockSlot(this);
	}
	if(this.hasBlockSlot2){
		this.midHeight=0; //The height of the middle part of a DoubleLoopBlock (where the LabelText "else" is on the if/else Block)
		this.midLabel=new LabelText(this,this.midLabelText); //The text to appear in the middle section (i.e. "else");
		this.blockSlot2=new BlockSlot(this);
	}
}
/* Sets the possible values for Block.returnTypes.
 */
Block.setConstants=function(){
	Block.returnTypes=function(){};
	Block.returnTypes.none=0; //A command Block always is Block.returnTypes.none.
	Block.returnTypes.num=1;
	Block.returnTypes.string=2;
	Block.returnTypes.bool=3;
	Block.returnTypes.list=4;
}
/* Returns the x coord of the Block relative to the screen (not the group it is contained in).
 * @return {number} - The x coord of the Block relative to the screen.
 */
Block.prototype.getAbsX=function(){
	if(this.stack!=null){
		return this.x+this.stack.getAbsX();
	}
	else{
		return this.x;
	}
}
/* Returns the y coord of the Block relative to the screen.
 * @return {number} - The y coord of the Block relative to the screen.
 */
Block.prototype.getAbsY=function(){
	if(this.stack!=null){
		return this.y+this.stack.getAbsY();
	}
	else{
		return this.y;
	}
}
/* Creates and returns the main SVG path element for the Block.
 * @return {SVG path} - The main SVG path element for the Block.
 */
Block.prototype.generatePath=function(){
	var pathE=BlockGraphics.create.block(this.category,this.group,this.returnsValue);
	TouchReceiver.addListenersChild(pathE,this);
	return pathE;
}
/* Adds a part (LabelText, BlockIcon, or Slot) to the Block.
 * @param {LabelText/BlockIcon/Slot} part - part to add.
 */
Block.prototype.addPart=function(part){
	this.parts.push(part);
	if(part.isSlot){ //Slots are kept track of separately for recursive calls.
		this.slots.push(part);
	}
}
/* Moves the Block and sets its this.x and this.y values.
 * @param {number} x - New x coord.
 * @param {number} y - New y coord.
 */
Block.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y); //All parts of the Block are contained within its group to allow for easy movement.
}
/* Recursively stops the Block, its Slots, and any subsequent Blocks.
 */
Block.prototype.stop=function(){
	this.running=0; //Stop this Block.
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].stop(); //Stop this Block's Slots.
	}
	if(this.blockSlot1!=null){
		this.blockSlot1.stop(); //Stop the BlockSlots.
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.stop();
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		this.nextBlock.stop(); //Stop the next Block.
	}
}
/* Updates this currently executing Block and returns either the next Block to execute or its current execution state depending on the type of Block.
 * @return {Block/boolean} - If this Block returns no value, it returns the next Block to run.  Otherwise, it returns boolean indicating if it has finished generating a value to return.
 * @fix make the return type more consistent.  Maybe always a boolean.
 * @fix make the value true mean that it is still running, rather than the other way around. (To make it match Tabs and BlockStacks).
 */
Block.prototype.updateRun=function(){
	if(this.running==0||this.running==3){ //If a Block is told to run and it has not started or believes it is finished (from a previous execution)...
		for(var i=0;i<this.slots.length;i++){ //...Reset all Slots to prepare for execution.
			this.slots[i].stop();
		}
		this.running=1; //Now the Block is ready to run its Slots.
	}
	var rVal; //The value to return.
	if(this.running==1){ //If the Block is currently waiting on its Slots...
		for(var i=0;i<this.slots.length;i++){
			if(!this.slots[i].updateRun()){ //Check to see if each Slot is done and update the first Slot that isn't done.
				if(!this.returnsValue){ //If a slot required updating, this block needs to be run again next time.
					return this; //If this Slot does not return a value, it is expected to return the next Block to run, which is itself.
				}
				else{
					return false; //If this Slot does return a value, it is expected to return a boolean indicating if it has completed its execution.
				}
			}
		}
		this.running=2; //If all Slots are done running, the Block itself may now run.
		rVal = this.startAction(); //This function is overrided by the class of the particular Block. It sets the Block up for execution, and if it is a simple Block, may even complete execution.
	}
	else if(this.running==2){ //If the Block is currently running, update it.
		rVal = this.updateAction(); //This function is also overrided and is called repeatedly until the Block is done running.
	}
	var rT=Block.returnTypes;
	if((!this.returnsValue&&rVal!=this)||(this.returnsValue&&rVal==true)){ //If the block is done running...
		this.running=3; //Record that the Block is done.
		this.clearMem(); //Clear its runMem to prevent its computations from leaking into subsequent executions.
	}
	return rVal; //Return either the next Block to run or a boolean indicating if this Block is done.
}
/* Will be overrided. Is triggered once when the Block is first executed. Contains the Block's actual behavior.
 * @return {Block/boolean} - The next Block to run or a boolean indicating if it has finished.
 */
Block.prototype.startAction=function(){
	if(this.returnsValue){
		return false;
	}
	return this;
}
/* Will be overrided. Is triggered repeatedly until the Block is done running. Contains the Block's actual behavior.
 * @return {Block/boolean} - The next Block to run or a boolean indicating if it has finished.
 */
Block.prototype.updateAction=function(){
	if(this.returnsValue){
		return false;
	}
	return this;
}
/* Once the Block is done executing, this function is used by a Slot to retrieve the Block's result.
 * Only used if Block returns a value.
 * Once the Block returns its value, it is done and can reset its state.
 * @return {Data} - The result of the Block's execution.
 */
Block.prototype.getResultData=function(){
	if(this.running==3){ //Only return data if the Block is done running.
		this.running=0; //Reset the Block's state. Prevents same data from ever being re-returned
		return this.resultData; //Access stored result data and return it.
	}
	return null; //If called when the block is not done running, return null. This should never happen.
}
/* Recursively moves the Block, its Slots, and subsequent Blocks to another stack.
 * @param {BlockStack} stack - The stack the Blocks will be moved to.
 */
Block.prototype.changeStack=function(stack){
	this.stack=stack; //Move this Block to the stack
	this.group.remove(); //Remove this Block's SVG group from that of the old stack.
	stack.group.appendChild(this.group); //Add this Block's SVG group to the new stack.
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].changeStack(stack); //Recursively tell this Block's Slots to move thir children to the new stack.
	}
	if(this.nextBlock!=null){
		this.nextBlock.changeStack(stack); //Tell the next block to move.
	}
	if(this.blockSlot1!=null){
		this.blockSlot1.changeStack(stack); //If this block is a loop/if tell its contents to move.
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.changeStack(stack); //If it has a second BlockSlot, move it too.
	}
}
/* Each BlockStack keeps track of its bounding rectangle.  This function recursively tells the Blocks to update it.
 * Each Block checks to see if it is outside the proposed bounding rectangle and if so adjusts it.
 * This function just handles the recursive part. The actual checks and adjustment are handled by updateStackDimO
 */
Block.prototype.updateStackDim=function(){
	//Slots are updated separately by updateStackDimRI.
	if(this.blockSlot1!=null){
		this.blockSlot1.updateStackDim(); //If this block is a loop/if tell its contents to update.
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.updateStackDim(); //If it has a second BlockSlot, update it too.
	}
	this.updateStackDimRI(); //Update the stack dimensions using information from this Block.
	if(this.nextBlock!=null){
		this.nextBlock.updateStackDim(); //Tell the next block to update.
	}
}
/* Handles more of the recursion for updateStackDim.
 * RI stands for Recursive Inside.  RI functions update slots but not subsequent Blocks or BlockSlots.
 * This allows other functions to avoid unnecessary updates when full recursion is not needed.
 * updateStackDimO handled the actual updates.
 */
Block.prototype.updateStackDimRI=function(){
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].updateStackDim(); //Pass message on to Slots.
	}
	this.updateStackDimO(); //Update this Block.
}
/* Checks to see if the Block is outside the bounding box of its Stack and if so adjusts it.
 * It is called recursively by updateStackDim and updateStackDimRI.
 * The stack has two bounding boxes. Both are used when looking for potential Blocks to snap to.
 * Reporters/predicates can snap to the large r bounding box.
 * Commands can snap to the smaller c bounding box.
 * (the r box is larger because they can be snapped to the middle of other blocks while command blocks can't)
 * The point of stack bounding boxes is that when looking for potential Blocks to snap only those inside a matching
 * stack have to be investigated.
 */
Block.prototype.updateStackDimO=function(){
	var sDim=this.stack.dim; //Loads the stack's dimension data.
	var snap=BlockGraphics.command.snap; //Loads the snap bounding box for command blocks.
	if(this.bottomOpen||this.topOpen){ //Only update the c box if this is a command block //Fix! use !this.returnsValue
		var cx1=this.x-snap.left; //Create bounding rectangle for this particular command Block
		var cy1=this.y-snap.top;
		var cx2=this.x+snap.right;
		var cy2=this.y+this.height+snap.bottom;
		if(cx1<sDim.cx1){ //If the edge of the Block is outside the stack, adjust the stack's dims.
			sDim.cx1=cx1;
		}
		if(cy1<sDim.cy1){
			sDim.cy1=cy1;
		}
		if(cx2>sDim.cx2){
			sDim.cx2=cx2;
		}
		if(cy2>sDim.cy2){
			sDim.cy2=cy2;
		}
	}
	var rx1=this.x; //The r bounding box is just the size of the Block itself.
	var ry1=this.y;
	var rx2=this.x+this.width;
	var ry2=this.y+this.height;
	if(rx1<sDim.rx1){ //If the edge of the Block is outside the stack, adjust the stack's dims.
		sDim.rx1=rx1;
	}
	if(ry1<sDim.ry1){
		sDim.ry1=ry1;
	}
	if(rx2>sDim.rx2){
		sDim.rx2=rx2;
	}
	if(ry2>sDim.ry2){
		sDim.ry2=ry2;
	}
	//The Stacks dimensions now include the Block.
	//Note that the r box is also the visual bounding box of the stack as well as the reporter snap bounding box.
}
/* Recursively adjusts the sizes of all the parts of the Block (Slots, children, labels, etc.)
 * It does not move the parts, however.  That is done later using updateAlign once the sizing is finished.
 */
Block.prototype.updateDim=function(){
	var bG=BlockGraphics.getType(this.type); //Fix! loads dimension data from BlockGraphics.
	if(this.topOpen||this.bottomOpen){ //If this is a command block, then use the BlockGraphics for command blocks.
		var bG=BlockGraphics.command; //If the block if a Loop or DoubleLoop, use the CommandBlock dimension instead.
	}
	var width=0;
	width+=bG.hMargin; //The left margin of the Block.
	var height=0;
	for(var i=0;i<this.parts.length;i++){
		this.parts[i].updateDim(); //Tell all parts of the Block to update before using their widths for calculations.
		width+=this.parts[i].width; //Fill the width of the middle of the Block
		if(this.parts[i].height>height){ //The height of the Block is the height of the tallest member.
			height=this.parts[i].height;
		}
		if(i<this.parts.length-1){
			width+=bG.pMargin; //Add "part margin" between parts of the Block.
		}
	}
	width+=bG.hMargin; //Add the right margin of the Block.
	height+=2*bG.vMargin; //Add the bottom and top margins of the Block.
	if(height<bG.height){ //If the height is less than the min height, fix it.
		height=bG.height;
	}
	if(this.hasBlockSlot1){ //If it has a BlockSlot update that.
		this.topHeight=height; //The topHeight is the height of everything avove the BlockSlot.
		this.blockSlot1.updateDim(); //Update the BlockSlot.
		height+=this.blockSlot1.height; //The total height, however, includes the BlockSlot.
		height+=BlockGraphics.loop.bottomH; //It also includes the bottom part of the loop.
	}
	if(this.hasBlockSlot2){ //If the Block has a second BlockSlot...
		this.midLabel.updateDim(); //Update the label in between the two BlockSlots.
		this.midHeight=this.midLabel.height; //Add the Label's height to the total.
		this.midHeight+=2*bG.vMargin; //The height between the BlockSlots also includes the margin of that area.
		if(this.midHeight<bG.height){ //If it's less than the minimum, adjust it.
			this.midHeight=bG.height;
		}
		height+=this.midHeight; //Add the midHeight to the total.
		this.blockSlot2.updateDim(); //Update the secodn BlockSlot.
		height+=this.blockSlot2.height; //Add its height to the total.
	}
	//If the Block was a loop or DoubleLoop now we are dealing with its actual properties (not those of command)
	bG=BlockGraphics.getType(this.type);
	if(width<bG.width){ //If it is less than the minimum width, adjust it.
		width=bG.width;
	}
	this.resize(width,height); //Resize this Block to the new widths.
	if(this.nextBlock!=null){
		this.nextBlock.updateDim(); //Pass the message to the next Block.
	}
}
Block.prototype.updateAlign=function(x,y){
	this.updateAlignRI(x,y);
	if(this.hasBlockSlot1){
		this.blockSlot1.updateAlign(this.x+BlockGraphics.loop.side,this.y+this.topHeight);
	}
	if(this.hasBlockSlot2){
		this.blockSlot2.updateAlign(this.x+BlockGraphics.loop.side,this.y+this.topHeight+this.blockSlot1.height+this.midHeight);
		this.midLabel.updateAlign(BlockGraphics.loop.side,this.topHeight+this.blockSlot1.height+this.midHeight/2);
	}
	if(this.nextBlock!=null){
		this.nextBlock.updateAlign(this.x,this.y+this.height);
	}
	return this.width;
}
Block.prototype.updateAlignRI=function(x,y){
	this.move(x,y);
	var bG=BlockGraphics.getType(this.type);
	var yCoord=this.height/2;
	var xCoord=0;
	if(this.hasBlockSlot1){
		yCoord=this.topHeight/2;
	}
	if(this.bottomOpen||this.topOpen){
		bG=BlockGraphics.command;
	}
	xCoord+=bG.hMargin;
	for(var i=0;i<this.parts.length;i++){
		xCoord+=this.parts[i].updateAlign(xCoord,yCoord);
		if(i<this.parts.length-1){
			xCoord+=bG.pMargin;
		}
	}
}
/*Block.prototype.updateAlignO=function(x,y){
	if(this.type==0){
		this.move(x,y);
		//alert(y+"n: "+this.name);
	}
	else{
		this.move(x,y);
	}
}*/
Block.prototype.resize=function(width,height){
	this.width=width;
	this.height=height;
	var innerHeight1=0;
	var innerHeight2=0;
	var midHeight=0;
	if(this.hasBlockSlot1){
		innerHeight1=this.blockSlot1.height;
	}
	if(this.hasBlockSlot2){
		innerHeight2=this.blockSlot2.height;
		midHeight=this.midHeight;
	}
	BlockGraphics.update.path(this.path,0,0,width,height,this.type,false,innerHeight1,innerHeight2,midHeight);
}
Block.prototype.findBestFit=function(){
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.getAbsX();
	var y=this.getAbsY();
	if(move.topOpen&&this.bottomOpen){
		var snap=BlockGraphics.command.snap;
		if(move.pInRange(move.topX,move.topY,x-snap.left,y-snap.top,snap.left+snap.right,snap.top+this.height+snap.bottom)){
			var xDist=move.topX-x;
			var yDist=move.topY-(y+this.height);
			var dist=xDist*xDist+yDist*yDist;
			if(!fit.found||dist<fit.dist){
				fit.found=true;
				fit.bestFit=this;
				fit.dist=dist;
			}
		}
	}
	if(move.returnsValue){
		for(var i=0;i<this.slots.length;i++){
			this.slots[i].findBestFit();
		}
	}
	if(this.hasBlockSlot1){
		this.blockSlot1.findBestFit();
	}
	if(this.hasBlockSlot2){
		this.blockSlot2.findBestFit();
	}
	if(this.nextBlock!=null){
		this.nextBlock.findBestFit();
	}
}
Block.prototype.highlight=function(){
	if(this.bottomOpen){
		Highlighter.highlight(this.getAbsX(),this.getAbsY()+this.height,this.width,this.height,0,false);
	}
	else{
		alert("Error!");
	}
}
Block.prototype.snap=function(block){
	if(this.bottomOpen){
		var upperBlock=this;
		var lowerBlock=this.nextBlock;//might be null
		var topStackBlock=block;
		var bottomStackBlock=block.getLastBlock();
		
		upperBlock.nextBlock=topStackBlock;
		topStackBlock.parent=upperBlock;
		bottomStackBlock.nextBlock=lowerBlock;
		if(lowerBlock!=null){
			lowerBlock.parent=bottomStackBlock;
		}

		var oldG=block.stack.group;
		block.stack.remove();
		block.changeStack(this.stack);
		oldG.remove();
		this.stack.updateDim();
	}
	else{
		alert("Error!");
	}
}
Block.prototype.unsnap=function(){//FIX!
	if(this.parent!=null){
		if(this.parent.isSlot||this.parent.isBlockSlot){
			this.parent.removeChild();
			this.parent.parent.stack.updateDim();
		}
		else{
			this.parent.nextBlock=null;
			this.parent.stack.updateDim();
		}
		this.parent=null;
		return new BlockStack(this,this.stack.getTab());
	}
	//BlockGraphics.bringToFront(this.stack.group,GuiElements.layers.drag);
	return this.stack;
}
/*Block.prototype.addListeners=function(obj){
	obj.parent=this;
	obj.addEventListener('mousedown', function(e) {
		CodeManager.move.start(e,this.parent);
	}, false);
}*/
Block.prototype.getLastBlock=function(obj){
	if(this.nextBlock==null){
		return this;
	}
	else{
		return this.nextBlock.getLastBlock();
	}
}
Block.prototype.addHeights=function(){
	if(this.nextBlock!=null){
		return this.height+this.nextBlock.addHeights();
	}
	else{
		return this.height;
	}
}
/*Block.prototype.setReturnType=function(type){
	this.returnType=type;
}*/
Block.prototype.duplicate=function(x,y){
	var copiedClass=function(type,returnType,x1,y1,category){
		Block.call(this,type,returnType,x1,y1,category);
	}
	copiedClass.prototype = Object.create(this.constructor.prototype);
	copiedClass.prototype.constructor = copiedClass;
	
	
	var myCopy=new copiedClass(this.type,this.returnType,x,y,this.category);
	for(var i=0;i<this.parts.length;i++){
		myCopy.addPart(this.parts[i].duplicate(myCopy));
	}
	if(this.blockSlot1!=null){
		myCopy.blockSlot1=this.blockSlot1.duplicate(myCopy);
	}
	if(this.blockSlot2!=null){
		myCopy.blockSlot2=this.blockSlot2.duplicate(myCopy);
	}
	if(this.nextBlock!=null){
		myCopy.nextBlock=this.nextBlock.duplicate(0,0);
		myCopy.nextBlock.parent=myCopy;
	}
	return myCopy;
}
Block.prototype.textSummary=function(slotToExclude){
	var summary="";
	for(var i=0;i<this.parts.length;i++){
		if(this.parts[i]==slotToExclude){
			summary+="___";
		}
		else{
			summary+=this.parts[i].textSummary();
		}
		if(i<this.parts.length-1){
			summary+=" ";
		}
	}
	return summary;
}
Block.prototype.eventFlagClicked=function(){
	
}
Block.prototype.clearMem=function(){
	this.runMem=new function(){};
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].clearMem();
	}
}
Block.prototype.getResultData=function(){
	var result=this.resultData;
	this.resultData=null;
	return result;
}