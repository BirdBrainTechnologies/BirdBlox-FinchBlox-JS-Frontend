BlockIcon=function(parent,pathId,color,altText,height){
	this.pathId=pathId;
	this.color=color;
	this.altText=altText;
	this.width=VectorIcon.computeWidth(pathId,height);
	this.height=height;
	this.x=0;
	this.y=0;
	this.parent=parent;
	this.icon=new VectorIcon(0,0,pathId,color,height,this.parent.group);
	TouchReceiver.addListenersChild(this.icon.pathE,this.parent);
	this.isSlot=false;
}
BlockIcon.prototype.updateAlign=function(x,y){
	this.move(x,y-this.height/2);
	return this.width;
}
BlockIcon.prototype.updateDim=function(){
	
}
BlockIcon.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	this.icon.move(x,y);
}
BlockIcon.prototype.duplicate=function(parentCopy){
	return new BlockIcon(parentCopy,this.pathId,this.color,this.altText,this.height);
}
BlockIcon.prototype.textSummary=function(){
	return this.altText;
}