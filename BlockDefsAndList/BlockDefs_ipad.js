function b_DeviceShaken(x,y){
	PredicateBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device Shaken"));
}
b_DeviceShaken.prototype = Object.create(PredicateBlock.prototype);
b_DeviceShaken.prototype.constructor = b_DeviceShaken;

function b_DeviceLocation(x,y){
	ReporterBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device SSID"));
}
b_DeviceLocation.prototype = Object.create(ReporterBlock.prototype);
b_DeviceLocation.prototype.constructor = b_DeviceLocation;

function b_DevicePressure(x,y){
	ReporterBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device Pressure"));
}
b_DevicePressure.prototype = Object.create(ReporterBlock.prototype);
b_DevicePressure.prototype.constructor = b_DevicePressure;

function b_DeviceRelativeAltitude(x,y){
	ReporterBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device Relative Altitude"));
}
b_DeviceRelativeAltitude.prototype = Object.create(ReporterBlock.prototype);
b_DeviceRelativeAltitude.prototype.constructor = b_DeviceRelativeAltitude;

function b_DeviceAcceleration(x,y){
	ReporterBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device Acceleration"));
}
b_DeviceAcceleration.prototype = Object.create(ReporterBlock.prototype);
b_DeviceAcceleration.prototype.constructor = b_DeviceAcceleration;

function b_DeviceOrientation(x,y){
	ReporterBlock.call(this,x,y,"ipad");
	this.addPart(new LabelText(this,"Device Orientation"));
}
b_DeviceOrientation.prototype = Object.create(ReporterBlock.prototype);
b_DeviceOrientation.prototype.constructor = b_DeviceOrientation;
