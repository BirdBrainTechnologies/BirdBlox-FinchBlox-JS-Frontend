function CategoryBN(x,y,category){
	this.x=x;
	this.y=y;
	this.category=category;
	this.loadCatData();
	this.buildGraphics();
}
CategoryBN.setGraphics=function(){
	const BP=BlockPalette;
	const CBN = CategoryBN;
	CBN.bg=Colors.black;
	CBN.font=Font.uiFont(15);
	CBN.foreground="#fff";
	CBN.height=30;
	CBN.colorW=8;
	CBN.labelLMargin=6;

	CBN.hMargin=BP.catHMargin;
	CBN.width=(BP.width-2*BP.catHMargin-CBN.hMargin)/2;
	var numberOfRows=Math.ceil(BlockList.catCount()/2);
	CBN.vMargin=(BP.catH-2*BP.catVMargin-numberOfRows*CBN.height)/(numberOfRows-1);
	CBN.labelX=CBN.colorW+CBN.labelLMargin;
	CBN.labelY=(CBN.height+CBN.font.charHeight)/2;
}
CategoryBN.prototype.loadCatData=function(){
	this.text=this.category.name;
	this.catId=this.category.id;
	this.fill=Colors.getGradient(this.catId);
}

CategoryBN.prototype.buildGraphics=function(){
	var CBN=CategoryBN;
	this.group=GuiElements.create.group(this.x,this.y,GuiElements.layers.categories);
	this.bgRect=GuiElements.draw.rect(0,0,CBN.width,CBN.height,CBN.bg);
	this.colorRect=GuiElements.draw.rect(0,0,CBN.colorW,CBN.height,this.fill);
	this.label=GuiElements.draw.text(CBN.labelX,CBN.labelY,this.text,CBN.font,CBN.foreground);
	this.group.appendChild(this.bgRect);
	this.group.appendChild(this.colorRect);
	this.group.appendChild(this.label);
	GuiElements.layers.categories.appendChild(this.group);
	this.addListeners();
}
CategoryBN.prototype.select=function(){
	this.bgRect.setAttributeNS(null,"fill",this.fill);
}
CategoryBN.prototype.deselect=function(){
	this.bgRect.setAttributeNS(null,"fill",CategoryBN.bg);
}
CategoryBN.prototype.addListeners=function(){
	var TR=TouchReceiver;
	var cat=this.category;
	TouchReceiver.addListenersCat(this.bgRect,cat);
	TouchReceiver.addListenersCat(this.colorRect,cat);
	TouchReceiver.addListenersCat(this.label,cat);
}

/* outline
tell blockpalette to select cat
cat index
highlight
register touch event



*/