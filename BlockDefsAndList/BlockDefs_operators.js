function b_Add(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"+"));
	this.addPart(new NumSlot(this,0));
}
b_Add.prototype = Object.create(ReporterBlock.prototype);
b_Add.prototype.constructor = b_Add;
b_Add.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()+data2.getValue();
	this.resultData=new NumData(val,isValid);
	return false; //Done running
}



function b_Subtract(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,String.fromCharCode(8211)));
	this.addPart(new NumSlot(this,0));
}
b_Subtract.prototype = Object.create(ReporterBlock.prototype);
b_Subtract.prototype.constructor = b_Subtract;
b_Subtract.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()-data2.getValue();
	this.resultData=new NumData(val,isValid);
	return false; //Done running
}



function b_Multiply(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"*"));
	this.addPart(new NumSlot(this,0));
}
b_Multiply.prototype = Object.create(ReporterBlock.prototype);
b_Multiply.prototype.constructor = b_Multiply;
b_Multiply.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()*data2.getValue();
	this.resultData=new NumData(val,isValid);
	return false; //Done running
}



function b_Divide(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"/"));
	this.addPart(new NumSlot(this,0));
}
b_Divide.prototype = Object.create(ReporterBlock.prototype);
b_Divide.prototype.constructor = b_Divide;
b_Divide.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val1=data1.getValue();
	var val2=data2.getValue();
	var val=val1/val2;
	if(val2==0){
		val=0;
		isValid=false;
	}
	this.resultData=new NumData(val,isValid);
	return false; //Done running
}




function b_Round(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"round"));
	this.addPart(new NumSlot(this,0.5));
}
b_Round.prototype = Object.create(ReporterBlock.prototype);
b_Round.prototype.constructor = b_Round;
b_Round.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var isValid=data1.isValid;
	var val=data1.getValueWithC(false,true);
	this.resultData=new NumData(val,isValid);
	return false; //Done running
}



function b_PickRandom(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"pick random"));
	this.addPart(new NumSlot(this,1));
	this.addPart(new LabelText(this,"to"));
	this.addPart(new NumSlot(this,10));
}
b_PickRandom.prototype = Object.create(ReporterBlock.prototype);
b_PickRandom.prototype.constructor = b_PickRandom;
b_PickRandom.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	var integer = (val1===(val1|0)&&val2===(val2|0));
	var rVal;
	var min=val1;
	var max=val2;
	if(min>max){
		min=val2;
		max=val1;
	}
	if(integer){
		rVal = Math.floor(Math.random() * (max - min + 1)) + min;
	}
	else{
		rVal = Math.random() * (max - min) + min;
	}
	this.resultData=new NumData(rVal);
	return false; //Done running
}



function b_LessThan(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"<"));
	this.addPart(new NumSlot(this,0));
}
b_LessThan.prototype = Object.create(PredicateBlock.prototype);
b_LessThan.prototype.constructor = b_LessThan;
b_LessThan.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	this.resultData=new BoolData(val1<val2);
	return false; //Done running
}



function b_EqualTo(x,y){//needs to work with strings
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"="));
	this.addPart(new NumSlot(this,0));
}
b_EqualTo.prototype = Object.create(PredicateBlock.prototype);
b_EqualTo.prototype.constructor = b_EqualTo;
b_EqualTo.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val1=data1.getValue();
	var val2=data2.getValue();
	this.resultData=new BoolData(val1==val2&&isValid);
	return false; //Done running
}



function b_GreaterThan(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,">"));
	this.addPart(new NumSlot(this,0));
}
b_GreaterThan.prototype = Object.create(PredicateBlock.prototype);
b_GreaterThan.prototype.constructor = b_GreaterThan;
b_GreaterThan.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	this.resultData=new BoolData(val1>val2);
	return false; //Done running
}



function b_And(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new BoolSlot(this));
	this.addPart(new LabelText(this,"and"));
	this.addPart(new BoolSlot(this));
}
b_And.prototype = Object.create(PredicateBlock.prototype);
b_And.prototype.constructor = b_And;
b_And.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	this.resultData=new BoolData(val1&&val2);
	return false; //Done running
}



function b_Or(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new BoolSlot(this));
	this.addPart(new LabelText(this,"or"));
	this.addPart(new BoolSlot(this));
}
b_Or.prototype = Object.create(PredicateBlock.prototype);
b_Or.prototype.constructor = b_Or;
b_Or.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	this.resultData=new BoolData(val1||val2);
	return false; //Done running
}



function b_Not(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"not"));
	this.addPart(new BoolSlot(this));
}
b_Not.prototype = Object.create(PredicateBlock.prototype);
b_Not.prototype.constructor = b_Not;
b_Not.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	this.resultData=new BoolData(!val1);
	return false; //Done running
}



function b_True(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"true"));
}
b_True.prototype = Object.create(PredicateBlock.prototype);
b_True.prototype.constructor = b_True;
b_True.prototype.startAction=function(){
	this.resultData=new BoolData(true);
	return false; //Done running
}



function b_False(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"false"));
}
b_False.prototype = Object.create(PredicateBlock.prototype);
b_False.prototype.constructor = b_False;
b_False.prototype.startAction=function(){
	this.resultData=new BoolData(false);
	return false; //Done running
}



function b_LetterOf(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"letter"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new LabelText(this,"of"));
	this.addPart(new StringSlot(this,"world"));
}
b_LetterOf.prototype = Object.create(ReporterBlock.prototype);
b_LetterOf.prototype.constructor = b_LetterOf;
b_LetterOf.prototype.startAction=function(){
	var word=this.slots[1].getData().getValue();
	var index=this.slots[0].getData().getValueWithC(1,word.length,true,true);
	this.resultData=new StringData(word.substring(index-1,index));
	return false; //Done running
}



function b_LengthOf(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"length of"));
	this.addPart(new StringSlot(this,"world"));
}
b_LengthOf.prototype = Object.create(ReporterBlock.prototype);
b_LengthOf.prototype.constructor = b_LengthOf;
b_LengthOf.prototype.startAction=function(){
	var word=this.slots[0].getData().getValue();
	this.resultData=new NumData(word.length);
	return false; //Done running
}



function b_join(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"join"));
	this.addPart(new StringSlot(this,"hello "));
	this.addPart(new LabelText(this,"and"));
	this.addPart(new StringSlot(this,"world"));
}
b_join.prototype = Object.create(ReporterBlock.prototype);
b_join.prototype.constructor = b_join;
b_join.prototype.startAction=function(){
	var word1=this.slots[0].getData().getValue();
	var word2=this.slots[1].getData().getValue();
	this.resultData=new StringData(word1+word2);
	return false; //Done running
}
///////////
function b_mathOfNumber(x,y){
	ReporterBlock.call(this,x,y,"operators");
	var dS=new DropSlot(this,null,Slot.snapTypes.bool);
	dS.addOption("abs",new SelectionData("abs"));
	dS.addOption("ceiling",new SelectionData("ceiling"));
	dS.addOption("floor",new SelectionData("floor"));
	dS.addOption("sqrt",new SelectionData("sqrt"));
	dS.addOption("sin",new SelectionData("sin"));
	dS.addOption("cos",new SelectionData("cos"));
	dS.addOption("tan",new SelectionData("tan"));
	dS.addOption("asin",new SelectionData("asin"));
	dS.addOption("acos",new SelectionData("acos"));
	dS.addOption("atan",new SelectionData("atan"));
	dS.addOption("ln",new SelectionData("ln"));
	dS.addOption("log",new SelectionData("log"));
	dS.addOption("e^",new SelectionData("e^"));
	dS.addOption("10^",new SelectionData("10^"));
	this.addPart(dS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new NumSlot(this,10));
}
b_mathOfNumber.prototype = Object.create(ReporterBlock.prototype);
b_mathOfNumber.prototype.constructor = b_mathOfNumber;



