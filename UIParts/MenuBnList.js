function MenuBnList(parentGroup,x,y,bnVmargin,width){
	this.x=x;
	this.y=y;
	this.width;
	if(this.width==null){
		this.width=null;
	}
	this.height=0;
	this.bnHeight=MenuBnList.bnHeight;
	this.bnVmargin=bnVmargin;
	this.bnsGenerated=false;
	this.bnTextList=new Array();
	this.bnFunctionsList=new Array();
	this.bns=null;
	this.group=GuiElements.create.group(x,y);
	this.parentGroup=parentGroup;
	this.visible=false;
}
MenuBnList.setGraphics=function(){
	var MBL=MenuBnList;
	MBL.bnHeight=25;
	MBL.bnHMargin=5; //only used when width not specified
	MBL.fontSize=16;
	MBL.font="Arial";
	MBL.fontWeight="normal";
	MBL.charHeight=12;
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
	this.computeWidth();
	if(!this.bnsGenerated){
		this.clearBnsArray();
		var currentY=0;
		for(var i=0;i<this.bnTextList.length;i++){
			this.bns.push(this.generateBn(0,currentY,this.bnTextList[i],this.bnFunctionsList[i]));
			currentY+=this.bnHeight;
			if(i<this.bnTextList.length-1){
				currentY+=this.bnVmargin;
			}
		}
		this.height=currentY;
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
MenuBnList.prototype.generateBn=function(x,y,text,func){
	var MBL=MenuBnList;
	var bn=new Button(x,y,this.width,this.bnHeight,this.group);
	bn.addText(text,MBL.font,MBL.fontSize,MBL.fontWeight,MBL.charHeight);
	bn.setCallbackFunction(func,true);
	return bn;
}
MenuBnList.prototype.move=function(x,y){
	this.x=x;
	this.y=y;
	GuiElements.move.group(this.group,x,y);
}
MenuBnList.prototype.computeWidth=function(){
	if(this.width==null){
		var MBL=MenuBnList;
		var longestW=0;
		for(var i=0;i<this.bnTextList.length;i++){
			var currentW=GuiElements.measure.stringWidth(this.bnTextList[i],MBL.font,MBL.fontSize,MBL.fontWeight);
			if(currentW>longestW){
				longestW=currentW;
			}
		}
		this.width=longestW+2*MBL.bnHMargin;
	}
}