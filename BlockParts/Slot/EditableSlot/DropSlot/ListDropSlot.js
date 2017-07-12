/**
 *
 * @param parent
 * @param key
 * @param snapType
 * @constructor
 */
function ListDropSlot(parent,key,snapType){
	if(snapType == null){
		snapType = Slot.snapTypes.none
	}

	const lists = CodeManager.listList;
	let data = SelectionData.empty();
	if(lists.length>0){
		const lastList = lists[lists.length-1];
		data = lastList.getSelectionData();
	}
	DropSlot.call(this, parent, key, null, snapType, data, true);
}
ListDropSlot.prototype = Object.create(DropSlot.prototype);
ListDropSlot.prototype.constructor = ListDropSlot;
ListDropSlot.prototype.populatePad = function(selectPad){
	CodeManager.listList.forEach(function(list){
		selectPad.addOption(list.getSelectionData());
	});
	selectPad.addAction("Create list", function(callback){
		CodeManager.newList(function(list){
			callback(list.getSelectionData(), true);
		}, function(){
			callback(null, false);
		})
	});
};
ListDropSlot.prototype.selectionDataFromValue = function(value){
	DebugOptions.validateNonNull(value);
	if(value.constructor === List) return value.getSelectionData();
	const list = CodeManager.findList(value);
	if(list == null) return null;
	return list.getSelectionData();
};
ListDropSlot.prototype.renameList=function(list){
	if(this.enteredData != null && this.enteredData.getValue() === list){
		this.setData(list.getSelectionData(), false, true);
	}
	this.passRecursively("renameList", list);
};
ListDropSlot.prototype.deleteList=function(list){
	if(!this.enteredData.isEmpty() && this.enteredData.getValue() === list){
		this.setData(SelectionData.empty(), false, true);
	}
	this.passRecursively("deleteList",list);
};
ListDropSlot.prototype.checkListUsed=function(list){
	if(this.hasChild){
		return DropSlot.prototype.checkListUsed.call(this,list);
	}
	else if(this.enteredData != null && this.enteredData.getValue() === list){
		return true;
	}
	return false;
};