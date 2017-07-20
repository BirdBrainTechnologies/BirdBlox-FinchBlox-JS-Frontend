/**
 * Static class contains metadata about images used in the app.  Currently not images are actually used since vectors
 * are better and don't take time to load.  Each record is an object and can be passed to UI-related functions
 * that need a reference to an image
 * @constructor
 */
function ImageLists() {
	const IL = ImageLists;
	IL.hBIcon = {};
	IL.hBIcon.lightName = "hBIconWhite";
	IL.hBIcon.darkName = "hBIconDarkGray";
	IL.hBIcon.width = 526;
	IL.hBIcon.height = 334;
}