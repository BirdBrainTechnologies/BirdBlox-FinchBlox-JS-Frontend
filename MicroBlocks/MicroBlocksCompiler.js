/**
 * Class to compile block programs into a form usable by the MicroBlocks VM.
 */

function MicroBlocksCompiler () {
	// Initialize the opcode dictionary. Note: This must match the opcode table in interp.c!

	let opcodeDefinitions = `
		halt 0
		noop 1
		pushImmediate 2		// true, false, and ints that fit in 24 bits
		pushBigImmediate 3	// ints that do not fit in 24 bits
		pushLiteral 4		// string or array constant from literals frame
		pushVar 5
		storeVar 6
		incrementVar 7
		pushArgCount 8
		pushArg 9
		storeArg 10
		incrementArg 11
		pushLocal 12
		storeLocal 13
		incrementLocal 14
		pop 15
		jmp 16
		jmpTrue 17
		jmpFalse 18
		decrementAndJmp 19
		callFunction 20
		returnResult 21
		waitMicros 22
		waitMillis 23
		sendBroadcast 24
		recvBroadcast 25
		stopAll 26
		forLoop 27
		initLocals 28
		getArg 29
		getLastBroadcast 30
		jmpOr 31
		jmpAnd 32
		minimum 33
		maximum 34
		< 35
		<= 36
		== 37
		!= 38
		>= 39
		> 40
		not 41
		+ 42
		- 43
		* 44
		/ 45
		% 46
		absoluteValue 47
		random 48
		hexToInt 49
		& 50
		| 51
		^ 52
		~ 53
		<< 54
		>> 55
		longMult 56
		isType 57
		waitUntil 58
		ignoreArgs 59
		newList 60
	RESERVED 61
		fillList 62
		at 63
		atPut 64
		size 65
	RESERVED 66
	RESERVED 67
	RESERVED 68
	RESERVED 69
		millisOp 70
		microsOp 71
		timer 72
		resetTimer 73
		sayIt 74
		printIt 75
		boardType 76
		comment 77
	RESERVED 78
	RESERVED 79
		analogPins 80
		digitalPins 81
		analogReadOp 82
		analogWriteOp 83
		digitalReadOp 84
		digitalWriteOp 85
		digitalSet 86
		digitalClear 87
		buttonA 88
		buttonB 89
		setUserLED 90
		i2cSet 91
		i2cGet 92
		spiSend 93
		spiRecv 94
	RESERVED 95
	RESERVED 96
	RESERVED 97
	RESERVED 98
	RESERVED 99
	RESERVED 100
	RESERVED 101
	RESERVED 102
	RESERVED 103
	RESERVED 104
	RESERVED 105
	RESERVED 106
	RESERVED 107
	RESERVED 108
	RESERVED 109
	RESERVED 110
	RESERVED 111
	RESERVED 112
	RESERVED 113
	RESERVED 114
	RESERVED 115
	RESERVED 116
	RESERVED 117
	RESERVED 118
	RESERVED 119
	RESERVED 120
	RESERVED 121
	RESERVED 122
	RESERVED 123
		callCustomCommand 124
		callCustomReporter 125
		callCommandPrimitive 126
		callReporterPrimitive 127
		metadata 240`

	this.opcodes = {}
	let lines = opcodeDefinitions.split(/\r?\n/)
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i]
		let words = line.trim().split(/\s+/)
		if ((words.length > 1) && ('RESERVED' != words[0])) {
			this.opcodes[words[0]] = parseInt(words[1])
		}
	}

	// renamed opcodes:
	this.opcodes['newArray'] = 60
	this.opcodes['fillArray'] = 62

	//////

	this.argNames = {}
	this.localVars = {}
	this.falseObj = 0
	this.trueObj = 4
	this.zeroObj = ((0 << 1) | 1)
	this.oneObj = ((1 << 1) | 1)
	this.stringClassID = 4
}

MicroBlocksCompiler.prototype.instructionsFor = function(aBlockOrFunction) {
	// Return a list of instructions for the given block, script, or function.
	// Add a 'halt' if needed and append any literals (e.g. strings) used.

	/*if (and (isClass aBlockOrFunction 'Block') (isPrototypeHat aBlockOrFunction)) {
		// function definition hat: get its function
		aBlockOrFunction = (function (editedPrototype aBlockOrFunction))
	}*/

	/*argNames = (dictionary)
	if (isClass aBlockOrFunction 'Function') {
		func = aBlockOrFunction
		for a (argNames func) {
			atPut argNames a (count argNames)
		}
		cmdOrReporter = (cmdList func)
		if (isNil cmdOrReporter) { // a function hat without any blocks
			cmdOrReporter = (newCommand 'noop')
		}
	} (or (isClass aBlockOrFunction 'Command') (isClass aBlockOrFunction 'Reporter')) {
		cmdOrReporter = aBlockOrFunction
	} else {
		cmdOrReporter = (expression aBlockOrFunction)
	}*/

	/*assignFunctionIDs (smallRuntime)
	collectVars this cmdOrReporter

	result = (list (array 'initLocals' (count localVars)))*/

	/*if (isClass cmdOrReporter 'Command') {
		op = (primName cmdOrReporter)
		if ('whenCondition' == op) {
			addAll result (instructionsForWhenCondition this cmdOrReporter)
		} ('whenButtonPressed' == op) {
			addAll result (instructionsForCmdList this (nextBlock cmdOrReporter))
			add result (array 'halt' 0)
		} ('whenStarted' == op) {
			addAll result (instructionsForCmdList this (nextBlock cmdOrReporter))
			add result (array 'halt' 0)
		} ('whenBroadcastReceived' == op) {
			addAll result (instructionsForExpression this (first (argList cmdOrReporter)))
			add result (array 'recvBroadcast' 1)
			addAll result (instructionsForCmdList this (nextBlock cmdOrReporter))
			add result (array 'halt' 0)
		} (isClass aBlockOrFunction 'Function') {
			if (or ('noop' != (primName cmdOrReporter)) (notNil (nextBlock cmdOrReporter))) {
				if (isEmpty (argNames func)) {
					add result (array 'pushLiteral' (functionName func))
					add result (array 'recvBroadcast' 1)
				}
				addAll result (instructionsForCmdList this cmdOrReporter)
			}
			add result (array 'pushImmediate' falseObj)
			add result (array 'returnResult' 0)
		} else {
			addAll result (instructionsForCmdList this cmdOrReporter)
			add result (array 'halt' 0)
		}
	} else {
		addAll result (instructionsForCmdList this (newReporter 'return' cmdOrReporter))
	}*/

	let result = [['initLocals', 0]] //just to match microblocks. we have no local variables for now
	if (aBlockOrFunction instanceof B_WhenFlagTapped) {
		result = result.concat(this.instructionsForCmdList(aBlockOrFunction.nextBlock))
		result.push(['halt', 0])
	} else if (aBlockOrFunction instanceof CommandBlock) {
		result.push.apply(result, this.instructionsForCmdList(aBlockOrFunction))
		result.push(['halt', 0])
	} else if (aBlockOrFunction instanceof ReporterBlock) {
		console.error("Still need to implement reporter blocks!")
	}


	if ( (result.length == 2) && (['halt', 'stopAll'].includes(result[0])) ) {
			// In general, just looking at the final instructon isn't enough because
			// it could just be the end of a conditional body that is jumped
			// over; in that case, we need the final halt as the jump target.
			result.pop() // remove the final halt
	}
	this.appendLiterals(result)
	this.appendDecompilerMetadata(aBlockOrFunction, result)
	return result
}

// instruction generation: when hat block

MicroBlocksCompiler.prototype.instructionsForWhenCondition = function(cmdOrReporter) {
	let condition = this.instructionsForExpression(cmdOrReporter.argList[0])
	let body = this.instructionsForCmdList(cmdOrReporter.nextBlock)
	let result = []

	// wait until condition becomes true
	result = result.concat(this.instructionsForExpression(10))
	result.push(['waitMillis', 1])
	result = result.concat(condition)
	result.push(['jmpFalse', (0 - (condition.length + 3))])

	result = result.concat(body)

	// loop back to condition test
	result.push(['jmp', (0 - (result.length + 1))])
	return result
}

// instruction generation: command lists and control structures

MicroBlocksCompiler.prototype.instructionsForCmdList = function(cmdList) {
	let result = []
	let cmd = cmdList
	while (cmd != null) {
		result = result.concat(this.instructionsForCmd(cmd))
		cmd = (cmd.nextBlock)
	}
	return result
}

MicroBlocksCompiler.prototype.instructionsForCmd = function(cmd) {
	let result = []
	let op = cmd.primName()
	let args = cmd.argList()

	/*if (isOneOf op '=' 'local') {
		addAll result (instructionsForExpression this (at args 2))
		add result (setVar this (first args))
	} ('+=' == op) {
		addAll result (instructionsForExpression this (at args 2))
		add result (incrementVar this (first args))
	} ('return' == op) {
		if (0 == (count args)) {
			add result (array 'pushImmediate' zeroObj)
		} else {
			addAll result (instructionsForExpression this (at args 1))
		}
		add result (array 'returnResult' 0)
	} else*/ if ('stopTask' == op) {
		result.push(['halt', 0])
	} else if ('forever' == op) {
		return this.instructionsForForever(args)
	/*} ('if' == op) {
		return (instructionsForIf this args)*/
	} else if ('repeat' == op) {
		return this.instructionsForRepeat(args)
	/*} ('repeatUntil' == op) {
		return (instructionsForRepeatUntil this args)*/
	} else if ('waitUntil' == op) {
		return this.instructionsForWaitUntil(args)
	/*} ('for' == op) {
		return (instructionsForForLoop this args)
	} (and ('digitalWriteOp' == op) (isClass (first args) 'Integer') (isClass (last args) 'Boolean')) {
		pinNum = ((first args) & 255)
		if (true == (last args)) {
			add result (array 'digitalSet' pinNum)
		} else {
			add result (array 'digitalClear' pinNum)
		}
		return result
	} ('sendBroadcastSimple' == op) {
		return (primitive this 'sendBroadcast' args true)
	} ('comment' == op) {
		// skip comments; do not generate any code
		// xxx remove this case later to store comments (once the VM supports them)
	} ('ignoreArgs' == op) {
		for arg args {
			addAll result (instructionsForExpression this arg)
		}
		add result (array 'ignoreArgs' (count args))
		return result
	} (isOneOf op 'callCustomCommand' 'callCustomReporter') {
		for arg args {
			addAll result (instructionsForExpression this arg)
		}
		add result (array op (count args))
		if ('callCustomCommand' == op) {
			add result (array 'pop' 1) // discard the return value
		}
		return result */
	} else if (this.isFunctionCall(op)) {
		return (this.instructionsForFunctionCall(op, args, true))
	} else {
		return this.primitive(op, args, true)
	}
	return result
}

/*method instructionsForIf SmallCompiler args {
	result = (list)
	jumpsToFix = (list)
	i = 1
	while (i < (count args)) {
		finalCase = ((i + 2) >= (count args)) // true if this is the final case in the if statement
		test = (at args i)
		body = (instructionsForCmdList this (at args (i + 1)))
		if (or (true != test) (not finalCase) (i == 1)) {
			addAll result (instructionsForExpression this test)
			offset = (count body)
			if (not finalCase) { offset += 1 }
			add result (array 'jmpFalse' offset)
		}
		addAll result body
		if (not finalCase) {
			jumpToEnd = (array 'jmp' (count result)) // jump offset to be fixed later
			add jumpsToFix jumpToEnd
			add result jumpToEnd
		}
		i += 2
	}
	instructionCount = (count result)
	for jumpInstruction jumpsToFix {
		atPut jumpInstruction 2 (instructionCount - ((at jumpInstruction 2) + 1)) // fix jump offset
	}
	return result
}*/

MicroBlocksCompiler.prototype.instructionsForForever = function(args) {
	let result = this.instructionsForCmdList(args[0])
	result.push(['jmp', (0 - (result.length + 1))])
	return result
}

MicroBlocksCompiler.prototype.instructionsForRepeat = function(args) {
	let result = this.instructionsForExpression(args[0]) // loop count
	let body = this.instructionsForCmdList(args[1])
	result.push(['jmp', (body.length)])
	result = result.concat(body)
	result.push(['decrementAndJmp', (0 - (body.length + 1))])
	return result
}

/*method instructionsForRepeatUntil SmallCompiler args {
	result = (list)
	conditionTest = (instructionsForExpression this (at args 1))
	body = (instructionsForCmdList this (at args 2))
	add result (array 'jmp' (count body))
	addAll result body
	addAll result conditionTest
	add result (array 'jmpFalse' (0 - (+ (count body) (count conditionTest) 1)))
	return result
}*/

MicroBlocksCompiler.prototype.instructionsForWaitUntil = function(args) {
	let conditionTest = this.instructionsForExpression(args[0])
	let result = conditionTest
	result.push(['waitUntil', (0 - (conditionTest.length + 1))])
	return result
}

/*method instructionsForForLoop SmallCompiler args {
	result = (instructionsForExpression this (at args 2))
	loopVarIndex = (at localVars (first args))
	body = (instructionsForCmdList this (at args 3))
	addAll result (array
		(array 'pushImmediate' falseObj) // this will be N, the total loop count
		(array 'pushImmediate' falseObj) // this will be a decrementing loop counter
		(array 'jmp' (count body)))
	addAll result body
	addAll result (array
		(array 'forLoop' loopVarIndex)
		(array 'jmp' (0 - ((count body) + 2)))
		(array 'pop' 3))
	return result
}*/

// instruction generation: expressions

MicroBlocksCompiler.prototype.instructionsForExpression = function(expr) {
	// immediate values
	if (true == expr) {
		return [[ 'pushImmediate', this.trueObj ]]
	} else if (false == expr) {
		return [[ 'pushImmediate', this.falseObj ]]
	} else if (expr == null) {
		return [[ 'pushImmediate', this.zeroObj ]]
	} else if (typeof expr == 'number') { //TODO: Put in some handling for non-integers?
		if ((-4194304 <= expr) && (expr <= 4194303)) { // 23-bit encoded as 24 bit int object
			return [['pushImmediate', (((expr << 1) | 1) & ( parseInt('FFFFFF', 16) ))]] 
		} else {
			// pushBigImmediate instruction followed by a 4-byte integer object
			return [['pushBigImmediate', 0], expr]
		}
	} else if (typeof expr == 'string') {
		return [['pushLiteral', expr]]
	} /*else if (isClass expr 'Color') {
		return (instructionsForExpression this (pixelRGB expr))
	}*/

	// expressions
	let op = expr.primName()
	let args = expr.argList()

	/*if ('v' == op) { // variable
		return (list (getVar this (first args)))
	} else if ('booleanConstant' == op) {
		if (first args) {
			return (list (array 'pushImmediate' trueObj))
		} else {
			return (list (array 'pushImmediate' falseObj))
		}
	} else if ('colorSwatch' == op) {
		c = (color (at args 1) (at args 2) (at args 3))
		return (instructionsForExpression this (pixelRGB c))
	} else if ('and' == op) {
		return (instructionsForAnd this args)
	} else if ('or' == op) {
		return (instructionsForOr this args)
	} else*/ if (this.isFunctionCall(op)) {
		return this.instructionsForFunctionCall(op, args, false)
	} else {
		return this.primitive(op, args, false)
	}
}

/*method instructionsForAnd SmallCompiler args {
	tests = (list)
	totalInstrCount = 0
	for expr args {
		instrList = (instructionsForExpression this expr)
		add tests instrList
		totalInstrCount += ((count instrList) + 1)
	}
	totalInstrCount += -1 // no jump required after final arg

	result = (list)
	for i (count tests) {
		addAll result (at tests i)
		if (i < (count tests)) {
			add result (array 'jmpAnd' (totalInstrCount - ((count result) + 1)))
		}
	}
	return result
}

method instructionsForOr SmallCompiler args {
	tests = (list)
	totalInstrCount = 0
	for expr args {
		instrList = (instructionsForExpression this expr)
		add tests instrList
		totalInstrCount += ((count instrList) + 1)
	}
	totalInstrCount += -1 // no jump required after final arg

	result = (list)
	for i (count tests) {
		addAll result (at tests i)
		if (i < (count tests)) {
			add result (array 'jmpOr' (totalInstrCount - ((count result) + 1)))
		}
	}
	return result
}*/

// instruction generation utility methods

MicroBlocksCompiler.prototype.primitive = function(op, args, isCommand) {
	let result = []
	//if ('print' == op) { op = 'printIt' }
	if (this.opcodes[op] != null) {
		for (let i = 0; i < args.length; i++) {
			result = result.concat(this.instructionsForExpression(args[i]))
		}
		result.push([op, (args.length)])
	} else if ( op.startsWith('[') && op.endsWith(']') ) {
		// named primitives of the form '[primSetName:primName]'
		let i = op.indexOf(':')
		if (i != -1) {
			let primSetName = op.substring(1, i)
			let primName = op.substring( (i + 1), (op.length - 1) )
			result.push(['pushLiteral', primSetName])
			result.push(['pushLiteral', primName])
			for (let i = 0; i < args.length; i++) {
				result = result.concat(this.instructionsForExpression(args[i]))
			}
			if (isCommand) {
				result.push(['callCommandPrimitive', (args.length + 2)])
			} else {
				result.push(['callReporterPrimitive', (args.length + 2)])
			}
		}
	} else {
		console.log('Skipping unknown op: ' + op)
		if (!isCommand) {
			result.push(['pushImmediate', zeroObj]) // missing reporter; push dummy result
		}
	}

	return result
}

// Variables

/*method collectVars SmallCompiler cmdOrReporter {
	sharedVars = (allVariableNames (project (scripter (smallRuntime))))

	localVars = (dictionary)
	todo = (list cmdOrReporter)
	while ((count todo) > 0) {
		cmd = (removeFirst todo)
		if (isOneOf (primName cmd) 'local' 'for') {
			// explicit local variables and 'for' loop indexes are always local
			varName = (first (argList cmd))
			if (contains argNames varName) {
				print 'Warning: Local variable overrides parameter:' varName
			}
			if (not (contains localVars varName)) {
				atPut localVars varName (count localVars)
			}
		} (isOneOf (primName cmd) 'v' '=' '+=') {
			// undeclared variables that are not global (shared) are treated as local
			varName = (first (argList cmd))
			if (not (or
				(contains sharedVars varName)
				(contains argNames varName)
				(contains localVars varName))) {
					atPut localVars varName (count localVars)
			}
		}
		for arg (argList cmd) {
			if (isAnyClass arg 'Command' 'Reporter') {
				add todo arg
			}
		}
		if (notNil (nextBlock cmd)) { add todo (nextBlock cmd) }
	}
}

method getVar SmallCompiler varName {
	if (notNil (at localVars varName)) {
		return (array 'pushLocal' (at localVars varName))
	} (notNil (at argNames varName)) {
		return (array 'pushArg' (at argNames varName))
	}
	globalID = (globalVarIndex this varName)
	if (notNil globalID) { return (array 'pushVar' globalID) }
}

method setVar SmallCompiler varName {
	if (notNil (at localVars varName)) {
		return (array 'storeLocal' (at localVars varName))
	} (notNil (at argNames varName)) {
		return (array 'storeArg' (at argNames varName))
	}
	globalID = (globalVarIndex this varName)
	if (notNil globalID) { return (array 'storeVar' globalID) }
}

method incrementVar SmallCompiler varName {
	if (notNil (at localVars varName)) {
		return (array 'incrementLocal' (at localVars varName))
	} (notNil (at argNames varName)) {
		return (array 'incrementArg' (at argNames varName))
	}
	globalID = (globalVarIndex this varName)
	if (notNil globalID) { return (array 'incrementVar' globalID) }
}

method globalVarIndex SmallCompiler varName {
	varNames = (allVariableNames (project (scripter (smallRuntime))))
	id = (indexOf varNames varName)
	if (isNil id) {
		error 'Unknown variable' varName
	}
	if (id >= 100) { error 'Id' id 'for variable' varName 'is out of range' }
	return (id - 1) // VM uses zero-based index
}*/

// function calls

MicroBlocksCompiler.prototype.isFunctionCall = function(op) {
	let runtime = new MicroBlocksRuntime()
	return (runtime.lookupChunkID(op) != null) 
}

MicroBlocksCompiler.prototype.instructionsForFunctionCall =function(op, args, isCmd) {
	let result = []
	let runtime = new MicroBlocksRuntime()
	let callee = runtime.lookupChunkID(op)
	for (let i = 0; i < args.length; i++) {
		let arg = args[i]
		result.push.apply(result, this.instructionsForExpression(arg))
	}
	result.push(['callFunction', (((callee & 255) << 8) | ((args.length) & 255))])
	if (isCmd) { result.push(['pop', 1]) } // discard the return value
	return result
}

// literal values (strings and large integers )

MicroBlocksCompiler.prototype.appendLiterals = function(instructions) {
	// For now, strings and integers too large for pushImmediate are the only literals.
	// Perhaps add support for constant literal arrays later.

	let literals = []
	let literalOffsets = {}
	let nextOffset = instructions.length - 1
	for (let ip = 0; ip < instructions.length; ip++) {
		let instr = instructions[ip]
		if ( (instr instanceof Array) && ('pushLiteral' == (instr[0])) ) {
			let literal = instr[1]
			let litOffset = literalOffsets[literal]
			if (litOffset == null) {
				litOffset = nextOffset
				literals.push(literal)
				literalOffsets[literal] = litOffset
				nextOffset += this.wordsForLiteral(literal)
			}
			instr[1] = (litOffset - ip) 
			instr.push(literal) // retain literal string for use by "show instructions"
		}
	}
	instructions.push.apply(instructions, literals)
}

MicroBlocksCompiler.prototype.wordsForLiteral = function(literal) {
	let headerWords = 1
	if (typeof literal == 'string') {
		return ( headerWords + Math.floor( (literal.length + 4) / 4) )
	}
	console.error( 'Illegal literal type:' + literal )
}

// metadata for the deompiler

MicroBlocksCompiler.prototype.appendDecompilerMetadata = function(aBlockOrFunction, instructionList) {
	// Append a tab-delimited list of local variables to instructionList.
	// This string is part of the optional metadata used by the decompiler.

	// the 'metadata' pseudo instruction marks the start of the decompiler meta data
	instructionList.push(['metadata', 0])


	// add local variable names
	varNames = [] //No local variables for now
	/*for pair (sortedPairs localVars) {
		add varNames (copyReplacing (last pair)) '	' ' ' // replace tabs with spaces in var name
	}*/
	instructionList.push(varNames.join("\t")) // tab delimited string
/*
	// add function info
	if (isClass aBlockOrFunction 'Function') {
		add instructionList (metaInfoForFunction (project (scripter (smallRuntime))) aBlockOrFunction)
		argNames = (argNames aBlockOrFunction)
		if (notEmpty argNames) {
			add instructionList (joinStrings argNames (string 9)) // tab delimited string
		}
	}
*/
}

// binary code generation

MicroBlocksCompiler.prototype.addBytesForInstructionTo  = function(instr, bytes) {
	// Append the bytes for the given instruction to bytes (little endian).

	let allBytes = new Uint8Array(bytes.length + 4)
	allBytes.set(bytes, 0)

	let opcode = this.opcodes[instr[0]]
	if (opcode == null) { console.error( 'Unknown opcode: ' + instr[0]) }
	allBytes[bytes.length] = opcode
	let arg = instr[1]
	if (!((-16777216 <= arg) && (arg <= 16777215))) {
		console.error( 'Argument does not fit in 24 bits: ' + arg)
	}
	allBytes[bytes.length + 1] = (arg & 255)
	allBytes[bytes.length + 2] = ((arg >> 8) & 255)
	allBytes[bytes.length + 3] = ((arg >> 16) & 255)

	return allBytes
}

MicroBlocksCompiler.prototype.addBytesForIntegerLiteralTo = function(n, bytes) {
	// Append the bytes for the given integer to bytes (little endian).
	// Note: n is converted to a integer object, the equivalent of ((n << 1) | 1)

	let allBytes = new Uint8Array(bytes.length + 4)
	allBytes.set(bytes, 0)

	allBytes[bytes.length] = (((n << 1) | 1) & 255)
	allBytes[bytes.length + 1] =  ((n >> 7) & 255)
	allBytes[bytes.length + 2] =  ((n >> 15) & 255)
	allBytes[bytes.length + 3] =  ((n >> 23) & 255)

	return allBytes
}

MicroBlocksCompiler.prototype.addBytesForStringLiteral = function(s, bytes) {
	// Append the bytes for the given string to bytes.

	let byteCount = s.length
	let wordCount = Math.floor( (byteCount + 4) / 4 )
	let headerWord = ((wordCount << 4) | this.stringClassID);
	let padding = (4 - (byteCount % 4))

	let allBytes = new Uint8Array(bytes.length + 4 + byteCount + padding)
	allBytes.set(bytes, 0)

	for (var i = 0; i < 4; i++) { // add header bytes, little endian
		allBytes[bytes.length + i] = (headerWord & 255)
		headerWord = (headerWord >> 8)
	}
	for (var i = 0; i < byteCount; i++) {
		allBytes[bytes.length + 4 + i] = (s.charCodeAt(i) & 255) //charCodeAt returns 16 bit?
	}
	for (var i = 0; i < padding; i++) { // pad with zeros to next word boundary
		allBytes[bytes.length + 4 + byteCount + i] = 0
	}

	return allBytes
}







