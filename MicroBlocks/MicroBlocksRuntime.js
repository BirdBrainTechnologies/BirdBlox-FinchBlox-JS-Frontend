/**
 * Runtime support for MicroBlocks vm
 */

function MicroBlocksRuntime () {
	this.chunkIDs = {}
	this.chunkRunning = Array(256).fill(false)

	this.readFromBoard = false
	this.port = null
	this.recompileAll = false 

	this.loggedData = []
	this.loggedDataNext = 1
	this.loggedDataCount = 0

	this.scripter = new MicroBlocksScripter()

	this.lastPingRecvMSecs = 0
}
MicroBlocksRuntime.init = function() {
	window.mbRuntime = new MicroBlocksRuntime()
}

MicroBlocksRuntime.prototype.serialPortOpen = function() {
	return (this.port != null)
}
MicroBlocksRuntime.prototype.bleDevice = function() {
	return DeviceHatchling.getManager().getDevice(0)
}
MicroBlocksRuntime.prototype.noBleConnection = function() {
	return (this.bleDevice() == null)
}
MicroBlocksRuntime.prototype.recompileNeeded = function() {
	this.recompileAll = true
}
MicroBlocksRuntime.prototype.chunkIDsIsEmpty = function() {
	for (var prop in this.chunkIDs) {
    	if (Object.prototype.hasOwnProperty.call(this.chunkIDs, prop)) {
      		return false;
    	}
  	}
	return true
}

//Utility function
const delay = async function(ms) { 
	return new Promise(res => setTimeout(res, ms)) 
}

MicroBlocksRuntime.prototype.evalOnBoard = function(aBlock, showBytes) {
	if (showBytes == null) { showBytes = false }
	if (showBytes) {
		let bytes = this.chunkBytesFor(aBlock)
		console.log('Bytes for chunk ' + id + ':')
		console.log(bytes)
		console.log('----------')
		return
	}
	//SERIAL
	/*if ('not connected' == (updateConnection this)) {
		showError (morph aBlock) (localized 'Board not connected')
		return
	}*/
	//BLE
	if (this.noBleConnection()) {
		console.error("Cannot run block - no ble connection")
		return
	}
	this.scripter.step()  // save script changes if needed
	//if (isNil (ownerThatIsA (morph aBlock) 'ScriptEditor')) {
	if (aBlock.stack.isDisplayStack) {
		// running a block from the palette, not included in saveAllChunks
		this.saveChunk(aBlock)
	}
	this.runChunk(this.lookupChunkID(aBlock))
}

/*
method stopRunningBlock SmallRuntime aBlock {
	if (isRunning this aBlock) {
		stopRunningChunk this (lookupChunkID this aBlock)
	}
}
*/


MicroBlocksRuntime.prototype.chunkTypeFor = function(aBlockOrFunction) {
	//if (isClass aBlockOrFunction 'Function') { return 3 }
	/*if (and
		(isClass aBlockOrFunction 'Block')
		(isPrototypeHat aBlockOrFunction)) {
			return 3
	}*/

	//We aren't going to bother with expressions for now...
	let expr = aBlockOrFunction //(expression aBlockOrFunction) 
	let op = expr.primName()
	if ('whenStarted' == op) { return 4 }
	if ('whenCondition' == op) { return 5 }
	if ('whenBroadcastReceived' == op) { return 6 }
	if ('whenButtonPressed' == op) {
		let button = expr.argList[0]
		if ('A' == button) { return 7 }
		if ('B' == button) { return 8 }
		return 9 // A+B
	}
	if (expr instanceof CommandBlock) { return 1 }
	if (expr instanceof ReporterBlock) { return 2 }

	console.error('Unexpected argument to chunkTypeFor: ' + aBlockOrFunction)
}

MicroBlocksRuntime.prototype.chunkBytesFor = function(aBlockOrFunction) {
	/*if (isClass aBlockOrFunction 'String') { // look up function by name
		aBlockOrFunction = (functionNamed (project scripter) aBlockOrFunction)
		if (isNil aBlockOrFunction) { return (list) } // unknown function
	}*/
	let compiler = new MicroBlocksCompiler()
	let code = compiler.instructionsFor(aBlockOrFunction)
	let bytes = [] // result will be a Uint8Array
	for (let i = 0; i < code.length; i++) {
		let item = code[i]
		if (item instanceof Array) {
			bytes = compiler.addBytesForInstructionTo(item, bytes)
		} else if (typeof item === "number") {
			bytes = compiler.addBytesForIntegerLiteralTo(item, bytes)
		} else if (typeof item === "string") {
			bytes = compiler.addBytesForStringLiteral(item, bytes)
		} else {
			console.error('Instruction must be an Array or String: ' + item)
		}
	}
	return bytes
}

MicroBlocksRuntime.prototype.showInstructions = function(aBlock) {
	// Display the instructions for the given stack.

	let compiler = new MicroBlocksCompiler()
	let code = compiler.instructionsFor(aBlock.stack.firstBlock)
	let result = []//(list)
	let firstString = true
	for (let i = 0; i < code.length; i++) {
		let item = code[i]
		if (!(item instanceof Array)) {
			if (firstString) {
				result.push( '--------' )
				firstString = false
			}
			result.push (item.toString()) // string literal
		} else if ('metadata' == (item[0])) {
			if ((code[code.length-1]).length > 0) {
				result.push( '--------' )
			}
		} else if ('pushLiteral' == (item[0])) {
			let instr = (item[0] + ' ' + item[1] + ' ("' + item[2] + '")')
			this.addWithLineNum(result, instr)
		} else if ('pushImmediate' == (item[0])) {
			let arg = item[1]
			if (1 == (arg & 1)) {
				arg = (arg >> 1) // decode integer
				if (arg >= 4194304) { arg = (arg - 8388608) }
			} else if (0 == arg) {
				arg = false
			} else if (4 == arg) {
				arg = true
			}
			this.addWithLineNum(result, ('pushImmediate ' + arg))
		} else if ('pushBigImmediate' == (item[0])) {
			this.addWithLineNum(result, 'pushBigImmediate') // don't show arg count; could be confusing
		} else if ('callFunction' == (item[0])) {
			let arg = item[1]
			let calledChunkID = ((arg >> 8) & 255)
			let argCount = (arg & 255)
			this.addWithLineNum(result, ('callFunction ' + calledChunkID + ' ' + argCount))
		/*} else if (!(isLetter ((item[0])[0]))) { // operator; don't show arg count
			this.addWithLineNum(result, item[0].toString())*/
		} else {
			// instruction (an array of form <cmd> <args...>)
			let instr = ''
			for (let s = 0; s < item.length; s++) { instr = (instr + item[s] + ' ') }
			this.addWithLineNum(result, instr, item)
		}
	}
	/*ws = (openWorkspace (global 'page') (joinStrings result (newline)))
	setTitle ws 'Instructions'
	setFont ws 'Arial' (16 * (global 'scale'))
	setExtent (morph ws) (220 * (global 'scale')) (400 * (global 'scale'))
	fixLayout ws*/
	console.log("Instructions: ")
	let resultString = ""
	for (let i = 0; i < result.length; i++) {
		resultString += result[i] + "\n"
	}
	console.log(resultString)
}

MicroBlocksRuntime.prototype.addWithLineNum = function(aList, instruction, items) {
	let currentLine = aList.length + 1
	let targetLine = ''
	if ((items != null) && (['pushLiteral', 'jmp', 'jmpTrue', 'jmpFalse', 
		'decrementAndJmp', 'callFunction', 'forLoop'].includes(items[0]))) {
		let offset = parseInt(items[items.length-1])
		targetLine = ' (line ' + (currentLine + 1 + offset) + ')'
	}
	aList.push('' + currentLine + ' ' + instruction + targetLine)
}

MicroBlocksRuntime.prototype.showCompiledBytes = function(aBlock) {
	// Display the instruction bytes for the given stack.

	let bytes = this.chunkBytesFor(aBlock.stack.firstBlock)
	let result = ''
	result += ('[' + (bytes.length) + ' bytes]\n') //(newline))
	for (let i = 0; i < bytes.length; i++) {
		result += bytes[i].toString()
		if (0 == ((i+1) % 4)) {
			result += '\n'
		} else {
			result += ' '
		}
	}
	/*if (and ((count result) > 0) ((newline) == (last result))) { removeLast result }
	ws = (openWorkspace (global 'page') (joinStrings result))
	setTitle ws 'Instruction Bytes'
	setFont ws 'Arial' (16 * (global 'scale'))
	setExtent (morph ws) (220 * (global 'scale')) (400 * (global 'scale'))
	fixLayout ws*/
	console.log("Compiled Bytes:")
	console.log(result)
}

/*
method showCallTree SmallRuntime aBlock {
	proto = (editedPrototype aBlock)
	if (notNil proto) {
		if (isNil (function proto)) { return }
		funcName = (functionName (function proto))
	} else {
		funcName = (primName (expression aBlock))
	}

	allFunctions = (dictionary)
	for f (allFunctions (project scripter)) { atPut allFunctions (functionName f) f }

	result = (list)
	appendCallsForFunction this funcName result '' allFunctions (array funcName)

	ws = (openWorkspace (global 'page') (joinStrings result (newline)))
	setTitle ws 'Call Tree'
	setFont ws 'Arial' (16 * (global 'scale'))
	setExtent (morph ws) (400 * (global 'scale')) (400 * (global 'scale'))
	fixLayout ws
}

method appendCallsForFunction SmallRuntime funcName result indent allFunctions callers {
	func = (at allFunctions funcName)

	argCount = (count (argNames func))
	localCount = (count (localNames func))
	stackWords = (+ 3 argCount localCount)
	info = ''
	if (or (argCount > 0) (localCount > 0)) {
		info = (join info ' (')
		if (argCount > 0) {
			info = (join info argCount ' arg')
			if (argCount > 1) { info = (join info 's') }
			if (localCount > 0) { info = (join info ', ') }
		}
		if (localCount > 0) {
			info = (join info localCount ' local')
			if (localCount > 1) { info = (join info 's') }
		}
		info = (join info ')')
	}
	add result (join indent funcName info ' ' stackWords)
	indent = (join '   ' indent)

	if (isNil (cmdList func)) { return }

	processed = (dictionary)
	for cmd (allBlocks (cmdList func)) {
		op = (primName cmd)
		if (and (contains allFunctions op) (not (contains processed op))) {
			if (contains callers op) {
				add result (join indent '   ' funcName ' [recursive]')
			} else {
				appendCallsForFunction this op result indent allFunctions (copyWith callers op)
			}
			add processed op
		}
	}
}

// Decompiler tests

method testDecompiler SmallRuntime aBlock {
	topBlock = (topBlock aBlock)
	gpCode = (decompileBytecodes -1 (chunkTypeFor this topBlock) (chunkBytesFor this topBlock))
	showCodeInHand this gpCode
}

method showCodeInHand SmallRuntime gpCode {
	if (isClass gpCode 'Function') {
		block = (scriptForFunction gpCode)
	} (or (isClass gpCode 'Command') (isClass gpCode 'Reporter')) {
		block = (toBlock gpCode)
	} else {
		// decompiler didn't return something that can be represented as blocks
		return
	}
	grab (hand (global 'page')) block
	fixBlockColor block
}

method compileAndDecompile SmallRuntime aBlockOrFunction {
	if (isClass aBlockOrFunction 'Function') {
		chunkID = (first (at chunkIDs (functionName aBlockOrFunction)))
	}
	chunkType = (chunkTypeFor this aBlockOrFunction)
	bytecodes1 = (chunkBytesFor this aBlockOrFunction)
	gpCode = (decompileBytecodes chunkID chunkType bytecodes1)
	bytecodes2 = (chunkBytesFor this gpCode)
	if (bytecodes1 == bytecodes2) {
		if ((count bytecodes1) > 750) {
			print 'ok chunkType:' chunkType 'bytes:' (count bytecodes1)
		}
	} else {
		print 'FAILED! chunkType:' chunkType 'bytes in:' (count bytecodes1) 'bytes out' (count bytecodes2)
	}
}

method decompileAll SmallRuntime {
	// Called by dev menu 'decompile all' for testing.

	decompileAllExamples this
}

method decompileAllExamples SmallRuntime {
	for fn (listEmbeddedFiles) {
		if (beginsWith fn 'Examples') {
			print fn
			openProjectFromFile (findMicroBlocksEditor) (join '//' fn)
			decompileAllInProject this
		}
	}
}

method decompileAllInProject SmallRuntime {
	assignFunctionIDs this
	for aFunction (allFunctions (project scripter)) {
		compileAndDecompile this aFunction
	}
	for aBlock (sortedScripts (scriptEditor scripter)) {
		if (not (isPrototypeHat aBlock)) { // functions are handled above
			compileAndDecompile this aBlock
		}
	}
}

method analyzeAllExamples SmallRuntime {
	for fn (listEmbeddedFiles) {
		if (beginsWith fn 'Examples') {
			print fn
			openProjectFromFile (findMicroBlocksEditor) (join '//' fn)
			analyzeProject this
		}
	}
}

method analyzeProject SmallRuntime {
	totalBytes = 0
	assignFunctionIDs this
	for aFunction (allFunctions (project scripter)) {
		byteCount = (count (chunkBytesFor this aFunction))
		if (byteCount > 700) { print ' ' (functionName aFunction) byteCount }
		totalBytes += byteCount
	}
	for aBlock (sortedScripts (scriptEditor scripter)) {
		if (not (isPrototypeHat aBlock)) { // functions are handled above
			byteCount = (count (chunkBytesFor this aBlock))
			if (byteCount > 700) { print '     script' byteCount }
			totalBytes += byteCount
		}
	}
	print '  Total:' totalBytes
	print '-----------'
}

// Decompiling

method readCodeFromNextBoardConnected SmallRuntime {
	readFromBoard = true
	disconnected = false
	if ('Browser' == (platform)) {
		// in browser, cannot add the spinner before user has clicked connect icon
		inform 'Plug in the board and click the USB icon to connect.'
		return
	}
	decompilerStatus = (localized 'Plug in the board.')
	spinner = (newSpinner (action 'decompilerStatus' (smallRuntime)) (action 'decompilerDone' (smallRuntime)))
	addPart (global 'page') spinner
}

method readCodeFromBoard SmallRuntime {
	decompiler = (newDecompiler)
	waitForPing this
	decompilerStatus = (localized 'Reading project from board...')

	if ('Browser' == (platform)) {
		prompter = (findMorph 'Prompter')
		if (notNil prompter) { destroy prompter } // remove the prompt to connect board

		if (not (canReplaceCurrentProject (findMicroBlocksEditor))) {
			return // uncommon: user started writing code before connecting the board
		}

		// in browser, spinner was not added earlier
		spinner = (newSpinner (action 'decompilerStatus' (smallRuntime)) (action 'decompilerDone' (smallRuntime)))
		addPart (global 'page') spinner
	}

	sendMsg this 'getVarNamesMsg'
	lastRcvMSecs = (msecsSinceStart)
	while (((msecsSinceStart) - lastRcvMSecs) < 100) {
		processMessages this
		waitMSecs 10
	}

	sendMsg this 'getAllCodeMsg'
	lastRcvMSecs = (msecsSinceStart)
	while (((msecsSinceStart) - lastRcvMSecs) < 2000) {
		processMessages this
		doOneCycle (global 'page')
		waitMSecs 10
	}
	if (isNil decompiler) { return } // decompilation was aborted

print 'Read' (count (getField decompiler 'vars')) 'vars' (count (getField decompiler 'chunks')) 'chunks'
	proj = (decompileProject decompiler)
	decompilerStatus = (localized 'Loading project...')
	doOneCycle (global 'page')
	installDecompiledProject this proj
	readFromBoard = false
	decompiler = nil
}

/*
method decompilerDone SmallRuntime { return (and (isNil decompiler) (not readFromBoard)) }
method decompilerStatus SmallRuntime { return decompilerStatus }

method stopDecompilation SmallRuntime {
	readFromBoard = false
	spinnerM = (findMorph 'MicroBlocksSpinner')
	if (notNil spinnerM) { removeFromOwner spinnerM }

	if (notNil decompiler) {
		decompiler = nil
		clearBoardIfConnected this true
		stopAndSyncScripts this
	}
}

method waitForPing SmallRuntime {
	// Try to get a ping back from the board. Used to ensure that the board is responding.

	endMSecs = ((msecsSinceStart) + 1000)
	lastPingRecvMSecs = 0
	while (0 == lastPingRecvMSecs) {
		if ((msecsSinceStart) > endMSecs) { return } // no response within the timeout
		sendMsg this 'pingMsg'
		processMessages this
		waitMSecs 10
	}
}

method installDecompiledProject SmallRuntime proj {
	clearBoardIfConnected this true
	setProject scripter proj
	updateLibraryList scripter
	checkForNewerLibraryVersions (project scripter) true
	restoreScripts scripter // fix block colors
	cleanUp (scriptEditor scripter)
	saveAllChunksAfterLoad this
}
*/

MicroBlocksRuntime.prototype.receivedChunk = function(chunkID, chunkType, bytecodes) {
	this.lastRcvMSecs = Date.now() //(msecsSinceStart)
	if (bytecodes == null || bytecodes.length == 0) {
		console.error('truncated chunk! ' + chunkID + " " + chunkType) // shouldn't happen
		return
	}
	if (this.decompiler != null) {
		this.decompiler.addChunk(chunkID, chunkType, bytecodes)
	}
}

MicroBlocksRuntime.prototype.receivedVarName = function(varID, varName, byteCount) {
	this.lastRcvMSecs = Date.now() //(msecsSinceStart)
	if (this.decompiler != null) {
		this.decompiler.addVar(varID, varName)
	}
}

/*
// HTTP server support

method readVarsFromBoard SmallRuntime client {
	if (notNil decompiler) { return }

	// pretend to be a decompiler to collect variable names
	decompiler = client
	waitForPing this
	sendMsg this 'getVarNamesMsg'
	lastRcvMSecs = (msecsSinceStart)
	while (((msecsSinceStart) - lastRcvMSecs) < 50) {
		processMessages this
		waitMSecs 10
	}
	// clear decompiler
	decompiler = nil
}
*/

// chunk management

MicroBlocksRuntime.prototype.syncScripts = async function() {
	// Called by scripter when anything changes.

	//if (isNil port) { return }
	if (this.noBleConnection()) { return }
	//if (notNil decompiler) { return }

	// force re-save of any functions in the scripting area
	/*for aBlock (sortedScripts (scriptEditor scripter)) {
		if (isPrototypeHat aBlock) {
			fName = (functionName (function (editedPrototype aBlock)))
			entry = (at chunkIDs fName nil)
			if (notNil entry) {
				// record that function is in scripting area so must be checked for changes
				atPut entry 5 true
			}
		}
	}*/

	await this.saveAllChunks()
}

MicroBlocksRuntime.prototype.lookupChunkID = function(aBlock) {
	// If the given block or function name has been assigned a chunkID, return it.
	// Otherwise, return nil.
	
	let key = aBlock.stack.mbId

	let entry = this.chunkIDs[key]
	if (entry == null) { return null }
	return (entry[0])
}

MicroBlocksRuntime.prototype.removeObsoleteChunks = function() {
	// Remove obsolete chunks. Chunks become obsolete when they are deleted or inserted into
	// a script so they are no longer a stand-alone chunk. Functions become obsolete when
	// they are deleted or the library containing them is deleted.

	let keys = Object.keys(this.chunkIDs)
	let stacks = TabManager.activeTab.stackList
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i]
		/*isObsolete = false
		if (isClass k 'Block') {
			owner = (owner (morph k))
			isObsolete = (or
				(isNil owner)
				(isNil (handler owner))
				(not (isAnyClass (handler owner) 'Hand' 'ScriptEditor' 'BlocksPalette')))
		} (isClass k 'String') {
			isObsolete = (isNil (functionNamed (project scripter) k))
		}
		if isObsolete {*/

		let stackFound = false
		for (let j = 0; j < stacks.length; j++) {
			if (stacks[j].mbId == k) { stackFound = true }
		}
		if (!stackFound) {
			this.deleteChunkFor(k)
		}
	}
}

MicroBlocksRuntime.prototype.unusedChunkID = function() {
	// Return an unused chunkID.

	let inUse = []
	let values = Object.values(this.chunkIDs)
	for (let i = 0; i < values.length; i++) {
		let entry = values[i]
		inUse.push(entry[0]) // the chunk ID is first element of entry
	}
	for (let id = 0; id < 254; id++) { //254 and 255 seem to have special significance in handlemessage
		if (!(inUse.includes(id))) { return id }
	}
	console.error( 'Too many code chunks (functions and scripts). Max is 256).' )
}

MicroBlocksRuntime.prototype.ensureChunkIdFor = function(aBlock) {
	// Return the chunkID for the given block. Functions are handled by assignFunctionIDs.
	// If necessary, register the block in the chunkIDs dictionary.

	//For hatchling, chunks are named by the id of the BlockStack
	let stackID = aBlock.stack.mbId

	let entry = this.chunkIDs[stackID]
	if (entry == null) {
		let id = this.unusedChunkID()
		entry = [id, null, this.chunkTypeFor(aBlock), '', false]
		this.chunkIDs[stackID] = entry // block -> (<id>, <crc>, <chunkType>, <lastSrc>, <functionMayHaveChanged>)
	}
	return entry[0]
}

/*
method assignFunctionIDs SmallRuntime {
	// Ensure that there is a chunk ID for every user-defined function.
	// This must be done before generating any code to allow for recursive calls.

	for func (allFunctions (project scripter)) {
		fName = (functionName func)
		if (not (contains chunkIDs fName)) {
			id = (unusedChunkID this)
			entry = (array id nil (chunkTypeFor this func) '' true)
			atPut chunkIDs fName entry // fName -> (<id>, <crc>, <chunkType>, <lastSrc>, <functionMayHaveChanged>)
		}
	}
}

method functionNameForID SmallRuntime chunkID {
	assignFunctionIDs this
	for pair (sortedPairs chunkIDs) {
		id = (first (first pair))
		if (id == chunkID) { return (last pair) } // return function name
	}
	return (join 'f' chunkID)
}
*/

MicroBlocksRuntime.prototype.deleteChunkFor = function(key) {
	/*if (and (isClass key 'Block') (isPrototypeHat key)) {
		key = (functionName (function (editedPrototype key)))
	}*/
	let entry = this.chunkIDs[key]
	console.log("Deleting chunkID entry [" + entry + "]")
	if ( (entry != null) && (!this.noBleConnection) ) {//(notNil port)) {
		let chunkID = entry[0]
		this.sendMsgSync('deleteChunkMsg', chunkID) //TODO: await?
		delete this.chunkIDs[key]
	}
}

MicroBlocksRuntime.prototype.stopAndSyncScripts = async function(alreadyStopped) {
	// Stop everything. Sync and verify scripts with the board using chunk CRC's.

	//removeHint (global 'page')
	//if (and (notNil port) (true != alreadyStopped)) {
	if ( (!this.noBleConnection) && (true != alreadyStopped)) {
		this.sendStopAll()
		this.softReset()
	}
	this.clearRunningHighlights()
	//doOneCycle (global 'page')

	/*if (shiftKeyDown (keyboard (global 'page'))) {
		recompileAll = true
	}*/
	await this.suspendCodeFileUpdates()
	await this.saveAllChunks()
	this.resumeCodeFileUpdates()
}


MicroBlocksRuntime.prototype.softReset = function() {
	// Stop everyting, clear memory, and reset the I/O pins.

	this.sendMsg('systemResetMsg') // send the reset message
}

/*
method isWebSerial SmallRuntime {
	return (and ('Browser' == (platform)) (browserHasWebSerial))
}

method webSerialConnect SmallRuntime action {
	if ('disconnect' == action) {
		if ('boardie' != portName) {
			stopAndSyncScripts this
			sendStartAll this
		} else {
			browserCloseBoardie
		}
		closeSerialPort 1
		portName = nil
		port = nil
	} ('open Boardie' == action) {
		browserOpenBoardie
		disconnected = false
		connectionStartTime = (msecsSinceStart)
		portName = 'boardie'
		port = 1
	} else {
		if (and ('Browser' == (platform)) (not (or (browserIsChromeOS) (browserHasWebSerial)))) { // running in a browser w/o WebSerial (or it is not enabled)
			inform (localized 'Only recent Chrome and Edge browsers support WebSerial.')
			return
		}
		openSerialPort 'webserial' 115200
		disconnected = false
		connectionStartTime = (msecsSinceStart)
		portName = 'webserial'
		port = 1
	}
}

method selectPort SmallRuntime {
	if (isNil disconnected) { disconnected = false }

	if ('Browser' == (platform)) {
		menu = (menu 'Connect' (action 'webSerialConnect' this) true)
		if (and (isNil port) ('boardie' != portName)) {
			if (browserHasWebSerial) {
				addItem menu 'connect'
			}
			addItem menu 'open Boardie'
		} else {
			addItem menu 'disconnect'
		}
		popUpAtHand menu (global 'page')
		return
	}

	portList = (portList this)
	menu = (menu 'Connect' (action 'setPort' this) true)
	if (or disconnected (devMode)) {
		for s portList {
			if (or (isNil port) (portName != s)) { addItem menu s }
		}
		if (isEmpty portList) {
			addItem menu 'Connect board and try again'
		}
	}
	if (and (devMode) ('Browser' != (platform))) {
		addItem menu 'other...'
	}
	if (notNil port) {
		addLine menu
		if (notNil portName) {
			addItem menu (join 'disconnect (' portName ')')
		} else {
			addItem menu 'disconnect'
		}
	}
	popUpAtHand menu (global 'page')
}

method portList SmallRuntime {
	portList = (list)
	if ('Win' == (platform)) {
		portList = (list)
		for pname (listSerialPorts) {
			blackListed = (or
				((containsSubString pname 'Bluetooth') > 0)
				((containsSubString pname '(COM1)') > 0)
				((containsSubString pname 'Intel(R) Active Management') > 0))
			if (not blackListed) {
				add portList pname
			}
		}
	} ('Browser' == (platform)) {
		listSerialPorts // first call triggers callback
		waitMSecs 5
		portList = (list)
		for portName (listSerialPorts) {
			if (not (beginsWith portName '/dev/tty.')) {
				add portList portName
			}
		}
	} else {
		for fn (listFiles '/dev') {
			if (or	(notNil (nextMatchIn 'usb' (toLowerCase fn) )) // MacOS
					(notNil (nextMatchIn 'acm' (toLowerCase fn) ))) { // Linux
				add portList (join '/dev/' fn)
			}
		}
		if ('Linux' == (platform)) {
			// add pseudoterminal
			ptyName = (readFile '/tmp/ublocksptyname')
			if (notNil ptyName) {
				add portList ptyName
			}
		}
		// Mac OS lists a port as both cu.<name> and tty.<name>
		for s (copy portList) {
			if (beginsWith s '/dev/tty.') {
				if (contains portList (join '/dev/cu.' (substring s 10))) {
					remove portList s
				}
			}
		}
	}
	return portList
}

method setPort SmallRuntime newPortName {
	if (beginsWith newPortName 'Connect board and try again') { return }
	if (beginsWith newPortName 'disconnect') {
		if (notNil port) {
			stopAndSyncScripts this
			sendStartAll this
		}
		disconnected = true
		closePort this
		updateIndicator (findMicroBlocksEditor)
		return
	}
	if ('other...' == newPortName) {
		newPortName = (freshPrompt (global 'page') 'Port name?' (localized 'none'))
		if ('' == newPortName) { return }
	}
	closePort this
	disconnected = false

	// the prompt answer 'none' is entered by the user in the current language
	if (or (isNil newPortName) (newPortName == (localized 'none'))) {
		portName = nil
	} else {
		portName = newPortName
		openPortAndSendPing this
	}
	updateIndicator (findMicroBlocksEditor)
}

method closePort SmallRuntime {
	// Close the serial port and clear info about the currently connected board.

	if (notNil port) { closeSerialPort port }
	port = nil
	vmVersion = nil
	boardType = nil

	// remove running highlights and result bubbles when disconnected
	clearRunningHighlights this
}

method enableAutoConnect SmallRuntime success {
	closeAllDialogs (findMicroBlocksEditor)
	if ('Browser' == (platform)) {
		// In the browser, the serial port must be closed and re-opened after installing
		// firmware on an ESP board. Not sure why. Adding a delay did not help.
		closePort this
		closeSerialPort 1 // make sure port is really disconnected
		disconnected = true
		if success { otherReconnectMessage this }
		return
	}
	disconnected = false
	stopAndSyncScripts this
}

method tryToInstallVM SmallRuntime {
	// Invite the user to install VM if we see a new board drive and are not able to connect to
	// it within a few seconds. Remember the last set of boardDrives so we don't keep asking.
	// Details: On Mac OS (at least), 3-4 seconds elapse between when the board drive appears
	// and when the USB-serial port appears. Thus, the IDE waits a bit to see if it can connect
	// to the board before prompting the user to install the VM to avoid spurious prompts.

	if (and (notNil vmInstallMSecs) ((msecsSinceStart) > vmInstallMSecs)) {
		vmInstallMSecs = nil
		if (and (notNil port) (isOpenSerialPort port)) { return }
		ok = (confirm (global 'page') nil (join
			(localized 'The board is not responding.') (newline)
			(localized 'Try to Install MicroBlocks on the board?')))
		if ok { installVM this }
		return
	}

	boardDrives = (collectBoardDrives this)
	if (lastBoardDrives == boardDrives) { return }
	lastBoardDrives = boardDrives
	if (isEmpty boardDrives) {
		vmInstallMSecs = nil
	} else {
		vmInstallMSecs = ((msecsSinceStart) + 5000) // prompt to install VM in a few seconds
	}
}

method updateConnection SmallRuntime {
	pingSendInterval = 2000 // msecs between pings
	pingTimeout = 8000
	if (isNil pingSentMSecs) { pingSentMSecs = 0 }
	if (isNil lastPingRecvMSecs) { lastPingRecvMSecs = 0 }
	if (isNil disconnected) { disconnected = false }

	if (notNil decompiler) { return 'connected' }
	if disconnected { return 'not connected' }

	// handle connection attempt in progress
	if (notNil connectionStartTime) { return (tryToConnect this) }

	// if port is not open, try to reconnect or find a different board
	if (or (isNil port) (not (isOpenSerialPort port))) {
		clearRunningHighlights this
		closePort this
		if ('Browser' == (platform)) {
			portName = nil // clear 'boardie' when boardie is closed with power button
			return 'not connected' // user must initiate connection attempt
		}
		return (tryToConnect this)
	}

	// if the port is open and it is time, send a ping
	now = (msecsSinceStart)
	if ((now - pingSentMSecs) > pingSendInterval) {
		if ((now - pingSentMSecs) > 5000) {
			// it's been a long time since we sent a ping; laptop may have been asleep
			// set lastPingRecvMSecs to N seconds into future to suppress warnings
			lastPingRecvMSecs = now
		}
		sendMsg this 'pingMsg'
		pingSentMSecs = now
		return 'connected'
	}

	msecsSinceLastPing = (now - lastPingRecvMSecs)
	if (msecsSinceLastPing < pingTimeout) {
		// got a ping recently: we're connected
		return 'connected'
	} else {
		// ping timeout: close port to force reconnection
		print 'Lost communication to the board'
		clearRunningHighlights this
		if (not (isWebSerial this)) { closePort this }
		return 'not connected'
	}
}
*/

MicroBlocksRuntime.prototype.justConnected = async function() {
	// Called when a board has just connected (browser or stand-alone).

	console.log('Connected to' + this.bleDevice().name) //portName
	this.connectionStartTime = null
	this.vmVersion = null
	await this.sendMsgSync('getVersionMsg')
	this.sendStopAll()
	this.clearRunningHighlights()
	//setDefaultSerialDelay this
	//abortFileTransfer this
	/*processMessages this // process incoming version message
	if readFromBoard {
		readFromBoard = false
		readCodeFromBoard this
	} else {*/
		let codeReuseDisabled = true //false // set this to false to attempt to reuse code on board
		if (codeReuseDisabled || (this.chunkIDsIsEmpty()) || (!(await this.boardHasSameProject()))) {
			if (!codeReuseDisabled) { console.log('Full download') }
			this.clearBoardIfConnected()
		} else {
			console.log('Incremental download ' + this.vmVersion + this.boardType)
		}
		this.recompileAll = true
		await this.stopAndSyncScripts(true)
		this.softReset()
	//}
}

/*
method tryToConnect SmallRuntime {
	// Called when connectionStartTime is not nil, indicating that we are trying
	// to establish a connection to a board the current serial port.
	if (and
		(not (hasUserCode (project (findProjectEditor))))
		(autoDecompileEnabled (findMicroBlocksEditor))
	) {
		readFromBoard = true
	}

	if (and (isWebSerial this) ('boardie' != portName)) {
		if (isOpenSerialPort 1) {
			portName = 'webserial'
			port = 1
			waitForPing this // wait up to 1 second for ping
			pingSentMSecs = (msecsSinceStart)
			justConnected this
			return 'not connected' // don't make circle green until successful ping
		} else {
			portName = nil
			port = nil
			return 'not connected'
		}
	}

	connectionAttemptTimeout = 5000 // milliseconds

	// check connection status only N times/sec
	now = (msecsSinceStart)
	if (isNil lastScanMSecs) { lastScanMSecs = 0 }
	msecsSinceLastScan = (now - lastScanMSecs)
	if (and (msecsSinceLastScan > 0) (msecsSinceLastScan < 20)) { return 'not connected' }
	lastScanMSecs = now

	if (notNil connectionStartTime) {
		sendMsg this 'pingMsg'
		processMessages this
		if (lastPingRecvMSecs != 0) { // got a ping; we're connected!
			justConnected this
			return 'connected'
		}
		if (now < connectionStartTime) { connectionStartTime = now } // clock wrap
		if ((now - connectionStartTime) < connectionAttemptTimeout) { return 'not connected' } // keep trying
	}

	closePort this
	connectionStartTime = nil

	if ('Browser' == (platform)) {  // disable autoconnect on ChromeOS
		disconnected = true
		return 'not connected'
	}

	portNames = (portList this)
	if (isEmpty portNames) { return 'not connected' } // no ports available

	// try the port following portName in portNames
	// xxx to do: after trying all the ports, call tryToInstallVM (but only if portNames isn't empty)
	i = 1
	if (notNil portName) {
		i = (indexOf portNames portName)
		if (isNil i) { i = 0 }
		i = ((i % (count portNames)) + 1)
	}
	portName = (at portNames i)
	openPortAndSendPing this
}

method openPortAndSendPing SmallRuntime {
	// Open port and send ping request
	closePort this // ensure port is closed
	connectionStartTime = (msecsSinceStart)
	ensurePortOpen this // attempt to reopen the port
	if (notNil port) {
		// discard any random bytes in buffer
		readSerialPort port true
	}
	lastPingRecvMSecs = 0
	sendMsg this 'pingMsg'
}

method ideVersion SmallRuntime { return ideVersion }
method latestVmVersion SmallRuntime { return latestVmVersion }

method ideVersionNumber SmallRuntime {
	// Return the version number portion of the version string (i.e. just digits and periods).

	for i (count ideVersion) {
		ch = (at ideVersion i)
		if (not (or (isDigit ch) ('.' == ch))) {
			return (substring ideVersion 1 (i - 1))
		}
	}
	return ideVersion
}

method readVersionFile SmallRuntime {
	// defaults in case version file is missing (which shouldn't happen)
	ideVersion = '0.0.0'
	latestVmVersion = 0

	data = (readEmbeddedFile 'versions')
	if (isNil data) { data = (readFile 'runtime/versions') }
	if (notNil data) {
		for s (lines data) {
			if (beginsWith s 'IDE ') { ideVersion = (substring s 5) }
			if (beginsWith s 'VM ') { latestVmVersion = (toNumber (substring s 4)) }
		}
	}
}

method showAboutBox SmallRuntime {
	vmVersionReport = (newline)
	if (notNil vmVersion) {
		vmVersionReport = (join ' (Firmware v' vmVersion ')' (newline))
	}
	(inform (global 'page') (join
		'MicroBlocks v' (ideVersion this) vmVersionReport (newline)
		(localized 'by') ' John Maloney, Bernat Romagosa, & Jens Mönig.' (newline)
		(localized 'Created with GP') ' (gpblocks.org)' (newline) (newline)
		(localized 'More info at http://microblocks.fun')) 'About MicroBlocks')
}

method checkBoardType SmallRuntime {
	if (and (isNil boardType) (notNil port)) {
		vmVersion = nil
		getVersion this
	}
	return boardType
}

method getVersion SmallRuntime {
	sendMsg this 'getVersionMsg'
}
*/

MicroBlocksRuntime.prototype.extractVersionNumber = function(versionString) {
	// Return the version number from the versionString.
	// Version string format: vNNN, where NNN is one or more decimal digits,
	// followed by non-digits characters that are ignored. Ex: 'v052a micro:bit'

	let words = versionString.slice(1).split(' ') //(words (substring versionString 2))
	if (words == null || words.length == 0) { return -1 }
	let result = 0
	//for ch (letters (first words)) {
	for (let i = 0; i < words[0].length; i++) {
		let ch = words[0][i]
		if (!(ch.match(/^[0-9]/))) { return result } //(not (isDigit ch)) { return result }
		let digit = parseInt(ch) //((byteAt ch 1) - (byteAt '0' 1))
		result = ((10 * result) + digit)
	}
	return result
}

MicroBlocksRuntime.prototype.extractBoardType = function(versionString) {
	// Return the board type from the versionString.
	// Version string format: vNNN [boardType]

	let words = versionString.slice(1).split(' ') //(words (substring versionString 2))
	if (words == null || words.length == 0) { return -1 }
	return words.slice(1).join(' ') //(joinStrings (copyWithout words (at words 1)) ' ')
}

MicroBlocksRuntime.prototype.versionReceived =function(versionString) {
	console.log("versionReceived: " + versionString)
	if (versionString == null) { return } // bad version message
	if (this.vmVersion == null) { // first time: record and check the version number
		this.vmVersion = this.extractVersionNumber(versionString)
		this.boardType = this.extractBoardType(versionString)
		this.checkVmVersion()
		//installBoardSpecificBlocks this
		console.log("Set vmVersion=" + this.vmVersion + ", boardType='" + this.boardType + "'")
	} else { // not first time: show the version number
		//inform (global 'page') (join 'MicroBlocks Virtual Machine ' versionString) 'Firmware version'
		console.log('MicroBlocks Virtual Machine ' + versionString + ' Firmware version')
	}
}

MicroBlocksRuntime.prototype.checkVmVersion = function() {
	// prevent version check from running while the decompiler is working
	if (!this.readFromBoard) { return }
	if (this.latestVmVersion > this.vmVersion) {
		/*ok = (confirm (global 'page') nil (join
			(localized 'The MicroBlocks in your board is not current')
			' (v' vmVersion ' vs. v' (latestVmVersion this) ').' (newline)
			(localized 'Try to update MicroBlocks on the board?')))
		if ok { installVM this }*/
		console.error("Outdated VM version detected (" + this.vmVersion + " < " + this.latestVmVersion + "). Firmware must be updated manually.")
	}
}

/*
method installBoardSpecificBlocks SmallRuntime {
	// installs default blocks libraries for each type of board.

	if (or readFromBoard (notNil decompiler)) { return } // don't load libraries while decompiling
	if (hasUserCode (project scripter)) { return } // don't load libraries if project has user code
	if (boardLibAutoLoadDisabled (findMicroBlocksEditor)) { return } // board lib autoload has been disabled by user

	if ('Citilab ED1' == boardType) {
		importEmbeddedLibrary scripter 'ED1 Buttons'
		importEmbeddedLibrary scripter 'Tone'
		importEmbeddedLibrary scripter 'Basic Sensors'
		importEmbeddedLibrary scripter 'LED Display'
	} (isOneOf boardType 'micro:bit' 'micro:bit v2' 'Calliope' 'Mbits') {
		importEmbeddedLibrary scripter 'Basic Sensors'
		importEmbeddedLibrary scripter 'LED Display'
	} ('CircuitPlayground' == boardType) {
		importEmbeddedLibrary scripter 'Circuit Playground'
		importEmbeddedLibrary scripter 'Basic Sensors'
		importEmbeddedLibrary scripter 'NeoPixel'
		importEmbeddedLibrary scripter 'Tone'
	} ('M5Stack-Core' == boardType) {
		importEmbeddedLibrary scripter 'LED Display'
		importEmbeddedLibrary scripter 'Tone'
		importEmbeddedLibrary scripter 'TFT'
		importEmbeddedLibrary scripter 'HTTP client'
	} ('ESP8266' == boardType) {
		importEmbeddedLibrary scripter 'HTTP client'
	} ('IOT-BUS' == boardType) {
		importEmbeddedLibrary scripter 'LED Display'
		importEmbeddedLibrary scripter 'TFT'
		importEmbeddedLibrary scripter 'touchScreenPrims'
	} ('ESP32' == boardType) {
		importEmbeddedLibrary scripter 'HTTP client'
	} ('TTGO RP2040' == boardType) {
		importEmbeddedLibrary scripter 'LED Display'
	} ('Pico:ed' == boardType) {
		importEmbeddedLibrary scripter 'LED Display'
	} ('Wukong2040' == boardType) {
		importEmbeddedLibrary scripter 'WuKong2040'
	} ('Databot' == boardType) {
		importEmbeddedLibrary scripter 'Databot'
	}
}
*/

MicroBlocksRuntime.prototype.clearBoardIfConnected = function(doReset) {
	//if (notNil port) {
	if (!this.noBleConnection()) {
		this.sendStopAll()
		if (doReset) { this.softReset() }
		this.sendMsgSync('deleteAllCodeMsg') // delete all code from board
	}
	//clearVariableNames this
	this.clearRunningHighlights()
	this.chunkIDs = {}
}

MicroBlocksRuntime.prototype.sendStopAll = function() {
	this.sendMsg('stopAllMsg')
	this.clearRunningHighlights()
}

MicroBlocksRuntime.prototype.sendStartAll = function() {
	this.scripter.step() // save script changes if needed
	this.sendMsg('startAllMsg')
}

/*
// Saving and verifying

method reachableFunctions SmallRuntime {
	// Not currently used. This function finds all the functions in a project that
	// are called explicitly. This might be used to prune unused library functions
	// when downloading a project. However, it does not find dynamic calls that us
	// the "call" primitive, so it is a bit risky.

	proj = (project scripter)
	todo = (list)
	result = (dictionary)

	for aBlock (sortedScripts (scriptEditor scripter)) {
		if (isPrototypeHat aBlock) {
			// todo: add function name to todo list
		} else {
			add todo aBlock
		}
	}
	while (notEmpty todo) {
		blockOrFuncName = (removeFirst todo)
		expr = nil
		if (isClass blockOrFuncName 'Block') {
			expr = (expression blockOrFuncName)
		} (isClass blockOrFuncName 'String') {
			func = (functionNamed proj blockOrFuncName)
			if (notNil func) { expr = (cmdList func) }
		}
		if (notNil expr) {
			for b (allBlocks expr) {
				op = (primName b)
				if (and (not (contains result op)) (notNil (functionNamed proj op))) {
					add result op
					add todo op
				}
			}
		}
	}
	print (count result) 'reachable functions:'
	for fName (keys result) { print '  ' fName }
}
*/

MicroBlocksRuntime.prototype.suspendCodeFileUpdates = async function() { await this.sendMsgSync('extendedMsg', 2, []) }
MicroBlocksRuntime.prototype.resumeCodeFileUpdates = function() { this.sendMsg('extendedMsg', 3, []) }

/*
method saveAllChunksAfterLoad SmallRuntime {
	suspendCodeFileUpdates this
	saveAllChunks this
	resumeCodeFileUpdates this
}
*/

MicroBlocksRuntime.prototype.saveAllChunks = async function() {
	// Save the code for all scripts and user-defined functions.

	//if (isNil port) { return }
	if (this.noBleConnection()) { return }

	//setCursor 'wait' //Change the mouse pointer appearance?

	//t = (newTimer)
	let startTime = Date.now()
	/*editor = (findMicroBlocksEditor)
	totalScripts = (
		(count (allFunctions (project scripter))) +
		(count (sortedScripts (scriptEditor scripter))))
	progressInterval = (max 1 (floor (totalScripts / 20)))
	processedScripts = 0*/

	let skipHiddenFunctions = true
	//if (saveVariableNames this) { recompileAll = true }
	if (this.recompileAll) {
		// Clear the source code field of all chunk entries to force script recompilation
		// and possible re-download since variable offsets have changed.
		await this.suspendCodeFileUpdates()
		let values = Object.values(this.chunkIDs)
		for (let i = 0; i < values.length; i++) {
			let entry = values[i]
			entry[3] = ''
			entry[4] = true
		}
		skipHiddenFunctions = false
	}
	//assignFunctionIDs this
	this.removeObsoleteChunks()

	/*functionsSaved = 0
	for aFunction (allFunctions (project scripter)) {
		if (saveChunk this aFunction skipHiddenFunctions) {
			functionsSaved += 1
			if (0 == (functionsSaved % progressInterval)) {
				showDownloadProgress editor 3 (processedScripts / totalScripts)
			}
		}
		if (isNil port) { return } // connection closed
		processedScripts += 1
	}
	if (functionsSaved > 0) { print 'Downloaded' functionsSaved 'functions to board' (join '(' (msecSplit t) ' msecs)') }
*/

	/*scriptsSaved = 0
	for aBlock (sortedScripts (scriptEditor scripter)) {
		if (not (isPrototypeHat aBlock)) { // skip function def hat; functions get saved above
			if (saveChunk this aBlock skipHiddenFunctions) {
				scriptsSaved += 1
				if (0 == (scriptsSaved % progressInterval)) {
					showDownloadProgress editor 3 (processedScripts / totalScripts)
				}
			}
			if (isNil port) { return } // connection closed
		}
		processedScripts += 1
	}
	if (scriptsSaved > 0) { print 'Downloaded' scriptsSaved 'scripts to board' (join '(' (msecSplit t) ' msecs)') }
*/

	let scriptsSaved = 0
	const stacks = TabManager.activeTab.stackList;
	for (let i = 0; i < stacks.length; i++) {
		if (await this.saveChunk(stacks[i].firstBlock, skipHiddenFunctions)) {
			scriptsSaved += 1
		}
	}
	if (scriptsSaved > 0) { console.log("Downloaded " + scriptsSaved + " scripts to board in " + (Date.now() - startTime) + " msecs.") }
	

	this.recompileAll = false
	await this.verifyCRCs()
	this.resumeCodeFileUpdates()
	//showDownloadProgress editor 3 1

	//setCursor 'default'
}

MicroBlocksRuntime.prototype.forceSaveChunk = function(aBlockOrFunction) {
	// Save the chunk for the given block or function even if it was previously saved.

	let key = aBlockOrFunction
	if (typeof key != "string") { //argument could be mbId or a block
		key = aBlockOrFunction.stack.mbId
	} else {
		//must get block to know what to save.
		let block = null
		for (let i = 0; i < TabManager.activeTab.stackList.length; i++) {
			let stack = TabManager.activeTab.stackList[i]
			if (stack.mbId == key) {
				block = stack.firstBlock
			}
		}
		if (block == null) {
			for (let i = 0; i < BlockPalette.selectedCat.displayStacks.length; i++) {
				let stack = BlockPalette.selectedCat.displayStacks[i]
				if (stack.mbId == key) {
					block = stack.firstBlock
				}
			}
		}
		aBlockOrFunction = block
	}
	if (this.chunkIDs[key] != null) {
		// clear the old CRC and source to force re-save
		this.chunkIDs[key][1] = null // clear the old CRC
		this.chunkIDs[key][3] = '' // clear the old source
	}
	if (aBlockOrFunction != null) {
		this.saveChunk(aBlockOrFunction, false)
	} else {
		console.error("forceSaveChunk could not find the stack!")
	}
}

MicroBlocksRuntime.prototype.saveChunk = async function(aBlockOrFunction, skipHiddenFunctions) {
	// Save the given script or function as an executable code "chunk".
	// Also save the source code (in GP format) and the script position.

	if (skipHiddenFunctions == null) { skipHiddenFunctions = true } // optimize by default

	let pp = new PrettyPrinter()
	let currentSrc = null
	let chunkID = null 
	let entry = null
	/*if (isClass aBlockOrFunction 'String') {
		aBlockOrFunction = (functionNamed (project scripter) aBlockOrFunction)
		if (isNil aBlockOrFunction) { return false } // unknown function
	}
	if (isClass aBlockOrFunction 'Function') {
		functionName = (functionName aBlockOrFunction)
		chunkID = (lookupChunkID this functionName)
		entry = (at chunkIDs functionName)
		if (and skipHiddenFunctions (not (at entry 5))) { return false } // function is not in scripting area so has not changed
		atPut entry 5 false
		currentSrc = (prettyPrintFunction pp aBlockOrFunction)
	} else {*/
		let expr = aBlockOrFunction//(expression aBlockOrFunction)
		if (expr instanceof ReporterBlock) {
			currentSrc = pp.prettyPrint(expr)
		} else {
			currentSrc = pp.prettyPrintList(expr)
		}
		chunkID = this.ensureChunkIdFor(aBlockOrFunction)
		// block -> (<id>, <crc>, <chunkType>, <lastSrc>, <functionMayHaveChanged>)
		entry = this.chunkIDs[aBlockOrFunction.stack.mbId] 
		if (entry[2] != this.chunkTypeFor(aBlockOrFunction)) {
			// user changed A/B/A+B button hat type with menu
			entry[2] = this.chunkTypeFor(aBlockOrFunction)
			entry[3] = '' // clear lastSrc to force save
		}
	//}

	console.log("saveChunk [" + entry + "] \nCurrent src:\n" + currentSrc)

	if (currentSrc == entry[3]) { return false } // source hasn't changed; save not needed
	entry[3] = currentSrc // remember the source of the code we're about to save

	// save the binary code for the chunk
	let chunkType = this.chunkTypeFor(aBlockOrFunction)
	let chunkBytes = this.chunkBytesFor(aBlockOrFunction)
	let data = new Uint8Array(chunkBytes.length + 1)
	data.set([chunkType], 0)
	data.set(chunkBytes, 1)
	if (data.length > 1000) {
		/*if (isClass aBlockOrFunction 'Function') {
			inform (global 'page') (join
				(localized 'Function "') (functionName aBlockOrFunction)
				(localized '" is too large to send to board.'))
		} else {*/
			//showError (morph aBlockOrFunction) (localized 'Script is too large to send to board.')
			console.error('Script is too large to send to board.') //TODO: Add alert in UI
		//}
		return false
	}

	// don't save the chunk if its CRC has not changed unless is a button or broadcast
	// hat because the CRC does not reflect changes to the button or broadcast name
	let crcOptimization = true
	if (aBlockOrFunction instanceof Block) {
		let op = aBlockOrFunction.primName() //(primName (expression aBlockOrFunction))
		crcOptimization = (!(['whenButtonPressed', 'whenBroadcastReceived'].includes(op)))
	}
	let newCRC = this.computeCRC(chunkBytes)
	//console.log("Computed CRC as [" + newCRC + "]. Was [" + entry[1] + "].")
	if (crcOptimization && (entry[1] == newCRC)) {
		return false
	}

	let restartChunk = ((aBlockOrFunction instanceof Block) && (this.isRunning(aBlockOrFunction)))

	//SERIAL
	// Note: micro:bit v1 misses chunks if time window is over 10 or 15 msecs
	/*if (((msecsSinceStart) - lastPingRecvMSecs) < 10) {
		sendMsg this 'chunkCodeMsg' chunkID data
		sendMsg this 'pingMsg'
	} else {
		sendMsgSync this 'chunkCodeMsg' chunkID data
	}*/
	//BLE
	this.sendMsg('chunkCodeMsg', chunkID, data)

	//processMessages this //I dont' think we need to do this - already doing it in DeviceHatchling
	entry[1] = newCRC//this.computeCRC(chunkBytes) // remember the CRC of the code we just saved

	// restart the chunk if it was running
	if (restartChunk) {
		this.stopRunningChunk(chunkID)
		await this.waitForResponse()
		this.runChunk(chunkID)
		await this.waitForResponse()
	}
	return true
}

MicroBlocksRuntime.prototype.computeCRC = function(chunkData) {
	// Return the CRC for the given compiled code.

	let crc = this.crc(chunkData) >>> 0 //(crc (toBinaryData (toArray chunkData)))

	// convert crc to a 4-byte array
	let result = []//(newArray 4)
	for (let i = 0; i < 4; i++) { result[i] = ((crc >> i*8) & 0xff) }//(digitAt crc i) }
	return result
}

MicroBlocksRuntime.prototype.crcsEqual = function(crc1, crc2) {
	if (crc1 == null | crc2 == null | crc1.length != 4 | crc2.length != 4) {
		return false //These are not properly formed CRCs anyway.
	}
	for (let i = 0; i < 4; i++) {
		if (crc1[i] != crc2[i]) { return false }
	}
	return true
}

MicroBlocksRuntime.prototype.crc = function(data) {
	//console.log("crc from [" + data + "]")

	//Copied from runtime.c in vm
	const crcTable = [
       0x0, 0x77073096, 0xEE0E612C, 0x990951BA,  0x76DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
 0xEDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988,  0x9B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
0x76DC4190,  0x1DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589,  0x6B6B51F, 0x9FBFE4A5, 0xE8B8D433,
0x7807C9A2,  0xF00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB,  0x86D3D2D, 0x91646C97, 0xE6635C01,
0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
0xEDB88320, 0x9ABFB3B6,  0x3B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF,  0x4DB2615, 0x73DC1683,
0xE3630B12, 0x94643B84,  0xD6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D,  0xA00AE27, 0x7D079EB1,
0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
0x9B64C2B0, 0xEC63F226, 0x756AA39C,  0x26D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785,  0x5005713,
0x95BF4A82, 0xE2B87A14, 0x7BB12BAE,  0xCB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7,  0xBDBDF21,
0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D]


	let crc = (~0)
	for (let i = 0; i < data.length; i++) {
		let p = data[i]
		crc = ((crc >>> 8) ^ crcTable[(crc & 0xff) ^ p])
	}
	return (~crc)
}

MicroBlocksRuntime.prototype.verifyCRCs = async function() {
	// Check that the CRCs of the chunks on the board match the ones in the IDE.
	// Resend the code of any chunks whose CRC's do not match.

	//if (isNil port) { return }
	if (this.noBleConnection()) { return }

	// collect CRCs from the board
	this.crcDict = {}
	//if (and (notNil vmVersion) (vmVersion >= 159)) {
		await this.collectCRCsBulk()
	/*} else {
		collectCRCsIndividually this
	}*/

	// build dictionaries:
	//  ideChunks: maps chunkID -> block or functionName
	//  crcForChunkID: maps chunkID -> CRC
	let ideChunks = {}
	let crcForChunkID = {}
	/*for pair (sortedPairs chunkIDs) {
		id = (first (first pair))
		key = (last pair)
		if (and (isClass key 'String') (isNil (functionNamed (project scripter) key))) {
			remove chunkIDs key // remove reference to deleted function (rarely needed)
		} else {
			atPut ideChunks id (last pair)
			atPut crcForChunkID id (at (first pair) 2)
		}
	}*/
	let keys = Object.keys(this.chunkIDs)
	for (let i = 0; i < keys.length; i++) {
		let key = keys[i]
		let id = this.chunkIDs[key][0]

		ideChunks[id] = key
		crcForChunkID[id] = this.chunkIDs[key][1]
	}

	//editor = (findMicroBlocksEditor)
	let totalCount = Object.keys(this.crcDict).length + Object.keys(ideChunks).length
	let processedCount = 0

	// process CRCs
	//for chunkID (keys crcDict) {
	let crcDictKeys = Object.keys(this.crcDict)
	for (let i = 0; i < crcDictKeys.length; i++) {
		let chunkID = crcDictKeys[i]
		let sourceItem = ideChunks[chunkID]
		if ((sourceItem != null) && (!this.crcsEqual(this.crcDict[chunkID], crcForChunkID[chunkID]))) {
			console.log('CRC mismatch; resaving chunk: ' + chunkID + "; [" + this.crcDict[chunkID] + "] vs. [" + crcForChunkID[chunkID] + "]" )
			this.forceSaveChunk(sourceItem)
			//showDownloadProgress editor 3 (processedCount / totalCount)
		} else if (sourceItem == null) {
			console.error("crcDict contains unknown chunk " + chunkID)
		} else {
			console.log("CRCs match for chunkID " + chunkID + "!")
		}
		processedCount += 1
	}

	// check for missing chunks
	//for chunkID (keys ideChunks) {
	let ids = Object.keys(ideChunks)
	for (let i = 0; i < ids.length; i++) {
		let chunkID = ids[i]
		if (this.crcDict[chunkID] == null) {//(not (contains crcDict chunkID)) {
			console.log('Resaving missing chunk:' + chunkID)
			let sourceItem = ideChunks[chunkID]
			this.forceSaveChunk(sourceItem)
			//showDownloadProgress editor 3 (processedCount / totalCount)
		}
		processedCount += 1
	}
	//showDownloadProgress editor 3 1
}

MicroBlocksRuntime.prototype.boardHasSameProject = async function() {
	// Return true if the board appears to have the same project as the IDE.

	//if (isNil port) { return false }
	if (this.noBleConnection()) { return false }

	// update chunkIDs dictionary for script/function additions or removals while disconnected
	//assignFunctionIDs this
	/*for aBlock (sortedScripts (scriptEditor scripter)) {
		if (not (isPrototypeHat aBlock)) { // skip function def hat; functions get IDs above
			ensureChunkIdFor this aBlock
		}
	}*/
	let stacks = TabManager.activeTab.stackList
	for (let i = 0; i < stack.length; i++) {
		this.ensureChunkIdFor(stacks[i].firstBlock)
	}

	// collect CRCs from the board
	this.crcDict = {}
	await this.collectCRCsBulk()

	// build dictionaries:
	//  ideChunks: chunkID -> block or functionName
	//  crcForChunkID: chunkID -> CRC
	let ideChunks = {}
	let crcForChunkID = {}
	//for pair (sortedPairs chunkIDs) {
	let keys = Object.keys(this.chunkIDs)
	for (let i = 0; i < keys.length; i++) {
		let key = keys[i]
		let entry = this.chunkIDs[key]
		let chunkID = entry[0]
		let crc = entry[1]
		ideChunks[chunkID] = key
		crcForChunkID[chunkID] = crc
	}

	// count matching chunks
	let matchCount = 0
	let crcKeys = Object.keys(this.crcDict)
	for (let i = 0; i < crcKeys.length; i++) {
		let chunkID = crcKeys[i]
		let entry = ideChunks[chunkID]
		if ((entry != null) && (this.crcDict[chunkID] == crcForChunkID[chunkID])) {
			matchCount += 1
		}
	}

	// count chunks missing from the board
	let missingCount = 0
	let ideKeys = Object.keys(ideChunks)
	for (let i = 0; i < ideKeys.length; i++) {
		let chunkID = ideKeys[i]
		if (!(this.crcDict.hasOwnProperty(chunkID))) {
			missingCount += 1
		}
	}

	return (matchCount >= missingCount)
}

/*
method collectCRCsIndividually SmallRuntime {
	// Collect the CRC's from all chunks on the board by requesting them individually

	crcDict = (dictionary)

	// request a CRC for every chunk
	for entry (values chunkIDs) {
		sendMsg this 'getChunkCRCMsg' (first entry)
		processMessages this
	}

	waitForResponse this // wait for the first response

	timeout = 30
	lastRcvMSecs = (msecsSinceStart)
	while (((msecsSinceStart) - lastRcvMSecs) < timeout) {
		processMessages this
		waitMSecs 10
	}
}
*/

MicroBlocksRuntime.prototype.crcReceived = function(chunkID, chunkCRC) {
	// Received an individual CRC message from board.
	// Record the CRC for the given chunkID.

	this.lastRcvMSecs = Date.now() //(msecsSinceStart)
	if (this.crcDict != null) {
		this.crcDict[chunkID] = chunkCRC
	}
}

MicroBlocksRuntime.prototype.collectCRCsBulk = async function() {
	// Collect the CRC's from all chunks on the board via a bulk CRC request.

	this.crcDict = null

	// request CRCs for all chunks on board
	this.sendMsgSync('getAllCRCsMsg')

	// wait until crcDict is filled in or timeout
	let startT = Date.now() //(msecsSinceStart)
	while ((this.crcDict == null) && ((Date.now() - startT) < 2000)) {
		//processMessages this  //Don't need to do this?
		await delay(5) //waitMSecs 5
	}
	if (this.crcDict == null) { this.crcDict = {} } // timeout
}

MicroBlocksRuntime.prototype.allCRCsReceived = function(data) {
	// Received a message from baord with the CRCs of all chunks.
	// Create crcDict and record the (possibly empty) list of CRCs.
	// Each CRC record is 5 bytes: <chunkID (one byte)> <CRC (four bytes)>

	this.crcDict = {}
	let byteCount = data.length
	let i = 0
	while (i <= (byteCount - 4)) {
		let chunkID = data[i]
		let chunkCRC = data.slice((i + 1), (i + 5))
		this.crcDict[chunkID] = chunkCRC
		i += 5
	}
}

/*
method saveVariableNames SmallRuntime {
	// If the variables list has changed, save the new variable names.
	// Return true if varibles have changed, false otherwise.

	newVarNames = (allVariableNames (project scripter))
	if (oldVarNames == newVarNames) { return false }

	editor = (findMicroBlocksEditor)
	varCount = (count newVarNames)
	progressInterval = (max 1 (floor (varCount / 20)))

	clearVariableNames this
	varID = 0
	for varName newVarNames {
		if (notNil port) {
			if (0 == (varID % 50)) {
				// send a sync message every N variables
				sendMsgSync this 'varNameMsg' varID (toArray (toBinaryData varName))
			} else {
				sendMsg this 'varNameMsg' varID (toArray (toBinaryData varName))
			}
		}
		varID += 1
		if (0 == (varID % progressInterval)) {
			showDownloadProgress editor 2 (varID / varCount)
		}
	}
	oldVarNames = (copy newVarNames)
	return true
}
*/

MicroBlocksRuntime.prototype.runChunk = function(chunkID) {
	this.sendMsg('startChunkMsg', chunkID)
}

MicroBlocksRuntime.prototype.stopRunningChunk = function(chunkID) {
	this.sendMsg('stopChunkMsg', chunkID)
}

/*
method sendBroadcastToBoard SmallRuntime msg {
	sendMsg this 'broadcastMsg' 0 (toArray (toBinaryData msg))
}

method getVar SmallRuntime varID {
	if (isNil varID) { varID = 0 }
	sendMsg this 'getVarMsg' varID
}

method getVarNamed SmallRuntime varName {
	sendMsg this 'getVarMsg' 255 (toArray (toBinaryData varName))
}

method setVar SmallRuntime varID val {
	body = nil
	if (isClass val 'Integer') {
		body = (newArray 5)
		atPut body 1 1 // type 1 - Integer
		atPut body 2 (val & 255)
		atPut body 3 ((val >> 8) & 255)
		atPut body 4 ((val >> 16) & 255)
		atPut body 5 ((val >> 24) & 255)
	} (isClass val 'String') {
		body = (toArray (toBinaryData (join (string 2) val)))
	} (isClass val 'Boolean') {
		body = (newArray 2)
		atPut body 1 3 // type 3 - Boolean
		if val {
			atPut body 2 1 // true
		} else {
			atPut body 2 0 // false
		}
	}
	if (notNil body) { sendMsg this 'setVarMsg' varID body }
}

method variablesChanged SmallRuntime {
	// Called by scripter when variables are added or removed.

	sendStopAll this
	clearVariableNames this
	scriptChanged scripter
}

method clearVariableNames SmallRuntime {
	if (notNil port) { sendMsgSync this 'clearVarsMsg' }
	oldVarNames = nil
}

// Serial Delay

method serialDelayMenu SmallRuntime {
	menu = (menu (join 'Serial delay' (newline) '(smaller is faster, but may fail if computer cannot keep up)') (action 'setSerialDelay' this) true)
	for i (range 1 5) { addItem menu i }
	for i (range 6 20 2) { addItem menu i }
	addLine menu
	addItem menu 'reset to default'
	popUpAtHand menu (global 'page')
}

method setDefaultSerialDelay SmallRuntime {
	setSerialDelay this 'reset to default'
}

method setSerialDelay SmallRuntime newDelay {
	if ('reset to default' == newDelay) {
		newDelay = 5
	}
	sendMsg this 'extendedMsg' 1 (list newDelay)
}

// Message handling
*/
MicroBlocksRuntime.prototype.msgNameToID = function(msgName) {
	if (typeof msgName == 'number') { return msgName }
	if (this.msgDict == null) {
		this.msgDict = {}
		this.msgDict['chunkCodeMsg'] = 1
		this.msgDict['deleteChunkMsg'] = 2
		this.msgDict['startChunkMsg'] = 3
		this.msgDict['stopChunkMsg'] = 4
		this.msgDict['startAllMsg'] = 5
		this.msgDict['stopAllMsg'] = 6
		this.msgDict['getVarMsg'] = 7
		this.msgDict['setVarMsg'] = 8
		this.msgDict['getVarNamesMsg'] = 9
		this.msgDict['clearVarsMsg'] = 10
		this.msgDict['getChunkCRCMsg'] = 11
		this.msgDict['getVersionMsg'] = 12
		this.msgDict['getAllCodeMsg'] = 13
		this.msgDict['deleteAllCodeMsg'] = 14
		this.msgDict['systemResetMsg'] = 15
		this.msgDict['taskStartedMsg'] = 16
		this.msgDict['taskDoneMsg'] = 17
		this.msgDict['taskReturnedValueMsg'] = 18
		this.msgDict['taskErrorMsg'] = 19
		this.msgDict['outputValueMsg'] = 20
		this.msgDict['varValueMsg'] = 21
		this.msgDict['versionMsg'] = 22
		this.msgDict['chunkCRCMsg'] = 23
		this.msgDict['pingMsg'] = 26
		this.msgDict['broadcastMsg'] = 27
		this.msgDict['chunkAttributeMsg'] = 28
		this.msgDict['varNameMsg'] = 29
		this.msgDict['extendedMsg'] = 30
		this.msgDict['getAllCRCsMsg'] = 38
		this.msgDict['allCRCsMsg'] = 39
		this.msgDict['deleteFile'] = 200
		this.msgDict['listFiles'] = 201
		this.msgDict['fileInfo'] = 202
		this.msgDict['startReadingFile'] = 203
		this.msgDict['startWritingFile'] = 204
		this.msgDict['fileChunk'] = 205
	}
	let msgType = this.msgDict[msgName]
	if (msgType == null) { console.error('Unknown message: ' + msgName) }
	return msgType
}

MicroBlocksRuntime.prototype.errorString = function(errID) {
	// Return an error string for the given errID from error definitions copied and pasted from interp.h

	/* defsFromHeaderFile = '
#define noError					0	// No error
#define unspecifiedError		1	// Unknown error
#define badChunkIndexError		2	// Unknown chunk index

#define insufficientMemoryError	10	// Insufficient memory to allocate object
#define needsListError			11	// Needs a list
#define needsBooleanError		12	// Needs a boolean
#define needsIntegerError		13	// Needs an integer
#define needsStringError		14	// Needs a string
#define nonComparableError		15	// Those objects cannot be compared for equality
#define arraySizeError			16	// List size must be a non-negative integer
#define needsIntegerIndexError	17	// List or string index must be an integer
#define indexOutOfRangeError	18	// List or string index out of range
#define byteArrayStoreError		19	// A ByteArray can only store integer values between 0 and 255
#define hexRangeError			20	// Hexadecimal input must between between -1FFFFFFF and 1FFFFFFF
#define i2cDeviceIDOutOfRange	21	// I2C device ID must be between 0 and 127
#define i2cRegisterIDOutOfRange	22	// I2C register must be between 0 and 255
#define i2cValueOutOfRange		23	// I2C value must be between 0 and 255
#define notInFunction			24	// Attempt to access an argument outside of a function
#define badForLoopArg			25	// for-loop argument must be a positive integer or list
#define stackOverflow			26	// Insufficient stack space
#define primitiveNotImplemented	27	// Primitive not implemented in this virtual machine
#define notEnoughArguments		28	// Not enough arguments passed to primitive
#define waitTooLong				29	// The maximum wait time is 3600000 milliseconds (one hour)
#define noWiFi					30	// This board does not support WiFi
#define zeroDivide				31	// Division (or modulo) by zero is not defined
#define argIndexOutOfRange		32	// Argument index out of range
#define needsIndexable			33	// Needs an indexable type such as a string or list
#define joinArgsNotSameType		34	// All arguments to join must be the same type (e.g. lists)
#define i2cTransferFailed		35	// I2C transfer failed
#define needsByteArray			36	// Needs a byte array
#define serialPortNotOpen		37	// Serial port not open
#define serialWriteTooBig		38	// Serial port write is limited to 128 bytes
#define needsListOfIntegers		39	// Needs a list of integers
#define byteOutOfRange			40	// Needs a value between 0 and 255
#define needsPositiveIncrement	41	// Range increment must be a positive integer
#define needsIntOrListOfInts	42	// Needs an integer or a list of integers
'
	for line (lines defsFromHeaderFile) {
		words = (words line)
		if (and ((count words) > 2) ('#define' == (first words))) {
			if (errID == (toInteger (at words 3))) {
				msg = (joinStrings (copyFromTo words 5) ' ')
				return (join 'Error: ' msg)
			}
		}
	}
	return (join 'Unknown error: ' errID)*/

	if (this.errorArray == null) {
		this.errorArray = []
		this.errorArray[0] = "No error"
		this.errorArray[1] = "Unknown error"
		this.errorArray[2] = "Unknown chunk index"

		this.errorArray[10] = "Insufficient memory to allocate object"
		this.errorArray[11] = "Needs a list"
		this.errorArray[12] = "Needs a boolean"
		this.errorArray[13] = "Needs an integer"
		this.errorArray[14] = "Needs a string"
		this.errorArray[15] = "Those objects cannot be compared for equality"
		this.errorArray[16] = "List size must be a non-negative integer"
		this.errorArray[17] = "List or string index must be an integer"
		this.errorArray[18] = "List or string index out of range"
		this.errorArray[19] = "A ByteArray can only store integer values between 0 and 255"
		this.errorArray[20] = "Hexadecimal input must between between -1FFFFFFF and 1FFFFFFF"
		this.errorArray[21] = "I2C device ID must be between 0 and 127"
		this.errorArray[22] = "I2C register must be between 0 and 255"
		this.errorArray[23] = "I2C value must be between 0 and 255"
		this.errorArray[24] = "Attempt to access an argument outside of a function"
		this.errorArray[25] = "for-loop argument must be a positive integer or list"
		this.errorArray[26] = "Insufficient stack space"
		this.errorArray[27] = "Primitive not implemented in this virtual machine"
		this.errorArray[28] = "Not enough arguments passed to primitive"
		this.errorArray[29] = "The maximum wait time is 3600000 milliseconds (one hour)"
		this.errorArray[30] = "This board does not support WiFi"
		this.errorArray[31] = "Division (or modulo) by zero is not defined"
		this.errorArray[32] = "Argument index out of range"
		this.errorArray[33] = "Needs an indexable type such as a string or list"
		this.errorArray[34] = "All arguments to join must be the same type (e.g. lists)"
		this.errorArray[35] = "I2C transfer failed"
		this.errorArray[36] = "Needs a byte array"
		this.errorArray[37] = "Serial port not open"
		this.errorArray[38] = "Serial port write is limited to 128 bytes"
		this.errorArray[39] = "Needs a list of integers"
		this.errorArray[40] = "Needs a value between 0 and 255"
		this.errorArray[41] = "Range increment must be a positive integer"
		this.errorArray[42] = "Needs an integer or a list of integers"
	}

	if (this.errorArray[errID] == null) {
		return ("No error defined for code " + errID)
	} else {
		return ("Error: " + this.errorArray[errID])
	}

}

MicroBlocksRuntime.prototype.sendMsg = function(msgName, chunkID, byteList) {
	//ensurePortOpen this
	//if (isNil port) { return }
	let device = this.bleDevice()
	if (device == null) { return }

	if (chunkID == null) { chunkID = 0 }
	let msgID = this.msgNameToID(msgName)
	let msg = null
	if (byteList == null) { // short message
		msg = [250, msgID, chunkID]
	} else { // long message
		let byteCount = byteList.length + 1
		msg = [251, msgID, chunkID, (byteCount & 255), ((byteCount >> 8) & 255)]
		msg.push.apply(msg, byteList)
		msg.push(254) // terminator byte (helps board detect dropped bytes)
	}
	let dataToSend = new Uint8Array(msg)
	console.log("sendMsg sending [" + dataToSend + "]")

	/*if ('boardie' == portName) { // send all data at once to boardie
		(writeSerialPort port dataToSend)
		return
	}

	while (dataToSend.length > 0) {
		// Note: Adafruit USB-serial drivers on Mac OS locks up if >= 1024 bytes
		// written in one call to writeSerialPort, so send smaller chunks
		// Note: Maximum serial write in Chrome browser is only 64 bytes!
		byteCount = (min 64 (byteCount dataToSend))
		chunk = (copyFromTo dataToSend 1 byteCount)
		bytesSent = (writeSerialPort port chunk)
		if (not (isOpenSerialPort port)) {
			closePort this
			return
		}
		waitMSecs 2
		if (bytesSent < byteCount) { waitMSecs 200 } // output queue full; wait a bit
		dataToSend = (copyFromTo dataToSend (bytesSent + 1))
	}*/

	// Note: For ble, there is a max of 20 bytes
	let byteMax = 20
	for (let i = 0; i < Math.ceil(dataToSend.length/byteMax); i++ ) {
		device.sendMicroBlocksData(dataToSend.subarray(i*byteMax, (i+1)*byteMax))
	}
}

MicroBlocksRuntime.prototype.sendMsgSync = async function(msgName, chunkID, byteList) {
	// Send a message followed by a 'pingMsg', then a wait for a ping response from VM.

	//readAvailableSerialData this
	this.sendMsg(msgName, chunkID, byteList)
	//if ('boardie' == portName) { return } // don't wait for a response

	let ok = await this.waitForResponse()
	if (!ok) {
		console.log('Lost communication to the board in sendMsgSync')
		//closePort this
		return false
	}
	return true
}

/*
method readAvailableSerialData SmallRuntime {
	// Read any available data into recvBuf so that waitForResponse will await fresh data.

	if (isNil port) { return }
	waitMSecs 20 // leave some time for queued data to arrive
	if (isNil recvBuf) { recvBuf = (newBinaryData 0) }
	s = (readSerialPort port true)
	if (notNil s) { recvBuf = (join recvBuf s) }
}
*/

MicroBlocksRuntime.prototype.waitForResponse = async function() {
	// Wait for some data to arrive from the board. This is taken to mean that the
	// previous operation has completed. Return true if a response was received.

	this.sendMsg('pingMsg')
	let timeout = 10000 // enough time for a long Flash compaction
	let start = Date.now() //(msecsSinceStart)
	while ((Date.now() - start) < timeout) {
		//if (isNil port) { return false }
		if (this.noBleConnection()) { return false }
		/*s = (readSerialPort port true)
		if (notNil s) {
			recvBuf = (join recvBuf s)
			return true
		}*/
		if (this.lastPingRecvMSecs > start) { 
			console.log("waitForResponse done.")
			return true 
		} else {
			console.log("waitForResponse start=" + start + " lastPing=" + this.lastPingRecvMSecs)
		}

		this.sendMsg('pingMsg')
		await delay(5)
	}
	return false
}

/*
method ensurePortOpen SmallRuntime {
	if (true == disconnected) { return }
	if (isWebSerial this) { return }
	if (or (isNil port) (not (isOpenSerialPort port))) {
		if (and (notNil portName)
				(or (contains (portList this) portName)
				(notNil (findSubstring 'pts' portName)))) { // support for GnuBlocks
			port = (safelyRun (action 'openSerialPort' portName 115200))
			if (not (isClass port 'Integer')) { port = nil } // failed
			if (isNil port) { return }
			// connected!
			disconnected = false
			if ('Browser' == (platform)) { waitMSecs 100 } // let browser callback complete
		}
	}
}

method processMessages SmallRuntime {
	if (isNil recvBuf) { recvBuf = (newBinaryData 0) }
	repeat 100 { // process up to N messages
		if (not (processNextMessage this)) { return } // done!
	}
}

method processNextMessage SmallRuntime {
	// Process the next message, if any. Return false when there are no more messages.

	if (or (isNil port) (not (isOpenSerialPort port))) { return false }

	// Read any available bytes and append to recvBuf
	s = (readSerialPort port true)
	if (notNil s) { recvBuf = (join recvBuf s) }
	if ((byteCount recvBuf) < 3) { return false } // not enough bytes for even a short message

	// Parse and dispatch messages
	firstByte = (byteAt recvBuf 1)
	byteTwo = (byteAt recvBuf 2)
	if (or (byteTwo < 1) (and (40 <= byteTwo) (byteTwo < 200)) (byteTwo > 205)) {
		print 'Serial error, opcode:' (byteAt recvBuf 2)
		discardMessage this
		return true
	}
	if (250 == firstByte) { // short message
		msg = (copyFromTo recvBuf 1 3)
		recvBuf = (copyFromTo recvBuf 4) // remove message
		handleMessage this msg
	} (251 == firstByte) { // long message
		if ((byteCount recvBuf) < 5) { return false } // incomplete length field
		bodyBytes = (((byteAt recvBuf 5) << 8) | (byteAt recvBuf 4))
		if (bodyBytes >= 1024) {
			print 'Serial error, length:' bodyBytes
			discardMessage this
			return true
		}
		if ((byteCount recvBuf) < (5 + bodyBytes)) { return false } // incomplete body
		msg = (copyFromTo recvBuf 1 (bodyBytes + 5))
		recvBuf = (copyFromTo recvBuf (bodyBytes + 6)) // remove message
		handleMessage this msg
	} else {
		print 'Serial error, start byte:' firstByte
		print (toString recvBuf) // show the string (could be an ESP error message)
		discardMessage this
	}
	return true
}

method discardMessage SmallRuntime { skipMessage this true }

method skipMessage SmallRuntime discard {
	// Discard bytes in recvBuf until the start of the next message, if any.

	end = (byteCount recvBuf)
	i = 2
	while (i < end) {
		byte = (byteAt recvBuf i)
		if (or (250 == byte) (251 == byte)) {
		if (true == discard) { print '    ' (toString (copyFromTo recvBuf 1 (i - 1))) }
			recvBuf = (copyFromTo recvBuf i)
			return
		}
		i += 1
	}
	if (true == discard) { print '    ' (toString recvBuf) }
	recvBuf = (newBinaryData 0) // no message start found; discard entire buffer
}
*/

// Message handling

MicroBlocksRuntime.prototype.handleMessage = function(msg) {
	console.log("handleMessage: [" + msg + "]")
	this.lastPingRecvMSecs = Date.now() //(msecsSinceStart) // reset ping timer when any valid message is recevied
	let op = msg[1]
	let chunkID = msg[2]
	if (op == this.msgNameToID('taskStartedMsg')) {
		this.updateRunning(chunkID, true)
	} else if (op == this.msgNameToID('taskDoneMsg')) {
		this.updateRunning(chunkID, false)
	} else if (op == this.msgNameToID('taskReturnedValueMsg')) {
		this.showResult(chunkID, this.returnedValue(msg), false, true)
		this.updateRunning(chunkID, false)
	} else if (op == this.msgNameToID('taskErrorMsg')) {
		this.showError(chunkID, this.errorString(msg[5]))
		this.updateRunning(chunkID, false)
	} else if (op == this.msgNameToID('outputValueMsg')) {
		if (chunkID == 255) { //TODO: What is this for?
			console.log(this.bleDevice().name + " Says: " + this.returnedValue(msg))
		/*} (chunkID == 254) { //For making graphs
			this.addLoggedData(this.returnedValue(msg).toString())*/
		} else {
			this.showResult(chunkID, this.returnedValue(msg), false, true)
		}
	/*} else if (op == this.msgNameToID('varValueMsg')) {
		varValueReceived (httpServer scripter) (byteAt msg 3) (returnedValue this msg)*/
	} else if (op == this.msgNameToID('versionMsg')) {
		this.versionReceived(this.returnedValue(msg))
	} else if (op == this.msgNameToID('chunkCRCMsg')) {
		this.crcReceived(chunkID, msg.slice(5))
	} else if (op == this.msgNameToID('allCRCsMsg')) {
		this.allCRCsReceived(msg.slice(5))
	} else if (op == this.msgNameToID('pingMsg')) {
		this.lastPingRecvMSecs = Date.now() //(msecsSinceStart)
	/*} else if (op == this.msgNameToID('broadcastMsg')) {
		broadcastReceived (httpServer scripter) (toString (copyFromTo msg 6))*/
	} else if (op == this.msgNameToID('chunkCodeMsg')) {
		this.receivedChunk(chunkID, msg[5], msg.slice(6))
	} else if (op == this.msgNameToID('chunkAttributeMsg')) {
		console.log('chunkAttributeMsg: ' + msg.length + ' bytes')
	} else if (op == this.msgNameToID('varNameMsg')) {
		this.receivedVarName(chunkID, String.fromCharCode.apply(null, msg.slice(5)), msg.length - 5) //TODO: check String.fromCharCode.apply
	/*} else if (op == this.msgNameToID('fileInfo')) {
		recordFileTransferMsg this (copyFromTo msg 6)
	} else if (op == this.msgNameToID('fileChunk')) {
		recordFileTransferMsg this (copyFromTo msg 6)*/
	} else {
		console.error( 'Unknown msg: ' + msg )
	}
}

MicroBlocksRuntime.prototype.updateRunning = function(chunkID, runFlag) {
	if (this.chunkRunning == null) {
		this.chunkRunning = []
	}
	if (this.chunkStopping == null) {
		this.chunkStopping = {}
	}
	if (runFlag) {
		this.chunkRunning[chunkID] = runFlag
		delete this.chunkStopping[chunkID]
		this.updateHighlights()
	} else {
		// add chunkID to chunkStopping dictionary to be unhighlighted after a short pause
		let stepCount = 2 // two scripter steps, about half a second
		this.chunkStopping[chunkID] = stepCount
	}
}

/*
method updateStopping SmallRuntime {
	// Decrement the counts for chunks that are stopping.
	// Turn off highlights for chunks whose counts reach zero.

	if (and (isNil chunkStopping) (isEmpty chunkStopping))  { return }
	highlightChanged = false
	for chunkID (keys chunkStopping) {
		count = ((at chunkStopping chunkID) - 1) // decrement count
		if (count > 0) {
			atPut chunkStopping chunkID count // continue to wait
		} else {
			atPut chunkRunning (chunkID + 1) false
			remove chunkStopping chunkID
			highlightChanged = true
		}
	}
	if highlightChanged { updateHighlights this }
}
*/

MicroBlocksRuntime.prototype.isRunning =function(aBlock) {
	let chunkID = this.lookupChunkID(aBlock)
	if ( (this.chunkRunning == null) || (chunkID == null) ) { return false }
	return this.chunkRunning[chunkID]
}

/*
// File Transfer Support

method boardHasFileSystem SmallRuntime {
	if (true == disconnected) { return false }
	if (and (isWebSerial this) (not (isOpenSerialPort 1))) { return false }
	if (isNil port) { return false }
	if (isNil boardType) { getVersion this }
	return (isOneOf boardType 'Citilab ED1' 'M5Stack-Core' 'M5StickC+' 'M5StickC' 'M5Atom-Matrix' 'ESP32' 'ESP8266' 'Mbits' 'RP2040' 'Pico W' 'Pico:ed' 'Wukong2040' 'TTGO RP2040' 'Boardie' 'Databot' 'Mbits')
}

method deleteFileOnBoard SmallRuntime fileName {
	msg = (toArray (toBinaryData fileName))
	sendMsg this 'deleteFile' 0 msg
}

method getFileListFromBoard SmallRuntime {
	if ('boardie' == portName) {
		return (boardieFileList)
	}

	sendMsg this 'listFiles'
	collectFileTransferResponses this

	result = (list)
	for msg fileTransferMsgs {
		fileNum = (readInt32 this msg 1)
		fileSize = (readInt32 this msg 5)
		fileName = (toString (copyFromTo msg 9))
		add result fileName
	}
	return result
}

method getFileFromBoard SmallRuntime {
	setCursor 'wait'
	fileNames = (sorted (toArray (getFileListFromBoard this)))
	fileNames = (copyWithout fileNames 'ublockscode')
	setCursor 'default'
	if (isEmpty fileNames) {
		inform 'No files on board.'
		return
	}
	menu = (menu 'File to read from board:' (action 'getAndSaveFile' this) true)
	for fn fileNames {
		addItem menu fn
	}
	popUpAtHand menu (global 'page')
}

method getAndSaveFile SmallRuntime remoteFileName {
	data = (readFileFromBoard this remoteFileName)
	if ('Browser' == (platform)) {
		browserWriteFile data remoteFileName 'fileFromBoard'
	} else {
		fName = (fileToWrite remoteFileName)
		if ('' != fName) { writeFile fName data }
	}
}

method readFileFromBoard SmallRuntime remoteFileName {
	if ('boardie' == portName) {
		return (boardieGetFile remoteFileName)
	}

	fileTransferProgress = 0
	spinner = (newSpinner (action 'fileTransferProgress' this 'downloaded') (action 'fileTransferCompleted' this))
	setStopAction spinner (action 'abortFileTransfer' this)
	addPart (global 'page') spinner

	msg = (list)
	id = (rand ((1 << 24) - 1))
	appendInt32 this msg id
	addAll msg (toArray (toBinaryData remoteFileName))
	sendMsg this 'startReadingFile' 0 msg
	collectFileTransferResponses this

	totalBytes = 0
	for msg fileTransferMsgs {
		// format: <transfer ID (4 byte int)><byte offset (4 byte int)><data...>
		transferID = (readInt32 this msg 1)
		offset = (readInt32 this msg 5)
		byteCount = ((byteCount msg) - 8)
		totalBytes += byteCount
		if (totalBytes > 0) {
			fileTransferProgress = (100 - (round (100 * (byteCount / totalBytes))))
			doOneCycle (global 'page')
		}
	}

	result = (newBinaryData totalBytes)
	startIndex = 1
	for msg fileTransferMsgs {
		byteCount = ((byteCount msg) - 8)
		endIndex = ((startIndex + byteCount) - 1)
		if (byteCount > 0) { replaceByteRange result startIndex endIndex msg 9 }
		startIndex += byteCount
	}

	fileTransferProgress = nil
	setCursor 'default'
	return result
}

method putFileOnBoard SmallRuntime {
	if ('Browser' == (platform)) {
		putNextDroppedFileOnBoard (findMicroBlocksEditor)
		browserReadFile ''
	} else {
		pickFileToOpen (action 'writeFileToBoard' this)
	}
}

method writeFileToBoard SmallRuntime srcFileName {
	if (notNil (findMorph 'MicroBlocksFilePicker')) {
		destroy (findMorph 'MicroBlocksFilePicker')
	}

	fileData = (readFile srcFileName true)
	if (isNil fileData) { return }

	targetFileName = (filePart srcFileName)
	if ((count targetFileName) > 30) {
		targetFileName = (substring targetFileName 1 30)
	}

	fileTransferProgress = 0
	spinner = (newSpinner (action 'fileTransferProgress' this 'uploaded') (action 'fileTransferCompleted' this))
	setStopAction spinner (action 'abortFileTransfer' this)
	addPart (global 'page') spinner

	sendFileData this targetFileName fileData
}

// busy tells the MicroBlocksEditor to suspend board communciations during file transfers
method busy SmallRuntime { return (notNil fileTransferProgress) }

method fileTransferProgress SmallRuntime actionLabel { return (join '' fileTransferProgress '% ' (localized actionLabel)) }

method abortFileTransfer SmallRuntime {
	if (not (fileTransferCompleted this)) { fileTransferProgress = nil }
}

method fileTransferCompleted SmallRuntime {
	// return true if the file transfer is complete or aborted
	return (or (isNil fileTransferProgress) (fileTransferProgress == 100))
}

method sendFileData SmallRuntime fileName fileData {
	if ('boardie' == portName) {
		boardiePutFile fileName fileData (byteCount fileData)
		return
	}

	// send data as a sequence of chunks
	setCursor 'wait'
	fileTransferProgress = 0

	totalBytes = (byteCount fileData)
	id = (rand ((1 << 24) - 1))
	bytesSent = 0

	msg = (list)
	appendInt32 this msg id
	addAll msg (toArray (toBinaryData fileName))
	sendMsgSync this 'startWritingFile' 0 msg

	while (bytesSent < totalBytes) {
		if (isNil fileTransferProgress) {
			print 'File transfer aborted.'
			return
		}
		msg = (list)
		appendInt32 this msg id
		appendInt32 this msg bytesSent
		chunkByteCount = (min 960 (totalBytes - bytesSent))
		repeat chunkByteCount {
			bytesSent += 1
			add msg (byteAt fileData bytesSent)
		}
		sendMsgSync this 'fileChunk' 0 msg
		if (totalBytes > 0) {
			fileTransferProgress = (round (100 * (bytesSent / totalBytes)))
			doOneCycle (global 'page')
		}
	}
	// final (empty) chunk
	msg = (list)
	appendInt32 this msg id
	appendInt32 this msg bytesSent
	sendMsgSync this 'fileChunk' 0 msg

	fileTransferProgress = nil
}

method appendInt32 SmallRuntime msg n {
	add msg (n & 255)
	add msg ((n >> 8) & 255)
	add msg ((n >> 16) & 255)
	add msg ((n >> 24) & 255)
}

method readInt32 SmallRuntime msg i {
	result = (byteAt msg i)
	result += ((byteAt msg (i + 1)) << 8)
	result += ((byteAt msg (i + 2)) << 16)
	result += ((byteAt msg (i + 3)) << 24)
	return result
}

method collectFileTransferResponses SmallRuntime {
	fileTransferMsgs = (list)
	timeout = 1000
	lastRcvMSecs = (msecsSinceStart)
	while (((msecsSinceStart) - lastRcvMSecs) < timeout) {
		if (notEmpty fileTransferMsgs) { timeout = 500 } // decrease timeout after first response
		processMessages this
		doOneCycle (global 'page')
		waitMSecs 10
	}
}

method recordFileTransferMsg SmallRuntime msg {
	// Record a file transfer message sent by board.

	if (notNil fileTransferMsgs) { add fileTransferMsgs msg }
	lastRcvMSecs = (msecsSinceStart)
}
*/

// Script Highlighting

MicroBlocksRuntime.prototype.clearRunningHighlights = function() {
	this.chunkRunning = Array(256).fill(false) // clear all running flags
	this.updateHighlights()
}

MicroBlocksRuntime.prototype.updateHighlights = function() {
	//TODO: we should do it here too somehow.

	/*scale = (global 'scale')
	for m (parts (morph (scriptEditor scripter))) {
		if (isClass (handler m) 'Block') {
			if (isRunning this (handler m)) {
				addHighlight m
			} else {
				removeHighlight m
			}
		}
	}*/
}

/*
method removeResultBubbles SmallRuntime {
	for m (allMorphs (morph (global 'page'))) {
		h = (handler m)
		if (and (isClass h 'SpeechBubble') (isClass (handler (clientMorph h)) 'Block')) {
			removeFromOwner m
		}
	}
}
*/

MicroBlocksRuntime.prototype.showError = function(chunkID, msg) {
	this.showResult(chunkID, msg, true)
}

MicroBlocksRuntime.prototype.showResult = function(chunkID, value, isError, isResult) {
	console.error("Still need to implement showResult. Results: " + chunkID + ", " + value + ", " + isError + ", " + isResult)
	/*for m (join
			(parts (morph (scriptEditor scripter)))
			(parts (morph (blockPalette scripter)))) {
		h = (handler m)
		if (and (isClass h 'Block') (chunkID == (lookupChunkID this h))) {
			if (true == isError) {
				showError m value
			} else {
				showHint m value nil false
			}
			if (or (isNil value) ('' == value)) {
				removeHintForMorph (global 'page') m
			} else {
				if (shiftKeyDown (keyboard (global 'page'))) {
					setClipboard (toString value)
				}
			}
			if (and (true == isResult) (h == blockForResultImage)) {
				blockForResultImage = nil
				doOneCycle (global 'page')
				waitMSecs 500 // show result bubble briefly before showing menu
				exportAsImageScaled h value
			}
			if (and (true == isError) (h == blockForResultImage)) {
				blockForResultImage = nil
				doOneCycle (global 'page')
				waitMSecs 500 // show error bubble briefly before showing menu
				exportAsImageScaled h value true
			}
		}
	}*/
}

/*
method exportScriptImageWithResult SmallRuntime aBlock {
	topBlock = (topBlock aBlock)
	if (isPrototypeHat topBlock) { return }
	blockForResultImage = topBlock
	if (not (isRunning this topBlock)) {
		evalOnBoard this topBlock
	}
}
*/

// Return values

MicroBlocksRuntime.prototype.returnedValue = function(msg) {
	let byteCount = msg.length
	if (byteCount < 7) { return null } // incomplete msg

	let type = msg[5]
	if (1 == type) {
		if (byteCount < 10) { return null } // incomplete msg
		return ( (msg[9] << 24) + (msg[8] << 16) + (msg[7] << 8) + msg[6] )
	} else if (2 == type) {
		return (String.fromCharCode.apply(null, msg.slice(6))) //stringFromByteRange msg 7 (byteCount msg))
	} else if (3 == type) {
		return (0 != msg[6])
	} else if (4 == type) {
		if (byteCount < 8) { return null } // incomplete msg
		let total = ((msg[7] << 8) | (msg[6]))
		if (total == 0) { return '[empty list]' }
		let sentItems = this.readItems(msg)
		let out = ['[']
		for (let i = 0; i < sentItems.length; i++) {
			let item = sentItems[i]
			out.push(item.toString())
			out.push(', ')
		}
		if ((out.length) > 1) { out.pop() }
		if (total > (sentItems.length)) {
			out.push(' ... and ' + (total - sentItems.length) + ' more')
		}
		out.push(']')
		return (out.join(''))
	} else if (5 == type) {
		if (byteCount < 9) { return null } // incomplete msg
		let total = ((msg[7] << 8) | (msg[6]))
		if (total == 0) { return '(empty byte array)' }
		let sentCount = msg[8]
		sentCount = Math.min(sentCount, (byteCount - 9))
		let out = ['(']
		for (let i = 0; i < sentCount; i++) {
			out.push(msg[9 + i].toString())
			out.push(', ')
		}
		if (out.length > 1) { out.pop() }
		if (total > sentCount) {
			out.push(' ... and ' + (total - sentCount) + ' more bytes')
		}
		out.push(')')
		return (out.join(''))
	} else {
		console.error('Serial error, type: ' + type)
		return null
	}
}

MicroBlocksRuntime.prototype.readItems = function(msg) {
	// Read a sequence of list items from the given value message.

	let result = []
	let byteCount = msg.length
	if (byteCount < 10) { return result } // corrupted msg
	let count = msg[8]
	let i = 9 //10
	for (let j = 0; j < count; j++) { //repeat count {
		if (byteCount < (i + 2)) { return result } // corrupted msg
		let itemType = msg[i]
		if (1 == itemType) { // integer
			if (byteCount < (i + 5)) { return result } // corrupted msg
			let n = ((msg[i + 4] << 24) + (msg[i + 3] << 16) +
					(msg[i + 2] << 8) + (msg[i + 1]))
			result.push(n)
			i += 5
		} else if (2 == itemType) { // string
			let len = msg[i + 1]
			if (byteCount < (i + len + 2)) { return result } // corrupted msg
			result.push(String.fromCharCode.apply(null, msg.slice( (i + 2), (i + len + 1) ) ))
			i += (len + 2)
		} else if (3 == itemType) { // boolean
			let isTrue = (msg[i + 1] != 0)
			result.push(isTrue)
			i += 2
		} else if (4 == itemType) { // sublist
			if (byteCount < (i + 4)) { return result } // corrupted msg
			let n = ((msg[i + 2] << 8) + (msg[i + 1]))
			if (0 != msg[i + 3]) {
				console.log('skipping sublist with non-zero sent items')
				return result
			}
			result.push('[' + n + ' item list]')
			i += 4
		} else if (5 == itemType) { // bytearray
			if (byteCount < (i + 4)) { return result } // corrupted msg
			let n = ((msg[i + 2] << 8) + (msg[i + 1]))
			if (0 != msg[i + 3]) {
				console.log('skipping bytearray with non-zero sent items inside a list')
				return result
			}
			result.push('(' + n + ' bytes)')
			i += 4
		} else {
			console.error('unknown item type in value message: ' + itemType)
			return result
		}
	}
	return result
}

/*
method showOutputStrings SmallRuntime {
	// For debuggong. Just display incoming characters.
	if (isNil port) { return }
	s = (readSerialPort port)
	if (notNil s) {
		if (isNil recvBuf) { recvBuf = '' }
		recvBuf = (toString recvBuf)
		recvBuf = (join recvBuf s)
		while (notNil (findFirst recvBuf (newline))) {
			i = (findFirst recvBuf (newline))
			out = (substring recvBuf 1 (i - 2))
			recvBuf = (substring recvBuf (i + 1))
			print out
		}
	}
}

// Virtual Machine Installer

method installVM SmallRuntime eraseFlashFlag downloadLatestFlag {
	if ('Browser' == (platform)) {
		installVMInBrowser this eraseFlashFlag downloadLatestFlag
		return
	}
	boards = (collectBoardDrives this)
	if ((count boards) == 1) {
		b = (first boards)
		copyVMToBoard this (first b) (last b)
	} ((count boards) > 1) {
		menu = (menu 'Select board:' this)
		for b boards {
			addItem menu (niceBoardName this b) (action 'copyVMToBoard' this (first b) (last b))
		}
		popUpAtHand menu (global 'page')
	} (notNil boardType) {
		if (and (contains (array 'ESP8266' 'ESP32' 'Citilab ED1' 'M5Stack-Core' 'Databot' 'Mbits') boardType)
				(confirm (global 'page') nil (join (localized 'Use board type ') boardType '?'))) {
			flashVM this boardType eraseFlashFlag downloadLatestFlag
		} (isOneOf boardType 'CircuitPlayground' 'CircuitPlayground Bluefruit' 'Clue' 'Metro M0' 'MakerPort') {
			adaFruitResetMessage this
		} (isOneOf boardType 'RP2040' 'Pico W' 'Pico:ed' 'Wukong2040') {
			rp2040ResetMessage this
		}
	} else {
		disconnected = true
		closePort this
		menu = (menu 'Select board type:' this)
		if (not eraseFlashFlag) {
			for boardName (array 'microbit' 'Calliope mini') {
				addItem menu boardName (action 'noBoardFoundMessage' this)
			}
			addLine menu
		}
		for boardName (array 'Citilab ED1' 'M5Stack-Core' 'ESP32' 'ESP8266' 'Databot' 'Mbits') {
			addItem menu boardName (action 'flashVM' this boardName eraseFlashFlag downloadLatestFlag)
		}
		if (not eraseFlashFlag) {
			addLine menu
			addItem menu 'ELECFREAKS Pico:ed' (action 'rp2040ResetMessage' this)
			addItem menu 'ELECFREAKS Wukong2040' (action 'rp2040ResetMessage' this)
			addItem menu 'RP2040 (Pico or Pico-W)' (action 'rp2040ResetMessage' this)
			addItem menu 'Adafruit Board' (action 'adaFruitResetMessage' this)
			addItem menu 'MakerPort' (action 'adaFruitResetMessage' this)
		}
		popUpAtHand menu (global 'page')
	}
}

method niceBoardName SmallRuntime board {
	name = (first board)
	if (beginsWith name 'MICROBIT') {
		return 'micro:bit'
	} (beginsWith name 'MINI') {
		return 'Calliope mini'
	} (beginsWith name 'CPLAYBOOT') {
		return 'Circuit Playground Express'
	} (beginsWith name 'CPLAYBTBOOT') {
		return 'Circuit Playground Bluefruit'
	} (beginsWith name 'CLUE') {
		return 'Clue'
	} (beginsWith name 'METRO') {
		return 'Metro M0'
	} (beginsWith name 'RPI-RP2') {
		return 'Raspberry Pi Pico'
	}
	return name
}

method collectBoardDrives SmallRuntime {
	result = (list)
	if ('Mac' == (platform)) {
		for v (listDirectories '/Volumes') {
			path = (join '/Volumes/' v '/')
			driveName = (getBoardDriveName this path)
			if (notNil driveName) { add result (list driveName path) }
		}
	} ('Linux' == (platform)) {
		for dir (listDirectories '/media') {
			prefix = (join '/media/' dir)
			for v (listDirectories prefix) {
				path = (join prefix '/' v '/')
				driveName = (getBoardDriveName this path)
				if (notNil driveName) { add result (list driveName path) }
			}
		}
	} ('Win' == (platform)) {
		for letter (range 65 90) {
			drive = (join (string letter) ':')
			driveName = (getBoardDriveName this drive)
			if (notNil driveName) { add result (list driveName drive) }
		}
	}
	return result
}

method getBoardDriveName SmallRuntime path {
	for fn (listFiles path) {
		if ('MICROBIT.HTM' == fn) {
			contents = (readFile (join path fn))
			return 'MICROBIT' }
		if (or ('MINI.HTM' == fn) ('Calliope.html' == fn)) { return 'MINI' }
		if ('INFO_UF2.TXT' == fn) {
			contents = (readFile (join path fn))
			if (notNil (nextMatchIn 'CPlay Express' contents)) { return 'CPLAYBOOT' }
			if (notNil (nextMatchIn 'Circuit Playground nRF52840' contents)) { return 'CPLAYBTBOOT' }
			if (notNil (nextMatchIn 'Adafruit Clue' contents)) { return 'CLUEBOOT' }
			if (notNil (nextMatchIn 'Adafruit CLUE nRF52840' contents)) { return 'CLUEBOOT' } // bootloader 0.7
			if (notNil (nextMatchIn 'Metro M0' contents)) { return 'METROBOOT' }
			if (notNil (nextMatchIn 'MakerPort' contents)) { return 'MAKERBOOT' }
			if (notNil (nextMatchIn 'RPI-RP2' contents)) { return 'RPI-RP2' }
		}
	}
	return nil
}

method picoVMFileName SmallRuntime {
	tmp = (array nil)
	menu = (menu 'Pico board type?' (action 'atPut' tmp 1) true)
	addItem menu 'ELECFREAKS Pico:ed'
	addItem menu 'ELECFREAKS Wukong2040'
	addItem menu 'RP2040 (Pico or Pico W)'
	waitForSelection menu
	result = (first tmp)
	if ('ELECFREAKS Pico:ed' == result) {
		return 'vm_pico_ed.uf2'
	} ('ELECFREAKS Wukong2040' == result) {
		return 'vm_wukong2040.uf2'
	} ('RP2040 (Pico or Pico W)' == result) {
		return 'vm_pico_w.uf2'
	}
	return 'none'
}

method copyVMToBoard SmallRuntime driveName boardPath {
	// disable auto-connect and close the serial port
	disconnected = true
	closePort this

	if ('MICROBIT' == driveName) {
		vmFileName = 'vm_microbit-universal.hex'
 	} ('MINI' == driveName) {
		vmFileName = 'vm_calliope.hex'
	} ('CPLAYBOOT' == driveName) {
		vmFileName = 'vm_circuitplay.uf2'
	} ('CPLAYBTBOOT' == driveName) {
		vmFileName = 'vm_cplay52.uf2'
	} ('CLUEBOOT' == driveName) {
		vmFileName = 'vm_clue.uf2'
	} ('METROBOOT' == driveName) {
		vmFileName = 'vm_metroM0.uf2'
	} ('MAKERBOOT' == driveName) {
		vmFileName = 'vm_makerport.uf2'
	} ('RPI-RP2' == driveName) {
		vmFileName = (picoVMFileName this)
	} else {
		print 'unknown drive name in "copyVMToBoard"' // shouldn't happen
		return
	}
	vmData = (readEmbeddedFile (join 'precompiled/' vmFileName) true)
	if (isNil vmData) {
		error (join (localized 'Could not read: ') (join 'precompiled/' vmFileName))
	}
	writeFile (join boardPath vmFileName) vmData
	print 'Installed' (join boardPath vmFileName) (join '(' (byteCount vmData) ' bytes)')
	waitMSecs 2000
	if (isOneOf driveName 'MICROBIT' 'MINI') { waitMSecs 4000 }
	disconnected = false
}

// Browser Virtual Machine Intaller

method installVMInBrowser SmallRuntime eraseFlashFlag downloadLatestFlag {
	if ('micro:bit' == boardType) {
		copyVMToBoardInBrowser this eraseFlashFlag downloadLatestFlag 'micro:bit'
	} ('micro:bit v2' == boardType) {
		copyVMToBoardInBrowser this eraseFlashFlag downloadLatestFlag 'micro:bit v2'
	} ('Calliope' == boardType) {
		copyVMToBoardInBrowser this eraseFlashFlag downloadLatestFlag 'Calliope mini'
	} ('CircuitPlayground' == boardType) {
		copyVMToBoardInBrowser this eraseFlashFlag downloadLatestFlag 'Circuit Playground Express'
	} ('CircuitPlayground Bluefruit' == boardType) {
		copyVMToBoardInBrowser this eraseFlashFlag downloadLatestFlag 'Circuit Playground Bluefruit'
	} ('Clue' == boardType) {
		copyVMToBoardInBrowser this eraseFlashFlag downloadLatestFlag 'Clue'
	} ('Metro M0' == boardType) {
		copyVMToBoardInBrowser this eraseFlashFlag downloadLatestFlag 'Metro M0'
	} ('MakerPort' == boardType) {
		copyVMToBoardInBrowser this eraseFlashFlag downloadLatestFlag 'Metro M0'
	} (isOneOf boardType 'RP2040' 'Pico W' 'Pico:ed' 'Wukong2040') {
		rp2040ResetMessage this
	} (and
		(isOneOf boardType 'Citilab ED1' 'M5Stack-Core' 'ESP32' 'ESP8266' 'Databot' 'Mbits')
		(confirm (global 'page') nil (join (localized 'Use board type ') boardType '?'))) {
			flashVM this boardType eraseFlashFlag downloadLatestFlag
	} else {
		menu = (menu 'Select board type:' (action 'copyVMToBoardInBrowser' this eraseFlashFlag downloadLatestFlag) true)
		if eraseFlashFlag {
			addItem menu 'Citilab ED1'
			addItem menu 'Databot'
			addItem menu 'M5Stack-Core'
			addItem menu 'ESP32'
			addItem menu 'ESP8266'
			addItem menu 'Mbits'
		} else {
			addItem menu 'micro:bit'
			addItem menu 'Calliope mini'
			addLine menu
			addItem menu 'Citilab ED1'
			addItem menu 'Databot'
			addLine menu
			addItem menu 'ELECFREAKS Pico:ed'
			addItem menu 'ELECFREAKS Wukong2040'
			addItem menu 'RP2040 (Pico or Pico W)'
			addLine menu
			addItem menu 'MakerPort'
			addLine menu
			addItem menu 'Circuit Playground Express'
			addItem menu 'Circuit Playground Bluefruit'
			addItem menu 'Clue'
			addItem menu 'Metro M0'
			addLine menu
			addItem menu 'M5Stack-Core'
			addItem menu 'ESP32'
			addItem menu 'ESP8266'
			addItem menu 'Mbits'
		}
		popUpAtHand menu (global 'page')
	}
}

method flashVMInBrowser SmallRuntime boardName eraseFlashFlag downloadLatestFlag {
	if (isNil port) {
		// prompt user to open the serial port
		selectPort this
		timeout = 10000 // ten seconds
		start = (msecsSinceStart)
		while (and (not (isOpenSerialPort 1)) (((msecsSinceStart) - start) < timeout)) {
			// do UI cycles until serial port is opened or timeout
			doOneCycle (global 'page')
			waitMSecs 10 // refresh screen
		}
	}
	if (isOpenSerialPort 1) {
		port = 1
		flashVM this boardName eraseFlashFlag downloadLatestFlag
	}
}

method copyVMToBoardInBrowser SmallRuntime eraseFlashFlag downloadLatestFlag boardName {
	if (isOneOf boardName 'Citilab ED1' 'M5Stack-Core' 'ESP32' 'ESP8266' 'Databot' 'Mbits') {
		flashVMInBrowser this boardName eraseFlashFlag downloadLatestFlag
		return
	}

	if ('micro:bit' == boardName) {
		vmFileName = 'vm_microbit-universal.hex'
		driveName = 'MICROBIT'
	} ('micro:bit v2' == boardName) {
		vmFileName = 'vm_microbit-universal.hex'
		driveName = 'MICROBIT'
	} ('Calliope mini' == boardName) {
		vmFileName = 'vm_calliope.hex'
		driveName = 'MINI'
	} ('Circuit Playground Express' == boardName) {
		vmFileName = 'vm_circuitplay.uf2'
		driveName = 'CPLAYBOOT'
	} ('Circuit Playground Bluefruit' == boardName) {
		vmFileName = 'vm_cplay52.uf2'
		driveName = 'CPLAYBTBOOT'
	} ('Clue' == boardName) {
		vmFileName = 'vm_clue.uf2'
		driveName = 'CLUEBOOT'
	} ('Metro M0' == boardName) {
		vmFileName = 'vm_metroM0.uf2'
		driveName = 'METROBOOT'
	} ('MakerPort' == boardName) {
		vmFileName = 'vm_makerport.uf2'
		driveName = 'MAKERBOOT'
	} ('RP2040 (Pico or Pico W)' == boardName) {
		vmFileName = 'vm_pico_w.uf2'
		driveName = 'RPI-RP2'
	} ('ELECFREAKS Pico:ed' == boardName) {
		vmFileName = 'vm_pico_ed.uf2'
		driveName = 'RPI-RP2'
	} ('ELECFREAKS Wukong2040' == boardName) {
		vmFileName = 'vm_wukong2040.uf2'
		driveName = 'RPI-RP2'
	} else {
		return // bad board name
	}

	prefix = ''
	if (endsWith vmFileName '.uf2') {
		if ('RPI-RP2' == driveName) {
			// Extra instruction for RP2040 Pico
			prefix = (join
				prefix
				(localized 'Connect USB cable while holding down the white BOOTSEL button before proceeding.')
				(newline) (newline))
		} ('MAKERBOOT' == driveName) {
			// Extra instruction for MakerPort
			prefix = (join
				prefix
				(localized 'Press the reset button on the board twice before proceeding.')
				(newline) (newline))
		} else {
			// Extra instruction for Adafruit boards
			prefix = (join
				prefix
				(localized 'Press the reset button on the board twice before proceeding. The NeoPixels should turn green.')
				(newline) (newline))
		}
	}
	msg = (join
		prefix
		(localized 'You will be asked to save the firmware file.')
		(newline)
		(newline)
		(localized 'Select')
		' ' driveName ' '
		(localized 'as the destination drive, then click Save.'))
	response = (inform msg (localized 'Firmware Install'))
	if (isNil response) { return }

	vmData = (readFile (join 'precompiled/' vmFileName) true)
	if (isNil vmData) { return } // could not read file

	// disconnect before updating VM; avoids micro:bit autoconnect issue on Chromebooks
	disconnected = true
	closePort this
	updateIndicator (findMicroBlocksEditor)

	if (endsWith vmFileName '.hex') {
		// for micro:bit, filename must be less than 9 letter before the extension
		vmFileName = 'firmware.hex'
		waitForFirmwareInstall this
	}

	browserWriteFile vmData vmFileName 'vmInstall'

	if (endsWith vmFileName '.uf2') {
		waitMSecs 1000 // leave time for file dialog box to appear before showing next prompt
		if (or ('MAKERBOOT' == driveName) ('RPI-RP2' == driveName)) {
			otherReconnectMessage this
		} else {
			adaFruitReconnectMessage this
		}
	}
}

method noBoardFoundMessage SmallRuntime {
	inform (localized 'No boards found; is your board plugged in?') 'No boards found'
}

method adaFruitResetMessage SmallRuntime {
	inform (localized 'For Adafruit boards and MakerPort, double-click reset button and try again.')
}

method adaFruitReconnectMessage SmallRuntime {
	msg = (join
		(localized 'When the NeoPixels turn off') ', '
		(localized 'reconnect to the board by clicking the "Connect" button (USB icon).'))
	inform msg
}

method rp2040ResetMessage SmallRuntime {
	inform (localized 'Connect USB cable while holding down the white BOOTSEL button and try again.')
}

method otherReconnectMessage SmallRuntime {
	title = (localized 'Firmware Installed')
	msg = (localized 'Reconnect to the board by clicking the "Connect" button (USB icon).')
	inform (global 'page') msg title nil true
}

method waitForFirmwareInstall SmallRuntime {
	firmwareInstallTimer = nil
	spinner = (newSpinner (action 'firmwareInstallStatus' this) (action 'firmwareInstallDone' this))
	addPart (global 'page') spinner
}

method startFirmwareCountdown SmallRuntime fileName {
	// Called by editor after firmware file is saved.

	if ('_no_file_selected_' == fileName) {
		spinner = (findMorph 'MicroBlocksSpinner')
		if (notNil spinner) { destroy (handler spinner) }
	} else {
		firmwareInstallTimer = (newTimer)
	}
}

method firmwareInstallSecsRemaining SmallRuntime {
	if (isNil firmwareInstallTimer) { return 0 }
	installWaitMSecs = 6000
	if (and ('Browser' == (platform)) (browserIsChromeOS)) {
		installWaitMSecs = 16000
	}
	return (ceiling ((installWaitMSecs - (msecs firmwareInstallTimer)) / 1000))
}

method firmwareInstallStatus SmallRuntime {
	if (isNil firmwareInstallTimer) { return 'Installing firmware...' }
	return (join '' (firmwareInstallSecsRemaining this) ' ' (localized 'seconds remaining') '.')
}

method firmwareInstallDone SmallRuntime {
	if (isNil firmwareInstallTimer) { return false }

	if ((firmwareInstallSecsRemaining this) <= 0) {
		firmwareInstallTimer = nil
		otherReconnectMessage this
		return true
	}
	return false
}

// espressif board flashing

method flasher SmallRuntime { return flasher }

method confirmRemoveFlasher SmallRuntime { // xxx needed?
	ok = (confirm
		(global 'page')
		nil
		(localized 'Are you sure you want to cancel the upload process?'))
	if ok { removeFlasher this }
}

method removeFlasher SmallRuntime {
	destroy flasher
	flasher = nil
}

method flashVM SmallRuntime boardName eraseFlashFlag downloadLatestFlag {
	if ('Browser' == (platform)) {
		disconnected = true
		flasherPort = port
		port = nil
	} else {
		setPort this 'disconnect'
		flasherPort = nil
	}
	flasher = (newFlasher boardName portName eraseFlashFlag downloadLatestFlag)
	addPart (global 'page') (spinner flasher)
	startFlasher flasher flasherPort
}

// data logging

method lastDataIndex SmallRuntime { return loggedDataNext }

method clearLoggedData SmallRuntime {
	loggedData = (newArray 10000)
	loggedDataNext = 1
	loggedDataCount = 0
}

method addLoggedData SmallRuntime s {
	atPut loggedData loggedDataNext s
	loggedDataNext = ((loggedDataNext % (count loggedData)) + 1)
	if (loggedDataCount < (count loggedData)) { loggedDataCount += 1 }
}

method loggedData SmallRuntime howMany {
	if (or (isNil howMany) (howMany > loggedDataCount)) {
		howMany = loggedDataCount
	}
	result = (newArray howMany)
	start = (loggedDataNext - howMany)
	if (start > 0) {
		replaceArrayRange result 1 howMany loggedData start
	} else {
		tailCount = (- start)
		tailStart = (((count loggedData) - tailCount) + 1)
		replaceArrayRange result 1 tailCount loggedData tailStart
		replaceArrayRange result (tailCount + 1) howMany loggedData 1
	}
	return result
}
*/
