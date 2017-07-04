//@fix Write documentation.

function BroadcastDropSlot(parent,key,isHatBlock){
	if(isHatBlock == null){
		isHatBlock = false;
	}
	let snapType = Slot.snapTypes.numStrBool;
	if(isHatBlock){
		snapType = Slot.snapTypes.none;
	}
	if(isHatBlock) {
		this.addOption("any message", "any_message");
	}
	NewDropSlot.call(this, parent, key, EditableSlot.inputTypes.any, snapType);
}
BroadcastDropSlot.prototype = Object.create(NewDropSlot.prototype);
BroadcastDropSlot.prototype.constructor = BroadcastDropSlot;
BroadcastDropSlot.prototype.populatePad = function(selectPad){
	NewDropSlot.prototype.populatePad.call(this, selectPad);
	CodeManager.updateAvailableMessages();
	const messages = CodeManager.broadcastList;
	messages.forEach(function(message){
		selectPad.addOption(new StringData(message), '"'+message+'"');
	});
	selectPad.addAction("new", function(callbackFn){
		const inputDialog = new InputDialog(this.textSummary(), false);
		inputDialog.show(this.slotShape, function(){}, function(data, cancelled){
			callbackFn(data, !cancelled);
		}, this.enteredData);
	}.bind(this));
	this.addOption(new SelectionData("new", "new_message"));
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