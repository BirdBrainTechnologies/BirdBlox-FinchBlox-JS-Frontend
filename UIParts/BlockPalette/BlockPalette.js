function BlockPalette(){
	BlockPalette.categories=new Array();
	BlockPalette.selectedCat=null;
	BlockPalette.createCatBg();
	BlockPalette.createPalBg();
	BlockPalette.createCategories();
	BlockPalette.selectFirstCat();
	BlockPalette.scrolling=false;
}
BlockPalette.setGraphics=function(){
	BlockPalette.width=253;
	BlockPalette.catH=115; //170
	BlockPalette.catVMargin=13;
	BlockPalette.catHMargin=13;
	BlockPalette.height=GuiElements.height-TitleBar.height-BlockPalette.catH;
	BlockPalette.catY=TitleBar.height;
	BlockPalette.y=BlockPalette.catY+BlockPalette.catH;
	BlockPalette.bg=Colors.black;
	BlockPalette.catBg=Colors.darkGray;
	
	BlockPalette.mainVMargin=10;
	BlockPalette.mainHMargin=10;
	BlockPalette.blockMargin=5;
	BlockPalette.sectionMargin=10;

	BlockPalette.bnDefaultFont="Arial";
	BlockPalette.bnDefaultFontSize=16;
	BlockPalette.bnDefaultFontCharHeight=12;

	BlockPalette.labelFont="Arial";
	BlockPalette.labelFontSize=13;
	BlockPalette.labelFontCharHeight=12;
	BlockPalette.labelColor=Colors.white;
}
BlockPalette.updateZoom=function(){
	var BP=BlockPalette;
	BlockPalette.height=GuiElements.height-TitleBar.height-BlockPalette.catH;
	GuiElements.update.rect(BP.palRect,0,BP.y,BP.width,BP.height);
	var clipRect=BP.clippingPath.childNodes[0];
	GuiElements.update.rect(clipRect,0,BP.y,BP.width,BP.height);
};
BlockPalette.createCatBg=function(){
	var BP=BlockPalette;
	BP.catRect=GuiElements.draw.rect(0,BP.catY,BP.width,BP.catH,BP.catBg);
	GuiElements.layers.catBg.appendChild(BP.catRect);
	GuiElements.move.group(GuiElements.layers.categories,0,TitleBar.height);
}
BlockPalette.createPalBg=function(){
	var BP=BlockPalette;
	BP.palRect=GuiElements.draw.rect(0,BP.y,BP.width,BP.height,BP.bg);
	GuiElements.layers.paletteBG.appendChild(BP.palRect);
	TouchReceiver.addListenersPalette(BP.palRect);
	BP.clippingPath=GuiElements.clip(0,BP.y,BP.width,BP.height,GuiElements.layers.palette);
}
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
BlockPalette.IsStackOverPalette=function(){
	var move=CodeManager.move;
	return CodeManager.move.pInRange(move.touchX,move.touchY,0,BlockPalette.catY,BlockPalette.width,GuiElements.height-TitleBar.height);
}
BlockPalette.startScoll=function(x,y){
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
BlockPalette.showDeviceDropDowns=function(){
	for(var i=0;i<BlockPalette.categories.length;i++){
		BlockPalette.categories[i].showDeviceDropDowns();
	}
};
BlockPalette.hideDeviceDropDowns=function(){
	for(var i=0;i<BlockPalette.categories.length;i++){
		BlockPalette.categories[i].hideDeviceDropDowns();
	}
};