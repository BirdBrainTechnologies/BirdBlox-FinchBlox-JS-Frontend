function DisplayBox(){
	var DB=DisplayBox;
	DB.layer=GuiElements.layers.display;
	DB.buildElements();
	DB.visible=false;
}
DisplayBox.setGraphics=function(){
	var DB=DisplayBox;
	DB.bgColor=Colors.white;
	DB.fontColor=Colors.black;
	DB.fontSize=35;
	DB.font="Arial";
	DB.fontWeight="normal";
	DB.charHeight=25;
	DB.screenMargin=60;
	DB.rectH=50;
	
	DB.rectX=DB.screenMargin;
	DB.rectY=GuiElements.height-DB.rectH-DB.screenMargin;
	DB.rectW=GuiElements.width-2*DB.screenMargin;
};
DisplayBox.buildElements=function(){
	var DB=DisplayBox;
	DB.rectE=GuiElements.draw.rect(DB.rectX,DB.rectY,DB.rectW,DB.rectH,DB.bgColor);
	DB.textE=GuiElements.draw.text(0,0,"",DB.fontSize,DB.fontColor,DB.font,DB.fontWeight);
	TouchReceiver.addListenersDisplayBox(DB.rectE);
	TouchReceiver.addListenersDisplayBox(DB.textE);
};
DisplayBox.updateZoom=function(){
	var DB=DisplayBox;
	DB.rectY=GuiElements.height-DB.rectH-DB.screenMargin;
	DB.rectW=GuiElements.width-2*DB.screenMargin;
	var textW=GuiElements.measure.textWidth(DB.textE);
	var textX=DB.rectX+DB.rectW/2-textW/2;
	var textY=DB.rectY+DB.rectH/2+DB.charHeight/2;
	GuiElements.move.text(DB.textE,textX,textY);
	GuiElements.update.rect(DB.rectE,DB.rectX,DB.rectY,DB.rectW,DB.rectH);
};
DisplayBox.displayText=function(text){
	var DB=DisplayBox;
	GuiElements.update.textLimitWidth(DB.textE,text,DB.rectW);
	var textW=GuiElements.measure.textWidth(DB.textE);
	var textX=DB.rectX+DB.rectW/2-textW/2;
	var textY=DB.rectY+DB.rectH/2+DB.charHeight/2;
	GuiElements.move.text(DB.textE,textX,textY);
	DB.show();
};
DisplayBox.show=function(){
	var DB=DisplayBox;
	if(!DB.visible){
		DB.layer.appendChild(DB.rectE);
		DB.layer.appendChild(DB.textE);
		DB.visible=true;
	}
};
DisplayBox.hide=function(){
	var DB=DisplayBox;
	if(DB.visible){
		DB.textE.remove();
		DB.rectE.remove();
		DB.visible=false;
	}
};
