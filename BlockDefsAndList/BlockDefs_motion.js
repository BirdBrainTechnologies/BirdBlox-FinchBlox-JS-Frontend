function b_Move(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"move"));
	this.addPart(new NumSlot(this,10));
	this.addPart(new LabelText(this,"steps"));
}
b_Move.prototype = Object.create(CommandBlock.prototype);
b_Move.prototype.constructor = b_Move;

function b_TurnRight(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"turn right"));
	this.addPart(new NumSlot(this,15));
	this.addPart(new LabelText(this,"degrees"));
}
b_TurnRight.prototype = Object.create(CommandBlock.prototype);
b_TurnRight.prototype.constructor = b_TurnRight;

function b_TurnLeft(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"turn left"));
	this.addPart(new NumSlot(this,15));
	this.addPart(new LabelText(this,"degrees"));
}
b_TurnLeft.prototype = Object.create(CommandBlock.prototype);
b_TurnLeft.prototype.constructor = b_TurnLeft;

function b_PointInDirection(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"point in direction"));
	this.addPart(new NumSlot(this,90));
}
b_PointInDirection.prototype = Object.create(CommandBlock.prototype);
b_PointInDirection.prototype.constructor = b_PointInDirection;

function b_PointTowards(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"point towards"));
}
b_PointTowards.prototype = Object.create(CommandBlock.prototype);
b_PointTowards.prototype.constructor = b_PointTowards;

function b_GoToXY(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"go to x:"));
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"y:"));
	this.addPart(new NumSlot(this,0));
}
b_GoToXY.prototype = Object.create(CommandBlock.prototype);
b_GoToXY.prototype.constructor = b_GoToXY;

function b_GoTo(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"go to"));
}
b_GoTo.prototype = Object.create(Block.prototype);
b_GoTo.prototype.constructor = b_GoTo;

function b_GlideToXY(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"glide"));
	this.addPart(new NumSlot(this,1,true));
	this.addPart(new LabelText(this,"secs to x: y:"));
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"y:"));
	this.addPart(new NumSlot(this,0));
}
b_GlideToXY.prototype = Object.create(CommandBlock.prototype);
b_GlideToXY.prototype.constructor = b_GlideToXY;

function b_ChangeXBy(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"change x by"));
	this.addPart(new NumSlot(this,10));
}
b_ChangeXBy.prototype = Object.create(CommandBlock.prototype);
b_ChangeXBy.prototype.constructor = b_ChangeXBy;

function b_SetXTo(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"set x to"));
	this.addPart(new NumSlot(this,0));
}
b_SetXTo.prototype = Object.create(CommandBlock.prototype);
b_SetXTo.prototype.constructor = b_SetXTo;

function b_ChangeYBy(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"change y by"));
	this.addPart(new NumSlot(this,10));
}
b_ChangeYBy.prototype = Object.create(CommandBlock.prototype);
b_ChangeYBy.prototype.constructor = b_ChangeYBy;

function b_SetYTo(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"set y to"));
	this.addPart(new NumSlot(this,0));
}
b_SetYTo.prototype = Object.create(CommandBlock.prototype);
b_SetYTo.prototype.constructor = b_SetYTo;

function b_IfOnEdgeBounce(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"if on edge, bounce"));
}
b_IfOnEdgeBounce.prototype = Object.create(CommandBlock.prototype);
b_IfOnEdgeBounce.prototype.constructor = b_IfOnEdgeBounce;

function b_XPosition(x,y){
	ReporterBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"x position"));
}
b_XPosition.prototype = Object.create(ReporterBlock.prototype);
b_XPosition.prototype.constructor = b_XPosition;

function b_YPosition(x,y){
	ReporterBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"y position"));
}
b_YPosition.prototype = Object.create(ReporterBlock.prototype);
b_YPosition.prototype.constructor = b_YPosition;

function b_Direction(x,y){
	ReporterBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"direction"));
}
b_Direction.prototype = Object.create(ReporterBlock.prototype);
b_Direction.prototype.constructor = b_Direction;