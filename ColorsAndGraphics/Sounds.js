function Sounds(callback) {
	Sounds.names = [];
	Sounds.durations = [];
	Sounds.loadNames(callback);
}

Sounds.loadNames=function(parentCallback){
	var request = "sound/names";
	var callback = function(response) {
		Sounds.names = response.split("\n")
		Sounds.names = Sounds.names.filter(function(n){ return n != "" }); 
		HtmlServer.sendRequest("server/log/LOG:Got_Names"+Sounds.names.length);
		for (var i = 0; i < Sounds.names.length; i++) {
			var request = "sound/duration/" + Sounds.getSoundName(i);
			var durationCallback = [];
			durationCallback[i] = function(duration) {
				HtmlServer.sendRequest("server/log/LOG:Got_duration:" + i + ":"+ Sounds.getSoundName(i));
				Sounds.durations[i] = duration;
				if(i == Sounds.names.length - 1) {
					parentCallback();
				}
			}
			HtmlServer.sendRequestWithCallback(request,durationCallback[i]);
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
