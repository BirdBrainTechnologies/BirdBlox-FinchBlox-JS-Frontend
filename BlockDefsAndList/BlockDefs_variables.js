//@fix Write documentation.

function B_Variable(x,y,variable){
	ReporterBlock.call(this,x,y,"variables");
	this.variable=variable;
	this.addPart(new LabelText(this,this.variable.getName()));
}
B_Variable.prototype = Object.create(ReporterBlock.prototype);
B_Variable.prototype.constructor = B_Variable;
B_Variable.prototype.startAction=function(){
	this.resultData=this.variable.getData();
	return false;
};

function B_SetTo(x,y){
	CommandBlock.call(this,x,y,"variables");
	this.addPart(new LabelText(this,"set"));
	this.addPart(new VarDropSlot(this));
	this.addPart(new LabelText(this,"to"));
	var rS=new RoundSlot(this,Slot.snapTypes.numStrBool,Slot.outputTypes.any,0);
	rS.addOption("Enter text",new SelectionData("enter_text"));
	this.addPart(rS);
}
B_SetTo.prototype = Object.create(CommandBlock.prototype);
B_SetTo.prototype.constructor = B_SetTo;
B_SetTo.prototype.startAction=function(){
	var variableD=this.slots[0].getData();
	var data=this.slots[1].getData();
	var type=data.type;
	var types=Data.types;
	if(type==types.bool||type==types.num||type==types.string) {
		if (variableD != null && variableD.type == Data.types.selection) {
			var variable = variableD.getValue();
			variable.setData(data);
		}
	}
	return false;
};


function B_ChangeBy(x,y){
	CommandBlock.call(this,x,y,"variables");
	this.addPart(new LabelText(this,"change"));
	this.addPart(new VarDropSlot(this));
	this.addPart(new LabelText(this,"by"));
	this.addPart(new NumSlot(this,1));
}
B_ChangeBy.prototype = Object.create(CommandBlock.prototype);
B_ChangeBy.prototype.constructor = B_ChangeBy;
B_ChangeBy.prototype.startAction=function(){
	var variableD=this.slots[0].getData();
	var incrementD=this.slots[1].getData();
	if(variableD != null && variableD.type == Data.types.selection){
		var variable=variableD.getValue();
		var currentD=variable.getData().asNum();
		var newV=incrementD.getValue()+currentD.getValue();
		var isValid=currentD.isValid&&incrementD.isValid;
		var newD=new NumData(newV,isValid);
		variable.setData(newD);
	}
	return false;
};