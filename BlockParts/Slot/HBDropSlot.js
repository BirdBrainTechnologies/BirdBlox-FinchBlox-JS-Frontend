function HBDropSlot(parent, DeviceManager, shortText) {
	if (shortText == null) {
		shortText = false;
	}
	this.shortText = shortText;
	DropSlot.call(this, parent, Slot.snapTypes.none);
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

HBDropSlot.prototype = Object.create(DropSlot.prototype);
HBDropSlot.prototype.constructor = HBDropSlot;
HBDropSlot.prototype.populateList = function() {
	this.clearOptions();
	var deviceCount = this.DeviceManager.GetDeviceCount();
	for (var i = 0; i < deviceCount; i++) {
		this.addOption(this.prefixText + (i + 1), new SelectionData(i)); //We'll store a 0-indexed value but display it +1.
	}
};

HBDropSlot.prototype.duplicate = function(parentCopy) {
	var myCopy = new HBDropSlot(parentCopy, this.DeviceManager, this.shortText);
	myCopy.enteredData = this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
};

HBDropSlot.prototype.switchToLabel = function() {
	if (!this.labelMode) {
		this.labelMode = true;
		this.setSelectionData(this.prefixText + 1, new SelectionData(0));
		this.labelText.show();
		this.hideSlot();
	}
};

HBDropSlot.prototype.switchToSlot = function() {
	if (this.labelMode) {
		this.labelMode = false;
		this.labelText.hide();
		this.showSlot();
	}
};

HBDropSlot.prototype.updateAlign = function(x, y) {
	if (this.labelMode) {
		return LabelText.prototype.updateAlign.call(this.labelText, x, y);
	} else {
		return DropSlot.prototype.updateAlign.call(this, x, y);
	}
};

HBDropSlot.prototype.updateDim = function() {
	if (this.labelMode) {
		LabelText.prototype.updateDim.call(this.labelText);
		this.width = this.labelText.width;
	} else {
		DropSlot.prototype.updateDim.call(this);
	}
};

HBDropSlot.prototype.hideHBDropDowns = function() {
	this.switchToLabel();
};

HBDropSlot.prototype.showHBDropDowns = function() {
	this.switchToSlot();
};

HBDropSlot.prototype.countHBsInUse = function() {
	if (this.getData() != null) {
		return this.getData().getValue() + 1;
	} else {
		return 1;
	}
};

HBDropSlot.prototype.importXml = function(slotNode) {
	DropSlot.prototype.importXml.call(this, slotNode);
	this.enteredData = new SelectionData(parseInt(this.enteredData.getValue()));
	if (this.enteredData.getValue() < 0) {
		this.setSelectionData(this.prefixText + 1, new SelectionData(0));
	}
};