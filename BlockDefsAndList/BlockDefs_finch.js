// This is a block for debugging only.
function B_FinchSetAll(x, y) {
	CommandBlock.call(this, x, y, "finch");
	this.addPart(new DeviceDropSlot(this,"DDS_1", DeviceFinch));
	this.addPart(new LabelText(this,"Set All"));
	this.addPart(new StringSlot(this, "StrS_data", "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"));
}
B_FinchSetAll.prototype = Object.create(CommandBlock.prototype);
B_FinchSetAll.prototype.constructor = B_FinchSetAll;
/* Sends request */
B_FinchSetAll.prototype.startAction = function() {
	let deviceIndex = this.slots[0].getData().getValue();
	let device = DeviceFinch.getManager().getDevice(deviceIndex);
	if (device == null) {
		this.displayError(DeviceFinch.getNotConnectedMessage());
		return new ExecutionStatusError(); // Finch was invalid, exit early
	}
	const status = this.runMem.requestStatus = {};
	device.setAll(status, this.slots[1].getData().getValue());
	return new ExecutionStatusRunning();
};
/* Waits for request to finish */
B_FinchSetAll.prototype.updateAction = function() {
	if (this.runMem.requestStatus.finished) {
		if (this.runMem.requestStatus.error) {
			const status = this.runMem.requestStatus;
			this.displayError(DeviceFlutter.getNotConnectedMessage(status.code, status.result));
			return new ExecutionStatusError();
		}
		return new ExecutionStatusDone();
	} else {
		return new ExecutionStatusRunning();
	}
};