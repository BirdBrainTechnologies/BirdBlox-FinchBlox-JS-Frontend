/**
 * A button with an arrow that shows/hides something.  Currently, this is just used for showing/hiding the palette on
 * small screens.  The button is not created until build() is called
 * @param {number} x - The x coord where the button should show up
 * @param {number} y - The y coord where the button should show up
 * @param {number} width - The width the button should have
 * @param {number} height - The height the button should have
 * @param {Element} parent - The group the button should be added to
 * @param {number} iconH - The height the icon should have
 * @constructor
 */
function ShowHideButton(x, y, width, height, parent, iconH) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.parent = parent;
  this.iconH = iconH * 0.75; // The arrow icon should actually be smaller than most other icons
  this.showFn = null;
  this.hideFn = null;
}

/**
 * The show/hide button is actually two buttons that change when one is tapped.  This function creates both of them
 * @param {boolean} isShowing - Whether the button should start in the "showing" state
 */
ShowHideButton.prototype.build = function(isShowing) {
  this.showBn = new Button(this.x, this.y, this.width, this.height, this.parent);
  this.showBn.addIcon(VectorPaths.show, this.iconH);
  this.hideBn = new Button(this.x, this.y, this.width, this.height, this.parent);
  this.hideBn.addIcon(VectorPaths.hide, this.iconH);

  // The callback functions are called when the buttons are pressed, but the button changes icon when released
  this.showBn.setCallbackFunction(this.showFn, false);
  this.hideBn.setCallbackFunction(this.hideFn, false);

  // Function to switch to the "hidden" mode
  let toggle1 = function() {
    this.showBn.hide();
    this.hideBn.show();
  }.bind(this);
  this.showBn.setCallbackFunction(toggle1, true);
  this.showBn.interrupt = function() {
    if (this.enabled && this.pressed) {
      this.pressed = false;
      this.setColor(false);
      toggle1();
    }
  };

  // Function to switch to the "showing" mode
  let toggle2 = function() {
    this.showBn.show();
    this.hideBn.hide();
  }.bind(this);
  this.hideBn.setCallbackFunction(toggle2, true);
  this.hideBn.interrupt = function() {
    if (this.enabled && this.pressed) {
      this.pressed = false;
      this.setColor(false);
      toggle2();
    }
  };

  if (isShowing) {
    this.showBn.hide();
  } else {
    this.hideBn.hide();
  }
};

/**
 * Sets the functions to call to show/hide the associated item
 * @param {function} showFn
 * @param {function} hideFn
 */
ShowHideButton.prototype.setCallbackFunctions = function(showFn, hideFn) {
  this.showFn = showFn;
  this.hideFn = hideFn;
};

/**
 * Removes the show/hide button
 */
ShowHideButton.prototype.remove = function() {
  this.showBn.remove();
  this.hideBn.remove();
};
