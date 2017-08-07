# BirdBlox
1. [Overview (for backend developers)](#overview-for-backend-developers)
2. [Request list](#request-list)
3. [Overview (for frontend developers)](#overview-for-frontend-developers)

## Overview (for backend developers)

This is the code for the BirdBlox JavaScript frontend.
It is responsible for handling all the UI, block execution,
etc. for the BirdBlox application.  It is designed to run
inside of a containing application (iOS or Android apps, 
for example).  Anything the js code can't do by itself 
(issuing bluetooth commands, showing dialogs, saving files) is 
passed on to the containing application (backend) in the 
form of get/post requests.  To ensure the backend always has
an updated version of the frontend, clone the frontend's
git repo into the backend and to a pull when changes are made.
For debugging purposes, you can also set the frontend to be
automatically downloaded from git on launch, but this is
not used in the release version.

The responsibilities of the backend are the following:
* Display the HTML/JS frontend in some sort of webview
  that the user can interact with.
* Connect to and communicate with bluetooth-enabled robots.
* Provide sensor information (accelerometers, etc.) from the
  device to the frontend when requested.
* Display dialogs when requested.
* Play sounds when requested.
* Save, open, and delete files to app storage.
* Track which file is currently open.
* Record sounds to the currently open file
* Export/import files to/from other applications on the
  device.
* Save/access key-value pairs used to store settings.

The frontend uses GET/POST requests to send messages to the backend.
GET requests are normally used, but POST requests are used for saving files.
HTTP response codes are used to signal errors.  Unless otherwise specified,
any 200-type code can be used to signal success and any 400 or 500 code
can signal an error.

The backend sends messages to the frontend by directly calling a frontend
function in `CallbackManager.js`.  These functions return a boolean that is
`true` if the request succeeded and `false` if the request is malformed.
This is for debugging purposes only, so there is no need to check for and
handle the `false` case.

On iOS, we have switched to a more direct method of communication (instead of
GET/POST), where the JS calls swift functions to send messages.  It directly calls
the function `window.webkit.messageHandlers.serverSubstitute.postMessage`, passing
a JSON object containing the data that would normally be transferred using HTTP.
This enabled us to remove the server from the iOS backend.

## Request list
* [Bluetooth scanning](#bluetooth-scanning)
* [Robot blocks](#robot-blocks)
* [Tablet sensors](#tablet-sensors)
* [Dialogs](#dialogs)
* [Settings](#settings)
* [File management](#file-management)
* [Cloud storage](#cloud-storage)
* [Sounds](#sounds)
* [Error logging](#error-logging)
* [Miscellaneous](#miscellaneous)

### Bluetooth scanning

The backend and frontend communicate about specific Bluetooth robots 
using the robots' ids.  On Android, Mac Addresses are used as ids while
iOS provides its own unique Bluetooth ids.  All requests mentioning a 
specific robot will have an `id=[device_id]` parameter.

The frontend will initialize bluetooth scans using the `robot/startDiscover`
request.  These scans last for a reasonable amount of time as
to not drain the battery.  The backend then calls 
`CallbackManager.robot.discovered` with the list of discovered devices every
time a new device is found.  The frontend will call `robot/stopDiscover` to
request that a scan be ended.  If the scan times out before `stopDiscover` is
called, the backend calls `CallbackManager.robot.discoverTimeOut`, and
the frontend might restart the scan.  In any other case that a scan stops (including
when the frontend calls `robot/stopDiscover`), `CallbackManager.robot.stopDiscover`
is called.

#### /robot/startDiscover

    Request format:
        http://localhost:22179/robot/startDiscover?type=[robotType]
    Example request: 
        http://localhost:22179/robot/startDiscover?type=hummingbird

When received, the backend begins a scan of unpaired devices of the specified
type.  If it is currently scanning for a different type of device, that scan
is stopped and results are cleared.  If a scan of the specified type is already
occurring, no action is taken.

#### /robot/stopDiscover

    Request format:
        http://localhost:22179/robot/stopDiscover

Stops the current scan if any.

#### CallbackManager.robot.discovered

    Callback signature:
        CallbackManager.robot.discovered(robotTypeId: string, robotList: string) -> boolean
        robotList - A percent encoded JSON array of objects, each containing name and id fields
    Example call:
        CallbackManager.robot.discovered("flutter", encoded);
        where encoded is '[{"id":"my_id","name":"my_name"}]' percent encoded

Called any time a new device is discovered during a scan

#### CallbackManager.robot.discoverTimeOut

	Callback signature:
        CallbackManager.robot.discoverTimeOut(robotTypeId: string) -> boolean
    Example call:
        CallbackManager.robot.discoverTimeOut("hummingbird");

Tells the frontend that the discover timed out so the frontend has a chance to 
start the discover again.

#### CallbackManager.robot.stopDiscover

	Callback signature:
        CallbackManager.robot.stopDiscover(robotTypeId: string) -> boolean
    Example call:
        CallbackManager.robot.stopDiscover("hummingbird");

Tells the frontend that the discover stopped so the frontend has a chance to 
start the discover again.  Called any time a scan stops unless it timed out.

### Robot connection/disconnection

The frontend will tell the backend when to connect to or disconnect from a robot using the
`/robot/connect` and `robot/disconnect` requests. 
The backend maintains a list of devices the frontend wants to connect to, and
devices are instantaneously added or removed from that list as the frontend
requests.  The frontend has a similar list (visible to the user in the ConnectMultipleDialog)
and it is important that these lists on the frontend and backend are always in sync.
One the backend adds a device to this list (which we'll call the **connection list**),
it attempts to connect to the device itself (asynchronously).  The backend
then calls `CallbackManager.robot.updateStatus` with `isConnected = true` when the
device does connect and makes the same call with `isConnected = false` if the device
ever unexpectedly disconnects.  However, no devices should be removed from the connection
list without the frontend's knowledge.  If the frontend disconnects from a robot, it
is removed from the connection list and treated as if it is disconnected while
the actual disconnection occurs asynchronously.

On connection to the robot, the backend checks the firmware version.  If the firmware is out
of date but still compatible with the app it calls `CallbackManager.robot.updateFirmwareStatus`.
If the firmware is incompatible, it calls `CallbackManager.robot.disconnectIncompatible` and
immediately removes the robot from the connection list.  This is the only time where the
backend removes something from the list without the frontend making a request.

#### /robot/connect

    Request format:
        http://localhost:22179/robot/connect?id=[robotId]&type=[robotType]
    Example request: 
        http://localhost:22179/robot/connect?id=SomeMacAddress&type=flutter

Tells the backend to connect to a device.  If the device is on the devices found during the 
last scan, the backend adds it to the connection list and tries to connect to it. Otherwise
it returns a 404.

#### /robot/disconnect

    Request format:
        http://localhost:22179/robot/disconnect?id=[robotId]&type=[robotType]
    Example request: 
        http://localhost:22179/robot/disconnect?id=SomeMacAddress&type=flutter

Tells the backend to disconnect from a device.  If the device is on the connection list, it
removes it from the list and tries to disconnect from it.  Otherwise, it returns a 404.

#### CallbackManager.robot.updateStatus

    Callback signature:
        CallbackManager.robot.updateStatus(robotId: string, isConnected: boolean) -> boolean
        isConnected - Whether the backend is able to communicate with the robot
    Example call:
        CallbackManager.robot.updateStatus("myrobotid", true);

Tells the frontend whether a given robot is in good communication with the backend.
When the robot is first connected, the fronted assumes isConnected is false.
This function should be called with `isConnected = true` as soon as the robot
connects, and with `isConnected = false` if it subsequently unexpectedly disconnects.

#### CallbackManager.robot.updateFirmwareStatus

    Callback signature:
        CallbackManager.robot.updateFirmwareStatus(robotId: string, status: string) -> boolean
        status - ["upToDate"|"old"|"incompatible"]
    Example call:
        CallbackManager.robot.updateFirmwareStatus("myrobotid", "old");

Tells the frontend the status of the robot's firmware. Frontend initially assumes
firmware is up to date, so the function should be called with `status = "old"` if
the backend discovers that the firmware is old but compatible.  If the backend finds
the firmware to be incompatible, `CallbackManager.robot.disconnectIncompatible`
should be used instead.

#### CallbackManager.robot.disconnectIncompatible

    Callback signature:
        CallbackManager.robot.disconnectIncompatible(robotId: string, 
			oldFirmware: string, minFirmware: string) -> boolean
        oldFirmware - percent encoded version of firmware that was on the robot
        minFirmware - percent encoded minimum version of firmware the backend requires
    Example call:
        CallbackManager.robot.disconnectIncompatible("myrobotid", "1.3", "2.0");

Tells the frontend that a robot has been removed from the connection list because its
firmware was incompatible. The frontend will then remove the device from its own
connection list and notify the user of the incompatible firmware, providing an option
to view instructions to update the firmware.

#### /robot/showUpdateInstructions

    Request format:
        http://localhost:22179/robot/showUpdateInstructions?type=[robotTypeId]
    Example request: 
        http://localhost:22179/robot/showUpdateInstructions?type=hummingbird
		
When received, the backend redirects the user to a website containing instructions
to update the firmware of their device. The website may depend on the type of robot.
Currently this website is 
http://www.hummingbirdkit.com/learning/installing-birdblox#BurnFirmware

#### /robot/showInfo

    Request format:
        http://localhost:22179/robot/showFirmwareInfo?type=[robotTypeId]&id=[robotId]

If the firmware of the robot is up to date, this command presents an alert dialog with
the text and a single option "Dismiss":

	Hummingbird Peripheral
	Name: [robot name from mac address]
	Bluetooth Name: [actual gap name]
	Hardware Version: [hardware version]
	Firmware Version: [firmware version]
	
If the firmware isn't up to date, an additional line, `Firmware update available` is
included with options "Dismiss" and "Update firmware", which links to the update page.

### Robot blocks

These commands are used for blocks that control the inputs/outputs of the robots.
Some commands (like the tri-led command) are shared between different types of
robots.  Since the BLE command may vary by robot type, a parameter `type` is
provided for all commands.  A robot is is also provided.  The only exception is the
`/robot/stopAll` command, since it affects all robots.

On the backend, sensor values are regularly polled and cached so that the
sensor requests can be immediately responded to with the cached values. For outputs,
the has a state object which represents the state of all the outputs
of a given robot.  When an output request is made, the state is modified. It is then
regularly synced with the robot using a set all BLE command.  To prevent states from
being missed (for example, if the user turns the LED on and off quickly), the backend
actually tracks the current and pending states of the outputs, and only processes
a command when the relevant output for that command has the same value in both states.
Otherwise, the command waits in a queue.  More detail can be found in the backend code.

All robot commands should return an error response code if the specified device is
not connected.

#### /robot/stopAll

    Request format:
        http://localhost:22179/robot/stopAll

Turns off all the robot's outputs (LEDs, motors, servos, etc). On backends using the
direct call system, also empties the queue of unprocessed robot block requests.

#### /robot/in

    Request format:
        http://localhost:22179/robot/in?sensor=[s]&type=[t]&id=[id]&port=[p]
		type - ["sensor"|"temperature"|"distance"|"sound"|"light"|"soil"]
	Example request: 
        http://localhost:22179/robot/in?sensor=distance&type=flutter&id=robotid&port=2
	Example response:
		3.6

Returns the sensor value of the robot. Might be scaled differently depending on the
type of sensor

#### /robot/out/servo

    Request format:
        http://localhost:22179/robot/out/servo?angle=[a]&type=[t]&id=[id]&port=[p]
		angle - int from 0 to 180

#### /robot/out/motor

    Request format:
        http://localhost:22179/robot/out/motor?speed=[s]&type=[t]&id=[id]&port=[p]
		angle - int from -100 to 100
		
#### /robot/out/vibration

    Request format:
        http://localhost:22179/robot/out/vibration?intensity=[i]&type=[t]&id=[id]&port=[p]
		intensity - int from 0 to 100
		
#### /robot/out/led

    Request format:
        http://localhost:22179/robot/out/led?intensity=[i]&type=[t]&id=[id]&port=[p]
		intensity - int from 0 to 100
		
#### /robot/out/triled

    Request format:
        http://localhost:22179/robot/out/triled?red=[r]&green=[g]&blue=[b]&type=[t]&id=[id]&port=[p]
		red - int from 0 to 100
		green - int from 0 to 100
		blue - int from 0 to 100
		
#### /robot/out/buzzer

    Request format:
        http://localhost:22179/robot/out/triled?volume=[v]&frequency=[f]&type=[t]&id=[id]&port=[p]
		volume - int from 0 to 100
		frequency - int from 0 to 20000

### Tablet sensors

Different tablets have varying sensors that can be read using the sensor
blocks.  The frontend is told the reading and availability of sensors using the below requests
If the tablet doesn't have the necessary permissions or hardware for a request, it should
return an error and in the response body include a description of the error that can be shown
to the user.

#### /tablet/availableSensors

    Request format:
        http://localhost:22179/tablet/availableSensors
	Example response:
		"accelerometer\nbarometer\nmicrophone\ngps"
		
Returns a `"\n"` separated list of sensors the device supports.  For technical reasons,
iOS always returns `""` to this request and uses the callback functions to give this
information instead.

#### CallbackManager.tablet.availableSensors

    Callback signature:
        CallbackManager.robot.availableSensors(sensorList: string) -> boolean
        sensorList - percent encoded, "\n" separated list of sensors the device supports
    Example call:
        CallbackManager.robot.availableSensors(sensorList);
		where sensorList is the percent encoded form of "accelerometer\nbarometer\nmicrophone\ngps"

#### CallbackManager.tablet.addSensor

    Callback signature:
        CallbackManager.robot.addSensor(sensor: string) -> boolean
        sensor - ["accelerometer", "barometer", "microphone", "gps"]

Tells the frontend to add the sensor to the list of supported sensors.

#### CallbackManager.tablet.removeSensor

    Callback signature:
        CallbackManager.robot.removeSensor(sensor: string) -> boolean
        sensor - ["accelerometer", "barometer", "microphone", "gps"]

Tells the frontend to remove the sensor from the list of supported sensors.

#### /tablet/shake

    Request format:
        http://localhost:22179/tablet/shake
	Example responses:
		true
		false
		
Returns whether the tablet was shaken.  After returning true, it returns false on
subsequent calls until the tablet is shaken again.

#### /tablet/ssid

    Request format:
        http://localhost:22179/tablet/ssid
	Example responses:
		My WiFi
		null
		
Returns the name of the WiFi the tablet is connected to or `null` if it is not connected
to anything.

#### /tablet/pressure

    Request format:
        http://localhost:22179/tablet/pressure
	Example responses:
		104.3
		
Returns the a pressure in kilopascals

#### /tablet/altitude

    Request format:
        http://localhost:22179/tablet/altitude
	Example responses:
		-1.245
		
Returns the change in the device's altitude (in meters) since the app was opened. 
This is determined using the device's barometer

#### /tablet/orientation

    Request format:
        http://localhost:22179/tablet/altitude
	Example responses:
		Faceup
		Landscape: home button on left
		Landscape: home button on right
		Portrait: home button on bottom
		Portrait: home button on top
		Facedown
		In between
		
Returns a string indicating the device's orientation.

#### /tablet/acceleration

    Request format:
        http://localhost:22179/tablet/acceleration
	Example response:
		7.432 4.295 -1.568
		
Returns the change in the device's acceleration in the x, y, and z directions, separated
by spaces. This should be the total acceleration (including gravity)

#### /tablet/location

    Request format:
        http://localhost:22179/tablet/location
	Example response:
		100.456 70.823
		
Returns the latitude and longitude separated by spaces. Prompts for location permission
if not granted yet.

### Dialogs

There are three main types of dialogs: prompt, choice, alert. Prompt dialogs let the
user enter text. Choice dialogs give the user two options to choose from. Alert dialog
contain text and only one option.

Dialogs are presented in response to http requests. When the user responds, a function in
the CallbackManager should be called. Only one dialog will be requested at a time. Dialogs
that are presented for a reason other than the commands below do not need to call
CallbackManager functions.

#### /tablet/dialog

    Request format:
        http://localhost:22179/tablet/dialog?title=[t]&question=[q]&prefill=[pr]&placeholder=[pl]&selectAll=[sa]
		title - The text to show in the top of the dialog
		question - The text to show in the body of the dialog
		prefill - (possibly "") The text that should already be in the dialog
		placeholder - (possibly "") The text to show in gray when nothing has been entered yet
		selectAll - ["true"|"false"], whether the prefill text should start out as selected

Shows a dialog and calls `CallbackManager.dialog.promptResponded` when it is responded to.

#### /tablet/choice

	Request format:
        http://localhost:22179/tablet/choice?title=[t]&question=[q]&button1=[bn1]&button2=[bn2]
		title - The text to show in the top of the dialog
		question - The text to show in the body of the dialog
		button1 - The text to show on the first button
		button2 - (optional) The text to show on the second button 
		
Shows a choice dialog, or an alert dialog (if only one button is provided). Calls 
`CallbackManager.dialog.choiceResponded` when it is responded to.

#### CallbackManager.dialog.promptResponded

	Callback signature:
        CallbackManager.dialog.promptResponded(canceled: boolean, response: string) -> boolean
        canceled - Whether the dialog was closed without response
		response - (optional) Percent encoded response to the dialog. Included iff !canceled
    Example call:
        CallbackManager.dialog.promptResponded(true, "Hello");
		
#### CallbackManager.dialog.choiceResponded

	Callback signature:
        CallbackManager.dialog.choiceResponded(canceled: boolean, firstSelected: boolean) -> boolean
        canceled - Whether the dialog was closed without being answered
		firstSelected - Whether the first option was selected
    Example call:
        CallbackManager.dialog.choiceResponded(false, true);
		
If the dialog is an alert, the values of the booleans doesn't matter, but the most sensible
selection is `canceled = false` and `firstSelected = true`

### Settings

Settings provide a way for the frontend to store and read from a key/value settings system

#### /settings/get

    Request format:
		http://localhost:22179/settings/get?key=[key]
    Example request: 
		http://localhost:22179/settings/get?key=zoom
    Example response:
		1.5999999999999999
    
A 404 response is generated if the key does not have an assigned value.
    
#### /settings/set

    Request format:
		http://localhost:22179/settings/set?key=[key]&value=[value]
    Example request: 
		http://localhost:22179/settings/set?key=zoom&value=1

### File management

These commands deal with creating/renaming/copying/deleting/listing locally stored files.
The backend always keeps track of the currently open file, so it can be reopened
if the app is closed in the background due to lack of memory.  Files are autosaved
as the user edits them, and are created and managed through an open dialog on the screen.

Some characters are not valid for file names.  They include `\\/:*?<>|.\n\r\0\"` and
should be replaced with `_` on import. No files with illegal characters should be present
locally.

Some file management commands can also be used to manage recordings. These requests have
a `type` parameter with a value of either `"file"` or `"recording"`. Recordings have
the same restrictions for valid names.

#### CallbackManager.data.open

	Callback signature:
        CallbackManager.data.open(fileName: string, data: string) -> boolean
        fileName - percent encoded name to show in the title
		data - percent encoded XML data of the file

Tells the frontend to load up the data from a file.  Called during imports,
on app startup (if the project was left open in the background), op when requested
using `/data/open`.
		
#### CallbackManager.data.filesChanged

	Callback signature:
        CallbackManager.data.filesChanged() -> boolean
		
Tells the frontend that the list of locally stored files has changed. Refreshes the
UI's list of files.

#### CallbackManager.data.markLoading

	Callback signature:
        CallbackManager.data.markLoading() -> boolean

Tells the frontend to close the open dialog and show "Loading..." in the title
bar.  Called when the frontend is in the process of opening a file.
		
#### /data/files

	Request format:
		http://localhost:22179/data/files
    Example response:
		{"files":["project1","project2"],"signedIn":true,"account":"email@something.something"}

Returns a JSON object with an array of file names (key="file"). On Android, it
also includes whether the user is signed in to cloud storage (key="signedIn")
and if so, the account they are signed in to (key="account").  Note that the
list of files includes only local files.  The cloud storage related data is needed
for the tab at the top of the Open dialog.

#### /data/open

	Request format:
		http://localhost:22179/data/open?filename=[fn]

Tells the backend to open the specified file. The backend responds to this request
quickly, with 200 if the file exists, or en error otherwise. It can then take as
much time as it needs to get the project data, which it returns using
`CallbackManager.data.open`.  Stores `filename` as the currently open file.

#### /data/close

	Request format:
		http://localhost:22179/data/close

Tells the backend that there is no longer any file open.  Triggered when the user
opens the OpenDialog

#### /data/new

	Request format:
		http://localhost:22179/data/new?filename=[fn]
		
Tells the backend to create a new file with the specified name. If the name is in use
or invalid, the backend should respond with an error.

#### /data/rename

	Request format:
		http://localhost:22179/data/rename?oldFilename=[of]&newFilename=[nf]&type=[t]
		type - ["file"|"recording"]
		
Tells the backend to rename the file. If the file does not exist, an error should
be returned.  If `oldFilename` equals `newFilename`, no action should be performed.
If `newFilename` is in use or invalid, the backend should signal an error.
Behavior is similar for recordings.

#### /data/delete

	Request format:
		http://localhost:22179/data/delete?filename=[fn]&type=[t]
		type - ["file"|"recording"]

Tells the backend to delete the file/recording. Throws an error if the file does not
exist.

#### /data/duplicate

	Request format:
		http://localhost:22179/data/duplicate?filename=[fn]&newFilename[nf]
		
Creates a copy of the file with the specified name. Throws an error if `newFilename`
is in use or invalid

#### /data/export

	Request format:
		http://localhost:22179/data/delete?filename=[fn]&tlx=[#]&tly=[#]&brx=[#]&bry=[#]
		type - ["file"|"recording"]
		tlx - x coord of top left point where export sheet should appear
		tly - y coord of top left point where export sheet should appear
		brx - x coord of bottom right point where export sheet should appear
		bry - y coord of bottom right point where export sheet should appear

Exports the specified file. On iOS, coords are used to determine sheet location.

#### /data/getAvailableName

	Request format:
		http://localhost:22179/data/getAvailableName?filename=[fn]&type=[t]
		type - ["file"|"recording"]
	Example response:
		{"availableName":"my file (2)", "alreadySanitized":true, "alreadyAvailable":false
		
Checks if the provided file name would be valid for a new file/recording. Returns a JSON
object with a close (or identical) name that is valid (key="availableName"), and
booleans indicating if the initial name contained no illegal characters and was not in
use already (keys "alreadySanitized" and "alreadyAvailable", respectively). Both booleans
are true iff the available name equals the initial name.

#### /data/autoSave

	POST Request format:
		http://localhost:22179/data/autoSave
	POST request body includes XML data
		
Sends the data from the currently open file to the backend so it can be saved.  Called
once every 15 seconds and whenever an edit is made.

### Cloud storage

On iOS, cloud storage is handled using the system's UI, while on Android, the BirdBlox
app provides its own UI for managing cloud storage.  The `cloud/showPicker` request is
for iOS and shows this UI, while the other cloud requests are for Android.

#### /cloud/showPicker

	Request format:
		http://localhost:22179/cloud/showPicker

Tells the backend to show the cloud picker UI. Called from the open dialog. When a file
is selected from the UI, it should be opened with `/data/open`.

#### /cloud/signIn

	Request format:
		http://localhost:22179/cloud/signIn
		
Begins Dropbox authentication

#### /cloud/signOut

	Request format:
		http://localhost:22179/cloud/signIn
		
Signs out of Dropbox account

#### /cloud/list

	Request format:
		http://localhost:22179/cloud/list
	Example response:
		{"files":["project1","project2"]}
		
Returns a JSON object with “files” = a JSON array of filenames on the user's cloud storage

#### /cloud/download

	Request format:
		http://localhost:22179/cloud/download?filename=[fn]

Attempts to download the given file.  If there is a name conflict, presents the user 
with three options: cancel, rename, and overwrite.  If they choose rename and enter 
a conflicting name, shows the same dialog again.  If the download is not canceled, 
shows a dialog box with a cancel option and a loading bar. If an error occurs, change 
the text of the dialog to notify the user of the error.  They will then have to 
select “cancel” to continue.  If the file specified does not exist, or there is no 
internet connection, presents a dialog indicating this.  This command 
only returns a response when there is no cloud account connected.

#### CallbackManager.cloud.downloadComplete

	Callback signature:
        CallbackManager.data.open(filename: string) -> boolean
        filename - percent encoded name of the file that downloaded

Tells the frontend that a file just finished downloading
		
#### CallbackManager.cloud.signIn

	Callback signature:
        CallbackManager.data.signIn() -> boolean

Tells the frontend that the user added a Dropbox account.  Called only once the account
name is known, so it can be requested and displayed.
		
#### CallbackManager.cloud.filesChanged

	Callback signature:
        CallbackManager.cloud.filesChanged(newList: string) -> boolean
		newList - Percent encoded JSON object with list of new files
	Example call:
		CallbackManager.cloud.filesChanged(newList)
		where newList is the percent encoded form of: {"files":["project1","project2"]}

Notifies the frontend that the files in the cloud list have changed 
(when an upload completes, for example) and includes a JSON object with the new files	
		
#### /cloud/upload

	Request format:
		http://localhost:22179/cloud/upload?filename=[fn]

Uploads a file from the user’s device to the cloud.  Similarly to download, 
it prompts for name conflicts and display a loading bar for upload, 
providing the user with an option to cancel.  Calls 
CallbackManager.cloud.filesChanged() when complete

#### /cloud/rename

	Request format:
		http://localhost:22179/cloud/rename?filename=[fn]
		
Presents a dialog for the user to input a name.  Re-prompts the user if the name is 
invalid or taken.  Calls CallbackManager.cloud.filesChanged() if the file is 
ultimately renamed.

#### /cloud/delete

	Request format:
		http://localhost:22179/cloud/delete?filename=[fn]

Presents a dialog to confirm deletion, then deletes the file from cloud storage.
Calls CallbackManager.cloud.filesChanged() if the file is ultimately deleted

### Sounds

There are 3 main types of sounds: UI sounds (the snap noise when blocks connect), 
sound effects (the built in sounds controlled by the sound block), and recordings
(sounds created by the user).  These commands handle sound playback.
File management for recordings is handled by /data commands, while recording
creation uses /sound/recording commands.  UI sounds are stored in the frontend's
`SoundsForUI` folder, while sound effects are stored in `SoundClips`.

#### /sound/names

	Request format:
		http://localhost:22179/sound/names?type=[t]
		type - ["effect"|"recording"]
	Example response:
	    "alarm\nbell\nbark"

Returns a list of sound effects or recordings, separated by new lines (without
file extensions)

#### /sound/stopAll

	Request format:
		http://localhost:22179/sound/stopAll

Stops all currently running sounds of all types

#### /sound/duration

	Request format:
		http://localhost:22179/sound/duration?filename=[fn]&type=[t]
		type - ["effect"|"recording"]
	Example response:
	    6500

Gets the length of the sound in milliseconds

#### /sound/play

	Request format:
		http://localhost:22179/sound/play?filename=[fn]&type=[t]
		type - ["effect"|"recording"|"ui"]

Plays the sound. Does not stop previous sounds.

#### /sound/note

	Request format:
		http://localhost:22179/sound/note?note=[n]&duration=[d]
		note - int
		duration - number (time in ms)

#### /sound/recording/start

	Request format:
		http://localhost:22179/sound/recording/start
	Example responses:
        Started
        Permission denied
        Requesting permission

Attempts to start recording in the current project. Returns a 200 response
with either `Started`, `Requesting permission`, or `Permission denied`,
and attempts to ask for recording permissions from the user, if required

#### /sound/recording/stop

	Request format:
		http://localhost:22179/sound/recording/stop

Stops and saves the current recording

#### /sound/recording/pause

	Request format:
		http://localhost:22179/sound/recording/pause

Pauses recording so it can be resumed and saved

#### /sound/recording/unpause

	Request format:
		http://localhost:22179/sound/recording/unpause

Continues recording a paused recording

#### /sound/recording/discard

	Request format:
		http://localhost:22179/sound/recording/discard

Deletes the current recording. Does nothing if no recordings are being created

#### CallbackManager.sounds.recordingEnded

	Callback signature:
        CallbackManager.sounds.recordingEnded() -> boolean

Tells the frontend that recording has stopped unexpectedly. Called if the user
navigates away from the app or receives a phone call while recording.

#### CallbackManager.sounds.recordingsChanged

	Callback signature:
        CallbackManager.sounds.recordingsChanged() -> boolean

Tells the frontend that the list of recordings has changed. This generally
does not need to be called after `/sound/recording/stop` unless there is
some delay before the recordings are saved

#### CallbackManager.sounds.permissionGranted

	Callback signature:
        CallbackManager.sounds.permissionGranted() -> boolean

Tells the frontend that recording permissions have just been granted

### Error logging

When the JS encounters an error, it uses these commands to log it in the backend.
The user can send these logs to use by long pressing the settings icon and selecting
"Send error logs".

#### /debug/log

	POST Request format:
		http://localhost:22179/debug/log
		POST Body: error information

Called when the frontend encounters an error.  The POST body includes a stack trace
of the error.  When called, the backend appends the information to a log file, with
a newline above and below the log.
If the size of the file exceeds 40 kb, the backend deletes the first half of the
file.

#### /debug/shareLog

	Request format:
		http://localhost:22179/sound/debug/shareLog

When called, the frontend shows a share sheet for the error log file. If there
is no log file yet, it creates a new one with the first line `BEGIN ERRROR LOG`.

### Miscellaneous

#### /properties/os

	Request format:
		http://localhost:22179/properties/os
	Example responses:
	    Android 6.0
	    Kindle 5.0
	    iOS 7.0

Returns the version of the OS, starting with "iOS" for iOS devices,
"Kindle" for all kindles, and "Android" for all other Android devices.

#### /properties/dims

	Request format:
		http://localhost:22179/properties/dims
	Example response:
	    10.5 6.5

Returns the width and height of the screen in cm, separated by spaces

#### /ui/contentLoaded

	Request format:
		http://localhost:22179/ui/contentLoaded

Tells the backend that the frontend's UI has loaded, so it can do any additional
setup.  No callbacks should be called until the content is laoded. This is a good
time to call `CallbackManager.data.open`.

#### CallbackManager.echo

	Callback signature:
        CallbackManager.sounds.echo(request: string) -> boolean
        request - A percent encoded HTTP request
    Example call:
        CallbackManager.sounds.echo(request);
        where request is a percent encoding of "prompt/?title=Some&question=Thing"

Called when the backend needs to tell the frontend to make a request to the backend.
Sometimes desirable, apparently.  The request parameter must be a percent encoded
request, and that request must have its parameters further percent encoded.
The request should contain everything that would normally follow `http://localhost:22179/`

## Overview (for frontend developers)
1. [UI Overview](#ui-overview)
2. [Block execution](#block-execution)
3. [Defining Blocks](#defining-blocks)
4. [Data types](#data-types)
5. [Categories](#categories)

Before reading this section, you may want to read the [overview for 
backend developers](#overview-for-backend-developers) and the 
[Bluetooth pairing system](#bluetooth-pairing-system) to understand
how the backend will be interacting with the application.

### UI Overview

All the UI for the frontend is generated dynamically when the application
is loaded.  In fact, the only HTML file in the project consists primarily
of script tags linking to the .js files, and a single SVG tag, which 
the rest of the UI is housed within.  Using an SVG instead of a canvas
or other html elements means that the interface is sharp on high-resolution
screens and looks the same on all devices.

For faster loading, there are two HTML files: `HummginbirdDragAndDrop2.html`
is used for testing the frontend on a computer and loads all the .js files
individually.  `HummingbirdDragAndDrop.html` only loads the `all.js` file,
which is a concatenation of all the files referenced in
`HummginbirdDragAndDrop2.html`, in order. `all.js` is generated by running
`appender.py`, which should be run before each commit, as it is the only
`.js` file the backend will see.

The UI initializes starting from the file GuiElements.js.  A number
of groups are created as layers for the UI, and then GuiElements
goes through two initialization phases.  During the first, GuiElements
sets and computes the values of constants (elements widths, etc.) which
are then used during the second phase when elements of the UI are actually
drawn.  This means that constants set in the first phase (for example
the width of the sidebar) can be used by other classes during the drawing
phase, even if they appear before the class where the constant was set.
Since classes in JS are essentially functions, the constant setting
phase of most classes is triggered by running a sub-function called 
setGraphics or setConstants, then the drawing phase is triggered 
by running the class's function itself.  See BlockPalette.js for an 
example of this.  All constant values used in the UI (block dimensions,
colors, fonts, etc.) are stored in a SetConstants or a similar function.
No values are hardcoded into the main code.

### Block execution

Most messages passed to blocks (stop, flag, broadcast events, etc.) are
passed recursively.  They originate in CodeManager.js, which calls
TabManager.js (which deals with the tab bar at the top of the screen)
It then passes the message to all its tabs.  Each tab calls functions
in that tab's BlockStacks.  Each BlockStack in turn tells the first Block
in that stack, which tells the next block, etc.  At the same time, Blocks
pass messages to their Slots and BlockSlots (found in loops and if statements).
Slots pass messages to the Blocks connected to them, and BlockSlots to the 
first Block within them.

Block execution occurs similarly, with a timer (housed in CodeManager) 
firing repeatedly and triggering updates in each Tab, BlockStack, and
whichever block is currently executing within that stack.  Each BlockStack has a
pointer to the currently executing Block within it.  When a Block's execution
is updated using Block.updateRun().  For Command Blocks (blocks which are
rectangular and don't return a value), this function returns the next Block
to run.  For Reporter and Predicate Blocks (which return a value), the
updateRun() function returns true/false to indicate if it is still
running.  

### Defining Blocks

Blocks are defined in the various BlockDefs files for each category.
These definitions determine how the Block looks and what it does
when executed.  

When the Block is told to update, it first updates all of the Blocks
in its Slots.  When they have finished, the Block runs Block.startAction().
This function defines the Block's actual behavior and is overridden by
classes derived from the Block class.  It returns `false` if the
Block is done executing, and `true` if it still needs to be updated.
Block.updateAction() is called on subsequent passes, until the Block
finally returns `false`.  

Here's an example from the Wait Block (defined in BlockDefs_control.js)

```javascript
function B_Wait(x, y) {
    // Derived from CommandBlock
    // Category ("control") determines colors
	CommandBlock.call(this, x, y, "control");
	// Build Block out of things found in the BlockParts folder
	this.addPart(new LabelText(this, "wait"));
	this.addPart(new NumSlot(this, "NumS_dur", 1, true)); // Must be positive.
	this.addPart(new LabelText(this, "secs"));
}
B_Wait.prototype = Object.create(CommandBlock.prototype);
B_Wait.prototype.constructor = B_Wait;
/* Records current time. */
B_Wait.prototype.startAction = function() {
    // Each Block has runMem to store information for that execution
	const mem = this.runMem;
	mem.startTime = new Date().getTime();
	// Extract a positive value from first slot
	mem.delayTime = this.slots[0].getData().getValueWithC(true) * 1000;
	return new ExecutionStatusRunning(); //Still running
};
/* Waits until current time exceeds stored time plus delay. */
B_Wait.prototype.updateAction = function() {
	const mem = this.runMem;
	if (new Date().getTime() >= mem.startTime + mem.delayTime) {
		return new ExecutionStatusDone(); //Done running
	} else {
		return new ExecutionStatusRunning(); //Still running
	}
};
```
Here's an example of a reporter with a DropSlot
```javascript
function B_Split(x, y) {
    // Split is a ReporterBlock that returns a list
	ReporterBlock.call(this, x, y, "operators", Block.returnTypes.list);
	this.addPart(new LabelText(this, "split"));
	// Add parts with default values
	this.addPart(new StringSlot(this, "StrS_1", "hello world"));
	this.addPart(new LabelText(this, "by"));

    // New DropSlot which numbers, strings, and bools can snap to
	const inputType = EditableSlot.inputTypes.any;
	const snapType = Slot.snapTypes.numStrBool;
	const data = new SelectionData("whitespace", "whitespace");
	const dS = new DropSlot(this, "DS_separator", inputType, snapType, data);
	// Add a special option that tells InputPad to show prompt dialog
	dS.addEnterText("Edit text");
	dS.addOption(new SelectionData("letter", "letter"));
	dS.addOption(new SelectionData("whitespace", "whitespace"));
	this.addPart(dS);
}
B_Split.prototype = Object.create(ReporterBlock.prototype);
B_Split.prototype.constructor = B_Split;
/* Returns a list made from splitting the string by the provided character. */
B_Split.prototype.startAction = function() {
	const string1 = this.slots[0].getData().getValue();
	const splitD = this.slots[1].getData();
    //...
    // Code which sets dataArray
    //...
    // Return result
	return new ExecutionStatusResult(new ListData(dataArray));
};
```

In summary, `this.slots[i].getData()` is used to access data from Slots,
`this.runMem` is temporary storage that persists during a Block's execution,
and `ExecutionStatusResult` is used to return a value.

Global variables (like `tempo` for sounds) are all stored in 
CodeManager.js.

### Data types

Data in BirdBlox is automatically cast to strings, numbers, or booleans
as the connections between blocks require.  For example, if the string
"3" is stored in a variable and the number 1 is added to it with the 
addition block, "3" is automatically converted to 3, which one is added
to, returning 4.  To enable this, a number of Data classes are used including
StringData, NumData, BoolData, ListData (for arrays), and SelectionData 
(used internally when picking from DropSlots).  

Each Data class has functions
`.asNum()`, `.asString()`, `.asList()`.  So in theory, a ListData
could be converted into a BoolData, for example.  However, while all conversions 
will successfully execute, conversions that make no sense are marked as
invalid by setting `.isValid` to false.

All values stored in Slots and returned by Blocks are wrapped in these
Data classes.  To extract these values, call `.getValue()`, or if
you are not sure that the data is the correct type (a NumData, for example),
you can call `data.AsNum().getValue()` to be sure that a valid number
will be returned.  

NumData also has special functions 
`.getValueInR(num min, num max, bool positive, bool integer)` and
`.getValueWithC(bool positive, bool integer)` to get a number in a 
certain range or with specific constraints, respectively.  Note that
slots such as NumSlots and BoolSlots automatically take care of running
`.asNum()` or `.asBool()` when `slots[i].getData()` is called.  However,
if your number must be in a specific range or be an integer, `.getValueWithC`
still should be used instead of `.getValue()`.

### Categories

To add a new Block to a category, simply open BlockList.js and add
an entry in the corresponding `BlockList.populateCat_[category name]()`
function.  Blocks will appear in order.

To reorder categories, adjust the code in the `BlockList()` function in 
BlockList.js to reflect the new ordering.

To change the color of a category, check out the `Colors.setCategory()`
function in Colors.js 
