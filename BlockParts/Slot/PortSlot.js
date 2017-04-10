function PortSlot(parent, maxPorts) {
	DropSlot.call(this, parent, Slot.snapTypes.none);
	this.maxPorts = maxPorts;
}

PortSlot.prototype = Object.create(DropSlot.prototype);
PortSlot.prototype.constructor = PortSlot;

PortSlot.prototype.populateList=function(){
    this.clearOptions();
    for(let portNum = 1; portNum <= this.maxPorts; portNum++) {
        this.addOption(portNum.toString(), new SelectionData(portNum));
    }
};
PortSlot.prototype.duplicate=function(parentBlock){
    let clone = new PortSlot(parentBlock);
    clone.enteredData=this.enteredData;
    clone.changeText(this.text);
    return clone;
};