function DeviceDropSlot(parent, key, deviceClass, shortText) {
	if (shortText == null) {
		shortText = false;
	}
	this.shortText = shortText;
	this.prefixText = deviceClass.getDeviceTypeName(shortText) + " ";
	this.deviceClass = deviceClass;
	this.labelText = new LabelText(this.parent, this.prefixText.trim());
	this.labelMode = false;
	const data = new SelectionData(this.prefixText + 1, 0);

	DropSlot.call(this, parent, key, EditableSlot.inputTypes.num, Slot.snapTypes.none, data, false);

	if (deviceClass.getManager().getSelectableDeviceCount() <= 1) {
		this.switchToLabel();
	} else {
		this.labelText.hide();
	}
}

DeviceDropSlot.prototype = Object.create(DropSlot.prototype);
DeviceDropSlot.prototype.constructor = DeviceDropSlot;
DeviceDropSlot.prototype.populatePad = function(selectPad) {
	const deviceCount = this.deviceClass.getManager().getSelectableDeviceCount();
	for (let i = 0; i < deviceCount; i++) {
		//We'll store a 0-indexed value but display it +1.
		selectPad.addOption(new SelectionData(this.prefixText + (i + 1), new SelectionData(i)));
	}
};

DeviceDropSlot.prototype.switchToLabel = function() {
	if (!this.labelMode) {
		this.labelMode = true;
		this.setSelectionData(new SelectionData(0, this.prefixText + 1));
		this.labelText.show();
		this.slotShape.hide();
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
	if (this.deviceClass === deviceClass && this.getData() != null) {
		return this.getData().getValue() + 1;
	} else {
		return 1;
	}
};

DeviceDropSlot.prototype.importXml = function(slotNode) {
	DropSlot.prototype.importXml.call(this, slotNode);
	this.enteredData = new SelectionData(parseInt(this.enteredData.getValue()));
	if (this.enteredData.getValue() < 0) {
		this.setSelectionData(this.prefixText + 1, new SelectionData(0));
	}
};

DeviceDropSlot.prototype.sanitizeNonSelectionData = function(data){
	const value = data.asNum().getValue();
	if(value < 0) return null;
	if(value % 1 !== 0) return null;
	if(!Number.isInteger(value)) return null;
	if(value >= 30) return null; // TODO: implement connection limit
	return data;
};