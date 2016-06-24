/* This file contains the implementations for Blocks in the operators category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */

function B_Add(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"+"));
	this.addPart(new NumSlot(this,0));
}
B_Add.prototype = Object.create(ReporterBlock.prototype);
B_Add.prototype.constructor = B_Add;
/* Sets the result to the sum of the Slots. Result is valid only if both inputs are. */
B_Add.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()+data2.getValue();
	this.resultData=new NumData(val,isValid);
	return false; //Done running
};



function B_Subtract(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,String.fromCharCode(8211)));
	this.addPart(new NumSlot(this,0));
}
B_Subtract.prototype = Object.create(ReporterBlock.prototype);
B_Subtract.prototype.constructor = B_Subtract;
/* Sets the result to the difference between the Slots. Result is valid only if both inputs are. */
B_Subtract.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()-data2.getValue();
	this.resultData=new NumData(val,isValid);
	return false; //Done running
};



function B_Multiply(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"*"));
	this.addPart(new NumSlot(this,0));
}
B_Multiply.prototype = Object.create(ReporterBlock.prototype);
B_Multiply.prototype.constructor = B_Multiply;
/* Sets the result to the product of the Slots. Result is valid only if both inputs are. */
B_Multiply.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val=data1.getValue()*data2.getValue();
	this.resultData=new NumData(val,isValid);
	return false; //Done running
};



function B_Divide(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"/"));
	this.addPart(new NumSlot(this,0));
}
B_Divide.prototype = Object.create(ReporterBlock.prototype);
B_Divide.prototype.constructor = B_Divide;
/* Sets the result to the quotient of the Slots. Result is valid only if both inputs are and Slot2!=0. */
B_Divide.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val1=data1.getValue();
	var val2=data2.getValue();
	var val=val1/val2;
	if(val2==0){
		val=0; //Return invalid 0 if told to divide by 0.
		isValid=false;
	}
	this.resultData=new NumData(val,isValid);
	return false; //Done running
};



function B_Round(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"round"));
	this.addPart(new NumSlot(this,0.5));
}
B_Round.prototype = Object.create(ReporterBlock.prototype);
B_Round.prototype.constructor = B_Round;
/* Sets the result to the rounded value of the Slot. Is valid only if Slot is. */
B_Round.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var isValid=data1.isValid;
	var val=data1.getValueWithC(false,true); //Integer
	this.resultData=new NumData(val,isValid);
	return false; //Done running
};



function B_PickRandom(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"pick random"));
	this.addPart(new NumSlot(this,1));
	this.addPart(new LabelText(this,"to"));
	this.addPart(new NumSlot(this,10));
}
/* Picks a random integer if both Slots are integers. Otherwise it selects a random float. Is valid if both are. */
B_PickRandom.prototype = Object.create(ReporterBlock.prototype);
B_PickRandom.prototype.constructor = B_PickRandom;
B_PickRandom.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	var isValid=data1.isValid&&data2.isValid;
	var val1=data1.getValue();
	var val2=data2.getValue();
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
	this.resultData=new NumData(rVal,isValid);
	return false; //Done running
};



function B_LessThan(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,"<"));
	this.addPart(new NumSlot(this,0));
}
B_LessThan.prototype = Object.create(PredicateBlock.prototype);
B_LessThan.prototype.constructor = B_LessThan;
/* Result is a valid boolean indicating is Slot1<Slot2. */
B_LessThan.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	this.resultData=new BoolData(val1<val2);
	return false; //Done running
};



function B_EqualTo(x,y){//needs to work with strings
	PredicateBlock.call(this,x,y,"operators");
	var rS=new RoundSlot(this,Slot.snapTypes.any,Slot.outputTypes.any,new NumData(0));
	rS.addOption("Enter text",new SelectionData("enter_text"));
	this.addPart(rS);
	this.addPart(new LabelText(this,"="));
	this.addPart(rS.duplicate(this));
}
B_EqualTo.prototype = Object.create(PredicateBlock.prototype);
B_EqualTo.prototype.constructor = B_EqualTo;
/* Compares data of any type to determine equality. Result is always valid. */
B_EqualTo.prototype.startAction=function(){
	var data1=this.slots[0].getData();
	var data2=this.slots[1].getData();
	this.resultData=new BoolData(Data.checkEquality(data1,data2));
	return false;
};



function B_GreaterThan(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new NumSlot(this,0));
	this.addPart(new LabelText(this,">"));
	this.addPart(new NumSlot(this,0));
}
B_GreaterThan.prototype = Object.create(PredicateBlock.prototype);
B_GreaterThan.prototype.constructor = B_GreaterThan;
/* Result is a valid boolean indicating is Slot1>Slot2. */
B_GreaterThan.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	this.resultData=new BoolData(val1>val2);
	return false; //Done running
};



function B_And(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new BoolSlot(this));
	this.addPart(new LabelText(this,"and"));
	this.addPart(new BoolSlot(this));
}
B_And.prototype = Object.create(PredicateBlock.prototype);
B_And.prototype.constructor = B_And;
/* Result is true if both are true. Always valid. */
B_And.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	this.resultData=new BoolData(val1&&val2);
	return false; //Done running
};



function B_Or(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new BoolSlot(this));
	this.addPart(new LabelText(this,"or"));
	this.addPart(new BoolSlot(this));
}
B_Or.prototype = Object.create(PredicateBlock.prototype);
B_Or.prototype.constructor = B_Or;
/* Result is true if either is true. Always valid. */
B_Or.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	var val2=this.slots[1].getData().getValue();
	this.resultData=new BoolData(val1||val2);
	return false; //Done running
};



function B_Not(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"not"));
	this.addPart(new BoolSlot(this));
}
B_Not.prototype = Object.create(PredicateBlock.prototype);
B_Not.prototype.constructor = B_Not;
/* Result is true if Slot is false. Always valid. */
B_Not.prototype.startAction=function(){
	var val1=this.slots[0].getData().getValue();
	this.resultData=new BoolData(!val1);
	return false; //Done running
};



function B_True(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"true"));
}
B_True.prototype = Object.create(PredicateBlock.prototype);
B_True.prototype.constructor = B_True;
/* Result is true. */
B_True.prototype.startAction=function(){
	this.resultData=new BoolData(true);
	return false; //Done running
};



function B_False(x,y){
	PredicateBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"false"));
}
B_False.prototype = Object.create(PredicateBlock.prototype);
B_False.prototype.constructor = B_False;
/* Result is false. */
B_False.prototype.startAction=function(){
	this.resultData=new BoolData(false);
	return false; //Done running
};



function B_LetterOf(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"letter"));
	this.addPart(new NumSlot(this,1,true,true));
	this.addPart(new LabelText(this,"of"));
	this.addPart(new StringSlot(this,"world"));
}
B_LetterOf.prototype = Object.create(ReporterBlock.prototype);
B_LetterOf.prototype.constructor = B_LetterOf;
/* Result is nth letter of word. Makes n and integer in range. Always valid. */
B_LetterOf.prototype.startAction=function(){
	var word=this.slots[1].getData().getValue();
	var index=this.slots[0].getData().getValueInR(1,word.length,true,true);
	this.resultData=new StringData(word.substring(index-1,index));
	return false; //Done running
};



function B_LengthOf(x,y){
	ReporterBlock.call(this,x,y,"operators");
	this.addPart(new LabelText(this,"length of"));
	this.addPart(new StringSlot(this,"world"));
}
B_LengthOf.prototype = Object.create(ReporterBlock.prototype);
B_LengthOf.prototype.constructor = B_LengthOf;
/* Result is length of word. Always valid. */
B_LengthOf.prototype.startAction=function(){
	var word=this.slots[0].getData().getValue();
	this.resultData=new NumData(word.length);
	return false; //Done running
};



function B_join(x,y){
	ReporterBlock.call(this,x,y,"operators",Block.returnTypes.string);
	this.addPart(new LabelText(this,"join"));
	this.addPart(new StringSlot(this,"hello "));
	this.addPart(new LabelText(this,"and"));
	this.addPart(new StringSlot(this,"world"));
}
B_join.prototype = Object.create(ReporterBlock.prototype);
B_join.prototype.constructor = B_join;
/* Result is Slots concatenated. Always valid. */
B_join.prototype.startAction=function(){
	var word1=this.slots[0].getData().getValue();
	var word2=this.slots[1].getData().getValue();
	this.resultData=new StringData(word1+word2);
	return false; //Done running
};



function B_mathOfNumber(x,y){
	ReporterBlock.call(this,x,y,"operators");
	var dS=new DropSlot(this,null,Slot.snapTypes.bool);
	dS.addOption("sin",new SelectionData("sin"));
	dS.addOption("cos",new SelectionData("cos"));
	dS.addOption("tan",new SelectionData("tan"));

	dS.addOption("asin",new SelectionData("asin"));
	dS.addOption("acos",new SelectionData("acos"));
	dS.addOption("atan",new SelectionData("atan"));

	dS.addOption("ln",new SelectionData("ln"));
	dS.addOption("e^",new SelectionData("e^"));
	dS.addOption("ceiling",new SelectionData("ceiling"));

	dS.addOption("log",new SelectionData("log"));
	dS.addOption("10^",new SelectionData("10^"));
	dS.addOption("floor",new SelectionData("floor"));

	dS.addOption("abs",new SelectionData("abs"));
	dS.addOption("sqrt",new SelectionData("sqrt"));

	dS.dropColumns=3;
	dS.setSelectionData("sqrt",new SelectionData("sqrt"));
	this.addPart(dS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new NumSlot(this,10));
}
B_mathOfNumber.prototype = Object.create(ReporterBlock.prototype);
B_mathOfNumber.prototype.constructor = B_mathOfNumber;
B_mathOfNumber.prototype.startAction=function(){
	var operator=this.slots[0].getData().getValue();
	var data=this.slots[1].getData();
	var value=data.getValue();
	var isValid=data.isValid;
	if(operator=="sin"){
		value=Math.sin(value/180*Math.PI);
	}
	else if(operator=="cos"){
		value=Math.cos(value/180*Math.PI);
	}
	else if(operator=="tan"){
		value=Math.tan(value/180*Math.PI);
		if(Math.abs(value)>1000000000){
			value=1/0;
		}
	}
	else if(operator=="asin"){
		value=Math.asin(value)/Math.PI*180;
	}
	else if(operator=="acos"){
		value=Math.acos(value)/Math.PI*180;
	}
	else if(operator=="atan"){
		value=Math.atan(value)/Math.PI*180;
	}
	else if(operator=="ln"){
		value=Math.log(value);
	}
	else if(operator=="log") {
		try {
			value = Math.log10(value);
		}
		catch(e){
			value=Math.log(10) / Math.log(value);
		}
	}
	else if(operator=="e^"){
		value=Math.exp(value);
	}
	else if(operator=="10^"){
		value=Math.pow(10,value);
	}
	else if(operator=="ceiling"){
		value=Math.ceil(value);
	}
	else if(operator=="floor"){
		value=Math.floor(value);
	}
	else if(operator=="abs"){
		value=Math.abs(value);
	}
	else if(operator=="sqrt"){
		value=Math.sqrt(value);
	}
	if(!isFinite(value)||isNaN(value)){
		value=0;
		isValid=false;
	}
	this.resultData=new NumData(value,isValid);
	return false;
};