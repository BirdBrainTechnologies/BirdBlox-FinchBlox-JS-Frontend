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
	Colors.blockPalette = "#BAD8DC";
	Colors.flagGreen = "#5FBE3A";
	Colors.stopRed = "#DB4825";
	Colors.finchGreen = "#C0E7B0";
	Colors.fbHighlight = "#ffff00";
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
		"control_3": Colors.controlYellow,
		"sensor_3": Colors.finchGreen
	};
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
