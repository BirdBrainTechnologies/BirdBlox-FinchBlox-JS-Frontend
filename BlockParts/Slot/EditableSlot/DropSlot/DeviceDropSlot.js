function DeviceDropSlot(parent, key, deviceClass, shortText) {
	this.assignUpdateActive(parent);
	if (shortText == null) {
		shortText = false;
	}
	this.shortText = shortText;
	this.prefixText = deviceClass.getDeviceTypeName(shortText) + " ";
	const data = new SelectionData(this.prefixText + 1, 0);
	DropSlot.call(this, parent, key, EditableSlot.inputTypes.select, Slot.snapTypes.none, data, false);

	this.deviceClass = deviceClass;
	this.labelText = new LabelText(this.parent, this.prefixText.trim());
	this.labelMode = false;
	const deviceCount = deviceClass.getManager().getSelectableDeviceCount();
	if (deviceCount <= 1) {
		this.switchToLabel();
	} else {
		this.labelText.hide();
	}
	this.parent.updateActive();
}

DeviceDropSlot.prototype = Object.create(DropSlot.prototype);
DeviceDropSlot.prototype.constructor = DeviceDropSlot;
DeviceDropSlot.prototype.assignUpdateActive = function(parent){
	const me = this;
	const oldFn = parent.checkActive.bind(parent);
	parent.checkActive = function(){
		const index = me.getDataNotFromChild().getValue();
		return oldFn() && me.deviceClass.getManager().deviceIsConnected(index);
	};
};
DeviceDropSlot.prototype.setData = function(data, sanitize, updateDim){
	DropSlot.prototype.setData.call(this, data, sanitize, updateDim);
	this.parent.updateActive();
};
DeviceDropSlot.prototype.updateConnectionStatus = function(){
	this.parent.updateActive();
};
DeviceDropSlot.prototype.populatePad = function(selectPad) {
	const deviceCount = this.deviceClass.getManager().getSelectableDeviceCount();
	for (let i = 0; i < deviceCount; i++) {
		//We'll store a 0-indexed value but display it +1.
		selectPad.addOption(new SelectionData(this.prefixText + (i + 1), i));
	}
};

DeviceDropSlot.prototype.switchToLabel = function() {
	if (!this.labelMode) {
		this.labelMode = true;
		this.labelText.show();
		this.slotShape.hide();
		this.setData(new SelectionData(this.prefixText + 1, 0), false, true);
	}
};

DeviceDropSlot.prototype.switchToSlot = function() {
	if (this.labelMode) {
		this.labelMode = false;
		this.labelText.hide();
		this.slotShape.show();
	}
};

DeviceDropSlot.prototype.updateAlign = function(x, y) {
	if (this.labelMode) {
		return LabelText.prototype.updateAlign.call(this.labelText, x, y);
	} else {
		return DropSlot.prototype.updateAlign.call(this, x, y);
	}
};

DeviceDropSlot.prototype.updateDim = function() {
	if (this.labelMode) {
		LabelText.prototype.updateDim.call(this.labelText);
		this.width = this.labelText.width;
	} else {
		DropSlot.prototype.updateDim.call(this);
	}
};

DeviceDropSlot.prototype.hideDeviceDropDowns = function(deviceClass) {
	if(this.deviceClass === deviceClass) {
		this.switchToLabel();
	}
};

DeviceDropSlot.prototype.showDeviceDropDowns = function(deviceClass) {
	if(this.deviceClass === deviceClass) {
		this.switchToSlot();
	}
};

DeviceDropSlot.prototype.countDevicesInUse = function(deviceClass) {
	if (this.deviceClass === deviceClass) {
		const myVal = this.getDataNotFromChild().getValue();
		return myVal + 1;
	} else {
		return 1;
	}
};
DeviceDropSlot.prototype.selectionDataFromValue = function(value){
	const numData = (new StringData(value).asNum());
	if(!numData.isValid) return null;
	const numVal = numData.getValueWithC(true, true);
	if(numVal >= 30) return null; // TODO: implement connection limit
	return new SelectionData(this.prefixText + (numVal + 1), numVal);
};
DeviceDropSlot.prototype.sanitizeNonSelectionData = function(data){
	return null;
};
