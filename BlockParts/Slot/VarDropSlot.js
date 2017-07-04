//@fix Write documentation.

function VarDropSlot(key, parent){
	const variables = CodeManager.variableList;
	let data = SelectionData.empty();
	if(variables.length > 0){
		const lastVar = variables[variables.length-1];
		data = lastVar.getSelectionData();
	}
	DropSlot.call(this, key, parent, null, null, data, true);
}
VarDropSlot.prototype = Object.create(DropSlot.prototype);
VarDropSlot.prototype.constructor = VarDropSlot;
VarDropSlot.prototype.populatePad=function(selectPad){
	CodeManager.variableList.forEach(function(variable){
		selectPad.addOption(new SelectionData(variable.getName(), variable));
	});
};
VarDropSlot.prototype.selectionDataFromValue = function(value){
	const variable = CodeManager.findVar(value);
	if(variable == null) return null;
	return variable.getSelectionData();
};
VarDropSlot.prototype.renameVariable=function(variable){
	if(this.enteredData != null && this.enteredData.getValue() === variable){
		this.setData(variable.getSelectionData(), false, true);
	}
};
VarDropSlot.prototype.deleteVariable=function(variable){
	if(this.enteredData != null && this.enteredData.getValue() === variable){
		this.setData(SelectionData.empty(), false, true);
	}
};
VarDropSlot.prototype.checkVariableUsed=function(variable){
	if(this.enteredData != null&&this.enteredData.getValue() === variable){
		return true;
	}
	return false;
};