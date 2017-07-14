/**
 * Created by Tom on 7/8/2017.
 */
function DisplayBoxManager(){
	const DBM = DisplayBoxManager;
	DBM.boxes = [];
	for(let i = 0; i < 3; i++) {
		DBM.boxes[i] = new NewDisplayBox(i);
	}
	DBM.build();
}
DisplayBoxManager.build = function(){
	const DBM = DisplayBoxManager;
	DBM.boxes.forEach(function(box){
		box.build();
	});
};
DisplayBoxManager.displayText = function(message, positionString) {
	const DBM = DisplayBoxManager;
	if(positionString === "position1") {
		DBM.boxes[0].displayText(message);
	} else if(positionString === "position2") {
		DBM.boxes[1].displayText(message);
	} else if(positionString === "position3") {
		DBM.boxes[2].displayText(message);
	} else {
		DebugOptions.assert(false);
	}
};
DisplayBoxManager.hide = function(){
	const DBM = DisplayBoxManager;
	DBM.boxes.forEach(function(box){
		box.hide();
	});
};
DisplayBoxManager.updateZoom = function(){
	NewDisplayBox.updateZoom();
	DisplayBoxManager.boxes.forEach(function(box){
		box.updateZoom();
	})
};