/**
 * Handles displaying numbers entered using the NumPadWidget.  Properties of the number are divided into a number of
 * fields to make modification easier and, avoid rounding errors, and allow for trailing 0s.  They are recombined into
 * Data when getData() is called, and getString() gets the text to display while editing.
 * @param {Data|NumData} initialData - The Data to initially store. If anything other than NumData, the Data will be
 *                                     cleared when any modification occurs.
 * @constructor
 */
function DisplayNum(initialData) {
	// Whether the the Data is currently NumData. If not, it will be replaced on modification.
	this.isNum = initialData.type === Data.types.num;
	if (!this.isNum) {
		// If the Data is not NumData it is simply stored as is.
		this.data = initialData;
		return;
	}
	// NumData is broken across multiple fields.
	// A boolean tracks if the number is negative
	this.isNegative = (initialData.getValue() < 0);
	// A positive string representation of the number, without scientific notation
	const asStringData = initialData.asPositiveString();
	const parts = asStringData.getValue().split(".");
	// The integer part is everything before the decimal point, stored as a string
	this.integerPart = parts[0];
	if (this.integerPart === "") {
		this.integerPart = "0";
	}
	// The decimal part is everything after the decimal point, also as a string (which allows for trailing 0s
	// Storing data as a string prevents loss of precision while editing
	this.decimalPart = "";
	/* Stores whether there is a decimal point following the integerPart.  Always true if the length of the
	 * decimalPart is greater than 0. */
	this.hasDecimalPoint = (parts.length > 1);
	if (this.hasDecimalPoint) {
		this.decimalPart = parts[1];
	}
}

/**
 * Removes the last digit of NumData
 */
DisplayNum.prototype.backspace = function() {
	// Non-NumData is not modified
	if (!this.isNum) return;
	if (this.hasDecimalPoint && this.decimalPart !== "") {
		// If there is a decimal part, cut off the last digit
		const newL = this.decimalPart.length - 1;
		this.decimalPart = this.decimalPart.substring(0, newL);
	} else if (this.hasDecimalPoint) {
		// If there's a decimal point but no decimalPart, remove the point
		this.hasDecimalPoint = false;
	} else if (this.integerPart.length > 1) {
		// If there's an integer part that's longer than 1 digit, cut off the last digit
		const newL = this.integerPart.length - 1;
		this.integerPart = this.integerPart.substring(0, newL);
	} else if (this.integerPart !== "0") {
		// If there's just one digit and it isn't 0, make the number 0.
		this.integerPart = "0";
	} else if (this.isNegative) {
		// If only a "-0" is left, change it to just "0".
		this.isNegative = false;
	}
};

/**
 * Inverts the sign of the number
 */
DisplayNum.prototype.switchSign = function() {
	if (!this.isNum) return;
	this.isNegative = !this.isNegative;
};

/**
 * Adds a decimal point, if possible
 */
DisplayNum.prototype.addDecimalPoint = function() {
	if (!this.isNum) return;
	if (!this.hasDecimalPoint) {
		this.hasDecimalPoint = true;
		this.decimalPart = "";
	}
};

/**
 * Adds the provided digit to the end of number
 * @param {string} digit - ["0","1"..."9"], a length-1 string representing a digit
 */
DisplayNum.prototype.addDigit = function(digit) { //Digit is a string
	if (!this.isNum) return;
	if (this.hasDecimalPoint) {
		// Only up to 5 decimal places can be added to avoid floating-point weirdness
		if (this.decimalPart.length < 5) {
			this.decimalPart += digit;
		}
	} else if (this.integerPart !== "0") {
		// Only up to 10 digits can be added to the integerPart
		if (this.integerPart.length < 10) {
			this.integerPart += digit;
		}
	} else if (digit !== "0") {
		this.integerPart = digit;
	}
};

/**
 * Converts the DisplayNum into a string to display
 * @return {string|null} - The string or null if the default string for the Data should be used
 */
DisplayNum.prototype.getString = function() {
	if (!this.isNum) {
		return null;
	}
	let rVal = "";
	if (this.isNegative) {
		if (Language.isRTL) { rVal += Language.forceLTR; }
		rVal += "-";
	}
	rVal += this.integerPart;
	if (this.hasDecimalPoint) {
		rVal += ".";
		rVal += this.decimalPart;
	}
	return rVal;
};

/**
 * Converts the DisplayNum into Data to be saved into the Slot
 * @return {Data}
 */
DisplayNum.prototype.getData = function() {
	if (!this.isNum) {
		return this.data;
	}
	let rVal = parseInt(this.integerPart, 10);
	if (this.hasDecimalPoint && this.decimalPart.length > 0) {
		let decPart = parseInt(this.decimalPart, 10);
		decPart /= Math.pow(10, this.decimalPart.length);
		rVal += decPart;
	}
	if (this.isNegative) {
		rVal = 0 - rVal;
	}
	return new NumData(rVal);
};
