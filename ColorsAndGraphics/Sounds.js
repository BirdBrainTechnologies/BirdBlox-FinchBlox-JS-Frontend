function Sounds() {
	Sounds.names = [];
	Sounds.durations = [];
	Sounds.loadNames();
}

Sounds.loadNames=function(){
	var request = "sound/names";
	var callback = function(response) {
		Sounds.names = response.split("\n");
		Sounds.names = Sounds.names.filter(function(n){ return n != "" });
		Sounds.durations = Array.apply(null, new Array(Sounds.names.length)).map(Number.prototype.valueOf,0);

		for (var i = 0; i < Sounds.names.length; i++) {
			const index = i;
			var request = "sound/duration/" + Sounds.getSoundName(i);
			var durationCallback = function(duration) {
				//HtmlServer.sendRequest("server/log/LOG:Got_duration:" + index + ":"+ duration);
				Sounds.durations[index] = duration;
			};
			HtmlServer.sendRequestWithCallback(request,durationCallback);
		}

	};
	HtmlServer.sendRequestWithCallback(request, callback);
};

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
	return Sounds.names.indexOf(soundName);
};
Sounds.checkNameIsValid=function(soundName){
	return Sounds.indexFromName(soundName)>=0;
};
