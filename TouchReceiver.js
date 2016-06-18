/* TouchReceiver is a static class that handles all touch events.
 * It adds touch event handlers and keeps track of what types of objects are being touched/dragged.
 */
function TouchReceiver(){
	var TR=TouchReceiver; //shorthand
	//Toggle to determine of mouse or touchscreen events should be used.
	TR.mouse=false; //Use true when debugging on a desktop.
	TR.blocksMoving=false; //No BlockStacks are currently moving.
	TR.targetType="none"; //Stores the type of object being interacted with.
	TR.touchDown=false; //Is a finger currently on the screen?
	TR.target=null; //The object being interacted with.
	var handlerMove="touchmove"; //Handlers are different for touchscreens and mice.
	var handlerUp="touchend";
	var handlerDown="touchstart";
	if(TR.mouse){
		handlerMove="mousemove";
		handlerUp="mouseup";   
		handlerDown="mousedown";
	}
	TR.handlerMove=handlerMove;
	TR.handlerUp=handlerUp;
	TR.handlerDown=handlerDown;
	 //Add event handlers for handlerMove and handlerUp events to the whole document.
	TR.addListeners();
	//TR.test=true;
}
/* Adds event handlers for handlerMove and handlerUp events to the whole document.
 */
TouchReceiver.addListeners=function(){
	var TR=TouchReceiver;
	document.body.addEventListener(TR.handlerMove,TouchReceiver.handleMove,false);
	document.body.addEventListener(TR.handlerUp,TouchReceiver.handleUp,false); 
}
/* Handles movement events and prevents drag gestures from scrolling document.
 * @param {event} event - passed event arguments.
 * @fix combine with TouchReceiver.touchmove.
 */
TouchReceiver.handleMove=function(event){
	event.preventDefault(); //Prevent document scrolling.
	TouchReceiver.touchmove(event); //Deal with movement.
}
/* Handles new touch events.
 * @param {event} event - passed event arguments.
 * @fix combine with TouchReceiver.touchstart.
 */
TouchReceiver.handleUp=function(event){
	event.preventDefault();
	TouchReceiver.touchend(event);
}
/* Removes touch listeners from the document.  Not used anywhere.
 * @fix maybe delete this function.
 */
TouchReceiver.removeListeners=function(){
	document.body.removeEventListener(TR.handlerMove, TouchReceiver.handleMove);
	document.body.removeEventListener(TR.handlerMove, TouchReceiver.handleUp);
}
/* Returns the touch x coord from the event arguments
 * @param {event} event - passed event arguments.
 * @return {number} - x coord.
 */
TouchReceiver.getX=function(e){
	if(TouchReceiver.mouse){ //Depends on if a desktop or touchscreen is being used.
		return e.clientX;
	}
	return e.touches[0].pageX;
}
/* Returns the touch y coord from the event arguments
 * @param {event} event - passed event arguments.
 * @return {number} - y coord.
 */
TouchReceiver.getY=function(e){
	if(TouchReceiver.mouse){ //Depends on if a desktop or touchscreen is being used.
		return e.clientY;
	}
	return e.touches[0].pageY;
}
/* Handles new touch events.  Does not know which element was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchstart=function(e){
	var TR=TR; //shorthand
	e.preventDefault(); //Stops 300 ms delay events
	if(!TR.touchDown){ //prevents multitouch issues.
		TR.touchDown=true;
		TR.targetType="none"; //Does not know the target of the touch.
		TR.target=null;
	}
}
/* Handles new touch events for Blocks.  Stores the target Block.
 * @param {Blocks} target - The Block that was touched.
 * @param {event} e - passed event arguments.
 * @fix rename to touchStartBlock.
 */
TouchReceiver.touchStartBlock=function(target,e){
	var TR=TouchReceiver; //shorthand
	e.preventDefault(); //Stops 300 ms delay events
	if(!TR.touchDown){ //prevent multitouch issues.
		TR.touchDown=true;
		if(target.stack.isDisplayStack){ //Determine what type of stack the Block is a member of.
			TR.targetType="displayStack";
		}
		else{
			TR.targetType="block";
		}
		TouchReceiver.target=target; //Store target Block.
	}
}
/* Handles new touch events for Slots.  Stores the target Slot.
 * @param {Slot} slot - The Slot that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartSlot=function(slot,e){
	var TR=TouchReceiver;
	e.preventDefault(); //Stops 300 ms delay events
	if(!TR.touchDown){
		TR.touchDown=true;
		TR.targetType="slot";
		TouchReceiver.target=slot; //Store target Slot.
	}
}
/* Handles new touch events for CategoryBNs.  Stores the target CategoryBN.
 * @param {Category} target - The Category of the CategoryBN that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartCatBN=function(target,e){
	var TR=TouchReceiver;
	e.preventDefault(); //Stops 300 ms delay events
	if(!TR.touchDown){
		TR.touchDown=true;
		TR.targetType="category";
		target.select(); //Makes the button light up and the category become visible.
	}
};
/* Handles new touch events for Buttons.  Stores the target Button.
 * @param {Button} target - The Button that was touched.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartBN=function(target,e){
	var TR=TouchReceiver;
	e.preventDefault(); //Stops 300 ms delay events
	if(!TR.touchDown){
		TR.touchDown=true;
		TR.targetType="button";
		target.press(); //Changes the button's appearance and may trigger an action.
		TR.target=target;
	}
};
/* Handles new touch events for the backgund of the palette.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchStartPalette=function(e){
	var TR=TouchReceiver;
	e.preventDefault(); //Stops 300 ms delay events
	if(!TR.touchDown){
		TR.touchDown=true;
		TR.targetType="palette";
		TR.target=null; //The type is all that is important. There is only one palette.
	}
};
/* Handles touch movement events.  Tells stacks, Blocks, Buttons, etc. how to respond.
 * @param {event} e - passed event arguments.
 */
TouchReceiver.touchmove=function(e){
	var TR=TouchReceiver;
	if(TR.touchDown){
		//If the user drags a Slot, the block they are dragging should become the target.
		if(TR.targetType=="slot"){
			TR.target=TR.target.parent; //Now the user is dragging a block.
			if(TR.target.stack.isDisplayStack){
				TR.targetType="displayStack";
			}
			else{
				TR.targetType="block";
			}
		}
		/* If the user drags a Block that is in a DisplayStack, 
		the DisplayStack copies to a new BlockStack, which can be dragged. */
		if(TR.targetType=="displayStack"){
			var x=TR.target.stack.getAbsX(); //Determine where the copied BlockStack should go.
			var y=TR.target.stack.getAbsY();
			//The first block of the duplicated BlockStack is the new target.
			TR.target=TR.target.stack.duplicate(x,y).firstBlock;
			TR.targetType="block";
		}
		/* If the user drags a Block that is a member of a BlockStack, 
		then the BlockStack should move. */
		if(TR.targetType=="block"){
			//If the CodeManager has not started the movement, this must be done first.
			if(TR.blocksMoving){
				//The CodeManager handles moving BlockStacks.
				CodeManager.move.update(TR.getX(e),TR.getY(e));
			}
			else{
				CodeManager.move.start(TR.target,TR.getX(e),TR.getY(e));
				TR.blocksMoving=true;
			}
		}
		//If the user drags the palette, it should scroll.
		if(TR.targetType=="palette"){
			if(!BlockPalette.scrolling){
				BlockPalette.startScoll(TR.getX(e),TR.getY(e));
			}
			else{
				BlockPalette.updateScroll(TR.getX(e),TR.getY(e));
			}
		}
	}
};
/* Handles touch end events.  Tells stacks, Blocks, Buttons, etc. how to respond.
 * @param {event} e - passed event arguments.
 * @fix DateTime is no longer necessary to prevent repeat events.
 */
TouchReceiver.touchend=function(e){
	var TR=TouchReceiver;
	if(TR.touchDown){ //Prevents multitouch problems.
		TR.touchDown=false;
		if(TR.targetType=="block"){
			if(TR.blocksMoving){ //If a stack is moving, tell the CodeManager to end the movement.
				CodeManager.move.end();
				TR.blocksMoving=false;
			}
			else{ //The stack was tapped, so it should run.
				TR.target.stack.startRun();
			}
		}
		else if(TR.targetType=="button"){
			TR.target.release(); //Pass message on to button.
		}
		else if(TR.targetType=="slot"){
			//If a Slot is pressed and released without dragging, it is time to edit its value.
			TR.target.edit();
		}
		else if(TR.targetType=="palette"){
			BlockPalette.endScroll();
		}
	}
};
/* Called when a user's interaction with the screen should be interrupted due to a dialog, etc.
 * Blocks that are moving should stop moving, but actions should not be triggered.
 */
TouchReceiver.touchInterrupt=function(){
	var TR=TouchReceiver;
	if(TR.touchDown){ //Only interrupt if there is a finger on the screen.
		TR.touchDown=false;
		if(TR.targetType=="block"){
			if(TR.blocksMoving){ //If a stack is moving, tell the CodeManager to end the movement.
				CodeManager.move.interrupt();
				TR.blocksMoving=false;
			}
		}
		else if(TR.targetType=="button"){
			TR.target.interrupt(); //Remove the highlight without triggering the action.
		}
		else if(TR.targetType=="palette"){
			BlockPalette.endScroll();
		}
	}
};
/* Adds handlerDown listeners to the parts of a CategoryBN.
 * @param {SVG element} element - The part of the CategoryBN the listeners are being applied to.
 * @param {Category} category - The category of the CategoryBN.
 * @fix maybe rename this function.
 */
TouchReceiver.addListenersCat=function(element,category){
	var TR=TouchReceiver;
	element.category=category; //Teaches the SVG element to know what Category it belongs to.
	element.addEventListener(TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver its Category.
		TouchReceiver.touchStartCatBN(this.category,e);
	}, false);
};
/* Adds handlerDown listeners to the parts of a Block.
 * @param {SVG element} element - The part of the Block the listeners are being applied to.
 * @param {Block} parent - The Block the SVG element belongs to.
 * @fix maybe rename this function
 * @fix maybe use this.block rather than this.parent.
 */
TouchReceiver.addListenersChild=function(element,parent){
	var TR=TouchReceiver;
	element.parent=parent; //Teaches the SVG element to know what Block it belongs to.
	element.addEventListener(TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver its Block.
		TouchReceiver.touchStartBlock(this.parent,e);
	}, false);
};
/* Adds handlerDown listeners to the parts of a Slot.
 * @param {SVG element} element - The part of the Slot the listeners are being applied to.
 * @param {Slot} slot - The Slot the SVG element belongs to.
 */
TouchReceiver.addListenersSlot=function(element,slot){
	var TR=TouchReceiver;
	element.slot=slot; //Teaches the SVG element to know what Slot it belongs to.
	element.addEventListener(TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver its Slot.
		TouchReceiver.touchStartSlot(this.slot,e);
	}, false);
};
/* Adds handlerDown listeners to the parts of a Button.
 * @param {SVG element} element - The part of the Button the listeners are being applied to.
 * @param {Button} parent - The Button the SVG element belongs to.
 * @fix maybe use this.button rather than this.parent.
 */
TouchReceiver.addListenersBN=function(element,parent){
	var TR=TouchReceiver;
	element.parent=parent; //Teaches the SVG element to know what Button it belongs to.
	element.addEventListener(TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver its Button.
		TouchReceiver.touchStartBN(this.parent,e);
	}, false);
};
/* Adds handlerDown listeners to the background of the Palette. Used for scrolling.
 */
TouchReceiver.addListenersPalette=function(element){
	var TR=TouchReceiver;
	element.addEventListener(TR.handlerDown, function(e) {
		//When it is touched, the SVG element will tell the TouchReceiver.
		TouchReceiver.touchStartPalette(e);
	}, false);
};
