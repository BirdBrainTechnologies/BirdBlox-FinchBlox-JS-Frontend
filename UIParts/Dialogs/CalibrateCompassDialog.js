/**
 * A dialog for calibrating the compass. A video will give instructions and
 * the user will have the option to play the video again, calibrate the selected
 * compass, or cancel.
 * @param device - The device to be calibrated
 * @constructor
 */
function CalibrateCompassDialog() {
	let title = Language.getStr("CompassCalibrate");

  this.bits = DeviceHummingbirdBit.getManager().getDeviceCount();
  this.microbits = DeviceMicroBit.getManager().getDeviceCount();
  let count = this.bits + this.microbits;

	RowDialog.call(this, false, title, count, 0, 0);
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
  var robot;
  if (index < this.bits) {
    robot = DeviceHummingbirdBit.getManager().getDevice(index);
  } else {
    robot = DeviceMicroBit.getManager().getDevice(index - this.bits);
  }
	GuiElements.alert("Loading rows for the compass calibration dialog.");
  if (robot != null) {
		GuiElements.alert("Found a robot. " + robot.compassCalibrated);
    const button = RowDialog.createMainBnWithText(robot.listLabel, width, 0, y, contentGroup, function () {
      CalibrateCompassDialog.showVideo(robot);
      robot.calibrateCompass();
    });
		if (robot.compassCalibrated){
			GuiElements.alert("Adding checkmark");
			button.addSideTextAndIcon(VectorPaths.checkmark, null, robot.listLabel, null, null, Colors.green, false, false);
		} else if (robot.compassCalibrated == false) {
			button.addSideTextAndIcon(VectorPaths.letterX, null, robot.listLabel, null, null, Colors.red, false, false);
		}
  }
};

CalibrateCompassDialog.prototype.closeDialog = function() {
	RowDialog.prototype.closeDialog.call(this);
	GuiElements.removeVideos();
}

/**
 * Shows the instructional video appropriate to the device type.
 */
CalibrateCompassDialog.showVideo = function(robot) {
  var fileName = "Videos/MicroBit_Calibration.mp4";

  if (robot.getDeviceTypeId() == "hummingbirdbit") {
    fileName = "Videos/HummBit_Calibration.mp4";
  }

  const video = GuiElements.draw.video(fileName, robot.id);
};
