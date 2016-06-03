function TouchReceiver(){
	var TR=TouchReceiver;
	TR.mouse=false;
	TR.blocksMoving=false;
	TR.targetType="none";
	TR.touchDown=false;
	TR.target=null;
	var handlerMove="touchmove";
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
	TR.addListeners();
	TR.test=true;
}
TouchReceiver.addListeners=function(){
	var TR=TouchReceiver;
	document.body.addEventListener(TR.handlerMove,TouchReceiver.handleMove,false);
	document.body.addEventListener(TR.handlerUp,TouchReceiver.handleUp,false); 
}
TouchReceiver.handleMove=function(event){
	event.preventDefault();
	TouchReceiver.touchmove(event);
}
TouchReceiver.handleUp=function(event){
	TouchReceiver.touchend(event);
}
TouchReceiver.removeListeners=function(){
	document.body.removeEventListener(TR.handlerMove, TouchReceiver.handleMove);
	document.body.removeEventListener(TR.handlerMove, TouchReceiver.handleUp);
}
TouchReceiver.touchstart=function(e){
	var TR=TR;
	if(!TR.touchDown){
		TR.touchDown=true;
		TR.targetType="none";
	}
}
TouchReceiver.touchStartStack=function(target,e){
	var TR=TouchReceiver;
	if(!TR.touchDown){
		TR.touchDown=true;
		if(target.stack.isDisplayStack){
			TR.targetType="displayStack";
		}
		else{
			TR.targetType="stack";
		}
		TouchReceiver.target=target;
	}
}
TouchReceiver.touchStartSlot=function(slot,e){
	var TR=TouchReceiver;
	if(!TR.touchDown){
		var d = new Date();
		var n = d.getTime();
		if(n-TR.lastTrigger<5){//prevents repeat events
			return;
		}
		TR.touchDown=true;
		TR.targetType="slot";
		TouchReceiver.target=slot;
	}
}
TouchReceiver.touchStartCatBN=function(target,e){
	var TR=TouchReceiver;
	if(!TR.touchDown){
		TR.touchDown=true;
		TR.targetType="category";
		target.select();
	}
}
TouchReceiver.touchStartBN=function(target,e){
	var TR=TouchReceiver;
	if(!TR.touchDown){
		TR.touchDown=true;
		TR.targetType="button";
		target.press();
		TR.target=target;
	}
}
TouchReceiver.addListenersCat=function(obj,category){
	var TR=TouchReceiver;
	obj.category=category;
	obj.addEventListener(TR.handlerDown, function(e) {
		TouchReceiver.touchStartCatBN(this.category,e);
	}, false);
}
TouchReceiver.touchmove=function(e){//fix layer
	var TR=TouchReceiver;
	if(TR.touchDown){
		if(TR.targetType=="slot"){
			TR.target=TR.target.parent;
			if(TR.target.stack.isDisplayStack){
				TR.targetType="displayStack";
			}
			else{
				TR.targetType="stack";
			}
		}
		if(TR.targetType=="displayStack"){
			var x=TR.target.stack.getAbsX();
			var y=TR.target.stack.getAbsY();
			TR.target=TR.target.stack.duplicate(x,y).firstBlock;
			TR.targetType="stack";
		}
		if(TR.targetType=="stack"){
			if(TR.blocksMoving){
				CodeManager.move.update(TR.getX(e),TR.getY(e));
			}
			else{
				CodeManager.move.start(TR.target,TR.getX(e),TR.getY(e));
				TR.blocksMoving=true;
			}
		}
	}
}
TouchReceiver.touchend=function(e){
	var TR=TouchReceiver;
	if(TR.touchDown){
		TR.touchDown=false;
		if(TR.targetType=="stack"){
			if(TR.blocksMoving){
				CodeManager.move.end();
				TR.blocksMoving=false;
			}
		}
		else if(TR.targetType=="button"){
			TR.target.release();
		}
		else if(TR.targetType=="slot"){
			TR.target.edit();
			var d = new Date();
			var n = d.getTime();
			TR.lastTrigger=n;
		}
	}
}
TouchReceiver.getX=function(e){
	if(TouchReceiver.mouse){
		return e.clientX;
	}
	return e.touches[0].pageX;
}
TouchReceiver.getY=function(e){
	if(TouchReceiver.mouse){
		return e.clientY;
	}
	return e.touches[0].pageY;
}
TouchReceiver.addListenersChild=function(obj,parent){
	var TR=TouchReceiver;
	obj.parent=parent;
	obj.addEventListener(TR.handlerDown, function(e) {
		TouchReceiver.touchStartStack(this.parent,e);
	}, false);
}
TouchReceiver.addListenersSlot=function(element,slot){
	var TR=TouchReceiver;
	element.slot=slot;
	element.addEventListener(TR.handlerDown, function(e) {
		TouchReceiver.touchStartSlot(this.slot,e);
	}, false);
}
TouchReceiver.addListenersBN=function(obj,parent){
	var TR=TouchReceiver;
	obj.parent=parent;
	obj.addEventListener(TR.handlerDown, function(e) {
		TouchReceiver.touchStartBN(this.parent,e);
	}, false);
}
