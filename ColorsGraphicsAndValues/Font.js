/**
 * Contains data about a font.  Immutable and typically generated using the Font.uiFont(size) function.
 * Properties are accessed directly to be read, but should not be assigned.  charHeight is a computed property that
 * indicates how tall the text will be when it appears on the screen and is used for centring text vertically.
 * @param {string} fontFamily - The font to use.  So far, everything is Arial
 * @param {number} fontSize
 * @param {string} fontWeight - ["bold", "normal"]
 * @constructor
 */
function Font(fontFamily, fontSize, fontWeight) {
	this.fontFamily = fontFamily;
	this.fontSize = fontSize;
	this.charHeight = this.lookupCharH(fontSize);
	this.fontWeight = fontWeight;
}

/**
 * Computes the charHeight of the font, given its size.  May need to be adjusted if more fonts are being used
 * @param {number} fontSize
 * @return {number}
 */
Font.prototype.lookupCharH = function(fontSize){
  let scale = 0.6639;
  //if (this.fontFamily == 'AvenirHeavy') { scale = 0.63; }//0.59; } //number determined empirically, may need adjustment
	return scale * fontSize + 1.644;
};

/**
 * Returns a Font that is identical to this font but bold
 * @return {Font}
 */
Font.prototype.bold = function(){
	return new Font(this.fontFamily, this.fontSize, "bold");
};

/**
 * Returns a Font that is identical to this font but not bold
 * @return {Font}
 */
Font.prototype.unBold = function(){
	return new Font(this.fontFamily, this.fontSize, "normal");
};

/**
 * Returns the default font of a given size.
 * @param {number} fontSize
 * @return {Font}
 */
Font.uiFont = function(fontSize){
	//if (FinchBlox) { return new Font('AvenirHeavy', fontSize, "normal"); }
  //if (FinchBlox) { return new Font('FredericBlack', fontSize, "normal"); }
  //if (FinchBlox) { return new Font("NunitoSans-ExtraBold", fontSize, "normal"); }
  if (FinchBlox) { return new Font("Nunito-ExtraBold", fontSize, "normal"); }
	return new Font("Arial", fontSize, "normal");
};


/**
 *  Returns the secondary font of a given size.
 * @param  {number} fontSize
 * @return {Font}
 */
Font.secondaryUiFont = function(fontSize) {
  //if (FinchBlox) { return new Font('FredericRegular', fontSize, "normal"); }
  //if (FinchBlox) { return new Font("NunitoSans-Regular", fontSize, "normal"); }
  if (FinchBlox) { return new Font("Nunito-Regular", fontSize, "normal"); }
	return new Font("Arial", fontSize, "normal");
}
