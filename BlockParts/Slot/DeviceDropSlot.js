function DeviceDropSlot(parent, key, DeviceManager, shortText) {
	if (shortText == null) {
		shortText = false;
	}
	this.shortText = shortText;
	DropSlot.call(this, parent, key, Slot.snapTypes.none);
	this.prefixText = DeviceManager.GetDeviceName(shortText) + " ";
	this.DeviceManager = DeviceManager;
	this.labelText = new LabelText(this.parent, this.prefixText.trim());
	this.labelMode = false;
	this.setSelectionData(this.prefixText + 1, new SelectionData(0));

	if (DeviceManager.GetDeviceCount() <= 1) {
		this.switchToLabel();
	} else {
		this.labelText.hide();
	}
}

DeviceDropSlot.prototype = Object.create(DropSlot.prototype);
DeviceDropSlot.prototype.constructor = DeviceDropSlot;
DeviceDropSlot.prototype.populateList = function() {
	this.clearOptions();
	var deviceCount = this.DeviceManager.GetDeviceCount();
	for (var i = 0; i < deviceCount; i++) {
		this.addOption(this.prefixText + (i + 1), new SelectionData(i)); //We'll store a 0-indexed value but display it +1.
	}
};

DeviceDropSlot.prototype.duplicate = function(parentCopy) {
	var myCopy = new DeviceDropSlot(parentCopy, this.DeviceManager, this.shortText);
	myCopy.enteredData = this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};

DeviceDropSlot.prototype.switchToLabel = function() {
	if (!this.labelMode) {
		this.labelMode = true;
		this.setSelectionData(this.prefixText + 1, new SelectionData(0));
		this.labelText.show();
		this.hideSlot();
	}
};

DeviceDropSlot.prototype.switchToSlot = function() {
	if (this.labelMode) {
		this.labelMode = false;
		this.labelText.hide();
		this.showSlot();
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

DeviceDropSlot.prototype.hideDeviceDropDowns = function() {
	this.switchToLabel();
};

DeviceDropSlot.prototype.showDeviceDropDowns = function() {
	this.switchToSlot();
};

DeviceDropSlot.prototype.countHBsInUse = function() {
	if (this.getData() != null) {
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