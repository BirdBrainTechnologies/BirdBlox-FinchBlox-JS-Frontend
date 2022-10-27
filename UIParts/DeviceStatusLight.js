"use strict";

/**
 * A small colored circle that indicates the status of a robot or group of robots according to a statusProvider
 * which must have setStatusListener and getStatus functions
 * @param {number} x - The x coord of the light
 * @param {number} centerY - The y coord of the center of the light
 * @param {Element} parent - The group this light should add itself to
 * @param {*} statusProvider - Any object with the functions setStatusListener and getStatus
 * @constructor
 */
function DeviceStatusLight(x, centerY, parent, statusProvider) {
  const DSL = DeviceStatusLight;
  this.cx = x + DSL.radius;
  this.cy = centerY;
  this.parentGroup = parent;
  this.circleE = this.generateCircle();
  this.statusProvider = statusProvider;
  // Tells the statusProvider to call updateStatus any time its status changes
  this.statusProvider.setStatusListener(this.updateStatus.bind(this));
  // Updates this light to match the current status of the provider
  this.updateStatus(statusProvider.getStatus());
}

DeviceStatusLight.setConstants = function() {
  const DSL = DeviceStatusLight;
  DSL.greenColor = Colors.green;
  DSL.redColor = Colors.red;
  DSL.yellowColor = Colors.yellow;
  DSL.startColor = Colors.black;
  DSL.offColor = Colors.darkGray;
  DSL.radius = 6;
  DSL.updateInterval = 300;
};

/**
 * Draws the circle for the light
 */
DeviceStatusLight.prototype.generateCircle = function() {
  let DSL = DeviceStatusLight;
  return GuiElements.draw.circle(this.cx, this.cy, DSL.radius, DSL.startColor, this.parentGroup);
};

/**
 * Updates the color of the circle to correspond with the provided status
 * @param {DeviceManager.statuses} status
 */
DeviceStatusLight.prototype.updateStatus = function(status) {
  const DSL = DeviceStatusLight;
  let color = null;
  const statuses = DeviceManager.statuses;
  if (status === statuses.connected) {
    color = DSL.greenColor;
  } else if (status === statuses.oldFirmware) {
    color = DSL.yellowColor;
  } else if (status === statuses.incompatibleFirmware || status === statuses.disconnected) {
    color = DSL.redColor;
  } else {
    color = DSL.offColor;
  }
  GuiElements.update.color(this.circleE, color);
};

/**
 * Removes the light
 */
DeviceStatusLight.prototype.remove = function() {
  this.circleE.remove();
};
