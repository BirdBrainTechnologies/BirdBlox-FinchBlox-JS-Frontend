function BlockSlot(parent){
	this.child=null;
	//this.width=0;
	this.height=0;
	this.x=0;
	this.y=0;
	this.parent=parent;
	this.isBlockSlot=true;
	this.hasChild=false;
	this.isRunning=false;
	this.currentBlock=null;
}
BlockSlot.prototype.getAbsX=function(){
	return this.parent.stack.relToAbsX(this.x);
};
BlockSlot.prototype.getAbsY=function(){
	return this.parent.stack.relToAbsY(this.y);
};
BlockSlot.prototype.updateDim=function(){
	var bG=BlockGraphics.getType(this.type);
	if(this.hasChild){
		this.child.updateDim();
		this.height=this.child.addHeights();
	}
	else{
		//this.width=0;
		this.height=BlockGraphics.loop.bottomH;
	}
}
BlockSlot.prototype.updateAlign=function(x,y){
	this.x=x;
	this.y=y;
	if(this.hasChild){
		this.child.updateAlign(x,y);
	}
}
BlockSlot.prototype.snap=function(block){
	if(!block.getLastBlock().bottomOpen&&this.child!=null){
		var BG=BlockGraphics.command;
		this.child.unsnap().shiftOver(BG.shiftX,block.stack.getHeight()+BG.shiftY);
	}
	var stack=this.parent.stack;
	if(stack!=null&&block.stack!=null) {
		if (stack.isRunning && !block.stack.isRunning) {
			block.glow();
		}
		else if (!stack.isRunning && block.stack.isRunning) { //Blocks that are added are stopped.
			block.stack.stop();
		}
		else if (stack.isRunning && block.isRunning) { //The added block is stopped, but still glows as part of a running stack.
			block.stop();
		}
	}
	block.parent=this;
	if(this.hasChild){
		var lastBlock=block.getLastBlock();
		var prevChild=this.child;
		lastBlock.nextBlock=prevChild;
		prevChild.parent=lastBlock;
	}
	this.hasChild=true;
	this.child=block;
	if(block.stack!=null) {
		var oldG = block.stack.group;
		block.stack.remove();
		block.changeStack(this.parent.stack);
		oldG.remove();
	}
	if(stack!=null) {
		this.parent.stack.updateDim();
	}
}
BlockSlot.prototype.changeStack=function(stack){
	if(this.hasChild){
		this.child.changeStack(stack);
	}
}
BlockSlot.prototype.updateStackDim=function(stack){
	if(this.hasChild){
		this.child.updateStackDim(stack);
	}
}
BlockSlot.prototype.removeChild=function(){
	this.hasChild=false;
	this.child=null;
}
BlockSlot.prototype.findBestFit=function(){
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.getAbsX();
	var y=this.getAbsY();
	if(move.topOpen){
		var snap=BlockGraphics.command.snap;
		if(move.pInRange(move.topX,move.topY,x-snap.left,y-snap.top,snap.left+snap.right,snap.top+snap.bottom)){
			var xDist=move.topX-x;
			var yDist=move.topY-y;
			var dist=xDist*xDist+yDist*yDist;
			if(!fit.found||dist<fit.dist){
				fit.found=true;
				fit.bestFit=this;
				fit.dist=dist;
			}
		}
	}
	if(this.hasChild){
		this.child.findBestFit();
	}
}
BlockSlot.prototype.highlight=function(){
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),0,0,0,false,this.parent.isGlowing);
};
BlockSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new BlockSlot(parentCopy);
	if(this.hasChild){
		myCopy.snap(this.child.duplicate(0,0));
	}
	return myCopy;
};
BlockSlot.prototype.copyFrom=function(blockSlot){
	if(blockSlot.hasChild){
		this.snap(blockSlot.child.duplicate(0,0));
	}
};
BlockSlot.prototype.startRun=function(){
	if(!this.isRunning&&this.hasChild){
		this.isRunning=true;
		this.currentBlock=this.child;
	}
}
BlockSlot.prototype.stop=function(){
	if(this.isRunning&&this.hasChild){
		this.child.stop();
	}
	this.isRunning=false;
};
BlockSlot.prototype.updateRun=function(){
	if(this.isRunning){
		if(this.currentBlock.stack!=this.parent.stack){ //If the current Block has been removed, don't run it.
			this.isRunning=false;
			return new ExecutionStatusDone();
		}
		let execStatus = this.currentBlock.updateRun();
		if(!execStatus.isRunning()){
			if(execStatus.hasError()){
				this.isRunning=false;
				return execStatus;
			} else {
				this.currentBlock = this.currentBlock.nextBlock;
			}
		}
		if(this.currentBlock!=null){
			return new ExecutionStatusRunning();
		} else{
			this.isRunning = false;
			return new ExecutionStatusDone();
		}
	} else{
		return new ExecutionStatusDone();
	}
};
BlockSlot.prototype.glow=function(){
	if(this.hasChild){
		this.child.glow();
	}
};
BlockSlot.prototype.stopGlow=function(){
	if(this.hasChild){
		this.child.stopGlow();
	}
};
/* Recursively checks if a given message is still in use by any of the DropSlots. */
BlockSlot.prototype.checkBroadcastMessageAvailable=function(message){
	if(this.hasChild){
		return this.child.checkBroadcastMessageAvailable(message);
	}
	return false;
};
/* Recursively updates the available broadcast messages.
 */
BlockSlot.prototype.updateAvailableMessages=function(){
	if(this.hasChild){
		this.child.updateAvailableMessages();
	}
};

BlockSlot.prototype.createXml=function(xmlDoc){
	var blockSlot=XmlWriter.createElement(xmlDoc,"blockSlot");
	if(this.hasChild){
		var blocks=XmlWriter.createElement(xmlDoc,"blocks");
		this.child.writeToXml(xmlDoc,blocks);
		blockSlot.appendChild(blocks);
	}
	return blockSlot;
};
BlockSlot.prototype.importXml=function(blockSlotNode){
	var blocksNode=XmlWriter.findSubElement(blockSlotNode,"blocks");
	var blockNodes=XmlWriter.findSubElements(blocksNode,"block");
	if(blockNodes.length>0){
		var firstBlock=null;
		var i=0;
		while(firstBlock==null&&i<blockNodes.length){
			firstBlock=Block.importXml(blockNodes[i]);
			i++;
		}
		if(firstBlock==null){
			return;
		}
		this.snap(firstBlock);
		var previousBlock=firstBlock;
		while(i<blockNodes.length) {
			var newBlock = Block.importXml(blockNodes[i]);
			if (newBlock != null) {
				previousBlock.snap(newBlock);
				previousBlock = newBlock;
			}
			i++;
		}
	}
};
BlockSlot.prototype.renameVariable=function(variable){
	this.passRecursively("renameVariable",variable);
};
BlockSlot.prototype.deleteVariable=function(variable){
	this.passRecursively("deleteVariable",variable);
};
BlockSlot.prototype.renameList=function(list){
	this.passRecursively("renameList",list);
};
BlockSlot.prototype.deleteList=function(list){
	this.passRecursively("deleteList",list);
};
BlockSlot.prototype.checkVariableUsed=function(variable){
	if(this.hasChild){
		return this.child.checkVariableUsed(variable);
	}
	return false;
};
BlockSlot.prototype.checkListUsed=function(list){
	if(this.hasChild){
		return this.child.checkListUsed(list);
	}
	return false;
};
BlockSlot.prototype.hideDeviceDropDowns=function(deviceClass){
	this.passRecursively("hideDeviceDropDowns", deviceClass);
};
BlockSlot.prototype.showDeviceDropDowns=function(deviceClass){
	this.passRecursively("showDeviceDropDowns", deviceClass);
};
BlockSlot.prototype.countDevicesInUse=function(deviceClass){
	if(this.hasChild){
		return this.child.countDevicesInUse(deviceClass);
	}
	return 0;
};
BlockSlot.prototype.updateAvailableSensors = function(){
	this.passRecursively("updateAvailableSensors");
};
BlockSlot.prototype.passRecursively=function(functionName){
	var args = Array.prototype.slice.call(arguments, 1);
	if(this.hasChild){
		this.child[functionName].apply(this.child,args);
	}
};