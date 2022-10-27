/**
 * Displays a list of buttons for file manipulation.  Accessed by tapping the dots next to a file in an open dialog
 * @param {RowDialog} dialog - The dialog to reload when the files are changed
 * @param {string} file - The name of the file this option is for
 * @param {FileContextMenu.types} type - The type of context menu to show. Determines what options are available
 * @param {number} x1
 * @param {number} x2
 * @param {number} y1
 * @param {number} y2
 * @constructor
 */
function FileContextMenu(dialog, file, type, x1, x2, y1, y2) {
  this.file = file;
  this.dialog = dialog;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.type = type;
  this.showMenu();
}

FileContextMenu.setGraphics = function() {
  const FCM = FileContextMenu;

  /** @enum {number} */
  FCM.types = {
    localSignedIn: 1, // For when the user is looking at an open file and is signed into cloud storage
    localSignedOut: 2, // For when the user is looking at an open file and is signed out of cloud storage
    cloud: 3 // For when the user if looking at a cloud file
  };

  FCM.bnMargin = Button.defaultMargin;
  FCM.bgColor = Colors.lightGray;
  FCM.blockShift = 20;
  FCM.width = 115;
};

/**
 * Generates and presents the menu
 */
FileContextMenu.prototype.showMenu = function() {
  const FCM = FileContextMenu;
  this.group = GuiElements.create.group(0, 0);
  const layer = GuiElements.layers.overlayOverlay;
  const scrollLayer = GuiElements.layers.overlayOverlayScroll;
  const overlayType = Overlay.types.inputPad;
  this.bubbleOverlay = new BubbleOverlay(overlayType, FCM.bgColor, FCM.bnMargin, this.group, this, layer);
  this.menuBnList = new SmoothMenuBnList(this.bubbleOverlay, this.group, 0, 0, FCM.width, scrollLayer);
  this.menuBnList.markAsOverlayPart(this.bubbleOverlay);
  this.addOptions();
  const height = this.menuBnList.previewHeight();
  this.bubbleOverlay.display(this.x1, this.x2, this.y1, this.y2, FCM.width, height);
  this.menuBnList.show();
};

/**
 * Adds options and their behaviors to the menu
 */
FileContextMenu.prototype.addOptions = function() {
  const FCM = FileContextMenu;
  if (this.type === FCM.types.localSignedIn) {
    this.menuBnList.addOption("", function() {
      SaveManager.userExportFile(this.file);
      this.close();
    }.bind(this), this.createAddIconToBnFn(VectorPaths.share, Language.getStr("Share")));
  }
  if (this.type === FCM.types.localSignedIn || this.type === FCM.types.localSignedOut) {
    this.menuBnList.addOption("", function() {
      const dialog = this.dialog;
      SaveManager.userDuplicateFile(this.file, function() {
        dialog.reloadDialog();
      });
      this.close();
    }.bind(this), this.createAddIconToBnFn(VectorPaths.copy, Language.getStr("Duplicate")));
  }
  this.menuBnList.addOption("", function() {
    if (this.type === FCM.types.cloud) {
      const request = new HttpRequestBuilder("cloud/delete");
      request.addParam("filename", this.file);
      HtmlServer.sendRequestWithCallback(request.toString());
      this.close();
    } else {
      const dialog = this.dialog;
      SaveManager.userDeleteFile(false, this.file, function() {
        dialog.reloadDialog();
      });
      this.close();
    }
  }.bind(this), this.createAddIconToBnFn(VectorPaths.trash, Language.getStr("Delete")));
};

/**
 * Creates the function to add the icon to the button
 * @param {object} pathId - Object from VectorPaths
 * @param {string} text - Text to display on the button
 * @return {function} - type: Button -> ()
 */
FileContextMenu.prototype.createAddIconToBnFn = function(pathId, text) {
  return function(bn) {
    bn.addSideTextAndIcon(pathId, null, text, null, null, null, null, null, null, true, false);
  }
};

/**
 * Closes the menu
 */
FileContextMenu.prototype.close = function() {
  this.bubbleOverlay.hide();
  this.menuBnList.hide()
};
