/* This file contains the implementations for Blocks in the motion category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 * Many of these will use the this.stack.getSprite() method, which is not done yet.
 */

///// <not implemented> /////

function B_Move(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"move"));
	this.addPart(new NumSlot(this,"TEMPKEY",10));
	this.addPart(new LabelText(this,"steps"));
}
B_Move.prototype = Object.create(CommandBlock.prototype);
B_Move.prototype.constructor = B_Move;

function B_TurnRight(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"turn right"));
	this.addPart(new NumSlot(this,"TEMPKEY",15));
	this.addPart(new LabelText(this,"degrees"));
}
B_TurnRight.prototype = Object.create(CommandBlock.prototype);
B_TurnRight.prototype.constructor = B_TurnRight;

function B_TurnLeft(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"turn left"));
	this.addPart(new NumSlot(this,"TEMPKEY",15));
	this.addPart(new LabelText(this,"degrees"));
}
B_TurnLeft.prototype = Object.create(CommandBlock.prototype);
B_TurnLeft.prototype.constructor = B_TurnLeft;

function B_PointInDirection(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"point in direction"));
	var nS=new NumSlot(this,"TEMPKEY",90);
	nS.addOption(new NumData(90), "(90) right");
	nS.addOption(new NumData(-90), "(-90) left");
	nS.addOption(new NumData(0), "(0) up");
	nS.addOption(new NumData(180), "(180) down");
	this.addPart(nS);
}
B_PointInDirection.prototype = Object.create(CommandBlock.prototype);
B_PointInDirection.prototype.constructor = B_PointInDirection;

function B_PointTowards(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"point towards"));
}
B_PointTowards.prototype = Object.create(CommandBlock.prototype);
B_PointTowards.prototype.constructor = B_PointTowards;

function B_GoToXY(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"go to x:"));
	this.addPart(new NumSlot(this,"TEMPKEY",0));
	this.addPart(new LabelText(this,"y:"));
	this.addPart(new NumSlot(this,"TEMPKEY",0));
}
B_GoToXY.prototype = Object.create(CommandBlock.prototype);
B_GoToXY.prototype.constructor = B_GoToXY;

function B_GoTo(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"go to"));
}
B_GoTo.prototype = Object.create(Block.prototype);
B_GoTo.prototype.constructor = B_GoTo;

function B_GlideToXY(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"glide"));
	this.addPart(new NumSlot(this,"TEMPKEY",1,true));
	this.addPart(new LabelText(this,"secs to x:"));
	this.addPart(new NumSlot(this,"TEMPKEY",0));
	this.addPart(new LabelText(this,"y:"));
	this.addPart(new NumSlot(this,"TEMPKEY",0));
}
B_GlideToXY.prototype = Object.create(CommandBlock.prototype);
B_GlideToXY.prototype.constructor = B_GlideToXY;

function B_ChangeXBy(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"change x by"));
	this.addPart(new NumSlot(this,"TEMPKEY",10));
}
B_ChangeXBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeXBy.prototype.constructor = B_ChangeXBy;

function B_SetXTo(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"set x to"));
	this.addPart(new NumSlot(this,"TEMPKEY",0));
}
B_SetXTo.prototype = Object.create(CommandBlock.prototype);
B_SetXTo.prototype.constructor = B_SetXTo;

function B_ChangeYBy(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"change y by"));
	this.addPart(new NumSlot(this,"TEMPKEY",10));
}
B_ChangeYBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeYBy.prototype.constructor = B_ChangeYBy;

function B_SetYTo(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"set y to"));
	this.addPart(new NumSlot(this,"TEMPKEY",0));
}
B_SetYTo.prototype = Object.create(CommandBlock.prototype);
B_SetYTo.prototype.constructor = B_SetYTo;

function B_IfOnEdgeBounce(x,y){
	CommandBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"if on edge, bounce"));
}
B_IfOnEdgeBounce.prototype = Object.create(CommandBlock.prototype);
B_IfOnEdgeBounce.prototype.constructor = B_IfOnEdgeBounce;

function B_XPosition(x,y){
	ReporterBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"x position"));
}
B_XPosition.prototype = Object.create(ReporterBlock.prototype);
B_XPosition.prototype.constructor = B_XPosition;

function B_YPosition(x,y){
	ReporterBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"y position"));
}
B_YPosition.prototype = Object.create(ReporterBlock.prototype);
B_YPosition.prototype.constructor = B_YPosition;

function B_Direction(x,y){
	ReporterBlock.call(this,x,y,"motion");
	this.addPart(new LabelText(this,"direction"));
}
B_Direction.prototype = Object.create(ReporterBlock.prototype);
B_Direction.prototype.constructor = B_Direction;