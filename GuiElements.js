"use strict";

/* GuiElements is a static class that builds the UI and initializes the other classes.
 * It contains functions to create and modify elements of the main SVG.
 * GuiElements is run once the browser has loaded all the js and html files.
 * It's one of the less organized classes and has quite a lot of functions in it.
 * TODO: Refactor GuiElements moving the parts that deal with getting device properties to a different class
 */
function GuiElements() {

	// Clear the debug span
	document.getElementById("debug").innerHTML = "";
	// Find parts of the html and store them
	let svg2 = document.getElementById("frontSvg");
	let svg1 = document.getElementById("middleSvg");
	let svg0 = document.getElementById("backSvg");
	GuiElements.svgs = [svg0, svg1, svg2];
	GuiElements.defs = document.getElementById("SvgDefs");
	GuiElements.loaded = false;
	// Load settings from backend
	GuiElements.loadInitialSettings(function() {
		// Build the UI
		GuiElements.setLanguage();
		GuiElements.setConstants();
		GuiElements.createLayers();
		GuiElements.dialogBlock = null;
		GuiElements.buildUI();
		HtmlServer.sendFinishedLoadingRequest();
		GuiElements.loaded = true;
	});
}

/* Runs GuiElements once all resources are loaded. */
document.addEventListener('DOMContentLoaded', function() {
	GuiElements.alert("Loading");
	(DebugOptions.safeFunc(GuiElements))();
}, false);

/** Redraws UI if screen dimensions change
  *  In iOS, this function is called before the new sizes are set. Still, it is
	*  the most reliable way of getting the correct screen size. iOS calls
	*  GuiElements.updateDimsPreview with approximate dimensions, then this
	*  function will add true dimensions after a moment.
  */
window.onresize = function() {
	//if (GuiElements.loaded && !GuiElements.isIos) {
		//GuiElements.updateDims();
	//}
	if (GuiElements.loaded) {
		if (GuiElements.isIos) {
	    setTimeout(function() { GuiElements.updateDims(); }, 500);
		} else {
			GuiElements.updateDims();
		}
	}
};

GuiElements.setLanguage = function() {
	//Check the session storage for a user selected language
	const userSelectedLang = sessionStorage.getItem("language");
  if (userSelectedLang != undefined && userSelectedLang != null){
    Language.lang = userSelectedLang;
	}

	var lnk = document.createElement('link');
  lnk.type='text/css';
  lnk.rel='stylesheet';
	if (Language.rtlLangs.indexOf(Language.lang) === -1) {
  	lnk.href='MyCSS.css';
	} else {
		lnk.href='MyCSS_rtl.css';
		Language.isRTL = true;
		var html = document.getElementsByTagName('html')[0];
		html.setAttribute("dir", "rtl");
	}
	document.getElementsByTagName('head')[0].appendChild(lnk);
}

/** Sets constants relating to screen dimensions and the Operating System */
GuiElements.setGuiConstants = function() {
	GuiElements.minZoom = 0.25;
	GuiElements.maxZoom = 4;
	GuiElements.minZoomMult = 0.5;
	GuiElements.maxZoomMult = 2;
	GuiElements.zoomAmount = 0.1;
	GuiElements.defaultZoomMm = 246.38;
	GuiElements.defaultZoomPx = 1280;
	GuiElements.defaultZoomMultiple = 1;
	GuiElements.smallModeThreshold = 620;

	GuiElements.computedZoom = GuiElements.defaultZoomMultiple; //The computed default zoom amount for the device
	GuiElements.zoomMultiple = 1; //GuiElements.zoomFactor = zoomMultiple * computedZoom
	GuiElements.zoomFactor = GuiElements.defaultZoomMultiple;

	GuiElements.width = window.innerWidth / GuiElements.zoomFactor;
	GuiElements.height = window.innerHeight / GuiElements.zoomFactor;

	GuiElements.blockerOpacity = 0.5;

	GuiElements.isKindle = false;
	GuiElements.isIos = false;
	GuiElements.isAndroid = false;

	GuiElements.paletteLayersVisible = true;
	GuiElements.smallMode = false;
};
/**
 * Many classes have static functions which set constants such as font size, etc.
 * GuiElements.setConstants runs these functions in sequence, thereby initializing them.
 * Some classes rely on constants from each other, so the order they execute in is important.
 */
GuiElements.setConstants = function() {
	/* If a class is static and does not build a part of the UI,
	then its main function is used to initialize its constants. */
	VectorPaths();
	ImageLists();
	DialogManager();
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
	SmoothMenuBnList.setGraphics();
	Menu.setGraphics();
	DeviceMenu.setGraphics();
	BatteryMenu.setGraphics();
	TabletSensors();

	BubbleOverlay.setGraphics();
	ResultBubble.setConstants();
	BlockContextMenu.setGraphics();
	RecordingManager();
	RowDialog.setConstants();
	OpenDialog.setConstants();
	FileContextMenu.setGraphics();
	//LevelMenu.setConstants();
	LevelDialog.setGlobals();

	InputPad.setConstants();
	SoundInputPad.setConstants();
	InputWidget.NumPad.setConstants();
	InputWidget.Label.setConstants();
	InputWidget.Slider.setConstants();
	InputWidget.Piano.setConstants();

	ConnectMultipleDialog.setConstants();
	RobotConnectionList.setConstants();
	TabRow.setConstants();
	RecordingDialog.setConstants();
	DisplayBox.setGraphics();
	OverflowArrows.setConstants();
	CodeManager();
	SaveManager.setConstants();
	UndoManager();
};
/** Once each class has its constants set, the UI can be built. UI-related classes are called. */
GuiElements.buildUI = function() {

	document.body.style.backgroundColor = Colors.black; //Sets the background color of the webpage
	Colors.createGradients(); //Adds gradient definitions to the SVG for each block category
	Overlay.setStatics(); //Creates a list of open overlays
	TouchReceiver(); //Adds touch event handlers to the SVG
	BlockPalette(); //Creates the sidebar on the left with the categories and blocks
	TitleBar(); //Creates the title bar and the buttons contained within it.
	TabManager(); //Creates the tab-switching interface below the title bar
	DisplayBoxManager(); //Builds the display box for the display block to show messages in.
	/* Builds the SVG path element for the highlighter,
	the white ring which shows which slot a Block will connect to. */
	Highlighter();
	SaveManager();
	if (!FinchBlox){
		GuiElements.blockInteraction();
		OpenDialog.showDialog();
	}
	DebugOptions.applyActions();
};
/**
 * Makes an layer object for each layer of the interface.
 * Layers are accessible in the form GuiElements.layers.[layerName]
 */
GuiElements.createLayers = function() {
	const create = GuiElements.create; //shorthand
	GuiElements.zoomGroups = [];
	GuiElements.svgs.forEach(function(svg) {
		let zoomGroup = create.group(0, 0, svg);
		GuiElements.zoomGroups.push(zoomGroup);
		GuiElements.update.zoom(zoomGroup, GuiElements.zoomFactor);
	});

	GuiElements.layers = {};
	let i = 0;
	const layers = GuiElements.layers;
	layers.temp = create.layer(i);
	layers.aTabBg = create.layer(i);
	layers.activeTab = create.layer(i);
	layers.TabsBg = create.layer(i);
	layers.paletteBG = create.layer(i);
	layers.paletteScroll = document.getElementById("paletteScrollDiv");
	i++;
	layers.trash = create.layer(i);
	layers.catBg = create.layer(i);
	layers.categories = create.layer(i);
	layers.titleBg = create.layer(i);
	layers.titlebar = create.layer(i);
	layers.overflowArr = create.layer(i);
	layers.stage = create.layer(i);
	layers.display = create.layer(i);
	layers.drag = create.layer(i);
	layers.highlight = create.layer(i);
	layers.resultBubble = create.layer(i);
	layers.inputPad = create.layer(i);
	layers.tabMenu = create.layer(i);
	layers.dialogBlock = create.layer(i);
	layers.dialog = create.layer(i);
	layers.overlay = create.layer(i);
	layers.frontScroll = document.getElementById("frontScrollDiv");
	i++;
	layers.overlayOverlay = create.layer(i);
	layers.overlayOverlayScroll = document.getElementById("overlayOverlayScrollDiv");
};

/**
 * Debugging function which displays information on the screen
 * @param {string} message
 */
GuiElements.alert = function(message) {
	if (!DebugOptions.shouldAllowLogging()) return;
	let result = message;
	debug.innerHTML = result;
};


/* GuiElements.create contains functions for creating SVG elements.
 * The element is built with minimal attributes and returned.
 * It may also be added to a group if included. */
GuiElements.create = {};
/**
 * Makes a group, adds it to a parent group (if present), and returns it.
 * @param {number} x - The x offset of the group.
 * @param {number} y - The y offset of the group.
 * @param {Element} [parent] - The parent group to add the group to.
 * @return {Element} - The group which was created.
 */
GuiElements.create.group = function(x, y, parent) {
	DebugOptions.validateOptionalNums(x, y);
	const group = document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Make the group.
	group.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")"); //Move the group to (x,y).
	if (parent != null) { //If provided, add it to the parent.
		parent.appendChild(group);
	}
	return group; //Return the group.
};
/**
 * Creates a layer object that can be treated much like a group but has show and hide functions. The layer actually
 * includes two groups, with the inner group added/removed from the outer group during show/hide, ensuring the order
 * of layers never changes.
 * @param {number} depth - The index of the zoomGroup to add to
 * @return {object} - A layer object
 */
GuiElements.create.layer = function(depth) {
	DebugOptions.validateNumbers(depth);
	let layerG = GuiElements.create.group(0, 0, GuiElements.zoomGroups[depth]);
	let showHideLayer = GuiElements.create.group(0, 0, layerG);
	let layer = {};
	// We forward these group-like functions to the inner group
	layer.appendChild = showHideLayer.appendChild.bind(showHideLayer);
	layer.setAttributeNS = showHideLayer.setAttributeNS.bind(showHideLayer);
	layer.hide = showHideLayer.remove.bind(showHideLayer);
	layer.show = function() {
		layerG.appendChild(showHideLayer);
	};
	return layer;
};
/**
 * Creates a linear SVG gradient and adds it to the SVG defs.
 * @param {string} id - The id of the gradient (needed to reference it later).
 * @param {string} color1 - color in form "#fff" of the top of the gradient.
 * @param {string} color2 - color in form "#fff" of the bottom of the gradient.
 */
GuiElements.create.gradient = function(id, color1, color2) { //Creates a gradient and adds to the defs
	DebugOptions.validateNonNull(color1, color2);
	const gradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
	gradient.setAttributeNS(null, "id", id); //Set attributes.
	gradient.setAttributeNS(null, "x1", "0%");
	gradient.setAttributeNS(null, "x2", "0%");
	gradient.setAttributeNS(null, "y1", "0%");
	gradient.setAttributeNS(null, "y2", "100%");
	GuiElements.defs.appendChild(gradient); //Add it to the SVG's defs
	const stop1 = document.createElementNS("http://www.w3.org/2000/svg", 'stop'); //Create stop 1.
	stop1.setAttributeNS(null, "offset", "0%");
	stop1.setAttributeNS(null, "style", "stop-color:" + color1 + ";stop-opacity:1");
	gradient.appendChild(stop1);
	const stop2 = document.createElementNS("http://www.w3.org/2000/svg", 'stop'); //Create stop 2.
	stop2.setAttributeNS(null, "offset", "100%");
	stop2.setAttributeNS(null, "style", "stop-color:" + color2 + ";stop-opacity:1");
	gradient.appendChild(stop2);
};
/**
 * Creates an SVG path element and returns it.
 * @param {Element} [group] - The parent group to add the element to.
 * @return {Element} - The path which was created.
 */
GuiElements.create.path = function(group) {
	const path = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	if (group != null) { //Add it to the parent group if present.
		group.appendChild(path);
	}
	return path; //Return the path.
};
/**
 * Creates an SVG text element and returns it.
 * @return {Element} - The text which was created.
 */
GuiElements.create.text = function() {
	var textElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create text.
	if (Language.isRTL) {
		textElement.setAttributeNS(null, "transform", "scale(-1, 1)");
	}
	return textElement;
};
/**
 * Creates an SVG image element and returns it.
 * @return {Element} - The text which was created.
 */
GuiElements.create.image = function() {
	return document.createElementNS("http://www.w3.org/2000/svg", 'image');
};
/**
 * Creates an SVG tag and adds it to the group
 * @param {Element} [group]
 * @return {Element}
 */
GuiElements.create.svg = function(group) {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	if (group != null) {
		group.appendChild(svg);
	}
	return svg;
};
/**
 * Creates a div formatted to be scrollable and ads it to the group
 * @param {Element} group
 * @return {Element}
 */
GuiElements.create.scrollDiv = function(group) {
	const div = document.createElement("div");
	div.style.position = "absolute";
	if (group != null) {
		group.appendChild(div);
	}
	return div;
};
/**
 * Creates an SVG rect element, adds it to a parent group (if present), and returns it.
 * @param {Element} group - (optional) The parent group to add the group to.
 * @return {Element} - The rect which was created.
 */
GuiElements.create.rect = function(group) {
	const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create the rect.
	if (group != null) { //Add it to the parent group if present.
		group.appendChild(rect);
	}
	return rect; //Return the rect.
};

/* GuiElements.draw contains functions that create SVG elements and assign their attributes
 * so they are ready to be drawn on the screen. The element is then returned.
 * It may also be added to a group if included. */
GuiElements.draw = {};
/**
 * Creates a filled SVG rect element at a certain location with specified dimensions and returns it.
 * @param {number} x - The rect's x coord.
 * @param {number} y - The rect's y coord.
 * @param {number} width - The rect's width.
 * @param {number} height - The rect's height.
 * @param {string} [color] - (optional) The rect's fill color in the form "#fff".
 * @param {number} rx - (optional) Corner rounding parameter
 * @param {number} ry - (optional) Corner rounding parameter
 * @return {Element} - The rect which was created.
 */
GuiElements.draw.rect = function(x, y, width, height, color, rx, ry) {
	DebugOptions.validateNumbers(x, y, width, height);
	const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create the rect.
	rect.setAttributeNS(null, "x", x); //Set its attributes.
	rect.setAttributeNS(null, "y", y);
	rect.setAttributeNS(null, "width", width);
	rect.setAttributeNS(null, "height", height);
	if (color != null) {
		rect.setAttributeNS(null, "fill", color);
	}
	if (rx != null && ry != null){
		rect.setAttributeNS(null, "rx", rx);
		rect.setAttributeNS(null, "ry", ry);
	}
	return rect; //Return the rect.
};
/**
 * Creates a filled, triangular SVG path element with specified dimensions and returns it.
 * @param {number} x - The path's x coord.
 * @param {number} y - The path's y coord.
 * @param {number} width - The path's width. (it is an isosceles triangle)
 * @param {number} height - The path's height. (negative will make it point down)
 * @param {string} color - The path's fill color in the form "#fff".
 * @return {Element} - The path which was created.
 */
GuiElements.draw.triangle = function(x, y, width, height, color) {
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height);
	const triangle = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.triangle(triangle, x, y, width, height); //Set its path description (points).
	triangle.setAttributeNS(null, "fill", color); //Set the fill.
	return triangle; //Return the finished triangle.
};
/**
 * Creates a triangle with its point at the indicated coords
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} color
 * @return {Element}
 */
GuiElements.draw.triangleFromPoint = function(x, y, width, height, color) {
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height);
	const triangle = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.triangleFromPoint(triangle, x, y, width, height); //Set its path description (points).
	triangle.setAttributeNS(null, "fill", color); //Set the fill.
	return triangle; //Return the finished triangle.
};
/**
 * Creates a filled, trapezoid-shaped SVG path element with specified dimensions and returns it.
 * @param {number} x - The path's x coord.
 * @param {number} y - The path's y coord.
 * @param {number} width - The path's width. (it is an isosceles trapezoid)
 * @param {number} height - The path's height. (negative will make it point down)
 * @param {number} slantW - The amount the trapezoid slopes in.
 * @param {string} color - The path's fill color in the form "#fff".
 * @return {Element} - The path which was created.
 */
GuiElements.draw.trapezoid = function(x, y, width, height, slantW, color) {
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height, slantW);
	const trapezoid = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.trapezoid(trapezoid, x, y, width, height, slantW); //Set its path description.
	trapezoid.setAttributeNS(null, "fill", color); //Set the fill.
	return trapezoid; //Return the finished trapezoid.
};
/**
 * Draws a circle at the center point
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {string} color
 * @param {Element} [group]
 * @return {Element}
 */
GuiElements.draw.circle = function(cx, cy, radius, color, group) {
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(cx, cy, radius);
	const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
	circle.setAttributeNS(null, "cx", cx);
	circle.setAttributeNS(null, "cy", cy);
	circle.setAttributeNS(null, "r", radius);
	circle.setAttributeNS(null, "fill", color);
	if (group != null) {
		group.appendChild(circle);
	}
	return circle;
};
/**
 * Creates an SVG image with the given dimensions and name
 * @param {string} imageName - The name of the png image file
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Element} [parent]
 * @return {Element}
 */
GuiElements.draw.image = function(imageName, x, y, width, height, parent) {
	DebugOptions.validateNumbers(x, y, width, height);
	const imageElement = GuiElements.create.image();
	imageElement.setAttributeNS(null, "x", x);
	imageElement.setAttributeNS(null, "y", y);
	imageElement.setAttributeNS(null, "width", width);
	imageElement.setAttributeNS(null, "height", height);
	//imageElement.setAttributeNS('http://www.w3.org/2000/xlink','href', "Images/"+imageName+".png");
	imageElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", "Images/" + imageName + ".png");
	imageElement.setAttributeNS(null, 'visibility', 'visible');
	if (parent != null) {
		parent.appendChild(imageElement);
	}
	return imageElement;
};
/**
 * Creates a SVG text element with text in it with specified formatting and returns it.
 * @param {number} x - The text element's x coord.
 * @param {number} y - The text element's y coord.
 * @param {string} text - The text contained within the element.
 * @param {Font} font - The font of the text.
 * @param {string} color - The text's color in the form "#fff".
 * @param {null} [test]
 */
GuiElements.draw.text = function(x, y, text, font, color, test) {
	DebugOptions.assert(test == null);
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y);
	const textElement = GuiElements.create.text();
	if (Language.isRTL){ x = -x; }
	textElement.setAttributeNS(null, "x", x);
	textElement.setAttributeNS(null, "y", y);
	textElement.setAttributeNS(null, "font-family", font.fontFamily);
	textElement.setAttributeNS(null, "font-size", font.fontSize);
	textElement.setAttributeNS(null, "font-weight", font.fontWeight);
	textElement.setAttributeNS(null, "fill", color);
	textElement.setAttributeNS(null, "class", "noselect"); //Make sure it can't be selected.
	text += ""; //Make text into a string
	text = text.replace(new RegExp(" ", 'g'), String.fromCharCode(160)); //Replace space with nbsp
	const textNode = document.createTextNode(text);
	textElement.textNode = textNode;
	textElement.appendChild(textNode);
	return textElement;
};
/**
 * Creates a video with the given dimensions and name
 * Note: if you want to embed the video in an existing svg element, you can do
 * so by putting it inside a foreignObject element (which you insert into the svg
 * element). However, the video does not tend to appear to be properly contained.
 * @param {string} videoName - The name of the mp4 video file
 * @param {string} robotId - ID of the robot this video is for if applicable
 * @return {Element}
 */
GuiElements.draw.video = function(videoName, robotId) {

	const container = document.createElement('div');
	//container.setAttribute("style", "position: relative; height: 0; width: 100%; padding-bottom:56.25%;")
	container.setAttribute("style", "position: relative; height: 100%; width: 100%; pointer-events: none;")

	const videoElement = document.createElement('video');
	if (robotId != null) {
		//If we are showing a video for a specific robot (as in compass calibration)
		// tag with the robot's id and have it loop. Removal of video is handled by
		// CallBackManager in this case.
		videoElement.setAttribute("id", "video" + robotId);
		videoElement.setAttribute("loop", "loop");
	}
	//videoElement.setAttribute("controls", "controls");
	//videoElement.setAttribute("style", "position: relative; display: block; margin: 0 auto; height: auto; width: 95%; padding: 3% 0;")
	videoElement.setAttribute("style", "position: relative; display: block; margin: 0 auto; height: auto; width: 95%; top: 50%; transform: translateY(-50%);")
	videoElement.src = videoName;
	videoElement.autoplay = true;
	videoElement.muted = true; //video must be muted to autoplay on Android.

	container.appendChild(videoElement);
	document.body.appendChild(container);

	videoElement.addEventListener('ended',myHandler,false);
  function myHandler(e) {
    document.body.removeChild(container);
  }

	return videoElement;
};
/**
 * Creates a filled, SVG path element with two rounded corners and the specified
 * dimensions and returns it. Used for FinchBlox category buttons and discover dialog
 * @param {number} x - The path's x coord.
 * @param {number} y - The path's y coord.
 * @param {number} width - The path's width. (it is an isosceles triangle)
 * @param {number} height - The path's height. (negative will make it point down)
 * @param {string} color - The path's fill color in the form "#fff".
 * @param {number} r - Corner radius for top left and right corners.
 * @return {Element} - The path which was created.
 */
GuiElements.draw.tab = function(x, y, width, height, color, r) {
	DebugOptions.validateNonNull(color);
	DebugOptions.validateNumbers(x, y, width, height);
	const tab = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create the path.
	GuiElements.update.tab(tab, x, y, width, height, r); //Set its path description (points).
	tab.setAttributeNS(null, "fill", color); //Set the fill.
	return tab; //Return the finished button shape.
};

/* GuiElements.update contains functions that modify the attributes of existing SVG elements.
 * They do not return anything. */
GuiElements.update = {};
/**
 * Changes the fill color (or text color) of any SVG element.
 * @param {Element} element - The element to be recolored.
 * @param {string} color - The element's new color in the form "#fff".
 */
GuiElements.update.color = function(element, color) {
	DebugOptions.validateNonNull(color);
	element.setAttributeNS(null, "fill", color); //Recolors the element.
};
/**
 * Changes the fill opacity of any SVG element.
 * @param {Element} element - The element to be modified.
 * @param {number} opacity - The element's new opacity (from 0 to 1).
 */
GuiElements.update.opacity = function(element, opacity) {
	element.setAttributeNS(null, "fill-opacity", opacity); //Sets the opacity.
};
/**
 * Sets an SVG element's stroke
 * @param {Element} element - The element to be modified.
 * @param {string} color - The element's new color in the form "#fff".
 * @param {number} strokeW - The width of the stroke
 */
GuiElements.update.stroke = function(element, color, strokeW) {
	DebugOptions.validateNonNull(color);
	element.setAttributeNS(null, "stroke", color);
	element.setAttributeNS(null, "stroke-width", strokeW);
};
/**
 * Changes the text of an SVG text element.
 * @param {Element} textE - The text element to be modified.
 * @param {string} newText - The element's new text.
 */
GuiElements.update.text = function(textE, newText) {
	newText += ""; //Make newText into a string
	newText = newText.replace(new RegExp(" ", 'g'), String.fromCharCode(160)); //Replace space with nbsp
	if (textE.textNode != null) {
		textE.textNode.remove(); //Remove old text.
	}
	const textNode = document.createTextNode(newText); //Create new text.
	textE.textNode = textNode; //Adds a reference for easy removal.
	textE.appendChild(textNode); //Adds text to element.
};
/**
 * Changes the text of an SVG text element and removes ending characters until the width is less that a max width.
 * Adds "..." if characters are removed.
 * @param {Element} textE - The text element to be modified.
 * @param {string} text - The element's new text.
 * @param {number} maxWidth - When finished, the width of the text element will be less that this number.
 */
GuiElements.update.textLimitWidth = function(textE, text, maxWidth) {
	GuiElements.update.text(textE, text);
	let currentWidth = GuiElements.measure.textWidth(textE);
	if (currentWidth < maxWidth || text == "") {
		return;
	}
	let chars = 1;
	const maxChars = text.length;
	let currentText;
	while (chars <= maxChars) {
		currentText = text.substring(0, chars);
		GuiElements.update.text(textE, currentText + "...");
		currentWidth = GuiElements.measure.textWidth(textE);
		if (currentWidth > maxWidth) {
			chars--;
			break;
		}
		chars++;
	}
	currentText = text.substring(0, chars);
	GuiElements.update.text(textE, currentText + "...");
};
/**
 * Changes the path description of an SVG path object to make it a triangle.
 * @param {Element} pathE - The path element to be modified.
 * @param {number} x - The path's new x coord.
 * @param {number} y - The path's new y coord.
 * @param {number} width - The path's new width. (it is an isosceles triangle)
 * @param {number} height - The path's new height. (negative will make it point down)
 */
GuiElements.update.triangle = function(pathE, x, y, width, height) {
	DebugOptions.validateNumbers(x, y, width, height);
	const xshift = width / 2;
	let path = "";
	path += "m " + x + "," + y; //Draws bottom-left point.
	path += " " + xshift + "," + (0 - height); //Draws top-middle point.
	path += " " + xshift + "," + (height); //Draws bottom-right point.
	path += " z"; //Closes path.
	pathE.setAttributeNS(null, "d", path); //Sets path description.
};
/**
 * Makes the path a triangle with point at the specified coords, possibly rotated 90 degrees
 * @param {Element} pathE
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {boolean} vertical - Whether the triangle should be vertical or horizontal
 */
GuiElements.update.triangleFromPoint = function(pathE, x, y, width, height, vertical) {
	DebugOptions.validateNumbers(x, y, width, height);
	if (vertical == null) {
		vertical = 0;
	}

	const xshift = width / 2;
	let path = "";
	path += "m " + x + "," + y; //Draws top-middle point.
	if (vertical) {
		path += " " + xshift + "," + (height);
		path += " " + (0 - width) + ",0";
	} else {
		path += " " + (height) + "," + xshift;
		path += " 0," + (0 - width);
	}
	path += " z"; //Closes path.
	pathE.setAttributeNS(null, "d", path); //Sets path description.
};
/**
 * Changes the path description of an SVG path object to make it a trapezoid.
 * @param {Element} pathE - The path element to be modified.
 * @param {number} x - The path's new x coord.
 * @param {number} y - The path's new y coord.
 * @param {number} width - The path's new width. (it is an isosceles trapezoid)
 * @param {number} height - The path's new height. (negative will make it point down)
 * @param {number} slantW - The amount the trapezoid slopes in.
 */
GuiElements.update.trapezoid = function(pathE, x, y, width, height, slantW) {
	DebugOptions.validateNumbers(x, y, width, height, slantW);
	const shortW = width - 2 * slantW; //The width of the top of the trapezoid.
	let path = "";
	path += "m " + x + "," + (y + height); //Draws the points.
	path += " " + slantW + "," + (0 - height);
	path += " " + shortW + "," + 0;
	path += " " + slantW + "," + height;
	path += " z";
	pathE.setAttributeNS(null, "d", path); //Sets path description.
};
/**
 * Moves and resizes an SVG rect element.
 * @param {Element} rect - The rect element to be modified.
 * @param {number} x - The rect's new x coord.
 * @param {number} y - The rect's new y coord.
 * @param {number} width - The rect's new width.
 * @param {number} height - The rect's new height.
 */
GuiElements.update.rect = function(rect, x, y, width, height) {
	DebugOptions.validateNumbers(x, y, width, height);
	rect.setAttributeNS(null, "x", x);
	rect.setAttributeNS(null, "y", y);
	rect.setAttributeNS(null, "width", width);
	rect.setAttributeNS(null, "height", height);
};
/**
 * Used for zooming the main zoomGroup which holds the ui
 * @param {Element} group
 * @param {number} scale - The zoom amount
 */
GuiElements.update.zoom = function(group, scale) {
	DebugOptions.validateNumbers(scale);
	group.setAttributeNS(null, "transform", "scale(" + scale + ")");
};
/**
 * Changes the image an image element points to
 * @param {Element} imageE
 * @param {string} newImageName - The name of the png image
 */
GuiElements.update.image = function(imageE, newImageName) {
	//imageE.setAttributeNS('http://www.w3.org/2000/xlink','href', "Images/"+newImageName+".png");
	imageE.setAttributeNS("http://www.w3.org/1999/xlink", "href", "Images/" + newImageName + ".png");
};
/**
 * Updates a div, svg and group in the SVG that form a smoothScrollSet according to new dimensions
 * @param {Element} div - The div scrollable div containing a larger SVG
 * @param {Element} svg - The svg in the div
 * @param {Element} zoomG - The scaled group in the svg
 * @param {number} x - Position of the set
 * @param {number} y
 * @param {number} width - Dimensions of outside of set
 * @param {number} height
 * @param {number} innerWidth - Dimensions inside the set
 * @param {number} innerHeight
 */
GuiElements.update.smoothScrollSet = function(div, svg, zoomG, x, y, width, height, innerWidth, innerHeight) {
	DebugOptions.validateNonNull(div, svg, zoomG);
	DebugOptions.validateNumbers(x, y, width, height, innerWidth, innerHeight);
	/*foreignObj.setAttributeNS(null,"x",x);
	foreignObj.setAttributeNS(null,"y",y);
	foreignObj.setAttributeNS(null,"width",width * zoom);
	foreignObj.setAttributeNS(null,"height",height * zoom);*/

	const scrollY = innerHeight > height;
	const scrollX = innerWidth > width;
	div.classList.remove("noScroll");
	div.classList.remove("smoothScrollXY");
	div.classList.remove("smoothScrollX");
	div.classList.remove("smoothScrollY");
	if (scrollX && scrollY) {
		div.classList.add("smoothScrollY");
	} else if (scrollX) {
		div.classList.add("noScroll");
	} else if (scrollY) {
		div.classList.add("smoothScrollY");
	} else {
		div.classList.add("noScroll");
	}

	const zoom = GuiElements.zoomFactor;

	div.style.top = y + "px";
	div.style.left = x + "px";
	div.style.width = (width * zoom) + "px";
	div.style.height = (height * zoom) + "px";

	svg.setAttribute('width', innerWidth * zoom);
	svg.setAttribute('height', innerHeight * zoom);

	GuiElements.update.zoom(zoomG, zoom);
};
/**
 * Makes an SVG element have touches pass through it
 * @param {Element} svgE
 */
GuiElements.update.makeClickThrough = function(svgE) {
	svgE.style.pointerEvents = "none";
};
/**
 * Changes the path description of an SVG path object to make it a rectangle
 * with two rounded corners.
 * @param {Element} pathE - The path element to be modified.
 * @param {number} x - The path's new x coord.
 * @param {number} y - The path's new y coord.
 * @param {number} width - The path's new width. (it is an isosceles triangle)
 * @param {number} height - The path's new height. (negative will make it point down)
 * @param {number} r - Corner radius for top corners.
 */
GuiElements.update.tab = function(pathE, x, y, width, height, r) {
	DebugOptions.validateNumbers(x, y, width, height, r);
	let path = "";
	path += "m " + (x + r) + "," + y;
	path += " l " + (width - 2*r) + ",0";
	path += " a " + r + " " + r + " 0 0 1 " + r + " " + r;
	path += " l 0," + (height - r) + " " + (-width) + ",0 0,";
	path += (r - height);
	path += " a " + r + " " + r + " 0 0 1 " + r + " " + (0 - r);
	path += " z"; //Closes path.
	pathE.setAttributeNS(null, "d", path); //Sets path description.
};

/* GuiElements.move contains functions that move existing SVG elements.
 * They do not return anything. */
GuiElements.move = {};
/**
 * Moves a group by changing its transform value.
 * @param {Element} group - The group to move.
 * @param {number} x - The new x offset of the group.
 * @param {number} y - The new y offset of the group.
 * @param {number} [zoom] - (Optional) The amount the group should be scaled.
 */
GuiElements.move.group = function(group, x, y, zoom) {
	DebugOptions.validateNumbers(x, y);
	if (zoom == null) {
		group.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
	} else {
		group.setAttributeNS(null, "transform", "matrix(" + zoom + ",0,0," + zoom + "," + x + "," + y + ")");
	}
};
/**
 * Moves an SVG text element.
 * Position is relative to its container.
 * @param {string} text - The text element to move.
 * @param {number} x - The new x coord of the text.
 * @param {number} y - The new y coord of the text.
 */
GuiElements.move.text = function(text, x, y) {
	DebugOptions.validateNumbers(x, y);
	//For rtl, the text elements are flipped (scale(-1,1)) and so must move in the
	// other direction to be positioned correctly.
	if (Language.isRTL){ x = -x; }
	text.setAttributeNS(null, "x", x);
	text.setAttributeNS(null, "y", y);
};
/**
 * Moves an SVG element.
 * @param {Element} element - The element to move.
 * @param {number} x - The new x coord of the element.
 * @param {number} y - The new y coord of the element.
 */
GuiElements.move.element = function(element, x, y) {
	DebugOptions.validateNumbers(x, y);
	element.setAttributeNS(null, "x", x);
	element.setAttributeNS(null, "y", y);
};
/**
 * Creates a clipping path (crops item) of the specified size and adds to the element if provided.
 * @param {number} x - The x coord of the clipping path.
 * @param {number} y - The y coord of the clipping path.
 * @param {number} width - The width of the clipping path.
 * @param {number} height - The height of the clipping path.
 * @param {Element} [element] - (optional) The element the path should be added to.
 * @return {Element} - The finished clipping path.
 */
GuiElements.clip = function(x, y, width, height, element) {
	DebugOptions.validateNumbers(x, y, width, height);
	const id = Math.random() + "";
	const clipPath = document.createElementNS("http://www.w3.org/2000/svg", 'clipPath'); //Create the rect.
	const clipRect = GuiElements.draw.rect(x, y, width, height);
	clipPath.appendChild(clipRect);
	clipPath.setAttributeNS(null, "id", id);
	GuiElements.defs.appendChild(clipPath);
	if (element != null) {
		element.setAttributeNS(null, "clip-path", "url(#" + id + ")");
	}
	return clipPath;
};

/* GuiElements.measure contains functions that measure parts of the UI.
 * They return the measurement. */
GuiElements.measure = {};
/**
 * Measures the width of an existing SVG text element.
 * @param {Element} textE - The text element to measure.
 * @return {number} - The width of the text element.
 */
GuiElements.measure.textWidth = function(textE) { //Measures an existing text SVG element
	return GuiElements.measure.textDim(textE, false);
};
/**
 * Measures the height of the SVG text element
 * @param {Element} textE
 * @return {number}
 */
GuiElements.measure.textHeight = function(textE) { //Measures an existing text SVG element
	return GuiElements.measure.textDim(textE, true);
};
/**
 * Measures the width/height of an existing SVG text element.
 * @param {Element} textE - The text element to measure.
 * @param {bool} height - true/false for width/height, respectively.
 * @return {number} - The width/height of the text element.
 */
GuiElements.measure.textDim = function(textE, height) { //Measures an existing text SVG element
	if (textE.textContent === "") { //If it has no text, the width is 0.
		return 0;
	}
	//Gets the bounding box, but that is 0 if it isn't visible on the screen.
	let bbox = textE.getBBox();
	let textD = bbox.width; //Gets the width of the bounding box.
	if (height) {
		textD = bbox.height; //Gets the height of the bounding box.
	}
	if (textD === 0) { //The text element probably is not visible on the screen.
		const parent = textE.parentNode; //Store the text element's current (hidden) parent.
		GuiElements.layers.temp.appendChild(textE); //Change its parent to one we know is visible.
		bbox = textE.getBBox(); //Now get its bounding box.
		textD = bbox.width;
		if (height) {
			textD = bbox.height;
		}
		textE.remove(); //Remove it from the temp layer.
		if (parent != null) {
			parent.appendChild(textE); //Add it back to its old parent.
		}
	}
	return textD; //Return the width/height.
};
/**
 * Measures the width of a string if it were used to create a text element with certain formatting.
 * @param {string} text - The string to measure.
 * @param {Font} font - The font family of the text element.
 * @return {number} - The width of the text element made using the string.
 */
GuiElements.measure.stringWidth = function(text, font) {
	const textElement = GuiElements.create.text(); //Make the text element.
	textElement.setAttributeNS(null, "font-family", font.fontFamily); //Set the attributes.
	textElement.setAttributeNS(null, "font-size", font.fontSize);
	textElement.setAttributeNS(null, "font-weight", font.fontWeight);
	textElement.setAttributeNS(null, "class", "noselect"); //Make sure it can't be selected.
	const textNode = document.createTextNode(text); //Add the text to the text element.
	textElement.textNode = textNode;
	textElement.appendChild(textNode);
	return GuiElements.measure.textWidth(textElement); //Measure it.
};

/**
 * Creates a black rectangle to block interaction with the main screen.  Used for
 * dialogs and for FinchBlox popups.
 */
GuiElements.blockInteraction = function() {
	if (GuiElements.dialogBlock == null) {
		const rect = GuiElements.draw.rect(0, 0, GuiElements.width, GuiElements.height);
		GuiElements.update.opacity(rect, GuiElements.blockerOpacity);
		GuiElements.layers.dialogBlock.appendChild(rect);
		TouchReceiver.touchInterrupt();
		TouchReceiver.addListenersDialogBlock(rect);
		GuiElements.dialogBlock = rect;
	}
};
/**
 * Removes the black rectangle that blocks interaction
 */
GuiElements.unblockInteraction = function() {
	if (GuiElements.dialogBlock != null) {
		GuiElements.dialogBlock.remove();
		GuiElements.dialogBlock = null;
	}
};
/**
 * Updates the dimensions of the blocker
 */
GuiElements.updateDialogBlockZoom = function() {
	if (GuiElements.dialogBlock != null) {
		GuiElements.update.rect(GuiElements.dialogBlock, 0, 0, GuiElements.width, GuiElements.height);
	}
};

/**
 * Sets the scale levels of the zoomGroups and then updates the UI
 */
GuiElements.updateZoom = function() {
	GuiElements.zoomFactor = GuiElements.zoomMultiple * GuiElements.computedZoom;
	GuiElements.zoomGroups.forEach(function(zoomGroup) {
		GuiElements.update.zoom(zoomGroup, GuiElements.zoomFactor);
	});
	GuiElements.updateDims();
};
/**
 * Sets the width and height using dimensions from the backend, then tells the UI to update
 * @param {number} newWidth
 * @param {number} newHeight
 */
GuiElements.updateDimsPreview = function(newWidth, newHeight) {
	GuiElements.width = newWidth / GuiElements.zoomFactor;
	GuiElements.height = newHeight / GuiElements.zoomFactor;
	GuiElements.passUpdateZoom();
};
/**
 * Remeasures the width and height for GuiElements and then tells the UI to update
 */
GuiElements.updateDims = function() {
	GuiElements.width = window.innerWidth / GuiElements.zoomFactor;
	GuiElements.height = window.innerHeight / GuiElements.zoomFactor;
	GuiElements.passUpdateZoom();
};
/**
 * Tells parts of the UI to update their dimensions
 */
GuiElements.passUpdateZoom = function() {
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

/* GuiElements.load loads important information from the backend before the UI even starts to be build (such as
 * screen dimensions and OS).  All load functions are launched simultaneously and each calls a callback, which
 * "checks it off the list" of things to load. */
GuiElements.load = {};
/**
 * Called to load information from backend before building UI
 * @param {function} callback - Called when all data is loaded
 */
GuiElements.loadInitialSettings = function(callback) {
	// TODO: Refactor this function
	DebugOptions();
	Data.setConstants();
	HtmlServer();
	GuiElements.setGuiConstants();
	SettingsManager();
	// The checklist of thing to load
	const loadProg = {};
	loadProg.version = false;
	loadProg.zoom = false;
	loadProg.os = false;
	loadProg.lastFileName = true;
	loadProg.lastFileNamed = true;
	const load = GuiElements.load;
	if (!DebugOptions.shouldSkipInitSettings()) {
		let count = 0;
		// Function checks if all the pieces are done loading and calls the callback when they are
		const checkIfDone = function() {
			count++;
			GuiElements.alert("" + loadProg.version + loadProg.zoom + loadProg.os +
				loadProg.lastFileName + loadProg.lastFileNamed);
			if (loadProg.version && loadProg.zoom && loadProg.os && loadProg.lastFileName && loadProg.lastFileNamed) {
				callback();
			}
		};
		// The three things to load are requested
		load.getAppVersion(function() {
			loadProg.version = true;
			checkIfDone();
		});
		load.configureZoom(function() {
			GuiElements.width = window.innerWidth / GuiElements.zoomFactor;
			GuiElements.height = window.innerHeight / GuiElements.zoomFactor;
			loadProg.zoom = true;
			GuiElements.checkSmallMode();
			checkIfDone();
		});
		load.getOsVersion(function() {
			loadProg.os = true;
			checkIfDone();
		});
	} else {
		callback();
	}
};
/**
 * Loads the version number from version.js
 * @param {function} callback
 */
GuiElements.load.getAppVersion = function(callback) {
	GuiElements.appVersion = FrontendVersion;
	callback();
};
/**
 * Loads the OS version
 * @param {function} callback
 */
GuiElements.load.getOsVersion = function(callback) {
	HtmlServer.sendRequestWithCallback("properties/os", function(resp) {
		GuiElements.osVersion = resp;
		const parts = resp.split(" ");
		GuiElements.isKindle = (parts.length >= 1 && parts[0] === "Kindle");
		GuiElements.isAndroid = (parts.length >= 1 && parts[0] === "Android") || GuiElements.isKindle;
		GuiElements.isIos = (parts.length >= 1 && parts[0] === "iOS");
		callback();
	}, function() {
		GuiElements.osVersion = "";
		GuiElements.isKindle = false;
		callback();
	});
};
/**
 * Loads dimension information and settings from the backend and uses it to compute the current zoom level
 * @param {function} callback
 */
GuiElements.load.configureZoom = function(callback) {
	const GE = GuiElements;
	SettingsManager.loadSettings(function() {
		const callbackFn = function() {
			GE.zoomMultiple = SettingsManager.zoom.getValue();
			GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			if (GE.zoomFactor < GuiElements.minZoom || GE.zoomFactor > GuiElements.maxZoom || isNaN(GE.zoomFactor)) {
				GE.zoomMultiple = 1;
				SettingsManager.zoom.writeValue(1);
				GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			}
			if (GE.zoomFactor < GuiElements.minZoom || GE.zoomFactor > GuiElements.maxZoom || isNaN(GE.zoomFactor)) {
				GE.zoomMultiple = 1;
				GE.computedZoom = GE.defaultZoomMultiple;
				SettingsManager.zoom.writeValue(1);
				GE.zoomFactor = GE.computedZoom * GE.zoomMultiple;
			}
			callback();
		};
		HtmlServer.sendRequestWithCallback("properties/dims", function(response) {
			GE.computedZoom = GE.computeZoomFromDims(response);
			callbackFn();
		}, function() {
			callbackFn();
		});
	});
};
/**
 * Takes a response from the properties/dims request and computes and sets the appropriate zoom level
 * @param {string} dims - The response from properties/dims
 */
GuiElements.computeZoomFromDims = function(dims) {
	//GuiElements.alert("Got dimensions from device.  Computing zoom.");
	//GuiElements.alert("received dims: " + dims);
	const parts = dims.split(",");
	if (parts.length === 2) {
		const widthMm = parseFloat(parts[0]);
		const heightMm = parseFloat(parts[1]);
		const diagMm = Math.sqrt(widthMm * widthMm + heightMm * heightMm);
		const widthPx = window.innerWidth;
		const heightPx = window.innerHeight;
		const diagPx = Math.sqrt(widthPx * widthPx + heightPx * heightPx);
		const zoom = (diagPx * GuiElements.defaultZoomMm) / (GuiElements.defaultZoomPx * diagMm);
		//GuiElements.alert("Computed zoom to: " + zoom + " diagPx:" + diagPx + " diagMm:" + diagMm);
		return zoom * GuiElements.defaultZoomMultiple;
	} else {
		return 1;
	}
};

/* Convert between coords relative to the screen and coords that incorporate the current zoom level
 * Note that most relToAbs functions in other classes actually return coords that do not depend on the
 * current zoom level.  The GuiElements relToAbs functions take these coords and convert them into true
 * screen coords. */
/**
 * @param {number} x
 * @return {number}
 */
GuiElements.relToAbsX = function(x) {
	return x * GuiElements.zoomFactor;
};
/**
 * @param {number} y
 * @return {number}
 */
GuiElements.relToAbsY = function(y) {
	return y * GuiElements.zoomFactor;
};

/**
 * Hides the BlockPalette by hiding the layers it renders on
 * @param {boolean} [skipUpdate=false] - Whether the TabManager should not be told to update arrows because the
 *                                       TabManager has not been initialized yet
 */
GuiElements.hidePaletteLayers = function(skipUpdate) {
	if (skipUpdate == null) {
		skipUpdate = false;
	}
	let GE = GuiElements;
	if (GuiElements.paletteLayersVisible) {
		GuiElements.paletteLayersVisible = false;
		SettingsManager.sideBarVisible.writeValue("false");
		GE.layers.paletteBG.hide();
		GE.layers.paletteScroll.style.visibility = "hidden";
		GE.layers.trash.hide();
		GE.layers.catBg.hide();
		GE.layers.categories.hide();
		if (!skipUpdate) {
			TabManager.updateZoom();
		}
	}
};
/**
 * Shows the BlockPalette
 * @param {boolean} [skipUpdate=false] - Whether updating the TabManager should be skipped
 */
GuiElements.showPaletteLayers = function(skipUpdate) {
	let GE = GuiElements;
	if (skipUpdate == null) {
		skipUpdate = false;
	}
	if (!GuiElements.paletteLayersVisible) {
		GuiElements.paletteLayersVisible = true;
		SettingsManager.sideBarVisible.writeValue("true");
		GE.layers.paletteBG.show();
		GE.layers.paletteScroll.style.visibility = "visible";
		GE.layers.trash.show();
		GE.layers.catBg.show();
		GE.layers.categories.show();
		if (!skipUpdate) {
			TabManager.updateZoom();
		}
	}
};

/**
 * Checks if the UI should enter/exit small mode based on the current width
 */
GuiElements.checkSmallMode = function() {
	let GE = GuiElements;
	GuiElements.smallMode = GuiElements.width < GuiElements.relToAbsX(GuiElements.smallModeThreshold);
	if (!GE.smallMode && !GE.paletteLayersVisible) {
		GE.showPaletteLayers(true);
	}
	if (!GE.smallMode && SettingsManager.sideBarVisible.getValue() !== "true") {
		SettingsManager.sideBarVisible.writeValue("true");
	}
};

/**
 * Removes any videos that are currently playing
 */
GuiElements.removeVideos = function() {
	const videosOpen = document.getElementsByTagName("video").length;
	if (videosOpen > 0){
		for (var i = 0; i < videosOpen; i++) {
			const videoElement = document.getElementsByTagName("video")[i];
			GuiElements.removeVideo(videoElement);
		}
	}
};
GuiElements.removeVideo = function(videoElement) {
	//each video is presented inside a div element. This is what must
	// be removed. See GuiElements.draw.video.
	const container = videoElement.parentNode;
	container.parentNode.removeChild(container);
};
