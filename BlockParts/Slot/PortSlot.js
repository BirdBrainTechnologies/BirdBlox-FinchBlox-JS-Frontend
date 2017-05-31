"use strict";

function PortSlot(parent, key, maxPorts) {
	DropSlot.call(this, parent, key, Slot.snapTypes.none);
	this.maxPorts = maxPorts;
	this.setSelectionData();
    for(let portNum = 1; portNum <= this.maxPorts; portNum++) {
        this.addOption("port " + portNum.toString(), new NumData(portNum));
    }
    this.setSelectionData("1",new NumData(1));
}
PortSlot.prototype = Object.create(DropSlot.prototype);
PortSlot.prototype.constructor = PortSlot;