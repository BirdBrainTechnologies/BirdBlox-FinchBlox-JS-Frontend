function HBDropSlot(parent,shortText){
	if(shortText==null){
		shortText=false;
	}
	this.shortText=shortText;
	DropSlot.call(this,parent,Slot.snapTypes.none);
	if(this.shortText){
		this.hBPrefix="HB ";
	}
	else{
		this.hBPrefix="Hummingbird ";
	}
	this.labelText=new LabelText(this.parent,this.hBPrefix.trim());
	this.labelMode=false;
	this.setSelectionData(this.hBPrefix+1,new SelectionData(0));
	if(HummingbirdManager.getSelectableHBCount()<=1) {
		this.switchToLabel();
	}
	else{
		this.labelText.hide();
	}
}
HBDropSlot.prototype = Object.create(DropSlot.prototype);
HBDropSlot.prototype.constructor = HBDropSlot;
HBDropSlot.prototype.populateList=function(){
	this.clearOptions();
	var hBCount=HummingbirdManager.getSelectableHBCount();
	for(var i=0;i<hBCount;i++){
		this.addOption(this.hBPrefix+(i+1),new SelectionData(i)); //We'll store a 0-indexed value but display it +1.
	}
};
HBDropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new HBDropSlot(parentCopy,this.shortText);
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};
HBDropSlot.prototype.switchToLabel=function(){
	if(!this.labelMode){
		this.labelMode=true;
		this.setSelectionData(this.hBPrefix+1,new SelectionData(0));
		this.labelText.show();
		this.hideSlot();
	}
};
HBDropSlot.prototype.switchToSlot=function(){
	if(this.labelMode){
		this.labelMode=false;
		this.labelText.hide();
		this.showSlot();
	}
};
HBDropSlot.prototype.updateAlign=function(x,y){
	if(this.labelMode){
		return LabelText.prototype.updateAlign.call(this.labelText,x,y);
	}
	else{
		return DropSlot.prototype.updateAlign.call(this,x,y);
	}
};
HBDropSlot.prototype.updateDim=function(){
	if(this.labelMode){
		LabelText.prototype.updateDim.call(this.labelText);
		this.width=this.labelText.width;
	}
	else{
		DropSlot.prototype.updateDim.call(this);
	}
};
HBDropSlot.prototype.hideHBDropDowns=function(){
	this.switchToLabel();
};
HBDropSlot.prototype.showHBDropDowns=function(){
	this.switchToSlot();
};
HBDropSlot.prototype.countHBsInUse=function(){
	if(this.labelMode){
		return 1;
	}
	else {
		if (this.getData() != null) {
			return this.getData().getValue() + 1;
		}
		else {
			return 1;
		}
	}
};
