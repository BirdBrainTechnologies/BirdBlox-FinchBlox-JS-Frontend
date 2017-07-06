"use strict";

function PortSlot(parent, key, maxPorts) {
	DropSlot.call(this, parent, key, EditableSlot.inputTypes.any, Slot.snapTypes.none, new NumData(1));
	this.maxPorts = maxPorts;
    for(let portNum = 1; portNum <= this.maxPorts; portNum++) {
        this.addOption(new NumData(portNum), "port " + portNum.toString());
    }
}
PortSlot.prototype = Object.create(DropSlot.prototype);
PortSlot.prototype.constructor = PortSlot;