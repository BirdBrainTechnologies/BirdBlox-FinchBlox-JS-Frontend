//@fix Write documentation.

function B_Variable(x,y,variable){
	ReporterBlock.call(this,x,y,"variables",Block.returnTypes.string);
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
	var rS=new RoundSlot(this,Slot.snapTypes.numStrBool,Slot.outputTypes.any,new NumData(0));
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


//Done
function B_List(x,y,list){
	ReporterBlock.call(this,x,y,"lists",Block.returnTypes.string);
	this.list=list;
	this.addPart(new LabelText(this,this.list.getName()));
}
B_List.prototype = Object.create(ReporterBlock.prototype);
B_List.prototype.constructor = B_List;
B_List.prototype.startAction=function(){
	this.resultData=this.list.getData().asString();
	return false;
};


//Done
function B_AddToList(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"add"));
	this.addPart(new RectSlot(this,Slot.snapTypes.numStrBool,Slot.outputTypes.any,"thing"));
	this.addPart(new LabelText(this,"to"));
	this.addPart(new ListDropSlot(this));
}
B_AddToList.prototype = Object.create(CommandBlock.prototype);
B_AddToList.prototype.constructor = B_AddToList;
B_AddToList.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	if(listD!=null&&listD.type == Data.types.selection){
		var list=listD.getValue();
		var array=list.getData().getValue();
		var itemD=this.slots[0].getData();
		if(itemD.isValid){
			array.push(itemD);
		}
		else{
			array.push(new StringData(itemD.asString(),true));
		}
	}
	return false;
};


//Done
function B_DeleteItemOfList(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"delete"));
	var nS=new NumSlot(this,1,true,true);
	nS.addOption("last",new SelectionData("last"));
	nS.addOption("random",new SelectionData("random"));
	nS.addOption("all",new SelectionData("all"));
	this.addPart(nS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new ListDropSlot(this));
}
B_DeleteItemOfList.prototype = Object.create(CommandBlock.prototype);
B_DeleteItemOfList.prototype.constructor = B_DeleteItemOfList;
B_DeleteItemOfList.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	if(listD!=null&&listD.type == Data.types.selection){
		var indexD=this.slots[0].getData();
		var list=listD.getValue();
		var array=list.getData().getValue();
		if(indexD.type==Data.types.selection&&indexD.getValue()=="all"){
			list.setData(new ListData());
		}
		else {
			var index = list.getIndex(indexD);
			if (index != null) {
				array.splice(index, 1);
			}
		}
	}
	return false;
};


//Done
function B_InsertItemAtOfList(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"insert"));
	this.addPart(new StringSlot(this,"thing"));
	this.addPart(new LabelText(this,"at"));
	var nS=new NumSlot(this,1,true,true);
	nS.addOption("last",new SelectionData("last"));
	nS.addOption("random",new SelectionData("random"));
	this.addPart(nS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new ListDropSlot(this));
}
B_InsertItemAtOfList.prototype = Object.create(CommandBlock.prototype);
B_InsertItemAtOfList.prototype.constructor = B_InsertItemAtOfList;
B_InsertItemAtOfList.prototype.startAction=function(){
	var listD=this.slots[2].getData();
	if(listD!=null&&listD.type == Data.types.selection){
		var indexD=this.slots[1].getData();
		var list=listD.getValue();
		var array=list.getData().getValue();
		var itemD=this.slots[0].getData();
		var index=list.getIndex(indexD);
		if(index==null){
			if(indexD.type==Data.types.num&&indexD.getValue()>array.length){
				if(itemD.isValid){
					array.push(itemD);
				}
				else{
					array.push(new StringData(itemD.asString()));
				}
			}
			return false;
		}
		if(itemD.isValid){
			array.splice(index, 0, itemD);
		}
		else{
			array.splice(index, 0, new StringData(itemD.asString(),true));
		}
	}
	return false;
};


//Done
function B_ReplaceItemOfListWith(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"replace item"));
	var nS=new NumSlot(this,1,true,true);
	nS.addOption("last",new SelectionData("last"));
	nS.addOption("random",new SelectionData("random"));
	this.addPart(nS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new ListDropSlot(this));
	this.addPart(new LabelText(this,"with"));
	this.addPart(new StringSlot(this,"thing"));
}
B_ReplaceItemOfListWith.prototype = Object.create(CommandBlock.prototype);
B_ReplaceItemOfListWith.prototype.constructor = B_ReplaceItemOfListWith;
B_ReplaceItemOfListWith.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	if(listD!=null&&listD.type == Data.types.selection){
		var indexD=this.slots[0].getData();
		var list=listD.getValue();
		var array=list.getData().getValue();
		var itemD=this.slots[2].getData();
		var index=list.getIndex(indexD);
		if(index==null){
			return false;
		}
		if(itemD.isValid){
			array[index]=itemD;
		}
		else{
			array[index]=new StringData(itemD.asString(),true);
		}
	}
	return false;
};


//Done
function B_ItemOfList(x,y){
	ReporterBlock.call(this,x,y,"lists",Block.returnTypes.string);
	this.addPart(new LabelText(this,"item"));
	var nS=new NumSlot(this,1,true,true);
	nS.addOption("last",new SelectionData("last"));
	nS.addOption("random",new SelectionData("random"));
	this.addPart(nS);
	this.addPart(new LabelText(this,"of"));
	this.addPart(new ListDropSlot(this));
}
B_ItemOfList.prototype = Object.create(ReporterBlock.prototype);
B_ItemOfList.prototype.constructor = B_ItemOfList;
B_ItemOfList.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	if(listD!=null&&listD.type == Data.types.selection) {
		var indexD = this.slots[0].getData();
		var list = listD.getValue();
		var array = list.getData().getValue();
		var index=list.getIndex(indexD);
		if(index==null){
			this.resultData = new StringData("", false);
		}
		else {
			this.resultData = array[index];
		}
	}
	else {
		this.resultData = new StringData("", false);
	}
	return false;
};


//Done
function B_LengthOfList(x,y){
	ReporterBlock.call(this,x,y,"lists",Block.returnTypes.num);
	this.addPart(new LabelText(this,"length of"));
	this.addPart(new ListDropSlot(this));
}
B_LengthOfList.prototype = Object.create(ReporterBlock.prototype);
B_LengthOfList.prototype.constructor = B_LengthOfList;
B_LengthOfList.prototype.startAction=function(){
	var listD=this.slots[0].getData();
	if(listD!=null&&listD.type == Data.types.selection) {
		var list = listD.getValue();
		var array = list.getData().getValue();
		this.resultData = new NumData(array.length);
	}
	else {
		this.resultData = new NumData(0,false);
	}
	return false;
};


//Done
function B_ListContainsItem(x,y){
	PredicateBlock.call(this,x,y,"lists");
	this.addPart(new ListDropSlot(this));
	this.addPart(new LabelText(this,"contains"));
	this.addPart(new StringSlot(this,"thing"));
}
B_ListContainsItem.prototype = Object.create(PredicateBlock.prototype);
B_ListContainsItem.prototype.constructor = B_ListContainsItem;
B_ListContainsItem.prototype.startAction=function(){
	var listD=this.slots[0].getData();
	if(listD!=null&&listD.type == Data.types.selection) {
		var list = listD.getValue();
		var array = list.getData().getValue();
		var itemD=this.slots[1].getData();
		this.resultData = new BoolData(false,true);
		for(var i=0;i<array.length;i++){
			if(Data.checkEquality(itemD,array[i])){
				this.resultData = new BoolData(true,true);
			}
		}
	}
	else {
		this.resultData = new BoolData(false,true);
	}
	return false;
};