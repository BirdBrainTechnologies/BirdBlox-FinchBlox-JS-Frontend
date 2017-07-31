// This is a block for debugging only.  It starts with DB_ so that it can never be loaded from a save file
function DB_FinchSetAll(x, y) {
	CommandBlock.call(this, x, y, "finch");
	this.addPart(new DeviceDropSlot(this,"DDS_1", DeviceFinch));
	this.addPart(new LabelText(this,"Set All"));
	this.addPart(new StringSlot(this, "StrS_data", ""));
}
DB_FinchSetAll.prototype = Object.create(CommandBlock.prototype);
DB_FinchSetAll.prototype.constructor = DB_FinchSetAll;
/* Sends request */
DB_FinchSetAll.prototype.startAction = function() {
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
DB_FinchSetAll.prototype.updateAction = function() {
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