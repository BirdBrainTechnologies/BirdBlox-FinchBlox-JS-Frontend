/**
 * Created by Tom on 6/14/2017.
 */
function DeviceHummingbird(name, id){
	DeviceWithPorts.call(this, name, id);
}
DeviceHummingbird.prototype = Object.create(DeviceWithPorts.prototype);
DeviceHummingbird.prototype.constructor = DeviceHummingbird;
Device.setDeviceTypeName(DeviceHummingbird, "hummingbird", "Hummingbird", "HB");
