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
	// Stores a group featuring a trash icon that appears when Blocks are dragged over it
	BlockPalette.trash = null;
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

	BlockPalette.trashOpacity = 0.8;
	BlockPalette.trashHeight = 120;
	BlockPalette.trashColor = Colors.white;
};

/**
 * Called when the zoom level changes or the screen is resized to recompute dimensions
 */
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

/**
 * Creates the gray rectangle below the CategoryBNs
 */
BlockPalette.createCatBg = function() {
	let BP = BlockPalette;
	BP.catRect = GuiElements.draw.rect(0, BP.catY, BP.width, BP.catH, BP.catBg);
	GuiElements.layers.catBg.appendChild(BP.catRect);
	GuiElements.move.group(GuiElements.layers.categories, 0, TitleBar.height);
};

/**
 * Creates the long black rectangle on the left of the screen
 */
BlockPalette.createPalBg = function() {
	let BP = BlockPalette;
	BP.palRect = GuiElements.draw.rect(0, BP.y, BP.width, BP.height, BP.bg);
	GuiElements.layers.paletteBG.appendChild(BP.palRect);
};

/**
 * Creates the categories listed in the BlockList
 */
BlockPalette.createCategories = function() {
	const catCount = BlockList.catCount();
	const numberOfRows = Math.ceil(catCount / 2);

	// Automatically alternates between two columns while adding categories
	const col1X = BlockPalette.catHMargin;
	const col2X = BlockPalette.catHMargin + CategoryBN.hMargin + CategoryBN.width;

	let firstColumn = true;
	let currentY = BlockPalette.catVMargin;
	let currentX = col1X;
	let usedRows = 0;
	for (let i = 0; i < catCount; i++) {
		if (firstColumn && usedRows >= numberOfRows) {
			currentX = col2X;
			firstColumn = false;
			currentY = BlockPalette.catVMargin;
		}
		const currentCat = new Category(currentX, currentY, BlockList.getCatName(i), BlockList.getCatId(i));
		BlockPalette.categories.push(currentCat);
		usedRows++;
		currentY += CategoryBN.height + CategoryBN.vMargin;
	}
};

/**
 * Retrieves the category with the given id.  Called when a specific category needs to be refreshed
 * @param {string} id
 * @return {Category}
 */
BlockPalette.getCategory = function(id) {
	let i = 0;
	while (BlockPalette.categories[i].id !== id) {
		i++;
	}
	return BlockPalette.categories[i];
};

/**
 * Selects the first category, making it visible on the screen
 */
BlockPalette.selectFirstCat = function() {
	BlockPalette.categories[0].select();
};

/**
 * Determines whether the specified point is over the Palette.  Used for determining if Blocks should be deleted
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
BlockPalette.isStackOverPalette = function(x, y) {
	const BP = BlockPalette;
	if (!GuiElements.paletteLayersVisible) return false;
	return CodeManager.move.pInRange(x, y, 0, BP.catY, BP.width, GuiElements.height - TitleBar.height);
};

/**
 * Makes a trash can icon appear over the Palette to indicate that the Blocks being dragged will be deleted
 */
BlockPalette.showTrash = function() {
	let BP = BlockPalette;
	// If the trash is not visible
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

/**
 * Removes the trash icon
 */
BlockPalette.hideTrash = function() {
	let BP = BlockPalette;
	if (BP.trash) {
		BP.trash.remove();
		BP.trash = null;
	}
};

/**
 * Recursively tells a specific section of a category to expand/collapse
 * @param {string} id - The id of the section
 * @param {boolean} collapsed - Whether the section should expand or collapse
 */
BlockPalette.setSuggestedCollapse = function(id, collapsed) {
	BlockPalette.passRecursively("setSuggestedCollapse", id, collapsed);
};

/**
 * Recursively passes message to all children (Categories and their children) of the Palette
 * @param {string} message
 */
BlockPalette.passRecursivelyDown = function(message) {
	Array.prototype.unshift.call(arguments, "passRecursivelyDown");
	BlockPalette.passRecursively.apply(BlockPalette, arguments);
};

/**
 * Recursively passes a message to all categories
 * @param {string} functionName - The function to call on each category
 */
BlockPalette.passRecursively = function(functionName) {
	const args = Array.prototype.slice.call(arguments, 1);
	BlockPalette.categories.forEach(function(category) {
		category[functionName].apply(category, args);
	});
};

/**
 * Reloads all categories.  Called when a new file is opened.
 */
BlockPalette.refresh = function() {
	BlockPalette.categories.forEach(function(category) {
		category.refreshGroup();
	})
};