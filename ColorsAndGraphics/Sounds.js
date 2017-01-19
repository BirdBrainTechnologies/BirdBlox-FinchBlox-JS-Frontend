function Sounds() {
	Sounds.names = [];
	Sounds.durations = [];
	Sounds.loadNames();
}

Sounds.loadNames=function(){
	var request = "sound/names";
	var callback = function(response) {
		Sounds.names = response.split("\n")
		Sounds.loadDurations();
	};
	HtmlServer.sendRequestWithCallback(request, callback);
};

Sounds.loadDurations=function(){
	var callback = function(index, duration) {
		Sounds.durations[index] = duration;
	}
	for (var i = 0; i < Sound.names.length; i++) {
		var request = "sound/duration/" + Sounds.getSoundName(i);
		var callback = function(duration) {
			Sounds.durations[i] = duration;
		}
		HtmlServer.sendRequestWithCallback(request,callback);
	}	
}

Sounds.getSoundDuration=function(index){
	return Sounds.durations[index];
};

Sounds.getSoundName=function(index){
	return Sounds.names[index];
};
Sounds.getSoundCount=function(){
	return Sounds.names.length;
};
Sounds.indexFromName=function(soundName){
	return Sounds.names.indexOf(soundId);
};
Sounds.checkNameIsValid=function(soundName){
	return Sounds.indexFromName(soundName)>=0;
};
