"use strict";

/* GuiElements is a static class that builds the UI and initializes the other classes.
 * It contains functions to create and modify elements of the main SVG.
 * GuiElements is run once the browser has loaded all the js and html files.
 */
function GuiElements(){
	debug.innerHTML = "";
	let svg2=document.getElementById("frontSvg");
	let svg1=document.getElementById("middleSvg");
	let svg0=document.getElementById("backSvg");
	GuiElements.svgs = [svg0, svg1, svg2];

	GuiElements.defs=document.getElementById("SvgDefs");
	GuiElements.loadInitialSettings(function(){
		GuiElements.setConstants();
		GuiElements.createLayers();
		GuiElements.dialogBlock=null;
		GuiElements.buildUI();
		HtmlServer.sendFinishedLoadingRequest();
	});
}
/* Runs GuiElements once all resources are loaded. */
document.addEventListener('DOMContentLoaded', function() {
	GuiElements.alert("Loading");
	(DebugOptions.safeFunc(GuiElements))();
}, false);
GuiElements.loadInitialSettings=function(callback){
	DebugOptions();
	Data.setConstants();
	HtmlServer();
	SettingsManager();
	GuiElements.setGuiConstants();
	GuiElements.load = {};
	GuiElements.load.version = false;
	GuiElements.load.zoom = false;
	GuiElements.load.os = false;
	GuiElements.load.lastFileName = true;
	GuiElements.load.lastFileNamed = true;
	if(!DebugOptions.shouldSkipInitSettings()) {
		var count = 0;
		var checkIfDone = function () {
			count++;
			GuiElements.alert(""+GuiElements.load.version + GuiElements.load.zoom + GuiElements.load.os + GuiElements.load.lastFileName + GuiElements.load.lastFileNamed);
			if (GuiElements.load.version && GuiElements.load.zoom && GuiElements.load.os && GuiElements.load.lastFileName && GuiElements.load.lastFileNamed) {
				callback();
			}
		};
		GuiElements.getAppVersion(function () {
			GuiElements.load.version = true;
			checkIfDone();
		});
		GuiElements.configureZoom(function () {
			GuiElements.width=window.innerWidth/GuiElements.zoomFactor;
			GuiElements.height=window.innerHeight/GuiElements.zoomFactor;
			GuiElements.load.zoom = true;
			GuiElements.checkSmallMode();
			checkIfDone();
		});
		GuiElements.getOsVersion(function(){
			GuiElements.load.os = true;
			checkIfDone();
		});
		/*SaveManager.getCurrentDocName(function(){
			GuiElements.load.lastFileName = true;
			checkIfDone();
		}, function(){
			GuiElements.load.lastFileNamed = true;
			checkIfDone();
		});*/
	}
	else{
		callback();
	}
};
GuiElements.setGuiConstants=function(){
	GuiElements.minZoom=0.25;
	GuiElements.maxZoom=4;
	GuiElements.minZoomMult=0.5;
	GuiElements.maxZoomMult=2;
	GuiElements.zoomAmount=0.1;
	GuiElements.defaultZoomMm = 246.38;
	GuiElements.defaultZoomPx = 1280;
	GuiElements.defaultZoomMultiple = 1;
	GuiElements.smallModeThreshold = 620;

	GuiElements.computedZoom = GuiElements.defaultZoomMultiple; //The computed default zoom amount for the device
	GuiElements.zoomMultiple = 1; //GuiElements.zoomFactor = zoomMultiple * computedZoom
	GuiElements.zoomFactor = GuiElements.defaultZoomMultiple;

	GuiElements.width=window.innerWidth/GuiElements.zoomFactor;
	GuiElements.height=window.innerHeight/GuiElements.zoomFactor;

	GuiElements.blockerOpacity=0.5;

	GuiElements.isKindle = false;
	GuiElements.isIos = false;
	GuiElements.isAndroid = false;

	GuiElements.paletteLayersVisible = true;
	GuiElements.smallMode = false;
};
/* Many classes have static functions which set constants such as font size, etc.
 * GuiElements.setConstants runs these functions in sequence, thereby initializing them.
 * Some classes rely on constants from eachother, so the order they execute in is important. */
GuiElements.setConstants=function(){
	/* If a class is static and does not build a part of the UI,
	then its main function is used to initialize its constants. */
	VectorPaths();
	ImageLists();
	Sound.setConstants();
	BlockList();
	Colors();
	Button.setGraphics();
	CloseButton.setGraphics();
	//If the constants are only related to the way the UI looks, the method is called setGraphics().
	DeviceStatusLight.setConstants();
	TitleBar.setGraphicsPart1();
	BlockGraphics();
	HexSlotShape.setConstants();
	EditableSlotShape.setConstants();
	RectSlotShape.setConstants();
	RoundSlotShape.setConstants();
	DropSlotShape.setConstants();

	Slot.setConstants();
	EditableSlot.setConstants();


	Block.setConstants();
	BlockPalette.setGraphics();
	CollapsibleSet.setConstants();
	CollapsibleItem.setConstants();

	TitleBar.setGraphicsPart2();
	TabManager.setGraphics();
	CategoryBN.setGraphics();
	MenuBnList.setGraphics();
	SmoothMenuBnList.setGraphics();
	Menu.setGraphics();
	DeviceMenu.setGraphics();
	TabletSensors();

	BubbleOverlay.setGraphics();
	ResultBubble.setConstants();
	BlockContextMenu.setGraphics();
	DiscoverDialog.setConstants();
	RecordingManager();
	RowDialog.setConstants();
	OpenDialog.setConstants();
	FileContextMenu.setGraphics();

	NewInputPad.setConstants();
	SoundInputPad.setConstants();
	InputWidget.NumPad.setConstants();
	InputWidget.Label.setConstants();

	ConnectMultipleDialog.setConstants();
	RobotConnectionList.setConstants();
	TabRow.setConstants();
	RecordingDialog.setConstants();
	NewDisplayBox.setGraphics();
	OverflowArrows.setConstants();
	CodeManager();
	SaveManager.setConstants();
};
/* Debugging function which displays information on screen */
GuiElements.alert=function(message){
	debug.innerHTML = message; //The iPad app does not support alert dialogs
};
/* Alerts the user that an error has occurred. Should never be called.
 * @param {string} errMessage - The error's message passed by the function that threw the error.
 */
GuiElements.throwError=function(errMessage){
	GuiElements.alert(errMessage); //Show the error in the debug area.
}
/* Once each class has its constants set, the UI can be built. UI-related classes are called. */
GuiElements.buildUI=function(){
	document.body.style.backgroundColor=Colors.lightGray; //Sets the background color of the webpage
	Colors.createGradients(); //Adds gradient definitions to the SVG for each block category
	Overlay.setStatics(); //Creates a list of open overlays
	TouchReceiver(); //Adds touch event handlers to the SVG
	TitleBar(); //Creates the title bar and the buttons contained within it.

	TabManager(); //Creates the tab-switching interface below the title bar
	BlockPalette(); //Creates the sidebar on the left with the categories and blocks
	DisplayBoxManager(); //Builds the display box for the display block to show messages in.
	/* Builds the SVG path element for the highlighter, 
	the white ring which shows which slot a Block will connect to. */
	Highlighter();
	SaveManager();
	DebugOptions.applyActions();
};
/* Makes an SVG group element (<g>) for each layer of the interface.
 * Layers are accessible in the form GuiElements.layers.[layerName]
 */
GuiElements.createLayers=function(){
	var create=GuiElements.create;//shorthand
	GuiElements.zoomGroups = [];
	GuiElements.svgs.forEach(function(svg){
		let zoomGroup = create.group(0,0,svg);
		GuiElements.zoomGroups.push(zoomGroup);
		GuiElements.update.zoom(zoomGroup,GuiElements.zoomFactor);
	});

	GuiElements.layers={};
	let i = 0;
	var layers=GuiElements.layers;
	layers.temp=create.layer(i);
	layers.aTabBg=create.layer(i);
	layers.activeTab=create.layer(i);
	layers.TabsBg=create.layer(i);
	layers.paletteBG=create.layer(i);
	layers.paletteScroll = document.getElementById("paletteScrollDiv");
	i++;
	layers.trash=create.layer(i);
	layers.catBg=create.layer(i);
	layers.categories=create.layer(i);
	layers.titleBg=create.layer(i);
	layers.titlebar=create.layer(i);
	layers.overflowArr = create.layer(i);
	layers.stage=create.layer(i);
	layers.display=create.layer(i);
	layers.drag=create.layer(i);
	layers.highlight=create.layer(i);
	layers.resultBubble=create.layer(i);
	layers.inputPad=create.layer(i);
	layers.tabMenu=create.layer(i);
	layers.dialogBlock=create.layer(i);
	layers.dialog=create.layer(i);
	layers.overlay=create.layer(i);
	layers.frontScroll = document.getElementById("frontScrollDiv");
	i++;
	layers.overlayOverlay=create.layer(i);
	layers.overlayOverlayScroll = document.getElementById("overlayOverlayScrollDiv");
};
/* GuiElements.create contains functions for creating SVG elements.
 * The element is built with minimal attributes and returned.
 * It may also be added to a group if included.
 */
GuiElements.create=function(){};
/* Makes a group, adds it to a parent group (if present), and returns it.
 * @param {number} x - The x offset of the group.
 * @param {number} y - The y offset of the group.
 * @param {SVG g} title - (optional) The parent group to add the group to.
 * @return {SVG g} - The group which was created.
 */
GuiElements.create.group=function(x,y,parent){
	DebugOptions.validateOptionalNums(x, y);
	var group=document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Make the group.
	group.setAttributeNS(null,"transform","translate("+x+","+y+")"); //Move the group to (x,y).
	if(parent!=null){ //If provided, add it to the parent.
		parent.appendChild(group);
	}
	return group; //Return the group.
}
/* Creates a group, adds it to the main SVG, and returns it. */
GuiElements.create.layer=function(depth){
	DebugOptions.validateNumbers(depth);
	let layerG = GuiElements.create.group(0,0,GuiElements.zoomGroups[depth]);
	let showHideLayer = GuiElements.create.group(0, 0, layerG);
	let layer = {};
	layer.appendChild = showHideLayer.appendChild.bind(showHideLayer);
	layer.setAttributeNS = showHideLayer.setAttributeNS.bind(showHideLayer);
	layer.hide = showHideLayer.remove.bind(showHideLayer);
	layer.show = function(){
		layerG.appendChild(showHideLayer);
	};
	return layer;
};
/* Creates a linear SVG gradient and adds it to the SVG defs.
 * @param {text} id - The id of the gradient (needed to reference it later).
 * @param {string} color1 - color in form "#fff" of the top of the gradient.
 * @param {string} color2 - color in form "#fff" of the bottom of the gradient.
 */
GuiElements.create.gradient=function(id,color1,color2){ //Creates a gradient and adds to the defs
	DebugOptions.validateNonNull(color1, color2);
	var gradient=document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
	gradient.setAttributeNS(null,"id",id); //Set attributes.
	gradient.setAttributeNS(null,"x1","0%");
	gradient.setAttributeNS(null,"x2","0%");
	gradient.setAttributeNS(null,"y1","0%");
	gradient.setAttributeNS(null,"y2","100%");
	GuiElements.defs.appendChild(gradient); //Add it to the SVG's defs
	var stop1=document.createElementNS("http://www.w3.org/2000/svg", 'stop'); //Create stop 1.
	stop1.setAttributeNS(null,"offset","0%");
	stop1.setAttributeNS(null,"style","stop-color:"+color1+";stop-opacity:1");
	gradient.appendChild(stop1);
	var stop2=document.createElementNS("http://www.w3.org/2000/svg", 'stop'); //Create stop 2.
	stop2.setAttributeNS(null,"offset","100%");
	stop2.setAttributeNS(null,"style","stop-color:"+color2+";stop-opacity:1");
	gradient.appendChild(stop2);
}
/* Creates an SVG path element and returns it.
 * @param {SVG g} title - (optional) The parent group to add the group to.
 * @return {SVG path} - The path which was created.
 */
GuiElements.create.path=function(group){
	var path=document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	if(group!=null){ //Add it to the parent group if present.
		group.appendChild(path);
	}
	return path; //Return the path.
}
/* Creates an SVG text element and returns it.
 * @return {SVG text} - The text which was created.
 */
GuiElements.create.text=function(){
	var textElement=document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create text.
	return textElement; //Return the text.
};
GuiElements.create.image=function(){
	var imageElement=document.createElementNS("http://www.w3.org/2000/svg", 'image'); //Create text.
	return imageElement; //Return the text.
};
GuiElements.create.foreignObject = function(group){
	var obj = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
	if(group != null){
		group.appendChild(obj);
	}
	return obj;
};
GuiElements.create.svg = function(group){
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	if(group != null){
		group.appendChild(svg);
	}
	return svg;
};
GuiElements.create.scrollDiv = function(group){
	var div = document.createElement("div");
	div.style.position = "absolute";
	if(group != null){
		group.appendChild(div);
	}
	return div;
};
/* Creates an SVG rect element, adds it to a parent group (if present), and returns it.
 * @param {SVG g} title - (optional) The parent group to add the group to.
 * @return {SVG rect} - The rect which was created.
 */
GuiElements.create.rect=function(group){
	var rect=document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create the rect.
	if(group!=null){ //Add it to the parent group if present.
		group.appendChild(rect);
	}
	return rect; //Return the rect.
}
/* GuiElements.create contains functions that create SVG elements and assign thier attributes
 * so they are ready to be drawn on the screen. The element is then returned. 
 * It may also be added to a group if included.
 */
GuiElements.draw=function(){};
/* Creates a filled SVG rect element at a certain location with specified dimensions and returns it.
 * @param {number} x - The rect's x coord.
 * @param {number} y - The rect's y coord.
 * @param {number} width - The rect's width.
 * @param {number} height - The rect's height.
 * @param {string} color - (optional) The rect's fill color in the form "#fff".
 * @return {SVG rect} - The rect which was created.
 */
GuiElements.draw.rect=function(x,y,width,height,color){
	DebugOptions.validateNumbers(x, y, width, height);
	var rect=document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create the rect.
	rect.setAttributeNS(null,"x",x); //Set its attributes.
	rect.setAttributeNS(null,"y",y);
	rect.setAttributeNS(null,"width",width);
	rect.setAttributeNS(null,"height",height);
	if(color!=null) {
		rect.setAttributeNS(null, "fill", color);
	}
	return rect; //Return the rect.
}
/* Creates a filled, triangular SVG path element with specified dimensions and returns it.
 * @param {number} x - The path's x coord.
 * @param {number} y - The path's y coord.
 * @param {number} width - The path's width. (it is an isosceles triangle)
 * @param {number} height - The path's height. (negative will make it point down)
 * @param {string} color - The path's fill color in the form "#fff".
 * @return {SVG path} - The path which was created.
 */
GuiElements.draw.triangle=function(x,y,width,height,color){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height);
	var triangle=document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.triangle(triangle,x,y,width,height); //Set its path description (points).
	triangle.setAttributeNS(null,"fill",color); //Set the fill.
	return triangle; //Return the finished triangle.
};
GuiElements.draw.triangleFromPoint = function(x, y, width, height, color){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height);
	var triangle=document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.triangleFromPoint(triangle,x,y,width,height); //Set its path description (points).
	triangle.setAttributeNS(null,"fill",color); //Set the fill.
	return triangle; //Return the finished triangle.
};
/* Creates a filled, trapezoid-shaped SVG path element with specified dimensions and returns it.
 * @param {number} x - The path's x coord.
 * @param {number} y - The path's y coord.
 * @param {number} width - The path's width. (it is an isosceles trapezoid)
 * @param {number} height - The path's height. (negative will make it point down)
 * @param {number} slantW - The amount the trapezoid slopes in.
 * @param {string} color - The path's fill color in the form "#fff".
 * @return {SVG path} - The path which was created.
 */
GuiElements.draw.trapezoid=function(x,y,width,height,slantW,color){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height, slantW);
	var trapezoid=document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.trapezoid(trapezoid,x,y,width,height,slantW); //Set its path description.
	trapezoid.setAttributeNS(null,"fill",color); //Set the fill.
	return trapezoid; //Return the finished trapezoid.
}
GuiElements.draw.circle=function(cx,cy,radius,color,group){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(cx, cy, radius);
	var circle=document.createElementNS("http://www.w3.org/2000/svg",'circle');
	circle.setAttributeNS(null,"cx",cx);
	circle.setAttributeNS(null,"cy",cy);
	circle.setAttributeNS(null,"r",radius);
	circle.setAttributeNS(null,"fill",color);
	if(group!=null){
		group.appendChild(circle);
	}
	return circle;
};
GuiElements.draw.image=function(imageName,x,y,width,height,parent){
	DebugOptions.validateNumbers(x, y, width, height);
	var imageElement=GuiElements.create.image();
	imageElement.setAttributeNS(null,"x",x);
	imageElement.setAttributeNS(null,"y",y);
	imageElement.setAttributeNS(null,"width",width);
	imageElement.setAttributeNS(null,"height",height);
	//imageElement.setAttributeNS('http://www.w3.org/2000/xlink','href', "Images/"+imageName+".png");
	imageElement.setAttributeNS( "http://www.w3.org/1999/xlink", "href", "Images/"+imageName+".png" );
	imageElement.setAttributeNS(null, 'visibility', 'visible');
	if(parent!=null) {
		parent.appendChild(imageElement);
	}
	return imageElement;
};
/* Creates a SVG text element with text in it with specified formatting and returns it.
 * @param {number} x - The text element's x coord.
 * @param {number} y - The text element's y coord.
 * @param {string} text - The text contained within the element.
 * @param {number} fontSize - The font size of the text.
 * @param {string} color - The text's color in the form "#fff".
 * @param {string} font - the font family of the text.
 * @param {string} weight - (optional) the weight ("bold","normal",etc.) of the text.
 * @return {SVG text} - The text element which was created.
 */
GuiElements.draw.text=function(x,y,text,fontSize,color,font,weight){
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y);
	var textElement=GuiElements.create.text();
	textElement.setAttributeNS(null,"x",x);
	textElement.setAttributeNS(null,"y",y);
	textElement.setAttributeNS(null,"font-family",font);
	textElement.setAttributeNS(null,"font-size",fontSize);
	if(weight!=null){
		textElement.setAttributeNS(null,"font-weight",weight);
	}
	textElement.setAttributeNS(null,"fill",color);
	textElement.setAttributeNS(null,"class","noselect"); //Make sure it can't be selected.
	text+=""; //Make text into a string
	text=text.replace(new RegExp(" ", 'g'), String.fromCharCode(160)); //Replace space with nbsp
	var textNode = document.createTextNode(text);
	textElement.textNode=textNode;
	textElement.appendChild(textNode);
	return textElement;
}
/* GuiElements.update contains functions that modify the attributes of existing SVG elements.
 * They do not return anything.
 */
GuiElements.update=function(){};
/* Changes the fill color (or text color) of any SVG element.
 * @param {SVG element} element - The element to be recolored.
 * @param {string} color - The element's new color in the form "#fff".
 */
GuiElements.update.color=function(element,color){
	DebugOptions.validateNonNull(color);
	element.setAttributeNS(null,"fill",color); //Recolors the element.
}
/* Changes the fill opacity of any SVG element.
 * @param {SVG element} element - The element to be modified.
 * @param {number} color - The element's new opacity (from 0 to 1).
 */
GuiElements.update.opacity=function(element,opacity){
	element.setAttributeNS(null,"fill-opacity",opacity); //Sets the opacity.
}
/* Sets an SVG element's stroke
 * @param {SVG element} element - The element to be modified.
 * @param {string} color - The element's new color in the form "#fff".
 * @param {number} strokeW - The width of the stroke
 */
GuiElements.update.stroke=function(element,color,strokeW){
	DebugOptions.validateNonNull(color);
	element.setAttributeNS(null,"stroke",color);
	element.setAttributeNS(null,"stroke-width",strokeW);
};
/* Changes the text of an SVG text element.
 * @param {SVG text} textE - The text element to be modified.
 * @param {string} newText - The element's new text.
 */
GuiElements.update.text=function(textE,newText){
	newText+=""; //Make newText into a string
	newText=newText.replace(new RegExp(" ", 'g'), String.fromCharCode(160)); //Replace space with nbsp
	if(textE.textNode!=null) {
		textE.textNode.remove(); //Remove old text.
	}
	var textNode = document.createTextNode(newText); //Create new text.
	textE.textNode=textNode; //Adds a reference for easy removal.
	textE.appendChild(textNode); //Adds text to element.
}
/* Changes the text of an SVG text element and removes ending characters until the width is less that a max width.
 * Adds "..." if characters are removed.
 * @param {SVG text} textE - The text element to be modified.
 * @param {string} text - The element's new text.
 * @param {number} maxWidth - When finished, the width of the text element will be less that this number.
 */
GuiElements.update.textLimitWidth=function(textE,text,maxWidth){
	GuiElements.update.text(textE,text);
	var currentWidth=GuiElements.measure.textWidth(textE);
	if(currentWidth<maxWidth||text==""){
		return;
	}
	var chars=1;
	var maxChars=text.length;
	var currentText;
	while(chars<=maxChars){
		currentText=text.substring(0,chars);
		GuiElements.update.text(textE,currentText+"...");
		currentWidth=GuiElements.measure.textWidth(textE);
		if(currentWidth>maxWidth){
			chars--;
			break;
		}
		chars++;
	}
	currentText=text.substring(0,chars);
	GuiElements.update.text(textE,currentText+"...");
};
/* Changes the path description of an SVG path object to make it a triangle.
 * @param {SVG path} pathE - The path element to be modified.
 * @param {number} x - The path's new x coord.
 * @param {number} y - The path's new y coord.
 * @param {number} width - The path's new width. (it is an isosceles triangle)
 * @param {number} height - The path's new height. (negative will make it point down)
 */
GuiElements.update.triangle=function(pathE,x,y,width,height){
	DebugOptions.validateNumbers(x, y, width, height);
	var xshift=width/2;
	var path="";
	path+="m "+x+","+y; //Draws bottom-left point.
	path+=" "+xshift+","+(0-height); //Draws top-middle point.
	path+=" "+xshift+","+(height); //Draws bottom-right point.
	path+=" z"; //Closes path.
	pathE.setAttributeNS(null,"d",path); //Sets path description.
};
GuiElements.update.triangleFromPoint = function(pathE, x, y, width, height, vertical){
	DebugOptions.validateNumbers(x, y, width, height);
	if(vertical == null){
		vertical = 0;
	}

	var xshift=width/2;
	var path="";
	path+="m "+x+","+y; //Draws top-middle point.
	if(vertical) {
		path += " " + xshift + "," + (height);
		path += " " + (0 - width) + ",0";
	} else{
		path += " " + (height) + "," + xshift;
		path += " 0," + (0 - width);
	}
	path+=" z"; //Closes path.
	pathE.setAttributeNS(null,"d",path); //Sets path description.
};
/* Changes the path description of an SVG path object to make it a trapezoid.
 * @param {SVG path} pathE - The path element to be modified.
 * @param {number} x - The path's new x coord.
 * @param {number} y - The path's new y coord.
 * @param {number} width - The path's new width. (it is an isosceles trapezoid)
 * @param {number} height - The path's new height. (negative will make it point down)
 * @param {number} slantW - The amount the trapezoid slopes in.
 */
GuiElements.update.trapezoid=function(pathE,x,y,width,height,slantW){
	DebugOptions.validateNumbers(x, y, width, height, slantW);
	var shortW=width-2*slantW; //The width of the top of the trapezoid.
	var path="";
	path+="m "+x+","+(y+height); //Draws the points.
	path+=" "+slantW+","+(0-height);
	path+=" "+shortW+","+0;
	path+=" "+slantW+","+height;
	path+=" z";
	pathE.setAttributeNS(null,"d",path); //Sets path description.
}
/* Moves and resizes an SVG rect element.
 * @param {SVG rect} rect - The rect element to be modified.
 * @param {number} x - The rect's new x coord.
 * @param {number} y - The rect's new y coord.
 * @param {number} width - The rect's new width.
 * @param {number} height - The rect's new height.
 */
GuiElements.update.rect=function(rect,x,y,width,height){
	DebugOptions.validateNumbers(x, y, width, height);
	rect.setAttributeNS(null,"x",x);
	rect.setAttributeNS(null,"y",y);
	rect.setAttributeNS(null,"width",width);
	rect.setAttributeNS(null,"height",height);
}
/* Used for zooming the main zoomGroup which holds the ui */
GuiElements.update.zoom=function(group,scale){
	DebugOptions.validateNumbers(scale);
	group.setAttributeNS(null,"transform","scale("+scale+")");
};
GuiElements.update.image=function(imageE,newImageName){
	//imageE.setAttributeNS('http://www.w3.org/2000/xlink','href', "Images/"+newImageName+".png");
	imageE.setAttributeNS( "http://www.w3.org/1999/xlink", "href", "Images/"+newImageName+".png" );
};
GuiElements.update.smoothScrollSet=function(div, svg, zoomG, x, y, width, height, innerWidth, innerHeight) {
	DebugOptions.validateNonNull(div, svg, zoomG);
	DebugOptions.validateNumbers(x, y, width, height, innerWidth, innerHeight);
	/*foreignObj.setAttributeNS(null,"x",x);
	foreignObj.setAttributeNS(null,"y",y);
	foreignObj.setAttributeNS(null,"width",width * zoom);
	foreignObj.setAttributeNS(null,"height",height * zoom);*/

	var scrollY = innerHeight > height;
	var scrollX = innerWidth > width;
	div.classList.remove("noScroll");
	div.classList.remove("smoothScrollXY");
	div.classList.remove("smoothScrollX");
	div.classList.remove("smoothScrollY");
	if(scrollX && scrollY) {
		div.classList.add("smoothScrollXY");
	} else if(scrollX) {
		div.classList.add("smoothScrollX");
	} else if(scrollY) {
		div.classList.add("smoothScrollY");
	} else {
		div.classList.add("noScroll");
	}

	var zoom = GuiElements.zoomFactor;

	div.style.top = y + "px";
	div.style.left = x + "px";
	div.style.width = (width * zoom) + "px";
	div.style.height = (height * zoom) + "px";

	svg.setAttribute('width', innerWidth * zoom);
	svg.setAttribute('height', innerHeight * zoom);

	GuiElements.update.zoom(zoomG, zoom);
};

GuiElements.makeClickThrough = function(svgE){
	svgE.style.pointerEvents = "none";
};
/* GuiElements.move contains functions that move existing SVG elements.
 * They do not return anything.
 */
GuiElements.move=function(){};
/* Moves a group by changing its transform value.
 * @param {SVG g} group - The group to move.
 * @param {number} x - The new x offset of the group.
 * @param {number} y - The new y offset of the group.
 * @param {number} zoom - (Optional) The amount the group should be scaled.
 */
GuiElements.move.group=function(group,x,y,zoom){
	DebugOptions.validateNumbers(x,y);
	if(zoom == null) {
		group.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
	}
	else{
		group.setAttributeNS(null, "transform", "matrix(" + zoom + ",0,0," + zoom + "," + x + "," + y + ")");
	}
};
/* Moves an SVG text element.
 * @param {SVG text} text - The text to move.
 * @param {number} x - The new x coord of the text.
 * @param {number} y - The new y coord of the text.
 */
GuiElements.move.text=function(text,x,y){
	DebugOptions.validateNumbers(x,y);
	text.setAttributeNS(null,"x",x);
	text.setAttributeNS(null,"y",y);
};
/* Moves an SVG element.
 * @param {SVG element} element - The element to move.
 * @param {number} x - The new x coord of the element.
 * @param {number} y - The new y coord of the element.
 */
GuiElements.move.element=function(element,x,y){
	DebugOptions.validateNumbers(x,y);
	element.setAttributeNS(null,"x",x);
	element.setAttributeNS(null,"y",y);
};
/* Creates a clipping path (crops item) of the specified size and adds to the element if provided.
 * @param {string} id - The id to use for the clipping path.
 * @param {number} x - The x coord of the clipping path.
 * @param {number} y - The y coord of the clipping path.
 * @param {number} width - The width of the clipping path.
 * @param {number} height - The height of the clipping path.
 * @param {SVG element} element - (optional) The element the path should be added to.
 * @return {SVG clipPath} - The finished clipping path.
 */
GuiElements.clip=function(x,y,width,height,element){
	DebugOptions.validateNumbers(x,y,width,height);
	var id=Math.random()+"";
	var clipPath=document.createElementNS("http://www.w3.org/2000/svg", 'clipPath'); //Create the rect.
	var clipRect=GuiElements.draw.rect(x,y,width,height);
	clipPath.appendChild(clipRect);
	clipPath.setAttributeNS(null,"id",id);
	GuiElements.defs.appendChild(clipPath);
	if(element!=null){
		element.setAttributeNS(null,"clip-path","url(#"+id+")");
	}
	return clipPath;
};
/* GuiElements.measure contains functions that measure parts of the UI.
 * They return the measurement.
 */
GuiElements.measure=function(){};
/* Measures the width of an existing SVG text element.
 * @param {SVG text} textE - The text element to measure.
 * @return {number} - The width of the text element.
 */
GuiElements.measure.textWidth=function(textE){ //Measures an existing text SVG element
	return GuiElements.measure.textDim(textE,false);
};
GuiElements.measure.textHeight=function(textE){ //Measures an existing text SVG element
	return GuiElements.measure.textDim(textE,true);
};
/* Measures the width/height of an existing SVG text element.
 * @param {SVG text} textE - The text element to measure.
 * @param {bool} height - true/false for width/height, respectively.
 * @return {number} - The width/height of the text element.
 */
GuiElements.measure.textDim=function(textE, height){ //Measures an existing text SVG element
	if(textE.textContent==""){ //If it has no text, the width is 0.
		return 0;
	}
	//Gets the bounding box, but that is 0 if it isn't visible on the screen.
	var bbox=textE.getBBox();
	var textD=bbox.width; //Gets the width of the bounding box.
	if(height){
		textD=bbox.height; //Gets the height of the bounding box.
	}
	if(textD==0){ //The text element probably is not visible on the screen.
		var parent=textE.parentNode; //Store the text element's current (hidden) parent.
		GuiElements.layers.temp.appendChild(textE); //Change its parent to one we know is visible.
		bbox=textE.getBBox(); //Now get its bounding box.
		textD=bbox.width;
		if(height){
			textD=bbox.height;
		}
		textE.remove(); //Remove it from the temp layer.
		if(parent!=null){
			parent.appendChild(textE); //Add it back to its old parent.
		}
	}
	return textD; //Return the width/height.
};


/* Measures the width of a string if it were used to create a text element with certain formatting.
 * @param {string} text - The string to measure.
 * @param {string} font - The font family of the text element.
 * @param {string} font - The font size of the text element.
 * @param {string} weight - (optional) the weight ("bold","normal",etc.) of the text element.
 * @return {number} - The width of the text element made using the string.
 */
GuiElements.measure.stringWidth=function(text,font,size,weight){
	var textElement=GuiElements.create.text(); //Make the text element.
	textElement.setAttributeNS(null,"font-family",font); //Set the attributes.
	textElement.setAttributeNS(null,"font-size",size);
	if(weight!=null){ //Set weight if specified.
		textElement.setAttributeNS(null,"font-weight",weight);
	}
	textElement.setAttributeNS(null,"class","noselect"); //Make sure it can't be selected.
	var textNode = document.createTextNode(text); //Add the text to the text element.
	textElement.textNode=textNode;
	textElement.appendChild(textNode);
	return GuiElements.measure.textWidth(textElement); //Measure it.
};
GuiElements.measure.position = function(element) {
	var top = 0, left = 0;
	do {
		top += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);

	return {
		top: top,
		left: left
	};
	/* https://stackoverflow.com/questions/1480133/how-can-i-get-an-objects-absolute-position-on-the-page-in-javascript */
};
/* Displays the result of a reporter or predicate Block in a speech bubble next to that block.
 * @param {string} value - The value to display
 * @fix This function has not been created yet.
 */
GuiElements.displayValue=function(value,x,y,width,height, error){
	if(error == null){
		error = false;
	}
	var leftX = x;
	var rightX = x + width;
	var upperY=y;
	var lowerY=y+height;
	new ResultBubble(leftX, rightX,upperY,lowerY,value, error);
};
/* Loads the version number from version.js */
GuiElements.getAppVersion=function(callback){
	GuiElements.appVersion = FrontendVersion;
	callback();
};
GuiElements.getOsVersion=function(callback){
	HtmlServer.sendRequestWithCallback("properties/os", function(resp){
		GuiElements.osVersion = resp;
		var parts = resp.split(" ");
		GuiElements.isKindle = (parts.length >= 1 && parts[0] === "Kindle");
		GuiElements.isAndroid = (parts.length >= 1 && parts[0] === "Android") || GuiElements.isKindle;
		GuiElements.isIos = (parts.length >= 1 && parts[0] === "iOS");
		callback();
	}, function(){
		GuiElements.osVersion="";
		GuiElements.isKindle = false;
		callback();
	});
};
/* Creates a black rectangle to block interaction with the main screen.  Used for dialogs. */
GuiElements.blockInteraction=function(){
	if(GuiElements.dialogBlock==null) {
		var rect = GuiElements.draw.rect(0, 0, GuiElements.width, GuiElements.height);
		GuiElements.update.opacity(rect,GuiElements.blockerOpacity);
		GuiElements.layers.dialogBlock.appendChild(rect);
		TouchReceiver.touchInterrupt();
		GuiElements.dialogBlock=rect;
	}
};
GuiElements.unblockInteraction=function() {
	if(GuiElements.dialogBlock!=null) {
		GuiElements.dialogBlock.remove();
		GuiElements.dialogBlock=null;
	}
};
GuiElements.updateDialogBlockZoom = function(){
	if(GuiElements.dialogBlock!=null) {
		GuiElements.update.rect(GuiElements.dialogBlock, 0, 0, GuiElements.width, GuiElements.height);
	}
};
/* Tells UI parts that zoom has changed. */
GuiElements.updateZoom=function(){
	GuiElements.zoomFactor = GuiElements.zoomMultiple * GuiElements.computedZoom;
	GuiElements.zoomGroups.forEach(function(zoomGroup){
		GuiElements.update.zoom(zoomGroup,GuiElements.zoomFactor);
	});
	HtmlServer.setSetting("zoom",GuiElements.zoomMultiple);
	GuiElements.updateDims();
};
GuiElements.updateDimsPreview = function(newWidth, newHeight){
	GuiElements.width=newWidth/GuiElements.zoomFactor;
	GuiElements.height=newHeight/GuiElements.zoomFactor;
	GuiElements.passUpdateZoom();
};
GuiElements.updateDims = function(){
	GuiElements.width=window.innerWidth/GuiElements.zoomFactor;
	GuiElements.height=window.innerHeight/GuiElements.zoomFactor;
	GuiElements.passUpdateZoom();
};
GuiElements.passUpdateZoom = function(){
	Overlay.closeOverlaysExcept(TitleBar.viewMenu);
	GuiElements.checkSmallMode();
	DisplayBoxManager.updateZoom();
	TitleBar.updateZoomPart1();
	BlockPalette.updateZoom();
	TitleBar.updateZoomPart2();
	TabManager.updateZoom();
	GuiElements.updateDialogBlockZoom();
	RowDialog.updateZoom();
};
GuiElements.configureZoom = function(callback){
	const GE = GuiElements;
	SettingsManager.loadSettings(function(){
		const callbackFn = function(){
			GE.zoomMultiple = SettingsManager.zoom.getValue();
			GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			if(GE.zoomFactor < GuiElements.minZoom || GE.zoomFactor > GuiElements.maxZoom || isNaN(GE.zoomFactor)){
				GE.zoomMultiple = 1;
				SettingsManager.zoom.writeValue(1);
				GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			}
			if(GE.zoomFactor < GuiElements.minZoom || GE.zoomFactor > GuiElements.maxZoom || isNaN(GE.zoomFactor)){
				GE.zoomMultiple = 1;
				GE.computedZoom = GE.defaultZoomMultiple;
				SettingsManager.zoom.writeValue(1);
				GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			}
			callback();
		};
		HtmlServer.sendRequestWithCallback("properties/dims",function(response){
			GE.computedZoom = GE.computeZoomFromDims(response);
			callbackFn();
		}, function(){
			callbackFn();
		});
	});
};
/* Takes a response from the properties/dims request and computes and sets the appropriate zoom level
 * @param {string} dims - The response from properties/dims
 */
GuiElements.computeZoomFromDims=function(dims){
	//GuiElements.alert("Got dimensions from device.  Computing zoom.");
	//GuiElements.alert("received dims: " + dims);
	var parts = dims.split(",");
	if(parts.length==2) {
		var widthMm = parseFloat(parts[0]);
		var heightMm = parseFloat(parts[1]);
		var diagMm = Math.sqrt(widthMm * widthMm + heightMm * heightMm);
		var widthPx = window.innerWidth;
		var heightPx = window.innerHeight;
		var diagPx = Math.sqrt(widthPx * widthPx + heightPx * heightPx);
		var zoom = (diagPx * GuiElements.defaultZoomMm) / (GuiElements.defaultZoomPx * diagMm);
		//GuiElements.alert("Computed zoom to: " + zoom + " diagPx:" + diagPx + " diagMm:" + diagMm);
		return zoom * GuiElements.defaultZoomMultiple;
	}
	else{
		return 1;
	}
};
GuiElements.relToAbsX = function(x){
	return x * GuiElements.zoomFactor;
};
GuiElements.relToAbsY = function(y){
	return y * GuiElements.zoomFactor;
};
GuiElements.hidePaletteLayers = function(skipUpdate){
	if(skipUpdate == null){
		skipUpdate = false;
	}
	let GE = GuiElements;
	if(GuiElements.paletteLayersVisible){
		GuiElements.paletteLayersVisible = false;
		SettingsManager.sideBarVisible.writeValue("false");
		GE.layers.paletteBG.hide();
		GE.layers.paletteScroll.style.visibility = "hidden";
		GE.layers.trash.hide();
		GE.layers.catBg.hide();
		GE.layers.categories.hide();
		if(!skipUpdate) {
			TabManager.updateZoom();
		}
	}
};
GuiElements.showPaletteLayers = function(skipUpdate){
	let GE = GuiElements;
	if(skipUpdate == null){
		skipUpdate = false;
	}
	if(!GuiElements.paletteLayersVisible){
		GuiElements.paletteLayersVisible = true;
		SettingsManager.sideBarVisible.writeValue("true");
		GE.layers.paletteBG.show();
		GE.layers.paletteScroll.style.visibility = "visible";
		GE.layers.trash.show();
		GE.layers.catBg.show();
		GE.layers.categories.show();
		if(!skipUpdate) {
			TabManager.updateZoom();
		}
	}
};
GuiElements.checkSmallMode = function(){
	let GE = GuiElements;
	GuiElements.smallMode = GuiElements.width < GuiElements.relToAbsX(GuiElements.smallModeThreshold);
	if(!GE.smallMode && !GE.paletteLayersVisible) {
		GE.showPaletteLayers(true);
	}
	if(!GE.smallMode && SettingsManager.sideBarVisible.getValue() !== "true") {
		SettingsManager.sideBarVisible.writeValue("true");
	}
};