//status-fix
function CodeManager(){
	//CodeManager.stackList=new Array();
	var move=CodeManager.move;
	move.moving=false;
	move.stack=null;
	move.offsetX=0;
	move.offsetY=0;
	move.touchX=0;
	move.touchY=0;
	move.topX=0;//The top-left corner of the stack being moved
	move.topY=0;
	move.height=0;
	move.width=0;
	move.type=0;
	CodeManager.isRunning=false;
	CodeManager.fit=function(){}
	CodeManager.updateTimer=null;
	CodeManager.updateInterval=10;
	CodeManager.answer=new StringData("");
}
/*CodeManager.addStack=function(stack){
	CodeManager.stackList.push(stack);
	//return CodeManager.stackList.length-1;
}
CodeManager.removeStack=function(stack){
	var index=CodeManager.stackList.indexOf(stack);
	CodeManager.stackList.splice(index,1);
}*/
CodeManager.move=function(){};
CodeManager.move.start=function(block,x,y){
	var move=CodeManager.move;
	if(!move.moving){
		move.moving=true;
		var stack=block.unsnap();
		stack.fly();
		move.height=stack.dim.rh;
		move.width=stack.dim.rw;
		move.returnType=stack.returnType;
		
		move.bottomOpen=stack.firstBlock.bottomOpen;
		move.topOpen=stack.firstBlock.topOpen;
		move.returnsValue=stack.firstBlock.returnsValue;
		move.hasBlockSlot1=stack.firstBlock.hasBlockSlot1;
		move.hasBlockSlot2=stack.firstBlock.hasBlockSlot2;
		
		move.offsetX=stack.getAbsX()-x;
		move.offsetY=stack.getAbsY()-y;
		move.stack=stack;
	}
}
CodeManager.move.update=function(x,y){
	var move=CodeManager.move;
	if(move.moving){
		move.touchX=x;
		move.touchY=y;
		move.topX=move.offsetX+move.touchX;
		move.topY=move.offsetY+move.touchY;
		move.stack.move(move.topX,move.topY);
		CodeManager.findBestFit();
		if(CodeManager.fit.found){
			CodeManager.fit.bestFit.highlight();
		}
		else{
			Highlighter.hide();
		}
	}
}
CodeManager.move.end=function(){
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	if(move.moving){
		move.topX=move.offsetX+move.touchX;
		move.topY=move.offsetY+move.touchY;
		//move.stack.move(move.topX,move.topY);
		CodeManager.findBestFit();
		if(fit.found){
			fit.bestFit.snap(move.stack.firstBlock);
		}
		else{
			move.stack.land();
			move.stack.updateDim();
		}
		Highlighter.hide();
		move.moving=false;
	}
}
CodeManager.move.pInRange=function(x1,y1,xR,yR,width,height){
	//return y1>=yR;
	return (x1>=xR && x1<=xR+width && y1>=yR && y1<=yR+height);
}
CodeManager.move.rInRange=function(x1,y1,width1,height1,x2,y2,width2,height2){
	var xBigEnough = x1+width1>=x2;
	var yBigEnough = y1+height1>=y2;
	var xSmallEnough = x1<=x2+width2;
	var ySmallEnough = y1<=y2+height2;
	return xBigEnough&&yBigEnough&&xSmallEnough&&ySmallEnough;
}
CodeManager.findBestFit=function(){
	var fit=CodeManager.fit;
	fit.found=false; //Has any matching slot/block been found?
	fit.bestFit=null; //slot/block that is closest to the item
	fit.dist=0; //How far is the best candidate from the touch location
	
	TabManager.activeTab.findBestFit();
}
CodeManager.updateRun=function(){
	if(!TabManager.updateRun()){
		CodeManager.stopUpdateTimer();
	}
}
CodeManager.stop=function(){
	TabManager.stop();
	CodeManager.stopUpdateTimer();
}
CodeManager.stopUpdateTimer=function(){
	if(CodeManager.isRunning){
		CodeManager.updateTimer = window.clearInterval(CodeManager.updateTimer);
		CodeManager.isRunning=false;
	}
}
CodeManager.startUpdateTimer=function(){
	if(!CodeManager.isRunning){
		CodeManager.updateTimer = self.setInterval(function () { CodeManager.updateRun() }, CodeManager.updateInterval);
		CodeManager.isRunning=true;
	}
}
CodeManager.eventFlagClicked=function(){
	TabManager.eventFlagClicked();
}