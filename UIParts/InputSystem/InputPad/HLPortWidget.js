/**
 * Hatchling specific widget to allow the user to select between different ports.
 * 
 */
InputWidget.HLPortWidget = function(portType) {

	this.index = 0 //This widget cannot currently be combined with other widgets
	this.width = 275
	this.height = this.width * 3/4 
	this.optionDisabled = [true, true, true, true, true, true]
	this.value = HL_Utils.noPort //Always start with no connection
	this.portType = portType
	this.type = "hatchling_" + portType

	this.accesoryIcons = {
		1: VectorPaths.bd90Deg,
		3: VectorPaths.bdRotateRight,
		8: VectorPaths.bdFairyLights,
		9: VectorPaths.bdLightBulb,
		10: VectorPaths.bdMultiLightBulb,
		14: VectorPaths.bdRuler
	}

}
InputWidget.HLPortWidget.prototype = Object.create(InputWidget.prototype)
InputWidget.HLPortWidget.prototype.constructor = InputWidget.HLPortWidget


InputWidget.HLPortWidget.prototype.show = function(x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data) {
  InputWidget.prototype.show.call(this, x, y, parentGroup, overlay, slotShape, updateFn, finishFn, data);

  this.value = data[this.index]
  this.group = GuiElements.create.group(x, y, parentGroup);
  this.bgRect = GuiElements.draw.rect(0, 0, this.width, this.height, "none");
  //Normally, invisible shapes don't respond to touch events.
  this.bgRect.setAttributeNS(null, "pointer-events", "all");

  this.group.appendChild(this.bgRect);
  //TouchReceiver.addListenersSlider(this.bgRect, this);

  let device = DeviceHatchling.getManager().getDevice(0);
  if (device != null) {
    let portType = this.type.split("_")[1]
    let ports = device.getPortsByType(portType)
    for (let i = 0; i < HL_Utils.portNames.length; i++) {
      this.optionDisabled[i] = (ports.indexOf(i) == -1)
    }
  }

  //Draw the egg
  const eggPath = VectorPaths.bdHatchling
  const eggH = this.height * 5/7
  const eggW = VectorIcon.computeWidth(eggPath, eggH)
  const eggX = (this.width - eggW)/2
  const eggY = (this.height - eggH)/2
  let egg = new VectorIcon(eggX, eggY, eggPath, Colors.ballyBrandBlue, eggH, this.group)


  //Draw a circle button for each port
  const font = Font.secondaryUiFont(18)
  const r = eggH/7 //this.height/9
  const startX = eggX + 1.25*r //(this.width - 8*r) / 2 
  let bnX = startX
  let bnY = eggY + 1.25*r //2*r
  const iconH = 20
  this.portBns = []
  for (let i = 0; i < HL_Utils.portNames.length; i++) {
  	const isDisabled = this.optionDisabled[i]
  	const bgColor = isDisabled ? Colors.ballyRedLight : Colors.ballyBrandBlueLight
  	const textColor = isDisabled ? Colors.ballyRedDark : Colors.ballyBrandBlueDark
  	const outlineColor = isDisabled ? null : textColor
  	
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
  	//const circle = GuiElements.draw.circle(cx, cy, r, bgColor, this.group)
  	//if (isDisabled) { GuiElements.update.stroke(circle, textColor, 1) }
  	const portBn = new Button(bnX, bnY, 2*r, 2*r, this.group, bgColor, r, r, outlineColor)
  	portBn.markAsOverlayPart(this.overlay)
  	if (!isDisabled) {
  	  portBn.setCallbackFunction(function() {
  	  	
  	  }.bind(this), false)
  	  portBn.setCallbackFunction(function() {
  	  	this.value = HL_Utils.portNames[i]
  		this.updateFn(this.value, 0)

  	  	for (let j = 0; j < this.portBns.length; j++) {
  	  		const bn = this.portBns[j]
  	  		if (bn.portName == this.value) {
  	  			bn.addTextOverIcon(VectorPaths.bdConnected, iconH, bn.portName, font, textColor)
  	  		} else {
  	  			bn.addText(bn.portName, font, textColor)
  	  		}
  	  	}
  	  }.bind(this), true)
  	  this.portBns.push(portBn)
    } else {
      portBn.disable(true)
    }

  	//Add the text
  	const portName = HL_Utils.portNames[i]
  	portBn.portName = portName 
  	console.log("about to set status icon for " + portName + " with this.value=" + this.value)
  	const statusIconPath = isDisabled ? VectorPaths.bdClose : //VectorPaths.bdHatchlingDisconnected : 
  		((this.value == portName) ? VectorPaths.bdConnected : null)
  	/*const portNameW = GuiElements.measure.stringWidth(portName, font)
  	const portNameX = (2*r - portNameW) / 2
  	const portNameY = 2*r * ((statusIconPath == null) ? 1 : 1/2) + font.charHeight/2
  	const nameTextE = GuiElements.draw.text(portNameX, portNameY, font, textColor)
  	this.group.appendChild(nameTextE)*/
  	if (statusIconPath == null) {
  		portBn.addText(portName, font, textColor)
  	} else {
  		portBn.addTextOverIcon(statusIconPath, iconH, portName, font, textColor)
  	}
  	/*if (statusIconPath != null) {
  		const iconW = VectorIcon.computeWidth(statusIconPath, iconH)
  		const iconX = (2*r - iconW) / 2
  		const iconY = r + (r - iconH)/2
  		const statusIcon = new VectorIcon(iconX, iconY, statusIconPath, textColor, iconH, this.group)
  	}*/

    if (i == 2) {
    	bnX = startX
    } else {
    	bnX = bnX + 2.5*r //bnX + 3*r
    }
  }  

}

InputWidget.HLPortWidget.prototype.updatePorts = function() {
	let device = DeviceHatchling.getManager().getDevice(0);
  	if (device != null) {

      let ports = device.getPortsByType(this.portType)
      for (let i = 0; i < HL_Utils.portNames.length; i++) {
        this.optionDisabled[i] = (ports.indexOf(i) == -1)
      }
    }


}

InputWidget.HLPortWidget.prototype.updateDim = function(x, y) {
	console.log("HLPortWidget update dim")
}
