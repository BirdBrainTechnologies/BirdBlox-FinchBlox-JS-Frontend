"use strict";
/*
 * Static.  Holds constant values for colors used throughout the UI (lightGray, darkGray, black, white)
 */

function Colors() {
	Colors.setCommon();
	Colors.setCategory();
	Colors.setMultipliers();
}

Colors.setCommon = function() {
	//Gray scale...
	Colors.white = "#fff";
	Colors.labelTextDisabled = "#e4e4e4";
  Colors.lightLightGray = "#CDCDCD";
  Colors.windowColor = "#CCC";
	Colors.canvasGray = "#C1C1C1";
	Colors.valueTextGrayed = "#aaa";
	Colors.mediumLightGray = "#999";
	Colors.lightGray = "#7B7B7B";
	Colors.darkGray = "#282828";
	Colors.darkDarkGray = "#151515";
	Colors.black = "#000";
	//Basic colors
	Colors.red = "#FF0000";
	Colors.green = "#00FF00";
	Colors.yellow = "#FFFF00";
	Colors.darkRed = "#c00000";
	//Current BBT colors
	Colors.bbt = "#209BA9";
	Colors.tabletOrange = "#FAA525";
	Colors.operatorsGreen = "#8EC449";
	Colors.soundPurple = "#EE00FF";
	Colors.controlYellow = "#FFCC00";
	Colors.variablesDkOrange = "#FF5B00";
	Colors.inactiveGray = "#a3a3a3";
	//BBT Style guide colors
	Colors.easternBlue = "#089BAB"; //bbt blue
	Colors.neonCarrot = "#FF9922";
	Colors.fountainBlue = "#62BCC7"; //lighter blue
	Colors.seance = "#881199"; //dark purple
	Colors.bbtDarkGray = "#535353";
	Colors.iron = "#CACACA";
	//FinchBlox
	Colors.blockPaletteMotion = "#B4D9DD";
	Colors.blockPaletteColor = "#FFCE96";
	Colors.blockPaletteSound = "#B691BB";
	Colors.flagGreen = "#2FC00B";
	Colors.stopRed = "#F03602";
	Colors.finchGreen = "#B6E9A9";
	Colors.fbYellow = "#F1CA07";
	Colors.fbHighlight = "#ffff00";
	Colors.levelBN = "#E8E8E8";
	Colors.fbYellowBorder = "#BD9F0D";
	Colors.fbBlueBorder = "#097F8A";
	Colors.fbPurpleBorder = "#691675";
	Colors.fbOrangeBorder = "#F78705"
};

Colors.setCategory = function() {
	Colors.categoryColors = {
		"robots": Colors.bbt,
    "hummingbird": Colors.bbt,
    "hummingbirdbit": Colors.bbt,
    "microbit": Colors.bbt,
    "flutter": Colors.bbt,
    "finch": Colors.bbt,
    "tablet": Colors.tabletOrange,
    "operators": Colors.operatorsGreen,
		"sound": Colors.soundPurple,
		"control": Colors.controlYellow,
		"variables": Colors.variablesDkOrange,
		"lists": Colors.red,
		"inactive": Colors.inactiveGray,
		"motion_1": Colors.easternBlue,
		"color_1": Colors.neonCarrot,
		"sound_1": Colors.seance,
		"motion_2": Colors.easternBlue,
		"color_2": Colors.neonCarrot,
		"sound_2": Colors.seance,
		"motion_3": Colors.easternBlue,
		"color_3": Colors.neonCarrot,
		"sound_3": Colors.seance,
		"control_3": Colors.fbYellow,
		"sensor_3": Colors.finchGreen
	};
	//In FinchBlox, the block palette changes colors per category
	Colors.blockPalette = {
		"motion_1": Colors.blockPaletteMotion,
		"color_1": Colors.blockPaletteColor,
		"sound_1": Colors.blockPaletteSound,
		"motion_2": Colors.blockPaletteMotion,
		"color_2": Colors.blockPaletteColor,
		"sound_2": Colors.blockPaletteSound,
		"motion_3": Colors.blockPaletteMotion,
		"color_3": Colors.blockPaletteColor,
		"sound_3": Colors.blockPaletteSound,
		"control_3": Colors.fbYellow,
		"sensor_3": Colors.finchGreen
	};
	//In FinchBlox, each block is outlined with a darker color
	Colors.blockOutline = {
		"motion_1": Colors.fbBlueBorder,
		"color_1": Colors.fbOrangeBorder,
		"sound_1": Colors.fbPurpleBorder,
		"motion_2": Colors.fbBlueBorder,
		"color_2": Colors.fbOrangeBorder,
		"sound_2": Colors.fbPurpleBorder,
		"motion_3": Colors.fbBlueBorder,
		"color_3": Colors.fbOrangeBorder,
		"sound_3": Colors.fbPurpleBorder,
		"control_3": Colors.fbYellowBorder,
		"sensor_3": Colors.finchGreen
	}
};

Colors.setMultipliers = function() {
	// Used for gradients
	Colors.gradStart = 1;
	Colors.gradEnd = 0.75;
	Colors.gradDarkStart = 0.25;
	Colors.gradDarkEnd = 0.5;
};

/**
 * Creates normal and dark gradients for all categories
 */
Colors.createGradients = function() {
	Colors.createGradientSet("gradient_", Colors.gradStart, Colors.gradEnd);
	Colors.createGradientSet("gradient_dark_", Colors.gradDarkStart, Colors.gradDarkEnd);
};

/**
 * Creates gradients for all categories
 * @param {string} name
 * @param {number} multStart
 * @param {number} multEnd
 */
Colors.createGradientSet = function(name, multStart, multEnd) {
	Object.keys(Colors.categoryColors).map(function(category) {
		let color = Colors.categoryColors[category];
		Colors.createGradientFromColorAndMults(name, category, color, multStart, multEnd);
	});
};

/**
 * Creates a gradient in the SVG going from one darkness to another
 * @param {string} name - Used to identify the type of gradient ("gradient_" or "gradient_dark_")
 * @param {string} catId - Used to get the specific gradient
 * @param {string} color - color in hex
 * @param {number} multStart - number from 0 to 1 to determine the darkness of the start color
 * @param {number} multEnd - number from 0 to 1 for end color darkness
 */
Colors.createGradientFromColorAndMults = function(name, catId, color, multStart, multEnd) {
	const darken = Colors.darkenColor;
	const color1 = darken(color, multStart);
	const color2 = darken(color, multEnd);
	GuiElements.create.gradient(name + catId, color1, color2);
};

/**
 * Multiplies the rgb values by amt to make them darker
 * @param {string} color - color in hex
 * @param {number} amt - number from 0 to 1
 * @return {string} - color in hex
 */
Colors.darkenColor = function(color, amt) {
	// Source:
	// stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
	const col = parseInt(color.slice(1), 16);
	let result = (((col & 0x0000FF) * amt) | ((((col >> 8) & 0x00FF) * amt) << 8) | (((col >> 16) * amt) << 16)).toString(16);
	while (result.length < 6) {
		result = "0" + result;
	}
	return "#" + result;
};

// Source:
// stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
// Version 4.0
/** Color blending
 * @param p - number between -1 and 1. Negative numbers darken.
 * @param c0 - color.
 * @param c1 - (optional) second color to blend
 * @param l - true for linear blending, otherwise log.
 */
Colors.pSBC=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=pSBCr(c0),P=p<0,t=c1&&c1!="c"?pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

/**
 * Gets the color for a category
 * @param {string} category
 * @return {string} - color in hex
 */
Colors.getColor = function(category) {
	return Colors.categoryColors[category];
};

/**
 * Gets the gradient specified
 * @param {string} category - Should start with "gradient_" or "gradient_dark_"
 * @return {string} - Url to gradient
 */
Colors.getGradient = function(category) {
	return "url(#gradient_" + category + ")";
};

/**
 * Returns the hex value for a given RGB value
 */
Colors.rgbToHex = function(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
