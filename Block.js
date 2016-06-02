
function Block(type,returnType,x,y,category){ //Type: 0=Command, 1=Reporter, 2=Predicate Fix! BG
	this.x=x;
	this.y=y;
	this.type=type;
	this.bottomOpen=(type==0||type==4||type==5||type==6);
	this.topOpen=(type==0||type==5||type==6);
	this.returnsValue=(returnType!=Block.returnTypes.none);
	this.returnType=returnType;
	this.hasBlockSlot1=(type==5||type==6);
	this.hasBlockSlot2=(type==6);
	this.hasHat=(type==4);
	
	this.group=GuiElements.create.group(x,y);
	this.group.setAttributeNS(null,"id",name);
	this.parent=null;
	this.parts=new Array();
	this.slots=new Array();
	this.running=0;//Running: 0=Not started 1=Awaiting slots 2=Running 3=Completed
	//this.isRunning=false;
	this.category=category;
	
	this.stack=null;
	this.path=this.generatePath();
	this.height=0; //Will be set later
	this.width=0;
	this.name=name;
	this.runMem=function(){};//serves as a place for the block to store info while running
	
	if(this.bottomOpen){
		this.nextBlock=null;
	}
	if(this.returnsValue){
		this.resultData=null;
	}
	if(this.hasBlockSlot1){
		this.topHeight=0;
		this.blockSlot1=new BlockSlot(this);
	}
	if(this.hasBlockSlot2){
		this.midHeight=0;
		this.midLabel=new LabelText(this,this.midLabelText);
		this.blockSlot2=new BlockSlot(this);
	}
}
Block.setConstants=function(){
	Block.returnTypes=function(){};
	Block.returnTypes.none=0;
	Block.returnTypes.num=1;
	Block.returnTypes.string=2;
	Block.returnTypes.bool=3;
	Block.returnTypes.list=4;
}
Block.prototype.getAbsX=function(){
	if(this.stack!=null){
		return this.x+this.stack.getAbsX();
	}
	else{
		return this.x;
	}
}
Block.prototype.getAbsY=function(){
	if(this.stack!=null){
		return this.y+this.stack.getAbsY();
	}
	else{
		return this.y;
	}
}
Block.prototype.generatePath=function(){
	var obj=BlockGraphics.create.block(this.category,this.group,this.returnsValue);
	TouchReceiver.addListenersChild(obj,this);
	return obj;
}
Block.prototype.addPart=function(part){
	this.parts.push(part);
	if(part.isSlot){
		this.slots.push(part);
	}
}
Block.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y);
}
Block.prototype.stop=function(){
	this.running=0;
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].stop();
	}
	if(this.blockSlot1!=null){
		this.blockSlot1.stop();
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.stop();
	}
	if(this.bottomOpen&&this.nextBlock!=null){
		this.nextBlock.stop();
	}
}
Block.prototype.updateRun=function(){
	if(this.running==0||this.running==3){
		for(var i=0;i<this.slots.length;i++){
			this.slots[i].stop();
		}
		this.running=1;
	}
	var rVal;
	if(this.running==1){
		for(var i=0;i<this.slots.length;i++){
			if(!this.slots[i].updateRun()){
				if(!this.returnsValue){
					return this;
				}
				else{
					return false;
				}
			}
		}
		this.running=2;
		rVal = this.startAction();
	}
	else if(this.running==2){
		rVal = this.updateAction();
	}
	var rT=Block.returnTypes;
	if((!this.returnsValue&&rVal!=this)||(this.returnsValue&&rVal==true)){
		this.running=3;
		this.clearMem();
	}
	return rVal;
}
Block.prototype.startAction=function(){
	return this;
}
Block.prototype.updateAction=function(){
	return this;
}
Block.prototype.getResultData=function(){
	if(this.running==3){
		this.running=0;
		return this.resultData;
	}
	return null;
}
Block.prototype.changeStack=function(stack){
	this.stack=stack;
	this.group.remove();
	stack.group.appendChild(this.group);
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].changeStack(stack);
	}
	if(this.nextBlock!=null){
		this.nextBlock.changeStack(stack);
	}
	if(this.blockSlot1!=null){
		this.blockSlot1.changeStack(stack);
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.changeStack(stack);
	}
}
Block.prototype.updateStackDim=function(){
	if(this.blockSlot1!=null){
		this.blockSlot1.updateStackDim();
	}
	if(this.blockSlot2!=null){
		this.blockSlot2.updateStackDim();
	}
	this.updateStackDimRI();
	if(this.nextBlock!=null){
		this.nextBlock.updateStackDim();
	}
}
Block.prototype.updateStackDimRI=function(){
	for(var i=0;i<this.slots.length;i++){
		this.slots[i].updateStackDim();
	}
	this.updateStackDimO();
}
Block.prototype.updateStackDimO=function(){
	var sDim=this.stack.dim;
	var snap=BlockGraphics.command.snap;
	if(this.bottomOpen||this.topOpen){
		var cx1=this.x-snap.left;
		var cy1=this.y-snap.top;
		var cx2=this.x+snap.right;
		var cy2=this.y+this.height+snap.bottom;
		if(cx1<sDim.cx1){
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
	{
		var rx1=this.x;
		var ry1=this.y;
		var rx2=this.x+this.width;
		var ry2=this.y+this.height;
		if(rx1<sDim.rx1){
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
	}
}
Block.prototype.updateDim=function(){
	var bG=BlockGraphics.getType(this.type);
	if(this.topOpen||this.bottomOpen){
		var bG=BlockGraphics.command;
	}
	var width=0;
	width+=bG.hMargin;
	var height=0;
	for(var i=0;i<this.parts.length;i++){
		this.parts[i].updateDim();
		width+=this.parts[i].width;
		if(this.parts[i].height>height){
			height=this.parts[i].height;
		}
		if(i<this.parts.length-1){
			width+=bG.pMargin;
		}
	}
	width+=bG.hMargin;
	height+=2*bG.vMargin;
	if(height<bG.height){
		height=bG.height;
	}
	if(this.hasBlockSlot1){
		this.topHeight=height;
		this.blockSlot1.updateDim();
		height+=this.blockSlot1.height;
		height+=BlockGraphics.loop.bottomH;
	}
	if(this.hasBlockSlot2){
		this.midLabel.updateDim();
		this.midHeight=this.midLabel.height;
		this.midHeight+=2*bG.vMargin;
		if(this.midHeight<bG.height){
			this.midHeight=bG.height;
		}
		height+=this.midHeight;
		this.blockSlot2.updateDim();
		height+=this.blockSlot2.height;
	}
	bG=BlockGraphics.getType(this.type);
	if(width<bG.width){
		width=bG.width;
	}
	this.resize(width,height);
	if(this.nextBlock!=null){
		this.nextBlock.updateDim();
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