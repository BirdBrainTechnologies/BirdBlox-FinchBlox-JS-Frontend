function MenuBnList(parentGroup,x,y,bnMargin,width,columns){
	this.x=x;
	this.y=y;
	this.width=width;
	if(width==null){
		this.width=null;
	}
	this.height=0;
	this.bnHeight=MenuBnList.bnHeight;
	this.bnMargin=bnMargin;
	this.bnsGenerated=false;
	this.bnTextList=new Array();
	this.bnFunctionsList=new Array();
	this.bns=null;
	this.group=GuiElements.create.group(x,y);
	this.parentGroup=parentGroup;
	this.visible=false;
	if(columns==null){
		columns=1;
	}
	this.columns=columns;
}
MenuBnList.setGraphics=function(){
	var MBL=MenuBnList;
	MBL.bnHeight=25;
	MBL.bnHMargin=5; //only used when width not specified.
	MBL.minWidth=25;
}
MenuBnList.prototype.addOption=function(text,func){
	this.bnsGenerated=false;
	this.bnTextList.push(text);
	if(func==null){
		this.bnFunctionsList.push(null);
	}
	else{
		this.bnFunctionsList.push(func);
	}
}
MenuBnList.prototype.show=function(){
	this.generateBns();
	if(!this.visible){
		this.visible=true;
		this.parentGroup.appendChild(this.group);
	}
}
MenuBnList.prototype.hide=function(){
	if(this.visible){
		this.visible=false;
		this.group.remove();
	}
}
MenuBnList.prototype.generateBns=function(){
	var columns=this.columns;
	this.computeWidth(columns);
	if(!this.bnsGenerated){
		this.clearBnsArray();
		var currentY=0;
		var currentX=0;
		var column=0;
		var count=this.bnTextList.length;
		var bnWidth=0;
		for(var i=0;i<count;i++){
			if(column==columns){
				column=0;
				currentX=0;
				currentY+=this.bnHeight+this.bnMargin;
			}
			if(column==0) {
				bnWidth = (this.width + this.bnMargin) / columns - this.bnMargin;
				var remainingBns=count-i;
				if(remainingBns<columns){
					bnWidth=(this.width+this.bnMargin)/remainingBns-this.bnMargin;
				}
			}
			this.bns.push(this.generateBn(currentX,currentY,bnWidth,this.bnTextList[i],this.bnFunctionsList[i]));
			currentX+=bnWidth+this.bnMargin;
			column++;
		}
		currentY+=this.bnHeight;
		this.height=currentY;
		if(count==0){
			this.height=0;
		}
		this.bnsGenerated=true;
	}
}
MenuBnList.prototype.clearBnsArray=function(){
	if(this.bns!=null){
		for(var i=0;i<this.bns.length;i++){
			this.bns[i].remove();
		}
	}
	this.bns=new Array();
}
MenuBnList.prototype.generateBn=function(x,y,width,text,func){
	var MBL=MenuBnList;
	var bn=new Button(x,y,width,this.bnHeight,this.group);
	bn.addText(text);
	bn.setCallbackFunction(func,true);
	return bn;
}
MenuBnList.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y);
}
MenuBnList.prototype.computeWidth=function(){
	if(this.width==null) {
		var columns = this.columns;
		var MBL = MenuBnList;
		var longestW = 0;
		for (var i = 0; i < this.bnTextList.length; i++) {
			var currentW = GuiElements.measure.stringWidth(this.bnTextList[i], Button.font, Button.fontSize, Button.fontWeight);
			if (currentW > longestW) {
				longestW = currentW;
			}
		}
		this.width = columns * longestW + columns * 2 * MBL.bnHMargin + (columns - 1) * this.bnMargin;
		if (this.width < MBL.minWidth) {
			this.width = MBL.minWidth;
		}
	}
}
MenuBnList.prototype.isEmpty=function(){
	return this.bnTextList.length==0;
}