//updateDimNR(); moveSlot(x,y); hideSlot(); showSlot(); highlight(); buildSlot(); copyData();
function Slot(parent,inputType,snapType,outputType){
	this.inputType=inputType;
	this.snapType=snapType;
	this.outputType=outputType;
	this.parent=parent;
	this.hasChild=false;
	this.child=null;
	this.width=0;
	this.height=0;
	this.x=0;
	this.y=0;
	this.isSlot=true;
	this.running=0;//Running: 0=Not started 2=Running 3=Completed
	this.resultIsFromChild=false;
	this.resultData=null;//passed from child block
}
Slot.setConstants=function(){
	Slot.inputTypes=function(){};
	Slot.inputTypes.none=0;
	Slot.inputTypes.num=1;
	Slot.inputTypes.string=2;
	Slot.inputTypes.drop=3;
	
	Slot.snapTypes=function(){};
	Slot.snapTypes.none=0;
	Slot.snapTypes.numStrBool=1;
	Slot.snapTypes.bool=2;
	Slot.snapTypes.list=3;
	
	Slot.outputTypes=function(){};
	Slot.outputTypes.any=0;
	Slot.outputTypes.num=1;
	Slot.outputTypes.string=2;
	Slot.outputTypes.bool=3;
	Slot.outputTypes.list=4;
}
Slot.prototype.updateDim=function(){
	if(this.hasChild){
		this.child.updateDim();
		this.width=this.child.width;
		this.height=this.child.height;
	}
	else{
		this.updateDimNR();
	}
}
Slot.prototype.updateAlign=function(x,y){
	if(this.hasChild){
		var xCoord=x+this.parent.x;//converts coord from inside g to outside g
		var yCoord=y+this.parent.y-this.height/2;//centers it
		this.x=x;
		this.y=y-this.height/2;
		return this.child.updateAlign(xCoord,yCoord);
	}
	else{
		var xCoord=x;
		var yCoord=y-this.height/2;
		this.x=xCoord;
		this.y=yCoord;
		this.moveSlot(xCoord,yCoord);
		return this.width;
	}
}
Slot.prototype.snap=function(block){//Fix
	block.parent=this;
	if(this.hasChild){
		var prevChild=this.child;
		prevChild.unsnap();
		prevChild.stack.shiftOver(block.stack.dim.rw,block.stack.dim.rh);//Fix
	}
	this.hasChild=true;
	this.child=block;
	this.hideSlot();
	var oldG=block.stack.group;
	block.stack.remove();
	block.changeStack(this.parent.stack);
	oldG.remove();
	this.parent.stack.updateDim();
}
Slot.prototype.changeStack=function(stack){
	if(this.hasChild){
		this.child.changeStack(stack);
	}
}
Slot.prototype.stop=function(){
	this.running=0;
	if(this.hasChild){
		this.child.stop();
	}
}
Slot.prototype.updateRun=function(){
	if(this.running==3){
		return false; //Done running
	}
	if(this.hasChild){
		if(!this.child.updateRun()){
			this.running=3;
			this.resultData=this.convertData(this.child.getResultData());
			this.resultIsFromChild=true;
			return true;
		}
		else{
			this.running=2;
			return true; //Still running
		}
	}
	else{
		this.running=3;
		this.resultIsFromChild=false;
		return false; //Done running
	}
}
Slot.prototype.getData=function(){
	if(this.running==3){
		if(this.resultIsFromChild){
			return this.resultData;
		}
	}
	return null;
}
Slot.prototype.updateStackDim=function(stack){
	if(this.hasChild){
		this.child.updateStackDim(stack);
	}
}
Slot.prototype.removeChild=function(){
	this.hasChild=false;
	this.child=null;
	this.showSlot();
}
Slot.prototype.findBestFit=function(){
	var move=CodeManager.move;
	var fit=CodeManager.fit;
	var x=this.getAbsX();
	var y=this.getAbsY();
	if(this.checkFit(move.returnType)&&move.rInRange(move.topX,move.topY,move.width,move.height,x,y,this.width,this.height)){
		var xDist=move.touchX-(x+this.width/2);
		var yDist=move.touchY-(y+this.height/2);
		var dist=xDist*xDist+yDist*yDist;
		if(!fit.found||dist<fit.dist){
			fit.found=true;
			fit.bestFit=this;
			fit.dist=dist;
		}
	}
	if(this.hasChild){
		this.child.findBestFit();
	}
}
Slot.prototype.checkFit=function(returnType){
	var sT=Slot.snapTypes;
	var rT=Block.returnTypes;
	var snapType=this.snapType;
	if(snapType==sT.none){
		return false;
	}
	else if(snapType==sT.numStrBool){
		return returnType==rT.num||returnType==rT.string||returnType==rT.bool;
	}
	else if(snapType==sT.bool){
		return returnType==rT.bool;
	}
	else if(snapType==sT.bool){
		return returnType==rT.list;
	}
	else{
		return false;
	}
}
Slot.prototype.getAbsX=function(){//Fix for tabs 
	return this.x+this.parent.getAbsX();
}
Slot.prototype.getAbsY=function(){//Fix for tabs
	return this.y+this.parent.getAbsY();
}
Slot.prototype.duplicate=function(parentCopy){
	var myCopy=new Slot(parentCopy,this.inputType,this.snapType,this.outputType);
	this.copyData(myCopy);
	if(this.hasChild){
		myCopy.child=this.child.duplicate(0,0);
		myCopy.hasChild=true;
	}
	return myCopy
}
Slot.prototype.copyData=function(toCopy){
	
}
Slot.prototype.clearMem=function(){
	this.resultData=null;
	this.running=0;
}
Slot.prototype.convertData=function(data){
	var outType=this.outputType;
	var oT=Slot.outputTypes;
	if(outType==oT.any){
		return data;
	}
	else if(outType==oT.num){
		return data.asNum();
	}
	else if(outType==oT.string){
		return data.asString();
	}
	else if(outType==oT.bool){
		return data.asBool();
	}
	else if(outType==oT.list){
		return data.asList();
	}
	return null;
}
Slot.prototype.glow=function(){
	if(this.hasChild){
		this.child.glow();
	}
}
Slot.prototype.stopGlow=function(){
	if(this.hasChild){
		this.child.stopGlow();
	}
}