/* BlockList is a static class that holds a list of blocks and categories.
 * It is in charge of populating the BlockPalette by helping to create Category objects.
 */
/**
 * Populates the list of category names. Run by GuiElements.
 */
function BlockList() {
	const cat = BlockList.categories = [];

	// List only includes categories that will appear in the BlockPalette in order.
	// Category names should be capitalized in the way they should be displayed on screen.
	if (FinchBlox) {
		cat.push("Motion_1");
		cat.push("Color_1");
		cat.push("Sound_1");
		cat.push("Motion_2");
		cat.push("Color_2");
		cat.push("Sound_2");
		cat.push("Motion_3");
		cat.push("Color_3");
		cat.push("Sound_3");
		cat.push("Control_3");
		cat.push("Sensor_3");
	} else {
		cat.push("Robots");
		cat.push("Operators");
		cat.push("Sound");
		cat.push("Tablet");
		cat.push("Control");
		cat.push("Variables");
	}

}

/**
 * Returns the id for a category given its index in the category list. Ids are lowercase.
 * @param {number} index - The category's index in the category name list.
 * @return {string} - The category's id (its name in lowercase).
 */
BlockList.getCatId = function(index) {
	return BlockList.categories[index].toLowerCase();
};

/**
 * Returns the category's name given its index in the category list.
 * @param {number} index - The category's index in the category name list.
 * @return {string} - The category's name.
 */
BlockList.getCatName = function(index) {
	return Language.getStr(BlockList.categories[index]);
};

/**
 * Returns the length of the category list.
 * @return {number} - The length of the category list.
 */
BlockList.catCount = function() {
	return BlockList.categories.length;
};

/*
 * The following functions populate a Category for the BlockPalette.
 * Each function has the same structure.
 * Blocks are added with category.addBlockByName(blockNameAsString) and spaces between groups with category.addSpace().
 * category.trimBottom() is used to remove any extra space at the bottom of the category.
 */

// FINCHBLOX CATEGORIES
/**
* @param {Category} category
*/
BlockList.populateCat_motion_1 = function(category) {
	category.addBlockByName("B_FBForward");
	category.addBlockByName("B_FBBackward");
	category.addBlockByName("B_FBRight");
	category.addBlockByName("B_FBLeft");
	category.trimBottom();
}
BlockList.populateCat_color_1 = function(category) {
	category.addBlockByName("B_Ask");
	category.addBlockByName("B_Display");
	category.trimBottom();
}
BlockList.populateCat_sound_1 = function(category) {
	category.addBlockByName("B_StopAllSounds");
	category.addBlockByName("B_PlaySound");
	category.addBlockByName("B_PlayNoteForBeats");
	category.trimBottom();
}
BlockList.populateCat_motion_2 = function(category) {
	category.addBlockByName("B_FBForwardL2");
	category.addBlockByName("B_FBBackwardL2");
	category.addBlockByName("B_FBRightL2");
	category.addBlockByName("B_FBLeftL2");
	category.trimBottom();
}
BlockList.populateCat_color_2 = function(category) {
	category.addBlockByName("B_Ask");
	category.addBlockByName("B_Display");
	category.trimBottom();
}
BlockList.populateCat_sound_2 = function(category) {
	category.addBlockByName("B_StopAllSounds");
	category.addBlockByName("B_PlaySound");
	category.addBlockByName("B_PlayNoteForBeats");
	category.trimBottom();
}
BlockList.populateCat_motion_3 = function(category) {
	category.addBlockByName("B_FBForwardL3");
	category.addBlockByName("B_FBBackwardL3");
	category.addBlockByName("B_FBRightL3");
	category.addBlockByName("B_FBLeftL3");
	category.trimBottom();
}
BlockList.populateCat_color_3 = function(category) {
	category.addBlockByName("B_Ask");
	category.addBlockByName("B_Display");
	category.trimBottom();
}
BlockList.populateCat_sound_3 = function(category) {
	category.addBlockByName("B_StopAllSounds");
	category.addBlockByName("B_PlaySound");
	category.addBlockByName("B_PlayNoteForBeats");
	category.trimBottom();
}
BlockList.populateCat_control_3 = function(category) {
	category.addBlockByName("B_WhenFlagTapped");
	category.addBlockByName("B_WaitUntil");
	category.addBlockByName("B_Forever");
	category.addBlockByName("B_Repeat");
	category.trimBottom();
}
BlockList.populateCat_sensor_3 = function(category) {
	category.addBlockByName("B_When");
	category.trimBottom();
}


// BIRDBLOX CATEGORIES
/**
 * @param {Category} category
 */
BlockList.populateCat_tablet = function(category) {
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

/**
 * @param {Category} category
 */
BlockList.populateCat_operators = function(category) {
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
};

/**
 * @param {Category} category
 */
BlockList.populateCat_control = function(category) {
	category.addBlockByName("B_WhenFlagTapped");
	category.addBlockByName("B_WhenIReceive");
	category.addSpace();
	category.addBlockByName("B_When");
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
};

/**
 * @param {Category} category
 */
BlockList.populateCat_sound = function(category) {
	const button = category.addButton(Language.getStr("Record_sound"), RecordingDialog.showDialog, true);
	button.setDisabledTabFunction(RecordingDialog.alertNotInProject);
	category.addSpace();
	category.addBlockByName("B_PlayRecording");
	category.addBlockByName("B_PlayRecordingUntilDone");
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

/**
 * @param {Category} category
 */
BlockList.populateCat_variables = function(category) {
	category.addButton(Language.getStr("Create_Variable"), CodeManager.newVariable);
	category.addSpace();

	const variables = CodeManager.variableList;
	if (variables.length > 0) {
		// We show a variable Block for every variable
		variables.forEach(function(variable) {
			category.addVariableBlock(variable);
		});
		category.addSpace();

		// These Blocks let the variable be selected from a DropSlot, so we only need one of each of them
		category.addBlockByName("B_SetTo");
		category.addBlockByName("B_ChangeBy");
	}

	category.addSpace();
	category.addButton(Language.getStr("Create_List"), CodeManager.newList);
	category.addSpace();

	const lists = CodeManager.listList;
	if (lists.length > 0) {
		lists.forEach(function(list) {
			category.addListBlock(list);
		});
		category.addSpace();
		category.addBlockByName("B_AddToList");
		category.addBlockByName("B_DeleteItemOfList");
		category.addBlockByName("B_InsertItemAtOfList");
		category.addBlockByName("B_ReplaceItemOfListWith");
		category.addBlockByName("B_CopyListToList");
	}

	// These list functions can take input from the Split block, so we show them even if there are no Lists
	category.addBlockByName("B_ItemOfList");
	category.addBlockByName("B_LengthOfList");
	category.addBlockByName("B_ListContainsItem");
	category.trimBottom();
};

/**
 * Robot Blocks are stored in collapsible sets for each type of Robot.  This function creates the groupings
 * and BlockList.populateItem_[deviceClassId] fills a given group
 * @param {Category} category
 */
BlockList.populateCat_robots = function(category) {
	// A list of names and ids to give the Collapsible Set constructor
	let nameIdList = [];
	let typeList = Device.getTypeList();
	typeList.forEach(function(deviceClass) {
		let entry = {};
		entry.name = deviceClass.getDeviceTypeName();
		entry.id = deviceClass.getDeviceTypeId();
		nameIdList.push(entry);
	});
	// Create the set and add it to the category
	const set = category.addCollapsibleSet(nameIdList);

	for (let i = 0; i < typeList.length; i++) {
		// Populate each item in the set
		const item = set.getItem(i);
		BlockList["populateItem_" + typeList[i].getDeviceTypeId()](item);
	}
	category.trimBottom();
};

/**
 * @param {CollapsibleItem} collapsibleItem
 */
BlockList.populateItem_hummingbird = function(collapsibleItem) {
	collapsibleItem.addBlockByName("B_HBServo");
	collapsibleItem.addBlockByName("B_HBMotor");
	collapsibleItem.addBlockByName("B_HBVibration");
	collapsibleItem.addSpace();
	collapsibleItem.addBlockByName("B_HBLed");
	collapsibleItem.addBlockByName("B_HBTriLed");
	collapsibleItem.addSpace();
	collapsibleItem.addBlockByName("B_HBLight");
	collapsibleItem.addBlockByName("B_HBTempC");
	collapsibleItem.addBlockByName("B_HBTempF");
	collapsibleItem.addBlockByName("B_HBDistCM");
	//collapsibleItem.addBlockByName("B_HBDistInch");
	collapsibleItem.addBlockByName("B_HBKnob");
	collapsibleItem.addBlockByName("B_HBSound");
	collapsibleItem.trimBottom();
	collapsibleItem.finalize();
};

/**
 * @param {CollapsibleItem} collapsibleItem
 */
BlockList.populateItem_hummingbirdbit = function(collapsibleItem) {

	collapsibleItem.addBlockByName("B_BBTriLed");
	collapsibleItem.addBlockByName("B_BBLed")
	collapsibleItem.addBlockByName("B_BBPositionServo");
	collapsibleItem.addBlockByName("B_BBRotationServo");
	collapsibleItem.addBlockByName("B_BBBuzzer");
	collapsibleItem.addSpace();
	collapsibleItem.addBlockByName("B_BBSensors");
	collapsibleItem.addBlockByName("B_BBMagnetometer");
	collapsibleItem.addBlockByName("B_BBLedArray");
	collapsibleItem.addBlockByName("B_BBPrint");
	collapsibleItem.addBlockByName("B_BBButton");
	collapsibleItem.addBlockByName("B_BBOrientation");
	collapsibleItem.addBlockByName("B_BBCompass");
	collapsibleItem.trimBottom();
	collapsibleItem.finalize();
};

/**
 * @param {CollapsibleItem} collapsibleItem
 */
BlockList.populateItem_microbit = function(collapsibleItem) {
	collapsibleItem.addBlockByName("B_MBLedArray");
	collapsibleItem.addSpace();
	collapsibleItem.addBlockByName("B_MBPrint");
	collapsibleItem.addBlockByName("B_MBWriteToPin");
	collapsibleItem.addBlockByName("B_MBBuzzer");
	collapsibleItem.addSpace();
	collapsibleItem.addBlockByName("B_MBMagnetometer");
	collapsibleItem.addBlockByName("B_MBReadPin");
	collapsibleItem.addBlockByName("B_MBButton");
	collapsibleItem.addBlockByName("B_MBOrientation");
	collapsibleItem.addBlockByName("B_MBCompass");
	collapsibleItem.trimBottom();
	collapsibleItem.finalize();
};

/**
 * @param {CollapsibleItem} collapsibleItem
 *//*
BlockList.populateItem_finch = function(collapsibleItem) {
	collapsibleItem.addBlockByName("B_FinchSetAll");
	collapsibleItem.trimBottom();
	collapsibleItem.finalize();
};*/

/**
 * @param {CollapsibleItem} collapsibleItem
 *//*
BlockList.populateItem_flutter = function(collapsibleItem) {
	collapsibleItem.addBlockByName("B_FlutterServo");
	collapsibleItem.addBlockByName("B_FlutterTriLed");
	collapsibleItem.addBlockByName("B_FlutterBuzzer");
	collapsibleItem.addSpace();
	collapsibleItem.addBlockByName("B_FlutterLight");
	collapsibleItem.addBlockByName("B_FlutterTempC");
	collapsibleItem.addBlockByName("B_FlutterTempF");
	collapsibleItem.addBlockByName("B_FlutterDistCM");
	collapsibleItem.addBlockByName("B_FlutterDistInch");
	collapsibleItem.addBlockByName("B_FlutterKnob");
	collapsibleItem.addBlockByName("B_FlutterSound");
	collapsibleItem.addBlockByName("B_FlutterSoil");
	collapsibleItem.trimBottom();
	collapsibleItem.finalize();
};*/
