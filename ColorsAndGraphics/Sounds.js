//Static.  Holds constant values for colors used throughout the UI (lightGray, darkGray, black, white)

function Sounds() {
	Sounds.names = [];
	Sounds.durations = [];
	Sounds.names.push("people talking");
	Sounds.durations.push(1000);
	Sounds.names.push("hiss");
	Sounds.durations.push(500);
	Sounds.names.push("bell");
	Sounds.durations.push(700);
	Sounds.ids=[];
	Sounds.loadIds();
}
Sounds.loadIds=function(){
	Sounds.ids=[];
	for(var i=0;i<Sounds.names.length;i++) {
		Sounds.ids[i]=Sounds.names[i].replace(" ", "_").toLowerCase();
	}
};
Sounds.getSoundDuration=function(index){
	return Sounds.durations[index];
};
Sounds.getSoundId=function(index){
	return Sounds.ids[index];
};
Sounds.getSoundName=function(index){
	return Sounds.names[index];
};
Sounds.getSoundCount=function(){
	return Sounds.names.length;
};
Sounds.indexFromId=function(soundId){
	return Sounds.ids.indexOf(soundId);
};
Sounds.checkIdIsValid=function(soundId){
	return Sounds.indexFromId(soundId)>=0;
};