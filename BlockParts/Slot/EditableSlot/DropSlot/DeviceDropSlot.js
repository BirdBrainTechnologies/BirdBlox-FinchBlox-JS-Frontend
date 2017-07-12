/**
 * DeviceDropSlots appear on Blocks that control robots.  When only one robot is connected, they appear as an ordinary
 * label, but when multiple robots are connected, tey act as a DropSlot, displaying options for each connected robot.
 * @param {Block} parent
 * @param {string} key
 * @param deviceClass - A subclass of Device indicating the type of robot the Slot is selecting from
 * @param {boolean} [shortText=false] - Whether the Slot should abbreviate the name of the Device using its initials
 * @constructor
 */
function DeviceDropSlot(parent, key, deviceClass, shortText) {
	// When the Slot's value changes, its parent Block must re-check if it is active
	this.assignUpdateActive(parent);
	if (shortText == null) {
		shortText = false;
	}
	this.shortText = shortText;
	this.prefixText = deviceClass.getDeviceTypeName(shortText) + " ";
	// The values of the SelectionData are 0 - indexed, but they appear as 1 - indexed
	const data = new SelectionData(this.prefixText + 1, 0);
	DropSlot.call(this, parent, key, EditableSlot.inputTypes.select, Slot.snapTypes.none, data, false);

	this.deviceClass = deviceClass;

	// The Slot also has label text to display, depending on how many devices are available
	this.labelText = new LabelText(this.parent, this.prefixText.trim());
	this.labelMode = false;
	// Check to see which state it should start in
	const deviceCount = deviceClass.getManager().getSelectableDeviceCount();
	if (deviceCount <= 1) {
		this.switchToLabel();
	} else {
		this.labelText.hide();
	}

	// The parent Block may not be active if the device in the DropSlot is not connected
	this.parent.updateActive();
}
DeviceDropSlot.prototype = Object.create(DropSlot.prototype);
DeviceDropSlot.prototype.constructor = DeviceDropSlot;

/**
 * Modifies the checkActive function of the parent so that the selected device on the DropSlot must be connected
 * in order for the Block to be active
 * TODO: This is a bit strange and perhaps should be done in the Block's constructor in BlockDefs
 * @param {Block} parent - This Block's parent
 */
DeviceDropSlot.prototype.assignUpdateActive = function(parent){
	const me = this;
	// Get a copy of the old checkActive function
	const oldFn = parent.checkActive.bind(parent);
	parent.checkActive = function(){
		// The new checkActive function runs the old function and makes sure this device is connected
		const index = me.getDataNotFromChild().getValue();
		return oldFn() && me.deviceClass.getManager().deviceIsConnected(index);
	};
};

/**
 * When the Slot's value changes, the parent Block may become active/inactive
 * @inheritDoc
 * @param {Data} data
 * @param {boolean} sanitize
 * @param {boolean} updateDim
 */
DeviceDropSlot.prototype.setData = function(data, sanitize, updateDim){
	DropSlot.prototype.setData.call(this, data, sanitize, updateDim);
	this.parent.updateActive();
};

/**
 * When the connection status of a robot changes, the parent Block may become active/inactive
 */
DeviceDropSlot.prototype.updateConnectionStatus = function(){
	this.parent.updateActive();
};

/**
 * The DropSlot asks the deviceManager to determine how many devices to show
 * @inheritDoc
 * @param {InputWidget.SelectPad} selectPad - the pad to populate
 */
DeviceDropSlot.prototype.populatePad = function(selectPad) {
	const deviceCount = this.deviceClass.getManager().getSelectableDeviceCount();
	for (let i = 0; i < deviceCount; i++) {
		// We'll store a 0-indexed value but display it +1.
		selectPad.addOption(new SelectionData(this.prefixText + (i + 1), i));
		// TODO: should probably use the full name when showing the list
	}
};

/**
 * Changes the appearance of the Slot so it looks like a label instead of a Slot
 */
DeviceDropSlot.prototype.switchToLabel = function() {
	if (!this.labelMode) {
		this.labelMode = true;
		this.labelText.show();
		this.slotShape.hide();
		// When there's a label, only one device is connected
		this.setData(new SelectionData(this.prefixText + 1, 0), false, true);
	}
};

/**
 * Changes the appearance of the Slot so it looks like a slot instead of a label
 */
DeviceDropSlot.prototype.switchToSlot = function() {
	if (this.labelMode) {
		this.labelMode = false;
		this.labelText.hide();
		this.slotShape.show();
	}
};

/**
 * @inheritDoc
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
DeviceDropSlot.prototype.updateAlign = function(x, y) {
	if (this.labelMode) {
		return LabelText.prototype.updateAlign.call(this.labelText, x, y);
	} else {
		return DropSlot.prototype.updateAlign.call(this, x, y);
	}
};

/**
 * @inheritDoc
 */
DeviceDropSlot.prototype.updateDim = function() {
	if (this.labelMode) {
		LabelText.prototype.updateDim.call(this.labelText);
		this.width = this.labelText.width;
	} else {
		DropSlot.prototype.updateDim.call(this);
	}
};

/**
 * Receives the recursively passed message and acts on it
 * @param deviceClass - A subclass of Device
 */
DeviceDropSlot.prototype.hideDeviceDropDowns = function(deviceClass) {
	if(this.deviceClass === deviceClass) {
		this.switchToLabel();
	}
};

/**
 * Receives the recursively passed message and acts on it
 * @param deviceClass - A subclass of Device
 */
DeviceDropSlot.prototype.showDeviceDropDowns = function(deviceClass) {
	if(this.deviceClass === deviceClass) {
		this.switchToSlot();
	}
};

/**
 * Called by DeviceManager and used to determine how many devices to list.
 * @inheritDoc
 * @param deviceClass - A subclass of Device
 * @return {number} - The minimum number of devices to show in the DeviceDropSlots, according to this Slot
 */
DeviceDropSlot.prototype.countDevicesInUse = function(deviceClass) {
	if (this.deviceClass === deviceClass) {
		const myVal = this.getDataNotFromChild().getValue();
		return myVal + 1;
	} else {
		return 1;
	}
};

/**
 * DeviceDropSlots always have a value that is SelectionData with an integer value
 * @inheritDoc
 * @param {number|string|boolean} value
 * @return {SelectionData}
 */
DeviceDropSlot.prototype.selectionDataFromValue = function(value){
	const numData = (new StringData(value).asNum());
	if(!numData.isValid) return null;
	const numVal = numData.getValueWithC(true, true);
	// Prevents rendering huge lists
	if(numVal >= 30) return null; // TODO: implement connection limit
	return new SelectionData(this.prefixText + (numVal + 1), numVal);
};

/**
 * No Data other than SelectionData is valid
 * @inheritDoc
 * @param {Data} data
 * @return {Data|null}
 */
DeviceDropSlot.prototype.sanitizeNonSelectionData = function(data){
	return null;
};
