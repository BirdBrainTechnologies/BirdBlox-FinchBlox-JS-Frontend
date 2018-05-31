/**
 * Manages communication with a Finch
 * @param {string} name
 * @param {string} id
 * @constructor
 */
function DeviceFinch(name, id, RSSI) {
	DeviceWithPorts.call(this, name, id, RSSI);
}
DeviceFinch.prototype = Object.create(DeviceWithPorts.prototype);
Device.setDeviceTypeName(DeviceFinch, "finch", "Finch", "Finch");
DeviceFinch.prototype.constructor = DeviceFinch;

DeviceFinch.prototype.setAll = function(status, data) {
	const request = new HttpRequestBuilder("robot/out/setAll");
	request.addParam("type", this.getDeviceTypeId());
	request.addParam("id", this.id);
	request.addParam("data", data);
	HtmlServer.sendRequest(request.toString(), status, true);
};