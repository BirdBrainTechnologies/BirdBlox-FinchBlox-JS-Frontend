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
  Colors.white = "#FFFFFF"; //"#fff";
  Colors.labelTextDisabled = "#e4e4e4";
  Colors.lightLightGray = "#CDCDCD";
  Colors.windowColor = "#CCC";
  Colors.canvasGray = "#C1C1C1";
  Colors.valueTextGrayed = "#AAAAAA" //"#aaa";
  Colors.mediumLightGray = "#999999" //"#999";
  Colors.lightGray = "#7B7B7B";
  Colors.darkGray = "#282828";
  Colors.darkDarkGray = "#151515";
  Colors.black = "#000000" //"#000";
  //Basic colors
  Colors.red = "#FF0000";
  Colors.green = "#00FF00";
  Colors.blue = "#0000FF";
  Colors.yellow = "#FFFF00";
  Colors.cyan = "#00FFFF";
  Colors.magenta = "#FF00FF";
  Colors.darkRed = "#c00000";
  Colors.lightYellow = "#FFFFCC";
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
  Colors.blockPaletteControl = "#F4E9A4"; //tmp
  Colors.flagGreen = "#2FC00B";
  Colors.fbDarkGreen = "#268D17";
  Colors.stopRed = "#F03602";
  Colors.finchGreen = "#B6E9A9";
  Colors.fbYellow = "#F1CA07";
  Colors.fbHighlight = "#ffff00";
  Colors.fbGray = "#E8E8E8";
  Colors.levelBN = "#E8E8E8";
  Colors.fbYellowBorder = "#BD9F0D";
  Colors.fbBlueBorder = "#097F8A";
  Colors.fbPurpleBorder = "#691675";
  Colors.fbOrangeBorder = "#F78705";
  Colors.darkTeal = "#114F53";
  if (FinchBlox) {
    Colors.inactiveGray = Colors.fbGray;
  }
  //Bally Design
  Colors.ballyGray = "#99A5B1" //Disabled actionable graphics
  Colors.ballyGrayLight = "#EEEEF4" //Backgrounds
  Colors.ballyGrayDark = "#4F4F4F" //Disabled actionable graphics
  Colors.ballyPurple = "#A94FC9" //Sound blocks
  Colors.ballyPurpleLight = "#F3DDFA" //Backgrounds
  Colors.ballyPurpleDark = "#600B75" //Actionable graphics
  Colors.ballyPurpleOnDrag = "#8A6696" 
  Colors.ballyPink = "#ED5ACD" //Sensor blocks
  Colors.ballyPinkLight = "#FBDDF0" //Backgrounds
  Colors.ballyPinkDark = "#A30981" //Actionable graphics
  Colors.ballyPinkOnDrag = "#CB6BB6" 
  Colors.ballyGreen = "#018043" //Go, confirmation, yes
  Colors.ballyGreenLight = "#C3F5DD" //Backgrounds
  Colors.ballyGreenDark = "#034827" //Actionable graphics
  Colors.ballyGreenYellow = "#65A400" //Controls blocks
  Colors.ballyGreenYellowLight = "#DDF7B3" //Backgrounds
  Colors.ballyGreenYellowDark = "#446F00" //Actionable graphics
  Colors.ballyGreenYellowOnDrag = "#80985A"
  Colors.ballyOrange = "#FF600A" //Light blocks
  Colors.ballyOrangeLight = "#F9E2D0" //Backgrounds
  Colors.ballyOrangeDark = "#B64F05" //Actionable graphics
  Colors.ballyOrangeOnDrag = "#E19166"
  Colors.ballyBrandBlue = "#089BAB"//"#079BAB" //Movement blocks
  Colors.ballyBrandBlueLight = "#E3F7FA" //Backgrounds
  Colors.ballyBrandBlueDark = "#05646E" //Actionable graphics
  Colors.ballyRed = "#DD1D28" //Stop, disconnected, and no
  Colors.ballyRedLight = "#F9DCE4" //Backgrounds
  Colors.ballyRedDark = "#9E0227" //Actionable graphics
  Colors.ballyBlue = "#3751E4" 
  Colors.ballyBlueLight = "#DFE2F6" //Backgrounds
  Colors.ballyBlueDark = "#103288" //Actionable graphics
  Colors.ballyBlueOnDrag = "#5562EA" 
};

Colors.setCategory = function() {
  Colors.categoryColors = {
    "robots": Colors.bbt,
    "hummingbird": Colors.bbt,
    "hummingbirdbit": Colors.bbt,
    "microbit": Colors.bbt,
    "flutter": Colors.bbt,
    "finch": Colors.bbt,
    "hatchling": Colors.bbt,
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
    "control_2": Colors.fbYellow,
    "sensor_2": Colors.finchGreen,
    "motion_3": Colors.easternBlue,
    "color_3": Colors.neonCarrot,
    "sound_3": Colors.seance,
    "control_3": Colors.fbYellow,
    "sensor_3": Colors.finchGreen,//Colors.flagGreen//Colors.finchGreen
    "portblocks": Colors.easternBlue,
    "oldblocks": Colors.neonCarrot,
    "microbitblocks": Colors.seance
  };
  //In FinchBlox, the block palette changes colors per category
  Colors.blockPalette = {
    "motion_1": Colors.blockPaletteMotion,
    "color_1": Colors.blockPaletteColor,
    "sound_1": Colors.blockPaletteSound,
    "motion_2": Colors.blockPaletteMotion,
    "color_2": Colors.blockPaletteColor,
    "sound_2": Colors.blockPaletteSound,
    "control_2": Colors.blockPaletteControl,
    "sensor_2": Colors.finchGreen,
    "motion_3": Colors.blockPaletteMotion,
    "color_3": Colors.blockPaletteColor,
    "sound_3": Colors.blockPaletteSound,
    "control_3": Colors.blockPaletteControl,
    "sensor_3": Colors.finchGreen,
    "portblocks": Colors.blockPaletteMotion,
    "oldblocks": Colors.blockPaletteColor,
    "microbitblocks": Colors.blockPaletteSound
  };
  //In FinchBlox, each block is outlined with a darker color
  Colors.blockOutline = {
    "motion_1": Colors.fbBlueBorder,
    "color_1": Colors.fbOrangeBorder,
    "sound_1": Colors.fbPurpleBorder,
    "motion_2": Colors.fbBlueBorder,
    "color_2": Colors.fbOrangeBorder,
    "sound_2": Colors.fbPurpleBorder,
    "control_2": Colors.fbYellowBorder,
    "sensor_2": Colors.fbDarkGreen,
    "motion_3": Colors.fbBlueBorder,
    "color_3": Colors.fbOrangeBorder,
    "sound_3": Colors.fbPurpleBorder,
    "control_3": Colors.fbYellowBorder,
    "sensor_3": Colors.fbDarkGreen, //Colors.finchGreen,
    "inactive": Colors.iron,
    "portblocks": Colors.fbBlueBorder,
    "oldblocks": Colors.fbOrangeBorder,
    "microbitblocks": Colors.fbPurpleBorder
  }
  if (Hatchling) {
    Colors.categoryColors = {
      "motion_1": Colors.ballyBlue,
      "color_1": Colors.ballyOrange,
      "sound_1": Colors.ballyPurple,
      "motion_2": Colors.ballyBlue,
      "color_2": Colors.ballyOrange,
      "sound_2": Colors.ballyPurple,
      "control_2": Colors.ballyGreenYellow,
      "sensor_2": Colors.ballyPink,
      "inactive": Colors.ballyGray
    }
    Colors.blockPalette = {
      "motion_1": Colors.ballyBlueLight,
      "color_1": Colors.ballyOrangeLight,
      "sound_1": Colors.ballyPurpleLight,
      "motion_2": Colors.ballyBlueLight,
      "color_2": Colors.ballyOrangeLight,
      "sound_2": Colors.ballyPurpleLight,
      "control_2": Colors.ballyGreenYellowLight,
      "sensor_2": Colors.ballyPinkLight
    }
    Colors.blockOutline = {
      "motion_1": Colors.ballyBlueDark,
      "color_1": Colors.ballyOrangeDark,
      "sound_1": Colors.ballyPurpleDark,
      "motion_2": Colors.ballyBlueDark,
      "color_2": Colors.ballyOrangeDark,
      "sound_2": Colors.ballyPurpleDark,
      "control_2": Colors.ballyGreenYellowDark,
      "sensor_2": Colors.ballyPinkDark,
      "inactive": Colors.ballyGrayDark
    }
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
 * Multiplies the rgb values by amt to make them darker. Colors must be specified
 * with 6 characters, not 3 (eg. #FFFFFF not #FFF).
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
  r = Math.round(r);
  g = Math.round(g);
  b = Math.round(b);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Returns the RGB value for a given hex value as an array
 */
Colors.hexToRgb = function(hex) {
  hex = hex.slice(1).toLowerCase()
  let r = parseInt( (hex.charAt(0) + '' + hex.charAt(1)), 16)
  let g = parseInt( (hex.charAt(2) + '' + hex.charAt(3)), 16)
  let b = parseInt( (hex.charAt(4) + '' + hex.charAt(5)), 16)

  return [r, g, b]
}
