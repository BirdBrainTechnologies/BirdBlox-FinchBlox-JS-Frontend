//Static.  Makes block shapes for the SVG.

function BlockGraphics(){
	BlockGraphics.SetCommand();
	BlockGraphics.SetReporter();
	BlockGraphics.SetPredicate();
	BlockGraphics.SetString();
	BlockGraphics.SetHat();
	BlockGraphics.SetLoop();
	BlockGraphics.SetLabelText();
	BlockGraphics.SetValueText();
	BlockGraphics.SetDropSlot();
	BlockGraphics.SetHighlight();
	BlockGraphics.SetGlow();
	BlockGraphics.CalcCommand();
	BlockGraphics.CalcPaths();
}
BlockGraphics.SetCommand=function(){
	BlockGraphics.command=function(){};
	BlockGraphics.command.height=20;
	BlockGraphics.command.width=40;
	BlockGraphics.command.vMargin=5;
	BlockGraphics.command.hMargin=5;
	BlockGraphics.command.pMargin=5; //Margin between parts
	BlockGraphics.command.bumpOffset=7;
	BlockGraphics.command.bumpDepth=4;
	BlockGraphics.command.bumpTopWidth=15;
	BlockGraphics.command.bumpBottomWidth=7;
	BlockGraphics.command.cornerRadius=3;
	BlockGraphics.command.snap=function(){};
	BlockGraphics.command.snap.left=20;
	BlockGraphics.command.snap.right=20;
	BlockGraphics.command.snap.top=20;
	BlockGraphics.command.snap.bottom=20;
}
BlockGraphics.SetReporter=function(){
	BlockGraphics.reporter=function(){};
	BlockGraphics.reporter.height=18;//16
	BlockGraphics.reporter.width=18;//16
	BlockGraphics.reporter.vMargin=3;
	BlockGraphics.reporter.hMargin=7;//5
	BlockGraphics.reporter.pMargin=5; //Margin between parts
	BlockGraphics.reporter.slotHeight=18;//14
	BlockGraphics.reporter.slotWidth=18;//14
	BlockGraphics.reporter.slotHMargin=8;//5 //Margin at side of slot
	//BlockGraphics.reporter.slotStrokeC="none";
	//BlockGraphics.reporter.slotStrokeW=1;
	BlockGraphics.reporter.strokeW=1;
	BlockGraphics.reporter.slotFill="#fff";
	BlockGraphics.reporter.slotSelectedFill="#000";
}
BlockGraphics.SetPredicate=function(){
	BlockGraphics.predicate=function(){};
	BlockGraphics.predicate.height=18;//16
	BlockGraphics.predicate.width=12;
	BlockGraphics.predicate.vMargin=3;
	BlockGraphics.predicate.hMargin=10;
	BlockGraphics.predicate.pMargin=5; //Margin between parts
	BlockGraphics.predicate.hexEndL=10;
	BlockGraphics.predicate.slotHeight=14;
	BlockGraphics.predicate.slotWidth=25;
	BlockGraphics.predicate.slotHMargin=5;
	BlockGraphics.predicate.slotHexEndL=7;
}
BlockGraphics.SetString=function(){
	BlockGraphics.string=function(){};
	BlockGraphics.string.slotHeight=18;//14
	BlockGraphics.string.slotWidth=20;//5
	BlockGraphics.string.slotHMargin=3;//2
	//BlockGraphics.string.slotHMargin=5;
}
BlockGraphics.SetHat=function(){
	BlockGraphics.hat=function(){};
	BlockGraphics.hat.hRadius=60;
	BlockGraphics.hat.vRadius=40;
	BlockGraphics.hat.topW=80;
	BlockGraphics.hat.width=90;
	BlockGraphics.hat.hatHEstimate=10;
	//BlockGraphics.hat.height=20;
}
BlockGraphics.SetLoop=function(){
	BlockGraphics.loop=function(){};
	//BlockGraphics.loop.height=40;
	BlockGraphics.loop.width=40;
	BlockGraphics.loop.bottomH=7;
	BlockGraphics.loop.side=7;
}
BlockGraphics.SetLabelText=function(){
	BlockGraphics.labelText=function(){};
	BlockGraphics.labelText.font="Arial";
	BlockGraphics.labelText.fontSize=12;
	BlockGraphics.labelText.fontWeight="bold";
	BlockGraphics.labelText.fill="#ffffff";
	BlockGraphics.labelText.charHeight=10;
	/*BlockGraphics.labelText.charWidth=3;*/
}
BlockGraphics.SetValueText=function(){
	BlockGraphics.valueText=function(){};
	BlockGraphics.valueText.font="Arial";
	BlockGraphics.valueText.fontSize=12;
	BlockGraphics.valueText.fontWeight="normal";
	BlockGraphics.valueText.fill="#000000";
	BlockGraphics.valueText.charHeight=10;
	BlockGraphics.valueText.selectedFill="#fff";//#aaa
	/*BlockGraphics.valueText.charWidth=3;*/
}
BlockGraphics.SetDropSlot=function(){
	BlockGraphics.dropSlot=function(){};
	BlockGraphics.dropSlot.slotHeight=18;
	BlockGraphics.dropSlot.slotWidth=25;
	BlockGraphics.dropSlot.slotHMargin=3;
	BlockGraphics.dropSlot.triH=6;
	BlockGraphics.dropSlot.triW=8;
	//BlockGraphics.dropSlot.menuWidth=100;
	BlockGraphics.dropSlot.bg="#000";
	BlockGraphics.dropSlot.bgOpacity=0.25;
	BlockGraphics.dropSlot.selectedBg="#000";
	BlockGraphics.dropSlot.selectedBgOpacity=1;
	BlockGraphics.dropSlot.triFill="#000";
	BlockGraphics.dropSlot.textFill="#fff";
	BlockGraphics.dropSlot.selectedTriFill="#fff";
}
BlockGraphics.SetHighlight=function(){
	BlockGraphics.highlight=function(){};
	BlockGraphics.highlight.margin=5;
	BlockGraphics.highlight.hexEndL=15;
	BlockGraphics.highlight.slotHexEndL=10;
	BlockGraphics.highlight.strokeC="#fff";
	BlockGraphics.highlight.strokeDarkC="#000";
	BlockGraphics.highlight.strokeW=3;
	BlockGraphics.highlight.commandL=10;
}
BlockGraphics.SetGlow=function(){
	BlockGraphics.glow=function(){};
	BlockGraphics.glow.color="#fff";
	BlockGraphics.glow.strokeW=2;
};

BlockGraphics.CalcCommand=function(){
	var com=BlockGraphics.command;
	com.extraHeight=2*com.cornerRadius;
	com.extraWidth=2*com.cornerRadius+com.bumpTopWidth+com.bumpOffset;
	com.bumpSlantWidth=(com.bumpTopWidth-com.bumpBottomWidth)/2;
}
BlockGraphics.CalcPaths=function(){
	var com=BlockGraphics.command;
	var path1="";
	//path1+="m "+com.x+","+com.y;
	path1+=" "+com.bumpOffset+",0";
	path1+=" "+com.bumpSlantWidth+","+com.bumpDepth;
	path1+=" "+com.bumpBottomWidth+",0";
	path1+=" "+com.bumpSlantWidth+","+(0-com.bumpDepth);
	path1+=" ";
	var path2=",0";
	path2+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+com.cornerRadius+" "+com.cornerRadius;
	path2+=" l 0,";
	var path3="";
	path3+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+(0-com.cornerRadius)+" "+com.cornerRadius;
	path3+=" l ";
	var path4=",0";
	path4+=" "+(0-com.bumpSlantWidth)+","+com.bumpDepth;
	path4+=" "+(0-com.bumpBottomWidth)+",0";
	path4+=" "+(0-com.bumpSlantWidth)+","+(0-com.bumpDepth);
	path4+=" "+(0-com.bumpOffset)+",0";
	path4+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+(0-com.cornerRadius)+" "+(0-com.cornerRadius);
	path4+=" ";
	var path5="";
	path5+=" a "+com.cornerRadius+" "+com.cornerRadius+" 0 0 1 "+com.cornerRadius+" "+(0-com.cornerRadius);
	path5+=" z";
	com.path1=path1;
	com.path2=path2;
	com.path3=path3;
	com.path4=path4;
	com.path5=path5;
}
BlockGraphics.getType=function(type){
	switch(type){
		case 0:
			return BlockGraphics.command;
		case 1:
			return BlockGraphics.reporter;
		case 2:
			return BlockGraphics.predicate;
		case 3:
			return BlockGraphics.string;
		case 4:
			return BlockGraphics.hat;
		case 5:
			return BlockGraphics.loop;
		case 6:
			return BlockGraphics.loop;
	}
}

BlockGraphics.buildPath=function(){}
BlockGraphics.buildPath.command=function(x,y,width,height){
	var path="";
	path+="m "+(x+BlockGraphics.command.cornerRadius)+","+y;
	path+=BlockGraphics.command.path1;

	path+=width-BlockGraphics.command.extraWidth;
	path+=BlockGraphics.command.path2;
	path+=height-BlockGraphics.command.extraHeight;
	path+=BlockGraphics.command.path3;
	path+=BlockGraphics.command.extraWidth-width;
	path+=BlockGraphics.command.path4+"l 0,";
	path+=BlockGraphics.command.extraHeight-height;
	path+=BlockGraphics.command.path5;
	return path;
}
BlockGraphics.buildPath.highlightCommand=function(x,y){
	var path="";
	path+="m "+x+","+y;
	path+="l "+BlockGraphics.command.cornerRadius+",0";
	path+=BlockGraphics.command.path1;
	path+=BlockGraphics.highlight.commandL+",0";
	return path;
}
BlockGraphics.buildPath.reporter=function(x,y,width,height){
	var radius=height/2;
	var flatWidth=width-height;
	var path="";
	path+="m "+(x+radius)+","+(y+height);
	path+=" a "+radius+" "+radius+" 0 0 1 0 "+(0-height);
	path+=" l "+flatWidth+",0";
	path+=" a "+radius+" "+radius+" 0 0 1 0 "+height;
	path+=" z";
	return path;
}
BlockGraphics.buildPath.predicate=function(x,y,width,height,isSlot,isHighlight){
	var hexEndL;
	var halfHeight=height/2;
	var bG;
	if(isHighlight){
		bG=BlockGraphics.highlight;
	} else{
		bG=BlockGraphics.predicate;
	}
	if(isSlot){
		hexEndL=bG.slotHexEndL;
	} else{
		hexEndL=bG.hexEndL;
	}
	var flatWidth=width-2*hexEndL;
	var path="";
	path+="m "+x+","+(y+halfHeight);
	path+=" "+hexEndL+","+(0-halfHeight);
	path+=" "+flatWidth+",0";
	path+=" "+hexEndL+","+halfHeight;
	path+=" "+(0-hexEndL)+","+halfHeight;
	path+=" "+(0-flatWidth)+",0";
	path+=" "+(0-hexEndL)+","+(0-halfHeight);
	path+=" z";
	return path;
}
BlockGraphics.buildPath.string=function(x,y,width,height){
	var path="";
	path+="m "+x+","+y;
	path+=" "+width+",0";
	path+=" 0,"+height;
	path+=" "+(0-width)+",0";
	path+=" z";
	return path;
}
BlockGraphics.buildPath.hat=function(x,y,width,height){
	var path="";
	var hat=BlockGraphics.hat;
	var flatWidth=width-hat.topW-BlockGraphics.command.cornerRadius;
	var flatHeight=height-BlockGraphics.command.cornerRadius*2;
	path+="m "+x+","+y;
	path+=" a "+hat.hRadius+" "+hat.vRadius+" 0 0 1 "+hat.topW+" 0";
	path+=" l "+flatWidth;	
	path+=BlockGraphics.command.path2;
	path+=flatHeight;
	path+=BlockGraphics.command.path3;
	path+=BlockGraphics.command.extraWidth-width;
	path+=BlockGraphics.command.path4;
	path+="z";
	return path;
}
BlockGraphics.buildPath.loop=function(x,y,width,height,innerHeight){
	var path="";
	var loop=BlockGraphics.loop;
	path+="m "+(x+BlockGraphics.command.cornerRadius)+","+y;
	path+=BlockGraphics.command.path1;
	path+=width-BlockGraphics.command.extraWidth;
	path+=BlockGraphics.command.path2;
	path+=height-innerHeight-2*BlockGraphics.command.cornerRadius-loop.bottomH;
	path+=BlockGraphics.command.path3;
	path+=(BlockGraphics.command.extraWidth-width+loop.side)+",0";
	path+=" "+(0-BlockGraphics.command.bumpSlantWidth)+","+BlockGraphics.command.bumpDepth;
	path+=" "+(0-BlockGraphics.command.bumpBottomWidth)+",0";
	path+=" "+(0-BlockGraphics.command.bumpSlantWidth)+","+(0-BlockGraphics.command.bumpDepth);
	path+=" "+(0-BlockGraphics.command.bumpOffset)+",0";
	path+=" a "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius+" 0 0 0 "+(0-BlockGraphics.command.cornerRadius)+" "+BlockGraphics.command.cornerRadius;
	path+=" l 0,"+(innerHeight-2*BlockGraphics.command.cornerRadius);
	path+=" a "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius+" 0 0 0 "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius;
	path+=" l "+(width-2*BlockGraphics.command.cornerRadius-loop.side);
	path+=BlockGraphics.command.path2;
	path+=loop.bottomH-2*BlockGraphics.command.cornerRadius;
	path+=BlockGraphics.command.path3;
	path+=(BlockGraphics.command.extraWidth-width);
	path+=BlockGraphics.command.path4+"l 0,";
	path+=(0-height+2*BlockGraphics.command.cornerRadius);
	path+=BlockGraphics.command.path5;
	return path;
}
BlockGraphics.buildPath.doubleLoop=function(x,y,width,height,innerHeight1,innerHeight2,midHeight){
	var path="";
	var loop=BlockGraphics.loop;
	path+="m "+(x+BlockGraphics.command.cornerRadius)+","+y;
	path+=BlockGraphics.command.path1;
	path+=width-BlockGraphics.command.extraWidth;
	var innerHeight=innerHeight1;
	var currentH=height-midHeight-innerHeight1-innerHeight2-2*BlockGraphics.command.cornerRadius-loop.bottomH;
	for(var i=0;i<2;i++){
		path+=BlockGraphics.command.path2;
		path+=currentH;
		path+=BlockGraphics.command.path3;
		path+=(BlockGraphics.command.extraWidth-width+loop.side)+",0";
		path+=" "+(0-BlockGraphics.command.bumpSlantWidth)+","+BlockGraphics.command.bumpDepth;
		path+=" "+(0-BlockGraphics.command.bumpBottomWidth)+",0";
		path+=" "+(0-BlockGraphics.command.bumpSlantWidth)+","+(0-BlockGraphics.command.bumpDepth);
		path+=" "+(0-BlockGraphics.command.bumpOffset)+",0";
		path+=" a "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius+" 0 0 0 "+(0-BlockGraphics.command.cornerRadius)+" "+BlockGraphics.command.cornerRadius;
		path+=" l 0,"+(innerHeight-2*BlockGraphics.command.cornerRadius);
		path+=" a "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius+" 0 0 0 "+BlockGraphics.command.cornerRadius+" "+BlockGraphics.command.cornerRadius;
		path+=" l "+(width-2*BlockGraphics.command.cornerRadius-loop.side);
		innerHeight=innerHeight2;
		var currentH=midHeight-2*BlockGraphics.command.cornerRadius;
	}
	path+=BlockGraphics.command.path2;
	path+=loop.bottomH-2*BlockGraphics.command.cornerRadius;
	path+=BlockGraphics.command.path3;
	path+=(BlockGraphics.command.extraWidth-width);
	path+=BlockGraphics.command.path4+"l 0,";
	path+=(0-height+2*BlockGraphics.command.cornerRadius);
	path+=BlockGraphics.command.path5;
	return path;
}
BlockGraphics.create=function(){}
BlockGraphics.create.block=function(category,group,returnsValue){
	var path=GuiElements.create.path(group);
	var fill=Colors.getGradient(category);
	path.setAttributeNS(null,"fill",fill);
	BlockGraphics.update.stroke(path,category,returnsValue);
	return path;
}
BlockGraphics.create.slot=function(group,type,category){
	var bG=BlockGraphics.reporter;
	var path=GuiElements.create.path(group);
	if(type==2){
		path.setAttributeNS(null,"fill","url(#gradient_dark_"+category+")");
	}
	else{
		path.setAttributeNS(null,"stroke",bG.slotStrokeC);
		path.setAttributeNS(null,"stroke-width",bG.slotStrokeW);
		path.setAttributeNS(null,"fill",bG.slotFill);
	}
	return path;
}
BlockGraphics.create.labelText=function(text,group){
	var bG=BlockGraphics.labelText;
	var textElement=GuiElements.create.text();
	textElement.setAttributeNS(null,"font-family",bG.font);
	textElement.setAttributeNS(null,"font-size",bG.fontSize);
	textElement.setAttributeNS(null,"font-weight",bG.fontWeight);
	textElement.setAttributeNS(null,"fill",bG.fill);
	textElement.setAttributeNS(null,"class","noselect");
	var textNode = document.createTextNode(text);
	textElement.appendChild(textNode);
	group.appendChild(textElement);
	return textElement;
}
BlockGraphics.create.valueText=function(text,group){
	var bG=BlockGraphics.valueText;
	var textElement=GuiElements.create.text();
	textElement.setAttributeNS(null,"font-family",bG.font);
	textElement.setAttributeNS(null,"font-size",bG.fontSize);
	textElement.setAttributeNS(null,"font-weight",bG.fontWeight);
	textElement.setAttributeNS(null,"fill",bG.fill);
	textElement.setAttributeNS(null,"class","noselect");
	var textNode = document.createTextNode(text);
	textElement.textNode=textNode;
	textElement.appendChild(textNode);
	group.appendChild(textElement);
	return textElement;
}

BlockGraphics.update=function(){}
BlockGraphics.update.path=function(path,x,y,width,height,type,isSlot,innerHeight1,innerHeight2,midHeight){
	var pathD;
	switch(type){
		case 0:
			pathD=BlockGraphics.buildPath.command(x,y,width,height);
			break;
		case 1:
			pathD=BlockGraphics.buildPath.reporter(x,y,width,height);
			break;
		case 2:
			pathD=BlockGraphics.buildPath.predicate(x,y,width,height,isSlot,false);
			break;
		case 3:
			pathD=BlockGraphics.buildPath.string(x,y,width,height);
			break;
		case 4:
			pathD=BlockGraphics.buildPath.hat(x,y,width,height);
			break;
		case 5:
			pathD=BlockGraphics.buildPath.loop(x,y,width,height,innerHeight1);
			break;
		case 6:
			pathD=BlockGraphics.buildPath.doubleLoop(x,y,width,height,innerHeight1,innerHeight2,midHeight);
			break;
	}
	path.setAttributeNS(null,"d",pathD);
	return path;
}
BlockGraphics.update.text=function(text,x,y){
	text.setAttributeNS(null,"x",x);
	text.setAttributeNS(null,"y",y);
}
BlockGraphics.update.glow=function(path){
	var glow=BlockGraphics.glow;
	path.setAttributeNS(null,"stroke",glow.color);
	path.setAttributeNS(null,"stroke-width",glow.strokeW);
};
BlockGraphics.update.stroke=function(path,category,returnsValue){
	if(returnsValue){
		var outline=Colors.getColor(category);
		path.setAttributeNS(null,"stroke",outline);
		path.setAttributeNS(null,"stroke-width",BlockGraphics.reporter.strokeW);
	}
	else{
		path.setAttributeNS(null,"stroke-width",0);
	}
};
BlockGraphics.buildPath.highlight=function(x,y,width,height,type,isSlot){
	var bG=BlockGraphics.highlight;
	var pathD;
	var hX=x-bG.margin;
	var hY=y-bG.margin;
	var hWidth=width+2*bG.margin;
	var hHeight=height+2*bG.margin;
	switch(type){
		case 0:
			pathD=BlockGraphics.buildPath.highlightCommand(x,y);
			break;
		case 1:
			pathD=BlockGraphics.buildPath.reporter(hX,hY,hWidth,hHeight);
			break;
		case 2:
			pathD=BlockGraphics.buildPath.predicate(hX,hY,hWidth,hHeight,isSlot,true);
			break;
		case 3:
			pathD=BlockGraphics.buildPath.string(hX,hY,hWidth,hHeight);
			break;
	}
	return pathD;
}
//Move?:
BlockGraphics.bringToFront=function(obj,layer){
	obj.remove();
	layer.appendChild(obj);
}


/*BlockGraphics.create.command=function(x,y,width,height,category){
	var pathD=BlockGraphics.buildPath.command(x,y,width,height);
	var commandPath=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	commandPath.setAttributeNS(null,"d",pathD);
	commandPath.setAttributeNS(null,"fill","url(#gradient_"+category+")");
	return commandPath;
}
BlockGraphics.create.reporter=function(x,y,width,height,category){
	var pathD=BlockGraphics.buildPath.reporter(x,y,width,height);
	var reporterPath=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	reporterPath.setAttributeNS(null,"d",pathD);
	reporterPath.setAttributeNS(null,"fill","url(#gradient_"+category+")");
	return reporterPath;
}
BlockGraphics.create.predicate=function(x,y,width,height,category,isSlot){
	var pathD=BlockGraphics.buildPath.predicate(x,y,width,height,isSlot);
	var predicatePath=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	predicatePath.setAttributeNS(null,"d",pathD);
	predicatePath.setAttributeNS(null,"fill","url(#gradient_"+category+")");
	return predicatePath;
}*/


