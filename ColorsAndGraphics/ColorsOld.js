"use strict";
//Static.  Holds constant values for colors used throughout the UI (lightGray, darkGray, black, white)

function Colors(){
	Colors.setCommon();
	Colors.setCategory();
	Colors.setMultipliers();
}
Colors.setCommon=function(){
	Colors.white="#fff";
	Colors.lightGray="#3d3d3d";
	Colors.darkGray="#262626";
	Colors.black="#000";
};
Colors.setCategory=function(){
	Colors.categoryColors = {
		"robots": "#FF9600",
		"hummingbird": "#FF9600",
		"flutter": "#FF9600",
		"motion": "#0000FF",
		"looks": "#8800FF",
		"sound": "#EE00FF", //FF0088
		"pen": "#00CC99",
		"tablet": "#019EFF", //7F7F7F
		"control": "#FFCC00",
		"sensing": "#019EFF",
		"operators": "#44FF00",
		"variables": "#FF5B00",
		"lists": "#FF0000",
	};
};
Colors.setMultipliers=function(){
	Colors.gradStart=1;
	Colors.gradEnd=0.5;
	Colors.gradDarkStart=0.25;
	Colors.gradDarkEnd=0.5;
};
Colors.createGradients=function(){
	Colors.createGradientSet("gradient_",Colors.gradStart,Colors.gradEnd);
	Colors.createGradientSet("gradient_dark_",Colors.gradDarkStart,Colors.gradDarkEnd);
};
Colors.createGradientSet=function(name,multStart,multEnd){
	Object.keys(Colors.categoryColors).map(function(category) {
		let color = Colors.categoryColors[category];
		Colors.createGradientFromColorAndMults(name,category,color,multStart,multEnd);
	});
};
Colors.createGradientFromColorAndMults=function(name,catId,color,multStart,multEnd){
	var darken=Colors.darkenColor;
	var color1=darken(color,multStart);
	var color2=darken(color,multEnd);
	GuiElements.create.gradient(name+catId,color1,color2);
};
Colors.darkenColor=function(color,amt){
	// Source:
	// stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
	var col = parseInt(color.slice(1),16);
    var result = (((col & 0x0000FF) * amt) | ((((col>> 8) & 0x00FF) * amt) << 8) | (((col >> 16) * amt) << 16)).toString(16);
	while(result.length<6){
		result="0"+result;
	}
	return "#"+result;
};
Colors.getColor=function(category){
	return Colors.categoryColors[category];
};
Colors.getGradient=function(category){
	return "url(#gradient_"+category+")";
};