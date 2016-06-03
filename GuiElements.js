//Static.  Builds the UI and holds the SVG.

function GuiElements(){
	GuiElements.svg=document.getElementById("MainSvg");
	GuiElements.defs=document.getElementById("SvgDefs");
	GuiElements.setConstants();
	GuiElements.createLayers();
	GuiElements.buildUI();
}
document.addEventListener('DOMContentLoaded', function() {
    GuiElements();
}, false);
GuiElements.setConstants=function(){ //Runs the other static classes so they can initialize
	Data.setConstants();

	GuiElements.width=window.innerWidth;
	GuiElements.height=window.innerHeight;
	VectorPaths();
	BlockList();
	Colors();
	TitleBar.setGraphics();
	BlockGraphics();
	Slot.setConstants();
	Block.setConstants();
	Button.setGraphics();
	BlockPalette.setGraphics();
	TabManager.setGraphics();
	CategoryBN.setGraphics();
	MenuBnList.setGraphics();
	InputPad.setGraphics();
	CodeManager();
}
GuiElements.buildUI=function(){ //Runs other classes that build the UI
	document.body.style.backgroundColor=Colors.lightGray;
	Colors.createGradients();
	TouchReceiver();
	TitleBar();
	TabManager();
	BlockPalette();
	InputPad();
	Highlighter();
}

GuiElements.createLayers=function(){ //Creates groups to serve as layers for the SVG
	var create=GuiElements.create;
	GuiElements.layers=function(){};
	var layers=GuiElements.layers;
	layers.temp=create.layer();
	layers.aTabBg=create.layer();
	layers.activeTab=create.layer();
	layers.TabsBg=create.layer();
	layers.paletteBG=create.layer();
	layers.palette=create.layer();
	layers.catBg=create.layer();
	layers.categories=create.layer();
	layers.titleBg=create.layer();
	layers.titlebar=create.layer();
	layers.stage=create.layer();
	layers.drag=create.layer();
	layers.highlight=create.layer();
	layers.inputPad=create.layer();
	layers.stackMenu=create.layer();
	layers.tabMenu=create.layer();
}

GuiElements.create=function(){};
GuiElements.create.group=function(x,y,parent){ //Makes a group, displays it, returns it.
	var group=document.createElementNS("http://www.w3.org/2000/svg", 'g');
	group.setAttributeNS(null,"transform","translate("+x+","+y+")");
	if(parent!=null){
		parent.appendChild(group);
	}
	return group;
}
GuiElements.create.layer=function(){ //Makes a layer in the main SVG
	var layer=GuiElements.create.group(0,0,GuiElements.svg);
	return layer;
}
GuiElements.create.gradient=function(name,color1,color2){ //Creates a gradient and adds to the defs
	var gradient=document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
	gradient.setAttributeNS(null,"id",name);
	gradient.setAttributeNS(null,"x1","0%");
	gradient.setAttributeNS(null,"x2","0%");
	gradient.setAttributeNS(null,"y1","0%");
	gradient.setAttributeNS(null,"y2","100%");
	GuiElements.defs.appendChild(gradient);
	var stop1=document.createElementNS("http://www.w3.org/2000/svg", 'stop');
	stop1.setAttributeNS(null,"offset","0%");
	stop1.setAttributeNS(null,"style","stop-color:"+color1+";stop-opacity:1");
	gradient.appendChild(stop1);
	var stop2=document.createElementNS("http://www.w3.org/2000/svg", 'stop');
	stop2.setAttributeNS(null,"offset","100%");
	stop2.setAttributeNS(null,"style","stop-color:"+color2+";stop-opacity:1");
	gradient.appendChild(stop2);
}
GuiElements.create.path=function(group){
	var path=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	if(group!=null){
		group.appendChild(path);
	}
	return path;
}
GuiElements.create.text=function(){
	var textElement=document.createElementNS("http://www.w3.org/2000/svg", 'text');
	return textElement;
}
GuiElements.create.rect=function(group){
	var rect=document.createElementNS("http://www.w3.org/2000/svg", 'rect');
	if(group!=null){
		group.appendChild(rect);
	}
	return rect;
}
GuiElements.draw=function(){};
GuiElements.draw.rect=function(x,y,width,height,color){
	var rect=document.createElementNS("http://www.w3.org/2000/svg", 'rect');
	rect.setAttributeNS(null,"x",x);
	rect.setAttributeNS(null,"y",y);
	rect.setAttributeNS(null,"width",width);
	rect.setAttributeNS(null,"height",height);
	rect.setAttributeNS(null,"fill",color);
	return rect;
}
GuiElements.draw.triangle=function(x,y,width,height,color){
	var triangle=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	GuiElements.update.triangle(triangle,x,y,width,height);
	triangle.setAttributeNS(null,"fill",color);
	return triangle;
}
GuiElements.draw.trapezoid=function(x,y,width,height,slantW,color){
	var trapezoid=document.createElementNS("http://www.w3.org/2000/svg", 'path');
	GuiElements.update.trapezoid(trapezoid,x,y,width,height);
	trapezoid.setAttributeNS(null,"fill",color);
	return trapezoid;
}
GuiElements.draw.text=function(x,y,text,fontSize,color,font,weight){
	var textElement=GuiElements.create.text();
	textElement.setAttributeNS(null,"x",x);
	textElement.setAttributeNS(null,"y",y);
	textElement.setAttributeNS(null,"font-family",font);
	textElement.setAttributeNS(null,"font-size",fontSize);
	if(weight!=null){
		textElement.setAttributeNS(null,"font-weight",weight);
	}
	//textElement.setAttributeNS(null,"font-weight",bG.fontWeight);
	textElement.setAttributeNS(null,"fill",color);
	textElement.setAttributeNS(null,"class","noselect");
	var textNode = document.createTextNode(text);
	textElement.textNode=textNode;
	textElement.appendChild(textNode);
	return textElement;
}
GuiElements.update=function(){};
GuiElements.update.color=function(element,color){
	element.setAttributeNS(null,"fill",color);
}
GuiElements.update.opacity=function(element,opacity){
	element.setAttributeNS(null,"fill-opacity",opacity);
}
GuiElements.update.text=function(textE,newText){
	textE.textNode.remove();
	var textNode = document.createTextNode(newText);
	textE.textNode=textNode;
	textE.appendChild(textNode);
}
GuiElements.update.triangle=function(triangle,x,y,width,height){
	var xshift=width/2;
	var path="";
	path+="m "+x+","+y;
	path+=" "+xshift+","+(0-height);
	path+=" "+xshift+","+(height);
	path+=" z";
	triangle.setAttributeNS(null,"d",path);
}
GuiElements.update.trapezoid=function(trapezoid,x,y,width,height,slantW){
	var shortW=width-2*slantW;
	var path="";
	path+="m "+x+","+(y+height);
	path+=" "+slantW+","+(0-height);
	path+=" "+shortW+","+0;
	path+=" "+slantW+","+height;
	path+=" z";
	trapezoid.setAttributeNS(null,"d",path);
}
GuiElements.update.rect=function(rect,x,y,width,height){
	rect.setAttributeNS(null,"x",x);
	rect.setAttributeNS(null,"y",y);
	rect.setAttributeNS(null,"width",width);
	rect.setAttributeNS(null,"height",height);
}
GuiElements.move=function(){};
GuiElements.move.group=function(group,x,y){ //Move a group by changing its transform value
	group.setAttributeNS(null,"transform","translate("+x+","+y+")");
}
GuiElements.move.text=function(text,x,y){
	text.setAttributeNS(null,"x",x);
	text.setAttributeNS(null,"y",y);
}
GuiElements.measure=function(){};
GuiElements.measure.textWidth=function(textE){ //Measures an existing text SVG object
	if(textE.textContent==""){
		return 0;
	}
	var bbox=textE.getBBox();
	var textW=bbox.width;
	var parent=textE.parentNode;
	if(textW==0){
		GuiElements.layers.temp.appendChild(textE);
		bbox=textE.getBBox();
		textW=bbox.width;
		textE.remove();
		if(parent!=null){
			parent.appendChild(textE);
		}
	}
	return textW;
}
GuiElements.measure.stringWidth=function(text,font,size,weight){
	var textElement=GuiElements.create.text();
	textElement.setAttributeNS(null,"font-family",font);
	textElement.setAttributeNS(null,"font-size",size);
	if(weight!=null){
		textElement.setAttributeNS(null,"font-weight",weight);
	}
	textElement.setAttributeNS(null,"class","noselect");
	var textNode = document.createTextNode(text);
	textElement.textNode=textNode;
	textElement.appendChild(textNode);
	return GuiElements.measure.textWidth(textElement);
}
GuiElements.createGradient=function(name,color1,color2){
	var gradient=document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
	gradient.setAttributeNS(null,"id",name);
	gradient.setAttributeNS(null,"x1","0%");
	gradient.setAttributeNS(null,"x2","0%");
	gradient.setAttributeNS(null,"y1","0%");
	gradient.setAttributeNS(null,"y2","100%");
	GuiElements.defs.appendChild(gradient);
	var stop1=document.createElementNS("http://www.w3.org/2000/svg", 'stop');
	stop1.setAttributeNS(null,"offset","0%");
	stop1.setAttributeNS(null,"style","stop-color:"+color1+";stop-opacity:1");
	gradient.appendChild(stop1);
	var stop2=document.createElementNS("http://www.w3.org/2000/svg", 'stop');
	stop2.setAttributeNS(null,"offset","100%");
	stop2.setAttributeNS(null,"style","stop-color:"+color2+";stop-opacity:1");
	gradient.appendChild(stop2);
}
GuiElements.createGradientDark=function(name,color1,color2){
	var darken=GuiElements.LightenDarkenColor;
	var amt=BlockGraphics.gradients.darken;
    GuiElements.createGradient(name,darken(color2,amt),darken(color1,amt));
}
GuiElements.LightenDarkenColor=function(color,amt) {
	// Source:
	// stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
    var col = parseInt(color.slice(1),16);
    var result = (((col & 0x0000FF) / amt) | ((((col>> 8) & 0x00FF) / amt) << 8) | (((col >> 16) / amt) << 16)).toString(16);
	while(result.length<6){
		result="0"+result;
	}
	return "#"+result;
}
GuiElements.createGradients=function(){
	var grad=GuiElements.createGradient;
	var gradDark=GuiElements.createGradientDark;
	var c=BlockGraphics.gradients;
	var n="gradient_";
	grad(n+"motion",c.motion1,c.motion2);
	grad(n+"looks",c.looks1,c.looks2);
	grad(n+"sound",c.sound1,c.sound2);
	grad(n+"control",c.control1,c.control2);
	grad(n+"sensing",c.sensing1,c.sensing2);
	grad(n+"operators",c.operators1,c.operators2);
	grad(n+"variables",c.variables1,c.variables2);
	grad(n+"list",c.list1,c.list2);
	
	n="gradient_dark_";
	gradDark(n+"motion",c.motion1,c.motion2);
	gradDark(n+"looks",c.looks1,c.looks2);
	gradDark(n+"sound",c.sound1,c.sound2);
	gradDark(n+"control",c.control1,c.control2);
	gradDark(n+"sensing",c.sensing1,c.sensing2);
	gradDark(n+"operators",c.operators1,c.operators2);
	gradDark(n+"variables",c.variables1,c.variables2);
	gradDark(n+"list",c.list1,c.list2);
}