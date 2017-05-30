"use strict";

function PortSlot(parent, maxPorts) {
	DropSlot.call(this, parent, Slot.snapTypes.none);
	this.maxPorts = maxPorts;
	this.setSelectionData();
    for(let portNum = 1; portNum <= this.maxPorts; portNum++) {
        this.addOption("port " + portNum.toString(), new NumData(portNum));
    }
    this.setSelectionData("1",new NumData(1));
}

PortSlot.prototype = Object.create(DropSlot.prototype);
PortSlot.prototype.constructor = PortSlot;

/* PortSlot.prototype.populateList=function(){
}; */
PortSlot.prototype.duplicate=function(parentBlock){
    let clone = new PortSlot(parentBlock, this.maxPorts);
    clone.enteredData=this.enteredData;
    clone.changeText(this.text);
    return clone;
};