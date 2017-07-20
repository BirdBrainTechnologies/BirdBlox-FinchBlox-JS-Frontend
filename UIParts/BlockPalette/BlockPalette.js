"use strict";

/**
 * The BlockPalette is the side panel on the left that holds all the Blocks.  BlockPalette is a static class, since
 * there is only one Palette.  The BlockPalette class creates and manages a set of Categories, each of which
 * controls the Blocks inside it and the CategoryBN that brings it into the foreground.
 * @constructor
 */
function BlockPalette() {
	BlockPalette.categories = [];   // List of categories
	BlockPalette.selectedCat = null;   // category in the foreground
	BlockPalette.createCatBg();   // Black bar along left side of screen
	BlockPalette.createPalBg();   // Dark gray rectangle behind the CategoryBNs
	BlockPalette.createCategories();
	BlockPalette.selectFirstCat();
	BlockPalette.visible = true;
	if (GuiElements.paletteLayersVisible && SettingsManager.sideBarVisible.getValue() !== "true") {
		// Hide the Palette if it should be hidden but isn't
		GuiElements.hidePaletteLayers(true);
	}
}
BlockPalette.setGraphics = function() {

	// Dimensions used within a category
	BlockPalette.mainVMargin = 10;   // The space before the first Block in a Category
	BlockPalette.mainHMargin = Button.defaultMargin;   // The space between the Blocks and the left side of the screen
	BlockPalette.blockMargin = 5;   // The vertical spacing between Blocks
	BlockPalette.sectionMargin = 10;   // The additional space added between sections
	BlockPalette.insideBnH = 38;   // Height of buttons within a category (such as Create Variable button)
	BlockPalette.insideBnW = 150;   // Width of buttons within a category

	// Dimensions for the region with CategoryBNs
	BlockPalette.width = 253;
	BlockPalette.catVMargin = Button.defaultMargin;   // Margins between buttons
	BlockPalette.catHMargin = Button.defaultMargin;
	BlockPalette.catH = 30 * 3 + BlockPalette.catVMargin * 4;   // 3 rows of BNs, 4 margins, 30 = height per BN
	BlockPalette.height = GuiElements.height - TitleBar.height - BlockPalette.catH;
	BlockPalette.catY = TitleBar.height;
	BlockPalette.y = BlockPalette.catY + BlockPalette.catH;
	BlockPalette.bg = Colors.black;
	BlockPalette.catBg = Colors.darkGray;

	BlockPalette.labelFont = Font.uiFont(13);
	BlockPalette.labelColor = Colors.white;

	BlockPalette.trash = null;
	BlockPalette.trashOpacity = 0.8;
	BlockPalette.trashHeight = 120;
	BlockPalette.trashColor = Colors.white;
};
BlockPalette.updateZoom = function() {
	let BP = BlockPalette;
	BP.setGraphics();
	GuiElements.update.rect(BP.palRect, 0, BP.y, BP.width, BP.height);
	GuiElements.update.rect(BP.catRect, 0, BP.catY, BP.width, BP.catH);
	GuiElements.move.group(GuiElements.layers.categories, 0, TitleBar.height);
	for (let i = 0; i < BlockPalette.categories.length; i++) {
		BlockPalette.categories[i].updateZoom();
	}
};
BlockPalette.createCatBg = function() {
	let BP = BlockPalette;
	BP.catRect = GuiElements.draw.rect(0, BP.catY, BP.width, BP.catH, BP.catBg);
	GuiElements.layers.catBg.appendChild(BP.catRect);
	GuiElements.move.group(GuiElements.layers.categories, 0, TitleBar.height);
};
BlockPalette.createPalBg = function() {
	let BP = BlockPalette;
	BP.palRect = GuiElements.draw.rect(0, BP.y, BP.width, BP.height, BP.bg);
	GuiElements.layers.paletteBG.appendChild(BP.palRect);
	//TouchReceiver.addListenersPalette(BP.palRect);
};
BlockPalette.createCategories = function() {
	var catCount = BlockList.catCount();
	var firstColumn = true;
	var numberOfRows = Math.ceil(catCount / 2);
	var col1X = BlockPalette.catHMargin;
	var col2X = BlockPalette.catHMargin + CategoryBN.hMargin + CategoryBN.width;
	var currentY = BlockPalette.catVMargin;
	var currentX = col1X;
	var usedRows = 0;
	for (var i = 0; i < catCount; i++) {
		if (firstColumn && usedRows >= numberOfRows) {
			currentX = col2X;
			firstColumn = false;
			currentY = BlockPalette.catVMargin;
		}
		var currentCat = new Category(currentX, currentY, BlockList.getCatName(i), BlockList.getCatId(i));
		BlockPalette.categories.push(currentCat);
		usedRows++;
		currentY += CategoryBN.height + CategoryBN.vMargin;
	}

};
BlockPalette.getCategory = function(id) {
	var i = 0;
	while (BlockPalette.categories[i].id != id) {
		i++;
	}
	return BlockPalette.categories[i];
};
BlockPalette.selectFirstCat = function() {
	BlockPalette.categories[0].select();
};
/*BlockPalette.getAbsX=function(){
	return 0;
}
BlockPalette.getAbsY=function(){
	return TitleBar.height+BlockPalette.catH;
}*/
BlockPalette.isStackOverPalette = function(x, y) {
	if (!GuiElements.paletteLayersVisible) return false;
	return CodeManager.move.pInRange(x, y, 0, BlockPalette.catY, BlockPalette.width, GuiElements.height - TitleBar.height);
};
BlockPalette.ShowTrash = function() {
	let BP = BlockPalette;
	if (!BP.trash) {
		BP.trash = GuiElements.create.group(0, 0);
		let trashBg = GuiElements.draw.rect(0, BP.y, BP.width, BP.height, BP.bg);
		GuiElements.update.opacity(trashBg, BP.trashOpacity);
		BP.trash.appendChild(trashBg);

		let trashWidth = VectorIcon.computeWidth(VectorPaths.trash, BP.trashHeight);
		let imgX = BP.width / 2 - trashWidth / 2; // Center X
		let imgY = BP.y + BP.height / 2 - BP.trashHeight / 2; // Center Y
		let trashIcon = new VectorIcon(imgX, imgY, VectorPaths.trash, BP.trashColor, BP.trashHeight, BP.trash);

		// Add to group
		GuiElements.layers.trash.appendChild(BP.trash);
	}
};
BlockPalette.HideTrash = function() {
	let BP = BlockPalette;
	if (BP.trash) {
		BP.trash.remove();
		BP.trash = null;
	}
};
BlockPalette.setSuggestedCollapse = function(id, collapsed) {
	BlockPalette.passRecursively("setSuggestedCollapse", id, collapsed);
};
BlockPalette.passRecursivelyDown = function(message) {
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	BlockPalette.passRecursively.apply(BlockPalette, arguments);
};
BlockPalette.passRecursively = function(functionName) {
	const args = Array.prototype.slice.call(arguments, 1);
	BlockPalette.categories.forEach(function(category) {
		category[functionName].apply(category, args);
	});
};
BlockPalette.fileClosed = function() {
	BlockPalette.passRecursively("fileClosed");
};
BlockPalette.fileOpened = function() {
	BlockPalette.passRecursively("fileOpened");
};
BlockPalette.refresh = function() {
	BlockPalette.categories.forEach(function(category) {
		category.refreshGroup();
	})
};