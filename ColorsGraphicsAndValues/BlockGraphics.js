/*
 * Static class holds all constants and functions required for Block rendering.
 * Note that some of the constants are repeated for each type of Block, so be sure to edit all of them if you're
 * editing one.
 */

/**
 * Initializes the static class by setting all constants
 */
function BlockGraphics() {
	// Set constants for blocks
	BlockGraphics.SetBlock();
	BlockGraphics.SetCommand();
	BlockGraphics.SetReporter();
	BlockGraphics.SetPredicate();
	BlockGraphics.SetString();
	BlockGraphics.SetHat();
	BlockGraphics.SetLoop();

	// Set constants for block parts
	BlockGraphics.SetLabelText();
	BlockGraphics.SetValueText();

	// Set constants for Slots
	BlockGraphics.SetDropSlot();
	BlockGraphics.SetHighlight();
	BlockGraphics.SetHitBox();
	BlockGraphics.SetGlow();

	// Pre-compute some strings useful for rendering blocks
	BlockGraphics.CalcCommand();
	BlockGraphics.CalcPaths();
}

/* Constants for all Blocks */
BlockGraphics.SetBlock = function() {
	BlockGraphics.block = {};
	BlockGraphics.block.pMargin = 7; // Margin between parts
};

/* Used by CommandBlocks, LoopBlocks, and HatBlocks */
BlockGraphics.SetCommand = function() {
	BlockGraphics.command = {};

	// Minimum dimensions
	if (FinchBlox) {
		BlockGraphics.command.height = 60;//76;
		BlockGraphics.command.width = 50;//76;
		BlockGraphics.command.cornerRadius = 8;//10;
		BlockGraphics.command.vMargin = 10; // The margin above and below the content (BlockParts) of the Block
		BlockGraphics.command.hMargin = 10;//20;//25; // The margin to the left and right of the content
//		BlockGraphics.command.bumpWidth = 15; //Width added by the bump sticking out
	} else {
		BlockGraphics.command.height = 34;
		BlockGraphics.command.width = 40;
		BlockGraphics.command.cornerRadius = 3;
		BlockGraphics.command.vMargin = 5; // The margin above and below the content (BlockParts) of the Block
		BlockGraphics.command.hMargin = 7; // The margin to the left and right of the content
	}


	BlockGraphics.command.bumpOffset = 7;
	BlockGraphics.command.bumpDepth = 4;
	BlockGraphics.command.bumpTopWidth = 15;
	BlockGraphics.command.bumpBottomWidth = 7;


	// Define the size of the snap bounding box (how close the Block being dragged must be to snap)
	BlockGraphics.command.snap = {};
	if (FinchBlox){
		BlockGraphics.command.snap.left = 40;
		BlockGraphics.command.snap.right = 40;
		BlockGraphics.command.snap.top = 40;
		BlockGraphics.command.snap.bottom = 40;
	} else {
		BlockGraphics.command.snap.left = 20;
		BlockGraphics.command.snap.right = 20;
		BlockGraphics.command.snap.top = 20;
		BlockGraphics.command.snap.bottom = 20;
	}

	// How much Blocks are shifted down and to the right when they are bumped out of position by another Block
	BlockGraphics.command.shiftX = 20;
	BlockGraphics.command.shiftY = 20;
};

/* Used by RoundSlots and ReporterBlocks */
BlockGraphics.SetReporter = function() {
	BlockGraphics.reporter = {};

	// Minimum dimensions
	BlockGraphics.reporter.height = 30;
	BlockGraphics.reporter.width = 30;

	BlockGraphics.reporter.vMargin = 6;
	BlockGraphics.reporter.hMargin = 10;

	// Slot constants
	BlockGraphics.reporter.slotHeight = 22;
	BlockGraphics.reporter.slotWidth = 22;
	BlockGraphics.reporter.slotHMargin = 10; // Space to sides of content

	BlockGraphics.reporter.strokeW = 1;
	BlockGraphics.reporter.slotFill = Colors.white;
	BlockGraphics.reporter.slotSelectedFill = Colors.lightGray;
};

/* Used by HexSlots and HexBlocks */
BlockGraphics.SetPredicate = function() {
	BlockGraphics.predicate = {};

	// Minimum dimensions
	BlockGraphics.predicate.height = 30;
	BlockGraphics.predicate.width = 27;

	BlockGraphics.predicate.vMargin = 6;
	BlockGraphics.predicate.hMargin = 10;

	// Width of pointy part of hexagons
	BlockGraphics.predicate.hexEndL = 10;

	// Slot constants
	BlockGraphics.predicate.slotHeight = 18;
	BlockGraphics.predicate.slotWidth = 25;
	BlockGraphics.predicate.slotHMargin = 5;
	BlockGraphics.predicate.slotHexEndL = 7;
};

/* Used be RectSlots */
BlockGraphics.SetString = function() {
	BlockGraphics.string = {};
	BlockGraphics.string.slotHeight = 22;
	BlockGraphics.string.slotWidth = 22;
	BlockGraphics.string.slotHMargin = 4;
};

/* Additional constants for HatBlocks */
BlockGraphics.SetHat = function() {
	BlockGraphics.hat = {};

	//Hat radius for FinchBlox
	BlockGraphics.hat.r = 24;//30;

	// Radius of ellipse at top of Block
	BlockGraphics.hat.hRadius = 60;
	BlockGraphics.hat.vRadius = 40;

	// Width of ellipse
	BlockGraphics.hat.topW = 80;

	if (FinchBlox) {
		BlockGraphics.hat.width = 40;
	} else {
		// Minimum width is larger than CommandBlocks to leave room for ellipse
		BlockGraphics.hat.width = 90;
	}

	// Additional height added by ellipse.  Used for spacing Blocks in the Palette
	BlockGraphics.hat.hatHEstimate = 10;
};

/* Additional constants for LoopBlocks */
BlockGraphics.SetLoop = function() {
	BlockGraphics.loop = {};

	// Minimum width of loop blocks
	BlockGraphics.loop.width = 40;
	//BirdBlox
	BlockGraphics.loop.bottomH = 7; //Height of the bottom arm
	BlockGraphics.loop.side = 7; //width of the bit that connects the main block to the bottom arm.
	//FinchBlox
	BlockGraphics.loop.armW = 5 + 2*BlockGraphics.command.cornerRadius; //Width of the loop arm.
	BlockGraphics.loop.loopH = 10; //height of the bit connecting the main block to the arm.
};




/* LabelText constants */
BlockGraphics.SetLabelText = function() {
	BlockGraphics.labelText = {};
	BlockGraphics.labelText.font = Font.uiFont(12).bold();
	BlockGraphics.labelText.fill = Colors.white;
	BlockGraphics.labelText.disabledFill = Colors.labelTextDisabled;
};

/* Constants for text in Slots */
BlockGraphics.SetValueText = function() {
	BlockGraphics.valueText = {};
	BlockGraphics.valueText.font = Font.uiFont(12);
	BlockGraphics.valueText.fill = Colors.black;
	BlockGraphics.valueText.selectedFill = Colors.white;
	BlockGraphics.valueText.grayedFill = Colors.valueTextGrayed;
};

/* Constants for DropSlots */
BlockGraphics.SetDropSlot = function() {
	BlockGraphics.dropSlot = {};
	BlockGraphics.dropSlot.slotHeight = 22;
	BlockGraphics.dropSlot.slotWidth = 25;
	BlockGraphics.dropSlot.slotHMargin = 5;
	BlockGraphics.dropSlot.triH = 6;
	BlockGraphics.dropSlot.triW = 8;
	BlockGraphics.dropSlot.bg = Colors.lightGray;
	BlockGraphics.dropSlot.bgOpacity = 0.25;
	BlockGraphics.dropSlot.selectedBg = Colors.white;
	BlockGraphics.dropSlot.selectedBgOpacity = 1;
	BlockGraphics.dropSlot.triColor = Colors.white;
	BlockGraphics.dropSlot.textFill = Colors.white;
	BlockGraphics.dropSlot.selectedTriColor = Colors.white;
};

/* Constants for indicator that shows where Blocks will be snapped */
BlockGraphics.SetHighlight = function() {
	BlockGraphics.highlight = {};
	BlockGraphics.highlight.margin = 5;
	BlockGraphics.highlight.hexEndL = 15;
	BlockGraphics.highlight.slotHexEndL = 10;
	if (FinchBlox) {
		BlockGraphics.highlight.strokeC = Colors.fbHighlight;
	} else {
		BlockGraphics.highlight.strokeC = Colors.white;
	}
	BlockGraphics.highlight.strokeDarkC = Colors.black;
	BlockGraphics.highlight.strokeW = 3;
	BlockGraphics.highlight.commandL = 10;
};

/* Constants for Slot hit box */
BlockGraphics.SetHitBox = function() {
	BlockGraphics.hitBox = {};
	BlockGraphics.hitBox.hMargin = BlockGraphics.block.pMargin / 2;
	BlockGraphics.hitBox.vMargin = 3;
};

/* Constants for outline on running Blocks */
BlockGraphics.SetGlow = function() {
	BlockGraphics.glow = function() {};
	BlockGraphics.glow.color = Colors.white;
	BlockGraphics.glow.strokeW = 2;
};

/* Computes intermediate values from constants */
BlockGraphics.CalcCommand = function() {
	const com = BlockGraphics.command;
	com.extraHeight = 2 * com.cornerRadius;
	com.extraWidth = 2 * com.cornerRadius + com.bumpTopWidth + com.bumpOffset;
	com.bumpSlantWidth = (com.bumpTopWidth - com.bumpBottomWidth) / 2;
};

/* Generates pre-made parts of paths. Final paths are generated by inserting numbers between pre-made strings */
BlockGraphics.CalcPaths = function() {
	const com = BlockGraphics.command;
	let path1 = "";
	//path1+="m "+com.x+","+com.y;
	path1 += " " + com.bumpOffset + ",0";
	path1 += " " + com.bumpSlantWidth + "," + com.bumpDepth;
	path1 += " " + com.bumpBottomWidth + ",0";
	path1 += " " + com.bumpSlantWidth + "," + (0 - com.bumpDepth);
	path1 += " ";
	let path2 = ",0";
	path2 += " a " + com.cornerRadius + " " + com.cornerRadius + " 0 0 1 " + com.cornerRadius + " " + com.cornerRadius;
	path2 += " l 0,";
	let path3 = "";
	path3 += " a " + com.cornerRadius + " " + com.cornerRadius + " 0 0 1 " + (0 - com.cornerRadius) + " " + com.cornerRadius;
	path3 += " l ";
	let path4 = ",0";
	path4 += " " + (0 - com.bumpSlantWidth) + "," + com.bumpDepth;
	path4 += " " + (0 - com.bumpBottomWidth) + ",0";
	path4 += " " + (0 - com.bumpSlantWidth) + "," + (0 - com.bumpDepth);
	path4 += " " + (0 - com.bumpOffset) + ",0";
	path4 += " a " + com.cornerRadius + " " + com.cornerRadius + " 0 0 1 " + (0 - com.cornerRadius) + " " + (0 - com.cornerRadius);
	path4 += " ";
	let path4NoBump = ",0";
	path4NoBump += " " + (0 - com.bumpSlantWidth - com.bumpBottomWidth - com.bumpSlantWidth - com.bumpOffset) + ",0";
	path4NoBump += " a " + com.cornerRadius + " " + com.cornerRadius + " 0 0 1 " + (0 - com.cornerRadius) + " " + (0 - com.cornerRadius);
	path4NoBump += " ";
	let path5 = "";
	path5 += " a " + com.cornerRadius + " " + com.cornerRadius + " 0 0 1 " + com.cornerRadius + " " + (0 - com.cornerRadius);
	path5 += " z";

	//*** FinchBlox Bumps ***//
	let r = 2;//2; //bump corner radius
	let d = 2;//4; //straight distance across top
	let u = 2; //straight distance up from neck
	let n = 3; //neck width
	let h = 24;//32; //main straight height
	let fbBumpOut = " "+n+",0 0,"+(-u)+" "; //line across, line up
	fbBumpOut += "a "+r+" "+r+" 0 0 1 "+r+" "+(-r)+" "; //corner
	fbBumpOut += "l "+d+",0 "; //line across
	fbBumpOut += "a "+r+" "+r+" 0 0 1 "+r+" "+r+" "; //corner
	fbBumpOut += "l 0,"+h+" "; //main vertial line
	fbBumpOut += "a "+r+" "+r+" 0 0 1 "+(-r)+" "+r+" "; //corner
	fbBumpOut += "l "+(-d)+",0 "; //line across
	fbBumpOut += "a "+r+" "+r+" 0 0 1 "+(-r)+" "+(-r)+" "; //corner
	fbBumpOut += "l 0,"+(-u)+" "+(-n)+",0 "; //line up, line across
	let fbBumpIn = " "+n+",0 0,"+u+" ";
	fbBumpIn += "a "+r+" "+r+" 0 0 0 "+r+" "+r+" ";
	fbBumpIn += "l "+d+",0 ";
	fbBumpIn += "a "+r+" "+r+" 0 0 0 "+r+" "+(-r)+" ";
	fbBumpIn += "l 0,"+(-h)+" ";
	fbBumpIn += "a "+r+" "+r+" 0 0 0 "+(-r)+" "+(-r)+" ";
	fbBumpIn += "l "+(-d)+",0 ";
	fbBumpIn += "a "+r+" "+r+" 0 0 0 "+(-r)+" "+r+" ";
	fbBumpIn += "l 0,"+u+" "+(-n)+",0 ";
	com.path1 = path1; //Top edge
	com.path2 = path2; //top right corner
	com.path3 = path3; //bottom right corner
	com.path4 = path4; //Bottom edge and bottom left corner
	com.path4NoBump = path4NoBump;
	com.path5 = path5; //top left corner
	com.fbBumpOut = fbBumpOut; //FinchBlox right side bump out
	com.fbBumpIn = fbBumpIn; //FinchBlox left side bump in
	com.fbBumpDepth = n + 2*r + d;//  11; //total width of the bump
	com.fbBumpNeck = (h - 2*u)/2;// 13; //half the height of the neck of the bump
};

/* Types of blocks are referred to by numbers, as indicated by this function */

/**
 * @param {number} type
 * @return {object}
 */
BlockGraphics.getType = function(type) {
	switch (type) {
		case 0:
			return BlockGraphics.command;
		case 1:
			return BlockGraphics.reporter;
		case 2:
			return BlockGraphics.predicate;
		case 3:
			return BlockGraphics.string;
		case 4:
			return BlockGraphics.hat;
		case 5:
			return BlockGraphics.loop;
		case 6:
			return BlockGraphics.loop;
	}
};

/* Group of functions that generate strings for SVG paths */
BlockGraphics.buildPath = {};

/**
 * Creates the path of a CommandBlock
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @return {string}
 */
BlockGraphics.buildPath.command = function(x, y, width, height) {
	let path = "";
	path += "m " + (x + BlockGraphics.command.cornerRadius) + "," + y;
	path += BlockGraphics.command.path1;
	path += width - BlockGraphics.command.extraWidth;
	path += BlockGraphics.command.path2;
	path += height - BlockGraphics.command.extraHeight;
	path += BlockGraphics.command.path3;
	path += BlockGraphics.command.extraWidth - width;
	path += BlockGraphics.command.path4 + "l 0,";
	path += BlockGraphics.command.extraHeight - height;
	path += BlockGraphics.command.path5;
	if (FinchBlox){
		//The width assigned should be the width of the solid part of the block -
		// not including the bump out or the bump in.
		let com = BlockGraphics.command;
		let straightHeight = (height - com.extraHeight)/2 - com.fbBumpNeck;

		path = "";
		//Start at the beginning of the top straight part
		//path += "m " + (x + com.cornerRadius) + "," + y + " l ";
		path += "m " + (x - com.fbBumpDepth + com.cornerRadius) + "," + y + " l ";
		//straight line across
		//path += width - com.fbBumpDepth - 2*com.cornerRadius;
		path += width + com.fbBumpDepth - 2*com.cornerRadius;
		//top right corner and down to start of bump
		path += com.path2;
		path += straightHeight;
		//bump
		path += com.fbBumpOut;
		//down
		path += "0," + straightHeight;
		//bottom right corner
		path += com.path3;
		//straight line across bottom
		path += 2*com.cornerRadius - width - com.fbBumpDepth + ",0";
		//bottom left corner
		path += " a " + com.cornerRadius + " " + com.cornerRadius + " 0 0 1 " + (0 - com.cornerRadius) + " " + (0 - com.cornerRadius);
		//line up to bump in
		path += " l 0,";
		path += -straightHeight;
		//bump
		path += com.fbBumpIn;
		//line up and top left corner
		path += "0," + (-straightHeight);
		path += com.path5;
	}
	return path;
};

/**
 * Creates the path of a highlight between two CommandBlocks
 * @param {number} x
 * @param {number} y
 * @return {string}
 */
BlockGraphics.buildPath.highlightCommand = function(x, y, height) {
	let path = "";
	if (FinchBlox) {
		var lineLength = 5;
		if (height != null){
			lineLength = (height - BlockGraphics.command.extraHeight)/2 - BlockGraphics.command.fbBumpNeck;
		}
		path += "m " + x + "," + (y + BlockGraphics.command.cornerRadius);
		path += "l 0," + lineLength;
		path += BlockGraphics.command.fbBumpOut;
		path += "0," + lineLength;
	} else {
		path += "m " + x + "," + y;
		path += "l " + BlockGraphics.command.cornerRadius + ",0";
		path += BlockGraphics.command.path1;
		path += BlockGraphics.highlight.commandL + ",0";
	}
	return path;
};

/**
 * Creates round path of a reporter Block/Slot
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @return {string}
 */
BlockGraphics.buildPath.reporter = function(x, y, width, height) {
	const radius = height / 2;
	const flatWidth = width - height;
	let path = "";
	path += "m " + (x + radius) + "," + (y + height);
	path += " a " + radius + " " + radius + " 0 0 1 0 " + (0 - height);
	path += " l " + flatWidth + ",0";
	path += " a " + radius + " " + radius + " 0 0 1 0 " + height;
	path += " z";
	return path;
};

/**
 * Creates the hexagonal path of a Slot/Block/highlight
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {boolean} isSlot
 * @param {boolean} isHighlight
 * @return {string}
 */
BlockGraphics.buildPath.predicate = function(x, y, width, height, isSlot, isHighlight) {
	let hexEndL;
	let halfHeight = height / 2;
	let bG;
	if (isHighlight) {
		bG = BlockGraphics.highlight;
	} else {
		bG = BlockGraphics.predicate;
	}
	if (isSlot) {
		hexEndL = bG.slotHexEndL;
	} else {
		hexEndL = bG.hexEndL;
	}
	let flatWidth = width - 2 * hexEndL;
	let path = "";
	path += "m " + x + "," + (y + halfHeight);
	path += " " + hexEndL + "," + (0 - halfHeight);
	path += " " + flatWidth + ",0";
	path += " " + hexEndL + "," + halfHeight;
	path += " " + (0 - hexEndL) + "," + halfHeight;
	path += " " + (0 - flatWidth) + ",0";
	path += " " + (0 - hexEndL) + "," + (0 - halfHeight);
	path += " z";
	return path;
};

/* Creates the rectangular path of a RectSlot */
BlockGraphics.buildPath.string = function(x, y, width, height) {
	let path = "";
	path += "m " + x + "," + y;
	path += " " + width + ",0";
	path += " 0," + height;
	path += " " + (0 - width) + ",0";
	path += " z";
	return path;
};

/* Creates the path of a HatBlock */
BlockGraphics.buildPath.hat = function(x, y, width, height) {
	let path = "";
	let hat = BlockGraphics.hat;
	let com = BlockGraphics.command;
	if (FinchBlox) {
		let straightHeight = (height - com.extraHeight)/2 - com.fbBumpNeck;
		let s = 2/3;
		//By using hat.r*s we allow the contents to slide partway into the hat
		path += "m " + (x+hat.r*s) + "," + y + " l ";
		//line across top
		path += width - com.cornerRadius - hat.r*s;
		//top rigth corner and line down to bump
		path += com.path2 + straightHeight;
		//bump
		path += com.fbBumpOut;
		//line down
		path += "0," + straightHeight;
		//bottom right corner and line across bottom
		path += com.path3 + (com.cornerRadius + hat.r*s - width) + ",0";
		//Hat
		//path += " a " + hat.vRadius + " " + hat.hRadius + " 0 0 1 0 " + (-height);
		path += " a " + hat.r + " " + hat.r + " 0 0 1 " + (-hat.r) + " " + (-hat.r);
		path += " l 0," + (- height + 2*hat.r);
		path += " a " + hat.r + " " + hat.r + " 0 0 1 " + hat.r + " " + (-hat.r);
		path += " z ";
	} else {
		let flatWidth = width - hat.topW - BlockGraphics.command.cornerRadius;
		let flatHeight = height - BlockGraphics.command.cornerRadius * 2;
		path += "m " + x + "," + y;
		path += " a " + hat.hRadius + " " + hat.vRadius + " 0 0 1 " + hat.topW + " 0";
		path += " l " + flatWidth;
		path += BlockGraphics.command.path2;
		path += flatHeight;
		path += BlockGraphics.command.path3;
		path += BlockGraphics.command.extraWidth - width;
		path += BlockGraphics.command.path4;
		path += "z";
	}
	return path;
};

/**
 * Creates the path of a LoopBlock
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} innerDim - The height (or width for FinchBlox) of the space in the middle of the loop
 * @param {boolean} [bottomOpen=true] - Whether a bump should be placed on the bottom of the path
 * @return {string}
 */
BlockGraphics.buildPath.loop = function(x, y, width, height, innerDim, bottomOpen) {
	if (bottomOpen == null) {
		bottomOpen = true;
	}
	let path = "";
	const loop = BlockGraphics.loop;
	const comm = BlockGraphics.command;
	if (FinchBlox) {
		let straightHeight = (height - comm.extraHeight)/2 - comm.fbBumpNeck;
		path += "m " + (x + comm.cornerRadius) + "," + y + " l ";
		path += width - 2*comm.cornerRadius - comm.fbBumpDepth;
		path += comm.path2;
		if (bottomOpen) {
			path += straightHeight;
			path += comm.fbBumpOut;
			path += "0," + straightHeight;
		} else {
			path += height - 2*comm.cornerRadius;
		}
		path += comm.path3; //bottom right corner

		//path += 2*comm.cornerRadius - width + ",0";
		//arm
		path += (-loop.armW+2*comm.cornerRadius) + ",0";
		path += " a " + comm.cornerRadius + " " + comm.cornerRadius + " 0 0 1 " + (0 - comm.cornerRadius) + " " + (0 - comm.cornerRadius);
		path += " l 0,";
		path += -straightHeight;
		path += comm.fbBumpIn;
		path += "0," + (-straightHeight+loop.loopH);
		path += " a " + comm.cornerRadius + " " + comm.cornerRadius + " 0 0 0 " + (0 - comm.cornerRadius) + " " + (0 - comm.cornerRadius);

		path += " l " + (-innerDim+2*comm.cornerRadius) + ",0";
		path += " a " + comm.cornerRadius + " " + comm.cornerRadius + " 0 0 0 " + (0 - comm.cornerRadius) + " " + comm.cornerRadius;
		path += " l 0," + (straightHeight-loop.loopH);
		path += comm.fbBumpOut;
		path += "0," + straightHeight;
		path += comm.path3;
		path += (-width + innerDim + loop.armW + 2*comm.cornerRadius + comm.fbBumpDepth) + ",0";

		//bottom left corner
		path += " a " + comm.cornerRadius + " " + comm.cornerRadius + " 0 0 1 " + (0 - comm.cornerRadius) + " " + (0 - comm.cornerRadius);
		path += " l 0,";
		path += -straightHeight;
		path += comm.fbBumpIn;
		path += "0," + (-straightHeight);
		path += comm.path5;

	} else {
		path += "m " + (x + comm.cornerRadius) + "," + y;
		path += comm.path1;
		path += width - comm.extraWidth;
		path += comm.path2;
		path += height - innerDim - 2 * comm.cornerRadius - loop.bottomH;
		path += comm.path3;
		path += (comm.extraWidth - width + loop.side) + ",0";
		path += " " + (0 - comm.bumpSlantWidth) + "," + comm.bumpDepth;
		path += " " + (0 - comm.bumpBottomWidth) + ",0";
		path += " " + (0 - comm.bumpSlantWidth) + "," + (0 - comm.bumpDepth);
		path += " " + (0 - comm.bumpOffset) + ",0";
		path += " a " + comm.cornerRadius + " " + comm.cornerRadius + " 0 0 0 " + (0 - comm.cornerRadius) + " " + comm.cornerRadius;
		path += " l 0," + (innerDim - 2 * comm.cornerRadius);
		path += " a " + comm.cornerRadius + " " + comm.cornerRadius + " 0 0 0 " + comm.cornerRadius + " " + comm.cornerRadius;
		path += " l " + (width - 2 * comm.cornerRadius - loop.side);
		path += comm.path2;
		path += loop.bottomH - 2 * comm.cornerRadius;
		path += comm.path3;
		path += (comm.extraWidth - width);
		if (bottomOpen) {
			path += comm.path4 + "l 0,";
		} else {
			path += comm.path4NoBump + "l 0,";
		}
		path += (0 - height + 2 * comm.cornerRadius);
		path += comm.path5;
	}
	return path;
};

/**
 * Creates the path of a DoubleLoopBlock (used for if/else Block)
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} innerHeight1 - The height of the first space
 * @param {number} innerHeight2 - The height of the second space
 * @param {number} midHeight - The height of the part of the Block between the spaces
 * @return {string}
 */
BlockGraphics.buildPath.doubleLoop = function(x, y, width, height, innerHeight1, innerHeight2, midHeight) {
	let path = "";
	const loop = BlockGraphics.loop;
	const comm = BlockGraphics.command;
	path += "m " + (x + comm.cornerRadius) + "," + y;
	path += comm.path1;
	path += width - comm.extraWidth;
	let innerHeight = innerHeight1;
	let currentH = height - midHeight - innerHeight1 - innerHeight2 - 2 * comm.cornerRadius - loop.bottomH;
	for (let i = 0; i < 2; i++) {
		path += comm.path2;
		path += currentH;
		path += comm.path3;
		path += (comm.extraWidth - width + loop.side) + ",0";
		path += " " + (0 - comm.bumpSlantWidth) + "," + comm.bumpDepth;
		path += " " + (0 - comm.bumpBottomWidth) + ",0";
		path += " " + (0 - comm.bumpSlantWidth) + "," + (0 - comm.bumpDepth);
		path += " " + (0 - comm.bumpOffset) + ",0";
		path += " a " + comm.cornerRadius + " " + comm.cornerRadius + " 0 0 0 " + (0 - comm.cornerRadius) + " " + comm.cornerRadius;
		path += " l 0," + (innerHeight - 2 * comm.cornerRadius);
		path += " a " + comm.cornerRadius + " " + comm.cornerRadius + " 0 0 0 " + comm.cornerRadius + " " + comm.cornerRadius;
		path += " l " + (width - 2 * comm.cornerRadius - loop.side);
		innerHeight = innerHeight2;
		currentH = midHeight - 2 * comm.cornerRadius;
	}
	path += comm.path2;
	path += loop.bottomH - 2 * comm.cornerRadius;
	path += comm.path3;
	path += (comm.extraWidth - width);
	path += comm.path4 + "l 0,";
	path += (0 - height + 2 * comm.cornerRadius);
	path += comm.path5;
	return path;
};


/* Group of functions that create the SVG elements for Blocks/Slots */
BlockGraphics.create = {};

/**
 * Creates the path element for the Block
 * @param {string} category - indicates which category's gradient to use
 * @param {Element} group - SVG group, Path will automatically be added to this group
 * @param {boolean} returnsValue - Whether the block returns a value and should be given an outline
 * @param {boolean} active - Whether the block is currently runnable or should be grayed out
 * @return {Element} - SVG path element for the background of the Block
 */
BlockGraphics.create.block = function(category, group, returnsValue, active) {
	if (!active) category = "inactive";
	const path = GuiElements.create.path(group);
	var fill = Colors.getGradient(category);
	if (FinchBlox) { fill = Colors.getColor(category) }
	path.setAttributeNS(null, "fill", fill);
	BlockGraphics.update.stroke(path, category, returnsValue, active);
	return path;
};

/**
 * Creates the SVG path element for a Slot
 * @param {Element} group - SVG group, Path will automatically be added to this group
 * @param {number} type - number representing the type/shape of slot
 * @param {string} category - indicates which category's gradient to use
 * @param {boolean} active - Whether the Slot is currently active or should be grayed out
 */
BlockGraphics.create.slot = function(group, type, category, active) {
	if (!active) category = "inactive";
	const bG = BlockGraphics.reporter;
	const path = GuiElements.create.path(group);
	if (type === 2) {
		path.setAttributeNS(null, "fill", "url(#gradient_dark_" + category + ")");
	} else {
		path.setAttributeNS(null, "fill", bG.slotFill);
	}
	return path;
};

/**
 * Creates the hit box for a slot.  Does not worry about position or size
 * @param {Element} group
 */
BlockGraphics.create.slotHitBox = function(group) {
	const rectE = GuiElements.create.rect(group);
	rectE.setAttributeNS(null, "fill", Colors.black);
	GuiElements.update.opacity(rectE, 0);
	return rectE;
};

/**
 * Creates text for LabelText
 * @param {string} text
 * @param {Element} group
 */
BlockGraphics.create.labelText = function(text, group) {
	const bG = BlockGraphics.labelText;
	const textElement = GuiElements.create.text();
	textElement.setAttributeNS(null, "font-family", bG.font.fontFamily);
	textElement.setAttributeNS(null, "font-size", bG.font.fontSize);
	textElement.setAttributeNS(null, "font-weight", bG.font.fontWeight);
	textElement.setAttributeNS(null, "fill", bG.fill);
	textElement.setAttributeNS(null, "class", "noselect");
	const textNode = document.createTextNode(text);
	textElement.appendChild(textNode);
	group.appendChild(textElement);
	return textElement;
};

/**
 * Creates text for inside Slot
 * @param {string} text
 * @param {Element} group
 */
BlockGraphics.create.valueText = function(text, group) {
	const bG = BlockGraphics.valueText;
	const textElement = GuiElements.create.text();
	textElement.setAttributeNS(null, "font-family", bG.font.fontFamily);
	textElement.setAttributeNS(null, "font-size", bG.font.fontSize);
	textElement.setAttributeNS(null, "font-weight", bG.font.fontWeight);
	textElement.setAttributeNS(null, "fill", bG.fill);
	textElement.setAttributeNS(null, "class", "noselect");
	GuiElements.update.text(textElement, text);
	group.appendChild(textElement);
	return textElement;
};


/* Group of functions used for modifying existing SVG elements */
BlockGraphics.update = {};

/**
 * Updates a path's shape, size and location.  Necessary parameters depend on type.
 * @param {Element} path
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} [type]
 * @param {boolean} [isSlot]
 * @param {number} [innerHeight1]
 * @param {number} [innerHeight2]
 * @param {number} [midHeight]
 * @param {boolean} [bottomOpen]
 * @return {*}
 */
BlockGraphics.update.path = function(path, x, y, width, height, type, isSlot, innerHeight1, innerHeight2, midHeight, bottomOpen) {
	let pathD;
	switch (type) {
		case 0:
			pathD = BlockGraphics.buildPath.command(x, y, width, height);
			break;
		case 1:
			pathD = BlockGraphics.buildPath.reporter(x, y, width, height);
			break;
		case 2:
			pathD = BlockGraphics.buildPath.predicate(x, y, width, height, isSlot, false);
			break;
		case 3:
			pathD = BlockGraphics.buildPath.string(x, y, width, height);
			break;
		case 4:
			pathD = BlockGraphics.buildPath.hat(x, y, width, height);
			break;
		case 5:
			pathD = BlockGraphics.buildPath.loop(x, y, width, height, innerHeight1, bottomOpen);
			break;
		case 6:
			pathD = BlockGraphics.buildPath.doubleLoop(x, y, width, height, innerHeight1, innerHeight2, midHeight);
			break;
	}
	path.setAttributeNS(null, "d", pathD);
	return path;
};

/**
 * Moves text to location
 * @param {Element} text
 * @param {number} x
 * @param {number} y
 */
BlockGraphics.update.text = function(text, x, y) {
	if (Language.isRTL){ x = -x; }
	text.setAttributeNS(null, "x", x);
	text.setAttributeNS(null, "y", y);
};

/**
 * Makes a path start glowing (adds a white outline)
 * @param {Element} path
 */
BlockGraphics.update.glow = function(path) {
	const glow = BlockGraphics.glow;
	path.setAttributeNS(null, "stroke", glow.color);
	path.setAttributeNS(null, "stroke-width", glow.strokeW);
};

/**
 * Updates the outline of a path
 * @param {Element} path
 * @param {string} category
 * @param {boolean} returnsValue
 * @param {boolean} active
 */
BlockGraphics.update.stroke = function(path, category, returnsValue, active) {
	if (!active) category = "inactive";
	if (returnsValue || FinchBlox) {
		var outline = Colors.getColor(category);
		//if (FinchBlox) { outline = Colors.darkenColor(outline, 0.75); }
		if (FinchBlox) { outline = Colors.blockOutline[category]; }
		path.setAttributeNS(null, "stroke", outline);
		path.setAttributeNS(null, "stroke-width", BlockGraphics.reporter.strokeW);
	} else {
		path.setAttributeNS(null, "stroke-width", 0);
	}
};

/**
 * Updates a HexSlot's fill
 * @param {Element} path
 * @param {string} category
 * @param {boolean} active
 */
BlockGraphics.update.hexSlotGradient = function(path, category, active) {
	if (!active) category = "inactive";
	path.setAttributeNS(null, "fill", "url(#gradient_dark_" + category + ")");
};

/**
 * Change whether the Block appears active or inactive
 * @param {string} path
 * @param {string} category
 * @param {boolean} returnsValue
 * @param {boolean} active
 * @param {boolean} glowing
 */
BlockGraphics.update.blockActive = function(path, category, returnsValue, active, glowing) {
	if (!active) category = "inactive";
	const fill = Colors.getGradient(category);
	path.setAttributeNS(null, "fill", fill);
	if (!glowing) {
		BlockGraphics.update.stroke(path, category, returnsValue, active);
	}
};

/**
 * Creates the string for the path of the highlight indicator
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} type
 * @param {boolean} isSlot
 * @return {string}
 */
BlockGraphics.buildPath.highlight = function(x, y, width, height, type, isSlot) {
	const bG = BlockGraphics.highlight;
	let pathD;
	const hX = x - bG.margin;
	const hY = y - bG.margin;
	const hWidth = width + 2 * bG.margin;
	const hHeight = height + 2 * bG.margin;
	switch (type) {
		case 0:
			pathD = BlockGraphics.buildPath.highlightCommand(x, y, height);
			break;
		case 1:
			pathD = BlockGraphics.buildPath.reporter(hX, hY, hWidth, hHeight);
			break;
		case 2:
			pathD = BlockGraphics.buildPath.predicate(hX, hY, hWidth, hHeight, isSlot, true);
			break;
		case 3:
			pathD = BlockGraphics.buildPath.string(hX, hY, hWidth, hHeight);
			break;
	}
	return pathD;
};

/**
 * Moves an element to the top of a group by removing it an re-adding it
 * @param {Element} obj
 * @param {Element} layer
 */
BlockGraphics.bringToFront = function(obj, layer) {
	obj.remove();
	layer.appendChild(obj);
};
