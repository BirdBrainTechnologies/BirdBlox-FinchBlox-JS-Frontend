//Highlights where the current block will go
function Highlighter(){
	Highlighter.path=Highlighter.createPath();
	Highlighter.visible=false;
}
Highlighter.createPath=function(){
	var bG=BlockGraphics.highlight;
	var path=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	path.setAttributeNS(null,"stroke",bG.strokeC);
	path.setAttributeNS(null,"stroke-width",bG.strokeW);
	path.setAttributeNS(null,"fill","none");
	return path;
}
Highlighter.highlight=function(x,y,width,height,type,isSlot,isGlowing){
	var myX = CodeManager.dragAbsToRelX(x);
	var myY = CodeManager.dragAbsToRelX(y);
	var pathD=BlockGraphics.buildPath.highlight(myX, myY, width,height,type,isSlot);
	Highlighter.path.setAttributeNS(null,"d",pathD);
	if(!Highlighter.visible){
		GuiElements.layers.highlight.appendChild(Highlighter.path);
		Highlighter.visible=true;
	}
	var bG=BlockGraphics.highlight;
	if(isGlowing!=null&&isGlowing){
		Highlighter.path.setAttributeNS(null,"stroke",bG.strokeDarkC);
	}
	else{
		Highlighter.path.setAttributeNS(null,"stroke",bG.strokeC);
	}
};
Highlighter.hide=function(){
	if(Highlighter.visible){
		Highlighter.path.remove();
		Highlighter.visible=false;
	}
};