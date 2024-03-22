/**
 * Hatchling specific widget to allow the user to select between different ports.
 * 
 * @param {number} portType - The type of accessory this widget will look for
 * @param {BlockButton} parent - The block button parent of this popup
 */
InputWidget.HLPortWidget = function(portType, parent) {

	this.index = 0 //This widget cannot currently be combined with other widgets
	this.standardWidth = 275
  this.plugAreaWidth = this.standardWidth * 1/2
  this.width = this.standardWidth
	this.height = this.standardWidth * 3/4 
	this.optionDisabled = [true, true, true, true, true, true]
	this.value = HL_Utils.noPort //Always start with no connection
	this.portType = portType
	this.type = "hatchling_" + portType
  this.buttons = []
  this.iconH = 20
  this.font = Font.secondaryUiFont(18)
  this.showPlug = false
  this.parent = parent


}
InputWidget.HLPortWidget.prototype = Object.create(InputWidget.prototype)
InputWidget.HLPortWidget.prototype.constructor = InputWidget.HLPortWidget

InputWidget.HLPortWidget.prototype.addPlugArea = function() {
  this.width = this.standardWidth + this.plugAreaWidth
  this.showPlug = true
}
InputWidget.HLPortWidget.prototype.removePlugArea = function() {
  this.width = this.standardWidth
  this.showPlug = false
}


InputWidget.HLPortWidget.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
  InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);

  this.value = data[this.index]
  this.buttons = []
  //const noPort = this.value == HL_Utils.noPort

  this.group = GuiElements.create.group(x, y, parentGroup);
  this.bgRect = GuiElements.draw.rect(0, 0, this.width, this.height, "none");
  //Normally, invisible shapes don't respond to touch events.
  this.bgRect.setAttributeNS(null, "pointer-events", "all");

  this.group.appendChild(this.bgRect);

  //Draw the plug icon if needed
  if (this.showPlug) {
    const plugPath = VectorPaths.bdPlug
    const plugH = this.height * 3/5
    const plugX = 20
    const plugY = this.height - plugH
    this.plug = new VectorIcon(plugX, plugY, plugPath, Colors.ballyBrandBlueDark, plugH, this.group)
  } else {
    this.plug = null
  }

  //Draw the egg
  const eggPath = VectorPaths.bdHatchling
  const eggColor = this.showPlug ? Colors.ballyRed : Colors.ballyBrandBlue
  const eggH = this.height * 5/7
  const eggW = VectorIcon.computeWidth(eggPath, eggH)
  const eggX = this.showPlug ? (this.plugAreaWidth + (this.standardWidth - eggW)/2) : (this.width - eggW)/2
  const eggY = (this.height - eggH)/2
  let egg = new VectorIcon(eggX, eggY, eggPath, eggColor, eggH, this.group)


  //Draw a circle button for each port
  const r = eggH/7 //this.height/9
  const startX = eggX + 1.25*r //(this.width - 8*r) / 2 
  let bnX = startX
  let bnY = eggY + 1.25*r //2*r
  for (let i = 0; i < HL_Utils.portNames.length; i++) {
  	
  	switch (i) {
      case 0:
      case 2:
        bnY = eggY + 1.25*r //2*r
        break;
      case 1:
        bnY = eggY + 0.75*r //1*r
        break;
      case 3:
      case 5:
        bnY = eggY + 3.75*r //5*r
        break;
      case 4:
        bnY = eggY + 4.25*r //6*r
        break;
    }

    const portBn = new Button(bnX, bnY, 2*r, 2*r, this.group, Colors.ballyGray, r, r)
  	portBn.markAsOverlayPart(this.overlay)

    this.buttons.push(portBn)

    if (i == 2) {
    	bnX = startX
    } else {
    	bnX = bnX + 2.5*r //bnX + 3*r
    }
  }  

  this.updatePorts()

}

InputWidget.HLPortWidget.prototype.updatePorts = function() {
  console.log("**** update ports this.value=" + this.value)
  let portStates = [0, 0, 0, 0, 0, 0]

	let device = DeviceHatchling.getManager().getDevice(0);
  if (device != null) {

      let ports = device.getPortsByType(this.portType)
      for (let i = 0; i < HL_Utils.portNames.length; i++) {
        this.optionDisabled[i] = (ports.indexOf(i) == -1)
    }

    portStates = device.portStates
    device.registerUpdateListener(this)
  }

  for (let i = 0; i < portStates.length; i++) {
    let portName = HL_Utils.portNames[i]
    let state = portStates[i]
    if (state == this.portType) {
      let textColor = Colors.ballyGreenDark
      this.buttons[i].updateBgColor(Colors.ballyGreenLight, textColor)
      if (this.value == portName) {
        this.buttons[i].addTextOverIcon(VectorPaths.bdConnected, this.iconH, portName, this.font, textColor)
      } else {
        this.buttons[i].addText(portName, this.font, textColor)
      }
      this.buttons[i].enable()
      this.buttons[i].setCallbackFunction(function() {
        this.value = HL_Utils.portNames[i]
        this.updateFn(this.value, 0)

        for (let j = 0; j < this.buttons.length; j++) {
          let pName = HL_Utils.portNames[j]
          const bn = this.buttons[j]
          if (pName == this.value) {
            bn.addTextOverIcon(VectorPaths.bdConnected, this.iconH, pName, this.font, textColor)
          } else if (portStates[j] == this.portType) {
            bn.addText(pName, this.font, textColor)
          }
        }
      }.bind(this), true)

    } else {
      this.buttons[i].updateBgColor(Colors.ballyRedLight, Colors.ballyRedLight)
      this.buttons[i].addTextOverIcon(VectorPaths.bdClose, this.iconH, portName, this.font, Colors.ballyRedDark)
      this.buttons[i].disable(true)
    }
    
  }

  //If we are showing this popup as though there is no accessory plugged in
  // and the appropriate accessory was just added, we can close the popup
  if (this.plug != null && this.value != HL_Utils.noPort) {
    console.log("**** about to close popup " + this.value)
    setTimeout( function() { 
      this.parent.closeInputSystem() 
    }.bind(this), 1000 )
  }

}

InputWidget.HLPortWidget.prototype.updateDim = function(x, y) {
	console.log("HLPortWidget update dim")
}
