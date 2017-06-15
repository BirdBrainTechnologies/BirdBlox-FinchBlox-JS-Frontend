/**
 * Created by Tom on 6/14/2017.
 */
function DeviceFlutter(name, id){
	DeviceWithPorts.call(this, name, id);
}
DeviceFlutter.prototype = Object.create(DeviceWithPorts.prototype);
Device.setDeviceTypeName(DeviceFlutter, "flutter", "Flutter", "F");
DeviceFlutter.prototype.constructor = DeviceFlutter;
DeviceFlutter.prototype.setBuzzer = function(status, volume, frequency){
	var request = new HttpRequestBuilder(this.getDeviceTypeId() + "/out/buzzer");
	request.addParam("id", this.id);
	request.addParam("volume", volume);
	request.addParam("frequency", frequency);
	HtmlServer.sendRequest(request.toString(), status);
};
DeviceFlutter.getConnectionInstructions = function(){
	return "Press the \"find me\" button on your Flutter";
};