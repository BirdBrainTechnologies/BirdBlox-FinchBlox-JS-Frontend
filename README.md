# BirdBlox
1. [Overview](#overview)
2. [Bluetooth pairing system](#bluetooth-pairing-system)
3. [List of requests](#list-of-requests)

## Overview

This is the code for the BirdBlox JavaScript frontend.
It is responsible for handling all the UI, block execution,
etc. for the BirdBlox application.  It is designed to run
inside of a containing application (iOS or Android apps, 
for example).  Anything the js code can't do by itself 
(issuing bluetooth commands, showing dialogs, etc.) is 
passed on to the containing application (backend) in the 
form of get/post requests.

The responsibilities of the backend are the following:
* Display the HTML/JS frontend in some sort of webview
  that the user can interact with.
* Re-download the frontend each time the app is opened,
  if an internet connection is present.
* Cache the frontend locally, so the app can be used 
  without an internet connection.
* Connect to and communicate with bluetooth-enabled robots
* Provide sensor information (accelerometers, etc.) from the
  device to the frontend when requested.
* Display dialogs when requested.
* Play sounds when requested.
* Save, open, and delete files to app storage.
* Export/import files to/from other applications on the
  device.
* Save/access key-value pairs used to store settings

Communication between the frontend and backend occurs primarily
through get requests issued by the frontend.  Post requests
are used for save files, and occasionally the backend directly
calls JS functions in the frontend when communication in the 
reverse direction is required.

## Bluetooth pairing system

The backend and frontend communicate about specific Bluetooth devices 
using the devices' names.  To ensure consistent naming, the backend
should create a list of encountered Bluetooth device ids and their assigned names
When a device is discovered, the backend should add its unique id to 
the list, along with its name.  If a device already has that name,
the second device should have a "2" appended to it, etc. to ensure
that all devices the backend has seen have a unique name.

The backend and frontend will use the names on this list to refer to
specific devices.  A device's name on the list should be changed only
when the frontend issues a "rename hummingbird" request.  Anywhere
[HB name] is used throughout this document, it is referring to the name
on this list.

The frontend will also initialize bluetooth scans using the `discover`
request.  These scans should last for a reasonable amount of time as
to not drain the battery.  The discover command also returns a list
of unpaired BLE devices to the frontend.

The backend should also have a list of hummingbirds it is 
attempting or has succeeded to connect to.  If one of these 
devices disconnects unexpectedly, the device should continue
to look for it for a few seconds before giving up (but keeping
it on the list).  If it encounters this lost BLE device during a
scan ("discovery") in the future, it should reconnect to it.
The `names` request returns this list.

The frontend will use commands connect/disconnect commands to
request that BLE devices be added/removed from the connected 
devices list.  The list modification should occur immediately,
and then the Bluetooth connection/disconnection itself may
be done by the backend later asynchronously.

## List of requests
1. [Bluetooth connections](#bluetooth-connections)
2. [Hummingbird blocks](#hummingbird-blocks)
3. [Device blocks](#device-blocks)
4. [Dialogs](#dialogs)
5. [Settings](#settings)
6. [File management](#file-management)

### Bluetooth connections

#### Discover available devices

    Get request format:
    http://localhost:22179/hummingbird/discover
    Example response:
    MyHB1
    Hummingbird 2
    HB3

When the backend receives this request, it should begin a scan of nearby,
unpaired Bluetooth devices.  If a scan is underway, it should continue the
scan and return the devices found so far, separated by the `\n` character.
An empty string should be returned if no devices have been found.

#### Connect to a device

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/connect
    Example:
    http://localhost:22179/hummingbird/My%20HB/connect
    
This request should add a hummingbird to the connection (names) list.
If the provided HB name does not appear on the master list of encountered 
hummingbirds, and this its Bluetooth id cannot be determined, simply ignore
this get request.

#### Disconnect from a device

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/disconnect
    Example:
    http://localhost:22179/hummingbird/My%20HB/disconnect
    
This request should remove the hummingbird from the connection list and
disconnect it.  It should remain, however on the 
list of encountered devices.  If the provided HB name has not been
encountered before or is not connected, ignore the request.

#### Rename a device

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/rename/[new name]
    Example:
    http://localhost:22179/hummingbird/BLE%20Thing/rename/My%20HB

When this request is received, the backend should rename the 
specified device.  If the device is not currently connected, 
the request should be ignored.  The list of encountered devices
to reflect the new name.

#### Hummingbird status

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/status
    Example:
    http://localhost:22179/hummingbird/My%20HB/status
    Example responses:
    0
    1

If the specified device is on the connected devices list and is currently
communicating properly, return 1.  Otherwise, return 0.  Note that this
request is made continuously by the frontend, so it should return pretty
quickly and not initiate any additional Bluetooth requests.

#### Total Hummingbird status

    Get request format:
    http://localhost:22179/hummingbird/totalStatus
    Example responses:
    0
    1
    2

Returns the cumulative status of all the connected hummingbirds.  It returns
1 if all hummingbirds are responding properly, 0 if at least one is not, and 
2 if there are no hummingbirds connected, so status is irrelevant.

### Hummingbird blocks

#### Hummingbird Servo

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/out/servo/[port]/[position]
    Example:
    http://localhost:22179/hummingbird/My%20HB/out/servo/3/170

Port: \[1,4\] (positive integer)  
Position: \[0,180\] (positive integer)

#### Hummingbird Motor

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/out/motor/[port]/[speed]
    Example:
    http://localhost:22179/hummingbird/My%20HB/out/motor/3/-90

Port: \[1,4\] (positive integer)  
Speed: \[-100,100\] (integer)

#### Hummingbird Vibration

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/out/vibration/[port]/[speed]
    Example:
    http://localhost:22179/hummingbird/My%20HB/out/vibration/3/90

Port: \[1,4\] (positive integer)  
Speed: \[0,100\] (positive integer)

#### Hummingbird LED

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/out/led/[port]/[intensity]
    Example:
    http://localhost:22179/hummingbird/My%20HB/out/led/3/90

Port: \[1,4\] (positive integer)  
Intensity: \[0,100\] (positive integer)

#### HB TRI-LED

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/out/triled/[port]/[r]/[g]/[b]
    Example:
    http://localhost:22179/hummingbird/My%20HB/out/triled/3/90/0/30

Port: \[1,4\] (positive integer)  
R: \[0,100\] (positive integer)
G: \[0,100\] (positive integer)
B: \[0,100\] (positive integer)

#### HB Sensor

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/in/sensor/[port]
    Example:
    http://localhost:22179/hummingbird/My%20HB/in/sensor/3
    Example response:
    90.543

Port: \[1,4\] (positive integer)  
\[Response\]: (float/integer)

#### HB Temperature

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/in/temperature/[port]
    Example:
    http://localhost:22179/hummingbird/My%20HB/in/temperature/3
    Example response:
    -1.758

Port: \[1,4\] (positive integer)  
\[Response\]: Temperature in C (float/integer)

#### HB Sound

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/in/sound/[port]
    Example:
    http://localhost:22179/hummingbird/My%20HB/in/sound/3
    Example response:
    1.457

Port: \[1,4\] (positive integer)  
\[Response\]: Volume (float/integer)

#### Stop

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/out/stop
    Example:
    http://localhost:22179/hummingbird/My%20HB/out/stop

Turns off all LEDs and motors but leaves servos in current positions.

### Device Blocks

#### Device Shaken

    Get request format:
    http://localhost:22179/iPad/shake
    Example response:
    1

\[Response\]: 1 if shaken since last time `/iPad/shake` was called, 
0 otherwise.

#### Device Location

    Get request format:
    http://localhost:22179/iPad/location
    Example response:
    20.17589 -70.85694

\[Response\]: \[Device latitude\] \[Device Longitude\]

#### Device SSID

    Get request format:
    http://localhost:22179/iPad/ssid
    Example response:
    MyWiFiNetworkName

\[Response\]: \[SSID of connected WiFi\] or `null` if not connected.

#### Device Pressure

    Get request format:
    http://localhost:22179/iPad/pressure
    Example response:
    94.81456

\[Response\]: \[Air pressure in kilopascals\]

#### Device Relative Altitude

    Get request format:
    http://localhost:22179/iPad/altitude
    Example response:
    -1.256

\[Response\]: Returns the change in the device's altitude (in meters) 
since the app was opened. This is determined using the device's 
barometer

#### Device Orientation

    Get request format:
    http://localhost:22179/iPad/orientation
    Example responses:
    Faceup
    Landscape: home button on left
    Landscape: home button on right
    Portrait: home button on bottom
    Portrait: home button on top
    Facedown
    In between

\[Response\]: Returns a string indicating the device's orientation.

### Dialogs

When the frontend would like to show a dialog, it will use a get request
to indicate what the dialog should say.  The response from this request
contains no information and is ignored.  Then the frontend uses a 
different get request to determine if the dialog has been closed,
and if so, what the response was.
For dialogs requesting a typed response:

    Get request format:
    http://localhost:22179/iPad/dialog/[title]/[question]/[hint]
    Example:
    http://localhost:22179/iPad/dialog/Name/What%20is%20your%20name%3F/name
    
Title: text displayed at the top of the dialog  
Question: text displayed in the middle of the dialog  
Hint: grayed-out text to be displayed in the text area the user types
into

Note that if any of these parts of the dialog cannot be displayed, 
just ignore them.

For dialogs with 2 choices (like yes/no):

    Get request format:
    http://localhost:22179/iPad/choice/[title]/[question]/[option1]/[option2]
    Example:
    http://localhost:22179/iPad/choice/Save/Save%20changes%3F/Yes/No

Title: text displayed at the top of the dialog  
Question: text displayed in the middle of the dialog  
Option 1: displayed on the left button of the dialog  
Option 2: displayed on the right button

Once these calls are complete, the following get requests are used to check
on their status.

For typed dialogs:

    Get request format:
    http://localhost:22179/iPad/dialog_response
    Example responses:
    No Response
    Cancelled
    'hello'
    ''
    'you're welcome'
    
`No response` is shown while the dialog is open and `Cancelled` if the user
closed the dialog without answering.  Otherwise, the user's response is
returned within single quotes.  Special characters do not need to be 
escaped, even single quotes.

For choice dialogs:

    Get request format:
    http://localhost:22179/iPad/choice_response
    Example responses:
    0
    1
    2
    
`0` is returned while the dialog is open, `1` if the first option was selected
and `2` for the second option.

### Settings

#### Read setting

    Get request format:
    http://localhost:22179/settings/get/[key]
    Example:
    http://localhost:22179/settings/get/zoom
    Example responses:
    1.5999999999999999
    Default
    
`Default` indicates that the key does not have an assigned value
    
#### Write setting

    Get request format:
    http://localhost:22179/settings/set/[key]/[value]
    Example:
    http://localhost:22179/settings/set/zoom/1

### File Management

#### Save file

    POST request format:
    http://localhost:22179/data/save/[filename]
    XML data included in POST request
    Example:
    http://localhost:22179/data/save/MyProject

Filename: string that does not include an extension.  Is non-empty,
has fewer than 30 characters, and unsafe characters have been removed.

When this command is run, save the data to the device and overwrite
any files with the same name.

#### Open file

    Get request format:
    http://localhost:22179/data/load/[filename]
    Example:
    http://localhost:22179/data/load/MyProject
    Response should contain project data

Response should return project data or `File Not Found` if the file
does not exist.

#### Rename file

    Get request format:
    http://localhost:22179/data/rename/[filename]/[new filename]
    Example:
    http://localhost:22179/data/rename/MyProject/HBProject

When this command is run, rename the specified file.  Overwrite the
new file name, if it exists.  If the specified file does not exist,
do nothing.  When renaming is complete, the original file should
no longer exist under its original name.

#### Delete file

    Get request format:
    http://localhost:22179/data/delete/[filename]
    Example:
    http://localhost:22179/data/delete/MyProject

Delete the specified file, or do nothing if it does not exist.

#### List files

    Get request format:
    http://localhost:22179/data/files
    Example response:
    file1
    file2
    file3

Returns a list of files, separated by the `\n` character.
An empty string is returned if there are no saved files.

#### Export file

    POST request format:
    http://localhost:22179/data/export/[filename]
    XML data included in POST request
    Example:
    http://localhost:22179/data/export/MyProject

Optionally, the backend may overwrite the specified file
with the data from the post request.  Then, the post data
should be shared using the OS-specific share menu as a file
with a .bbx extension.

#### Import file

When a file is imported from another app into the backend,
the backend should call the JS function:

    SaveManager.import(fileName, projectData);

The frontend will then load and display the file.  Do not
save the file, as the front end will take care of this
if necessary.