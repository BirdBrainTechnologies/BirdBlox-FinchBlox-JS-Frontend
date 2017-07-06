//@fix Write documentation.

function BroadcastDropSlot(parent,key,isHatBlock){
	if(isHatBlock == null){
		isHatBlock = false;
	}
	let snapType = Slot.snapTypes.numStrBool;
	if(isHatBlock){
		snapType = Slot.snapTypes.none;
	}
	DropSlot.call(this, parent, key, EditableSlot.inputTypes.any, snapType);
	if(isHatBlock) {
		this.addOption(new SelectionData("any message", "any_message"));
	}
}
BroadcastDropSlot.prototype = Object.create(DropSlot.prototype);
BroadcastDropSlot.prototype.constructor = BroadcastDropSlot;
BroadcastDropSlot.prototype.populatePad = function(selectPad){
	DropSlot.prototype.populatePad.call(this, selectPad);
	CodeManager.updateAvailableMessages();
	const messages = CodeManager.broadcastList;
	messages.forEach(function(message){
		selectPad.addOption(new StringData(message), '"'+message+'"');
	});
	selectPad.addAction("new", function(callbackFn){
		const inputDialog = new InputDialog(this.parent.textSummary(this), false);
		inputDialog.show(this.slotShape, function(){}, function(data, cancelled){
			callbackFn(data, !cancelled);
		}, this.enteredData);
	}.bind(this));
};
BroadcastDropSlot.prototype.updateAvailableMessages=function(){
	if(this.enteredData !== null && this.enteredData.type === Data.types.string){
		CodeManager.addBroadcastMessage(this.enteredData.getValue());
	}
};
BroadcastDropSlot.prototype.sanitizeNonSelectionData = function(data){
	data = data.asString();
	if(!data.isValid) return null;
	return data;
};