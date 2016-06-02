function VectorIcon(x,y,pathId,color,height,parent){
	this.x=x;
	this.y=y;
	this.color=color;
	this.height=height;
	this.pathId=pathId;
	this.parent=parent;
	this.draw();
}
VectorIcon.computeWidth=function(pathId,height){
	var scale=height/pathId.height;
	return scale*pathId.width;
}
VectorIcon.prototype.draw=function(){
	this.scale=this.height/this.pathId.height;
	this.width=this.scale*this.pathId.width;
	this.group=GuiElements.create.group(this.x,this.y,this.parent);
	this.group.setAttributeNS(null,"transform","translate("+this.x+","+this.y+") scale("+this.scale+")");
	this.pathE=GuiElements.create.path(this.group);
	this.pathE.setAttributeNS(null,"d",this.pathId.path);
	this.pathE.setAttributeNS(null,"fill",this.color);
	this.group.appendChild(this.pathE);
}
VectorIcon.prototype.setColor=function(color){
	this.color=color;
	this.pathE.setAttributeNS(null,"fill",this.color);
}