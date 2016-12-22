# BirdBlox
1. [Overview (for backend developers)](#overview-for-backend-developers)
2. [Bluetooth pairing system](#bluetooth-pairing-system)
3. [List of requests](#list-of-requests)
4. [Overview (for frontend developers)](#overview-for-frontend-developers)

## Overview (for backend developers)

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
* Connect to and communicate with bluetooth-enabled robots.
* Provide sensor information (accelerometers, etc.) from the
  device to the frontend when requested.
* Display dialogs when requested.
* Play sounds when requested.
* Save, open, and delete files to app storage.
* Export/import files to/from other applications on the
  device.
* Save/access key-value pairs used to store settings.

Communication between the frontend and backend occurs primarily
through get requests issued by the frontend.  Post requests
are used for save files, and occasionally the backend directly
calls JS functions in the frontend when communication in the 
reverse direction is required.

## Bluetooth pairing system

The backend and frontend communicate about specific Bluetooth devices 
using the devices' names.  To ensure consistent naming, the backend
should create a list of encountered Bluetooth device ids and their assigned names.
When a device is discovered, the backend should add its unique id to 
the list, along with its name.  If a device already has that name,
the second device should have a "2" appended to it, etc. to ensure
that all devices the backend has seen have a unique name.

The backend and frontend will use the names on this list to refer to
specific devices.  A device's name on the list should be changed only
when the frontend issues a "rename hummingbird" request.  Anywhere
`[HB name]` is used throughout this document, it is referring to the name
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

The frontend will use connect/disconnect commands to
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
7. [Sound blocks](#sound-blocks)

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
hummingbirds, and its Bluetooth id cannot be determined, simply ignore
this get request.

#### Disconnect from a device

    Get request format:
    http://localhost:22179/hummingbird/[HB name]/disconnect
    Example:
    http://localhost:22179/hummingbird/My%20HB/disconnect
    
This request should remove the hummingbird from the connection list and
disconnect it.  It should remain, however, on the 
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
should update to reflect the new name.

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

### Sound blocks

#### Play sound

    Get request format:
    http://localhost:22179/sound/play/[sound id]
    Example:
    http://localhost:22179/sound/play/bell_ring

Plays a sound from the pre-determined sound library.  Sounds
should be able to overlap with each other, if this request
is made while another sound is playing.  Sound ids are lowercase
 and use underscores instead of spaces.  They are used internally,
 while friendly names are presented to the user.

#### Stop sounds

    Get request format:
    http://localhost:22179/sound/stop

Stops library sounds that are currently playing.  Does not stop
note sounds.

#### Play note

    Get request format:
    http://localhost:22179/sound/note/[note number]/[duration in ms]
    Examples:
    http://localhost:22179/sound/note/3/4000

Plays a note for the specified duration in ms.  Notes are numbered
the same way they are in Snap!.

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
function B_Wait(x,y){
      //Derived from CommandBlock
      //Category ("control") determines colors
    CommandBlock.call(this,x,y,"control");
      //Build Block out of things found in the BlockParts folder
    this.addPart(new LabelText(this,"wait"));
    this.addPart(new NumSlot(this,1,true)); //Must be positive.
    this.addPart(new LabelText(this,"secs"));
}
B_Wait.prototype = Object.create(CommandBlock.prototype);
B_Wait.prototype.constructor = B_Wait;
/* Records current time. */
B_Wait.prototype.startAction=function(){
      //Each Block has runMem to store information for that execution
    var mem=this.runMem;
    mem.startTime=new Date().getTime();
      //Extract a positive value from first slot
    mem.delayTime=this.slots[0].getData().getValueWithC(true)*1000;
    return true; //Still running
};
/* Waits until current time exceeds stored time plus delay. */
B_Wait.prototype.updateAction=function(){
    var mem=this.runMem;
    if(new Date().getTime()>=mem.startTime+mem.delayTime){
        return false; //Done running
    }
    else{
        return true; //Still running
    }
};
```
Here's an example of a reporter with a DropSlot
```javascript
function B_Split(x,y){
      //Split is a ReporterBlock that returns a list
    ReporterBlock.call(this,x,y,"operators",Block.returnTypes.list);
      //Add parts with default values
    this.addPart(new LabelText(this,"split"));
    this.addPart(new StringSlot(this,"hello world"));
    this.addPart(new LabelText(this,"by"));
      //New DropSlot which numbers, strings, and bools can snap to
    var dS=new DropSlot(this,Slot.snapTypes.numStrBool);
      //Add options to select from
      //"enter_text" is a special option; tells InputPad to show prompt dialog
    dS.addOption("Enter text",new SelectionData("enter_text"));
    dS.addOption("letter",new SelectionData("letter"));
    dS.addOption("whitespace",new SelectionData("whitespace"));
    dS.setSelectionData("whitespace",new SelectionData("whitespace"));
    this.addPart(dS);
}
B_Split.prototype = Object.create(ReporterBlock.prototype);
B_Split.prototype.constructor = B_Split;
/* Returns a list made from splitting the string by the provided character. */
B_Split.prototype.startAction=function(){
    var string1=this.slots[0].getData().getValue();
    var splitD=this.slots[1].getData();
    var resultArray;
      //...
      // Code which sets resultArray
      //...
    var dataArray=new Array(resultArray.length);
    for(var i=0;i<resultArray.length;i++){
        dataArray[i]=new StringData(resultArray[i]);
    }
      //Return value specified in this.resultData
    this.resultData=new ListData(dataArray);
    return false; //Done running
};
```

In summary, `this.slots[i].getData()` is used to access data from Slots,
`this.runMem` is temporary storage that persists during a Block's execution,
and `this.resultData` is used to return a value.  

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