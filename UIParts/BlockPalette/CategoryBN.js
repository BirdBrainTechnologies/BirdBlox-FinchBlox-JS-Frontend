function CategoryBN(x,y,category){
	this.x=x;
	this.y=y;
	this.category=category;
	this.loadCatData();
	this.buildGraphics();
}
CategoryBN.setGraphics=function(){
	var BP=BlockPalette;
	CategoryBN.bg=Colors.black;
	CategoryBN.fontSize=15;
	CategoryBN.font="Arial";
	CategoryBN.forground="#fff";
	CategoryBN.height=25;
	CategoryBN.colorW=6;
	CategoryBN.labelLMargin=6;
	CategoryBN.charHeight=10;
	
	CategoryBN.hMargin=BP.catHMargin;
	CategoryBN.width=(BP.width-2*BP.catHMargin-CategoryBN.hMargin)/2;
	var numberOfRows=Math.ceil(BlockList.catCount()/2);
	CategoryBN.vMargin=(BP.catH-2*BP.catVMargin-numberOfRows*CategoryBN.height)/(numberOfRows-1);
	CategoryBN.labelX=CategoryBN.colorW+CategoryBN.labelLMargin;
	CategoryBN.labelY=(CategoryBN.height+CategoryBN.charHeight)/2;
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
	this.label=GuiElements.draw.text(CBN.labelX,CBN.labelY,this.text,CBN.fontSize,CBN.forground,CBN.font);
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