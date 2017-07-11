/**
 * Created by Tom on 7/6/2017.
 */
function TabletSensors(){
	const TS = TabletSensors;
	TabletSensors.clear();
	TabletSensors.requestAvailable();
}
TabletSensors.requestAvailable = function(){
	const request = new HttpRequestBuilder("device/availableSensors");
	HtmlServer.sendRequestWithCallback(request.toString(), function(response){
		TabletSensors.updateAvailable(response);
	});
};
TabletSensors.updateAvailable = function(sensorList){
	TabletSensors.clear();
	const sensors = TabletSensors.sensors;
	let list = sensorList.split("\n");
	if(sensorList === "") {
		list = [];
	}
	list.forEach(function(sensor){
		if(sensors[sensor] === false) {
			sensors[sensor] = true;
		}
	});
	CodeManager.updateAvailableSensors();
};
TabletSensors.addSensor = function(sensor){
	const TS = TabletSensors;
	if(TS.sensors[sensor] != null) {
		TS.sensors[sensor] = true;
		CodeManager.updateAvailableSensors();
		return true;
	}
	return false;
};
TabletSensors.removeSensor = function(sensor){
	const TS = TabletSensors;
	if(TS.sensors[sensor] != null) {
		TS.sensors[sensor] = false;
		CodeManager.updateAvailableSensors();
		return true;
	}
	return false;
};
TabletSensors.clear = function(){
	const sensors = TabletSensors.sensors = {};
	sensors.accelerometer = false;
	sensors.barometer = false;
	sensors.microphone = false;
	sensors.gps = false;
};