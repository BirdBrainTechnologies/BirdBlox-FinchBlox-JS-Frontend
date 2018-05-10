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
	Colors.white = "#fff";
	Colors.lightGray = "#3D3D3D";
	Colors.darkGray = "#282828";
	Colors.darkDarkGray = "#151515";
	Colors.black = "#000";
};

Colors.setCategory = function() {
	Colors.categoryColors = {
		"robots": "#FF9600",
		"hummingbird": "#FF9600",
		"hummingbirdbit": "#FF9600",
		"microbit": "#FF9600",
		"flutter": "#FF9600",
		"finch": "#FF9600",
		"sound": "#EE00FF",
		"tablet": "#019EFF",
		"control": "#FFCC00",
		"operators": "#44FF00",
		"variables": "#FF5B00",
		"lists": "#FF0000",
		"inactive": "#a3a3a3"
	};
};

Colors.setMultipliers = function() {
	// Used for gradients
	Colors.gradStart = 1;
	Colors.gradEnd = 0.5;
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
