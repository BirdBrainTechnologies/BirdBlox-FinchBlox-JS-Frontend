/**
 * Holds all the data necessary to show an OpenDialog, which includes a list of local files and the cloud account the
 * user is signed into (if any}.  A list of cloud files is downloaded later.
 * @param {string} jsonString - String representation of object containing the above information
 * @constructor
 */
function FileList(jsonString) {
  const object = JSON.parse(jsonString);

  this.localFiles = FileList.getSortedList(object.files);

  //this.localFiles = object.files;
  //if (this.localFiles == null) {
  //	this.localFiles = []
  //}

  this.signedIn = object.signedIn === true;
  if (!GuiElements.isAndroid) {
    // We only show this information on Android
    this.signedIn = false;
  }
  this.account = object.account;
  if (this.account == null || !this.signedIn) {
    this.account = null;
  }
}

/**
 * Gets the string to show in the Cloud tab.  Only relevant on Android.
 * @return {string}
 */
FileList.prototype.getCloudTitle = function() {
  if (this.account != null) {
    return this.account;
  }
  return Language.getStr("Cloud");
};

/**
 * Sort file names for display
 */
FileList.getSortedList = function(list) {
  var unsortedList = list;
  if (unsortedList == null) {
    unsortedList = [];
  }
  return unsortedList.sort(function(a, b) {
    //Sort case insensitive.
    //TODO: make this specific to language setting - must use correct language codes.
    return a.localeCompare(b, 'en', {
      'sensitivity': 'base',
      'numeric': 'true'
    });
  });
}
