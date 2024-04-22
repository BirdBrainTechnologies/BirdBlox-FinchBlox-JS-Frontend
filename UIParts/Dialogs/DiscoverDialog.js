"use strict";

/**
 * A dialog for discovering and connecting to a certain type of robot
 * @param deviceClass - subclass of Device, type of robot to scan for
 * @constructor
 */
function DiscoverDialog(deviceClass) {
  let DD = DiscoverDialog;
  this.deviceClass = deviceClass;

  if (FinchBlox) {
    RowDialog.call(this, false, null, 0, 0, 0);
  } else {
    let title = Language.getStr("Connect_Device");
    RowDialog.call(this, false, title, 0, 0, 0);
    this.addCenteredButton(Language.getStr("Cancel"), this.closeDialog.bind(this));
    this.addHintText(deviceClass.getConnectionInstructions());
  }

  /** @type {Array<Device>} - The discovered devices to use as the content of the dialog */
  this.discoveredDevices = [];

  //Hatchling
  this.connectedDevices = []
  this.hasBeenShown = false

  /* If an update happens at an inconvenient time (like while scrolling), the dialog is not reloaded; rather
   * updatePending is set to true, the timer is started, and the reload occurs at a better time */
  this.updatePending = false;
  this.updateTimer = new Timer(1000, this.checkPendingUpdate.bind(this));
}
DiscoverDialog.prototype = Object.create(RowDialog.prototype);
DiscoverDialog.prototype.constructor = DiscoverDialog;

/**
 * Shows the dialog and starts the scan for devices
 * @inheritDoc
 */
DiscoverDialog.prototype.show = function() {
  const DD = DiscoverDialog;
  if (Hatchling && GuiElements.isPWA) {
    let device = DeviceHatchling.getManager().getDevice(0)
    console.log("*** DiscoverDialog show " + this.rowCount)
    console.log(device)
    console.log(this.discoveredDevices)
    if (device != null && device.connected) {
      //Show the connected device - user can scan if they disconnect
      console.log("***** skip the scan")
      this.connectedDevices = [device]
      this.discoveredDevices = []
      this.rowCount = 1
      RowDialog.prototype.show.call(this);
      this.hasBeenShown = true
      return
    } else if (this.discoveredDevices.length == 0 && this.hasBeenShown) {
      //No devices. Show new scan button
      console.log("*** display new scan button")
      this.connectedDevices = []
      this.rowCount = 1
      RowDialog.prototype.show.call(this);
      return
    } else if (this.discoveredDevices.length == 1) {
      //This is a weird case where the back end sends the device you are connecting before it is connected.
      console.log("*** one discovered device")
      RowDialog.prototype.show.call(this);
      return
    }
    this.hasBeenShown = true
  }
  RowDialog.prototype.show.call(this);
  this.discoverDevices();

};

/**
 * Starts the scan for devices and registers the dialog to receive updates when devices are detected
 */
DiscoverDialog.prototype.discoverDevices = function() {
  console.log("*** DiscoverDialog discoverDevices")
  let me = this;
  // Start the discover, and if the DeviceManager wants to know if it should ever restart a scan...
  this.deviceClass.getManager().startDiscover(function() {
    // Tell the device manager that it should scan again if the dialog is still open
    return this.visible;
  }.bind(this));
  // When a device is detected, update the dialog
  this.deviceClass.getManager().registerDiscoverCallback(this.updateDeviceList.bind(this));
};

/**
 * Checks if there is a pending update and updates the dialog if there is
 */
DiscoverDialog.prototype.checkPendingUpdate = function() {
  if (this.updatePending) {
    this.updateDeviceList(this.deviceClass.getManager().getDiscoverCache());
  }
};

/**
 * Reloads the dialog with the information from the new device list, or sets a pending update if the user is scrolling
 * or is touching the screen
 * @param {string} deviceList - A string representing a JSON array of devices
 */

var updateDeviceListCounter = 0;

DiscoverDialog.prototype.updateDeviceList = function(deviceList) {
  updateDeviceListCounter += 1;
  if (!this.visible) {
    return;
  } else if (TouchReceiver.touchDown || this.isScrolling()) {
    this.updatePending = true;
    this.updateTimer.start();
    return;
  }
  this.updatePending = false;
  this.updateTimer.stop();
  // Read the JSON
  this.discoveredDevices = this.deviceClass.getManager().fromJsonArrayString(deviceList);

  // Sort the devices by signal strength

  this.discoveredDevicesRSSISorted = this.discoveredDevices.sort(function(a, b) {
    return parseFloat(b.RSSI) - parseFloat(a.RSSI);
  });

  if (Hatchling) {
    let device = DeviceHatchling.getManager().getDevice(0)
    if (device != null) {
      this.connectedDevices = [device]
    }
  }

  //if ((updateDeviceListCounter % 40) == 0){
  this.reloadRows(this.discoveredDevicesRSSISorted.length + this.connectedDevices.length);
  //};

  //	this.reloadRows(this.discoveredDevices.length);
};

/**
 * Creates the connection button for each discovered device
 * @inheritDoc
 * @param {number} index
 * @param {number} y
 * @param {number} width
 * @param {Element} contentGroup
 */
DiscoverDialog.prototype.createRow = function(index, y, width, contentGroup) {

  const deviceList = this.connectedDevices.concat(this.discoveredDevices)
  const device = deviceList[index]
  console.log(deviceList)


  var color = Button.bg;
  if (FinchBlox && !Hatchling) {
    if (index % 2 == 0) {
      color = Colors.white;
    } else {
      color = Colors.fbGray;
    }
  }
  if (Hatchling) {
    color = Colors.white
  }

  const r = Hatchling ? 7 : null
  const m = Hatchling ? 2 : 0
  // TODO: use RowDialog.createMainBnWithText instead
  const button = new Button(0 + m, y + m, width - 2*m, RowDialog.bnHeight - 2*m, contentGroup, color, r, r);
  
  //In this case we will present the option to start a scan
  if (Hatchling && deviceList.length == 0) { 
    const iconH = button.height * 0.6
    /* This is how it was in the design files
    button.addSideTextAndIcon(VectorPaths.bdAdd, iconH, "CONNECT ANOTHER ROBOT", Button.defaultFont, Colors.ballyBrandBlueDark, Colors.ballyBrandBlue, false, true)
    GuiElements.update.stroke(button.icon.pathE, Colors.ballyBrandBlue, 3)
    button.updateBgColor(Colors.white, Colors.ballyBrandBlue)*/
    button.addColorIcon(VectorPaths.bdAdd, iconH, Colors.ballyBrandBlueLight)
    GuiElements.update.stroke(button.icon.pathE, Colors.ballyBrandBlueLight, 3)
    button.updateBgColor(Colors.ballyBrandBlue)
    button.setCallbackFunction(function() {
      console.log("Clicked CONNECT ANOTHER ROBOT")
      this.discoverDevices()
    }.bind(this), true)
    return
  }


  if (FinchBlox) {
    button.addDeviceInfo(device);
  } else {
    button.addText(device.listLabel);
  }
  const me = this;
  if (device.connected) {
    console.log("*** setting disconnect callback")
    button.setCallbackFunction(function() {
      //me.closeDialog()
      device.disconnect()
    }, true)
  } else {
    console.log("*** setting selectDevice callback")
    button.setCallbackFunction(function() {
      me.selectDevice(device);
    }, true);
  }
  button.makeScrollable();
};

/**
 * Connects to a device and closes the dialog
 * @param device
 */
DiscoverDialog.prototype.selectDevice = function(device) {
  console.log(device)
  this.deviceClass = DeviceManager.getDeviceClass(device);
  this.deviceClass.getManager().setOneDevice(device);
  if (!Hatchling) {
    this.closeDialog();
  }
};

/**
 * Stops the update timer and discover
 */
DiscoverDialog.prototype.closeDialog = function() {
  RowDialog.prototype.closeDialog.call(this);
  this.updateTimer.stop();
  this.deviceClass.getManager().stopDiscover();
};
