function ResultBubble(x,upperY,lowerY,text){
	var RB=ResultBubble;
	var height=RB.charHeight;
	var textE=GuiElements.draw.text(0,height,text,RB.fontSize,RB.fontColor,RB.font,RB.fontWeight);
	var width=GuiElements.measure.textWidth(textE);
	var group=GuiElements.create.group(0,0);
	group.appendChild(textE);
	this.bubbleOverlay=new BubbleOverlay(RB.bgColor,RB.margin,group,this);
	this.bubbleOverlay.display(x,upperY,lowerY,width,height);
	this.vanishTimer = self.setInterval(function () { GuiElements.overlay.close() }, RB.lifetime);
}
ResultBubble.setConstants=function(){
	var RB=ResultBubble;
	RB.fontColor=Colors.black;
	RB.bgColor=Colors.white;
	RB.fontSize=16;
	RB.font="Arial";
	RB.fontWeight="normal";
	RB.charHeight=12;
	RB.margin=4;
	RB.lifetime=3000;
};
ResultBubble.prototype.close=function(){
	this.bubbleOverlay.hide();
	this.vanishTimer = window.clearInterval(this.vanishTimer);
};