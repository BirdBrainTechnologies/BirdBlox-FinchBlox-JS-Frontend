// handles displaying numbers entered using the inputpad
function DisplayNum(initialData){
	this.isNum = initialData.type === Data.types.num;
	if(!this.isNum){
		this.data = initialData;
		return;
	}
	this.isNegative=(initialData.getValue()<0);
	var asStringData=initialData.asPositiveString();
	var parts=asStringData.getValue().split(".");
	this.integerPart=parts[0];
	if(this.integerPart==""){
		this.integerPart="0";
	}
	this.decimalPart="";
	this.hasDecimalPoint=(parts.length>1);
	if(this.hasDecimalPoint){
		this.decimalPart=parts[1];
	}
}
DisplayNum.prototype.backspace=function(){
	if(!this.isNum) return;
	if(this.hasDecimalPoint&&this.decimalPart!=""){
		var newL=this.decimalPart.length-1;
		this.decimalPart=this.decimalPart.substring(0,newL);
	}
	else if(this.hasDecimalPoint){
		this.hasDecimalPoint=false;
	}
	else if(this.integerPart.length>1){
		var newL=this.integerPart.length-1;
		this.integerPart=this.integerPart.substring(0,newL);
	}
	else if(this.integerPart!="0"){
		this.integerPart="0";
	}
	else if(this.isNegative){
		this.isNegative=false;
	}
}
DisplayNum.prototype.switchSign=function(){
	if(!this.isNum) return;
	this.isNegative=!this.isNegative;
}
DisplayNum.prototype.addDecimalPoint=function(){
	if(!this.isNum) return;
	if(!this.hasDecimalPoint){
		this.hasDecimalPoint=true;
		this.decimalPart="";
	}
}
DisplayNum.prototype.addDigit=function(digit){ //Digit is a string
	if(!this.isNum) return;
	if(this.hasDecimalPoint){
		if(this.decimalPart.length<5){
			this.decimalPart+=digit;
		}
	}
	else if(this.integerPart!="0"){
		if(this.integerPart.length<10){
			this.integerPart+=digit;
		}
	}
	else if(digit!="0"){
		this.integerPart=digit;
	}
}
DisplayNum.prototype.getString=function(){
	if(!this.isNum){
		return null;
	}
	var rVal="";
	if(this.isNegative){
		rVal+="-";
	}
	rVal+=this.integerPart;
	if(this.hasDecimalPoint){
		rVal+=".";
		rVal+=this.decimalPart;
	}
	return rVal;
}
DisplayNum.prototype.getData=function(){
	if(!this.isNum){
		return this.data;
	}
	var rVal=parseInt(this.integerPart, 10);
	if(this.hasDecimalPoint&&this.decimalPart.length>0){
		var decPart=parseInt(this.decimalPart, 10);
		decPart/=Math.pow(10,this.decimalPart.length);
		rVal+=decPart;
	}
	if(this.isNegative){
		rVal=0-rVal;
	}
	return new NumData(rVal);
}