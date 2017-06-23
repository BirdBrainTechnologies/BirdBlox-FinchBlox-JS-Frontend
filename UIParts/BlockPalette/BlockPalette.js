"use strict";

function BlockPalette(){
	BlockPalette.categories=new Array();
	BlockPalette.selectedCat=null;
	BlockPalette.createCatBg();
	BlockPalette.createPalBg();
	BlockPalette.createScrollSvg();
	BlockPalette.createCategories();
	BlockPalette.selectFirstCat();
	BlockPalette.scrolling=false;
	BlockPalette.visible = true;
}
BlockPalette.setGraphics=function(){
	BlockPalette.mainVMargin=10;
	BlockPalette.mainHMargin=Button.defaultMargin;
	BlockPalette.blockMargin=5;
	BlockPalette.sectionMargin=10;
	BlockPalette.insideBnH = 38; // Dimensions for buttons within a category
	BlockPalette.insideBnW = 150;

	BlockPalette.width=253;
	BlockPalette.catVMargin=Button.defaultMargin;
	BlockPalette.catHMargin=Button.defaultMargin;
	BlockPalette.catH=30*3 + BlockPalette.catVMargin*4; //132
	BlockPalette.height=GuiElements.height-TitleBar.height-BlockPalette.catH;
	BlockPalette.catY=TitleBar.height;
	BlockPalette.y=BlockPalette.catY+BlockPalette.catH;
	BlockPalette.bg=Colors.black;
	BlockPalette.catBg=Colors.darkGray;

	BlockPalette.bnDefaultFont="Arial";
	BlockPalette.bnDefaultFontSize=16;
	BlockPalette.bnDefaultFontCharHeight=12;

	BlockPalette.labelFont="Arial";
	BlockPalette.labelFontSize=13;
	BlockPalette.labelFontCharHeight=12;
	BlockPalette.labelColor=Colors.white;

	BlockPalette.trash = null;
	BlockPalette.trashOpacity = 0.8;
	BlockPalette.trashHeight = 120;
	BlockPalette.trashColor = Colors.white;
};
BlockPalette.updateZoom=function(){
	let BP=BlockPalette;
	BP.setGraphics();
	GuiElements.update.rect(BP.palRect,0,BP.y,BP.width,BP.height);
	GuiElements.update.rect(BP.catRect,0,BP.catY,BP.width,BP.catH);
	GuiElements.move.group(GuiElements.layers.categories,0,TitleBar.height);
	for(let i = 0; i < BlockPalette.categories.length; i++){
		BlockPalette.categories[i].updateZoom();
	}
};
BlockPalette.createCatBg=function(){
	let BP=BlockPalette;
	BP.catRect=GuiElements.draw.rect(0,BP.catY,BP.width,BP.catH,BP.catBg);
	GuiElements.layers.catBg.appendChild(BP.catRect);
	GuiElements.move.group(GuiElements.layers.categories,0,TitleBar.height);
};
BlockPalette.createPalBg=function(){
	let BP=BlockPalette;
	BP.palRect=GuiElements.draw.rect(0,BP.y,BP.width,BP.height,BP.bg);
	GuiElements.layers.paletteBG.appendChild(BP.palRect);
	//TouchReceiver.addListenersPalette(BP.palRect);
};
BlockPalette.createScrollSvg = function(){
	BlockPalette.catScrollSvg = GuiElements.create.svg(GuiElements.layers.categoriesScroll);
};
BlockPalette.createCategories=function(){
	var catCount=BlockList.catCount();
	var firstColumn=true;
	var numberOfRows=Math.ceil(catCount/2);
	var col1X=BlockPalette.catHMargin;
	var col2X=BlockPalette.catHMargin+CategoryBN.hMargin+CategoryBN.width;
	var currentY=BlockPalette.catVMargin;
	var currentX=col1X;
	var usedRows=0;
	for(var i=0;i<catCount;i++){
		if(firstColumn&&usedRows>=numberOfRows){
			currentX=col2X;
			firstColumn=false;
			currentY=BlockPalette.catVMargin;
		}
		var currentCat=new Category(currentX,currentY,i);
		BlockPalette.categories.push(currentCat);
		usedRows++;
		currentY+=CategoryBN.height+CategoryBN.vMargin;
	}
	
}
BlockPalette.getCategory=function(id){
	var i=0;
	while(BlockPalette.categories[i].id!=id){
		i++;
	}
	return BlockPalette.categories[i];
}
BlockPalette.selectFirstCat=function(){
	BlockPalette.categories[0].select();
}
/*BlockPalette.getAbsX=function(){
	return 0;
}
BlockPalette.getAbsY=function(){
	return TitleBar.height+BlockPalette.catH;
}*/
BlockPalette.isStackOverPalette=function(x,y){
	if(!GuiElements.paletteLayersVisible) return false;
	return CodeManager.move.pInRange(x,y,0,BlockPalette.catY,BlockPalette.width,GuiElements.height-TitleBar.height);
};
BlockPalette.ShowTrash=function() {
	let BP = BlockPalette;
	if (!BP.trash) {
		BP.trash = GuiElements.create.group(0,0);
		let trashBg = GuiElements.draw.rect(0, BP.y, BP.width, BP.height, BP.bg);
		GuiElements.update.opacity(trashBg, BP.trashOpacity);
		BP.trash.appendChild(trashBg);

		let trashWidth = VectorIcon.computeWidth(VectorPaths.trash, BP.trashHeight);
		let imgX = BP.width/2 - trashWidth/2;  // Center X
		let imgY = BP.y + BP.height/2 - BP.trashHeight/2;  // Center Y
		let trashIcon = new VectorIcon(imgX, imgY, VectorPaths.trash, BP.trashColor, BP.trashHeight, BP.trash);

		// Add to group
		GuiElements.layers.trash.appendChild(BP.trash);
	}
};
BlockPalette.HideTrash=function() {
	let BP = BlockPalette;
	if (BP.trash) {
		BP.trash.remove();
		BP.trash = null;
	}
};
BlockPalette.startScroll=function(x,y){
	var BP=BlockPalette;
	if(!BP.scrolling){
		BP.scrolling=true;
		BP.selectedCat.startScroll(x,y);
	}
};
BlockPalette.updateScroll=function (x,y){
	var BP=BlockPalette;
	if(BP.scrolling){
		BP.selectedCat.updateScroll(x,y);
	}
};
BlockPalette.endScroll=function(){
	var BP=BlockPalette;
	if(BP.scrolling){
		BP.scrolling=false;
		BP.selectedCat.endScroll();
	}
};
BlockPalette.showDeviceDropDowns=function(deviceClass){
	for(var i=0;i<BlockPalette.categories.length;i++){
		BlockPalette.categories[i].showDeviceDropDowns(deviceClass);
	}
};
BlockPalette.hideDeviceDropDowns=function(deviceClass){
	for(var i=0;i<BlockPalette.categories.length;i++){
		BlockPalette.categories[i].hideDeviceDropDowns(deviceClass);
	}
};