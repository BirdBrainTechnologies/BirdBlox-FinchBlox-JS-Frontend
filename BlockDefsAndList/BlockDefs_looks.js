/* This file contains the implementations for Blocks in the looks category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 * Many of these will use the this.stack.getSprite() method, which is not done yet.
 */

///// <test> /////
function B_SetTitleBarColor(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"Set bar color"));
	this.addPart(new LabelText(this,"R:"));
	this.addPart(new NumSlot(this,0,true,true));
	this.addPart(new LabelText(this,"G:"));
	this.addPart(new NumSlot(this,0,true,true));
	this.addPart(new LabelText(this,"B:"));
	this.addPart(new NumSlot(this,0,true,true));
}
B_SetTitleBarColor.prototype = Object.create(CommandBlock.prototype);
B_SetTitleBarColor.prototype.constructor = B_SetTitleBarColor;
B_SetTitleBarColor.prototype.startAction=function(){
	var valR=this.slots[0].getData().getValueInR(0,255);
	var valG=this.slots[1].getData().getValueInR(0,255);
	var valB=this.slots[2].getData().getValueInR(0,255);
	
	var colorR=valR.toString(16);
	var colorG=valG.toString(16);
	var colorB=valB.toString(16);
	if(colorR.length==1){
		colorR="0"+colorR;
	}
	if(colorG.length==1){
		colorG="0"+colorG;
	}
	if(colorB.length==1){
		colorB="0"+colorB;
	}
	GuiElements.update.color(TitleBar.bgRect,"#"+colorR+colorG+colorB);
	return false; //Done running
};



function B_alert(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"Alert"));
	this.addPart(new StringSlot(this,"Hi!"));
}
B_alert.prototype = Object.create(CommandBlock.prototype);
B_alert.prototype.constructor = B_alert;
B_alert.prototype.startAction=function(){
	var message=this.slots[0].getData().getValue();
	GuiElements.alert(message);
	TouchReceiver.touchend();
	return false; //Done running
};


///// </test> /////
///// <not implemented> /////


function B_SayForSecs(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"say"));
	this.addPart(new StringSlot(this,"Hello!"));
	this.addPart(new LabelText(this,"for"));
	this.addPart(new NumSlot(this,2,true));
	this.addPart(new LabelText(this,"secs"));
}
B_SayForSecs.prototype = Object.create(CommandBlock.prototype);
B_SayForSecs.prototype.constructor = B_SayForSecs;

function B_Say(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"say"));
	this.addPart(new StringSlot(this,"Hello!"));
}
B_Say.prototype = Object.create(CommandBlock.prototype);
B_Say.prototype.constructor = B_Say;

function B_ThinkForSecs(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"think"));
	this.addPart(new StringSlot(this,"Hmm..."));
	this.addPart(new LabelText(this,"for"));
	this.addPart(new NumSlot(this,2,true));
	this.addPart(new LabelText(this,"secs"));
}
B_ThinkForSecs.prototype = Object.create(CommandBlock.prototype);
B_ThinkForSecs.prototype.constructor = B_ThinkForSecs;

function B_Think(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"think"));
	this.addPart(new StringSlot(this,"Hmm..."));
}
B_Think.prototype = Object.create(CommandBlock.prototype);
B_Think.prototype.constructor = B_Think;

function B_ChangeSizeBy(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"change size by"));
	this.addPart(new NumSlot(this,10));
}
B_ChangeSizeBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeSizeBy.prototype.constructor = B_ChangeSizeBy;

function B_SetSizeTo(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"set size to"));
	this.addPart(new NumSlot(this,100,true));
	this.addPart(new LabelText(this,"%"));
}
B_SetSizeTo.prototype = Object.create(CommandBlock.prototype);
B_SetSizeTo.prototype.constructor = B_SetSizeTo;

function B_Size(x,y){
	ReporterBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"size"));
}
B_Size.prototype = Object.create(ReporterBlock.prototype);
B_Size.prototype.constructor = B_Size;

function B_Show(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"show"));
}
B_Show.prototype = Object.create(CommandBlock.prototype);
B_Show.prototype.constructor = B_Show;

function B_Hide(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"hide"));
}
B_Hide.prototype = Object.create(CommandBlock.prototype);
B_Hide.prototype.constructor = B_Hide;

function B_GoToFront(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"go to front"));
}
B_GoToFront.prototype = Object.create(CommandBlock.prototype);
B_GoToFront.prototype.constructor = B_GoToFront;

function B_GoBackLayers(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"go back"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new LabelText(this,"layers"));
}
B_GoBackLayers.prototype = Object.create(CommandBlock.prototype);
B_GoBackLayers.prototype.constructor = B_GoBackLayers;