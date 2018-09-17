/**
 * A dialog for calibrating the compass. A video will give instructions and
 * the user will have the option to play the video again, calibrate the selected
 * compass, or cancel.
 * @param device - The device to be calibrated
 * @constructor
 */
function CalibrateCompassDialog(deviceClass) {
  this.deviceClass = deviceClass;

	let title = Language.getStr("CompassCalibrate");
  let curDeviceCnt = this.deviceClass.getManager().getDeviceCount();
	RowDialog.call(this, false, title, curDeviceCnt, 0, 0);
  this.addCenteredButton("Instructions", this.showVideo.bind(this));
	this.addCenteredButton(Language.getStr("Done"), this.closeDialog.bind(this));

}
CalibrateCompassDialog.prototype = Object.create(RowDialog.prototype);
CalibrateCompassDialog.prototype.constructor = CalibrateCompassDialog;

/**
 * Creates a row for each device that could be calibrated.
 * @inheritDoc
 * @param {number} index
 * @param {number} y
 * @param {number} width
 * @param {Element} contentGroup
 */
CalibrateCompassDialog.prototype.createRow = function(index, y, width, contentGroup) {
  let robot = this.deviceClass.getManager().getDevice(index);
  RowDialog.createMainBnWithText(robot.name, width, 0, y, contentGroup, function () {
    robot.calibrateCompass();
  });
};

/**
 * Shows the instructional video appropriate to the device type.
 */
CalibrateCompassDialog.prototype.showVideo = function() {
  var fileName = "Videos/MicroBit_Calibration.mp4";

  if (this.deviceClass == DeviceHummingbirdBit) {
    fileName = "Videos/HummBit_Calibration.mp4";
  }

  const video = GuiElements.draw.video(fileName);
};
