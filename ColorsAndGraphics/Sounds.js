function Sounds(callback) {
	Sounds.names = [];
	Sounds.durations = [];
	Sounds.loadNames();
	Sounds.isDoneLoading = false;
	callback();
}

Sounds.loadNames=function(){
	var request = "sound/names";
	var callback = function(response) {
		Sounds.names = response.split("\n")
		HtmlServer.sendRequest("server/log/LOG:Got_Names"+Sounds.names.length);
		for (var i = 0; i < Sounds.names.length; i++) {
			var request = "sound/duration/" + Sounds.getSoundName(i);
			var callback = function(duration) {
				HtmlServer.sendRequest("server/log/LOG:Got_duration");
				Sounds.durations[i] = duration;
				if(i == Sounds.names.length - 1) {
					Sounds.isDoneLoading = true;
				}
			}
			HtmlServer.sendRequestWithCallback(request,callback);
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
