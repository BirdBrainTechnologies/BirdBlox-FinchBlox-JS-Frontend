
function PrettyPrinter() {
  this.gen = null
  this.offset = null
  this.useSemicolons = false
}

// public methods

PrettyPrinter.prototype.useSemicolons = function() { this.useSemicolons = true }

PrettyPrinter.prototype.prettyPrint = function(block, generator) {
  this.gen = generator
  this.offset = 1 //((fieldNameCount (class 'Command')) + 1)
  if (this.gen == null) {
    this.gen = new PrettyPrinterGenerator([], 0, true, true)
    if (true == this.useSemicolons) { this.gen.useSemicolons() }
  }
  this.printCmd(block)
  return this.gen.result.join('')//(joinStringArray (toArray (getField gen 'result')))
}

/*
method prettyPrintFunction PrettyPrinter func generator {
  gen = generator
  offset = ((fieldNameCount (class 'Command')) + 1)
  if (isNil gen) {
    gen = (new 'PrettyPrinterGenerator' (list) 0 true true)
    if (true == useSemicolons) { useSemicolons gen }
  }
  printFunction this func
  return (joinStringArray (toArray (getField gen 'result')))
}

method prettyPrintMethod PrettyPrinter func generator {
  gen = generator
  offset = ((fieldNameCount (class 'Command')) + 1)
  if (isNil gen) {
    gen = (new 'PrettyPrinterGenerator' (list) 0 true true)
    if (true == useSemicolons) { useSemicolons gen }
  }
  printFunction this func (className (class (classIndex func)))
  return (joinStringArray (toArray (getField gen 'result')))
}
*/

PrettyPrinter.prototype.prettyPrintList = function(block, generator) {
  this.gen = generator
  this.offset = 1 //((fieldNameCount (class 'Command')) + 1)
  if (this.gen == null) {
    this.gen = new PrettyPrinterGenerator([], 0, true, true)
    if (true == this.useSemicolons) { this.gen.useSemicolons() }
  }

  let currentBlock = block
  let early = true
  while (currentBlock != null) {
    this.gen.tab()
    early = this.printCmd(currentBlock, early)
    early = (early == true)
    this.gen.crIfNeeded()
    currentBlock = currentBlock.nextBlock
  }
  result = this.gen.result
  if (((result.length) > 0) && (';' == result[result.length-1])) { result.pop() }
  return result.join('')//(joinStringArray (toArray result))
}

/*
method prettyPrintString PrettyPrinter aString {
  commands = (parse aString)
  output = (list)
  for i (count commands) {
    add output (prettyPrint this (at commands i))
    if (i < (count commands)) {
      if (true == useSemicolons) {
        add output ';'
      } else {
        add output (newline)
      }
    }
  }
  return (joinStringArray (toArray output))
}

method prettyPrintFile PrettyPrinter aFileName {
  return (prettyPrintString this (readFile aFileName))
}

method prettyPrintClass PrettyPrinter aClass withoutDefinition generator {
  offset = ((fieldNameCount (class 'Command')) + 1)
  gen = generator
  if (isNil gen) {
    gen = (new 'PrettyPrinterGenerator' (list) 0 true true)
    if (true == useSemicolons) { useSemicolons gen }
  }

  if (not (withoutDefinition === false)) {
    control gen 'defineClass'
    varName gen (className aClass)
    for f (fieldNames aClass) {
      varName gen f
    }
    crIfNeeded gen
    cr gen
  }

  mList = (sorted (methods aClass) (function a b {return ((functionName a) < (functionName b))}))
  for f mList {
    printFunction this f (className aClass)
    if (not (f === (last mList))) {
      cr gen
    }
  }
  return (joinStringArray (toArray (getField gen 'result')))
}

method prettyPrintFileToFile PrettyPrinter aFileName newFileName {
  writeFile newFileName (prettyPrintFile this aFileName)
}
*/

// private methods

PrettyPrinter.prototype.infixOp = function(token) {
  return (('=' == token) || ('+=' == token) ||
             ('+' == token) || ('-' == token) || ('*' == token) || ('/' == token) || ('%' == token) ||
             ('<' == token) || ('<=' == token) || ('==' == token) ||
             ('!=' == token) || ('>=' == token) || ('>' == token) || ('===' == token) ||
             ('&' == token) || ('|' == token) || ('^' == token) ||
             ('<<' == token) || ('>>' == token) || ('>>>' == token) ||
             ('->' == token))
}

PrettyPrinter.prototype.allAlphaNumeric = function(letters) {
  for (let i = 0; i < letters.length; i++) {
    let c = letters[i]
    if ( !(c.match(/^[a-zA-z0-9_]/i)) ) { return false } //(not (or (isLetter c) (isDigit c) ('_' == c))) { return false }
  }
  return true
}

/*
method quoteOp PrettyPrinter value {
  if (isClass value 'String') {
    if (or (infixOp this value) (not (isLetter value))
           (value == 'false') (value == 'true') (value == 'nil') (value == 'else')) {
      return (join '''' value '''')
    }

    token = (toList (letters value))
    removeLast token
    if (allAlphaNumeric this token) { return value }
    return (join '''' value '''')
  }
}
*/

PrettyPrinter.prototype.op = function(value) {
  if (typeof value == 'string') {
    if ((this.infixOp(value)) || (value.match(/^[a-zA-Z]/i))) { //if (or (infixOp this value) (isLetter value)) {
      token = value.split("")
      token.pop()  //TODO: should we be doing this??
      if (this.allAlphaNumeric(token)) { return value }
    }
  }
  return ("''" + value + "''")
}

PrettyPrinter.prototype.printValue = function(block) {
  if (block instanceof ReporterBlock) {
    let prim = block.primName()
    /*if (isOneOf prim 'v' 'my') {
      varRef = (getField block offset)
      if (or (varMustBeQuoted varRef) ('my' == prim)) {
        varRef = (join '(' prim ' ' (printString varRef) ')')
      }
      symbol gen varRef
    } else {*/
      this.gen.openParen()
      this.printCmd(block)
      this.gen.closeParen()
    //}
  } else if (block instanceof CommandBlock) {
    this.printCmdList(block)
  } else if (typeof block == 'string') {
    this.gen.const(block)//(printString block)
  } else if (typeof block == 'number') { //'Float'
    this.gen.const(block.toString())//(toString block 20) TODO: add precision?
  /*} (isClass block 'Color') {
    c = block
    this.gen.const(join '(colorSwatch ' (red c) ' ' (green c) ' ' (blue c) ' ' (alpha c) ')')*/
  } else {
    this.gen.const(block.toString())
  }
}

/*
method printFunction PrettyPrinter func aClass {
  if (isNil aClass) {
    if (notNil (functionName func)) {
      control gen 'to'
      functionName gen (quoteOp this (functionName func))
    } else {
      control gen 'function'
    }
    for i (count (argNames func)) {
      varName gen (at (argNames func) i)
    }
  } else {
    control gen 'method'
    functionName gen (quoteOp this (primName func))
    for i (count (argNames func)) {
      if (i == 1) {
        varName gen aClass
      } else {
        varName gen (at (argNames func) i)
      }
    }
  }
  printCmdList this (cmdList func)
}
*/

PrettyPrinter.prototype.printReporter = function(block) {
  let prim = block.primName()
  let args = block.argList()
  console.log("printReporter " + prim + " [" + args + "]")
  /*if (and (infixOp this prim) ((count block) == (offset + 1))) {
    printValue this (getField block offset)
    symbol gen prim
    printValue this (getField block (offset + 1))
  } (prim == 'v') {
    symbol gen 'v'
    varName gen (getField block offset)
  } else {*/
    this.printOp(prim)
    /*for (let i = 0; i < block.length; i++) {
      if (i >= this.offset) {
        this.printValue(getField block i)
      }
    }*/
    for (let i = 0; i < args.length; i++) {
      this.printValue(args[i])
    }
  //}
}

PrettyPrinter.prototype.printOp = function(block) {
  this.gen.functionName(this.op(block))
}

PrettyPrinter.prototype.printCmdList = function(block, inIf) {
  this.gen.openBrace()
  if (this.useSemicolons != true) {
    this.gen.cr()
    this.gen.addTab()
  }
  let currentBlock = block
  let early = true
  while (currentBlock != null) {
    this.gen.tab()
    early = this.printCmd(currentBlock, early)
    early = (early == true)
    this.gen.crIfNeeded()
    currentBlock = currentBlock.nextBlock
  }
  this.gen.decTab()
  this.gen.tab()
  this.gen.closeBrace()
  if (inIf != true) {
    this.gen.crIfNeeded()
  }
}

/*
method printCmdListInControl PrettyPrinter block {
  if (isClass block 'Reporter') {
    printValue this block
  } (isClass block 'Command') {
    printCmdList this block
    crIfNeeded gen
  } else { // empty body
    openBrace gen
    closeBrace gen
    crIfNeeded gen
  }
}

method isShort PrettyPrinter bodyBlock {
  // Return true if the body of an 'if' command is empty or a single command that should
  // be put on the same line as the test.
  return (or (isNil bodyBlock) (isNil (nextBlock bodyBlock)))
}

method printCmdListShort PrettyPrinter block {
  openBrace gen
  skipSpace gen
  if (notNil block) { printCmd this block }
  closeBrace gen
  crIfNeeded gen
}
*/

PrettyPrinter.prototype.printCmd = function(block, early) {
  //let prim = block.primName()
  /*if (prim == 'to') {
    op = (getField block offset)
    control gen prim
    functionName gen (quoteOp this op)
    for i (count block) {
      if (and (i >= (offset + 1)) (i < (count block))) {
        varName gen (getField block i)
      }
    }
    printCmdListInControl this (getField block (count block))
  } (prim == 'function') {
    control gen prim
    for i (count block) {
      if (and (i >= offset) (i < (count block))) {
        varName gen (getField block i)
      }
    }
    printCmdListInControl this (getField block (count block))
  } (prim == 'defineClass') {
    control gen prim
    varName gen (getField block offset)
    for i (count block) {
      if (and (i >= (offset + 1)) (i <= (count block))) {
        varName gen (getField block i)
      }
    }
    crIfNeeded gen
  } (prim == 'method') {
    control gen prim
    symbol gen (quoteOp this (getField block offset))
    varName gen (getField block (offset + 1))
    for i (count block) {
      if (and (i >= (offset + 2)) (i < (count block))) {
        varName gen (getField block i)
      }
    }
    printCmdListInControl this (getField block (count block))
  } (prim == 'for') {
    control gen prim
    varName gen (getField block offset)
    printValue this (getField block (offset + 1))
    printCmdListInControl this (getField block (offset + 2))
  } (prim == 'while') {
    control gen prim
    printValue this (getField block offset)
    printCmdListInControl this (getField block (offset + 1))
  } (prim == 'if') {
    if (and (early == true) (((count block) - offset) == 1)
         (isShort this (getField block (offset + 1)))) {
      control gen prim
      printValue this (getField block (offset + 0))
      printCmdListShort this (getField block (offset + 1))
      return true
    } else {
      control gen prim
      ind = 0
      while ((offset + ind) < (count block)) {
        cond = (getField block (offset + ind))
        body = (getField block ((offset + ind) + 1))
        printed = false
        if ((offset + ind) == ((count block) - 1)) {
          if (cond == true) {
            symbol gen 'else'
            printed = true
          }
        }
        if (not printed) {
          printValue this cond
        }
        printCmdList this body true
        ind += 2
      }
    }
  } (prim == '=') {
    varName gen (getField block offset)
    symbol gen prim
    printValue this (getField block (offset + 1))
  } (prim == '+=') {
    varName gen (getField block offset)
    symbol gen prim
    printValue this (getField block (offset + 1))
  } else {*/
    this.printReporter(block)
  //}
}

function PrettyPrinterGenerator (result, tabLevel, hadCr, hadSpace, useSemicolons) {
  this.result = result
  this.tabLevel = tabLevel
  this.hadCr = hadCr 
  this.hadSpace = hadSpace 
  this.useSemicolons = useSemicolons || false
}

PrettyPrinterGenerator.prototype.useSemicolons = function() { 
  this.useSemicolons = true 
}

PrettyPrinterGenerator.prototype.closeBrace = function() {
  if (';' == this.result[this.result.length - 1]) { result.pop() }
  this.nextPutAll('}')
}

PrettyPrinterGenerator.prototype.addTab = function() {
  this.tabLevel = (this.tabLevel + 1)
}

PrettyPrinterGenerator.prototype.closeParen = function() {
  this.nextPutAll(')')
}

PrettyPrinterGenerator.prototype.const = function(value) {
  this.nextPutAllWithSpace(value)
}

/*
method control PrettyPrinterGenerator value {
  nextPutAll this value
}
*/

PrettyPrinterGenerator.prototype.crIfNeeded = function() {
  if (!this.hadCr) {
    this.cr()
  }
}

PrettyPrinterGenerator.prototype.cr = function() {
  if (true == this.useSemicolons) {
    this.nextPutAll(';')
  } else {
    this.nextPutAll('\n')
  }
  this.hadCr = true
}

/*
method skipSpace PrettyPrinterGenerator {
  hadSpace = true
}
*/

PrettyPrinterGenerator.prototype.decTab = function() {
  this.tabLevel = (this.tabLevel - 1)
}

PrettyPrinterGenerator.prototype.functionName = function(value) {
  if (!(typeof value == 'string')) {
    console.error( 'non string' )
  }
  this.nextPutAllWithSpace(value)
}

/*
method varName PrettyPrinterGenerator value {
  if (varMustBeQuoted value) {
    value = (printString value) // enclose in quotes
  }
  nextPutAllWithSpace this value
}
*/

PrettyPrinterGenerator.prototype.nextPutAll = function(value) {
  this.result.push(value)
  if (value.length > 0) {
    let last = value.slice(-1)
    this.hadSpace = [' ', '(', '{', '\n'].includes(last) //(isOneOf last ' ' '(' '{' (newline))
    this.hadCr = [';', '{', '\n'].includes(last)//(isOneOf last ';' '{' (newline))
  }
}

PrettyPrinterGenerator.prototype.nextPutAllWithSpace = function(value) {
  if (!this.hadSpace) {
    this.nextPutAll(' ')
  }
  this.nextPutAll(value)
}

PrettyPrinterGenerator.prototype.openBrace = function() {
  this.nextPutAllWithSpace('{')
}

PrettyPrinterGenerator.prototype.openParen = function() {
  this.nextPutAllWithSpace('(')
}

/*
method symbol PrettyPrinterGenerator value {
  nextPutAllWithSpace this value
}
*/

PrettyPrinterGenerator.prototype.tab = function() {
  let useSemicolons = (this.useSemicolons == true)
  if (!useSemicolons) {
    for (let i = 0; i < this.tabLevel; i++) {
      for (let j = 0; j < 2; j++) {
        this.nextPutAll(' ')
      }
    }
  }
}
