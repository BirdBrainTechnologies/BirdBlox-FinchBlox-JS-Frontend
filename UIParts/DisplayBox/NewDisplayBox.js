/**
 * Created by Tom on 7/8/2017.
 */
function NewDisplayBox(position) {
	this.position = position;
	this.visible = false;
	this.layer = GuiElements.layers.display;
}
NewDisplayBox.setGraphics=function(){
	const DB = NewDisplayBox;
	DB.bgColor=Colors.white;
	DB.fontColor=Colors.black;
	DB.fontSize=35;
	DB.font="Arial";
	DB.fontWeight="normal";
	DB.charHeight=25;
	DB.screenMargin=60;
	DB.rectH=50;
	DB.margin = 10;
	DB.rectX=DB.screenMargin;
	DB.rectW=GuiElements.width-2*DB.screenMargin;
};
NewDisplayBox.prototype.build=function(){
	const DB=NewDisplayBox;
	this.rectY = this.getRectY();
	this.rectE=GuiElements.draw.rect(DB.rectX,this.rectY,DB.rectW,DB.rectH,DB.bgColor);
	this.textE=GuiElements.draw.text(0,0,"",DB.fontSize,DB.fontColor,DB.font,DB.fontWeight);
	TouchReceiver.addListenersDisplayBox(this.rectE);
	TouchReceiver.addListenersDisplayBox(this.textE);
};
NewDisplayBox.prototype.getRectY = function(){
	const DB=NewDisplayBox;
	const fromBottom = 2 - this.position;
	return GuiElements.height - (DB.rectH + DB.margin) * fromBottom - DB.rectH - DB.screenMargin;
};
NewDisplayBox.updateZoom = function(){
	NewDisplayBox.setGraphics();
};
NewDisplayBox.prototype.updateZoom = function(){
	const DB=NewDisplayBox;
	this.rectY = this.getRectY();
	const textW=GuiElements.measure.textWidth(this.textE);
	const textX=DB.rectX+DB.rectW/2-textW/2;
	const textY=this.rectY+DB.rectH/2+DB.charHeight/2;
	GuiElements.move.text(this.textE,textX,textY);
	GuiElements.update.rect(this.rectE,DB.rectX,this.rectY,DB.rectW,DB.rectH);
};
NewDisplayBox.prototype.displayText=function(text){
	const DB=NewDisplayBox;
	GuiElements.update.textLimitWidth(this.textE,text,DB.rectW);
	const textW=GuiElements.measure.textWidth(this.textE);
	const textX=DB.rectX+DB.rectW/2-textW/2;
	const textY=this.rectY+DB.rectH/2+DB.charHeight/2;
	GuiElements.move.text(this.textE,textX,textY);
	this.show();
};
NewDisplayBox.prototype.show=function(){
	if(!this.visible){
		this.layer.appendChild(this.rectE);
		this.layer.appendChild(this.textE);
		this.visible=true;
	}
};
NewDisplayBox.prototype.hide=function(){
	if(this.visible){
		this.textE.remove();
		this.rectE.remove();
		this.visible=false;
	}
};
