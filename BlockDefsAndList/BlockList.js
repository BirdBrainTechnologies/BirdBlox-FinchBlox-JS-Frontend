/* BlockList is a static class that holds a list of blocks and categories.
 * It is in charge of populating the BlockPalette by helping to create Category objects.
 */
/* Populates the list of category names. Run by GuiElements. */
function BlockList(){
	BlockList.categories=new Array();
	//List only includes categories that will appear in the BlockPalette. "Lists" category is excluded.
	var cat=BlockList.categories;
	// Catetory names should be capitalized in the way they should be displayed on screen.
	cat.push("Robots"); 
	cat.push("Operators");
	cat.push("Sound");
	cat.push("Tablet");
	//cat.push("Motion");
	//cat.push("Looks");
	//cat.push("Pen");

	cat.push("Control");
	//cat.push("Sensing");

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
 * Blocks are added with category.addBlockByName(blockNameAsString) and spaces between groups with category.addSpace().
 * category.trimBottom() is used to remove any extra space at the bottom of the category.
 */
BlockList.populateCat_robots = function(category) {
	if (HummingbirdManager.GetDeviceCount() > 0 || FlutterManager.GetDeviceCount() > 0) {
		if (FlutterManager.GetDeviceCount() > 0) {
			category.addLabel("Flutter");
			category.addSpace();
			BlockList.populateCat_flutter(category);
			category.addSpace();
		}
		if (HummingbirdManager.GetDeviceCount() > 0) {
			category.addLabel("Hummingbird");
			category.addSpace();
			BlockList.populateCat_hummingbird(category);
			category.addSpace();
		}
	} else {
		category.addLabel("Connect a robot first...");
	}
}
BlockList.populateCat_hummingbird=function(category){
	category.addBlockByName("B_HBServo");
	category.addBlockByName("B_HBMotor");
	category.addBlockByName("B_HBVibration");
	category.addSpace();
	category.addBlockByName("B_HBLed");
	category.addBlockByName("B_HBTriLed");
	category.addSpace();
	category.addBlockByName("B_HBLight");
	category.addBlockByName("B_HBTempC");
	category.addBlockByName("B_HBTempF");
	category.addBlockByName("B_HBDistCM");
	category.addBlockByName("B_HBDistInch");
	category.addBlockByName("B_HBKnob");
	category.addBlockByName("B_HBSound");
	category.trimBottom();
};
BlockList.populateCat_flutter=function(category){
	category.addBlockByName("B_FlutterServo");
	category.addBlockByName("B_FlutterTriLed");
	category.addSpace();
	category.addBlockByName("B_FlutterLight");
	category.addBlockByName("B_FlutterTempC");
	category.addBlockByName("B_FlutterTempF");
	category.addBlockByName("B_FlutterDistCM");
	category.addBlockByName("B_FlutterDistInch");
	category.addBlockByName("B_FlutterKnob");
	category.addBlockByName("B_FlutterSound");
	category.addBlockByName("B_FlutterSoil");
	category.trimBottom();
};
BlockList.populateCat_motion=function(category){
	category.addBlockByName("B_Move");
	category.addBlockByName("B_TurnRight");
	category.addBlockByName("B_TurnLeft");
	category.addSpace();
	category.addBlockByName("B_PointInDirection");
	category.addBlockByName("B_PointTowards");
	category.addSpace();
	category.addBlockByName("B_GoToXY");
	category.addBlockByName("B_GoTo");
	category.addBlockByName("B_GlideToXY");
	category.addSpace();
	category.addBlockByName("B_ChangeXBy");
	category.addBlockByName("B_SetXTo");
	category.addBlockByName("B_ChangeYBy");
	category.addBlockByName("B_SetYTo");
	category.addSpace();
	category.addBlockByName("B_IfOnEdgeBounce");
	category.addSpace();
	category.addBlockByName("B_XPosition");
	category.addBlockByName("B_YPosition");
	category.addBlockByName("B_Direction");
	category.trimBottom();
}
BlockList.populateCat_looks=function(category){
	category.addBlockByName("B_alert");
	category.addBlockByName("B_SetTitleBarColor");
	category.addSpace();
	category.addBlockByName("B_SayForSecs");
	category.addBlockByName("B_Say");
	category.addBlockByName("B_ThinkForSecs");
	category.addBlockByName("B_Think");
	category.addSpace();
	category.addBlockByName("B_ChangeSizeBy");
	category.addBlockByName("B_SetSizeTo");
	category.addBlockByName("B_Size");
	category.addSpace();
	category.addBlockByName("B_Show");
	category.addBlockByName("B_Hide");
	category.addSpace();
	category.addBlockByName("B_GoToFront");
	category.addBlockByName("B_GoBackLayers");
	category.trimBottom();
}
BlockList.populateCat_sound=function(category){
	category.addBlockByName("B_PlaySound");
	category.addBlockByName("B_PlaySoundUntilDone");
	category.addBlockByName("B_StopAllSounds");
	category.addSpace();
	category.addBlockByName("B_RestForBeats");
	category.addBlockByName("B_PlayNoteForBeats");
	category.addSpace();
	category.addBlockByName("B_ChangeTempoBy");
	category.addBlockByName("B_SetTempoTo");
	category.addBlockByName("B_Tempo");
	category.trimBottom();
};
BlockList.populateCat_pen=function(category){
	
}
BlockList.populateCat_tablet=function(category){
	category.addBlockByName("B_DeviceShaken");
	category.addBlockByName("B_DeviceLocation");
	category.addBlockByName("B_DeviceSSID");
	category.addBlockByName("B_DevicePressure");
	category.addBlockByName("B_DeviceRelativeAltitude");
	category.addBlockByName("B_DeviceAcceleration");
	category.addBlockByName("B_DeviceOrientation");
	category.addSpace();
	category.addBlockByName("B_Display");
	category.addSpace();
	category.addBlockByName("B_Ask");
	category.addBlockByName("B_Answer");
	category.addSpace();
	category.addBlockByName("B_ResetTimer");
	category.addBlockByName("B_Timer");
	category.addSpace();
	category.addBlockByName("B_CurrentTime");
	category.trimBottom();
};
BlockList.populateCat_control=function(category){
	category.addBlockByName("B_WhenFlagTapped");
	//category.addBlockByName("B_WhenIAmTapped");
	category.addBlockByName("B_WhenIReceive");
	category.addSpace();
	category.addBlockByName("B_Broadcast");
	category.addBlockByName("B_BroadcastAndWait");
	category.addBlockByName("B_Message");
	category.addSpace();
	category.addBlockByName("B_Wait");
	category.addBlockByName("B_WaitUntil");
	category.addSpace();
	category.addBlockByName("B_Forever");
	category.addBlockByName("B_Repeat");
	category.addBlockByName("B_RepeatUntil");
	category.addSpace();
	category.addBlockByName("B_If");
	category.addBlockByName("B_IfElse");
	category.addSpace();
	category.addBlockByName("B_Stop");
	category.trimBottom();
}
BlockList.populateCat_sensing=function(category){

}
BlockList.populateCat_operators=function(category){
	category.addBlockByName("B_Add");
	category.addBlockByName("B_Subtract");
	category.addBlockByName("B_Multiply");
	category.addBlockByName("B_Divide");
	category.addSpace();
	category.addBlockByName("B_Mod");
	category.addBlockByName("B_Round");
	category.addBlockByName("B_mathOfNumber");
	category.addBlockByName("B_PickRandom");
	category.addSpace();
	category.addBlockByName("B_LessThan");
	category.addBlockByName("B_EqualTo");
	category.addBlockByName("B_GreaterThan");
	category.addSpace();
	category.addBlockByName("B_And");
	category.addBlockByName("B_Or");
	category.addBlockByName("B_Not");
	category.addSpace();
	category.addBlockByName("B_True");
	category.addBlockByName("B_False");
	category.addSpace();
	category.addBlockByName("B_LetterOf");
	category.addBlockByName("B_LengthOf");
	category.addBlockByName("B_join");
	category.addBlockByName("B_Split");
	category.addSpace();
	category.addBlockByName("B_IsAType");
	category.trimBottom();
	
}
// @fix Write Documentation.
BlockList.populateCat_variables=function(category){
	var callbackFn=function(){
		CodeManager.newVariable();
	};
	category.addButton("Create variable",150,25,callbackFn);
	category.addSpace();
	var variables=CodeManager.variableList;
	if(variables.length>0){
		for(var i=0;i<variables.length;i++){
			category.addVariableBlock(variables[i]);
		}
		category.addSpace();
		category.addBlockByName("B_SetTo");
		category.addBlockByName("B_ChangeBy");
	}
	callbackFn=function(){
		CodeManager.newList();
	};
	category.addSpace();
	category.addButton("Create list",150,25,callbackFn);
	category.addSpace();
	var lists=CodeManager.listList;
	if(lists.length>0){
		for(var i=0;i<lists.length;i++){
			category.addListBlock(lists[i]);
		}
		category.addSpace();
		category.addBlockByName("B_AddToList");
		category.addBlockByName("B_DeleteItemOfList");
		category.addBlockByName("B_InsertItemAtOfList");
		category.addBlockByName("B_ReplaceItemOfListWith");
		category.addBlockByName("B_CopyListToList");
	}
	category.addBlockByName("B_ItemOfList");
	category.addBlockByName("B_LengthOfList");
	category.addBlockByName("B_ListContainsItem");
	category.trimBottom();
};