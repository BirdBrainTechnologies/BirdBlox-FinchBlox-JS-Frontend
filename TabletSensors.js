/**
 * Static class keeps track of which sensors are available on the device
 */
function TabletSensors(){
	const TS = TabletSensors;
	TabletSensors.clear();
	TabletSensors.requestAvailable();
}

/**
 * Requests backend for a list of available sensors
 */
TabletSensors.requestAvailable = function(){
	const request = new HttpRequestBuilder("tablet/availableSensors");
	HtmlServer.sendRequestWithCallback(request.toString(), function(response){
		TabletSensors.updateAvailable(response);
	});
};

/**
 * Updates sensors to match those on list
 * @param {string} sensorList - A newline separated list of available sensors
 */
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

/**
 * Marks a sensor as available
 * @param {string} sensor
 * @return {boolean}
 */
TabletSensors.addSensor = function(sensor){
	const TS = TabletSensors;
	if(TS.sensors[sensor] != null) {
		TS.sensors[sensor] = true;
		CodeManager.updateAvailableSensors();
		return true;
	}
	return false;
};

/**
 * Marks a sensor as unavailable
 * @param {string} sensor
 * @return {boolean}
 */
TabletSensors.removeSensor = function(sensor){
	const TS = TabletSensors;
	if(TS.sensors[sensor] != null) {
		TS.sensors[sensor] = false;
		CodeManager.updateAvailableSensors();
		return true;
	}
	return false;
};

/**
 * Marks all sensors as unavailable.
 */
TabletSensors.clear = function(){
	const sensors = TabletSensors.sensors = {};
	sensors.accelerometer = false;
	sensors.barometer = false;
	sensors.microphone = false;
	sensors.gps = false;
};