//Displays text on a block.  For example, the say for secs block has 3 LabelText objects: "say", "for", "secs".

function LabelText(parent,text){
	DebugOptions.validateNonNull(parent, text);
	this.text=text;
	this.width=0;
	this.height=BlockGraphics.labelText.charHeight;
	this.x=0;
	this.y=0;
	this.parent=parent;
	this.textE=this.generateText(text);
	this.isSlot=false;
	this.visible=true;
}
LabelText.prototype.updateAlign=function(x,y){
	this.move(x,y+this.height/2);
	return this.width;
};
LabelText.prototype.updateDim=function(){
	if(this.width==0){
		GuiElements.layers.temp.appendChild(this.textE);
		this.width=GuiElements.measure.textWidth(this.textE);
		this.textE.remove();
		this.parent.group.appendChild(this.textE);
	}
};
LabelText.prototype.generateText=function(text){
	var obj=BlockGraphics.create.labelText(text,this.parent.group);
	TouchReceiver.addListenersChild(obj,this.parent);
	return obj;
};
LabelText.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	BlockGraphics.update.text(this.textE,x,y);
};
LabelText.prototype.duplicate=function(parentCopy){
	return new LabelText(parentCopy,this.text);
};
LabelText.prototype.textSummary=function(){
	return this.text;
};
LabelText.prototype.show=function(){
	if(!this.visible){
		this.parent.group.appendChild(this.textE);
		this.visible=true;
	}
};
LabelText.prototype.hide=function(){
	if(this.visible){
		this.textE.remove();
		this.visible=false;
	}
};
LabelText.prototype.remove=function(){
	this.textE.remove();
};