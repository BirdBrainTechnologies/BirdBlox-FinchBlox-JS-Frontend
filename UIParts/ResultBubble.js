function ResultBubble(leftX,rightX,upperY,lowerY,text, error){
	var RB = ResultBubble;
	if(error == null){
		error = false;
	}
	var fontColor = RB.fontColor;
	var bgColor = RB.bgColor;
	if(error){
		fontColor = RB.errorFontColor;
		bgColor = RB.errorBgColor;
	}
	var height=RB.font.charHeight;
	var textE=GuiElements.draw.text(0,height,text,RB.font,fontColor);
	GuiElements.update.textLimitWidth(textE,text,GuiElements.width-RB.hMargin*2);
	var width=GuiElements.measure.textWidth(textE);
	var group=GuiElements.create.group(0,0);
	group.appendChild(textE);
	let layer = GuiElements.layers.resultBubble;
	let overlayType = Overlay.types.resultBubble;
	this.bubbleOverlay=new BubbleOverlay(overlayType, bgColor,RB.margin,group,this,RB.hMargin,layer);
	this.bubbleOverlay.display(leftX,rightX,upperY,lowerY,width,height);
	/*this.vanishTimer = self.setInterval(function () { Overlay.closeOverlays() }, RB.lifetime);*/
}
ResultBubble.setConstants=function(){
	var RB=ResultBubble;
	RB.fontColor=Colors.black;
	RB.errorFontColor = Colors.white;
	RB.bgColor=Colors.white;
	RB.errorBgColor = "#c00000";
	RB.font = Font.uiFont(16);
	RB.margin=4;
	/*RB.lifetime=3000;*/
	RB.hMargin=20;
};
ResultBubble.prototype.close=function(){
	this.bubbleOverlay.hide();
	/*this.vanishTimer = window.clearInterval(this.vanishTimer);*/
};