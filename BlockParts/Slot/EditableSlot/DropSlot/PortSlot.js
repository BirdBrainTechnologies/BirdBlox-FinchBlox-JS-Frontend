"use strict";
/**
 * PortSlots select a port for Robot input/output Blocks.  They store the Data as NumData (not SelectionData)
 * for legacy support
 * @param {Block} parent
 * @param {string} key
 * @param {number} maxPorts - The number of ports to list as options
 * @constructor
 */
function PortSlot(parent, key, maxPorts) {
	DropSlot.call(this, parent, key, EditableSlot.inputTypes.any, Slot.snapTypes.none, new NumData(1));
	this.maxPorts = maxPorts;
	for (let portNum = 1; portNum <= this.maxPorts; portNum++) {
		this.addOption(new NumData(portNum), Language.getStr("port") + " " + portNum.toString());
	}
}
PortSlot.prototype = Object.create(DropSlot.prototype);
PortSlot.prototype.constructor = PortSlot;

/**
 * PortSlots only allow NumData integers from 1 to maxPorts
 * @param {Data} data
 * @return {Data|null}
 */
PortSlot.prototype.sanitizeData = function(data) {
	data = EditableSlot.prototype.sanitizeData.call(this, data);
	if (data == null) return null;
	const value = data.asNum().getValueInR(1, this.maxPorts, true, true);
	return new NumData(value, data.isValid);
};
