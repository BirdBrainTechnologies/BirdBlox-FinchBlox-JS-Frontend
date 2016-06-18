/* BlockList is a static class that holds a list of blocks and categories.
 * It is in charge of populating the BlockPalette by helping to create Category objects.
 */
/* Populates the list of category names. Run by GuiElements. */
function BlockList(){
	BlockList.categories=new Array();
	//List only includes categories that will appear in the BlockPalette. "Lists" category is excluded.
	var cat=BlockList.categories;
	cat.push("Hummingbird"); //Capitalized in the way they are displayed on screen.
	cat.push("Motion");
	cat.push("Looks");
	cat.push("Sound");
	cat.push("Pen");
	cat.push("iPad");
	cat.push("Control");
	cat.push("Sensing");
	cat.push("Operators");
	cat.push("Variables");
}
/* Returns the id for a category given its index in the category list. Ids are lowercase.
 * @param {number} index - The category's index in the category name list.
 * @return {string} - The category's id (its name in lowercase).
 */
BlockList.getCatId=function(index){
	return BlockList.categories[index].toLowerCase();
};
/* Returns the category's name given its index in the category list.
 * @param {number} index - The category's index in the category name list.
 * @return {string} - The category's name.
 */
BlockList.getCatName=function(index){
	return BlockList.categories[index];
};
/* Returns the length of the category list.
 * @return {number} - The length of the category list.
 */
BlockList.catCount=function(){
	return BlockList.categories.length;
};

/* The following functions populate a Category for the BlockPalette.
 * @param {Category} category - the Category object to populate.
 * Each function has the same structure.
 * Blocks are added with category.addBlock(blockNameAsString) and spaces between groups with category.addSpace().
 * category.trimBottom() is used to remove any extra space at the bottom of the category.
 */
BlockList.populateCat_hummingbird=function(category){
	category.addBlock("B_HBServo");
	category.addBlock("B_HBMotor");
	category.addBlock("B_HBVibration");
	category.addSpace();
	category.addBlock("B_HBLed");
	category.addBlock("B_HBTriLed");
	category.addSpace();
	category.addBlock("B_HBLight");
	category.addBlock("B_HBTempC");
	category.addBlock("B_HBTempF");
	category.addBlock("B_HBDistCM");
	category.addBlock("B_HBDistInch");
	category.addBlock("B_HBKnob");
	category.addBlock("B_HBSound");
	category.trimBottom();
};
BlockList.populateCat_motion=function(category){
	category.addBlock("B_Move");
	category.addBlock("B_TurnRight");
	category.addBlock("B_TurnLeft");
	category.addSpace();
	category.addBlock("B_PointInDirection");
	category.addBlock("B_PointTowards");
	category.addSpace();
	category.addBlock("B_GoToXY");
	category.addBlock("B_GoTo");
	category.addBlock("B_GlideToXY");
	category.addSpace();
	category.addBlock("B_ChangeXBy");
	category.addBlock("B_SetXTo");
	category.addBlock("B_ChangeYBy");
	category.addBlock("B_SetYTo");
	category.addSpace();
	category.addBlock("B_IfOnEdgeBounce");
	category.addSpace();
	category.addBlock("B_XPosition");
	category.addBlock("B_YPosition");
	category.addBlock("B_Direction");
	category.trimBottom();
}
BlockList.populateCat_looks=function(category){
	category.addBlock("B_alert");
	category.addBlock("B_SetTitleBarColor");
	category.addSpace();
	category.addBlock("B_SayForSecs");
	category.addBlock("B_Say");
	category.addBlock("B_ThinkForSecs");
	category.addBlock("B_Think");
	category.addSpace();
	category.addBlock("B_ChangeSizeBy");
	category.addBlock("B_SetSizeTo");
	category.addBlock("B_Size");
	category.addSpace();
	category.addBlock("B_Show");
	category.addBlock("B_Hide");
	category.addSpace();
	category.addBlock("B_GoToFront");
	category.addBlock("B_GoBackLayers");
	category.trimBottom();
}
BlockList.populateCat_sound=function(category){
	
}
BlockList.populateCat_pen=function(category){
	
}
BlockList.populateCat_ipad=function(category){
	category.addBlock("B_DeviceShaken");
	category.addBlock("B_DeviceLocation");
	category.addBlock("B_DeviceSSID");
	category.addBlock("B_DevicePressure");
	category.addBlock("B_DeviceRelativeAltitude");
	category.addBlock("B_DeviceAcceleration");
	category.addBlock("B_DeviceOrientation");
	category.trimBottom();
}
BlockList.populateCat_control=function(category){
	category.addBlock("B_WhenFlagTapped");
	category.addBlock("B_WhenIAmTapped");
	category.addBlock("B_WhenIReceive");
	category.addSpace();
	category.addBlock("B_Broadcast");
	category.addBlock("B_BroadcastAndWait");
	category.addBlock("B_Message");
	category.addSpace();
	category.addBlock("B_Wait");
	category.addBlock("B_WaitUntil");
	category.addSpace();
	category.addBlock("B_Forever");
	category.addBlock("B_Repeat");
	category.addBlock("B_RepeatUntil");
	category.addSpace();
	category.addBlock("B_If");
	category.addBlock("B_IfElse");
	category.addSpace();
	category.addBlock("B_StopAll");
	category.addBlock("B_StopAllBut");
	category.trimBottom();
}
BlockList.populateCat_sensing=function(category){
	category.addBlock("B_Touching");
	category.addSpace();
	category.addBlock("B_Ask");
	category.addBlock("B_Answer");
	category.addSpace();
	category.addBlock("B_TouchX");
	category.addBlock("B_TouchY");
	category.addSpace();
	category.addBlock("B_DistanceTo");
	category.addSpace();
	category.addBlock("B_ResetTimer");
	category.addBlock("B_Timer");
	category.addSpace();
	category.addBlock("B_CurrentTime");
	category.trimBottom();
	
}
BlockList.populateCat_operators=function(category){
	category.addBlock("B_Add");
	category.addBlock("B_Subtract");
	category.addBlock("B_Multiply");
	category.addBlock("B_Divide");
	category.addSpace();
	category.addBlock("B_Round");
	category.addBlock("B_mathOfNumber");
	category.addBlock("B_PickRandom");
	category.addSpace();
	category.addBlock("B_LessThan");
	category.addBlock("B_EqualTo");
	category.addBlock("B_GreaterThan");
	category.addSpace();
	category.addBlock("B_And");
	category.addBlock("B_Or");
	category.addBlock("B_Not");
	category.addSpace();
	category.addBlock("B_True");
	category.addBlock("B_False");
	category.addSpace();
	category.addBlock("B_LetterOf");
	category.addBlock("B_LengthOf");
	category.addBlock("B_join");
	category.trimBottom();
	
}
BlockList.populateCat_variables=function(category){
	
}