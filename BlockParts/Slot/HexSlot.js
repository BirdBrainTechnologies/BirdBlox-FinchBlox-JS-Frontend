function HexSlot(parent,snapType){
	Slot.call(this,parent,Slot.inputTypes.bool,snapType,Slot.outputTypes.bool);
	this.buildSlot();
}
HexSlot.prototype = Object.create(Slot.prototype);
HexSlot.prototype.constructor = HexSlot;
HexSlot.prototype.buildSlot=function(){
	this.slotE=this.generateSlot(2);//Fix BG
}
HexSlot.prototype.moveSlot=function(x,y){
	BlockGraphics.update.path(this.slotE,x,y,this.width,this.height,2,true);//Fix BG
}
HexSlot.prototype.hideSlot=function(){
	this.slotE.remove();
}
HexSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.slotE);
}
HexSlot.prototype.generateSlot=function(type){//Fix BG
	var obj=BlockGraphics.create.slot(this.parent.group,type,this.parent.category);
	TouchReceiver.addListenersChild(obj,this.parent);
	return obj;
}
HexSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.getType(2);//Fix BG
	this.width=bG.slotWidth;
	this.height=bG.slotHeight
}
HexSlot.prototype.highlight=function(){//Fix BG
	var isSlot=!this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,2,isSlot);
}
HexSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new HexSlot(parentCopy,this.snapType);
	if(this.hasChild){
		myCopy.child=this.child.duplicate(0,0);
		myCopy.hasChild=true;
	}
	return myCopy;
}
HexSlot.prototype.textSummary=function(){
	if(this.hasChild){
		return "<...>";
	}
	else{
		return "<>";
	}
}
HexSlot.prototype.getData=function(){
	if(this.running==3){
		if(this.resultIsFromChild){
			return this.resultData;
		}
		else{
			return new BoolData(false,false);
		}
	}
	return null;
}