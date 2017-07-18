/**
 * Created by Tom on 7/17/2017.
 */
function FileList(jsonString) {
	const object = JSON.parse(jsonString);
	this.localFiles = object.files;
	if (this.localFiles == null) {
		this.localFiles = []
	}
	this.signedIn = object.signedIn === true;
	if (!GuiElements.isAndroid) {
		this.signedIn = false;
	}
	this.account = object.account;
	if (this.account == null || !this.signedIn) {
		this.account = null;
	}
}
FileList.prototype.getCloudTitle = function(){
	if (this.account != null) {
		return "Cloud - " + this.account;
	}
	return "Cloud";
};