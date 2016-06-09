//<test>
function b_SetTitleBarColor(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"Set bar color"));
	this.addPart(new LabelText(this,"R:"));
	this.addPart(new NumSlot(this,0,true,true));
	this.addPart(new LabelText(this,"G:"));
	this.addPart(new NumSlot(this,0,true,true));
	this.addPart(new LabelText(this,"B:"));
	this.addPart(new NumSlot(this,0,true,true));
}
b_SetTitleBarColor.prototype = Object.create(CommandBlock.prototype);
b_SetTitleBarColor.prototype.constructor = b_SetTitleBarColor;
b_SetTitleBarColor.prototype.startAction=function(){
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
}




function b_alert(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"Alert"));
	this.addPart(new StringSlot(this,"Hi!"));
}
b_alert.prototype = Object.create(CommandBlock.prototype);
b_alert.prototype.constructor = b_alert;
b_alert.prototype.startAction=function(){
	var message=this.slots[0].getData().getValue();
	GuiElements.alert(message);
	TouchReceiver.touchend();
	return false; //Done running
}
//</test>

function b_SayForSecs(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"say"));
	this.addPart(new StringSlot(this,"Hello!"));
	this.addPart(new LabelText(this,"for"));
	this.addPart(new NumSlot(this,2,true));
	this.addPart(new LabelText(this,"secs"));
}
b_SayForSecs.prototype = Object.create(CommandBlock.prototype);
b_SayForSecs.prototype.constructor = b_SayForSecs;

function b_Say(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"say"));
	this.addPart(new StringSlot(this,"Hello!"));
}
b_Say.prototype = Object.create(CommandBlock.prototype);
b_Say.prototype.constructor = b_Say;

function b_ThinkForSecs(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"think"));
	this.addPart(new StringSlot(this,"Hmm..."));
	this.addPart(new LabelText(this,"for"));
	this.addPart(new NumSlot(this,2,true));
	this.addPart(new LabelText(this,"secs"));
}
b_ThinkForSecs.prototype = Object.create(CommandBlock.prototype);
b_ThinkForSecs.prototype.constructor = b_ThinkForSecs;

function b_Think(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"think"));
	this.addPart(new StringSlot(this,"Hmm..."));
}
b_Think.prototype = Object.create(CommandBlock.prototype);
b_Think.prototype.constructor = b_Think;

function b_ChangeSizeBy(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"change size by"));
	this.addPart(new NumSlot(this,10));
}
b_ChangeSizeBy.prototype = Object.create(CommandBlock.prototype);
b_ChangeSizeBy.prototype.constructor = b_ChangeSizeBy;

function b_SetSizeTo(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"set size to"));
	this.addPart(new NumSlot(this,100,true));
	this.addPart(new LabelText(this,"%"));
}
b_SetSizeTo.prototype = Object.create(CommandBlock.prototype);
b_SetSizeTo.prototype.constructor = b_SetSizeTo;

function b_Size(x,y){
	ReporterBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"size"));
}
b_Size.prototype = Object.create(ReporterBlock.prototype);
b_Size.prototype.constructor = b_Size;

function b_Show(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"show"));
}
b_Show.prototype = Object.create(CommandBlock.prototype);
b_Show.prototype.constructor = b_Show;

function b_Hide(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"hide"));
}
b_Hide.prototype = Object.create(CommandBlock.prototype);
b_Hide.prototype.constructor = b_Hide;

function b_GoToFront(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"go to front"));
}
b_GoToFront.prototype = Object.create(CommandBlock.prototype);
b_GoToFront.prototype.constructor = b_GoToFront;

function b_GoBackLayers(x,y){
	CommandBlock.call(this,x,y,"looks");
	this.addPart(new LabelText(this,"go back"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new LabelText(this,"layers"));
}
b_GoBackLayers.prototype = Object.create(CommandBlock.prototype);
b_GoBackLayers.prototype.constructor = b_GoBackLayers;