/**
 * Created by Tom on 6/14/2017.
 */
function DeviceWithPorts(name, id){
	Device.call(this, name, id);
}
DeviceWithPorts.prototype = Object.create(Device.prototype);
DeviceWithPorts.prototype.constructor = Device;
DeviceWithPorts.prototype.readSensor = function(status, sensorType, port){
	const request = new HttpRequestBuilder(this.getDeviceTypeId() + "/in");
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam("sensor", sensorType);
	HtmlServer.sendRequest(request.toString(), status);
};
DeviceWithPorts.prototype.setOutput = function(status, outputType, port, value, valueKey){
	const request = new HttpRequestBuilder(this.getDeviceTypeId() + "/out/" + outputType);
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam(valueKey, value);
	HtmlServer.sendRequest(request.toString(), status);
};
DeviceWithPorts.prototype.setTriLed = function(status, port, red, green, blue){
	const request = new HttpRequestBuilder(this.getDeviceTypeId() + "/out/triled");
	request.addParam("id", this.id);
	request.addParam("port", port);
	request.addParam("red", red);
	request.addParam("green", green);
	request.addParam("blue", blue);
	HtmlServer.sendRequest(request.toString(), status);
};