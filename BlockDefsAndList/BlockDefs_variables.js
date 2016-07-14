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
B_Variable.prototype.createXml=function(xmlDoc){
	var block=XmlWriter.createElement(xmlDoc,"block");
	XmlWriter.setAttribute(block,"type",this.blockTypeName);
	XmlWriter.setAttribute(block,"variable",this.variable.getName());
	return block;
};
B_Variable.prototype.renameVar=function(){
	this.variable.rename();	
};
B_Variable.prototype.deleteVar=function(){
	this.variable.delete();
};
B_Variable.prototype.renameVariable=function(variable){
	if(variable==this.variable){
		this.parts[0].remove();
		this.parts[0]=new LabelText(this,this.variable.getName());
		if(this.stack!=null){
			this.stack.updateDim();
		}
	}
};
B_Variable.prototype.deleteVariable=function(variable){
	if(variable==this.variable){
		this.unsnap().delete();
	}
};
B_Variable.importXml=function(blockNode){
	var variableName=XmlWriter.getAttribute(blockNode,"variable");
	var variable=CodeManager.findVar(variableName);
	if(variable!=null){
		return new B_Variable(0,0,variable);
	}
	return null;
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
B_List.prototype.createXml=function(xmlDoc){
	var block=XmlWriter.createElement(xmlDoc,"block");
	XmlWriter.setAttribute(block,"type",this.blockTypeName);
	XmlWriter.setAttribute(block,"list",this.list.getName());
	return block;
};
B_List.importXml=function(blockNode){
	var listName=XmlWriter.getAttribute(blockNode,"list");
	var list=CodeManager.findList(listName);
	if(list!=null){
		return new B_List(0,0,list);
	}
	return null;
};
B_List.prototype.renameLi=function(){
	this.list.rename();
};
B_List.prototype.deleteLi=function(){
	this.list.delete();
};
B_List.prototype.renameList=function(list){
	if(list==this.list){
		this.parts[0].remove();
		this.parts[0]=new LabelText(this,this.list.getName());
		if(this.stack!=null){
			this.stack.updateDim();
		}
	}
};
B_List.prototype.deleteList=function(list){
	if(list==this.list){
		this.unsnap().delete();
	}
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
			array.push(itemD.asString());
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
		var listData=list.getData();
		var array=listData.getValue();
		if(indexD.type==Data.types.selection&&indexD.getValue()=="all"){
			list.setData(new ListData());
		}
		else {
			var index = listData.getIndex(indexD);
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
		var listData=list.getData();
		var array=listData.getValue();
		var itemD=this.slots[0].getData();
		var index=listData.getIndex(indexD);
		if(index==null||indexD.getValue()>array.length){
			if(indexD.type==Data.types.num&&indexD.getValue()>array.length){
				if(itemD.isValid){
					array.push(itemD);
				}
				else{
					array.push(itemD.asString());
				}
			}
			return false;
		}
		if(itemD.isValid){
			array.splice(index, 0, itemD);
		}
		else{
			array.splice(index, 0, itemD.asString());
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
		var listData=list.getData();
		var array=listData.getValue();
		var itemD=this.slots[2].getData();
		var index=listData.getIndex(indexD);
		if(index==null){
			return false;
		}
		if(itemD.isValid){
			array[index]=itemD;
		}
		else{
			array[index]=itemD.asString();
		}
	}
	return false;
};



function B_CopyListToList(x,y){
	CommandBlock.call(this,x,y,"lists");
	this.addPart(new LabelText(this,"copy"));
	this.addPart(new ListDropSlot(this,Slot.snapTypes.list));
	this.addPart(new LabelText(this,"to"));
	this.addPart(new ListDropSlot(this));
}
B_CopyListToList.prototype = Object.create(CommandBlock.prototype);
B_CopyListToList.prototype.constructor = B_CopyListToList;
B_CopyListToList.prototype.startAction=function(){
	var listD1=this.slots[0].getData();
	var listD2=this.slots[1].getData();
	if(listD1!=null&&listD2!=null){
		var listDataToCopy;
		if(listD1.type==Data.types.selection){
			listDataToCopy=listD1.getValue().getData();
		}
		else if(listD1.type==Data.types.list){
			listDataToCopy=listD1;
		}
		else{
			return false;
		}
		if(listD2.type==Data.types.selection){
			var listToCopyTo=listD2.getValue();
			listToCopyTo.setData(listDataToCopy.duplicate());
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
	this.addPart(new ListDropSlot(this,Slot.snapTypes.list));
}
B_ItemOfList.prototype = Object.create(ReporterBlock.prototype);
B_ItemOfList.prototype.constructor = B_ItemOfList;
B_ItemOfList.prototype.startAction=function(){
	var listD=this.slots[1].getData();
	var indexD;
	if(listD!=null&&listD.type == Data.types.selection) {
		indexD = this.slots[0].getData();
		var list = listD.getValue();
		var listData=list.getData();
		this.resultData=this.getItemOfList(listData,indexD);
	}
	else if(listD!=null&&listD.type == Data.types.list){
		indexD = this.slots[0].getData();
		this.resultData=this.getItemOfList(listD,indexD);
	}
	else {
		this.resultData = new StringData("", false);
	}
	return false;
};
B_ItemOfList.prototype.getItemOfList=function(listData,indexD){
	var array = listData.getValue();
	var index=listData.getIndex(indexD);
	if(index==null){
		return new StringData("", false);
	}
	else {
		return array[index];
	}
};


//Done
function B_LengthOfList(x,y){
	ReporterBlock.call(this,x,y,"lists",Block.returnTypes.num);
	this.addPart(new LabelText(this,"length of"));
	this.addPart(new ListDropSlot(this,Slot.snapTypes.list));
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
	else if(listD!=null&&listD.type == Data.types.list){
		this.resultData = new NumData(listD.getValue().length);
	}
	else {
		this.resultData = new NumData(0,false);
	}
	return false;
};


//Done
function B_ListContainsItem(x,y){
	PredicateBlock.call(this,x,y,"lists");
	this.addPart(new ListDropSlot(this,Slot.snapTypes.list));
	this.addPart(new LabelText(this,"contains"));
	this.addPart(new StringSlot(this,"thing"));
}
B_ListContainsItem.prototype = Object.create(PredicateBlock.prototype);
B_ListContainsItem.prototype.constructor = B_ListContainsItem;
B_ListContainsItem.prototype.startAction=function(){
	var listD=this.slots[0].getData();
	var itemD;
	if(listD!=null&&listD.type == Data.types.selection) {
		var list = listD.getValue();
		var listData=list.getData();
		itemD=this.slots[1].getData();
		this.resultData=this.checkListContainsItem(listData,itemD);
	}
	else if(listD!=null&&listD.type == Data.types.list){
		itemD=this.slots[1].getData();
		this.resultData=this.checkListContainsItem(listD,itemD);
	}
	else {
		this.resultData = new BoolData(false,true);
	}
	return false;
};
B_ListContainsItem.prototype.checkListContainsItem=function(listData,itemD){
	var array = listData.getValue();
	for(var i=0;i<array.length;i++){
		if(Data.checkEquality(itemD,array[i])){
			return new BoolData(true,true);
		}
	}
	return new BoolData(false,true);
};